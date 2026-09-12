/* eslint-disable react/prop-types */
import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Search, Sparkles, TrendingUp, Users, Briefcase, Bot, CheckCircle, Video, MessageSquare } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to]);

  return <span className="notranslate" translate="no">{display}{suffix}</span>;
};

const TypingText = ({ phrases, speed = 70, delay = 2000 }) => {
  const [displayText, setDisplayText] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIdx];
    let timer;

    if (isDeleting) {
      if (charIdx > 0) {
        timer = setTimeout(() => {
          setDisplayText(currentPhrase.substring(0, charIdx - 1));
          setCharIdx(charIdx - 1);
        }, speed / 2);
      } else {
        setIsDeleting(false);
        setPhraseIdx((phraseIdx + 1) % phrases.length);
      }
    } else {
      if (charIdx < currentPhrase.length) {
        timer = setTimeout(() => {
          setDisplayText(currentPhrase.substring(0, charIdx + 1));
          setCharIdx(charIdx + 1);
        }, speed);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, delay);
      }
    }

    return () => clearTimeout(timer);
  }, [charIdx, isDeleting, phraseIdx, phrases, speed, delay]);

  return (
    <span className="notranslate text-slate-800 dark:text-white/95 inline-flex items-center min-h-[1.2em]" translate="no">
      {displayText}
      <span className="inline-block w-[3px] h-[1.15em] bg-blue-600 dark:bg-blue-400 ml-1.5 animate-pulse" />
    </span>
  );
};

