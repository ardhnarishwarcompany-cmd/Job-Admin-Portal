import React, { useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import JobCards from "./JobCards";
import { useSelector } from "react-redux";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import LazyShow from "./LazyShow";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const LatestJobs = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const allJobs = useSelector((state) => state.job?.allJobs || []);
  const activeJobs = useMemo(() => allJobs.filter((j) => !j.isDeleted && j.status !== "removed"), [allJobs]);
  const containerRef = useRef(null);

  useEffect(() => {
    if (activeJobs.length === 0) return;

    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        // Heading animation
        gsap.fromTo(
          ".gsap-jobs-header",
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 85%",
            },
          }
        );

        // Job Cards grid staggered slide-up
        gsap.fromTo(
          ".gsap-job-card-wrapper",
          { opacity: 0, y: 40, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.06,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".gsap-jobs-grid",
              start: "top 80%",
            },
          }
        );
      }, containerRef.current);

      ScrollTrigger.refresh();
      return () => ctx.revert();
    }, 100);

    return () => clearTimeout(timer);
  }, [activeJobs]);

  return (
    <section
      ref={containerRef}
      className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white py-20 px-4 border-b border-slate-200 dark:border-slate-900 transition-colors duration-300 relative overflow-hidden"
    >
      <div className="mx-auto max-w-7xl relative z-10">
        
        {/* Heading */}
        <div className="gsap-jobs-header mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200 dark:border-blue-800/40 bg-blue-50/50 dark:bg-blue-950/30 px-4 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 backdrop-blur-sm shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-yellow-500" /> Fresh Opportunities
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white sm:text-4xl tracking-tight">
              Latest &amp; <span className="bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">Top Job</span> Openings
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400 font-display text-sm">
              Hand-picked opportunities from top companies
            </p>
          </div>
          <Link
            to={user ? "/jobs" : "/login"}
            onClick={(e) => {
              if (!user) {
                e.preventDefault();
                navigate("/login");
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-5 py-2.5 text-sm font-bold text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors shadow-sm"
          >
            View All Jobs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Grid */}
        {activeJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="text-6xl mb-4">💼</div>
            <p className="text-lg font-semibold text-slate-600 dark:text-slate-400">No jobs available right now</p>
            <p className="text-sm mt-1 text-slate-400">Check back soon for new opportunities</p>
          </div>
        ) : (
          <div className="gsap-jobs-grid grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {activeJobs.slice(0, 6).map((job) => {
              const key = job?._id || job?.id;
              return key ? (
                <div key={key} className="gsap-job-card-wrapper">
                  <LazyShow placeholderHeight="240px">
                    <JobCards job={{ ...job, _id: key }} />
                  </LazyShow>
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default LatestJobs;