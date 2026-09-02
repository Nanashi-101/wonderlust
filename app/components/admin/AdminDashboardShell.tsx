"use client";

import { useState, useEffect } from "react";

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
import AdminSearchModal from "./AdminSearchModal";
import AdminNotifications from "./AdminNotifications";
import {

  deletePackageAction,
  updatePackageAction,
  createPackageAction,
} from "@/lib/actions/packages";
import {
  updateInquiryStatusAction,
  replyToInquiryAction,
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
  user: { name: string; email: string; picture: string | null; role: string } | null;
}

export default function AdminDashboardShell({
  initialStats,
  initialPackages,
  initialInquiries,
  initialAdmins,
  user,
}: AdminDashboardShellProps) {
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const visibleNavItems = NAV_ITEMS.filter((item) => item.id !== "admins" || isSuperAdmin);

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [packages, setPackages] = useState<any[]>(initialPackages);
  const [inquiries, setInquiries] = useState<any[]>(initialInquiries);
  const [admins, setAdmins] = useState<any[]>(initialAdmins);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Studio Mode State
  const [isCreatingPackage, setIsCreatingPackage] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any | null>(null);

  // Global Ctrl+K shortcut for search
  const isSearchDisabled = activeTab === "overview";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (activeTab !== "overview") {
          setIsSearchModalOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab]);


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

  const handleReplyToInquiry = async (
    id: string,
    reply: string,
    status: any = "IN_PROGRESS",
    options?: { subject?: string; sendEmail?: boolean }
  ) => {
    const res = await replyToInquiryAction(id, reply, status, options);
    if (res.success && res.inquiry) {
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === id ? { ...inq, reply, status: res.inquiry.status || status } : inq
        )
      );
      return { success: true };
    }
    return { success: false, error: res.error };
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
      <div className="min-h-screen bg-[#fafbfc] dark:bg-slate-950">
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
  const newInquiriesCount = inquiries.filter((i) => i.status === "NEW").length;

  const searchPlaceholderText = () => {
    switch (activeTab) {
      case "packages":
        return "Search expeditions (Ctrl+K)...";
      case "enquiries":
        return "Search customer inquiries (Ctrl+K)...";
      case "admins":
        return "Search admin team (Ctrl+K)...";
      default:
        return "Search disabled on Dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200 max-w-full overflow-x-hidden">
      {/* ─── Search Modal ─── */}
      <AdminSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        activeTab={activeTab}
        packages={packages}
        inquiries={inquiries}
        admins={admins}
        onSelectPackage={(pkg) => {
          setEditingPackage(pkg);
        }}
        onSelectInquiry={() => {
          setActiveTab("enquiries");
        }}
        onSelectAdmin={() => {
          setActiveTab("admins");
        }}
      />

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
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const badgeCount =
              item.id === "enquiries" && newInquiriesCount > 0
                ? `${newInquiriesCount}`
                : undefined;

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

                {badgeCount && (
                  <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-white">
                    {badgeCount}
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
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 mb-0.5 rounded-md bg-amber-400/10 text-amber-400 text-[9px] font-bold uppercase tracking-wider border border-amber-400/20">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  {user.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                </span>
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
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800 transition-colors">
          <div className="px-4 sm:px-6 lg:px-10 py-3.5 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                  {activeNavItem?.label}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block truncate">
                  {activeNavItem?.sublabel}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Section-Specific Search Trigger - Only shown on sections where search is applicable */}
              {activeTab !== "overview" && (
                <div className="hidden md:flex items-center relative">
                  <button
                    onClick={() => setIsSearchModalOpen(true)}
                    className="flex items-center justify-between pl-3.5 pr-3 py-2.5 w-64 lg:w-72 rounded-xl border text-sm transition-all bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer shadow-xs hover:border-cyan-400 dark:hover:border-cyan-500"
                    title={`Search in ${activeNavItem?.label}`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <Search className="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-400" />
                      <span className="truncate text-xs">
                        {searchPlaceholderText()}
                      </span>
                    </span>
                    <kbd className="hidden lg:inline-block px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700 border border-slate-300/60 dark:border-slate-600 text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold shrink-0">
                      Ctrl+K
                    </kbd>
                  </button>
                </div>
              )}

              {/* Notifications (Toasts & Bell Dropdown) */}
              <AdminNotifications
                inquiries={inquiries}
                onNavigateToEnquiries={() => setActiveTab("enquiries")}
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 min-w-0 max-w-full overflow-x-hidden">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full max-w-full min-w-0"
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
                className="w-full max-w-full min-w-0"
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
                className="w-full max-w-full min-w-0"
              >
                <AdminEnquiriesPanel
                  inquiries={inquiries}
                  onUpdateStatus={handleUpdateInquiryStatus}
                  onReplyInquiry={handleReplyToInquiry}
                />

              </motion.div>
            )}

            {activeTab === "admins" && isSuperAdmin && (
              <motion.div
                key="admins"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full max-w-full min-w-0"
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
        <footer className="px-6 lg:px-10 py-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <span>Wonderlust Console &copy; {new Date().getFullYear()}</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              Main Site
            </Link>
            <Link
              href="/packages"
              className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              Tour Catalog
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

