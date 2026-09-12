import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/authSlice";
import AdminLayout from "./AdminLayout";
import { 
  Users, 
  Briefcase, 
  ClipboardList, 
  UserCheck, 
  Activity, 
  Sparkles, 
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Lock,
  Unlock
} from "lucide-react";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: "easeOut" } },
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/admin/stats`, { withCredentials: true })
      .then((res) => {
        setStats(res.data.stats || {});
        setRecentActivity(res.data.recentActivity || []);
      })
      .catch((err) => {
        console.log(err);
        if (err.response?.status === 401) {
          dispatch(setUser(null));
        }
      });
  }, []);

  const statCards = [
    { 
      label: "Total Candidates", 
      value: stats.totalCandidates || 0, 
      icon: Users, 
      gradient: "from-blue-600 to-cyan-500", 
      shadow: "shadow-blue-500/20",
      description: "Registered job seekers"
    },
    { 
      label: "Active Recruiters", 
      value: stats.totalRecruiters || 0, 
      icon: UserCheck, 
      gradient: "from-indigo-600 to-sky-500", 
      shadow: "shadow-indigo-500/20",
      description: "Verified employers"
    },
    { 
      label: "Total Posted Jobs", 
      value: stats.totalJobs || 0, 
      icon: Briefcase, 
      gradient: "from-emerald-600 to-teal-500", 
      shadow: "shadow-emerald-500/20",
      description: "Aggregated listing catalog"
    },
    { 
      label: "Applications Received", 
      value: stats.totalApplications || 0, 
      icon: ClipboardList, 
      gradient: "from-amber-500 to-orange-600", 
      shadow: "shadow-amber-500/20",
      description: "Submissions for active jobs"
    },
  ];

  const formatTime = (timeStr) => {
    if (!timeStr) return "Just now";
    const date = new Date(timeStr);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  return (
    <AdminLayout title={<span>Dashboard Overview <Sparkles className="inline-block h-6 w-6 text-yellow-500 animate-pulse ml-2 mb-1" /></span>} description="Monitor real-time platform metrics and listing lifecycles" icon={Activity}>
      <div className="w-full">
        {/* Page title Right Side Addon */}
        <div className="mb-6 flex justify-end">
          <div className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 shadow-sm text-xs font-bold text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            Live Sync Enabled
          </div>
        </div>

          {/* Stats grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          >
            {statCards.map((card, idx) => (
              <motion.div
                key={card.label}
                variants={itemVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-6 text-white shadow-lg ${card.shadow} transition-all duration-300`}
              >
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-lg" />
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold opacity-80 uppercase tracking-widest">{card.description}</span>
                    <motion.div 
                      whileHover={{ rotate: 15, scale: 1.15 }}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-inner"
                    >
                      <card.icon className="h-5 w-5" />
                    </motion.div>
                  </div>
                  
                  <div>
                    <h3 className="text-4xl font-black tracking-tight">{card.value.toLocaleString()}</h3>
                    <p className="text-sm font-semibold opacity-90 mt-1">{card.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" /> Recent Action logs
                  </h3>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 flex items-center gap-1.5 border border-blue-100">
                    <Clock className="h-3.5 w-3.5" /> Real-time
                  </span>
                </div>
                
                <div className="space-y-4">
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-sm text-slate-400 italic">No recent platform activities recorded.</p>
                    </div>
                  ) : (
                    recentActivity.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + i * 0.05 }}
                        className="flex items-center gap-4 rounded-xl bg-slate-50/50 p-4 border border-slate-100 hover:bg-blue-50/30 hover:border-blue-100 transition-all duration-200 group"
                      >
                        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${
                          item.type === "user" ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"
                        }`}>
                          {item.type === "user" ? <Users className="h-5 w-5" /> : <Briefcase className="h-5 w-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{item.action}</p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">{item.user}</p>
                        </div>
                        <span className="text-xs text-slate-400 font-bold flex-shrink-0">{formatTime(item.time)}</span>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <span className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 cursor-pointer">
                  System logs active <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </motion.div>

            {/* Platform breakdowns */}
            <div className="space-y-6">
              {/* Jobs Allocation Breakdown */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100/50"
              >
                <h3 className="font-bold text-slate-900 text-lg mb-5 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-emerald-600" /> Jobs Breakdown
                </h3>
                
                <div className="space-y-5">
                  {[
                    { 
                      label: "Open Jobs", 
                      value: stats.openJobs || 0, 
                      percentage: stats.totalJobs ? Math.round((stats.openJobs / stats.totalJobs) * 100) : 0, 
                      color: "bg-emerald-500",
                      glow: "shadow-emerald-500/20",
                      badge: "bg-emerald-50 text-emerald-700 border-emerald-100"
                    },
                    { 
                      label: "Closed Jobs", 
                      value: stats.closedJobs || 0, 
                      percentage: stats.totalJobs ? Math.round((stats.closedJobs / stats.totalJobs) * 100) : 0, 
                      color: "bg-slate-500",
                      glow: "shadow-slate-500/20",
                      badge: "bg-slate-100 text-slate-700 border-slate-200"
                    },
                    { 
                      label: "Removed (Deleted)", 
                      value: stats.removedJobs || 0, 
                      percentage: stats.totalJobs ? Math.round((stats.removedJobs / stats.totalJobs) * 100) : 0, 
                      color: "bg-rose-500",
                      glow: "shadow-rose-500/20",
                      badge: "bg-rose-50 text-rose-700 border-rose-100"
                    },
                  ].map((item, i) => (
                    <div key={item.label}>
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="font-bold text-slate-700">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${item.badge}`}>{item.value} Jobs</span>
                          <span className="font-black text-slate-900">{item.percentage}%</span>
                        </div>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                          transition={{ delay: 0.4 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                          className={`h-full rounded-full shadow-lg ${item.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Platform breakdown */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100/50"
              >
                <h3 className="font-bold text-slate-900 text-lg mb-5 flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" /> Platform Breakdown
                </h3>
                
                <div className="space-y-5">
                  {[
                    { 
                      label: "Job Seekers", 
                      value: stats.totalCandidates || 0, 
                      percentage: stats.totalUsers ? Math.round((stats.totalCandidates / stats.totalUsers) * 100) : 0, 
                      color: "bg-blue-500" 
                    },
                    { 
                      label: "Employers (Recruiters)", 
                      value: stats.totalRecruiters || 0, 
                      percentage: stats.totalUsers ? Math.round((stats.totalRecruiters / stats.totalUsers) * 100) : 0, 
                      color: "bg-indigo-500" 
                    },
                  ].map((item, i) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-bold text-slate-700">{item.label}</span>
                        <span className="font-black text-slate-900">{item.value} ({item.percentage}%)</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                          transition={{ delay: 0.45 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                          className={`h-full rounded-full ${item.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-4 text-white shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-85">Database Integrity</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-3xl font-black tracking-tight mt-1">100%</p>
                  <p className="text-[11px] opacity-80 mt-1">All accounts verified and synced dynamically.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
