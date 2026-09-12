import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

const FloatingThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.button
      whileHover={{ scale: 1.1, rotate: 12 }}
      whileTap={{ scale: 0.9 }}
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed bottom-6 left-6 z-[9998] flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 shadow-2xl transition-colors cursor-pointer"
      title="Toggle Theme"
    >
      {theme === "dark" ? (
        <Sun className="h-5.5 w-5.5 text-yellow-400" />
      ) : (
        <Moon className="h-5.5 w-5.5 text-indigo-600" />
      )}
    </motion.button>
  );
};

export default FloatingThemeToggle;