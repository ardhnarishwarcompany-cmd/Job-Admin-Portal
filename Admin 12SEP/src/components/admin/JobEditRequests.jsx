import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, CheckCircle, XCircle, AlertTriangle, Eye, ArrowRight, 
  MapPin, DollarSign, Calendar, MessageSquare, ShieldAlert
} from "lucide-react";
import axios from "axios";
import { ADMIN_API_ENDPOINT } from "@/utils/data";
import { toast } from "sonner";
import AdminLayout from "./AdminLayout";

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

const JobEditRequests = () => {
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [actioning, setActioning] = useState(false);

  const filteredRequests = requests.filter(r => r.status === activeTab);

  // Fetch all edit requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${ADMIN_API_ENDPOINT}/job-edits`, { withCredentials: true });
      if (res.data.success) {
        setRequests(res.data.requests || []);
      } else {
        toast.error("Failed to load job edit requests");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading job edit requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      setActioning(true);
      const res = await axios.put(
        `${ADMIN_API_ENDPOINT}/job-edits/${id}/approve`,
        { replyMessage: replyMessage || "Approved by Admin" },
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success("Job edit approved successfully");
        setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "approved", admin_reply: replyMessage || "Approved by Admin" } : r));
        setSelectedRequest(null);
        setReplyMessage("");
      } else {
        toast.error(res.data.message || "Failed to approve edit request");
      }
    } catch (err) {
      toast.error("Error approving request");
    } finally {
      setActioning(false);
    }
  };

  const handleReject = async (id) => {
    if (!replyMessage.trim()) {
      toast.error("Please enter a reason/reply message for rejection");
      return;
    }
    try {
      setActioning(true);
      const res = await axios.put(
        `${ADMIN_API_ENDPOINT}/job-edits/${id}/reject`,
        { replyMessage },
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success("Job edit request rejected");
        setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "rejected", admin_reply: replyMessage } : r));
        setSelectedRequest(null);
        setReplyMessage("");
      } else {
        toast.error(res.data.message || "Failed to reject edit request");
      }
    } catch (err) {
      toast.error("Error rejecting request");
    } finally {
      setActioning(false);
    }
  };

  // Helper to diff object fields
  const getDiffs = (req) => {
    if (!req) return [];
    let original = {};
    let edited = {};
    try {
      original = typeof req.original_data === "string" ? JSON.parse(req.original_data) : (req.original_data || {});
      edited = typeof req.edited_data === "string" ? JSON.parse(req.edited_data) : (req.edited_data || {});
    } catch (e) {
      console.error("JSON parse error:", e);
    }

    const diffs = [];
    const allKeys = Array.from(new Set([...Object.keys(original), ...Object.keys(edited)]));
    
    // Ignore meta fields
    const ignoreKeys = ["id", "_id", "created_by", "companyId", "company", "applications", "created_at", "updated_at", "approvalStatus", "rejectionReason", "approvedBy", "approvedAt", "isClosed", "isDeleted", "reopenRequest", "reopenReason"];
    
    for (const key of allKeys) {
      if (ignoreKeys.includes(key)) continue;
      
      const origVal = typeof original[key] === "object" ? JSON.stringify(original[key]) : original[key];
      const editVal = typeof edited[key] === "object" ? JSON.stringify(edited[key]) : edited[key];
      
      if (origVal !== editVal) {
        diffs.push({
          field: key.charAt(0).toUpperCase() + key.slice(1),
          oldVal: origVal || "(empty)",
          newVal: editVal || "(empty)"
        });
      }
    }
    return diffs;
  };

  return (
    <AdminLayout title="Job Edit Approvals" description="Review and approve changes to live jobs" icon={Briefcase} noPadding>
      <div className="flex flex-col h-full bg-white md:rounded-tl-2xl border-t md:border-l md:border-t border-slate-200 overflow-hidden shadow-sm">
        
        {/* Tabs */}
        <div className="flex border-b border-slate-200 gap-2 px-6 pt-4">
          {["pending", "approved", "rejected"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedRequest(null);
              }}
              className={`py-2.5 px-5 text-sm font-bold border-b-2 capitalize transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === tab
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              {tab}
              <span className={`text-[10px] rounded-full px-2 py-0.5 font-extrabold ${
                activeTab === tab ? "bg-indigo-100 text-indigo-700" : "bg-slate-150 text-slate-500"
              }`}>
                {requests.filter((r) => r.status === tab).length}
              </span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
              <p className="mt-4 text-sm font-semibold text-slate-500">Loading edit requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm text-slate-400">
              <div className="h-16 w-16 mx-auto mb-4 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shadow-inner">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
              <p className="font-bold text-slate-700 text-lg">All caught up!</p>
              <p className="text-xs mt-1">No {activeTab} job edit requests at this time</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Requests List */}
              <motion.div 
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="lg:col-span-1 space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-1"
              >
                {filteredRequests.map((req) => (
                  <motion.div
                    key={req.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedRequest(req)}
                    className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 ${
                      selectedRequest?.id === req.id 
                        ? "border-indigo-500 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/20" 
                        : "border-slate-200 bg-white shadow-sm hover:border-slate-350"
                    }`}
                  >
                    <h3 className="font-bold text-slate-900 line-clamp-1">{req.jobTitle}</h3>
                    <p className="text-xs text-indigo-600 font-bold mt-1.5 uppercase tracking-wider">{req.companyName}</p>
                    
                    <div className="flex items-center gap-4 mt-4 text-[11px] text-slate-400 border-t border-slate-100 pt-3">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Compare / Action View */}
              <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                  {selectedRequest ? (
                    <motion.div
                      key={selectedRequest.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6"
                    >
                      <div className="border-b border-slate-100 pb-5">
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100/50">
                          {selectedRequest.companyName}
                        </span>
                        <h2 className="text-xl font-black text-slate-900 mt-3">{selectedRequest.jobTitle}</h2>
                      </div>

                      {/* Comparison Diff Table */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <ShieldAlert className="h-4 w-4 text-indigo-500" /> Changed Fields Comparison
                        </h3>
                        <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden shadow-sm bg-slate-50/50">
                          {getDiffs(selectedRequest).map((diff, index) => (
                            <div key={index} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                              {/* Original Value (Red Git Diff look) */}
                              <div className="p-3 bg-rose-50/40 border border-dashed border-rose-200 rounded-xl">
                                <span className="text-[9px] font-extrabold text-rose-500 uppercase tracking-widest block mb-1">
                                  {diff.field} (Current)
                                </span>
                                <p className="text-sm font-semibold text-slate-500 line-through decoration-rose-300 mt-0.5 line-clamp-3">
                                  {diff.oldVal}
                                </p>
                              </div>
                              {/* Edited Value (Green Git Diff look) */}
                              <div className="p-3 bg-emerald-50/40 border border-emerald-200 rounded-xl shadow-sm">
                                <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-widest flex items-center gap-1 mb-1">
                                  {diff.field} (New Request) <ArrowRight className="h-3 w-3" />
                                </span>
                                <p className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-3">
                                  {diff.newVal}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Reply Form / Action Area */}
                      {selectedRequest.status === "pending" ? (
                        <>
                          <div className="space-y-3 border-t border-slate-100 pt-6">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                              <MessageSquare className="h-4 w-4 text-slate-500" /> Message to Recruiter
                            </label>
                            <textarea
                              value={replyMessage}
                              onChange={(e) => setReplyMessage(e.target.value)}
                              placeholder="Add approval message or enter reason for rejection (required for rejection)..."
                              rows={3}
                              className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50/30 p-3 focus:outline-none focus:border-indigo-500 shadow-inner"
                            />
                          </div>

                          <div className="flex gap-4">
                            <button
                              onClick={() => handleApprove(selectedRequest.id)}
                              disabled={actioning}
                              className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-150 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                              Approve Changes
                            </button>
                            <button
                              onClick={() => handleReject(selectedRequest.id)}
                              disabled={actioning}
                              className="flex-1 py-3 px-4 rounded-xl border border-rose-200 hover:border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                              Reject Edit Request
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-3 ${
                          selectedRequest.status === "approved" 
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                            : "bg-rose-50 border-rose-200 text-rose-800"
                        }`}>
                          {selectedRequest.status === "approved" ? (
                            <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
                          )}
                          <div>
                            <p className="font-bold">Request has been {selectedRequest.status}</p>
                            {selectedRequest.admin_reply && (
                              <p className="text-xs mt-1 font-normal text-slate-500">Message logged: "{selectedRequest.admin_reply}"</p>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="h-64 flex items-center justify-center bg-slate-100/50 rounded-3xl border border-dashed border-slate-350 text-slate-400 text-sm font-semibold shadow-inner">
                      Select a request from the left panel to review.
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default JobEditRequests;
