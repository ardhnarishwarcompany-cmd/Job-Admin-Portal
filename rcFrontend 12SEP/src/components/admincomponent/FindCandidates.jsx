import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, Sparkles, Users, X, Loader2,
  MapPin, Briefcase, DollarSign, Star, ChevronDown, Check,
  RotateCcw, Mail, FileText, User2, Zap, GraduationCap, Globe, Phone, Calendar, User, ExternalLink
} from "lucide-react";
import Navbar from "@/components/components_lite/Navbar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { RECRUITER_API_ENDPOINT, MESSAGING_API_ENDPOINT, getFileUrl } from "@/utils/data";

const SKILL_OPTIONS = [
  "React", "Node.js", "Python", "Java", "JavaScript", "TypeScript", "Angular", "Vue",
  "MongoDB", "MySQL", "SQL", "AWS", "Docker", "Kubernetes", "GraphQL", "Redux",
  "Django", "Flask", "CSS", "Tailwind", "Figma", "Git", "DevOps", "AI/ML",
  "Data Science", "Fullstack", "Frontend", "Backend", "Mobile", "Cloud", "MERN"
];

const LOCATION_OPTIONS = [
  "Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Pune",
  "Noida", "Gurgaon", "Kolkata", "Ahmedabad", "Remote"
];

const EXPERIENCE_OPTIONS = [
  "Fresher (0-1 yr)", "0-3 years", "3-5 years", "5-7 years", "7-10 years", "10+ years"
];

const SALARY_OPTIONS = [
  "0-3 LPA", "3-6 LPA", "6-10 LPA", "10-15 LPA", "15-25 LPA", "25 LPA+"
];

const AVAILABILITY_OPTIONS = ["Immediate", "2 Weeks", "1 Month", "2+ Months"];

const emptyFilters = {
  jobTitle: "", skills: "", location: "", experience: "", salary: "",
  gender: "", maritalStatus: "", employmentType: "", workMode: "", qualification: "", shift: ""
};

