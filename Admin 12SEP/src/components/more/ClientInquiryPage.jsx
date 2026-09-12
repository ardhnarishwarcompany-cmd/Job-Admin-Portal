import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components_lite/Navbar";
import { MessageCircle, Building2, Users, DollarSign, Briefcase, Send, CheckCircle2, Loader2, TrendingUp, Star, Zap } from "lucide-react";
import { toast } from "sonner";

const plans = [
  { name:"Starter", hires:"1-10/month", price:"₹9,999", color:"from-blue-500 to-cyan-500", features:["AI Screening","Email Support","Basic Analytics"] },
  { name:"Growth", hires:"11-50/month", price:"₹29,999", color:"from-blue-500 to-cyan-600", features:["Everything in Starter","Dedicated Manager","Advanced Analytics","Priority Support"], popular:true },
  { name:"Enterprise", hires:"50+/month", price:"Custom", color:"from-orange-500 to-amber-500", features:["Everything in Growth","Custom Integrations","SLA Guarantee","White-label Option"] },
];

const ClientInquiryPage = () => {
  const [form, setForm] = useState({ company:"", name:"", email:"", phone:"", volume:"", budget:"", requirement:"", timeline:"" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("Growth");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.company || !form.email) { toast.error("Please fill required fields"); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); toast.success("Inquiry submitted! Our team will contact you within 24 hours."); }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-950 to-amber-950">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden py-14 px-4 text-center">
        <motion.div animate={{ /* scale animation removed to prevent layout growth */ opacity:[0.2,0.4,0.2] }} transition={{ duration:6, repeat:Infinity }} className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-orange-600/20 blur-3xl" />
        <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} className="relative z-10">
          <motion.div animate={{ /* scale animation removed to prevent layout growth */ }} transition={{ duration:2, repeat:Infinity }}
            className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-2xl shadow-orange-500/40 mb-6">
            <Building2 className="h-10 w-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-black text-white sm:text-5xl">Client <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Inquiry</span></h1>
          <p className="mt-3 text-slate-400 text-lg max-w-xl mx-auto">Tell us your hiring needs and we'll craft the perfect solution for your company</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {["500+ Companies Trust Us","₹0 Setup Fee","Dedicated Account Manager","Results in 7 Days"].map((tag,i) => (
              <motion.span key={tag} initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.3+i*0.1 }}
                className="rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold text-orange-300">✦ {tag}</motion.span>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16">
        {/* Plan selector */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} className="mb-10">
          <h2 className="text-center text-lg font-black text-white mb-5">Select Your Plan</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {plans.map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2+i*0.1 }}
                whileHover={{ y:-5, scale:1.02 }} onClick={() => setSelectedPlan(plan.name)}
                className={`relative cursor-pointer rounded-2xl border p-5 transition-all duration-200 ${selectedPlan===plan.name ? "border-orange-500/50 bg-orange-500/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}>
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-1 text-xs font-black text-white shadow-lg">⭐ Most Popular</span>
                )}
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${plan.color} shadow-md mb-3`}>
                  <Star className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-black text-white text-lg">{plan.name}</h3>
                <p className="text-2xl font-black text-orange-400 mt-1">{plan.price}</p>
                <p className="text-xs text-slate-400 mb-3">{plan.hires} hires</p>
                <ul className="space-y-1.5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                {selectedPlan===plan.name && (
                  <motion.div layoutId="planSelected" className="absolute inset-0 rounded-2xl border-2 border-orange-500/60 pointer-events-none" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
          className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
          <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-orange-400" /> Company Details
          </h2>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div key="success" initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} className="flex flex-col items-center justify-center py-16 gap-4">
                <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:"spring", stiffness:200 }}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 border-2 border-emerald-500/50">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                </motion.div>
                <h3 className="text-xl font-black text-white">Inquiry Submitted!</h3>
                <p className="text-slate-400 text-sm text-center max-w-sm">Our enterprise team will contact you within 24 hours with a customized proposal.</p>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {[
                  {name:"company",label:"Company Name",placeholder:"Acme Technologies Pvt. Ltd.",icon:Building2,required:true},
                  {name:"name",label:"Contact Person",placeholder:"Your full name",icon:Users,required:true},
                  {name:"email",label:"Business Email",placeholder:"hr@company.com",icon:MessageCircle,required:true},
                  {name:"phone",label:"Phone Number",placeholder:"+91 98765 43210",icon:MessageCircle},
                  {name:"volume",label:"Monthly Hiring Volume",placeholder:"e.g. 20-30 hires/month",icon:TrendingUp},
                  {name:"budget",label:"Monthly Budget",placeholder:"e.g. ₹50,000",icon:DollarSign},
                ].map(f => (
                  <div key={f.name}>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">{f.label}{f.required && <span className="text-rose-400 ml-1">*</span>}</label>
                    <div className="relative">
                      <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input value={form[f.name]} onChange={e=>setForm({...form,[f.name]:e.target.value})} placeholder={f.placeholder}
                        className="w-full rounded-xl border border-white/10 bg-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all" />
                    </div>
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Hiring Requirements</label>
                  <textarea value={form.requirement} onChange={e=>setForm({...form,requirement:e.target.value})} placeholder="Describe the roles you're hiring for, skills needed, and any specific requirements..." rows={4}
                    className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all resize-none" />
                </div>
                <div className="sm:col-span-2">
                  <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} type="submit" disabled={loading}
                    className="w-full rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 py-4 text-sm font-black text-white shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                    {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Submitting...</> : <><Send className="h-5 w-5" /> Submit Inquiry — Get Free Consultation</>}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ClientInquiryPage;
