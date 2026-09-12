import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, RefreshCw, Globe2, Target, ShieldCheck, Compass, 
  FolderGit2, Users, Truck, UserCheck, IdCard, CheckCircle2, 
  ArrowLeft, Search, Save, Play, ChevronRight, ChevronDown,
  TrendingUp, BarChart3, WalletCards, Building2, BriefcaseBusiness,
  Menu, X, Eye, DollarSign, MapPin, Mail, Phone, Clock, AlertCircle, MessageSquare
} from "lucide-react";
import Navbar from "../components_lite/Navbar";
import { API_URL } from "@/utils/data";

const COUNTRIES = ["India", "Germany", "UAE", "Saudi Arabia", "Qatar", "Canada", "United Kingdom", "Netherlands", "France", "Poland", "Italy", "Ireland", "United States", "Oman", "Kuwait", "Bahrain"];
const WORKER_CATEGORIES = ["IT", "Healthcare", "Construction", "Manufacturing", "Hospitality", "Logistics", "Drivers", "Retail", "Security", "Facility management", "Finance", "Sales", "Engineering", "Skilled trades", "Domestic services", "Blue-collar workforce", "White-collar professionals"];

const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 transition-all hover:shadow-md ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", disabled = false, type = "button", className = "" }) => (
  <button 
    type={type}
    disabled={disabled} 
    onClick={onClick} 
    className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-extrabold transition cursor-pointer ${
      variant === "ghost" 
        ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200" 
        : "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20 hover:-translate-y-0.5"
    } disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    {children}
  </button>
);

const Input = ({ label, value, onChange, type = "text", placeholder }) => (
  <label className="block">
    <span className="mb-2 block text-xs font-black text-slate-700 dark:text-slate-300">{label}</span>
    <input 
      type={type} 
      value={value ?? ""} 
      placeholder={placeholder} 
      onChange={e => onChange(e.target.value)} 
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white transition shadow-sm hover:border-slate-300"
    />
  </label>
);

