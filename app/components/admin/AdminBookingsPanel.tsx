"use client";

import { useState } from "react";
import {
  CalendarCheck,
  Search,
  Users,
  RefreshCw,
  XCircle,
  Loader2,
} from "lucide-react";
import { formatMoney } from "@/lib/payments/money";
import type { Booking, Package, User, BookingStatus, Currency } from "@prisma/client";

type BookingRow = Booking & { package: Package; user: User };

interface AdminBookingsPanelProps {
  bookings: BookingRow[];
  onRefund: (bookingId: string) => Promise<{ success: boolean; error?: string }>;
  onCancel: (bookingId: string) => Promise<{ success: boolean; error?: string }>;
}

const STATUS_STYLE: Record<BookingStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
  AWAITING_PAYMENT: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
  CANCELLED: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  COMPLETED: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30",
  REFUNDED: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
};

const STATUS_OPTIONS: Array<BookingStatus | "ALL"> = [
  "ALL",
  "PENDING",
  "AWAITING_PAYMENT",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
];

export default function AdminBookingsPanel({ bookings, onRefund, onCancel }: AdminBookingsPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "ALL">("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<Record<string, string>>({});

  const filtered = bookings.filter((booking) => {
    const matchesSearch =
      booking.package.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleAction(action: "refund" | "cancel", bookingId: string) {
    setBusyId(bookingId);
    setRowError((prev) => ({ ...prev, [bookingId]: "" }));
    const result = action === "refund" ? await onRefund(bookingId) : await onCancel(bookingId);
    if (!result.success) {
      setRowError((prev) => ({ ...prev, [bookingId]: result.error ?? "Action failed." }));
    }
    setBusyId(null);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /> Bookings
            <span className="text-sm font-normal text-slate-400">({filtered.length})</span>
          </h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search package, email, booking id…"
                className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white w-full sm:w-72"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BookingStatus | "ALL")}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status === "ALL" ? "All statuses" : status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3">Package</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">
                  <Users className="w-3.5 h-3.5 inline mr-1" />
                  Guests
                </th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    {booking.package.title}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {booking.user.email}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{booking.guests}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    {formatMoney(booking.totalPriceMinor, booking.currency as Currency, "en-IN")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLE[booking.status]}`}
                    >
                      {booking.status.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {busyId === booking.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      ) : (
                        <>
                          {booking.status === "CONFIRMED" && (
                            <button
                              onClick={() => handleAction("refund", booking.id)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                              <RefreshCw className="w-3.5 h-3.5" /> Refund
                            </button>
                          )}
                          {["PENDING", "AWAITING_PAYMENT", "CONFIRMED"].includes(booking.status) && (
                            <button
                              onClick={() => handleAction("cancel", booking.id)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Cancel
                            </button>
                          )}
                        </>
                      )}
                    </div>
                    {rowError[booking.id] && (
                      <p className="text-xs text-red-600 mt-1 text-right">{rowError[booking.id]}</p>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No bookings match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
