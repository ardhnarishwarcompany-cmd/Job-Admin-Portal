import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components_lite/Navbar";
import { Sparkles, Briefcase, MapPin, Clock, Users, FileText, Zap, Copy, Check, CheckCircle2, RefreshCw, Download } from "lucide-react";
import { toast } from "sonner";

const sampleJDs = [
  {
    title: "Senior React Developer",
    company: "TechCorp India",
    location: "Bangalore / Remote",
    type: "Full Time",
    exp: "3-5 Years",
    category: "Frontend Engineering",
    educationLevel: "Bachelor's Degree",
    genderPreference: "Any",
    department: "Product Engineering",
    reportingTo: "Engineering Manager",
    salary: "₹18-28 LPA",
    positions: "3",
    deadline: "2025-12-31",
    skills: ["React.js", "TypeScript", "Node.js", "Redux", "REST APIs"],
    desc: "We are looking for a passionate Senior React Developer to join our growing engineering team. You will be responsible for building scalable, high-performance web applications that serve millions of users.",
    responsibilities: [
      "Design and implement complex UI components using React.js",
      "Collaborate with backend teams to integrate RESTful APIs",
      "Mentor junior developers and conduct code reviews",
      "Optimize application performance and ensure cross-browser compatibility",
      "Participate in agile ceremonies and sprint planning",
    ],
    requirements: [
      "3+ years of hands-on React.js experience",
      "Strong proficiency in TypeScript and modern JavaScript (ES6+)",
      "Experience with state management (Redux/Zustand)",
      "Familiarity with CI/CD pipelines and Git workflows",
      "Excellent problem-solving and communication skills",
    ],
    perks: ["Health Insurance", "Remote Work", "Stock Options", "Learning Budget"],
  },
];

