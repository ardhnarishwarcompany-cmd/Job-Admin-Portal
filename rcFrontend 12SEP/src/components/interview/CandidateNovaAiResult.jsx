import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, CheckCircle2, XCircle, Clock3 } from "lucide-react";
import Navbar from "../components_lite/Navbar";
import { API_URL } from "@/utils/data";

const CandidateNovaAiResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    axios.get(`${API_URL}/api/nova-interview/${id}`, { withCredentials: true })
      .then((res) => { if (mounted) setSession(res.data?.data || null); })
      .catch((e) => { if (mounted) setError(e?.response?.data?.message || "Could not load interview result."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="min-h-screen bg-slate-50"><Navbar/><div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-blue-600"/></div></div>;
  if (error || !session) return <div className="min-h-screen bg-slate-50"><Navbar/><div className="mx-auto max-w-3xl px-4 py-12"><div className="rounded-2xl bg-white p-8 text-center shadow-sm"><p className="font-bold text-rose-600">{error || "Interview not found."}</p><button onClick={()=>navigate("/candidate/interviews")} className="mt-5 rounded-xl bg-slate-900 px-5 py-2 text-sm font-bold text-white">Back to interviews</button></div></div></div>;

  const decision = String(session.reviewDecision || "PENDING").toUpperCase();
  const hired = decision === "HIRE";
  const rejected = decision === "REJECT";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100">
      <Navbar/>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <button onClick={()=>navigate("/candidate/interviews")} className="mb-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm"><ArrowLeft className="h-4 w-4"/> Back</button>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-blue-600">NOVA AI Interview Result</p>
              <h1 className="mt-2 text-3xl font-black text-slate-950">{session.jobTitle || "Job Interview"}</h1>
              <p className="mt-2 text-sm text-slate-500">Completed {session.completedAt ? new Date(session.completedAt).toLocaleString() : ""}</p>
            </div>
            <div className={`rounded-2xl px-7 py-5 text-center ${hired ? "bg-emerald-50 text-emerald-700" : rejected ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>
              {hired ? <CheckCircle2 className="mx-auto h-7 w-7"/> : rejected ? <XCircle className="mx-auto h-7 w-7"/> : <Clock3 className="mx-auto h-7 w-7"/>}
              <p className="mt-2 text-xs font-bold uppercase tracking-wide">Final Decision</p>
              <p className="mt-1 text-xl font-black">{hired ? "HIRED 🎉" : rejected ? "NOT HIRED" : "UNDER REVIEW"}</p>
            </div>
          </div>

          {hired && <div className="mt-7 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-bold leading-7 text-emerald-800">🎉 Congratulations! The hiring team has selected you. Please check your email and notifications for the next steps.</div>}
          {rejected && <div className="mt-7 rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm font-bold leading-7 text-rose-800">Thank you for completing the interview. The hiring team has decided not to move forward with this application. We wish you the very best in your future opportunities.</div>}
          {!hired && !rejected && <div className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm font-bold leading-7 text-amber-800">Your interview is still under review. We will notify you by email and in your notifications when the final hiring decision is made.</div>}

          <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            <p className="font-bold text-slate-900">What happens next?</p>
            <p className="mt-1">You will receive the final interview result by email and in your ArdhnariShwar notifications.</p>
          </div>
        </div>
      </main>
    </div>
  );
};
export default CandidateNovaAiResult;
