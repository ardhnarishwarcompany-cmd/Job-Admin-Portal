import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { Headphones, Loader2, Lock } from "lucide-react";
import Navbar from "../components_lite/Navbar";
import ChatPanel from "../chat/ChatPanel";
import { MESSAGING_API_ENDPOINT } from "@/utils/data";

const RecruiterChats = () => {
  const { user } = useSelector((store) => store.auth);
  const [starting, setStarting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const isVerified = user?.verificationStatus === "approved" || !user?.verificationStatus;

  const startAdminChat = async () => {
    setStarting(true);
    try {
      const res = await axios.post(`${MESSAGING_API_ENDPOINT}/recruiter-admin/start`, {}, { withCredentials: true });
      if (res.data.success) {
        toast.success("Support chat ready — find it in the list");
        setRefreshKey((k) => k + 1);
      } else {
        toast.error(res.data.message || "Could not start chat");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not start chat");
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar />
      <div className="flex-1 overflow-hidden px-4 py-4 sm:px-6 flex flex-col">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-black text-slate-900 dark:text-white leading-tight">Chats</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Candidate chat requests and support</p>
          </div>
          <motion.button
            whileHover={{ scale: isVerified ? 1.02 : 1 }}
            whileTap={{ scale: isVerified ? 0.98 : 1 }}
            onClick={startAdminChat}
            disabled={starting || !isVerified}
            title={!isVerified ? "Available once your company is verified" : undefined}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 text-sm font-bold text-white shadow-md disabled:opacity-50"
          >
            {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : !isVerified ? <Lock className="h-4 w-4" /> : <Headphones className="h-4 w-4" />}
            Chat with Admin
          </motion.button>
        </div>
        <div className="flex-1 min-h-0 flex">
          <ChatPanel key={refreshKey} emptyStateLabel="Select a candidate conversation or start a chat with admin" />
        </div>
      </div>
    </div>
  );
};

export default RecruiterChats;
