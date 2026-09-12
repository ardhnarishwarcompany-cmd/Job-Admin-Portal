import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components_lite/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Building2, User, Globe2, MapPin, Zap, Star, Crown, ShieldCheck, ArrowRight, Sparkles, TrendingUp, Layers } from "lucide-react";
import { toast } from "sonner";
import { PAYMENT_API_ENDPOINT } from "@/utils/data";

const loadRazorpay = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const existing = document.querySelector('script[data-razorpay-checkout="true"]');
  if (existing) {
    existing.addEventListener("load", () => resolve(true), { once: true });
    existing.addEventListener("error", () => resolve(false), { once: true });
    return;
  }
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.async = true;
  script.dataset.razorpayCheckout = "true";
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

// Dynamic Typewriter Effect Component
const TypewriterText = ({ texts }) => {
  const [displayText, setDisplayText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[textIndex];
    let timeoutId;

    if (!isDeleting && displayText === currentText) {
      // Pause when string is fully typed
      timeoutId = setTimeout(() => setIsDeleting(true), 2500);
    } else if (isDeleting && displayText === "") {
      // Switch to next string when fully deleted
      setIsDeleting(false);
      setTextIndex((prev) => (prev + 1) % texts.length);
    } else {
      // Typing or deleting speed
      const speed = isDeleting ? 30 : 60;
      timeoutId = setTimeout(() => {
        setDisplayText(prev => 
          isDeleting ? prev.slice(0, -1) : currentText.slice(0, prev.length + 1)
        );
      }, speed);
    }

    return () => clearTimeout(timeoutId);
  }, [displayText, isDeleting, textIndex, texts]);

  return (
    <span className="inline-block relative">
      {displayText}
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="absolute -right-[4px] sm:-right-[8px] top-[10%] bottom-[10%] w-[3px] sm:w-[5px] bg-blue-500 rounded-full"
      />
      {/* Invisible placeholder to prevent layout shifts */}
      <span className="invisible h-0 block overflow-hidden">{texts.reduce((a, b) => a.length > b.length ? a : b)}</span>
    </span>
  );
};

