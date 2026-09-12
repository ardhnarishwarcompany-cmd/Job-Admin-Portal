import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import Navbar from "../components_lite/Navbar";
import {
  Camera, Mic, MonitorUp, ShieldCheck, Sparkles, Loader2,
  Circle, Square, Clock, AlertTriangle, CheckCircle2, Send, Building2,
  Hourglass, XCircle, RefreshCw, Volume2, VolumeX, UserRound, Radio
} from "lucide-react";
import { API_URL } from "@/utils/data";

const API = `${API_URL}/api/nova-interview`;
const QUESTION_SECONDS = 10;
const SILENCE_AFTER_ANSWER_SECONDS = 2;

const resolveMediaUrl = (value) => {
  if (!value) return "/logo.jpeg";
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_URL}${value.startsWith("/") ? value : `/${value}`}`;
};

const repeatIntent = (text = "") => {
  const t = String(text).trim().toLowerCase().replace(/\s+/g, " ");
  return /^(again|repeat|repeat question|question again|say again)[.!?]*$/.test(t) ||
    /\b(please\s+)?repeat(\s+the)?\s+question\b/.test(t) ||
    /\b(can|could|would)\s+you\s+(please\s+)?(repeat|ask.*again|say.*again)\b/.test(t) ||
    /\b(i\s+didn'?t|i\s+did not)\s+(hear|understand|get)\b/.test(t);
};

export default function NovaAiInterview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [requesting, setRequesting] = useState(false);
  const [starting, setStarting] = useState(false);
  const [phase, setPhase] = useState(id ? "waiting" : "request");
  const [roleTitle, setRoleTitle] = useState("");
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [violationCount, setViolationCount] = useState(0);
  const [mediaReady, setMediaReady] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const screenRef = useRef(null);
  const answerRecorderRef = useRef(null);
  const answerChunks = useRef([]);
  const sessionRecorderRef = useRef(null);
  const sessionChunks = useRef([]);
  const timerRef = useRef(null);
  const silenceRef = useRef(null);
  const recognitionRef = useRef(null);
  const answerTextRef = useRef("");
  const submitIntentRef = useRef(null);
  const spokenQuestionRef = useRef("");
  const autoStartAttemptedRef = useRef(false);
  const approvalPollRef = useRef(null);

  const currentQuestion = session?.questionPlan?.[Number(session?.questionIndex || 0)];
  // The API can return transcript as an array, JSON string, object, or null depending
  // on the stored MySQL value. Always normalize it before rendering.
  const transcriptItems = (() => {
    const raw = session?.transcript;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
        if (parsed && Array.isArray(parsed.messages)) return parsed.messages;
        if (parsed && Array.isArray(parsed.items)) return parsed.items;
        return [];
      } catch {
        return [];
      }
    }
    if (raw && typeof raw === "object") {
      if (Array.isArray(raw.messages)) return raw.messages;
      if (Array.isArray(raw.items)) return raw.items;
      if (Array.isArray(raw.entries)) return raw.entries;
      return [];
    }
    return [];
  })();

  // Never call slice/map on the API value directly. This remains an array even
  // when an older backend returns transcript as a JSON object/string.
  const visibleTranscript = Array.isArray(transcriptItems)
    ? transcriptItems.slice(-6)
    : [];
  const isDone = session?.status === "completed" || session?.status === "rejected" || session?.phase === "closing";
  const waitingApproval = session?.status === "pending_approval";
  const approved = session?.status === "approved";
  const rejected = session?.status === "rejected";

  const clearAnswerTimers = useCallback(() => {
    clearInterval(timerRef.current);
    clearTimeout(silenceRef.current);
  }, []);

  const logViolation = useCallback(async (type, detail) => {
    if (!session?.id || isDone) return;
    try {
      const r = await axios.post(
        `${API}/${session.id}/violation`,
        { type, detail },
        { withCredentials: true }
      );
      if (r.data?.success) setViolationCount(r.data.violationCount || 0);
    } catch {}
  }, [session?.id, isDone]);

  const loadSession = useCallback(async () => {
    if (!id) return null;
    try {
      const r = await axios.get(`${API}/${id}`, { withCredentials: true });
      const data = r.data?.data;
      setSession(data);
      setViolationCount(data?.proctoring?.violationCount || 0);
      if (data?.status === "pending_approval") setPhase("waiting");
      if (data?.status === "approved") setPhase("approved");
      if (data?.status === "in_progress") setPhase(mediaReady ? "ready" : "approved");
      if (data?.status === "completed") setPhase("done");
      return data;
    } catch (e) {
      setError(e?.response?.data?.message || "Could not load interview request.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [id, mediaReady]);

  useEffect(() => {
    if (id) loadSession();
    else setLoading(false);
  }, [id, loadSession]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported(Boolean(SR));
  }, []);

  // Poll every 2 seconds until either HR or Admin approves.
  useEffect(() => {
    clearInterval(approvalPollRef.current);
    if (!id || !waitingApproval) return undefined;
    approvalPollRef.current = setInterval(async () => {
      const latest = await loadSession();
      if (latest?.status !== "pending_approval") {
        clearInterval(approvalPollRef.current);
      }
    }, 2000);
    return () => clearInterval(approvalPollRef.current);
  }, [id, waitingApproval, loadSession]);

  const speakText = useCallback((text, onDone) => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      setAiSpeaking(false);
      onDone?.();
    };

    try {
      window.speechSynthesis?.cancel();
      if (!text || !window.speechSynthesis || typeof window.SpeechSynthesisUtterance === "undefined") {
        finish();
        return;
      }
      setAiSpeaking(true);
      const u = new SpeechSynthesisUtterance(String(text));
      u.rate = 0.95;
      u.pitch = 1;
      u.volume = 1;
      u.onend = finish;
      u.onerror = finish;
      window.speechSynthesis.speak(u);
    } catch {
      finish();
    }
  }, []);

  // Keep the candidate camera attached to the actual <video> element. React can
  // remount this element when the question/session changes, so assigning srcObject
  // only once is not reliable. The retry loop also handles browsers that expose the
  // MediaStream before videoWidth/videoHeight are populated.
  const attachCandidateVideo = useCallback(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream) return false;
    const track = stream.getVideoTracks?.()[0];
    if (track && track.readyState !== "ended") track.enabled = true;
    if (video.srcObject !== stream) video.srcObject = stream;
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    const play = () => {
      if (video.srcObject === stream) video.play().catch(() => {});
    };
    play();
    return Boolean(video.videoWidth || video.readyState >= 2);
  }, []);

  useEffect(() => {
    if (!streamRef.current) return undefined;
    let cancelled = false;
    let attempts = 0;
    let raf = 0;
    const retry = () => {
      if (cancelled) return;
      const ready = attachCandidateVideo();
      attempts += 1;
      if (!ready && attempts < 60) raf = requestAnimationFrame(retry);
      else if (ready) setMediaReady(true);
    };
    retry();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [attachCandidateVideo, session?.id, session?.questionIndex, phase]);

  useEffect(() => {
    if (waitingApproval || !mediaReady || !currentQuestion?.prompt || isDone) return;
    const key = `${session?.id}:${session?.questionIndex}:${currentQuestion.prompt}`;
    if (spokenQuestionRef.current === key) return;
    spokenQuestionRef.current = key;
    speakText(currentQuestion.prompt);
  }, [waitingApproval, mediaReady, currentQuestion?.prompt, session?.id, session?.questionIndex, isDone, speakText]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) logViolation("tab_hidden", "Candidate switched away from the interview.");
    };
    const onFullscreen = () => {
      if (mediaReady && !document.fullscreenElement) logViolation("fullscreen_exit", "Fullscreen mode was exited.");
    };
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("fullscreenchange", onFullscreen);
    };
  }, [logViolation, mediaReady]);

  useEffect(() => () => {
    clearAnswerTimers();
    approvalPollRef.current && clearInterval(approvalPollRef.current);
    recognitionRef.current?.stop?.();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    screenRef.current?.getTracks().forEach((t) => t.stop());
    try { if (answerRecorderRef.current?.state !== "inactive") answerRecorderRef.current?.stop(); } catch {}
    try { if (sessionRecorderRef.current?.state !== "inactive") sessionRecorderRef.current?.stop(); } catch {}
  }, [clearAnswerTimers]);

  const enterFullscreen = async () => {
    try { await document.documentElement.requestFullscreen?.(); } catch {}
  };

  const startSessionRecorder = (stream) => {
    sessionChunks.current = [];
    try {
      const mime = MediaRecorder.isTypeSupported?.("video/webm;codecs=vp8,opus")
        ? "video/webm;codecs=vp8,opus"
        : (MediaRecorder.isTypeSupported?.("video/webm") ? "video/webm" : "");
      const r = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      r.ondataavailable = (e) => { if (e.data.size) sessionChunks.current.push(e.data); };
      sessionRecorderRef.current = r;
      r.start(1000);
    } catch (e) {
      console.warn("NOVA session recorder unavailable:", e);
    }
  };

  const finishSessionRecording = async () => {
    const r = sessionRecorderRef.current;
    if (!r || r.state === "inactive" || !session?.id) return;
    await new Promise((resolve) => {
      r.onstop = async () => {
        try {
          const blob = new Blob(sessionChunks.current, { type: "video/webm" });
          if (blob.size > 1000) {
            const form = new FormData();
            form.append("answer", blob, `nova-session-${session.id}.webm`);
            form.append("durationSeconds", "0");
            await axios.post(`${API}/${session.id}/final-video`, form, {
              withCredentials: true,
              headers: { "Content-Type": "multipart/form-data" },
            });
          }
        } catch {} finally { resolve(); }
      };
      try { r.stop(); } catch { resolve(); }
    });
  };

  const setupMediaAndBegin = useCallback(async () => {
    if (!id || starting || mediaReady || rejected) return;
    setStarting(true);
    setError("");
    streamRef.current?.getTracks().forEach((t) => t.stop());
    screenRef.current?.getTracks().forEach((t) => t.stop());
    try {
      if (!window.isSecureContext && !/^https?:\/\/localhost(?::|\/|$)/i.test(window.location.origin)) {
        throw new Error("Camera, microphone and screen sharing require HTTPS. localhost is allowed for testing.");
      }
      const cam = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = cam;
      const cameraTrack = cam.getVideoTracks?.()[0];
      if (!cameraTrack || cameraTrack.readyState === "ended") {
        throw new Error("Camera stream was not available. Please allow camera access and try again.");
      }
      cameraTrack.enabled = true;
      attachCandidateVideo();

      await enterFullscreen();

      try {
        const screen = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: { ideal: 15, max: 30 } },
          audio: false,
        });
        screenRef.current = screen;
        screen.getVideoTracks()[0]?.addEventListener("ended", () =>
          logViolation("screen_share_stopped", "Screen sharing was stopped during interview.")
        );
      } catch (e) {
        await logViolation("screen_share_denied", `${e?.name || "screen_share_error"}: Screen sharing was not granted.`);
        toast.warning("Screen sharing was not granted. The event will be visible to the hiring team.");
      }

      const r = await axios.post(`${API}/${id}/begin`, {}, { withCredentials: true });
      const next = r.data?.data;
      if (!next?.id) throw new Error("Interview could not be started.");

      setSession(next);
      setViolationCount(next.proctoring?.violationCount || 0);
      setMediaReady(true);
      setPhase("ready");
      autoStartAttemptedRef.current = true;
      startSessionRecorder(cam);

      // Ask the first question automatically. The active-speaker UI follows TTS.
      setTimeout(() => {
        const firstPrompt = next.questionPlan?.[0]?.prompt || "";
        spokenQuestionRef.current = `${next.id}:0:${firstPrompt}`;
        speakText(firstPrompt, () => startAnswerRecording(firstPrompt));
      }, 250);
      toast.success("Approval received. NOVA AI interview has started.");
    } catch (e) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      screenRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      screenRef.current = null;
      const message = e?.response?.data?.message || e?.message || "Camera and microphone permission is required.";
      setError(message);
      if (e?.response?.status === 409) {
        await loadSession();
      } else {
        toast.error(message);
      }
    } finally {
      setStarting(false);
    }
  }, [id, starting, mediaReady, rejected, logViolation, speakText, loadSession, attachCandidateVideo]);

  // As soon as the second approval arrives, attempt to start automatically.
  useEffect(() => {
    if (approved && id && !mediaReady && !starting && !autoStartAttemptedRef.current) {
      autoStartAttemptedRef.current = true;
      setupMediaAndBegin();
    }
  }, [approved, id, mediaReady, starting, setupMediaAndBegin]);

  const createRequest = async (e) => {
    e?.preventDefault?.();
    if (!roleTitle.trim()) {
      toast.error("Enter the job/role you want the NOVA AI interview for.");
      return;
    }
    setRequesting(true);
    try {
      const r = await axios.post(
        `${API}/start`,
        { jobTitle: roleTitle.trim() },
        { withCredentials: true }
      );
      const next = r.data?.data;
      if (!next?.id) throw new Error("Request was not created.");
      toast.success("Request sent to HR and Admin.");
      navigate(`/candidate/nova-ai-interview/${next.id}`, { replace: true });
    } catch (e) {
      toast.error(e?.response?.data?.message || "Could not send interview request.");
    } finally {
      setRequesting(false);
    }
  };

  const stopRecognition = () => {
    try { recognitionRef.current?.stop?.(); } catch {}
    recognitionRef.current = null;
  };

  const submitAnswer = useCallback(async (timedOut = false, textOverride = null) => {
    if (uploading || !session?.id) return;
    clearAnswerTimers();
    stopRecognition();
    setUploading(true);
    setPhase("processing");
    const text = String(textOverride ?? answerTextRef.current ?? "").trim();
    try {
      const blob = new Blob(answerChunks.current, { type: "video/webm" });
      const form = new FormData();
      if (blob.size > 1000) form.append("answer", blob, `nova-${session.id}-${Date.now()}.webm`);
      form.append("answerText", text);
      form.append("timedOut", String(timedOut));

      const r = await axios.post(`${API}/${session.id}/answer`, form, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      const next = r.data?.data;
      setSession(next);
      setViolationCount(next.proctoring?.violationCount || 0);
      setAnswer("");
      answerTextRef.current = "";

      if (r.data?.done || next.status === "completed") {
        await finishSessionRecording();
        setPhase("done");
        const closing = r.data?.response ||
          "Thank you. Your interview is complete. Please wait for the results while the hiring team reviews your responses.";
        toast.success("Interview completed. Please wait for the results.");
        speakText(closing, () => {
          setTimeout(() => {
            try { window.speechSynthesis?.cancel(); } catch {}
            streamRef.current?.getTracks().forEach((t) => t.stop());
            screenRef.current?.getTracks().forEach((t) => t.stop());
            navigate("/candidate/interviews");
          }, 1200);
        });
        return;
      }

      setPhase("ready");
      const spoken = r.data?.response || next.questionPlan?.[next.questionIndex]?.prompt || "";
      spokenQuestionRef.current = `${next.id}:${next.questionIndex}:${spoken}`;
      if (r.data?.action === "repeat_question" || r.data?.advance) {
        // The AI immediately speaks the repeated/next question, then the 10-second answer window begins.
        speakText(spoken, () => setTimeout(() => startAnswerRecording(spoken), 250));
      } else {
        speakText(spoken, () => setTimeout(() => startAnswerRecording(spoken), 250));
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Could not process your answer. Please try again.");
      setPhase("recording");
    } finally {
      setUploading(false);
    }
  }, [uploading, session?.id, clearAnswerTimers, finishSessionRecording, speakText, id, navigate]);

  const startAnswerRecording = useCallback((questionText = "") => {
    if (!streamRef.current || !session?.id || uploading || isDone) return;
    clearAnswerTimers();
    stopRecognition();
    answerChunks.current = [];
    answerTextRef.current = "";
    setAnswer("");
    setPhase("recording");
    setTimeLeft(QUESTION_SECONDS);

    let recorder;
    try {
      const mime = MediaRecorder.isTypeSupported?.("video/webm;codecs=vp8,opus")
        ? "video/webm;codecs=vp8,opus"
        : (MediaRecorder.isTypeSupported?.("video/webm") ? "video/webm" : "");
      recorder = mime ? new MediaRecorder(streamRef.current, { mimeType: mime }) : new MediaRecorder(streamRef.current);
    } catch {
      toast.error("Your browser cannot record this interview. Please use the latest Chrome or Edge.");
      return;
    }
    recorder.ondataavailable = (e) => { if (e.data.size) answerChunks.current.push(e.data); };
    recorder.onstop = () => {
      const intent = submitIntentRef.current || { timedOut: false, text: answerTextRef.current };
      submitIntentRef.current = null;
      submitAnswer(intent.timedOut, intent.text);
    };
    answerRecorderRef.current = recorder;
    recorder.start(200);

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-IN";
      recognition.onresult = (event) => {
        let finalText = answerTextRef.current;
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const piece = event.results[i][0]?.transcript || "";
          if (event.results[i].isFinal) finalText = `${finalText} ${piece}`.trim();
          else interim += ` ${piece}`;
        }
        const shown = `${finalText} ${interim}`.trim();
        if (finalText) {
          answerTextRef.current = finalText;
          setAnswer(shown);
        }
        if (repeatIntent(finalText || shown)) {
          submitIntentRef.current = { timedOut: false, text: finalText || shown };
          try { recognition.stop(); } catch {}
          try { recorder.stop(); } catch {}
          return;
        }
        if (finalText) {
          clearTimeout(silenceRef.current);
          silenceRef.current = setTimeout(() => {
            submitIntentRef.current = { timedOut: false, text: answerTextRef.current };
            try { recognition.stop(); } catch {}
            try { recorder.stop(); } catch {}
          }, SILENCE_AFTER_ANSWER_SECONDS * 1000);
        }
      };
      recognition.onerror = () => {};
      recognition.onend = () => {
        if (answerRecorderRef.current === recorder && recorder.state !== "inactive" && !uploading) {
          try { recognition.start(); } catch {}
        }
      };
      recognitionRef.current = recognition;
      try { recognition.start(); } catch {}
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((v) => {
        if (v <= 1) {
          clearAnswerTimers();
          submitIntentRef.current = { timedOut: true, text: answerTextRef.current };
          stopRecognition();
          try { recorder.stop(); } catch {}
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  }, [session?.id, uploading, isDone, clearAnswerTimers, submitAnswer]);

  // Initial begin may call this before the function is initialized in the closure;
  // use a stable second pass when media becomes ready.
  useEffect(() => {
    if (!mediaReady || phase !== "ready" || !session?.questionPlan?.[session.questionIndex]) return;
    if (answerRecorderRef.current?.state === "recording" || uploading) return;
    if (spokenQuestionRef.current === `${session.id}:started`) return;
    if (Number(session.questionIndex) === 0) {
      spokenQuestionRef.current = `${session.id}:started`;
    }
  }, [mediaReady, phase, session?.id, session?.questionIndex, uploading]);

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>;
  }

  if (error && !session) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6"><div className="max-w-xl text-center"><AlertTriangle className="mx-auto mb-4 h-10 w-10 text-amber-400" /><h1 className="text-2xl font-black">NOVA AI Interview unavailable</h1><p className="mt-2 text-slate-300">{error}</p><button onClick={() => navigate(-1)} className="mt-6 rounded-xl bg-white px-5 py-2 font-bold text-slate-900">Go Back</button></div></div>;
  }

  // First screen: candidate explicitly requests an interview.
  if (!id && !session) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-12">
          <div className="rounded-3xl border border-white/10 bg-white/[.05] p-7 shadow-2xl">
            <div className="flex items-center gap-4">
              <img src="/logo.jpeg" alt="Company" className="h-16 w-16 rounded-2xl object-cover ring-2 ring-cyan-400/30" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-cyan-300">NOVA AI Interview</p>
                <h1 className="mt-1 text-2xl font-black">Request your AI interview</h1>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-300">
              Submit a request first. The request goes to <b className="text-white">HR and Admin</b>. Approval from either one is enough to start the interview.
              After the second approval, NOVA starts automatically and asks exactly 8 questions.
            </p>
            <form onSubmit={createRequest} className="mt-6 space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-400">Job / Role</label>
              <input value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} placeholder="e.g. Frontend Developer" className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400" />
              <button disabled={requesting} className="w-full rounded-xl bg-cyan-500 px-5 py-3 font-black text-slate-950 disabled:opacity-60">
                {requesting ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : <><Send className="mr-2 inline h-4 w-4" /> Send Request to HR + Admin</>}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  const activeSpeaker = aiSpeaking ? "NOVA AI" : phase === "recording" ? "You" : "NOVA AI";
  const activeQuestionNumber = Math.min(Number(session?.questionIndex || 0) + 1, 8);
  const companyLogo = resolveMediaUrl(session?.companyLogo);

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
        <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative shrink-0">
              <img src={companyLogo} alt="Company logo" className="h-11 w-11 rounded-xl border border-white/15 bg-white object-cover shadow-lg" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/logo.jpeg"; }} />
              <span className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-emerald-400 ring-2 ring-[#050816]"><span className="h-1.5 w-1.5 rounded-full bg-white" /></span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300 sm:text-xs">Company AI Interview</p>
              <h1 className="truncate text-lg font-black sm:text-xl">{session?.jobTitle || "General Job Interview"}</h1>
              <p className="truncate text-xs text-slate-400">{session?.candidateName || "Candidate"}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold sm:text-xs">
            {waitingApproval && <span className="rounded-full bg-amber-500/15 px-3 py-1.5 text-amber-300"><Hourglass className="mr-1 inline h-3.5 w-3.5" /> Awaiting approval</span>}
            {approved && <span className="rounded-full bg-emerald-500/15 px-3 py-1.5 text-emerald-300"><CheckCircle2 className="mr-1 inline h-3.5 w-3.5" /> Approval received</span>}
            {isDone && !rejected && <span className="rounded-full bg-blue-500/15 px-3 py-1.5 text-blue-300">Interview complete</span>}
            {rejected && <span className="rounded-full bg-rose-500/15 px-3 py-1.5 text-rose-300"><XCircle className="mr-1 inline h-3.5 w-3.5" /> Request rejected</span>}
          </div>
        </div>

        {waitingApproval && (
          <section className="rounded-3xl border border-amber-300/10 bg-amber-500/[.06] p-6 text-center sm:p-10">
            <Hourglass className="mx-auto h-12 w-12 text-amber-300" />
            <h2 className="mt-4 text-2xl font-black">Interview request sent</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-300">The request has been sent to both HR and Admin. <b className="text-white">Only one approval is required.</b> As soon as either one approves, the interview can start.</p>
            <div className="mx-auto mt-6 grid max-w-2xl gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-black/20 p-4 text-left"><Building2 className="h-5 w-5 text-cyan-300" /><p className="mt-2 text-xs text-slate-400">HR / Recruiter</p><b>{session.hrApprovalStatus === "approved" ? "Approved" : "Waiting"}</b></div>
              <div className="rounded-2xl bg-black/20 p-4 text-left"><ShieldCheck className="h-5 w-5 text-cyan-300" /><p className="mt-2 text-xs text-slate-400">Admin</p><b>{session.adminApprovalStatus === "approved" ? "Approved" : "Waiting"}</b></div>
            </div>
            <p className="mt-6 text-xs text-slate-500">Approval status updates automatically. You do not need to refresh.</p>
            <RefreshCw className="mx-auto mt-3 h-4 w-4 animate-spin text-slate-500" />
          </section>
        )}

        {rejected && (
          <section className="rounded-3xl border border-rose-300/10 bg-rose-500/[.06] p-8 text-center">
            <XCircle className="mx-auto h-12 w-12 text-rose-300" />
            <h2 className="mt-4 text-2xl font-black">Interview request was rejected</h2>
            <p className="mt-2 text-sm text-slate-300">{session.approvalRejectionReason || "Please contact HR/Admin for details."}</p>
          </section>
        )}

        {approved && !mediaReady && (
          <section className="rounded-3xl border border-emerald-300/10 bg-emerald-500/[.06] p-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-300" />
            <h2 className="mt-4 text-2xl font-black">Approval received</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-300">NOVA is preparing your camera, microphone and proctoring. Allow the browser permissions to enter the interview.</p>
            {starting && <Loader2 className="mx-auto mt-5 h-6 w-6 animate-spin text-cyan-300" />}
            {error && <p className="mx-auto mt-4 max-w-xl rounded-xl bg-rose-500/10 p-3 text-xs text-rose-200">{error}</p>}
            {!starting && <button onClick={() => { autoStartAttemptedRef.current = false; setupMediaAndBegin(); }} className="mt-5 rounded-xl bg-cyan-500 px-5 py-3 font-black text-slate-950"><Camera className="mr-2 inline h-4 w-4" /> Start Interview / Allow Camera</button>}
          </section>
        )}

        {(mediaReady || session?.status === "in_progress" || session?.status === "completed") && (
          <div className="space-y-4 sm:space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[.035] px-3 py-2.5 sm:px-4">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-wide sm:text-xs">
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-emerald-300"><ShieldCheck className="mr-1 inline h-3.5 w-3.5" /> Proctored</span>
                <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-amber-300">Violations: {violationCount}</span>
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-slate-300">8 Questions</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-black text-slate-300">
                <span>Active speaker:</span>
                <span className={`rounded-full px-2.5 py-1 ${activeSpeaker === "NOVA AI" ? "bg-cyan-500/15 text-cyan-300" : "bg-emerald-500/15 text-emerald-300"}`}>
                  <Radio className="mr-1 inline h-3 w-3" />{activeSpeaker}
                </span>
              </div>
            </div>

            {/* Face-to-face interview stage: AI identity/logo + candidate live camera */}
            <div className="grid gap-4 lg:grid-cols-2">
              <section className={`relative overflow-hidden rounded-3xl border p-3 shadow-2xl transition-all duration-300 sm:p-4 ${aiSpeaking ? "border-cyan-400/70 ring-2 ring-cyan-400/20" : "border-white/10"}`}>
                <div className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#0d1830] to-cyan-950/50">
                  <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 50% 40%, rgba(34,211,238,.35), transparent 35%)" }} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
                    <div className={`relative grid h-28 w-28 place-items-center rounded-3xl bg-white p-1.5 shadow-2xl sm:h-36 sm:w-36 ${aiSpeaking ? "animate-pulse ring-4 ring-cyan-400/50" : "ring-2 ring-white/10"}`}>
                      <img src={companyLogo} alt="Company AI logo" className="h-full w-full rounded-[1.25rem] object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/logo.jpeg"; }} />
                      {aiSpeaking && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-cyan-400 px-3 py-1 text-[10px] font-black text-slate-950 shadow-lg">SPEAKING</span>}
                    </div>
                    <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-cyan-300">NOVA AI Interviewer</p>
                    <p className="mt-1 text-lg font-black sm:text-xl">{aiSpeaking ? "NOVA is speaking" : "NOVA AI"}</p>
                    <div className="mt-3 flex items-center gap-2 rounded-full bg-black/30 px-3 py-1.5 text-[11px] font-bold text-slate-300">
                      {aiSpeaking ? <Volume2 className="h-3.5 w-3.5 text-cyan-300" /> : <VolumeX className="h-3.5 w-3.5 text-slate-500" />}
                      {speechSupported ? "Voice conversation enabled" : "Voice output unavailable — question shown on screen"}
                    </div>
                  </div>
                  <div className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1.5 text-[11px] font-black text-white backdrop-blur">AI • {session?.jobTitle || "Interview"}</div>
                </div>
                <div className="mt-3 flex items-center justify-between px-1 text-xs font-bold">
                  <span className="text-slate-300">Company AI interviewer</span>
                  <span className={aiSpeaking ? "text-cyan-300" : "text-slate-500"}>{aiSpeaking ? "Speaking now" : "Listening"}</span>
                </div>
              </section>

              <section className={`relative overflow-hidden rounded-3xl border p-3 shadow-2xl transition-all duration-300 sm:p-4 ${phase === "recording" ? "border-emerald-400/70 ring-2 ring-emerald-400/20" : "border-white/10"}`}>
                <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    onLoadedMetadata={attachCandidateVideo}
                    onCanPlay={attachCandidateVideo}
                    onPlaying={() => setMediaReady(true)}
                    className="h-full w-full object-cover -scale-x-100 bg-black"
                  />
                  {!mediaReady && <div className="absolute inset-0 grid place-items-center bg-slate-900/90"><Loader2 className="h-8 w-8 animate-spin text-cyan-300" /></div>}
                  {phase === "recording" && <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1.5 text-[11px] font-black"><Circle className="h-3 w-3 animate-pulse fill-current" /> YOU ARE SPEAKING</div>}
                  {phase === "recording" && <div className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-black text-white backdrop-blur">{timeLeft}s</div>}
                  {isDone && <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"><div className="rounded-2xl bg-slate-950/90 px-5 py-4 text-center shadow-2xl"><CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" /><p className="mt-2 font-black">Thank you</p><p className="mt-1 text-xs text-slate-400">Please wait for the results…</p></div></div>}
                </div>
                <div className="mt-3 flex items-center justify-between px-1 text-xs font-bold">
                  <span className="text-slate-300">{session?.candidateName || "Candidate"}</span>
                  <span className={phase === "recording" ? "text-emerald-300" : "text-slate-500"}>{phase === "recording" ? "Live • Answering" : "Camera ready"}</span>
                </div>
              </section>
            </div>

            {/* Conversation panel */}
            <section className="rounded-3xl border border-white/10 bg-white/[.04] p-4 shadow-2xl sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">Question {activeQuestionNumber} / 8</p>
                  <p className="mt-1 text-sm font-bold text-slate-400">AI asks → candidate answers → next question starts automatically</p>
                </div>
                {phase === "recording" && <span className="self-start rounded-full bg-amber-500/15 px-3 py-1.5 text-xs font-black text-amber-300"><Clock className="mr-1 inline h-3.5 w-3.5" /> {timeLeft}s answer time</span>}
              </div>

              <div className={`mt-4 rounded-2xl border p-4 sm:p-5 ${aiSpeaking ? "border-cyan-400/40 bg-cyan-500/[.07]" : "border-white/5 bg-slate-950/70"}`}>
                <div className="flex items-start gap-3">
                  <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${aiSpeaking ? "bg-cyan-400 text-slate-950" : "bg-white/10 text-cyan-300"}`}>
                    {aiSpeaking ? <Volume2 className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-cyan-300">NOVA AI</p>
                    <p className="mt-1 text-base font-bold leading-7 sm:text-lg">{isDone ? "Thank you. Your interview is complete. Please wait for the results." : currentQuestion?.prompt || "Preparing your next question…"}</p>
                  </div>
                </div>
              </div>

              {!isDone && phase === "recording" && (
                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <textarea value={answer} onChange={(e) => { setAnswer(e.target.value); answerTextRef.current = e.target.value; }} placeholder={speechSupported ? "Speak naturally. Your voice is being recorded and transcribed automatically." : "Type your answer if voice transcription is unavailable."} className="min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-slate-950 p-3 text-sm text-white outline-none focus:border-cyan-400" />
                  <button onClick={() => { submitIntentRef.current = { timedOut: false, text: answerTextRef.current }; try { answerRecorderRef.current?.stop(); } catch {} }} className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-red-500 px-5 py-3 font-black text-white hover:bg-red-400 sm:self-end"><Square className="mr-2 h-4 w-4 fill-current" /> Finish Answer</button>
                </div>
              )}

              {!isDone && phase === "processing" && <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-cyan-500/10 p-4 text-sm font-bold text-cyan-200"><Loader2 className="h-5 w-5 animate-spin" /> NOVA is evaluating your answer and preparing the next question…</div>}
              {!isDone && phase === "ready" && <div className="mt-4 rounded-2xl bg-cyan-500/10 p-4 text-center text-sm font-bold text-cyan-200">Listen to NOVA. Your answer timer starts automatically after the question finishes.</div>}

              {isDone && <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-200"><CheckCircle2 className="h-5 w-5" /> Thank you. Please wait for the results. Leaving the interview…</div>}
            </section>

            {transcriptItems.length > 0 && !isDone && (
              <section className="rounded-2xl border border-white/10 bg-white/[.025] p-4">
                <p className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><UserRound className="h-3.5 w-3.5" /> Live conversation</p>
                <div className="max-h-40 space-y-2 overflow-auto">
                  {visibleTranscript.map((m, i) => (
                    <div key={i} className={`rounded-xl px-3 py-2 text-xs ${m.role === "robot" ? "bg-cyan-500/10 text-cyan-100" : "bg-white/5 text-slate-300"}`}>
                      <b>{m.role === "robot" ? "NOVA" : "You"}:</b> {m.content}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}