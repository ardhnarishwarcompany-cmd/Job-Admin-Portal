import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { Briefcase, Building2, Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";

const statusConfig = {
  accepted: { label: "Accepted", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-rose-100 text-rose-700 border-rose-200", icon: XCircle },
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
};

const AppliedJob = () => {
  const { allAppliedJobs } = useSelector((store) => store.job);

  if (!allAppliedJobs || allAppliedJobs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 text-slate-400"
      >
        <Briefcase className="h-14 w-14 mb-3 opacity-20" />
        <p className="font-semibold text-slate-500">No applications yet</p>
        <p className="text-sm mt-1">Start applying to jobs to see them here</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {allAppliedJobs.map((appliedJob, i) => {
          const status = statusConfig[appliedJob?.status] || statusConfig.pending;
          const StatusIcon = status.icon;

          return (
            <motion.div
              key={appliedJob._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ x: 4 }}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white font-black shadow-md">
                  {(appliedJob?.job?.title || "J")[0]}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{appliedJob?.job?.title || "Job"}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Building2 className="h-3 w-3" /> {appliedJob?.job?.company?.name}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="h-3 w-3" /> {appliedJob?.createdAt?.split("T")[0]}
                    </span>
                  </div>
                </div>
              </div>
              <span className={`flex items-center gap-1.5 self-start rounded-full border px-3 py-1.5 text-xs font-bold sm:self-auto ${status.color}`}>
                <StatusIcon className="h-3.5 w-3.5" /> {status.label}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default AppliedJob;
