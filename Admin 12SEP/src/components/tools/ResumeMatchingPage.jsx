import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Navbar from "../components_lite/Navbar";
import {
  FileSearch, CheckCircle2, XCircle, AlertCircle,
  RefreshCw, Target, TrendingUp, Lightbulb, Star,
  ThumbsUp, Upload, FileText, X, Eye, EyeOff
} from "lucide-react";
import { toast } from "sonner";
import { AI_API_ENDPOINT } from "../../utils/data";

// ─── Send PDF to backend for text extraction ──────────────────────────────────
const parsePdfOnServer = async (file) => {
  const formData = new FormData();
  formData.append("pdf", file);
  const { data } = await axios.post(`${AI_API_ENDPOINT}/parse-pdf`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  if (!data.success) throw new Error(data.message);
  return { text: data.text, pages: data.pages };
};

// ─── Circular score ring ──────────────────────────────────────────────────────
const CircleProgress = ({ value }) => {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = value >= 75 ? "#10b981" : value >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <motion.circle
          cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.6, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      <div className="absolute text-center">
        <motion.p initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}
          className="text-4xl font-black text-white">{value}%</motion.p>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">Match Score</p>
      </div>
    </div>
  );
};

// ─── Recommendation badge ─────────────────────────────────────────────────────
const RecommendationBadge = ({ rec }) => {
  const cfg = {
    Shortlist: { bg: "bg-emerald-500/20", border: "border-emerald-500/40", text: "text-emerald-400", icon: "✅" },
    Consider:  { bg: "bg-amber-500/20",   border: "border-amber-500/40",   text: "text-amber-400",   icon: "⚠️" },
    Reject:    { bg: "bg-rose-500/20",    border: "border-rose-500/40",    text: "text-rose-400",    icon: "❌" },
  };
  const c = cfg[rec] || cfg.Consider;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-black border ${c.bg} ${c.border} ${c.text}`}>
      {c.icon} {rec}
    </span>
  );
};

// ─── Skill chip ───────────────────────────────────────────────────────────────
const Chip = ({ label, color }) => {
  const colors = {
    green:  "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
    red:    "bg-rose-500/15    border-rose-500/30    text-rose-300",
    amber:  "bg-amber-500/15   border-amber-500/30   text-amber-300",
    blue:   "bg-blue-500/15    border-blue-500/30    text-blue-300",
    purple: "bg-purple-500/15  border-purple-500/30  text-purple-300",
  };
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${colors[color] || colors.blue}`}>
      {label}
    </span>
  );
};

