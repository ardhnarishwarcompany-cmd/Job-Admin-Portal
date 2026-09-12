import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Job1 from "./Job1";
import LazyShow from "./LazyShow";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { USER_API_ENDPOINT } from "@/utils/data";
import { setSavedJobs } from "@/redux/jobSlice";
import { Bookmark, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const SavedJobs = () => {
  const dispatch = useDispatch();
  const { savedJobs } = useSelector((store) => store.job);
  const activeSavedJobs = React.useMemo(() => (savedJobs || []).filter((j) => !j.isDeleted && j.status !== "removed"), [savedJobs]);
  const { user } = useSelector((store) => store.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const res = await axios.get(`${USER_API_ENDPOINT}/saved-jobs`, {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setSavedJobs(res.data.savedJobs));
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load saved jobs");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchSavedJobs();
  }, [dispatch, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-cyan-50/10">
      <Navbar />
      
      <div className="mx-auto max-w-7xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Bookmark className="h-8 w-8 text-blue-600" />
            Saved Jobs
          </h1>
          <p className="mt-2 text-slate-500">Jobs you have bookmarked for later viewing.</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        ) : activeSavedJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-3xl border border-slate-200 shadow-sm"
          >
            <Bookmark className="h-20 w-20 mb-4 opacity-20" />
            <p className="text-xl font-bold text-slate-600">No saved jobs yet</p>
            <p className="text-sm mt-2 text-slate-500">Click the bookmark icon on any job to save it here.</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {activeSavedJobs.map((job) => (
              <motion.div key={job._id || job.id} variants={cardVariants}>
                <LazyShow placeholderHeight="320px">
                  <Job1 job={job} />
                </LazyShow>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;
