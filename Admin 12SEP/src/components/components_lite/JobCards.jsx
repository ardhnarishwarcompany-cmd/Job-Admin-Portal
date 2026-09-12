import React from "react";
import { motion } from "framer-motion";
import { Badge } from "../ui/badge";
import { useNavigate } from "react-router-dom";
import { MapPin, DollarSign, Clock, ArrowRight, Building2 } from "lucide-react";

const JobCards = ({ job }) => {
  const navigate = useNavigate();
  const jobId = job?._id || job?.id;

  const daysAgo = (mongodbTime) => {
    const diff = new Date() - new Date(mongodbTime);
    const days = Math.floor(diff / (1000 * 24 * 60 * 60));
    return days === 0 ? "Today" : `${days}d ago`;
  };

  const gradients = [
    "from-blue-500 to-cyan-600",
    "from-pink-500 to-rose-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-amber-500",
    "from-blue-500 to-cyan-500",
    "from-sky-500 to-blue-600",
  ];
  const gradient = gradients[job?.title?.length % gradients.length] || gradients[0];

  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(109,40,217,0.12)" }}
      transition={{ duration: 0.25 }}
      onClick={() => navigate(`/description/${jobId}`)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-md hover:border-blue-300 transition-all duration-300"
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} rounded-t-2xl`} />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mt-1">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-md`}>
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm leading-tight">{job.company?.name || "Top Company"}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" /> {job.location || "India"}
            </p>
          </div>
        </div>
        <span className="text-xs text-slate-400 flex items-center gap-1 flex-shrink-0">
          <Clock className="h-3 w-3" /> {daysAgo(job?.createdAt)}
        </span>
      </div>

      {/* Job title */}
      <div className="mt-4">
        <h2 className="font-black text-lg text-slate-900 leading-tight group-hover:text-blue-700 transition-colors">{job.title}</h2>
        <p className="mt-2 text-sm text-slate-500 line-clamp-2 leading-relaxed">{job.description}</p>
      </div>

      {/* Badges */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
          {job.position} Open
        </span>
        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 border border-orange-100 flex items-center gap-1">
          <DollarSign className="h-3 w-3" /> {job.salary}{String(job.salary || "").toLowerCase().includes("lpa") ? "" : " LPA"}
        </span>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
          {(() => {
            let details = {};
            try { details = typeof job.jobDetails === "string" ? JSON.parse(job.jobDetails) : (job.jobDetails || {}); } catch(e){}
            return details.employmentType || job.jobType || "Full-time";
          })()}
        </span>
      </div>

      {/* CTA */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-400">{job.experienceLevel || "0"} yrs exp</span>
        <motion.span
          whileHover={{ x: 4 }}
          className="flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:text-blue-800 transition-colors"
        >
          View Details <ArrowRight className="h-3.5 w-3.5" />
        </motion.span>
      </div>
    </motion.div>
  );
};

export default JobCards;
