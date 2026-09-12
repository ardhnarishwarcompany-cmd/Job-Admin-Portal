import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  Pen, MapPin, Mail, Phone, Calendar, Briefcase, 
  GraduationCap, FileText, Link as LinkIcon, DollarSign,
  Github, Linkedin, Globe, Youtube, Heart
} from "lucide-react";

import Navbar from "./Navbar";
import { Badge } from "../ui/badge";
import { getFileUrl } from "@/utils/data";
import useGetAppliedJobs from "@/hooks/useGetAllAppliedJobs";

const Profile = () => {
  useGetAppliedJobs();
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const { allAppliedJobs } = useSelector((store) => store.job);

  // Parse detailed candidate profile if exists
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

  const profilePhoto = user?.profilePhoto ? getFileUrl(user.profilePhoto) : "/default.png";
  const bio = user?.profile?.bio || "No bio available.";
  
  // Aggregate data safely
  const personal = profileData?.personal || {};
  const career = profileData?.career || {};
  const education = profileData?.education || {};
  const experience = profileData?.experience || {};
  const portfolio = profileData?.portfolioLinks || {};
  let skills = [];
  const rawSkills = user?.profile?.skills || profileData?.skills || user?.skills;
  if (Array.isArray(rawSkills)) {
    skills = rawSkills.map(s => typeof s === 'object' && s !== null ? (s.skill || s.name || "") : String(s)).filter(Boolean);
  } else if (typeof rawSkills === "string") {
    skills = rawSkills.split(/[,;]/).map(s => s.trim()).filter(Boolean);
  }
  
  const resumeUrl = profileData?.resume ? getFileUrl(profileData.resume) : user?.resume ? getFileUrl(user.resume) : null;
  const resumeName = profileData?.resumeOriginalName || user?.resumeOriginalName || "Resume.pdf";
  const videoIntroUrl = profileData?.videoIntro ? getFileUrl(profileData.videoIntro) : null;

  const metrics = useMemo(() => {
    const appliedCount = allAppliedJobs?.length || 0;
    const shortlistedCount = allAppliedJobs?.filter((item) => item?.status === "accepted").length;
    return { appliedCount, shortlistedCount };
  }, [allAppliedJobs]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-200 selection:bg-cyan-500/30">
      <Navbar />

      <div className="relative mx-auto max-w-6xl px-4 py-12">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-cyan-600/20 blur-[120px]" />

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 grid gap-8 lg:grid-cols-[1fr_300px]"
        >
          
          <div className="space-y-8">
            {/* HERO SECTION */}
            <motion.div variants={itemVariants} className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="relative group">
                  <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-slate-800 shadow-xl shadow-black/50 transition-transform duration-300 group-hover:scale-105">
                    <img src={profilePhoto} alt={user?.fullname} className="h-full w-full object-cover" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h1 className="text-4xl font-black text-white tracking-tight">{user?.fullname}</h1>
                      <p className="mt-2 text-lg font-medium text-cyan-400">
                        {Array.isArray(career?.titles) && career.titles.length > 0
                          ? career.titles.join(", ")
                          : career?.title || "Professional seeking opportunities"}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate("/profile/edit")}
                      className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/20 hover:scale-105 shadow-lg"
                    >
                      <Pen className="h-4 w-4" /> Edit Profile
                    </button>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1">
                      <Mail className="h-4 w-4" /> {user?.email}
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1">
                      <Phone className="h-4 w-4" /> {user?.phoneNumber || "N/A"}
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1">
                      <MapPin className="h-4 w-4" /> {personal?.city ? `${personal.city}, ${personal.country}` : "Location not set"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">About Me</h3>
                <p className="mt-3 text-slate-300 leading-relaxed text-sm md:text-base">
                  {bio}
                </p>
              </div>
            </motion.div>

            {/* DETAILS GRID */}
            <div className="grid gap-8 md:grid-cols-2">
              <motion.div variants={itemVariants} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400"><Briefcase className="h-5 w-5"/></div>
                  <h3 className="font-bold text-white text-lg">Career Preferences</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400 text-sm">Industry</span>
                    <span className="font-medium text-slate-200">{career?.industry || "Any"}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400 text-sm">Job Type</span>
                    <span className="font-medium text-slate-200">{career?.jobType || "Any"} ({career?.employmentType || "Any"})</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400 text-sm">Work Mode</span>
                    <span className="font-medium text-slate-200">{career?.workMode || "Any"}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400 text-sm">Preferred Shift</span>
                    <span className="font-medium text-slate-200">{profileData?.workPrefs?.shift || "Any"}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400 text-sm">Expected Salary</span>
                    <span className="font-medium text-emerald-400 flex items-center gap-1">
                      {career?.salary?.expected ? `${career.salary.expected} ${career.salary.currency || "INR"}` : "Negotiable"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400 text-sm">Preferred Locations</span>
                    <span className="font-medium text-slate-200 text-right">
                      {Array.isArray(career?.locations) && career.locations.length > 0 
                        ? career.locations.join(", ") 
                        : career?.location || "Any"}
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400"><GraduationCap className="h-5 w-5"/></div>
                  <h3 className="font-bold text-white text-lg">Experience & Education</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400 text-sm">Total Experience</span>
                    <span className="font-medium text-slate-200">{experience?.total ? `${experience.total} Years` : "Fresher"}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400 text-sm">Current Company</span>
                    <span className="font-medium text-slate-200">{experience?.currentCompany || "N/A"}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400 text-sm">Highest Education</span>
                    <span className="font-medium text-slate-200 text-right">{education?.qualification || "N/A"} <br/><span className="text-xs text-slate-400">{education?.college}</span></span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* SKILLS SECTION */}
            <motion.div variants={itemVariants} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                Top Skills
              </h3>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    typeof skill === 'object' ? null : (
                      <Badge key={index} className="bg-white/10 hover:bg-white/20 text-cyan-300 border-none px-4 py-1.5 text-sm">
                        {skill}
                      </Badge>
                    )
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No skills added yet.</p>
              )}
            </motion.div>

          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <motion.div variants={itemVariants} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl text-center">
              <h3 className="text-slate-400 font-semibold mb-4 text-sm uppercase tracking-widest">Job Activity</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <div className="text-3xl font-black text-blue-400">{metrics.appliedCount}</div>
                  <div className="text-xs text-slate-400 mt-1">Applied Jobs</div>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <div className="text-3xl font-black text-emerald-400">{metrics.shortlistedCount}</div>
                  <div className="text-xs text-slate-400 mt-1">Shortlisted</div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h3 className="text-slate-400 font-semibold mb-4 text-sm uppercase tracking-widest">Documents</h3>
              <div className="space-y-3">
                {resumeUrl ? (
                  <a href={resumeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 p-3 rounded-xl transition-colors group">
                    <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400 group-hover:scale-110 transition-transform"><FileText className="h-4 w-4"/></div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-semibold text-blue-100 truncate">{resumeName}</p>
                      <p className="text-xs text-blue-300/70">Click to view</p>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl text-slate-500 text-sm">
                    <FileText className="h-4 w-4"/> No resume uploaded
                  </div>
                )}
                
                {videoIntroUrl && (
                  <a href={videoIntroUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 p-3 rounded-xl transition-colors group">
                    <div className="bg-cyan-500/20 p-2 rounded-lg text-cyan-400 group-hover:scale-110 transition-transform"><Youtube className="h-4 w-4"/></div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-semibold text-cyan-100">Video Introduction</p>
                      <p className="text-xs text-cyan-300/70">Watch pitch</p>
                    </div>
                  </a>
                )}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h3 className="text-slate-400 font-semibold mb-4 text-sm uppercase tracking-widest">Social Links</h3>
              <div className="flex flex-col gap-3">
                {portfolio?.linkedin ? (
                  <a href={portfolio.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-white group">
                    <Linkedin className="h-5 w-5 text-[#0077b5] group-hover:scale-110 transition-transform" /> LinkedIn Profile
                  </a>
                ) : (
                  <div className="flex items-center gap-3 text-slate-600"><Linkedin className="h-5 w-5" /> Not connected</div>
                )}
                
                {portfolio?.github ? (
                  <a href={portfolio.github} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-white group">
                    <Github className="h-5 w-5 text-slate-100 group-hover:scale-110 transition-transform" /> GitHub Profile
                  </a>
                ) : (
                  <div className="flex items-center gap-3 text-slate-600"><Github className="h-5 w-5" /> Not connected</div>
                )}
                
                {portfolio?.behance && (
                  <a href={portfolio.behance} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-white group">
                    <Globe className="h-5 w-5 text-[#1769ff] group-hover:scale-110 transition-transform" /> Behance Portfolio
                  </a>
                )}
              </div>
            </motion.div>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
