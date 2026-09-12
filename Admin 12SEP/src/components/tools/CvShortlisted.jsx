import React, { useMemo, useState } from "react";
import Navbar from "../components_lite/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Filter,
  Loader2,
  MapPin,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import useGetAppliedJobs from "@/hooks/useGetAllAppliedJobs";

const statusConfig = {
  accepted: {
    label: "Shortlisted",
    filterLabel: "Shortlisted",
    icon: CheckCircle2,
    gradient: "from-emerald-500 to-teal-600",
    badge: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
    bar: "bg-emerald-400",
    score: 92,
  },
  rejected: {
    label: "Rejected",
    filterLabel: "Rejected",
    icon: XCircle,
    gradient: "from-rose-500 to-red-600",
    badge: "bg-rose-500/15 text-rose-200 border-rose-400/30",
    bar: "bg-rose-400",
    score: 35,
  },
  pending: {
    label: "Under Review",
    filterLabel: "Under Review",
    icon: Clock3,
    gradient: "from-amber-500 to-orange-600",
    badge: "bg-amber-500/15 text-amber-100 border-amber-400/30",
    bar: "bg-amber-400",
    score: 68,
  },
};

const normalizeStatus = (status) => {
  const normalized = String(status || "pending").toLowerCase();
  return statusConfig[normalized] ? normalized : "pending";
};

