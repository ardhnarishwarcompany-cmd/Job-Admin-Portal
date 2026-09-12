import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  ScanSearch,
  Video,
  MessagesSquare,
  Sparkles,
  CheckCircle,
  AlertCircle,
  User,
  Plus,
  Send,
  Volume2
} from "lucide-react";
import gsap from "gsap";

const services = [
  {
    id: "resume-builder",
    icon: FileText,
    title: "AI CV Builder",
    tagline: "High-impact, ATS-optimized CVs built in minutes",
    desc: "Stop struggling with formatting. Our smart creator guides you step-by-step to write professional, resume-compliant content designed to rank high with corporate recruitment filters.",
    badge: "Most Popular",
    color: "from-blue-600 to-cyan-500",
    glow: "rgba(37,99,235,0.15)"
  },
  {
    id: "ats-scanner",
    icon: ScanSearch,
    title: "Resume ATS Scanner",
    tagline: "Instantly score and optimize your resume",
    desc: "Upload your CV and let our advanced scanning AI evaluate it against modern corporate ATS algorithms. Get instant alignment scores, critical missing keywords, and structural improvement advice.",
    badge: "AI Powered",
    color: "from-purple-600 to-indigo-500",
    glow: "rgba(139,92,246,0.15)"
  },
  {
    id: "video-interview",
    icon: Video,
    title: "AI Video Interviews",
    tagline: "Practice and get assessed on-camera with AI feedback",
    desc: "Prepare for final round assessments by undertaking interactive AI-facilitated mock interviews. Get analytical metrics on technical matching, vocabulary alignment, and verbal confidence.",
    badge: "State of Art",
    color: "from-pink-600 to-rose-500",
    glow: "rgba(244,63,94,0.15)"
  },
  {
    id: "direct-chat",
    icon: MessagesSquare,
    title: "Instant Chat Panel",
    tagline: "Direct connection with recruiters, zero middleman",
    desc: "Skip long email chains. Message hiring managers directly through our high-speed socket chat panel. Share portfolios, schedule interviews, and accept offers in real-time.",
    badge: "Direct Line",
    color: "from-emerald-600 to-teal-500",
    glow: "rgba(16,185,129,0.15)"
  }
];

