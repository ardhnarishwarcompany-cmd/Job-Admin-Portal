import React from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import ChatPanel from "../chat/ChatPanel";

const AdminChats = () => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-cyan-50/10 overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-1 flex-col md:ml-64 h-full overflow-hidden">
        <AdminHeader />
        <div className="flex-1 flex flex-col overflow-hidden p-6">
          <div className="mb-6 flex-shrink-0">
            <h1 className="font-display text-2xl font-black text-slate-900">Recruiter Chats</h1>
            <p className="text-sm text-slate-500">Support conversations with verified recruiters</p>
          </div>
          <ChatPanel emptyStateLabel="Select a recruiter conversation to view messages" />
        </div>
      </div>
    </div>
  );
};

export default AdminChats;
