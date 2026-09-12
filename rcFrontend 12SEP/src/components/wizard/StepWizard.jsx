import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";

const StepWizard = ({ steps, onSubmit, submitting, submitLabel = "Submit", validateStep }) => {
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState(null);
  const isLast = current === steps.length - 1;

  const runValidation = () => {
    if (!validateStep) return true;
    const result = validateStep(current);
    if (result === true || result === undefined) {
      setError(null);
      return true;
    }
    setError(typeof result === "string" ? result : "Please fill in all required fields before continuing");
    return false;
  };

  const next = () => {
    if (!runValidation()) return;
    setCurrent((c) => Math.min(c + 1, steps.length - 1));
  };
  const prev = () => {
    setError(null);
    setCurrent((c) => Math.max(c - 1, 0));
  };
  const handleSubmit = () => {
    if (!runValidation()) return;
    onSubmit();
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Mobile/Tablet Compact Progress Card (hidden on medium screens and above) */}
      <div className="md:hidden mb-6 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3.5 mb-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white font-extrabold text-xs shadow-md">
            {String(current + 1).padStart(2, "0")}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Step {current + 1} of {steps.length}
            </span>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate mt-0.5">
              {steps[current].title}
            </h3>
          </div>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full rounded-full transition-all duration-300 ease-out" 
            style={{ width: `${((current + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop Step Timeline (hidden on small viewports) */}
      <div className="hidden md:block mb-10">
        <div className="flex items-center justify-between gap-1">
          {steps.map((step, i) => (
            <React.Fragment key={step.title}>
              <button
                type="button"
                onClick={() => i < current && (setError(null), setCurrent(i))}
                disabled={i > current}
                className="flex flex-col items-center gap-1.5 flex-1 relative cursor-pointer group disabled:cursor-not-allowed"
              >
                {/* Circle */}
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition-all ${
                    i < current
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : i === current
                      ? "bg-white dark:bg-slate-850 text-blue-700 dark:text-blue-400 ring-2 ring-blue-600 dark:ring-blue-500 shadow-lg"
                      : "bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {i < current ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                
                {/* Label text */}
                <span
                  className={`text-[9px] font-black uppercase tracking-wider text-center mt-1 max-w-[85px] leading-tight transition-colors ${
                    i === current 
                      ? "text-blue-600 dark:text-blue-400" 
                      : i < current 
                      ? "text-slate-700 dark:text-slate-300 group-hover:text-blue-500" 
                      : "text-slate-450 dark:text-slate-650"
                  }`}
                >
                  {step.title}
                </span>
              </button>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="h-0.5 flex-1 bg-slate-200 dark:bg-slate-800 relative -top-3.5 -mx-2">
                  <div 
                    className="absolute inset-0 bg-blue-600 transition-all duration-300"
                    style={{ width: i < current ? "100%" : "0%" }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex flex-col gap-5 text-slate-900 dark:text-white"
        >
          <div className="mb-1">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Step {current + 1} of {steps.length}
            </p>
            <h2 className="font-display text-2xl font-black text-slate-900 dark:text-white">{steps[current].title}</h2>
            {steps[current].subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{steps[current].subtitle}</p>}
          </div>
          {steps[current].content}
        </motion.div>
      </AnimatePresence>

      {/* Validation error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="mt-4 flex items-center gap-2 overflow-hidden rounded-xl border border-rose-200 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-950/20 px-4 py-3 text-sm font-semibold text-rose-650 dark:text-rose-400"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="mt-8 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-5">
        <button
          type="button"
          onClick={prev}
          disabled={current === 0}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        {!isLast ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={next}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-blue-500/25 transition-all duration-200 cursor-pointer"
          >
            Continue <ChevronRight className="h-4 w-4" />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-blue-500/25 transition-all duration-200 disabled:opacity-60 cursor-pointer"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {submitLabel}
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default StepWizard;
