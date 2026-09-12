import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setSidebarCollapsed } from "../../redux/authSlice";
import axios from "axios";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  ClipboardList, 
  ChevronLeft, 
  ChevronRight, 
  Shield, 
  MessageCircle, 
  FileCheck2, 
  MessagesSquare, 
  AlertCircle, 
  KeyRound, 
  Video,
  Globe2, Settings2, ShieldCheck, ClipboardCheck, Activity, Truck
} from "lucide-react";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/workforce", label: "Global Workforce", icon: Globe2 },
  { to: "/admin/mass-hiring", label: "Mass Hiring Jobs", icon: Truck },

  { to: "/admin/users", label: "Manage Users", icon: Users },
  { to: "/admin/jobs", label: "Manage Jobs", icon: Briefcase },
  { to: "/admin/jobs/pending", label: "Job Approvals", icon: FileCheck2 },
  { to: "/admin/job-edits", label: "Job Edit Approvals", icon: FileCheck2 },
  { to: "/admin/recruiter-approvals", label: "Employer Approvals", icon: ClipboardList },
  { to: "/admin/feature-requests", label: "Feature Approvals", icon: Shield },
  { to: "/admin/recruiter-profiles", label: "Employer Analytics", icon: Users },
  { to: "/admin/applicant-approvals", label: "Applicant Approvals", icon: ClipboardList },
  { to: "/admin/applications", label: "Applications", icon: ClipboardList },
  { to: "/admin/ai-interviews", label: "AI Interviews", icon: Video },
  { to: "/admin/nova-ai-interviews", label: "NOVA AI Interviews", icon: Video },
  { to: "/admin/chats", label: "Employer Chats", icon: MessagesSquare },
  { to: "/admin/requests", label: "Contact Requests", icon: MessageCircle },
  { to: "/admin/complaints", label: "Complaints", icon: AlertCircle },
  { to: "/admin/access-keys", label: "Login IDs", icon: KeyRound },
];

const routeToBadgeKeyMap = {
  "/admin/jobs/pending": "jobApprovals",
  "/admin/job-edits": "jobEdits",
  "/admin/recruiter-approvals": "recruiterApprovals",
  "/admin/feature-requests": "featureRequests",
  "/admin/complaints": "complaints",
  "/admin/requests": "contactRequests",
};

const AdminSidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const sidebarCollapsed = useSelector((state) => state.auth.sidebarCollapsed);
  const [badges, setBadges] = useState({});

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/admin/badge-counts`, { withCredentials: true })
      .then(res => {
        if (res.data.success) {
          const counts = res.data.badgeCounts || {};
          const filtered = {};
          Object.keys(counts).forEach(key => {
            const isRouteActive = Object.keys(routeToBadgeKeyMap).find(r => r === location.pathname && routeToBadgeKeyMap[r] === key);
            if (isRouteActive || localStorage.getItem(`seen_badge_${key}`) === "true") {
              filtered[key] = 0;
            } else {
              filtered[key] = counts[key];
            }
          });
          setBadges(filtered);
        }
      })
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    const matchedKey = Object.keys(routeToBadgeKeyMap).find(key => location.pathname === key);
    if (matchedKey) {
      const badgeKey = routeToBadgeKeyMap[matchedKey];
      setBadges(prev => ({ ...prev, [badgeKey]: 0 }));
      localStorage.setItem(`seen_badge_${badgeKey}`, "true");
    }
  }, [location.pathname]);

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 z-30 hidden h-screen flex-col bg-gradient-to-b from-slate-900 via-blue-950 to-cyan-950 shadow-2xl md:flex overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="font-black text-white text-sm">Admin Panel</p>
              <p className="text-xs text-blue-300">JobPortal SaaS</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {navItems.map((item, i) => {
          const isActive = location.pathname === item.to;
          const badgeKey = routeToBadgeKeyMap[item.to];
          const badgeCount = badgeKey ? (badges[badgeKey] || 0) : 0;

          return (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                to={item.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 group relative ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                    : "text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                  {badgeCount > 0 && sidebarCollapsed && (
                    <span className="absolute -right-1 -top-1 h-2.0 w-2.0 rounded-full bg-rose-500 ring-2 ring-slate-900 shadow-md shadow-rose-500/50 animate-pulse block" style={{ width: '8px', height: '8px' }} />
                  )}
                </div>

                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-semibold whitespace-nowrap flex-1"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {badgeCount > 0 && !sidebarCollapsed && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[9px] font-black text-white ring-2 ring-slate-900 shadow-md shadow-rose-500/30 animate-pulse flex-shrink-0">
                    {badgeCount}
                  </span>
                )}

                {isActive && !sidebarCollapsed && badgeCount === 0 && (
                  <motion.div layoutId="activeIndicator" className="ml-auto h-2 w-2 rounded-full bg-white" />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-white/10 p-3">
        <button
          onClick={() => dispatch(setSidebarCollapsed(!sidebarCollapsed))}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-slate-400 hover:bg-white/10 hover:text-white transition-all duration-200"
        >
          {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          {!sidebarCollapsed && <span className="text-xs font-semibold">Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default AdminSidebar;