const Header = () => {
  const { user } = useSelector((store) => store.auth);
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const heroRef = useRef(null);
  const leftColRef = useRef(null);
  const rightColRef = useRef(null);

  useEffect(() => {
    // Guard: heroRef must be attached to a DOM node before running GSAP
    if (!heroRef.current) return;

    // GSAP ScrollTrigger intro animations
    const ctx = gsap.context(() => {
      // Title, subtext, search bar, badges, and stats
      gsap.fromTo(
        ".gsap-fade-up",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top 85%",
          },
        }
      );

      // Right-side floating demo cards stagger
      gsap.fromTo(
        ".gsap-float-card",
        { opacity: 0, scale: 0.9, y: 50 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.9,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top 75%",
          },
        }
      );

      // Continuous subtle floating animations
      gsap.to(".gsap-float-1", {
        y: -12,
        repeat: -1,
        yoyo: true,
        duration: 3.5,
        ease: "sine.inOut",
      });
      gsap.to(".gsap-float-2", {
        y: 10,
        repeat: -1,
        yoyo: true,
        duration: 4,
        ease: "sine.inOut",
        delay: 0.4,
      });
      gsap.to(".gsap-float-3", {
        y: -8,
        repeat: -1,
        yoyo: true,
        duration: 3,
        ease: "sine.inOut",
        delay: 0.8,
      });
    }, heroRef.current); // ← pass the DOM node, not the ref object

    return () => ctx.revert();
  }, []);

  const searchjobHandler = () => {
    if (!user) {
      navigate("/login");
    } else {
      dispatch(setSearchedQuery(query));
      navigate("/jobs");
    }
  };

  const handleBadgeClick = (label) => {
    if (!user) {
      navigate("/login");
    } else {
      dispatch(setSearchedQuery(label));
      navigate("/jobs");
    }
  };

  return (
    <div
      ref={heroRef}
      className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white py-16 lg:py-28 px-4 md:px-8 border-b border-slate-200 dark:border-slate-900 transition-colors duration-300"
    >
      {/* Background shimmers */}
      <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-blue-600/10 dark:bg-blue-600/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-600/10 dark:bg-cyan-600/5 blur-3xl pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDgwIEwgNDAgODAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY2VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAuMiIgb3BhY2l0eT0iMC4wNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-60 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        {/* Left pane: Text column */}
        <div ref={leftColRef} className="lg:col-span-7 flex flex-col justify-center text-left space-y-6">
          
          {/* Badge */}
          <div className="gsap-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-800/40 bg-blue-50/50 dark:bg-blue-950/30 px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 backdrop-blur-sm shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-yellow-500 animate-pulse" />
              The Next-Generation AI Career Orchestrator
            </span>
          </div>

          {/* Heading */}
          <h1 className="gsap-fade-up text-4xl font-black leading-tight sm:text-5xl lg:text-6xl tracking-tight text-slate-900 dark:text-white">
            Accelerate Your{" "}
            <span className="bg-gradient-to-r from-blue-600 via-pink-500 to-cyan-500 dark:from-blue-400 dark:via-pink-400 dark:to-cyan-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
              Tech Career.
            </span>
            <br />
            <span className="block min-h-[1.25em]">
              <TypingText
                phrases={[
                  "Get Hired Fast.",
                  "Build AI Resumes.",
                  "Audit ATS Scores.",
                  "AI Mock Interviews.",
                  "Chat with Recruiters."
                ]}
              />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="gsap-fade-up text-slate-500 dark:text-slate-350 text-base sm:text-lg leading-relaxed max-w-xl font-display">
            Construct premium resumes, audit them against corporate ATS filters, prepare with mock video interviews, and message top-tier recruiters directly.
          </p>

          {/* Search bar */}
          <div className="gsap-fade-up flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl dark:shadow-none max-w-xl">
            <Search className="ml-2 h-5 w-5 flex-shrink-0 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchjobHandler()}
              placeholder="Search by job title, skills, or target company..."
              className="flex-1 bg-transparent py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none text-sm md:text-base font-medium"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={searchjobHandler}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-blue-500/20 transition-all"
            >
              Search Jobs
            </motion.button>
          </div>

          {/* Floating category badges */}
          <div className="gsap-fade-up flex flex-wrap gap-2">
            {floatingBadges.map((badge) => (
              <motion.span
                key={badge.label}
                whileHover={{ scale: 1.05, y: -2 }}
                onClick={() => handleBadgeClick(badge.label)}
                className={`cursor-pointer rounded-full bg-slate-100 hover:bg-blue-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-350 transition-colors shadow-sm`}
              >
                {badge.label}
              </motion.span>
            ))}
          </div>

          {/* Stats */}
          <div className="gsap-fade-up grid grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800/80 pt-6 max-w-xl">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-start">
                <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white font-display">
                  <CountUp to={stat.value} suffix={stat.suffix} />
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider mt-0.5">{stat.label}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Right pane: Animation columns */}
        <div ref={rightColRef} className="lg:col-span-5 relative h-[380px] md:h-[450px] flex items-center justify-center pointer-events-none select-none">
          {/* Glowing aura */}
          <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

          {/* Main Visual Frame */}
          <div className="relative w-full max-w-[340px] md:max-w-[400px] h-[320px] md:h-[380px] border border-slate-200/80 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-3xl p-5 shadow-2xl">
            
            {/* Card 1: Match Score (Top Left) */}
            <div className="gsap-float-card gsap-float-1 absolute -top-6 -left-6 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl z-25">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ATS Audit</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900 dark:text-white">88%</span>
                <span className="text-[10px] font-bold text-emerald-500">ATS Optimized</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-[88%]" />
              </div>
            </div>

            {/* Card 2: AI Video Interview Waveform (Center Right) */}
            <div className="gsap-float-card gsap-float-2 absolute top-12 -right-8 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl z-20">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <Video className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">AI Speech Audit</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-300 font-display leading-tight italic">
                {"\"Voice modulation & pacing optimized for leadership rounds.\""}
              </p>
              {/* Waveform lines */}
              <div className="flex items-end justify-between h-5 gap-1 mt-3">
                {[12, 18, 6, 22, 14, 28, 8, 16, 24, 10, 18, 4].map((h, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-gradient-to-t from-blue-600 to-cyan-500 rounded-sm"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
            </div>

            {/* Card 3: Recruiter Outreach alert (Bottom Left) */}
            <div className="gsap-float-card gsap-float-3 absolute -bottom-4 -left-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xl z-30 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-black">
                AH
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-slate-900 dark:text-white truncate">Recruiter Outreach</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-400 truncate">Invitation to interview</p>
              </div>
              <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 animate-ping" />
            </div>

            {/* Central illustration mockup */}
            <div className="h-full flex flex-col justify-between items-center py-6 text-center">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                <Bot className="h-7 w-7" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">ArdhnariShwar AI Engine</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 max-w-[180px] leading-relaxed font-display">
                  Auditing credentials, compiling skill mappings, and matching job pipelines.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 border border-blue-200/50 dark:border-blue-900/30 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                <MessageSquare className="h-3 w-3" /> Live Audit Active
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Trusted-by marquee */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="relative z-10 mt-16 border-t border-slate-200 dark:border-slate-900 pt-8"
      >
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Trusted by hiring teams at
        </p>
        <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max animate-marquee gap-10">
            {[...trustedBy, ...trustedBy].map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="whitespace-nowrap text-lg font-bold text-slate-400/50 dark:text-slate-600/40 font-display"
              >
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