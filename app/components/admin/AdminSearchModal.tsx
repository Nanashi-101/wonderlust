"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Package as PackageIcon,
  Inbox,
  ShieldCheck,
  MapPin,
  Clock,
  IndianRupee,
  Mail,
  Crown,
  User,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Edit3,
} from "lucide-react";
import Image from "next/image";
import { getImageUrl } from "@/lib/package-utils";
import { AdminTab } from "./AdminDashboardShell";

interface AdminSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: AdminTab;
  packages: any[];
  inquiries: any[];
  admins: any[];
  onSelectPackage?: (pkg: any) => void;
  onSelectInquiry?: (inquiry: any) => void;
  onSelectAdmin?: (admin: any) => void;
}

export default function AdminSearchModal({
  isOpen,
  onClose,
  activeTab,
  packages,
  inquiries,
  admins,
  onSelectPackage,
  onSelectInquiry,
  onSelectAdmin,
}: AdminSearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // Reset the query synchronously when the modal transitions from closed to open
  // (adjusting state during render, rather than in an effect, avoids an extra render pass)
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setQuery("");
    }
  }

  // Auto focus input on open (DOM side effect, not state)
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard shortcut ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Section details
  const sectionInfo = useMemo(() => {
    switch (activeTab) {
      case "packages":
        return {
          title: "Expeditions & Packages",
          placeholder: "Search by title, destination, category, highlights...",
          icon: PackageIcon,
          badgeColor: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
        };
      case "enquiries":
        return {
          title: "Customer Inquiries & Quotes",
          placeholder: "Search by customer name, email, destination, message...",
          icon: Inbox,
          badgeColor: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        };
      case "admins":
        return {
          title: "Admin Team Directory",
          placeholder: "Search by admin name, email, role...",
          icon: ShieldCheck,
          badgeColor: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
        };
      default:
        return {
          title: "Dashboard",
          placeholder: "Search is not active on overview",
          icon: Search,
          badgeColor: "bg-slate-50 text-slate-700 border-slate-200",
        };
    }
  }, [activeTab]);

  // Filtered packages
  const filteredPackages = useMemo(() => {
    if (activeTab !== "packages" || !query.trim()) return packages.slice(0, 8);
    const q = query.toLowerCase();
    return packages.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.destination?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.difficulty?.toLowerCase().includes(q) ||
        p.highlights?.some((h: string) => h.toLowerCase().includes(q))
    );
  }, [activeTab, query, packages]);

  // Filtered inquiries
  const filteredInquiries = useMemo(() => {
    if (activeTab !== "enquiries" || !query.trim()) return inquiries.slice(0, 8);
    const q = query.toLowerCase();
    return inquiries.filter(
      (i) =>
        i.name?.toLowerCase().includes(q) ||
        i.email?.toLowerCase().includes(q) ||
        i.destination?.toLowerCase().includes(q) ||
        i.message?.toLowerCase().includes(q) ||
        i.status?.toLowerCase().includes(q) ||
        i.type?.toLowerCase().includes(q)
    );
  }, [activeTab, query, inquiries]);

  // Filtered admins
  const filteredAdmins = useMemo(() => {
    if (activeTab !== "admins" || !query.trim()) return admins;
    const q = query.toLowerCase();
    return admins.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.role?.toLowerCase().includes(q) ||
        a.grantedBy?.toLowerCase().includes(q)
    );
  }, [activeTab, query, admins]);

  if (!isOpen) return null;

  const SectionIcon = sectionInfo.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-md">
        {/* Backdrop click to close */}
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh] z-10"
        >
          {/* Header & Search Input */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${sectionInfo.badgeColor}`}
                >
                  <SectionIcon className="w-3.5 h-3.5" />
                  {sectionInfo.title}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  Section-specific search
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative flex items-center">
              <Search className="w-5 h-5 absolute left-4 text-cyan-500" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={sectionInfo.placeholder}
                className="w-full pl-12 pr-10 py-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3.5 text-xs px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Search Results Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-100 dark:divide-slate-800/60">
            {/* Packages Section */}
            {activeTab === "packages" && (
              <div className="space-y-2 pt-1">
                {filteredPackages.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <PackageIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">No tour packages match &quot;{query}&quot;</p>
                  </div>
                ) : (
                  filteredPackages.map((pkg) => {
                    const imgUrl = getImageUrl(pkg.imagePath);
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => {
                          onSelectPackage?.(pkg);
                          onClose();
                        }}
                        className="group flex items-center justify-between gap-4 p-3 rounded-2xl hover:bg-cyan-50/60 dark:hover:bg-slate-800/90 border border-transparent hover:border-cyan-200/60 dark:hover:border-cyan-800/40 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                            <Image
                              src={imgUrl}
                              alt={pkg.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                              {pkg.title}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-cyan-500" /> {pkg.destination}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {pkg.durationDays}D/{pkg.durationNights}N
                              </span>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                ₹{pkg.priceFrom?.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                            {pkg.category}
                          </span>
                          <span className="p-2 rounded-xl bg-white dark:bg-slate-700 shadow-sm group-hover:bg-cyan-500 group-hover:text-white text-slate-400 transition-all">
                            <Edit3 className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Inquiries Section */}
            {activeTab === "enquiries" && (
              <div className="space-y-2 pt-1">
                {filteredInquiries.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <Inbox className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">No customer inquiries match &quot;{query}&quot;</p>
                  </div>
                ) : (
                  filteredInquiries.map((inq) => (
                    <div
                      key={inq.id}
                      onClick={() => {
                        onSelectInquiry?.(inq);
                        onClose();
                      }}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl hover:bg-amber-50/60 dark:hover:bg-slate-800/90 border border-transparent hover:border-amber-200/60 dark:hover:border-amber-800/40 transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {inq.name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2) || "??"}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {inq.name}
                            </h4>
                            {inq.destination && (
                              <span className="text-[11px] font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-md">
                                {inq.destination}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {inq.email}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-1 italic">
                            &ldquo;{inq.message}&rdquo;
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:self-center shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            inq.status === "NEW"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border border-amber-300 dark:border-amber-700"
                              : inq.status === "IN_PROGRESS"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                          }`}
                        >
                          {inq.status}
                        </span>
                        <span className="p-1.5 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Admins Section */}
            {activeTab === "admins" && (
              <div className="space-y-2 pt-1">
                {filteredAdmins.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <ShieldCheck className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">No admin members match &quot;{query}&quot;</p>
                  </div>
                ) : (
                  filteredAdmins.map((adm) => (
                    <div
                      key={adm.id}
                      onClick={() => {
                        onSelectAdmin?.(adm);
                        onClose();
                      }}
                      className="group flex items-center justify-between gap-3 p-3.5 rounded-2xl hover:bg-purple-50/60 dark:hover:bg-slate-800/90 border border-transparent hover:border-purple-200/60 dark:hover:border-purple-800/40 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                            adm.role === "SUPER_ADMIN"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300"
                              : "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300"
                          }`}
                        >
                          {adm.role === "SUPER_ADMIN" ? (
                            <Crown className="w-5 h-5" />
                          ) : (
                            <User className="w-5 h-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {adm.name || adm.email.split("@")[0]}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {adm.email}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                          adm.role === "SUPER_ADMIN"
                            ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                            : "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800"
                        }`}
                      >
                        {adm.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 px-5">
            <span>
              Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-mono text-[11px]">ESC</kbd> to exit
            </span>
            <span>
              Showing results in <strong>{sectionInfo.title}</strong>
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
