import React, { useEffect, useState } from "react";
import axios from "axios";
import { APPLICATION_API_ENDPOINT } from "@/utils/data";
import Navbar from "../components_lite/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, Building2, MapPin, CheckCircle2, Circle, Clock, ChevronRight, XCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const STATUS_STAGES = [
  { id: "pending", label: "Applied" },
  { id: "reviewed", label: "Reviewed" },
  { id: "shortlisted", label: "Shortlisted" },
  { id: "interview", label: "Interview" },
  { id: "offered", label: "Offered" },
];

const CandidateAppliedJobs = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const res = await axios.get(`${APPLICATION_API_ENDPOINT}/get`, { withCredentials: true });
        if (res.data.success) {
          setApplications(res.data.application);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppliedJobs();
  }, []);

  const getStageIndex = (status) => {
    if (status === "hired" || status === "accepted") return 4;
    if (status === "rejected") return -1;
    const index = STATUS_STAGES.findIndex(s => s.id === status);
    return index === -1 ? 0 : index;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Your Applied Jobs</h1>
          <p className="text-slate-500 font-medium mt-1">Track the status of all your job applications</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="text-sm font-semibold text-slate-500">Loading your applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Briefcase className="h-16 w-16 mb-4 opacity-20" />
            <p className="font-semibold text-lg text-slate-600">No applications yet</p>
            <p className="text-sm mt-1 mb-6">You haven't applied to any jobs.</p>
            <button onClick={() => navigate("/")} className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {applications.map((app, i) => {
                const job = app.job;
                if (!job) return null;
                const currentStage = getStageIndex(app.status);
                const isRejected = app.status === "rejected";

                return (
                  <motion.div
                    key={app._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                      <div className="flex gap-4 cursor-pointer group" onClick={() => navigate(`/description/${job._id}`)}>
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-xl shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                          {(job.title || "J")[0]}
                        </div>
                        <div>
                          <h2 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</h2>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm font-medium text-slate-500">
                            <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" /> {job.company?.name || "Company"}</span>
                            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {job.location}</span>
                            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0">
                        {isRejected ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-bold text-rose-700">
                            <XCircle className="h-3.5 w-3.5" /> Rejected
                          </span>
                        ) : app.status === "hired" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Hired!
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700 uppercase tracking-wider">
                            In Progress
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="relative pt-2 pb-4 px-2 sm:px-6">
                      <div className="absolute top-5 left-6 right-6 h-0.5 bg-slate-100 hidden sm:block"></div>
                      <div className="absolute top-5 left-6 h-0.5 bg-blue-500 transition-all duration-1000 hidden sm:block" 
                           style={{ width: isRejected ? `${Math.max(0, currentStage) * 25}%` : `${Math.min(currentStage, 4) * 25}%` }}></div>
                      
                      <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-0 relative z-10">
                        {STATUS_STAGES.map((stage, index) => {
                          let isCompleted = index <= currentStage;
                          let isCurrent = index === currentStage && !isRejected;
                          let isFailed = isRejected && index === currentStage + 1; // Show fail on the next stage

                          if (isRejected && index > Math.max(0, currentStage)) {
                            isCompleted = false;
                          }

                          return (
                            <div key={stage.id} className="flex sm:flex-col items-center gap-3 sm:gap-2">
                              {isFailed ? (
                                <div className="h-7 w-7 rounded-full bg-rose-500 flex items-center justify-center text-white ring-4 ring-white shadow-sm z-10">
                                  <XCircle className="h-4 w-4" />
                                </div>
                              ) : isCompleted ? (
                                <div className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center text-white ring-4 ring-white shadow-sm z-10">
                                  <CheckCircle2 className="h-4 w-4" />
                                </div>
                              ) : (
                                <div className="h-7 w-7 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-400 ring-4 ring-white z-10">
                                  <Circle className="h-3 w-3" />
                                </div>
                              )}
                              
                              <div className="flex flex-col sm:items-center">
                                <span className={`text-xs font-bold ${isFailed ? 'text-rose-600' : isCompleted ? 'text-blue-900' : 'text-slate-400'}`}>
                                  {stage.label}
                                </span>
                                {isCurrent && <span className="text-[10px] font-bold text-blue-500 hidden sm:block mt-1 uppercase tracking-wider">Current</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateAppliedJobs;
