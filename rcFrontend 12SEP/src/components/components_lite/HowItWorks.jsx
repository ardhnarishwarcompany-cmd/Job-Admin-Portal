import React from "react";
import { motion } from "framer-motion";
import { UserPlus, FileEdit, Sparkles, Trophy } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "1. Establish Identity",
    desc: "Register your profile as a candidate or recruiter in seconds. Enable portfolio syncing and preferences."
  },
  {
    icon: FileEdit,
    title: "2. Generate Collateral",
    desc: "Instantly build ATS-optimized resumes or generate structured job descriptions using our LLM templates."
  },
  {
    icon: Sparkles,
    title: "3. Semantic Matching",
    desc: "Our neural matching layer cross-references skill profiles against vacancy descriptions for precise scoring."
  },
  {
    icon: Trophy,
    title: "4. Assess & Secure",
    desc: "Facilitate AI-driven video mock interviews, initiate built-in socket chat, and sign employment contracts."
  }
];

const HowItWorks = () => {
  return (
    <section className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800/80 py-20 px-4 sm:py-28 transition-colors duration-300">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <h2 className="text-3xl font-black text-slate-900 dark:text-white sm:text-4xl tracking-tight">
            How The Ecosystem Works
          </h2>
          <p className="mt-3 text-base text-slate-500 dark:text-slate-400 sm:text-lg font-display">
            A unified four-step workflow matching candidate capabilities to organizational needs.
          </p>
        </motion.div>

        <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* connecting line on large screens */}
          <div className="pointer-events-none absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent lg:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative flex flex-col items-center text-center p-6 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 rounded-3xl"
            >
              <motion.div
                whileHover={{ scale: 1.08, rotate: 2 }}
                className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20"
              >
                <step.icon className="h-7 w-7" />
              </motion.div>
              <h3 className="mb-2 text-base font-extrabold text-slate-900 dark:text-white">
                {step.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-display">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
