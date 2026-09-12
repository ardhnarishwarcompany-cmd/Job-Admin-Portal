import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Bookmark, BookmarkCheck, MapPin, Clock, DollarSign, ArrowRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { USER_API_ENDPOINT } from "@/utils/data";
import { toggleSavedJobId } from "@/redux/jobSlice";
import { toast } from "sonner";

const Job1 = ({ job }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { savedJobIds } = useSelector((store) => store.job);
  const { user } = useSelector((store) => store.auth);
  const jobId = job?._id || job?.id;
  const isSaved = savedJobIds?.includes(String(jobId));

  const handleToggleSave = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to save jobs");
      return;
    }
    try {
      const res = await axios.post(`${USER_API_ENDPOINT}/saved-jobs/${jobId}`, {}, {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(toggleSavedJobId(jobId));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const daysAgoFunction = (mongodbTime) => {
    const diff = new Date() - new Date(mongodbTime);
    const days = Math.floor(diff / (1000 * 24 * 60 * 60));
    return days === 0 ? "Today" : `${days} days ago`;
  };

  const gradients = [
    "from-blue-500 to-cyan-600",
    "from-pink-500 to-rose-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-amber-500",
    "from-blue-500 to-cyan-500",
  ];
  const gradient = gradients[(job?.title?.charCodeAt(0) || 0) % gradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(109,40,217,0.12)" }}
      transition={{ duration: 0.25 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-md hover:border-blue-300 transition-all duration-300"
    >
      {/* Accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />

      {/* Header row */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3 w-3" />
            {daysAgoFunction(job?.createdAt)}
          </span>
          {job?.status === "closed" && (
            <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 uppercase tracking-wider">Closed</span>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleToggleSave}
          className={`rounded-full p-1.5 transition-colors ${isSaved ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-500"}`}
        >
          {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </motion.button>
      </div>

      {/* Company */}
      <div className="flex items-center gap-3 mt-3">
        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-md overflow-hidden`}>
          {job?.company?.logo ? (
            <Avatar className="h-11 w-11">
              <AvatarImage src={job.company.logo} alt={job.company.name} />
            </Avatar>
          ) : (
            <span className="text-white font-black text-lg">{(job?.company?.name || "C")[0]}</span>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-slate-900 truncate">{job?.company?.name || "Top Company"}</h3>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin className="h-3 w-3" /> India
          </p>
        </div>
      </div>

      {/* Title & description */}
      <div className="mt-4">
        <h2 className="font-black text-lg text-slate-900 group-hover:text-blue-700 transition-colors leading-tight">{job?.title}</h2>
        <p className="mt-2 text-sm text-slate-500 line-clamp-2 leading-relaxed">{job?.description}</p>
      </div>

      {/* Badges */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          {job?.position} Positions
        </span>
        <span className="rounded-full bg-orange-50 border border-orange-100 px-3 py-1 text-xs font-semibold text-orange-600 flex items-center gap-1">
          <DollarSign className="h-3 w-3" />{job?.salary}{String(job?.salary || "").toLowerCase().includes("lpa") ? "" : " LPA"}
        </span>
        <span className="rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          {(() => {
            let details = {};
            try { details = typeof job.jobDetails === "string" ? JSON.parse(job.jobDetails) : (job.jobDetails || {}); } catch(e){}
            return details.employmentType || job.jobType || "Full-Time";
          })()}
        </span>
      </div>

      {/* Actions */}
      <div className="mt-5 flex gap-3">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            if (!user) {
              navigate("/login");
            } else {
              navigate(`/description/${jobId}`);
            }
          }}
          className="flex-1 rounded-xl border border-slate-200 bg-white py-2 text-sm font-bold text-slate-700 hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
        >
          View Details
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleToggleSave}
          className={`flex-1 rounded-xl py-2 text-sm font-bold transition-all duration-200 ${
            isSaved
              ? "bg-blue-100 text-blue-700 border border-blue-200"
              : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md hover:shadow-blue-200"
          }`}
        >
          {isSaved ? "Saved ✓" : "Save Job"}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Job1;
