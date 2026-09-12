import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, CheckCircle, XCircle, User, Mail, Building2, 
  MessageSquare, Video, Search, ShieldCheck 
} from "lucide-react";
import axios from "axios";
import { ADMIN_API_ENDPOINT } from "@/utils/data";
import { toast } from "sonner";
import AdminLayout from "./AdminLayout";

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { type: "spring", stiffness: 100, damping: 15 } 
  }
};

const FeatureRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null); // stores request ID being actioned

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${ADMIN_API_ENDPOINT}/recruiters/feature-requests`, { withCredentials: true });
      if (res.data.success) {
        setRequests(res.data.requests || []);
      } else {
        toast.error("Failed to load feature requests");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading feature requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (recruiterId, feature, approved) => {
    const status = approved ? "approved" : "rejected";
    const body = {
      [`${feature}_status`]: status
    };
    
    setActioning(`${recruiterId}-${feature}`);
    try {
      const res = await axios.put(
        `${ADMIN_API_ENDPOINT}/recruiters/${recruiterId}/features`,
        body,
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(`Feature access request ${status} successfully`);
        // Remove from UI list
        setRequests((prev) => 
          prev.filter((req) => !(req.recruiter_id === recruiterId && req[`${feature}_status`] === "pending"))
        );
      } else {
        toast.error(res.data.message || "Action failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating feature permissions");
    } finally {
      setActioning(null);
    }
  };

  // Helper to expand feature requested array
  const getPendingFeatures = (req) => {
    const list = [];
    if (req.chat_status === "pending") list.push({ name: "chat", label: "Real-Time Chat Panel", icon: MessageSquare, color: "text-blue-600 bg-blue-50 border-blue-100" });
    if (req.nova_status === "pending") list.push({ name: "nova", label: "Nova AI Video Interviews", icon: Video, color: "text-purple-600 bg-purple-50 border-purple-100" });
    if (req.find_candidates_status === "pending") list.push({ name: "find_candidates", label: "Candidate Smart Search & Match", icon: Search, color: "text-emerald-600 bg-emerald-50 border-emerald-100" });
    return list;
  };

  return (
    <AdminLayout title="Employer Feature Permissions" description="Review request permissions from registered employers requesting access to SaaS tier features" icon={ShieldAlert}>
      <div className="max-w-5xl mx-auto space-y-6 w-full">

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/60 shadow-sm">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
                <p className="mt-4 text-sm font-semibold text-slate-500">Loading requests queue...</p>
              </div>
            ) : requests.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm text-slate-400"
              >
                <div className="h-16 w-16 mx-auto mb-4 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-inner">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <p className="font-bold text-slate-700 text-lg">Requests queue empty</p>
                <p className="text-xs mt-1">All recruiter feature permission requests have been verified</p>
              </motion.div>
            ) : (
              <motion.div 
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                <AnimatePresence>
                  {requests.map((req) => {
                    const pendingFeatures = getPendingFeatures(req);
                    return (
                      <motion.div
                        key={req.id}
                        variants={cardVariants}
                        exit={{ opacity: 0, scale: 0.95, x: -30, transition: { duration: 0.2 } }}
                        whileHover={{ y: -2, shadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
                        className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-indigo-300 hover:shadow-md transition-all duration-300"
                      >
                        {/* Profile Info */}
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/60 font-black text-indigo-600 flex items-center justify-center text-lg shadow-sm">
                              {(req.recruiterName || "R")[0].toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 leading-tight">{req.recruiterName}</h3>
                              <p className="text-xs text-slate-455 mt-0.5 flex items-center gap-1"><Mail className="h-3 w-3 text-slate-400" /> {req.recruiterEmail}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 pl-1">
                            <span className="flex items-center gap-1 font-semibold"><Building2 className="h-3.5 w-3.5 text-slate-400" /> {req.companyName || "Private Employer"}</span>
                          </div>
                        </div>

                        {/* Feature Action Boxes */}
                        <div className="flex flex-col gap-3 min-w-[320px]">
                          {pendingFeatures.map((feat) => {
                            const isActioning = actioning === `${req.recruiter_id}-${feat.name}`;
                            return (
                              <div key={feat.name} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-4 shadow-sm">
                                <div className="flex items-center gap-2">
                                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center border ${feat.color}`}>
                                    <feat.icon className="h-4.5 w-4.5" />
                                  </div>
                                  <span className="text-xs font-bold text-slate-800">{feat.label}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleAction(req.recruiter_id, feat.name, true)}
                                    disabled={isActioning}
                                    className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors cursor-pointer disabled:opacity-50 border border-emerald-100 shadow-sm"
                                    title="Approve access"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleAction(req.recruiter_id, feat.name, false)}
                                    disabled={isActioning}
                                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer disabled:opacity-50 border border-rose-100 shadow-sm"
                                    title="Deny access"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
      </div>
    </AdminLayout>
  );
};

export default FeatureRequests;
