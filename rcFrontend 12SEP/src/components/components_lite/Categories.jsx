import React, { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSearchedQuery } from "@/redux/jobSlice";
import Job1 from "./Job1";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Code2, Database, Globe, Cpu, Shield, BarChart2, Palette, Video,
  Layers, Bot, Package, Megaphone, Briefcase, ArrowRight, X, Sparkles,
} from "lucide-react";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const categories = [
  { label: "Frontend Developer", icon: Globe, color: "from-blue-500 to-cyan-500" },
  { label: "Backend Developer", icon: Database, color: "from-emerald-500 to-teal-500" },
  { label: "Full Stack Developer", icon: Layers, color: "from-blue-500 to-sky-600" },
  { label: "MERN Developer", icon: Code2, color: "from-cyan-500 to-blue-600" },
  { label: "Data Scientist", icon: BarChart2, color: "from-orange-500 to-amber-500" },
  { label: "DevOps Engineer", icon: Package, color: "from-slate-600 to-slate-800" },
  { label: "Machine Learning", icon: Cpu, color: "from-pink-500 to-rose-500" },
  { label: "AI Engineer", icon: Bot, color: "from-sky-500 to-blue-600" },
  { label: "Cybersecurity", icon: Shield, color: "from-red-500 to-rose-600" },
  { label: "Product Manager", icon: Megaphone, color: "from-teal-500 to-cyan-600" },
  { label: "UX/UI Designer", icon: Palette, color: "from-fuchsia-500 to-pink-500" },
  { label: "Video Editor", icon: Video, color: "from-yellow-500 to-orange-500" },
];

const Categories = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { allJobs } = useSelector((store) => store.job);
  const { user } = useSelector((store) => store.auth);
  const [selectedCategory, setSelectedCategory] = useState("");

  const containerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        // Header block animate
        gsap.fromTo(
          ".gsap-cat-header",
          { opacity: 0, y: 40 },
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

        // Staggered 3D entrance of categories cards coming from different directions
        gsap.utils.toArray(".gsap-cat-card").forEach((card, idx) => {
          let startX = 0;
          let startY = 0;
          const direction = idx % 4;
          if (direction === 0) startX = -100; // Left
          else if (direction === 1) startX = 100;  // Right
          else if (direction === 2) startY = -70;  // Top
          else if (direction === 3) startY = 70;   // Bottom

          gsap.fromTo(
            card,
            { opacity: 0, x: startX, y: startY, rotateX: direction % 2 === 0 ? -12 : 12, scale: 0.9 },
            {
              opacity: 1,
              x: 0,
              y: 0,
              rotateX: 0,
              scale: 1,
              duration: 0.85,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 90%",
              },
            }
          );
        });
      }, containerRef.current);

      ScrollTrigger.refresh();
      return () => ctx.revert();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const getCategoryJobs = (category) => {
    const query = category.toLowerCase();
    const queryWords = query.split(/\s+/).filter(Boolean);

    return (allJobs || []).filter((job) => {
      const searchableText = [
        job?.title,
        job?.description,
        job?.jobType,
        job?.location,
        job?.company?.name,
        job?.skills,
        job?.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query) || queryWords.some((word) => searchableText.includes(word));
    });
  };

  const selectedJobs = useMemo(
    () => (selectedCategory ? getCategoryJobs(selectedCategory) : []),
    [allJobs, selectedCategory]
  );

  const searchjobHandler = (query) => {
    if (!user) {
      navigate("/login");
    } else {
      setSelectedCategory(query);
    }
  };

  const browseCategoryHandler = () => {
    if (!selectedCategory) return;
    if (!user) {
      navigate("/login");
      return;
    }
    dispatch(setSearchedQuery(selectedCategory));
    navigate("/jobs");
  };

  return (
    <section
      ref={containerRef}
      className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white py-20 px-4 border-b border-slate-200 dark:border-slate-900 transition-colors duration-300 relative overflow-hidden"
    >
      {/* Background blobs */}
      <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-blue-600/5 dark:bg-blue-600/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-cyan-600/5 dark:bg-cyan-600/5 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-6xl relative z-10">
        
        {/* Heading */}
        <div className="gsap-cat-header mb-12 text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200 dark:border-blue-800/40 bg-blue-50/50 dark:bg-blue-950/30 px-4 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 backdrop-blur-sm shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-yellow-500" /> Browse by Category
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white sm:text-4xl tracking-tight">
            Explore <span className="bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">Top Job</span> Categories
          </h2>
          <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-display text-sm">
            Find opportunities across the most in-demand tech and creative fields
          </p>
        </div>

        {/* Grid */}
        <div className="gsap-cat-grid grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 [perspective:1000px]">
          {categories.map((cat) => (
            <motion.button
              key={cat.label}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => searchjobHandler(cat.label)}
              className={`gsap-cat-card group flex flex-col items-center gap-3 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-4 text-center transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-xl cursor-pointer ${
                selectedCategory === cat.label
                  ? "border-blue-500 dark:border-blue-400 ring-4 ring-blue-500/10 dark:ring-blue-500/20 shadow-md"
                  : ""
              }`}
            >
              <div className={`animate-float-icon flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} shadow-md group-hover:shadow-lg transition-shadow`}>
                <cat.icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-bold leading-tight text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {cat.label}
              </span>
              <span className="rounded-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/80 px-2.5 py-1 text-[11px] font-black text-slate-600 dark:text-slate-400 shadow-sm group-hover:bg-blue-50 dark:group-hover:bg-slate-800 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                {getCategoryJobs(cat.label).length} Jobs
              </span>
            </motion.button>
          ))}
        </div>

        {/* Selected Category Dropdown results */}
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mt-10 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-6 shadow-xl dark:shadow-none"
          >
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Category Results</p>
                <h3 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                  {selectedJobs.length} jobs in <span className="text-blue-600 dark:text-blue-455">{selectedCategory}</span>
                </h3>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("")}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:border-rose-200 dark:hover:border-rose-900 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
                <button
                  type="button"
                  onClick={browseCategoryHandler}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors"
                >
                  Browse all
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {selectedJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 py-12 text-slate-400">
                <Briefcase className="mb-3 h-14 w-14 opacity-25" />
                <p className="text-lg font-black text-slate-500 dark:text-slate-400">No jobs found in this category</p>
                <p className="mt-1 text-sm text-slate-400 dark:text-slate-500 font-display">Try another category or check back later</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {selectedJobs.slice(0, 6).map((job) => (
                  <Job1 key={job._id || job.id} job={job} />
                ))}
              </div>
            )}

            {selectedJobs.length > 6 && (
              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={browseCategoryHandler}
                  className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950 px-5 py-2.5 text-sm font-black text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                >
                  View remaining {selectedJobs.length - 6} jobs
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Categories;