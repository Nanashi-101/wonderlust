"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Crown,
  User,
  X,
  Loader2,
  Mail,
  Calendar,
} from "lucide-react";
import CustomSelect, { type SelectOption } from "./CustomSelect";

interface AdminUsersPanelProps {
  admins: any[];
  onGrantAdmin: (email: string, role: any, name?: string) => Promise<void>;
  onRemoveAdmin: (id: string) => Promise<void>;
}

export default function AdminUsersPanel({
  admins,
  onGrantAdmin,
  onRemoveAdmin,
}: AdminUsersPanelProps) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"ADMIN" | "SUPER_ADMIN">("ADMIN");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ROLE_OPTIONS: SelectOption[] = [
    { value: "ADMIN", label: "Standard Admin", badge: "Package Editor" },
    { value: "SUPER_ADMIN", label: "Super Admin", badge: "Full Access" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    try {
      await onGrantAdmin(email, role, name);
      setEmail("");
      setName("");
      setIsInviteModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /> Admin Team &
            Access Control
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Grant or revoke admin access roles —{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {admins.length} admins
            </span>
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsInviteModalOpen(true)}
          className="py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" /> Grant Admin Access
        </motion.button>
      </div>

      {/* Admin Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {admins.map((admin, i) => (
          <motion.div
            key={admin.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 flex items-center justify-between gap-5"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-base shadow-sm ${
                  admin.role === "SUPER_ADMIN"
                    ? "bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-950 dark:to-amber-900 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                    : "bg-gradient-to-br from-cyan-100 to-cyan-50 dark:from-cyan-950 dark:to-cyan-900 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800"
                }`}
              >
                {admin.role === "SUPER_ADMIN" ? (
                  <Crown className="w-7 h-7" />
                ) : (
                  <User className="w-7 h-7" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2.5 mb-0.5">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {admin.name || admin.email.split("@")[0]}
                  </h3>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      admin.role === "SUPER_ADMIN"
                        ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                        : "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800"
                    }`}
                  >
                    {admin.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {admin.email}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Granted by{" "}
                  {admin.grantedBy || "Console Root"}
                </p>
              </div>
            </div>

            {admin.role !== "SUPER_ADMIN" && (
              <button
                onClick={() => onRemoveAdmin(admin.id)}
                className="p-3 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/70 text-red-500 hover:text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 cursor-pointer transition-colors shrink-0"
                title="Revoke Admin Access"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        ))}
      </div>


      {admins.length === 0 && (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No admins yet</h3>
          <p className="text-sm text-slate-400 mt-1">
            Grant admin access to get started
          </p>
        </div>
      )}

      {/* Grant Admin Modal */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-cyan-600" /> Grant Admin
                  Access
                </h3>
                <button
                  onClick={() => setIsInviteModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none text-sm text-slate-700 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@wonderlust.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none text-sm text-slate-700 transition-all font-mono"
                  />
                </div>

                <CustomSelect
                  label="Role Permission *"
                  value={role}
                  onChange={(val) => setRole(val as any)}
                  options={ROLE_OPTIONS}
                />

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-sm font-bold shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />{" "}
                        Granting...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" /> Save Admin Role
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
