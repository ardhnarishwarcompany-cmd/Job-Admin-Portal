import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components_lite/Navbar";
import { API_URL } from "@/utils/data";
import { Loader2, CheckCircle2, Video, ShieldCheck, FileVideo, UserCheck, XCircle } from "lucide-react";
import { toast } from "sonner";

const mediaUrl = (v) => /^https?:\/\//i.test(v || "") ? v : `${API_URL}${String(v || "").startsWith("/") ? v : `/${v || ""}`}`;

export default function NovaAiInterviewReview() {
  const { id } = useParams();
  const nav = useNavigate();
  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/api/nova-interview/${id}`, { withCredentials: true })
      .then(r => setS(r.data.data))
      .catch(e => toast.error(e?.response?.data?.message || "Could not load interview."))
      .finally(() => setLoading(false));
  }, [id]);

  const review = async (decision) => {
    setSaving(true);
    try {
      const r = await axios.post(`${API_URL}/api/nova-interview/${id}/review`, { decision, score: s?.avgScore }, { withCredentials: true });
      setS(r.data.data);
      toast.success("Review saved.");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Could not save review.");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>;
  if (!s) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Interview not found.</div>;

  const pass = Number(s.avgScore || 0) >= 60;
  const videos = Array.isArray(s.answerVideos) ? s.answerVideos : [];
  const evaluations = Array.isArray(s.answerEvaluations) ? s.answerEvaluations : [];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={s.companyLogo ? mediaUrl(s.companyLogo) : "/logo.jpeg"} alt="Company" className="h-12 w-12 rounded-xl object-cover bg-white" onError={e => { e.currentTarget.src = "/logo.jpeg"; }} />
            <div><h1 className="text-2xl font-black">NOVA AI Interview Review</h1><p className="mt-1 text-sm text-slate-400">{s.candidateName} • {s.jobTitle || "General role"}</p></div>
          </div>
          <button onClick={() => nav("/recruiter/interviews")} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold">Back</button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[["Overall", s.avgScore], ["Skills", s.evaluationSummary?.skills], ["Communication", s.evaluationSummary?.communication], ["Technical", s.evaluationSummary?.technical], ["Questions", evaluations.length]].map(([k,v]) =>
            <div key={k} className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{k}</p><p className="mt-1 text-2xl font-black">{v ?? "—"}{k !== "Questions" && <span className="text-sm text-slate-500">/100</span>}</p></div>
          )}
        </div>

        <div className={`mt-5 rounded-2xl border p-5 ${pass ? "border-emerald-400/20 bg-emerald-400/10" : "border-rose-400/20 bg-rose-400/10"}`}>
          {pass ? <CheckCircle2 className="mr-2 inline h-5 w-5 text-emerald-300" /> : <XCircle className="mr-2 inline h-5 w-5 text-rose-300" />}
          <b>Final AI Result: {pass ? "PASS" : "FAIL"}</b>
          <span className="ml-2 text-sm text-slate-300">Threshold: 60/100</span>
          <p className="mt-2 text-sm text-slate-300">AI recommendation: <b>{s.aiRecommendation || "—"}</b></p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button disabled={saving} onClick={() => review("HIRE")} className="rounded-xl bg-emerald-500 px-4 py-2 font-black text-slate-950">Hire</button>
            <button disabled={saving} onClick={() => review("HOLD")} className="rounded-xl bg-amber-400 px-4 py-2 font-black text-slate-950">Hold</button>
            <button disabled={saving} onClick={() => review("REJECT")} className="rounded-xl bg-rose-500 px-4 py-2 font-black">Reject</button>
          </div>
          <p className="mt-2 text-xs text-slate-500">Human review is separate from the automatic PASS/FAIL score.</p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="font-black"><UserCheck className="mr-2 inline h-4 w-4 text-cyan-300" />Approval status</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs font-bold">
              <div className="rounded-xl bg-black/20 p-3">HR: <span className="text-emerald-300">{s.hrApprovalStatus}</span></div>
              <div className="rounded-xl bg-black/20 p-3">Admin: <span className="text-emerald-300">{s.adminApprovalStatus}</span></div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="font-black"><ShieldCheck className="mr-2 inline h-4 w-4 text-cyan-300" />Proctoring</h2>
            <p className="mt-2 text-sm text-slate-300">{s.proctoring?.violationCount || 0} violation(s)</p>
          </div>
        </div>

        <section className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="font-black">All 8 answers + scoring</h2>
          <div className="mt-4 space-y-4">
            {evaluations.map((a, i) => {
              const video = videos.find(v => Number(v.questionIndex) === Number(a.questionIndex));
              return (
                <article key={`${a.questionIndex}-${i}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <b>Q{Number(a.questionIndex) + 1}. {a.question}</b>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${Number(a.score || 0) >= 60 ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>{a.score ?? 0}/100</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">{a.answer || "No answer provided."}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400 sm:grid-cols-4">
                    <span>Skills: {a.skills ?? "—"}</span><span>Communication: {a.communication ?? "—"}</span><span>Technical: {a.technical ?? "—"}</span><span>Depth: {a.depth ?? "—"}</span>
                  </div>
                  {a.note && <p className="mt-2 text-xs text-slate-500">{a.note}</p>}
                  {video?.url && <div className="mt-4"><p className="mb-2 text-xs font-bold text-cyan-300"><FileVideo className="mr-1 inline h-3 w-3" />Answer recording</p><video controls src={mediaUrl(video.url)} className="w-full max-w-xl rounded-xl" /></div>}
                </article>
              );
            })}
          </div>
        </section>

        {s.videoRecordingUrl && (
          <section className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="font-black mb-3"><Video className="mr-2 inline h-4 w-4" />Full session recording</h2>
            <video controls className="w-full rounded-xl" src={mediaUrl(s.videoRecordingUrl)} />
          </section>
        )}

        <section className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="font-black">Complete transcript</h2>
          <div className="mt-3 max-h-[520px] overflow-auto space-y-2">
            {(s.transcript || []).map((m,i) => <div key={i} className="rounded-xl bg-black/20 p-3 text-sm"><b className="text-cyan-300">{m.role === "robot" ? "NOVA" : "Candidate"}:</b> {m.content}</div>)}
          </div>
        </section>
      </main>
    </div>
  );
}
