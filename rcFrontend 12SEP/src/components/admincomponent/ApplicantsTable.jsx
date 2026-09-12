import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { setAllApplicants } from "@/redux/applicationSlice";
import { toast } from "sonner";
import axios from "axios";
import { APPLICATION_API_ENDPOINT } from "@/utils/data";
import {
  CheckCircle2, XCircle, Download, Mail, Phone, Calendar,
  Users, MapPin, GraduationCap, Briefcase, ExternalLink
} from "lucide-react";

const ApplicantsTable = () => {
  const dispatch = useDispatch();
  const { applicants } = useSelector((store) => store.application);
  const [updatingId, setUpdatingId] = useState(null);

  const statusHandler = async (status, id) => {
    setUpdatingId(id);
    try {
      const res = await axios.post(
        `${APPLICATION_API_ENDPOINT}/status/${id}/update`,
        { status },
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(`Candidate ${status.toLowerCase()}`);
        // Update local state immediately
        const updated = {
          ...applicants,
          applications: applicants.applications.map((app) =>
            (app._id === id || app.id === id) ? { ...app, status: status.toLowerCase() } : app
          ),
        };
        dispatch(setAllApplicants(updated));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (!applicants?.applications?.length) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Users className="h-16 w-16 mb-4 opacity-20" />
        <p className="font-semibold text-slate-500">No applicants yet</p>
        <p className="text-sm mt-1">Candidates who apply will appear here</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden" animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
      className="space-y-4"
    >
      <AnimatePresence>
        {applicants.applications.map((item) => {
          const appId = item._id || item.id;
          const applicant = item?.applicant || {};
          const profile = applicant?.profile || {};

          // Resume: prefer the one uploaded at apply time, fallback to profile resume
          const resumePath = item?.resume || profile?.resume || null;
          const resumeName = item?.resumeOriginalName || profile?.resumeOriginalName || "Resume";

          const skills = Array.isArray(profile?.skills)
            ? profile.skills
            : (profile?.skills || "").split(",").map(s => s.trim()).filter(Boolean);

          const statusColor = item?.status === "accepted"
            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
            : item?.status === "rejected"
            ? "bg-rose-100 text-rose-700 border-rose-200"
            : "bg-amber-100 text-amber-700 border-amber-200";

          return (
            <motion.div
              key={appId}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
              exit={{ opacity: 0, x: -20 }}
              whileHover={{ y: -2, boxShadow: "0 12px 32px rgba(109,40,217,0.1)" }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md hover:border-blue-300 transition-all duration-300"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {/* Left: applicant info */}
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white font-black text-xl shadow-md">
                    {(applicant?.fullname || "U")[0].toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-black text-slate-900 text-base">{applicant?.fullname || "Candidate"}</h3>
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize ${statusColor}`}>
                        {item?.status || "pending"}
                      </span>
                    </div>

                    {/* Contact details */}
                    <div className="flex flex-wrap gap-3 mb-2">
                      {applicant?.email && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Mail className="h-3 w-3 text-blue-400" /> {applicant.email}
                        </span>
                      )}
                      {applicant?.phoneNumber && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Phone className="h-3 w-3 text-emerald-400" /> {applicant.phoneNumber}
                        </span>
                      )}
                      {profile?.city && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="h-3 w-3 text-rose-400" /> {profile.city}
                        </span>
                      )}
                      {profile?.experience && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Briefcase className="h-3 w-3 text-amber-400" /> {profile.experience} yrs exp
                        </span>
                      )}
                      {profile?.education && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <GraduationCap className="h-3 w-3 text-sky-400" /> {profile.education}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Calendar className="h-3 w-3" />
                        {item?.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN") : ""}
                      </span>
                    </div>

                    {/* Skills */}
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {skills.slice(0, 6).map((s, i) => (
                          <span key={i} className="rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                            {s}
                          </span>
                        ))}
                        {skills.length > 6 && (
                          <span className="text-xs text-slate-400">+{skills.length - 6} more</span>
                        )}
                      </div>
                    )}

                    {/* Bio */}
                    {profile?.bio && (
                      <p className="mt-2 text-xs text-slate-400 italic line-clamp-1">"{profile.bio}"</p>
                    )}
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:gap-2">
                  {/* Resume download — show if resume exists */}
                  {resumePath ? (
                    <motion.a
                      whileHover={{ scale: 1.04 }}
                      href={`${import.meta.env.VITE_API_URL || "http://localhost:8000"}${resumePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:shadow-blue-200 transition-all"
                    >
                      <Download className="h-3.5 w-3.5" /> Download Resume
                    </motion.a>
                  ) : (
                    <span className="rounded-xl bg-slate-100 border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-400">
                      No Resume
                    </span>
                  )}

                  {/* Accept / Reject */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      disabled={updatingId === appId}
                      onClick={() => statusHandler("Accepted", appId)}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 transition-all disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      disabled={updatingId === appId}
                      onClick={() => statusHandler("Rejected", appId)}
                      className="flex items-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-600 transition-all disabled:opacity-60"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};

export default ApplicantsTable;
