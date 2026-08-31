"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Inbox,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

export type AdminTab = "overview" | "packages" | "enquiries" | "admins";

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onCreateNewPackage: () => void;
}

const NAV_ITEMS: Array<{
  id: AdminTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
}> = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "packages", label: "Expeditions", icon: Package },
  { id: "enquiries", label: "Inquiries & Quotes", icon: Inbox, badge: "New" },
  { id: "admins", label: "Admin Team", icon: ShieldCheck },
];

export default function AdminSidebar({
  activeTab,
  onTabChange,
  onCreateNewPackage,
}: AdminSidebarProps) {
  return (
    <aside className="w-full lg:w-60 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] shrink-0 space-y-5">
      {/* Console Brand Badge */}
      <div className="px-1 py-1 flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-50 border border-cyan-200/60 text-cyan-800 text-[10px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-2.5 h-2.5 text-cyan-600" /> Executive Console
          </div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">
            WONDERLUST
          </h2>
        </div>
      </div>

      {/* Primary Action Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onCreateNewPackage}
        className="w-full py-2.5 px-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-sm shadow-cyan-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
      >
        <Plus className="w-4 h-4" /> Create Package
      </motion.button>

      {/* Navigation Links */}
      <nav className="space-y-1">
        <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
          Navigation
        </p>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-cyan-400" : "text-slate-400"
                  }`}
                />
                {item.label}
              </span>

              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    isActive
                      ? "bg-cyan-500/20 text-cyan-300"
                      : "bg-cyan-50 text-cyan-700 border border-cyan-200/60"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Exit Shortcut */}
      <div className="pt-3 border-t border-slate-100">
        <Link
          href="/"
          className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-cyan-600 hover:bg-slate-50 flex items-center justify-between transition-colors"
        >
          <span>Main Storefront</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}
