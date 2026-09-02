"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Inbox,
  MessageSquare,
  Sparkles,
  CalendarCheck,
  MapPin,
  Clock,
  Mail,
  Phone,
  User,
  ChevronRight,
  Send,
  MessageCircle,
  Copy,
  Check,
  X,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Share2,
} from "lucide-react";
import CustomSelect, { type SelectOption } from "./CustomSelect";

interface InquiryRecord {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  destination: string | null;
  reply?: string | null;
  type: string;
  status: "NEW" | "IN_PROGRESS" | "RESOLVED";
  createdAt: Date | string;
}

interface AdminEnquiriesPanelProps {
  inquiries: InquiryRecord[];
  onUpdateStatus: (id: string, status: any) => Promise<void>;
  onReplyInquiry?: (id: string, reply: string, status?: any) => Promise<{ success: boolean; error?: string }>;
}

export default function AdminEnquiriesPanel({
  inquiries,
  onUpdateStatus,
  onReplyInquiry,
}: AdminEnquiriesPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    "TRIP_INQUIRY" | "CUSTOM_ITINERARY" | "RESERVATION"
  >("TRIP_INQUIRY");

  // Selected Inquiry for Detailed View & Reply Modal
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryRecord | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState<"IN_PROGRESS" | "RESOLVED">("RESOLVED");
  const [isSending, setIsSending] = useState(false);
  const [successNotice, setSuccessNotice] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  const handleOpenDetail = (inq: InquiryRecord) => {
    setSelectedInquiry(inq);
    setReplyText(inq.reply || "");
    setReplyStatus(inq.status === "NEW" ? "IN_PROGRESS" : inq.status as any);
    setSuccessNotice("");
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Quick templates
  const applyTemplate = (templateType: "itinerary" | "dates" | "quote") => {
    if (!selectedInquiry) return;
    const name = selectedInquiry.name.split(" ")[0] || selectedInquiry.name;
    const dest = selectedInquiry.destination || "the Himalayas";

    if (templateType === "itinerary") {
      setReplyText(
        `Hi ${name}, thank you for choosing Wonderlust! We have crafted a personalized expedition itinerary for ${dest}. Our senior tour lead will coordinate your dates and arrangements.`
      );
    } else if (templateType === "dates") {
      setReplyText(
        `Hello ${name}, thank you for reaching out regarding ${dest}! Could you please share your preferred travel window and group size so we can customize your quote?`
      );
    } else if (templateType === "quote") {
      setReplyText(
        `Hi ${name}, your customized quote and package itinerary for ${dest} has been finalized. We look forward to hosting you on an unforgettable journey!`
      );
    }
  };

  // Submit reply & save to DB
  const handleSaveReply = async (customStatus?: "IN_PROGRESS" | "RESOLVED") => {
    if (!selectedInquiry || !replyText.trim()) return;
    setIsSending(true);
    setSuccessNotice("");

    const targetStatus = customStatus || replyStatus;

    if (onReplyInquiry) {
      const res = await onReplyInquiry(selectedInquiry.id, replyText.trim(), targetStatus);
      if (res.success) {
        setSelectedInquiry({
          ...selectedInquiry,
          reply: replyText.trim(),
          status: targetStatus,
        });
        setSuccessNotice("Response saved and published to customer inquiry!");
        setTimeout(() => setSuccessNotice(""), 4000);
      }
    }
    setIsSending(false);
  };

  // Send Email (mailto link + auto save reply)
  const handleSendEmail = () => {
    if (!selectedInquiry) return;
    handleSaveReply("IN_PROGRESS");
    const subject = encodeURIComponent(
      `Wonderlust Expeditions - Inquiry Response (${selectedInquiry.destination || "Himalayan Journey"})`
    );
    const body = encodeURIComponent(
      `Dear ${selectedInquiry.name},\n\n${replyText || "Thank you for reaching out to Wonderlust Expeditions."}\n\nWarm regards,\nWonderlust Team`
    );
    window.open(`mailto:${selectedInquiry.email}?subject=${subject}&body=${body}`, "_blank");
  };

  // Send SMS / WhatsApp
  const handleSendSMS = () => {
    if (!selectedInquiry) return;
    handleSaveReply("IN_PROGRESS");

    const cleanPhone = selectedInquiry.phone?.replace(/[^0-9+]/g, "") || "";
    const text = encodeURIComponent(
      `Hello ${selectedInquiry.name}, regarding your Wonderlust inquiry for ${selectedInquiry.destination || "your trip"}: ${replyText}`
    );

    if (cleanPhone) {
      // Open WhatsApp or SMS
      window.open(`https://wa.me/${cleanPhone.replace("+", "")}?text=${text}`, "_blank");
    } else {
      window.open(`sms:?body=${text}`, "_blank");
    }
  };

  // Human-readable status label helper
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "NEW":
        return "New Lead";
      case "IN_PROGRESS":
        return "In Contact";
      case "RESOLVED":
        return "Resolved";
      default:
        return status;
    }
  };

  // Status Badge Class with Preserved Color Distinctions & Modern Aesthetics
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80";
      case "IN_PROGRESS":
        return "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/80";
      case "RESOLVED":
        return "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80";
      default:
        return "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-sm min-w-0 max-w-full">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5 min-w-0">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Inbox className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0" /> Enquiry Management
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track customer trip requests, review full details, and reply directly via Email or SMS/WhatsApp
            </p>
          </div>

          {/* Sub-section Tabs */}
          <div className="flex bg-slate-50 dark:bg-slate-800/80 p-1 sm:p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 gap-1 overflow-x-auto max-w-full min-w-0 scrollbar-none">
            {subTabs.map((tab) => {
              const Icon = tab.icon;
              const count = inquiries.filter(
                (i) => i.type === tab.id
              ).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                    activeSubTab === tab.id
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span>{tab.label}</span>
                  <span
                    className={`min-w-[18px] sm:min-w-[20px] h-4.5 sm:h-5 px-1 sm:px-1.5 flex items-center justify-center rounded-full text-[9px] sm:text-[10px] font-bold ${
                      activeSubTab === tab.id
                        ? "bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300"
                        : "bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-300"
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

      {/* Inquiry Cards List */}
      <div className="space-y-4 w-full max-w-full min-w-0">
        {filteredInquiries.length === 0 ? (
          <div className="py-16 sm:py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm px-4">
            <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-bold text-slate-700 dark:text-slate-300">
              No enquiries in this section
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-1">
              Customer submissions will appear here automatically.
            </p>
          </div>
        ) : (
          filteredInquiries.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all p-4 sm:p-6 flex flex-col lg:flex-row lg:items-start justify-between gap-5 sm:gap-6 group min-w-0 max-w-full"
            >
              {/* Left Content Area (Clickable) */}
              <div
                onClick={() => handleOpenDetail(item)}
                className="space-y-3 sm:space-y-4 flex-1 cursor-pointer min-w-0 max-w-full"
              >
                {/* Customer Info Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                      {item.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2) || "??"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate block group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        {item.name}
                      </span>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-0.5 min-w-0">
                        <span className="flex items-center gap-1 font-mono break-all min-w-0">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" /> <span className="truncate">{item.email}</span>
                        </span>
                        {item.phone && (
                          <span className="flex items-center gap-1 font-mono shrink-0">
                            <span className="hidden sm:inline">&bull;</span>
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" /> {item.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Badges (Destination & Status) */}
                  <div className="flex flex-wrap items-center gap-2 sm:self-start shrink-0">
                    {item.destination && (
                      <span className="text-[11px] sm:text-xs font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" /> {item.destination}
                      </span>
                    )}

                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border ${getStatusBadgeClass(
                        item.status
                      )}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                </div>

                {/* Message Snippet */}
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3.5 sm:p-4 rounded-xl border border-slate-100 dark:border-slate-800 break-all sm:break-words whitespace-pre-wrap overflow-hidden">
                  &ldquo;{item.message}&rdquo;
                </p>

                {/* Reply Indicator if Answered */}
                {item.reply && (
                  <div className="text-xs text-cyan-700 dark:text-cyan-400 font-medium flex items-center gap-1.5 bg-cyan-50/60 dark:bg-cyan-950/40 p-2.5 rounded-lg border border-cyan-100 dark:border-cyan-900/60 min-w-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                    <span className="truncate break-words">Replied: &ldquo;{item.reply}&rdquo;</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 dark:text-slate-500 pt-1">
                  <span className="flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3 shrink-0" /> Received:{" "}
                    {new Date(item.createdAt).toLocaleString("en-IN", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>

                  <span className="text-cyan-600 dark:text-cyan-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Details & Reply &rarr;
                  </span>
                </div>
              </div>

              {/* Status Selector Dropdown & Quick Actions */}
              <div className="w-full lg:w-56 shrink-0 space-y-2 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 lg:pl-6">
                <label className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Quick Status
                </label>
                <CustomSelect
                  value={item.status}
                  onChange={(val) => onUpdateStatus(item.id, val)}
                  options={STATUS_OPTIONS}
                />

                <button
                  type="button"
                  onClick={() => handleOpenDetail(item)}
                  className="w-full py-2.5 px-3 rounded-xl bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/50 dark:hover:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-cyan-200/80 dark:border-cyan-800/60"
                >
                  <Send className="w-3.5 h-3.5" /> Answer Inquiry
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* Elaborate Detail & Answer Modal */}
      {/* ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedInquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 sm:space-y-6 my-auto max-h-[92vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-md shrink-0">
                    {selectedInquiry.name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2) || "??"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                      {selectedInquiry.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 font-mono mt-0.5 truncate">
                      Inquiry ID: #WL-{selectedInquiry.id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Success Alert */}
              {successNotice && (
                <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successNotice}</span>
                </div>
              )}

              {/* Customer Contact Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
                {/* Email with Copy */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between gap-2 min-w-0">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Email Address
                    </span>
                    <a
                      href={`mailto:${selectedInquiry.email}`}
                      className="font-mono text-cyan-700 dark:text-cyan-400 font-semibold truncate block hover:underline break-all"
                    >
                      {selectedInquiry.email}
                    </a>
                  </div>
                  <button
                    onClick={() => handleCopy(selectedInquiry.email, "email")}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer"
                    title="Copy Email"
                  >
                    {copiedField === "email" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Phone with Copy */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between gap-2 min-w-0">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Contact Phone
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold truncate block">
                      {selectedInquiry.phone || "Not provided"}
                    </span>
                  </div>
                  {selectedInquiry.phone && (
                    <button
                      onClick={() => handleCopy(selectedInquiry.phone || "", "phone")}
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer"
                      title="Copy Phone"
                    >
                      {copiedField === "phone" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Destination */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Target Destination
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                    <span className="truncate">{selectedInquiry.destination || "Custom Itinerary"}</span>
                  </span>
                </div>

                {/* Current Status */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between gap-2 min-w-0">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Current Status
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 sm:py-1 rounded-lg border ${getStatusBadgeClass(
                        selectedInquiry.status
                      )}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                      {getStatusLabel(selectedInquiry.status)}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Submitted
                    </span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 font-mono">
                      {new Date(selectedInquiry.createdAt).toLocaleDateString("en-US", {
                        month: "numeric",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Inquiry Message */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Customer Request
                </label>
                <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-xs sm:text-sm text-slate-800 dark:text-slate-200 italic leading-relaxed break-all sm:break-words whitespace-pre-wrap">
                  &ldquo;{selectedInquiry.message}&rdquo;
                </div>
              </div>

              {/* Response Composer Section */}
              <div className="space-y-3 pt-1 sm:pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-cyan-600 shrink-0" /> Answer / Reply to Inquiry
                  </label>
                  <span className="text-[10px] sm:text-[11px] text-slate-400">
                    Saves reply to user&apos;s active inquiry view
                  </span>
                </div>

                {/* Quick Templates */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyTemplate("itinerary")}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    + Itinerary Prepared
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate("dates")}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    + Ask Travel Dates
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate("quote")}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    + Finalized Quote
                  </button>
                </div>

                {/* Textarea */}
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response or itinerary quotation here..."
                  className="w-full p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 resize-none transition-all leading-relaxed"
                />

                {/* Status choice on save */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 pt-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Set status upon reply:</span>
                  <label className="flex items-center gap-2 cursor-pointer font-medium hover:text-slate-900 dark:hover:text-white transition-colors">
                    <input
                      type="radio"
                      name="replyStatus"
                      checked={replyStatus === "IN_PROGRESS"}
                      onChange={() => setReplyStatus("IN_PROGRESS")}
                      className="w-4 h-4 text-cyan-600 focus:ring-cyan-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800"
                    />
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      In Contact
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium hover:text-slate-900 dark:hover:text-white transition-colors">
                    <input
                      type="radio"
                      name="replyStatus"
                      checked={replyStatus === "RESOLVED"}
                      onChange={() => setReplyStatus("RESOLVED")}
                      className="w-4 h-4 text-cyan-600 focus:ring-cyan-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800"
                    />
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      Resolved
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons: Email, SMS, and Save */}
              <div className="pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                  {/* Email Option */}
                  <button
                    type="button"
                    onClick={handleSendEmail}
                    disabled={isSending}
                    className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
                    title="Compose and send via Email client"
                  >
                    <Mail className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                    <span className="truncate">Send via Mail</span>
                  </button>

                  {/* SMS / WhatsApp Option */}
                  <button
                    type="button"
                    onClick={handleSendSMS}
                    disabled={isSending}
                    className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
                    title="Send via SMS or WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">Send via SMS / WhatsApp</span>
                  </button>
                </div>

                {/* Save & Publish Response */}
                <button
                  type="button"
                  onClick={() => handleSaveReply()}
                  disabled={isSending || !replyText.trim()}
                  className="w-full sm:w-auto px-5 sm:px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Save & Publish Reply
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
