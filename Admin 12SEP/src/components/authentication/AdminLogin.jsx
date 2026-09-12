import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import FloatingThemeToggle from "../components_lite/FloatingThemeToggle";
import axios from "axios";
import { toast } from "sonner";
import { USER_API_ENDPOINT } from "@/utils/data.js";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "@/redux/authSlice";
import { Eye, EyeOff, Loader2, LogIn, ShieldCheck, KeyRound, Mail, ArrowLeft, RefreshCw } from "lucide-react";

const RESEND_COOLDOWN = 30;

const AdminLogin = () => {
  const [mode, setMode] = useState("password"); // password | otp
  const [input, setInput] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, user } = useSelector((store) => store.auth);

  // OTP login state
  const [otpStep, setOtpStep] = useState("email"); // email | code
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef(null);

  const changeEventHandler = (e) => setInput({ ...input, [e.target.name]: e.target.value });

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch(setLoading(true));
      const res = await axios.post(
        `${USER_API_ENDPOINT}/login`,
        { ...input, role: "Admin" },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        if (res.data.user?.role !== "Admin") {
          toast.error("This portal is for admin accounts only.");
          dispatch(setLoading(false));
          return;
        }
        dispatch(setUser(res.data.user));
        toast.success(res.data.message);
        navigate("/admin/dashboard");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (user?.role === "Admin") {
      navigate("/admin/dashboard");
    } else if (user && (user.role === "Recruiter" || user.role === "Employee")) {
      window.location.href = "http://localhost:5173/";
    }
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
    if (!otpEmail.trim()) {
      toast.error("Enter your admin email first.");
      return;
    }
    setSendingOtp(true);
    try {
      const res = await axios.post(
        `${USER_API_ENDPOINT}/otp/login/send`,
        { email: otpEmail.trim(), role: "Admin" },
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
        { email: otpEmail.trim(), otp: otpCode.trim(), role: "Admin" },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );
      if (res.data.success) {
        if (res.data.user?.role !== "Admin") {
          toast.error("This portal is for admin accounts only.");
          return;
        }
        dispatch(setUser(res.data.user));
        toast.success(res.data.message);
        navigate("/admin/dashboard");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-950 flex items-center justify-center px-4 py-12">
      {/* Background blobs */}
      <motion.div
        animate={{ opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 7, repeat: Infinity }}
        className="absolute top-0 left-0 h-96 w-96 rounded-full bg-rose-600/20 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 9, repeat: Infinity, delay: 1 }}
        className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-600/20 blur-3xl pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-blue-900/40 p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 shadow-lg shadow-rose-500/30 mb-4"
            >
              <ShieldCheck className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-black text-white">ArdhnariShwar Admin</h1>
            <p className="text-slate-400 text-sm mt-1">Sign in to the admin control panel</p>
          </div>

          {/* Mode toggle */}
          <div className="mb-6 inline-flex w-full rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => { setMode("password"); }}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
                mode === "password" ? "bg-white text-slate-900 shadow" : "text-slate-300 hover:text-white"
              }`}
            >
              <KeyRound className="h-3.5 w-3.5" /> Password
            </button>
            <button
              type="button"
              onClick={() => { setMode("otp"); resetOtpFlow(); }}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
                mode === "otp" ? "bg-white text-slate-900 shadow" : "text-slate-300 hover:text-white"
              }`}
            >
              <Mail className="h-3.5 w-3.5" /> Login with OTP
            </button>
          </div>

          {mode === "password" && (
            <form onSubmit={submitHandler} className="space-y-5">
              {/* Email */}
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Admin Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={input.email}
                  onChange={changeEventHandler}
                  placeholder="admin@ardhnarishwar.com"
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 transition-all duration-200 text-sm"
                />
              </motion.div>

              {/* Password */}
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
                  <Link to="/forgot-password" className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    name="password"
                    value={input.password}
                    onChange={changeEventHandler}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 pr-12 text-white placeholder-slate-500 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 transition-all duration-200 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-2 top-1/2 !-translate-y-1/2 hover:!-translate-y-1/2 hover:!shadow-none p-2 text-slate-400 hover:text-white transition-colors z-10 cursor-pointer"
                  >
                    {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </motion.div>

              {/* Submit */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
                ) : (
                  <><LogIn className="h-4 w-4" /> Sign In</>
                )}
              </motion.button>
            </form>
          )}

          {mode === "otp" && otpStep === "email" && (
            <form onSubmit={sendOtp} className="space-y-5">
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={otpEmail}
                  onChange={(e) => setOtpEmail(e.target.value)}
                  placeholder="admin@ardhnarishwar.com"
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 transition-all duration-200 text-sm"
                />
                <p className="mt-2 text-xs text-slate-500">We'll email a 6-digit code to sign you in — no password needed.</p>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={sendingOtp}
                className="w-full rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {sendingOtp ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Sending code...</>
                ) : (
                  <><Mail className="h-4 w-4" /> Send Login Code</>
                )}
              </motion.button>
            </form>
          )}

          {mode === "otp" && otpStep === "code" && (
            <form onSubmit={verifyOtp} className="space-y-5">
              <div>
                <button
                  type="button"
                  onClick={resetOtpFlow}
                  className="mb-3 inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Change email
                </button>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Enter 6-digit code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-center text-lg tracking-[0.5em] text-white placeholder-slate-500 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 transition-all duration-200"
                />
                <p className="mt-2 text-xs text-slate-500">Sent to <span className="text-slate-300">{otpEmail}</span>. Code expires in 10 minutes.</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={verifyingOtp}
                className="w-full rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {verifyingOtp ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</>
                ) : (
                  <><LogIn className="h-4 w-4" /> Verify &amp; Sign In</>
                )}
              </motion.button>

              <button
                type="button"
                onClick={sendOtp}
                disabled={cooldown > 0 || sendingOtp}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors disabled:opacity-40 disabled:hover:text-slate-400"
              >
                <RefreshCw className="h-3.5 w-3.5" /> {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-slate-500">
            This portal is restricted to authorized ArdhnariShwar administrators.
          </p>
        </div>
      </motion.div>
      <FloatingThemeToggle />
    </div>
  );
};

export default AdminLogin;
