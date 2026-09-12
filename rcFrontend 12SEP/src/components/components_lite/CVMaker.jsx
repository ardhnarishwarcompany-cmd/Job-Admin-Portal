import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Award,
  BriefcaseBusiness,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Gauge,
  GraduationCap,
  Languages,
  LayoutTemplate,
  Link2,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
  UploadCloud,
  UserRound,
} from "lucide-react";
import Navbar from "./Navbar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import ResumePreviewHtml from "./ResumePreviewHtml";
import {
  TEMPLATES,
  buildResumeText,
  calculateResumeCompleteness,
  downloadResumePdf,
  getResumeHealthChecks,
} from "@/utils/resumeUtils.js";
import { parseResumePdf, getAtsScore, guessFieldsFromText } from "@/utils/aiResumeTools.js";

const STORAGE_KEY = "cv-maker-draft-v2";
let uid = 0;

const nextId = () => `id-${Date.now()}-${uid++}`;
const emptyExperience = () => ({ id: nextId(), role: "", company: "", duration: "", description: "" });
const emptyEducation = () => ({ id: nextId(), degree: "", school: "", year: "" });
const emptyProject = () => ({ id: nextId(), title: "", description: "" });
const emptyLink = () => ({ id: nextId(), label: "", url: "" });

const initialCv = {
  name: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  portfolio: "",
  summary: "",
  skills: "",
  certifications: "",
  achievements: "",
  languages: "",
  experience: [emptyExperience()],
  education: [emptyEducation()],
  projects: [],
  links: [],
};

const sectionRefs = {
  basics: "basics",
  summary: "summary",
  experience: "experience",
  education: "education",
  skills: "skills",
  projects: "projects",
  extras: "extras",
};

const textareaClass =
  "w-full resize-y rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const SectionCard = ({ id, title, subtitle, icon: Icon, action, children }) => (
  <section
    id={id}
    className="rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_22px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6"
  >
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-blue-600" />}
          <h2 className="text-lg font-black text-slate-900">{title}</h2>
        </div>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

const StatCard = ({ label, value, tone = "blue" }) => {
  const tones = {
    blue: "from-blue-50 to-cyan-50 text-blue-700",
    emerald: "from-emerald-50 to-teal-50 text-emerald-700",
    amber: "from-amber-50 to-orange-50 text-amber-700",
  };
  return (
    <div className={`rounded-2xl border border-white/70 bg-gradient-to-br ${tones[tone]} p-4 shadow-sm`}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
};

const ScoreBar = ({ label, value }) => (
  <div>
    <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-600">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  </div>
);

const HealthCheckCard = ({ item }) => {
  const tone =
    item.status === "good"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : item.status === "empty"
        ? "border-slate-200 bg-slate-50 text-slate-500"
        : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <div className={`rounded-2xl border p-3 ${tone}`}>
      <div className="flex items-start gap-2">
        {item.status === "good" ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" />
        ) : (
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
        )}
        <div>
          <p className="text-sm font-bold">{item.label}</p>
          <p className="mt-1 text-xs leading-5">{item.detail}</p>
        </div>
      </div>
    </div>
  );
};

