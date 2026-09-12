import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Search, Sparkles, TrendingUp, Users, Briefcase } from "lucide-react";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import { useNavigate } from "react-router-dom";

const floatingBadges = [
  { label: "React Developer", color: "from-blue-500 to-sky-600", delay: 0 },
  { label: "UI/UX Designer", color: "from-pink-500 to-rose-500", delay: 0.15 },
  { label: "Data Scientist", color: "from-blue-500 to-cyan-500", delay: 0.3 },
  { label: "DevOps Engineer", color: "from-emerald-500 to-teal-500", delay: 0.45 },
];

const stats = [
  { icon: Briefcase, value: 50000, suffix: "+", label: "Jobs Posted" },
  { icon: Users, value: 200000, suffix: "+", label: "Candidates" },
  { icon: TrendingUp, value: 95, suffix: "%", label: "Placement Rate" },
];

const trustedBy = [
  "Innotech", "NimbusWorks", "Quantify", "BrightPath", "Vertex Labs",
  "CloudNine", "Pixel Forge", "DataSphere", "NovaHire", "Skyline Tech",
];

const CountUp = ({ to, suffix = "" }) => {
  const [display, setDisplay] = useState(0);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.floor(v).toLocaleString());

  useEffect(() => {
    const controls = animate(count, to, { duration: 1.8, ease: "easeOut", delay: 0.8 });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [to]);

  return <span>{display}{suffix}</span>;
};

const Header = () => {
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const searchjobHandler = () => {
    dispatch(setSearchedQuery(query));
    navigate("/jobs");
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-950 py-20 px-4">
      {/* Animated background blobs */}
      <motion.div
        animate={{ /* scale animation removed to prevent layout growth */ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"
      />
      <motion.div
        animate={{ /* scale animation removed to prevent layout growth */ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-600/20 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/10 blur-3xl"
      />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC4yIiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300 backdrop-blur-sm"
        >
          <motion.span
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            <Sparkles className="h-4 w-4 text-yellow-400" />
          </motion.span>
          India's #1 AI-Powered Job Portal
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl"
        >
          Find Your{" "}
          <motion.span
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="bg-gradient-to-r from-blue-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_auto]"
          >
            Dream Career
          </motion.span>
          <br />
          <span className="text-white/90">& Get Hired Fast</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mx-auto mt-5 max-w-2xl text-lg text-slate-300/90"
        >
          Connect with top companies, discover life-changing opportunities, and land your perfect job with AI-powered matching.
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-2xl border border-white/20 bg-white/10 p-2 backdrop-blur-md shadow-2xl shadow-blue-900/40"
        >
          <Search className="ml-2 h-5 w-5 flex-shrink-0 text-slate-300" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchjobHandler()}
            placeholder="Job title, skills, or company..."
            className="flex-1 bg-transparent py-2 text-white placeholder-slate-400 outline-none text-base"
          />
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={searchjobHandler}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
          >
            Search Jobs
          </motion.button>
        </motion.div>

        {/* Floating category badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex flex-wrap justify-center gap-2"
        >
          {floatingBadges.map((badge, i) => (
            <motion.span
              key={badge.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + badge.delay }}
              whileHover={{ scale: 1.08, y: -2 }}
              className={`cursor-pointer rounded-full bg-gradient-to-r ${badge.color} px-4 py-1.5 text-xs font-semibold text-white shadow-md`}
            >
              {badge.label}
            </motion.span>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 flex flex-wrap justify-center gap-8"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="flex items-center gap-2">
                <stat.icon className="h-4 w-4 text-blue-400" />
                <span className="text-2xl font-black text-white font-display">
                  <CountUp to={stat.value} suffix={stat.suffix} />
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Trusted-by marquee */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-10 mt-14 border-t border-white/10 pt-6"
      >
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Trusted by hiring teams at
        </p>
        <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max animate-marquee gap-10">
            {[...trustedBy, ...trustedBy].map((name, i) => (
              <span key={`${name}-${i}`} className="whitespace-nowrap text-lg font-bold text-slate-400/70 font-display">
                {name}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Header;
