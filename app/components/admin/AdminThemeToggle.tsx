"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

export default function AdminThemeToggle() {
  const [{ theme, mounted }, setThemeState] = useState<{ theme: "light" | "dark"; mounted: boolean }>({
    theme: "light",
    mounted: false,
  });

  useEffect(() => {
    // One-time read of localStorage/matchMedia on mount — unavailable during SSR, so this
    // can't be computed as a lazy initial state without causing a hydration mismatch.
    const stored = localStorage.getItem("wonderlust_admin_theme");
    const dark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- single state update syncing from localStorage/matchMedia, not reactive component state
    setThemeState({ theme: dark ? "dark" : "light", mounted: true });
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setThemeState({ theme: next, mounted: true });
    localStorage.setItem("wonderlust_admin_theme", next);

    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700 shadow-xs"
      title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -45, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 45, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {theme === "light" ? (
          <Moon className="w-5 h-5 text-slate-600" />
        ) : (
          <Sun className="w-5 h-5 text-amber-400" />
        )}
      </motion.div>
    </motion.button>
  );
}