const CVMaker = () => {
  const [cv, setCv] = useState(initialCv);
  const [template, setTemplate] = useState("modern");
  const [rightTab, setRightTab] = useState("preview");
  const [jobDescription, setJobDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [atsError, setAtsError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [saveState, setSaveState] = useState("Saved locally");
  const fileInputRef = useRef(null);
  const editorRefs = useRef({});

  // Force this page to always render in light mode
  useEffect(() => {
    const html = document.documentElement;
    const hadDark = html.classList.contains("dark");
    html.classList.remove("dark");
    return () => {
      if (hadDark) html.classList.add("dark");
    };
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCv({
          ...initialCv,
          ...parsed.cv,
          experience: parsed.cv?.experience?.length ? parsed.cv.experience : [emptyExperience()],
          education: parsed.cv?.education?.length ? parsed.cv.education : [emptyEducation()],
          projects: parsed.cv?.projects || [],
          links: parsed.cv?.links || [],
        });
        setTemplate(parsed.template || "modern");
        setJobDescription(parsed.jobDescription || "");
      }
    } catch {
      // Ignore invalid local draft data and continue with a fresh form.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ cv, template, jobDescription }));
    setSaveState("Saved locally");
    const timer = window.setTimeout(() => setSaveState("All changes saved"), 1400);
    return () => window.clearTimeout(timer);
  }, [cv, template, jobDescription, hydrated]);

  const set = (field, value) => {
    setSaveState("Saving...");
    setCv((prev) => ({ ...prev, [field]: value }));
  };

  const updateListItem = (field, id, patch) => {
    setSaveState("Saving...");
    setCv((prev) => ({
      ...prev,
      [field]: prev[field].map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  };

  const addListItem = (field, factory) => {
    setSaveState("Saving...");
    setCv((prev) => ({ ...prev, [field]: [...prev[field], factory()] }));
  };

  const removeListItem = (field, id) => {
    setSaveState("Saving...");
    setCv((prev) => ({ ...prev, [field]: prev[field].filter((item) => item.id !== id) }));
  };

  const resumeText = useMemo(() => buildResumeText(cv), [cv]);
  const completion = useMemo(() => calculateResumeCompleteness(cv), [cv]);
  const healthChecks = useMemo(() => getResumeHealthChecks(cv, jobDescription), [cv, jobDescription]);
  const summaryWordCount = useMemo(() => (cv.summary || "").trim().split(/\s+/).filter(Boolean).length, [cv.summary]);
  const filledExperience = useMemo(() => cv.experience.filter((item) => item.role || item.company || item.description).length, [cv.experience]);
  const filledProjects = useMemo(() => cv.projects.filter((item) => item.title || item.description).length, [cv.projects]);

  const sectionProgress = useMemo(
    () => [
      { id: sectionRefs.basics, label: "Personal", ready: Boolean(cv.name && cv.title && cv.email && cv.phone) },
      { id: sectionRefs.summary, label: "Summary", ready: Boolean(cv.summary.trim()) },
      { id: sectionRefs.experience, label: "Experience", ready: filledExperience > 0 },
      { id: sectionRefs.education, label: "Education", ready: cv.education.some((item) => item.degree || item.school) },
      { id: sectionRefs.skills, label: "Skills", ready: Boolean(cv.skills.trim()) },
      { id: sectionRefs.projects, label: "Projects", ready: filledProjects > 0 },
      { id: sectionRefs.extras, label: "Extras", ready: Boolean(cv.certifications || cv.achievements || cv.languages || cv.links.length) },
    ],
    [cv, filledExperience, filledProjects],
  );

  const scrollToSection = (key) => {
    const element = editorRefs.current[key];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }

    setUploading(true);
    try {
      const data = await parseResumePdf(file);
      if (!data.success) {
        toast.error(data.message || "Could not read that PDF.");
        return;
      }
      const guessed = guessFieldsFromText(data.text);
      setCv((prev) => ({
        ...prev,
        name: prev.name || guessed.name || "",
        email: prev.email || guessed.email || "",
        phone: prev.phone || guessed.phone || "",
        linkedin: prev.linkedin || guessed.linkedin || "",
        summary: prev.summary || data.text.slice(0, 700),
      }));
      setSaveState("Saving...");
      toast.success("Resume text extracted. Review the structured sections before downloading.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to read the PDF.");
    } finally {
      setUploading(false);
    }
  };

  const runAtsScore = async () => {
    if (!cv.name && !cv.summary && cv.experience.every((item) => !item.role && !item.description)) {
      toast.error("Fill in some resume details first, or upload a PDF, before checking your ATS score.");
      return;
    }
    setScoring(true);
    setAtsError("");
    setRightTab("ats");
    try {
      const data = await getAtsScore(resumeText, jobDescription);
      if (data.success) {
        setAtsResult(data.result);
      } else {
        setAtsError(data.message || "Could not compute ATS score right now.");
      }
    } catch (err) {
      setAtsError(err?.response?.data?.message || "Could not compute ATS score right now. Please try again.");
    } finally {
      setScoring(false);
    }
  };

  const handleDownload = () => {
    if (!cv.name?.trim()) {
      toast.error("Add your name before downloading.");
      return;
    }
    setSaveState("Saved before export");
    downloadResumePdf(cv, template);
    toast.success("Resume PDF downloaded.");
  };

  const clearDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCv({
      ...initialCv,
      experience: [emptyExperience()],
      education: [emptyEducation()],
      projects: [],
      links: [],
    });
    setTemplate("modern");
    setJobDescription("");
    setAtsResult(null);
    setAtsError("");
    setSaveState("Draft cleared");
    toast.success("Local CV draft cleared.");
  };

  return (
    <div className="theme-force-light min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[32px] border border-white/70 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_transparent_28rem),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(244,247,251,0.9))] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.10)] sm:p-8">
          <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
            <div>
              <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                AI CV Maker Workspace
              </p>
              <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
                Build a recruiter-ready CV with stronger structure, sharper formatting, and cleaner ATS analysis.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Edit section by section, preview every template in real time, and use the ATS panel to spot missing keywords,
                weak sections, and formatting issues before you export.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-600">
                  <Save className="h-4 w-4 text-emerald-600" />
                  <span className="font-semibold">{saveState}</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-600">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold">{completion}% complete</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-600">
                  <FileText className="h-4 w-4 text-cyan-600" />
                  <span className="font-semibold">{summaryWordCount} summary words</span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <StatCard label="Completion" value={`${completion}%`} tone="blue" />
              <StatCard label="Experience Entries" value={filledExperience} tone="emerald" />
              <StatCard label="Projects Added" value={filledProjects} tone="amber" />
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-200/80 bg-white/85 p-5 shadow-[0_22px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-black text-slate-900">
                <LayoutTemplate className="h-5 w-5 text-blue-600" />
                Pick a CV template
              </h2>
              <p className="mt-1 text-sm text-slate-500">Switch anytime. Your content stays intact across all templates.</p>
            </div>
            <Button type="button" variant="outline" className="rounded-full" onClick={clearDraft}>
              Clear Draft
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {TEMPLATES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTemplate(item.id)}
                className={`rounded-3xl border p-4 text-left transition ${
                  template === item.id
                    ? "border-blue-500 bg-blue-50 shadow-[0_18px_40px_rgba(37,99,235,0.18)]"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-black text-slate-900">{item.name}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
                  </div>
                  {template === item.id && <CheckCircle2 className="h-5 w-5 flex-none text-blue-600" />}
                </div>
                <div className="mt-4 flex gap-2">
                  <span className="h-2 w-16 rounded-full" style={{ backgroundColor: item.accent }} />
                  <span className="h-2 w-8 rounded-full bg-slate-200" />
                  <span className="h-2 w-10 rounded-full bg-slate-100" />
                </div>
              </button>
            ))}
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200/80 bg-white/85 p-4 shadow-[0_22px_60px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="flex flex-wrap gap-2">
                {sectionProgress.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] transition ${
                      item.ready
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {item.ready ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="h-2 w-2 rounded-full bg-current" />}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <SectionCard
              title="Import Existing Resume"
              subtitle="Upload a PDF to extract text and prefill the basics. Review everything before export."
              icon={UploadCloud}
              action={
                <Button type="button" onClick={handleUploadClick} disabled={uploading} className="rounded-full bg-blue-600 hover:bg-blue-700">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                  {uploading ? "Reading PDF..." : "Upload PDF"}
                </Button>
              }
            >
              <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Best for importing an existing resume draft. The builder extracts text server-side and helps you reorganize it into cleaner ATS-friendly sections.
              </div>
            </SectionCard>

            <div ref={(node) => { editorRefs.current[sectionRefs.basics] = node; }}>
              <SectionCard id={sectionRefs.basics} title="Personal Information" subtitle="Set the header exactly how recruiters and ATS systems should read it." icon={UserRound}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Full Name</Label>
                    <Input value={cv.name} onChange={(e) => set("name", e.target.value)} placeholder="Aarav Mehta" className="mt-1 h-11 rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Professional Title</Label>
                    <Input value={cv.title} onChange={(e) => set("title", e.target.value)} placeholder="Senior Frontend Engineer" className="mt-1 h-11 rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Email</Label>
                    <Input type="email" value={cv.email} onChange={(e) => set("email", e.target.value)} placeholder="aarav@email.com" className="mt-1 h-11 rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Phone</Label>
                    <Input value={cv.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" className="mt-1 h-11 rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Location</Label>
                    <Input value={cv.location} onChange={(e) => set("location", e.target.value)} placeholder="Bengaluru, India" className="mt-1 h-11 rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">LinkedIn</Label>
                    <Input value={cv.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="linkedin.com/in/aaravmehta" className="mt-1 h-11 rounded-xl" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Portfolio / GitHub</Label>
                    <Input value={cv.portfolio} onChange={(e) => set("portfolio", e.target.value)} placeholder="github.com/aaravmehta or portfolio.site" className="mt-1 h-11 rounded-xl" />
                  </div>
                </div>
              </SectionCard>
            </div>

            <div ref={(node) => { editorRefs.current[sectionRefs.summary] = node; }}>
              <SectionCard
                id={sectionRefs.summary}
                title="Professional Summary"
                subtitle="Aim for 40-80 words. Keep it role-specific, credible, and concise."
                icon={FileText}
              >
                <textarea
                  value={cv.summary}
                  onChange={(e) => set("summary", e.target.value)}
                  rows={5}
                  placeholder="Product-focused software engineer with 6+ years of experience building accessible web applications, improving conversion flows, and shipping scalable frontend systems across fast-moving teams."
                  className={textareaClass}
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">{summaryWordCount} words</span>
                  <span className={summaryWordCount >= 40 && summaryWordCount <= 90 ? "text-emerald-600" : "text-amber-600"}>
                    {summaryWordCount >= 40 && summaryWordCount <= 90 ? "Good summary length for most roles." : "Adjust the summary length for better scannability."}
                  </span>
                </div>
              </SectionCard>
            </div>

            <div ref={(node) => { editorRefs.current[sectionRefs.experience] = node; }}>
              <SectionCard
                id={sectionRefs.experience}
                title="Work Experience"
                subtitle="Use one bullet per line. Focus on scope, ownership, tools, and measurable outcomes when you have real numbers."
                icon={BriefcaseBusiness}
                action={
                  <Button type="button" variant="outline" className="rounded-full" onClick={() => addListItem("experience", emptyExperience)}>
                    <Plus className="h-4 w-4" />
                    Add Experience
                  </Button>
                }
              >
                <div className="space-y-4">
                  {cv.experience.map((item, index) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-black text-slate-700">Experience {index + 1}</p>
                        {cv.experience.length > 1 && (
                          <button type="button" onClick={() => removeListItem("experience", item.id)} className="rounded-full p-2 text-slate-400 hover:text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input value={item.role} onChange={(e) => updateListItem("experience", item.id, { role: e.target.value })} placeholder="Job Title" className="h-11 rounded-xl" />
                        <Input value={item.company} onChange={(e) => updateListItem("experience", item.id, { company: e.target.value })} placeholder="Company" className="h-11 rounded-xl" />
                      </div>
                      <Input
                        value={item.duration}
                        onChange={(e) => updateListItem("experience", item.id, { duration: e.target.value })}
                        placeholder="Jan 2022 - Present"
                        className="mt-3 h-11 rounded-xl"
                      />
                      <textarea
                        value={item.description}
                        onChange={(e) => updateListItem("experience", item.id, { description: e.target.value })}
                        rows={5}
                        placeholder={"One bullet per line\nLed redesign of onboarding flow for 3 products\nBuilt reusable React component system for internal teams\nPartnered with product and analytics to improve activation"}
                        className={`${textareaClass} mt-3`}
                      />
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            <div ref={(node) => { editorRefs.current[sectionRefs.education] = node; }}>
              <SectionCard
                id={sectionRefs.education}
                title="Education"
                subtitle="Keep this crisp and readable. Add multiple entries if needed."
                icon={GraduationCap}
                action={
                  <Button type="button" variant="outline" className="rounded-full" onClick={() => addListItem("education", emptyEducation)}>
                    <Plus className="h-4 w-4" />
                    Add Education
                  </Button>
                }
              >
                <div className="space-y-4">
                  {cv.education.map((item, index) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-black text-slate-700">Education {index + 1}</p>
                        {cv.education.length > 1 && (
                          <button type="button" onClick={() => removeListItem("education", item.id)} className="rounded-full p-2 text-slate-400 hover:text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <Input value={item.degree} onChange={(e) => updateListItem("education", item.id, { degree: e.target.value })} placeholder="Degree" className="h-11 rounded-xl sm:col-span-2" />
                        <Input value={item.year} onChange={(e) => updateListItem("education", item.id, { year: e.target.value })} placeholder="Year" className="h-11 rounded-xl" />
                      </div>
                      <Input value={item.school} onChange={(e) => updateListItem("education", item.id, { school: e.target.value })} placeholder="Institution" className="mt-3 h-11 rounded-xl" />
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            <div ref={(node) => { editorRefs.current[sectionRefs.skills] = node; }}>
              <SectionCard
                id={sectionRefs.skills}
                title="Skills"
                subtitle="Use comma-separated keywords to improve ATS readability and template cleanliness."
                icon={Sparkles}
              >
                <textarea
                  value={cv.skills}
                  onChange={(e) => set("skills", e.target.value)}
                  rows={4}
                  placeholder="React, TypeScript, Next.js, Node.js, PostgreSQL, REST APIs, Accessibility, Design Systems"
                  className={textareaClass}
                />
              </SectionCard>
            </div>

            <div ref={(node) => { editorRefs.current[sectionRefs.projects] = node; }}>
              <SectionCard
                id={sectionRefs.projects}
                title="Projects"
                subtitle="Useful for students, freelancers, and product roles. Add one bullet per line for clearer impact."
                icon={LayoutTemplate}
                action={
                  <Button type="button" variant="outline" className="rounded-full" onClick={() => addListItem("projects", emptyProject)}>
                    <Plus className="h-4 w-4" />
                    Add Project
                  </Button>
                }
              >
                {cv.projects.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    No projects added yet. Add standout work if it strengthens your target role.
                  </div>
                )}
                <div className="space-y-4">
                  {cv.projects.map((item, index) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-black text-slate-700">Project {index + 1}</p>
                        <button type="button" onClick={() => removeListItem("projects", item.id)} className="rounded-full p-2 text-slate-400 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <Input value={item.title} onChange={(e) => updateListItem("projects", item.id, { title: e.target.value })} placeholder="Project name" className="h-11 rounded-xl" />
                      <textarea
                        value={item.description}
                        onChange={(e) => updateListItem("projects", item.id, { description: e.target.value })}
                        rows={4}
                        placeholder={"One bullet per line\nBuilt end-to-end CRM dashboard with React and Node.js\nReduced reporting turnaround by automating exports\nImplemented role-based access and audit logging"}
                        className={`${textareaClass} mt-3`}
                      />
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            <div ref={(node) => { editorRefs.current[sectionRefs.extras] = node; }}>
              <SectionCard
                id={sectionRefs.extras}
                title="Certifications, Achievements, Languages & Links"
                subtitle="These sections help create a more complete and professional CV without overloading the main experience blocks."
                icon={Award}
              >
                <div className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Certifications</Label>
                    <textarea
                      value={cv.certifications}
                      onChange={(e) => set("certifications", e.target.value)}
                      rows={4}
                      placeholder="AWS Certified Developer, Scrum Master, Google Analytics Certification"
                      className={`${textareaClass} mt-1`}
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      <Languages className="h-3.5 w-3.5" />
                      Languages
                    </Label>
                    <textarea
                      value={cv.languages}
                      onChange={(e) => set("languages", e.target.value)}
                      rows={4}
                      placeholder="English, Hindi, Marathi"
                      className={`${textareaClass} mt-1`}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <Label className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Achievements</Label>
                    <textarea
                      value={cv.achievements}
                      onChange={(e) => set("achievements", e.target.value)}
                      rows={5}
                      placeholder={"One bullet per line\nTop performer in Q4 customer success reviews\nSpeaker at regional frontend engineering meetup\nSelected to mentor 6 junior team members"}
                      className={`${textareaClass} mt-1`}
                    />
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="flex items-center gap-2 text-base font-black text-slate-900">
                        <Link2 className="h-4 w-4 text-blue-600" />
                        Additional Links
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">Add publications, GitHub repos, case studies, or custom portfolio links.</p>
                    </div>
                    <Button type="button" variant="outline" className="rounded-full" onClick={() => addListItem("links", emptyLink)}>
                      <Plus className="h-4 w-4" />
                      Add Link
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {cv.links.length === 0 && <p className="text-sm text-slate-500">No extra links added yet.</p>}
                    {cv.links.map((item) => (
                      <div key={item.id} className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr_auto]">
                        <Input value={item.label} onChange={(e) => updateListItem("links", item.id, { label: e.target.value })} placeholder="Label" className="h-11 rounded-xl" />
                        <Input value={item.url} onChange={(e) => updateListItem("links", item.id, { url: e.target.value })} placeholder="https://example.com" className="h-11 rounded-xl" />
                        <Button type="button" variant="outline" className="h-11 rounded-xl px-3 text-red-600" onClick={() => removeListItem("links", item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <div className="rounded-[28px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_22px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Live Workspace Panel</p>
                  <h2 className="mt-1 text-lg font-black text-slate-900">Preview & ATS</h2>
                </div>
                <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setRightTab("preview")}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition ${
                      rightTab === "preview" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setRightTab("ats")}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition ${
                      rightTab === "ats" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"
                    }`}
                  >
                    <Gauge className="h-3.5 w-3.5" />
                    ATS
                  </button>
                </div>
              </div>

              <div className="mb-4 grid gap-2 sm:grid-cols-2">
                <Button type="button" onClick={runAtsScore} disabled={scoring} variant="outline" className="h-11 rounded-xl">
                  {scoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {scoring ? "Analyzing..." : "Run ATS Check"}
                </Button>
                <Button type="button" onClick={handleDownload} className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>

              {rightTab === "preview" && (
                <div>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Current Template</p>
                      <p className="text-sm font-black text-slate-900">{TEMPLATES.find((item) => item.id === template)?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Completion</p>
                      <p className="text-sm font-black text-slate-900">{completion}%</p>
                    </div>
                  </div>
                  <div className="max-h-[72vh] overflow-auto rounded-[24px] border border-slate-200 bg-slate-100 p-3 shadow-inner">
                    <div className="mx-auto w-full max-w-[794px] overflow-hidden rounded-[18px] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.14)]">
                      <ResumePreviewHtml cv={cv} templateId={template} />
                    </div>
                  </div>
                </div>
              )}

              {rightTab === "ats" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Target Job Description</Label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={5}
                      placeholder="Paste the role description here to improve keyword alignment, missing keyword detection, and relevance scoring."
                      className={`${textareaClass} mt-1`}
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-black text-slate-900">Quick ATS readiness checks</p>
                    </div>
                    <div className="grid gap-3">
                      {healthChecks.map((item) => (
                        <HealthCheckCard key={item.label} item={item} />
                      ))}
                    </div>
                  </div>

                  {scoring && (
                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Running AI analysis on your resume...
                    </div>
                  )}

                  {!scoring && atsError && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                        <span>{atsError}</span>
                      </div>
                    </div>
                  )}

                  {!scoring && !atsError && atsResult && (
                    <>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center gap-4">
                          <div className="relative h-24 w-24 flex-none rounded-full bg-slate-100">
                            <div
                              className="absolute inset-0 rounded-full"
                              style={{ background: `conic-gradient(#2563eb ${atsResult.score * 3.6}deg, #e2e8f0 0deg)` }}
                            />
                            <div className="absolute inset-3 grid place-items-center rounded-full bg-white text-lg font-black text-blue-700">
                              {atsResult.score}%
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">AI ATS Verdict</p>
                            <p className="mt-1 text-xl font-black text-slate-900">{atsResult.verdict}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{atsResult.summary}</p>
                          </div>
                        </div>
                      </div>

                      {atsResult.breakdown && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Score Breakdown</p>
                          <div className="space-y-3">
                            {Object.entries(atsResult.breakdown).map(([key, value]) => (
                              <ScoreBar key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={value} />
                            ))}
                          </div>
                        </div>
                      )}

                      {(atsResult.matchedKeywords?.length > 0 || atsResult.missingKeywords?.length > 0) && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          {atsResult.matchedKeywords?.length > 0 && (
                            <div className="mb-4">
                              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Matched Keywords</p>
                              <div className="flex flex-wrap gap-2">
                                {atsResult.matchedKeywords.map((keyword, index) => (
                                  <span key={`${keyword}-${index}`} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {atsResult.missingKeywords?.length > 0 && (
                            <div>
                              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">Missing Keywords</p>
                              <div className="flex flex-wrap gap-2">
                                {atsResult.missingKeywords.map((keyword, index) => (
                                  <span key={`${keyword}-${index}`} className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {atsResult.strengths?.length > 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Strengths</p>
                          <div className="space-y-2">
                            {atsResult.strengths.map((item, index) => (
                              <div key={`${item}-${index}`} className="flex gap-2 text-sm text-slate-700">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-600" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {atsResult.improvements?.length > 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">Actionable Fixes</p>
                          <div className="space-y-2">
                            {atsResult.improvements.map((item, index) => (
                              <div key={`${item}-${index}`} className="flex gap-2 text-sm text-slate-700">
                                <AlertCircle className="mt-0.5 h-4 w-4 flex-none text-amber-600" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {!scoring && !atsError && !atsResult && (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                      Run the ATS check to combine local formatting checks with the AI-generated review.
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default CVMaker;
