import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import { Building2, Search, CheckCircle2, XCircle, Clock, MapPin, Mail, Phone, ExternalLink, FileText } from "lucide-react";
import { toast } from "sonner";
import { getFileUrl } from "@/utils/data";

const RecruiterApprovals = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending"); // pending, approved, rejected
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/admin/users`, { withCredentials: true });
      if (res.data.success) {
        setUsers(res.data.users.filter(u => u.role === "Recruiter"));
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
      if (selectedRecruiter?._id === id) {
        setSelectedRecruiter({ ...selectedRecruiter, verificationStatus: status });
      }
      toast.success(`Employer ${status} successfully!`);
    } catch (error) {
      toast.error("Status update failed");
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch = u.fullname?.toLowerCase().includes(search.toLowerCase()) || u.companyName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = u.verificationStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout title="Employer Approvals" description="Review and approve new employer registrations" icon={Building2} noPadding>
        <div className="flex flex-col md:flex-row h-full overflow-hidden bg-white md:rounded-tl-2xl border-t md:border-l md:border-t border-slate-200">
          {/* List Sidebar */}
          <div className={`w-full md:w-1/3 md:border-r border-slate-200 bg-slate-50/50 flex flex-col ${selectedRecruiter ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 md:p-6 border-b border-slate-200">
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" /> Employer Requests
              </h2>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
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
                    onClick={() => setSelectedRecruiter(u)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      selectedRecruiter?._id === u._id
                        ? "border-blue-400 bg-blue-50 shadow-md"
                        : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-bold text-slate-900">{u.companyName || "No Company Name"}</div>
                    <div className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {u.email}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Details View */}
          <div className={`flex-1 bg-white overflow-y-auto ${!selectedRecruiter ? 'hidden md:block' : 'block'}`}>
            {selectedRecruiter ? (
              <div className="p-4 md:p-8 max-w-3xl mx-auto">
                <button onClick={() => setSelectedRecruiter(null)} className="md:hidden mb-4 text-blue-600 font-bold text-sm flex items-center gap-1">
                  ← Back to List
                </button>
                <div className="rounded-3xl border border-slate-200 bg-white p-5 md:p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-6 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                        <img 
                          src={
                            getFileUrl(
                              (typeof selectedRecruiter.recruiterProfile === "string" 
                                ? (typeof selectedRecruiter.recruiterProfile === "string" ? JSON.parse(selectedRecruiter.recruiterProfile || "{}") : (selectedRecruiter.recruiterProfile || {}))
                                : selectedRecruiter.recruiterProfile)?.companyLogo || selectedRecruiter.profilePhoto
                            ) || "/default.png"
                          } 
                          alt="Company Logo" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h1 className="text-2xl font-black text-slate-900">{selectedRecruiter.companyName || "N/A"}</h1>
                        <p className="text-slate-500">{selectedRecruiter.fullname} (Contact Person)</p>
                      </div>
                    </div>
                    <div>
                      {selectedRecruiter.verificationStatus === "pending" && (
                        <div className="flex gap-2">
                          <button onClick={() => updateStatus(selectedRecruiter._id, "approved")} className="flex items-center gap-1 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-200">
                            <CheckCircle2 className="h-4 w-4" /> Approve
                          </button>
                          <button onClick={() => updateStatus(selectedRecruiter._id, "rejected")} className="flex items-center gap-1 rounded-full bg-rose-100 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-200">
                            <XCircle className="h-4 w-4" /> Reject
                          </button>
                        </div>
                      )}
                      {selectedRecruiter.verificationStatus === "approved" && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
                          <CheckCircle2 className="h-4 w-4" /> Approved
                        </span>
                      )}
                      {selectedRecruiter.verificationStatus === "rejected" && (
                        <span className="flex items-center gap-1 rounded-full bg-rose-100 px-4 py-2 text-sm font-bold text-rose-700">
                          <XCircle className="h-4 w-4" /> Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">Contact Email</p>
                      <p className="mt-1 font-medium text-slate-800 flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400"/> {selectedRecruiter.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">Phone Number</p>
                      <p className="mt-1 font-medium text-slate-800 flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400"/> {selectedRecruiter.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">GST Number</p>
                      <p className="mt-1 font-medium text-slate-800">{selectedRecruiter.gstNumber || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">Location</p>
                      <p className="mt-1 font-medium text-slate-800 flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400"/> {selectedRecruiter.city || "N/A"}</p>
                    </div>
                  </div>
                  
                  {(() => {
                    if (!selectedRecruiter.recruiterProfile) return null;
                    const profileData = typeof selectedRecruiter.recruiterProfile === 'string' 
                      ? JSON.parse(selectedRecruiter.recruiterProfile) 
                      : selectedRecruiter.recruiterProfile;
                    
                    return (
                      <div className="mt-8 border-t border-slate-100 pt-6 space-y-6">
                        <h3 className="text-xl font-black text-slate-900 mb-4">Detailed Registration Data</h3>
                        
                        {/* Company Details */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                          <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-blue-500" /> Company Overview
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-slate-400 font-semibold mb-1">Type</p>
                              <p className="text-slate-800">{profileData?.company?.type || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 font-semibold mb-1">Industry</p>
                              <p className="text-slate-800">{profileData?.company?.industry || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 font-semibold mb-1">Size</p>
                              <p className="text-slate-800">{profileData?.company?.size || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 font-semibold mb-1">Website</p>
                              {profileData?.company?.website ? (
                                <a href={profileData.company.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                  {profileData.company.website} <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : "N/A"}
                            </div>
                            <div className="col-span-2">
                              <p className="text-slate-400 font-semibold mb-1">Description</p>
                              <p className="text-slate-800">{profileData?.company?.description || "N/A"}</p>
                            </div>
                          </div>
                        </div>

                        {/* Hiring & Subscription Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                              <Search className="h-4 w-4 text-purple-500" /> Hiring Needs
                            </h4>
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-500">Hiring For</span>
                                <span className="font-semibold text-slate-800">{profileData?.hiring?.hiringFor || "N/A"}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-500">Volume</span>
                                <span className="font-semibold text-slate-800">{profileData?.hiring?.volume || "N/A"}</span>
                              </div>
                              <div className="flex justify-between pb-1">
                                <span className="text-slate-500">Frequency</span>
                                <span className="font-semibold text-slate-800">{profileData?.hiring?.frequency || "N/A"}</span>
                              </div>
                            </div>
                          </div>
                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Plan & Billing
                            </h4>
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-500">Subscription Plan</span>
                                <span className="font-semibold text-emerald-600">{profileData?.subscription?.plan || "N/A"}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-500">Payment Method</span>
                                <span className="font-semibold text-slate-800">{profileData?.subscription?.paymentMethod || "N/A"}</span>
                              </div>
                              <div className="flex justify-between pb-1">
                                <span className="text-slate-500">PAN</span>
                                <span className="font-semibold text-slate-800">{profileData?.billing?.pan || "N/A"}</span>
                              </div>
                            </div>
                          </div>
                        </div>

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
                <Building2 className="h-16 w-16 opacity-20" />
                <p>Select a recruiter to view details</p>
              </div>
            )}
          </div>
        </div>
    </AdminLayout>
  );
};

export default RecruiterApprovals;
