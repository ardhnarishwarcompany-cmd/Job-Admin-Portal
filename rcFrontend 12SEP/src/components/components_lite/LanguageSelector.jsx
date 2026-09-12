import React, { useState, useEffect, useRef } from "react";
import { Globe, Search, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi (हिन्दी)" },
  { code: "es", name: "Spanish (Español)" },
  { code: "fr", name: "French (Français)" },
  { code: "de", name: "German (Deutsch)" },
  { code: "zh-CN", name: "Chinese (中文)" },
  { code: "ar", name: "Arabic (العربية)" },
  { code: "ru", name: "Russian (Русский)" },
  { code: "pt", name: "Portuguese (Português)" },
  { code: "ja", name: "Japanese (日本語)" },
  { code: "pa", name: "Punjabi (ਪੰਜਾਬੀ)" },
  { code: "bn", name: "Bengali (বাংলা)" },
  { code: "te", name: "Telugu (తెలుగు)" },
  { code: "mr", name: "Marathi (मराठी)" },
  { code: "ta", name: "Tamil (தமிழ்)" },
  { code: "gu", name: "Gujarati (ગુજરાતી)" },
  { code: "ur", name: "Urdu (اردو)" },
  { code: "kn", name: "Kannada (ಕನ್ನಡ)" },
  { code: "ml", name: "Malayalam (മലയാളം)" },
  { code: "it", name: "Italian (Italiano)" },
  { code: "ko", name: "Korean (한국어)" },
  { code: "tr", name: "Turkish (Türkçe)" },
  { code: "vi", name: "Vietnamese (Tiếng Việt)" },
  { code: "pl", name: "Polish (Polski)" },
  { code: "uk", name: "Ukrainian (Українська)" },
  { code: "nl", name: "Dutch (Nederlands)" },
  { code: "th", name: "Thai (ไทย)" },
];

const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLang, setSelectedLang] = useState("en");
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync state with Google Translate's cookie on mount
  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };

    const transCookie = getCookie("googtrans");
    if (transCookie) {
      const lang = transCookie.split("/").pop();
      if (lang) {
        setSelectedLang(lang);
      }
    }
  }, []);

  const handleSelectLanguage = (langCode) => {
    // 1. Set Google Translate cookies for persistence across reloads/page changes
    document.cookie = "googtrans=/en/" + langCode + "; path=/";
    document.cookie = "googtrans=/en/" + langCode + "; path=/; domain=" + window.location.hostname;

    // 2. Apply dynamically using the Google select box
    const selectEl = document.querySelector(".goog-te-combo");
    if (selectEl) {
      selectEl.value = langCode;
      
      // Dispatch a bubbling change event so Google's listener is triggered
      const changeEvent = new Event("change", { bubbles: true, cancelable: true });
      selectEl.dispatchEvent(changeEvent);
      
      setSelectedLang(langCode);
      setIsOpen(false);
      setSearchTerm("");

      // Fast fallback to ensure DOM is cleanly updated in case dynamic dispatch was blocked
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } else {
      // Fallback: If elements aren't initialized yet, cookies are set, reload is enough
      setSelectedLang(langCode);
      setIsOpen(false);
      setSearchTerm("");
      window.location.reload();
    }
  };

  const selectedLanguageObj = LANGUAGES.find((l) => l.code === selectedLang) || LANGUAGES[0];

  const filteredLanguages = LANGUAGES.filter((l) =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative z-50 text-slate-800 dark:text-slate-100" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 items-center justify-center gap-1.5 px-3 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-xs font-bold"
      >
        <Globe className="h-4 w-4 text-blue-500 flex-shrink-0" />
        <span className="max-w-[80px] truncate">{selectedLanguageObj.name.split(" ")[0]}</span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Floating Dropdown Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2 shadow-2xl backdrop-blur-xl"
          >
            {/* Search Input */}
            <div className="relative flex items-center mb-2 px-2 py-1.5 border-b border-slate-100 dark:border-slate-800">
              <Search className="absolute left-4 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search language..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none border-none placeholder-slate-400 dark:placeholder-slate-500 font-semibold"
                autoFocus
              />
            </div>

            {/* Scrollable Language List */}
            <div className="max-h-60 overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 pr-1">
              {filteredLanguages.length > 0 ? (
                filteredLanguages.map((lang) => {
                  const isSelected = lang.code === selectedLang;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleSelectLanguage(lang.code)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all duration-150 ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                          : "hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350"
                      }`}
                    >
                      <span>{lang.name}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                    </button>
                  );
                })
              ) : (
                <div className="py-6 text-center text-[11px] text-slate-400 italic">
                  No languages found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;
