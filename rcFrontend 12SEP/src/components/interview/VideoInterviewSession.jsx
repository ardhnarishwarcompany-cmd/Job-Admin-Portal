import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import Navbar from "../components_lite/Navbar";
import {
  Video, VideoOff, Mic, Circle, Square, ArrowRight, Loader2, AlertTriangle,
  CheckCircle2, Clock, RefreshCw, ShieldCheck, Camera,
} from "lucide-react";
import { INTERVIEW_API_ENDPOINT } from "@/utils/data";

// Phases: loading -> permission -> prep -> recording -> uploading -> failed -> done
const VideoInterviewSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [phase, setPhase] = useState("loading");
  const [qIndex, setQIndex] = useState(0);
  const [prepLeft, setPrepLeft] = useState(0);
  const [recordLeft, setRecordLeft] = useState(0);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [camError, setCamError] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const questions = interview?.questions || [];
  const question = questions[qIndex];
  const isLastQuestion = qIndex === questions.length - 1;

  useEffect(() => {
    axios
      .get(`${INTERVIEW_API_ENDPOINT}/${id}`, { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          setInterview(res.data.interview);
          if (res.data.interview.status === "completed") {
            navigate(`/candidate/interviews/${id}/result`);
            return;
          }
          setPhase("permission");
        } else {
          setLoadError(res.data.message || "Interview not found");
        }
      })
      .catch((err) => setLoadError(err?.response?.data?.message || "Could not load this interview"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const enableCamera = async () => {
    setCamError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play().catch(() => {});
      }
      try {
        await axios.post(`${INTERVIEW_API_ENDPOINT}/${id}/start`, {}, { withCredentials: true });
      } catch {}
      startPrep();
    } catch (err) {
      setCamError("Camera and microphone access is required for this interview. Please allow access and try again.");
    }
  };

  const startPrep = () => {
    setPhase("prep");
    const time = interview?.prep_time_sec || 15;
    setPrepLeft(time);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setPrepLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          startRecording();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    let recorder;
    try {
      recorder = new MediaRecorder(streamRef.current, { mimeType: "video/webm" });
    } catch {
      recorder = new MediaRecorder(streamRef.current);
    }
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => handleRecordingStopped();
    recorder.start();
    recorderRef.current = recorder;
    setPhase("recording");

    const time = question?.timeLimitSec || interview?.time_limit_sec || 90;
    setRecordLeft(time);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRecordLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          stopRecording();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  };

  const handleRecordingStopped = async () => {
    setPhase("uploading");
    const blob = new Blob(chunksRef.current, { type: "video/webm" });

    if (!blob || blob.size < 1000) {
      await reportFailedAttempt();
      return;
    }

    try {
      const formData = new FormData();
      formData.append("answer", blob, `q-${question.id}.webm`);
      formData.append("questionId", question.id);
      const res = await axios.post(`${INTERVIEW_API_ENDPOINT}/${id}/answer`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success && !res.data.answer.failedAttempt) {
        goToNextQuestion();
      } else if (res.data.canRetry) {
        setAttemptNumber((n) => n + 1);
        setPhase("failed");
      } else {
        // Failed but no retry allowed — move on, flagged for the recruiter.
        toast.error("That recording didn't save properly. Moving to the next question.");
        goToNextQuestion();
      }
    } catch (err) {
      await reportFailedAttempt();
    }
  };

  const reportFailedAttempt = async () => {
    try {
      const formData = new FormData();
      formData.append("questionId", question.id);
      formData.append("failed", "true");
      const res = await axios.post(`${INTERVIEW_API_ENDPOINT}/${id}/answer`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.canRetry) {
        setAttemptNumber((n) => n + 1);
        setPhase("failed");
      } else {
        toast.error("That recording failed. Moving to the next question.");
        goToNextQuestion();
      }
    } catch {
      toast.error("Could not save this answer. Moving to the next question.");
      goToNextQuestion();
    }
  };

  const retryQuestion = () => {
    setPhase("prep");
    startPrep();
  };

  const goToNextQuestion = () => {
    setAttemptNumber(1);
    if (isLastQuestion) {
      finishInterview();
    } else {
      setQIndex((i) => i + 1);
      startPrep();
    }
  };

  const finishInterview = async () => {
    setSubmitting(true);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    try {
      const res = await axios.post(`${INTERVIEW_API_ENDPOINT}/${id}/submit`, {}, { withCredentials: true });
      if (res.data.success) {
        toast.success("Interview submitted!");
        navigate(`/candidate/interviews/${id}/result`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not submit the interview.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-4">
        <AlertTriangle className="mb-3 h-10 w-10 text-amber-400" />
        <p className="text-lg font-bold text-white">{loadError}</p>
        <button onClick={() => navigate("/candidate/interviews")} className="mt-4 text-sm font-bold text-blue-400 hover:underline">
          Back to my interviews
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Progress */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-400">
            Question {qIndex + 1} of {questions.length}
          </p>
          <div className="flex gap-1.5">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  i < qIndex ? "bg-emerald-500" : i === qIndex ? "bg-blue-500" : "bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {phase === "permission" && (
            <motion.div key="permission" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
              <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-blue-400" />
              <h2 className="text-xl font-black text-white">Camera & microphone required</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                This is a video interview — {questions.length} question{questions.length !== 1 ? "s" : ""}, one at a time.
                You'll get {interview?.prep_time_sec || 15}s to prepare and up to {interview?.time_limit_sec || 90}s to answer each one.
                {interview?.allow_retry_on_failure ? " If a recording fails technically, you'll get one retry." : " Each answer is a single take — there are no retries."}
              </p>
              {camError && (
                <p className="mt-4 flex items-center justify-center gap-1.5 text-sm font-semibold text-rose-400">
                  <AlertTriangle className="h-4 w-4" /> {camError}
                </p>
              )}
              <button
                onClick={enableCamera}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-blue-500/30 transition-all"
              >
                <Camera className="h-4 w-4" /> Enable Camera & Start
              </button>
            </motion.div>
          )}

          {(phase === "prep" || phase === "recording" || phase === "uploading" || phase === "failed") && (
            <motion.div key="session" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-400">Question {qIndex + 1}</p>
                <p className="mt-1.5 text-lg font-bold text-white">{question?.text}</p>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-black aspect-video">
                <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />

                {phase === "prep" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                    <p className="text-sm font-bold text-slate-300">Get ready...</p>
                    <p className="mt-2 text-6xl font-black text-white">{prepLeft}</p>
                  </div>
                )}

                {phase === "recording" && (
                  <>
                    <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1.5 text-xs font-black text-white shadow-lg">
                      <Circle className="h-2.5 w-2.5 animate-pulse fill-white" /> REC
                    </div>
                    <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-bold text-white">
                      <Clock className="h-3.5 w-3.5" /> {recordLeft}s
                    </div>
                    <button
                      onClick={stopRecording}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-slate-900 shadow-lg hover:bg-slate-100 transition-colors"
                    >
                      <Square className="h-4 w-4 fill-slate-900" /> Stop & Submit Answer
                    </button>
                  </>
                )}

                {phase === "uploading" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                    <p className="mt-3 text-sm font-bold text-slate-300">Saving your answer...</p>
                  </div>
                )}

                {phase === "failed" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 px-6 text-center">
                    <AlertTriangle className="mb-3 h-10 w-10 text-amber-400" />
                    <p className="text-base font-bold text-white">That recording didn't save properly</p>
                    <p className="mt-1 text-sm text-slate-400">This looks like a technical issue, not your answer. You get one retry.</p>
                    <button
                      onClick={retryQuestion}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg"
                    >
                      <RefreshCw className="h-4 w-4" /> Retry This Question
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {submitting && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Finalizing and scoring your interview...
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoInterviewSession;