const Select = ({ label, value, onChange, options = [] }) => {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative block w-full" ref={ref}>
      {label && (
        <span className="mb-2 block text-xs font-black text-slate-700 dark:text-slate-300">{label}</span>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white transition shadow-sm hover:border-slate-300 text-left cursor-pointer"
      >
        <span className="truncate">{value || "Select option..."}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-800 dark:bg-slate-900 custom-scrollbar">
          {options.map((opt, idx) => (
            <button
              key={`select-${opt}-${idx}`}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold text-left transition ${
                value === opt
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              <span className="truncate">{opt}</span>
              {value === opt && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const TextArea = ({ label, value, onChange, placeholder }) => (
  <label className="block">
    <span className="mb-2 block text-xs font-black text-slate-700 dark:text-slate-300">{label}</span>
    <textarea 
      rows={4} 
      value={value ?? ""} 
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)} 
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white transition shadow-sm hover:border-slate-300"
    />
  </label>
);

const Stat = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 dark:border-slate-800 dark:bg-slate-900/90 shadow-sm">
    <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
    <p className="mt-3 text-xs font-bold text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{value}</p>
  </div>
);

const getReqBadgeClass = (st) => {
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

const RECRUITER_MODULES = [
  ["dashboard", "Dashboard Analytics", "Real-time recruiter KPIs, live requisitions, and active candidate pipelines.", FolderGit2],
  ["13", "Employer Workforce Management", "Full mass hiring requisition management, status controls, and candidate applications.", Truck],
  ["15", "Mass Workforce Solutions", "Post new manpower requisitions and inspect AI candidate matching pools.", Sparkles],
  ["16", "Blue + White Collar Marketplace", "Select candidate pools filtered by industry categories.", Globe2]
];

export default function RecruiterWorkforceHub() {
  const navigate = useNavigate();
  const api = `${API_URL}/api/workforce`;

  const [active, setActive] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  
  // Database State
  const [companyInfo, setCompanyInfo] = useState(null);
  const [bulkRequests, setBulkRequests] = useState([]);
  const [matchingCandidates, setMatchingCandidates] = useState([]);
  const [appliedWorkers, setAppliedWorkers] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);

  // Form State
  const [role, setRole] = useState("");
  const [country, setCountry] = useState("UAE");
  const [workers, setWorkers] = useState(10);
  const [salary, setSalary] = useState("");
  const [category, setCategory] = useState("Construction");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // UI state
  const [activeModules, setActiveModules] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const notify = m => {
    setToast(m);
    window.clearTimeout(window.__rwToast);
    window.__rwToast = window.setTimeout(() => setToast(""), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [d, bk] = await Promise.all([
        axios.get(`${api}/dashboard`, { withCredentials: true }),
        axios.get(`${api}/bulk`, { withCredentials: true })
      ]);
      
      setCompanyInfo(d.data);
      setActiveModules(d.data.activeModules || []);
      const reqs = bk.data.requests || [];
      setBulkRequests(reqs);
      
      if (reqs.length > 0) {
        setSelectedReq(reqs[0]);
        loadApplicantsForReq(reqs[0].id);
      }
    } catch (e) {
      console.error(e);
      notify("Connected to Recruweb Employer Engine.");
    } finally {
      setLoading(false);
    }
  };

  const loadCandidatesForReq = async (reqId) => {
    try {
      const res = await axios.get(`${api}/bulk/${reqId}/candidates`, { withCredentials: true });
      if (res.data.success) {
        setMatchingCandidates(res.data.candidates || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadApplicantsForReq = async (reqId) => {
    try {
      const res = await axios.get(`${api}/bulk/${reqId}/applicants`, { withCredentials: true });
      if (res.data.success) {
        setAppliedWorkers(res.data.applicants || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (selectedReq?.id) {
      loadCandidatesForReq(selectedReq.id);
      loadApplicantsForReq(selectedReq.id);
    }
  }, [selectedReq]);

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!role.trim()) {
      notify("Requisition role is required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(`${api}/bulk`, {
        role,
        country,
        workers: Number(workers) || 0,
        salary,
        category,
        notes
      }, { withCredentials: true });

      if (res.data.success) {
        notify("Mass hiring requisition posted successfully.");
        setRole("");
        setNotes("");
        setSalary("");
        setWorkers(10);
        load();
      }
    } catch (err) {
      notify("Failed to post requisition.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateJobStatus = async (jobId, newStatus) => {
    try {
      const res = await axios.patch(`${api}/bulk/${jobId}/status`, { status: newStatus }, { withCredentials: true });
      if (res.data.success) {
        notify(`Mass hiring job status updated to ${newStatus}`);
        setBulkRequests(prev => prev.map(r => r.id === jobId ? { ...r, status: newStatus } : r));
        if (selectedReq?.id === jobId) setSelectedReq(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      notify("Failed to update requisition status.");
    }
  };

  const handleUpdateApplicantStatus = async (applicationId, newStatus) => {
    try {
      const res = await axios.patch(`${api}/bulk/applicants/${applicationId}/status`, { status: newStatus }, { withCredentials: true });
      if (res.data.success) {
        notify(`Worker application status updated to ${newStatus}`);
        if (selectedReq?.id) {
          loadApplicantsForReq(selectedReq.id);
        }
      }
    } catch (err) {
      notify("Failed to update worker status.");
    }
  };

  const handleStartChatWithCandidate = async (candidateId) => {
    try {
      const res = await axios.post(`${API_URL}/api/messaging/recruiter-candidate/start`, { candidateId }, { withCredentials: true });
      if (res.data.success) {
        notify("Conversation initiated with candidate!");
        navigate("/recruiter/chats");
      }
    } catch (err) {
      if (err.response?.status === 403) {
        notify("Access Restricted: Request Chat feature access from Admin.");
      } else {
        notify(err.response?.data?.message || "Unable to start chat.");
      }
    }
  };

  // Real-time Database Metrics (Zero Dummy Data)
  const totalWorkersNeeded = useMemo(() => bulkRequests.reduce((sum, r) => sum + (Number(r.workers) || 0), 0), [bulkRequests]);
  const underReviewCount = useMemo(() => appliedWorkers.filter(a => a.applicationStatus === 'applied' || a.applicationStatus === 'under_review').length, [appliedWorkers]);
  const hiredCount = useMemo(() => appliedWorkers.filter(a => a.applicationStatus === 'accepted').length, [appliedWorkers]);

  const filteredJobs = useMemo(() => {
    return bulkRequests.filter(r => 
      (r.role || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.country || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.category || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [bulkRequests, searchQuery]);

  if (loading) return (
    <>
      <Navbar />
      <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center animate-pulse">
          <Sparkles className="mx-auto h-10 w-10 text-blue-600" />
          <p className="mt-4 font-black text-slate-500 dark:text-slate-400 text-sm">Connecting to Recruweb Employer Controls...</p>
        </div>
      </div>
    </>
  );

  const verificationStatus = companyInfo?.stats?.verificationStatus || "approved";

  return (
    <>
      <Navbar />
      <main className="h-screen overflow-hidden bg-slate-50/70 dark:bg-slate-950 flex transition-colors duration-300">
        {/* Left Sidebar - Desktop */}
        <aside className="hidden lg:flex w-80 shrink-0 flex-col border-r border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95 h-full overflow-y-auto custom-scrollbar">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Recruiter Controls</p>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">Global Workforce Hub</h2>
            </div>
            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[9px] font-black text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">LIVE</span>
          </div>

          {/* Module List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
            {RECRUITER_MODULES.map(([id, title, desc, Icon]) => (
              <button 
                key={`rec-module-${id}`} 
                onClick={() => setActive(id)} 
                className={`w-full flex items-start gap-3.5 rounded-xl p-3.5 text-left transition duration-300 cursor-pointer ${
                  active === id 
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20" 
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-xs font-black">{title}</span>
                  </div>
                  <p className={`mt-1 line-clamp-2 text-[10px] leading-4 ${active === id ? "text-white/80" : "text-slate-400"}`}>{desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 grid place-items-center font-black text-sm uppercase">
              {companyInfo?.name?.[0] || "E"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-black text-slate-900 dark:text-white">{companyInfo?.name || "Verified Employer"}</p>
              <p className="truncate text-[10px] text-slate-400">Employer Account</p>
            </div>
          </div>
        </aside>

        {/* Mobile Slide-Over Sidebar Drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 top-0 z-50 flex w-72 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 lg:hidden shadow-2xl"
              >
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Recruiter Controls</p>
                    <h2 className="text-sm font-black text-slate-900 dark:text-white">Active Modules</h2>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
                  {RECRUITER_MODULES.map(([id, title, desc, Icon]) => (
                    <button 
                      key={`mob-module-${id}`} 
                      onClick={() => { setActive(id); setSidebarOpen(false); }} 
                      className={`w-full flex items-start gap-3.5 rounded-xl p-3.5 text-left transition duration-300 ${
                        active === id 
                          ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20" 
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                      <div className="min-w-0">
                        <span className="truncate text-xs font-black block">{title}</span>
                        <p className={`mt-1 line-clamp-2 text-[10px] ${active === id ? "text-white/80" : "text-slate-400"}`}>{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Right Workspace Area */}
        <div className="flex-1 h-full overflow-y-auto flex flex-col custom-scrollbar">
          {/* Header Banner */}
          <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(37,99,235,.15),transparent_32%),radial-gradient(circle_at_90%_0%,rgba(6,182,212,.15),transparent_30%)]" />
            <div className="relative mx-auto max-w-7xl px-4 py-6 md:py-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 mr-1 hover:bg-slate-200">
                      <Menu className="h-4 w-4" />
                    </button>
                    <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] font-black text-white">RECRUWEB GLOBAL</span>
                    <span className="rounded-full border border-blue-200 bg-blue-50/30 px-3 py-1 text-[10px] font-black text-blue-700 dark:text-blue-400">EMPLOYER CONTROLS</span>
                  </div>
                  <h1 className="mt-3 max-w-4xl text-2xl sm:text-4xl font-black tracking-tight text-slate-950 dark:text-white">Recruiter Global Workforce</h1>
                  <p className="mt-2 max-w-3xl text-xs sm:text-sm text-slate-500 dark:text-slate-400">Manage mass hiring requisitions, control candidate application status, and inspect worker profiles.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <Button onClick={load}><RefreshCw className="h-4 w-4" /> Refresh Live Data</Button>
                  <Link to="/recruiter/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-200 hover:bg-slate-50">Back to Dashboard</Link>
                </div>
              </div>

              {/* Recruiter Live Analytics Dashboard */}
              <div className="mt-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
                <Stat icon={BriefcaseBusiness} label="Total Mass Requisitions" value={bulkRequests.length} />
                <Stat icon={Users} label="Headcount Requested" value={totalWorkersNeeded.toLocaleString()} />
                <Stat icon={Clock} label="Applications Under Review" value={underReviewCount} />
                <Stat icon={CheckCircle2} label="Hired / Deployed Workers" value={hiredCount} />
              </div>
            </div>
          </section>

          {/* Active Module Area */}
          <section className="mx-auto max-w-7xl px-4 py-6 flex-1 w-full">
            {/* MODULE: DASHBOARD OVERVIEW */}
            {active === "dashboard" && (
              <div className="space-y-6">
                <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                    <div>
                      <h3 className="text-xl font-black text-slate-950 dark:text-white">Mass Hiring Requisitions Overview</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Live requisitions created by your employer account from the database.</p>
                    </div>
                    <Button onClick={() => setActive("13")} className="text-xs font-black">
                      <Truck className="h-4 w-4" /> Manage All Requisitions
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {bulkRequests.map((r, idx) => (
                      <div key={`dash-req-${r.id}-${idx}`} className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <span className="rounded-full bg-blue-100 dark:bg-blue-950 px-2.5 py-0.5 text-[9.5px] font-black text-blue-700 dark:text-blue-300">
                              👥 {r.workers} Workers
                            </span>
                            <span className={`rounded-full px-2.5 py-0.5 text-[9.5px] font-black uppercase border ${getReqBadgeClass(r.status)}`}>
                              {r.status}
                            </span>
                          </div>
                          <h4 className="mt-3 text-base font-black text-slate-950 dark:text-white">{r.role}</h4>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-bold">
                            <MapPin className="h-3.5 w-3.5 text-blue-500" /> {r.country || "Global"}
                          </p>
                          {r.salary && <p className="mt-1 text-xs font-black text-emerald-600 dark:text-emerald-400">💰 {r.salary}</p>}
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex justify-between items-center">
                          <span className="text-[11px] font-bold text-slate-500">Applicants: <b>{r.applicantCount || 0}</b></span>
                          <button
                            onClick={() => { setSelectedReq(r); setActive("13"); }}
                            className="text-xs font-black text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            Inspect & Manage →
                          </button>
                        </div>
                      </div>
                    ))}

                    {bulkRequests.length === 0 && (
                      <div className="col-span-full py-12 text-center text-slate-400 font-bold text-xs bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                        No mass hiring requisitions created yet. Use "Employer Workforce Management" to post your first requisition.
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* MODULE: EMPLOYER WORKFORCE MANAGEMENT (13) */}
            {active === "13" && (
              <div className="space-y-6">
                {/* Search & Post Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search requisitions by role, country, category..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs font-semibold outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                  <Button onClick={() => setActive("15")} className="text-xs font-black shrink-0">
                    <Sparkles className="h-4 w-4" /> Post New Mass Requisition
                  </Button>
                </div>

                {/* Requisitions Grid */}
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {filteredJobs.map((j, idx) => (
                    <Card key={`manage-job-${j.id}-${idx}`} className="flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <span className="rounded-full bg-blue-100 dark:bg-blue-950/80 px-3 py-1 text-[10px] font-black text-blue-700 dark:text-blue-300">
                            👥 {j.workers} Workers Needed
                          </span>
                          <span className={`rounded-full px-2.5 py-0.5 text-[9.5px] font-black uppercase border ${getReqBadgeClass(j.status)}`}>
                            {j.status}
                          </span>
                        </div>

                        <h3 className="text-lg font-black text-slate-950 dark:text-white leading-snug">{j.role}</h3>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-blue-500 shrink-0" /> {j.country || "Global Target"}
                          {j.category && <span>· {j.category}</span>}
                        </p>

                        {j.salary && (
                          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5" /> Offered Salary: {j.salary}
                          </p>
                        )}

                        {/* Recruiter Quick Status Transition */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Update Requisition Status</label>
                          <select
                            value={j.status}
                            onChange={(e) => handleUpdateJobStatus(j.id, e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white shadow-xs outline-none focus:border-blue-500 cursor-pointer"
                          >
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

                      <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          Applied Workers: <b>{j.applicantCount || 0}</b>
                        </span>
                        <button
                          onClick={() => { setSelectedReq(j); setInspectModalOpen(true); }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-3.5 py-2 text-xs font-black text-white shadow-md hover:shadow-lg transition cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" /> Inspect Requisition & Workers
                        </button>
                      </div>
                    </Card>
                  ))}

                  {filteredJobs.length === 0 && (
                    <div className="col-span-full py-16 text-center text-slate-500 font-bold bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                      No requisitions match your search filter.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MODULE: MASS WORKFORCE SOLUTIONS (15) */}
            {active === "15" && (
              <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
                {/* Post Requisition Form */}
                <Card className="h-fit p-5 sm:p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <h3 className="text-base font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-600" /> Post Mass Hiring Requisition
                  </h3>
                  <form onSubmit={handleBulkSubmit} className="space-y-4">
                    <Input label="Role Title Needed" placeholder="e.g. Heavy Driver / Structural Welder" value={role} onChange={setRole} />
                    <div className="grid grid-cols-2 gap-3">
                      <Select label="Target Country" value={country} onChange={setCountry} options={COUNTRIES} />
                      <Select label="Industry Category" value={category} onChange={setCategory} options={WORKER_CATEGORIES} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Headcount Needed" type="number" value={workers} onChange={setWorkers} />
                      <Input label="Salary Offered (Optional)" placeholder="e.g. $2,500 / month" value={salary} onChange={setSalary} />
                    </div>
                    <TextArea label="Campaign Notes / Requirements" placeholder="Detail certifications, experience, language needs..." value={notes} onChange={setNotes} />
                    <Button disabled={submitting} type="submit" className="w-full">
                      {submitting ? "Posting..." : "Publish Mass Hiring Requisition"}
                    </Button>
                  </form>
                </Card>

                {/* Live Active Requisitions List */}
                <Card className="h-fit p-5 sm:p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">
                    Active Sourcing Campaigns ({bulkRequests.length})
                  </h3>
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                    {bulkRequests.map((r, idx) => (
                      <div 
                        key={`sol-req-${r.id}-${idx}`}
                        onClick={() => { setSelectedReq(r); loadCandidatesForReq(r.id); }}
                        className={`p-4 rounded-2xl border cursor-pointer transition ${
                          selectedReq?.id === r.id ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/30" : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-black text-sm text-slate-900 dark:text-white">{r.role}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{r.country} · {r.workers} workers needed</p>
                          </div>
                          <span className={`text-[9.5px] font-black uppercase rounded-full px-2.5 py-0.5 border ${getReqBadgeClass(r.status)}`}>
                            {r.status}
                          </span>
                        </div>
                      </div>
                    ))}

                    {bulkRequests.length === 0 && <p className="text-xs text-slate-500 dark:text-slate-400">No active campaigns created yet.</p>}
                  </div>
                </Card>
              </div>
            )}

            {/* MODULE: BLUE + WHITE COLLAR MARKETPLACE (16) */}
            {active === "16" && (() => {
              const categories = [
                // BLUE COLLAR CATEGORIES
                { label: "Welders & Fitters", key: "welder", keywords: ["welder", "fitter", "welding", "pipefitter"], type: "Blue Collar", icon: "🔥", desc: "Structural, TIG/MIG welders & pipefitters" },
                { label: "Construction & Civil Staff", key: "construction", keywords: ["construction", "mason", "carpenter", "rebar", "civil", "labor", "builder"], type: "Blue Collar", icon: "🏗️", desc: "Masons, carpenters, rebar & site workers" },
                { label: "Electricians & Wiremen", key: "electrician", keywords: ["electrician", "wireman", "electrical", "wire"], type: "Blue Collar", icon: "⚡", desc: "Industrial & commercial electrical technicians" },
                { label: "Plumbers & Pipe Mechanics", key: "plumber", keywords: ["plumber", "pipe", "plumbing", "sanitary"], type: "Blue Collar", icon: "🔧", desc: "Sanitary, piping & maintenance mechanics" },
                { label: "Logistics & Drivers", key: "driver", keywords: ["driver", "logistics", "truck", "forklift", "delivery", "transport"], type: "Blue Collar", icon: "🚛", desc: "Heavy truck, forklift & delivery drivers" },
                { label: "Factory & Machine Operators", key: "factory", keywords: ["factory", "cnc", "operator", "machine", "assembly", "plant"], type: "Blue Collar", icon: "🏭", desc: "CNC operators, assembly line & plant staff" },
                { label: "Security & Facility Staff", key: "security", keywords: ["security", "guard", "facility", "keeper", "supervisor"], type: "Blue Collar", icon: "🛡️", desc: "Guards, supervisors & facility keepers" },
                { label: "Hospitality & Housekeeping", key: "hotel", keywords: ["hotel", "hospitality", "cook", "chef", "waiter", "housekeeping", "cleaner"], type: "Blue Collar", icon: "🏨", desc: "Cooks, waiters, room attendants & cleaners" },
                { label: "Mechanics & Technicians", key: "mechanic", keywords: ["mechanic", "technician", "automotive", "hvac", "machinery", "repair"], type: "Blue Collar", icon: "🚘", desc: "Automotive, HVAC & machinery technicians" },

                // WHITE COLLAR CATEGORIES
                { label: "IT & Software Engineers", key: "software", keywords: ["software", "it", "developer", "engineer", "code", "qa", "cloud", "web"], type: "White Collar", icon: "💻", desc: "Developers, cloud engineers & QA testers" },
                { label: "Healthcare & Medical Staff", key: "healthcare", keywords: ["health", "medical", "nurse", "doctor", "pharmacist", "lab"], type: "White Collar", icon: "🏥", desc: "Nurses, lab techs, doctors & pharmacists" },
                { label: "Finance & Accounting", key: "finance", keywords: ["finance", "accountant", "accounting", "audit", "analyst", "cashier"], type: "White Collar", icon: "📊", desc: "Accountants, auditors & financial analysts" },
                { label: "Sales & Marketing", key: "sales", keywords: ["sales", "marketing", "business", "bd", "executive"], type: "White Collar", icon: "📈", desc: "Business development & marketing leads" },
                { label: "HR & Recruitment", key: "hr", keywords: ["hr", "recruitment", "recruiter", "talent", "human resource"], type: "White Collar", icon: "👥", desc: "Talent acquisition & HR operations" },
                { label: "Project & Site Managers", key: "manager", keywords: ["manager", "project", "site", "lead", "supervisor"], type: "White Collar", icon: "📋", desc: "Site engineers, project leads & supervisors" }
              ];

              const matchesCat = (c, cat) => {
                if (!cat) return false;
                const text = `${c.profession || ""} ${Array.isArray(c.skills) ? c.skills.join(" ") : c.skills || ""} ${c.bio || ""} ${c.education || ""}`.toLowerCase();
                if (cat.keywords && cat.keywords.some(k => text.includes(k))) return true;
                return text.includes(cat.key.toLowerCase());
              };

              return (
                <div className="space-y-6">
                  {/* Blue Collar Pool Section */}
                  <Card className="p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <div>
                        <span className="rounded-full bg-amber-100 dark:bg-amber-950/80 px-3 py-1 text-[10px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider">Blue-Collar Workforce</span>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1.5">Skilled Trades, Labor & Technical Operations</h3>
                      </div>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Verified Database Pools</span>
                    </div>

                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {categories.filter(cat => cat.type === "Blue Collar").map(cat => {
                        const matched = matchingCandidates.filter(c => matchesCat(c, cat));
                        return (
                          <div 
                            key={cat.label} 
                            onClick={() => setSelectedCategory(cat)}
                            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 transition cursor-pointer group flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex justify-between items-start">
                                <span className="text-2xl sm:text-3xl p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80">{cat.icon}</span>
                                <span className="rounded-full bg-blue-50 dark:bg-blue-950/80 px-2.5 py-1 text-[10px] font-black text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
                                  {matched.length} Candidates
                                </span>
                              </div>
                              <h4 className="font-black text-sm text-slate-900 dark:text-white mt-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">{cat.label}</h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{cat.desc}</p>
                            </div>
                            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-blue-600 dark:text-blue-400">
                              <span>View Candidates Pool</span>
                              <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  {/* White Collar Pool Section */}
                  <Card className="p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <div>
                        <span className="rounded-full bg-blue-100 dark:bg-blue-950/80 px-3 py-1 text-[10px] font-black text-blue-800 dark:text-blue-300 uppercase tracking-wider">White-Collar Professionals</span>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1.5">Engineers, Healthcare, Finance & Management</h3>
                      </div>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Verified Database Pools</span>
                    </div>

                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {categories.filter(cat => cat.type === "White Collar").map(cat => {
                        const matched = matchingCandidates.filter(c => matchesCat(c, cat));
                        return (
                          <div 
                            key={cat.label} 
                            onClick={() => setSelectedCategory(cat)}
                            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 transition cursor-pointer group flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex justify-between items-start">
                                <span className="text-2xl sm:text-3xl p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80">{cat.icon}</span>
                                <span className="rounded-full bg-blue-50 dark:bg-blue-950/80 px-2.5 py-1 text-[10px] font-black text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
                                  {matched.length} Candidates
                                </span>
                              </div>
                              <h4 className="font-black text-sm text-slate-900 dark:text-white mt-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">{cat.label}</h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{cat.desc}</p>
                            </div>
                            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-blue-600 dark:text-blue-400">
                              <span>View Candidates Pool</span>
                              <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              );
            })()}
          </section>
        </div>
      </main>

      {toast && <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-950 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-2xl">{toast}</div>}

      {/* REQUISITION INSPECTION & CANDIDATE MANAGE MODAL */}
      <AnimatePresence>
        {inspectModalOpen && selectedReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-50 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 custom-scrollbar"
            >
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-full bg-blue-600 text-white text-[9px] font-black px-2.5 py-0.5">RECRUITER REQUISITION</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[9.5px] font-black uppercase border ${getReqBadgeClass(selectedReq.status)}`}>
                      {selectedReq.status}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-950 dark:text-white">{selectedReq.role}</h2>
                  <p className="text-xs text-slate-500 mt-1">Target Country: <b>{selectedReq.country || "Global"}</b> · Headcount Needed: <b>{selectedReq.workers} Workers</b></p>
                </div>
                <button onClick={() => setInspectModalOpen(false)} className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Status Update & Notes */}
              <div className="grid gap-6 md:grid-cols-2 mb-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">Requisition Status Control</h3>
                  <select
                    value={selectedReq.status}
                    onChange={(e) => handleUpdateJobStatus(selectedReq.id, e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white shadow-xs outline-none cursor-pointer"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="screening">Screening</option>
                    <option value="verification">Verification</option>
                    <option value="interview">Interview</option>
                    <option value="selection">Selection</option>
                    <option value="deployment">Deployment</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">Requisition Notes & Details</h3>
                  {selectedReq.salary && <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">Salary Offered: {selectedReq.salary}</p>}
                  {selectedReq.notes ? (
                    <p className="text-xs italic text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">"{selectedReq.notes}"</p>
                  ) : <p className="text-xs text-slate-400">No additional notes provided.</p>}
                </div>
              </div>

              {/* Applied Worker List */}
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-base font-black text-slate-950 dark:text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" /> Applied Candidates ({appliedWorkers.length})
                  </h3>
                  <span className="text-xs font-bold text-slate-500">Live Worker Applications</span>
                </div>

                <div className="space-y-4">
                  {appliedWorkers.map((w, idx) => (
                    <div key={`applied-worker-${w.applicationId || idx}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm text-slate-950 dark:text-white">{w.fullname || w.workerName}</h4>
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

                          <select
                            value={w.applicationStatus}
                            onChange={(e) => handleUpdateApplicantStatus(w.applicationId, e.target.value)}
                            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-900 cursor-pointer"
                          >
                            <option value="applied">Applied</option>
                            <option value="under_review">Under Review</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3 text-xs text-slate-600 dark:text-slate-400">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase">Contact Information</p>
                          <p className="font-bold text-slate-900 dark:text-white mt-1">{w.email || w.workerEmail}</p>
                          <p>{w.phoneNumber || w.workerPhone || "No phone listed"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase">Experience & Education</p>
                          <p className="font-bold text-slate-900 dark:text-white mt-1">{w.experience_years || 0} Years Experience</p>
                          <p>{w.education || "Graduate"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase">Target Country</p>
                          <p className="font-bold text-slate-900 dark:text-white mt-1">{w.target_country || "Global"}</p>
                          <p>Applied: {new Date(w.appliedAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <button
                          onClick={() => handleStartChatWithCandidate(w.userId || w.workerId)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-3.5 py-1.5 text-xs font-black text-white shadow-md hover:shadow-lg transition cursor-pointer"
                        >
                          <MessageSquare className="h-3.5 w-3.5" /> Send Message / Chat 💬
                        </button>
                      </div>
                    </div>
                  ))}

                  {appliedWorkers.length === 0 && (
                    <div className="p-8 text-center text-slate-400 font-bold text-xs bg-slate-50 dark:bg-slate-950 rounded-2xl border">
                      No candidate worker applications submitted yet for this mass hiring requisition.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CANDIDATE PASSPORT DETAIL MODAL */}
      <AnimatePresence>
        {selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-xl w-full shadow-2xl overflow-y-auto max-h-[85vh] custom-scrollbar"
            >
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <div>
                  <span className="rounded-full bg-blue-100 dark:bg-blue-950 px-2.5 py-0.5 text-[9px] font-black text-blue-700 dark:text-blue-300 uppercase">
                    Verified Member ✓
                  </span>
                  <h4 className="text-xl font-black mt-2 text-slate-900 dark:text-white">{selectedCandidate.fullname || "Candidate Profile"}</h4>
                  <p className="text-xs text-slate-500 mt-1">{selectedCandidate.profession} · {selectedCandidate.email}</p>
                </div>
                <button onClick={() => setSelectedCandidate(null)} className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <h5 className="font-black text-slate-900 dark:text-white text-xs mb-1">Workforce Passport ID</h5>
                  <p className="font-mono bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    {selectedCandidate.workforce_id || "Workforce Member"}
                  </p>
                </div>
                <div>
                  <h5 className="font-black text-slate-900 dark:text-white text-xs mb-1">Professional Bio</h5>
                  <p className="text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    "{selectedCandidate.bio || "No summary provided."}"
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-black text-slate-900 dark:text-white text-xs mb-1">Experience</h5>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold">{selectedCandidate.experience_years || 0} Years</p>
                  </div>
                  <div>
                    <h5 className="font-black text-slate-900 dark:text-white text-xs mb-1">Target Country</h5>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold">{selectedCandidate.target_country || "Global"}</p>
                  </div>
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleStartChatWithCandidate(selectedCandidate.user_id || selectedCandidate.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-xs font-black text-white shadow-md hover:shadow-lg transition cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4" /> Message Candidate 💬
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
