import React from "react";
import { motion } from "framer-motion";
import JobCards from "./JobCards";
import { useSelector } from "react-redux";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const LatestJobs = () => {
  const allJobs = useSelector((state) => state.job?.allJobs || []);

  return (
    <section className="bg-white py-16 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700 mb-3">
              <Sparkles className="h-4 w-4" /> Fresh Opportunities
            </span>
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">
              Latest &amp; <span className="text-blue-600">Top Job</span> Openings
            </h2>
            <p className="mt-2 text-slate-500">Hand-picked opportunities from top companies</p>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-100 transition-colors"
          >
            View All Jobs <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {/* Grid */}
        {allJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-slate-400"
          >
            <div className="text-6xl mb-4">💼</div>
            <p className="text-lg font-semibold">No jobs available right now</p>
            <p className="text-sm mt-1">Check back soon for new opportunities</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {allJobs.slice(0, 6).map((job) => {
              const key = job?._id || job?.id;
              return key ? (
                <motion.div key={key} variants={cardVariants}>
                  <JobCards job={{ ...job, _id: key }} />
                </motion.div>
              ) : null;
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default LatestJobs;
