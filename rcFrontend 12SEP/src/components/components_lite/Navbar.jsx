import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Bell,
  Bot,
  BriefcaseBusiness,
  ChevronDown,
  FileCheck2,
  FileSearch,
  Headphones,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  Sparkles,
  Star,
  Tags,
  Users,
  X,
  Globe2,
  CheckCircle2,
  Briefcase,
  MessageSquare,
  Trash2,
  AlertCircle,
  Video,
  Sun,
  Moon,
} from "lucide-react";
import {
  USER_API_ENDPOINT,
  MESSAGING_API_ENDPOINT,
  getFileUrl,
} from "@/utils/data";
import { getSocket } from "@/utils/socket";
import { setUser } from "@/redux/authSlice";
import logo from "./logo.jpeg";
import LanguageSelector from "./LanguageSelector";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
      title="Toggle Theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4.5 w-4.5 text-yellow-400" />
      ) : (
        <Moon className="h-4.5 w-4.5 text-indigo-600" />
      )}
    </motion.button>
  );
};

const candidateItems = [
  { to: "/cv-builder", label: "CV Builder", icon: FileCheck2 },
  { to: "/workforce", label: "Global Workforce", icon: Globe2 },
  { to: "/resume-scanner", label: "Resume Scanner", icon: FileSearch },
  { to: "/candidate/interviews", label: "Video Interviews", icon: Video },
  { to: "/my-complaints", label: "My Complaints", icon: AlertCircle },
];

const toolItems = [
  {
    to: "/recruiter/jd-maker",
    label: "JD Maker",
    icon: BriefcaseBusiness,
    recruiterOnly: true,
  },
  {
    to: "/recruiter/interviews",
    label: "AI Interviews Sent",
    icon: Video,
    recruiterOnly: true,
  },
  { to: "/tools/resume-matching", label: "Resume Matching", icon: FileSearch },
];

const moreItems = [
  { to: "/more/contact-us", label: "Contact Us", icon: Headphones },
  { to: "/more/pricing-plans", label: "Pricing Plans", icon: Tags },
];

