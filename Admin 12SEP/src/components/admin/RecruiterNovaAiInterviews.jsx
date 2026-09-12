import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components_lite/Navbar";
import { API_URL } from "../../utils/data";
import { Loader2, ShieldCheck, RefreshCw, AlertCircle, XCircle, Video, CheckCircle2, BriefcaseBusiness, PlayCircle } from "lucide-react";

const NOVA_API = `${API_URL}/api/nova-interview`;
const mediaUrl = (v) => /^https?:\/\//i.test(v || "") ? v : `${API_URL}${String(v || "").startsWith("/") ? v : `/${v || ""}`}`;

export default function RecruiterNovaAiInterviews() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const r = await axios.get(`${NOVA_API}/recruiter`, { withCredentials: true });
      setRows(r.data?.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Could not load NOVA AI interviews.");
      setRows([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approval = async (id, decision) => {
    setBusyId(`${id}:approval:${decision}`);
    try {
      const r = await axios.post(`${NOVA_API}/${id}/hr-approval`, { decision }, { withCredentials: true });
      setRows(prev => prev.map(x => x.id === id ? r.data.data : x));
      if (selected?.id === id) setSelected(r.data.data);
      setError("");
    } catch (e) { setError(e.response?.data?.message || "Could not save HR approval."); }
    finally { setBusyId(null); }
  };

  const review = async (id, decision) => {
    setBusyId(`${id}:review:${decision}`);
    try {
      const row = rows.find(x => x.id === id) || selected;
      const r = await axios.post(`${NOVA_API}/${id}/review`, { decision, score: row?.avgScore ?? null }, { withCredentials: true });
      setRows(prev => prev.map(x => x.id === id ? r.data.data : x));
      if (selected?.id === id) setSelected(r.data.data);
      setError("");
    } catch (e) { setError(e.response?.data?.message || "Could not save hiring decision."); }
    finally { setBusyId(null); }
  };

  const open = async (id) => {
    try {
      const r = await axios.get(`${NOVA_API}/${id}`, { withCredentials: true });
      setSelected(r.data.data);
    } catch (e) { setError(e.response?.data?.message || "Could not load interview details."); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">NOVA AI Interviews — HR / Recruiter</h1>
            <p className="mt-1 text-sm text-slate-500">Approve interview requests, review the complete recording/transcript, then Hire or Not Hire the candidate.</p>
          </div>
          <button onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</button>
        </div>

        {error && <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle className="mr-2 inline h-4 w-4" />{error}</div>}

        {loading ? <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-blue-600" /></div> : (
          <div className="mt-6 space-y-3">
            {rows.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">No NOVA AI interviews found for this HR account.</div> : rows.map(x => {
              const pending = x.status === "pending_approval";
              const pass = Number(x.avgScore || 0) >= 60;
              return (
                <div key={x.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <button onClick={() => open(x.id)} className="min-w-0 flex-1 text-left">
                      <b className="block truncate text-slate-900">{x.candidateName || "Candidate"}</b>
                      <p className="mt-1 text-xs text-slate-500">{x.jobTitle || "General role"} • {x.status} • Score {x.avgScore ?? "—"}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-black">
                        <span className={`rounded-full px-2 py-1 ${x.hrApprovalStatus === "approved" ? "bg-emerald-100 text-emerald-700" : x.hrApprovalStatus === "rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>HR: {x.hrApprovalStatus}</span>
                        <span className={`rounded-full px-2 py-1 ${x.adminApprovalStatus === "approved" ? "bg-emerald-100 text-emerald-700" : x.adminApprovalStatus === "rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>Admin: {x.adminApprovalStatus}</span>
                        {x.status === "completed" && <span className={`rounded-full px-2 py-1 ${pass ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{pass ? "PASS" : "FAIL"}</span>}
                        {x.reviewDecision && <span className={`rounded-full px-2 py-1 ${x.reviewDecision === "HIRE" ? "bg-emerald-100 text-emerald-700" : x.reviewDecision === "REJECT" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"}`}>Decision: {x.reviewDecision === "HIRE" ? "HIRED" : x.reviewDecision === "REJECT" ? "NOT HIRED" : x.reviewDecision}</span>}
                      </div>
                    </button>

                    <div className="flex flex-wrap gap-2">
                      {pending && x.hrApprovalStatus === "pending" && (<>
                        <button disabled={busyId !== null} onClick={() => approval(x.id, "approved")} className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-black text-white disabled:opacity-50">{busyId === `${x.id}:approval:approved` ? "Saving…" : "Approve"}</button>
                        <button disabled={busyId !== null} onClick={() => approval(x.id, "rejected")} className="rounded-lg bg-rose-500 px-3 py-2 text-xs font-black text-white disabled:opacity-50">{busyId === `${x.id}:approval:rejected` ? "Saving…" : "Reject"}</button>
                      </>)}
                      {x.status === "completed" && x.reviewDecision !== "HIRE" && <button disabled={busyId !== null} onClick={() => review(x.id, "HIRE")} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white disabled:opacity-50"><CheckCircle2 className="h-4 w-4" />{busyId === `${x.id}:review:HIRE` ? "Hiring…" : "Hire"}</button>}
                      {x.status === "completed" && x.reviewDecision !== "REJECT" && <button disabled={busyId !== null} onClick={() => review(x.id, "REJECT")} className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-xs font-black text-white disabled:opacity-50"><XCircle className="h-4 w-4" />{busyId === `${x.id}:review:REJECT` ? "Saving…" : "Not Hire"}</button>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelected(null)}>
        <div onClick={e => e.stopPropagation()} className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-slate-950 p-5 text-white shadow-2xl">
          <div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-black">{selected.candidateName}</h2><p className="text-xs text-slate-400">{selected.jobTitle || "General role"}</p></div><button onClick={() => setSelected(null)} className="rounded-lg bg-white/10 p-2"><XCircle className="h-5 w-5" /></button></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-4"><div className="rounded-xl bg-white/5 p-3">Score <b>{selected.avgScore ?? "—"}/100</b></div><div className={`rounded-xl p-3 ${Number(selected.avgScore || 0) >= 60 ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>{Number(selected.avgScore || 0) >= 60 ? "PASS" : "FAIL"}</div><div className="rounded-xl bg-white/5 p-3">HR <b>{selected.hrApprovalStatus}</b></div><div className="rounded-xl bg-white/5 p-3">Admin <b>{selected.adminApprovalStatus}</b></div></div>

          {selected.status === "pending_approval" && selected.hrApprovalStatus === "pending" && <section className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4"><h3 className="font-black">Interview approval</h3><div className="mt-3 flex gap-2"><button disabled={busyId !== null} onClick={() => approval(selected.id, "approved")} className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-black">Approve</button><button disabled={busyId !== null} onClick={() => approval(selected.id, "rejected")} className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-black">Reject</button></div></section>}

          {selected.status === "completed" && <section className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-black"><BriefcaseBusiness className="mr-2 inline h-4 w-4 text-cyan-300" />Final hiring decision</h3><p className="mt-1 text-xs text-slate-400">Hire sends the candidate an in-app congratulations notification and email. Not Hire sends a regret/result notification and email.</p></div><div className="flex gap-2"><button disabled={busyId !== null} onClick={() => review(selected.id, "HIRE")} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-black"><CheckCircle2 className="h-4 w-4" />Hire Candidate</button><button disabled={busyId !== null} onClick={() => review(selected.id, "REJECT")} className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-black"><XCircle className="h-4 w-4" />Not Hire</button></div></div>{selected.reviewDecision && <div className="mt-3 rounded-lg bg-black/20 p-3 text-sm">Current decision: <b>{selected.reviewDecision === "HIRE" ? "HIRED" : selected.reviewDecision === "REJECT" ? "NOT HIRED" : selected.reviewDecision}</b></div>}</section>}

          <section className="mt-4 rounded-xl bg-white/5 p-4"><h3 className="font-black">All answers & scoring</h3><div className="mt-3 space-y-3">{(selected.answerEvaluations || []).map((a,i) => { const video=(selected.answerVideos || []).find(v => Number(v.questionIndex)===Number(a.questionIndex)); return <div key={i} className="rounded-xl bg-black/20 p-3"><div className="flex justify-between gap-3"><b>Q{Number(a.questionIndex)+1}. {a.question}</b><span className="font-black">{a.score ?? 0}/100</span></div><p className="mt-2 text-sm text-slate-300">{a.answer || "No answer provided."}</p><p className="mt-2 text-xs text-slate-500">Skills {a.skills ?? "—"} • Communication {a.communication ?? "—"} • Technical {a.technical ?? "—"} • Depth {a.depth ?? "—"}</p>{video?.url && <video controls src={mediaUrl(video.url)} className="mt-3 w-full max-w-2xl rounded-lg" />}</div>; })}</div></section>
          {selected.videoRecordingUrl && <section className="mt-4 rounded-xl bg-white/5 p-4"><h3 className="mb-3 font-black"><Video className="mr-2 inline h-4 w-4" />Full interview recording</h3><video controls src={mediaUrl(selected.videoRecordingUrl)} className="w-full rounded-lg" /></section>}
          <section className="mt-4 rounded-xl bg-white/5 p-4"><h3 className="font-black">Complete transcript</h3><div className="mt-3 max-h-80 space-y-2 overflow-auto">{(selected.transcript || []).map((m,i)=><p key={i} className="rounded-lg bg-black/20 p-2 text-sm"><b className="text-cyan-300">{m.role === "robot" ? "NOVA" : "Candidate"}:</b> {m.content}</p>)}</div></section>
        </div>
      </div>}
    </div>
  );
}
