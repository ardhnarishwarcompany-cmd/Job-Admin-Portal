import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components_lite/Navbar";
import { ShieldAlert, Plus, Trash2, Search, AlertTriangle, User, Building2, Flag } from "lucide-react";
import { toast } from "sonner";

const initialList = [
  { id:1, name:"Fake Recruiter Co.", type:"Company", reason:"Fraudulent job postings", severity:"high", date:"2026-04-10" },
  { id:2, name:"John Spam", type:"User", reason:"Repeated spam applications", severity:"medium", date:"2026-04-15" },
  { id:3, name:"ScamJobs Ltd.", type:"Company", reason:"Payment fraud reported", severity:"high", date:"2026-05-01" },
];

const severityConfig = {
  high: { color:"bg-rose-500/20 text-rose-400 border-rose-500/30", dot:"bg-rose-500" },
  medium: { color:"bg-amber-500/20 text-amber-400 border-amber-500/30", dot:"bg-amber-500" },
  low: { color:"bg-slate-500/20 text-slate-400 border-slate-500/30", dot:"bg-slate-500" },
};

const BlacklistPage = () => {
  const [list, setList] = useState(initialList);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:"", type:"User", reason:"", severity:"medium" });

  const filtered = list.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.reason.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name || !form.reason) { toast.error("Fill all fields"); return; }
    setList(prev => [...prev, { ...form, id:Date.now(), date:new Date().toISOString().split("T")[0] }]);
    setForm({ name:"", type:"User", reason:"", severity:"medium" });
    setShowForm(false);
    toast.success("Added to blacklist");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-rose-950">
      <Navbar />
      <div className="relative overflow-hidden py-14 px-4 text-center">
        <motion.div animate={{ /* scale animation removed to prevent layout growth */ opacity:[0.2,0.4,0.2] }} transition={{ duration:6, repeat:Infinity }} className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-red-600/20 blur-3xl" />
        <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} className="relative z-10">
          <motion.div animate={{ rotate:[0,-5,5,0] }} transition={{ duration:3, repeat:Infinity }}
            className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-red-500 to-rose-600 shadow-2xl shadow-red-500/40 mb-6">
            <ShieldAlert className="h-10 w-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-black text-white sm:text-5xl">Blacklist <span className="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">Manager</span></h1>
          <p className="mt-3 text-slate-400 text-lg max-w-xl mx-auto">Flag and manage fraudulent users, companies, and suspicious activity</p>
        </motion.div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-16">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 py-2.5">
            <Search className="h-4 w-4 text-slate-400" />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search blacklist..." className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none" />
          </div>
          <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }} onClick={() => setShowForm(v=>!v)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/30 transition-all">
            <Plus className="h-4 w-4" /> Add to Blacklist
          </motion.button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.form initial={{ opacity:0, y:-20, height:0 }} animate={{ opacity:1, y:0, height:"auto" }} exit={{ opacity:0, y:-20, height:0 }}
              onSubmit={handleAdd} className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl p-6 space-y-4">
              <h3 className="font-black text-white flex items-center gap-2"><Flag className="h-4 w-4 text-red-400" /> Add New Entry</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Name / Company</label>
                  <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Enter name..." className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-red-400 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Type</label>
                  <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-red-400 transition-all">
                    <option>User</option><option>Company</option><option>Recruiter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Reason</label>
                  <input value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} placeholder="Reason for blacklisting..." className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-red-400 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Severity</label>
                  <select value={form.severity} onChange={e=>setForm({...form,severity:e.target.value})} className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-red-400 transition-all">
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} type="submit" className="flex-1 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-2.5 text-sm font-bold text-white shadow-md transition-all">Add Entry</motion.button>
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl bg-white/10 border border-white/20 py-2.5 text-sm font-bold text-white transition-all">Cancel</motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <motion.div variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.08 } } }} initial="hidden" animate="visible" className="space-y-3">
          <AnimatePresence>
            {filtered.map(item => {
              const sev = severityConfig[item.severity] || severityConfig.medium;
              return (
                <motion.div key={item.id} variants={{ hidden:{ opacity:0, y:16 }, visible:{ opacity:1, y:0, transition:{ duration:0.35 } } }}
                  exit={{ opacity:0, x:60 }} whileHover={{ x:4 }}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 hover:border-red-500/30 transition-all">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white font-black text-lg shadow-md">
                    {item.type==="Company" ? <Building2 className="h-6 w-6" /> : <User className="h-6 w-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-white">{item.name}</p>
                      <span className="text-xs text-slate-400 bg-white/10 rounded-full px-2 py-0.5">{item.type}</span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-amber-400" />{item.reason}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Added: {item.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${sev.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${sev.dot}`} />{item.severity}
                    </span>
                    <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }} onClick={() => { setList(prev=>prev.filter(i=>i.id!==item.id)); toast.success("Removed from blacklist"); }}
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/40 transition-all">
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex flex-col items-center justify-center py-20 text-slate-500">
            <ShieldAlert className="h-16 w-16 mb-4 opacity-10" />
            <p className="font-semibold text-slate-400">No entries found</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BlacklistPage;