const fields = [
  { name: "jobTitle", label: "Job Title", placeholder: "e.g. Senior React Developer", icon: Briefcase },
  { name: "companyName", label: "Company Name", placeholder: "e.g. TechCorp India", icon: Users },
  { name: "department", label: "Department", placeholder: "e.g. Product Engineering", icon: Sparkles },
  { name: "jobCategory", label: "Job Category", placeholder: "e.g. Frontend, Design, Sales", icon: FileText },
  { name: "employmentType", label: "Employment Type", placeholder: "e.g. Full Time / Contract", icon: Clock },
  { name: "educationLevel", label: "Education Level", placeholder: "e.g. Bachelor's / MBA", icon: FileText },
  { name: "genderPreference", label: "Gender Preference", placeholder: "Any / Male / Female / Other", icon: Users },
  { name: "skills", label: "Required Skills", placeholder: "e.g. React, Node.js, TypeScript", icon: Zap },
  { name: "experience", label: "Experience Required", placeholder: "e.g. 3-5 Years", icon: Clock },
  { name: "location", label: "Location", placeholder: "e.g. Bangalore / Remote", icon: MapPin },
  { name: "salary", label: "Salary Range", placeholder: "e.g. ₹15-25 LPA", icon: FileText },
  { name: "positions", label: "Open Positions", placeholder: "e.g. 3", icon: Users },
  { name: "reportingTo", label: "Reporting To", placeholder: "e.g. Engineering Manager", icon: Briefcase },
  { name: "deadline", label: "Application Deadline", placeholder: "Select deadline", icon: Clock, type: "date" },
  { name: "benefits", label: "Benefits", placeholder: "e.g. Health insurance, Training", icon: Sparkles },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const JdMakerPage = () => {
  const [form, setForm] = useState({
    jobTitle: "",
    companyName: "",
    department: "",
    jobCategory: "",
    employmentType: "",
    educationLevel: "",
    genderPreference: "Any",
    skills: "",
    experience: "",
    location: "",
    salary: "",
    positions: "",
    reportingTo: "",
    deadline: "",
    benefits: "",
  });
  const [generated, setGenerated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!form.jobTitle.trim()) { toast.error("Please enter a job title"); return; }
    setLoading(true);
    setTimeout(() => {
      setGenerated({
        ...sampleJDs[0],
        title: form.jobTitle || sampleJDs[0].title,
        company: form.companyName || sampleJDs[0].company,
        department: form.department || sampleJDs[0].department,
        category: form.jobCategory || sampleJDs[0].category,
        type: form.employmentType || sampleJDs[0].type,
        educationLevel: form.educationLevel || sampleJDs[0].educationLevel,
        genderPreference: form.genderPreference || sampleJDs[0].genderPreference,
        location: form.location || sampleJDs[0].location,
        exp: form.experience || sampleJDs[0].exp,
        salary: form.salary || sampleJDs[0].salary,
        positions: form.positions || sampleJDs[0].positions,
        reportingTo: form.reportingTo || sampleJDs[0].reportingTo,
        deadline: form.deadline || sampleJDs[0].deadline,
        skills: form.skills ? form.skills.split(",").map(s => s.trim()) : sampleJDs[0].skills,
        perks: form.benefits ? form.benefits.split(",").map(s => s.trim()) : sampleJDs[0].perks,
      });
      setLoading(false);
      toast.success("JD Generated Successfully!");
    }, 1800);
  };

  const handleCopy = () => {
    if (!generated) return;
    navigator.clipboard.writeText(`${generated.title}\n\n${generated.desc}\n\nSkills: ${generated.skills.join(", ")}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-950">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden py-16 px-4 text-center">
        <motion.div animate={{ /* scale animation removed to prevent layout growth */ opacity:[0.2,0.4,0.2] }} transition={{ duration:6, repeat:Infinity }} className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        <motion.div animate={{ /* scale animation removed to prevent layout growth */ opacity:[0.15,0.35,0.15] }} transition={{ duration:8, repeat:Infinity, delay:1 }} className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-cyan-600/20 blur-3xl" />
        <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }} className="relative z-10">
          <motion.div animate={{ rotate:[0,10,-10,0] }} transition={{ duration:3, repeat:Infinity, delay:1 }} className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-2xl shadow-blue-500/40 mb-6">
            <Sparkles className="h-10 w-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-black text-white sm:text-5xl">AI <span className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">JD Maker</span></h1>
          <p className="mt-3 text-slate-400 text-lg max-w-xl mx-auto">Generate professional, compelling job descriptions in seconds with AI</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {["Saves 2 hrs/JD","ATS Optimized","100+ Templates","One Click"].map((tag,i) => (
              <motion.span key={tag} initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.3+i*0.1 }} className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300">
                ✦ {tag}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form */}
          <motion.div initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2 }} className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" /> Job Details
            </h2>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {fields.map((field, i) => (
                  <motion.div key={field.name} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3+i*0.07 }}>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">{field.label}</label>
                    <div className="relative">
                      <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type={field.type || "text"}
                        value={form[field.name]}
                        onChange={e => setForm({...form, [field.name]: e.target.value})}
                        placeholder={field.placeholder}
                        className="w-full rounded-xl border border-white/10 bg-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
              <motion.button
                whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                type="submit" disabled={loading}
                className="w-full mt-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 py-4 text-sm font-black text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <><RefreshCw className="h-5 w-5 animate-spin" /> Generating JD...</>
                ) : (
                  <><Sparkles className="h-5 w-5" /> Generate Job Description</>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Output */}
          <motion.div initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.3 }} className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" /> Generated JD
              </h2>
              {generated && (
                <div className="flex gap-2">
                  <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={handleCopy} className="flex items-center gap-1.5 rounded-xl bg-white/10 border border-white/20 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition-all">
                    {copied ? <><Check className="h-3.5 w-3.5 text-emerald-400" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                  </motion.button>
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-blue-600/30 border-t-blue-500 animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-blue-400" />
                  </div>
                  <p className="text-slate-400 text-sm">AI is crafting your JD...</p>
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <motion.div key={i} animate={{ /* scale animation removed to prevent layout growth */ }} transition={{ duration:0.8, repeat:Infinity, delay:i*0.2 }} className="h-2 w-2 rounded-full bg-blue-500" />
                    ))}
                  </div>
                </motion.div>
              ) : generated ? (
                <motion.div key="result" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="space-y-4 max-h-[500px] overflow-y-auto pr-1 custom-scroll">
                  <div className="rounded-2xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 p-4">
                    <h3 className="text-lg font-black text-white">{generated.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="flex items-center gap-1 text-xs text-slate-300"><MapPin className="h-3 w-3 text-blue-400" />{generated.location}</span>
                      <span className="flex items-center gap-1 text-xs text-slate-300"><Clock className="h-3 w-3 text-blue-400" />{generated.exp}</span>
                      <span className="flex items-center gap-1 text-xs text-slate-300"><FileText className="h-3 w-3 text-blue-400" />{generated.salary}</span>
                      {generated.company && (
                        <span className="flex items-center gap-1 text-xs text-slate-300"><Briefcase className="h-3 w-3 text-blue-400" />{generated.company}</span>
                      )}
                      {generated.category && (
                        <span className="flex items-center gap-1 text-xs text-slate-300">Category: {generated.category}</span>
                      )}
                      {generated.department && (
                        <span className="flex items-center gap-1 text-xs text-slate-300">Dept: {generated.department}</span>
                      )}
                      {generated.type && (
                        <span className="flex items-center gap-1 text-xs text-slate-300">{generated.type}</span>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {generated.educationLevel && (
                      <span className="flex items-center gap-1 text-xs text-slate-300">Education: {generated.educationLevel}</span>
                    )}
                    {generated.genderPreference && (
                      <span className="flex items-center gap-1 text-xs text-slate-300">Gender: {generated.genderPreference}</span>
                    )}
                    {generated.reportingTo && (
                      <span className="flex items-center gap-1 text-xs text-slate-300">Reporting to: {generated.reportingTo}</span>
                    )}
                    {generated.deadline && (
                      <span className="flex items-center gap-1 text-xs text-slate-300">Deadline: {generated.deadline}</span>
                    )}
                    {generated.positions && (
                      <span className="flex items-center gap-1 text-xs text-slate-300">Open roles: {generated.positions}</span>
                    )}
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">About the Role</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{generated.desc}</p>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">Required Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {generated.skills.map(s => (
                        <span key={s} className="rounded-full bg-blue-500/20 border border-blue-500/30 px-3 py-1 text-xs font-semibold text-blue-300">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Responsibilities</p>
                    <ul className="space-y-2">
                      {generated.responsibilities.map((r,i) => (
                        <motion.li key={i} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.07 }} className="flex items-start gap-2 text-sm text-slate-300">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />{r}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <p className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-3">Perks & Benefits</p>
                    <div className="flex flex-wrap gap-2">
                      {generated.perks.map(p => (
                        <span key={p} className="rounded-full bg-sky-500/20 border border-sky-500/30 px-3 py-1 text-xs font-semibold text-sky-300">🎁 {p}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex flex-col items-center justify-center py-20 text-slate-500">
                  <motion.div animate={{ y:[0,-8,0] }} transition={{ duration:2, repeat:Infinity }}>
                    <Sparkles className="h-16 w-16 mb-4 opacity-20" />
                  </motion.div>
                  <p className="font-semibold">Fill the form and generate your JD</p>
                  <p className="text-sm mt-1 text-slate-600">AI will create a professional job description</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default JdMakerPage;
