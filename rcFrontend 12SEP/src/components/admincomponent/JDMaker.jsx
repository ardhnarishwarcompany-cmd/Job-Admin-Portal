import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import {
  FileText, Wand2, Building2, Briefcase, MapPin, Wallet, ListChecks,
  Sparkles, Download, Pencil, RefreshCw, ArrowLeft, Loader2, CheckCircle2,
} from "lucide-react";
import Navbar from "../components_lite/Navbar";
import { AI_API_ENDPOINT } from "@/utils/data";
import { Field, TextInput, TextArea, SelectInput, PillGroup, SectionCard } from "../wizard/formFields";
import { useSelector } from "react-redux";

const EMPLOYMENT_TYPES = ["Full-Time", "Part-Time", "Internship", "Contract", "Freelance"];
const WORK_MODES = ["Work From Office", "Work From Home", "Hybrid", "Remote"];
const EXPERIENCE_LEVELS = ["Fresher", "0-2 Years", "2-5 Years", "5-8 Years", "8+ Years"];
const TONES = ["Professional", "Friendly & Casual", "Bold & Startup-y", "Formal & Corporate"];
const CURRENCIES = ["₹", "$", "€", "£"];

const emptyBrief = {
  companyName: "", companyTagline: "", jobTitle: "", department: "", location: "",
  building: "", floor: "", sectorLocality: "", landmark: "", googleMapsUrl: "",
  employmentType: "Full-Time", workMode: "Work From Office", experienceLevel: "0-2 Years",
  currency: "₹", salaryMin: "", salaryMax: "", skills: "",
  responsibilitiesBrief: "", requirementsBrief: "", benefitsBrief: "",
  aboutCompany: "", applicationInstructions: "", tone: "Professional",
  positions: "1", canCall: true, availableDays: "Monday–Friday", availableTime: "10:00 AM – 6:00 PM",
  whatsappNumber: "", landline: "", contactPerson: "HR", email: "", phone: "",
  companySize: "1-10", urgency: "Immediately", frequency: "One-Time Hiring",
  immediateJoining: "Yes", noticePeriod: "Immediate", ageMin: "", ageMax: "",
  languages: "English, Hindi", weeklyOff: "Sunday", docsRequired: "Aadhaar Card, PAN Card, Resume",
  genderPref: "No Preference", maritalPref: "No Preference", religionPref: "No Preference", castePref: "No Preference",
};

const CURRENCY_TO_ASCII = { "₹": "Rs. ", "€": "EUR ", "£": "GBP ", "¥": "JPY " };

// jsPDF's built-in fonts only support the WinAnsi (Latin-1) character set. Any character
// outside that range (₹, curly emoji, some smart punctuation, etc.) renders as garbage —
// this swaps known currency symbols for readable ASCII and strips anything else unsupported.
const pdfSafe = (input) => {
  if (!input) return "";
  let text = String(input);
  Object.entries(CURRENCY_TO_ASCII).forEach(([symbol, replacement]) => {
    text = text.split(symbol).join(replacement);
  });
  // Drop any remaining character outside the Latin-1 range jsPDF's standard fonts support.
  return text.replace(/[^\x00-\xFF]/g, "");
};

