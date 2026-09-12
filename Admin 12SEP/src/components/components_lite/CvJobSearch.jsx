import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, FileSearch, X, Loader2, CheckCircle2, Upload } from "lucide-react";

const SKILL_REGEX = /\b(react|node|python|java|javascript|typescript|angular|vue|mongodb|mysql|sql|aws|docker|kubernetes|rest|graphql|redux|express|django|flask|html|css|tailwind|figma|git|agile|scrum|devops|machine learning|deep learning|nlp|ai|data science|tensorflow|pytorch|android|ios|swift|kotlin|php|laravel|spring|fullstack|frontend|backend|mobile|cloud|security|qa)\b/gi;
const LOCATION_REGEX = /\b(delhi|mumbai|bangalore|hyderabad|chennai|pune|kolkata|noida|gurgaon|ahmedabad|remote|jaipur|chandigarh|kochi|bhopal|indore)\b/gi;
const EXPERIENCE_MAP = {
  "fresher": "Fresher (0-1 yr)",
  "0-1": "Fresher (0-1 yr)",
  "1-3": "0-3 years",
  "2-3": "0-3 years",
  "3-5": "3-5 years",
  "5-7": "5-7 years",
  "7-10": "7-10 years",
  "10+": "10+ years",
};

const CvJobSearch = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [mode, setMode] = useState("profile"); // "profile" | "upload"
  const [loading, setLoading] = useState(false);
  const [detected, setDetected] = useState(null);
  const [cvText, setCvText] = useState("");

  // Auto-search from user's saved profile
  const searchFromProfile = async () => {
    if (!user) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    let profileData = null;
    if (user.candidateProfile) {
      try {
        profileData = typeof user.candidateProfile === "string" 
          ? JSON.parse(user.candidateProfile) 
          : user.candidateProfile;
      } catch (e) {
        console.error("Failed to parse candidateProfile", e);
      }
    }

    let rawSkills = user.skills || user.profile?.skills || "";
    if (Array.isArray(rawSkills)) {
      rawSkills = rawSkills.map(s => typeof s === 'object' && s !== null ? (s.skill || s.name || "") : String(s)).filter(Boolean).join(", ");
    } else if (profileData?.skills) {
      rawSkills = profileData.skills.map(s => s.skill).filter(Boolean).join(", ");
    }
    const skills = extractSkills([rawSkills, user.profile?.bio || profileData?.personal?.bio || ""].filter(Boolean).join(" "));

    const locationStr = user.city || profileData?.personal?.city || "";
    const locations = extractLocations(locationStr);

    const expStr = String(user.experience || profileData?.experience?.total || "");
    const expFilter = detectExperience(expStr);

    const filters = {
      location: locations,
      technology: skills,
      experience: expFilter ? [expFilter] : [],
      salary: [],
      jobType: [],
      workMode: [],
      industry: [],
    };

    setDetected({ skills, locations, experience: expFilter });
    dispatch(setSearchedQuery(filters));
    setLoading(false);
  };

  // Search from pasted/uploaded CV text
  const searchFromText = async () => {
    if (!cvText.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const skills = extractSkills(cvText);
    const locations = extractLocations(cvText);
    const expFilter = detectExperience(cvText);

    const filters = {
      location: locations,
      technology: skills,
      experience: expFilter ? [expFilter] : [],
      salary: [],
      jobType: [],
      workMode: [],
      industry: [],
    };

    setDetected({ skills, locations, experience: expFilter });
    dispatch(setSearchedQuery(filters));
    setLoading(false);
  };

  const clearDetection = () => {
    setDetected(null);
    setCvText("");
    dispatch(setSearchedQuery({}));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 mb-4 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Smart CV Match</h3>
          <p className="text-[11px] text-slate-500">Auto-detect jobs based on your profile or CV</p>
        </div>
      </div>

      {/* Mode Switch */}
      <div className="flex rounded-xl overflow-hidden border border-blue-200 mb-4 bg-white">
        <button
          onClick={() => setMode("profile")}
          className={`flex-1 py-2 text-xs font-bold transition-all ${mode === "profile" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-blue-50"}`}
        >
          Use My Profile
        </button>
        <button
          onClick={() => setMode("upload")}
          className={`flex-1 py-2 text-xs font-bold transition-all ${mode === "upload" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-blue-50"}`}
        >
          Paste CV Text
        </button>
      </div>

      {/* Mode: Profile */}
      <AnimatePresence mode="wait">
        {mode === "profile" && (
          <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 p-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700 flex-shrink-0">
                    {user.fullname?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{user.fullname}</p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Skills: {user.skills || "No skills on profile"}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Location: {user.city || "Not set"} | Exp: {user.experience ? `${user.experience} yrs` : "Not set"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={searchFromProfile}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {loading ? "Detecting..." : "Match Jobs to My Profile"}
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-3">Please login to use profile matching.</p>
            )}
          </motion.div>
        )}

        {mode === "upload" && (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <textarea
              value={cvText}
              onChange={e => setCvText(e.target.value)}
              placeholder="Paste your CV or resume text here... Skills, experience, education will be auto-detected."
              className="w-full h-28 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-slate-400"
            />
            <button
              onClick={searchFromText}
              disabled={loading || !cvText.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors disabled:opacity-40"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSearch className="h-4 w-4" />}
              {loading ? "Analyzing CV..." : "Find Matching Jobs"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detected Results */}
      <AnimatePresence>
        {detected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 rounded-xl bg-white border border-green-200 p-3 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-xs font-bold text-green-700">Filters Applied from CV</span>
              </div>
              <button onClick={clearDetection} className="text-slate-400 hover:text-slate-600">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            {detected.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1.5">
                {detected.skills.slice(0, 8).map(s => (
                  <span key={s} className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">{s}</span>
                ))}
              </div>
            )}
            {detected.locations?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1.5">
                {detected.locations.map(l => (
                  <span key={l} className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">{l}</span>
                ))}
              </div>
            )}
            {detected.experience && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">{detected.experience}</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function extractSkills(text) {
  if (!text) return [];
  const matches = [...new Set((text.match(SKILL_REGEX) || []).map(s => s.toLowerCase()))];
  const displayMap = {
    "react": "React", "node": "Node.js", "python": "Python", "java": "Java",
    "javascript": "JavaScript", "typescript": "TypeScript", "angular": "Angular",
    "vue": "Vue", "mongodb": "MongoDB", "mysql": "MySQL", "sql": "SQL",
    "aws": "AWS", "docker": "Docker", "kubernetes": "Kubernetes", "rest": "REST",
    "graphql": "GraphQL", "redux": "Redux", "express": "Express",
    "django": "Django", "flask": "Flask", "html": "HTML", "css": "CSS",
    "tailwind": "Tailwind", "figma": "Figma", "git": "Git", "agile": "Agile",
    "scrum": "Scrum", "devops": "DevOps", "machine learning": "AI/ML",
    "deep learning": "AI/ML", "nlp": "AI/ML", "ai": "AI/ML",
    "data science": "Data Science", "tensorflow": "AI/ML", "pytorch": "AI/ML",
    "fullstack": "Fullstack", "frontend": "Frontend", "backend": "Backend",
    "mobile": "Mobile", "cloud": "Cloud", "ios": "Mobile", "android": "Mobile",
    "swift": "Swift", "kotlin": "Kotlin", "php": "PHP", "laravel": "PHP",
    "spring": "Java", "mern": "MERN",
  };
  return [...new Set(matches.map(m => displayMap[m] || m))].slice(0, 10);
}

function extractLocations(text) {
  if (!text) return [];
  const raw = text.match(LOCATION_REGEX) || [];
  return [...new Set(raw.map(l => l.charAt(0).toUpperCase() + l.slice(1).toLowerCase()))];
}

function detectExperience(text) {
  if (!text && text !== 0) return null;
  const lower = String(text).toLowerCase();
  if (lower.includes("fresher") || lower.includes("0-1") || lower.includes("0 year")) return "Fresher (0-1 yr)";
  const m = lower.match(/(\d+)\s*(?:-|to)\s*(\d+)\s*(?:years?|yrs?)/);
  if (m) {
    const [, min, max] = m;
    const range = `${min}-${max}`;
    for (const [key, val] of Object.entries(EXPERIENCE_MAP)) {
      if (range.startsWith(key)) return val;
    }
  }
  const single = lower.match(/(\d+)\+?\s*(?:years?|yrs?)/);
  if (single) {
    const yrs = parseInt(single[1]);
    if (yrs >= 10) return "10+ years";
    if (yrs >= 7) return "7-10 years";
    if (yrs >= 5) return "5-7 years";
    if (yrs >= 3) return "3-5 years";
    return "0-3 years";
  }
  return null;
}

export default CvJobSearch;
