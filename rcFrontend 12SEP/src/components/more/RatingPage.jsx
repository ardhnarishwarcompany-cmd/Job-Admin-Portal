import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components_lite/Navbar";
import { Star, Award, TrendingUp, Users, Briefcase, CheckCircle2, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

const categories = [
  { key:"platform", label:"Platform Experience", icon:TrendingUp, color:"from-blue-500 to-cyan-600" },
  { key:"recruiter", label:"Recruiter Quality", icon:Users, color:"from-emerald-500 to-teal-500" },
  { key:"jobs", label:"Job Listings", icon:Briefcase, color:"from-orange-500 to-amber-500" },
  { key:"support", label:"Customer Support", icon:Award, color:"from-sky-500 to-cyan-500" },
];

const topRated = [
  { name:"TechCorp India", type:"Company", rating:4.9, reviews:234, badge:"Top Employer" },
  { name:"Infosys HR Team", type:"Recruiter", rating:4.8, reviews:189, badge:"Verified" },
  { name:"Wipro Talent", type:"Recruiter", rating:4.7, reviews:156, badge:"Active" },
  { name:"Google India", type:"Company", rating:4.9, reviews:412, badge:"Premium" },
];

const StarRating = ({ value, onChange, size="h-8 w-8" }) => {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <motion.button key={i} type="button" whileHover={{ scale:1.3, y:-3 }} whileTap={{ scale:0.9 }}
          onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(0)} onClick={() => onChange(i)}>
          <Star className={`${size} transition-all ${display>=i ? "text-yellow-400 fill-yellow-400" : "text-slate-600"}`} />
        </motion.button>
      ))}
    </div>
  );
};

const RatingPage = () => {
  const [ratings, setRatings] = useState({ platform:0, recruiter:0, jobs:0, support:0 });
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const avgRating = Object.values(ratings).filter(Boolean).length
    ? (Object.values(ratings).reduce((a,b)=>a+b,0) / Object.values(ratings).filter(Boolean).length).toFixed(1)
    : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    const filled = Object.values(ratings).filter(Boolean).length;
    if (filled < 2) { toast.error("Please rate at least 2 categories"); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); toast.success("Rating submitted! Thank you 🌟"); }, 1800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-yellow-950 to-amber-950">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden py-14 px-4 text-center">
        <motion.div animate={{ /* scale animation removed to prevent layout growth */ opacity:[0.2,0.4,0.2] }} transition={{ duration:6, repeat:Infinity }} className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-yellow-600/20 blur-3xl" />
        <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} className="relative z-10">
          <motion.div animate={{ rotate:[0,15,-15,0] }} transition={{ duration:3, repeat:Infinity }}
            className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-yellow-500 to-amber-500 shadow-2xl shadow-yellow-500/40 mb-6">
            <Star className="h-10 w-10 text-white fill-white" />
          </motion.div>
          <h1 className="text-4xl font-black text-white sm:text-5xl">Rate Your <span className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">Experience</span></h1>
          <p className="mt-3 text-slate-400 text-lg max-w-xl mx-auto">Help us improve by rating different aspects of the platform</p>
        </motion.div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-16">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Rating form */}
          <motion.div initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2 }}
            className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div key="success" initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} className="flex flex-col items-center justify-center py-16 gap-5">
                  <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:"spring", stiffness:200 }}>
                    <div className="text-7xl">🌟</div>
                  </motion.div>
                  <h3 className="text-2xl font-black text-white">Rating Submitted!</h3>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_,i) => (
                      <Star key={i} className={`h-8 w-8 ${i<Math.round(avgRating) ? "text-yellow-400 fill-yellow-400" : "text-slate-600"}`} />
                    ))}
                  </div>
                  <p className="text-3xl font-black text-yellow-400">{avgRating} / 5.0</p>
                  <p className="text-slate-400 text-sm text-center">Thank you for helping us improve!</p>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" /> Rate Categories
                    </h2>
                    {avgRating > 0 && (
                      <motion.div initial={{ scale:0 }} animate={{ scale:1 }} className="flex items-center gap-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 px-3 py-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-black text-yellow-400">{avgRating}</span>
                      </motion.div>
                    )}
                  </div>

                  {categories.map((cat, i) => (
                    <motion.div key={cat.key} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2+i*0.08 }}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} shadow-md`}>
                          <cat.icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-bold text-white text-sm">{cat.label}</span>
                        {ratings[cat.key] > 0 && (
                          <span className="ml-auto text-xs font-black text-yellow-400">{ratings[cat.key]}/5</span>
                        )}
                      </div>
                      <StarRating value={ratings[cat.key]} onChange={v => setRatings({...ratings,[cat.key]:v})} size="h-7 w-7" />
                    </motion.div>
                  ))}

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Additional Comments</label>
                    <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Any specific feedback or suggestions..." rows={3}
                      className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all resize-none" />
                  </div>

                  <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} type="submit" disabled={loading}
                    className="w-full rounded-2xl bg-gradient-to-r from-yellow-600 to-amber-600 py-3.5 text-sm font-black text-white shadow-lg shadow-yellow-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : <><Send className="h-4 w-4" /> Submit Rating</>}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Top rated */}
          <motion.div initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.3 }} className="space-y-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-400" /> Top Rated
            </h2>
            {topRated.map((item, i) => (
              <motion.div key={i} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3+i*0.1 }} whileHover={{ y:-3, x:4 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 hover:border-yellow-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 text-white font-black text-lg shadow-md">
                      {item.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.type} • {item.reviews} reviews</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-black text-yellow-400">{item.rating}</span>
                    </div>
                    <span className="text-[10px] rounded-full bg-yellow-500/20 border border-yellow-500/30 px-2 py-0.5 text-yellow-400 font-bold">{item.badge}</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Overall stats */}
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.7 }}
              className="rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-600/10 to-amber-600/10 p-5">
              <h3 className="font-black text-white mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-yellow-400" /> Platform Stats</h3>
              <div className="grid grid-cols-3 gap-3">
                {[{val:"4.8★",label:"Avg Rating"},{val:"12K+",label:"Reviews"},{val:"98%",label:"Satisfaction"}].map(s => (
                  <div key={s.label} className="text-center rounded-xl bg-white/5 p-3">
                    <p className="text-xl font-black text-yellow-400">{s.val}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RatingPage;