// ─── Result card wrapper ──────────────────────────────────────────────────────
const Card = ({ delay = 0, children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 ${className}`}
  >
    {children}
  </motion.div>
);

// ─── PDF Drop Zone ────────────────────────────────────────────────────────────
const PdfDropZone = ({
  label, accentColor, file, text, pages,
  extracting, onFile, onClear, showText, onToggleText
}) => {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type === "application/pdf") onFile(f);
    else toast.error("Please drop a PDF file.");
  }, [onFile]);

  const accentTextClass  = accentColor === "blue" ? "text-blue-400"  : "text-cyan-400";
  const accentBorderClass = accentColor === "blue" ? "border-blue-500/30 bg-blue-500/10" : "border-cyan-500/30 bg-cyan-500/10";
  const accentBtnClass   = accentColor === "blue" ? "bg-blue-600 hover:bg-blue-700" : "bg-cyan-600 hover:bg-cyan-700";
  const draggingClass    = accentColor === "blue" ? "border-blue-400 bg-blue-500/5" : "border-cyan-400 bg-cyan-500/5";

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 flex flex-col gap-4">
      <label className={`block text-sm font-black ${accentTextClass} uppercase tracking-wider`}>{label}</label>

      {!file ? (
        // Drop zone
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current.click()}
          className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-all cursor-pointer min-h-[200px]
            ${dragging ? `${draggingClass} scale-[1.01]` : "border-white/20 hover:border-white/40 bg-white/3 hover:bg-white/5"}`}
        >
          <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files[0]; if (f) onFile(f); e.target.value = ""; }} />
          <motion.div animate={{ y: dragging ? -5 : 0 }} transition={{ type: "spring", stiffness: 300 }}>
            <Upload className={`h-10 w-10 ${accentTextClass} opacity-70`} />
          </motion.div>
          <div className="text-center px-6">
            <p className="text-sm font-semibold text-slate-300">Drag & drop a PDF here</p>
            <p className="text-xs text-slate-500 mt-1">or click to browse your files</p>
          </div>
          <button type="button" className={`rounded-xl ${accentBtnClass} px-5 py-2 text-xs font-bold text-white transition-all`}>
            Choose PDF
          </button>
        </div>
      ) : (
        // File info
        <div className="space-y-3">
          <div className={`flex items-center gap-3 rounded-xl border ${accentBorderClass} px-4 py-3`}>
            <FileText className={`h-5 w-5 shrink-0 ${accentTextClass}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{file.name}</p>
              <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB {pages ? `· ${pages} page${pages > 1 ? "s" : ""}` : ""}</p>
            </div>
            {extracting
              ? <RefreshCw className="h-4 w-4 text-slate-400 animate-spin shrink-0" />
              : (
                <div className="flex items-center gap-1">
                  {text && (
                    <button onClick={onToggleText} title={showText ? "Hide text" : "Preview text"}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                      {showText ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  )}
                  <button onClick={onClear} className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )
            }
          </div>

          {extracting && <p className="text-xs text-slate-400 animate-pulse px-1">📄 Uploading & extracting text...</p>}
          {!extracting && text && (
            <p className="text-xs text-emerald-400 px-1">
              ✅ {text.trim().split(/\s+/).length.toLocaleString()} words extracted from {pages} page{pages > 1 ? "s" : ""}
            </p>
          )}
          {!extracting && !text && file && (
            <p className="text-xs text-rose-400 px-1">⚠️ No text could be extracted. This may be a scanned/image-only PDF.</p>
          )}

          <AnimatePresence>
            {showText && text && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <textarea readOnly value={text} rows={6}
                  className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-slate-300 outline-none resize-none font-mono" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ResumeMatchingPage = () => {
  const [jdFile, setJdFile]           = useState(null);
  const [jdText, setJdText]           = useState("");
  const [jdPages, setJdPages]         = useState(0);
  const [jdExtracting, setJdExtracting] = useState(false);
  const [jdShowText, setJdShowText]   = useState(false);

  const [resumeFile, setResumeFile]         = useState(null);
  const [resumeText, setResumeText]         = useState("");
  const [resumePages, setResumePages]       = useState(0);
  const [resumeExtracting, setResumeExtracting] = useState(false);
  const [resumeShowText, setResumeShowText] = useState(false);

  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);

  const handleJdFile = async (file) => {
    setJdFile(file); setJdText(""); setJdPages(0); setJdShowText(false);
    setJdExtracting(true);
    try {
      const { text, pages } = await parsePdfOnServer(file);
      setJdText(text); setJdPages(pages);
    } catch (err) {
      console.error("JD PDF error:", err);
      toast.error(`JD PDF: ${err.message}`);
    } finally {
      setJdExtracting(false);
    }
  };

  const handleResumeFile = async (file) => {
    setResumeFile(file); setResumeText(""); setResumePages(0); setResumeShowText(false);
    setResumeExtracting(true);
    try {
      const { text, pages } = await parsePdfOnServer(file);
      setResumeText(text); setResumePages(pages);
    } catch (err) {
      console.error("Resume PDF error:", err);
      toast.error(`Resume PDF: ${err.message}`);
    } finally {
      setResumeExtracting(false);
    }
  };

  const handleMatch = async () => {
    if (!jdText.trim())     { toast.error("Please upload the Job Description PDF."); return; }
    if (!resumeText.trim()) { toast.error("Please upload the Candidate Resume PDF."); return; }
    setLoading(true); setResult(null);
    try {
      const { data } = await axios.post(`${AI_API_ENDPOINT}/resume-match`, {
        jdText: jdText.trim(),
        resumeText: resumeText.trim(),
      });
      if (data.success) { setResult(data.result); toast.success("Analysis complete!"); }
      else toast.error(data.message || "Analysis failed.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not connect to AI. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setJdFile(null); setJdText(""); setJdPages(0); setJdShowText(false);
    setResumeFile(null); setResumeText(""); setResumePages(0); setResumeShowText(false);
    setResult(null);
  };

  const canAnalyze = jdText.trim() && resumeText.trim() && !jdExtracting && !resumeExtracting;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-950">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden py-14 px-4 text-center">
        <motion.div animate={{ opacity: [0.15, 0.35, 0.15] }} transition={{ duration: 6, repeat: Infinity }}
          className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 4, repeat: Infinity }}
            className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-2xl shadow-blue-500/40 mb-6">
            <FileSearch className="h-10 w-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-black text-white sm:text-5xl">
            Resume <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Matching</span>
          </h1>
          <p className="mt-3 text-slate-400 text-lg max-w-2xl mx-auto">
            Upload the JD and Resume as PDFs — AI extracts, compares & delivers a professional match report
          </p>
        </motion.div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-20">

        {/* Upload zones */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <PdfDropZone label="📋 Job Description PDF" accentColor="blue"
              file={jdFile} text={jdText} pages={jdPages} extracting={jdExtracting}
              onFile={handleJdFile}
              onClear={() => { setJdFile(null); setJdText(""); setJdPages(0); setJdShowText(false); setResult(null); }}
              showText={jdShowText} onToggleText={() => setJdShowText(v => !v)}
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <PdfDropZone label="📄 Candidate Resume PDF" accentColor="cyan"
              file={resumeFile} text={resumeText} pages={resumePages} extracting={resumeExtracting}
              onFile={handleResumeFile}
              onClear={() => { setResumeFile(null); setResumeText(""); setResumePages(0); setResumeShowText(false); setResult(null); }}
              showText={resumeShowText} onToggleText={() => setResumeShowText(v => !v)}
            />
          </motion.div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <motion.button
            whileHover={{ scale: canAnalyze && !loading ? 1.04 : 1 }}
            whileTap={{ scale: canAnalyze && !loading ? 0.97 : 1 }}
            onClick={handleMatch} disabled={!canAnalyze || loading}
            className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-10 py-4 text-base font-black text-white shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? <><RefreshCw className="h-5 w-5 animate-spin" /> AI is analyzing...</> : <><Target className="h-5 w-5" /> Analyze Match</>}
          </motion.button>
          {(jdFile || resumeFile || result) && (
            <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={handleReset}
              className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-bold text-slate-300 hover:bg-white/10 transition-all">
              <RefreshCw className="h-4 w-4" /> Start Over
            </motion.button>
          )}
        </div>

        {/* Loading */}
        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-16">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                <FileSearch className="absolute inset-0 m-auto h-6 w-6 text-blue-400" />
              </div>
              <p className="text-slate-300 font-semibold">AI is reading and comparing your documents...</p>
              <p className="text-slate-500 text-sm">Usually takes 5–15 seconds</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">

              {/* Score + Summary */}
              <Card delay={0} className="p-8">
                <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
                  <CircleProgress value={result.score ?? 0} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h2 className="text-2xl font-black text-white">Match Analysis</h2>
                      <RecommendationBadge rec={result.recommendation} />
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed mb-5">{result.summary}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                        <p className="text-xs text-slate-400 font-semibold mb-1">Experience Required</p>
                        <p className="text-sm font-bold text-white">{result.experience?.required || "—"}</p>
                        <p className="text-xs mt-1">
                          <span className="text-slate-400">Candidate: </span>
                          <span className={result.experience?.match ? "text-emerald-400" : "text-rose-400"}>
                            {result.experience?.candidate || "—"} {result.experience?.match ? "✓" : "✗"}
                          </span>
                        </p>
                      </div>
                      <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                        <p className="text-xs text-slate-400 font-semibold mb-1">Education Required</p>
                        <p className="text-sm font-bold text-white">{result.education?.required || "—"}</p>
                        <p className="text-xs mt-1">
                          <span className="text-slate-400">Candidate: </span>
                          <span className={result.education?.match ? "text-emerald-400" : "text-rose-400"}>
                            {result.education?.candidate || "—"} {result.education?.match ? "✓" : "✗"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Skills */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card delay={0.1}>
                  <p className="text-xs font-black text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Matched Skills
                  </p>
                  {result.matchedSkills?.length > 0
                    ? <div className="flex flex-wrap gap-2">{result.matchedSkills.map(s => <Chip key={s} label={s} color="green" />)}</div>
                    : <p className="text-sm text-slate-500 italic">No direct matches found</p>}
                </Card>
                <Card delay={0.2}>
                  <p className="text-xs font-black text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <XCircle className="h-4 w-4" /> Missing Skills
                  </p>
                  {result.missingSkills?.length > 0
                    ? <div className="flex flex-wrap gap-2">{result.missingSkills.map(s => <Chip key={s} label={s} color="red" />)}</div>
                    : <p className="text-sm text-slate-500 italic">No critical gaps found</p>}
                </Card>
                <Card delay={0.3}>
                  <p className="text-xs font-black text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> Partial Match
                  </p>
                  {result.partialMatch?.length > 0
                    ? <div className="flex flex-wrap gap-2">{result.partialMatch.map(s => <Chip key={s} label={s} color="amber" />)}</div>
                    : <p className="text-sm text-slate-500 italic">No partial matches</p>}
                </Card>
              </div>

              {/* Strengths + Improvements */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Card delay={0.4}>
                  <p className="text-xs font-black text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4" /> Key Strengths
                  </p>
                  {result.strengths?.length > 0
                    ? <ul className="space-y-2">{result.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <Star className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />{s}
                        </li>))}</ul>
                    : <p className="text-sm text-slate-500 italic">—</p>}
                </Card>
                <Card delay={0.5}>
                  <p className="text-xs font-black text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" /> Areas to Improve
                  </p>
                  {result.improvements?.length > 0
                    ? <ul className="space-y-2">{result.improvements.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <TrendingUp className="h-3.5 w-3.5 text-purple-400 mt-0.5 shrink-0" />{s}
                        </li>))}</ul>
                    : <p className="text-sm text-slate-500 italic">—</p>}
                </Card>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ResumeMatchingPage;