// ─── Candidate Card ────────────────────────────────────────────────────────────
const CandidateCard = ({ candidate, onViewProfile, onContact }) => {
  const { fullname, email, location, skills, experience, expectedSalary, bio, profilePhoto, matchScore, matchedKeywords } = candidate;
  const scoreColor = matchScore >= 70 ? "text-green-600 bg-green-50 border-green-200"
    : matchScore >= 40 ? "text-amber-600 bg-amber-50 border-amber-200"
    : "text-slate-500 bg-slate-50 border-slate-200";

  const photoUrl = profilePhoto ? getFileUrl(profilePhoto) : null;
  
  const displayExperience = typeof experience === "object" && experience !== null 
    ? (experience.total || (experience.years ? `${experience.years} yrs ${experience.months || 0} mos` : "") || experience.employmentType || "") 
    : experience;
    
  const displaySalary = typeof expectedSalary === "object" && expectedSalary !== null
    ? (expectedSalary.expected || expectedSalary.current || expectedSalary.max || "")
    : expectedSalary;

  const skillArrayRaw = Array.isArray(skills)
    ? skills
    : typeof skills === "string"
    ? skills.split(/[,;]/).map(s => s.trim()).filter(Boolean)
    : [];
    
  const skillArray = skillArrayRaw.map(s => {
    if (typeof s === "object" && s !== null) return s.skill || s.name || "";
    return String(s);
  }).filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-200 group"
    >
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          {photoUrl ? (
            <img src={photoUrl} alt={fullname} className="h-12 w-12 rounded-full object-cover ring-2 ring-blue-100 flex-shrink-0" />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {fullname?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 text-base leading-tight truncate">{fullname}</h3>
            <div className="flex items-center gap-1 mt-0.5 min-w-0">
              <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
              <span className="text-xs text-slate-500 truncate">{location || "Not specified"}</span>
            </div>
          </div>
        </div>
        {matchScore !== undefined && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold flex-shrink-0 self-start xs:self-auto ${scoreColor}`}>
            <Star className="h-3 w-3" />
            {matchScore}% match
          </div>
        )}
      </div>

      {bio && <p className="text-sm text-slate-600 line-clamp-2 mb-3">{bio}</p>}

      <div className="flex flex-wrap gap-1.5 mb-4">
        {skillArray.slice(0, 6).map((skill, i) => (
          <span
            key={i}
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              matchedKeywords?.some(kw => skill.toLowerCase().includes(kw.toLowerCase()))
                ? "bg-blue-100 text-blue-700 ring-1 ring-blue-300"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {skill}
          </span>
        ))}
        {skillArray.length > 6 && (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">+{skillArray.length - 6}</span>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
        {displayExperience && (
          <span className="flex items-center gap-1">
            <Briefcase className="h-3 w-3" />
            {displayExperience}
          </span>
        )}
        {displaySalary && (
          <span className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {displaySalary} LPA
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onContact(candidate.id)}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
        >
          <Mail className="h-3.5 w-3.5" />
          Contact
        </button>
        <button
          onClick={() => onViewProfile(candidate)}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
        >
          <User2 className="h-3.5 w-3.5" />
          View Profile
        </button>
      </div>
    </motion.div>
  );
};

// ─── Main FindCandidates Page ─────────────────────────────────────────────────
const FindCandidates = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem("fc_activeTab") || "jd";
  });
  const [jdText, setJdText] = useState(() => {
    return sessionStorage.getItem("fc_jdText") || "";
  });
  const [filters, setFilters] = useState(() => {
    try {
      const saved = sessionStorage.getItem("fc_filters");
      return saved ? JSON.parse(saved) : emptyFilters;
    } catch {
      return emptyFilters;
    }
  });
  const [candidates, setCandidates] = useState(() => {
    try {
      const saved = sessionStorage.getItem("fc_candidates");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(() => {
    return sessionStorage.getItem("fc_searched") === "true";
  });
  const [extractedKeywords, setExtractedKeywords] = useState(() => {
    try {
      const saved = sessionStorage.getItem("fc_extractedKeywords");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(() => {
    try {
      const saved = sessionStorage.getItem("fc_selectedCandidate");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    sessionStorage.setItem("fc_activeTab", activeTab);
    sessionStorage.setItem("fc_jdText", jdText);
    sessionStorage.setItem("fc_filters", JSON.stringify(filters));
    sessionStorage.setItem("fc_candidates", JSON.stringify(candidates));
    sessionStorage.setItem("fc_searched", String(searched));
    sessionStorage.setItem("fc_extractedKeywords", JSON.stringify(extractedKeywords));
    sessionStorage.setItem("fc_selectedCandidate", JSON.stringify(selectedCandidate));
  }, [activeTab, jdText, filters, candidates, searched, extractedKeywords, selectedCandidate]);

  const handleContact = async (candidateId) => {
    try {
      const res = await axios.post(
        `${MESSAGING_API_ENDPOINT}/recruiter-candidate/start`,
        { candidateId },
        { withCredentials: true }
      );
      if (res.data.success) {
        navigate("/recruiter/chats", { state: { selectConversationId: res.data.conversation.id } });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not start chat");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(p => ({ ...p, [name]: value }));
  };

  const clearFilters = () => setFilters(emptyFilters);

  const handleSearch = useCallback(async () => {
    if (activeTab === "jd" && (!jdText || jdText.trim().length < 10)) {
      toast.error("Please enter a job description of at least 10 characters.");
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      let res;
      if (activeTab === "jd") {
        res = await axios.post(
          `${RECRUITER_API_ENDPOINT}/find-candidates`,
          { jd_text: jdText, filters: {} },
          { withCredentials: true }
        );
      } else {
        res = await axios.get(
          `${RECRUITER_API_ENDPOINT}/find-candidates`,
          { params: filters, withCredentials: true }
        );
      }
      
      if (res.data.success) {
        setCandidates(res.data.candidates || []);
        setExtractedKeywords(res.data.extractedKeywords || []);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Something went wrong during candidate matching");
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [jdText, filters, activeTab]);
  const ManualSearchForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700">Job Title / Role</label>
        <input 
          type="text" name="jobTitle" value={filters.jobTitle} onChange={handleInputChange}
          placeholder="e.g. Frontend Developer" 
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700">Required Skills</label>
        <input 
          type="text" name="skills" value={filters.skills} onChange={handleInputChange}
          placeholder="e.g. React, Node.js, Python" 
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700">Location</label>
        <input 
          type="text" name="location" value={filters.location} onChange={handleInputChange}
          placeholder="e.g. Remote, Mumbai, Delhi" 
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Experience</label>
          <input 
            type="text" name="experience" value={filters.experience} onChange={handleInputChange}
            placeholder="e.g. 3 years" 
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Expected Salary</label>
          <input 
            type="text" name="salary" value={filters.salary} onChange={handleInputChange}
            placeholder="e.g. 15 LPA" 
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700">Highest Qualification</label>
        <input 
          type="text" name="qualification" value={filters.qualification} onChange={handleInputChange}
          placeholder="e.g. B.Tech, MBA" 
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:col-span-2">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Gender</label>
          <select 
            name="gender" value={filters.gender} onChange={handleInputChange}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Any</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Marital Status</label>
          <select 
            name="maritalStatus" value={filters.maritalStatus} onChange={handleInputChange}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Any</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Work Mode</label>
          <select 
            name="workMode" value={filters.workMode} onChange={handleInputChange}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Any</option>
            <option value="Work From Office">Work From Office</option>
            <option value="Work From Home">Work From Home</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Preferred Shift</label>
          <select 
            name="shift" value={filters.shift} onChange={handleInputChange}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Any</option>
            <option value="Day Shift">Day Shift</option>
            <option value="Night Shift">Night Shift</option>
            <option value="Rotational">Rotational</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10">
      <Navbar />

      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900">
                Find <span className="text-blue-600">Candidates</span>
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Use AI-powered JD analysis or advanced filters to discover the right talent.
              </p>
            </div>
            {searched && (
              <div className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-200 px-4 py-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-700">{candidates.length} candidates found</span>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl overflow-hidden border border-slate-200 mt-5 bg-slate-50 w-full sm:w-fit">
            <button
              onClick={() => setActiveTab("jd")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold transition-all ${activeTab === "jd" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              <Sparkles className="h-4 w-4" /> AI JD Search
            </button>
            <button
              onClick={() => setActiveTab("filter")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold transition-all ${activeTab === "filter" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              <SlidersHorizontal className="h-4 w-4" /> Filter Search
            </button>
          </div>

          {/* JD Input */}
          <AnimatePresence mode="wait">
            {activeTab === "jd" && (
              <motion.div key="jd" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Paste your Job Description
                  </label>
                  <textarea
                    value={jdText}
                    onChange={e => setJdText(e.target.value)}
                    rows={5}
                    placeholder="Paste your full job description here... Skills, requirements, experience level, and location will be automatically detected using AI to find matching candidates."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-colors placeholder-slate-400"
                  />
                  {extractedKeywords.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="text-xs text-slate-500 font-medium mr-1">Detected keywords:</span>
                      {extractedKeywords.slice(0, 15).map(kw => (
                        <span key={kw} className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">{kw}</span>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={handleSearch}
                    disabled={loading || !jdText.trim()}
                    className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-blue-200 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                    {loading ? "Analyzing JD & Finding Candidates..." : "Find Matching Candidates"}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "filter" && (
              <motion.div key="filter" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-bold text-slate-800 text-lg">Manual Candidate Search</h2>
                    <button onClick={clearFilters} className="text-sm font-semibold text-rose-500 hover:text-rose-700 transition-colors">
                      Clear Fields
                    </button>
                  </div>
                  <div className="mb-6">
                    {ManualSearchForm()}
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-md hover:shadow-blue-200 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                    {loading ? "Searching..." : "Search Candidates"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">

          {/* Results */}
          <div className="flex-1">
            {!searched && !loading && (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <Users className="h-10 w-10 text-blue-300" />
                </div>
                <p className="text-xl font-bold text-slate-500">Discover Your Ideal Candidates</p>
                <p className="text-sm mt-2 text-center max-w-xs">
                  Paste a Job Description for AI-powered matching, or use the filter panel to search by skills, experience, location & more.
                </p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
                <p className="text-slate-500 font-semibold">
                  {activeTab === "jd" ? "Analyzing JD and matching candidates..." : "Searching candidates..."}
                </p>
              </div>
            )}

            {searched && !loading && candidates.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <Users className="h-20 w-20 mb-4 opacity-20" />
                <p className="text-xl font-bold">No Matching Candidates Found</p>
                <p className="text-sm mt-2">Try adjusting your JD or filters to broaden your search.</p>
              </div>
            )}

            {!loading && candidates.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
              >
                {candidates.map((candidate, i) => (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <CandidateCard
                      candidate={candidate}
                      onViewProfile={(cand) => setSelectedCandidate(cand)}
                      onContact={handleContact}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
      </div>

      <AnimatePresence>
        {selectedCandidate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto"
            onClick={() => setSelectedCandidate(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-50 shadow-2xl ring-1 ring-slate-200/50 flex flex-col p-0"
            >
              {/* Cover Banner */}
              <div className="relative h-32 w-full bg-gradient-to-r from-blue-600 to-indigo-600 flex-shrink-0">
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="absolute right-4 top-4 rounded-full p-2 bg-black/20 text-white hover:bg-black/30 backdrop-blur-md transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Profile Header Block */}
              <div className="px-6 sm:px-8 pb-6 bg-white border-b border-slate-100 flex-shrink-0">
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-10 mb-4 text-center sm:text-left">
                  {selectedCandidate.profilePhoto ? (
                    <img
                      src={getFileUrl(selectedCandidate.profilePhoto)}
                      alt={selectedCandidate.fullname}
                      className="h-24 w-24 rounded-3xl object-cover ring-4 ring-white shadow-xl bg-white"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl shadow-xl ring-4 ring-white">
                      {selectedCandidate.fullname?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-black text-slate-900 leading-tight truncate">{selectedCandidate.fullname}</h3>
                    <p className="text-sm font-semibold text-blue-600 mt-1">
                      {selectedCandidate.candidateProfile?.career?.title || "Job Seeker"}
                    </p>
                  </div>
                </div>

                {/* Email / Mobile Quick Tags */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">
                    <Mail className="h-4 w-4 text-slate-400" /> {selectedCandidate.email}
                  </span>
                  {selectedCandidate.candidateProfile?.contact?.mobile && (
                    <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">
                      <Phone className="h-4 w-4 text-slate-400" /> +91 {selectedCandidate.candidateProfile.contact.mobile}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">
                    <MapPin className="h-4 w-4 text-slate-400" /> {selectedCandidate.location || "Not specified"}
                  </span>
                </div>
              </div>

              {/* Bio & Details Area */}
              <div className="p-4 sm:p-8 space-y-6">
                {/* Bio */}
                {selectedCandidate.bio && (
                  <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About Me / Bio</h4>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">{selectedCandidate.bio}</p>
                  </div>
                )}

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Personal details */}
                    <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4 shadow-sm">
                      <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-2">
                        <User className="h-4 w-4 text-blue-500" /> Personal Details
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-slate-400 text-xs block">Gender</span>
                          <span className="font-bold text-slate-800">{selectedCandidate.candidateProfile?.personal?.gender || "Not specified"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-xs block">Marital Status</span>
                          <span className="font-bold text-slate-800">{selectedCandidate.candidateProfile?.personal?.maritalStatus || "Not specified"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-xs block">DOB / Age</span>
                          <span className="font-bold text-slate-800">
                            {selectedCandidate.candidateProfile?.personal?.dob || "Not specified"} 
                            {selectedCandidate.candidateProfile?.personal?.age ? ` (${selectedCandidate.candidateProfile.personal.age} yrs)` : ""}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-xs block">Category</span>
                          <span className="font-bold text-slate-800">{selectedCandidate.candidateProfile?.personal?.category || "Not specified"}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-400 text-xs block">Address</span>
                          <span className="font-bold text-slate-800">
                            {[
                              selectedCandidate.candidateProfile?.personal?.address,
                              selectedCandidate.candidateProfile?.personal?.city,
                              selectedCandidate.candidateProfile?.personal?.state,
                              selectedCandidate.candidateProfile?.personal?.country
                            ].filter(Boolean).join(", ") || "Not specified"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Work Preferences */}
                    <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4 shadow-sm">
                      <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-2">
                        <Globe className="h-4 w-4 text-blue-500" /> Work Preferences
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-slate-400 text-xs block">Preferred Shift</span>
                          <span className="font-bold text-slate-800">{selectedCandidate.candidateProfile?.workPrefs?.shift || "No preference"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-xs block">Weekly Off</span>
                          <span className="font-bold text-slate-800">{selectedCandidate.candidateProfile?.workPrefs?.weeklyOff || "No preference"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-xs block">Own Vehicle</span>
                          <span className="font-bold text-slate-800">{selectedCandidate.candidateProfile?.workPrefs?.ownVehicle ? "Yes" : "No"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-xs block">Open to Relocate</span>
                          <span className="font-bold text-slate-800">{selectedCandidate.candidateProfile?.workPrefs?.relocate ? "Yes" : "No"}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-400 text-xs block">Languages</span>
                          <span className="font-bold text-slate-800">
                            {selectedCandidate.candidateProfile?.workPrefs?.languages?.map(l => l.language).join(", ") || "Not specified"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Career Preferences */}
                    <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4 shadow-sm">
                      <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-2">
                        <Briefcase className="h-4 w-4 text-blue-500" /> Career Profile
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <span className="text-slate-400 text-xs block">Target Job Titles / Roles</span>
                          <span className="font-bold text-slate-800">
                            {Array.isArray(selectedCandidate.candidateProfile?.career?.titles) && selectedCandidate.candidateProfile.career.titles.length > 0
                              ? selectedCandidate.candidateProfile.career.titles.join(", ")
                              : selectedCandidate.candidateProfile?.career?.title || "Not specified"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-xs block">Expected Salary</span>
                          <span className="font-bold text-slate-800">
                            {selectedCandidate.candidateProfile?.career?.salary?.expected 
                              ? `${selectedCandidate.candidateProfile.career.salary.expected} ${selectedCandidate.candidateProfile.career.salary.currency || "INR"}` 
                              : selectedCandidate.expectedSalary 
                              ? `${selectedCandidate.expectedSalary} LPA` 
                              : "Not specified"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-xs block">Job Type</span>
                          <span className="font-bold text-slate-800">{selectedCandidate.candidateProfile?.career?.jobType || "Not specified"}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-400 text-xs block">Preferred Locations</span>
                          <span className="font-bold text-slate-800">
                            {Array.isArray(selectedCandidate.candidateProfile?.career?.locations) && selectedCandidate.candidateProfile.career.locations.length > 0
                              ? selectedCandidate.candidateProfile.career.locations.join(", ")
                              : typeof selectedCandidate.candidateProfile?.career?.locations === "string"
                              ? selectedCandidate.candidateProfile.career.locations
                              : selectedCandidate.location || "Not specified"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4 shadow-sm">
                      <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-2">
                        <Star className="h-4 w-4 text-blue-500" /> Skills & Competency
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          const skills = selectedCandidate.skills;
                          const skillArrayRaw = Array.isArray(skills)
                            ? skills
                            : typeof skills === "string"
                            ? skills.split(/[,;]/).map(s => s.trim()).filter(Boolean)
                            : [];
                          if (skillArrayRaw.length === 0) return <span className="text-slate-400 italic">No skills listed</span>;
                          return skillArrayRaw.map((s, idx) => {
                            const name = typeof s === "object" && s !== null ? s.skill || s.name || "" : String(s);
                            const lvl = typeof s === "object" && s !== null ? s.level : null;
                            return (
                              <span key={idx} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                                {name} {lvl && <span className="text-[10px] bg-blue-200/50 text-blue-800 px-1.5 py-0.2 rounded-full font-black uppercase">{lvl}</span>}
                              </span>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* Education */}
                    <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4 shadow-sm">
                      <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-2">
                        <GraduationCap className="h-4 w-4 text-blue-500" /> Education
                      </h4>
                      {selectedCandidate.candidateProfile?.education?.qualification ? (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2">
                            <span className="text-slate-400 text-xs block">College / Institute</span>
                            <span className="font-bold text-slate-800">{selectedCandidate.candidateProfile.education.college || "Not specified"}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-xs block">Degree / Qualification</span>
                            <span className="font-bold text-slate-800">{selectedCandidate.candidateProfile.education.qualification}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-xs block">Passing Year</span>
                            <span className="font-bold text-slate-800">{selectedCandidate.candidateProfile.education.passingYear || "Not specified"}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">Education details not provided</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Portfolio & Resume Area */}
                <div className="rounded-2xl bg-white border border-slate-200 p-5 flex flex-wrap gap-4 items-center justify-between shadow-sm">
                  <div className="flex gap-4">
                    {selectedCandidate.candidateProfile?.portfolioLinks?.github && (
                      <a
                        href={selectedCandidate.candidateProfile.portfolioLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" /> GitHub
                      </a>
                    )}
                    {selectedCandidate.candidateProfile?.portfolioLinks?.linkedin && (
                      <a
                        href={selectedCandidate.candidateProfile.portfolioLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" /> LinkedIn
                      </a>
                    )}
                  </div>

                  {selectedCandidate.candidateProfile?.resume ? (
                    <a
                      href={getFileUrl(selectedCandidate.candidateProfile.resume)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 shadow-md shadow-emerald-100 transition-all text-xs sm:text-sm"
                    >
                      <FileText className="h-4 w-4" /> View Resume PDF
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No resume uploaded</span>
                  )}
                </div>

                {/* Quick Actions at Bottom */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => {
                      handleContact(selectedCandidate.id);
                      setSelectedCandidate(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 transition-all shadow-lg shadow-blue-100"
                  >
                    <Mail className="h-4 w-4" /> Open Chat Conversation
                  </button>
                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold py-3.5 hover:bg-slate-50 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FindCandidates;
