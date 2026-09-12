import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSearchedQuery } from "@/redux/jobSlice";
import Job1 from "./Job1";
import {
  Code2, Database, Globe, Cpu, Shield, BarChart2, Palette, Video,
  Layers, Bot, Package, Megaphone, Briefcase, ArrowRight, X,
} from "lucide-react";

const categories = [
  { label: "Frontend Developer", icon: Globe, color: "from-blue-500 to-cyan-500", bg: "bg-blue-50", text: "text-blue-700" },
  { label: "Backend Developer", icon: Database, color: "from-emerald-500 to-teal-500", bg: "bg-emerald-50", text: "text-emerald-700" },
  { label: "Full Stack Developer", icon: Layers, color: "from-blue-500 to-sky-600", bg: "bg-blue-50", text: "text-blue-700" },
  { label: "MERN Developer", icon: Code2, color: "from-cyan-500 to-blue-600", bg: "bg-cyan-50", text: "text-cyan-700" },
  { label: "Data Scientist", icon: BarChart2, color: "from-orange-500 to-amber-500", bg: "bg-orange-50", text: "text-orange-700" },
  { label: "DevOps Engineer", icon: Package, color: "from-slate-600 to-slate-800", bg: "bg-slate-100", text: "text-slate-700" },
  { label: "Machine Learning", icon: Cpu, color: "from-pink-500 to-rose-500", bg: "bg-pink-50", text: "text-pink-700" },
  { label: "AI Engineer", icon: Bot, color: "from-sky-500 to-blue-600", bg: "bg-sky-50", text: "text-sky-700" },
  { label: "Cybersecurity", icon: Shield, color: "from-red-500 to-rose-600", bg: "bg-red-50", text: "text-red-700" },
  { label: "Product Manager", icon: Megaphone, color: "from-teal-500 to-cyan-600", bg: "bg-teal-50", text: "text-teal-700" },
  { label: "UX/UI Designer", icon: Palette, color: "from-fuchsia-500 to-pink-500", bg: "bg-fuchsia-50", text: "text-fuchsia-700" },
  { label: "Video Editor", icon: Video, color: "from-yellow-500 to-orange-500", bg: "bg-yellow-50", text: "text-yellow-700" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

const Categories = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { allJobs } = useSelector((store) => store.job);
  const [selectedCategory, setSelectedCategory] = useState("");

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
    setSelectedCategory(query);
  };

  const browseCategoryHandler = () => {
    if (!selectedCategory) return;
    dispatch(setSearchedQuery(selectedCategory));
    navigate("/jobs");
  };

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-16 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <span className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700 mb-3">
            Browse by Category
          </span>
          <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">
            Explore <span className="text-blue-600">Top Job</span> Categories
          </h2>
          <p className="mt-3 text-slate-500 max-w-xl mx-auto">
            Find opportunities across the most in-demand tech and creative fields
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
        >
          {categories.map((cat) => (
            <motion.button
              key={cat.label}
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.04, boxShadow: "0 12px 32px rgba(109,40,217,0.15)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => searchjobHandler(cat.label)}
              className={`group flex flex-col items-center gap-3 rounded-2xl border ${cat.bg} p-4 text-center transition-all duration-200 hover:border-blue-300 cursor-pointer ${
                selectedCategory === cat.label
                  ? "border-blue-500 ring-4 ring-blue-100 shadow-lg shadow-blue-100"
                  : "border-slate-200"
              }`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} shadow-md group-hover:shadow-lg transition-shadow`}>
                <cat.icon className="h-6 w-6 text-white" />
              </div>
              <span className={`text-xs font-bold leading-tight ${cat.text}`}>{cat.label}</span>
              <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-black text-slate-600 shadow-sm">
                {getCategoryJobs(cat.label).length} Jobs
              </span>
            </motion.button>
          ))}
        </motion.div>

        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60"
          >
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-blue-600">Category Results</p>
                <h3 className="mt-1 text-2xl font-black text-slate-900">
                  {selectedJobs.length} jobs in <span className="text-blue-600">{selectedCategory}</span>
                </h3>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("")}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:border-rose-200 hover:text-rose-600"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
                <button
                  type="button"
                  onClick={browseCategoryHandler}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
                >
                  Browse all
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {selectedJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-12 text-slate-400">
                <Briefcase className="mb-3 h-14 w-14 opacity-25" />
                <p className="text-lg font-black text-slate-500">No jobs found in this category</p>
                <p className="mt-1 text-sm">Try another category or check back later</p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {selectedJobs.slice(0, 6).map((job) => (
                  <motion.div key={job._id || job.id} variants={cardVariants}>
                    <Job1 job={job} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {selectedJobs.length > 6 && (
              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={browseCategoryHandler}
                  className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-black text-blue-700 hover:bg-blue-100"
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
