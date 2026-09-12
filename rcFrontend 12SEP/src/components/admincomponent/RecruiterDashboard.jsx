import React from "react";
import { motion } from "framer-motion";
import { BriefcaseBusiness, Building2, ClipboardList, PlusCircle, TrendingUp, Users, Eye, ArrowRight, Sparkles, MessageSquare, Video, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../components_lite/Navbar";
import useGetAllAdminJobs from "@/hooks/useGetAllJAdminobs";
import { getFileUrl } from "@/utils/data";
import useGetAllCompanies from "@/hooks/usegetAllCompanies";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const RecruiterDashboard = () => {
  useGetAllAdminJobs();
  useGetAllCompanies();

  const { user } = useSelector((store) => store.auth);
  const { allAdminJobs } = useSelector((store) => store.job);
  const { companies } = useSelector((store) => store.company);

  const profilePhoto = user?.profilePhoto
    ? getFileUrl(user.profilePhoto)
    : "/default-avatar.svg";

  const statCards = [
    { title: "Posted Jobs", value: allAdminJobs?.length || 0, icon: BriefcaseBusiness, gradient: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-200", to: "/recruiter/jobs" },
    { title: "Total Applicants", value: allAdminJobs?.reduce((acc, j) => acc + (j.applications?.length || 0), 0), icon: Users, gradient: "from-orange-500 to-amber-500", shadow: "shadow-orange-200", to: "/recruiter/applications" },
    { title: "Active Jobs", value: allAdminJobs?.filter((j) => j.status !== "closed").length || 0, icon: TrendingUp, gradient: "from-sky-500 to-cyan-500", shadow: "shadow-sky-200", to: "/recruiter/jobs" },
    { title: "My Companies", value: companies?.length || 0, icon: Building2, gradient: "from-blue-500 to-indigo-500", shadow: "shadow-blue-200", to: "/recruiter/companies" },
  ];

  const quickActions = [
    { title: "My Profile", desc: "View registered details", icon: Sparkles, to: "/recruiter/profile", gradient: "from-blue-600 to-indigo-600" },
    { title: "Post New Job", desc: "Create a new job listing", icon: PlusCircle, to: "/recruiter/jobs/create", gradient: "from-emerald-600 to-teal-600" },
    { title: "Find Candidates", desc: "AI JD search & smart filters", icon: Users, to: "/recruiter/find-candidates", gradient: "from-violet-500 to-indigo-600" },
    { title: "JD Maker", desc: "AI-draft a professional job description PDF", icon: Sparkles, to: "/recruiter/jd-maker", gradient: "from-fuchsia-500 to-purple-600" },
    { title: "Chats", desc: "Candidate requests & admin support", icon: MessageSquare, to: "/recruiter/chats", gradient: "from-violet-500 to-fuchsia-600" },
    { title: "Manage Applications", desc: "Review & shortlist candidates", icon: ClipboardList, to: "/recruiter/applications", gradient: "from-rose-500 to-orange-500" },
      { title: "AI Video Interviews", desc: "Send & review video interviews", icon: Video, to: "/recruiter/interviews", gradient: "from-teal-600 to-cyan-600" },
    { title: "View All Jobs", desc: "Manage your job postings", icon: Eye, to: "/recruiter/jobs", gradient: "from-sky-500 to-cyan-500" },
    { title: "Mass Workforce", desc: "Submit bulk staffing requests", icon: Truck, to: "/recruiter/mass-workforce", gradient: "from-blue-600 to-cyan-600" },
    { title: "Complaints", desc: "File & track your complaints", icon: ClipboardList, to: "/recruiter/complaints", gradient: "from-amber-500 to-orange-600" },
  ];


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-8 text-white shadow-2xl dark:shadow-none mb-8"
        >
          <motion.div
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none"
          />
          <motion.div
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 7, repeat: Infinity, delay: 1 }}
            className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none"
          />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={profilePhoto || "/default-avatar.svg"}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/default-avatar.svg"; }}
                alt={user?.fullname}
                className="h-20 w-20 rounded-2xl border-4 border-white/30 object-cover shadow-xl"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold">Employer Panel</span>
                </div>
                <h1 className="text-2xl font-black">Welcome, {user?.fullname}</h1>
                <p className="text-white/70 text-sm mt-1 font-display">Manage your hiring pipeline from one place</p>
              </div>
            </div>
            <Link to="/recruiter/jobs/create">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-emerald-700 shadow-lg hover:shadow-xl transition-all"
              >
                <PlusCircle className="h-4 w-4" /> Post New Job
              </motion.button>
            </Link>
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
            <motion.div key={card.title} variants={itemVariants}>
              <Link to={card.to}>
                <motion.div
                  whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
                  className={`rounded-2xl bg-gradient-to-br ${card.gradient} p-5 text-white shadow-lg transition-all duration-300 cursor-pointer`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                      <card.icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 opacity-60" />
                  </div>
                  <p className="text-4xl font-black">{card.value}</p>
                  <p className="text-sm font-medium opacity-80 mt-1">{card.title}</p>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="font-bold text-slate-900 dark:text-white text-xl mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" /> Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, i) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  to={action.to}
                  className="flex flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 p-5 text-white border border-blue-900/50 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-cyan-400 border border-white/10">
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-extrabold text-white text-base">{action.title}</p>
                    <p className="text-xs text-blue-200/80 mt-1 leading-normal font-display">{action.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Jobs */}
        {allAdminJobs?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl dark:shadow-none"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-900 dark:text-white text-lg">Recent Job Postings</h2>
              <Link to="/recruiter/jobs" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {allAdminJobs.slice(0, 5).map((job, i) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.07 }}
                  className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-950/60 p-3 hover:bg-blue-50 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-black text-sm">
                      {(job.title || "J")[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{job.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-display">{job.company?.name} • {job.applications?.length || 0} applicants</p>
                    </div>
                  </div>
                  <Link to={`/recruiter/jobs/${job._id}/applicants`}>
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/50 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors">
                      View
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;

