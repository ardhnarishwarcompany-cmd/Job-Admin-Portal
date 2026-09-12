import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components_lite/Navbar";
import { INTERVIEW_API_ENDPOINT, API_URL } from "@/utils/data";
import { Video, Loader2, ChevronRight, Clock, CheckCircle2, ShieldCheck, XCircle, UserRound } from "lucide-react";
import { toast } from "sonner";

const RecruiterInterviewHub = () => {
  const [interviews, setInterviews] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [oldRes, novaRes, pendingRes] = await Promise.all([
        axios.get(`${INTERVIEW_API_ENDPOINT}/recruiter`, { withCredentials: true }),
        axios.get(`${API_URL}/api/nova-interview/recruiter`, { withCredentials: true }),
        axios.get(`${API_URL}/api/nova-interview/hr/pending`, { withCredentials: true }),
      ]);
      if (oldRes.data.success) setInterviews(oldRes.data.interviews || []);
      if (novaRes.data.success) setInterviews((prev) => [...(novaRes.data.data || []), ...prev]);
      if (pendingRes.data.success) setPending(pendingRes.data.data || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Could not load HR interviews.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approval = async (id, decision) => {
    setBusy(`${id}:${decision}`);
    try {
      const r = await axios.post(
        `${API_URL}/api/nova-interview/${id}/hr-approval`,
        { decision },
        { withCredentials: true }
      );
      toast.success(r.data?.message || "HR approval saved.");
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Could not save HR approval.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        
        {/* Header Block */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h1 className="flex items-center gap-3 text-2xl font-black text-slate-900 sm:text-3xl">
                <div className="rounded-xl bg-violet-100 p-2.5 text-violet-600">
                  <Video className="h-6 w-6" />
                </div>
                <span>NOVA AI Interviews</span>
              </h1>
              <p className="text-sm text-slate-500 max-w-2xl mt-2 leading-relaxed">
                Approve candidate requests (either HR or Admin approval starts the interview), then review recordings, answers, and scoring after completion.
              </p>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        {pending.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-amber-600">
              <Clock className="h-4 w-4" /> Pending HR Approvals ({pending.length})
            </h2>
            <div className="grid gap-4">
              {pending.map((x) => (
                <div 
                  key={x.id} 
                  className="rounded-2xl border-l-4 border-l-amber-500 border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition duration-200"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3.5">
                      <div className="rounded-xl bg-slate-100 p-3 text-slate-600 hidden sm:block">
                        <UserRound className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <p className="font-extrabold text-slate-900 text-base">{x.candidateName}</p>
                        <p className="text-xs font-semibold text-slate-500 flex flex-wrap items-center gap-2">
                          <span>{x.jobTitle || "General Job Interview"}</span>
                          <span className="text-slate-300">•</span>
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[10px] uppercase">HR: {x.hrApprovalStatus}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-700 font-bold text-[10px] uppercase">Admin: {x.adminApprovalStatus}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto sm:justify-end border-t border-slate-50 pt-3 sm:pt-0 sm:border-0">
                      <button 
                        disabled={busy !== null} 
                        onClick={() => approval(x.id, "approved")} 
                        className="flex-1 sm:flex-none rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-black text-white hover:bg-emerald-600 active:bg-emerald-700 transition duration-150 disabled:opacity-50"
                      >
                        {busy === `${x.id}:approved` ? "Saving…" : "Approve"}
                      </button>
                      <button 
                        disabled={busy !== null} 
                        onClick={() => approval(x.id, "rejected")} 
                        className="flex-1 sm:flex-none rounded-xl bg-rose-500 px-4 py-2.5 text-xs font-black text-white hover:bg-rose-600 active:bg-rose-700 transition duration-150 disabled:opacity-50"
                      >
                        {busy === `${x.id}:rejected` ? "Saving…" : "Reject"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Interviews */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          </div>
        ) : (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-500">
              <UserRound className="h-4 w-4" /> All NOVA AI Interviews ({interviews.length})
            </h2>
            {interviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 px-4 text-center text-sm text-slate-400">
                No NOVA AI interviews scheduled yet.
              </div>
            ) : (
              <div className="grid gap-3.5">
                {interviews.map((x) => {
                  const isCompleted = x.status === "completed";
                  const isPassed = Number(x.avgScore) >= 60;
                  const borderCol = isCompleted ? (isPassed ? "border-l-emerald-500" : "border-l-rose-500") : "border-l-violet-500";
                  
                  return (
                    <motion.div 
                      key={`nova-${x.id}`} 
                      whileHover={{ y: -1 }} 
                      onClick={() => navigate(`/recruiter/nova-ai-interviews/${x.id}`)}
                      className={`cursor-pointer rounded-2xl border-l-4 ${borderCol} border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition duration-200`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                            <h3 className="text-base font-extrabold text-slate-900 truncate m-0 border-l-0 pl-0">{x.candidateName || "Candidate"}</h3>
                            <div className="flex items-center gap-2 mt-1 sm:mt-0">
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${isCompleted ? "bg-emerald-50 text-emerald-700" : "bg-violet-50 text-violet-700"}`}>
                                {x.status}
                              </span>
                              {isCompleted && (
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${isPassed ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                                  Score: {x.avgScore}%
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <p className="truncate text-xs font-semibold text-slate-500">{x.jobTitle || "General Sourcing Vacancy"}</p>
                          
                          <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                            <span className={`rounded px-2 py-0.5 ${x.hrApprovalStatus === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                              HR: {x.hrApprovalStatus}
                            </span>
                            <span className={`rounded px-2 py-0.5 ${x.adminApprovalStatus === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                              Admin: {x.adminApprovalStatus}
                            </span>
                            {isCompleted && (
                              <span className={`rounded px-2 py-0.5 font-extrabold ${isPassed ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                                {isPassed ? "PASS" : "FAIL"}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-2 text-slate-400 group-hover:text-slate-600 transition">
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default RecruiterInterviewHub;
