import React, { useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components_lite/Navbar";
import { Users, Bot, Zap, Mail, MessageSquare, TrendingUp, CheckCircle2, Clock, Send, RefreshCw, Target, Sparkles } from "lucide-react";
import { toast } from "sonner";

const AiRecruiterPage = () => {
  const { user } = useSelector((store) => store.auth);
  const companyName =
    user?.company ||
    user?.profile?.companyName ||
    user?.profile?.company?.name ||
    user?.fullname ||
    "Your Company";
  const recruiterName = user?.fullname || "Recruiter";

  const pipeline = [
    { stage: "Sourced", count: 248, color: "from-blue-500 to-cyan-600", icon: Users },
    { stage: "Screened", count: 124, color: "from-blue-500 to-cyan-500", icon: Target },
    { stage: "Interviewed", count: 56, color: "from-emerald-500 to-teal-500", icon: MessageSquare },
    { stage: "Offered", count: 18, color: "from-orange-500 to-amber-500", icon: Mail },
    { stage: "Hired", count: 9, color: "from-rose-500 to-pink-500", icon: CheckCircle2 },
  ];

  const campaigns = [
    { id:1, name:`${companyName} - Senior React Dev`, status:"active", sent:142, opened:89, replied:34, scheduled:"Daily 10AM" },
    { id:2, name:`${companyName} - Data Scientist`, status:"active", sent:98, opened:67, replied:21, scheduled:"Mon/Wed/Fri" },
    { id:3, name:`${companyName} - DevOps Engineer`, status:"paused", sent:56, opened:31, replied:8, scheduled:"Paused" },
  ];

  const [activeTab, setActiveTab] = useState("pipeline");
  const [form, setForm] = useState({ role:"", profile:"", tone:"Professional", followup:"3" });
  const [generating, setGenerating] = useState(false);
  const [generatedMsg, setGeneratedMsg] = useState("");

  const handleGenerate = () => {
    if (!form.role.trim()) { toast.error("Enter a role name"); return; }
    setGenerating(true);
    setTimeout(() => {
      setGeneratedMsg(`Hi [Candidate Name],\n\nI came across your profile and was impressed by your experience in ${form.role}. We have an exciting opportunity at ${companyName} that aligns perfectly with your background.\n\nWe're looking for a talented ${form.role} to join our growing team. The role offers competitive compensation, remote flexibility, and the chance to work on cutting-edge projects.\n\nWould you be open to a quick 15-minute call this week to explore this further?\n\nBest regards,\n${recruiterName}\nTalent Acquisition Team`);
      setGenerating(false);
      toast.success("Message generated!");
    }, 1800);
  };

  const tabs = [
    { key:"pipeline", label:"Pipeline", icon:TrendingUp },
    { key:"campaigns", label:"Campaigns", icon:Mail },
    { key:"compose", label:"AI Compose", icon:Bot },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950">
      <Navbar />
      <div className="relative overflow-hidden py-14 px-4 text-center">
        <motion.div animate={{ /* scale animation removed to prevent layout growth */ opacity:[0.2,0.4,0.2] }} transition={{ duration:6, repeat:Infinity }} className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-emerald-600/20 blur-3xl" />
        <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} className="relative z-10">
          <motion.div animate={{ y:[0,-8,0] }} transition={{ duration:2.5, repeat:Infinity }} className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-2xl shadow-emerald-500/40 mb-6">
            <Users className="h-10 w-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-black text-white sm:text-5xl">AI <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Recruiter</span></h1>
          <p className="mt-3 text-slate-400 text-lg max-w-xl mx-auto">Personalized hiring automation for {companyName}</p>
          <p className="mt-2 text-slate-300 text-sm">Logged in as {recruiterName} • Recruiter access only</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {["10x Faster Hiring","Auto Follow-ups","Smart Screening","Pipeline Analytics"].map((tag,i) => (
              <motion.span key={tag} initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.3+i*0.1 }} className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-300">✦ {tag}</motion.span>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 rounded-2xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-xl w-fit mx-auto">
          {tabs.map(tab => (
            <motion.button key={tab.key} onClick={() => setActiveTab(tab.key)} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${activeTab===tab.key ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}>
              <tab.icon className="h-4 w-4" />{tab.label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "pipeline" && (
            <motion.div key="pipeline" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 mb-8">
                {pipeline.map((stage, i) => (
                  <motion.div key={stage.stage} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.1 }} whileHover={{ y:-5, scale:1.03 }}
                    className={`rounded-2xl bg-gradient-to-br ${stage.color} p-5 text-white shadow-lg text-center`}>
                    <stage.icon className="h-6 w-6 mx-auto mb-2 opacity-80" />
                    <p className="text-3xl font-black">{stage.count}</p>
                    <p className="text-xs font-semibold opacity-80 mt-1">{stage.stage}</p>
                  </motion.div>
                ))}
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <h3 className="text-lg font-black text-white mb-4">Conversion Funnel</h3>
                {pipeline.map((stage, i) => (
                  <div key={stage.stage} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300 font-semibold">{stage.stage}</span>
                      <span className="text-white font-black">{stage.count}</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                      <motion.div initial={{ width:0 }} animate={{ width:`${(stage.count/248)*100}%` }} transition={{ delay:0.3+i*0.1, duration:0.8, ease:"easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${stage.color}`} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "campaigns" && (
            <motion.div key="campaigns" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }} className="space-y-4">
              {campaigns.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.1 }} whileHover={{ x:4 }}
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 hover:border-emerald-500/30 transition-all">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-black text-white">{c.name}</h3>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${c.status==="active" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-500/20 text-slate-400 border border-slate-500/30"}`}>
                          {c.status==="active" ? "🟢 Active" : "⏸ Paused"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1"><Clock className="h-3 w-3" />{c.scheduled}</p>
                    </div>
                    <div className="flex gap-4">
                      {[{label:"Sent",val:c.sent,color:"text-blue-400"},{label:"Opened",val:c.opened,color:"text-emerald-400"},{label:"Replied",val:c.replied,color:"text-blue-400"}].map(stat => (
                        <div key={stat.label} className="text-center">
                          <p className={`text-xl font-black ${stat.color}`}>{stat.val}</p>
                          <p className="text-xs text-slate-500">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === "compose" && (
            <motion.div key="compose" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }} className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <h3 className="text-lg font-black text-white mb-5 flex items-center gap-2"><Sparkles className="h-5 w-5 text-emerald-400" /> Campaign Settings</h3>
                <div className="space-y-4">
                  {[{name:"role",label:"Target Role",placeholder:"e.g. Senior React Developer"},{name:"profile",label:"Ideal Profile",placeholder:"e.g. 3+ yrs React, startup exp"}].map(f => (
                    <div key={f.name}>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">{f.label}</label>
                      <input value={form[f.name]} onChange={e=>setForm({...form,[f.name]:e.target.value})} placeholder={f.placeholder}
                        className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all" />
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Tone</label>
                      <select value={form.tone} onChange={e=>setForm({...form,tone:e.target.value})} className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-400 transition-all">
                        {["Professional","Friendly","Casual","Formal"].map(t=><option key={t} value={t} className="bg-slate-800">{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Follow-up Days</label>
                      <input type="number" value={form.followup} onChange={e=>setForm({...form,followup:e.target.value})} min="1" max="14"
                        className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-400 transition-all" />
                    </div>
                  </div>
                  <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} onClick={handleGenerate} disabled={generating}
                    className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                    {generating ? <><RefreshCw className="h-4 w-4 animate-spin" /> Generating...</> : <><Bot className="h-4 w-4" /> Generate Message</>}
                  </motion.button>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <h3 className="text-lg font-black text-white mb-5 flex items-center gap-2"><Mail className="h-5 w-5 text-teal-400" /> Generated Message</h3>
                <AnimatePresence>
                  {generatedMsg ? (
                    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
                      <textarea value={generatedMsg} onChange={e=>setGeneratedMsg(e.target.value)} rows={12}
                        className="w-full rounded-xl border border-white/10 bg-white/10 p-4 text-sm text-slate-200 outline-none focus:border-teal-400 transition-all resize-none" />
                      <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} onClick={() => toast.success("Campaign launched!")}
                        className="mt-3 w-full rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 py-3 text-sm font-black text-white shadow-lg flex items-center justify-center gap-2">
                        <Send className="h-4 w-4" /> Launch Campaign
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex flex-col items-center justify-center py-20 text-slate-500">
                      <motion.div animate={{ y:[0,-8,0] }} transition={{ duration:2, repeat:Infinity }}>
                        <Bot className="h-16 w-16 mb-4 opacity-20" />
                      </motion.div>
                      <p className="font-semibold">Configure and generate your outreach message</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AiRecruiterPage;