// ─── Nav Dropdown ─────────────────────────────────────────────────────────────
const NavDropdown = ({ title, items, openMenu, setOpenMenu, closeMobile, user, navigate }) => {
  const isOpen = openMenu === title;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpenMenu(isOpen ? "" : title)}
        className="flex w-full whitespace-nowrap items-center justify-between gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-200 lg:w-auto"
      >
        {title}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="mt-2 grid w-full gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl shadow-slate-200/60 dark:shadow-none lg:absolute lg:left-0 lg:top-full lg:z-50 lg:mt-3 lg:w-64"
          >
            {items.map(({ to, label, icon: Icon }, i) => (
              <motion.div
                key={to}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to={user ? to : "/login"}
                  onClick={(e) => {
                    if (!user) {
                      e.preventDefault();
                      navigate("/login");
                    }
                    setOpenMenu("");
                    closeMobile();
                  }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-800 dark:hover:text-blue-400 transition-all duration-150"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Navbar ──────────────────────────────────────────────────────────────
// Routes where the navbar should always be light (no theme toggle)
const FORCE_LIGHT_ROUTES = ["/cv-builder", "/cv-maker", "/resume-scanner"];

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef(null);

  const isForcedLight = FORCE_LIGHT_ROUTES.some((p) => location.pathname.startsWith(p));

  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const fetchChatUnread = async () => {
    if (!user) {
      setChatUnreadCount(0);
      return;
    }
    try {
      const res = await axios.get(`${MESSAGING_API_ENDPOINT}/conversations`, {
        withCredentials: true,
      });
      if (res.data.success) {
        const total = res.data.conversations.reduce(
          (sum, c) => sum + (c.unreadCount || 0),
          0,
        );
        setChatUnreadCount(total);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        console.warn(
          "Session expired (401 on chat fetch). Clearing stale state.",
        );
        dispatch(setUser(null));
      }
    }
  };

  useEffect(() => {
    fetchChatUnread();
    const socket = getSocket();
    const onUpdate = () => fetchChatUnread();
    socket.on("conversation_updated", onUpdate);
    socket.on("new_message", onUpdate);
    // When this user reads messages, immediately refetch to clear the badge
    socket.on("messages_read", onUpdate);
    return () => {
      socket.off("conversation_updated", onUpdate);
      socket.off("new_message", onUpdate);
      socket.off("messages_read", onUpdate);
    };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenMenu("");
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  const visibleToolItems = toolItems.filter(
    (item) => !item.recruiterOnly || user?.role === "Recruiter",
  );

  const visibleMoreItems = moreItems;

  const getProfilePhoto = () => {
    const photo = user?.profilePhoto;
    return photo ? getFileUrl(photo) : "/default-avatar.svg";
  };

  const getDashboardPath = () => {
    if (user?.role === "Admin") return "/admin/dashboard";
    if (user?.role === "Recruiter") return "/recruiter/dashboard";
    if (user?.role === "Employee") return "/employee-dashboard";
    return "/";
  };

  const logoutHandler = async () => {
    try {
      const res = await axios.post(
        `${USER_API_ENDPOINT}/logout`,
        {},
        { withCredentials: true },
      );
      if (res.data.success) {
        dispatch(setUser(null));
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const roleLinks =
    user?.role === "Admin"
      ? [
          { to: "/admin/dashboard", label: "Dashboard" },
          { to: "/admin/users", label: "Users" },
          { to: "/admin/jobs", label: "Jobs" },
          { to: "/admin/applications", label: "Applications" },
        ]
      : user?.role === "Recruiter"
        ? [
            { to: "/recruiter/dashboard", label: "Dashboard" },
            { to: "/recruiter/jobs", label: "Jobs" },
            { to: "/recruiter/jobs/create", label: "Post Job" },
            { to: "/recruiter/find-candidates", label: "Find Candidates" },
            { to: "/recruiter/mass-workforce", label: "Mass Workforce" },
            { to: "/recruiter/complaints", label: "Complaints" },
          ]
        : [
            { to: "/", label: "Home" },
            { to: "/jobs", label: "Jobs" },
            { to: "/saved-jobs", label: "Saved Jobs" },
          ];

  return (
    <motion.nav
      ref={navRef}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`sticky top-0 z-50 border-b px-4 py-3 shadow-sm sm:px-6 lg:px-10 backdrop-blur-md ${
        isForcedLight
          ? "border-slate-200 bg-white/95 text-slate-900"
          : "border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95"
      }`}
    >
      <div className="mx-auto flex max-w-screen-2xl w-full items-center justify-between gap-2 sm:gap-3">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-black tracking-tight text-slate-900 dark:text-white"
        >
          <motion.span
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 overflow-hidden shadow-md flex-shrink-0 text-white font-black text-sm">
              <img src={logo} alt="Logo" className="h-10 w-10 " />
            </span>
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-900 via-blue-600 to-blue-300 dark:from-white dark:via-blue-300 dark:to-cyan-400 tracking-wide">
              ArdhnariShwar
            </span>
          </motion.span>
        </Link>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          {!isForcedLight && <ThemeToggle />}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle navigation"
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.div
                  key="x"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Nav body */}
        <AnimatePresence>
          <div
            className={`absolute left-0 right-0 top-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pb-4 shadow-lg lg:static lg:flex lg:flex-1 lg:items-center lg:justify-between lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none ${
              mobileOpen ? "block" : "hidden lg:flex"
            }`}
          >
            <div className="mt-3 flex flex-col gap-1 lg:mt-0 lg:flex-row lg:items-center lg:gap-0.5">
              {roleLinks.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={user || link.to === "/" ? link.to : "/login"}
                    onClick={(e) => {
                      if (!user && link.to !== "/") {
                        e.preventDefault();
                        navigate("/login");
                      }
                      closeMobile();
                    }}
                    className="block whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {!["Admin", "Recruiter"].includes(user?.role) && (
                <NavDropdown
                  title="For Candidates"
                  items={candidateItems}
                  openMenu={openMenu}
                  setOpenMenu={setOpenMenu}
                  closeMobile={closeMobile}
                  user={user}
                  navigate={navigate}
                />
              )}
              <NavDropdown
                title="Tools"
                items={visibleToolItems}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
                closeMobile={closeMobile}
                user={user}
                navigate={navigate}
              />
              <NavDropdown
                title="More"
                items={visibleMoreItems}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
                closeMobile={closeMobile}
                user={user}
                navigate={navigate}
              />
            </div>

              <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800 pt-4 lg:mt-0 lg:flex-row lg:items-center lg:border-0 lg:pt-0">
              <div id="google_translate_element" style={{ display: "none" }}></div>
              <LanguageSelector />
              {!isForcedLight && (
                <div className="hidden lg:block">
                  <ThemeToggle />
                </div>
              )}
              {user ? (
                <>
                  {/* Notification Bell */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => {
                      closeMobile();
                      if (user?.role === "Recruiter")
                        navigate("/recruiter/chats");
                      else if (user?.role === "Admin") navigate("/admin/chats");
                      else navigate("/candidate/chats");
                    }}
                    className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors shadow-sm"
                    title="Chats"
                  >
                    <MessageSquare className="h-4 w-4" />
                    {chatUnreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                        {chatUnreadCount > 9 ? "9+" : chatUnreadCount}
                      </span>
                    )}
                  </motion.button>

                  {/* Profile */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    type="button"
                    onClick={() => {
                      closeMobile();
                      navigate(getDashboardPath());
                    }}
                    className="flex min-w-0 items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-900 px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all duration-200"
                  >
                    <img
                      src={getProfilePhoto()}
                      alt={user?.fullname || "User"}
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-200 dark:ring-blue-800"
                    />
                    <div className="min-w-0 text-left">
                      <h1 className="max-w-[140px] truncate text-sm font-bold text-slate-900 dark:text-white">
                        {user?.fullname}
                      </h1>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        {user?.role === "Employee"
                          ? "Candidate"
                          : user?.role === "Recruiter"
                            ? "Employer"
                            : user?.role}
                      </p>
                    </div>
                  </motion.button>

                  {/* Logout */}
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={logoutHandler}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2 text-sm font-bold text-white shadow-md hover:shadow-rose-200 dark:hover:shadow-none transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </motion.button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Link
                      to="/login"
                      onClick={closeMobile}
                      className="rounded-xl px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-block"
                    >
                      Login
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Link
                      to="/register"
                      onClick={closeMobile}
                      className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:shadow-blue-200 dark:hover:shadow-none transition-all duration-200 inline-block"
                    >
                      Register
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
