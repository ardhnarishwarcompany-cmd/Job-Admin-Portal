import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle, CheckCircle2, Clock, Loader2, MessageSquare,
  Users, Briefcase, RotateCcw, ChevronDown, Send, Filter, X
} from "lucide-react";
import { COMPLAINT_API_ENDPOINT } from "@/utils/data";
import AdminLayout from "./AdminLayout";

const STATUS_OPTIONS = ["Submitted", "Under Review", "In Progress", "Resolved", "Closed"];

const STATUS_CONFIG = {
  "Submitted":    { color: "bg-blue-100 text-blue-700 border-blue-200",       pill: "bg-blue-600" },
  "Under Review": { color: "bg-amber-100 text-amber-700 border-amber-200",     pill: "bg-amber-500" },
  "In Progress":  { color: "bg-purple-100 text-purple-700 border-purple-200",  pill: "bg-purple-600" },
  "Resolved":     { color: "bg-green-100 text-green-700 border-green-200",     pill: "bg-green-600" },
  "Closed":       { color: "bg-slate-100 text-slate-600 border-slate-200",     pill: "bg-slate-500" },
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${STATUS_CONFIG[status]?.color || "bg-slate-100 text-slate-600 border-slate-200"}`}>
    {status}
  </span>
);

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "Employee" | "Recruiter"
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [noteInputs, setNoteInputs] = useState({});
  const [statusInputs, setStatusInputs] = useState({});

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [compRes, statRes] = await Promise.all([
        axios.get(`${COMPLAINT_API_ENDPOINT}/all${activeTab !== "all" ? `?role=${activeTab}` : ""}`, { withCredentials: true }),
        axios.get(`${COMPLAINT_API_ENDPOINT}/stats`, { withCredentials: true }),
      ]);
      if (compRes.data.success) setComplaints(compRes.data.complaints);
      if (statRes.data.success) setStats(statRes.data.stats);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [activeTab]);

  const handleUpdate = async (id) => {
    const status = statusInputs[id];
    const admin_note = noteInputs[id] ?? "";
    if (!status) return;
    setUpdating(id);
    try {
      const res = await axios.put(`${COMPLAINT_API_ENDPOINT}/${id}/status`, { status, admin_note }, { withCredentials: true });
      if (res.data.success) {
        setComplaints(prev => prev.map(c => c.id === id ? { ...c, status, admin_note } : c));
        setExpanded(null);
      }
    } catch { } finally { setUpdating(null); }
  };

  const StatCard = ({ label, value, color }) => (
    <div className={`rounded-xl border p-4 ${color}`}>
      <p className="text-2xl font-black">{value ?? 0}</p>
      <p className="text-xs font-semibold mt-0.5 opacity-80">{label}</p>
    </div>
  );

  return (
    <AdminLayout title="Complaints Management" description="Review, respond to, and resolve platform complaints" icon={AlertCircle}>
      <div className="w-full">

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total" value={stats.total} color="bg-slate-50 border-slate-200 text-slate-700" />
          <StatCard label="Submitted" value={stats.submitted} color="bg-blue-50 border-blue-200 text-blue-700" />
          <StatCard label="In Progress" value={parseInt(stats.under_review || 0) + parseInt(stats.in_progress || 0)} color="bg-amber-50 border-amber-200 text-amber-700" />
          <StatCard label="Resolved" value={parseInt(stats.resolved || 0) + parseInt(stats.closed || 0)} color="bg-green-50 border-green-200 text-green-700" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex rounded-xl overflow-hidden border border-slate-200 mb-5 w-fit bg-slate-50">
        {[
          { key: "all", label: "All Complaints", Icon: Filter },
          { key: "Employee", label: "Candidates", Icon: Users },
          { key: "Recruiter", label: "Recruiters", Icon: Briefcase },
        ].map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-all ${activeTab === key ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
      ) : complaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <MessageSquare className="h-16 w-16 mb-3 opacity-20" />
          <p className="text-lg font-bold">No complaints found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map(c => (
            <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                className="w-full flex items-start justify-between p-5 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={c.status} />
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${c.user_role === "Employee" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                      {c.user_role === "Employee" ? "Candidate" : "Recruiter"}
                    </span>
                    <span className="rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-[11px] font-semibold">{c.category}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 mt-2">{c.subject}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    By <span className="font-semibold">{c.user_name}</span> ({c.user_email}) ·{" "}
                    {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <ChevronDown className={`h-5 w-5 text-slate-400 ml-3 flex-shrink-0 transition-transform ${expanded === c.id ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {expanded === c.id && (
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                    className="overflow-hidden border-t border-slate-100"
                  >
                    <div className="p-5 space-y-4">
                      {/* Description */}
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Complaint Description</p>
                        <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3 leading-relaxed">{c.description}</p>
                      </div>

                      {/* Admin Note Preview */}
                      {c.admin_note && (
                        <div className="rounded-xl border border-green-200 bg-green-50 p-3">
                          <p className="text-xs font-bold text-green-700 mb-1">Previous Admin Note</p>
                          <p className="text-sm text-green-800">{c.admin_note}</p>
                        </div>
                      )}

                      {/* Update Form */}
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 space-y-3">
                        <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Update Status & Response</p>
                        <div>
                          <label className="text-xs font-semibold text-slate-600 mb-1 block">Change Status</label>
                          <select
                            value={statusInputs[c.id] || c.status}
                            onChange={e => setStatusInputs(p => ({ ...p, [c.id]: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          >
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-600 mb-1 block">Admin Response / Note</label>
                          <textarea
                            value={noteInputs[c.id] ?? c.admin_note ?? ""}
                            onChange={e => setNoteInputs(p => ({ ...p, [c.id]: e.target.value }))}
                            rows={3}
                            placeholder="Write a response for the complainant..."
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>
                        <button
                          onClick={() => handleUpdate(c.id)}
                          disabled={updating === c.id}
                          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                          {updating === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                          {updating === c.id ? "Saving..." : "Save Update"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </AdminLayout>
  );
};

export default AdminComplaints;
