import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components_lite/Navbar";
import { useSelector } from "react-redux";
import axios from "axios";
import { JOB_API_ENDPOINT, AI_API_ENDPOINT } from "@/utils/data";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Briefcase, MapPin, Wallet, FileText, CalendarClock, Phone, Building2,
  ListChecks, AlertTriangle, Sparkles, Wand2,
} from "lucide-react";
import useGetAllCompanies from "@/hooks/usegetAllCompanies";
import StepWizard from "../wizard/StepWizard";
import AddressAutocomplete from "../wizard/AddressAutocomplete";
import {
  Field, TextInput, TextArea, SelectInput, PillGroup, ChipMultiSelect,
  ToggleYesNo, CheckboxRow, SectionCard,
} from "../wizard/formFields";

const EXPERIENCE_LEVELS = ["Fresher", "0-6 Months", "1-2 Years", "2-4 Years", "4-6 Years", "6-10 Years", "10+ Years", "Any"];
const SALARY_TYPES = ["Fixed", "Negotiable", "Performance Based", "Commission Based"];
const BENEFITS = ["Bonus", "ESI", "PF", "Cab Facility", "Laptop", "Health Insurance", "Meals", "Flexible Hours"];
const QUALIFICATIONS = ["10th", "12th", "Diploma", "Graduate", "B.Tech", "Any"];
const SHIFT_TYPES = ["Day", "Night", "Rotational", "Flexible"];
const INTERVIEW_MODES = ["Walk-In", "Face-to-Face", "Telephonic", "Video", "Online"];
const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];
const URGENCY = ["Immediately", "Within 3 Days", "Within 7 Days", "Within 15 Days", "Flexible"];
const HIRING_FREQ = ["One-Time", "Monthly", "Bulk Hiring", "Campus Hiring"];
const NOTICE_PERIODS = ["Immediate", "15 Days", "30 Days", "60 Days", "90 Days", "Any"];
const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Bengali", "Marathi", "Custom"];
const WORK_MODES = ["Work From Office", "Work From Home", "Hybrid", "Remote"];
const JOB_TYPES = ["Full-Time", "Part-Time", "Contract", "Internship", "Freelance"];
const WEEKLY_OFFS = ["Sunday", "Saturday-Sunday", "Rotational", "Custom"];
const DOCS_REQUIRED = ["Aadhaar", "PAN", "Resume", "Payslip", "Experience Letter"];
const AI_FEATURES = [
  "Auto Translation", "AI Candidate Match Score", "AI Resume Screening",
  "AI Interview Scheduling", "One-Click Job Reposting", "WhatsApp Job Sharing",
];

const emptyJob = {
  location: { country: "India", state: "Maharashtra", city: "Pune", area: "Kharadi", pinCode: "411014", remote: false, hybrid: true },
  position: "5", experience: "2-4 Years", salaryMin: "600000", salaryMax: "1200000", salaryType: "Fixed", benefits: ["Bonus", "Health Insurance"],
  skills: "React, Node.js, Express, MongoDB", qualification: "B.Tech", freshersEligible: false, shiftType: "Day", workingTime: "9 AM - 6 PM",
  interview: { mode: "Video", dateTime: "2026-10-15T10:00", venue: "Google Meet" },
  canCall: true, availableDays: "Mon-Fri", availableTime: "10:00 AM - 6:00 PM",
  companyContact: { name: "Test Contact", website: "https://example.com", contactPerson: "John Doe", email: "johndoe@example.com", phone: "9876543210", allowWhatsapp: true, size: "51-200", urgency: "Immediately", frequency: "Monthly" },
  immediateJoining: "Yes", noticePeriod: "30 Days", ageMin: "22", ageMax: "35", languages: ["English", "Hindi"], workMode: "Hybrid", employmentType: "Full-Time", weeklyOff: "Saturday-Sunday",
  docsRequired: ["Aadhaar", "PAN", "Resume"],
  candidatePreference: { enabled: true, gender: "No Preference", maritalStatus: "No Preference" },
  aiFeatures: ["AI Resume Screening"],
};

