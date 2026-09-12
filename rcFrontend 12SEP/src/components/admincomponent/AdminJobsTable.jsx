import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Eye, Trash2, XCircle, Briefcase, Building2, Calendar, Users, MoreHorizontal, Clock, AlertTriangle } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { JOB_API_ENDPOINT } from "@/utils/data";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

const AdminJobsTable = () => {
  const { allAdminJobs, searchJobByText } = useSelector((store) => store.job);
  const navigate = useNavigate();
  const [filterJobs, setFilterJobs] = useState(allAdminJobs);

  useEffect(() => {
    const filtered = allAdminJobs.filter((job) => {
      if (!searchJobByText) return true;
      return (
        job.title?.toLowerCase().includes(searchJobByText.toLowerCase()) ||
        job?.company?.name?.toLowerCase().includes(searchJobByText.toLowerCase())
      );
    });
    setFilterJobs(filtered);
  }, [allAdminJobs, searchJobByText]);

  const handleCloseJob = async (jobId) => {
    try {
      const res = await axios.put(`${JOB_API_ENDPOINT}/close/${jobId}`, {}, { withCredentials: true });
      if (res.data.success) { toast.success("Job closed"); window.location.reload(); }
    } catch { toast.error("Failed to close job"); }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm("Delete this job?")) return;
    try {
      const res = await axios.delete(`${JOB_API_ENDPOINT}/delete/${jobId}`, { withCredentials: true });
      if (res.data.success) { toast.success("Job deleted"); window.location.reload(); }
    } catch { toast.error("Failed to delete job"); }
  };

  if (filterJobs.length === 0) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 text-slate-400">
      <Briefcase className="h-16 w-16 mb-4 opacity-20" />
      <p className="font-semibold">No jobs found</p>
    </motion.div>
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
      className="space-y-3"
    >
      <AnimatePresence>
        {filterJobs.map((job) => (
          <motion.div
            key={job._id}
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
            exit={{ opacity: 0, x: -20 }}
            whileHover={{ x: 4 }}
            onClick={() => navigate(`/recruiter/jobs/${job._id}`)}
            className="cursor-pointer flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-md hover:border-blue-300 hover:shadow-lg transition-all duration-300 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-black text-lg shadow-md">
                {(job.title || "J")[0]}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  {job.title}
                  {job.jobCode && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{job.jobCode}</span>
                  )}
                </h3>
                <div className="flex flex-wrap gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Building2 className="h-3 w-3" /> {job?.company?.name}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Users className="h-3 w-3" /> {job.applications?.length || 0} applicants
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="h-3 w-3" /> {job.createdAt?.split("T")[0]}
                  </span>
                </div>
                {job.approvalStatus === "pending" && (
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                    <Clock className="h-3 w-3" /> Awaiting admin approval — not visible to candidates yet
                  </p>
                )}
                {job.approvalStatus === "rejected" && (
                  <p className="mt-1.5 flex items-start gap-1 text-[11px] font-semibold text-rose-600">
                    <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" /> Rejected: {job.rejectionReason || "No reason given"}
                  </p>
                )}
                {job.approvalStatus === "edit_pending" && (
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50/50 px-2.5 py-0.5 rounded-full inline-flex">
                    <Clock className="h-3 w-3" /> Edit request pending Admin review — editing disabled
                  </p>
                )}
                {job.isDeleted && (
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50/60 px-2.5 py-0.5 rounded-full inline-flex">
                    <AlertTriangle className="h-3.5 w-3.5" /> Removed by Admin — hidden from candidates
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {job.isDeleted ? (
                <span className="rounded-full px-3 py-1 text-xs font-bold bg-rose-100 text-rose-700">
                  Removed
                </span>
              ) : (
                <>
                  {job.approvalStatus && job.approvalStatus !== "approved" && (
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      job.approvalStatus === "edit_pending" ? "bg-indigo-100 text-indigo-700" :
                      job.approvalStatus === "pending" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-600"
                    }`}>
                      {
                        job.approvalStatus === "edit_pending" ? "Edit Pending" :
                        job.approvalStatus === "pending" ? "Pending" : "Rejected"
                      }
                    </span>
                  )}
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${job.status === "closed" ? "bg-slate-100 text-slate-500" : "bg-emerald-100 text-emerald-700"}`}>
                    {job.status || "open"}
                  </span>
                </>
              )}
              <div onClick={(e) => e.stopPropagation()}>
                <Popover>
                  <PopoverTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </motion.button>
                  </PopoverTrigger>
                  <PopoverContent className="w-44 rounded-xl border border-slate-200 p-2 shadow-xl">
                    <button onClick={() => navigate(`/recruiter/jobs/${job._id}`)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                      <Eye className="h-4 w-4" /> View Details
                    </button>
                    <button 
                      onClick={() => {
                        if (job.isDeleted) {
                          toast.error("This job listing has been removed by the Admin. You cannot edit it.");
                        } else if (job.approvalStatus === "edit_pending") {
                          toast.info("An edit request is already pending for this job. Please wait for Admin approval or rejection.");
                        } else {
                          navigate(`/recruiter/jobs/edit/${job._id}`);
                        }
                      }} 
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" /> Edit Job
                    </button>
                    {!job.isDeleted && job.status !== "closed" && (
                      <button onClick={() => handleCloseJob(job._id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors">
                        <XCircle className="h-4 w-4" /> Close Job
                      </button>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminJobsTable;