export default function ServiceDemoShowcase() {
  const [activeTab, setActiveTab] = useState("resume-builder");
  const showcaseRef = useRef(null);

  // Automatically cycle through core services every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((current) => {
        const idx = services.findIndex((s) => s.id === current);
        const nextIdx = (idx + 1) % services.length;
        return services[nextIdx].id;
      });
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // Smooth left-to-right GSAP sliding transition on tab cycle
  useEffect(() => {
    if (showcaseRef.current) {
      gsap.fromTo(
        showcaseRef.current,
        { opacity: 0, x: -35, filter: "blur(4px)" },
        { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.6, ease: "power2.out" }
      );
    }
  }, [activeTab]);

  return (
    <section className="py-20 px-4 sm:py-28 relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/5 rounded-full blur-3xl" />

      <div className="mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400 mb-4"
          >
            <Sparkles className="h-3.5 w-3.5" /> High-Performance Capabilities
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-black text-slate-900 dark:text-white sm:text-5xl tracking-tight"
          >
            Explore Our Core Services
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-base text-slate-500 dark:text-slate-400 sm:text-lg leading-relaxed"
          >
            We've revolutionized candidate evaluation and recruitment. Click through our services to see our AI and platform workflows in action.
          </motion.p>
        </div>

        {/* Tab Controls and Dynamic Showcase Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Tab Selectors */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {services.map((service, idx) => {
              const Icon = service.icon;
              const isActive = activeTab === service.id;
              return (
                <motion.button
                  key={service.id}
                  onClick={() => setActiveTab(service.id)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`text-left p-6 rounded-2xl border transition-all duration-300 flex items-start gap-4 relative overflow-hidden ${
                    isActive
                      ? "bg-white dark:bg-slate-900 border-blue-500/30 dark:border-blue-400/30 shadow-xl shadow-slate-200/50 dark:shadow-none"
                      : "bg-white/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 hover:bg-white dark:hover:bg-slate-900"
                  }`}
                >
                  {/* Active highlight background border */}
                  {isActive && (
                    <motion.div
                      layoutId="active-border"
                      className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-600 to-cyan-500 dark:from-blue-500 dark:to-cyan-400"
                    />
                  )}

                  <div className={`p-3 rounded-xl bg-gradient-to-br ${service.color} text-white shadow-md flex-shrink-0`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight">
                        {service.title}
                      </h3>
                      <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {service.badge}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 font-display">
                      {service.tagline}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {service.desc}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Right: Interactive Live Simulation Box */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 min-h-[460px] flex flex-col justify-between relative overflow-hidden">
              {/* Top window bar style */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display">
                  Live Action Demo Simulator
                </div>
              </div>

              {/* Showcase views */}
              <div ref={showcaseRef} className="flex-1 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {activeTab === "resume-builder" && <ResumeBuilderDemo />}
                  {activeTab === "ats-scanner" && <AtsScannerDemo />}
                  {activeTab === "video-interview" && <VideoInterviewDemo />}
                  {activeTab === "direct-chat" && <DirectChatDemo />}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── 1. RESUME BUILDER SIMULATION ─────────── */
function ResumeBuilderDemo() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({ name: "", role: "", skills: "" });

  useEffect(() => {
    // Stage-based simulation steps
    const timer1 = setTimeout(() => {
      setFormData({ name: "Alex Harrison", role: "", skills: "" });
      setStep(1);
    }, 1500);

    const timer2 = setTimeout(() => {
      setFormData({ name: "Alex Harrison", role: "Lead Frontend Engineer", skills: "" });
      setStep(2);
    }, 3200);

    const timer3 = setTimeout(() => {
      setFormData({
        name: "Alex Harrison",
        role: "Lead Frontend Engineer",
        skills: "React, Redux, GSAP, Tailwind CSS, TypeScript"
      });
      setStep(3);
    }, 4900);

    const timerReset = setTimeout(() => {
      setFormData({ name: "", role: "", skills: "" });
      setStep(0);
    }, 9000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timerReset);
    };
  }, [step]);

  return (
    <motion.div
      key="resume-builder-demo"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch"
    >
      {/* Left Pane: Interactive inputs */}
      <div className="flex flex-col gap-4 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
        <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
          Builder Inputs
        </h4>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Full Name</label>
            <div className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
              {formData.name || <span className="text-slate-300 dark:text-slate-600 animate-pulse">Typing...</span>}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Target Role</label>
            <div className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
              {step >= 1 ? (
                formData.role || <span className="text-slate-300 dark:text-slate-600 animate-pulse">Typing...</span>
              ) : (
                ""
              )}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Core Competencies</label>
            <div className="min-h-16 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300">
              {step >= 2 ? (
                formData.skills || <span className="text-slate-300 dark:text-slate-600 animate-pulse">Typing...</span>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane: CV Realtime Render Output */}
      <div className="relative border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-900 flex flex-col gap-3 justify-between shadow-sm overflow-hidden">
        {step === 3 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-2 right-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-[9px] uppercase tracking-wider px-2 py-1 rounded-full shadow flex items-center gap-1 z-10"
          >
            <Sparkles className="h-3 w-3" /> ATS Checked
          </motion.div>
        )}

        <div className="flex flex-col gap-2">
          {/* Header render */}
          <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
            <h5 className="font-extrabold text-sm text-slate-900 dark:text-white h-5">
              {formData.name || "..."}
            </h5>
            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 h-4">
              {formData.role || "..."}
            </p>
          </div>

          {/* Profile summary mockup */}
          <div>
            <div className="h-2 w-16 bg-slate-100 dark:bg-slate-800 rounded mb-1.5" />
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded mb-1" />
            <div className="h-1.5 w-5/6 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>

          {/* Skills block mockup */}
          <div>
            <div className="h-2 w-20 bg-slate-100 dark:bg-slate-800 rounded mb-2" />
            <div className="flex flex-wrap gap-1.5 h-10 overflow-hidden">
              {formData.skills ? (
                formData.skills.split(", ").map((s) => (
                  <span
                    key={s}
                    className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <div className="text-[10px] text-slate-300 dark:text-slate-600 animate-pulse">Waiting for content...</div>
              )}
            </div>
          </div>
        </div>

        {/* Action download mock */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400">Layout Template: Paris</span>
          <button className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 hover:underline">
            Download PDF
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────── 2. ATS RESUME SCANNER SIMULATION ─────────── */
function AtsScannerDemo() {
  const [scanState, setScanState] = useState("idle"); // idle, scanning, result
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Automatic cycle
    const startScan = setTimeout(() => {
      setScanState("scanning");
    }, 1200);

    const finishScan = setTimeout(() => {
      setScanState("result");
    }, 3500);

    const resetScan = setTimeout(() => {
      setScanState("idle");
      setScore(0);
    }, 9000);

    return () => {
      clearTimeout(startScan);
      clearTimeout(finishScan);
      clearTimeout(resetScan);
    };
  }, [scanState]);

  useEffect(() => {
    if (scanState === "result") {
      let current = 0;
      const interval = setInterval(() => {
        if (current < 88) {
          current += 2;
          setScore(current);
        } else {
          clearInterval(interval);
        }
      }, 20);
      return () => clearInterval(interval);
    }
  }, [scanState]);

  return (
    <motion.div
      key="ats-scanner-demo"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center p-4 min-h-[300px]"
    >
      {scanState === "idle" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-300 dark:border-slate-800 flex items-center justify-center text-slate-400 animate-bounce">
            <Plus className="h-6 w-6" />
          </div>
          <div>
            <h5 className="font-extrabold text-slate-800 dark:text-slate-200">Upload Resume</h5>
            <p className="text-xs text-slate-400 mt-1">Accepts DOCX or PDF format up to 5MB</p>
          </div>
        </div>
      )}

      {scanState === "scanning" && (
        <div className="w-full max-w-sm flex flex-col items-center gap-6 relative">
          {/* Scanning line simulation */}
          <div className="w-48 h-64 border border-slate-200 dark:border-slate-800 rounded-xl relative overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col gap-2 p-3">
            {/* The laser line */}
            <motion.div
              animate={{ y: [0, 240, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 shadow-md shadow-blue-500"
            />
            {/* Mock text lines inside file */}
            <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-2 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-2 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-2 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded mt-4" />
            <div className="h-2 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-2 w-11/12 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 animate-pulse tracking-widest uppercase">
            AI Algorithm Analysing Resume...
          </span>
        </div>
      )}

      {scanState === "result" && (
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Radial score gauge */}
          <div className="md:col-span-5 flex flex-col items-center text-center">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <motion.path
                  className="text-purple-600 dark:text-purple-500"
                  strokeWidth="2.5"
                  strokeDasharray={`${score}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                  {score}%
                </span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  ATS Score
                </span>
              </div>
            </div>
            <h5 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mt-3 leading-none">
              High Match Quality
            </h5>
          </div>

          {/* Keyword indicators */}
          <div className="md:col-span-7 flex flex-col gap-3">
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 block mb-1">
                Matched Keywords (+12)
              </span>
              <div className="flex flex-wrap gap-1">
                {["React.js", "Redux Toolkit", "Vite", "TypeScript"].map((k) => (
                  <span
                    key={k}
                    className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-950/40"
                  >
                    <CheckCircle className="h-2.5 w-2.5" /> {k}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-extrabold text-slate-400 block mb-1">
                Critical Missing Keywords (-3)
              </span>
              <div className="flex flex-wrap gap-1">
                {["Docker", "CI/CD Pipeline", "Unit Testing"].map((k) => (
                  <span
                    key={k}
                    className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-dashed border-rose-200 dark:border-rose-900/40"
                  >
                    <AlertCircle className="h-2.5 w-2.5" /> {k}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ─────────── 3. AI VIDEO INTERVIEW SIMULATION ─────────── */
function VideoInterviewDemo() {
  const [question, setQuestion] = useState("");
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    // Typewriter question
    const qText = "Q1: Explain how you optimize rendering performance in a large React list application.";
    let i = 0;
    const interval = setInterval(() => {
      if (i < qText.length) {
        setQuestion((prev) => prev + qText.charAt(i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 30);

    const resultTimer = setTimeout(() => {
      setShowResult(true);
    }, 4500);

    const resetTimer = setTimeout(() => {
      setQuestion("");
      setShowResult(false);
    }, 9000);

    return () => {
      clearInterval(interval);
      clearTimeout(resultTimer);
      clearTimeout(resetTimer);
    };
  }, []);

  return (
    <motion.div
      key="video-interview-demo"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch"
    >
      {/* Mock Webcam View */}
      <div className="md:col-span-7 rounded-2xl bg-slate-950 border border-slate-900 relative overflow-hidden flex flex-col justify-end aspect-video md:aspect-auto min-h-[190px]">
        {/* Rec badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded-md text-[9px] font-black text-white uppercase tracking-wider z-10">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          REC
        </div>

        {/* Silhouette avatar representing user */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <User className="w-24 h-24 text-slate-600" />
        </div>

        {/* Audio speech wave simulator */}
        <div className="absolute bottom-3 right-3 flex items-center gap-0.5 bg-black/50 p-2 rounded-lg">
          <Volume2 className="h-3 w-3 text-cyan-400" />
          <div className="flex items-end gap-[2px] h-3">
            {[3, 8, 4, 9, 6, 2, 7, 5].map((h, i) => (
              <motion.div
                key={i}
                animate={{ height: [`${h}px`, `${h * 1.5}px`, `${h * 0.5}px`, `${h}px`] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.08 }}
                className="w-[2px] bg-cyan-400 rounded-full"
              />
            ))}
          </div>
        </div>

        {/* Caption panel */}
        <div className="bg-gradient-to-t from-black via-black/70 to-transparent p-4 relative z-10">
          <p className="text-[10px] font-bold text-slate-300 leading-relaxed min-h-[30px] font-display">
            {question || <span className="animate-pulse">Loading AI query...</span>}
          </p>
        </div>
      </div>

      {/* Mock AI Analysis card */}
      <div className="md:col-span-5 flex flex-col justify-center">
        <AnimatePresence>
          {showResult ? (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3 shadow-md"
            >
              <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-widest leading-none mb-1">
                AI Feedback Report
              </h5>

              <div className="flex flex-col gap-2">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                    <span>Technical Match</span>
                    <span className="text-slate-800 dark:text-slate-200">92%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: "92%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                    <span>Verbal Confidence</span>
                    <span className="text-slate-800 dark:text-slate-200">89%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500 rounded-full" style={{ width: "89%" }} />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-2 text-[10px] leading-relaxed text-slate-400 dark:text-slate-500 font-display">
                <span className="font-extrabold text-slate-700 dark:text-slate-300">Key Terms Detected:</span> useMemo, useCallback, Virtualization, DOM Nodes.
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-6 text-xs font-bold text-slate-400 animate-pulse font-display">
              Waiting for answer submission...
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ─────────── 4. BUILT-IN CHAT SIMULATION ─────────── */
function DirectChatDemo() {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    // Initial sequence
    const t1 = setTimeout(() => {
      setMessages([{ sender: "candidate", text: "Hello! I saw your React Tech Lead opening, is it still active?" }]);
    }, 1000);

    const t2 = setTimeout(() => {
      setTyping(true);
    }, 2800);

    const t3 = setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        { sender: "recruiter", text: "Yes! Your resume ATS match looks outstanding. We'd love to schedule a video call." }
      ]);
    }, 4500);

    const t4 = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "invite", text: "Sandra invited you to a video interview: React Tech Lead Assessment" }
      ]);
    }, 6200);

    const tReset = setTimeout(() => {
      setMessages([]);
      setTyping(false);
    }, 9500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(tReset);
    };
  }, []);

  return (
    <motion.div
      key="direct-chat-demo"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-[320px] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm"
    >
      {/* Chat header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 px-4 py-3 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white font-extrabold text-xs">
          HR
        </div>
        <div>
          <h6 className="font-extrabold text-xs text-slate-800 dark:text-white leading-none">
            Sandra Vance
          </h6>
          <span className="text-[9px] font-bold text-emerald-500 leading-none block mt-1">
            Online (Talent Acquisition Specialist)
          </span>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 font-display">
        {messages.map((m, idx) => {
          if (m.sender === "invite") {
            return (
              <motion.div
                key={idx}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="self-center bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40 rounded-xl p-3 max-w-[90%] shadow-sm text-center flex flex-col gap-2"
              >
                <span className="text-[10px] font-bold text-slate-500 leading-tight">
                  {m.text}
                </span>
                <button className="h-7 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] rounded-lg shadow-sm">
                  Launch Live Assessment Session
                </button>
              </motion.div>
            );
          }

          const isCandidate = m.sender === "candidate";
          return (
            <motion.div
              key={idx}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs font-semibold leading-relaxed shadow-sm ${
                isCandidate
                  ? "self-end bg-blue-600 text-white rounded-tr-none"
                  : "self-start bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-tl-none border border-slate-100 dark:border-slate-800"
              }`}
            >
              {m.text}
            </motion.div>
          );
        })}

        {/* Typing indicator */}
        {typing && (
          <div className="self-start bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-none px-3.5 py-2.5 flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}
      </div>

      {/* Input panel placeholder */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 px-3 py-2.5 flex items-center justify-between gap-2">
        <div className="text-[10px] text-slate-400 font-bold px-2 py-1.5 bg-slate-50 dark:bg-slate-950 rounded-lg flex-1">
          Type a response...
        </div>
        <button className="p-2 rounded-lg bg-blue-600 text-white">
          <Send className="h-3 w-3" />
        </button>
      </div>
    </motion.div>
  );
}