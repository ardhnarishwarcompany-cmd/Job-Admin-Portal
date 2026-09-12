import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import AdminLayout from "./AdminLayout";
import { ADMIN_API_ENDPOINT } from "@/utils/data";
import { useNavigate } from "react-router-dom";
import {
  FileCheck2, Building2, MapPin, Wallet, Clock, Check, X, Loader2, Hash,
} from "lucide-react";

const PendingJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [reason, setReason] = useState("");
  const navigate = useNavigate();

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${ADMIN_API_ENDPOINT}/jobs/pending`, { withCredentials: true });
      if (res.data.success) setJobs(res.data.jobs);
    } catch (err) {
      toast.error("Could not load pending jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const approve = async (id) => {
    setActingId(id);
    try {
      const res = await axios.put(`${ADMIN_API_ENDPOINT}/jobs/${id}/approve`, {}, { withCredentials: true });
      if (res.data.success) {
        toast.success("Job approved and published");
        setJobs((prev) => prev.filter((j) => j._id !== id));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not approve job");
    } finally {
      setActingId(null);
    }
  };

  const submitReject = async () => {
    if (!reason.trim()) return toast.error("Please provide a reason for the recruiter");
    setActingId(rejectTarget);
    try {
      const res = await axios.put(`${ADMIN_API_ENDPOINT}/jobs/${rejectTarget}/reject`, { reason }, { withCredentials: true });
      if (res.data.success) {
        toast.success("Job rejected — recruiter has been notified");
        setJobs((prev) => prev.filter((j) => j._id !== rejectTarget));
        setRejectTarget(null);
        setReason("");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not reject job");
    } finally {
      setActingId(null);
    }
  };

  return (
    <AdminLayout title="Job Approvals" description={`${jobs.length} job${jobs.length !== 1 ? "s" : ""} awaiting review`} icon={FileCheck2}>
      {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
          ) : jobs.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center text-slate-400">
              <FileCheck2 className="mx-auto mb-3 h-10 w-10" />
              All caught up — no jobs pending approval
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {jobs.map((job) => (
                <motion.div
                  key={job._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => navigate(`/description/${job._id}`)}
                  className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-base font-bold text-slate-900">{job.title}</h3>
                      <p className="flex items-center gap-1 text-xs text-slate-500">
                        <Building2 className="h-3 w-3" /> {job.companyName || "Unknown company"} · {job.recruiterName}
                      </p>
                    </div>
                    {job.jobCode && (
                      <span className="flex flex-shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                        <Hash className="h-2.5 w-2.5" /> {job.jobCode}
                      </span>
                    )}
                  </div>

                  <div className="mb-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                    <span className="flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1"><Wallet className="h-3 w-3" /> ₹{job.salary}</span>
                    <span className="flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1"><Clock className="h-3 w-3" /> {job.jobType}</span>
                  </div>

                  <p className="mb-4 line-clamp-3 text-sm text-slate-600">{job.description}</p>

                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={(e) => { e.stopPropagation(); approve(job._id); }}
                      disabled={actingId === job._id}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-xs font-bold text-white shadow-md disabled:opacity-50"
                    >
                      {actingId === job._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Approve
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={(e) => { e.stopPropagation(); setRejectTarget(job._id); setReason(""); }}
                      disabled={actingId === job._id}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

      {/* Reject-with-reason modal */}
      <AnimatePresence>
        {rejectTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
            onClick={() => setRejectTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
              <h3 className="mb-1 font-display text-lg font-bold text-slate-900">Reject this job posting</h3>
              <p className="mb-4 text-sm text-slate-500">Tell the recruiter what needs to change — they'll see this immediately.</p>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                autoFocus
                placeholder="e.g. Salary range seems inconsistent with the role level, please double-check and resubmit."
                className="mb-4 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-400"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setRejectTarget(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600">Cancel</button>
                <button
                  onClick={submitReject}
                  disabled={actingId === rejectTarget}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  {actingId === rejectTarget ? "Rejecting..." : "Reject & Notify"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default PendingJobs;
