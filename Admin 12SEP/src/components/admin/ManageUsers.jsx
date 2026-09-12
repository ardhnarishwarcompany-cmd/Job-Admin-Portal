import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { Users, Search, Shield, Briefcase, UserX, UserCheck, Mail, Phone, Filter, ChevronRight, Loader2 } from "lucide-react";
import { getFileUrl, ADMIN_API_ENDPOINT } from "@/utils/data";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${ADMIN_API_ENDPOINT}/users`, { withCredentials: true })
      .then((res) => { setUsers(res.data.users || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const toggleBlock = async (user) => {
    const action = user.isBlocked ? "unblock" : "block";
    if (action === "block") {
      const confirmed = window.confirm(
        `Block ${user.fullname}? They will be signed out immediately and won't be able to log in until you unblock them.`
      );
      if (!confirmed) return;
    }
    setBusyId(user._id);
    try {
      const res = await axios.put(`${ADMIN_API_ENDPOINT}/${action}/${user._id}`, {}, { withCredentials: true });
      if (res.data.success) {
        setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, isBlocked: action === "block" } : u)));
        toast.success(res.data.message, {
          description: action === "block"
            ? "This user has been notified and can no longer sign in."
            : "This user has been notified and can sign in again.",
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || `Could not ${action} this user.`);
    } finally {
      setBusyId(null);
    }
  };

  const approveRecruiter = async (id) => {
    await axios.put(`${ADMIN_API_ENDPOINT}/verify/${id}/approve`, {}, { withCredentials: true });
    setUsers((prev) => prev.map((u) => u._id === id ? { ...u, verificationStatus: "approved" } : u));
    toast.success("Employer approved");
  };

  const rejectRecruiter = async (id) => {
    await axios.put(`${ADMIN_API_ENDPOINT}/verify/${id}/reject`, {}, { withCredentials: true });
    setUsers((prev) => prev.map((u) => u._id === id ? { ...u, verificationStatus: "rejected" } : u));
    toast.success("Employer rejected");
  };

  const filtered = users.filter((u) => {
    const matchSearch = u.fullname?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role?.toLowerCase() === roleFilter.toLowerCase();
    return matchSearch && matchRole;
  });

  const roleColors = {
    Admin: "bg-rose-100 text-rose-700",
    Recruiter: "bg-emerald-100 text-emerald-700",
    Employee: "bg-blue-100 text-blue-700",
  };

  const roleIcons = { Admin: Shield, Recruiter: Briefcase, Employee: Users };

  return (
    <AdminLayout title="Manage Users" description={`${users.length} total users registered`} icon={Users}>
      <div className="w-full">

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder-slate-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              {["all", "Employee", "Recruiter", "Admin"].map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`rounded-xl px-3 py-2 text-xs font-bold transition-all duration-200 ${
                    roleFilter === role
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
                  }`}
                >
                  {role === "all" ? "All" : role === "Employee" ? "Candidate" : (role === "Recruiter" ? "Employer" : role)}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Users grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-40 rounded-2xl bg-slate-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence>
                {filtered.map((u) => {
                  const RoleIcon = roleIcons[u.role] || Users;
                  return (
                    <motion.div
                      key={u._id}
                      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -4, boxShadow: "0 16px 32px rgba(109,40,217,0.1)" }}
                      onClick={() => navigate(`/admin/users/${u._id}`)}
                      className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-md hover:border-blue-300 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {u.profilePhoto ? (
                            <img src={getFileUrl(u.profilePhoto)} alt={u.fullname} className="h-11 w-11 rounded-xl object-cover shadow-md" />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white font-black text-lg shadow-md">
                              {(u.fullname || "U")[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{u.fullname}</p>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${roleColors[u.role] || "bg-slate-100 text-slate-600"}`}>
                              <RoleIcon className="h-3 w-3" /> {u.role === "Employee" ? "Candidate" : (u.role === "Recruiter" ? "Employer" : u.role)}
                            </span>
                          </div>
                        </div>
                        {u.isBlocked && (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-600">Blocked</span>
                        )}
                        {u.role === "Recruiter" && u.verificationStatus === "pending" && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">Pending</span>
                        )}
                        {u.role === "Recruiter" && u.verificationStatus === "rejected" && (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-600">Rejected</span>
                        )}
                        <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-300" />
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          <span className="truncate">{u.email}</span>
                        </div>
                        {u.phoneNumber && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            <span>{u.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                      {u.role === "Recruiter" && u.verificationStatus === "pending" && (
                        <div className="mb-2 flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={(e) => { e.stopPropagation(); approveRecruiter(u._id); }}
                            className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2 text-xs font-bold text-white shadow-md hover:shadow-emerald-200"
                          >
                            Approve
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={(e) => { e.stopPropagation(); rejectRecruiter(u._id); }}
                            className="flex-1 rounded-xl border border-rose-200 bg-white py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
                          >
                            Reject
                          </motion.button>
                        </div>
                      )}
                      {u.role !== "Admin" && (
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={(e) => { e.stopPropagation(); toggleBlock(u); }}
                          disabled={busyId === u._id}
                          className={`w-full rounded-xl py-2 text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 ${
                            u.isBlocked
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md hover:shadow-rose-200"
                          }`}
                        >
                          {busyId === u._id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : u.isBlocked ? (
                            <><UserCheck className="h-3.5 w-3.5" /> Unblock User</>
                          ) : (
                            <><UserX className="h-3.5 w-3.5" /> Block User</>
                          )}
                        </motion.button>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {!loading && filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Users className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-semibold">No users found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </motion.div>
          )}
        </div>
    </AdminLayout>
  );
};

export default ManageUsers;

