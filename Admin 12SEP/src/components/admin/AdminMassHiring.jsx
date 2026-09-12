import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Truck, Search, RefreshCw, CheckCircle2, AlertCircle, Building2, User, Mail, Phone, 
  MapPin, DollarSign, Users, Award, ShieldCheck, X, ChevronRight, Filter, ExternalLink,
  Briefcase, GraduationCap, ArrowRight, Eye, Check, Clock
} from "lucide-react";
import AdminLayout from "./AdminLayout";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function AdminMassHiring() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedJob, setSelectedJob] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchMassHiringJobs = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API}/api/admin/mass-hiring`, { withCredentials: true });
      if (res.data.success) {
        setJobs(res.data.massHiringJobs || []);
        if (selectedJob) {
          const updated = (res.data.massHiringJobs || []).find(j => j.id === selectedJob.id);
          if (updated) setSelectedJob(updated);
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load mass hiring jobs.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMassHiringJobs(true);
  }, []);

  const handleUpdateJobStatus = async (jobId, newStatus) => {
    setUpdatingStatus(true);
    setError("");
    // Optimistic local update
    setJobs(prevJobs => prevJobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
    setSelectedJob(prev => prev && prev.id === jobId ? { ...prev, status: newStatus } : prev);

    try {
      const res = await axios.patch(
        `${API}/api/admin/mass-hiring/${jobId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      if (res.data.success) {
        setSuccess(`Mass hiring job status updated to ${newStatus}`);
        setTimeout(() => setSuccess(""), 4000);
        fetchMassHiringJobs(false);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update status.");
      fetchMassHiringJobs(false);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdateApplicantStatus = async (applicationId, newStatus) => {
    setError("");
    try {
      const res = await axios.patch(
        `${API}/api/workforce/bulk/applicants/${applicationId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      if (res.data.success) {
        setSuccess(`Worker application status updated to ${newStatus}`);
        setTimeout(() => setSuccess(""), 4000);
        fetchMassHiringJobs(false);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update worker status.");
    }
  };

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = 
      (j.role || "").toLowerCase().includes(search.toLowerCase()) ||
      (j.country || "").toLowerCase().includes(search.toLowerCase()) ||
      (j.companyName || "").toLowerCase().includes(search.toLowerCase()) ||
      (j.recruiterName || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (st) => {
    switch (st) {
      case "submitted": return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400";
      case "screening": return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400";
      case "verification": return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400";
      case "interview": return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400";
      case "selection": return "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400";
      case "deployment": return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400";
      case "closed": return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400";
      default: return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <AdminLayout 
      title="Mass Hiring Requisitions" 
      description="Audit bulk staffing requests, examine recruiter credentials, and inspect applied worker profiles." 
      icon={Truck}
    >
      <div className="space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search mass hiring jobs, recruiters, countries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white transition"
              />
            </div>
            
            <div className="w-44">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              >
                <option value="All">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="screening">Screening</option>
                <option value="verification">Verification</option>
                <option value="interview">Interview</option>
                <option value="selection">Selection</option>
                <option value="deployment">Deployment</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <button
            onClick={fetchMassHiringJobs}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 transition"
          >
            <RefreshCw className="h-4 w-4" /> Refresh List
          </button>
        </div>

        {error && <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-bold text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/40">{error}</div>}
        {success && <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/40">{success}</div>}

        {/* Mass Hiring Grid */}
        {loading ? (
          <div className="py-20 text-center text-sm font-bold text-slate-500 animate-pulse">Loading Mass Hiring database records...</div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job, idx) => (
              <motion.div
                key={`admin-mass-job-${job.id || idx}-${idx}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-[10px] font-black text-blue-700 dark:bg-blue-950/40 dark:border-blue-900/50 dark:text-blue-300">
                      👥 {job.workers} Workers Requested
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[9.5px] font-black uppercase border ${getStatusBadgeClass(job.status)}`}>
                      {job.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-950 dark:text-white leading-snug">{job.role}</h3>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-blue-500" /> {job.country || "Global Target"}
                  </p>

                  {job.salary && (
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" /> Salary Package: {job.salary}
                    </p>
                  )}

                  {/* Recruiter Summary */}
                  <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                    <p className="text-[10px] font-black uppercase text-slate-400">Employer / Recruiter Profile</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">{job.companyName || job.recruiterName || "Direct Employer"}</p>
                    <p className="text-[11px] text-slate-500">{job.recruiterEmail || "Contact not provided"}</p>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">
                    Applied Workers: <b>{job.applicantCount || 0}</b>
                  </span>
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-3.5 py-2 text-xs font-black text-white shadow-md hover:shadow-lg transition cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" /> Inspect Full Details
                  </button>
                </div>
              </motion.div>
            ))}

            {filteredJobs.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-500 font-bold bg-white dark:bg-slate-900 rounded-2xl border">
                No mass hiring requisitions match your current search/filter.
              </div>
            )}
          </div>
        )}

        {/* Detailed Inspection Modal */}
        <AnimatePresence>
          {selectedJob && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedJob(null)}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative z-50 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 custom-scrollbar"
              >
                <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded-full bg-blue-600 text-white text-[9px] font-black px-2.5 py-0.5">MASS HIRING JOB REQUISITION</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[9.5px] font-black uppercase border ${getStatusBadgeClass(selectedJob.status)}`}>
                        {selectedJob.status}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-950 dark:text-white">{selectedJob.role}</h2>
                    <p className="text-xs text-slate-500 mt-1">Target Country: <b>{selectedJob.country || "Global"}</b> · Headcount Requested: <b>{selectedJob.workers} Workers</b></p>
                  </div>
                  <button onClick={() => setSelectedJob(null)} className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Grid layout for Recruiter Profile vs Job Notes */}
                <div className="grid gap-6 md:grid-cols-2 mb-8">
                  {/* Recruiter / Employer Profile Card */}
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/20 p-5 dark:border-blue-900/40 dark:bg-blue-950/30">
                    <h3 className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2 mb-3">
                      <Building2 className="h-4 w-4" /> Recruiter / Employer Profile
                    </h3>

                    <div className="space-y-2 text-xs">
                      <p className="font-black text-sm text-slate-950 dark:text-white">{selectedJob.companyName || "Direct Client Requisition"}</p>
                      <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-blue-500" /> Recruiter Name: <b>{selectedJob.recruiterName || "Employer"}</b>
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-blue-500" /> {selectedJob.recruiterEmail || "Email not available"}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-blue-500" /> {selectedJob.recruiterPhone || "Phone not available"}
                      </p>
                      <div className="pt-2 flex items-center gap-3">
                        <span className="rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 px-2.5 py-1 font-black text-[10px]">
                          Company Trust Score: {selectedJob.companyTrustScore || 85}%
                        </span>
                        <span className="rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 px-2.5 py-1 font-black text-[10px]">
                          Recruiter Score: {selectedJob.recruiterProfileScore || 90}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Job Requisition Details & Admin Status Change */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/50">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2 mb-3">
                      <Briefcase className="h-4 w-4 text-blue-500" /> Job Requisition Details
                    </h3>

                    <div className="space-y-2 text-xs">
                      {selectedJob.salary && <p className="font-bold text-slate-800 dark:text-slate-200">Salary Range: <b>{selectedJob.salary}</b></p>}
                      {selectedJob.category && <p className="font-bold text-slate-800 dark:text-slate-200">Category: <b>{selectedJob.category}</b></p>}
                      {selectedJob.notes && <p className="text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">"{selectedJob.notes}"</p>}

                      <div className="pt-3">
                        <span className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Requisition Lifecycle Status (Recruiter Managed)</span>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-3 py-1 text-xs font-black uppercase border ${getStatusBadgeClass(selectedJob.status)}`}>
                            {selectedJob.status}
                          </span>
                          <span className="text-[11px] text-slate-500 italic">Audit Log Monitored</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Applied Worker Profiles Section */}
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="text-base font-black text-slate-950 dark:text-white flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" /> Applied Workers ({selectedJob.applicants?.length || 0})
                    </h3>
                    <span className="text-xs font-bold text-slate-500">Worker Profile Sourcing Pool</span>
                  </div>

                  <div className="space-y-4">
                    {(selectedJob.applicants || []).map((w, idx) => (
                      <div key={`admin-applicant-${w.applicationId || w.workerId || idx}-${idx}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-sm text-slate-950 dark:text-white">{w.workerName}</h4>
                              {w.workforce_id && <span className="rounded bg-blue-50 px-2 py-0.5 text-[9px] font-mono text-blue-700 font-bold">ID: {w.workforce_id}</span>}
                            </div>
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-0.5">{w.profession || "Global Worker"}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                              w.applicationStatus === 'accepted' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                              w.applicationStatus === 'rejected' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400' :
                              w.applicationStatus === 'under_review' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' :
                              'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400'
                            }`}>
                              Decision: {w.applicationStatus}
                            </span>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 text-xs text-slate-600 dark:text-slate-400">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Contact Credentials</p>
                            <p className="font-bold text-slate-900 dark:text-white mt-1">{w.workerEmail}</p>
                            <p>{w.workerPhone || "No phone listed"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Experience & Education</p>
                            <p className="font-bold text-slate-900 dark:text-white mt-1">{w.experience_years || 0} Years Experience</p>
                            <p>{w.education || "Graduate"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Target Location & Status</p>
                            <p className="font-bold text-slate-900 dark:text-white mt-1">Target: {w.target_country || "Global"}</p>
                            <p>Applied: {new Date(w.appliedAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {w.bio && <p className="mt-3 text-xs italic bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">"{w.bio}"</p>}
                      </div>
                    ))}

                    {(!selectedJob.applicants || selectedJob.applicants.length === 0) && (
                      <div className="p-8 text-center text-slate-400 font-bold text-xs bg-slate-50 dark:bg-slate-950 rounded-2xl border">
                        No worker applications submitted yet for this mass hiring position.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
