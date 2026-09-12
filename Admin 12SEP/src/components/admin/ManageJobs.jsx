import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import { ADMIN_API_ENDPOINT } from "@/utils/data";
import { useNavigate } from "react-router-dom";
import { Briefcase, Search, Trash2, MapPin, DollarSign, Users, Building2, AlertTriangle } from "lucide-react";

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState("open");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${ADMIN_API_ENDPOINT}/jobs`, { withCredentials: true })
      .then((res) => {
        const jobsData = Array.isArray(res.data.jobs) ? res.data.jobs : [];
        setJobs(jobsData.map((job) => ({
          ...job,
          _id: job._id || String(job.id || ""),
          company: typeof job.company === "string" ? { name: job.company } : job.company,
        })));
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load jobs.");
        setLoading(false);
      });
  }, []);

  const deleteJob = async (id) => {
    await axios.delete(`${ADMIN_API_ENDPOINT}/job/${id}`, { withCredentials: true });
    setJobs((prev) =>
      prev.map((j) => (j._id === id ? { ...j, isDeleted: true } : j))
    );
    setDeleteConfirm(null);
  };

  const categoryJobs = jobs.filter((j) => {
    if (activeTab === "removed") return j.isDeleted === true;
    if (activeTab === "closed") return !j.isDeleted && j.status === "closed";
    return !j.isDeleted && j.status !== "closed";
  });

  const filtered = categoryJobs.filter((j) => {
    const companyName = typeof j.company === "string" ? j.company : j.company?.name || "";
    const text = search.toLowerCase();
    return (
      j.title?.toLowerCase().includes(text) ||
      j.location?.toLowerCase().includes(text) ||
      companyName?.toLowerCase().includes(text)
    );
  });

  return (
    <AdminLayout title="Manage Jobs" description={`${jobs.length} total jobs on platform`} icon={Briefcase}>
      <div className="w-full">

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm max-w-md">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search jobs, companies, locations..."
                className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder-slate-400"
              />
            </div>
          </motion.div>

          {/* Category Tabs */}
          <div className="flex border-b border-slate-200 gap-2 pb-1 mb-6">
            {[
              { id: "open", label: "Open Jobs", activeColor: "border-blue-600 text-blue-600", countBg: "bg-blue-100 text-blue-700" },
              { id: "closed", label: "Closed Jobs", activeColor: "border-slate-600 text-slate-650", countBg: "bg-slate-100 text-slate-500" },
              { id: "removed", label: "Removed Jobs", activeColor: "border-rose-600 text-rose-600", countBg: "bg-rose-100 text-rose-700" }
            ].map((tab) => {
              const count = jobs.filter((j) => {
                if (tab.id === "removed") return j.isDeleted === true;
                if (tab.id === "closed") return !j.isDeleted && j.status === "closed";
                return !j.isDeleted && j.status !== "closed";
              }).length;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setDeleteConfirm(null);
                  }}
                  className={`py-2.5 px-5 text-sm font-bold border-b-2 capitalize transition-all flex items-center gap-2 cursor-pointer ${
                    isActive ? tab.activeColor : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                  <span className={`text-[10px] rounded-full px-2 py-0.5 font-extrabold ${
                    isActive ? tab.countBg : "bg-slate-150 text-slate-500"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-rose-700">
              <AlertTriangle className="h-4 w-4" /> {error}
            </motion.div>
          )}

          {/* Jobs grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => <div key={i} className="h-48 rounded-2xl bg-slate-200 animate-pulse" />)}
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence>
                {filtered.map((j) => (
                  <motion.div
                    key={j._id}
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -4, boxShadow: "0 16px 32px rgba(109,40,217,0.1)" }}
                    onClick={() => navigate(`/description/${j._id}`)}
                    className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-md hover:border-blue-300 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-black text-lg shadow-md">
                          {(j.title || "J")[0]}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm leading-tight">{j.title}</h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building2 className="h-3 w-3" /> {j.company?.name || "Unknown"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${j.isDeleted ? "bg-rose-100 text-rose-700" : j.status === "closed" ? "bg-slate-100 text-slate-500" : "bg-emerald-100 text-emerald-700"}`}>
                          {j.isDeleted ? "Removed" : (j.status || "open")}
                        </span>
                        {j.approvalStatus && j.approvalStatus !== "approved" && (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${j.approvalStatus === "pending" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-600"}`}>
                            {j.approvalStatus === "pending" ? "Pending Approval" : "Rejected"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" /> {j.location || "Remote"}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <DollarSign className="h-3.5 w-3.5 text-slate-400" /> {j.salary}{String(j.salary || "").toLowerCase().includes("lpa") ? "" : " LPA"}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Users className="h-3.5 w-3.5 text-slate-400" /> {j.applications?.length || 0} applicants
                      </div>
                    </div>

                    {deleteConfirm === j._id ? (
                      <div className="mt-3 flex items-center justify-between rounded-xl bg-rose-50 p-2 border border-rose-100" onClick={(e) => e.stopPropagation()}>
                        <span className="text-xs font-bold text-rose-800">Remove job listing?</span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => deleteJob(j._id)}
                            className="rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-rose-700 transition-colors"
                          >
                            Remove
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mt-3" onClick={(e) => e.stopPropagation()}>
                        <span className="text-xs text-slate-400">{j.createdAt?.split("T")[0]}</span>
                        {!j.isDeleted && (
                          <button
                            onClick={() => setDeleteConfirm(j._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Remove Job from Listing"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {!loading && filtered.length === 0 && !error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Briefcase className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-semibold">No {activeTab} jobs found</p>
            </motion.div>
          )}
        </div>
    </AdminLayout>
  );
};

export default ManageJobs;

