import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Truck, ArrowLeft, Send, CheckCircle2, RefreshCw, Users, MapPin, Sparkles, Clock, ArrowRight, UserCheck, BarChart3, Mail, Phone, ShieldCheck, XCircle, AlertCircle } from "lucide-react";
import Navbar from "../components_lite/Navbar";
import { API_URL } from "@/utils/data";

const COUNTRIES = ["India", "Germany", "UAE", "Saudi Arabia", "Qatar", "Canada", "United Kingdom", "Netherlands", "France", "Poland", "Italy", "Ireland", "United States", "Oman", "Kuwait", "Bahrain"];
const CATEGORIES = ["IT & Technology", "Healthcare & Nursing", "Construction & Building", "Logistics & Supply Chain", "Drivers & Automotive", "Hospitality & Food Service", "Manufacturing & Plant", "Skilled Trades (Welder/Electrician)", "Security & Facility", "Retail & Sales", "Engineering", "Other"];

export default function MassWorkforce() {
  const [role, setRole] = useState("");
  const [category, setCategory] = useState("Construction & Building");
  const [country, setCountry] = useState("UAE");
  const [workers, setWorkers] = useState(10);
  const [salary, setSalary] = useState("$2,500 / month");
  const [notes, setNotes] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Selection, Sourcing, & Applicants state
  const [selectedReq, setSelectedReq] = useState(null);
  const [activeTab, setActiveTab] = useState("applicants"); // "applicants" | "sourcing"
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  
  const [appliedWorkers, setAppliedWorkers] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const api = `${API_URL}/api/workforce`;

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${api}/bulk`, { withCredentials: true });
      if (res.data.success) {
        const reqs = res.data.requests || [];
        setRequests(reqs);
        if (reqs.length > 0 && !selectedReq) {
          setSelectedReq(reqs[0]);
        }
      }
    } catch (err) {
      setError("Failed to load workforce requisitions.");
    } finally {
      setLoading(false);
    }
  };

  const loadCandidatesForReq = async (reqId) => {
    setLoadingCandidates(true);
    setCandidates([]);
    try {
      const res = await axios.get(`${api}/bulk/${reqId}/candidates`, { withCredentials: true });
      if (res.data.success) {
        setCandidates(res.data.candidates || []);
      }
    } catch (err) {
      console.error("Failed to load candidates matching this role", err);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const loadApplicantsForReq = async (reqId) => {
    if (!reqId) return;
    setLoadingApplicants(true);
    setAppliedWorkers([]);
    try {
      const res = await axios.get(`${api}/bulk/${reqId}/applicants`, { withCredentials: true });
      if (res.data.success) {
        setAppliedWorkers(res.data.applicants || []);
      }
    } catch (err) {
      console.error("Failed to load applied workers for requisition", err);
    } finally {
      setLoadingApplicants(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    if (selectedReq?.id) {
      loadCandidatesForReq(selectedReq.id);
      loadApplicantsForReq(selectedReq.id);
    }
  }, [selectedReq]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role.trim()) {
      setError("Role is required.");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await axios.post(`${api}/bulk`, {
        role,
        category,
        country,
        workers: Number(workers) || 0,
        salary,
        notes
      }, { withCredentials: true });

      if (res.data.success) {
        setSuccess("Bulk workforce request submitted successfully.");
        setRole("");
        setNotes("");
        setSalary("$2,500 / month");
        setWorkers(10);
        loadRequests();
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateApplicantStatus = async (applicationId, status) => {
    setUpdatingStatusId(applicationId);
    setError("");
    setSuccess("");
    try {
      const res = await axios.patch(`${api}/bulk/applicants/${applicationId}/status`, { status }, { withCredentials: true });
      if (res.data.success) {
        setSuccess(`Applicant decision updated to "${status.replace("_", " ")}".`);
        if (selectedReq?.id) {
          loadApplicantsForReq(selectedReq.id);
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update applicant status.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleInvite = (candidateName) => {
    setSuccess(`Screening invitation sent to ${candidateName}!`);
    setTimeout(() => setSuccess(""), 4000);
  };

  // Analytics calculations
  const totalWorkers = requests.reduce((sum, r) => sum + (Number(r.workers) || 0), 0);
  const activeCount = requests.filter(r => r.status !== "completed").length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Back and Refresh Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link to="/recruiter/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <button onClick={loadRequests} className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Page Banner Title */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black">Mass Workforce Solutions & Worker Hiring</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Submit bulk manpower requirements and review applied worker profiles & AI matches.</p>
          </div>
        </div>

        {/* Analytics row */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-xs font-bold text-slate-500 uppercase">Total Workers Needed</span>
            </div>
            <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{totalWorkers.toLocaleString()}</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-teal-500" />
              <span className="text-xs font-bold text-slate-500 uppercase">Active Pipelines</span>
            </div>
            <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{activeCount}</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-cyan-500" />
              <span className="text-xs font-bold text-slate-500 uppercase">Global Fulfillment Rate</span>
            </div>
            <div className="mt-3 text-3xl font-black text-emerald-600">89%</div>
          </div>
        </div>

        {error && <div className="mb-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 p-4 border border-rose-100 dark:border-rose-900/40 text-sm font-bold text-rose-700 dark:text-rose-400">{error}</div>}
        {success && <div className="mb-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 p-4 border border-emerald-100 dark:border-emerald-900/40 text-sm font-bold text-emerald-700 dark:text-emerald-400">{success}</div>}

        <div className="grid gap-8 lg:grid-cols-[1.1fr_1.2fr_1.7fr]">
          {/* Form */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl dark:shadow-none h-fit">
            <h2 className="text-lg font-black mb-4 flex items-center gap-2">
              <Send className="h-4.5 w-4.5 text-blue-500" /> Request Manpower
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase mb-1.5">Role Needed</label>
                <input
                  type="text"
                  placeholder="e.g. Construction Welder, Warehouse Driver, Staff Nurse"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white px-4 py-2.5 text-xs font-semibold outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase mb-1.5">Industry Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white px-3 py-2.5 text-xs font-semibold outline-none focus:border-blue-500 transition-colors"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase mb-1.5">Target Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white px-3 py-2.5 text-xs font-semibold outline-none focus:border-blue-500 transition-colors"
                  >
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase mb-1.5">Headcount Needed</label>
                  <input
                    type="number"
                    min="1"
                    value={workers}
                    onChange={(e) => setWorkers(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white px-3 py-2.5 text-xs font-semibold outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase mb-1.5">Offered Salary Package</label>
                <input
                  type="text"
                  placeholder="e.g. $2,500 / month + Accommodation"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white px-4 py-2.5 text-xs font-semibold outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase mb-1.5">Operational Notes</label>
                <textarea
                  rows="3"
                  placeholder="Visa sponsorship details, work permit requirements, food & transport..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white px-4 py-2.5 text-xs font-semibold outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-black text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Send className="h-4 w-4" /> {submitting ? "Submitting..." : "Submit Requisition"}
              </button>
            </form>
          </div>

          {/* List of active requisitions */}
          <div>
            <h2 className="text-lg font-black mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
              <Clock className="h-4.5 w-4.5 text-teal-500" /> Active Pipelines ({requests.length})
            </h2>
            {loading ? (
              <div className="text-slate-500 font-bold animate-pulse text-xs">Loading requisitions...</div>
            ) : (
              <div className="space-y-3">
                {requests.map(r => {
                  const isSelected = selectedReq?.id === r.id;
                  return (
                    <div 
                      key={r.id} 
                      onClick={() => setSelectedReq(r)}
                      className={`rounded-2xl border p-4 shadow-sm cursor-pointer transition ${isSelected ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/20" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50"}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="rounded-full bg-blue-50 dark:bg-blue-950 px-2 py-0.5 text-[8.5px] font-black text-blue-700 dark:text-blue-300">
                            👥 {r.workers} workers
                          </span>
                          <h4 className="mt-1 font-black text-sm text-slate-900 dark:text-white">{r.role}</h4>
                          <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {r.country || "Global"}
                            {r.salary && <span className="font-bold text-emerald-600"> · {r.salary}</span>}
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase">
                          {r.status}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[9px] text-slate-400 font-bold border-t border-dashed pt-2 border-slate-200 dark:border-slate-800">
                        <span>Submitted {new Date(r.created_at).toLocaleDateString()}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                    </div>
                  );
                })}
                {requests.length === 0 && (
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center text-slate-500 bg-white dark:bg-slate-900 text-xs font-bold">
                    No bulk workforce requests submitted yet.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel: Applicants & Sourcing Tabs */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl dark:shadow-none">
            {/* Header Tabs */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {selectedReq ? selectedReq.role : "Worker Management"}
                </h2>
                {selectedReq && (
                  <p className="text-[11px] text-slate-500 mt-0.5 font-display">
                    Pipeline Target: <b>{selectedReq.workers} Workers</b> in <b>{selectedReq.country}</b>
                  </p>
                )}
              </div>

              {/* Tab Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab("applicants")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${activeTab === "applicants" ? "bg-white dark:bg-slate-900 text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-900"}`}
                >
                  Applicants ({appliedWorkers.length})
                </button>
                <button
                  onClick={() => setActiveTab("sourcing")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${activeTab === "sourcing" ? "bg-white dark:bg-slate-900 text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-900"}`}
                >
                  AI Matches ({candidates.length})
                </button>
              </div>
            </div>

            {/* TAB 1: Applied Workers */}
            {activeTab === "applicants" && (
              <div>
                {loadingApplicants ? (
                  <div className="py-12 text-center text-slate-500 font-bold animate-pulse text-xs">
                    Fetching worker applications from database...
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                    {appliedWorkers.map((app) => (
                      <div key={app.application_id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 p-4">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                              {app.fullname}
                              {app.passport_id && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[8.5px] font-black text-emerald-700 dark:text-emerald-300">
                                  <ShieldCheck className="h-3 w-3" /> Passport Verified
                                </span>
                              )}
                            </h4>
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-0.5">{app.profession || "Worker"}</p>
                          </div>
                          
                          <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase ${
                            app.status === "accepted" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" :
                            app.status === "rejected" ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" :
                            app.status === "under_review" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" :
                            "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          }`}>
                            {app.status.replace("_", " ")}
                          </span>
                        </div>

                        {/* Contact details */}
                        <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{app.email}</span>
                          </div>
                          {app.phoneNumber && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span>{app.phoneNumber}</span>
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-slate-500">Exp:</span> {app.experience_years} Years
                          </div>
                          <div>
                            <span className="font-bold text-slate-500">Education:</span> {app.education || "Graduate"}
                          </div>
                        </div>

                        {/* Skills */}
                        {app.skills && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {(typeof app.skills === "string" ? JSON.parse(app.skills || "[]") : app.skills).slice(0, 5).map((s) => (
                              <span key={s} className="rounded bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 text-[8.5px] font-bold text-slate-600 dark:text-slate-400">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Application Action Decision Buttons */}
                        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                          <button
                            disabled={updatingStatusId === app.application_id}
                            onClick={() => handleUpdateApplicantStatus(app.application_id, "accepted")}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition disabled:opacity-50 flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                          </button>
                          <button
                            disabled={updatingStatusId === app.application_id}
                            onClick={() => handleUpdateApplicantStatus(app.application_id, "under_review")}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition disabled:opacity-50 flex items-center justify-center gap-1"
                          >
                            <AlertCircle className="h-3.5 w-3.5" /> Under Review
                          </button>
                          <button
                            disabled={updatingStatusId === app.application_id}
                            onClick={() => handleUpdateApplicantStatus(app.application_id, "rejected")}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition disabled:opacity-50 flex items-center justify-center gap-1"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    ))}

                    {appliedWorkers.length === 0 && (
                      <div className="py-12 text-center text-slate-400 font-bold text-xs">
                        {selectedReq ? "No direct candidate worker applications received yet for this role." : "Select an active pipeline on the left to view applied workers."}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: AI Database Sourcing */}
            {activeTab === "sourcing" && (
              <div>
                {loadingCandidates ? (
                  <div className="py-10 text-center text-slate-500 font-bold animate-pulse text-xs">
                    Querying workforce passports database...
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                    {candidates.map((c, idx) => (
                      <div key={idx} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 p-4 relative overflow-hidden">
                        <div className="absolute right-0 top-0 bg-blue-600 text-white font-black text-[9px] px-2.5 py-0.5 rounded-bl-xl shadow-sm">
                          {c.matchScore}% Match
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">{c.fullname}</h4>
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-0.5">{c.profession}</p>
                          
                          <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                            <span>Exp: {c.experience_years} years</span>
                            <span>·</span>
                            <span>Target: {c.target_country || "Global"}</span>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-1">
                            {c.skills.slice(0, 4).map(s => (
                              <span key={s} className="rounded bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 text-[8.5px] font-bold text-slate-600 dark:text-slate-400">{s}</span>
                            ))}
                          </div>

                          <button
                            onClick={() => handleInvite(c.fullname)}
                            className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 text-white py-1.5 text-xs font-black hover:bg-slate-800 transition"
                          >
                            <UserCheck className="h-3.5 w-3.5" /> Invite to Screening
                          </button>
                        </div>
                      </div>
                    ))}

                    {candidates.length === 0 && (
                      <div className="py-10 text-center text-slate-400 font-bold text-xs">
                        {selectedReq ? "No database matches found. Try requesting a role with common keywords like Driver, Welder, Developer, or Worker." : "Select an active pipeline on the left to review candidate matches."}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
