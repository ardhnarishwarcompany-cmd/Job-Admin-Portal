import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Building2, Users, FileCheck2, ShieldCheck, CheckSquare, Square, 
  Save, Play, ExternalLink, RefreshCw, BadgeAlert, AlertCircle, Compass, Target, ArrowRight,
  TrendingUp, BarChart3, WalletCards, ShieldAlert, BadgeCheck, CheckCircle2, ChevronRight, X,
  BriefcaseBusiness, Globe2, Menu
} from "lucide-react";
const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 ${className}`}>
    {children}
  </div>
);

const CANDIDATE_MODULES = [
  ["dashboard", "Dashboard"],
  ["01", "Job Marketplace"],
  ["04", "Skill Gap Engine"],
  ["11", "Salary Intelligence"],
  ["12", "Worker Support Ecosystem"]
];

const RECRUITER_MODULES_LIST = [
  ["dashboard", "Dashboard"],
  ["13", "Workforce Management"],
  ["15", "Mass Workforce Solutions"],
  ["16", "Collar Marketplace"]
];

export default function GlobalWorkforceOversight() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [d, setD] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [userPermissions, setUserPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [draftPermissions, setDraftPermissions] = useState([]);
  const [isSavingPerms, setIsSavingPerms] = useState(false);

  const [oversight, setOversight] = useState(null);
  const [modules, setModules] = useState([]);
  const [logs, setLogs] = useState([]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [intelRes, companiesRes, oversightRes, controlsRes, auditRes, usersRes] = await Promise.all([
        axios.get(`${API}/api/workforce/intelligence`, { withCredentials: true }),
        axios.get(`${API}/api/admin/companies-verification`, { withCredentials: true }),
        axios.get(`${API}/api/admin/workforce-oversight`, { withCredentials: true }),
        axios.get(`${API}/api/admin/workforce-controls`, { withCredentials: true }),
        axios.get(`${API}/api/admin/workforce-audit`, { withCredentials: true }),
        axios.get(`${API}/api/admin/users`, { withCredentials: true })
      ]);
      setD(intelRes.data.data);
      setCompanies(companiesRes.data.companies || []);
      setOversight(oversightRes.data.overview || null);
      setModules(controlsRes.data.permissions || []);
      setLogs(auditRes.data.logs || []);
      
      const allUsers = usersRes.data.users || [];
      setCandidates(allUsers.filter(u => u.role === "Employee"));
      setRecruiters(allUsers.filter(u => u.role === "Recruiter"));

      const initialPerms = {};
      allUsers.forEach(u => {
        initialPerms[u._id || u.id] = u.permittedModules || ["dashboard"];
      });
      setUserPermissions(initialPerms);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load oversight intelligence.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCandidate = async (candidateId, action, permittedModules = []) => {
    setError("");
    setSuccess("");
    try {
      const res = await axios.put(`${API}/api/admin/verify/${candidateId}/${action}`, { permittedModules }, { withCredentials: true });
      if (res.data.success) {
        setSuccess(`Verification ${action}d successfully.`);
        loadData();
      }
    } catch (e) {
      setError(e?.response?.data?.message || `Failed to ${action} user.`);
    }
  };

  const openPermissionModal = (user) => {
    setEditingUser(user);
    const validKeys = user.role === "Recruiter" ? RECRUITER_MODULES_LIST.map(m => m[0]) : CANDIDATE_MODULES.map(m => m[0]);
    const userPerms = userPermissions[user._id || user.id] || ["dashboard"];
    setDraftPermissions(userPerms.filter(k => validKeys.includes(k)));
  };

  const toggleDraftModule = (key) => {
    setDraftPermissions(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const savePermissions = async () => {
    if (!editingUser) return;
    setIsSavingPerms(true);
    setError("");
    setSuccess("");
    const userId = editingUser._id || editingUser.id;
    try {
      const res = await axios.put(`${API}/api/admin/verify/${userId}/approve`, { permittedModules: draftPermissions }, { withCredentials: true });
      if (res.data.success) {
        setSuccess(`Permissions saved for ${editingUser.fullname}.`);
        setUserPermissions(prev => ({ ...prev, [userId]: draftPermissions }));
        setEditingUser(null);
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to save permissions.");
    } finally {
      setIsSavingPerms(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChecklistChange = (companyId, field) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === companyId) {
        const newChecklist = { ...c.verification_checklist, [field]: !c.verification_checklist[field] };
        let score = 50;
        let checkedCount = 0;
        ["registration", "website", "domain", "identity"].forEach(x => {
          if (newChecklist[x]) checkedCount++;
        });
        score = 50 + (checkedCount * 12.5);
        return { ...c, verification_checklist: newChecklist, trust_score: Math.round(score) };
      }
      return c;
    }));
  };

  const saveVerification = async (company) => {
    setUpdatingId(company.id);
    setError("");
    setSuccess("");
    try {
      const res = await axios.put(`${API}/api/admin/companies-verification/${company.id}`, {
        checklist: company.verification_checklist
      }, { withCredentials: true });

      if (res.data.success) {
        setSuccess(`Verification updated for ${company.name}`);
        loadData();
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to save verification.");
    } finally {
      setUpdatingId("");
    }
  };

  const activeModulesCount = modules.filter(m => m.enabled).length;

  const cards = [
    [Users, "Verified Workforce Members", oversight?.verifiedWorkers || 0],
    [BriefcaseBusiness, "Active Bulk Requests", oversight?.activeBulkRequests || 0],
    [CheckSquare, "Active Module Status", `${activeModulesCount} / 28 Enabled`],
    [BarChart3, "Audit Events Logged", logs.length]
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl animate-pulse font-bold text-slate-500">
          Loading Global Workforce Oversight...
        </div>
      </div>
    );
  }

  const candidateRequests = candidates.filter(c => c.verificationStatus !== "approved");
  const recruiterRequests = recruiters.filter(r => r.verificationStatus !== "approved");
  const candidatePermissionsList = candidates.filter(c => c.verificationStatus === "approved");
  const recruiterPermissionsList = recruiters.filter(r => r.verificationStatus === "approved");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      {/* Top Custom Sub-Navbar */}
      <header className="bg-slate-900 text-white px-4 md:px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <button 
            className="md:hidden text-slate-300 hover:text-white transition"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <Globe2 className="h-6 w-6 text-blue-500 animate-pulse hidden md:block" />
          <div>
            <h1 className="text-sm font-black tracking-tight text-white uppercase">Recruweb Global Workforce Hub</h1>
            <p className="text-[10px] font-bold text-slate-400">Control plane & governance console</p>
          </div>
        </div>
        <button 
          onClick={() => navigate("/admin/dashboard")}
          className="text-xs font-black text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 md:px-4 md:py-2 rounded-xl border border-slate-700/60 transition flex items-center gap-1 md:gap-2"
        >
          <span className="md:inline hidden">← Exit to Main Dashboard</span>
          <span className="inline md:hidden">Exit</span>
        </button>
      </header>

      {/* Main Container with Sidebar & Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Isolated Workforce Sidebar */}
        <aside className={`fixed md:static inset-y-0 left-0 z-50 w-72 transform border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shrink-0 flex flex-col p-4 space-y-1 overflow-y-auto custom-scrollbar transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
          <div className="flex justify-between items-center md:hidden px-3 py-2 mb-2">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Navigation Menu</div>
            <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hidden md:block">Navigation</div>
          
          <button 
            onClick={() => { setActiveTab("overview"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black transition ${activeTab === "overview" ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200" : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60"}`}
          >
            <Compass className="h-4 w-4" />
            <span>Oversight & Analytics</span>
          </button>

          <div className="pt-4 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Inbox Requests</div>

          <button 
            onClick={() => { setActiveTab("candidate_requests"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-black transition ${activeTab === "candidate_requests" ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200" : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60"}`}
          >
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4" />
              <span>Candidate Requests</span>
            </div>
            {candidateRequests.length > 0 && (
              <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 text-[10px] px-2 py-0.5 rounded-full font-black">
                {candidateRequests.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => { setActiveTab("recruiter_requests"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-black transition ${activeTab === "recruiter_requests" ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200" : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60"}`}
          >
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4" />
              <span>Recruiter Requests</span>
            </div>
            {recruiterRequests.length > 0 && (
              <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 text-[10px] px-2 py-0.5 rounded-full font-black">
                {recruiterRequests.length}
              </span>
            )}
          </button>

          <div className="pt-4 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Module Access Control</div>

          <button 
            onClick={() => { setActiveTab("candidate_permissions"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black transition ${activeTab === "candidate_permissions" ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200" : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60"}`}
          >
            <Target className="h-4 w-4" />
            <span>Candidate Permissions</span>
          </button>

          <button 
            onClick={() => { setActiveTab("recruiter_permissions"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black transition ${activeTab === "recruiter_permissions" ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200" : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60"}`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Recruiter Permissions</span>
          </button>
        </aside>

        {/* Dynamic Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {error && <div className="mb-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 p-4 border border-rose-100 text-sm font-bold text-rose-700">{error}</div>}
          {success && <div className="mb-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 p-4 border border-emerald-100 text-sm font-bold text-emerald-700">{success}</div>}

          {/* TAB 1: Oversight overview & stats */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">Workforce Intelligence & Oversight</h2>
                  <p className="text-xs text-slate-500 mt-1">Review relocation market indices, system audit trails, and manage employer verification scores.</p>
                </div>
                <button onClick={loadData} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-850 px-4 py-2.5 text-xs font-black text-white shadow transition">
                  <RefreshCw className="h-4 w-4" /> Refresh Data
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map(([I, l, v]) => (
                  <div key={l} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <I className="h-5 w-5 text-blue-500" />
                    <div className="mt-4 text-xs font-bold text-slate-500">{l}</div>
                    <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{Number(v).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                {/* Sourcing intelligence */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <h2 className="font-black text-slate-900 dark:text-white text-md">High-Demand Industry Segments</h2>
                    <BarChart3 className="text-emerald-500" />
                  </div>
                  <div className="mt-6 space-y-5">
                    {(d?.demand || []).map(x => (
                      <div key={x.name}>
                        <div className="flex justify-between text-xs font-bold">
                          <span>{x.name}</span>
                          <span className="text-blue-600">{x.jobs} Open Vacancies</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                          <div className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" style={{ width: `${Math.min(100, (x.jobs / Math.max(...(d?.demand || [{ jobs: 1 }]).map(y => y.jobs))) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Audit Logs */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 flex flex-col h-[400px]">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-black text-slate-900 dark:text-white text-md">System Audit Trail</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 text-xs">
                    {logs.map(l => (
                      <div key={l.id} className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 border border-slate-100 dark:border-slate-800 flex justify-between gap-3 items-start">
                        <div className="min-w-0">
                          <span className="rounded bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 text-[10px] font-black text-blue-800 uppercase">{l.action}</span>
                          <p className="mt-1 text-slate-700 dark:text-slate-300 truncate font-mono">{l.details}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{new Date(l.created_at).toLocaleString()}</span>
                        </div>
                        <span className="text-slate-500 font-bold flex-shrink-0">{l.adminName || "Admin"}</span>
                      </div>
                    ))}
                    {!logs.length && <p className="text-slate-400 text-center py-10 font-bold">No audit trail logs recorded yet.</p>}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Candidate Requests */}
          {activeTab === "candidate_requests" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Candidate Sourcing & Passport Verification Queue</h2>
                <p className="text-xs text-slate-500 mt-1">Audit verification documents and credentials for global workspace registrations.</p>
              </div>

              <div className="space-y-4">
                {candidateRequests.map(c => {
                  const docLink = c.candidateProfile?.verificationDocs?.[0];
                  const skills = c.candidateProfile?.skills || [];
                  return (
                    <div key={c._id || c.id} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-4 shadow-sm">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex gap-4 items-center">
                          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 font-black text-lg flex items-center justify-center uppercase">
                            {c.fullname?.[0] || "C"}
                          </div>
                          <div>
                            <h3 className="font-black text-slate-900 dark:text-white">{c.fullname}</h3>
                            <p className="text-xs text-slate-500 font-bold">{c.email} · Exp: {c.candidateProfile?.experience?.years || 0} years</p>
                            <div className="mt-2 flex flex-wrap gap-2 items-center">
                              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-700 border border-amber-200">
                                {c.verificationStatus}
                              </span>
                              {docLink && (
                                <a href={docLink} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 font-black hover:underline flex items-center gap-1">
                                  View Verification Document ↗
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerifyCandidate(c._id || c.id, "approve", userPermissions[c._id || c.id])}
                            className="rounded-lg bg-emerald-600 text-white px-4 py-2 text-xs font-black hover:bg-emerald-500 transition"
                          >
                            Approve Profile
                          </button>
                          <button
                            onClick={() => handleVerifyCandidate(c._id || c.id, "reject")}
                            className="rounded-lg bg-rose-600 text-white px-4 py-2 text-xs font-black hover:bg-rose-500 transition"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {candidateRequests.length === 0 && (
                  <div className="text-center py-12 text-slate-500 font-bold border border-dashed rounded-2xl bg-white dark:bg-slate-900 dark:border-slate-800">
                    No pending candidate activation requests.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Recruiter Requests */}
          {activeTab === "recruiter_requests" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Employer & Recruiter activations</h2>
                <p className="text-xs text-slate-500 mt-1">Audit company registry papers and activation queries for the Recruiter Workspace.</p>
              </div>

              <div className="space-y-4">
                {recruiterRequests.map(r => (
                  <div key={r._id || r.id} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-4 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex gap-4 items-center">
                        <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 font-black text-lg flex items-center justify-center uppercase">
                          {r.companyName?.[0] || "R"}
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 dark:text-white">{r.fullname}</h3>
                          <p className="text-xs text-slate-500 font-bold">{r.email} · GST: {r.gstNumber || "Not provided"}</p>
                          {r.recruiterProfile?.website && (
                            <a href={r.recruiterProfile.website} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 font-black hover:underline mt-1 block">
                              Website: {r.recruiterProfile.website} ↗
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerifyCandidate(r._id || r.id, "approve", userPermissions[r._id || r.id])}
                          className="rounded-lg bg-emerald-600 text-white px-4 py-2 text-xs font-black hover:bg-emerald-500 transition"
                        >
                          Activate Workspace
                        </button>
                        <button
                          onClick={() => handleVerifyCandidate(r._id || r.id, "reject")}
                          className="rounded-lg bg-rose-600 text-white px-4 py-2 text-xs font-black hover:bg-rose-500 transition"
                        >
                          Reject Request
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {recruiterRequests.length === 0 && (
                  <div className="text-center py-12 text-slate-500 font-bold border border-dashed rounded-2xl bg-white dark:bg-slate-900 dark:border-slate-800">
                    No pending recruiter activation requests.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Candidate Permissions */}
          {activeTab === "candidate_permissions" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Candidate Sourcing Profile Permissions</h2>
                <p className="text-xs text-slate-500 mt-1">Configure module-by-module feature permission matrices for approved candidates.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {candidatePermissionsList.map(c => (
                  <div 
                    key={c._id || c.id} 
                    onClick={() => openPermissionModal(c)}
                    className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-4 shadow-sm hover:shadow-md transition cursor-pointer group"
                  >
                    <div className="flex gap-3 items-start">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-black text-lg flex items-center justify-center uppercase shrink-0">
                        {c.fullname?.[0] || "C"}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-slate-900 dark:text-white truncate">{c.fullname}</h3>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5 truncate">{c.email}</p>
                      </div>
                    </div>
                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-500">{(userPermissions[c._id || c.id] || []).filter(k => CANDIDATE_MODULES.some(cm => cm[0] === k)).length} Modules Active</span>
                      <button className="text-[10px] font-black text-blue-600 dark:text-blue-400 group-hover:text-blue-700 transition flex items-center gap-1">
                        Manage Access <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {candidatePermissionsList.length === 0 && (
                <div className="text-center py-12 text-slate-500 font-bold border border-dashed rounded-2xl bg-white dark:bg-slate-900 dark:border-slate-800">
                  No verified candidate profiles found.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Recruiter Permissions */}
          {activeTab === "recruiter_permissions" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Employer Sourcing Profile Permissions</h2>
                <p className="text-xs text-slate-500 mt-1">Configure module-by-module feature permission matrices for approved employers.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recruiterPermissionsList.map(r => (
                  <div 
                    key={r._id || r.id} 
                    onClick={() => openPermissionModal(r)}
                    className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-4 shadow-sm hover:shadow-md transition cursor-pointer group"
                  >
                    <div className="flex gap-3 items-start">
                      <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 font-black text-lg flex items-center justify-center uppercase shrink-0">
                        {r.fullname?.[0] || "R"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-slate-900 dark:text-white truncate">{r.fullname}</h3>
                          <BadgeCheck className="h-3 w-3 text-blue-500" />
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5 truncate">{r.email}</p>
                      </div>
                    </div>
                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-500">{(userPermissions[r._id || r.id] || []).filter(k => RECRUITER_MODULES_LIST.some(rm => rm[0] === k)).length} Modules Active</span>
                      <button className="text-[10px] font-black text-blue-600 dark:text-blue-400 group-hover:text-blue-700 transition flex items-center gap-1">
                        Manage Access <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {recruiterPermissionsList.length === 0 && (
                <div className="text-center py-12 text-slate-500 font-bold border border-dashed rounded-2xl bg-white dark:bg-slate-900 dark:border-slate-800">
                  No verified recruiter profiles found.
                </div>
              )}
            </div>
          )}

          {/* User Permissions Modal */}
          {editingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm transition-opacity">
              <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-slate-900 flex flex-col overflow-hidden max-h-[90vh]">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
                  <div>
                    <h3 className="font-black text-lg text-slate-900 dark:text-white">
                      Access Permissions
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">{editingUser.fullname} ({editingUser.role})</p>
                  </div>
                  <button onClick={() => setEditingUser(null)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-3">
                  <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 p-4 border border-blue-100 dark:border-blue-900 mb-2">
                    <p className="text-xs font-bold text-blue-800 dark:text-blue-200">
                      Toggle the modules below to grant or revoke access instantly across the platform for this user.
                    </p>
                  </div>
                  
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(editingUser.role === "Recruiter" ? RECRUITER_MODULES_LIST : CANDIDATE_MODULES).map(([key, label]) => {
                      const checked = draftPermissions.includes(key);
                      return (
                        <div key={key} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{label}</span>
                          <button 
                            type="button" 
                            onClick={() => toggleDraftModule(key)}
                            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${checked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                          >
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
                  <button onClick={() => setEditingUser(null)} className="px-4 py-2.5 rounded-xl text-xs font-black text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                    Discard Changes
                  </button>
                  <button onClick={savePermissions} disabled={isSavingPerms} className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2">
                    {isSavingPerms ? "Saving..." : "Save Access & Continue"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
