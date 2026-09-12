import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle, CheckCircle2, Clock, Loader2, Plus, Send, X,
  ChevronDown, MessageSquare, Tag, FileText
} from "lucide-react";
import Navbar from "@/components/components_lite/Navbar";
import { COMPLAINT_API_ENDPOINT } from "@/utils/data";

const CATEGORIES = ["Harassment", "Technical Issue", "Payment Issue", "Job Related", "Account Issue", "Other"];

const STATUS_CONFIG = {
  "Submitted":    { color: "bg-blue-100 text-blue-700 border-blue-200",   icon: Send,          label: "Submitted" },
  "Under Review": { color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock,         label: "Under Review" },
  "In Progress":  { color: "bg-purple-100 text-purple-700 border-purple-200", icon: Loader2,    label: "In Progress" },
  "Resolved":     { color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2, label: "Resolved" },
  "Closed":       { color: "bg-slate-100 text-slate-600 border-slate-200", icon: X,            label: "Closed" },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG["Submitted"];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${config.color}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
};

const ProgressTracker = ({ status }) => {
  const steps = ["Submitted", "Under Review", "In Progress", "Resolved", "Closed"];
  const currentIdx = steps.indexOf(status);
  return (
    <div className="flex items-center gap-0 mt-4">
      {steps.map((step, i) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all ${
              i <= currentIdx ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-300 text-slate-400"
            }`}>
              {i < currentIdx ? "✓" : i + 1}
            </div>
            <span className={`text-[10px] mt-1 text-center w-16 leading-tight font-medium ${i <= currentIdx ? "text-blue-600" : "text-slate-400"}`}>{step}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 flex-1 mx-1 mb-4 ${i < currentIdx ? "bg-blue-600" : "bg-slate-200"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ subject: "", category: "", description: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchComplaints = async () => {
    try {
      const res = await axios.get(`${COMPLAINT_API_ENDPOINT}/my`, { withCredentials: true });
      if (res.data.success) setComplaints(res.data.complaints);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.category || !form.description.trim()) {
      setError("All fields are required."); return;
    }
    setSubmitting(true); setError("");
    try {
      const res = await axios.post(`${COMPLAINT_API_ENDPOINT}/submit`, form, { withCredentials: true });
      if (res.data.success) {
        setSuccess("Your complaint has been submitted successfully.");
        setForm({ subject: "", category: "", description: "" });
        setShowForm(false);
        fetchComplaints();
        setTimeout(() => setSuccess(""), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit complaint.");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">My Complaints</h1>
            <p className="text-slate-500 text-sm mt-1">Track and manage your submitted complaints</p>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus className="h-4 w-4" />
            New Complaint
          </button>
        </div>

        {/* Success / Error */}
        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3 mb-4 text-sm font-semibold text-green-700">
              <CheckCircle2 className="h-4 w-4" /> {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-md">
                <h2 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  File a New Complaint
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subject <span className="text-red-500">*</span></label>
                    <input
                      value={form.subject}
                      onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                      placeholder="Brief description of your issue"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                    <select
                      value={form.category}
                      onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-slate-50"
                    >
                      <option value="">Select a category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description <span className="text-red-500">*</span></label>
                    <textarea
                      value={form.description}
                      onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                      rows={5}
                      placeholder="Provide detailed information about your complaint..."
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 bg-slate-50"
                    />
                  </div>
                  {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                    <button
                      type="submit" disabled={submitting}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {submitting ? "Submitting..." : "Submit Complaint"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Complaints List */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
        ) : complaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <MessageSquare className="h-16 w-16 mb-3 opacity-20" />
            <p className="text-lg font-bold">No complaints yet</p>
            <p className="text-sm mt-1">Click "New Complaint" to file one.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((c) => (
              <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                  className="w-full flex items-start justify-between p-5 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <StatusBadge status={c.status} />
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">{c.category}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 mt-1.5">{c.subject}</h3>
                    <p className="text-xs text-slate-400 mt-1">{new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-slate-400 ml-3 flex-shrink-0 transition-transform ${expanded === c.id ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {expanded === c.id && (
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                      className="overflow-hidden border-t border-slate-100"
                    >
                      <div className="p-5">
                        <ProgressTracker status={c.status} />
                        <div className="mt-5">
                          <p className="text-sm font-semibold text-slate-700 mb-1">Your Description</p>
                          <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 leading-relaxed">{c.description}</p>
                        </div>
                        {c.admin_note && (
                          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3">
                            <p className="text-xs font-bold text-green-700 mb-1 flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" /> Admin Response
                            </p>
                            <p className="text-sm text-green-800">{c.admin_note}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyComplaints;
