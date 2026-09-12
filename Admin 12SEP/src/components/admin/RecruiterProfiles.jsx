import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, Mail, Briefcase, Users, CheckCircle, XCircle, Search, 
  ArrowLeft, ArrowUpDown, ChevronRight, Activity, Calendar, Award,
  Shield, MessageSquare, Video
} from "lucide-react";
import axios from "axios";
import { ADMIN_API_ENDPOINT } from "@/utils/data";
import { toast } from "sonner";
import AdminLayout from "./AdminLayout";

const RecruiterProfiles = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [actioningFeature, setActioningFeature] = useState(null);

  // Handle toggling of features (Grant/Revoke)
  const handleUpdateFeatureStatus = async (featureName, newStatus) => {
    if (!selectedRecruiter) return;
    setActioningFeature(featureName);
    try {
      const body = {
        [`${featureName}_status`]: newStatus
      };
      const res = await axios.put(
        `${ADMIN_API_ENDPOINT}/recruiters/${selectedRecruiter.id}/features`,
        body,
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(`Feature access successfully updated!`);
        // Update local analytics state in real time
        setAnalytics((prev) => {
          if (!prev) return prev;
          const updatedFeatures = {
            ...(prev.features || {
              chat_status: "not_requested",
              nova_status: "not_requested",
              find_candidates_status: "not_requested"
            }),
            [`${featureName}_status`]: newStatus
          };
          return {
            ...prev,
            features: updatedFeatures
          };
        });
      } else {
        toast.error(res.data.message || "Failed to update permissions");
      }
    } catch (err) {
      console.error("Update feature status error:", err);
      toast.error(err.response?.data?.message || "Failed to connect to server. Please try again.");
    } finally {
      setActioningFeature(null);
    }
  };

  // Fetch all recruiters
  const fetchRecruiters = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${ADMIN_API_ENDPOINT}/recruiters`, { withCredentials: true });
      if (res.data.success) {
        setRecruiters(res.data.recruiters || []);
      } else {
        toast.error("Failed to load recruiter profiles");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching recruiters list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiters();
  }, []);

  // Fetch detailed analytics for selected recruiter
  const handleSelectRecruiter = async (recruiter) => {
    setSelectedRecruiter(recruiter);
    setLoadingAnalytics(true);
    try {
      const res = await axios.get(`${ADMIN_API_ENDPOINT}/recruiters/${recruiter.id}/analytics`, { withCredentials: true });
      if (res.data.success) {
        setAnalytics(res.data.analytics);
      } else {
        toast.error("Could not fetch analytics data");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading recruiter analytics");
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const filteredRecruiters = recruiters.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.fullname?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.companyName?.toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout title="Recruiter Profiles & Analytics" description="View details, metrics, and manage permissions for recruiters" icon={Users}>
      <div className="w-full">
        <AnimatePresence mode="wait">
            {!selectedRecruiter ? (
              // Recruiters List View
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Search Bar */}
                <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm max-w-md">
                  <Search className="h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email or company..."
                    className="w-full text-sm outline-none bg-transparent"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
                    <p className="mt-4 text-sm font-semibold text-slate-500">Loading profiles...</p>
                  </div>
                ) : filteredRecruiters.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-sm text-slate-400">
                    <Building2 className="h-16 w-16 mx-auto mb-4 opacity-30 text-indigo-600" />
                    <p className="font-semibold text-slate-700">No recruiters found</p>
                    <p className="text-xs mt-1">Try adjusting your search query</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRecruiters.map((r, idx) => (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -4, shadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
                        onClick={() => handleSelectRecruiter(r)}
                        className="cursor-pointer bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:border-indigo-200 transition-all duration-300 relative group overflow-hidden"
                      >
                        {/* Company Badge */}
                        <div className="absolute top-0 right-0 bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-bl-xl tracking-wider">
                          {r.companyName || "Private Employer"}
                        </div>

                        <div className="flex items-center gap-4 mt-2">
                          <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-lg">
                            {(r.fullname || "R")[0]}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {r.fullname}
                            </h3>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Mail className="h-3.5 w-3.5" /> {r.email}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 border-t border-slate-100 pt-4 flex justify-between items-center text-xs text-slate-500">
                          <span>Verify Date: {r.created_at ? r.created_at.split("T")[0] : "N/A"}</span>
                          <span className="flex items-center gap-1 font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                            View Analytics <ChevronRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              // Detailed Recruiter Analytics Page
              <motion.div
                key="analytics"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Back button */}
                <button
                  onClick={() => { setSelectedRecruiter(null); setAnalytics(null); }}
                  className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Recruiters
                </button>

                {/* Profile Header Card */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-indigo-500 text-white text-2xl font-black flex items-center justify-center">
                      {(selectedRecruiter.fullname || "R")[0]}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900">{selectedRecruiter.fullname}</h2>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5 text-slate-400" /> {selectedRecruiter.companyName || "Private Employer"}</span>
                        <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-slate-400" /> {selectedRecruiter.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {selectedRecruiter.verificationStatus === "approved" ? (
                      <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 border border-emerald-100/50 dark:border-emerald-900/30">
                        <Award className="h-3.5 w-3.5" /> Verified Recruiter
                      </span>
                    ) : selectedRecruiter.verificationStatus === "rejected" ? (
                      <span className="rounded-full bg-rose-50 dark:bg-rose-950/40 px-3 py-1 text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1 border border-rose-100/50 dark:border-rose-900/30">
                        <Award className="h-3.5 w-3.5" /> Verification Rejected
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-50 dark:bg-amber-950/40 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 border border-amber-100/50 dark:border-amber-900/30 animate-pulse">
                        <Award className="h-3.5 w-3.5" /> Verification Pending
                      </span>
                    )}
                  </div>
                </div>

                {loadingAnalytics ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
                    <p className="mt-4 text-sm font-semibold text-slate-500">Compiling statistics...</p>
                  </div>
                ) : (
                  <>
                    {/* Summary Metrics */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { label: "Jobs Posted", value: analytics?.totalJobs || 0, icon: Briefcase, color: "from-blue-500 to-indigo-500 text-indigo-600 bg-indigo-50" },
                        { label: "Total Applicants", value: analytics?.totalApplicants || 0, icon: Users, color: "from-emerald-500 to-teal-500 text-emerald-600 bg-emerald-50" },
                        { label: "Candidates Hired", value: analytics?.totalHired || 0, icon: CheckCircle, color: "from-purple-500 to-indigo-500 text-purple-600 bg-purple-50" },
                        { label: "Candidates Rejected", value: analytics?.totalRejected || 0, icon: XCircle, color: "from-rose-500 to-orange-500 text-rose-600 bg-rose-50" },
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between"
                        >
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">{item.value}</h3>
                          </div>
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${item.color}`}>
                            <item.icon className="h-6 w-6" />
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Feature Access Management Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 md:p-8 space-y-5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <Shield className="h-5.5 w-5.5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-950 dark:text-white text-lg">Feature Access Management</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                            Manage permissions for restricted SaaS features. Granting or revoking access updates the employer's profile instantly.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                        {[
                          {
                            id: "chat",
                            title: "Real-Time Chat Panel",
                            desc: "Allows recruiters to directly chat with candidates, schedule slots, and exchange documents.",
                            icon: MessageSquare,
                            color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/30",
                            status: analytics?.features?.chat_status || "not_requested",
                          },
                          {
                            id: "nova",
                            title: "NOVA AI Video Interviews",
                            desc: "Provides automated AI-driven screening and scoring of video interview submissions.",
                            icon: Video,
                            color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/30",
                            status: analytics?.features?.nova_status || "not_requested",
                          },
                          {
                            id: "find_candidates",
                            title: "Candidate Smart Finder",
                            desc: "Enables JD-based automated search, semantic mapping, and matching of candidates database.",
                            icon: Search,
                            color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30",
                            status: analytics?.features?.find_candidates_status || "not_requested",
                          },
                        ].map((feat) => {
                          const getStatusBadge = (status) => {
                            switch (status) {
                              case "approved":
                                return (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-ping" /> Approved
                                  </span>
                                );
                              case "revoked":
                                return (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 text-xs font-bold text-rose-700 dark:text-rose-400 border border-rose-100/50 dark:border-rose-900/30">
                                    <span className="h-1.5 w-1.5 rounded-full bg-rose-600 dark:bg-rose-450" /> Revoked
                                  </span>
                                );
                              case "pending":
                                return (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400 border border-amber-100/50 dark:border-amber-900/30 animate-pulse">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" /> Pending Approval
                                  </span>
                                );
                              default:
                                return (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 text-xs font-bold text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700/50">
                                    Not Requested
                                  </span>
                                );
                            }
                          };

                          const isActioning = actioningFeature === feat.id;

                          return (
                            <motion.div
                              key={feat.id}
                              whileHover={{ y: -3, transition: { duration: 0.2 } }}
                              className="p-5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl flex flex-col justify-between gap-5 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-300"
                            >
                              <div className="space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${feat.color}`}>
                                    <feat.icon className="h-5 w-5" />
                                  </div>
                                  {getStatusBadge(feat.status)}
                                </div>
                                <div>
                                  <h4 className="font-extrabold text-sm text-slate-955 dark:text-white">{feat.title}</h4>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{feat.desc}</p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/60">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                  {isActioning ? "Updating..." : (feat.status === "approved" ? "Access Enabled" : "Access Disabled")}
                                </span>
                                <button
                                  onClick={() => handleUpdateFeatureStatus(feat.id, feat.status === "approved" ? "revoked" : "approved")}
                                  disabled={isActioning}
                                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                    feat.status === "approved"
                                      ? "bg-indigo-600 dark:bg-indigo-500"
                                      : "bg-slate-200 dark:bg-slate-700"
                                  } ${isActioning ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                      feat.status === "approved" ? "translate-x-5" : "translate-x-0"
                                    }`}
                                  />
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>

                    {/* Details: Jobs Table & Activity Log */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Posted Jobs */}
                      <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 overflow-hidden">
                        <h3 className="font-bold text-slate-950 flex items-center gap-2 mb-4">
                          <Briefcase className="h-5 w-5 text-indigo-600" /> Posted Jobs & Metrics
                        </h3>

                        {(!analytics?.jobs || analytics.jobs.length === 0) ? (
                          <div className="text-center py-12 text-slate-400 text-sm">
                            No jobs have been posted by this recruiter yet.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-slate-100 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                                  <th className="pb-3">Job Title</th>
                                  <th className="pb-3 text-center">Applicants</th>
                                  <th className="pb-3 text-center">Hired</th>
                                  <th className="pb-3 text-center">Rejected</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-sm">
                                {analytics.jobs.map((j) => (
                                  <tr key={j.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-3 font-semibold text-slate-900">
                                      {j.title}
                                      <p className="text-[10px] text-slate-400 mt-0.5">{j.jobCode || "N/A"}</p>
                                    </td>
                                    <td className="py-3 text-center font-bold text-slate-800">{j.totalApplicants}</td>
                                    <td className="py-3 text-center font-bold text-emerald-600">{j.hiredCount}</td>
                                    <td className="py-3 text-center font-bold text-rose-600">{j.rejectedCount}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Recruiter Activity Timeline */}
                      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 flex flex-col">
                        <h3 className="font-bold text-slate-950 flex items-center gap-2 mb-4">
                          <Activity className="h-5 w-5 text-indigo-600" /> Recruiter Logs Timeline
                        </h3>

                        {(!analytics?.logs || analytics.logs.length === 0) ? (
                          <div className="text-center py-12 text-slate-400 text-sm flex-1 flex items-center justify-center">
                            No logs registered for this recruiter.
                          </div>
                        ) : (
                          <div className="flex-1 overflow-y-auto space-y-4 max-h-[350px] pr-1">
                            {analytics.logs.map((log) => (
                              <div key={log.id} className="flex gap-3 text-xs leading-relaxed">
                                <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                  <Calendar className="h-3 w-3" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold text-slate-800">{log.action_type}</p>
                                  <p className="text-slate-500 mt-0.5">{log.details}</p>
                                  <p className="text-[10px] text-slate-400 mt-1">{new Date(log.created_at).toLocaleString()}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default RecruiterProfiles;
