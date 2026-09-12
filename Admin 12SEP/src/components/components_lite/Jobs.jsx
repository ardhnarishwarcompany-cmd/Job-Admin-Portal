import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import FilterCard from "./Filtercard";
import CvJobSearch from "./CvJobSearch";
import Job1 from "./Job1";
import { useSelector, useDispatch } from "react-redux";
import { Briefcase, SlidersHorizontal, X } from "lucide-react";
import { getSocket } from "@/utils/socket";
import { updateJobStatus } from "@/redux/jobSlice";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const Jobs = () => {
  const { allJobs, searchedQuery } = useSelector((store) => store.job);
  const [filterJobs, setFilterJobs] = useState(allJobs);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    
    const handleJobStatus = (data) => {
      dispatch(updateJobStatus(data));
    };
    
    socket.on("jobStatusUpdated", handleJobStatus);
    return () => {
      socket.off("jobStatusUpdated", handleJobStatus);
    };
  }, [dispatch]);

  useEffect(() => {
    if (!searchedQuery || typeof searchedQuery !== "object") {
      let q = typeof searchedQuery === "string" ? searchedQuery.toLowerCase() : "";
      if (!q) { setFilterJobs(allJobs); return; }
      setFilterJobs(
        allJobs.filter((job) =>
          (job.title && job.title.toLowerCase().includes(q)) ||
          (job.description && job.description.toLowerCase().includes(q)) ||
          (job.location && job.location.toLowerCase().includes(q))
        )
      );
      return;
    }

    const { location = [], technology = [], experience = [], salary = [], jobType = [], workMode = [], industry = [] } = searchedQuery;

    if (!location.length && !technology.length && !experience.length && !salary.length && !jobType.length && !workMode.length && !industry.length) {
      setFilterJobs(allJobs);
      return;
    }

    setFilterJobs(
      allJobs.filter((job) => {
        const matchLocation = !location.length || location.some(loc => job.location?.toLowerCase().includes(loc.toLowerCase()));
        const matchTech = !technology.length || technology.some(tech =>
          job.title?.toLowerCase().includes(tech.toLowerCase()) ||
          job.description?.toLowerCase().includes(tech.toLowerCase()) ||
          job.skills?.toLowerCase().includes(tech.toLowerCase())
        );
        
        const getJobExpNumber = (expStr) => {
          if (!expStr) return 0;
          const match = String(expStr).match(/(\d+)/);
          return match ? parseInt(match[1]) : 0;
        };
        const checkExperienceMatch = (jobExpStr, selectedFilters) => {
          if (!selectedFilters || selectedFilters.length === 0) return true;
          const jobExp = getJobExpNumber(jobExpStr);
          return selectedFilters.some(filter => {
            const f = filter.toLowerCase();
            if (f.includes("fresher") || f.includes("0-1")) return jobExp <= 1;
            if (f.includes("0-3")) return jobExp >= 0 && jobExp <= 3;
            if (f.includes("3-5")) return jobExp >= 3 && jobExp <= 5;
            if (f.includes("5-7")) return jobExp >= 5 && jobExp <= 7;
            if (f.includes("7-10")) return jobExp >= 7 && jobExp <= 10;
            if (f.includes("10+")) return jobExp >= 10;
            return false;
          });
        };
        const matchExp = checkExperienceMatch(job.experienceLevel, experience);
        const checkSalaryMatch = (jobSalaryStr, selectedFilters) => {
          if (!selectedFilters || selectedFilters.length === 0) return true;
          let jobSalaryLPA = 0;
          if (jobSalaryStr) {
            const str = String(jobSalaryStr).toLowerCase();
            if (str.includes("lpa")) {
              const match = str.match(/(\d+(\.\d+)?)/);
              if (match) jobSalaryLPA = parseFloat(match[1]);
            } else {
              const match = str.match(/(\d+)/);
              if (match) {
                let val = parseFloat(match[1]);
                jobSalaryLPA = val > 1000 ? val / 100000 : val;
              }
            }
          }
          return selectedFilters.some(filter => {
            const f = filter.toLowerCase();
            if (f.includes("0-3")) return jobSalaryLPA >= 0 && jobSalaryLPA <= 3;
            if (f.includes("3-6")) return jobSalaryLPA >= 3 && jobSalaryLPA <= 6;
            if (f.includes("6-10")) return jobSalaryLPA >= 6 && jobSalaryLPA <= 10;
            if (f.includes("10-15")) return jobSalaryLPA >= 10 && jobSalaryLPA <= 15;
            if (f.includes("15-25")) return jobSalaryLPA >= 15 && jobSalaryLPA <= 25;
            if (f.includes("25") && f.includes("+")) return jobSalaryLPA >= 25;
            return false;
          });
        };
        const matchSalary = checkSalaryMatch(job.salary, salary);
        let parsedDetails = {};
        if (job.jobDetails) {
          try { parsedDetails = typeof job.jobDetails === "string" ? JSON.parse(job.jobDetails) : job.jobDetails; } catch(e){}
        }
        const actualJobType = parsedDetails.employmentType || job.jobType || "";
        const isOldWorkMode = ["remote", "hybrid", "work from home", "work from office", "onsite"].some(w => String(job.jobType || "").toLowerCase().includes(w));
        const actualWorkMode = parsedDetails.workMode || (isOldWorkMode ? job.jobType : "");

        const matchJobType = !jobType.length || jobType.some(jt => String(actualJobType)?.toLowerCase().includes(jt.toLowerCase()));
        const matchWorkMode = !workMode.length || workMode.some(wm => String(actualWorkMode)?.toLowerCase().includes(wm.toLowerCase()));
        const matchIndustry = !industry.length || industry.some(ind => String(job.industry || "")?.toLowerCase().includes(ind.toLowerCase()));

        return matchLocation && matchTech && matchExp && matchSalary && matchJobType && matchWorkMode && matchIndustry;
      })
    );
  }, [allJobs, searchedQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-cyan-50/10">
      <Navbar />

      {/* Hero bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm"
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900">
              <span className="text-blue-600">{filterJobs.length}</span> Jobs Available
            </h1>
            {searchedQuery && typeof searchedQuery === "string" && (
              <p className="text-sm text-slate-500 mt-0.5">
                Results for "<span className="font-semibold text-blue-600">{searchedQuery}</span>"
              </p>
            )}
          </div>
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:border-blue-300 hover:text-blue-700 transition-colors lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
        </div>
      </motion.div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop filter sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="hidden lg:block w-72 flex-shrink-0"
          >
            <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-4 shadow-md overflow-y-auto max-h-[calc(100vh-90px)]">
              <CvJobSearch />
              <FilterCard />
            </div>
          </motion.div>

          {/* Mobile filter drawer */}
          {mobileFilterOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 lg:hidden"
              onClick={() => setMobileFilterOpen(false)}
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 top-0 bottom-0 w-80 bg-white p-4 shadow-2xl overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-slate-900">Smart Search</h2>
                  <button onClick={() => setMobileFilterOpen(false)} className="rounded-lg p-1.5 hover:bg-slate-100">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <CvJobSearch />
                <FilterCard />
              </motion.div>
            </motion.div>
          )}

          {/* Jobs grid */}
          <div className="flex-1">
            {filterJobs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-slate-400"
              >
                <Briefcase className="h-20 w-20 mb-4 opacity-20" />
                <p className="text-xl font-bold">No jobs found</p>
                <p className="text-sm mt-2">Try adjusting your filters</p>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
              >
                {filterJobs.map((job) => (
                  <motion.div key={job._id || job.id} variants={cardVariants}>
                    <Job1 job={job} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
