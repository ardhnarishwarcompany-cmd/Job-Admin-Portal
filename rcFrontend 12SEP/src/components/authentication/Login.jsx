import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import FloatingThemeToggle from "../components_lite/FloatingThemeToggle";
import axios from "axios";
import { toast } from "sonner";
import { USER_API_ENDPOINT } from "@/utils/data.js";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "@/redux/authSlice";
import { Eye, EyeOff, Loader2, LogIn, Briefcase, Users, KeyRound, Mail, ArrowLeft, RefreshCw } from "lucide-react";

const roles = [
  { value: "Employee", label: "Job Seeker", icon: Briefcase, color: "from-blue-500 to-cyan-600", desc: "Find your dream job" },
  { value: "Recruiter", label: "Employer", icon: Users, color: "from-emerald-500 to-teal-500", desc: "Hire top talent" },
];

const RESEND_COOLDOWN = 30;

const RoleSelector = ({ value, onChange }) => (
  <div className="grid grid-cols-2 gap-2">
    {roles.map((role) => (
      <motion.label
        key={role.value}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`relative cursor-pointer rounded-xl border p-3 text-center transition-all duration-200 ${
          value === role.value 
            ? "border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/25" 
            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
        }`}
      >
        <input type="radio" name="role" value={role.value} onChange={() => onChange(role.value)} className="sr-only" />
        <div className={`mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${role.color}`}>
          <role.icon className="h-4 w-4 text-white" />
        </div>
        <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{role.label}</p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-none">{role.desc}</p>
        {value === role.value && <motion.div layoutId="roleIndicator" className="absolute inset-0 rounded-xl border-2 border-blue-500 dark:border-blue-400" />}
      </motion.label>
    ))}
  </div>
);

