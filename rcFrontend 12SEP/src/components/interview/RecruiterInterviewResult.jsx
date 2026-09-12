import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components_lite/Navbar";
import { INTERVIEW_API_ENDPOINT } from "@/utils/data";
import { ArrowLeft, Loader2, MessageSquareText, Trophy, User, Ban, PlayCircle } from "lucide-react";

const recBadge = {
  "Strong Hire": "bg-emerald-100 text-emerald-700",
  "Consider": "bg-amber-100 text-amber-700",
  "Not a Fit": "bg-rose-100 text-rose-700",
};

const ScoreBar = ({ label, value }) => (
  <div>
    <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
      <span>{label}</span><span>{value}%</span>
    </div>
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  </div>
);

const RecruiterInterviewResult = () => {
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

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>;
  if (!interview) return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">Interview not found.</div>;

  const isCompleted = interview.status === "completed";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <button onClick={() => navigate("/recruiter/interviews")} className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-violet-600">
          <ArrowLeft className="h-4 w-4" /> Back to interviews
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-black">
              {(interview.candidateName || "C")[0]}
            </div>
            <div>
              <p className="text-lg font-black text-slate-950">{interview.candidateName}</p>
              <p className="text-xs text-slate-500">{interview.candidateEmail} {interview.role_title && `· ${interview.role_title}`}</p>
            </div>
          </div>
        </div>

        {!isCompleted ? (
          <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <PlayCircle className="mb-3 h-10 w-10 text-slate-300" />
            <p className="font-bold text-slate-600">Not completed yet</p>
            <p className="mt-1 text-sm text-slate-400">Status: {interview.status.replace("_", " ")}</p>
          </div>
        ) : (
          <>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="relative h-24 w-24 flex-none rounded-full bg-slate-100">
                  <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#7c3aed ${(interview.overall_score || 0) * 3.6}deg, #e2e8f0 0deg)` }} />
                  <div className="absolute inset-2.5 grid place-items-center rounded-full bg-white text-lg font-black text-violet-700">
                    {interview.overall_score ?? "—"}%
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${recBadge[interview.recommendation] || "bg-slate-100 text-slate-600"}`}>
                    {interview.recommendation || "Reviewed"}
                  </span>
                  <p className="mt-2 text-sm text-slate-600">{interview.ai_summary}</p>
                </div>
              </div>
            </div>

            {interview.categoryScores && (
              <div className="mt-5 space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase text-slate-500">Score breakdown</p>
                {Object.entries(interview.categoryScores).map(([k, v]) => (
                  <ScoreBar key={k} label={k.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase())} value={v} />
                ))}
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="mb-3 flex items-center gap-1.5 text-xs font-black uppercase text-slate-500">
                <MessageSquareText className="h-3.5 w-3.5" /> Full Transcript
              </p>
              <div className="space-y-4">
                {interview.questions.map((q, i) => {
                  const a = interview.answers?.find((ans) => ans.questionId === q.id);
                  return (
                    <div key={q.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <p className="text-sm font-bold text-slate-800">Q{i + 1}. {q.text}</p>
                      {a?.failedAttempt && (
                        <p className="mt-1 flex items-center gap-1 text-xs font-bold text-rose-500">
                          <Ban className="h-3 w-3" /> Technical failure on this answer
                        </p>
                      )}
                      {a?.videoUrl && (
                        <video src={`${import.meta.env.VITE_API_URL || "http://localhost:8000"}${a.videoUrl}`} controls className="mt-2 w-full max-w-sm rounded-lg" />
                      )}
                      <p className="mt-2 text-xs text-slate-500">{a?.transcript || "No answer recorded."}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RecruiterInterviewResult;
