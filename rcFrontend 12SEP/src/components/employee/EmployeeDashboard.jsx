import React, { useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components_lite/Navbar";
import { useSelector, useDispatch } from "react-redux";
import { getFileUrl, APPLICATION_API_ENDPOINT, USER_API_ENDPOINT } from "@/utils/data";
import { Building2, Briefcase, CheckCircle2, XCircle, TrendingUp, Clock, Star, ArrowRight, User, Heart, Calendar, MailOpen, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { setAllAppliedJobs, setSavedJobs } from "@/redux/jobSlice";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const ApplicationPipeline = ({ app }) => {
  const status = app?.status?.toLowerCase() || "pending";
  const interviewConfirmed = app?.interviewStatus === "confirmed";

  let activeIndex = 0; // Applied
  if (status === "shortlisted") activeIndex = 1;
  else if (interviewConfirmed || app?.interviewStatus === "requested") activeIndex = 2;
  else if (status === "accepted" || status === "selected") activeIndex = 3;
  else if (status === "joined") activeIndex = 4;

  const steps = ["Applied", "Shortlisted", "Interview", "Selected", "Joined"];

  return (
    <div className="mt-4 border-t border-slate-100 dark:border-slate-800/60 pt-4">
      <p className="text-[11px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-2.5">Application Status Pipeline</p>
      {status === "rejected" ? (
        <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 px-3 py-2 rounded-xl">
          <span className="h-2 w-2 rounded-full bg-rose-600" />
          Application Declined
        </div>
      ) : (
        <div className="flex items-center justify-between relative mt-2 px-1">
          {/* Progress bar background line */}
          <div className="absolute top-[9px] left-2 right-2 h-0.5 bg-slate-200 dark:bg-slate-800 -z-10" />
          
          {/* Active progress line */}
          <div 
            className="absolute top-[9px] left-2 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 -z-10 transition-all duration-500" 
            style={{ width: `${(activeIndex / (steps.length - 1)) * 95}%` }}
          />

          {steps.map((step, idx) => {
            const completed = idx <= activeIndex;
            const current = idx === activeIndex;
            return (
              <div key={step} className="flex flex-col items-center">
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold border-2 transition-all ${
                  completed 
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-650"
                }`}>
                  {completed ? "✓" : idx + 1}
                </span>
                <span className={`text-[10px] mt-1 font-bold ${
                  current 
                    ? "text-blue-600 dark:text-blue-400 font-extrabold" 
                    : completed 
                    ? "text-slate-700 dark:text-slate-350" 
                    : "text-slate-400 dark:text-slate-500"
                }`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const EmployeeDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const { allAppliedJobs, savedJobs } = useSelector((store) => store.job);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const appliedRes = await axios.get(`${APPLICATION_API_ENDPOINT}/get`, { withCredentials: true });
        if (appliedRes.data.success) {
          dispatch(setAllAppliedJobs(appliedRes.data.application));
        }
        const savedRes = await axios.get(`${USER_API_ENDPOINT}/saved-jobs`, { withCredentials: true });
        if (savedRes.data.success) {
          dispatch(setSavedJobs(savedRes.data.savedJobs));
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };
    if (user) {
      fetchDashboardData();
    }
  }, [user, dispatch]);

  const profilePhoto = user?.profilePhoto
    ? getFileUrl(user.profilePhoto)
    : "/default-avatar.svg";

  const stats = useMemo(() => {
    const totalApplied = allAppliedJobs?.length || 0;
    const totalShortlisted = allAppliedJobs?.filter((item) => item?.status === "accepted" || item?.status === "selected" || item?.status === "shortlisted").length || 0;
    const totalSaved = savedJobs?.length || 0;
    const recruitersReached = new Set(allAppliedJobs?.map((item) => item?.job?.company?._id).filter(Boolean)).size;
    return { totalApplied, totalShortlisted, totalSaved, recruitersReached };
  }, [allAppliedJobs, savedJobs]);

  const profileCompletion = useMemo(() => {
    let score = 0;
    if (user?.fullname) score += 15;
    if (user?.email) score += 10;
    if (user?.phoneNumber) score += 10;
    if (user?.profilePhoto || user?.profile?.profilePhoto) score += 10;
    if (user?.profile?.bio || user?.bio) score += 10;
    if (user?.skills || user?.profile?.skills) score += 15;
    if (user?.experience || user?.profile?.experience) score += 15;
    if (user?.resume || user?.profile?.resume) score += 15;
    return Math.min(100, score);
  }, [user]);

  const upcomingInterviews = useMemo(() => {
    return allAppliedJobs?.filter((app) => 
      app?.interviewDate && 
      app?.interviewStatus && 
      app.interviewStatus !== "none"
    ) || [];
  }, [allAppliedJobs]);

  const activeOffers = useMemo(() => {
    return allAppliedJobs?.filter((app) => 
      app?.status && 
      ["accepted", "selected", "joined"].includes(app.status.toLowerCase())
    ) || [];
  }, [allAppliedJobs]);

  const statCards = [
    { label: "Jobs Applied", value: stats.totalApplied, icon: Briefcase, gradient: "from-blue-500 to-cyan-600", shadow: "shadow-blue-200" },
    { label: "Shortlisted", value: stats.totalShortlisted, icon: CheckCircle2, gradient: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-200" },
    { label: "Saved Jobs", value: stats.totalSaved, icon: Heart, gradient: "from-pink-500 to-rose-500", shadow: "shadow-pink-200" },
    { label: "Recruiters Reached", value: stats.recruitersReached, icon: Building2, gradient: "from-sky-500 to-cyan-500", shadow: "shadow-sky-200" },
  ];

  const recentJobs = allAppliedJobs?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-cyan-950 p-8 text-white shadow-2xl mb-8 border border-blue-900/40"
        >
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between z-10">
            <div className="flex items-center gap-5">
              <motion.div whileHover={{ scale: 1.05 }} className="relative">
                <img
                  src={profilePhoto || "/default-avatar.svg"}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/default-avatar.svg"; }}
                  alt={user?.fullname}
                  className="h-20 w-20 rounded-2xl border-4 border-white/30 object-cover shadow-xl"
                />
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 border-2 border-white">
                  <span className="h-2.5 w-2.5 rounded-full bg-white" />
                </span>
              </motion.div>
              <div>
                <p className="text-white/70 text-sm font-medium">Welcome back,</p>
                <h1 className="text-2xl font-black">{user?.fullname || "Candidate"}</h1>
                <p className="text-white/70 text-sm mt-1 font-display">{user?.profile?.bio || "Ready to find your dream job?"}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/profile">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/30 transition-all"
                >
                  Edit Profile
                </motion.button>
              </Link>
              <Link to="/jobs">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-blue-700 shadow-lg hover:shadow-xl transition-all"
                >
                  Find Jobs
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8"
        >
          {statCards.map((card) => (
            <motion.div
              key={card.label}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className={`rounded-2xl bg-gradient-to-br ${card.gradient} p-5 text-white shadow-lg transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <card.icon className="h-5 w-5" />
                </div>
                <TrendingUp className="h-4 w-4 opacity-60" />
              </div>
              <p className="text-4xl font-black">{card.value}</p>
              <p className="text-sm font-medium opacity-80 mt-1">{card.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Recruiter Messages Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to="/candidate/chats" className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-blue-600/10 to-cyan-600/10 border border-blue-500/20 px-6 py-4 hover:border-blue-500/40 transition-all">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">Recruiter Chats & Messages</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Click to view real-time chat threads and job requests from employers.</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </Link>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Analytics / Completion / Actions */}
          <div className="flex flex-col gap-6">
            {/* Profile Completion Gauge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl dark:shadow-none"
            >
              <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" /> Profile Strength
              </h2>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex items-center justify-center h-16 w-16">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" className="stroke-slate-100 dark:stroke-slate-800 fill-none" strokeWidth="6" />
                    <circle cx="32" cy="32" r="28" className="stroke-blue-600 fill-none transition-all duration-1000" strokeWidth="6"
                      strokeDasharray={176} strokeDashoffset={176 - (176 * profileCompletion) / 100} strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-sm font-black text-slate-800 dark:text-white">{profileCompletion}%</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {profileCompletion === 100 ? "Profile completed! 🌟" : "Improve your Profile"}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {profileCompletion < 50 ? "Add your experience and skills to get noticed by recruiters." :
                     profileCompletion < 80 ? "Upload resume and profile photo to boost applications." :
                     "Looking strong! Almost fully complete."}
                  </p>
                </div>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-1000" style={{ width: `${profileCompletion}%` }} />
              </div>
            </motion.div>

            {/* Offer Letters Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl dark:shadow-none"
            >
              <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-4 flex items-center gap-2">
                <MailOpen className="h-5 w-5 text-emerald-500" /> Offer Letters
              </h2>
              {activeOffers.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  <MailOpen className="h-10 w-10 mx-auto opacity-20 mb-2" />
                  <p className="text-xs font-semibold">No offer letters received yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeOffers.map((app) => (
                    <div key={app._id} className="rounded-xl border border-emerald-200/50 bg-emerald-50/20 dark:bg-emerald-950/10 p-3 flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{app.job?.title || "Job Offer"}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-0.5">{app.job?.company?.name || "Company"}</p>
                      </div>
                      <span className="rounded-lg bg-emerald-100 dark:bg-emerald-950/60 px-2 py-1 text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column: Applications & Schedules */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Scheduled Interviews Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl dark:shadow-none"
            >
              <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" /> Upcoming Interviews
              </h2>
              {upcomingInterviews.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Calendar className="h-10 w-10 mx-auto opacity-20 mb-2" />
                  <p className="text-xs font-semibold">No interviews scheduled yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingInterviews.map((app) => (
                    <div key={app._id} className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 p-4 hover:border-blue-400/40 transition-all">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{app.job?.title || "Interview Slot"}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{app.job?.company?.name || "Company"}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                          app.interviewStatus === "confirmed" 
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50" 
                            : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-250/50"
                        }`}>
                          {app.interviewStatus}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-xs font-bold text-slate-700 dark:text-slate-350">
                        <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-blue-500" />{app.interviewDay}, {app.interviewDate}</span>
                        <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-blue-500" />{app.interviewTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Recent Applications Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl dark:shadow-none"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" /> Recent Applications
                </h2>
                <Link to="/candidate/applied-jobs" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {recentJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Briefcase className="h-12 w-12 mb-3 opacity-30" />
                  <p className="font-semibold">No applications yet</p>
                  <Link to="/jobs" className="mt-3 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">Browse Jobs →</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentJobs.map((app, i) => (
                    <motion.div
                      key={app._id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.07 }}
                      className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 p-4 hover:bg-blue-50/20 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white font-black text-sm">
                            {(app?.job?.title || "J")[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white text-sm">{app?.job?.title || "Job"}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-display">{app?.job?.company?.name}</p>
                          </div>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                          app?.status === "accepted" || app?.status === "selected" || app?.status === "joined" ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400" :
                          app?.status === "rejected" ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400" :
                          "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-455"
                        }`}>
                          {app?.status || "pending"}
                        </span>
                      </div>
                      
                      <ApplicationPipeline app={app} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-2 gap-4 max-w-2xl"
        >
          {[
            { to: "/jobs", label: "Browse Jobs", icon: Briefcase },
            { to: "/cv-builder", label: "Build CV", icon: Star },
          ].map((action, i) => (
            <motion.div key={action.to} whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                to={action.to}
                className="flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 p-5 text-white border border-blue-900/50 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200"
              >
                <action.icon className="h-7 w-7 text-cyan-400" />
                <span className="text-sm font-bold text-center text-white">{action.label}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

