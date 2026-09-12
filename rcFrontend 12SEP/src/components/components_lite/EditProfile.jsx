import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import {
  User, Briefcase, GraduationCap, MapPin, Link as LinkIcon, Settings,
  Save, Loader2, ArrowLeft, Camera, FileText, X
} from "lucide-react";

import Navbar from "./Navbar";
import { USER_API_ENDPOINT, getFileUrl } from "@/utils/data";
import { setUser } from "@/redux/authSlice";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

const defaultProfile = {
  personal: { fullname: "", gender: "Male", dob: "", age: "", nationality: "", religion: "", category: "General", maritalStatus: "Single", physicallyChallenged: "No", address: "", city: "", state: "", country: "", zipCode: "", houseNumber: "", street: "", area: "" },
  contact: { mobile: "", email: "", whatsapp: "" },
  career: { title: "", industry: "", department: "", employmentType: "Full-Time", locationType: "On-site", jobType: "Permanent", locations: [], salary: { expected: "", currency: "INR" } },
  experience: { total: "", years: "", months: "", currentCompany: "", company: "", designation: "", currentSalary: "", noticePeriod: "", reasonForChange: "" },
  education: { qualification: "", college: "", passingYear: "", percentage: "" },
  skills: [{ skill: "", level: "Intermediate" }],
  certifications: [],
  portfolioLinks: { github: "", linkedin: "", behance: "", youtube: "", portfolioWebsite: "", dribbble: "", otherLinks: "" },
  workPrefs: { languages: [{ language: "English", speaking: true, reading: true, writing: true }], relocate: false, travel: false, passport: false, ownVehicle: false, drivingLicense: false, shift: "", weeklyOff: "" },
  platform: { alertChannels: ["Email"], alertFrequency: "Instant", aiResume: false, aiSkillTest: false, aiMockInterview: false, aiVoiceInterview: false, aiVideoInterview: false, aiCodingTest: false, aiAptitudeTest: false, backgroundVerification: false },
};

