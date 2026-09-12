import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import { Users, Search, CheckCircle2, XCircle, FileText, Mail, Phone, MapPin, Briefcase, GraduationCap, User, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { getFileUrl } from "@/utils/data";

const ApplicantApprovals = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/admin/users`, { withCredentials: true });
      if (res.data.success) {
        setUsers(res.data.users.filter(u => u.role === "Employee"));
      }
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const endpoint = status === "approved" ? "approve" : "reject";
      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/admin/verify/${id}/${endpoint}`, {}, { withCredentials: true });
      setUsers(prev => prev.map(u => u._id === id ? { ...u, verificationStatus: status } : u));
      if (selectedApplicant?._id === id) {
        setSelectedApplicant({ ...selectedApplicant, verificationStatus: status });
      }
      toast.success(`Applicant ${status} successfully!`);
    } catch (error) {
      toast.error("Status update failed");
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch = u.fullname?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = u.verificationStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout title="Applicant Approvals" description="Review and approve new applicant registrations" icon={Users} noPadding>
        <div className="flex flex-col md:flex-row h-full overflow-hidden bg-white md:rounded-tl-2xl border-t md:border-l md:border-t border-slate-200">
          {/* List Sidebar */}
          <div className={`w-full md:w-1/3 md:border-r border-slate-200 bg-slate-50/50 flex flex-col ${selectedApplicant ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 md:p-6 border-b border-slate-200">
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" /> Applicant Requests
              </h2>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder-slate-400"
                />
              </div>
              <div className="flex rounded-lg bg-slate-100 p-1">
                {["pending", "approved", "rejected"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`flex-1 rounded-md py-1.5 text-xs font-semibold capitalize transition-all ${
                      statusFilter === status ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-4 md:p-6">
              {loading ? (
                <p className="text-sm text-slate-400 text-center py-10">Loading...</p>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-10">No {statusFilter} requests found.</p>
              ) : (
                filtered.map(u => (
                  <div
                    key={u._id}
                    onClick={() => setSelectedApplicant(u)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      selectedApplicant?._id === u._id
                        ? "border-blue-400 bg-blue-50 shadow-md"
                        : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <div className="h-8 w-8 overflow-hidden rounded-full border border-slate-200 bg-slate-100 flex-shrink-0">
                        <img 
                          src={getFileUrl(u.profilePhoto) || "/default.png"} 
                          alt="Avatar" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      {u.fullname}
                    </div>
                    <div className="text-sm text-slate-500 mt-2 flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {u.email}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Details View */}
          <div className={`flex-1 bg-white overflow-y-auto ${!selectedApplicant ? 'hidden md:block' : 'block'}`}>
            {selectedApplicant ? (
              <div className="p-4 md:p-8 max-w-3xl mx-auto">
                <button onClick={() => setSelectedApplicant(null)} className="md:hidden mb-4 text-blue-600 font-bold text-sm flex items-center gap-1">
                  ← Back to List
                </button>
                <div className="rounded-3xl border border-slate-200 bg-white p-5 md:p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-6 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-lg bg-slate-100">
                        <img 
                          src={getFileUrl(selectedApplicant.profilePhoto) || "/default.png"} 
                          alt="Avatar" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h1 className="text-3xl font-black text-slate-900">{selectedApplicant.fullname}</h1>
                        <p className="text-slate-500 font-medium">{selectedApplicant.email}</p>
                      </div>
                    </div>
                    <div>
                      {selectedApplicant.verificationStatus === "pending" && (
                        <div className="flex gap-2">
                          <button onClick={() => updateStatus(selectedApplicant._id, "approved")} className="flex items-center gap-1 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-200">
                            <CheckCircle2 className="h-4 w-4" /> Approve
                          </button>
                          <button onClick={() => updateStatus(selectedApplicant._id, "rejected")} className="flex items-center gap-1 rounded-full bg-rose-100 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-200">
                            <XCircle className="h-4 w-4" /> Reject
                          </button>
                        </div>
                      )}
                      {selectedApplicant.verificationStatus === "approved" && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
                          <CheckCircle2 className="h-4 w-4" /> Approved
                        </span>
                      )}
                      {selectedApplicant.verificationStatus === "rejected" && (
                        <span className="flex items-center gap-1 rounded-full bg-rose-100 px-4 py-2 text-sm font-bold text-rose-700">
                          <XCircle className="h-4 w-4" /> Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">Phone Number</p>
                      <p className="mt-1 font-medium text-slate-800 flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400"/> {selectedApplicant.phoneNumber || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">Date of Birth</p>
                      <p className="mt-1 font-medium text-slate-800">{selectedApplicant.dateOfBirth || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">Location</p>
                      <p className="mt-1 font-medium text-slate-800 flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400"/> {selectedApplicant.city || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">Resume</p>
                      {selectedApplicant.resume ? (
                        <a href={getFileUrl(selectedApplicant.resume)} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-1 font-bold text-blue-600 hover:underline">
                          <FileText className="h-4 w-4" /> View Resume
                        </a>
                      ) : (
                        <p className="mt-1 font-medium text-slate-500">Not uploaded</p>
                      )}
                    </div>
                  </div>
                  
                  {(() => {
                    if (!selectedApplicant.candidateProfile) return null;
                    const profileData = typeof selectedApplicant.candidateProfile === 'string' 
                      ? (typeof selectedApplicant.candidateProfile === "string" ? JSON.parse(selectedApplicant.candidateProfile) : selectedApplicant.candidateProfile)
                      : selectedApplicant.candidateProfile;
                    
                    return (
                      <div className="mt-8 border-t border-slate-100 pt-6 space-y-6">
                        <h3 className="text-xl font-black text-slate-900 mb-4">Detailed Registration Data</h3>
                        
                        {/* Personal Overview */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                          <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-500" /> Personal Overview
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-slate-400 font-semibold mb-1">Gender</p>
                              <p className="text-slate-800">{profileData?.personal?.gender || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 font-semibold mb-1">Age</p>
                              <p className="text-slate-800">{profileData?.personal?.age || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 font-semibold mb-1">Marital Status</p>
                              <p className="text-slate-800">{profileData?.personal?.maritalStatus || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 font-semibold mb-1">Nationality</p>
                              <p className="text-slate-800">{profileData?.personal?.nationality || "N/A"}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-slate-400 font-semibold mb-1">Full Address</p>
                              <p className="text-slate-800">
                                {[profileData?.personal?.houseAddress, profileData?.personal?.city, profileData?.personal?.state, profileData?.personal?.country, profileData?.personal?.pinCode].filter(Boolean).join(", ") || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Career & Experience */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-purple-500" /> Career Info
                            </h4>
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-500">Target Role</span>
                                <span className="font-semibold text-slate-800">{profileData?.career?.jobTitle || "N/A"}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-500">Job Type</span>
                                <span className="font-semibold text-slate-800">{profileData?.career?.jobType || "N/A"} ({profileData?.career?.workMode || "N/A"})</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-500">Current Salary</span>
                                <span className="font-semibold text-slate-800">{profileData?.salary?.current || "N/A"}</span>
                              </div>
                              <div className="flex justify-between pb-1">
                                <span className="text-slate-500">Expected Salary</span>
                                <span className="font-semibold text-emerald-600">{profileData?.salary?.expected || "N/A"}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-emerald-500" /> Education & Experience
                            </h4>
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-500">Status</span>
                                <span className="font-semibold text-slate-800">{profileData?.experience?.employmentType || "N/A"}</span>
                              </div>
                              {profileData?.experience?.employmentType !== "Fresher" && (
                                <div className="flex justify-between border-b border-slate-200 pb-2">
                                  <span className="text-slate-500">Total Exp.</span>
                                  <span className="font-semibold text-slate-800">{profileData?.experience?.years} Yrs, {profileData?.experience?.months} Mos</span>
                                </div>
                              )}
                              <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-500">Qualification</span>
                                <span className="font-semibold text-slate-800">{profileData?.education?.qualification || "N/A"}</span>
                              </div>
                              <div className="flex justify-between pb-1">
                                <span className="text-slate-500">College</span>
                                <span className="font-semibold text-slate-800 truncate max-w-[120px]" title={profileData?.education?.college}>{profileData?.education?.college || "N/A"}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Top Skills */}
                        {profileData?.skills?.length > 0 && (
                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-cyan-500" /> Skills
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {profileData.skills.map((s, i) => (
                                <span key={i} className="bg-white border border-slate-200 px-3 py-1 rounded-full text-xs font-semibold text-slate-700">
                                  {typeof s === 'object' ? s.skill : s} {typeof s === 'object' && s.level && <span className="text-slate-400 font-normal ml-1">({s.level})</span>}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Documents */}
                        {profileData?.verificationDocs?.length > 0 && (
                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                              <FileText className="h-4 w-4 text-blue-500" /> Verification Documents
                            </h4>
                            <div className="flex flex-wrap gap-3">
                              {profileData.verificationDocs.map((doc, i) => (
                                <a key={i} href={getFileUrl(doc)} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors shadow-sm">
                                  <FileText className="h-4 w-4" /> Document {i + 1}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400 flex-col gap-4">
                <Users className="h-16 w-16 opacity-20" />
                <p>Select an applicant to view details</p>
              </div>
            )}
          </div>
        </div>
    </AdminLayout>
  );
};

export default ApplicantApprovals;
