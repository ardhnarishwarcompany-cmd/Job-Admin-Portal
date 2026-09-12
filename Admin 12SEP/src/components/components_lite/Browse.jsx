import React, { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import Job1 from "./Job1";
import { useDispatch, useSelector } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import useGetAllJobs from "@/hooks/useGetAllJobs";
import { Search, Briefcase } from "lucide-react";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const Browse = () => {
  useGetAllJobs();
  const { allJobs, searchedQuery } = useSelector((store) => store.job);
  const dispatch = useDispatch();

  const filteredJobs = useMemo(() => {
    if (!searchedQuery || searchedQuery.trim() === "") return allJobs;

    const query = searchedQuery.toLowerCase();
    const queryWords = query.split(/\s+/).filter(Boolean);

    return (allJobs || []).filter((job) => {
      const searchableText = [
        job?.title,
        job?.description,
        job?.jobType,
        job?.location,
        job?.experience,
        job?.salary,
        job?.company?.name,
        job?.skills,
        job?.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query) || queryWords.some((word) => searchableText.includes(word));
    });
  }, [allJobs, searchedQuery]);

  useEffect(() => {
    return () => { dispatch(setSearchedQuery("")); };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-cyan-50/10">
      <Navbar />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-600 to-cyan-700 py-10 px-4 text-white text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Search className="h-5 w-5 opacity-80" />
          <span className="text-sm font-semibold opacity-80 uppercase tracking-widest">Search Results</span>
        </div>
        <h1 className="text-3xl font-black">
          {filteredJobs.length} <span className="text-yellow-300">Jobs</span> Found
        </h1>
        <p className="text-white/70 text-sm mt-1">
          {searchedQuery ? `Results for "${searchedQuery}"` : "Browse all available opportunities"}
        </p>
      </motion.div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {filteredJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-slate-400"
          >
            <Briefcase className="h-20 w-20 mb-4 opacity-20" />
            <p className="text-xl font-bold">No jobs found</p>
            <p className="text-sm mt-2">Try a different search term</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredJobs.map((job) => {
              const key = job?._id || job?.id;
              return key ? (
                <motion.div key={key} variants={cardVariants}>
                  <Job1 job={{ ...job, _id: key }} />
                </motion.div>
              ) : null;
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Browse;
