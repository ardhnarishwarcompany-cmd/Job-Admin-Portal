import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Navbar from "../components_lite/Navbar";
import { INTERVIEW_API_ENDPOINT, API_URL } from "@/utils/data";
import {
  Video, Sparkles, Loader2, Clock, CheckCircle2, AlertTriangle, PlayCircle,
  Briefcase, Trophy, ChevronRight, X,
} from "lucide-react";

const statusMeta = {
  pending: { label: "Not Started", color: "bg-amber-100 text-amber-700" },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700" },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700" },
  expired: { label: "Expired", color: "bg-rose-100 text-rose-700" },
};

const CandidateInterviewHub = () => {
  const [interviews, setInterviews] = useState([]);
  const [novaInterviews, setNovaInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPracticeForm, setShowPracticeForm] = useState(false);
  const [roleTitle, setRoleTitle] = useState("");
  const [focus, setFocus] = useState("Mixed");
  const [starting, setStarting] = useState(false);
  const navigate = useNavigate();

  const fetchInterviews = () => {
    setLoading(true);
    Promise.all([
      axios.get(`${INTERVIEW_API_ENDPOINT}/candidate`, { withCredentials: true }),
      axios.get(`${API_URL}/api/nova-interview/candidate`, { withCredentials: true }),
    ])
      .then(([classic, nova]) => {
        if (classic.data.success) setInterviews(classic.data.interviews || []);
        if (nova.data.success) setNovaInterviews(nova.data.data || []);
      })
      .catch((err) => {
        if (err?.response?.status !== 404) toast.error(err?.response?.data?.message || "Could not load interview history.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInterviews(); }, []);

  const startPractice = async (e) => {
    e.preventDefault();
    if (!roleTitle.trim()) {
      toast.error("Enter a role to practice for.");
      return;
    }
    setStarting(true);
    try {
      const res = await axios.post(`${INTERVIEW_API_ENDPOINT}/practice/start`, { roleTitle, focus }, { withCredentials: true });
      if (res.data.success) {
        navigate(`/candidate/interviews/${res.data.interview.id}/session`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not start practice interview.");
    } finally {
      setStarting(false);
    }
  };

  const assessments = interviews.filter((i) => i.mode === "assessment");
  const practices = interviews.filter((i) => i.mode === "practice");

  const openInterview = (interview) => {
    if (interview.status === "completed") navigate(`/candidate/interviews/${interview.id}/result`);
    else navigate(`/candidate/interviews/${interview.id}/session`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-black text-slate-950 sm:text-3xl">
              <Video className="h-6 w-6 text-blue-600" /> AI Video Interviews
            </h1>
            <p className="mt-1 text-sm text-slate-500">Recruiter-sent assessments and your own practice sessions.</p>
          </div>
          <button
            onClick={() => navigate("/candidate/nova-ai-interview")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-sm font-bold text-cyan-800 hover:bg-cyan-100 transition-all"
          >
            <Sparkles className="h-4 w-4" /> Request NOVA AI Interview
          </button>
        </div>


        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-blue-500" /></div>
        ) : (
          <div className="space-y-8">
            {/* Assessments from recruiters */}
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-500">
                <Briefcase className="h-4 w-4" /> Recruiter Invitations
              </h2>
              {assessments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">
                  No AI interview invitations yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {assessments.map((interview) => (
                    <motion.div
                      key={interview.id}
                      whileHover={{ y: -2 }}
                      onClick={() => openInterview(interview)}
                      className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-300 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-900">{interview.role_title || "Interview"}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          <span className={`rounded-full px-2 py-0.5 font-bold ${statusMeta[interview.status]?.color}`}>
                            {statusMeta[interview.status]?.label}
                          </span>
                          {interview.deadline && (
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Due {new Date(interview.deadline).toLocaleDateString()}</span>
                          )}
                          {interview.status === "completed" && (
                            <span className="flex items-center gap-1 text-emerald-600 font-bold"><CheckCircle2 className="h-3 w-3" /> Submitted</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 flex-shrink-0 text-slate-300" />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* NOVA AI final results/history */}
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-500">
                <Sparkles className="h-4 w-4" /> NOVA AI Interview Results & History
              </h2>
              {novaInterviews.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">
                  No NOVA AI interview results yet. Your completed interview and final hiring decision will appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  {novaInterviews.map((interview) => {
                    const decision = String(interview.reviewDecision || "PENDING").toUpperCase();
                    const completed = interview.status === "completed";
                    const decisionLabel = decision === "HIRE" ? "HIRED 🎉" : decision === "REJECT" ? "NOT HIRED" : completed ? "UNDER REVIEW" : String(interview.status || "").replace(/_/g, " ");
                    const decisionClass = decision === "HIRE" ? "bg-emerald-100 text-emerald-700" : decision === "REJECT" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700";
                    return (
                      <motion.div key={`nova-${interview.id}`} whileHover={{ y:-2 }} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-900">{interview.jobTitle || "NOVA AI Interview"}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                              <span className={`rounded-full px-2 py-0.5 font-bold ${decisionClass}`}>{decisionLabel}</span>
                              {interview.completedAt && <span className="text-slate-400">{new Date(interview.completedAt).toLocaleDateString()}</span>}
                            </div>
                          </div>
                          {completed && (
                            <button onClick={() => navigate(`/candidate/nova-ai-interview/${interview.id}/result`)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-black text-white hover:bg-slate-800">
                              View Result <ChevronRight className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Practice history */}
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-500">
                <Trophy className="h-4 w-4" /> Practice History
              </h2>
              {practices.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">
                  No practice sessions yet — try one above to prep for real interviews.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {practices.map((interview) => (
                    <motion.div
                      key={interview.id}
                      whileHover={{ y: -2 }}
                      onClick={() => openInterview(interview)}
                      className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <p className="truncate font-bold text-slate-900">{interview.role_title}</p>
                        {interview.status === "completed" && interview.overall_score !== null && (
                          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-black text-blue-700">
                            {interview.overall_score}%
                          </span>
                        )}
                      </div>
                      <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${statusMeta[interview.status]?.color}`}>
                        {statusMeta[interview.status]?.label}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateInterviewHub;
