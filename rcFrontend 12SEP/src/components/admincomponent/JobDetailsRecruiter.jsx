import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { JOB_API_ENDPOINT, API_URL } from "@/utils/data";
import { motion } from "framer-motion";
import Navbar from "../components_lite/Navbar";
import {
  Briefcase,
  MapPin,
  Wallet,
  Clock,
  ArrowLeft,
  Building2,
  Users,
  Calendar,
  FileText,
  Download,
  User,
  Mail,
  Phone,
  CheckCircle2
} from "lucide-react";
import Applicants from "./Applicants";

const JobDetailsRecruiter = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${JOB_API_ENDPOINT}/get/${id}`, { withCredentials: true });
        if (res.data.status || res.data.success) {
          setJob(res.data.job);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-500">Loading Job Details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-bold text-slate-600">Job not found.</p>
      </div>
    );
  }

  const jobDetailsData = job.jobDetails ? (typeof job.jobDetails === "string" ? JSON.parse(job.jobDetails) : job.jobDetails) : {};
  const candidatePref = jobDetailsData?.candidatePreference || {};
  const locationObj = jobDetailsData?.location || {};
  const formattedLocation = [
    locationObj.area,
    locationObj.city,
    locationObj.state,
    locationObj.pinCode,
    locationObj.country
  ].filter(Boolean).join(", ");
  const interview = jobDetailsData?.interview || {};
  const contact = jobDetailsData?.companyContact || {};
  const skillsList = jobDetailsData?.skills
    ? (Array.isArray(jobDetailsData.skills) 
       ? jobDetailsData.skills 
       : typeof jobDetailsData.skills === "string" 
       ? jobDetailsData.skills.split(",").map((s) => s.trim()).filter(Boolean) 
       : [])
    : [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate("/recruiter/jobs")}
            className="group mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Dashboard
          </button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-black text-white shadow-lg">
                {(job.title || "J")[0]}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  {job.title}
                  {job.jobCode && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold tracking-wider text-slate-500">
                      {job.jobCode}
                    </span>
                  )}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
                  <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4 text-blue-500" /> {job.company?.name || "Company"}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-emerald-500" /> {job.location}</span>
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <div className={`h-1.5 w-1.5 rounded-full ${job.status === 'open' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                    {job.status === 'open' ? 'Actively Hiring' : 'Closed'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center bg-blue-50 rounded-xl px-5 py-2.5 border border-blue-100">
                <span className="text-xl font-black text-blue-600">{job.applications?.length || 0}</span>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Applicants</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-8 mt-8 border-b border-slate-200">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-3 text-sm font-bold transition-all relative ${
                activeTab === "overview" ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Job Overview
              {activeTab === "overview" && (
                <motion.div layoutId="tabIndicator" className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("applicants")}
              className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 ${
                activeTab === "applicants" ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Applicants 
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'applicants' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                {job.applications?.length || 0}
              </span>
              {activeTab === "applicants" && (
                <motion.div layoutId="tabIndicator" className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" /> Description
                </h2>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </div>
              </div>

              {/* Requirements & Skills Card */}
              {job.requirements && job.requirements.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-indigo-500" /> Key Requirements
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {job.requirements.map((req, i) => (
                      <span key={i} className="rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Skills Card */}
              {skillsList.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-purple-500" /> Technical Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {skillsList.map((skill, i) => (
                      <span key={i} className="rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interview Info */}
              {interview.mode && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" /> Interview Schedule & Venue
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
                    <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
                      <span className="text-xs text-indigo-500 font-bold uppercase tracking-wider block mb-1">Interview Mode</span>
                      <p className="font-bold text-indigo-950 text-base">{interview.mode}</p>
                    </div>
                    <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
                      <span className="text-xs text-indigo-500 font-bold uppercase tracking-wider block mb-1">Date & Time</span>
                      <p className="font-bold text-indigo-950 text-base">
                        {interview.dateTime ? new Date(interview.dateTime).toLocaleString() : "Walk-in basis"}
                      </p>
                    </div>
                  </div>
                  {interview.venue && (
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Venue / Online Link</span>
                      <p className="font-semibold text-slate-900 text-sm leading-relaxed">{interview.venue}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Highlights */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-wider">At a Glance</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Wallet className="h-5 w-5" /></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Salary</p>
                      <p className="text-sm font-semibold text-slate-900">{job.salary ? `${job.salary} LPA` : "Not disclosed"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Briefcase className="h-5 w-5" /></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Experience</p>
                      <p className="text-sm font-semibold text-slate-900">{jobDetailsData.experience || job.experienceLevel + " Yrs"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600"><Clock className="h-5 w-5" /></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Job Type</p>
                      <p className="text-sm font-semibold text-slate-900">{job.jobType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Users className="h-5 w-5" /></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Openings</p>
                      <p className="text-sm font-semibold text-slate-900">{job.position}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-wider">Preferences</h3>
                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-medium">Qualification</span>
                    <span className="font-bold text-slate-900">{jobDetailsData.qualification || "Any"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-medium">Freshers Eligible</span>
                    <span className="font-bold text-slate-900">{jobDetailsData.freshersEligible ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-medium">Languages</span>
                    <span className="font-bold text-slate-900">{jobDetailsData.languages?.join(", ") || "English, Hindi"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-medium">Notice Period</span>
                    <span className="font-bold text-slate-900">{jobDetailsData.noticePeriod || "Immediate"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-medium">Gender</span>
                    <span className="font-bold text-slate-900">{candidatePref.gender || "No Preference"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-medium">Marital Status</span>
                    <span className="font-bold text-slate-900">{candidatePref.maritalStatus || "No Preference"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-medium">Shift Type</span>
                    <span className="font-bold text-slate-900">{jobDetailsData.shiftType || "Day"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-medium">Weekly Off</span>
                    <span className="font-bold text-slate-900">{jobDetailsData.weeklyOff || "Sunday"}</span>
                  </div>
                </div>

                {locationObj.city && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Detailed Address</p>
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed font-medium">
                      {formattedLocation}
                    </p>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              {jobDetailsData.canCall && contact.contactPerson && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-wider">Contact Info</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Contact Person</p>
                        <p className="text-xs font-bold text-slate-900">{contact.contactPerson} ({contact.name || "HR"})</p>
                      </div>
                    </div>
                    {contact.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phone</p>
                          <p className="text-xs font-bold text-slate-900">+91 {contact.phone}</p>
                        </div>
                      </div>
                    )}
                    {contact.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email</p>
                          <p className="text-xs font-bold text-slate-900">{contact.email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* JD Download */}
              {job.jdUrl && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 shadow-sm">
                  <h3 className="text-sm font-black text-blue-900 mb-2 uppercase tracking-wider">Official Document</h3>
                  <p className="text-xs text-blue-700 mb-4 font-medium">Download the complete Job Description uploaded by you.</p>
                  <a
                    href={`${API_URL || "http://localhost:8000"}${job.jdUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    <Download className="h-4 w-4" /> View JD
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "applicants" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Reuse Applicants Component without its own Navbar */}
            <div className="-mt-8">
              <Applicants hideNavbar={true} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default JobDetailsRecruiter;