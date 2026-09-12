import React from "react";
import { motion } from "framer-motion";
import {
  FileText, Sparkles, ScanSearch, Wand2, MessagesSquare, Users2,
  ClipboardCheck, Bot,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "AI CV Maker",
    desc: "Build a polished, ATS-friendly resume in minutes — pick a template, preview live, and download as PDF.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: ScanSearch,
    title: "Resume ATS Scanner",
    desc: "Upload your resume and get a real AI-generated ATS score with matched and missing keywords.",
    color: "from-teal-500 to-emerald-500",
  },
  {
    icon: Sparkles,
    title: "AI Job Matching",
    desc: "We match your skills and experience against live openings so you see the roles that actually fit.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Wand2,
    title: "AI JD Maker",
    desc: "Recruiters can generate clear, compelling job descriptions in seconds instead of starting from scratch.",
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: Users2,
    title: "Find Candidates",
    desc: "Recruiters can search and filter the candidate pool directly instead of waiting for applications.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: MessagesSquare,
    title: "Built-in Chat",
    desc: "Message candidates or recruiters directly on the platform — no back-and-forth over email.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: ClipboardCheck,
    title: "Application Tracking",
    desc: "Track every application's status in real time, from submitted to shortlisted to hired.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Bot,
    title: "AI Interview Prep",
    desc: "Practice with AI-driven mock interview questions tailored to the role you're applying for.",
    color: "from-sky-500 to-indigo-500",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: "easeOut" } },
};

const PlatformFeatures = () => {
  return (
    <section className="bg-white py-16 px-4 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-700">
            <Sparkles className="h-3.5 w-3.5" /> Everything in one platform
          </p>
          <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">
            Tools built for both sides of hiring
          </h2>
          <p className="mt-3 text-base text-slate-500 sm:text-lg">
            Whether you're job hunting or hiring, ArdhnariShwar gives you AI-powered tools to move faster and make better decisions.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={cardVariants}
              whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(15,23,42,0.08)" }}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-300 hover:border-blue-200"
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <f.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-1.5 text-base font-black text-slate-900">{f.title}</h3>
              <p className="text-sm leading-relaxed text-slate-500">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PlatformFeatures;
