import React, { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, FileText, Lightbulb, UploadCloud } from "lucide-react";
import Navbar from "./Navbar";

const defaultKeywords = [
  "react",
  "node",
  "javascript",
  "api",
  "mongodb",
  "sql",
  "redux",
  "leadership",
  "communication",
  "analytics",
  "testing",
  "deployment",
];

const sectionChecks = [
  { key: "summary", label: "Professional summary", words: ["summary", "profile", "objective"] },
  { key: "experience", label: "Work experience", words: ["experience", "employment", "internship", "project"] },
  { key: "skills", label: "Skills section", words: ["skills", "technical skills", "tools"] },
  { key: "education", label: "Education", words: ["education", "degree", "university", "college"] },
  { key: "contact", label: "Contact details", words: ["email", "@", "phone", "+91", "linkedin"] },
];

const ResumeScanner = () => {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileNotice, setFileNotice] = useState("");

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (["txt", "md", "csv"].includes(extension)) {
      const text = await file.text();
      setResumeText(text);
      setFileNotice("Resume text read successfully. Score is based on uploaded content.");
      return;
    }

    setFileNotice("PDF/DOC upload accepted. Browser preview cannot extract all text here, so paste resume text below for best ATS score.");
  };

  const analysis = useMemo(() => {
    const text = resumeText.toLowerCase();
    const jd = jobDescription.toLowerCase();
    const words = text.match(/[a-z0-9+#.]+/g) || [];
    const uniqueWords = new Set(words);
    const jdWords = jd.match(/[a-z0-9+#.]{4,}/g) || [];
    const jdKeywords = [...new Set(jdWords)].slice(0, 24);
    const targetKeywords = jdKeywords.length ? jdKeywords : defaultKeywords;
    const matchedKeywords = targetKeywords.filter((keyword) => text.includes(keyword.toLowerCase()));
    const missingKeywords = targetKeywords.filter((keyword) => !text.includes(keyword.toLowerCase())).slice(0, 10);
    const foundSections = sectionChecks.filter((section) => section.words.some((word) => text.includes(word)));
    const hasNumbers = /\d+%|\d+\+|\d+x|increased|reduced|improved|optimized/.test(text);
    const hasLinks = /linkedin|github|portfolio|https?:\/\//.test(text);
    const lengthScore = words.length >= 250 && words.length <= 900 ? 18 : words.length >= 120 ? 12 : 6;
    const keywordScore = Math.round((matchedKeywords.length / Math.max(targetKeywords.length, 1)) * 32);
    const sectionScore = foundSections.length * 7;
    const impactScore = hasNumbers ? 10 : 3;
    const linkScore = hasLinks ? 5 : 1;
    const score = Math.min(98, Math.max(12, lengthScore + keywordScore + sectionScore + impactScore + linkScore));

    const improvements = [];
    if (missingKeywords.length) improvements.push(`Add relevant keywords: ${missingKeywords.slice(0, 6).join(", ")}.`);
    sectionChecks
      .filter((section) => !foundSections.some((found) => found.key === section.key))
      .forEach((section) => improvements.push(`Add a clear ${section.label.toLowerCase()} section.`));
    if (!hasNumbers) improvements.push("Add measurable achievements like percentages, revenue, time saved, users handled, or hiring volume.");
    if (words.length < 250) improvements.push("Resume content looks short. Add project details, responsibilities, tools, and outcomes.");
    if (words.length > 900) improvements.push("Resume is lengthy. Keep the strongest achievements and remove repeated responsibilities.");
    if (!hasLinks) improvements.push("Add LinkedIn, GitHub, portfolio, or professional profile links.");
    if (uniqueWords.size < 80 && words.length > 120) improvements.push("Use more specific action verbs and domain terms to avoid repetitive wording.");

    return {
      score,
      words: words.length,
      matchedKeywords,
      missingKeywords,
      foundSections,
      improvements: improvements.slice(0, 8),
      verdict: score >= 80 ? "Strong ATS fit" : score >= 60 ? "Good, needs polish" : "Needs improvement",
    };
  }, [resumeText, jobDescription]);

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-teal-100 px-3 py-1 text-sm font-bold text-teal-800">AI Resume Scanner</p>
            <h1 className="text-3xl font-black text-slate-950 sm:text-5xl">Upload resume and get ATS score instantly</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Resume text, JD keywords, sections, measurable impact, and profile links are checked locally in the browser to show score and improvements.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-500">ATS Score</p>
                <h2 className="text-5xl font-black text-slate-950">{analysis.score}</h2>
              </div>
              <div className="relative h-28 w-28 rounded-full bg-slate-100">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: `conic-gradient(#0f766e ${analysis.score * 3.6}deg, #e2e8f0 0deg)` }}
                />
                <div className="absolute inset-3 grid place-items-center rounded-full bg-white text-sm font-black text-teal-700">{analysis.score}%</div>
              </div>
            </div>
            <p className="mt-4 rounded-md bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">{analysis.verdict}</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-teal-300 bg-white px-6 py-8 text-center shadow-sm hover:border-teal-500 hover:bg-teal-50">
              <UploadCloud className="mb-3 h-10 w-10 text-teal-700" />
              <span className="text-base font-black text-slate-900">Upload resume</span>
              <span className="mt-1 text-sm text-slate-500">TXT works best. PDF/DOC can be selected, then paste text for accurate scan.</span>
              <input type="file" accept=".txt,.md,.csv,.pdf,.doc,.docx" onChange={handleFileUpload} className="sr-only" />
            </label>

            {(fileName || fileNotice) && (
              <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
                <p className="font-bold">{fileName || "Resume selected"}</p>
                <p className="mt-1 text-slate-500">{fileNotice}</p>
              </div>
            )}

            <textarea
              value={resumeText}
              onChange={(event) => setResumeText(event.target.value)}
              rows={11}
              placeholder="Paste resume text here..."
              className="w-full resize-none rounded-lg border border-slate-300 p-4 text-sm shadow-sm"
            />

            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              rows={7}
              placeholder="Paste job description for better keyword matching..."
              className="w-full resize-none rounded-lg border border-slate-300 p-4 text-sm shadow-sm"
            />
          </div>

          <div className="grid gap-4">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-950">
                <CheckCircle2 className="h-5 w-5 text-teal-700" />
                Matched signals
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-500">Words scanned</p>
                  <p className="text-2xl font-black text-slate-900">{analysis.words}</p>
                </div>
                <div className="rounded-md bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-500">Sections found</p>
                  <p className="text-2xl font-black text-slate-900">{analysis.foundSections.length}/5</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {analysis.matchedKeywords.slice(0, 14).map((keyword) => (
                  <span key={keyword} className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-800">
                    {keyword}
                  </span>
                ))}
                {!analysis.matchedKeywords.length && <p className="text-sm text-slate-500">Paste resume text to see matched keywords.</p>}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-950">
                <Lightbulb className="h-5 w-5 text-amber-600" />
                Improvements needed
              </h2>
              <div className="space-y-3">
                {analysis.improvements.map((item) => (
                  <div key={item} className="flex gap-3 rounded-md bg-amber-50 p-3 text-sm font-medium text-slate-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-none text-amber-700" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-xl font-black">
                <FileText className="h-5 w-5 text-teal-300" />
                Quick ATS rules
              </h2>
              <div className="grid gap-2 text-sm text-slate-200 sm:grid-cols-2">
                <p>Use standard headings.</p>
                <p>Add JD keywords naturally.</p>
                <p>Prefer simple formatting.</p>
                <p>Show measurable impact.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ResumeScanner;