const AnimatedTechMockup = () => {
  const [logs, setLogs] = useState([
    "Scanning credentials...",
    "Matching skill metrics...",
    "Extracting metadata from resume...",
    "Auditing ATS profile match...",
  ]);

  useEffect(() => {
    const lines = [
      "Connecting to recruiter pipelines...",
      "Initializing mock video feedback loop...",
      "Optimizing response pace telemetry...",
      "Analyzing semantic voice pacing...",
      "Credentials successfully verified!",
      "Preparing interview environment...",
    ];
    let idx = 0;
    const interval = setInterval(() => {
      setLogs((prev) => [...prev.slice(1), lines[idx]]);
      idx = (idx + 1) % lines.length;
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mt-5 w-full max-w-md border border-slate-200/50 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-5 shadow-lg overflow-hidden">
      <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-blue-600/10 blur-2xl" />
      
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">AI Scanner Simulator</span>
      </div>

      {/* Code output logger */}
      <div className="space-y-2 font-mono text-[11px] leading-relaxed text-slate-650 dark:text-slate-300 min-h-[100px]">
        {logs.map((log, i) => (
          <motion.div
            key={`${log}-${i}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className={`flex items-start gap-2 ${i === logs.length - 1 ? "text-blue-600 dark:text-cyan-400 font-bold" : ""}`}
          >
            <span className="text-slate-400">&gt;</span>
            <span>{log}</span>
          </motion.div>
        ))}
      </div>

      {/* Progress tracking */}
      <div className="mt-4 border-t border-slate-200/50 dark:border-slate-800 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Telemetry Link Active</span>
        </div>
        <div className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-900/30 rounded-full px-2.5 py-0.5 animate-pulse">
          96% MATCH
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  const [mode, setMode] = useState("password"); // password | otp
  const [input, setInput] = useState({ email: "", password: "", role: "" });
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, user } = useSelector((store) => store.auth);

  // OTP login state
  const [otpStep, setOtpStep] = useState("email"); // email | code
  const [otpEmail, setOtpEmail] = useState("");
  const [otpRole, setOtpRole] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef(null);

  const changeEventHandler = (e) => setInput({ ...input, [e.target.name]: e.target.value });

  const goToDashboard = (role) => {
    if (role === "Recruiter") navigate("/recruiter/dashboard");
    else if (role === "Employee") navigate("/employee-dashboard");
    else navigate("/");
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!input.role) {
      toast.error("Please select a role.");
      return;
    }
    try {
      dispatch(setLoading(true));
      const res = await axios.post(`${USER_API_ENDPOINT}/login`, input, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      if (res.data.success) {
        const role = res.data.user.role;
        if (role === "Admin") {
          toast.error("Admin accounts cannot sign in here.");
          return;
        }
        dispatch(setUser(res.data.user));
        toast.success(res.data.message);
        goToDashboard(role);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (!user || user.role === "Admin") return;
    goToDashboard(user.role);
  }, [user, navigate]);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(cooldownRef.current), []);

  const sendOtp = async (e) => {
    e?.preventDefault();
    if (!otpRole) {
      toast.error("Please select a role.");
      return;
    }
    if (!otpEmail.trim()) {
      toast.error("Enter your email first.");
      return;
    }
    setSendingOtp(true);
    try {
      const res = await axios.post(
        `${USER_API_ENDPOINT}/otp/login/send`,
        { email: otpEmail.trim(), role: otpRole },
        { headers: { "Content-Type": "application/json" } }
      );
      if (res.data.success) {
        toast.success(res.data.mocked ? "OTP generated (email not configured — check console/dev code)." : "Login code sent to your email.");
        if (res.data.devOtp) console.log("DEV OTP:", res.data.devOtp);
        setOtpStep("code");
        startCooldown();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not send login code.");
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      toast.error("Enter the 6-digit code sent to your email.");
      return;
    }
    setVerifyingOtp(true);
    try {
      const res = await axios.post(
        `${USER_API_ENDPOINT}/otp/login/verify`,
        { email: otpEmail.trim(), otp: otpCode.trim(), role: otpRole },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );
      if (res.data.success) {
        const role = res.data.user.role;
        if (role === "Admin") {
          toast.error("Admin accounts cannot sign in here.");
          return;
        }
        dispatch(setUser(res.data.user));
        toast.success(res.data.message);
        goToDashboard(role);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not verify the code.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const resetOtpFlow = () => {
    setOtpStep("email");
    setOtpCode("");
    clearInterval(cooldownRef.current);
    setCooldown(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex items-stretch justify-center relative overflow-hidden transition-colors duration-300">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-blue-600/10 dark:bg-blue-600/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-600/10 dark:bg-cyan-600/5 blur-3xl pointer-events-none" />

      {/* Split layout wrapper */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 items-stretch relative z-10">
        
        {/* Left pane: Marketing panel (Visible only on large screens) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between p-12 relative overflow-hidden border-r border-slate-200 dark:border-slate-900 bg-white/40 dark:bg-slate-900/10">
          <Link to="/" className="flex items-center gap-2 font-black tracking-tight text-slate-950 dark:text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 text-white text-xs font-black">AS</span>
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-900 via-blue-600 to-blue-300 dark:from-white dark:via-blue-300 dark:to-cyan-400">
              ArdhnariShwar
            </span>
          </Link>

          <div className="max-w-md">
            <h2 className="text-3xl font-black text-slate-950 dark:text-white sm:text-4xl leading-tight">
              Unlock the Power of AI-driven Hiring.
            </h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-display">
              Join thousands of tech candidates auditing their resumes, prep-testing mock video interviews on-camera, and directly messaging engineering teams.
            </p>
          </div>

          <AnimatedTechMockup />

          <div className="bg-slate-100/50 dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 font-display">
            <p className="text-xs italic text-slate-500 dark:text-slate-400">
              "The on-camera AI mock interviews prepared me exceptionally well for my final round at Innotech. My ATS score optimization helped bypass recruiter screening in 2 days."
            </p>
            <div className="flex items-center gap-2 mt-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-extrabold">AH</div>
              <div>
                <h6 className="text-xs font-bold text-slate-950 dark:text-white">Alex Harrison</h6>
                <span className="text-[10px] text-slate-400 block leading-none mt-0.5">Frontend Tech Lead</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right pane: Auth Form */}
        <div className="lg:col-span-6 flex flex-col justify-center items-center p-6 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20 mb-3"
              >
                <LogIn className="h-6 w-6" />
              </motion.div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Welcome Back</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-display">Sign in to your candidate or recruiter portal</p>
            </div>

            {/* Mode toggle — sliding pill matching Sign In button style */}
            <div className="login-tab-toggle mb-6 relative flex w-full rounded-xl bg-slate-100 dark:bg-slate-950 p-1">
              {/* Sliding pill — blue-to-cyan gradient, matching Sign In button */}
              <motion.div
                className="absolute top-1 bottom-1 rounded-lg z-0 pointer-events-none shadow-md
                           bg-gradient-to-r from-blue-600 to-cyan-600"
                animate={{
                  left: mode === "password" ? "4px" : "calc(50% + 2px)",
                  width: "calc(50% - 6px)",
                }}
                transition={{ type: "spring", stiffness: 500, damping: 38, mass: 0.5 }}
              />

              {/* Password tab */}
              <button
                type="button"
                onClick={() => setMode("password")}
                className="relative flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-extrabold z-10 cursor-pointer rounded-lg select-none"
              >
                <KeyRound className={`h-3.5 w-3.5 transition-colors duration-200 ${
                  mode === "password" ? "text-white" : "text-slate-400 dark:text-slate-500"
                }`} />
                <span className={`transition-colors duration-200 ${
                  mode === "password" ? "text-white" : "text-slate-500 dark:text-slate-500"
                }`}>
                  Password
                </span>
              </button>

              {/* OTP tab */}
              <button
                type="button"
                onClick={() => { setMode("otp"); resetOtpFlow(); }}
                className="relative flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-extrabold z-10 cursor-pointer rounded-lg select-none"
              >
                <Mail className={`h-3.5 w-3.5 transition-colors duration-200 ${
                  mode === "otp" ? "text-white" : "text-slate-400 dark:text-slate-500"
                }`} />
                <span className={`transition-colors duration-200 ${
                  mode === "otp" ? "text-white" : "text-slate-500 dark:text-slate-500"
                }`}>
                  Login with OTP
                </span>
              </button>
            </div>

            {mode === "password" && (
              <form onSubmit={submitHandler} className="space-y-4">
                {/* Email */}
                <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={input.email}
                    onChange={changeEventHandler}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-sm"
                  />
                </motion.div>

                {/* Password */}
                <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Password</label>
                    <Link to="/forgot-password" className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline">
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      name="password"
                      required
                      value={input.password}
                      onChange={changeEventHandler}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 pr-12 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      {showPass ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </motion.div>

                {/* Role selection */}
                <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">Access Category</label>
                  <RoleSelector value={input.role} onChange={(role) => setInput((p) => ({ ...p, role }))} />
                </motion.div>

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 py-3.5 text-sm font-bold text-white shadow-md hover:shadow-blue-500/25 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Verifying Credentials...</>
                  ) : (
                    <><LogIn className="h-4 w-4" /> Sign In</>
                  )}
                </motion.button>
              </form>
            )}

            {mode === "otp" && otpStep === "email" && (
              <form onSubmit={sendOtp} className="space-y-4">
                <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-sm"
                  />
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">Access Category</label>
                  <RoleSelector value={otpRole} onChange={setOtpRole} />
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500 font-display">
                    We will dispatch a 6-digit access token to this email address to initiate instant passwordless authentication.
                  </p>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={sendingOtp}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 py-3.5 text-sm font-bold text-white shadow-md hover:shadow-blue-500/25 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {sendingOtp ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Dispatching Code...</>
                  ) : (
                    <><Mail className="h-4 w-4" /> Send Access Code</>
                  )}
                </motion.button>
              </form>
            )}

            {mode === "otp" && otpStep === "code" && (
              <form onSubmit={verifyOtp} className="space-y-4">
                <div>
                  <button
                    type="button"
                    onClick={resetOtpFlow}
                    className="mb-3 inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Modify Email
                  </button>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••••"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-center text-lg tracking-[0.5em] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500 font-display">
                    Code sent to <span className="text-slate-800 dark:text-slate-300 font-bold">{otpEmail}</span>. Valid for 10 minutes.
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={verifyingOtp}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 py-3.5 text-sm font-bold text-white shadow-md hover:shadow-blue-500/25 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {verifyingOtp ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Authorizing...</>
                  ) : (
                    <><LogIn className="h-4 w-4" /> Verify &amp; Connect</>
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={cooldown > 0 || sendingOtp}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors disabled:opacity-40"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> {cooldown > 0 ? `Request new code in ${cooldown}s` : "Resend code"}
                </button>
              </form>
            )}

            <p className="mt-6 text-center text-xs md:text-sm text-slate-500 dark:text-slate-400 font-display">
              New to ArdhnariShwar?{" "}
              <Link to="/register" className="font-extrabold text-blue-600 dark:text-blue-400 hover:underline">
                Create Account
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
      <FloatingThemeToggle />
    </div>
  );
};

export default Login;
