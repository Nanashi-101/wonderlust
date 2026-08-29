"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Inbox,
  MessageSquare,
  Sparkles,
  CalendarCheck,
  MapPin,
  Clock,
  Mail,
  User,
  ChevronRight,
} from "lucide-react";
import CustomSelect, { type SelectOption } from "./CustomSelect";

interface AdminEnquiriesPanelProps {
  inquiries: any[];
  onUpdateStatus: (id: string, status: any) => Promise<void>;
}

export default function AdminEnquiriesPanel({
  inquiries,
  onUpdateStatus,
}: AdminEnquiriesPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    "TRIP_INQUIRY" | "CUSTOM_ITINERARY" | "RESERVATION"
  >("TRIP_INQUIRY");

  const filteredInquiries = inquiries.filter(
    (inq) => inq.type === activeSubTab
  );

  const STATUS_OPTIONS: SelectOption[] = [
    { value: "NEW", label: "New Lead", badge: "Action Required" },
    { value: "IN_PROGRESS", label: "In Contact", badge: "Pending Reply" },
    { value: "RESOLVED", label: "Resolved", badge: "Closed" },
  ];

  const subTabs = [
    {
      id: "TRIP_INQUIRY" as const,
      label: "Trip Inquiries",
      icon: MessageSquare,
    },
    {
      id: "CUSTOM_ITINERARY" as const,
      label: "AI Itineraries",
      icon: Sparkles,
    },
    {
      id: "RESERVATION" as const,
      label: "Reservations",
      icon: CalendarCheck,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Inbox className="w-5 h-5 text-cyan-600" /> Enquiry Management
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Track customer trip requests, AI custom itineraries, and
              reservations
            </p>
          </div>

          {/* Sub-section Tabs */}
          <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-200 gap-1">
            {subTabs.map((tab) => {
              const Icon = tab.icon;
              const count = inquiries.filter(
                (i) => i.type === tab.id
              ).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeSubTab === tab.id
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span
                    className={`min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full text-[10px] font-bold ${
                      activeSubTab === tab.id
                        ? "bg-cyan-100 text-cyan-700"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Inquiry Cards */}
      <div className="space-y-4">
        {filteredInquiries.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">
              No enquiries in this section
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Customer submissions will appear here automatically.
            </p>
          </div>
        ) : (
          filteredInquiries.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col lg:flex-row lg:items-start justify-between gap-6"
            >
              <div className="space-y-4 flex-1">
                {/* Customer Info */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {item.name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2) || "??"}
                  </div>
                  <div>
                    <span className="font-bold text-base text-slate-900 block">
                      {item.name}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {item.email}
                    </span>
                  </div>
                  {item.destination && (
                    <span className="text-xs font-semibold text-cyan-700 bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-lg flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {item.destination}
                    </span>
                  )}
                </div>

                {/* Message */}
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-5 rounded-xl border border-slate-100">
                  &ldquo;{item.message}&rdquo;
                </p>

                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Received on{" "}
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Status Selector */}
              <div className="w-full lg:w-64 shrink-0 space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Update Lead Status
                </label>
                <CustomSelect
                  value={item.status}
                  onChange={(val) => onUpdateStatus(item.id, val)}
                  options={STATUS_OPTIONS}
                />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
