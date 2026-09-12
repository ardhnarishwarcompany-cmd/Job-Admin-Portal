import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  LogOut, Bell, Search, Clock, MessageSquare, Briefcase, UserCircle2, Menu, X,
  LayoutDashboard, Users, ClipboardList, Shield, FileCheck2, MessagesSquare, AlertCircle, KeyRound, Video
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { setUser } from "@/redux/authSlice";
import { USER_API_ENDPOINT, MESSAGING_API_ENDPOINT } from "@/utils/data";
import { setSearchJobByText } from "@/redux/jobSlice";
import { getSocket } from "@/utils/socket";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Manage Users", icon: Users },
  { to: "/admin/jobs", label: "Manage Jobs", icon: Briefcase },
  { to: "/admin/jobs/pending", label: "Job Approvals", icon: FileCheck2 },
  { to: "/admin/recruiter-approvals", label: "Employer Approvals", icon: ClipboardList },
  { to: "/admin/applicant-approvals", label: "Applicant Approvals", icon: ClipboardList },
  { to: "/admin/applications", label: "Applications", icon: ClipboardList },
  { to: "/admin/ai-interviews", label: "AI Interviews", icon: Video },
  { to: "/admin/chats", label: "Employer Chats", icon: MessagesSquare },
  { to: "/admin/requests", label: "Contact Requests", icon: MessageSquare },
  { to: "/admin/complaints", label: "Complaints", icon: AlertCircle },
  { to: "/admin/access-keys", label: "Login IDs", icon: KeyRound },
];

const AdminHeader = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logoutHandler = async () => {
    try {
      const res = await axios.post(`${USER_API_ENDPOINT}/logout`, {}, { withCredentials: true });
      if (res.data.success) {
        dispatch(setUser(null));
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchChatUnread = async () => {
    if (!user) {
      setChatUnreadCount(0);
      return;
    }
    try {
      const res = await axios.get(`${MESSAGING_API_ENDPOINT}/conversations`, { withCredentials: true });
      if (res.data.success) {
        const total = res.data.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        setChatUnreadCount(total);
      }
    } catch (err) {
      // silent
    }
  };

  useEffect(() => {
    fetchChatUnread();
    if (!user) return;
    const socket = getSocket();
    const onUpdate = () => fetchChatUnread();
    socket.on("conversation_updated", onUpdate);
    socket.on("new_message", onUpdate);
    socket.on("messages_read", onUpdate);
    return () => {
      socket.off("conversation_updated", onUpdate);
      socket.off("new_message", onUpdate);
      socket.off("messages_read", onUpdate);
    };
  }, [user]);

  const headerSearchHandler = () => {
    dispatch(setSearchJobByText(query));
    if (query.trim()) {
      navigate("/admin/jobs");
    }
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 py-3 shadow-sm"
      >
        {/* Left: toggle + title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Admin Dashboard</p>
            <h1 className="text-lg font-black text-slate-900">Welcome back, {user?.fullname} 👋</h1>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-3">

          {/* Chats */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/admin/chats")}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            title="Recruiter Chats"
          >
            <MessageSquare className="h-4 w-4" />
            {chatUnreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                {chatUnreadCount > 9 ? "9+" : chatUnreadCount}
              </span>
            )}
          </motion.button>

          {/* Profile */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-sm">
              <UserCircle2 className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-900 max-w-[120px] truncate">{user?.fullname}</p>
              <p className="text-xs text-blue-600 font-semibold">{user?.role}</p>
            </div>
          </div>

          {/* Logout */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={logoutHandler}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2 text-sm font-bold text-white shadow-md hover:shadow-rose-200 transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </motion.button>
        </div>
      </motion.header>

      {/* Mobile Drawer Navigation Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 via-blue-950 to-cyan-950 p-5 shadow-2xl flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between pb-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-white text-sm">Admin Panel</p>
                    <p className="text-xs text-blue-300">JobPortal SaaS</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto mt-4 space-y-1 pr-1">
                {navItems.map((item) => {
                  const isActive = window.location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                          : "text-slate-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm font-semibold">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="border-t border-white/10 pt-4">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logoutHandler();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl bg-rose-500/10 px-3 py-2.5 text-sm font-bold text-rose-400 hover:bg-rose-500 hover:text-white transition-all duration-200"
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminHeader;

