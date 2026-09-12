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
  Mic,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CandidateProfileModal from "../components_lite/CandidateProfileModal";
import AudioPlayer from "./AudioPlayer";

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
          ? "border-rose-200 bg-rose-50/10"
          : currentStage === 4
          ? "border-emerald-200 bg-emerald-50/10"
          : "border-slate-200 hover:border-blue-300 hover:shadow-md"
      }`}
    >
      <div className="p-4 sm:p-6">
        {/* Main Content Row */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-6">
          {/* Candidate Profile Details Header */}
          <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-lg sm:text-xl shadow-md">
              {(applicant?.fullname || "U")[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-black text-slate-900 text-base sm:text-lg tracking-tight truncate">
                  {applicant?.fullname || "Candidate Name"}
                </h3>
                {isRejected && (
                  <span className="rounded-full bg-rose-100 border border-rose-200 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 uppercase">
                    Rejected
                  </span>
                )}
                {currentStage === 4 && (
                  <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                    Hired
                  </span>
                )}
              </div>

              {jobTitle && (
                <div className="text-xs sm:text-sm font-medium text-slate-500 mb-2.5 flex items-center gap-1.5 flex-wrap">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  <span>Applied for:</span>
                  <span
                    className="font-bold text-blue-600 cursor-pointer hover:underline truncate max-w-[220px] sm:max-w-none"
                    onClick={() => job?._id && navigate(`/description/${job._id}`)}
                  >
                    {jobTitle}
                  </span>
                </div>
              )}

              {/* Contact & Meta Badges */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-600 mb-3">
                {applicant?.email && (
                  <span className="flex items-center gap-1.5 min-w-0 max-w-full">
                    <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate max-w-[180px] sm:max-w-none">{applicant.email}</span>
                  </span>
                )}
                {applicant?.phoneNumber && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span>{applicant.phoneNumber}</span>
                  </span>
                )}
                {applicant?.profile?.city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span>{applicant.profile.city}</span>
                  </span>
                )}
                {applicant?.profile?.education && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate max-w-[160px] sm:max-w-none">{applicant.profile.education}</span>
                  </span>
                )}
              </div>

              {/* Skills List */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {skills.slice(0, 5).map((s, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-slate-100/80 border border-slate-200/60 px-2.5 py-1 text-[11px] font-semibold text-slate-700"
                    >
                      {s}
                    </span>
                  ))}
                  {skills.length > 5 && (
                    <span className="text-[11px] font-bold text-slate-400 px-1 py-1">
                      +{skills.length - 5} more
                    </span>
                  )}
                </div>
              )}

              {/* Audio Introduction Player */}
              {application?.audioIntro && (
                <div className="mt-4">
                  <AudioPlayer
                    src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}${application.audioIntro}`}
                    label="Audio Introduction"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t border-slate-100 lg:border-t-0 w-full lg:w-auto justify-end">
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full lg:w-auto">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setModalOpen(true)}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all"
              >
                <User className="h-3.5 w-3.5 text-slate-500" />
                <span>Profile</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleReject}
                className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  isRejected
                    ? "bg-rose-100 text-rose-700 border-rose-200 cursor-default"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 shadow-sm"
                }`}
              >
                <X className="h-3.5 w-3.5" />
                <span>Reject</span>
              </motion.button>

              {applicant?.profile?.resume && (
                <motion.a
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  href={`${
                    import.meta.env.VITE_API_URL || "http://localhost:8000"
                  }${applicant.profile.resume}`}
                  target="_blank"
                  rel="noreferrer"
                  className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg transition-all"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Resume</span>
                </motion.a>
              )}
            </div>
          </div>
        </div>

        {/* Timeline Stepper Container */}
        <div className="mt-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 p-3.5 sm:p-5">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3 px-1">
            Application Pipeline Stage
          </p>

          {/* Desktop Timeline */}
          <div className="relative pt-2 pb-2 px-4 hidden sm:block">
            <div className="absolute top-6 left-8 right-8 h-1 bg-slate-200/80 rounded-full"></div>
            <div
              className={`absolute top-6 left-8 h-1 transition-all duration-500 rounded-full ${
                isRejected ? "bg-rose-500" : "bg-blue-600"
              }`}
              style={{
                width: isRejected
                  ? `${Math.max(0, currentStage) * 25}%`
                  : `${Math.min(currentStage, 4) * 25}%`,
              }}
            ></div>

            <div className="flex justify-between items-start relative z-10">
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
                    className="flex flex-col items-center cursor-pointer group"
                  >
                    {isFailed ? (
                      <div className="h-9 w-9 rounded-full bg-rose-500 flex items-center justify-center text-white ring-4 ring-white shadow-sm transition-transform group-hover:scale-110">
                        <XCircle className="h-5 w-5" />
                      </div>
                    ) : isCompleted ? (
                      <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white ring-4 ring-white shadow-sm transition-transform group-hover:scale-110">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center text-slate-400 ring-4 ring-white shadow-xs transition-all group-hover:border-blue-400 group-hover:bg-blue-50">
                        <Circle className="h-3.5 w-3.5" />
                      </div>
                    )}

                    <div className="flex flex-col items-center mt-2">
                      <span
                        className={`text-xs font-bold transition-colors ${
                          isFailed
                            ? "text-rose-600"
                            : isCompleted
                            ? "text-slate-900"
                            : "text-slate-400 group-hover:text-blue-600"
                        }`}
                      >
                        {stage.label}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-0.5 bg-blue-100/80 px-2 py-0.5 rounded-full">
                          Current Stage
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Responsive Pill Stepper */}
          <div className="sm:hidden flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              {STATUS_STAGES.map((stage, index) => {
                let isCompleted = index <= currentStage;
                let isCurrent = index === currentStage && !isRejected;

                return (
                  <button
                    key={stage.id}
                    onClick={() => handleStageClick(stage.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                      isCurrent
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : isCompleted
                        ? "bg-blue-50 text-blue-900 border-blue-200"
                        : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <CheckCircle2 className={`h-3.5 w-3.5 ${isCurrent ? "text-white" : "text-blue-600"}`} />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-slate-300" />
                      )}
                      <span>{stage.label}</span>
                    </div>
                    {isCurrent && (
                      <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {children}
      </div>

      <CandidateProfileModal isOpen={modalOpen} onClose={() => setModalOpen(false)} user={applicant} />
    </motion.div>
  );
};

export default ApplicantCard;

