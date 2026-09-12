import React, { useMemo } from "react";
import { motion } from "framer-motion";
import Navbar from "../components_lite/Navbar";
import { useSelector } from "react-redux";
import { getFileUrl } from "@/utils/data";
import { Building2, Briefcase, CheckCircle2, XCircle, TrendingUp, Clock, Star, ArrowRight, User } from "lucide-react";
import { Link } from "react-router-dom";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const EmployeeDashboard = () => {
  const { user } = useSelector((store) => store.auth);
  const { allAppliedJobs } = useSelector((store) => store.job);

  const profilePhoto = user?.profile?.profilePhoto
    ? getFileUrl(user.profile.profilePhoto)
    : "/default.png";

  const stats = useMemo(() => {
    const totalApplied = allAppliedJobs?.length || 0;
    const totalShortlisted = allAppliedJobs?.filter((item) => item?.status === "accepted").length || 0;
    const totalRejected = allAppliedJobs?.filter((item) => item?.status === "rejected").length || 0;
    const recruitersReached = new Set(allAppliedJobs?.map((item) => item?.job?.company?._id).filter(Boolean)).size;
    return { totalApplied, totalShortlisted, totalRejected, recruitersReached };
  }, [allAppliedJobs]);

  const statCards = [
    { label: "Jobs Applied", value: stats.totalApplied, icon: Briefcase, gradient: "from-blue-500 to-cyan-600", shadow: "shadow-blue-200" },
    { label: "Shortlisted", value: stats.totalShortlisted, icon: CheckCircle2, gradient: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-200" },
    { label: "Rejected", value: stats.totalRejected, icon: XCircle, gradient: "from-rose-500 to-orange-500", shadow: "shadow-rose-200" },
    { label: "Recruiters Reached", value: stats.recruitersReached, icon: Building2, gradient: "from-sky-500 to-cyan-500", shadow: "shadow-sky-200" },
  ];

  const recentJobs = allAppliedJobs?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-700 p-8 text-white shadow-2xl shadow-blue-200 mb-8"
        >
          <motion.div
            animate={{ /* scale animation removed to prevent layout growth */ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"
          />
          <motion.div
            animate={{ /* scale animation removed to prevent layout growth */ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 7, repeat: Infinity, delay: 1 }}
            className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"
          />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <img
                  src={profilePhoto}
                  alt={user?.fullname}
                  className="h-20 w-20 rounded-2xl border-4 border-white/30 object-cover shadow-xl"
                />
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 border-2 border-white">
                  <span className="h-2 w-2 rounded-full bg-white" />
                </span>
              </motion.div>
              <div>
                <p className="text-white/70 text-sm font-medium">Welcome back,</p>
                <h1 className="text-2xl font-black">{user?.fullname || "Candidate"}</h1>
                <p className="text-white/70 text-sm mt-1">{user?.profile?.bio || "Ready to find your dream job?"}</p>
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
              whileHover={{ y: -5, boxShadow: `0 20px 40px rgba(0,0,0,0.1)` }}
              className={`rounded-2xl bg-gradient-to-br ${card.gradient} p-5 text-white shadow-lg ${card.shadow} transition-all duration-300`}
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

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100"
          >
            <h2 className="font-bold text-slate-900 text-lg mb-5 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" /> Profile Info
            </h2>
            <div className="space-y-4">
              {[
                { label: "Email", value: user?.email },
                { label: "Phone", value: user?.phoneNumber },
                { label: "Role", value: user?.role },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{item.label}</p>
                  <p className="font-semibold text-slate-900 mt-1 text-sm">{item.value || "Not set"}</p>
                </div>
              ))}
              {(() => {
                const skillsArray = typeof user?.skills === "string" 
                  ? user.skills.split(",").map(s => s.trim()).filter(Boolean)
                  : Array.isArray(user?.profile?.skills) 
                  ? user.profile.skills
                  : [];
                if (skillsArray.length === 0) return null;
                return (
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {skillsArray.slice(0, 6).map((skill, i) => (
                        <span key={i} className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">{skill}</span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.div>

          {/* Recent applications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" /> Recent Applications
              </h2>
              <Link to="/candidate/applied-jobs" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recentJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Briefcase className="h-12 w-12 mb-3 opacity-30" />
                <p className="font-semibold">No applications yet</p>
                <Link to="/jobs" className="mt-3 text-sm font-bold text-blue-600 hover:text-blue-800">Browse Jobs →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((app, i) => (
                  <motion.div
                    key={app._id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.07 }}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-3 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white font-black text-sm">
                        {(app?.job?.title || "J")[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{app?.job?.title || "Job"}</p>
                        <p className="text-xs text-slate-500">{app?.job?.company?.name}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      app?.status === "accepted" ? "bg-emerald-100 text-emerald-700" :
                      app?.status === "rejected" ? "bg-rose-100 text-rose-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {app?.status || "pending"}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {[
            { to: "/jobs", label: "Browse Jobs", icon: Briefcase, color: "from-blue-500 to-cyan-600" },
            { to: "/cv-builder", label: "Build CV", icon: Star, color: "from-emerald-500 to-teal-500" },
            { to: "/ai-job-matching", label: "AI Matching", icon: TrendingUp, color: "from-orange-500 to-amber-500" },
            { to: "/resume-scanner", label: "Scan Resume", icon: CheckCircle2, color: "from-sky-500 to-cyan-500" },
          ].map((action, i) => (
            <motion.div key={action.to} whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                to={action.to}
                className={`flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-br ${action.color} p-5 text-white shadow-lg hover:shadow-xl transition-all duration-200`}
              >
                <action.icon className="h-7 w-7" />
                <span className="text-sm font-bold text-center">{action.label}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

