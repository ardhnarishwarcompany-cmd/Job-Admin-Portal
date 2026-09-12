import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAllApplicants } from "@/redux/applicationSlice";
import { APPLICATION_API_ENDPOINT } from "@/utils/data";
import Navbar from "../components_lite/Navbar";
import { Users, Filter, Search } from "lucide-react";
import ApplicantCard from "./ApplicantCard";

const Applicants = ({ hideNavbar = false }) => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { applicants } = useSelector((store) => store.application);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axios
      .get(`${APPLICATION_API_ENDPOINT}/${id}/applicants`, { withCredentials: true })
      .then((res) => dispatch(setAllApplicants(res.data?.job || res.data)))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, [id, dispatch]);

  const allApps = applicants?.applications || [];
  const jobTitle = applicants?.title || "";

  const handleStatusChange = async (status, appId) => {
    try {
      await axios.post(
        `${APPLICATION_API_ENDPOINT}/status/${appId}/update`,
        { status },
        { withCredentials: true }
      );
      // Optimistically update redux store
      const updatedApps = allApps.map((app) =>
        app._id === appId ? { ...app, status } : app
      );
      dispatch(setAllApplicants({ ...applicants, applications: updatedApps }));
    } catch (e) {
      console.error(e);
    }
  };

  const processed = useMemo(() => {
    let list = [...allApps];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((app) => {
        const p = app?.applicant?.profile || {};
        const skills = Array.isArray(p.skills) ? p.skills.join(" ") : p.skills || "";
        return (
          app?.applicant?.fullname?.toLowerCase().includes(q) ||
          app?.applicant?.email?.toLowerCase().includes(q) ||
          skills.toLowerCase().includes(q) ||
          (p.city || "").toLowerCase().includes(q)
        );
      });
    }

    if (statusFilter !== "all") {
      list = list.filter((app) => (app.status || "pending").toLowerCase() === statusFilter);
    }

    list.sort((a, b) => {
      if (sortBy === "name")
        return (a?.applicant?.fullname || "").localeCompare(b?.applicant?.fullname || "");
      if (sortBy === "date")
        return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });
    return list;
  }, [allApps, search, statusFilter, sortBy]);

  return (
    <div className={hideNavbar ? "font-sans py-4" : "min-h-screen bg-slate-50 font-sans pb-20"}>
      {!hideNavbar && <Navbar />}
      <div className={hideNavbar ? "mx-auto max-w-6xl px-0" : "mx-auto max-w-6xl px-4 py-8"}>
        {/* Header (Only when not embedded in job details) */}
        {!hideNavbar && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-700 p-5 sm:p-7 text-white shadow-2xl shadow-blue-200 mb-6"
          >
            <motion.div
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none"
            />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black">Manage Applicants</h1>
                    <p className="text-white/80 text-xs sm:text-sm">
                      {jobTitle || "Job Position"} • {allApps.length} total applicants
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-3 sm:px-4 text-xs sm:text-sm font-bold text-slate-600 outline-none hover:border-blue-300 transition-colors cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Applied</option>
              <option value="reviewed">Reviewed</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview">Interview</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-11 w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-3 sm:px-4 text-xs sm:text-sm font-bold text-slate-600 outline-none hover:border-blue-300 transition-colors cursor-pointer"
            >
              <option value="date">Newest First</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50 p-8 text-center text-rose-600 font-bold">
            {error}
          </div>
        ) : processed.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Users className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-black text-slate-900">No applicants found</h3>
            <p className="mt-1 text-sm text-slate-500">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            className="space-y-5"
          >
            <AnimatePresence>
              {processed.map((app) => (
                <ApplicantCard
                  key={app._id}
                  application={{ ...app, jobTitle }}
                  onStatusChange={handleStatusChange}
                >
                  {app.interviewStatus &&
                    app.interviewStatus !== "none" && (
                      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 mx-4 mb-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-days"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">
                                {app.interviewDay || "Selected day"} ·{" "}
                                {app.interviewDate
                                  ? String(app.interviewDate).split("T")[0]
                                  : "Date not set"}{" "}
                                · {app.interviewTime || "Time not set"}
                              </p>
                              <p className="mt-0.5 text-xs font-medium text-slate-500">
                                Status: <span className="uppercase font-bold">{app.interviewStatus}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                </ApplicantCard>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Applicants;
