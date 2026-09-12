import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Clock, AlertTriangle, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import axios from "axios";
import { RECRUITER_API_ENDPOINT } from "@/utils/data";
import { toast } from "sonner";

// Note: Ensure RECRUITER_API_ENDPOINT points to your recruiter backend base, e.g. "http://localhost:5000/api/recruiter"
const API_BASE = RECRUITER_API_ENDPOINT || "http://localhost:5000/api/recruiter";

const FeatureGuard = ({ feature, children }) => {
  const [status, setStatus] = useState("loading"); // 'loading', 'approved', 'pending', 'rejected', 'not_requested'
  const [submitting, setSubmitting] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE}/features`, { withCredentials: true });
      if (res.data.success) {
        const features = res.data.features || {};
        const featStatus = features[`${feature}_status`] || "not_requested";
        setStatus(featStatus);
      } else {
        setStatus("not_requested");
      }
    } catch (err) {
      console.error("Error fetching feature permission:", err);
      setStatus("not_requested");
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [feature]);

  const handleRequestAccess = async () => {
    try {
      setSubmitting(true);
      const res = await axios.post(
        `${API_BASE}/features/request`,
        { feature },
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message || "Access request submitted!");
        setStatus("pending");
      } else {
        toast.error(res.data.message || "Failed to submit request");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-800 dark:border-t-blue-500" />
        <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Verifying feature permissions...</p>
      </div>
    );
  }

  if (status === "approved") {
    return <>{children}</>;
  }

  // Feature block screen metadata
  const featureMeta = {
    chat: {
      title: "Real-Time Chat Panel",
      desc: "Connect directly with shortlisted candidates and coordinate interview schedules instantly."
    },
    nova: {
      title: "Nova AI Video Interviews",
      desc: "Conduct automated AI screenings, evaluate candidates using Whisper transcription, and view candidate proctoring logs."
    },
    find_candidates: {
      title: "Candidate Smart Search & Match",
      desc: "Query candidate profiles using JD matching algorithms and filter by skills and experience."
    }
  }[feature] || {
    title: "Premium Feature Access",
    desc: "Gain access to advanced recruiter toolings to accelerate your hiring pipeline."
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-2xl text-center"
      >
        {/* Visual Background Gradients */}
        <div className="absolute -left-16 -top-16 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -right-16 -bottom-16 h-36 w-36 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Lock / Status Icon container */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-md">
          {status === "pending" ? (
            <Clock className="h-10 w-10 text-amber-500 animate-pulse" />
          ) : status === "rejected" ? (
            <AlertTriangle className="h-10 w-10 text-rose-500" />
          ) : (
            <Lock className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
          )}
        </div>

        {/* Status Tag */}
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider">
          {status === "pending" && (
            <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 px-3 py-1 rounded-full flex items-center gap-1">
              <Clock className="h-3 w-3" /> Awaiting Verification
            </span>
          )}
          {status === "rejected" && (
            <span className="bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 px-3 py-1 rounded-full flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Access Rejected
            </span>
          )}
          {(status === "not_requested" || status === "revoked") && (
            <span className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-3 py-1 rounded-full flex items-center gap-1">
              <Lock className="h-3 w-3" /> Restricted Feature
            </span>
          )}
        </div>

        <h2 className="font-display text-2xl font-black text-slate-900 dark:text-white">
          Permission Required
        </h2>
        <p className="mt-1 text-sm font-bold text-indigo-600 dark:text-indigo-400">
          Feature: {featureMeta.title}
        </p>

        <p className="mx-auto mt-4 max-w-md text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {featureMeta.desc} In order to use this feature, your account must be granted permissions by the platform Administrator.
        </p>

        <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
          <AnimatePresence mode="wait">
            {(status === "not_requested" || status === "revoked") && (
              <motion.button
                key="btn-request"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRequestAccess}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 text-sm font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Submitting Request..." : "Request Access Permission"}
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            )}

            {status === "pending" && (
              <motion.div
                key="status-pending"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-400 text-sm font-medium"
              >
                Your request is currently under review by our Admin team. You will be notified via email/notifications once access is approved.
              </motion.div>
            )}

            {status === "rejected" && (
              <motion.div
                key="status-rejected"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-400 text-sm font-medium">
                  Unfortunately, your request for this feature was declined. Please contact our support team to appeal this decision.
                </div>
                <button
                  onClick={handleRequestAccess}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
                >
                  {submitting ? "Re-submitting..." : "Click to Try Requesting Again"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default FeatureGuard;
