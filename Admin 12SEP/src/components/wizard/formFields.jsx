import React from "react";
import { motion } from "framer-motion";
import { Check, Upload, X } from "lucide-react";

export const Field = ({ label, required, hint, children, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {label && (
      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
    )}
    {children}
    {hint && <span className="text-xs text-slate-400 dark:text-slate-500">{hint}</span>}
  </div>
);

const baseInput =
  "w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-3.5 py-2.5 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none";

export const TextInput = (props) => <input {...props} className={`${baseInput} ${props.className || ""}`} />;

export const TextArea = (props) => (
  <textarea {...props} rows={props.rows || 4} className={`${baseInput} resize-y ${props.className || ""}`} />
);

export const SelectInput = ({ options = [], placeholder, ...props }) => (
  <select {...props} className={`${baseInput} ${props.className || ""}`}>
    <option value="">{placeholder || "Select..."}</option>
    {options.map((opt) => (
      <option key={opt} value={opt}>
        {opt}
      </option>
    ))}
  </select>
);

// Pill-style single-select (radio behaviour, nicer UI than native radios)
export const PillGroup = ({ options, value, onChange, name }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((opt) => {
      const active = value === opt;
      return (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            active
              ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-700"
          }`}
        >
          {opt}
        </button>
      );
    })}
  </div>
);

// Multi-select chip group -> value is an array
export const ChipMultiSelect = ({ options, value = [], onChange }) => {
  const toggle = (opt) => {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              active
                ? "border-cyan-600 bg-cyan-50 dark:bg-cyan-950/20 text-cyan-800 dark:text-cyan-400"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-cyan-300"
            }`}
          >
            {active && <Check className="h-3 w-3" />}
            {opt}
          </button>
        );
      })}
    </div>
  );
};

export const ToggleYesNo = ({ value, onChange, labels = ["Yes", "No"] }) => (
  <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-1">
    {[true, false].map((v, i) => (
      <button
        key={String(v)}
        type="button"
        onClick={() => onChange(v)}
        className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
          value === v ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white"
        }`}
      >
        {labels[i]}
      </button>
    ))}
  </div>
);

export const CheckboxRow = ({ checked, onChange, label }) => (
  <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
    <span
      onClick={() => onChange(!checked)}
      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-all ${
        checked ? "border-blue-600 bg-blue-600" : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
      }`}
    >
      {checked && <Check className="h-3.5 w-3.5 text-white" />}
    </span>
    {label}
  </label>
);

export const FileDrop = ({ label, accept, multiple, onChange, fileNames = [] }) => (
  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 px-4 py-6 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/40">
    <Upload className="h-5 w-5 text-slate-400" />
    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</span>
    {fileNames.length > 0 && (
      <span className="text-[11px] text-blue-600 font-medium">{fileNames.join(", ")}</span>
    )}
    <input type="file" accept={accept} multiple={multiple} onChange={onChange} className="hidden" />
  </label>
);

export const SectionCard = ({ title, description, icon: Icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-card"
  >
    <div className="mb-5 flex items-start gap-3">
      {Icon && (
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md">
          <Icon className="h-5 w-5" />
        </span>
      )}
      <div>
        <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        {description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
      </div>
    </div>
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</div>
  </motion.div>
);

// Dynamic repeatable rows (skills, certifications, languages, portfolio links...)
export const RepeatableList = ({ items, onAdd, onRemove, renderItem, addLabel = "Add another" }) => (
  <div className="col-span-full flex flex-col gap-3">
    {items.map((item, i) => (
      <div key={i} className="flex items-start gap-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-3">
        <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">{renderItem(item, i)}</div>
        <button
          type="button"
          onClick={() => onRemove(i)}
          className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    ))}
    <button
      type="button"
      onClick={onAdd}
      className="self-start rounded-lg border border-dashed border-blue-300 dark:border-blue-800 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 cursor-pointer"
    >
      + {addLabel}
    </button>
  </div>
);
