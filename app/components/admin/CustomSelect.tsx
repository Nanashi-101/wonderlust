"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  badge?: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}

export default function CustomSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select option",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-xl bg-white border transition-all text-left flex items-center justify-between text-sm cursor-pointer shadow-xs ${
          isOpen
            ? "border-cyan-500 ring-4 ring-cyan-500/10 text-neutral-900"
            : "border-neutral-300 hover:border-neutral-400 text-neutral-900"
        }`}
      >
        <span className="flex items-center gap-2 truncate font-medium">
          {selectedOption?.icon}
          {selectedOption ? selectedOption.label : placeholder}
          {selectedOption?.badge && (
            <span className="px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 text-[10px] font-bold">
              {selectedOption.badge}
            </span>
          )}
        </span>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-neutral-400 shrink-0 ml-2"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 left-0 right-0 bg-white/95 backdrop-blur-xl border border-neutral-200 rounded-2xl shadow-2xl p-1.5 overflow-hidden max-h-60 overflow-y-auto"
          >
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-cyan-50 text-cyan-900 font-semibold"
                      : "text-neutral-700 hover:bg-neutral-100/80 hover:text-neutral-900"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    {option.icon}
                    {option.label}
                    {option.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-bold">
                        {option.badge}
                      </span>
                    )}
                  </span>

                  {isSelected && <Check className="w-4 h-4 text-cyan-600 shrink-0 ml-2" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
