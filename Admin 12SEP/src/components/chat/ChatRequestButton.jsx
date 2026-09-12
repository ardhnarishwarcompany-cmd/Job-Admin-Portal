import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { MessageCircle, Loader2, CheckCircle2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MESSAGING_API_ENDPOINT } from "@/utils/data";

const ChatRequestButton = ({ jobId }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("idle"); // idle | sending | pending | error
  const [conversationId, setConversationId] = useState(null);

  const requestChat = async () => {
    setStatus("sending");
    try {
      const res = await axios.post(`${MESSAGING_API_ENDPOINT}/request`, { jobId }, { withCredentials: true });
      if (res.data.success) {
        setStatus("pending");
        setConversationId(res.data.conversation?._id);
        toast.success("Chat request sent to the recruiter");
      } else {
        setStatus("idle");
        toast.error(res.data.message || "Could not send chat request");
      }
    } catch (err) {
      setStatus("idle");
      toast.error(err?.response?.data?.message || "Could not send chat request");
    }
  };

  if (status === "pending") {
    return (
      <button
        onClick={() => navigate("/candidate/chats")}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 py-3 text-sm font-bold text-amber-700"
      >
        <Clock className="h-4 w-4" /> Request sent — view in Chats
      </button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={requestChat}
      disabled={status === "sending"}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 py-3 text-sm font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-60"
    >
      {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
      {status === "sending" ? "Sending request..." : "Chat with Recruiter"}
    </motion.button>
  );
};

export default ChatRequestButton;
