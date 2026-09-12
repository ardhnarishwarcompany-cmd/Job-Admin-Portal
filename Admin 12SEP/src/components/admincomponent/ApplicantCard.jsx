import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Download,
  CheckCircle2,
  Circle,
  XCircle,
  X,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CandidateProfileModal from "../components_lite/CandidateProfileModal";

const STATUS_STAGES = [
  { id: "pending", label: "Applied" },
  { id: "reviewed", label: "Reviewed" },
  { id: "shortlisted", label: "Shortlisted" },
  { id: "interview", label: "Interview" },
  { id: "hired", label: "Hired" },
];

const ApplicantCard = ({ application, onStatusChange, children }) => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const applicant = application.applicant;
  const job = application.job; 
  const jobTitle = job?.title || application.jobTitle;

  const currentStatus = application.status || "pending";
  const isRejected = currentStatus === "rejected";

  const getStageIndex = (status) => {
    if (status === "hired" || status === "accepted") return 4;
    if (status === "rejected") return -1;
    const index = STATUS_STAGES.findIndex((s) => s.id === status);
    return index === -1 ? 0 : index;
  };

  const currentStage = getStageIndex(currentStatus);

  const skills = Array.isArray(applicant?.profile?.skills)
    ? applicant.profile.skills
    : (applicant?.profile?.skills || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

  const handleStageClick = (stageId) => {
    if (onStatusChange && stageId !== currentStatus) {
      onStatusChange(stageId, application._id);
    }
  };

  const handleReject = () => {
    if (onStatusChange && currentStatus !== "rejected") {
      onStatusChange("rejected", application._id);
    }
  };

  return (
    <motion.div
      layout
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`rounded-2xl border bg-white shadow-sm transition-all duration-300 overflow-hidden ${
        isRejected
          ? "border-rose-200"
          : currentStage === 4
          ? "border-emerald-200"
          : "border-slate-200 hover:border-blue-300 hover:shadow-md"
      }`}
    >
      <div className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
          {/* Left: Applicant Info */}
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-xl shadow-md">
              {(applicant?.fullname || "U")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-slate-900 text-lg mb-1">
                {applicant?.fullname || "Candidate Name"}
              </h3>
              {jobTitle && (
                <div className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-slate-400" /> Applied for:{" "}
                  <span
                    className="text-blue-600 cursor-pointer hover:underline"
                    onClick={() => job?._id && navigate(`/description/${job._id}`)}
                  >
                    {jobTitle}
                  </span>
                </div>
              )}
              <div className="flex flex-wrap gap-3 mt-1 text-sm font-medium">
                {applicant?.email && (
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {applicant.email}
                  </span>
                )}
                {applicant?.phoneNumber && (
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Phone className="h-4 w-4 text-slate-400" />
                    {applicant.phoneNumber}
                  </span>
                )}
                {applicant?.profile?.city && (
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {applicant.profile.city}
                  </span>
                )}
                {applicant?.profile?.education && (
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <GraduationCap className="h-4 w-4 text-slate-400" />
                    {applicant.profile.education}
                  </span>
                )}
              </div>
              {/* Skills */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {skills.slice(0, 6).map((s, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      {s}
                    </span>
                  ))}
                  {skills.length > 6 && (
                    <span className="text-xs font-medium text-slate-400 mt-1">
                      +{skills.length - 6} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm"
              >
                <User className="h-4 w-4 text-slate-500" /> Profile Details
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReject}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                  isRejected
                    ? "bg-rose-100 text-rose-700 border-rose-200 shadow-inner cursor-default"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 shadow-sm"
                }`}
              >
                <X className="h-4 w-4" /> Reject
              </motion.button>

              {applicant?.profile?.resume && (
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={`${
                    import.meta.env.VITE_API_URL || "http://localhost:8000"
                  }${applicant.profile.resume}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg transition-all"
                >
                  <Download className="h-4 w-4" /> Resume
                </motion.a>
              )}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative pt-2 pb-4 px-2 sm:px-6">
          <div className="absolute top-5 left-6 right-6 h-0.5 bg-slate-100 hidden sm:block"></div>
          <div
            className={`absolute top-5 left-6 h-0.5 transition-all duration-700 hidden sm:block ${
              isRejected ? "bg-rose-400" : "bg-blue-500"
            }`}
            style={{
              width: isRejected
                ? `${Math.max(0, currentStage) * 25}%`
                : `${Math.min(currentStage, 4) * 25}%`,
            }}
          ></div>

          <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-0 relative z-10">
            {STATUS_STAGES.map((stage, index) => {
              let isCompleted = index <= currentStage;
              let isCurrent = index === currentStage && !isRejected;
              let isFailed = isRejected && index === currentStage + 1;

              if (isRejected && index > Math.max(0, currentStage)) {
                isCompleted = false;
              }

              return (
                <div
                  key={stage.id}
                  onClick={() => handleStageClick(stage.id)}
                  className={`flex sm:flex-col items-center gap-3 sm:gap-2 cursor-pointer group`}
                >
                  {isFailed ? (
                    <div className="h-8 w-8 rounded-full bg-rose-500 flex items-center justify-center text-white ring-4 ring-white shadow-sm z-10 transition-transform group-hover:scale-110">
                      <XCircle className="h-4 w-4" />
                    </div>
                  ) : isCompleted ? (
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white ring-4 ring-white shadow-sm z-10 transition-transform group-hover:scale-110">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-400 ring-4 ring-white z-10 transition-all group-hover:border-blue-300 group-hover:bg-blue-50">
                      <Circle className="h-3 w-3" />
                    </div>
                  )}

                  <div className="flex flex-col sm:items-center">
                    <span
                      className={`text-xs font-bold transition-colors ${
                        isFailed
                          ? "text-rose-600"
                          : isCompleted
                          ? "text-blue-900"
                          : "text-slate-400 group-hover:text-blue-500"
                      }`}
                    >
                      {stage.label}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-blue-500 hidden sm:block mt-1 uppercase tracking-wider">
                        Current
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {children}
      </div>
      <CandidateProfileModal isOpen={modalOpen} onClose={() => setModalOpen(false)} user={applicant} />
    </motion.div>
  );
};

export default ApplicantCard;
