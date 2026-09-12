import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { JOB_API_ENDPOINT, APPLICATION_API_ENDPOINT, API_URL, getFileUrl } from "@/utils/data";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setSingleJob, toggleSavedJobId } from "@/redux/jobSlice";
import { USER_API_ENDPOINT } from "@/utils/data";
import { toast } from "sonner";
import Navbar from "./Navbar";
import {
  MapPin, DollarSign, Briefcase, Clock, Users, Calendar, CheckCircle2,
  Upload, ArrowLeft, Building2, Star, Share2, Bookmark, Download, User, Mail, Phone, X
} from "lucide-react";

const formatExternalUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
};

const Description = () => {
  const params = useParams();
  const jobId = params.id;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { singleJob } = useSelector((store) => store.job);
  const { user } = useSelector((store) => store.auth);

  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState(null);
  const [showRecruiterModal, setShowRecruiterModal] = useState(false);
  const { savedJobIds } = useSelector((store) => store.job);
  const isSaved = savedJobIds?.includes(String(jobId));

  const handleToggleSave = async () => {
    if (!user) {
      toast.error("Please login to save jobs");
      return;
    }
    try {
      const res = await axios.post(`${USER_API_ENDPOINT}/saved-jobs/${jobId}`, {}, {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(toggleSavedJobId(jobId));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const hasExistingResume = Boolean(user?.profile?.resume);

  const hasUserApplied = (applications = []) =>
    applications.some((app) => {
      const applicant = app?.applicant;
      const applicantId = typeof applicant === "object"
        ? (applicant?._id || applicant?.id)
        : applicant;
      const userId = user?._id || user?.id;
      return String(applicantId) === String(userId);
    });

  const [isApplied, setIsApplied] = useState(hasUserApplied(singleJob?.applications) || false);

  const applyJobHandler = async () => {
    if (!user) {
      toast.info("Please login to apply for this job");
      navigate("/login");
      return;
    }
    if (!resume && !hasExistingResume) {
      return toast.error("Please upload your resume before applying");
    }

    try {
      const formData = new FormData();
      if (resume) {
        formData.append("file", resume);
      }
      // If no new file, backend will use the user's saved resume automatically

      const res = await axios.post(
        `${APPLICATION_API_ENDPOINT}/apply/${jobId}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data.success) {
        toast.success("Application submitted successfully! 🎉");
        setIsApplied(true);
        dispatch(setSingleJob({
          ...singleJob,
          applications: [
            ...(singleJob.applications || []),
            { applicant: user?._id || user?.id },
          ],
        }));
      }
    } catch (error) {
      if (error?.response?.data?.message === "Already applied") {
        setIsApplied(true);
        toast.info("You have already applied for this job");
      } else {
        toast.error(error?.response?.data?.message || "Something went wrong");
      }
    }
  };

  useEffect(() => {
    const fetchSingleJobs = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${JOB_API_ENDPOINT}/get/${jobId}`, { withCredentials: true });
        if (res.data.status) {
          dispatch(setSingleJob(res.data.job));
          setIsApplied(hasUserApplied(res.data.job.applications));
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSingleJobs();
  }, [jobId, dispatch, user?._id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
            <p className="text-slate-500 font-medium">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!singleJob) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-slate-400">
          <Briefcase className="h-20 w-20 mb-4 opacity-20" />
          <p className="text-xl font-bold">Job not found</p>
        </div>
      </div>
    );
  }

  let parsedDetails = {};
  if (singleJob?.jobDetails) {
    try { parsedDetails = typeof singleJob.jobDetails === "string" ? JSON.parse(singleJob.jobDetails) : singleJob.jobDetails; } catch(e){}
  }
  const skillsList = parsedDetails?.skills
    ? (Array.isArray(parsedDetails.skills) 
       ? parsedDetails.skills 
       : typeof parsedDetails.skills === "string" 
       ? parsedDetails.skills.split(",").map((s) => s.trim()).filter(Boolean) 
       : [])
    : [];
  const candidatePref = parsedDetails?.candidatePreference || {};
  const locationObj = parsedDetails?.location || {};
  const formattedLocation = [
    locationObj.area,
    locationObj.city,
    locationObj.state,
    locationObj.pinCode,
    locationObj.country
  ].filter(Boolean).join(", ");
  const interviewObj = parsedDetails?.interview || {};
  const contactObj = parsedDetails?.companyContact || {};
  const requireReason = parsedDetails?.requireReasonForLeaving || false;
  const actualJobType = parsedDetails.employmentType || singleJob?.jobType || "Full-Time";

  const details = [
    { icon: MapPin, label: "Location", value: singleJob?.location },
    { icon: DollarSign, label: "Salary", value: `${singleJob?.salary}${String(singleJob?.salary || "").toLowerCase().includes("lpa") ? "" : " LPA"}` },
    { icon: Briefcase, label: "Job Type", value: actualJobType },
    { icon: Clock, label: "Experience", value: `${singleJob?.experienceLevel || 0} Years` },
    { icon: Users, label: "Positions", value: singleJob?.position },
    { icon: Users, label: "Applicants", value: singleJob?.applications?.length || 0 },
    { icon: Calendar, label: "Posted", value: singleJob?.createdAt?.split("T")[0] },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-cyan-50/10">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Jobs
        </motion.button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 space-y-5"
          >
            {/* Job header card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white font-black text-2xl shadow-lg">
                    {(singleJob?.title || "J")[0]}
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 flex flex-wrap items-center gap-2">
                      {singleJob?.title}
                      {singleJob?.status === "closed" && (
                        <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                          Closed
                        </span>
                      )}
                    </h1>
                    <p className="text-slate-500 flex items-center gap-1.5 mt-1 text-sm">
                      <Building2 className="h-4 w-4 flex-shrink-0" />
                      {singleJob?.company?.name || "Company"}
                    </p>
                    {singleJob?.creatorName && (
                      <p className="text-slate-500 flex items-center gap-1.5 mt-1 text-sm">
                        <User className="h-4 w-4 flex-shrink-0" />
                        Posted by: <button onClick={() => setShowRecruiterModal(true)} className="font-semibold text-blue-600 hover:underline">{singleJob.creatorName}</button>
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="rounded-full bg-blue-100 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700">{actualJobType}</span>
                      <span className="rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">{singleJob?.location}</span>
                      <span className="rounded-full bg-orange-100 border border-orange-200 px-3 py-1 text-xs font-bold text-orange-700">{singleJob?.salary}{String(singleJob?.salary || "").toLowerCase().includes("lpa") ? "" : " LPA"}</span>
                    </div>
                  </div>
                </div>
                {user?.role !== "Admin" && user?.role !== "Recruiter" && (
                  <div className="flex gap-2 self-end sm:self-auto">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleToggleSave}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${isSaved ? "border-blue-300 bg-blue-100 text-blue-600" : "border-slate-200 bg-white text-slate-400 hover:border-blue-300"}`}
                    >
                      <Bookmark className={`h-4 w-4 ${isSaved ? "fill-blue-600" : ""}`} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:border-blue-300 transition-colors"
                    >
                      <Share2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-900">Job Description</h2>
                {singleJob?.jdUrl && (
                  <a
                    href={`${API_URL || "http://localhost:8000"}${singleJob.jdUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4" /> Official JD
                  </a>
                )}
              </div>
              <div className="prose max-w-none text-slate-600 leading-relaxed">
                {(() => {
                  const desc = singleJob?.description;
                  if (!desc) return null;
                  let lines = desc.split(/\r?\n|•|\*|;\s*/).map(line => line.trim()).filter(Boolean);
                  if (lines.length <= 1) {
                    lines = desc.split(/[.!?]+\s+/).map(line => line.trim()).filter(Boolean);
                  }
                  return (
                    <ul className="list-disc pl-5 space-y-2 text-slate-700 text-sm md:text-base">
                      {lines.map((line, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {line.endsWith(".") ? line : line + "."}
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>
            </div>

            {/* Requirements & Skills */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Requirements & Skills</h2>
              {singleJob?.requirements && (
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Requirements</h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-700 text-sm">
                    {(Array.isArray(singleJob.requirements) 
                      ? singleJob.requirements 
                      : typeof singleJob.requirements === "string" 
                      ? singleJob.requirements.split(/[,;\n]+/).map(r => r.trim()).filter(Boolean) 
                      : []
                    ).map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
              {skillsList.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Technical Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {skillsList.map((skill, i) => (
                      <span key={i} className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Details grid */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Job Details & Preferences</h2>
              
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {details.map((detail, i) => (
                  <motion.div
                    key={detail.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="rounded-2xl bg-slate-50 p-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <detail.icon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{detail.label}</span>
                    </div>
                    <p className="font-bold text-slate-900 text-sm">{detail.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Extra parsed specifications */}
              <div className="mt-6 border-t border-slate-100 pt-6">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Additional Preferences & Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Highest Qualification</span>
                    <span className="font-semibold text-slate-950">{parsedDetails.qualification || "Any"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Freshers Eligible</span>
                    <span className="font-semibold text-slate-950">{parsedDetails.freshersEligible ? "Yes" : "No"}</span>
                  </div>
                  {parsedDetails.freshersEligible === false && (
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-500">Leaving Reason Required</span>
                      <span className="font-semibold text-slate-950">{requireReason ? "Yes" : "No"}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Languages Required</span>
                    <span className="font-semibold text-slate-950">{parsedDetails.languages?.join(", ") || "English, Hindi"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Notice Period Accepted</span>
                    <span className="font-semibold text-slate-950">{parsedDetails.noticePeriod || "Immediate"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Immediate Joining</span>
                    <span className="font-semibold text-slate-950">{parsedDetails.immediateJoining || "No"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Age Limit Range</span>
                    <span className="font-semibold text-slate-950">
                      {parsedDetails.ageMin && parsedDetails.ageMax ? `${parsedDetails.ageMin} - ${parsedDetails.ageMax} Years` : "Any Age"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Gender Preference</span>
                    <span className="font-semibold text-slate-950">{candidatePref.gender || "No Preference"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Marital Status</span>
                    <span className="font-semibold text-slate-950">{candidatePref.maritalStatus || "No Preference"}</span>
                  </div>
                  {candidatePref.religion && candidatePref.religion !== "No Preference" && (
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-500">Religion Preference</span>
                      <span className="font-semibold text-slate-950">{candidatePref.religion}</span>
                    </div>
                  )}
                  {candidatePref.caste && candidatePref.caste !== "No Preference" && (
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-500">Caste Preference</span>
                      <span className="font-semibold text-slate-950">{candidatePref.caste}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Shift Type</span>
                    <span className="font-semibold text-slate-950">{parsedDetails.shiftType || "Day"} ({parsedDetails.workingTime || "Flexible hours"})</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Weekly Off</span>
                    <span className="font-semibold text-slate-950">{parsedDetails.weeklyOff || "Sunday"}</span>
                  </div>
                </div>
              </div>

              {/* Documents checklist */}
              {parsedDetails.docsRequired && parsedDetails.docsRequired.length > 0 && (
                <div className="mt-6 border-t border-slate-100 pt-6">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Documents Required from Candidate</h3>
                  <div className="flex flex-wrap gap-2">
                    {parsedDetails.docsRequired.map((doc, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 rounded-xl bg-rose-50 border border-rose-100 px-3.5 py-1.5 text-xs font-bold text-rose-700">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Specification Card */}
              {locationObj.city && (
                <div className="mt-6 border-t border-slate-100 pt-6">
                  <h3 className="text-sm font-bold text-slate-800 mb-2">Detailed Work Location</h3>
                  <div className="text-sm text-slate-600 bg-slate-50 border border-slate-100 p-4 rounded-2xl leading-relaxed space-y-1.5">
                    {locationObj.building && <p><strong>Building/Office:</strong> {locationObj.building}</p>}
                    {locationObj.floor && <p><strong>Floor/Suite:</strong> {locationObj.floor}</p>}
                    {locationObj.sectorLocality && <p><strong>Sector/Locality:</strong> {locationObj.sectorLocality}</p>}
                    {locationObj.landmark && <p><strong>Landmark:</strong> {locationObj.landmark}</p>}
                    <p><strong>Address:</strong> {formattedLocation}</p>
                    {locationObj.googleMapsUrl && (
                      <div className="pt-2">
                        <a
                          href={formatExternalUrl(locationObj.googleMapsUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                          <MapPin className="h-3.5 w-3.5" /> View Office on Google Maps →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Interview Info */}
            {interviewObj.mode && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Interview Schedule & Venue</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
                  <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4">
                    <span className="text-xs text-indigo-500 font-bold uppercase tracking-wider block mb-1">Interview Mode</span>
                    <p className="font-bold text-indigo-950 text-base">{interviewObj.mode}</p>
                  </div>
                  <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4">
                    <span className="text-xs text-indigo-500 font-bold uppercase tracking-wider block mb-1">Date & Time</span>
                    <p className="font-bold text-indigo-950 text-base">
                      {interviewObj.date || interviewObj.time
                        ? `${interviewObj.date || ""} ${interviewObj.time || ""}`
                        : interviewObj.dateTime
                        ? new Date(interviewObj.dateTime).toLocaleString()
                        : "Walk-in basis"}
                    </p>
                  </div>
                </div>
                {interviewObj.venue && (
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 mb-3">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Venue / Online Link</span>
                    <p className="font-semibold text-slate-900">{interviewObj.venue}</p>
                  </div>
                )}
                {interviewObj.instructions && (
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Special Instructions</span>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line text-sm">{interviewObj.instructions}</p>
                  </div>
                )}
              </div>
            )}

            {/* Contact Details (shown if recruiter allowed calls) */}
            {parsedDetails.canCall && contactObj.contactPerson && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center"><User className="h-4 w-4 text-emerald-600" /></div>
                    <div>
                      <p className="text-slate-400 text-xs">Contact Person</p>
                      <p className="font-semibold text-slate-900">{contactObj.contactPerson} ({contactObj.name || "HR"})</p>
                    </div>
                  </div>
                  {contactObj.phone && (
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center"><Phone className="h-4 w-4 text-emerald-600" /></div>
                      <div>
                        <p className="text-slate-400 text-xs">Phone Number</p>
                        <p className="font-semibold text-slate-900">+91 {contactObj.phone}</p>
                      </div>
                    </div>
                  )}
                  {contactObj.whatsappNumber && (
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">💬</div>
                      <div>
                        <p className="text-slate-400 text-xs">WhatsApp Number</p>
                        <p className="font-semibold text-slate-900">+91 {contactObj.whatsappNumber}</p>
                      </div>
                    </div>
                  )}
                  {contactObj.landline && (
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">📞</div>
                      <div>
                        <p className="text-slate-400 text-xs">Landline Number</p>
                        <p className="font-semibold text-slate-900">{contactObj.landline}</p>
                      </div>
                    </div>
                  )}
                  {contactObj.email && (
                    <div className="flex items-center gap-3 sm:col-span-2">
                      <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center"><Mail className="h-4 w-4 text-emerald-600" /></div>
                      <div>
                        <p className="text-slate-400 text-xs">Email Address</p>
                        <p className="font-semibold text-slate-900">{contactObj.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {user?.role === "Admin" && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100 mt-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" /> Applicants List ({singleJob?.applications?.length || 0})
                </h2>
                
                {(!singleJob?.applications || singleJob.applications.length === 0) ? (
                  <p className="text-sm text-slate-400 text-center py-6">No candidates have applied to this job yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm text-slate-600">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                          <th className="py-3 px-4">Candidate Name</th>
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4">Recruiter Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {singleJob.applications.map((app) => (
                          <tr key={app._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-900">
                              {app.applicant?.fullname || "Unknown Candidate"}
                            </td>
                            <td className="py-3 px-4 text-slate-500">
                              {app.applicant?.email || "N/A"}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                app.status === "accepted" || app.status === "hired" ? "bg-emerald-100 text-emerald-700" :
                                app.status === "rejected" ? "bg-rose-100 text-rose-700" :
                                "bg-amber-100 text-amber-700"
                              }`}>
                                {app.status || "pending"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Apply sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="sticky top-20 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100">
              {user?.role === "Admin" || user?.role === "Recruiter" ? (
                <>
                  <h2 className="text-lg font-bold text-slate-900 mb-5">Management View</h2>
                  <div className="rounded-xl bg-blue-50 p-4 border border-blue-200">
                    <p className="text-sm font-semibold text-blue-700 text-center">
                      You are viewing this job as a{user.role === "Admin" ? "n Admin" : " Recruiter"}.
                      <br />
                      Applying is disabled for your account.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-slate-900 mb-5">Apply for this Job</h2>
                  {singleJob?.status === "closed" ? (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center">
                      <p className="font-bold text-rose-600 text-sm">
                        This job is now closed.
                      </p>
                      <p className="text-xs text-rose-500 mt-1">
                        You can no longer apply for this position.
                      </p>
                    </div>
                  ) : isApplied ? (
                    <div className="flex flex-col items-center gap-3 py-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                      </div>
                      <p className="font-bold text-emerald-700 text-center">Application Submitted!</p>
                      <p className="text-xs text-slate-500 text-center">We'll notify you about the status</p>
                      <ChatRequestButton jobId={jobId} />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Resume upload */}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Resume</label>
                        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200">
                          <Upload className="h-6 w-6 text-slate-400" />
                          <span className="text-xs text-slate-500 text-center">
                            {resume ? resume.name : hasExistingResume ? "Using saved resume (click to replace)" : "Upload your resume"}
                          </span>
                          <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResume(e.target.files[0])} className="sr-only" />
                        </label>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={applyJobHandler}
                        className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all duration-200"
                      >
                        Apply Now
                      </motion.button>
                    </div>
                  )}
                </>
              )}

              {/* Company info */}
              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white font-black">
                    {(singleJob?.company?.name || "C")[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{singleJob?.company?.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      ))}
                      <span className="text-xs text-slate-500 ml-1">Top Employer</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* JD Download Card */}
              {singleJob?.jdUrl && (
                <div className="mt-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-5 shadow-sm">
                  <h3 className="text-sm font-black text-blue-900 mb-1 uppercase tracking-wider">Official Document</h3>
                  <p className="text-[11px] text-blue-700 mb-3 font-medium">Download the complete official Job Description.</p>
                  <a
                    href={`${API_URL || "http://localhost:8000"}${singleJob.jdUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    <Download className="h-4 w-4" /> Download JD
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showRecruiterModal && singleJob?.creatorName && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6"
            onClick={() => setShowRecruiterModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-white z-10">
                <h3 className="text-lg font-bold text-slate-900">Recruiter Details</h3>
                <button
                  onClick={() => setShowRecruiterModal(false)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-start gap-5">
                  {singleJob?.creatorPhoto ? (
                    <img src={getFileUrl(singleJob.creatorPhoto)} alt="Recruiter" className="h-20 w-20 rounded-2xl object-cover ring-4 ring-slate-50 shadow-md" />
                  ) : (
                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white font-black text-3xl shadow-md ring-4 ring-slate-50">
                      {singleJob.creatorName[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xl font-black text-slate-900">{singleJob.creatorName}</h4>
                    <span className="inline-block rounded-full bg-blue-100 px-3 py-0.5 mt-1 text-[11px] font-bold text-blue-700">Job Poster</span>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm"><Mail className="h-4 w-4 text-slate-400" /></div>
                    <span className="font-medium">{singleJob.creatorEmail}</span>
                  </div>
                  {singleJob.creatorProfile?.contact?.mobile && (
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm"><Phone className="h-4 w-4 text-slate-400" /></div>
                      <span className="font-medium">+91 {singleJob.creatorProfile.contact.mobile}</span>
                    </div>
                  )}
                  {singleJob.creatorCompany && (
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm"><Building2 className="h-4 w-4 text-slate-400" /></div>
                      <span className="font-medium">{singleJob.creatorCompany}</span>
                    </div>
                  )}
                  {singleJob.creatorProfile?.contact?.department && (
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm"><Briefcase className="h-4 w-4 text-slate-400" /></div>
                      <span className="font-medium">{singleJob.creatorProfile.contact.designation || "Recruiter"} - {singleJob.creatorProfile.contact.department}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Description;