const JDMaker = () => {
  const { user } = useSelector((store) => store.auth);
  
  const recruiterProfile = React.useMemo(() => {
    if (!user?.recruiterProfile) return null;
    return typeof user.recruiterProfile === "string" ? JSON.parse(user.recruiterProfile) : user.recruiterProfile;
  }, [user]);
  
  const fallbackCompanyName = recruiterProfile?.company?.name || user?.extraDetails?.companyName || "";

  const [brief, setBrief] = useState({ ...emptyBrief, companyName: fallbackCompanyName });
  const [jd, setJd] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [mode, setMode] = useState("form"); // "form" | "preview"

  const set = (key, value) => setBrief((b) => ({ ...b, [key]: value }));

  const generate = async () => {
    if (!brief.jobTitle) return toast.error("Job title is required");
    setGenerating(true);
    try {
      const res = await axios.post(`${AI_API_ENDPOINT}/jd-maker`, brief);
      if (res.data.success) {
        setJd(res.data.jd);
        setMode("preview");
        toast.success("Job description generated — review and edit before publishing");
      } else {
        toast.error(res.data.message || "Generation failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not generate the job description right now");
    } finally {
      setGenerating(false);
    }
  };

  const updateJdField = (key, value) => setJd((j) => ({ ...j, [key]: value }));
  const updateJdListItem = (key, i, value) =>
    setJd((j) => { const list = [...j[key]]; list[i] = value; return { ...j, [key]: list }; });
  const addJdListItem = (key) => setJd((j) => ({ ...j, [key]: [...(j[key] || []), ""] }));
  const removeJdListItem = (key, i) => setJd((j) => ({ ...j, [key]: j[key].filter((_, idx) => idx !== i) }));

  const salaryLine =
    brief.salaryMin && brief.salaryMax
      ? `${brief.currency}${Number(brief.salaryMin).toLocaleString()} - ${brief.currency}${Number(brief.salaryMax).toLocaleString()} / year`
      : null;

  const downloadPdf = () => {
    if (!jd) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 48;
    const contentWidth = pageWidth - margin * 2;
    let y = 0;

    const brand = [37, 99, 235]; // blue-600
    const dark = [15, 23, 42];
    const gray = [100, 116, 139];

    const ensureSpace = (needed) => {
      if (y + needed > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    // Header banner
    doc.setFillColor(...brand);
    doc.rect(0, 0, pageWidth, 110, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(pdfSafe(brief.companyName) || "Our Company", margin, 42);
    if (brief.companyTagline) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(pdfSafe(brief.companyTagline), margin, 58);
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(pdfSafe(jd.jobTitle || brief.jobTitle), margin, 90);

    y = 132;
    doc.setTextColor(...gray);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const metaLine = [brief.department, brief.location, brief.employmentType, brief.workMode, brief.experienceLevel, salaryLine]
      .filter(Boolean)
      .map(pdfSafe)
      .join("   |   ");
    const metaLines = doc.splitTextToSize(metaLine, contentWidth);
    doc.text(metaLines, margin, y);
    y += metaLines.length * 13 + 14;

    if (jd.tagline) {
      doc.setTextColor(...brand);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(12);
      const t = doc.splitTextToSize(pdfSafe(jd.tagline), contentWidth);
      doc.text(t, margin, y);
      y += t.length * 15 + 10;
    }

    const heading = (text) => {
      ensureSpace(30);
      doc.setTextColor(...dark);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(pdfSafe(text), margin, y);
      y += 6;
      doc.setDrawColor(...brand);
      doc.setLineWidth(1.5);
      doc.line(margin, y, margin + 36, y);
      y += 16;
    };

    const paragraph = (text) => {
      doc.setTextColor(60, 65, 80);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      const lines = doc.splitTextToSize(pdfSafe(text), contentWidth);
      lines.forEach((line) => {
        ensureSpace(15);
        doc.text(line, margin, y);
        y += 15;
      });
      y += 6;
    };

    const bulletList = (items) => {
      doc.setTextColor(60, 65, 80);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      (items || []).filter(Boolean).forEach((item) => {
        const lines = doc.splitTextToSize(pdfSafe(item), contentWidth - 16);
        ensureSpace(lines.length * 15 + 4);
        doc.setTextColor(...brand);
        doc.text("•", margin, y);
        doc.setTextColor(60, 65, 80);
        doc.text(lines, margin + 14, y);
        y += lines.length * 15 + 4;
      });
      y += 8;
    };

    if (jd.summary) { heading("Overview"); paragraph(jd.summary); }
    if (jd.responsibilities?.length) { heading("Key Responsibilities"); bulletList(jd.responsibilities); }
    if (jd.requiredQualifications?.length) { heading("Required Qualifications"); bulletList(jd.requiredQualifications); }
    if (jd.niceToHave?.length) { heading("Nice to Have"); bulletList(jd.niceToHave); }
    if (jd.benefits?.length) { heading("Benefits & Perks"); bulletList(jd.benefits); }
    if (jd.aboutCompany) { heading(`About ${brief.companyName || "Us"}`); paragraph(jd.aboutCompany); }
    if (jd.closingNote) { heading("Ready to Apply?"); paragraph(jd.closingNote); }
    if (brief.applicationInstructions) { heading("How to Apply"); paragraph(brief.applicationInstructions); }

    // Detailed Office Location & Contact Info
    if (brief.building || brief.sectorLocality || brief.location || brief.phone || brief.email) {
      heading("Office Location & Contact Info");
      if (brief.building) paragraph(`Building/Office: ${brief.building}`);
      if (brief.floor) paragraph(`Floor/Suite: ${brief.floor}`);
      if (brief.sectorLocality) paragraph(`Sector/Locality: ${brief.sectorLocality}`);
      if (brief.landmark) paragraph(`Landmark: ${brief.landmark}`);
      if (brief.location) paragraph(`Address: ${brief.location}`);
      if (brief.googleMapsUrl) paragraph(`Maps Link: ${brief.googleMapsUrl}`);
      
      let contacts = [];
      if (brief.contactPerson) contacts.push(`Coordinator: ${brief.contactPerson}`);
      if (brief.phone) contacts.push(`Phone: +91 ${brief.phone}`);
      if (brief.whatsappNumber) contacts.push(`WhatsApp: +91 ${brief.whatsappNumber}`);
      if (brief.landline) contacts.push(`Landline: ${brief.landline}`);
      if (brief.email) contacts.push(`Email: ${brief.email}`);
      if (contacts.length) paragraph(contacts.join("   |   "));
    }

    // Hiring Preferences
    heading("Hiring Preferences & Criteria");
    let criteria = [];
    criteria.push(`Notice Period: ${brief.noticePeriod || "Immediate"}`);
    criteria.push(`Immediate Joining Required: ${brief.immediateJoining || "Yes"}`);
    if (brief.ageMin && brief.ageMax) criteria.push(`Age Limit: ${brief.ageMin} - ${brief.ageMax} Years`);
    criteria.push(`Languages: ${brief.languages || "English, Hindi"}`);
    criteria.push(`Weekly Off: ${brief.weeklyOff || "Sunday"}`);
    criteria.push(`Gender Preference: ${brief.genderPref || "No Preference"}`);
    criteria.push(`Marital Status Preference: ${brief.maritalPref || "No Preference"}`);
    if (brief.religionPref && brief.religionPref !== "No Preference") criteria.push(`Religion: ${brief.religionPref}`);
    if (brief.castePref && brief.castePref !== "No Preference") criteria.push(`Caste: ${brief.castePref}`);
    criteria.forEach(item => paragraph(item));

    // Required Documents
    if (brief.docsRequired) {
      heading("Required Documents Checklist");
      bulletList(brief.docsRequired.split(",").map(s => s.trim()).filter(Boolean));
    }

    doc.save(`${(jd.jobTitle || brief.jobTitle || "job-description").replace(/\s+/g, "-").toLowerCase()}.pdf`);
    toast.success("PDF downloaded");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700">
            <Sparkles className="h-3.5 w-3.5" /> AI Job Description Maker
          </span>
          <h1 className="font-display text-3xl font-black text-slate-900">Professional JD Maker</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
            Fill in the details, let AI draft a polished job description, review it, then download a ready-to-share PDF.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {mode === "form" ? (
            <motion.div key="form" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="flex flex-col gap-6">
              <SectionCard title="Company" icon={Building2}>
                <Field label="Company Name" required><TextInput value={brief.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="e.g. Innotech Solutions" /></Field>
                <Field label="Company Tagline"><TextInput value={brief.companyTagline} onChange={(e) => set("companyTagline", e.target.value)} placeholder="e.g. Building the future of fintech" /></Field>
                <Field label="Contact Person"><TextInput value={brief.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} placeholder="e.g. HR Manager" /></Field>
                <Field label="Email Address"><TextInput type="email" value={brief.email} onChange={(e) => set("email", e.target.value)} placeholder="hr@company.com" /></Field>
                <Field label="Phone Number"><TextInput value={brief.phone} onChange={(e) => set("phone", e.target.value)} placeholder="9876543210" /></Field>
                <Field label="WhatsApp Number"><TextInput value={brief.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value)} placeholder="9876543210" /></Field>
                <Field label="Landline Number"><TextInput value={brief.landline} onChange={(e) => set("landline", e.target.value)} placeholder="011-2345678" /></Field>
                <Field label="Company Size"><SelectInput options={["1-10", "11-25", "26-50", "51-100", "101-250", "251-500", "500-1000", "1000+"]} value={brief.companySize} onChange={(e) => set("companySize", e.target.value)} /></Field>
                <Field label="Hiring Urgency"><SelectInput options={["Immediately", "Within 3 Days", "Within 7 Days", "Within 15 Days", "Within 30 Days", "Flexible"]} value={brief.urgency} onChange={(e) => set("urgency", e.target.value)} /></Field>
                <Field label="Hiring Frequency"><SelectInput options={["One-Time Hiring", "Monthly", "Quarterly", "Yearly", "Regular Hiring", "Bulk Hiring", "Campus Hiring", "Seasonal Hiring"]} value={brief.frequency} onChange={(e) => set("frequency", e.target.value)} /></Field>
                <Field label="About the Company" className="col-span-full" hint="Optional — leave blank and AI will write something generic">
                  <TextArea value={brief.aboutCompany} onChange={(e) => set("aboutCompany", e.target.value)} placeholder="A couple of lines about your mission, culture, size..." />
                </Field>
              </SectionCard>

              <SectionCard title="Role Details" icon={Briefcase}>
                <Field label="Job Title" required><TextInput value={brief.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} placeholder="e.g. Senior Product Designer" /></Field>
                <Field label="Department"><TextInput value={brief.department} onChange={(e) => set("department", e.target.value)} placeholder="e.g. Design" /></Field>
                <Field label="Location (City, Country)"><TextInput value={brief.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Noida, India" /></Field>
                <Field label="Building / Office Name"><TextInput value={brief.building} onChange={(e) => set("building", e.target.value)} placeholder="e.g. Tower B, Technopark" /></Field>
                <Field label="Floor / Suite"><TextInput value={brief.floor} onChange={(e) => set("floor", e.target.value)} placeholder="e.g. 4th Floor" /></Field>
                <Field label="Sector / Locality"><TextInput value={brief.sectorLocality} onChange={(e) => set("sectorLocality", e.target.value)} placeholder="e.g. Sector 62" /></Field>
                <Field label="Landmark"><TextInput value={brief.landmark} onChange={(e) => set("landmark", e.target.value)} placeholder="e.g. Near Metro Station" /></Field>
                <Field label="Google Maps Link"><TextInput value={brief.googleMapsUrl} onChange={(e) => set("googleMapsUrl", e.target.value)} placeholder="https://maps.google.com/..." /></Field>
                <Field label="Open Positions"><TextInput type="number" min="1" value={brief.positions} onChange={(e) => set("positions", e.target.value)} /></Field>
                <Field label="Experience Level"><SelectInput options={EXPERIENCE_LEVELS} value={brief.experienceLevel} onChange={(e) => set("experienceLevel", e.target.value)} /></Field>
                <Field label="Employment Type"><PillGroup options={EMPLOYMENT_TYPES} value={brief.employmentType} onChange={(v) => set("employmentType", v)} /></Field>
                <Field label="Work Mode"><PillGroup options={WORK_MODES} value={brief.workMode} onChange={(v) => set("workMode", v)} /></Field>
                <Field label="Key Skills" className="col-span-full"><TextInput value={brief.skills} onChange={(e) => set("skills", e.target.value)} placeholder="Comma separated, e.g. Figma, User Research, Prototyping" /></Field>
              </SectionCard>

              <SectionCard title="Compensation" icon={Wallet}>
                <Field label="Currency"><SelectInput options={CURRENCIES} value={brief.currency} onChange={(e) => set("currency", e.target.value)} /></Field>
                <Field label="Minimum (annual)"><TextInput type="number" value={brief.salaryMin} onChange={(e) => set("salaryMin", e.target.value)} /></Field>
                <Field label="Maximum (annual)"><TextInput type="number" value={brief.salaryMax} onChange={(e) => set("salaryMax", e.target.value)} /></Field>
              </SectionCard>

              <SectionCard title="Additional Hiring Preferences" icon={ListChecks}>
                <Field label="Immediate Joining"><SelectInput options={["Yes", "No", "Within 7 Days", "Within 15 Days", "Within 30 Days"]} value={brief.immediateJoining} onChange={(e) => set("immediateJoining", e.target.value)} /></Field>
                <Field label="Notice Period Accepted"><SelectInput options={["Immediate", "15 Days", "30 Days", "60 Days", "90 Days", "Any"]} value={brief.noticePeriod} onChange={(e) => set("noticePeriod", e.target.value)} /></Field>
                <Field label="Min Age"><TextInput type="number" value={brief.ageMin} onChange={(e) => set("ageMin", e.target.value)} placeholder="18" /></Field>
                <Field label="Max Age"><TextInput type="number" value={brief.ageMax} onChange={(e) => set("ageMax", e.target.value)} placeholder="45" /></Field>
                <Field label="Languages Required"><TextInput value={brief.languages} onChange={(e) => set("languages", e.target.value)} placeholder="e.g. English, Hindi" /></Field>
                <Field label="Weekly Off"><TextInput value={brief.weeklyOff} onChange={(e) => set("weeklyOff", e.target.value)} placeholder="e.g. Sunday" /></Field>
                <Field label="Documents Required"><TextInput value={brief.docsRequired} onChange={(e) => set("docsRequired", e.target.value)} placeholder="e.g. Aadhaar Card, PAN Card, Resume" /></Field>
                <Field label="Gender Preference"><SelectInput options={["No Preference", "Male", "Female", "Any Other Gender"]} value={brief.genderPref} onChange={(e) => set("genderPref", e.target.value)} /></Field>
                <Field label="Marital Status Preference"><SelectInput options={["No Preference", "Married", "Unmarried", "Either"]} value={brief.maritalPref} onChange={(e) => set("maritalPref", e.target.value)} /></Field>
                <Field label="Religion Preference"><SelectInput options={["No Preference", "Hindu", "Muslim", "Sikh", "Christian", "Jain", "Buddhist", "Others"]} value={brief.religionPref} onChange={(e) => set("religionPref", e.target.value)} /></Field>
                <Field label="Caste Preference"><SelectInput options={["No Preference", "General", "OBC", "SC", "ST", "EWS", "Others"]} value={brief.castePref} onChange={(e) => set("castePref", e.target.value)} /></Field>
              </SectionCard>

              <SectionCard title="Your Rough Notes" icon={ListChecks} description="Optional — give AI a head start, or leave blank and let it draft from scratch">
                <Field label="Responsibilities" className="col-span-full"><TextArea rows={3} value={brief.responsibilitiesBrief} onChange={(e) => set("responsibilitiesBrief", e.target.value)} placeholder="Rough bullet points or a paragraph..." /></Field>
                <Field label="Requirements" className="col-span-full"><TextArea rows={3} value={brief.requirementsBrief} onChange={(e) => set("requirementsBrief", e.target.value)} placeholder="Must-have skills, degrees, years of experience..." /></Field>
                <Field label="Benefits & Perks" className="col-span-full"><TextArea rows={2} value={brief.benefitsBrief} onChange={(e) => set("benefitsBrief", e.target.value)} placeholder="Health insurance, remote stipend, ESOPs..." /></Field>
                <Field label="How to Apply" className="col-span-full"><TextInput value={brief.applicationInstructions} onChange={(e) => set("applicationInstructions", e.target.value)} placeholder="e.g. Apply directly through this job portal" /></Field>
                <Field label="Tone" className="col-span-full"><PillGroup options={TONES} value={brief.tone} onChange={(v) => set("tone", v)} /></Field>
              </SectionCard>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={generate}
                disabled={generating}
                className="inline-flex items-center justify-center gap-2 self-center rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 disabled:opacity-60"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                {generating ? "Generating your JD..." : "Generate Job Description"}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="preview" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button onClick={() => setMode("form")} className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-blue-600">
                  <ArrowLeft className="h-4 w-4" /> Back to form
                </button>
                <div className="flex gap-2">
                  <button onClick={generate} disabled={generating} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:border-blue-300 disabled:opacity-50">
                    {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} Regenerate
                  </button>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={downloadPdf} className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-md">
                    <Download className="h-3.5 w-3.5" /> Download as PDF
                  </motion.button>
                </div>
              </div>

              {/* Document preview — this mirrors the generated PDF layout */}
              <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="bg-gradient-to-r from-blue-700 to-cyan-600 px-8 py-7 text-white">
                  <p className="text-lg font-black font-display">{brief.companyName || "Our Company"}</p>
                  {brief.companyTagline && <p className="text-sm text-blue-100">{brief.companyTagline}</p>}
                  <input
                    value={jd.jobTitle || ""}
                    onChange={(e) => updateJdField("jobTitle", e.target.value)}
                    className="mt-3 w-full bg-transparent font-display text-2xl font-black text-white placeholder:text-blue-200 focus:outline-none"
                  />
                </div>

                <div className="px-8 py-6">
                  <div className="mb-4 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-slate-500">
                    {[brief.department, brief.location, brief.employmentType, brief.workMode, brief.experienceLevel, salaryLine].filter(Boolean).map((m, i) => (
                      <span key={i} className="rounded-full bg-slate-100 px-2.5 py-1">{m}</span>
                    ))}
                  </div>

                  {jd.tagline && (
                    <textarea
                      value={jd.tagline}
                      onChange={(e) => updateJdField("tagline", e.target.value)}
                      rows={1}
                      className="mb-4 w-full resize-none border-none bg-transparent text-base font-semibold italic text-blue-700 focus:outline-none"
                    />
                  )}

                  {jd.summary !== undefined && (
                    <PreviewSection title="Overview">
                      <TextArea rows={3} value={jd.summary} onChange={(e) => updateJdField("summary", e.target.value)} className="border-none px-0 focus:outline-none" />
                    </PreviewSection>
                  )}

                  <PreviewList title="Key Responsibilities" listKey="responsibilities" jd={jd} update={updateJdListItem} add={addJdListItem} remove={removeJdListItem} />
                  <PreviewList title="Required Qualifications" listKey="requiredQualifications" jd={jd} update={updateJdListItem} add={addJdListItem} remove={removeJdListItem} />
                  <PreviewList title="Nice to Have" listKey="niceToHave" jd={jd} update={updateJdListItem} add={addJdListItem} remove={removeJdListItem} />
                  <PreviewList title="Benefits & Perks" listKey="benefits" jd={jd} update={updateJdListItem} add={addJdListItem} remove={removeJdListItem} />

                  {jd.aboutCompany !== undefined && (
                    <PreviewSection title={`About ${brief.companyName || "Us"}`}>
                      <TextArea rows={3} value={jd.aboutCompany} onChange={(e) => updateJdField("aboutCompany", e.target.value)} className="border-none px-0 focus:outline-none" />
                    </PreviewSection>
                  )}
                  {jd.closingNote !== undefined && (
                    <PreviewSection title="Ready to Apply?">
                      <TextArea rows={2} value={jd.closingNote} onChange={(e) => updateJdField("closingNote", e.target.value)} className="border-none px-0 focus:outline-none" />
                    </PreviewSection>
                  )}
                  {brief.applicationInstructions && (
                    <PreviewSection title="How to Apply">
                      <p className="text-sm text-slate-600">{brief.applicationInstructions}</p>
                    </PreviewSection>
                  )}

                  {/* Detailed office location preview */}
                  <PreviewSection title="Office Location & Contact Info">
                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 text-sm text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {brief.building && <p><strong>Building/Office:</strong> {brief.building}</p>}
                      {brief.floor && <p><strong>Floor/Suite:</strong> {brief.floor}</p>}
                      {brief.sectorLocality && <p><strong>Sector:</strong> {brief.sectorLocality}</p>}
                      {brief.landmark && <p><strong>Landmark:</strong> {brief.landmark}</p>}
                      {brief.location && <p><strong>Location:</strong> {brief.location}</p>}
                      {brief.positions && <p><strong>Open Positions:</strong> {brief.positions}</p>}
                      {brief.contactPerson && <p><strong>Contact Coordinator:</strong> {brief.contactPerson}</p>}
                      {brief.phone && <p><strong>Contact Phone:</strong> {brief.phone}</p>}
                      {brief.whatsappNumber && <p><strong>WhatsApp:</strong> {brief.whatsappNumber}</p>}
                      {brief.landline && <p><strong>Landline:</strong> {brief.landline}</p>}
                      {brief.email && <p><strong>Email Address:</strong> {brief.email}</p>}
                    </div>
                  </PreviewSection>

                  {/* Hiring preferences preview */}
                  <PreviewSection title="Hiring Preferences & Criteria">
                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 text-sm text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400">Notice Period</span>
                        <span className="font-bold text-slate-800">{brief.noticePeriod || "Immediate"}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400">Immediate Joining</span>
                        <span className="font-bold text-slate-800">{brief.immediateJoining || "Yes"}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400">Age Range</span>
                        <span className="font-bold text-slate-800">{brief.ageMin && brief.ageMax ? `${brief.ageMin} - ${brief.ageMax} Years` : "Any"}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400">Languages Required</span>
                        <span className="font-bold text-slate-800">{brief.languages || "English, Hindi"}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400">Weekly Off</span>
                        <span className="font-bold text-slate-800">{brief.weeklyOff || "Sunday"}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400">Gender Preference</span>
                        <span className="font-bold text-slate-800">{brief.genderPref || "No Preference"}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400">Marital Preference</span>
                        <span className="font-bold text-slate-800">{brief.maritalPref || "No Preference"}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400">Religion Preference</span>
                        <span className="font-bold text-slate-800">{brief.religionPref || "No Preference"}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-400">Caste Preference</span>
                        <span className="font-bold text-slate-800">{brief.castePref || "No Preference"}</span>
                      </div>
                    </div>
                  </PreviewSection>

                  {/* Documents required preview */}
                  {brief.docsRequired && (
                    <PreviewSection title="Required Documents Checklist">
                      <div className="flex flex-wrap gap-1.5">
                        {brief.docsRequired.split(",").map(s => s.trim()).filter(Boolean).map((doc, idx) => (
                          <span key={idx} className="rounded-lg bg-rose-50 border border-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                            ✓ {doc}
                          </span>
                        ))}
                      </div>
                    </PreviewSection>
                  )}
                </div>
              </div>

              <p className="mx-auto flex max-w-3xl items-center gap-1.5 text-xs text-slate-400">
                <Pencil className="h-3.5 w-3.5" /> Everything above is editable — tweak the wording, then download when you're happy with it.
              </p>
              <p className="mx-auto flex max-w-3xl items-center gap-1.5 text-xs text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Tip: copy the finished text straight into "Post a Job" once you're ready to publish.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const PreviewSection = ({ title, children }) => (
  <div className="mb-5">
    <h3 className="mb-1.5 flex items-center gap-2 text-sm font-bold text-slate-900">
      <span className="h-4 w-1 rounded-full bg-gradient-to-b from-blue-600 to-cyan-500" /> {title}
    </h3>
    {children}
  </div>
);

const PreviewList = ({ title, listKey, jd, update, add, remove }) => {
  const items = jd[listKey];
  if (!items) return null;
  return (
    <PreviewSection title={title}>
      <ul className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
            <input
              value={item}
              onChange={(e) => update(listKey, i, e.target.value)}
              className="flex-1 border-none bg-transparent py-1 focus:outline-none"
            />
            <button onClick={() => remove(listKey, i)} className="text-slate-300 hover:text-rose-500">×</button>
          </li>
        ))}
      </ul>
      <button onClick={() => add(listKey)} className="mt-1 text-xs font-bold text-blue-600 hover:text-blue-800">+ Add line</button>
    </PreviewSection>
  );
};

export default JDMaker;
