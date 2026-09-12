import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { USER_API_ENDPOINT } from "@/utils/data.js";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "@/redux/authSlice";
import { Eye, EyeOff, Loader2, LogIn, Briefcase, Users, Shield } from "lucide-react";

const roles = [
  { value: "Employee", label: "Job Seeker", icon: Briefcase, color: "from-blue-500 to-cyan-600", desc: "Find your dream job" },
  { value: "Recruiter", label: "Recruiter", icon: Users, color: "from-emerald-500 to-teal-500", desc: "Hire top talent" },
  { value: "Admin", label: "Admin", icon: Shield, color: "from-rose-500 to-orange-500", desc: "Manage platform" },
];

const Login = () => {
  const [input, setInput] = useState({ email: "", password: "", role: "" });
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, user } = useSelector((store) => store.auth);

  const changeEventHandler = (e) => setInput({ ...input, [e.target.name]: e.target.value });

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch(setLoading(true));
      const res = await axios.post(`${USER_API_ENDPOINT}/login`, input, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setUser(res.data.user));
        toast.success(res.data.message);
        const role = res.data.user.role;
        if (role === "Admin") navigate("/admin/dashboard");
        else if (role === "Recruiter") navigate("/recruiter/dashboard");
        else if (role === "Employee") navigate("/employee-dashboard");
        else navigate("/");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (!user) return;
    if (user.role === "Admin") navigate("/admin/dashboard");
    else if (user.role === "Recruiter") navigate("/recruiter/dashboard");
    else if (user.role === "Employee") navigate("/employee-dashboard");
    else navigate("/");
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-950 flex items-center justify-center px-4 py-12">
      {/* Background blobs */}
      <motion.div
        animate={{ /* scale animation removed to prevent layout growth */ opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 7, repeat: Infinity }}
        className="absolute top-0 left-0 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ /* scale animation removed to prevent layout growth */ opacity: [0.15, 0.3, 0.15] }}
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
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/30 mb-4"
            >
              <LogIn className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-black text-white">Welcome Back</h1>
            <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={submitHandler} className="space-y-5">
            {/* Email */}
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                name="email"
                value={input.email}
                onChange={changeEventHandler}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 text-sm"
              />
            </motion.div>

            {/* Password */}
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
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
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 pr-12 text-white placeholder-slate-500 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 text-sm"
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

            {/* Role selection */}
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Select Role</label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((role) => (
                  <motion.label
                    key={role.value}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`relative cursor-pointer rounded-xl border p-3 text-center transition-all duration-200 ${
                      input.role === role.value
                        ? "border-blue-400 bg-blue-500/20"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      onChange={changeEventHandler}
                      className="sr-only"
                    />
                    <div className={`mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${role.color}`}>
                      <role.icon className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-xs font-bold text-white">{role.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{role.desc}</p>
                    {input.role === role.value && (
                      <motion.div
                        layoutId="roleIndicator"
                        className="absolute inset-0 rounded-xl border-2 border-blue-400"
                      />
                    )}
                  </motion.label>
                ))}
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
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
              ) : (
                <><LogIn className="h-4 w-4" /> Sign In</>
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link to="/register" className="font-bold text-blue-400 hover:text-blue-300 transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
