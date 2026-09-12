import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components_lite/Navbar";
import { INTERVIEW_API_ENDPOINT, API_URL } from "@/utils/data";
import {
  Sparkles, Loader2, Plus, Trash2, GripVertical, Clock, Send, ShieldCheck,
  Calendar, Wand2,
} from "lucide-react";

let uid = 0;
const nextId = () => `q-${Date.now()}-${uid++}`;

const SendInterview = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const candidateId = params.get("candidateId");
  const jobId = params.get("jobId");
  const applicationId = params.get("applicationId");
  const jobTitle = params.get("jobTitle") || "";

  const [jobDescription, setJobDescription] = useState("");
  const [focus, setFocus] = useState("Mixed");
  const [count, setCount] = useState(8);
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [allowRetry, setAllowRetry] = useState(false);
  const [deadline, setDeadline] = useState("");
  const [prepTimeSec, setPrepTimeSec] = useState(15);
  const [sending, setSending] = useState(false);

  const generateQuestions = async () => {
    if (!jobTitle.trim()) {
      toast.error("Job title missing — open this from an applicant's job page.");
      return;
    }
    setGenerating(true);
    try {
      const res = await axios.post(
        `${INTERVIEW_API_ENDPOINT}/templates/generate`,
        { jobTitle, jobDescription, focus, count },
        { withCredentials: true }
      );
      if (res.data.success) setQuestions(res.data.questions);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not generate questions.");
    } finally {
      setGenerating(false);
    }
  };

  const updateQuestion = (id, patch) =>
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  const removeQuestion = (id) => setQuestions((prev) => prev.filter((q) => q.id !== id));
  const addQuestion = () =>
    setQuestions((prev) => [...prev, { id: nextId(), text: "", timeLimitSec: 90, order: prev.length }]);

  const sendInterview = async () => {
    if (!candidateId) {
      toast.error("No candidate selected. Open this page from an applicant's profile.");
      return;
    }
    if (questions.length === 0 || questions.some((q) => !q.text.trim())) {
      toast.error("Add at least one question, and make sure none are empty.");
      return;
    }
    setSending(true);
    try {
      const res = await axios.post(
        `${INTERVIEW_API_ENDPOINT}/send`,
        {
          candidateId, jobId, applicationId, questions,
          allowRetryOnFailure: allowRetry,
          deadline: deadline || null,
          prepTimeSec,
        },
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success("Interview sent to candidate.");
        navigate("/recruiter/interviews");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not send the interview.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="flex items-center gap-2 text-2xl font-black text-slate-950 sm:text-3xl">
          <Wand2 className="h-6 w-6 text-violet-600" /> Send AI Video Interview
        </h1>
        {jobTitle && <p className="mt-1 text-sm text-slate-500">For: <span className="font-bold text-slate-700">{jobTitle}</span></p>}
        {candidateId && (
          <button
            onClick={async()=>{try{
              const r=await axios.post(`${API_URL}/api/nova-interview/start-for-candidate`,{candidateId,jobId,jobTitle},{withCredentials:true});
              if(r.data.success){toast.success("NOVA AI interview created.");navigate(`/recruiter/interviews`);}
            }catch(e){toast.error(e?.response?.data?.message||"Could not create NOVA interview.");}}}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white hover:bg-slate-800"
          >
            <Sparkles className="h-4 w-4 text-cyan-300"/> Create NOVA AI Interview
          </button>
        )}

        {/* Generate */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-600">1. Generate questions</h3>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={3}
            placeholder="Paste the job description here for more relevant questions (optional)"
            className="w-full resize-none rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          />
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <select value={focus} onChange={(e) => setFocus(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option>Mixed</option><option>Technical</option><option>Behavioral</option>
            </select>
            <select value={count} onChange={(e) => setCount(Number(e.target.value))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {[5, 6, 8, 10].map((n) => <option key={n} value={n}>{n} questions</option>)}
            </select>
            <button
              onClick={generateQuestions}
              disabled={generating}
              className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generating ? "Generating..." : "Generate with AI"}
            </button>
          </div>
        </div>

        {/* Edit questions */}
        {questions.length > 0 && (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-600">2. Review & edit</h3>
              <button onClick={addQuestion} className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 hover:underline">
                <Plus className="h-3.5 w-3.5" /> Add question
              </button>
            </div>
            <div className="space-y-3">
              {questions.map((q, i) => (
                <div key={q.id} className="flex items-start gap-2 rounded-lg border border-slate-200 p-3">
                  <GripVertical className="mt-2.5 h-4 w-4 flex-shrink-0 text-slate-300" />
                  <div className="flex-1">
                    <textarea
                      value={q.text}
                      onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                      rows={2}
                      className="w-full resize-none rounded-md border border-slate-200 p-2 text-sm outline-none focus:border-violet-400"
                    />
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock className="h-3 w-3" />
                      <input
                        type="number"
                        min={30}
                        max={300}
                        value={q.timeLimitSec}
                        onChange={(e) => updateQuestion(q.id, { timeLimitSec: Number(e.target.value) })}
                        className="w-16 rounded border border-slate-200 px-1.5 py-0.5"
                      />
                      sec to answer
                    </div>
                  </div>
                  <button onClick={() => removeQuestion(q.id)} className="mt-1 text-slate-300 hover:text-rose-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Configure & send */}
        {questions.length > 0 && (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-600">3. Configure & send</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex items-start gap-2 rounded-lg border border-slate-200 p-3">
                <input type="checkbox" checked={allowRetry} onChange={(e) => setAllowRetry(e.target.checked)} className="mt-0.5" />
                <span className="text-sm">
                  <span className="flex items-center gap-1 font-bold text-slate-800"><ShieldCheck className="h-3.5 w-3.5" /> Allow retry on technical failure</span>
                  <span className="mt-0.5 block text-xs text-slate-500">One retry only if a recording genuinely fails — not for redoing an answer.</span>
                </span>
              </label>
              <label className="block">
                <span className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-600"><Calendar className="h-3.5 w-3.5" /> Deadline (optional)</span>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
            </div>
            <button
              onClick={sendInterview}
              disabled={sending}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-60"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sending ? "Sending..." : "Send Interview to Candidate"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SendInterview;
