import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Navbar from "../components_lite/Navbar";
import ChatPanel from "../chat/ChatPanel";

const CandidateChats = () => {
  const { user } = useSelector((store) => store.auth);
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar />
      <div className="flex-1 overflow-hidden px-4 py-4 sm:px-6 flex flex-col">
        <div className="mb-4">
          <h1 className="font-display text-2xl font-black text-slate-900 dark:text-white leading-tight">My Chats</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Conversations with recruiters you've applied to</p>
        </div>
        <div className="flex-1 min-h-0 flex">
          <ChatPanel emptyStateLabel="Apply to a job and request a chat to start a conversation here" />
        </div>
      </div>
    </div>
  );
};

export default CandidateChats;
