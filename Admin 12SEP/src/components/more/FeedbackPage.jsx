import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components_lite/Navbar";
import { MessageCircle, ThumbsUp, ThumbsDown, Meh, Send, CheckCircle2, Loader2, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";

const categories = ["Job Search Experience","Application Process","Recruiter Interaction","Platform UI/UX","AI Features","Overall Experience"];
const emojis = [
  { icon:"😡", label:"Terrible", value:1, color:"text-red-500" },
  { icon:"😕", label:"Bad", value:2, color:"text-orange-500" },
  { icon:"😐", label:"Okay", value:3, color:"text-yellow-500" },
  { icon:"😊", label:"Good", value:4, color:"text-lime-500" },
  { icon:"🤩", label:"Amazing", value:5, color:"text-emerald-500" },
];

const recentFeedbacks = [
  { name:"Rahul S.", role:"Job Seeker", rating:5, comment:"The AI job matching is incredible! Found my dream job in 2 weeks.", time:"2 days ago" },
  { name:"Priya M.", role:"Recruiter", rating:4, comment:"Great platform for finding quality candidates. The filters are very helpful.", time:"5 days ago" },
  { name:"Amit K.", role:"Job Seeker", rating:5, comment:"Super smooth application process. The resume scanner saved me so much time!", time:"1 week ago" },
];

const FeedbackPage = () => {
  const [form, setForm] = useState({ category:"", comment:"", name:"", email:"" });
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating) { toast.error("Please select a rating"); return; }
    if (!form.comment.trim()) { toast.error("Please write your feedback"); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); toast.success("Thank you for your feedback! 🎉"); }, 1800);
  };

  const displayRating = hoveredRating || rating;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-pink-950 to-rose-950">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden py-14 px-4 text-center">
        <motion.div animate={{ /* scale animation removed to prevent layout growth */ opacity:[0.2,0.4,0.2] }} transition={{ duration:6, repeat:Infinity }} className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-pink-600/20 blur-3xl" />
        <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} className="relative z-10">
          <motion.div animate={{ rotate:[0,10,-10,0] }} transition={{ duration:3, repeat:Infinity }}
            className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-2xl shadow-pink-500/40 mb-6">
            <MessageCircle className="h-10 w-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-black text-white sm:text-5xl">Share Your <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">Feedback</span></h1>
          <p className="mt-3 text-slate-400 text-lg max-w-xl mx-auto">Your feedback helps us build a better platform for everyone</p>
        </motion.div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-16">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form */}
          <motion.div initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2 }}
            className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div key="success" initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} className="flex flex-col items-center justify-center py-16 gap-5">
                  <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:"spring", stiffness:200 }}>
                    <div className="text-7xl">🎉</div>
                  </motion.div>
                  <h3 className="text-2xl font-black text-white">Thank You!</h3>
                  <p className="text-slate-400 text-sm text-center">Your feedback has been recorded. We'll use it to improve the platform.</p>
                  <motion.button whileHover={{ scale:1.04 }} onClick={() => { setSubmitted(false); setRating(0); setForm({ category:"", comment:"", name:"", email:"" }); }}
                    className="rounded-xl bg-pink-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-pink-700 transition-colors">
                    Submit More Feedback
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-pink-400" /> Your Experience
                  </h2>

                  {/* Emoji rating */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-3 uppercase tracking-wider">How was your experience?</label>
                    <div className="flex justify-between">
                      {emojis.map(e => (
                        <motion.button key={e.value} type="button"
                          whileHover={{ scale:1.3, y:-4 }} whileTap={{ scale:0.9 }}
                          onMouseEnter={() => setHoveredRating(e.value)}
                          onMouseLeave={() => setHoveredRating(0)}
                          onClick={() => setRating(e.value)}
                          className="flex flex-col items-center gap-1">
                          <motion.span animate={{ scale: displayRating===e.value ? 1.4 : 1 }} className={`text-3xl transition-all ${displayRating>=e.value ? "opacity-100" : "opacity-30"}`}>{e.icon}</motion.span>
                          <span className={`text-[10px] font-bold ${displayRating===e.value ? e.color : "text-slate-600"}`}>{e.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Category</label>
                    <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}
                      className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-pink-400 transition-all">
                      <option value="">Select category</option>
                      {categories.map(c=><option key={c} value={c} className="bg-slate-800">{c}</option>)}
                    </select>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Your Feedback <span className="text-rose-400">*</span></label>
                    <textarea value={form.comment} onChange={e=>setForm({...form,comment:e.target.value})} placeholder="Tell us what you loved or what we can improve..." rows={4}
                      className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all resize-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[{name:"name",placeholder:"Your name (optional)"},{name:"email",placeholder:"Email (optional)"}].map(f => (
                      <input key={f.name} value={form[f.name]} onChange={e=>setForm({...form,[f.name]:e.target.value})} placeholder={f.placeholder}
                        className="rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-pink-400 transition-all" />
                    ))}
                  </div>

                  <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} type="submit" disabled={loading}
                    className="w-full rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 py-3.5 text-sm font-black text-white shadow-lg shadow-pink-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : <><Send className="h-4 w-4" /> Submit Feedback</>}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Recent feedbacks */}
          <motion.div initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.3 }} className="space-y-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" /> Recent Reviews
            </h2>
            {recentFeedbacks.map((fb, i) => (
              <motion.div key={i} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3+i*0.1 }} whileHover={{ y:-3 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 hover:border-pink-500/30 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white font-black">
                      {fb.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{fb.name}</p>
                      <p className="text-xs text-slate-400">{fb.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_,j) => (
                      <Star key={j} className={`h-4 w-4 ${j<fb.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-600"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">"{fb.comment}"</p>
                <p className="text-xs text-slate-500 mt-2">{fb.time}</p>
              </motion.div>
            ))}

            {/* Stats */}
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-pink-600/20 to-rose-600/20 p-5">
              <h3 className="font-black text-white mb-4">Platform Ratings</h3>
              {[{label:"Overall",val:4.8},{label:"UI/UX",val:4.7},{label:"Job Quality",val:4.6},{label:"Support",val:4.9}].map(r => (
                <div key={r.label} className="mb-2.5">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-semibold">{r.label}</span>
                    <span className="text-yellow-400 font-black">⭐ {r.val}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div initial={{ width:0 }} animate={{ width:`${(r.val/5)*100}%` }} transition={{ delay:0.7, duration:0.8, ease:"easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500" />
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