const PostJob = () => {
  useGetAllCompanies();
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const { companies } = useSelector((store) => store.company);

  const recruiterProfile = useMemo(() => {
    if (!user?.recruiterProfile) return null;
    return typeof user.recruiterProfile === "string" ? JSON.parse(user.recruiterProfile) : user.recruiterProfile;
  }, [user]);

  const fallbackCompanyName = recruiterProfile?.company?.name || user?.extraDetails?.companyName || "";

  const [core, setCore] = useState({ 
    title: "Senior Full Stack Developer", 
    description: "We are looking for an experienced Full Stack Developer to join our dynamic team. You will be responsible for developing scalable web applications using the MERN stack. Strong problem-solving skills and a passion for clean code are required.", 
    requirements: "At least 3 years of experience with React and Node.js. Knowledge of AWS is a plus.", 
    companyId: "",
    companyName: fallbackCompanyName 
  });

  // Pre-select company if it matches the profile
  React.useEffect(() => {
    if (companies?.length > 0 && fallbackCompanyName && !core.companyId) {
      const match = companies.find((c) => c.name === fallbackCompanyName);
      if (match) {
        setCore((prev) => ({ ...prev, companyId: match._id, companyName: match.name }));
      }
    }
  }, [companies, fallbackCompanyName, core.companyId]);
  const [job, setJob] = useState(emptyJob);
  const [submitting, setSubmitting] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [generatingSalary, setGeneratingSalary] = useState(false);
  const [jdFile, setJdFile] = useState(null);
  
  const [hasDraft, setHasDraft] = useState(false);

  React.useEffect(() => {
    if (localStorage.getItem("postJobDraft")) setHasDraft(true);
  }, []);

  const saveDraft = () => {
    localStorage.setItem("postJobDraft", JSON.stringify({ core, job }));
    setHasDraft(true);
    toast.success("Draft saved successfully!");
  };

  const restoreDraft = () => {
    try {
      const draftStr = localStorage.getItem("postJobDraft");
      if (draftStr) {
        const { core: draftCore, job: draftJob } = JSON.parse(draftStr);
        setCore(draftCore);
        setJob(draftJob);
        setHasDraft(false);
        toast.success("Draft restored!");
      }
    } catch (e) {
      console.error("Failed to restore draft", e);
    }
  };

  const set = (section, key, value) => setJob((j) => ({ ...j, [section]: { ...j[section], [key]: value } }));
  const setTop = (key, value) => setJob((j) => ({ ...j, [key]: value }));

  const generateDescription = async () => {
    if (!core.title) return toast.error("Enter a job title first");
    setGeneratingDesc(true);
    try {
      const res = await axios.post(`${AI_API_ENDPOINT}/job-description`, {
        title: core.title, skills: job.skills, experience: job.experience, jobType: job.workMode,
      });
      if (res.data.success) {
        setCore((c) => ({ ...c, description: res.data.description }));
        toast.success("Description generated — feel free to tweak it");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "AI generation failed");
    } finally {
      setGeneratingDesc(false);
    }
  };

  const salaryValid = useMemo(() => {
    if (!job.salaryMin || !job.salaryMax) return true;
    return Number(job.salaryMin) <= Number(job.salaryMax);
  }, [job.salaryMin, job.salaryMax]);

  const emailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");

  const validateStep = (stepIndex) => {
    if (stepIndex === 0) {
      if (!core.title.trim()) return "Job title is required";
      if (!core.companyId && !core.companyName?.trim()) return "Company Name is required";
      if (!job.position || Number(job.position) < 1) return "Number of open positions must be at least 1";
      if (!job.experience) return "Please select the required experience level";
      if (!job.qualification) return "Please select the minimum qualification";
      if (!core.description.trim() || core.description.trim().length < 30) return "Job description should be at least 30 characters";
      if (!job.skills.trim()) return "Please list at least one required skill";
      return true;
    }
    if (stepIndex === 1) {
      if (!job.location.city.trim()) return "City is required";
      if (!job.location.state.trim()) return "State is required";
      if (!job.salaryMin || Number(job.salaryMin) <= 0) return "Minimum salary is required";
      if (!job.salaryMax || Number(job.salaryMax) <= 0) return "Maximum salary is required";
      if (!salaryValid) return "Minimum salary cannot be greater than maximum salary";
      return true;
    }
    if (stepIndex === 3) {
      if (!job.companyContact.contactPerson.trim()) return "Contact person / designation is required";
      if (!emailValid(job.companyContact.email)) return "Please enter a valid official email";
      if (!job.companyContact.phone.trim() || job.companyContact.phone.replace(/\D/g, "").length < 10) return "Please enter a valid 10-digit contact number";
      return true;
    }
    return true;
  };

  const submitHandler = async () => {
    if (!core.title || !core.description || (!core.companyId && !core.companyName)) {
      toast.error("Please fill job title, description, and company name");
      return;
    }
    if (!salaryValid) {
      toast.error("Minimum salary cannot be greater than maximum salary");
      return;
    }
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("title", core.title);
      formData.append("description", core.description);
      formData.append("requirements", core.requirements || job.skills);
      formData.append("salary", job.salaryMax || job.salaryMin || "0");
      formData.append("location", [job.location.area, job.location.city, job.location.state].filter(Boolean).join(", ") || "Remote");
      formData.append("jobType", job.employmentType || "Full-Time");
      formData.append("experience", String(job.experience).match(/\d+/) ? String(job.experience).match(/\d+/)[0] : "0");
      formData.append("position", job.position || "1");
      formData.append("companyId", core.companyId || "");
      formData.append("companyName", core.companyName || "");
      formData.append("jobDetails", JSON.stringify(job));
      if (jdFile) {
        formData.append("file", jdFile);
      }

      const res = await axios.post(`${JOB_API_ENDPOINT}/post`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      if (res.data.success) {
        localStorage.removeItem("postJobDraft");
        toast.success(res.data.message);
        navigate("/recruiter/jobs");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    {
      title: "Job Details",
      subtitle: "The essentials candidates will see first",
      content: (
        <SectionCard title="Job Information" icon={Briefcase}>
          <Field label="Job Title" required className="sm:col-span-2">
            <TextInput value={core.title} onChange={(e) => setCore({ ...core, title: e.target.value })} placeholder="e.g. Senior React Developer" />
          </Field>
          <Field label="Company" required>
            {companies?.length > 0 ? (
              <SelectInput
                options={(companies || []).map((c) => c.name)}
                placeholder="Select a company"
                value={companies?.find((c) => c._id === core.companyId)?.name || ""}
                onChange={(e) => { 
                  const c = companies.find((c) => c.name === e.target.value); 
                  setCore({ ...core, companyId: c?._id || "", companyName: c?.name || e.target.value }); 
                }}
              />
            ) : (
              <TextInput 
                value={core.companyName} 
                onChange={(e) => setCore({ ...core, companyName: e.target.value, companyId: "" })} 
                placeholder="Enter Company Name" 
                readOnly={!!fallbackCompanyName}
                className={fallbackCompanyName ? "bg-slate-100 cursor-not-allowed" : ""}
              />
            )}
          </Field>
          <Field label="Number of Open Positions" required>
            <TextInput type="number" min="1" value={job.position} onChange={(e) => setTop("position", e.target.value)} />
          </Field>
          <Field label="Experience Required" required>
            <SelectInput options={EXPERIENCE_LEVELS} value={job.experience} onChange={(e) => setTop("experience", e.target.value)} />
          </Field>
          <Field label="Minimum Qualification" required>
            <SelectInput options={QUALIFICATIONS} value={job.qualification} onChange={(e) => setTop("qualification", e.target.value)} />
          </Field>
          <Field label="Job Description" required className="col-span-full">
            <div className="mb-1 flex justify-end">
              <button type="button" onClick={generateDescription} disabled={generatingDesc} className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 disabled:opacity-50">
                <Wand2 className="h-3.5 w-3.5" /> {generatingDesc ? "Generating..." : "Generate with AI"}
              </button>
            </div>
            <TextArea rows={5} value={core.description} onChange={(e) => setCore({ ...core, description: e.target.value })} placeholder="Responsibilities, team info, growth path..." />
            <p className={`mt-1 text-right text-[11px] font-semibold ${core.description.trim().length > 0 && core.description.trim().length < 30 ? "text-rose-500" : "text-slate-400"}`}>
              {core.description.trim().length} characters {core.description.trim().length < 30 ? "(minimum 30)" : ""}
            </p>
          </Field>
          <Field label="Required Skills" required className="col-span-full">
            <TextInput value={job.skills} onChange={(e) => setTop("skills", e.target.value)} placeholder="Comma separated, e.g. React, Node.js, SQL" />
          </Field>
          <Field label="Freshers Eligible?"><ToggleYesNo value={job.freshersEligible} onChange={(v) => setTop("freshersEligible", v)} /></Field>
          <Field label="Shift Type"><PillGroup options={SHIFT_TYPES} value={job.shiftType} onChange={(v) => setTop("shiftType", v)} /></Field>
          <Field label="Working Time"><TextInput value={job.workingTime} onChange={(e) => setTop("workingTime", e.target.value)} placeholder="09:00 AM - 06:00 PM" /></Field>
          <Field label="Official JD Document (Optional)" className="col-span-full">
            <div className="flex items-center gap-4">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-4 text-slate-500 hover:border-blue-400 hover:bg-blue-50 transition-all w-full">
                <FileText className="h-5 w-5" />
                <span className="font-semibold">{jdFile ? jdFile.name : "Upload PDF / DOCX"}</span>
                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setJdFile(e.target.files[0])} />
              </label>
              {jdFile && (
                <button type="button" onClick={() => setJdFile(null)} className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-rose-600 font-bold hover:bg-rose-100 transition-colors">
                  Clear
                </button>
              )}
            </div>
          </Field>
        </SectionCard>
      ),
    },
    {
      title: "Location & Salary",
      subtitle: "Where the role is based and what it pays",
      content: (
        <>
          <SectionCard title="Job Location" icon={MapPin} description="Powered by Google Maps — type the street address to auto-fill the rest">
            <Field label="Country" required><TextInput value={job.location.country} onChange={(e) => set("location", "country", e.target.value)} /></Field>
            <Field label="State" required><TextInput value={job.location.state} onChange={(e) => set("location", "state", e.target.value)} /></Field>
            <Field label="City" required><TextInput value={job.location.city} onChange={(e) => set("location", "city", e.target.value)} /></Field>
            <Field label="Area / Sector" hint="Start typing — city/state/pin auto-fill from Google Maps">
              <AddressAutocomplete
                value={job.location.area}
                onChange={(v) => set("location", "area", v)}
                onPlaceSelect={(p) => setJob((prev) => ({
                  ...prev,
                  location: { ...prev.location, city: p.city || prev.location.city, state: p.state || prev.location.state, country: p.country || prev.location.country, pinCode: p.pinCode || prev.location.pinCode },
                }))}
              />
            </Field>
            <Field label="PIN Code"><TextInput value={job.location.pinCode} onChange={(e) => set("location", "pinCode", e.target.value)} /></Field>
          </SectionCard>
          <SectionCard title="Monthly In-Hand Salary" icon={Wallet}>
            <div className="col-span-full -mb-2 flex justify-end">
              <button
                type="button"
                disabled={generatingSalary}
                onClick={async () => {
                  if (!core.title) return toast.error("Enter a job title first");
                  setGeneratingSalary(true);
                  try {
                    const res = await axios.post(`${AI_API_ENDPOINT}/salary-recommendation`, {
                      title: core.title, experience: job.experience, location: job.location.city,
                    });
                    if (res.data.success && res.data.min) {
                      setTop("salaryMin", res.data.min);
                      setTop("salaryMax", res.data.max);
                      toast.success(res.data.note || "Suggested range applied");
                    } else {
                      toast.info("Couldn't parse a suggestion — try again");
                    }
                  } catch (err) {
                    toast.error(err?.response?.data?.message || "AI suggestion failed");
                  } finally {
                    setGeneratingSalary(false);
                  }
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                <Wand2 className="h-3.5 w-3.5" /> {generatingSalary ? "Thinking..." : "Suggest Salary with AI"}
              </button>
            </div>
            <Field label="Minimum Salary (₹)" required><TextInput type="number" min="0" value={job.salaryMin} onChange={(e) => setTop("salaryMin", e.target.value)} /></Field>
            <Field label="Maximum Salary (₹)" required hint={!salaryValid ? "Max must be ≥ Min" : undefined}><TextInput type="number" min="0" value={job.salaryMax} onChange={(e) => setTop("salaryMax", e.target.value)} className={!salaryValid ? "border-rose-400" : ""} /></Field>
            <Field label="Salary Type"><PillGroup options={SALARY_TYPES} value={job.salaryType} onChange={(v) => setTop("salaryType", v)} /></Field>
            <Field label="Additional Benefits" className="col-span-full"><ChipMultiSelect options={BENEFITS} value={job.benefits} onChange={(v) => setTop("benefits", v)} /></Field>
          </SectionCard>
        </>
      ),
    },
    {
      title: "Interview & Contact",
      subtitle: "How and when candidates get interviewed",
      content: (
        <SectionCard title="Interview & Contact Details" icon={CalendarClock}>
          <Field label="Interview Mode"><PillGroup options={INTERVIEW_MODES} value={job.interview.mode} onChange={(v) => set("interview", "mode", v)} /></Field>
          <Field label="Interview Date & Time"><TextInput type="datetime-local" value={job.interview.dateTime} onChange={(e) => set("interview", "dateTime", e.target.value)} /></Field>
          <Field label="Venue / Instructions" className="col-span-full"><TextArea value={job.interview.venue} onChange={(e) => set("interview", "venue", e.target.value)} /></Field>
          <Field label="Can Candidates Call?"><ToggleYesNo value={job.canCall} onChange={(v) => setTop("canCall", v)} /></Field>
          {job.canCall && (
            <>
              <Field label="Available Days"><SelectInput options={["Mon-Fri", "Mon-Sat", "All Days", "Custom"]} value={job.availableDays} onChange={(e) => setTop("availableDays", e.target.value)} /></Field>
              <Field label="Available Time"><TextInput value={job.availableTime} onChange={(e) => setTop("availableTime", e.target.value)} /></Field>
            </>
          )}
        </SectionCard>
      ),
    },
    {
      title: "Company Info",
      subtitle: "Pre-filled from your account — feel free to edit",
      content: (
        <SectionCard title="Company Information" icon={Building2}>
          <Field label="Company Website"><TextInput value={job.companyContact.website} onChange={(e) => set("companyContact", "website", e.target.value)} placeholder="https://" /></Field>
          <Field label="Contact Person / Designation" required><TextInput value={job.companyContact.contactPerson} onChange={(e) => set("companyContact", "contactPerson", e.target.value)} placeholder="e.g. HR Manager" /></Field>
          <Field label="Official Email" required><TextInput type="email" value={job.companyContact.email} onChange={(e) => set("companyContact", "email", e.target.value)} /></Field>
          <Field label="Contact Number" required>
            <TextInput type="tel" value={job.companyContact.phone} onChange={(e) => set("companyContact", "phone", e.target.value)} />
            <CheckboxRow checked={job.companyContact.allowWhatsapp} label="Allow WhatsApp contact" onChange={(v) => set("companyContact", "allowWhatsapp", v)} />
          </Field>
          <Field label="Company Size"><SelectInput options={COMPANY_SIZES} value={job.companyContact.size} onChange={(e) => set("companyContact", "size", e.target.value)} /></Field>
          <Field label="Hiring Urgency"><SelectInput options={URGENCY} value={job.companyContact.urgency} onChange={(e) => set("companyContact", "urgency", e.target.value)} /></Field>
          <Field label="Hiring Frequency"><SelectInput options={HIRING_FREQ} value={job.companyContact.frequency} onChange={(e) => set("companyContact", "frequency", e.target.value)} /></Field>
        </SectionCard>
      ),
    },
    {
      title: "Hiring Requirements",
      subtitle: "Additional requirements for this role",
      content: (
        <SectionCard title="Additional Hiring Requirements" icon={ListChecks}>
          <Field label="Immediate Joining Required?"><SelectInput options={["Yes", "No", "Within 7 Days", "Within 15 Days", "Within 30 Days"]} value={job.immediateJoining} onChange={(e) => setTop("immediateJoining", e.target.value)} /></Field>
          <Field label="Notice Period Accepted"><SelectInput options={NOTICE_PERIODS} value={job.noticePeriod} onChange={(e) => setTop("noticePeriod", e.target.value)} /></Field>
          <Field label="Age Limit">
            <div className="flex gap-2">
              <TextInput type="number" min="14" max="80" placeholder="Min age" value={job.ageMin} onChange={(e) => setTop("ageMin", e.target.value)} />
              <TextInput type="number" min="14" max="80" placeholder="Max age" value={job.ageMax} onChange={(e) => setTop("ageMax", e.target.value)} />
            </div>
          </Field>
          <Field label="Job Type"><PillGroup options={JOB_TYPES} value={job.employmentType} onChange={(v) => setTop("employmentType", v)} /></Field>
          <Field label="Work Mode"><PillGroup options={WORK_MODES} value={job.workMode} onChange={(v) => setTop("workMode", v)} /></Field>
          <Field label="Weekly Off"><SelectInput options={WEEKLY_OFFS} value={job.weeklyOff} onChange={(e) => setTop("weeklyOff", e.target.value)} /></Field>
          <Field label="Languages Required" className="col-span-full"><ChipMultiSelect options={LANGUAGES} value={job.languages} onChange={(v) => setTop("languages", v)} /></Field>
          <Field label="Documents Required from Candidate" className="col-span-full"><ChipMultiSelect options={DOCS_REQUIRED} value={job.docsRequired} onChange={(v) => setTop("docsRequired", v)} /></Field>
        </SectionCard>
      ),
    },
    {
      title: "Preferences & AI Tools",
      subtitle: "Optional candidate preference & smart hiring features",
      content: (
        <>
          <SectionCard title="Candidate Preference" icon={AlertTriangle}>
            <div className="col-span-full rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <strong>Legal compliance notice:</strong> demographic hiring preferences are illegal or restricted in most jurisdictions
              and can expose your company to discrimination claims. This section defaults to "No Preference" and should stay disabled
              unless your legal team has confirmed it's permitted in your region.
            </div>
            <Field label="Enable this section" className="col-span-full">
              <CheckboxRow checked={job.candidatePreference.enabled} label="I have legal approval to set candidate preferences" onChange={(v) => set("candidatePreference", "enabled", v)} />
            </Field>
            {job.candidatePreference.enabled && (
              <>
                <Field label="Gender Preference"><SelectInput options={["No Preference", "Male", "Female", "Any Other"]} value={job.candidatePreference.gender} onChange={(e) => set("candidatePreference", "gender", e.target.value)} /></Field>
                <Field label="Marital Status Preference"><SelectInput options={["No Preference", "Married", "Unmarried"]} value={job.candidatePreference.maritalStatus} onChange={(e) => set("candidatePreference", "maritalStatus", e.target.value)} /></Field>
              </>
            )}
          </SectionCard>

          <SectionCard title="AI Smart Hiring Features" icon={Sparkles} description="Job Description Generator & Salary Recommendation are live above — the rest are opt-ins for our upcoming AI rollout">
            <Field label="Select the AI tools to enable for this posting" className="col-span-full">
              <ChipMultiSelect options={AI_FEATURES} value={job.aiFeatures} onChange={(v) => setTop("aiFeatures", v)} />
            </Field>
          </SectionCard>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700">
            <Briefcase className="h-3.5 w-3.5" /> Post a New Job
          </span>
          <h1 className="font-display text-3xl font-black text-slate-900">Create a Job Posting</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">Fill in the details below — candidates will see this within minutes of publishing.</p>
          <a href="/recruiter/jd-maker" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800">
            <Sparkles className="h-3.5 w-3.5" /> Prefer AI to draft the full JD as a PDF first? Try the JD Maker →
          </a>
          <div className="mt-4 flex justify-center gap-3">
            <button type="button" onClick={saveDraft} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
              Save Draft
            </button>
            {hasDraft && (
              <button type="button" onClick={restoreDraft} className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100 px-4 py-2 text-xs font-bold text-amber-700 hover:bg-amber-200 shadow-sm">
                <Sparkles className="h-3.5 w-3.5" /> Restore Saved Draft
              </button>
            )}
          </div>
        </motion.div>
        <StepWizard steps={steps} onSubmit={submitHandler} submitting={submitting} submitLabel="Publish Job" validateStep={validateStep} />
      </div>
    </div>
  );
};

export default PostJob;
