import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import axios from "axios";
import { APPLICATION_API_ENDPOINT } from "@/utils/data";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Briefcase,
  CalendarDays,
} from "lucide-react";
import Navbar from "../components_lite/Navbar";
import ApplicantCard from "./ApplicantCard";

const interviewStatusConfig = {
  requested: {
    label: "Interview Requested",
    color: "bg-sky-100 text-sky-700 border-sky-200",
    icon: Clock,
  },
  confirmed: {
    label: "Interview Confirmed",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Interview Rejected",
    color: "bg-rose-100 text-rose-700 border-rose-200",
    icon: XCircle,
  },
};

const ManageApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filters, setFilters] = useState({
    skill: "",
    city: "",
    experience: "",
    education: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useSelector((store) => store.auth);

  useEffect(() => {
    if (user?.role !== "Recruiter") return;
    setLoading(true);
    axios
      .get(`${APPLICATION_API_ENDPOINT}/recruiter/applications`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.success) setApplications(res.data.applications);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const filteredApplications = applications.filter((app) => {
    const applicant = app.applicant;
    const skills = Array.isArray(applicant?.profile?.skills)
      ? applicant.profile.skills
      : applicant?.profile?.skills?.split(",").map((s) => s.trim()) || [];

    const matchSearch =
      applicant?.fullname?.toLowerCase().includes(search.toLowerCase()) ||
      app.job?.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || app.status === statusFilter;
    const matchSkill =
      !filters.skill ||
      skills.some((s) => s.toLowerCase().includes(filters.skill.toLowerCase()));
    const matchCity =
      !filters.city ||
      (applicant?.profile?.city || "")
        .toLowerCase()
        .includes(filters.city.toLowerCase());
    const matchExp =
      !filters.experience ||
      (applicant?.profile?.experience || "")
        .toLowerCase()
        .includes(filters.experience.toLowerCase());
    const matchEdu =
      !filters.education ||
      (applicant?.profile?.education || "")
        .toLowerCase()
        .includes(filters.education.toLowerCase());

    return (
      matchSearch &&
      matchStatus &&
      matchSkill &&
      matchCity &&
      matchExp &&
      matchEdu
    );
  });

  const handleStatusUpdate = async (status, applicationId) => {
    try {
      await axios.post(
        `${APPLICATION_API_ENDPOINT}/status/${applicationId}/update`,
        { status },
        { withCredentials: true }
      );
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status } : app
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleInterviewStatusUpdate = async (applicationId, status) => {
    try {
      await axios.post(
        `${APPLICATION_API_ENDPOINT}/interview/status/${applicationId}`,
        { status },
        { withCredentials: true }
      );
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId
            ? {
                ...app,
                interviewStatus: status,
                interviewRespondedAt: new Date().toISOString(),
              }
            : app
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20 pb-20">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-blue-600" /> Manage Applications
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {applications.length} total applications received
          </p>
        </motion.div>

        {/* Search & filters bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-5 space-y-3"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search applicant or job..."
                className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder-slate-400"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 outline-none hover:border-blue-300 transition-colors cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Applied</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview">Interview</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-200 ${
                  showFilters
                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
                }`}
              >
                <Filter className="h-3.5 w-3.5" /> Filters
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm overflow-hidden"
              >
                {[
                  { key: "skill", placeholder: "Filter by skill..." },
                  { key: "city", placeholder: "Filter by city..." },
                  { key: "experience", placeholder: "Filter by experience..." },
                  { key: "education", placeholder: "Filter by education..." },
                ].map((f) => (
                  <input
                    key={f.key}
                    value={filters[f.key]}
                    onChange={(e) =>
                      setFilters({ ...filters, [f.key]: e.target.value })
                    }
                    placeholder={f.placeholder}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Applications list */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-36 rounded-2xl bg-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.07 } },
            }}
            className="space-y-5"
          >
            <AnimatePresence>
              {filteredApplications.map((app) => {
                const interviewStatus =
                  interviewStatusConfig[app.interviewStatus];
                const InterviewStatusIcon = interviewStatus?.icon;

                return (
                  <ApplicantCard
                    key={app._id}
                    application={app}
                    onStatusChange={handleStatusUpdate}
                  >
                    {app.interviewStatus &&
                      app.interviewStatus !== "none" &&
                      interviewStatus && (
                        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 mx-4 mb-4">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                                <CalendarDays className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${interviewStatus.color}`}
                                  >
                                    <InterviewStatusIcon className="h-3.5 w-3.5" />
                                    {interviewStatus.label}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm font-bold text-slate-800">
                                  {app.interviewDay || "Selected day"} ·{" "}
                                  {app.interviewDate
                                    ? String(app.interviewDate).split("T")[0]
                                    : "Date not set"}{" "}
                                  · {app.interviewTime || "Time not set"}
                                </p>
                                <p className="mt-0.5 text-xs font-medium text-slate-500">
                                  Candidate requested this interview slot.
                                  Confirm or reject it from here.
                                </p>
                              </div>
                            </div>

                            {app.interviewStatus === "requested" && (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleInterviewStatusUpdate(
                                      app._id,
                                      "confirmed"
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white hover:bg-emerald-700 transition-colors shadow-sm hover:shadow-md"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Confirm
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleInterviewStatusUpdate(
                                      app._id,
                                      "rejected"
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-black text-white hover:bg-rose-700 transition-colors shadow-sm hover:shadow-md"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                  </ApplicantCard>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filteredApplications.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-slate-400"
          >
            <Briefcase className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-lg font-semibold">No applications found</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ManageApplications;
