import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import AdminLayout from "./AdminLayout";
import { getFileUrl, ADMIN_API_ENDPOINT } from "@/utils/data";
import { ClipboardList, Search, CheckCircle2, XCircle, Clock, User, Briefcase, Building2, Mail, FileText, Loader2, X, Mic } from "lucide-react";

const statusConfig = {
  accepted: { label: "Accepted", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-rose-100 text-rose-700 border-rose-200", icon: XCircle },
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
};

const ManageApplications = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedApp, setSelectedApp] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchApps = () => {
    setLoading(true);
    axios
      .get(`${ADMIN_API_ENDPOINT}/applications`, { withCredentials: true })
      .then((res) => { 
        const mapped = (res.data.apps || []).map((app) => ({
          ...app,
          _id: app._id || String(app.id || ""),
        }));
        setApps(mapped); 
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleAdminVerify = async (appId, approved) => {
    const action = approved ? "approve" : "reject";
    setUpdatingId(appId);
    try {
      const res = await axios.put(
        `${ADMIN_API_ENDPOINT}/applications/${appId}/${action}`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(`Application marked as ${action}d`);
        setApps(apps.map((a) => (a._id === appId ? { ...a, adminApprovalStatus: approved ? "approved" : "rejected" } : a)));
        if (selectedApp?._id === appId) {
          setSelectedApp({ ...selectedApp, adminApprovalStatus: approved ? "approved" : "rejected" });
        }
      } else {
        toast.error(res.data.message || `Failed to ${action} application`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = apps.filter((a) => {
    const matchSearch =
      a.applicant?.fullname?.toLowerCase().includes(search.toLowerCase()) ||
      a.job?.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || (a.adminApprovalStatus || "pending") === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout title="Job Applications Verification" description={`${apps.length} total candidate applications`} icon={ClipboardList}>
      <div className="w-full">

          {/* Filters */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search applicant or job..." className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder-slate-400" />
            </div>
            <div className="flex gap-2">
              {["all", "pending", "approved", "rejected"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-xl px-3 py-2 text-xs font-bold capitalize transition-all duration-200 ${
                    statusFilter === s
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
                  }`}
                >
                  {s === "approved" ? "Approved" : s === "rejected" ? "Rejected" : s === "pending" ? "Pending" : "All"}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Applications */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-slate-200 animate-pulse" />)}
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
              className="space-y-3"
            >
              <AnimatePresence>
                {filtered.map((a) => {
                  const recruiterStatus = statusConfig[a.status] || statusConfig.pending;
                  const RecruiterIcon = recruiterStatus.icon;
                  
                  const adminConfig = {
                    approved: { label: "Admin Approved", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
                    rejected: { label: "Admin Rejected", color: "bg-rose-100 text-rose-700 border-rose-200" },
                    pending: { label: "Admin Pending", color: "bg-amber-100 text-amber-700 border-amber-200" },
                  };
                  const adminStatus = adminConfig[a.adminApprovalStatus] || adminConfig.pending;
                  
                  return (
                    <motion.div
                      key={a._id}
                      onClick={() => setSelectedApp(a)}
                      variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                      exit={{ opacity: 0, x: -20 }}
                      whileHover={{ x: 4 }}
                      className="flex cursor-pointer flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-300 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        {a.applicant?.profilePhoto ? (
                          <img src={getFileUrl(a.applicant.profilePhoto)} alt="Candidate" className="h-12 w-12 rounded-xl object-cover ring-2 ring-slate-100 shadow-sm" />
                        ) : (
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white font-black text-lg shadow-sm">
                            {(a.applicant?.fullname || "U")[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{a.applicant?.fullname || "Unknown"}</p>
                          <div className="flex flex-wrap gap-3 mt-1">
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Mail className="h-3 w-3" /> {a.applicant?.email}
                            </span>
                            <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                              <Briefcase className="h-3 w-3" /> {a.job?.title}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Building2 className="h-3 w-3" /> {a.job?.company?.name || a.job?.company}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${adminStatus.color}`}>
                          {adminStatus.label}
                        </span>
                        <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${recruiterStatus.color}`}>
                          <RecruiterIcon className="h-3.5 w-3.5" /> Recruiter: {recruiterStatus.label}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {!loading && filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-slate-400">
              <ClipboardList className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-semibold">No applications found</p>
            </motion.div>
          )}
        </div>
      {/* MODAL */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6"
            onClick={() => setSelectedApp(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 sticky top-0 bg-white z-10">
                <h3 className="text-lg font-bold text-slate-900">Application Details</h3>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                <div className="flex items-start gap-5">
                  {selectedApp.applicant?.profilePhoto ? (
                    <img src={getFileUrl(selectedApp.applicant.profilePhoto)} alt="Candidate" className="h-20 w-20 rounded-2xl object-cover ring-4 ring-slate-50 shadow-md" />
                  ) : (
                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white font-black text-3xl shadow-md ring-4 ring-slate-50">
                      {(selectedApp.applicant?.fullname || "U")[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xl font-black text-slate-900">{selectedApp.applicant?.fullname}</h4>
                    <p className="text-sm font-semibold text-slate-500 mt-0.5">{selectedApp.applicant?.email}</p>
                    <p className="text-sm text-slate-500">{selectedApp.applicant?.phoneNumber || "No phone provided"}</p>
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                        selectedApp.adminApprovalStatus === "approved"
                          ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                          : selectedApp.adminApprovalStatus === "rejected"
                          ? "bg-rose-100 text-rose-700 border-rose-200"
                          : "bg-amber-100 text-amber-700 border-amber-200"
                      }`}>
                        Admin Verification: {selectedApp.adminApprovalStatus === "approved" ? "Approved" : selectedApp.adminApprovalStatus === "rejected" ? "Rejected" : "Awaiting Review"}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${statusConfig[selectedApp.status]?.color || statusConfig.pending.color}`}>
                        Employer Selection: {statusConfig[selectedApp.status]?.label || "Pending"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <h5 className="mb-3 text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-blue-500" /> Job Information
                  </h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Job Title</p>
                      <p className="font-semibold text-slate-900">{selectedApp.job?.title}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Company</p>
                      <p className="font-semibold text-slate-900">{selectedApp.job?.company?.name || selectedApp.job?.company}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Salary</p>
                      <p className="font-semibold text-slate-900">₹{selectedApp.job?.salary}{String(selectedApp.job?.salary || "").toLowerCase().includes("lpa") ? "" : " LPA"}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Location</p>
                      <p className="font-semibold text-slate-900">{selectedApp.job?.location}</p>
                    </div>
                  </div>
                </div>

                {selectedApp.applicant?.bio && (
                  <div>
                    <h5 className="mb-2 text-sm font-bold text-slate-900">Bio</h5>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{selectedApp.applicant.bio}</p>
                  </div>
                )}

                {selectedApp.applicant?.skills && selectedApp.applicant.skills.length > 0 && (
                  <div>
                    <h5 className="mb-2 text-sm font-bold text-slate-900">Skills</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.applicant.skills.map(s => (
                        <span key={s} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedApp.resume && (
                  <div>
                    <h5 className="mb-3 text-sm font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-rose-500" /> Resume
                    </h5>
                    <a
                      href={getFileUrl(selectedApp.resume)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors px-4 py-2 text-sm font-bold"
                    >
                      <FileText className="h-4 w-4" /> 
                      View {selectedApp.resumeOriginalName || "Resume"}
                    </a>
                  </div>
                )}
                {selectedApp.audioIntro && (
                  <div>
                    <h5 className="mb-3 text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Mic className="h-4 w-4 text-blue-500" /> Audio Introduction
                    </h5>
                    <div className="flex flex-col gap-2 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                      <audio
                        src={getFileUrl(selectedApp.audioIntro)}
                        controls
                        className="h-10 w-full max-w-sm rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 flex flex-wrap items-center justify-end gap-3 rounded-b-3xl sticky bottom-0">
                {selectedApp.adminApprovalStatus && selectedApp.adminApprovalStatus !== "pending" ? (
                  <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-4 py-2.5 rounded-xl border border-slate-200 w-full text-center">
                    This application verification status is locked as <strong>{selectedApp.adminApprovalStatus.toUpperCase()}</strong> and cannot be modified.
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleAdminVerify(selectedApp._id, false)}
                      disabled={updatingId === selectedApp._id}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-100 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {updatingId === selectedApp._id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Reject"}
                    </button>
                    <button
                      onClick={() => handleAdminVerify(selectedApp._id, true)}
                      disabled={updatingId === selectedApp._id}
                      className="rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {updatingId === selectedApp._id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Approve"}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default ManageApplications;
