import React, { useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components_lite/Navbar";
import { LayoutDashboard, Users, Briefcase, TrendingUp, Clock, CheckCircle2, XCircle, Calendar, Target, Zap, ArrowUpRight, Activity, Award } from "lucide-react";

const stats = [
  { label:"Open Positions", value:24, change:"+3", icon:Briefcase, color:"from-blue-500 to-cyan-600", shadow:"shadow-blue-500/20" },
  { label:"Active Candidates", value:186, change:"+28", icon:Users, color:"from-emerald-500 to-teal-500", shadow:"shadow-emerald-500/20" },
  { label:"Interviews Today", value:8, change:"+2", icon:Calendar, color:"from-orange-500 to-amber-500", shadow:"shadow-orange-500/20" },
  { label:"Offers Pending", value:5, change:"-1", icon:Target, color:"from-sky-500 to-cyan-500", shadow:"shadow-sky-500/20" },
];

const pipeline = [
  { stage:"Applied", count:186, color:"bg-blue-500", pct:100 },
  { stage:"Screened", count:124, color:"bg-blue-500", pct:67 },
  { stage:"Interview", count:56, color:"bg-emerald-500", pct:30 },
  { stage:"Offer", count:18, color:"bg-orange-500", pct:10 },
  { stage:"Hired", count:9, color:"bg-rose-500", pct:5 },
];

const todayInterviews = [
  { name:"Rahul Sharma", role:"Senior React Dev", time:"10:00 AM", status:"confirmed", avatar:"RS" },
  { name:"Priya Mehta", role:"Data Scientist", time:"11:30 AM", status:"confirmed", avatar:"PM" },
  { name:"Amit Kumar", role:"DevOps Engineer", time:"2:00 PM", status:"pending", avatar:"AK" },
  { name:"Sneha Patel", role:"UI/UX Designer", time:"3:30 PM", status:"confirmed", avatar:"SP" },
  { name:"Vikram Singh", role:"Product Manager", time:"5:00 PM", status:"rescheduled", avatar:"VS" },
];

const recentActivity = [
  { action:"Offer sent to", name:"Ananya Roy", role:"Full Stack Dev", time:"5 min ago", type:"offer" },
  { action:"Interview scheduled with", name:"Karan Malhotra", role:"Backend Dev", time:"20 min ago", type:"interview" },
  { action:"Application rejected for", name:"Ravi Gupta", role:"QA Engineer", time:"1 hr ago", type:"reject" },
  { action:"New application from", name:"Divya Nair", role:"React Developer", time:"2 hrs ago", type:"apply" },
];

const HrDashboardPage = () => {
  const { user } = useSelector((store) => store.auth);
  const recruiterName = user?.fullname || "Recruiter";
  const companyName =
    user?.company ||
    user?.profile?.companyName ||
    user?.profile?.company?.name ||
    "Your Company";
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const [activeView, setActiveView] = useState("overview");

  const views = [
    { key:"overview", label:"Overview", icon:LayoutDashboard },
    { key:"pipeline", label:"Pipeline", icon:TrendingUp },
    { key:"interviews", label:"Interviews", icon:Calendar },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-950 to-blue-950">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden py-12 px-4">
        <motion.div animate={{ /* scale animation removed to prevent layout growth */ opacity:[0.2,0.4,0.2] }} transition={{ duration:6, repeat:Infinity }} className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-cyan-600/20 blur-3xl" />
        <motion.div animate={{ /* scale animation removed to prevent layout growth */ opacity:[0.15,0.3,0.15] }} transition={{ duration:8, repeat:Infinity, delay:1 }} className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
                  <LayoutDashboard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white">HR Dashboard</h1>
                  <p className="text-slate-400 text-sm">{recruiterName} • {companyName} • {today}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-1.5">
              {views.map(v => (
                <motion.button key={v.key} onClick={() => setActiveView(v.key)} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${activeView===v.key ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}>
                  <v.icon className="h-3.5 w-3.5" />{v.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16">
        {/* Stats */}
        <motion.div
          variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.1 } } }}
          initial="hidden" animate="visible"
          className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8"
        >
          {stats.map(s => (
            <motion.div key={s.label} variants={{ hidden:{ opacity:0, y:20 }, visible:{ opacity:1, y:0 } }} whileHover={{ y:-5, scale:1.02 }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.color} p-5 text-white shadow-lg ${s.shadow} transition-all`}>
              <motion.div animate={{ /* scale animation removed to prevent layout growth */ opacity:[0.2,0.35,0.2] }} transition={{ duration:4, repeat:Infinity }}
                className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/20 blur-xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${s.change.startsWith("+") ? "bg-white/20" : "bg-black/20"}`}>{s.change}</span>
                </div>
                <p className="text-3xl font-black">{s.value}</p>
                <p className="text-xs font-semibold opacity-80 mt-1">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {activeView === "overview" && (
            <motion.div key="overview" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }} className="grid gap-6 lg:grid-cols-2">
              {/* Recent Activity */}
              <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <h3 className="text-lg font-black text-white mb-5 flex items-center gap-2"><Activity className="h-5 w-5 text-cyan-400" /> Recent Activity</h3>
                <div className="space-y-3">
                  {recentActivity.map((a, i) => (
                    <motion.div key={i} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.08 }} whileHover={{ x:4 }}
                      className="flex items-center gap-3 rounded-xl bg-white/5 p-3 hover:bg-white/10 transition-all">
                      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
                        a.type==="offer" ? "bg-emerald-500/20 text-emerald-400" :
                        a.type==="interview" ? "bg-blue-500/20 text-blue-400" :
                        a.type==="reject" ? "bg-rose-500/20 text-rose-400" :
                        "bg-blue-500/20 text-blue-400"
                      }`}>
                        {a.type==="offer" ? <Award className="h-4 w-4" /> : a.type==="interview" ? <Calendar className="h-4 w-4" /> : a.type==="reject" ? <XCircle className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-300"><span className="text-slate-400">{a.action}</span> <span className="font-bold text-white">{a.name}</span></p>
                        <p className="text-xs text-slate-500">{a.role} • {a.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Quick metrics */}
              <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <h3 className="text-lg font-black text-white mb-5 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-blue-400" /> This Week</h3>
                <div className="space-y-4">
                  {[{label:"Applications Received",val:47,max:60,color:"bg-blue-500"},{label:"Interviews Conducted",val:23,max:30,color:"bg-emerald-500"},{label:"Offers Extended",val:8,max:10,color:"bg-orange-500"},{label:"Positions Filled",val:5,max:8,color:"bg-sky-500"}].map((m,i) => (
                    <div key={m.label}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-slate-300 font-semibold">{m.label}</span>
                        <span className="text-white font-black">{m.val}/{m.max}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                        <motion.div initial={{ width:0 }} animate={{ width:`${(m.val/m.max)*100}%` }} transition={{ delay:0.3+i*0.1, duration:0.8, ease:"easeOut" }}
                          className={`h-full rounded-full ${m.color}`} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {[{val:"87%",label:"Fill Rate"},{val:"4.2d",label:"Avg Time"},{val:"94%",label:"Acceptance"}].map(s => (
                    <div key={s.label} className="rounded-xl bg-white/5 p-3 text-center">
                      <p className="text-lg font-black text-cyan-400">{s.val}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeView === "pipeline" && (
            <motion.div key="pipeline" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
              <h3 className="text-lg font-black text-white mb-6">Hiring Pipeline for {companyName}</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 mb-8">
                {pipeline.map((s,i) => (
                  <motion.div key={s.stage} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.1 }} whileHover={{ y:-5, scale:1.05 }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center hover:border-cyan-500/30 transition-all">
                    <div className={`h-3 w-3 rounded-full ${s.color} mx-auto mb-2`} />
                    <p className="text-2xl font-black text-white">{s.count}</p>
                    <p className="text-xs text-slate-400 mt-1">{s.stage}</p>
                  </motion.div>
                ))}
              </div>
              <div className="space-y-3">
                {pipeline.map((s,i) => (
                  <div key={s.stage}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300 font-semibold">{s.stage}</span>
                      <span className="text-white font-black">{s.count} candidates</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                      <motion.div initial={{ width:0 }} animate={{ width:`${s.pct}%` }} transition={{ delay:0.3+i*0.1, duration:0.8, ease:"easeOut" }}
                        className={`h-full rounded-full ${s.color}`} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeView === "interviews" && (
            <motion.div key="interviews" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
              <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2"><Calendar className="h-5 w-5 text-cyan-400" /> Today's Interviews</h3>
              <div className="space-y-3">
                {todayInterviews.map((iv, i) => (
                  <motion.div key={i} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.1 }} whileHover={{ x:4 }}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 hover:border-cyan-500/30 transition-all">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-black shadow-md">
                      {iv.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white">{iv.name}</p>
                      <p className="text-xs text-slate-400">{iv.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-cyan-400" />{iv.time}</p>
                      <span className={`text-xs font-bold rounded-full px-2.5 py-0.5 ${
                        iv.status==="confirmed" ? "bg-emerald-500/20 text-emerald-400" :
                        iv.status==="pending" ? "bg-amber-500/20 text-amber-400" :
                        "bg-rose-500/20 text-rose-400"
                      }`}>{iv.status}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HrDashboardPage;