const EditProfile = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(defaultProfile);
  
  // Base fields
  const [fullname, setFullname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  
  // Files
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [resume, setResume] = useState(null);
  const [docUploads, setDocUploads] = useState({
    aadhaarCard: null,
    panCard: null,
    passport: null,
    drivingLicenseDoc: null,
    experienceLetter: null,
    offerLetter: null,
    salarySlip: null,
    educationalCertificates: null,
    passportSizePhoto: null,
  });

  useEffect(() => {
    if (user) {
      setFullname(user.fullname || "");
      setPhoneNumber(user.phoneNumber || "");
      setBio(user.profile?.bio || "");
      
      if (user.candidateProfile) {
        try {
          const parsed = typeof user.candidateProfile === "string" 
            ? JSON.parse(user.candidateProfile) 
            : user.candidateProfile;
          // Merge deeply
          setProfile(prev => ({
            ...prev,
            ...parsed,
            personal: { ...prev.personal, ...parsed.personal },
            contact: { ...prev.contact, ...parsed.contact },
            career: { 
              ...prev.career, 
              ...parsed.career, 
              titles: parsed.career?.titles || (parsed.career?.title ? [parsed.career.title] : []),
              locations: parsed.career?.locations || (parsed.career?.location ? [parsed.career.location] : [])
            },
            experience: { ...prev.experience, ...parsed.experience },
            education: { ...prev.education, ...parsed.education },
            portfolioLinks: { ...prev.portfolioLinks, ...parsed.portfolioLinks },
            skills: parsed.skills || prev.skills || [],
            certifications: parsed.certifications || prev.certifications || [],
            workPrefs: { ...prev.workPrefs, ...parsed.workPrefs },
          }));
        } catch (e) {
          console.error("Failed to parse candidateProfile", e);
        }
      }
    }
  }, [user]);

  const handleProfileUpdate = (section, key, value) => {
    setProfile(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value }
    }));
  };

  const handleAddSkill = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newSkill = skillInput.trim();
      if (newSkill) {
        setProfile(prev => {
          const currentSkills = prev.skills?.filter(s => s.skill) || [];
          if (!currentSkills.find(s => s.skill.toLowerCase() === newSkill.toLowerCase())) {
            return { ...prev, skills: [...currentSkills, { skill: newSkill, level: "Intermediate" }] };
          }
          return prev;
        });
        setSkillInput("");
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.skill !== skillToRemove)
    }));
  };

  const handleAddTitle = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTitle = titleInput.trim();
      if (newTitle) {
        setProfile(prev => {
          const currentTitles = prev.career?.titles || [];
          if (!currentTitles.find(t => t.toLowerCase() === newTitle.toLowerCase())) {
            return {
              ...prev,
              career: { ...prev.career, titles: [...currentTitles, newTitle] }
            };
          }
          return prev;
        });
        setTitleInput("");
      }
    }
  };

  const handleRemoveTitle = (titleToRemove) => {
    setProfile(prev => ({
      ...prev,
      career: {
        ...prev.career,
        titles: (prev.career?.titles || []).filter(t => t !== titleToRemove)
      }
    }));
  };

  const handleAddLocation = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newLoc = locationInput.trim();
      if (newLoc) {
        setProfile(prev => {
          const currentLocs = prev.career?.locations || [];
          if (!currentLocs.find(l => l.toLowerCase() === newLoc.toLowerCase())) {
            return {
              ...prev,
              career: { ...prev.career, locations: [...currentLocs, newLoc] }
            };
          }
          return prev;
        });
        setLocationInput("");
      }
    }
  };

  const handleRemoveLocation = (locToRemove) => {
    setProfile(prev => ({
      ...prev,
      career: {
        ...prev.career,
        locations: (prev.career?.locations || []).filter(l => l !== locToRemove)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("fullname", fullname);
    formData.append("phoneNumber", phoneNumber);
    formData.append("bio", bio);
    formData.append("candidateProfile", JSON.stringify(profile));
    
    // Extracted flat fields for legacy compatibility
    formData.append("city", profile.personal.city || "");
    const skillStrings = profile.skills?.map(s => s.skill).filter(Boolean).join(",") || "";
    formData.append("skills", skillStrings);
    formData.append("experience", profile.experience.total || "");
    formData.append("education", profile.education.qualification || "");
    formData.append("role", profile.career.title || "");

    if (profilePhoto) formData.append("profilePhoto", profilePhoto);
    if (resume) formData.append("resume", resume);
    Object.values(docUploads).forEach((f) => f && formData.append("verificationDocs", f));

    try {
      setLoading(true);
      const res = await axios.post(`${USER_API_ENDPOINT}/profile/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setUser(res.data.user));
        toast.success("Profile updated successfully!");
        navigate("/profile");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "career", label: "Career & Experience", icon: Briefcase },
    { id: "education", label: "Education & Skills", icon: GraduationCap },
    { id: "portfolio", label: "Links & Docs", icon: LinkIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate("/profile")} className="p-2 rounded-full hover:bg-slate-200 transition">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <h1 className="text-3xl font-black text-slate-900">Edit Profile</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/50">
              <nav className="flex flex-col gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? "text-white" : "text-slate-400"}`} />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Form Content */}
          <div className="lg:w-3/4">
            <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
              <AnimatePresence mode="wait">
                {activeTab === "personal" && (
                  <motion.div key="personal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 border-b pb-4 mb-6">Personal & Contact Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Full Name *</Label>
                        <Input value={fullname} onChange={e => setFullname(e.target.value)} required placeholder="e.g. John Doe" />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number *</Label>
                        <Input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required placeholder="+1 234 567 8900" />
                      </div>
                      <div className="space-y-2">
                        <Label>WhatsApp Number</Label>
                        <Input value={profile.contact.whatsapp || ""} onChange={e => handleProfileUpdate("contact", "whatsapp", e.target.value)} placeholder="e.g. 9876543210" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2" value={profile.personal.gender} onChange={e => handleProfileUpdate("personal", "gender", e.target.value)}>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Date of Birth</Label>
                        <Input type="date" value={profile.personal.dob} onChange={e => {
                          handleProfileUpdate("personal", "dob", e.target.value);
                          // Calculate age
                          let age = "";
                          if (e.target.value) {
                            const diff = Date.now() - new Date(e.target.value).getTime();
                            age = String(Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)));
                          }
                          handleProfileUpdate("personal", "age", age);
                        }} />
                      </div>

                      <div className="space-y-2">
                        <Label>Marital Status</Label>
                        <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2" value={profile.personal.maritalStatus} onChange={e => handleProfileUpdate("personal", "maritalStatus", e.target.value)}>
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Nationality</Label>
                        <Input value={profile.personal.nationality} onChange={e => handleProfileUpdate("personal", "nationality", e.target.value)} placeholder="e.g. Indian" />
                      </div>

                      <div className="space-y-2">
                        <Label>Category</Label>
                        <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2" value={profile.personal.category || "General"} onChange={e => handleProfileUpdate("personal", "category", e.target.value)}>
                          <option value="General">General</option>
                          <option value="OBC">OBC</option>
                          <option value="SC">SC</option>
                          <option value="ST">ST</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input value={profile.personal.city} onChange={e => handleProfileUpdate("personal", "city", e.target.value)} placeholder="e.g. Pune" />
                      </div>

                      <div className="space-y-2">
                        <Label>State</Label>
                        <Input value={profile.personal.state} onChange={e => handleProfileUpdate("personal", "state", e.target.value)} placeholder="e.g. Maharashtra" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Input value={profile.personal.country} onChange={e => handleProfileUpdate("personal", "country", e.target.value)} placeholder="e.g. India" />
                      </div>

                      <div className="space-y-2">
                        <Label>Zip Code / PIN Code</Label>
                        <Input value={profile.personal.zipCode || profile.personal.pinCode || ""} onChange={e => {
                          handleProfileUpdate("personal", "zipCode", e.target.value);
                          handleProfileUpdate("personal", "pinCode", e.target.value);
                        }} placeholder="e.g. 411014" />
                      </div>
                      <div className="space-y-2">
                        <Label>House Number</Label>
                        <Input value={profile.personal.houseNumber || ""} onChange={e => handleProfileUpdate("personal", "houseNumber", e.target.value)} placeholder="e.g. Flat 101" />
                      </div>
                      <div className="space-y-2">
                        <Label>Street</Label>
                        <Input value={profile.personal.street || ""} onChange={e => handleProfileUpdate("personal", "street", e.target.value)} placeholder="e.g. MG Road" />
                      </div>
                      <div className="space-y-2">
                        <Label>Area</Label>
                        <Input value={profile.personal.area || ""} onChange={e => handleProfileUpdate("personal", "area", e.target.value)} placeholder="e.g. Indiranagar" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Street Address / House Address</Label>
                      <Input value={profile.personal.address || profile.personal.houseAddress || ""} onChange={e => {
                        handleProfileUpdate("personal", "address", e.target.value);
                        handleProfileUpdate("personal", "houseAddress", e.target.value);
                      }} placeholder="e.g. Flat 402, Sunshine Apartments" />
                    </div>

                    <div className="space-y-2">
                      <Label>Bio / About Me</Label>
                      <textarea
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        placeholder="Write a short professional summary..."
                      />
                    </div>
                  </motion.div>
                )}

                {activeTab === "career" && (
                  <motion.div key="career" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 border-b pb-4 mb-6">Career & Experience</h2>
                    
                    <div className="space-y-4">
                      {/* Target Job Roles / Titles Multi-tag */}
                      <div className="space-y-2">
                        <Label>Target Job Titles / Roles (Type and press Enter or Comma)</Label>
                        <div className="flex flex-wrap gap-2 mb-2 p-2 border border-slate-200 rounded-lg min-h-[42px] bg-white">
                          {(profile.career?.titles || []).map((t, idx) => (
                            <span key={idx} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-sm font-medium border border-indigo-100">
                              {t}
                              <button
                                type="button"
                                onClick={() => handleRemoveTitle(t)}
                                className="text-indigo-400 hover:text-indigo-700 hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                          <input
                            type="text"
                            value={titleInput}
                            onChange={(e) => setTitleInput(e.target.value)}
                            onKeyDown={handleAddTitle}
                            className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
                            placeholder="e.g. Frontend Developer, React Engineer"
                          />
                        </div>
                      </div>

                      {/* Preferred Locations Multi-tag */}
                      <div className="space-y-2">
                        <Label>Preferred Job Locations (Type and press Enter or Comma)</Label>
                        <div className="flex flex-wrap gap-2 mb-2 p-2 border border-slate-200 rounded-lg min-h-[42px] bg-white">
                          {(profile.career?.locations || []).map((l, idx) => (
                            <span key={idx} className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-sm font-medium border border-emerald-100">
                              {l}
                              <button
                                type="button"
                                onClick={() => handleRemoveLocation(l)}
                                className="text-emerald-400 hover:text-emerald-700 hover:bg-emerald-200 rounded-full p-0.5 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                          <input
                            type="text"
                            value={locationInput}
                            onChange={(e) => setLocationInput(e.target.value)}
                            onKeyDown={handleAddLocation}
                            className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
                            placeholder="e.g. Bangalore, Remote, Mumbai"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Preferred Industry</Label>
                        <Input value={profile.career.industry || ""} onChange={e => handleProfileUpdate("career", "industry", e.target.value)} placeholder="e.g. IT, Finance" />
                      </div>

                      <div className="space-y-2">
                        <Label>Employment Type</Label>
                        <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2" value={profile.career.employmentType} onChange={e => handleProfileUpdate("career", "employmentType", e.target.value)}>
                          <option value="Full-Time">Full-Time</option>
                          <option value="Part-Time">Part-Time</option>
                          <option value="Contract">Contract</option>
                          <option value="Internship">Internship</option>
                          <option value="Freelance">Freelance</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Work Mode</Label>
                        <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2" value={profile.career.workMode || "Hybrid"} onChange={e => handleProfileUpdate("career", "workMode", e.target.value)}>
                          <option value="Work From Office">Work From Office</option>
                          <option value="Work From Home">Work From Home</option>
                          <option value="Hybrid">Hybrid</option>
                          <option value="Remote">Remote</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Preferred Shift</Label>
                        <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2" value={profile.workPrefs?.shift || ""} onChange={e => handleProfileUpdate("workPrefs", "shift", e.target.value)}>
                          <option value="">No Preference</option>
                          <option value="Day Shift">Day Shift</option>
                          <option value="Night Shift">Night Shift</option>
                          <option value="Rotational">Rotational</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Job Type</Label>
                        <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2" value={profile.career.jobType} onChange={e => handleProfileUpdate("career", "jobType", e.target.value)}>
                          <option value="Permanent">Permanent</option>
                          <option value="Contract">Contract</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Expected Salary (per year)</Label>
                        <Input value={profile.career.salary?.expected || profile.salary?.expected || ""} onChange={e => {
                          setProfile(p => ({
                            ...p,
                            career: {
                              ...p.career,
                              salary: { ...p.career.salary, expected: e.target.value }
                            },
                            salary: { ...p.salary, expected: e.target.value }
                          }));
                        }} placeholder="e.g. 1200000" type="number" />
                      </div>

                      <div className="space-y-2">
                        <Label>Total Experience (Years)</Label>
                        <Input value={profile.experience.years || profile.experience.total || ""} onChange={e => {
                          handleProfileUpdate("experience", "years", e.target.value);
                          handleProfileUpdate("experience", "total", e.target.value);
                        }} placeholder="e.g. 5" type="number" />
                      </div>
                      <div className="space-y-2">
                        <Label>Total Experience (Months)</Label>
                        <Input value={profile.experience.months || ""} onChange={e => handleProfileUpdate("experience", "months", e.target.value)} placeholder="e.g. 6" type="number" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Current Company</Label>
                        <Input value={profile.experience.company || profile.experience.currentCompany || ""} onChange={e => {
                          handleProfileUpdate("experience", "company", e.target.value);
                          handleProfileUpdate("experience", "currentCompany", e.target.value);
                        }} placeholder="e.g. Tech Corp" />
                      </div>

                      <div className="space-y-2">
                        <Label>Current Designation</Label>
                        <Input value={profile.experience.designation || ""} onChange={e => handleProfileUpdate("experience", "designation", e.target.value)} placeholder="e.g. Senior Developer" />
                      </div>
                      <div className="space-y-2">
                        <Label>Notice Period</Label>
                        <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2" value={profile.experience.noticePeriod || ""} onChange={e => handleProfileUpdate("experience", "noticePeriod", e.target.value)}>
                          <option value="Immediate">Immediate</option>
                          <option value="15 Days">15 Days</option>
                          <option value="30 Days">30 Days</option>
                          <option value="60 Days">60 Days</option>
                          <option value="90 Days">90 Days</option>
                        </select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Reason for Job Change</Label>
                        <textarea
                          value={profile.experience.reasonForChange || ""}
                          onChange={e => handleProfileUpdate("experience", "reasonForChange", e.target.value)}
                          className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                          placeholder="e.g. Looking for better growth opportunities and exposure to modern technical stacks."
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "education" && (
                  <motion.div key="education" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 border-b pb-4 mb-6">Education & Skills</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Highest Qualification</Label>
                        <Input value={profile.education.qualification} onChange={e => handleProfileUpdate("education", "qualification", e.target.value)} placeholder="e.g. B.Tech in Computer Science" />
                      </div>
                      <div className="space-y-2">
                        <Label>College / University</Label>
                        <Input value={profile.education.college} onChange={e => handleProfileUpdate("education", "college", e.target.value)} placeholder="e.g. MIT" />
                      </div>
                      <div className="space-y-2">
                        <Label>Passing Year</Label>
                        <Input value={profile.education.passingYear || ""} onChange={e => handleProfileUpdate("education", "passingYear", e.target.value)} placeholder="e.g. 2022" />
                      </div>
                      <div className="space-y-2">
                        <Label>Percentage / CGPA</Label>
                        <Input value={profile.education.percentage || ""} onChange={e => handleProfileUpdate("education", "percentage", e.target.value)} placeholder="e.g. 85% or 8.5 CGPA" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Skills (Type and press Enter or Comma)</Label>
                      <div className="flex flex-wrap gap-2 mb-2 p-2 border border-slate-200 rounded-lg min-h-[42px]">
                        {profile.skills?.filter(s => s.skill).map((s, idx) => (
                          <span key={idx} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-sm font-medium border border-blue-100">
                            {s.skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(s.skill)}
                              className="text-blue-400 hover:text-blue-700 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={handleAddSkill}
                          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
                          placeholder="e.g. React, Node.js"
                        />
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className="space-y-4 mt-6">
                      <Label>Certifications</Label>
                      <div className="space-y-2">
                        {profile.certifications?.map((c, i) => (
                          <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3">
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{c.name}</p>
                              <p className="text-slate-500 text-xs">{c.issuer}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setProfile(p => ({
                                  ...p,
                                  certifications: p.certifications.filter((_, idx) => idx !== i)
                                }));
                              }}
                              className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Certification */}
                      <div className="flex flex-col gap-3 bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
                        <Input
                          id="new-cert-name"
                          placeholder="Certification Name"
                          className="bg-white"
                        />
                        <Input
                          id="new-cert-issuer"
                          placeholder="Issuer (e.g. Google, Udemy)"
                          className="bg-white"
                        />
                        <div className="flex gap-2 flex-1 w-full">
                          <Input
                            id="new-cert-issueDate"
                            type="date"
                            placeholder="Issue Date"
                            className="bg-white flex-1"
                          />
                          <Input
                            id="new-cert-expiryDate"
                            type="date"
                            placeholder="Expiry Date"
                            className="bg-white flex-1"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={() => {
                            const nameEl = document.getElementById("new-cert-name");
                            const issuerEl = document.getElementById("new-cert-issuer");
                            const issueDateEl = document.getElementById("new-cert-issueDate");
                            const expiryDateEl = document.getElementById("new-cert-expiryDate");
                            if (nameEl && issuerEl && nameEl.value.trim() && issuerEl.value.trim()) {
                              setProfile(p => ({
                                ...p,
                                certifications: [
                                  ...(p.certifications || []),
                                  { 
                                    name: nameEl.value.trim(), 
                                    issuer: issuerEl.value.trim(),
                                    issueDate: issueDateEl?.value || "",
                                    expiryDate: expiryDateEl?.value || "",
                                  }
                                ]
                              }));
                              nameEl.value = "";
                              issuerEl.value = "";
                              if (issueDateEl) issueDateEl.value = "";
                              if (expiryDateEl) expiryDateEl.value = "";
                            } else {
                              toast.error("Please fill both Certification Name and Issuer");
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "portfolio" && (
                  <motion.div key="portfolio" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 border-b pb-4 mb-6">Links & Documents</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>LinkedIn URL</Label>
                        <Input value={profile.portfolioLinks.linkedin || ""} onChange={e => handleProfileUpdate("portfolioLinks", "linkedin", e.target.value)} placeholder="https://linkedin.com/in/username" />
                      </div>
                      <div className="space-y-2">
                        <Label>GitHub URL</Label>
                        <Input value={profile.portfolioLinks.github || ""} onChange={e => handleProfileUpdate("portfolioLinks", "github", e.target.value)} placeholder="https://github.com/username" />
                      </div>
                      <div className="space-y-2">
                        <Label>Portfolio Website</Label>
                        <Input value={profile.portfolioLinks.portfolioWebsite || ""} onChange={e => handleProfileUpdate("portfolioLinks", "portfolioWebsite", e.target.value)} placeholder="https://yourportfolio.com" />
                      </div>
                      <div className="space-y-2">
                        <Label>Dribbble URL</Label>
                        <Input value={profile.portfolioLinks.dribbble || ""} onChange={e => handleProfileUpdate("portfolioLinks", "dribbble", e.target.value)} placeholder="https://dribbble.com/username" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Other Links</Label>
                        <Input value={profile.portfolioLinks.otherLinks || ""} onChange={e => handleProfileUpdate("portfolioLinks", "otherLinks", e.target.value)} placeholder="Any other links" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 border-t pt-6">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Camera className="h-4 w-4" /> Update Profile Photo</Label>
                        <div className="flex items-center gap-4 mt-2">
                          <img src={profilePhoto ? URL.createObjectURL(profilePhoto) : getFileUrl(user.profilePhoto) || "/default-avatar.svg"} className="h-16 w-16 rounded-full object-cover border-2 border-slate-200" alt="Preview"/>
                          <Input type="file" accept="image/*" onChange={e => setProfilePhoto(e.target.files?.[0])} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><FileText className="h-4 w-4" /> Update Resume</Label>
                        <div className="mt-2">
                          <Input type="file" accept="application/pdf" onChange={e => setResume(e.target.files?.[0])} />
                          {user.resumeOriginalName && !resume && (
                            <p className="text-xs text-emerald-600 mt-2 font-medium">Current: {user.resumeOriginalName}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6 mt-6">
                      <Label className="text-sm font-bold text-slate-900 mb-4 block">Official Verification Documents</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <Label className="text-xs">Aadhaar Card (PDF/Image)</Label>
                          <Input type="file" accept=".pdf,image/*" onChange={e => setDocUploads({...docUploads, aadhaarCard: e.target.files?.[0]})} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">PAN Card (PDF/Image)</Label>
                          <Input type="file" accept=".pdf,image/*" onChange={e => setDocUploads({...docUploads, panCard: e.target.files?.[0]})} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Passport (Optional)</Label>
                          <Input type="file" accept=".pdf,image/*" onChange={e => setDocUploads({...docUploads, passport: e.target.files?.[0]})} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Driving License (Optional)</Label>
                          <Input type="file" accept=".pdf,image/*" onChange={e => setDocUploads({...docUploads, drivingLicenseDoc: e.target.files?.[0]})} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Experience Letter</Label>
                          <Input type="file" accept=".pdf,image/*" onChange={e => setDocUploads({...docUploads, experienceLetter: e.target.files?.[0]})} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Offer Letter</Label>
                          <Input type="file" accept=".pdf,image/*" onChange={e => setDocUploads({...docUploads, offerLetter: e.target.files?.[0]})} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Salary Slip</Label>
                          <Input type="file" accept=".pdf,image/*" onChange={e => setDocUploads({...docUploads, salarySlip: e.target.files?.[0]})} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Educational Certificates</Label>
                          <Input type="file" accept=".pdf,image/*" onChange={e => setDocUploads({...docUploads, educationalCertificates: e.target.files?.[0]})} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Passport Size Photo</Label>
                          <Input type="file" accept="image/*" onChange={e => setDocUploads({...docUploads, passportSizePhoto: e.target.files?.[0]})} />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6 mt-6">
                      <Label className="text-sm font-bold text-slate-900 mb-4 block">AI Feature Opt-ins</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={profile.platform?.aiResume || false} onChange={e => handleProfileUpdate("platform", "aiResume", e.target.checked)} className="rounded border-slate-300 text-blue-600" />
                          <span>AI Resume Builder</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={profile.platform?.aiSkillTest || false} onChange={e => handleProfileUpdate("platform", "aiSkillTest", e.target.checked)} className="rounded border-slate-300 text-blue-600" />
                          <span>AI Skill Test</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={profile.platform?.aiMockInterview || false} onChange={e => handleProfileUpdate("platform", "aiMockInterview", e.target.checked)} className="rounded border-slate-300 text-blue-600" />
                          <span>AI Mock Interview</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={profile.platform?.aiVoiceInterview || false} onChange={e => handleProfileUpdate("platform", "aiVoiceInterview", e.target.checked)} className="rounded border-slate-300 text-blue-600" />
                          <span>AI Voice Practice</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={profile.platform?.aiVideoInterview || false} onChange={e => handleProfileUpdate("platform", "aiVideoInterview", e.target.checked)} className="rounded border-slate-300 text-blue-600" />
                          <span>AI Video Practice</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={profile.platform?.aiCodingTest || false} onChange={e => handleProfileUpdate("platform", "aiCodingTest", e.target.checked)} className="rounded border-slate-300 text-blue-600" />
                          <span>AI Coding Practice</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={profile.platform?.aiAptitudeTest || false} onChange={e => handleProfileUpdate("platform", "aiAptitudeTest", e.target.checked)} className="rounded border-slate-300 text-blue-600" />
                          <span>AI Aptitude Practice</span>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-10 pt-6 border-t border-slate-200 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-6 rounded-xl text-lg shadow-lg shadow-blue-500/30 transition-all duration-300"
                >
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
