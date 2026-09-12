import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import FloatingThemeToggle from "../components_lite/FloatingThemeToggle";
import axios from "axios";
import { toast } from "sonner";
import { USER_API_ENDPOINT } from "@/utils/data";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "@/redux/authSlice";
import {
  ArrowLeft,
  BadgeCheck,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
} from "lucide-react";

const adminBenefits = [
  "Full platform control",
  "User and recruiter management",
  "Jobs, applications and requests access",
];

const InputField = ({ icon: Icon, label, name, type = "text", placeholder, onChange, value, required }) => (
  <label className="group block">
    <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">
      {label} {required && <span className="text-rose-500">*</span>}
    </span>
    <span className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-all duration-200 group-focus-within:border-rose-400 group-focus-within:ring-4 group-focus-within:ring-rose-100">
      <Icon className="h-4 w-4 flex-shrink-0 text-rose-500" />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
      />
    </span>
  </label>
);

const AdminRegister = () => {
  const [input, setInput] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    password: "",
    pancard: "",
    adharcard: "",
    adminCode: "",
    file: "",
  });
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, user } = useSelector((store) => store.auth);

  const changeEventHandler = (e) => setInput({ ...input, [e.target.name]: e.target.value });
  const changeFileHandler = (e) => setInput({ ...input, file: e.target.files?.[0] || "" });

  const submitHandler = async (e) => {
    e.preventDefault();

    const missing = [];
    if (!input.fullname) missing.push("Full Name");
    if (!input.email) missing.push("Email");
    if (!input.phoneNumber) missing.push("Phone Number");
    if (!input.password) missing.push("Password");
    if (!input.pancard) missing.push("PAN Card");
    if (!input.adharcard) missing.push("Aadhar Card");
    if (!input.adminCode) missing.push("Admin Code");
    
    if (missing.length > 0) {
      toast.error(`Required fields missing: ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? "..." : ""}`);
      return;
    }

    const formData = new FormData();
    formData.append("fullname", input.fullname);
    formData.append("email", input.email);
    formData.append("phoneNumber", input.phoneNumber);
    formData.append("password", input.password);
    formData.append("pancard", input.pancard);
    formData.append("adharcard", input.adharcard);
    formData.append("adminCode", input.adminCode);
    formData.append("role", "Admin");
    if (input.file) formData.append("file", input.file);

    try {
      dispatch(setLoading(true));
      const res = await axios.post(`${USER_API_ENDPOINT}/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success("Admin registration created successfully");
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Admin registration failed");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (user?.role === "Admin") navigate("/admin/dashboard");
    else if (user) navigate("/");
  }, [user, navigate]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(244,63,94,0.35),transparent_28rem),radial-gradient(circle_at_80%_20%,rgba(20,184,166,0.22),transparent_24rem),linear-gradient(135deg,#020617_0%,#111827_48%,#1e1b4b_100%)]" />

      <motion.div
        className="absolute left-[10%] top-24 h-28 w-28 rounded-full border border-rose-300/30"
        animate={{ y: [0, -18, 0], rotate: [0, 20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-[12%] h-36 w-36 rounded-full border border-teal-300/25"
        animate={{ y: [0, 22, 0], rotate: [0, -18, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/2 top-10 h-2 w-2 rounded-full bg-rose-300 shadow-[0_0_45px_18px_rgba(251,113,133,0.55)]"
        animate={{ /* scale animation removed to prevent layout growth */ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.section
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-8"
        >
          <Link to="/register" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-md hover:bg-white/15">
            <ArrowLeft className="h-4 w-4" />
            Back to user registration
          </Link>

          <div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 180 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-300/30 bg-rose-400/10 px-4 py-2 text-sm font-black text-rose-100"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin Access Portal
            </motion.div>
            <h1 className="max-w-xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
              Create a secure admin command account
            </h1>
            <p className="mt-5 max-w-lg text-base font-medium leading-7 text-slate-300">
              A dedicated registration flow for platform admins with a focused access code, identity fields and a polished control-room feel.
            </p>
          </div>

          <div className="grid gap-3">
            {adminBenefits.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.08 }}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md"
              >
                <BadgeCheck className="h-5 w-5 text-teal-300" />
                <span className="text-sm font-bold text-slate-100">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 35, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-r from-rose-500 via-amber-400 to-teal-400 opacity-70 blur" />
          <div className="relative rounded-[28px] border border-white/20 bg-white p-5 text-slate-900 shadow-2xl shadow-rose-950/40 sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-rose-500">Restricted Signup</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Admin Registration</h2>
              </div>
              <motion.div
                animate={{ rotate: [0, 8, -8, 0], scale: 1 }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-300"
              >
                <Sparkles className="h-7 w-7 text-amber-300" />
              </motion.div>
            </div>

            <form onSubmit={submitHandler} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField icon={UserRound} label="Full Name" name="fullname" placeholder="Admin name" onChange={changeEventHandler} value={input.fullname} required />
                <InputField icon={Mail} label="Email" name="email" type="email" placeholder="admin@example.com" onChange={changeEventHandler} value={input.email} required />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <InputField icon={Phone} label="Phone" name="phoneNumber" placeholder="+91 98765 43210" onChange={changeEventHandler} value={input.phoneNumber} />
                <InputField icon={Fingerprint} label="PAN Card" name="pancard" placeholder="ABCDE1234F" onChange={changeEventHandler} value={input.pancard} />
              </div>

              <InputField icon={Fingerprint} label="Aadhar Card" name="adharcard" placeholder="1234 5678 9012" onChange={changeEventHandler} value={input.adharcard} />

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="group block">
                  <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                    Password <span className="text-rose-500">*</span>
                  </span>
                  <span className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-all duration-200 group-focus-within:border-rose-400 group-focus-within:ring-4 group-focus-within:ring-rose-100">
                    <LockKeyhole className="h-4 w-4 flex-shrink-0 text-rose-500" />
                    <input
                      type={showPass ? "text" : "password"}
                      name="password"
                      value={input.password}
                      onChange={changeEventHandler}
                      placeholder="Strong password"
                      className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
                    />
                    <button type="button" onClick={() => setShowPass((v) => !v)} className="text-slate-500 hover:text-slate-900">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </span>
                </label>

                <InputField icon={KeyRound} label="Admin Code" name="adminCode" type="password" placeholder="Secret admin code" onChange={changeEventHandler} value={input.adminCode} />
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-slate-600 transition-all duration-200 hover:border-rose-400 hover:bg-rose-100">
                <Upload className="h-5 w-5 text-rose-500" />
                <span>{input.file ? input.file.name : "Upload admin profile photo"}</span>
                <input type="file" accept="image/*" onChange={changeFileHandler} className="sr-only" />
              </label>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 via-orange-500 to-teal-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-rose-200 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating admin...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Create Admin Account
                  </>
                )}
              </motion.button>
            </form>

            <p className="mt-5 text-center text-sm font-semibold text-slate-500">
              Already registered?{" "}
              <Link to="/login" className="font-black text-rose-600 hover:text-rose-700">
                Sign in as admin
              </Link>
            </p>
          </div>
        </motion.section>
      </div>
      <FloatingThemeToggle />
    </main>
  );
};

export default AdminRegister;
