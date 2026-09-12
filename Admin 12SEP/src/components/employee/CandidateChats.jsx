import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Navbar from "../components_lite/Navbar";
import ChatPanel from "../chat/ChatPanel";

const CandidateChats = () => {
  const { user } = useSelector((store) => store.auth);
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen flex-col bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      <div className="flex-1 overflow-hidden px-4 py-4 sm:px-6">
        <div className="mb-4">
          <h1 className="font-display text-2xl font-black text-slate-900">My Chats</h1>
          <p className="text-sm text-slate-500">Conversations with recruiters you've applied to</p>
        </div>
        <ChatPanel emptyStateLabel="Apply to a job and request a chat to start a conversation here" />
      </div>
    </div>
  );
};

export default CandidateChats;
