import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, ArrowRight, BadgeCheck, BarChart3, BookOpen, BriefcaseBusiness, Building2, CheckCircle2,
  ChevronRight, Globe2, GraduationCap, Handshake, HardHat, IdCard, Languages, LineChart, MapPinned,
  MessageCircle, Mic2, Network, Rocket, Search, ShieldCheck, Sparkles, Target, TrendingUp, Truck,
  UserCheck, Users, WalletCards, Home, Brain, FileText, Landmark, RefreshCw, Play, Save, ExternalLink, Compass,
  Menu, X, ChevronDown, PanelLeftClose, PanelLeftOpen, ChevronLeft
} from "lucide-react";
import Navbar from "../components_lite/Navbar";
import { API_URL } from "@/utils/data";

const api = `${API_URL}/api/workforce`;
const MODULES = [
  ["dashboard", "Dashboard Analytics", "AI readiness indicators, relocation steps progress and global jobs matching.", Activity],
  ["01","Global Job Marketplace","Live approved jobs from the Recruweb database.",BriefcaseBusiness],
  ["03","AI Job Matching Engine","Rank live jobs against the signed-in worker profile.",Target],
  ["04","Global Skill Gap Engine","Form-driven current vs target profession analysis and AI career roadmap.",GraduationCap],
  ["05","Employer & Job Verification","Request human verification and view trust status.",ShieldCheck],
  ["06","International Workforce Mobility","Live target-country jobs plus relocation readiness.",MapPinned],
  ["11","Global Salary Intelligence","Use salary records actually stored against live jobs.",WalletCards],
  ["12","Worker Support Ecosystem","Save and track worker relocation support actions.",Home],
  ["13","Employer Workforce Management","Open recruiter workforce workflow.",Building2],
  ["14","Global Recruiter Marketplace","Open recruiter and candidate marketplace tools.",Handshake],
  ["15","Mass Workforce Solutions","Create a real bulk workforce request in the database.",Truck],
  ["16","Blue + White Collar Marketplace","Live job categories across worker segments.",HardHat],
  ["17","Worker Trust Profile","Manage authorized trust signals.",UserCheck],
  ["18","Recruweb Workforce Passport","Create and persist the portable workforce profile.",IdCard],
  ["19","Complete Recruweb Ecosystem","Interactive platform workflow map.",Network],
  ["20","Business Model","Interactive operating/revenue planning workspace.",Landmark],
  ["21","Worker Portal","Direct links to candidate workflows.",Users],
  ["22","Employer Portal","Direct links to employer workflows.",Building2],
  ["23","Recruiter Portal","Direct links to recruiter workflows.",Handshake],
  ["24","AI Workforce Engine","Run explainable profile-to-job matching.",Brain],
  ["25","Global Workforce Intelligence","Live database workforce analytics.",LineChart],
  ["26","Global Launch Roadmap","Interactive rollout milestones stored as activity.",Rocket],
  ["27","Long-Term Workforce Vision","Interactive career lifecycle milestones.",Sparkles],
  ["28","Learn → Verify → Match → Apply → Work → Grow","Interactive end-to-end career loop.",Activity],
];
const QUALIFICATIONS=["10th","12th","ITI","Diploma","Polytechnic","Certificate Course","Graduate","B.A.","B.Com","B.Sc.","BBA","BCA","B.E.","B.Tech","B.Arch","LLB","MBBS","B.Pharm","B.Ed.","Postgraduate","M.A.","M.Com","M.Sc.","MBA","MCA","M.E.","M.Tech","M.Arch","LLM","MD","MS","M.Pharm","M.Ed.","PG Diploma","PhD","Doctorate","Other"];
const EXPERIENCE=["Fresher","0-6 Months","1-2 Years","2-4 Years","4-6 Years","6-10 Years","10-15 Years","15+ Years","Other"];
const COUNTRIES = [
  "India", "Germany", "UAE", "Saudi Arabia", "Qatar", "Canada", "United Kingdom", 
  "Netherlands", "France", "Poland", "Italy", "Ireland", "United States", "Oman", 
  "Kuwait", "Bahrain", "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", 
  "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", 
  "Bahamas", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", 
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", 
  "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Central African Republic", 
  "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", 
  "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", 
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", 
  "Ethiopia", "Fiji", "Finland", "Gabon", "Gambia", "Georgia", "Ghana", "Greece", "Grenada", 
  "Guatemala", "Guinea", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "Indonesia", 
  "Iran", "Iraq", "Israel", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", 
  "Korea (North)", "Korea (South)", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", 
  "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", 
  "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", 
  "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", 
  "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "New Zealand", "Nicaragua", 
  "Niger", "Nigeria", "North Macedonia", "Norway", "Pakistan", "Palau", "Panama", 
  "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Portugal", "Romania", "Russia", 
  "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Samoa", "San Marino", "Senegal", 
  "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", 
  "Somalia", "South Africa", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", 
  "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", 
  "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", 
  "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];
const EMPLOYMENT_TYPES = ["All", "Full-time", "Part-time", "Contract", "Temporary", "Freelance", "Gig", "Internship", "Remote", "Hybrid", "On-site", "Seasonal", "Project-based"];
const WORKER_CATEGORIES = ["All", "IT", "Healthcare", "Construction", "Manufacturing", "Hospitality", "Logistics", "Drivers", "Retail", "Security", "Facility management", "Finance", "Sales", "Engineering", "Skilled trades", "Domestic services", "Agriculture", "Blue-collar workforce", "White-collar professionals"];
const Card=({children,className=""})=><div className={`rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90 dark:text-white ${className}`}>{children}</div>;
const Button=({children,onClick,variant="primary",disabled=false})=><button disabled={disabled} onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold transition ${variant==="ghost"?"border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200":"bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20 hover:-translate-y-0.5"} disabled:cursor-not-allowed disabled:opacity-50`}>{children}</button>;
const Input=({label,value,onChange,type="text",placeholder})=><label className="block">{label&&<span className="mb-1.5 block text-xs font-black text-slate-700 dark:text-slate-300 tracking-wide">{label}</span>}<input type={type} value={value??""} placeholder={placeholder} onChange={e=>onChange(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white transition shadow-xs hover:border-slate-300 focus:ring-2 focus:ring-blue-500/20"/></label>;

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
        <span className="mb-1.5 block text-xs font-black text-slate-700 dark:text-slate-300 tracking-wide">
          {label}
        </span>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white transition shadow-xs hover:border-slate-300 focus:ring-2 focus:ring-blue-500/20 text-left cursor-pointer"
      >
        <span className="truncate">{value || "Select option..."}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-800 dark:bg-slate-900 custom-scrollbar">
          {options.map((opt, idx) => (
            <button
              key={`select-opt-${opt}-${idx}`}
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
const TextArea=({label,value,onChange,placeholder,rows=2.5})=><label className="block">{label&&<span className="mb-1.5 block text-xs font-black text-slate-700 dark:text-slate-300 tracking-wide">{label}</span>}<textarea rows={rows} value={value??""} placeholder={placeholder} onChange={e=>onChange(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white transition shadow-xs hover:border-slate-300 focus:ring-2 focus:ring-blue-500/20 custom-scrollbar overflow-y-auto"/></label>;
const Stat=({icon:Icon,label,value})=><div className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/70"><Icon className="h-5 w-5 text-blue-500"/><p className="mt-3 text-xs font-bold text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{value}</p></div>;

const TRANSLATIONS = {
  English: {
    title: "Global workforce operating layer.",
    desc: "A real testing workspace connected to Recruweb backend data. Counts, jobs, matching, salary signals and saved workflows are database-driven.",
    commandCentre: "Command centre",
    live: "LIVE",
    refresh: "Refresh live data",
    browse: "Browse Jobs",
    readiness: "AI readiness",
    openJobs: "Open jobs",
    trustStatus: "Trust status",
    workforceId: "Workforce ID",
  },
  Hindi: {
    title: "वैश्विक कार्यबल संचालन परत।",
    desc: "रिक्रूवेब बैकएंड डेटा से जुड़ा एक वास्तविक परीक्षण कार्यक्षेत्र। संख्याएं, नौकरियां, मिलान, वेतन संकेत और सहेजे गए वर्कफ़्लो डेटाबेस-संचालित हैं।",
    commandCentre: "कमांड सेंटर",
    live: "लाइव",
    refresh: "डेटा रीफ़्रेश करें",
    browse: "नौकरियां खोजें",
    readiness: "एआई तत्परता",
    openJobs: "खुली नौकरियां",
    trustStatus: "ट्रस्ट स्थिति",
    workforceId: "कार्यबल आईडी",
  },
  Arabic: {
    title: "طبقة تشغيل القوى العاملة العالمية.",
    desc: "مساحة عمل اختبار حقيقية متصلة ببيانات الخلفية Recruweb. يتم توجيه الأعداد والوظائف والمطابقة وإشارات الرواتب وسير العمل المحفوظ بواسطة قاعدة البيانات.",
    commandCentre: "مركز القيادة",
    live: "مباشر",
    refresh: "تحديث البيانات الحية",
    browse: "تصفح الوظائف",
    readiness: "جاهزية الذكاء الاصطناعي",
    openJobs: "وظائف شاغرة",
    trustStatus: "حالة الثقة",
    workforceId: "معرف القوى العاملة",
  },
  French: {
    title: "Couche opérationnelle mondiale de la main-d'œuvre.",
    desc: "Un espace de travail de test réel connecté aux données du backend Recruweb. Les décomptes, les emplois, le matching, les signaux salariaux et les flux de travail enregistrés sont basés sur la base de données.",
    commandCentre: "Centre de commande",
    live: "EN DIRECT",
    refresh: "Actualiser les données",
    browse: "Parcourir les emplois",
    readiness: "Préparation IA",
    openJobs: "Emplois ouverts",
    trustStatus: "Statut de confiance",
    workforceId: "ID de la main-d'œuvre",
  },
  German: {
    title: "Globale operative Ebene der Belegschaft.",
    desc: "Ein echter Testarbeitsbereich, der mit Recruweb-Backend-Daten verbunden ist. Zählungen, Jobs, Abgleiche, Gehaltssignale und gespeicherte Workflows sind datenbankgesteuert.",
    commandCentre: "Kommandozentrale",
    live: "LIVE",
    refresh: "Live-Daten aktualisieren",
    browse: "Jobs durchsuchen",
    readiness: "KI-Bereitschaft",
    openJobs: "Offene Stellen",
    trustStatus: "Vertrauensstatus",
    workforceId: "Arbeitskraft-ID",
  },
  Spanish: {
    title: "Capa operativa global de la fuerza laboral.",
    desc: "Un espacio de trabajo de prueba real conectado a los datos del backend de Recruweb. Los recuentos, trabajos, coincidencias, señales salariales y flujos de trabajo guardados están impulsados por la base de datos.",
    commandCentre: "Centro de comando",
    live: "EN VIVO",
    refresh: "Actualizar datos",
    browse: "Buscar empleos",
    readiness: "Preparación IA",
    openJobs: "Trabajos abiertos",
    trustStatus: "Estado de confianza",
    workforceId: "ID de fuerza laboral",
  }
};

export default function GlobalWorkforceHub(){
  const user=useSelector(s=>s.auth.user); const navigate=useNavigate();
  const [active,setActive]=useState("01"),[loading,setLoading]=useState(true),[toast,setToast]=useState(""),[data,setData]=useState(null),[intel,setIntel]=useState(null),[market,setMarket]=useState(null),[jobs,setJobs]=useState([]);
  const [regForm, setRegForm] = useState({ profession: "", targetCountry: "Germany", docLink: "", skills: "", bio: "" });
  const [search,setSearch]=useState(""),[country,setCountry]=useState("All"),[category,setCategory]=useState("All");
  const [employmentType, setEmploymentType] = useState("All");
  const [workerCategory, setWorkerCategory] = useState("All");
  const [passport,setPassport]=useState({profession:"",experience:"",education:"Graduate",skills:"",certifications:"",languages:"",workEligibility:"",targetCountry:"Germany",salaryExpectation:"",bio:""});
  const [qualification,setQualification]=useState("Graduate"),[otherQualification,setOtherQualification]=useState(""),[experience,setExperience]=useState("Fresher"),[otherExperience,setOtherExperience]=useState("");
  const [gap,setGap]=useState({currentSkills:"",targetSkills:""}),[gapResult,setGapResult]=useState(null),[matchResult,setMatchResult]=useState([]),[salary,setSalary]=useState({country:"India",experience:0}),[salaryResult,setSalaryResult]=useState(null),[mobility,setMobility]=useState("Germany"),[mobilityResult,setMobilityResult]=useState(null),[assistant,setAssistant]=useState("Help me find the best global opportunities from my profile."),[assistantResult,setAssistantResult]=useState(null),[bulk,setBulk]=useState({role:"",country:"UAE",workers:10,notes:""});
  const [partners,setPartners]=useState([]),[bulkRequests,setBulkRequests]=useState([]),[massApplications,setMassApplications]=useState([]);
  const [lang,setLang]=useState("English");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModules, setActiveModules] = useState([]);
  const notify=m=>{setToast(m);window.clearTimeout(window.__rwToast);window.__rwToast=window.setTimeout(()=>setToast(""),3000)};
  const load=async()=>{
    setLoading(true);
    try {
      const [d,i,m,pt,bk,ma]=await Promise.all([
        axios.get(`${api}/dashboard`,{withCredentials:true}),
        axios.get(`${api}/intelligence`,{withCredentials:true}),
        axios.get(`${api}/market-data`,{withCredentials:true}),
        axios.get(`${api}/partners`,{withCredentials:true}),
        axios.get(`${api}/bulk`,{withCredentials:true}),
        axios.get(`${api}/bulk/my-applications`,{withCredentials:true}).catch(()=>({data:{applications:[]}}))
      ]);
      setData(d.data); setIntel(i.data.data); setMarket(m.data); setJobs(m.data.recentJobs||[]);
      setPartners(pt.data.partners||[]);
      setBulkRequests(bk.data.requests||[]);
      setMassApplications(ma.data?.applications||[]);
      setActiveModules(d.data.activeModules || []);
      if(d.data.passport){
        const p=d.data.passport;
        setPassport({profession:p.profession||"",experience:p.experience_years||0,education:p.education||"Graduate",skills:(p.skills||[]).join(", "),certifications:(p.certifications||[]).join(", "),languages:(p.languages||[]).join(", "),workEligibility:p.work_eligibility||"",targetCountry:p.target_country||"Germany",salaryExpectation:p.salary_expectation||"",bio:p.bio||""});
        setQualification(QUALIFICATIONS.includes(p.education)?p.education:"Other");
        if(!QUALIFICATIONS.includes(p.education)) setOtherQualification(p.education||"");
        const saved=p.preferences?.requiredExperience||"Fresher";
        setExperience(EXPERIENCE.includes(saved)?saved:"Other");
        if(!EXPERIENCE.includes(saved)) setOtherExperience(saved);
      }
    } catch(e) { notify(e?.response?.data?.message||"Could not load live workforce data"); }
    finally { setLoading(false); }
  };
  useEffect(()=>{load()},[]);
  const handleApplyMassJob=async(jobId)=>{
    try {
      const res=await axios.post(`${api}/bulk/${jobId}/apply`,{},{withCredentials:true});
      if(res.data.success){
        notify("Worker application submitted successfully!");
        load();
      }
    } catch(err){
      notify(err?.response?.data?.message||"Failed to submit worker application");
    }
  };
  const savePassport=async()=>{try{await axios.post(`${api}/passport`,{...passport,experience:Number(passport.experience)||0,education:qualification==="Other"?otherQualification:qualification,skills:passport.skills.split(",").map(x=>x.trim()).filter(Boolean),certifications:passport.certifications.split(",").map(x=>x.trim()).filter(Boolean),languages:passport.languages.split(",").map(x=>x.trim()).filter(Boolean),preferences:{requiredExperience:experience==="Other"?otherExperience:experience}},{withCredentials:true});notify("Passport saved to live database");load()}catch(e){notify(e?.response?.data?.message||"Passport save failed")}};
  const run=async(path,payload,setter,msg)=>{try{const r=await axios.post(`${api}/${path}`,payload,{withCredentials:true});setter(r.data.result||r.data);notify(msg);return r.data.result||r.data}catch(e){notify(e?.response?.data?.message||"Action failed")}};
  const runJobs=async()=>{
    try {
      const r = await axios.get(`${api}/jobs`, {
        params: {
          q: search,
          country: country === "All" ? "" : country,
          category: category === "All" ? "" : category
        },
        withCredentials: true
      });
      let filtered = r.data.jobs || [];
      if (employmentType && employmentType !== "All") {
        filtered = filtered.filter(j => 
          (j.jobType || j.employmentType || "").toLowerCase().includes(employmentType.toLowerCase())
        );
      }
      if (workerCategory && workerCategory !== "All") {
        filtered = filtered.filter(j => 
          (j.workerCategory || j.category || j.description || j.title || "").toLowerCase().includes(workerCategory.toLowerCase())
        );
      }
      setJobs(filtered);
      setActive("01");
    } catch(e) {
      notify("Live job search failed");
    }
  };
  const record=async(name,payload={})=>{try{await axios.post(`${api}/actions`,{actionType:name,payload},{withCredentials:true});notify(`${name} recorded`)}catch(e){notify("Could not save workflow activity")}};
  const readiness=useMemo(()=>Math.min(100,Math.round((Number(data?.stats?.profileScore||0)+Number(data?.stats?.verified?15:0))/1.15)),[data]);

  const candidateModuleIds = ["01", "03", "04", "05", "06", "11", "12", "16", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28"];
  const visibleModules = MODULES.filter(([id]) => activeModules.includes(id) && candidateModuleIds.includes(id) && id !== "dashboard");
  const current = MODULES.find(x => x[0] === active) || visibleModules[0] || MODULES[0];

  if(loading)return <><Navbar/><div className="min-h-screen grid place-items-center"><div className="text-center"><Sparkles className="mx-auto h-10 w-10 animate-pulse text-blue-500"/><p className="mt-4 font-black text-slate-500">Connecting to the Recruweb Workforce Engine…</p></div></div></>;

  // Access Control: If candidate passport is not approved, show Registration / Verification screen
  const verificationStatus = data?.stats?.verificationStatus || "pending_register";
  
  if (verificationStatus !== "approved") {
    const handleRequestActivation = async () => {
      try {
        setLoading(true);
        // 1. Create a basic passport stub
        await axios.post(`${api}/passport`, {
          profession: "Global Candidate",
          experience: 0,
          education: "Graduate",
          skills: [],
          certifications: [],
          languages: ["English"],
          targetCountry: "Germany",
          bio: "Active candidate seeking global workspace modules activation.",
          preferences: { requiredExperience: "Fresher", docLink: "Direct Hub Request" }
        }, { withCredentials: true });
        
        // 2. Submit verification request
        await axios.post(`${api}/verification/request`, { docLink: "Direct Hub Request" }, { withCredentials: true });
        notify("Workspace activation permission request sent to admin.");
        load();
      } catch (err) {
        notify("Failed to send permission request.");
        setLoading(false);
      }
    };

    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 flex items-center justify-center">
          <div className="max-w-xl w-full">
            {verificationStatus === "pending" ? (
              <Card className="text-center p-8 border-amber-100 bg-amber-50/20">
                <Compass className="mx-auto h-14 w-14 animate-spin text-amber-500" />
                <h2 className="text-2xl font-black text-slate-950 dark:text-white mt-6">Workforce Verification Under Audit</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                  Your digital workforce credentials and qualifications are currently undergoing operational audit. 
                  An administrator will verify your credentials and configure your workspace modules shortly.
                </p>
                <div className="mt-6 flex justify-center gap-2">
                  <span className="rounded-full bg-amber-100 px-3.5 py-1 text-xs font-black text-amber-800">STATUS: PENDING ACTIVATION</span>
                </div>
                <Button onClick={load} variant="ghost" className="mt-8">Check Verification Status</Button>
              </Card>
            ) : verificationStatus === "rejected" ? (
              <Card className="text-center p-8 border-rose-100 bg-rose-50/20">
                <X className="mx-auto h-14 w-14 text-rose-500 rounded-full bg-rose-100 p-2" />
                <h2 className="text-2xl font-black text-slate-950 dark:text-white mt-6">Workspace Access Suspended</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                  Your global workforce activation request was rejected due to incomplete credential compliance. 
                  Please update your verification details below to request a re-audit.
                </p>
                <Button onClick={handleRequestActivation} className="mt-6">Request Re-Audit</Button>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="h-16 w-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center animate-pulse">
                    <Globe2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-950 dark:text-white">Global Workforce Hub</h2>
                    <p className="text-xs text-slate-500 mt-1">Activate your profile to access international sourcing, AI jobs matching, and mobility modules.</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 mt-6">
                  <button 
                    onClick={handleRequestActivation}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl py-3.5 font-extrabold text-sm shadow-lg hover:shadow-blue-500/20 transition hover:-translate-y-0.5"
                  >
                    Send Access Permission Request
                  </button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="h-screen overflow-hidden bg-slate-50/70 dark:bg-slate-950 flex">
        {/* Left Sidebar - Desktop */}
        <aside className={`hidden lg:flex shrink-0 flex-col border-r border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95 h-full overflow-y-auto custom-scrollbar transition-all duration-300 ${sidebarCollapsed ? "w-20" : "w-80"}`}>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Command Centre</p>
                <h2 className="text-sm font-black text-slate-900 dark:text-white">Candidate Workspace</h2>
              </div>
            )}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition ${sidebarCollapsed ? "mx-auto" : ""}`}
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="h-5 w-5 text-blue-600" /> : <PanelLeftClose className="h-5 w-5 text-blue-600" />}
            </button>
          </div>

          {/* Module list scrollable container */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
            {visibleModules.map(([id, title, desc, Icon]) => (
              <button 
                key={`desktop-mod-${id}`} 
                onClick={() => setActive(id)} 
                title={sidebarCollapsed ? title : undefined}
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center p-3" : "items-start gap-3.5 p-3.5"} rounded-xl text-left transition duration-300 ${
                  active === id 
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20" 
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && (
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-xs font-black">{title}</span>
                    </div>
                    <p className={`mt-1 line-clamp-2 text-[10px] leading-4 ${active === id ? "text-white/80" : "text-slate-500"}`}>{desc}</p>
                  </div>
                )}
              </button>
            ))}
          </div>

          {!sidebarCollapsed && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 grid place-items-center font-black text-sm uppercase">
                {user?.fullname?.[0] || "U"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-black text-slate-900 dark:text-white">{user?.fullname || "Candidate"}</p>
                <p className="truncate text-[10px] text-slate-400">Workforce Member</p>
              </div>
            </div>
          )}
        </aside>

        {/* Mobile Slide-Over Sidebar Drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
              />
              {/* Sidebar Panel - Short, Compact, & Scrollable */}
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="fixed bottom-0 left-0 top-0 z-50 flex w-80 max-w-[85vw] flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 lg:hidden shadow-2xl"
              >
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Global Workforce</p>
                    <h2 className="text-sm font-black text-slate-900 dark:text-white">Active Modules Menu</h2>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Short & Compact scrollable menu bar with max-height scrollbar */}
                <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar max-h-[75vh]">
                  {visibleModules.map(([id, title, desc, Icon]) => (
                    <button 
                      key={`mobile-mod-${id}`} 
                      onClick={() => { setActive(id); setSidebarOpen(false); }} 
                      className={`w-full flex items-start gap-3 rounded-xl p-3 text-left transition ${
                        active === id 
                          ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md" 
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                      <div className="min-w-0">
                        <span className="truncate text-xs font-black block">{title}</span>
                        <p className={`mt-0.5 line-clamp-1 text-[10px] ${active === id ? "text-white/80" : "text-slate-500"}`}>{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>{visibleModules.length} Modules Active</span>
                  <button onClick={() => setSidebarOpen(false)} className="font-bold text-blue-600">Close Menu ✕</button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Right workspace area */}
        <div className="flex-1 h-full overflow-y-auto flex flex-col custom-scrollbar">
          {/* Sleek Header row */}
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 dark:border-slate-800 dark:bg-slate-900/85 backdrop-blur-md px-4 py-3 sm:px-6">
            <div className="mx-auto max-w-7xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {/* Mobile Menu Toggle Button */}
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-3 py-2 text-xs font-extrabold shadow-md hover:shadow-lg transition cursor-pointer"
                >
                  <Menu className="h-4 w-4 animate-pulse" />
                  <span>Modules</span>
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-[9px] font-black text-white">RECRUWEB GLOBAL</span>
                  </div>
                  <h1 className="mt-1 text-base sm:text-lg font-black tracking-tight text-slate-950 dark:text-white flex items-center gap-2">
                    {current[1]}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <div className="w-32 sm:w-36">
                  <Select value={lang} onChange={setLang} options={Object.keys(TRANSLATIONS)} />
                </div>
                <Button onClick={load} variant="ghost"><RefreshCw className="h-4 w-4" /> <span className="hidden sm:inline">{TRANSLATIONS[lang].refresh}</span></Button>
              </div>
            </div>
          </header>

          {/* Active module content workspace */}
          <section className="mx-auto max-w-7xl px-3 sm:px-6 py-4 sm:py-6 flex-1 w-full">
            {activeModules.length === 0 ? (
              <div className="mx-auto max-w-xl py-12">
                <Card className="text-center p-8 border-blue-100 bg-blue-50/20">
                  <ShieldCheck className="mx-auto h-14 w-14 text-blue-600 animate-pulse" />
                  <h2 className="text-2xl font-black text-slate-950 dark:text-white mt-6">Workspace Module Activation Required</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                    Your candidate profile has been successfully verified, but no active global workforce modules have been assigned to your workspace yet.
                    Please request activation from the administrator to enable operational modules.
                  </p>
                  <div className="mt-8 flex justify-center">
                    <Button onClick={async () => {
                      try {
                        setLoading(true);
                        await axios.post(`${api}/verification/request`, {}, { withCredentials: true });
                        notify("Permission request sent to admin.");
                        load();
                      } catch (err) {
                        notify("Failed to send permission request.");
                        setLoading(false);
                      }
                    }}>
                      Send Permission Request
                    </Button>
                  </div>
                </Card>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ModuleContent active={active} {...{jobs,market,intel,search,setSearch,country,setCountry,category,setCategory,employmentType,setEmploymentType,workerCategory,setWorkerCategory,EMPLOYMENT_TYPES,WORKER_CATEGORIES,runJobs,passport,data,matchResult,setMatchResult,setPassport,qualification,setQualification,otherQualification,setOtherQualification,experience,setExperience,otherExperience,setOtherExperience,savePassport,gap,setGap,gapResult,setGapResult,salary,setSalary,salaryResult,setSalaryResult,mobility,setMobility,mobilityResult,setMobilityResult,assistant,setAssistant,assistantResult,setAssistantResult,bulk,setBulk,record,run,navigate,load,notify,partners,bulkRequests,massApplications,handleApplyMassJob}} />
                </motion.div>
              </AnimatePresence>
            )}
          </section>
        </div>
      </main>
      {toast && <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-2xl">{toast}</div>}
    </>
  );
}

function ModuleContent(p){
  const panel=(title,sub,children)=><Card><h3 className="text-xl font-black text-slate-950 dark:text-white">{title}</h3><p className="mt-1 text-sm text-slate-500">{sub}</p><div className="mt-6 space-y-5">{children}</div></Card>;
  if(p.active==="01")return panel("Live Global Job Marketplace","Search approved, open jobs directly from the database.",<><div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/40"><div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 items-end"><Input label="Search Keyword" value={p.search} onChange={p.setSearch} placeholder="Developer, nurse, driver…"/><Select label="Country" value={p.country} onChange={p.setCountry} options={["All",...COUNTRIES]}/><Select label="Category" value={p.category} onChange={p.setCategory} options={["All",...(p.market?.categories||[]).map(x=>x.category)]}/><Select label="Employment Type" value={p.employmentType} onChange={p.setEmploymentType} options={p.EMPLOYMENT_TYPES}/><Select label="Worker Category" value={p.workerCategory} onChange={p.setWorkerCategory} options={p.WORKER_CATEGORIES}/><div className="flex items-end h-full"><button onClick={p.runJobs} className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl py-3 px-4 font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-90 shadow-md transition"><Search className="h-4 w-4"/> Search Global Jobs</button></div></div></div><div className="grid gap-3 md:grid-cols-2">{p.jobs.map(j=><Card key={j.id}><div className="flex justify-between gap-3"><div><p className="text-xs font-black text-blue-600">{j.companyName||"Recruweb employer"}</p><h4 className="mt-1 font-black">{j.title}</h4><p className="mt-1 text-xs text-slate-500">{j.location||"Location not specified"} · {j.country||"Global"}</p></div><span className="h-fit rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">LIVE</span></div><p className="mt-3 text-xs font-bold text-slate-600 dark:text-slate-300">Salary: {j.salary||"Not disclosed"}</p><Link to={`/description/${j.id}`} className="mt-3 inline-flex items-center text-xs font-black text-blue-600">Open job <ArrowRight className="ml-1 h-3 w-3"/></Link></Card>)}{!p.jobs.length&&<Card><p className="text-sm font-bold text-slate-500">No matching live jobs found in the current database.</p></Card>}</div></>);

  if(p.active==="03"||p.active==="24")return panel(p.active==="03"?"AI Job Matching Engine":"AI Workforce Engine","Scoring is calculated server-side against live open jobs.",<><div className="grid gap-4 md:grid-cols-3"><Input label="Skills" value={p.passport.skills} onChange={v=>p.setPassport({...p.passport,skills:v})}/><Input label="Experience (years)" type="number" value={p.passport.experience} onChange={v=>p.setPassport({...p.passport,experience:v})}/><Input label="Target country" value={p.passport.targetCountry} onChange={v=>p.setPassport({...p.passport,targetCountry:v})}/></div><Button onClick={async()=>{const r=await p.run("match",{skills:p.passport.skills.split(","),experience:p.passport.experience,country:p.passport.targetCountry},x=>p.setMatchResult(x),"Live matches generated");if(r)p.setMatchResult(r.jobs||[])}}><Target className="h-4 w-4"/> Run live matching</Button><div className="grid gap-3 md:grid-cols-2">{(p.matchResult||[]).map(j=><Card key={j.id}><div className="flex justify-between"><b>{j.title}</b><span className="text-lg font-black text-blue-600">{j.matchScore}%</span></div><p className="mt-1 text-xs text-slate-500">{j.companyName||"Employer"} · {j.country||"Global"}</p><div className="mt-3 flex flex-wrap gap-1">{(j.matchedSkills||[]).slice(0,6).map(s=><span key={s} className="rounded-full bg-blue-50 px-2 py-1 text-[9px] font-bold text-blue-700">{s}</span>)}</div><Link className="mt-3 inline-flex text-xs font-black text-blue-600" to={`/description/${j.id}`}>Review & apply <ArrowRight className="ml-1 h-3 w-3"/></Link></Card>)}</div></>);

  if(p.active==="04") {
    const POPULAR_PROFESSIONS = [
      "Software Engineer & Developer",
      "Structural Welder & Pipefitter",
      "Construction Site Mason & Carpenter",
      "Industrial Electrician",
      "Plumber & Sanitary Mechanic",
      "Heavy Truck & Logistics Driver",
      "CNC Machine & Plant Operator",
      "Hospitality & Hotel Staff",
      "Automotive & HVAC Technician",
      "Registered Nurse & Healthcare Staff",
      "Finance Accountant & Auditor",
      "Sales & Business Development Lead",
      "HR & Talent Acquisition Specialist",
      "Civil & Project Site Engineer",
      "Data Analyst & BI Specialist",
      "Security & Facility Manager",
      "Custom / Other (Type Manually)"
    ];

    const currentProf = p.gap.currentProfSelect === "Custom / Other (Type Manually)"
      ? p.gap.customCurrentProf
      : (p.gap.currentProfSelect || p.passport?.profession || "Structural Welder & Pipefitter");

    const targetProf = p.gap.targetProfSelect === "Custom / Other (Type Manually)"
      ? p.gap.customTargetProf
      : (p.gap.targetProfSelect || "Software Engineer & Developer");

    const handleAnalyzeSkillGap = () => {
      const payload = {
        currentProfession: currentProf,
        targetProfession: targetProf,
        currentSkills: p.gap.currentSkills ?? p.passport?.skills ?? "",
        targetSkills: p.gap.targetSkills || "",
        experienceYears: p.passport?.experience_years || 2
      };
      p.run("skill-gap", payload, x => p.setGapResult(x), "AI Skill Gap & Career Roadmap Generated!");
    };

    return panel(
      "Global Skill Gap Engine",
      "Analyze your current profession vs. target career transition to generate an AI-powered roadmap.",
      <div className="space-y-6">
        {/* Interactive Form Card */}
        <Card className="p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm">
          <h4 className="text-base font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Career Transition & Skill Gap Form
          </h4>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Current Profession */}
            <div>
              <Select 
                label="1. Current Job Profession" 
                value={p.gap.currentProfSelect || p.passport?.profession || "Structural Welder & Pipefitter"} 
                onChange={v => p.setGap({ ...p.gap, currentProfSelect: v })} 
                options={POPULAR_PROFESSIONS} 
              />
              <div className="mt-2.5">
                <Input 
                  label="Or Type Current Profession Manually" 
                  placeholder="e.g. Solar Installation Technician" 
                  value={p.gap.customCurrentProf || ""} 
                  onChange={v => p.setGap({ ...p.gap, customCurrentProf: v, currentProfSelect: "Custom / Other (Type Manually)" })} 
                />
              </div>
            </div>

            {/* Target Desired Profession */}
            <div>
              <Select 
                label="2. Target Desired Profession" 
                value={p.gap.targetProfSelect || "Software Engineer & Developer"} 
                onChange={v => p.setGap({ ...p.gap, targetProfSelect: v })} 
                options={POPULAR_PROFESSIONS} 
              />
              <div className="mt-2.5">
                <Input 
                  label="Or Type Target Profession Manually" 
                  placeholder="e.g. Cloud DevOps Engineer / Subsea Welder" 
                  value={p.gap.customTargetProf || ""} 
                  onChange={v => p.setGap({ ...p.gap, customTargetProf: v, targetProfSelect: "Custom / Other (Type Manually)" })} 
                />
              </div>
            </div>
          </div>

          {/* Current Skills & Target Skills */}
          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            <TextArea 
              label="3. Your Current Skills & Tools" 
              placeholder="e.g. TIG Welding, Blueprint Reading, Safety Compliance, Manual Machining" 
              rows={2.5}
              value={p.gap.currentSkills ?? p.passport?.skills ?? ""} 
              onChange={v => p.setGap({ ...p.gap, currentSkills: v })} 
            />
            <TextArea 
              label="4. Specific Target Skills (Optional)" 
              placeholder="Leave empty for AI auto-detection or specify e.g. React, Node.js, AWS, System Design" 
              rows={2.5}
              value={p.gap.targetSkills || ""} 
              onChange={v => p.setGap({ ...p.gap, targetSkills: v })} 
            />
          </div>

          <div className="mt-5 flex justify-end">
            <Button onClick={handleAnalyzeSkillGap} className="w-full sm:w-auto px-6 py-2.5 shadow-md hover:shadow-lg transition">
              <Sparkles className="h-4 w-4 mr-1 animate-pulse" />
              Analyze Skill Gap & Generate AI Roadmap
            </Button>
          </div>
        </Card>

        {/* AI Detailed Roadmap Output */}
        {p.gapResult && (
          <div className="space-y-6 animate-fade-in">
            {/* Overview Stat Cards */}
            <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-600/10 via-cyan-500/5 to-slate-900/10 dark:from-blue-950/40 dark:to-slate-900 border-blue-200 dark:border-blue-900/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="rounded-full bg-blue-100 dark:bg-blue-950 px-3 py-1 text-[10px] font-black text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                    AI Skill Transition Roadmap
                  </span>
                  <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-2">
                    {p.gapResult.currentProfession || "Current"} → {p.gapResult.targetProfession || "Target"}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Transition Feasibility Rating: <b>{p.gapResult.difficulty}</b>
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm min-w-28">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Match Score</p>
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{p.gapResult.currentSuitability}%</p>
                  </div>
                  <div className="text-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm min-w-28">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Post-Roadmap Target</p>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{p.gapResult.expectedSuitabilityAfterCompletion}%</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Acquired vs Missing Skills */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <h5 className="font-black text-sm text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Transferable / Acquired Skills ({p.gapResult.matchedSkills?.length || 0})
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {(p.gapResult.matchedSkills || []).map(s => (
                    <span key={s} className="rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-900/60 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </Card>

              <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <h5 className="font-black text-sm text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" /> Missing Technical & Skill Gaps ({p.gapResult.missingSkills?.length || 0})
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {(p.gapResult.missingSkills || []).map(s => (
                    <span key={s} className="rounded-full bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-900/60 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                      ⚡ {s}
                    </span>
                  ))}
                </div>
              </Card>
            </div>

            {/* Step-by-Step Transition Roadmap Timeline (Phases 1-4) */}
            <Card className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <h5 className="font-black text-lg text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Compass className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Step-by-Step Transition Roadmap
              </h5>

              <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 sm:before:left-5 before:w-0.5 before:bg-blue-200 dark:before:bg-blue-900">
                {(p.gapResult.transitionRoadmap || []).map((step, idx) => (
                  <div key={idx} className="relative pl-10 sm:pl-12">
                    <div className="absolute left-1.5 sm:left-2.5 top-0 -translate-x-1/2 h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shadow-md">
                      {idx + 1}
                    </div>
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                        <h6 className="font-black text-sm text-slate-900 dark:text-white">{step.title}</h6>
                        <span className="rounded-full bg-blue-100 dark:bg-blue-950 px-2.5 py-0.5 text-[10px] font-black text-blue-700 dark:text-blue-300 w-fit">
                          {step.duration || `Phase ${idx + 1}`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{step.focus}</p>
                      <div className="space-y-1.5">
                        {(step.tasks || []).map((task, tIdx) => (
                          <div key={tIdx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                            <span className="text-blue-500 font-bold">•</span>
                            <span>{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  }

  if(p.active==="05"||p.active==="17") {
    const isVerified = p.data?.stats?.verified;
    const workforceId = p.data?.stats?.workforceId;
    const status = p.passport?.verification_status || "not_applied";

    return panel(
      p.active==="05"?"Employer & Job Verification":"Worker Trust Profile",
      "Verification is a human-reviewed workflow with database status.",
      <>
        {/* Status card */}
        <Card className="border-blue-100 bg-blue-50/10 mb-6 dark:border-blue-900/30 dark:bg-blue-950/20">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-black uppercase text-blue-600 dark:text-blue-400">Verification Status</p>
              <h4 className="mt-1 text-base font-black capitalize">{status === "not_applied" ? "Not Applied" : status}</h4>
            </div>
            {isVerified ? (
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/40 px-3 py-1 text-xs font-black text-emerald-800 dark:text-emerald-400">Workforce ID: {workforceId}</span>
            ) : (
              <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${status === "pending" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400" : status === "rejected" ? "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                {status}
              </span>
            )}
          </div>
        </Card>

        {/* Verification Checklists */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          {["Account identity","Professional profile","Education & certifications","Work eligibility","Employment history","Recruiter review"].map(x=>(
            <div key={x} className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-xs font-bold dark:border-slate-800">
              <CheckCircle2 className={`h-4.5 w-4.5 ${isVerified?"text-emerald-500":"text-slate-300 dark:text-slate-700"}`}/>
              {x}
              <span className="ml-auto text-[9px] text-slate-400">{isVerified?"VERIFIED":"REVIEW"}</span>
            </div>
          ))}
        </div>

        {/* Upload documents form slots */}
        {!isVerified && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 p-5">
            <h4 className="text-sm font-black mb-3">Upload Verification Credentials</h4>
            <div className="grid gap-4 md:grid-cols-2 mb-4">
              <Select 
                label="Document Type" 
                value={p.qualification || "Identity Proof"} 
                onChange={p.setQualification} 
                options={["Identity Proof (Passport/National ID)", "Education Certificate (Degree/Diploma)", "Employment Certificate (Work Reference)"]} 
              />
              <Input 
                label="Document Web Link / URL" 
                placeholder="https://drive.google.com/your-cert-link..." 
                value={p.otherQualification} 
                onChange={p.setOtherQualification} 
              />
            </div>
            <Button onClick={async () => {
              await p.run("verification/request", { docType: p.qualification, docLink: p.otherQualification }, () => {}, "Verification request submitted");
              p.load();
            }}>
              Submit Credentials & Request Review
            </Button>
          </div>
        )}
      </>
    );
  }
  if(p.active==="06")return panel("International Workforce Mobility","Country opportunity data is live; legal guidance remains informational.",<><Select label="Target country" value={p.mobility} onChange={p.setMobility} options={COUNTRIES}/><Button onClick={()=>p.run("mobility",{targetCountry:p.mobility},p.setMobilityResult,"Mobility assessment generated")}>Check mobility readiness</Button>{p.mobilityResult&&<Card><div className="flex items-center gap-3"><span className="text-3xl">{p.mobilityResult.flag}</span><div><h4 className="font-black">{p.mobilityResult.name}</h4><p className="text-xs text-slate-500">{p.mobilityResult.openJobs} live jobs · {p.mobilityResult.employers} employers</p></div></div><div className="mt-4 grid gap-2 sm:grid-cols-2">{p.mobilityResult.checklist.map(x=><div key={x} className="rounded-xl bg-slate-50 p-3 text-xs font-bold dark:bg-slate-800">□ {x}</div>)}</div><p className="mt-4 text-xs text-amber-700">{p.mobilityResult.legalNotice}</p></Card>}</>);
  if (p.active === "11") {
    const CURRENCIES = ["USD ($)", "EUR (€)", "AED (AED)", "SAR (SAR)", "QAR (QAR)", "CAD ($)", "GBP (£)", "INR (₹)", "SGD ($)", "AUD ($)", "JPY (¥)", "KWD (KWD)", "BHD (BHD)", "OMR (OMR)"];
    
    const POPULAR_PROFESSIONS = [
      "Software Engineer & Developer",
      "Structural Welder & Pipefitter",
      "Construction Site Mason & Carpenter",
      "Industrial Electrician",
      "Plumber & Sanitary Mechanic",
      "Heavy Truck & Logistics Driver",
      "CNC Machine & Plant Operator",
      "Hospitality & Hotel Staff",
      "Automotive & HVAC Technician",
      "Registered Nurse & Healthcare Staff",
      "Finance Accountant & Auditor",
      "Sales & Business Development Lead",
      "HR & Talent Acquisition Specialist",
      "Civil & Project Site Engineer",
      "Data Analyst & BI Specialist",
      "Security & Facility Manager",
      "Custom / Other (Type Manually)"
    ];

    const selProf = p.salary.profSelect === "Custom / Other (Type Manually)"
      ? p.salary.customProf
      : (p.salary.profSelect || p.passport?.profession || "Software Engineer & Developer");

    const curCode = (p.salary.currency || "USD ($)").split(" ")[0];

    const handleAnalyzeSalary = () => {
      const payload = {
        profession: selProf,
        professionDetails: p.salary.professionDetails || "",
        country: p.salary.country || "Germany",
        currency: curCode,
        experience: Number(p.salary.experience || 2),
        expectedSalary: Number(p.salary.expectedSalary || 0)
      };
      p.run("salary-intelligence", payload, p.setSalaryResult, "AI Global Market Salary Intelligence Generated!");
    };

    return panel(
      "Global Salary Intelligence",
      "Real-time market salary benchmarking, currency converter, net pay estimations, and pay-boosting skill signals.",
      <div className="space-y-6">
        {/* Form Card */}
        <Card className="p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm">
          <h4 className="text-base font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <WalletCards className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            AI Salary Benchmarking Form
          </h4>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Target Profession Select + Custom Field */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Select 
                label="1. Target Profession / Role" 
                value={p.salary.profSelect || p.passport?.profession || "Software Engineer & Developer"} 
                onChange={v => p.setSalary({ ...p.salary, profSelect: v })} 
                options={POPULAR_PROFESSIONS} 
              />
              <div className="mt-2.5">
                <Input 
                  label="Or Type Custom Profession Manually" 
                  placeholder="e.g. Robotics Systems Engineer / TIG 6G Welder" 
                  value={p.salary.customProf || ""} 
                  onChange={v => p.setSalary({ ...p.salary, customProf: v, profSelect: "Custom / Other (Type Manually)" })} 
                />
              </div>
            </div>

            {/* Profession Specialization Details */}
            <div className="sm:col-span-2 lg:col-span-2">
              <Input 
                label="2. Profession Specialization & Work Details" 
                placeholder="e.g. Fullstack React & Node.js, Pipeline 6G TIG Welder, ICU Senior Pediatric Nurse" 
                value={p.salary.professionDetails || ""} 
                onChange={v => p.setSalary({ ...p.salary, professionDetails: v })} 
              />
            </div>

            {/* Target Country */}
            <div>
              <Select 
                label="3. Target Country (190+ Countries List)" 
                value={p.salary.country || "Germany"} 
                onChange={v => p.setSalary({ ...p.salary, country: v })} 
                options={COUNTRIES} 
              />
            </div>

            {/* Preferred Currency */}
            <div>
              <Select 
                label="4. Preferred Currency" 
                value={p.salary.currency || "USD ($)"} 
                onChange={v => p.setSalary({ ...p.salary, currency: v })} 
                options={CURRENCIES} 
              />
            </div>

            {/* Target Expected Salary Input */}
            <div>
              <Input 
                label={`5. Target Expected Salary (${curCode})`} 
                type="number" 
                placeholder="e.g. 50000" 
                value={p.salary.expectedSalary || ""} 
                onChange={v => p.setSalary({ ...p.salary, expectedSalary: v })} 
              />
            </div>

            {/* Total Relevant Experience */}
            <div>
              <Input 
                label="6. Total Experience (Years)" 
                type="number" 
                placeholder="e.g. 3" 
                value={p.salary.experience || ""} 
                onChange={v => p.setSalary({ ...p.salary, experience: v })} 
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <Button onClick={handleAnalyzeSalary} className="w-full sm:w-auto px-6 py-3 shadow-md hover:shadow-lg transition">
              <Sparkles className="h-4 w-4 mr-1 animate-pulse" />
              Analyze Market Salary with AI
            </Button>
          </div>
        </Card>

        {/* AI Market Salary Output Card */}
        {p.salaryResult && (
          <div className="space-y-6 animate-fade-in">
            <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-600/10 via-cyan-500/5 to-slate-900/10 dark:from-blue-950/40 dark:to-slate-900 border-blue-200 dark:border-blue-900/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="rounded-full bg-blue-100 dark:bg-blue-950 px-3 py-1 text-[10px] font-black text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                    AI Global Benchmark Output
                  </span>
                  <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-2">
                    {p.salaryResult.profession} · {p.salaryResult.country}
                  </h4>
                  {p.salaryResult.expectedSalary > 0 && (
                    <span className={`inline-block mt-2 rounded-full px-3 py-1 text-xs font-black ${p.salaryResult.benchmarkBadge}`}>
                      Candidate Benchmark: {p.salaryResult.candidateBenchmark}
                    </span>
                  )}
                </div>

                <div className="shrink-0 text-left sm:text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Median Annual Market Benchmark</p>
                  <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
                    {p.salaryResult.currency} {Number(p.salaryResult.annualMedian || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Est. Net Monthly Take-Home: <b>{p.salaryResult.currency} {Number(p.salaryResult.netMonthlyEstimate || 0).toLocaleString()}</b>
                  </p>
                </div>
              </div>
            </Card>

            {/* Benchmark Range & Tax Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat 
                icon={WalletCards} 
                label="25th Percentile (Entry Rate)" 
                value={`${p.salaryResult.currency} ${Number(p.salaryResult.annualRange?.[0] || 0).toLocaleString()}`} 
              />
              <Stat 
                icon={BarChart3} 
                label="50th Percentile (Market Median)" 
                value={`${p.salaryResult.currency} ${Number(p.salaryResult.annualMedian || 0).toLocaleString()}`} 
              />
              <Stat 
                icon={TrendingUp} 
                label="75th Percentile (Top Quartile)" 
                value={`${p.salaryResult.currency} ${Number(p.salaryResult.annualRange?.[1] || 0).toLocaleString()}`} 
              />
            </div>

            {/* Top Paying Hubs & Pay Boosting Skills */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <h5 className="font-black text-sm text-slate-900 dark:text-white mb-3">
                  📍 Top Paying Cities & Hubs ({p.salaryResult.country})
                </h5>
                <div className="flex flex-wrap gap-2">
                  {(p.salaryResult.topPayingHubs || []).map(hub => (
                    <span key={hub} className="rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                      🏢 {hub}
                    </span>
                  ))}
                </div>
              </Card>

              <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <h5 className="font-black text-sm text-slate-900 dark:text-white mb-3">
                  🚀 Pay-Elevating Skills (+15% to +35% Boost)
                </h5>
                <div className="space-y-1.5">
                  {(p.salaryResult.payBoostingSkills || []).map((skill, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      <span>⚡</span>
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    );
  }
  if(p.active==="12") return <MassHiringCandidateDashboard {...p} />;
  if(p.active==="13")return panel("Employer Workforce Management","Launch the existing employer workflow.",<Links links={[["/recruiter/dashboard","Employer Dashboard"],["/recruiter/jobs","Manage Jobs"],["/recruiter/applications","Applications"],["/recruiter/interviews","Interviews"],["/recruiter/find-candidates","Find Candidates"]]}/>);
  if(p.active==="14")return panel("Global Recruiter Marketplace","Open live recruiter-side tools and candidate sourcing.",<Links links={[["/recruiter/dashboard","Recruiter Dashboard"],["/recruiter/find-candidates","Candidate Marketplace"],["/recruiter/jobs","Recruiter Jobs"],["/recruiter/applications","Submissions"],["/recruiter/chats","Recruiter Chats"]]}/>);
  if(p.active==="15")return panel("Mass Workforce Solutions & Contracts","Browse active bulk staffing requests posted by international employers. Candidate workers can apply directly to open requisitions.",<>
    <div className="mb-4 rounded-xl bg-blue-50/40 p-4 border border-blue-100 dark:border-blue-900/40 dark:bg-blue-950/20">
      <h4 className="font-black text-sm text-blue-900 dark:text-blue-300">Bulk Worker Sourcing Requisitions</h4>
      <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">Recruweb partners with verified employers to fulfill large-scale construction, healthcare, logistics, and IT manpower demands globally.</p>
    </div>
    <h4 className="text-base font-black mb-3 text-slate-900 dark:text-white">Active Requisitions ({p.bulkRequests.length})</h4>
    <div className="grid gap-4 sm:grid-cols-2">
      {p.bulkRequests.map((r, idx) => {
        const app = (p.massApplications || []).find(a => Number(a.bulk_request_id) === Number(r.id));
        return (
          <Card key={`ecosystem-req-${r.id}-${idx}`} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col justify-between p-4">
            <div>
              <div className="flex justify-between items-start gap-2">
                <span className="rounded-full bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 text-[9px] font-black text-blue-700 dark:text-blue-300">
                  👥 {r.workers} Workers Needed
                </span>
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 text-[9.5px] font-black text-emerald-700 dark:text-emerald-400 uppercase">
                  {r.status}
                </span>
              </div>
              <h5 className="mt-3 font-black text-base text-slate-900 dark:text-white">{r.role}</h5>
              <p className="mt-1 text-xs text-slate-500 font-bold">📍 Target Country: {r.country || "Global"}</p>
              {r.salary && <p className="mt-1 text-xs font-black text-emerald-600 dark:text-emerald-400">💰 Salary: {r.salary}</p>}
              {r.companyName && <p className="mt-2 text-xs font-bold text-slate-600 dark:text-slate-400">Client: {r.companyName}</p>}
              {r.notes && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">"{r.notes}"</p>}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              {app ? (
                <div className="text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-500">
                  Application Status: <b className="capitalize text-blue-600">{app.status.replace("_", " ")}</b>
                </div>
              ) : (
                <Button onClick={() => p.handleApplyMassJob(r.id)} className="w-full text-xs font-black py-2 shadow-md">
                  <UserCheck className="h-4 w-4" /> Apply as Worker
                </Button>
              )}
            </div>
          </Card>
        );
      })}
      {!p.bulkRequests.length && <Card><p className="text-sm font-bold text-slate-500">No active bulk requests in database.</p></Card>}
    </div>
  </>);
  if(p.active==="16")return panel("Blue + White Collar Marketplace","Categories are derived from live job records.",<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{(p.market?.categories||[]).map(x=><button key={x.category} onClick={()=>{p.setCategory(x.category);p.runJobs()}} className="rounded-xl border p-4 text-left hover:border-blue-400"><p className="font-black">{x.category}</p><p className="mt-1 text-xs text-slate-500">{x.openJobs} live jobs</p></button>)}</div>);
  if(p.active==="18")return <PassportPanel {...p}/>;
  if(p.active==="19")return panel("Complete Recruweb Ecosystem","Interactive connections across people, business and partners.",<><Flow steps={["People","Business","Partners","AI Workforce Engine","Global Workforce ID","Verification","Mobility","Workforce Marketplace"]}/><div className="grid gap-3 md:grid-cols-3">{["Job Seekers","Employers","Recruiters","Training","Mobility","Workforce Management"].map(x=><Card key={x}><Network className="h-5 w-5 text-blue-500"/><b className="mt-3 block">{x}</b><button onClick={()=>p.record(`ecosystem_${x.toLowerCase().replaceAll(" ","_")}`)} className="mt-3 text-xs font-black text-blue-600">Test workflow →</button></Card>)}</div></>);
  if(p.active==="20")return panel("Business Model Workspace","Record product milestones instead of showing static business claims.",<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{["Employer subscriptions","Recruitment success fees","AI recruitment SaaS","AI interview usage","Verification services","Recruiter marketplace","Training partners","Mobility partners","Enterprise platform","API usage"].map(x=><button key={x} onClick={()=>p.record(`business_model_${x.toLowerCase().replaceAll(" ","_")}`)} className="rounded-xl border p-4 text-left font-black hover:border-blue-400">{x}<span className="mt-2 block text-[10px] font-bold text-blue-600">Test / record →</span></button>)}</div>);
  if(p.active==="21")return panel("Worker Portal","Direct access to candidate workflows.",<Links links={[["/","Home"],["/jobs","Jobs"],["/profile","My Profile"],["/cv-maker","CV Maker"],["/candidate/applied-jobs","Applications"],["/candidate/interviews","Interviews"],["/candidate/chats","Messages"],["/workforce","Global Workforce"]]}/>);
  if(p.active==="22")return panel("Employer Portal","Direct access to employer workflows.",<Links links={[["/recruiter/dashboard","Dashboard"],["/recruiter/jobs/create","Post Job"],["/recruiter/jd-maker","AI JD Maker"],["/recruiter/find-candidates","Candidates"],["/recruiter/interviews","Interviews"],["/recruiter/applications","Applications"],["/recruiter/chats","Chats"]]}/>);
  if(p.active==="23")return panel("Recruiter Portal","Direct access to recruiter workflows.",<Links links={[["/recruiter/dashboard","Dashboard"],["/recruiter/find-candidates","Candidate Database"],["/recruiter/jobs","Jobs"],["/recruiter/applications","Submissions"],["/recruiter/interviews","Interviews"],["/recruiter/chats","Messages"]]}/>);
  if(p.active==="25")return panel("Global Workforce Intelligence","Live analytics from Recruweb database.",<><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Stat icon={Globe2} label="Markets represented" value={p.intel?.countriesCount||0}/><Stat icon={Building2} label="Employers" value={(p.intel?.employers||0).toLocaleString()}/><Stat icon={Users} label="Workers" value={(p.intel?.workers||0).toLocaleString()}/><Stat icon={BriefcaseBusiness} label="Open jobs" value={(p.intel?.openJobs||0).toLocaleString()}/></div><div className="mt-4 grid gap-4 lg:grid-cols-2"><Card><h4 className="font-black">Live demand by industry</h4><div className="mt-4 space-y-3">{(p.intel?.demand||[]).map(x=><div key={x.name}><div className="flex justify-between text-xs font-bold"><span>{x.name}</span><span>{x.jobs}</span></div><div className="mt-1 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" style={{width:`${Math.min(100,(x.jobs/Math.max(...(p.intel?.demand||[{jobs:1}]).map(y=>y.jobs)))*100)}%`}}/></div></div>)}</div></Card><Card><h4 className="font-black">Country demand</h4><div className="mt-4 space-y-2">{(p.intel?.countries||[]).map(x=><div key={x.name} className="flex justify-between rounded-xl bg-slate-50 p-3 text-xs font-bold dark:bg-slate-800"><span>{x.name}</span><span>{x.jobs} jobs</span></div>)}</div></Card></div></>);
  if(p.active==="26")return panel("Global Launch Roadmap","Record milestone testing across expansion phases.",<div className="grid gap-3 md:grid-cols-5">{[["Phase 1","India","Core infrastructure"],["Phase 2","Middle East","UAE · Saudi · Qatar · Oman · Kuwait · Bahrain"],["Phase 3","Europe","Germany · Netherlands · France · Poland · Italy · Ireland"],["Phase 4","Canada","India ↔ Canada"],["Phase 5","USA","Domestic, remote and workforce SaaS"]].map(x=><button key={x[0]} onClick={()=>p.record(`roadmap_${x[0].toLowerCase().replace(" ","_")}`)} className="rounded-xl border p-4 text-left hover:border-blue-400"><span className="text-[10px] font-black text-blue-600">{x[0]}</span><b className="mt-2 block">{x[1]}</b><p className="mt-1 text-xs text-slate-500">{x[2]}</p><span className="mt-3 block text-[10px] font-black text-blue-600">Test milestone →</span></button>)}</div>);
  if(p.active==="27")return panel("Long-Term Workforce Vision","Interactive lifecycle testing.",<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{["Student","Learner","Job Seeker","Employee","Professional","Manager","Employer","Global Enterprise"].map((x,i)=><button key={x} onClick={()=>p.record(`career_stage_${x.toLowerCase().replaceAll(" ","_")}`)} className="rounded-xl border p-5 text-left hover:border-blue-400"><span className="text-xs font-black text-blue-600">0{i+1}</span><b className="mt-2 block">{x}</b><span className="mt-2 block text-[10px] font-bold text-slate-500">Record stage →</span></button>)}</div>);
  if(p.active==="28")return panel("Learn → Verify → Match → Apply → Work → Grow","Every step is clickable and records activity in the backend.",<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">{["LEARN","VERIFY","MATCH","APPLY","WORK","GROW"].map((x,i)=><button key={x} onClick={()=>p.record(`career_loop_${x.toLowerCase()}`)} className="rounded-2xl border p-5 text-center hover:border-blue-400"><div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black">{i+1}</div><b className="mt-3 block">{x}</b><span className="mt-1 block text-[10px] font-bold text-blue-600">Test step</span></button>)}</div>);
  return panel("Workforce module","Interactive testing workspace.",<Button onClick={()=>p.record(`module_${p.active}_tested`)}><Play className="h-4 w-4"/> Test module</Button>);
}
function MassHiringCandidateDashboard(p) {
  const [tab, setTab] = useState("open_jobs");
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [highMatchOnly, setHighMatchOnly] = useState(false);

  const bulkRequests = p.bulkRequests || [];
  const massApps = p.massApplications || [];

  const totalOpen = bulkRequests.length;
  const myAppliedCount = massApps.length;
  const myHiredCount = massApps.filter(a => a.status === "accepted" || a.applicationStatus === "accepted").length;
  const highMatchCount = bulkRequests.filter(r => (r.matchScore || 50) >= 75).length;

  const filteredRequests = bulkRequests.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || (r.role || "").toLowerCase().includes(q) || (r.notes || "").toLowerCase().includes(q) || (r.companyName || "").toLowerCase().includes(q);
    const matchCty = selectedCountry === "All" || (r.country || "").toLowerCase().includes(selectedCountry.toLowerCase());
    const matchCat = selectedCategory === "All" || (r.category || "").toLowerCase().includes(selectedCategory.toLowerCase());
    const matchHigh = !highMatchOnly || (r.matchScore || 50) >= 75;
    return matchSearch && matchCty && matchCat && matchHigh;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-blue-200/80 dark:border-blue-900/60 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 p-6 shadow-xl text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4 pointer-events-none">
          <Truck className="h-64 w-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-300">
              CANDIDATE MASS WORKFORCE COMMAND
            </span>
            <h3 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
              Mass Hiring Jobs & Worker Ecosystem
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Explore international bulk staffing requisitions, apply as a worker, view AI profile suitability match scores, and track your hiring decision status in real time.
            </p>
          </div>

          <button
            onClick={p.load}
            className="self-start md:self-auto shrink-0 inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs font-extrabold text-white transition backdrop-blur-md cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" /> Refresh Live Opportunities
          </button>
        </div>
      </div>

      {/* Analytics Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wide">Open Mass Hiring Jobs</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Truck className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{totalOpen}</p>
          <p className="mt-1 text-[11px] font-bold text-slate-400">Live active requisitions</p>
        </Card>

        <Card className="bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wide">My Applied Jobs</span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{myAppliedCount}</p>
          <p className="mt-1 text-[11px] font-bold text-slate-400">Submitted worker applications</p>
        </Card>

        <Card className="bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wide">Hired / Accepted</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-emerald-600 dark:text-emerald-400">{myHiredCount}</p>
          <p className="mt-1 text-[11px] font-bold text-emerald-600/80">Confirmed worker positions</p>
        </Card>

        <Card className="bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wide">AI High Profile Matches</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-amber-500">{highMatchCount}</p>
          <p className="mt-1 text-[11px] font-bold text-slate-400">≥75% profile match score</p>
        </Card>
      </div>

      {/* Main Tab Controls */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setTab("open_jobs")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
            tab === "open_jobs"
              ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <Truck className="h-4 w-4" /> Open Opportunities & AI Matches ({bulkRequests.length})
        </button>
        <button
          onClick={() => setTab("my_applications")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
            tab === "my_applications"
              ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <UserCheck className="h-4 w-4" /> My Applied & Hired Status ({massApps.length})
        </button>
      </div>

      {/* TAB 1: Open Opportunities & AI Profile Match */}
      {tab === "open_jobs" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <Card className="p-4 bg-slate-50/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">
              <Input
                label="Search Mass Hiring Jobs"
                placeholder="Welder, Nurse, Driver, IT..."
                value={search}
                onChange={setSearch}
              />
              <Select
                label="Target Country"
                value={selectedCountry}
                onChange={setSelectedCountry}
                options={["All", ...COUNTRIES]}
              />
              <Select
                label="Industry Category"
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={WORKER_CATEGORIES}
              />
              <label className="flex items-center gap-2.5 cursor-pointer pb-2.5">
                <input
                  type="checkbox"
                  checked={highMatchOnly}
                  onChange={(e) => setHighMatchOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                  ⚡ High Profile Match Only (≥75%)
                </span>
              </label>
            </div>
          </Card>

          {/* Mass Hiring Job Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredRequests.map((r, idx) => {
              const app = (massApps || []).find((a) => Number(a.bulk_request_id || a.bulkId) === Number(r.id));
              const matchScore = r.matchScore || 50;
              const isHighMatch = matchScore >= 75;

              return (
                <Card
                  key={`mass-req-${r.id || idx}-${idx}`}
                  className={`flex flex-col justify-between p-5 transition-all duration-300 hover:shadow-lg ${
                    isHighMatch
                      ? "bg-gradient-to-br from-white via-blue-50/20 to-cyan-50/20 dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900 border-blue-300 dark:border-blue-800/80"
                      : "bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <span className="rounded-full bg-blue-100 dark:bg-blue-950 px-3 py-1 text-[10px] font-black text-blue-700 dark:text-blue-300">
                        👥 {r.workers} Workers Required
                      </span>

                      <div className="flex items-center gap-2">
                        {isHighMatch && (
                          <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2.5 py-0.5 text-[9.5px] font-black shadow-xs flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> {matchScore}% Match
                          </span>
                        )}

                        {app ? (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[9.5px] font-black uppercase ${
                              app.status === "accepted" || app.applicationStatus === "accepted"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : app.status === "rejected" || app.applicationStatus === "rejected"
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                : app.status === "under_review" || app.applicationStatus === "under_review"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            }`}
                          >
                            {app.status === "accepted" || app.applicationStatus === "accepted"
                              ? "Hired ✓"
                              : app.status === "rejected" || app.applicationStatus === "rejected"
                              ? "Not Selected"
                              : app.status === "under_review" || app.applicationStatus === "under_review"
                              ? "Under Review"
                              : "Applied ✓"}
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase">
                            OPEN
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="mt-3 text-lg font-black text-slate-950 dark:text-white tracking-tight">
                      {r.role}
                    </h4>

                    <div className="mt-2 space-y-1 text-xs font-bold text-slate-600 dark:text-slate-300">
                      <p className="flex items-center gap-1.5">
                        <MapPinned className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <span>Target Country:</span> <b>{r.country || "Global"}</b>
                        {r.category && <span>· Category: <b>{r.category}</b></span>}
                      </p>

                      {r.salary && (
                        <p className="text-emerald-600 dark:text-emerald-400 font-black">
                          💰 Offered Salary: {r.salary}
                        </p>
                      )}

                      {r.companyName && (
                        <p className="text-slate-500 dark:text-slate-400">
                          🏢 Employer: {r.companyName}
                        </p>
                      )}
                    </div>

                    {r.notes && (
                      <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 leading-relaxed">
                        "{r.notes}"
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    {app ? (
                      <div className="text-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800">
                        Application Status:{" "}
                        <b className="capitalize text-slate-900 dark:text-white">
                          {(app.status || app.applicationStatus || "applied").replace("_", " ")}
                        </b>
                      </div>
                    ) : (
                      <Button
                        onClick={() => p.handleApplyMassJob(r.id)}
                        className="w-full text-xs font-black py-2.5 shadow-md hover:shadow-lg transition"
                      >
                        <UserCheck className="h-4 w-4" /> Apply as Worker
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}

            {!filteredRequests.length && (
              <div className="sm:col-span-2 text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <Truck className="mx-auto h-10 w-10 text-slate-400 mb-2" />
                <p className="text-sm font-black text-slate-800 dark:text-slate-200">No mass hiring requisitions match your active filter.</p>
                <p className="text-xs text-slate-500 mt-1">Try clearing your search keyword or expanding country and category selections.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: My Applied & Hired Positions Status */}
      {tab === "my_applications" && (
        <div className="space-y-4">
          {massApps.map((app, idx) => {
            const status = app.status || app.applicationStatus || "applied";
            const isHired = status === "accepted";
            const isReview = status === "under_review";
            const isRejected = status === "rejected";

            return (
              <Card
                key={`mass-app-${app.applicationId || app.id || app.bulkId || idx}-${idx}`}
                className={`p-5 transition-all duration-300 ${
                  isHired
                    ? "bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/80 shadow-emerald-900/20 shadow-lg"
                    : isReview
                    ? "bg-slate-900/90 border-amber-500/50"
                    : isRejected
                    ? "bg-slate-900/90 border-rose-500/50 opacity-80"
                    : "bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800"
                }`}
              >
                {isHired && (
                  <div className="mb-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-3 text-white font-black text-xs sm:text-sm flex items-center justify-between shadow-md">
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" /> 🎉 CONGRATULATIONS! YOU ARE HIRED FOR THIS MASS HIRING POSITION
                    </span>
                    <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] uppercase">CONFIRMED WORKER</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-blue-100 dark:bg-blue-950 px-2.5 py-0.5 text-[9px] font-black text-blue-700 dark:text-blue-300">
                        APPLICATION #{app.applicationId || app.id}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[9.5px] font-black uppercase ${
                          isHired
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : isReview
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : isRejected
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        }`}
                      >
                        {status.replace("_", " ")}
                      </span>
                    </div>

                    <h4 className="mt-2 text-xl font-black text-slate-950 dark:text-white">{app.role}</h4>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 font-bold">
                      📍 Country: <b>{app.country || "Global"}</b>
                      {app.category && <span> · Category: <b>{app.category}</b></span>}
                      {app.salary && <span className="text-emerald-600 dark:text-emerald-400"> · Salary: <b>{app.salary}</b></span>}
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Employer</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{app.companyName || app.recruiterName || "Recruweb Employer"}</p>
                    {app.recruiterEmail && (
                      <p className="text-xs text-slate-500 mt-0.5">{app.recruiterEmail}</p>
                    )}
                  </div>
                </div>

                {app.jobNotes && (
                  <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    "{app.jobNotes}"
                  </p>
                )}
              </Card>
            );
          })}

          {massApps.length === 0 && (
            <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <UserCheck className="mx-auto h-10 w-10 text-slate-400 mb-2" />
              <p className="text-sm font-black text-slate-800 dark:text-slate-200">You have not submitted any mass hiring worker applications yet.</p>
              <p className="text-xs text-slate-500 mt-1">Switch to the "Open Opportunities & AI Matches" tab to apply for live positions.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PassportPanel(p){const set=(k,v)=>p.setPassport({...p.passport,[k]:v});return <Card><div className="flex items-start justify-between"><div><h3 className="text-xl font-black">Recruweb Workforce Passport</h3><p className="mt-1 text-sm text-slate-500">Portable professional identity stored in the backend.</p></div><IdCard className="h-7 w-7 text-blue-500"/></div><div className="mt-6 grid gap-4 md:grid-cols-2"><Input label="Profession" value={p.passport.profession} onChange={v=>set("profession",v)}/><Select label="Experience" value={p.experience} onChange={p.setExperience} options={EXPERIENCE}/>{p.experience==="Other"&&<Input label="Other experience" value={p.otherExperience} onChange={p.setOtherExperience} placeholder="Enter manually"/>}<Select label="Minimum Qualification" value={p.qualification} onChange={p.setQualification} options={QUALIFICATIONS}/>{p.qualification==="Other"&&<Input label="Other qualification" value={p.otherQualification} onChange={p.setOtherQualification} placeholder="Enter qualification manually"/>}<Select label="Target country" value={p.passport.targetCountry || "Germany"} onChange={v=>set("targetCountry",v)} options={COUNTRIES}/><Input label="Skills" value={p.passport.skills} onChange={v=>set("skills",v)} placeholder="Java, AWS, SQL"/><Input label="Certifications" value={p.passport.certifications} onChange={v=>set("certifications",v)}/><Input label="Languages" value={p.passport.languages} onChange={v=>set("languages",v)}/><Input label="Work eligibility" value={p.passport.workEligibility} onChange={v=>set("workEligibility",v)}/><Input label="Salary expectation" value={p.passport.salaryExpectation} onChange={v=>set("salaryExpectation",v)}/></div><div className="mt-4"><TextArea label="Professional summary" value={p.passport.bio} onChange={v=>set("bio",v)}/></div><div className="mt-5 flex flex-wrap gap-2"><Button onClick={p.savePassport}><Save className="h-4 w-4"/> Save Passport</Button><Button variant="ghost" onClick={()=>p.run("verification/request",{},()=>{},"Verification request submitted")}>Request verification</Button></div></Card>}
function Links({links}){return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{links.map(([to,label])=><Link key={to+label} to={to} className="group rounded-2xl border border-slate-200 bg-white p-5 font-black hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900">{label}<ArrowRight className="ml-2 inline h-4 w-4 transition group-hover:translate-x-1"/></Link>)}</div>}
function Checklist({ preferences, onToggle }){const items=["Documentation checklist","Work authorization guidance","Employer information","Travel planning","Accommodation","Insurance","Country orientation","Local services","Banking","Transportation","SIM/mobile","Payroll support","HR support"];let checkedMap={};if(preferences){try{const parsed=typeof preferences==="string"?JSON.parse(preferences):preferences;checkedMap=parsed.supportChecklist||{};}catch(e){checkedMap={};}}return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map(x=>{const checked=!!checkedMap[x];return <label key={x} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-xs font-bold transition hover:border-blue-400 ${checked?"bg-blue-50/30 border-blue-200 text-blue-700":"bg-white border-slate-200 text-slate-700"}`}><input type="checkbox" checked={checked} onChange={e=>onToggle(x,e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"/>{x}</label>})}</div>}
function Flow({steps}){return <div className="flex flex-wrap items-center gap-2">{steps.map((x,i)=><React.Fragment key={x}><span className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">{x}</span>{i<steps.length-1&&<ChevronRight className="h-4 w-4 text-slate-300"/>}</React.Fragment>)}</div>}
