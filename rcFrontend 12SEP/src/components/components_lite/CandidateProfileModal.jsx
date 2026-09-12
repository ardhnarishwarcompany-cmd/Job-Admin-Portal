import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, User, Mail, Phone, MapPin, Briefcase, GraduationCap, 
  Award, FileText, Globe, Linkedin, Github, Youtube, Heart, 
  Calendar, ShieldCheck, CheckCircle2, Clock, CreditCard, BookOpen 
} from "lucide-react";
import { getFileUrl } from "@/utils/data";
import { Badge } from "../ui/badge";

const CandidateProfileModal = ({ isOpen, onClose, user }) => {
  const profileData = useMemo(() => {
    let data = null;
    if (user?.candidateProfile) {
      try {
        data = typeof user.candidateProfile === "string" ? JSON.parse(user.candidateProfile) : user.candidateProfile;
      } catch (e) {
        console.error("Failed to parse candidateProfile");
      }
    }
    return data;
  }, [user]);

  const profilePhoto = user?.profilePhoto 
    ? getFileUrl(user.profilePhoto) 
    : "/default-avatar.svg";

  const personal = profileData?.personal || {};
  const contact = profileData?.contact || {};
  const career = profileData?.career || {};
  const education = profileData?.education || {};
  const experience = profileData?.experience || {};
  const portfolio = profileData?.portfolioLinks || {};
  const workPrefs = profileData?.workPrefs || {};
  const platform = profileData?.platform || {};
  const certifications = profileData?.certifications || [];
  
  let skills = [];
  const rawSkills = user?.profile?.skills || profileData?.skills || user?.skills;
  if (Array.isArray(rawSkills)) {
    skills = rawSkills.map(s => typeof s === 'object' && s !== null ? (s.skill || s.name || "") : String(s)).filter(Boolean);
  } else if (typeof rawSkills === "string") {
    skills = rawSkills.split(/[,;]/).map(s => s.trim()).filter(Boolean);
  }

  const profileCompletion = useMemo(() => {
    let score = 0;
    if (user?.fullname) score += 15;
    if (user?.email) score += 10;
    if (user?.phoneNumber) score += 10;
    if (user?.profilePhoto || user?.profile?.profilePhoto) score += 10;
    if (user?.profile?.bio || user?.bio) score += 10;
    if (skills.length > 0) score += 15;
    if (experience?.years || experience?.total) score += 15;
    if (user?.profile?.resume || user?.resume || profileData?.resume) score += 15;
    return Math.min(100, score);
  }, [user, skills, experience, profileData]);

  if (!isOpen || !user) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] my-auto overflow-y-auto rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 md:p-8 shadow-2xl transition-all duration-300 custom-scrollbar"
        >
          {/* Close button (Fixed hover transform issue) */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 z-20 rounded-xl bg-slate-100 dark:bg-slate-800 p-2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors !transform-none hover:!transform-none active:!transform-none shadow-none"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header Row */}
          <div className="flex flex-col md:flex-row gap-5 sm:gap-6 items-start md:items-center border-b border-slate-100 dark:border-slate-800 pb-6 mb-6 pr-8 sm:pr-10">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <img
                src={profilePhoto || "/default-avatar.svg"}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/default-avatar.svg"; }}
                alt={user.fullname}
                className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover border-4 border-slate-100 dark:border-slate-800 shadow-md flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate max-w-full">{user.fullname}</h3>
                  <span className="rounded-full bg-blue-100 dark:bg-blue-950 px-2.5 py-0.5 text-[10px] sm:text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider">Candidate</span>
                </div>
                <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-bold mt-1 truncate">
                  {career.jobTitle || "Seeking career opportunities"}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2.5 font-semibold">
                  <span className="flex items-center gap-1 min-w-0 max-w-full">
                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate max-w-[200px] sm:max-w-none">{user.email}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{user.phoneNumber || "N/A"}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{personal.city ? `${personal.city}, ${personal.country || ''}` : "Location not set"}</span>
                  </span>
                </div>
              </div>
            </div>
            
            {/* Completion Gauge */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 p-3.5 sm:p-4 rounded-2xl w-full md:w-auto justify-between md:justify-start flex-shrink-0">
              <div className="relative flex items-center justify-center h-13 w-13 sm:h-14 sm:w-14">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="28" cy="28" r="24" className="stroke-slate-200 dark:stroke-slate-855 fill-none" strokeWidth="4.5" />
                  <circle cx="28" cy="28" r="24" className="stroke-blue-600 fill-none" strokeWidth="4.5"
                    strokeDasharray={150} strokeDashoffset={150 - (150 * profileCompletion) / 100} strokeLinecap="round" />
                </svg>
                <span className="absolute text-[11px] font-black text-slate-800 dark:text-white">{profileCompletion}%</span>
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-800 dark:text-slate-205 uppercase tracking-wider">Profile Strength</p>
                <p className="text-[10px] text-slate-450 dark:text-slate-550 mt-0.5 font-bold">Real-time Completion</p>
              </div>
            </div>
          </div>

          {/* Grid Content */}
          <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
            {/* Left Panel: Personal, Contact & Preferences */}
            <div className="space-y-5 sm:space-y-6">
              {/* Personal Information */}
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 p-4 sm:p-5">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3.5 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" /> Personal Information
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-450 dark:text-slate-550 font-bold block uppercase tracking-wider">Gender</span>
                    <span className="font-semibold text-slate-850 dark:text-slate-200 mt-0.5 block">{personal.gender || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-455 dark:text-slate-550 font-bold block uppercase tracking-wider">Date of Birth</span>
                    <span className="font-semibold text-slate-855 dark:text-slate-200 mt-0.5 block">{personal.dob || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-455 dark:text-slate-550 font-bold block uppercase tracking-wider">Age</span>
                    <span className="font-semibold text-slate-855 dark:text-slate-200 mt-0.5 block">{personal.age || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-455 dark:text-slate-550 font-bold block uppercase tracking-wider">Marital Status</span>
                    <span className="font-semibold text-slate-855 dark:text-slate-200 mt-0.5 block">{personal.maritalStatus || "N/A"}</span>
                  </div>
                  <div className="col-span-full">
                    <span className="text-slate-455 dark:text-slate-550 font-bold block uppercase tracking-wider">Address</span>
                    <span className="font-semibold text-slate-855 dark:text-slate-200 mt-0.5 block leading-relaxed break-words">
                      {personal.houseNumber ? `${personal.houseNumber}, ` : ""}
                      {personal.street ? `${personal.street}, ` : ""}
                      {personal.area ? `${personal.area}, ` : ""}
                      {personal.city ? `${personal.city}, ` : ""}
                      {personal.state ? `${personal.state}, ` : ""}
                      {personal.country ? `${personal.country} ` : ""}
                      {personal.pinCode ? `- ${personal.pinCode}` : ""}
                      {!personal.city && "Location details not set"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Career & Work Preferences */}
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 p-4 sm:p-5">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3.5 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-cyan-500" /> Career & Preferences
                </h4>
                <div className="grid grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <span className="text-slate-455 dark:text-slate-550 font-bold block uppercase tracking-wider">Preferred Job Type</span>
                    <span className="font-semibold text-slate-855 dark:text-slate-200 mt-0.5 block">{career.jobType || "Full-Time"}</span>
                  </div>
                  <div>
                    <span className="text-slate-455 dark:text-slate-550 font-bold block uppercase tracking-wider">Work Mode</span>
                    <span className="font-semibold text-slate-855 dark:text-slate-200 mt-0.5 block">{career.workMode || "Hybrid"}</span>
                  </div>
                  <div>
                    <span className="text-slate-455 dark:text-slate-550 font-bold block uppercase tracking-wider">Preferred Shift</span>
                    <span className="font-semibold text-slate-855 dark:text-slate-200 mt-0.5 block">{workPrefs.shift || "Day Shift"}</span>
                  </div>
                  <div>
                    <span className="text-slate-455 dark:text-slate-550 font-bold block uppercase tracking-wider">Weekly Off</span>
                    <span className="font-semibold text-slate-855 dark:text-slate-200 mt-0.5 block">{workPrefs.weeklyOff || "Sunday"}</span>
                  </div>
                  <div className="col-span-full">
                    <span className="text-slate-455 dark:text-slate-550 font-bold block uppercase tracking-wider mb-1.5">Job Preferences Details</span>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${workPrefs.relocate ? "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400" : "bg-slate-100 text-slate-450 dark:bg-slate-805/40"}`}>Ready to Relocate</span>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${workPrefs.travel ? "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400" : "bg-slate-100 text-slate-450 dark:bg-slate-805/40"}`}>Ready to Travel</span>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${workPrefs.passport ? "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400" : "bg-slate-100 text-slate-455 dark:bg-slate-805/40"}`}>Passport Ready</span>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${workPrefs.ownVehicle ? "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400" : "bg-slate-100 text-slate-455 dark:bg-slate-805/40"}`}>Own Vehicle</span>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${workPrefs.drivingLicense ? "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400" : "bg-slate-100 text-slate-455 dark:bg-slate-805/40"}`}>Driving License</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Tools preferences */}
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 p-4 sm:p-5">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-indigo-500" /> Platform AI Preferences
                </h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs">
                  <span className={`px-2 py-1 rounded-xl font-semibold border ${platform.aiResume ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-400" : "border-slate-200 text-slate-455 dark:border-slate-805"}`}>AI Resume Builder</span>
                  <span className={`px-2 py-1 rounded-xl font-semibold border ${platform.aiSkillTest ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-400" : "border-slate-200 text-slate-455 dark:border-slate-805"}`}>AI Skill Test</span>
                  <span className={`px-2 py-1 rounded-xl font-semibold border ${platform.aiMockInterview ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-450" : "border-slate-200 text-slate-455 dark:border-slate-805"}`}>AI Mock Interview</span>
                  <span className={`px-2 py-1 rounded-xl font-semibold border ${platform.aiVoiceInterview ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-450" : "border-slate-200 text-slate-455 dark:border-slate-805"}`}>AI Voice Interview</span>
                  <span className={`px-2 py-1 rounded-xl font-semibold border ${platform.aiVideoInterview ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-450" : "border-slate-200 text-slate-455 dark:border-slate-805"}`}>AI Video Interview</span>
                  <span className={`px-2 py-1 rounded-xl font-semibold border ${platform.aiCodingTest ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-450" : "border-slate-200 text-slate-455 dark:border-slate-805"}`}>AI Coding Test</span>
                  <span className={`px-2 py-1 rounded-xl font-semibold border ${platform.aiAptitudeTest ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-450" : "border-slate-200 text-slate-455 dark:border-slate-805"}`}>AI Aptitude Test</span>
                </div>
              </div>
            </div>

            {/* Right Panel: Experience, Education, Certs, Docs */}
            <div className="space-y-5 sm:space-y-6">
              {/* Experience Details */}
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 p-4 sm:p-5">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3.5 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-500" /> Work History
                </h4>
                <div className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-455 dark:text-slate-550 font-bold block uppercase tracking-wider">Experience Level</span>
                      <span className="font-semibold text-slate-855 dark:text-slate-200 mt-0.5 block">{experience.employmentType || "Experienced"}</span>
                    </div>
                    <div>
                      <span className="text-slate-455 dark:text-slate-550 font-bold block uppercase tracking-wider">Duration</span>
                      <span className="font-semibold text-slate-855 dark:text-slate-200 mt-0.5 block">
                        {experience.years ? `${experience.years} Yrs ` : ""}
                        {experience.months ? `${experience.months} Mths` : ""}
                        {!experience.years && !experience.months && "Fresher"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-455 dark:text-slate-550 font-bold block uppercase tracking-wider">Current/Past Company</span>
                      <span className="font-semibold text-slate-855 dark:text-slate-200 mt-0.5 block">{experience.company || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-slate-455 dark:text-slate-550 font-bold block uppercase tracking-wider">Designation</span>
                      <span className="font-semibold text-slate-855 dark:text-slate-200 mt-0.5 block">{experience.designation || "N/A"}</span>
                    </div>
                  </div>
                  {experience.reasonForChange && (
                    <div className="border-t border-slate-150 dark:border-slate-800 pt-2.5">
                      <span className="text-slate-455 dark:text-slate-550 font-bold block uppercase tracking-wider">Reason for Job Change</span>
                      <span className="font-semibold text-slate-855 dark:text-slate-200 mt-1 block leading-relaxed italic">
                        "{experience.reasonForChange}"
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Education Background */}
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 p-4 sm:p-5">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-purple-500" /> Academic Background
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-455 dark:text-slate-550 font-bold block uppercase tracking-wider">Qualification</span>
                    <span className="font-semibold text-slate-855 dark:text-slate-200 mt-0.5 block">{education.qualification || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-455 dark:text-slate-550 font-bold block uppercase tracking-wider">Passing Year</span>
                    <span className="font-semibold text-slate-855 dark:text-slate-200 mt-0.5 block">{education.passingYear || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-455 dark:text-slate-550 font-bold block uppercase tracking-wider">Institution</span>
                    <span className="font-semibold text-slate-855 dark:text-slate-200 mt-0.5 block">{education.college || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-455 dark:text-slate-550 font-bold block uppercase tracking-wider">Percentage/CGPA</span>
                    <span className="font-semibold text-slate-855 dark:text-slate-200 mt-0.5 block">{education.percentage || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Certifications repeat list */}
              {certifications.length > 0 && (
                <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 p-4 sm:p-5">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-500" /> Certifications ({certifications.length})
                  </h4>
                  <div className="space-y-3.5 text-xs">
                    {certifications.map((cert, index) => (
                      <div key={index} className="border-b border-slate-150 dark:border-slate-800 pb-2.5 last:border-b-0 last:pb-0">
                        <p className="font-bold text-slate-850 dark:text-slate-200 text-xs">{cert.name}</p>
                        <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5 font-bold">{cert.issuer} • Issued: {cert.issueDate || "N/A"} {cert.expiryDate ? `• Exp: ${cert.expiryDate}` : ""}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Social Portfolio Links */}
          <div className="mt-5 sm:mt-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 p-4 sm:p-5">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3.5 flex items-center gap-2">
              <Globe className="h-4 w-4 text-emerald-500" /> Social & Portfolio Links
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs font-bold">
              {portfolio.linkedin ? (
                <a href={portfolio.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-700 dark:text-slate-350 hover:text-blue-600 truncate">
                  <Linkedin className="h-4 w-4 text-[#0077b5] flex-shrink-0" /> LinkedIn
                </a>
              ) : <span className="text-slate-400 dark:text-slate-600 flex items-center gap-2"><Linkedin className="h-4 w-4 flex-shrink-0" /> LinkedIn (N/A)</span>}

              {portfolio.github ? (
                <a href={portfolio.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-700 dark:text-slate-350 hover:text-slate-950 dark:hover:text-white truncate">
                  <Github className="h-4 w-4 text-slate-800 dark:text-slate-200 flex-shrink-0" /> GitHub
                </a>
              ) : <span className="text-slate-400 dark:text-slate-600 flex items-center gap-2"><Github className="h-4 w-4 flex-shrink-0" /> GitHub (N/A)</span>}

              {portfolio.portfolioWebsite ? (
                <a href={portfolio.portfolioWebsite} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-700 dark:text-slate-350 hover:text-blue-600 truncate">
                  <Globe className="h-4 w-4 text-cyan-500 flex-shrink-0" /> Portfolio Website
                </a>
              ) : <span className="text-slate-400 dark:text-slate-600 flex items-center gap-2"><Globe className="h-4 w-4 flex-shrink-0" /> Portfolio (N/A)</span>}

              {portfolio.dribbble ? (
                <a href={portfolio.dribbble} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-700 dark:text-slate-350 hover:text-pink-600 truncate">
                  <Heart className="h-4 w-4 text-pink-500 flex-shrink-0" /> Dribbble
                </a>
              ) : <span className="text-slate-400 dark:text-slate-600 flex items-center gap-2"><Heart className="h-4 w-4 flex-shrink-0" /> Dribbble (N/A)</span>}
            </div>
          </div>

          {/* Uploaded Documents List */}
          <div className="mt-5 sm:mt-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 p-4 sm:p-5">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3.5 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" /> Uploaded Verification & Resume Documents
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {/* Resume */}
              {user?.resume || profileData?.resume ? (
                <a href={getFileUrl(user.resume || profileData.resume)} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 rounded-xl border border-blue-200/50 bg-blue-50/20 dark:bg-blue-950/20">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">Resume Document</span>
                  <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 hover:underline uppercase">View</span>
                </a>
              ) : null}

              {/* Video Intro */}
              {user?.videoIntro || profileData?.videoIntro ? (
                <a href={getFileUrl(user.videoIntro || profileData.videoIntro)} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 rounded-xl border border-blue-200/50 bg-blue-50/20 dark:bg-blue-950/20">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">Video Introduction</span>
                  <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 hover:underline uppercase">Watch</span>
                </a>
              ) : null}

              {/* Verification Docs */}
              {Array.isArray(user?.verificationDocs) && user.verificationDocs.map((docPath, i) => {
                let docLabel = `Verification Doc #${i + 1}`;
                if (docPath.toLowerCase().includes("aadhaar")) docLabel = "Aadhaar Card";
                else if (docPath.toLowerCase().includes("pan")) docLabel = "PAN Card";
                else if (docPath.toLowerCase().includes("passport")) docLabel = "Passport Copy";
                else if (docPath.toLowerCase().includes("license")) docLabel = "Driving License";
                else if (docPath.toLowerCase().includes("experience")) docLabel = "Experience Letter";
                else if (docPath.toLowerCase().includes("offer")) docLabel = "Offer Letter";
                else if (docPath.toLowerCase().includes("salary")) docLabel = "Salary Slip";
                else if (docPath.toLowerCase().includes("educational")) docLabel = "Educational Certificate";
                else if (docPath.toLowerCase().includes("photo")) docLabel = "Passport Size Photo";

                return (
                  <a key={i} href={getFileUrl(docPath)} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{docLabel}</span>
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 hover:underline uppercase">Open</span>
                  </a>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CandidateProfileModal;
