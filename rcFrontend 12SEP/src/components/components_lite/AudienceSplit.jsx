import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Briefcase, Users, CheckCircle2, ArrowRight, Search, FileText,
  Bell, ScanSearch, ClipboardCheck, Wand2, Users2, MessagesSquare, Sparkles,
} from "lucide-react";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const audiences = {
  candidate: {
    label: "For Job Seekers",
    icon: Briefcase,
    color: "from-blue-600 to-cyan-600",
    heading: "Everything you need to land the job",
    points: [
      { icon: Search, text: "Search thousands of live openings across every category" },
      { icon: FileText, text: "Build an ATS-friendly resume with our AI CV Maker in minutes" },
      { icon: ScanSearch, text: "Check your resume's real AI ATS score before you apply" },
      { icon: Bell, text: "Get matched to roles that fit your skills automatically" },
    ],
    cta: { label: "Create your profile", to: "/register" },
  },
  recruiter: {
    label: "For Recruiters",
    icon: Users,
    color: "from-emerald-600 to-teal-600",
    heading: "Hire faster with less manual work",
    points: [
      { icon: Wand2, text: "Generate a strong job description with AI JD Maker" },
      { icon: Users2, text: "Search and filter the candidate pool directly" },
      { icon: ClipboardCheck, text: "Track every application from submitted to hired" },
      { icon: MessagesSquare, text: "Message shortlisted candidates directly, no email chains" },
    ],
    cta: { label: "Start hiring", to: "/recruiter/register" },
  },
};

const AudienceSplit = () => {
  const [active, setActive] = useState("candidate");
  const navigate = useNavigate();
  const data = audiences[active];
  const containerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        // Stagger fade-in of elements
        gsap.fromTo(
          [".gsap-audience-header", ".gsap-audience-toggle", ".gsap-audience-content"],
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.12,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 85%",
            },
          }
        );
      }, containerRef.current);

      ScrollTrigger.refresh();
      return () => ctx.revert();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      ref={containerRef}
      className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white py-20 px-4 border-b border-slate-200 dark:border-slate-900 transition-colors duration-300 relative overflow-hidden"
    >
      {/* Background blobs */}
      <div className="absolute top-0 left-0 h-80 w-80 rounded-full bg-blue-600/5 dark:bg-blue-600/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-600/5 dark:bg-cyan-600/5 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-5xl relative z-10">
        
        {/* Heading */}
        <div className="gsap-audience-header mx-auto mb-10 max-w-2xl text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200 dark:border-blue-800/40 bg-blue-50/50 dark:bg-blue-950/30 px-4 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 backdrop-blur-sm shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-yellow-500" /> Platform Orchestrators
          </span>
          <h2 className="text-3xl font-black text-slate-950 dark:text-white sm:text-4xl tracking-tight">
            Built for both sides of the table
          </h2>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 font-display">
            Pick your side to see what ArdhnariShwar does for you.
          </p>
        </div>

        {/* Toggle */}
        <div className="gsap-audience-toggle mx-auto mb-8 flex w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-sm">
          {Object.entries(audiences).map(([key, a]) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors duration-200 cursor-pointer ${
                active === key ? "text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              {active === key && (
                <motion.div
                  layoutId="audienceTab"
                  className={`absolute inset-0 rounded-xl bg-gradient-to-r ${a.color}`}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <a.icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10">{a.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="gsap-audience-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-lg dark:shadow-none sm:p-10"
            >
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
                <div>
                  <h3 className="text-2xl font-black text-slate-950 dark:text-white sm:text-3xl tracking-tight">
                    {data.heading}
                  </h3>
                  <div className="mt-6 space-y-4">
                    {data.points.map((p, i) => (
                      <motion.div
                        key={p.text}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.08 }}
                        className="flex items-start gap-3"
                      >
                        <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${data.color} shadow`}>
                          <p.icon className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 sm:text-base">
                          {p.text}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate(data.cta.to)}
                    className={`mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${data.color} px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all cursor-pointer`}
                  >
                    {data.cta.label} <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </div>

                <div className="hidden lg:block">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className={`rounded-3xl bg-gradient-to-br ${data.color} p-8 shadow-2xl`}
                  >
                    <div className="rounded-2xl bg-white/10 dark:bg-slate-950/20 p-6 backdrop-blur-sm border border-white/5">
                      <div className="mb-4 flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-white/40 animate-pulse" />
                        <div className="h-3 w-3 rounded-full bg-white/40 animate-pulse delay-100" />
                        <div className="h-3 w-3 rounded-full bg-white/40 animate-pulse delay-200" />
                      </div>
                      {data.points.map((p) => (
                        <div key={p.text} className="mb-2.5 flex items-center gap-2 rounded-lg bg-white/10 dark:bg-white/5 px-3 py-2.5">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-white" />
                          <div className="h-2 flex-1 rounded-full bg-white/30" />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};

export default AudienceSplit;