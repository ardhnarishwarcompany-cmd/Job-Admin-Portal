import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components_lite/Navbar";
import axios from "axios";
import { Headphones, Mail, Phone, MapPin, Send, CheckCircle2, Loader2, MessageCircle, Clock, Zap } from "lucide-react";
import { toast } from "sonner";

const contactInfo = [
  { icon: Mail, label: "Email Us", value: "info@recruweb.com", color: "from-blue-500 to-cyan-600" },
  { icon: Phone, label: "Call Us", value: "+91 9336532636", color: "from-emerald-500 to-teal-500" },
  { icon: MapPin, label: "Visit Us", value: "Noida sector 63,H-112,nearby electronic City metro station", color: "from-orange-500 to-amber-500" },
  { icon: Clock, label: "Support Hours", value: "Mon–Sat, 9AM–7PM IST", color: "from-sky-500 to-cyan-500" },
];

const faqs = [
  { q: "How do I reset my password?", a: "Go to Login page → click 'Forgot Password' → enter your email to receive a reset link." },
  { q: "How long does it take to get a response?", a: "We typically respond within 2-4 business hours during working days." },
  { q: "Can I change my account role?", a: "Role changes require admin approval. Please contact support with your request." },
  { q: "Is my data secure on this platform?", a: "Yes, we use industry-standard encryption and never share your data with third parties." },
];

const ContactUsPage = () => {
  const [form, setForm] = useState({ name:"", email:"", topic:"", message:"" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/contact`, form);
      setSubmitted(true);
      toast.success("Message sent! We'll reply soon.");
      setForm({ name: "", email: "", topic: "", message: "" });
    } catch (error) {
      console.error("Contact submit error:", error);
      toast.error("Unable to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-cyan-950">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden py-14 px-4 text-center">
        <motion.div animate={{ /* scale animation removed to prevent layout growth */ opacity:[0.2,0.4,0.2] }} transition={{ duration:6, repeat:Infinity }} className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-sky-600/20 blur-3xl" />
        <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} className="relative z-10">
          <motion.div animate={{ y:[0,-6,0] }} transition={{ duration:2.5, repeat:Infinity }}
            className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-sky-500 to-cyan-500 shadow-2xl shadow-sky-500/40 mb-6">
            <Headphones className="h-10 w-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-black text-white sm:text-5xl">Contact <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">Support</span></h1>
          <p className="mt-3 text-slate-400 text-lg max-w-xl mx-auto">We're here to help. Reach out and we'll get back to you within hours.</p>
        </motion.div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16">
        {/* Contact info cards */}
        <motion.div
          variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.1 } } }}
          initial="hidden" animate="visible"
          className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-10"
        >
          {contactInfo.map((info, i) => (
            <motion.div key={info.label} variants={{ hidden:{ opacity:0, y:20 }, visible:{ opacity:1, y:0 } }} whileHover={{ y:-5, scale:1.03 }}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 text-center hover:border-sky-500/30 transition-all">
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${info.color} shadow-lg mb-3`}>
                <info.icon className="h-6 w-6 text-white" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{info.label}</p>
              <p className="text-sm font-bold text-white mt-1">{info.value}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form */}
          <motion.div initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.3 }}
            className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-sky-400" /> Send a Message
            </h2>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div key="success" initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} className="flex flex-col items-center justify-center py-16 gap-4">
                  <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:"spring", stiffness:200 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 border-2 border-emerald-500/50">
                    <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                  </motion.div>
                  <h3 className="text-xl font-black text-white">Message Sent!</h3>
                  <p className="text-slate-400 text-sm text-center">We'll get back to you within 2-4 business hours.</p>
                  <motion.button whileHover={{ scale:1.04 }} onClick={() => { setSubmitted(false); setForm({ name:"", email:"", topic:"", message:"" }); }}
                    className="rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-sky-700 transition-colors">
                    Send Another
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[{name:"name",label:"Your Name",placeholder:"John Doe",type:"text"},{name:"email",label:"Email Address",placeholder:"you@example.com",type:"email"}].map(f => (
                      <div key={f.name}>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">{f.label} <span className="text-rose-400">*</span></label>
                        <input type={f.type} value={form[f.name]} onChange={e=>setForm({...form,[f.name]:e.target.value})} placeholder={f.placeholder}
                          className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Topic</label>
                    <select value={form.topic} onChange={e=>setForm({...form,topic:e.target.value})}
                      className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-sky-400 transition-all">
                      <option value="">Select a topic</option>
                      {["Account Issue","Job Posting","Application Problem","Payment","Technical Bug","Other"].map(t=><option key={t} value={t} className="bg-slate-800">{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Message <span className="text-rose-400">*</span></label>
                    <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Describe your issue or question in detail..." rows={5}
                      className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all resize-none" />
                  </div>
                  <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} type="submit" disabled={loading}
                    className="w-full rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 py-3.5 text-sm font-black text-white shadow-lg shadow-sky-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : <><Send className="h-4 w-4" /> Send Message</>}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* FAQ */}
          <motion.div initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.4 }}
            className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" /> Quick Answers
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <motion.div key={i} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4+i*0.08 }}
                  className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq===i ? null : i)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left">
                    <span className="text-sm font-bold text-white">{faq.q}</span>
                    <motion.span animate={{ rotate: openFaq===i ? 180 : 0 }} transition={{ duration:0.2 }} className="text-slate-400 text-lg flex-shrink-0 ml-2">▾</motion.span>
                  </button>
                  <AnimatePresence>
                    {openFaq===i && (
                      <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.25 }}>
                        <p className="px-5 pb-4 text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
