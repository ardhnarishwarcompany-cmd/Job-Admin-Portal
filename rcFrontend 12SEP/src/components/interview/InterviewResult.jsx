import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components_lite/Navbar";
import { INTERVIEW_API_ENDPOINT } from "@/utils/data";
import { Loader2, CheckCircle2, ArrowLeft, Sparkles, MessageSquareText } from "lucide-react";

const ScoreBar = ({ label, value }) => (
  <div>
    <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
      <span>{label}</span><span>{value}%</span>
    </div>
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  </div>
);

const InterviewResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${INTERVIEW_API_ENDPOINT}/${id}`, { withCredentials: true })
      .then((res) => { if (res.data.success) setInterview(res.data.interview); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-blue-50"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  }
  if (!interview) {
    return <div className="flex min-h-screen items-center justify-center bg-blue-50 text-slate-500">Interview not found.</div>;
  }

  const isPractice = interview.mode === "practice";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <button onClick={() => navigate("/candidate/interviews")} className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-blue-600">
          <ArrowLeft className="h-4 w-4" /> Back to interviews
        </button>

        {!isPractice ? (
          // Assessment mode: candidate only gets a confirmation — full score is for the recruiter.
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-500" />
            <h1 className="text-2xl font-black text-slate-950">Interview Submitted</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Thanks for completing your AI interview{interview.role_title ? ` for ${interview.role_title}` : ""}.
              The recruiter has been notified and will review your responses.
            </p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="relative h-28 w-28 flex-none rounded-full bg-slate-100">
                  <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#2563eb ${(interview.overall_score || 0) * 3.6}deg, #e2e8f0 0deg)` }} />
                  <div className="absolute inset-3 grid place-items-center rounded-full bg-white text-xl font-black text-blue-700">
                    {interview.overall_score ?? "—"}%
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xs font-black uppercase text-slate-400">Practice Result</p>
                  <p className="text-xl font-black text-slate-950">{interview.recommendation || "Reviewed"}</p>
                  <p className="mt-1 text-sm text-slate-500">{interview.ai_summary}</p>
                </div>
              </div>
            </div>

            {interview.categoryScores && (
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase text-slate-500">Score breakdown</p>
                {Object.entries(interview.categoryScores).map(([k, v]) => (
                  <ScoreBar key={k} label={k.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase())} value={v} />
                ))}
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="mb-3 flex items-center gap-1.5 text-xs font-black uppercase text-slate-500">
                <MessageSquareText className="h-3.5 w-3.5" /> Your Answers
              </p>
              <div className="space-y-4">
                {interview.questions.map((q, i) => {
                  const a = interview.answers?.find((ans) => ans.questionId === q.id);
                  return (
                    <div key={q.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <p className="text-sm font-bold text-slate-800">Q{i + 1}. {q.text}</p>
                      {a?.videoUrl && (
                        <video src={`${import.meta.env.VITE_API_URL || "http://localhost:8000"}${a.videoUrl}`} controls className="mt-2 w-full max-w-sm rounded-lg" />
                      )}
                      <p className="mt-2 text-xs text-slate-500">{a?.transcript || "No answer recorded."}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <Link
              to="/candidate/interviews"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-2.5 text-sm font-bold text-white shadow-md"
            >
              <Sparkles className="h-4 w-4" /> Practice Again
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InterviewResult;