const formatDate = (value) => {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getCompanyName = (application) =>
  application?.job?.company?.name ||
  application?.job?.companyDetails?.name ||
  "Company not available";

const CvShortlisted = () => {
  useGetAppliedJobs();

  const { user } = useSelector((store) => store.auth);
  const { allAppliedJobs = [] } = useSelector((store) => store.job);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [selectedApplication, setSelectedApplication] = useState(null);

  const applications = useMemo(
    () =>
      (allAppliedJobs || []).map((application) => {
        const status = normalizeStatus(application?.status);
        return {
          ...application,
          status,
          statusMeta: statusConfig[status],
          matchScore: statusConfig[status].score,
        };
      }),
    [allAppliedJobs]
  );

  const filteredApplications = useMemo(() => {
    return applications
      .filter((application) => filterStatus === "all" || application.status === filterStatus)
      .sort((a, b) => {
        if (sortBy === "score") return b.matchScore - a.matchScore;
        if (sortBy === "company") return getCompanyName(a).localeCompare(getCompanyName(b));
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [applications, filterStatus, sortBy]);

  const stats = useMemo(
    () => ({
      total: applications.length,
      accepted: applications.filter((application) => application.status === "accepted").length,
      pending: applications.filter((application) => application.status === "pending").length,
      rejected: applications.filter((application) => application.status === "rejected").length,
    }),
    [applications]
  );

  const isEmployee = user?.role === "Employee";
  const isLoading = !allAppliedJobs && isEmployee;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-300">Job seeker status</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">CV Shortlisted</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Your applied jobs update here automatically when a recruiter shortlists or rejects your application.
          </p>
        </motion.div>

        {!user && (
          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-8 text-center">
            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-amber-300" />
            <h2 className="text-xl font-bold">Login required</h2>
            <p className="mt-2 text-sm text-slate-300">Please login as a job seeker to view your application status.</p>
            <Link
              to="/login"
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
            >
              Login
            </Link>
          </div>
        )}

        {user && !isEmployee && (
          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-8 text-center">
            <BriefcaseBusiness className="mx-auto mb-3 h-10 w-10 text-cyan-300" />
            <h2 className="text-xl font-bold">Job seeker feature</h2>
            <p className="mt-2 text-sm text-slate-300">This page shows only the logged-in job seeker's applications.</p>
          </div>
        )}

        {isEmployee && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4"
            >
              {[
                { label: "Applied", value: stats.total, icon: FileText, color: "from-cyan-500 to-blue-600" },
                { label: "Shortlisted", value: stats.accepted, icon: CheckCircle2, color: "from-emerald-500 to-teal-600" },
                { label: "Under Review", value: stats.pending, icon: Clock3, color: "from-amber-500 to-orange-600" },
                { label: "Rejected", value: stats.rejected, icon: XCircle, color: "from-rose-500 to-red-600" },
              ].map((stat) => (
                <div key={stat.label} className={`rounded-lg bg-gradient-to-br ${stat.color} p-5 shadow-lg`}>
                  <stat.icon className="mb-4 h-6 w-6 text-white" />
                  <div className="text-3xl font-black">{stat.value}</div>
                  <div className="text-sm font-semibold text-white/80">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            <div className="mb-6 grid gap-4 rounded-lg border border-white/10 bg-white/[0.06] p-4 md:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-200">
                  <Filter className="h-4 w-4" />
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All" },
                    { value: "accepted", label: statusConfig.accepted.filterLabel },
                    { value: "pending", label: statusConfig.pending.filterLabel },
                    { value: "rejected", label: statusConfig.rejected.filterLabel },
                  ].map((status) => (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => setFilterStatus(status.value)}
                      className={`rounded-lg border px-3 py-2 text-sm font-bold transition ${
                        filterStatus === status.value
                          ? "border-cyan-300 bg-cyan-300 text-slate-950"
                          : "border-white/10 bg-white/5 text-slate-200 hover:border-cyan-300/60"
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-200">
                  <TrendingUp className="h-4 w-4" />
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white outline-none focus:border-cyan-300"
                >
                  <option value="latest">Latest applied</option>
                  <option value="score">Status priority</option>
                  <option value="company">Company name</option>
                </select>
              </div>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] py-12">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-cyan-300" />
                <span className="text-sm font-semibold text-slate-200">Loading applications...</span>
              </div>
            )}

            {!isLoading && (
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredApplications.map((application, index) => {
                    const StatusIcon = application.statusMeta.icon;
                    const job = application.job || {};
                    const isSelected = selectedApplication === application.id;

                    return (
                      <motion.article
                        key={application.id || application._id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ delay: index * 0.03 }}
                        className="rounded-lg border border-white/10 bg-white/[0.06] p-5 transition hover:border-cyan-300/50"
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedApplication(isSelected ? null : application.id)}
                          className="w-full text-left"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="mb-3 flex flex-wrap items-center gap-2">
                                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${application.statusMeta.badge}`}>
                                  <StatusIcon className="h-3.5 w-3.5" />
                                  {application.statusMeta.label}
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                                  <CalendarDays className="h-3.5 w-3.5" />
                                  {formatDate(application.createdAt)}
                                </span>
                              </div>

                              <h2 className="truncate text-xl font-black text-white">{job.title || "Job title unavailable"}</h2>
                              <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-300">
                                <span className="inline-flex items-center gap-1.5">
                                  <Building2 className="h-4 w-4 text-cyan-300" />
                                  {getCompanyName(application)}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  <MapPin className="h-4 w-4 text-cyan-300" />
                                  {job.location || "Location not available"}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  <BriefcaseBusiness className="h-4 w-4 text-cyan-300" />
                                  {job.jobType || "Job type"}
                                </span>
                              </div>
                            </div>

                            <div className="w-full lg:w-48">
                              <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-300">
                                <span>Status score</span>
                                <span>{application.matchScore}/100</span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                <div
                                  className={`h-full ${application.statusMeta.bar}`}
                                  style={{ width: `${application.matchScore}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </button>

                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-5 overflow-hidden border-t border-white/10 pt-5"
                            >
                              <div className="grid gap-4 text-sm sm:grid-cols-3">
                                <div>
                                  <p className="text-slate-400">Recruiter decision</p>
                                  <p className="mt-1 font-bold text-white">{application.statusMeta.label}</p>
                                </div>
                                <div>
                                  <p className="text-slate-400">Salary</p>
                                  <p className="mt-1 font-bold text-white">{job.salary || "Not disclosed"}</p>
                                </div>
                                <div>
                                  <p className="text-slate-400">Position</p>
                                  <p className="mt-1 font-bold text-white">{job.position || "Not available"}</p>
                                </div>
                              </div>

                              {job.id && (
                                <Link
                                  to={`/description/${job.id}`}
                                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  View job
                                </Link>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {!isLoading && filteredApplications.length === 0 && (
              <div className="rounded-lg border border-white/10 bg-white/[0.06] py-12 text-center">
                <AlertCircle className="mx-auto mb-3 h-10 w-10 text-slate-400" />
                <h2 className="text-lg font-bold">No applications found</h2>
                <p className="mt-2 text-sm text-slate-300">
                  Apply to jobs first, then recruiter decisions will appear here dynamically.
                </p>
                <Link
                  to="/jobs"
                  className="mt-5 inline-flex items-center justify-center rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
                >
                  Browse jobs
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default CvShortlisted;