const PricingPlans = () => {
  const [region, setRegion] = useState("india");
  const [audience, setAudience] = useState("employer");

  const handleBuyClick = async (planName, customCycle = "monthly") => {
    try {
      const loaded = await loadRazorpay();
      if (!loaded) return toast.error("Could not load Razorpay checkout. Please check your internet connection.");
      
      const orderRes = await axios.post(
        `${PAYMENT_API_ENDPOINT}/create-order`,
        { planName, billingCycle: customCycle },
        { withCredentials: true }
      );
      
      if (!orderRes.data?.success) throw new Error(orderRes.data?.message || "Could not create payment order.");
      
      const { keyId, order, plan } = orderRes.data;
      
      const rzp = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Recruweb Job Portal",
        description: `${plan.name} Plan`,
        order_id: order.id,
        theme: { color: region === "india" ? "#2563eb" : "#0891b2" },
        handler: async (response) => {
          try {
            const verify = await axios.post(`${PAYMENT_API_ENDPOINT}/verify`, response, { withCredentials: true });
            if (verify.data?.success) toast.success("Payment successful! Your plan is active.");
            else toast.error(verify.data?.message || "Payment verification failed.");
          } catch (err) {
            toast.error(err?.response?.data?.message || "Payment verification failed.");
          }
        },
        modal: { ondismiss: () => toast.info("Payment window closed.") },
      });
      rzp.on("payment.failed", (response) => toast.error(response?.error?.description || "Payment failed."));
      rzp.open();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Could not start payment.");
    }
  };

  const candidateIndia = [
    { name: "Candidate Registration", price: "Free", period: "", type: "free", icon: Check, description: "Create your profile instantly." },
    { name: "Job Application", price: "Free", period: "", type: "free", icon: Check, description: "Apply to unlimited domestic jobs." },
    { name: "CV Upload", price: "Free", period: "", type: "free", icon: Check, description: "Securely store your resume." },
    { name: "AI CV analysis", price: "₹99", period: "/scan", type: "paid", icon: Zap, description: "Get instant AI feedback on your resume." },
    { name: "AI Interview preparation", price: "₹199", period: "/session", type: "paid", icon: Zap, description: "Practice with our NOVA AI interviewer." },
    { name: "Premium CV Maker", price: "₹299", period: "/download", type: "paid", icon: Star, description: "Export beautiful, ATS-friendly templates." },
    { name: "Premium profile", price: "₹499", period: "/year", type: "paid", icon: Crown, cycle: "yearly", description: "Stand out to top recruiters with a premium badge." },
    { name: "Career consultation", price: "₹999", period: "/session", type: "paid", icon: ShieldCheck, description: "1-on-1 guidance with an industry expert." },
  ];

  const candidateOverseas = [
    { name: "Candidate Registration", price: "Free", period: "", type: "free", icon: Check, description: "Create your profile instantly." },
    { name: "Job Application", price: "Free", period: "", type: "free", icon: Check, description: "Apply to unlimited global jobs." },
    { name: "CV Upload", price: "Free", period: "", type: "free", icon: Check, description: "Securely store your resume." },
    { name: "AI CV analysis - Global", price: "$5", period: "/scan", type: "paid", icon: Zap, description: "International standard resume feedback." },
    { name: "AI Interview prep - Global", price: "$15", period: "/session", type: "paid", icon: Zap, description: "Practice for overseas technical interviews." },
    { name: "Premium CV Maker - Global", price: "$10", period: "/download", type: "paid", icon: Star, description: "Export global ATS-friendly templates." },
    { name: "Premium profile - Global", price: "$20", period: "/year", type: "paid", icon: Crown, cycle: "yearly", description: "Get noticed by international employers." },
    { name: "Career consultation - Global", price: "$49", period: "/session", type: "paid", icon: ShieldCheck, description: "Guidance for relocating and global careers." },
  ];

  const employerIndia = [
    { name: "Free Job", price: "₹0", period: "/job", type: "free", features: ["1 Standard Job Posting", "Basic Support", "Standard Dashboard"], desc: "Perfect for a single urgent hire." },
    { name: "Basic", price: "₹999", period: "/job", type: "paid", features: ["Premium Placement", "Standard Shortlisting", "Email Support"], desc: "Get more visibility for your listing." },
    { name: "Professional", price: "₹2,999", period: "/job", type: "paid", recommended: true, features: ["Featured Placement", "AI Resume Screening", "Priority Support"], desc: "Our most popular tier for SMBs." },
    { name: "Premium", price: "₹5,999", period: "/job", type: "paid", features: ["Top-tier Visibility", "AI Interviews Included", "Dedicated AM"], desc: "For critical roles that need top talent." },
    { name: "Monthly Recruiter", price: "₹9,999", period: "/month", type: "paid", cycle: "monthly", features: ["Unlimited Standard Jobs", "Full CV Database Access", "SaaS Tools"], desc: "A flat rate for constant hiring needs." },
    { name: "Enterprise", price: "₹25,000", period: "/month", type: "paid", cycle: "monthly", features: ["Custom Integrations", "API Access", "Bulk Hiring Workflows"], desc: "Tailored solutions for large corporations." },
  ];

  const employerOverseas = [
    { name: "AI shortlisting", price: "$99", period: "/job", type: "paid", features: ["AI Candidate Ranking", "Skill Matching", "Fraud Detection"], desc: "Let AI filter thousands of global resumes." },
    { name: "AI interview", price: "$15", period: "/candidate", type: "paid", features: ["Automated Video Screening", "AI Evaluation Report", "Anti-Cheat"], desc: "Screen candidates asynchronously." },
    { name: "International job posting", price: "$99", period: "/job", type: "paid", features: ["Standard Visibility", "Global Reach", "Basic Support"], desc: "Reach talent across borders." },
    { name: "Featured international job", price: "$199", period: "/job", type: "paid", recommended: true, features: ["Top Visibility", "Priority Delivery", "Social Media Boost"], desc: "Maximize your international exposure." },
    { name: "CV database", price: "$499", period: "/month", type: "paid", cycle: "monthly", features: ["Global Talent Pool Access", "Unlimited Downloads", "Advanced Filters"], desc: "Directly source from our global pool." },
    { name: "Recruitment Package", price: "$999", period: "/package", type: "paid", features: ["Up to 50 Vacancies", "AI Screening & Interviews", "Recruiter Calling"], desc: "End-to-end global hiring solution." },
  ];

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const cardVars = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 30 } }
  };

  const headingPhrases = [
    "global recruitment.",
    "career growth.",
    "talent acquisition.",
    "borderless hiring.",
    "your next big move."
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 dark:bg-[#0B1120] dark:selection:bg-blue-900/50 dark:selection:text-blue-100 transition-colors duration-500 overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section with typing effect and gradient blobs */}
      <div className="relative w-full overflow-hidden bg-gradient-to-b from-blue-50 via-white to-slate-50 dark:from-slate-900 dark:via-[#0B1120] dark:to-[#0B1120] pb-12 pt-20 sm:pt-28 lg:pb-20 lg:pt-36">
        <div className="absolute left-1/2 top-0 -z-10 -ml-24 h-[600px] w-[600px] sm:h-[1000px] sm:w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-blue-200/40 to-cyan-100/40 dark:from-blue-600/10 dark:to-cyan-400/10 blur-3xl"></div>
        <div className="absolute right-0 top-0 -z-10 h-[400px] w-[400px] sm:h-[600px] sm:w-[600px] translate-x-1/3 -translate-y-1/4 rounded-full bg-gradient-to-br from-indigo-200/40 to-purple-100/40 dark:from-indigo-600/10 dark:to-purple-500/10 blur-3xl"></div>
        
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <span className="mb-4 sm:mb-6 inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-white dark:bg-slate-800 px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-pulse text-amber-500" /> Professional Pricing Plans
            </span>
            <h1 className="mt-2 sm:mt-4 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] sm:leading-tight">
              Powering the future of <br className="hidden sm:block"/>
              <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto]">
                <TypewriterText texts={headingPhrases} />
              </span>
            </h1>
            <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg font-medium text-slate-600 dark:text-slate-400 leading-relaxed px-2 sm:px-0">
              We empower candidates with intelligent AI tools while providing employers with unprecedented, frictionless global reach. Choose the tier that matches your ambition.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 sm:pb-32">
        {/* Toggle Controls */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.2 }}
          className="mb-10 sm:mb-16 mt-4 flex flex-col items-center gap-4 sm:gap-6"
        >
          {/* Region Toggle */}
          <div className="flex w-full sm:w-auto rounded-full bg-white dark:bg-slate-800 p-1 sm:p-1.5 shadow-md ring-1 ring-slate-200 dark:ring-slate-700">
            <button
              onClick={() => setRegion("india")}
              className={`flex flex-1 justify-center items-center gap-2 rounded-full px-4 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-all duration-300 ${
                region === "india" ? "bg-slate-900 dark:bg-blue-600 text-white shadow-md sm:scale-105" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> India <span className="hidden sm:inline">(INR)</span>
            </button>
            <button
              onClick={() => setRegion("overseas")}
              className={`flex flex-1 justify-center items-center gap-2 rounded-full px-4 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-all duration-300 ${
                region === "overseas" ? "bg-slate-900 dark:bg-blue-600 text-white shadow-md sm:scale-105" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              <Globe2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Overseas <span className="hidden sm:inline">(USD)</span>
            </button>
          </div>

          {/* Audience Toggle */}
          <div className="flex w-full max-w-[280px] sm:max-w-none sm:w-auto rounded-full bg-blue-50/80 dark:bg-slate-800/80 p-1 sm:p-1.5 ring-1 ring-blue-100 dark:ring-slate-700 backdrop-blur-sm shadow-sm">
            <button
              onClick={() => setAudience("candidate")}
              className={`flex flex-1 justify-center items-center gap-2 rounded-full px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold transition-all duration-300 ${
                audience === "candidate" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 sm:scale-105" : "text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-slate-700"
              }`}
            >
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Candidates
            </button>
            <button
              onClick={() => setAudience("employer")}
              className={`flex flex-1 justify-center items-center gap-2 rounded-full px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold transition-all duration-300 ${
                audience === "employer" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 sm:scale-105" : "text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-slate-700"
              }`}
            >
              <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Employers
            </button>
          </div>
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${region}-${audience}`}
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Contextual Header */}
            <div className="mb-8 sm:mb-12 text-center px-4">
              {audience === "candidate" ? (
                <>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-2 sm:gap-3">
                    <TrendingUp className="text-blue-500 h-6 w-6 sm:h-8 sm:w-8"/> Elevate Your Career
                  </h3>
                  <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                    We believe basic job applications should always be free. Use our premium AI tools to dramatically increase your chances of getting hired.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-2 sm:gap-3">
                    <Layers className="text-blue-500 h-6 w-6 sm:h-8 sm:w-8"/> Scale Your Hiring
                  </h3>
                  <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                    From single urgent hires to enterprise-wide recruitment pipelines, our AI-driven employer tools drastically reduce time-to-hire.
                  </p>
                </>
              )}
            </div>

            {/* Candidates Grid */}
            {audience === "candidate" && (
              <motion.div variants={containerVars} initial="hidden" animate="show" className="mx-auto max-w-5xl grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {(region === "india" ? candidateIndia : candidateOverseas).map((item, i) => (
                  <motion.div variants={cardVars} key={i} className="group relative flex flex-col justify-between rounded-3xl bg-white dark:bg-slate-800 p-6 sm:p-7 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 transition-all duration-300 sm:hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/10 dark:hover:shadow-blue-900/30 hover:ring-blue-300 dark:hover:ring-blue-500 overflow-hidden">
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    
                    <div className="relative z-10">
                      <div className="mb-4 sm:mb-6 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-700 dark:to-slate-600 text-blue-600 dark:text-blue-400 ring-1 ring-blue-100 dark:ring-slate-600 sm:group-hover:scale-110 sm:group-hover:rotate-3 transition-all duration-300">
                        <item.icon className="h-6 w-6 sm:h-7 sm:w-7" />
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">{item.name.replace(" - Global", "")}</h4>
                      <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
                      
                      <div className="mt-5 sm:mt-6 flex items-baseline gap-1 border-t border-slate-100 dark:border-slate-700 pt-5 sm:pt-6">
                        <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">{item.price}</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500">{item.period}</span>
                      </div>
                    </div>
                    
                    {item.type === "paid" ? (
                      <button
                        onClick={() => handleBuyClick(item.name, item.cycle || "monthly")}
                        className="relative z-10 mt-5 sm:mt-6 flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-slate-900 dark:bg-blue-600 px-4 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white transition-all duration-300 hover:bg-blue-600 dark:hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95"
                      >
                        Buy Now <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    ) : (
                      <div className="relative z-10 mt-5 sm:mt-6 flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-700 px-4 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-300 ring-1 ring-inset ring-slate-200 dark:ring-slate-600">
                        Included Free
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Employers Grid */}
            {audience === "employer" && (
              <motion.div variants={containerVars} initial="hidden" animate="show" className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {(region === "india" ? employerIndia : employerOverseas).map((plan, i) => (
                  <motion.div variants={cardVars} key={i} className={`group relative flex flex-col rounded-3xl sm:rounded-[2.5rem] bg-white dark:bg-slate-800 p-6 sm:p-10 transition-all duration-500 ${plan.recommended ? 'ring-2 ring-blue-500 dark:ring-blue-400 shadow-2xl shadow-blue-900/15 dark:shadow-blue-900/40 md:scale-105 z-10' : 'ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm hover:shadow-2xl hover:shadow-slate-900/10 dark:hover:shadow-blue-900/20 sm:hover:-translate-y-2 hover:ring-blue-200 dark:hover:ring-slate-500'}`}>
                    
                    {plan.recommended && (
                      <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 p-[1.5px] shadow-lg">
                        <div className="rounded-full bg-slate-900 dark:bg-slate-800 px-4 sm:px-5 py-1 sm:py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-white whitespace-nowrap">
                          Most Popular
                        </div>
                      </div>
                    )}
                    
                    <div className="mb-6 sm:mb-8">
                      <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{plan.name}</h4>
                      <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{plan.desc}</p>
                      <div className="mt-5 sm:mt-8 flex items-baseline gap-1">
                        <span className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 dark:text-white">{plan.price}</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500">{plan.period}</span>
                      </div>
                    </div>
                    
                    <ul className="mb-8 sm:mb-10 flex-1 space-y-4 sm:space-y-5">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 sm:gap-4 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                          <div className="mt-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 p-1 sm:p-1.5 text-blue-600 dark:text-blue-400 sm:group-hover:bg-blue-100 dark:sm:group-hover:bg-blue-900/50 transition-colors">
                            <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                          </div>
                          <span className="leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.type === "paid" ? (
                      <button
                        onClick={() => handleBuyClick(plan.name, plan.cycle || "monthly")}
                        className={`w-full rounded-xl sm:rounded-2xl px-4 py-3 sm:py-4 text-sm sm:text-base font-black transition-all duration-300 active:scale-95 ${plan.recommended ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02]' : 'bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-200 dark:ring-slate-600 hover:bg-slate-900 dark:hover:bg-blue-600 hover:text-white hover:ring-transparent'}`}
                      >
                        Choose {plan.name}
                      </button>
                    ) : (
                      <button className="w-full rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-700 px-4 py-3 sm:py-4 text-sm sm:text-base font-black text-slate-500 dark:text-slate-300 ring-1 ring-inset ring-slate-200 dark:ring-slate-600 transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-600 hover:text-slate-800 dark:hover:text-white active:scale-95">
                        Post Free Job
                      </button>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
            
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PricingPlans;
