"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  Inbox,
  CheckCircle2,
} from "lucide-react";
import { AdminTab } from "./AdminDashboardShell";

interface AdminNotificationsProps {
  inquiries: any[];
  onNavigateToEnquiries: () => void;
}

export default function AdminNotifications({
  inquiries,
  onNavigateToEnquiries,
}: AdminNotificationsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [toastInquiry, setToastInquiry] = useState<any | null>(null);
  const [toastDismissed, setToastDismissed] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter new/unresolved inquiries
  const newInquiries = useMemo(() => inquiries.filter((i) => i.status === "NEW"), [inquiries]);
  const recentInquiries = inquiries.slice(0, 6);
  const latestNewInquiryId = newInquiries[0]?.id ?? null;

  // Show Toast preview when a new NEW inquiry arrives (keyed on id, not array identity,
  // so this doesn't refire on every parent re-render)
  useEffect(() => {
    if (!latestNewInquiryId || toastDismissed) return;
    const latest = newInquiries.find((i) => i.id === latestNewInquiryId) ?? null;
    setToastInquiry(latest);

    // Auto dismiss after 9 seconds
    const timer = setTimeout(() => {
      setToastInquiry(null);
    }, 9000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- newInquiries intentionally omitted; latestNewInquiryId is the derived value that should retrigger this
  }, [latestNewInquiryId, toastDismissed]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleToastClick = () => {
    setToastInquiry(null);
    setToastDismissed(true);
    onNavigateToEnquiries();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`relative p-2.5 rounded-xl transition-all cursor-pointer ${
          isDropdownOpen
            ? "bg-cyan-50 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm"
            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
        }`}
        title="Enquiry Notifications"
      >
        <Bell className="w-5 h-5" />
        {newInquiries.length > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500 text-white font-bold" />
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 flex flex-col"
          >
            {/* Dropdown Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <Inbox className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Enquiry Notifications
                </h3>
              </div>
              {newInquiries.length > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-[11px] font-bold">
                  {newInquiries.length} New
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">All caught up</span>
              )}
            </div>

            {/* Inquiries List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2 space-y-1">
              {recentInquiries.length === 0 ? (
                <div className="py-8 text-center text-slate-400 dark:text-slate-500">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-medium">No enquiries recorded yet</p>
                </div>
              ) : (
                recentInquiries.map((inq) => (
                  <div
                    key={inq.id}
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onNavigateToEnquiries();
                    }}
                    className={`p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 group ${
                      inq.status === "NEW"
                        ? "bg-cyan-50/50 dark:bg-cyan-950/30 hover:bg-cyan-50 dark:hover:bg-cyan-950/50"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-[11px] font-bold shrink-0 mt-0.5">
                      {inq.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2) || "??"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {inq.name}
                        </p>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            inq.status === "NEW"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200"
                              : inq.status === "IN_PROGRESS"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200"
                          }`}
                        >
                          {inq.status}
                        </span>
                      </div>

                      {inq.destination && (
                        <p className="text-[11px] font-medium text-cyan-600 dark:text-cyan-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5" /> {inq.destination}
                        </p>
                      )}

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 italic">
                        &ldquo;{inq.message}&rdquo;
                      </p>

                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(inq.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Dropdown Footer */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onNavigateToEnquiries();
                }}
                className="w-full py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                Open Enquiry Management <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toast Notification Preview - Positioned in top right */}
      <AnimatePresence>
        {toastInquiry && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed top-6 right-6 z-[9999] max-w-sm w-[calc(100%-3rem)] bg-slate-900 dark:bg-slate-800 text-white rounded-2xl p-4 shadow-2xl border border-slate-700/80 backdrop-blur-xl"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white shrink-0 shadow-md">
                <Sparkles className="w-4.5 h-4.5" />
              </div>

              <div className="flex-1 min-w-0 cursor-pointer" onClick={handleToastClick}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                    New Trip Enquiry
                  </span>
                  <span className="text-[10px] text-slate-400">Just now</span>
                </div>
                <h4 className="text-xs font-bold text-white truncate mt-0.5">
                  {toastInquiry.name}{" "}
                  {toastInquiry.destination ? `· ${toastInquiry.destination}` : ""}
                </h4>
                <p className="text-[11px] text-slate-300 mt-1 line-clamp-1 italic">
                  &ldquo;{toastInquiry.message}&rdquo;
                </p>
                <div className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300">
                  Review Inquiry <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setToastInquiry(null);
                  setToastDismissed(true);
                }}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
