"use client";

import { useState, useRef } from "react";
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
  FileText,
  Eye,
  Edit3,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Minus,
  RefreshCw,
  ShieldCheck,
  AtSign,
  Tag,
  ChevronDown,
  ChevronUp,
  Sliders,
  Sparkle,
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
  const [emailSubject, setEmailSubject] = useState("");
  const [replyStatus, setReplyStatus] = useState<"IN_PROGRESS" | "RESOLVED">("RESOLVED");
  const [isSending, setIsSending] = useState(false);
  const [successNotice, setSuccessNotice] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Modal Studio Sub-tab: "email" | "whatsapp" | "details"
  const [modalTab, setModalTab] = useState<"email" | "whatsapp" | "details">("email");
  // Email mode: "compose" | "preview"
  const [composerView, setComposerView] = useState<"compose" | "preview">("compose");
  const [showOriginalMessage, setShowOriginalMessage] = useState(true);
  const [sendViaResend, setSendViaResend] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    const dest = inq.destination || "Expedition";
    setEmailSubject(`Wonderlust Expeditions: Regarding your inquiry for ${dest}`);
    setReplyStatus(inq.status === "NEW" ? "IN_PROGRESS" : inq.status as any);
    setSuccessNotice("");
    setModalTab("email");
    setComposerView("compose");
    setShowOriginalMessage(true);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Quick insertion tool for text area formatting
  const insertText = (before: string, after: string = "") => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = replyText.substring(start, end);
    const replacement = `${before}${selected || "text"}${after}`;
    const newText = replyText.substring(0, start) + replacement + replyText.substring(end);
    setReplyText(newText);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + (selected.length || 4));
    }, 50);
  };

  // Quick dynamic tag insertion
  const insertTag = (tag: string) => {
    if (!selectedInquiry) return;
    let val = "";
    if (tag === "name") val = selectedInquiry.name.split(" ")[0] || selectedInquiry.name;
    if (tag === "destination") val = selectedInquiry.destination || "the Himalayas";
    if (tag === "id") val = `#WL-${selectedInquiry.id.slice(-6).toUpperCase()}`;
    if (tag === "date") val = new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
    
    insertText(val, "");
  };

  // Quick rich templates
  const applyTemplate = (templateType: "itinerary" | "dates" | "quote" | "friendly") => {
    if (!selectedInquiry) return;
    const name = selectedInquiry.name.split(" ")[0] || selectedInquiry.name;
    const dest = selectedInquiry.destination || "the Himalayas";

    if (templateType === "itinerary") {
      setEmailSubject(`Wonderlust Expeditions: Tailored Itinerary Draft for ${dest}`);
      setReplyText(
        `Dear ${name},\n\nThank you for choosing Wonderlust Expeditions! We have crafted an exclusive, customized itinerary tailored for your upcoming journey to ${dest}.\n\nKey Expedition Highlights:\n• Private high-altitude logistical support and acclimatization schedule\n• Handcrafted boutique stays and mountain retreats\n• Dedicated senior expedition guide and 24/7 concierge\n\nOur expedition coordinator would love to review these arrangements with you at your convenience.\n\nWarm regards,\nThe Wonderlust Expedition Team`
      );
    } else if (templateType === "dates") {
      setEmailSubject(`Wonderlust Expeditions: Preferred Dates for ${dest}`);
      setReplyText(
        `Hello ${name},\n\nThank you for reaching out regarding your travel plans for ${dest}!\n\nTo help our planning team design the most optimal itinerary and accurate pricing package, could you please let us know:\n1. Your estimated travel dates or season window\n2. Number of adult and child travelers in your party\n3. Any special preferences (luxury camping, trekking difficulty, culinary needs)\n\nWe look forward to curating an extraordinary experience for you.\n\nBest regards,\nWonderlust Team`
      );
    } else if (templateType === "quote") {
      setEmailSubject(`Wonderlust Expeditions: Finalized Package Quotation - ${dest}`);
      setReplyText(
        `Dear ${name},\n\nWe are delighted to share the finalized quotation and comprehensive expedition package details for ${dest}.\n\nPackage Inclusions:\n• All ground transportation, scenic transfers, and domestic permits\n• Premium accommodation and curated daily culinary experiences\n• Complete gear support, safety protocols, and certified lead naturalists\n\nPlease let us know if you have any questions or wish to secure your booking dates.\n\nWarmest regards,\nWonderlust Travel Studio`
      );
    } else if (templateType === "friendly") {
      setEmailSubject(`Wonderlust Expeditions: Hello from our Expedition Team`);
      setReplyText(
        `Hi ${name},\n\nThank you for reaching out to Wonderlust regarding your inquiry for ${dest}.\n\nWe have received your request and our lead travel specialist is currently preparing the details for you. In the meantime, feel free to reply directly to this email or reach us on WhatsApp if you have any urgent requests.\n\nWarm regards,\nWonderlust Expeditions`
      );
    }
  };

  // Submit reply & save to DB (Resend trigger ready)
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
        setSuccessNotice(
          sendViaResend
            ? "Reply published & email queued for delivery via Resend!"
            : "Inquiry response saved successfully!"
        );
        setTimeout(() => setSuccessNotice(""), 4500);
      }
    }
    setIsSending(false);
  };

  // Send Email via native client (fallback)
  const handleSendEmailNative = () => {
    if (!selectedInquiry) return;
    handleSaveReply("IN_PROGRESS");
    const subject = encodeURIComponent(emailSubject || `Wonderlust Expeditions - Inquiry Response (${selectedInquiry.destination || "Trip"})`);
    const body = encodeURIComponent(replyText);
    window.open(`mailto:${selectedInquiry.email}?subject=${subject}&body=${body}`, "_blank");
  };

  // Send SMS / WhatsApp
  const handleSendSMS = () => {
    if (!selectedInquiry) return;
    handleSaveReply("IN_PROGRESS");

    const cleanPhone = selectedInquiry.phone?.replace(/[^0-9+]/g, "") || "";
    const text = encodeURIComponent(
      `Hello ${selectedInquiry.name}, regarding your Wonderlust inquiry for ${selectedInquiry.destination || "your trip"}:\n\n${replyText}`
    );

    if (cleanPhone) {
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
              Track customer trip requests, compose rich email replies via Resend, and manage dispatch history
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
                    Compose Reply & Studio &rarr;
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
                  <Send className="w-3.5 h-3.5" /> Open Email Studio
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* Advanced Resend-Ready Inquiry & Email Response Studio Modal */}
      {/* ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedInquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 my-auto max-h-[94vh] flex flex-col overflow-hidden"
            >
              {/* Modal Top Header Bar */}
              <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-md shrink-0">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                        Reply to {selectedInquiry.name}
                      </h3>
                      <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        #WL-{selectedInquiry.id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {selectedInquiry.email} &bull; {selectedInquiry.destination || "Custom Itinerary"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Status indicator badge */}
                  <span
                    className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border ${getStatusBadgeClass(
                      selectedInquiry.status
                    )}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                    {getStatusLabel(selectedInquiry.status)}
                  </span>

                  <button
                    onClick={() => setSelectedInquiry(null)}
                    className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Navigation Mode Tabs */}
              <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none shrink-0">
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shrink-0">
                  <button
                    onClick={() => setModalTab("email")}
                    className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      modalTab === "email"
                        ? "bg-white dark:bg-slate-700 text-cyan-700 dark:text-cyan-300 shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Studio</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 font-extrabold uppercase tracking-wider">
                      Resend
                    </span>
                  </button>

                  <button
                    onClick={() => setModalTab("whatsapp")}
                    className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      modalTab === "whatsapp"
                        ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>SMS / WhatsApp</span>
                  </button>

                  <button
                    onClick={() => setModalTab("details")}
                    className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      modalTab === "details"
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Inquiry Dossier</span>
                  </button>
                </div>

                {/* View Switcher (Only visible in Email tab) */}
                {modalTab === "email" && (
                  <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs shrink-0">
                    <button
                      type="button"
                      onClick={() => setComposerView("compose")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        composerView === "compose"
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      <Edit3 className="w-3 h-3" /> Compose
                    </button>
                    <button
                      type="button"
                      onClick={() => setComposerView("preview")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        composerView === "preview"
                          ? "bg-cyan-600 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      <Eye className="w-3 h-3" /> Email Preview
                    </button>
                  </div>
                )}
              </div>

              {/* Success Notification Alert */}
              {successNotice && (
                <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successNotice}</span>
                </div>
              )}

              {/* Scrollable Main Content Area */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
                {/* ──────────────────────────────────────────────────────── */}
                {/* TAB 1: EMAIL STUDIO (RESEND PLATFORM) */}
                {/* ──────────────────────────────────────────────────────── */}
                {modalTab === "email" && (
                  <div className="space-y-4">
                    {/* Collapsible Customer Request Reference Banner */}
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setShowOriginalMessage(!showOriginalMessage)}
                        className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-cyan-600" />
                          <span>Original Customer Request</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({new Date(selectedInquiry.createdAt).toLocaleDateString()})
                          </span>
                        </span>
                        {showOriginalMessage ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </button>

                      {showOriginalMessage && (
                        <div className="px-3.5 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed break-words bg-white/50 dark:bg-slate-900/40">
                          &ldquo;{selectedInquiry.message}&rdquo;
                        </div>
                      )}
                    </div>

                    {/* Email Headers: To, From, Subject */}
                    <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2.5 text-xs">
                      {/* From & To Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 w-12 shrink-0">
                            From:
                          </span>
                          <span className="font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 truncate block flex-1">
                            Wonderlust Expeditions &lt;support@wonderlust.travel&gt;
                          </span>
                        </div>

                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 w-12 shrink-0">
                            To:
                          </span>
                          <div className="flex items-center justify-between font-mono text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-200 dark:border-cyan-800 truncate flex-1">
                            <span className="truncate">{selectedInquiry.name} &lt;{selectedInquiry.email}&gt;</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(selectedInquiry.email, "email_to")}
                              className="ml-1 text-cyan-600 hover:text-cyan-800 dark:hover:text-cyan-200 shrink-0 cursor-pointer"
                              title="Copy email"
                            >
                              {copiedField === "email_to" ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Subject Line Input */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 w-12 shrink-0">
                          Subject:
                        </span>
                        <input
                          type="text"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          placeholder="Email subject line..."
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all"
                        />
                      </div>
                    </div>

                    {/* COMPOSER VIEW vs PREVIEW VIEW */}
                    {composerView === "compose" ? (
                      <div className="space-y-2.5">
                        {/* Quick Template Presets */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-cyan-600" /> Professional Email Templates
                            </span>
                            <span className="text-[10px] text-slate-400">Click to apply instantly</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              onClick={() => applyTemplate("itinerary")}
                              className="px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/60 dark:hover:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 text-[11px] font-semibold transition-colors cursor-pointer border border-cyan-200/80 dark:border-cyan-800"
                            >
                              + Itinerary Proposal
                            </button>
                            <button
                              type="button"
                              onClick={() => applyTemplate("dates")}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[11px] font-semibold transition-colors cursor-pointer border border-blue-200/80 dark:border-blue-800"
                            >
                              + Dates & Party Size Request
                            </button>
                            <button
                              type="button"
                              onClick={() => applyTemplate("quote")}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold transition-colors cursor-pointer border border-emerald-200/80 dark:border-emerald-800"
                            >
                              + Finalized Package Quote
                            </button>
                            <button
                              type="button"
                              onClick={() => applyTemplate("friendly")}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                            >
                              + General Follow-up
                            </button>
                          </div>
                        </div>

                        {/* Formatting Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 p-1.5 bg-slate-50 dark:bg-slate-800/80 rounded-t-xl border border-b-0 border-slate-200 dark:border-slate-700 text-xs">
                          {/* Rich formatting tokens */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => insertText("**", "**")}
                              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                              title="Bold"
                            >
                              <Bold className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => insertText("*", "*")}
                              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                              title="Italic"
                            >
                              <Italic className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />
                            <button
                              type="button"
                              onClick={() => insertText("\n• ", "")}
                              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                              title="Bullet List"
                            >
                              <List className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => insertText("\n1. ", "")}
                              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                              title="Numbered List"
                            >
                              <ListOrdered className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => insertText("\n> ", "")}
                              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                              title="Quote Block"
                            >
                              <Quote className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Variable Chips */}
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400 font-semibold hidden md:inline">
                              Tags:
                            </span>
                            <button
                              type="button"
                              onClick={() => insertTag("name")}
                              className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] font-mono text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 cursor-pointer"
                              title="Insert Customer Name"
                            >
                              +Name
                            </button>
                            <button
                              type="button"
                              onClick={() => insertTag("destination")}
                              className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] font-mono text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 cursor-pointer"
                              title="Insert Destination"
                            >
                              +Destination
                            </button>
                            <button
                              type="button"
                              onClick={() => insertTag("id")}
                              className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] font-mono text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 cursor-pointer"
                              title="Insert Inquiry ID"
                            >
                              +InquiryID
                            </button>
                          </div>
                        </div>

                        {/* Textarea */}
                        <textarea
                          ref={textareaRef}
                          rows={8}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write your email response here, or click one of the professional templates above to begin..."
                          className="w-full p-4 rounded-b-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none text-xs sm:text-sm font-sans text-slate-900 dark:text-white placeholder:text-slate-400 resize-none transition-all leading-relaxed"
                        />
                      </div>
                    ) : (
                      /* EMAIL PREVIEW MODE (HOW RESEND DELIVERS TO CUSTOMER) */
                      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-6 shadow-inner space-y-6">
                        {/* Branded Email Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                              W
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                                Wonderlust Expeditions
                              </h4>
                              <p className="text-[10px] text-slate-400">Curated Himalayan Journeys</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            Inquiry Ref #WL-{selectedInquiry.id.slice(-6).toUpperCase()}
                          </span>
                        </div>

                        {/* Subject Preview */}
                        <div className="text-sm font-bold text-slate-900 dark:text-white border-l-2 border-cyan-500 pl-3">
                          {emailSubject || "Inquiry Response from Wonderlust"}
                        </div>

                        {/* Body Preview */}
                        <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans space-y-2">
                          {replyText ? (
                            replyText
                          ) : (
                            <span className="text-slate-400 italic">
                              (No message content written yet. Switch back to Compose to write your email response.)
                            </span>
                          )}
                        </div>

                        {/* Branded Email Footer */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 space-y-1">
                          <p className="font-semibold text-slate-600 dark:text-slate-300">
                            Wonderlust Travel & Expedition Studio
                          </p>
                          <p>Trek • Tour • Explore &bull; support@wonderlust.travel &bull; +91 98765 43210</p>
                          <p className="text-[10px] text-slate-400">
                            This is an automated dispatch from Wonderlust Admin Console via Resend.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Dispatch Options & Status Assignment */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                      {/* Resend Option Checkbox */}
                      <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800 dark:text-slate-200">
                        <input
                          type="checkbox"
                          checked={sendViaResend}
                          onChange={(e) => setSendViaResend(e.target.checked)}
                          className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
                        />
                        <span className="flex items-center gap-1.5">
                          <Send className="w-3.5 h-3.5 text-cyan-600" />
                          Send transactional email to customer via Resend
                        </span>
                      </label>

                      {/* Status on save */}
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-500">Update Status:</span>
                        <label className="flex items-center gap-1.5 cursor-pointer font-medium hover:text-cyan-600 transition-colors">
                          <input
                            type="radio"
                            name="modalReplyStatus"
                            checked={replyStatus === "IN_PROGRESS"}
                            onChange={() => setReplyStatus("IN_PROGRESS")}
                            className="w-3.5 h-3.5 text-cyan-600 focus:ring-cyan-500"
                          />
                          <span className="inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            In Contact
                          </span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer font-medium hover:text-emerald-600 transition-colors">
                          <input
                            type="radio"
                            name="modalReplyStatus"
                            checked={replyStatus === "RESOLVED"}
                            onChange={() => setReplyStatus("RESOLVED")}
                            className="w-3.5 h-3.5 text-cyan-600 focus:ring-cyan-500"
                          />
                          <span className="inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Resolved
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* ──────────────────────────────────────────────────────── */}
                {/* TAB 2: SMS / WHATSAPP DISPATCH */}
                {/* ──────────────────────────────────────────────────────── */}
                {modalTab === "whatsapp" && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
                      <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-sm">Direct WhatsApp & SMS Integration</h4>
                        <p className="mt-0.5 text-emerald-800/90 dark:text-emerald-300">
                          Launch WhatsApp Web or mobile client with your personalized reply text pre-filled for{" "}
                          <span className="font-bold">{selectedInquiry.phone || "the customer"}</span>.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                        WhatsApp Message Body
                      </label>
                      <textarea
                        rows={6}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type WhatsApp message..."
                        className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 resize-none transition-all leading-relaxed"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                      <span className="text-slate-500">
                        Phone: <strong className="text-slate-800 dark:text-slate-200">{selectedInquiry.phone || "None provided"}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={handleSendSMS}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Launch WhatsApp / SMS
                      </button>
                    </div>
                  </div>
                )}

                {/* ──────────────────────────────────────────────────────── */}
                {/* TAB 3: COMPLETE INQUIRY DOSSIER */}
                {/* ──────────────────────────────────────────────────────── */}
                {modalTab === "details" && (
                  <div className="space-y-4 text-xs">
                    {/* Customer Info Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            Email Address
                          </span>
                          <span className="font-mono font-semibold text-cyan-700 dark:text-cyan-300 truncate block">
                            {selectedInquiry.email}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopy(selectedInquiry.email, "dossier_email")}
                          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 shrink-0 cursor-pointer"
                        >
                          {copiedField === "dossier_email" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            Contact Phone
                          </span>
                          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 truncate block">
                            {selectedInquiry.phone || "Not provided"}
                          </span>
                        </div>
                        {selectedInquiry.phone && (
                          <button
                            onClick={() => handleCopy(selectedInquiry.phone || "", "dossier_phone")}
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 shrink-0 cursor-pointer"
                          >
                            {copiedField === "dossier_phone" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                          Destination Category
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                          {selectedInquiry.destination || "Custom Itinerary"}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            Inquiry Status
                          </span>
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border ${getStatusBadgeClass(selectedInquiry.status)}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                            {getStatusLabel(selectedInquiry.status)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            Received
                          </span>
                          <span className="font-mono text-slate-600 dark:text-slate-300">
                            {new Date(selectedInquiry.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Message Box */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                        Customer Inquiry Message
                      </label>
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-sm text-slate-800 dark:text-slate-200 italic leading-relaxed break-words">
                        &ldquo;{selectedInquiry.message}&rdquo;
                      </div>
                    </div>

                    {/* Previous Reply History if exists */}
                    {selectedInquiry.reply && (
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Published Reply On Record
                        </label>
                        <div className="p-4 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed break-words whitespace-pre-wrap font-mono">
                          {selectedInquiry.reply}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Persistent Action Footer */}
              <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleSendEmailNative}
                    disabled={isSending}
                    className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
                    title="Open in default Email app"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">Native Mailto</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendSMS}
                    disabled={isSending}
                    className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
                    title="Send via WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="truncate">WhatsApp</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedInquiry(null)}
                    className="px-4 py-2.5 rounded-xl hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveReply()}
                    disabled={isSending || !replyText.trim()}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Dispatching...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Save & Send via Resend</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
