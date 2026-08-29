"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Inbox,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  Sparkles,
  LogOut,
  Compass,
  ChevronRight,
  Search,
  Bell,
  Settings,
  Moon,
  X,
  Menu,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import AdminOverviewPanel from "./AdminOverviewPanel";
import AdminPackagesPanel from "./AdminPackagesPanel";
import AdminEnquiriesPanel from "./AdminEnquiriesPanel";
import AdminUsersPanel from "./AdminUsersPanel";
import CreatorStudioWizard from "./CreatorStudioWizard";
import {
  deletePackageAction,
  updatePackageAction,
  createPackageAction,
} from "@/lib/actions/packages";
import {
  updateInquiryStatusAction,
  grantAdminRoleAction,
  removeAdminRoleAction,
} from "@/lib/actions/admin";

export type AdminTab = "overview" | "packages" | "enquiries" | "admins";

const NAV_ITEMS: Array<{
  id: AdminTab;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  badge?: string;
}> = [
  {
    id: "overview",
    label: "Dashboard",
    sublabel: "Analytics & insights",
    icon: LayoutDashboard,
  },
  {
    id: "packages",
    label: "Expeditions",
    sublabel: "Manage tour packages",
    icon: Package,
  },
  {
    id: "enquiries",
    label: "Inquiries & Quotes",
    sublabel: "Customer messages",
    icon: Inbox,
    badge: "3",
  },
  {
    id: "admins",
    label: "Admin Team",
    sublabel: "Roles & permissions",
    icon: ShieldCheck,
  },
];

interface AdminDashboardShellProps {
  initialStats: any;
  initialPackages: any[];
  initialInquiries: any[];
  initialAdmins: any[];
  user: { name: string; email: string; picture: string | null } | null;
}

export default function AdminDashboardShell({
  initialStats,
  initialPackages,
  initialInquiries,
  initialAdmins,
  user,
}: AdminDashboardShellProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [packages, setPackages] = useState<any[]>(initialPackages);
  const [inquiries, setInquiries] = useState<any[]>(initialInquiries);
  const [admins, setAdmins] = useState<any[]>(initialAdmins);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Studio Mode State
  const [isCreatingPackage, setIsCreatingPackage] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any | null>(null);

  const handleDeletePackage = async (id: string) => {
    const res = await deletePackageAction(id);
    if (res.success) {
      setPackages((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleUpdateInquiryStatus = async (id: string, status: any) => {
    const res = await updateInquiryStatusAction(id, status);
    if (res.success) {
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status } : inq))
      );
    }
  };

  const handleGrantAdmin = async (email: string, role: any, name?: string) => {
    const res = await grantAdminRoleAction(email, role, name);
    if (res.success && res.admin) {
      setAdmins((prev) => [res.admin, ...prev]);
    }
  };

  const handleRemoveAdmin = async (id: string) => {
    const res = await removeAdminRoleAction(id);
    if (res.success) {
      setAdmins((prev) => prev.filter((a) => a.id !== id));
    }
  };

  // Render Creator Studio (full-screen takeover)
  if (isCreatingPackage || editingPackage) {
    return (
      <div className="min-h-screen bg-[#fafbfc]">
        <CreatorStudioWizard
          initialData={editingPackage}
          onCancel={() => {
            setIsCreatingPackage(false);
            setEditingPackage(null);
          }}
          onSuccess={() => {
            setIsCreatingPackage(false);
            setEditingPackage(null);
            setActiveTab("packages");
          }}
        />
      </div>
    );
  }

  const activeNavItem = NAV_ITEMS.find((n) => n.id === activeTab);

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex">
      {/* ─── Mobile Sidebar Overlay ─── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ─── Fixed Sidebar ─── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0f172a] text-white flex flex-col transform transition-transform duration-300 ease-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="px-6 pt-7 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight leading-none">
                  Wonderlust
                </h1>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Admin Console
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Create Package CTA */}
        <div className="px-5 pb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditingPackage(null);
              setIsCreatingPackage(true);
              setSidebarOpen(false);
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold text-sm shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Plus className="w-4.5 h-4.5" /> Create Package
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-3">
            Navigation
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`relative w-full px-4 py-3.5 rounded-xl text-sm font-medium flex items-center justify-between transition-all duration-200 cursor-pointer group ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  />
                  <div className="text-left">
                    <span className="block font-semibold text-[13px]">
                      {item.label}
                    </span>
                    <span className="block text-[11px] text-slate-500 font-normal mt-0.5">
                      {item.sublabel}
                    </span>
                  </div>
                </span>

                {item.badge && (
                  <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}

                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-cyan-400"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="px-5 pb-6 space-y-4 mt-auto">
          <div className="h-px bg-slate-700/50" />

          {/* User Profile Card */}
          {user && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-cyan-500/30 shrink-0">
                {user.picture ? (
                  <Image
                    src={user.picture}
                    alt={user.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white">
                    {user.name[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user.name}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}

          {/* Storefront Link */}
          <Link
            href="/"
            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-cyan-400 hover:bg-white/5 flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4" />
              Main Storefront
            </span>
          </Link>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
          <div className="px-6 lg:px-10 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {activeNavItem?.label}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5 hidden sm:block">
                  {activeNavItem?.sublabel}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden md:flex items-center relative">
                <Search className="w-4 h-4 absolute left-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="pl-9 pr-4 py-2.5 w-64 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none text-sm text-slate-700 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500" />
              </button>

              {/* Settings */}
              <button className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 lg:p-10">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <AdminOverviewPanel
                  stats={{
                    ...initialStats,
                    totalPackages: packages.length,
                  }}
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                />
              </motion.div>
            )}

            {activeTab === "packages" && (
              <motion.div
                key="packages"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <AdminPackagesPanel
                  packages={packages}
                  onCreatePackage={() => {
                    setEditingPackage(null);
                    setIsCreatingPackage(true);
                  }}
                  onEditPackage={(pkg) => setEditingPackage(pkg)}
                  onDeletePackage={handleDeletePackage}
                />
              </motion.div>
            )}

            {activeTab === "enquiries" && (
              <motion.div
                key="enquiries"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <AdminEnquiriesPanel
                  inquiries={inquiries}
                  onUpdateStatus={handleUpdateInquiryStatus}
                />
              </motion.div>
            )}

            {activeTab === "admins" && (
              <motion.div
                key="admins"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <AdminUsersPanel
                  admins={admins}
                  onGrantAdmin={handleGrantAdmin}
                  onRemoveAdmin={handleRemoveAdmin}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Minimal Footer */}
        <footer className="px-6 lg:px-10 py-4 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-400">
          <span>Wonderlust Console &copy; {new Date().getFullYear()}</span>
          <div className="flex items-center gap-4">
            <a href="/en" className="hover:text-slate-600 transition-colors">
              Main Site
            </a>
            <a
              href="/en/packages"
              className="hover:text-slate-600 transition-colors"
            >
              Tour Catalog
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
