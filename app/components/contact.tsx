"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Loader2,
  CheckCircle2,
  Trash2,
  Send,
  PlusCircle,
  Mail,
  Phone,
  User,
  MessageSquare,
  Clock,
  MapPin,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Building,
} from "lucide-react";
import {
  createInquiryAction,
  deleteInquiryAction,
  getInquiriesByIdsAction,
} from "@/lib/actions/inquiries";

interface InquiryRecord {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  destination: string | null;
  reply?: string | null;
  status: string;
  createdAt: string;
}

const COUNTRY_CODES = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+1", country: "US / Canada", flag: "🇺🇸" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+880", country: "Bangladesh", flag: "🇧🇩" },
  { code: "+977", country: "Nepal", flag: "🇳🇵" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
];

const DESTINATIONS = [
  { label: "Kashmir", icon: "🏔️" },
  { label: "Ladakh", icon: "🌌" },
  { label: "Manali", icon: "🌲" },
  { label: "Rishikesh", icon: "🕉️" },
  { label: "Custom Itinerary", icon: "✨" },
];

export default function Contact() {
  const t = useTranslations("Contact");
  const sectionRef = useRef<HTMLDivElement>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCode, setPhoneCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [message, setMessage] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inquiries & Persistence State
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShowingForm, setIsShowingForm] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Close country dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(e.target as Node)
      ) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // GSAP Fade-in
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".contact-fade",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Load stored inquiry IDs from localStorage on mount & sync live status from DB
  useEffect(() => {
    const fetchLatestInquiries = () => {
      try {
        const stored = localStorage.getItem("wonderlust_inquiry_ids");
        if (stored) {
          const ids: string[] = JSON.parse(stored);
          if (Array.isArray(ids) && ids.length > 0) {
            getInquiriesByIdsAction(ids).then((res) => {
              if (res.success && res.inquiries && res.inquiries.length > 0) {
                setInquiries(res.inquiries);
                // Pre-fill latest details
                const latest = res.inquiries[0];
                if (latest) {
                  setFullName(latest.name || "");
                  setEmail(latest.email || "");
                  if (latest.phone) {
                    const parts = latest.phone.split(" ");
                    if (parts.length > 1) {
                      setPhoneCode(parts[0]);
                      setPhoneNumber(parts.slice(1).join(" "));
                    } else {
                      setPhoneNumber(latest.phone);
                    }
                  }
                }
              } else {
                localStorage.removeItem("wonderlust_inquiry_ids");
                setIsShowingForm(true);
              }
            });
            return;
          }
        }
      } catch {
        // Fallback
      }
    };

    fetchLatestInquiries();

    // Check on tab focus and every 6 seconds for live admin replies
    window.addEventListener("focus", fetchLatestInquiries);
    const interval = setInterval(fetchLatestInquiries, 6000);

    return () => {
      window.removeEventListener("focus", fetchLatestInquiries);
      clearInterval(interval);
    };
  }, []);


  // Sync inquiry IDs to localStorage
  const saveInquiryIds = (list: InquiryRecord[]) => {
    try {
      const ids = list.map((i) => i.id);
      localStorage.setItem("wonderlust_inquiry_ids", JSON.stringify(ids));
    } catch {
      // Ignore
    }
  };

  // Client-side strict validation
  const validateForm = (): string | null => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedMessage = message.trim();

    if (!trimmedName || trimmedName.length < 2) {
      return "Please enter your full name.";
    }
    if (/^(.)\1{3,}$/i.test(trimmedName)) {
      return "Please enter a valid, readable full name.";
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,15}$/;
    if (!emailPattern.test(trimmedEmail)) {
      return "Please enter a valid email address (e.g. name@gmail.com).";
    }

    const emailDomain = trimmedEmail.split("@")[1];
    const invalidDomains = ["ads.com", "fake.com", "asdf.com", "test.com", "tempmail.com"];
    if (invalidDomains.includes(emailDomain)) {
      return "Please provide an active email address so our team can reach you.";
    }

    const emailUser = trimmedEmail.split("@")[0];
    if (/^(.)\1{4,}$/i.test(emailUser) || emailUser.length < 2) {
      return "Please enter a valid email address.";
    }

    if (phoneNumber.trim()) {
      const cleanDigits = phoneNumber.replace(/[^0-9]/g, "");
      if (cleanDigits.length < 6 || cleanDigits.length > 15) {
        return "Please enter a valid phone number (6 to 15 digits).";
      }
    }

    if (!trimmedMessage || trimmedMessage.length < 5) {
      return "Please write a short note about your travel plans (minimum 5 characters).";
    }

    return null;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setIsSubmitting(true);

    const fullPhone = phoneNumber.trim() ? `${phoneCode} ${phoneNumber.trim()}` : undefined;

    try {
      const res = await createInquiryAction({
        name: fullName,
        email: email,
        phone: fullPhone,
        message: message,
        destination: selectedDestination || undefined,
      });

      if (res.success && res.inquiry) {
        const updatedList = [res.inquiry, ...inquiries];
        setInquiries(updatedList);
        saveInquiryIds(updatedList);
        setCurrentIndex(0);
        setIsShowingForm(false);

        // Show Toast
        setToastMessage(`Inquiry sent! 🎉 We'll reach out to ${email}`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 7000);

        // Keep name, email, phone pre-filled, only clear message and destination
        setMessage("");
        setSelectedDestination("");
      } else {
        setErrorMsg(res.error || "Failed to send inquiry. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Switch to submit another inquiry (keeping identity details pre-filled)
  const handleOpenFormToSubmitAnother = () => {
    if (inquiries.length > 0) {
      const latest = inquiries[0];
      setFullName(latest.name || "");
      setEmail(latest.email || "");
      if (latest.phone) {
        const parts = latest.phone.split(" ");
        if (parts.length > 1) {
          setPhoneCode(parts[0]);
          setPhoneNumber(parts.slice(1).join(" "));
        } else {
          setPhoneNumber(latest.phone);
        }
      }
    }
    setMessage("");
    setSelectedDestination("");
    setErrorMsg("");
    setIsShowingForm(true);
  };

  // Delete Handler
  const handleDelete = async (inquiryId: string) => {
    setIsDeleting(true);
    try {
      const res = await deleteInquiryAction(inquiryId);
      if (res.success) {
        const updated = inquiries.filter((i) => i.id !== inquiryId);
        setInquiries(updated);
        saveInquiryIds(updated);

        if (updated.length === 0) {
          setIsShowingForm(true);
        } else {
          setCurrentIndex((prev) => Math.min(prev, updated.length - 1));
        }

        setToastMessage("Inquiry was removed.");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
      } else {
        setErrorMsg(res.error || "Could not delete inquiry.");
      }
    } catch {
      setErrorMsg("Failed to delete inquiry.");
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedCountry =
    COUNTRY_CODES.find((c) => c.code === phoneCode) || COUNTRY_CODES[0];

  const currentInquiry = inquiries[currentIndex];

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="py-36 sm:py-40 bg-white text-neutral-900 transition-colors relative"
    >
      <div className="container mx-auto px-8 max-w-6xl">
        {/* Heading & Subtitle */}
        <div className="contact-fade mb-16 max-w-2xl">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-cyan-500">
              {t("heading")}
            </h2>

            {/* Toggle between Active Inquiries and Form */}
            {inquiries.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  isShowingForm
                    ? setIsShowingForm(false)
                    : handleOpenFormToSubmitAnother()
                }
                className="text-xs font-semibold text-neutral-500 hover:text-cyan-600 transition-colors flex items-center gap-1.5 cursor-pointer underline underline-offset-4"
              >
                {isShowingForm ? (
                  <span>View Submitted ({inquiries.length}) &rarr;</span>
                ) : (
                  <span>+ Submit Another</span>
                )}
              </button>
            )}
          </div>

          <p className="text-lg text-neutral-600 leading-relaxed font-normal">
            {t("subtitle")}
          </p>
        </div>

        {/* ────────────────────────────────────────────────────────── */}
        {/* Form OR View Inquiries State */}
        {/* ────────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {isShowingForm ? (
            /* ─── Free, Open, Minimalist Form ─── */
            <motion.form
              key="minimal-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-12"
            >
              {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium flex items-center justify-between">
                  <span>{errorMsg}</span>
                  <button
                    type="button"
                    onClick={() => setErrorMsg("")}
                    className="text-rose-500 hover:text-rose-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Destination Pills */}
              <div className="contact-fade space-y-2">
                <span className="text-xs text-neutral-400 font-medium">
                  Select Destination (Optional)
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {DESTINATIONS.map((dest) => {
                    const isSelected = selectedDestination === dest.label;
                    return (
                      <button
                        key={dest.label}
                        type="button"
                        onClick={() =>
                          setSelectedDestination(
                            isSelected ? "" : dest.label
                          )
                        }
                        className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? "bg-cyan-500 text-white"
                            : "bg-neutral-100 hover:bg-neutral-200 text-neutral-600"
                        }`}
                      >
                        <span className="mr-1">{dest.icon}</span>
                        {dest.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Inputs Grid */}
              <div className="grid md:grid-cols-2 gap-12 sm:gap-16">
                {/* Left Column: Full Name, Email, Phone */}
                <div className="contact-fade space-y-8">
                  <div>
                    <label className="block text-sm mb-2 text-neutral-600 font-medium">
                      {t("fullName")} *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t("fullNamePlaceholder")}
                      className="w-full border-b border-neutral-300 py-3 bg-transparent focus:outline-none focus:border-cyan-500 transition text-neutral-900 placeholder:text-neutral-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-neutral-600 font-medium">
                      {t("email")} *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("emailPlaceholder")}
                      className="w-full border-b border-neutral-300 py-3 bg-transparent focus:outline-none focus:border-cyan-500 transition text-neutral-900 placeholder:text-neutral-400 font-mono text-[13px]"
                    />
                  </div>

                  {/* Phone with Country Code Selector */}
                  <div>
                    <label className="block text-sm mb-2 text-neutral-600 font-medium">
                      Contact Number (Optional)
                    </label>
                    <div className="flex items-center gap-3 border-b border-neutral-300 py-1 focus-within:border-cyan-500 transition">
                      {/* Country Selector */}
                      <div className="relative" ref={countryDropdownRef}>
                        <button
                          type="button"
                          onClick={() =>
                            setIsCountryDropdownOpen(!isCountryDropdownOpen)
                          }
                          className="py-2 px-2 text-xs font-semibold text-neutral-700 hover:text-cyan-600 flex items-center gap-1 cursor-pointer bg-neutral-50 rounded-lg"
                        >
                          <span>{selectedCountry.flag}</span>
                          <span>{selectedCountry.code}</span>
                          <ChevronDown className="w-3 h-3 text-neutral-400" />
                        </button>

                        {/* Searchable / Scrollable Dropdown Menu */}
                        <AnimatePresence>
                          {isCountryDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -5, scale: 0.96 }}
                              animate={{ opacity: 1, y: 4, scale: 1 }}
                              exit={{ opacity: 0, y: -5, scale: 0.96 }}
                              transition={{ duration: 0.15 }}
                              className="absolute left-0 top-full mt-2 w-64 bg-white border border-neutral-200 rounded-2xl shadow-xl p-2 z-50 flex flex-col"
                            >
                              <div className="mb-2 px-1">
                                <input
                                  type="text"
                                  value={countrySearch}
                                  onChange={(e) =>
                                    setCountrySearch(e.target.value)
                                  }
                                  placeholder="Search country..."
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 outline-none focus:border-cyan-500"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>

                              <div
                                data-lenis-prevent="true"
                                onWheel={(e) => e.stopPropagation()}
                                onTouchMove={(e) => e.stopPropagation()}
                                className="max-h-48 overflow-y-auto overscroll-contain space-y-0.5"
                              >
                                {COUNTRY_CODES.filter(
                                  (item) =>
                                    item.country
                                      .toLowerCase()
                                      .includes(
                                        countrySearch.toLowerCase()
                                      ) || item.code.includes(countrySearch)
                                ).map((item) => (
                                  <button
                                    key={item.code + item.country}
                                    type="button"
                                    onClick={() => {
                                      setPhoneCode(item.code);
                                      setIsCountryDropdownOpen(false);
                                      setCountrySearch("");
                                    }}
                                    className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                      phoneCode === item.code
                                        ? "bg-cyan-50 text-cyan-700 font-bold"
                                        : "text-neutral-700 hover:bg-neutral-50"
                                    }`}
                                  >
                                    <span className="flex items-center gap-2">
                                      <span>{item.flag}</span>
                                      <span>{item.country}</span>
                                    </span>
                                    <span className="font-mono text-neutral-400 text-[11px]">
                                      {item.code}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Number Input */}
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="98765 43210"
                        className="w-full py-2 bg-transparent focus:outline-none text-neutral-900 placeholder:text-neutral-400 text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Message */}
                <div className="contact-fade">
                  <label className="block text-sm mb-2 text-neutral-600 font-medium">
                    {t("message")} *
                  </label>
                  <textarea
                    rows={7}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("messagePlaceholder")}
                    className="w-full border-b border-neutral-300 py-3 bg-transparent resize-none focus:outline-none focus:border-cyan-500 transition text-neutral-900 placeholder:text-neutral-400 leading-relaxed"
                  />
                </div>
              </div>

              {/* Minimalist Submit Button */}
              <div className="contact-fade pt-8 flex items-center justify-between">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group inline-flex items-center text-sm font-semibold tracking-wide cursor-pointer disabled:opacity-60 transition-opacity"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2 text-cyan-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending Inquiry...
                    </span>
                  ) : (
                    <>
                      <span className="group-hover:text-cyan-500 transition-colors">
                        {t("submit")}
                      </span>
                      <span className="ml-4 h-0.5 w-8 bg-cyan-500 transition-all duration-500 group-hover:w-16" />
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          ) : (
            /* ─── Free, Open, Minimalist "View Inquiry" View ─── */
            <motion.div
              key="minimal-inquiry-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {currentInquiry && (
                <div className="space-y-10">
                  {/* Top Bar: Title & Slider Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-200">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-neutral-900">
                        {currentInquiry.name}
                      </span>
                      <span className="text-xs text-neutral-400 font-mono">
                        {currentInquiry.email}
                      </span>
                      {currentInquiry.phone && (
                        <span className="text-xs text-neutral-400 font-mono">
                          &bull; {currentInquiry.phone}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Status badge - Consistent Cyan Palette */}
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                        {currentInquiry.status === "NEW"
                          ? "● Received & Under Review"
                          : currentInquiry.status === "IN_PROGRESS"
                          ? "● Specialist Responding"
                          : "● Itinerary Sent"}
                      </span>

                      {/* Pagination arrows if > 1 inquiry */}
                      {inquiries.length > 1 && (
                        <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
                          <button
                            type="button"
                            onClick={() =>
                              setCurrentIndex((prev) =>
                                prev > 0 ? prev - 1 : inquiries.length - 1
                              )
                            }
                            className="p-1 hover:text-cyan-600 transition-colors cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span>
                            {currentIndex + 1} of {inquiries.length}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setCurrentIndex((prev) =>
                                prev < inquiries.length - 1 ? prev + 1 : 0
                              )
                            }
                            className="p-1 hover:text-cyan-600 transition-colors cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2-Column Minimal Details */}
                  <div className="grid md:grid-cols-2 gap-12 sm:gap-16">
                    {/* Left: Destination & Date */}
                    <div className="space-y-6">
                      <div>
                        <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
                          Destination
                        </span>
                        <p className="text-lg font-medium text-neutral-900">
                          {currentInquiry.destination || "Custom Himalayan Journey"}
                        </p>
                      </div>

                      <div>
                        <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
                          Date Submitted
                        </span>
                        <p className="text-sm text-neutral-600 font-mono">
                          {new Date(currentInquiry.createdAt).toLocaleString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Right: Message & Team Response */}
                    <div className="space-y-6">
                      <div>
                        <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
                          Your Request
                        </span>
                        <p className="text-sm text-neutral-700 italic leading-relaxed">
                          &ldquo;{currentInquiry.message}&rdquo;
                        </p>
                      </div>

                      <div className="pt-4 border-t border-neutral-100 space-y-1.5">
                        <span className="text-xs font-semibold text-cyan-600 block">
                          Team Response
                        </span>
                        {currentInquiry.reply ? (
                          <p className="text-sm text-neutral-800 leading-relaxed font-medium">
                            {currentInquiry.reply}
                          </p>
                        ) : (
                          <p className="text-xs text-neutral-500 leading-relaxed">
                            Our team is reviewing your travel dates. We will reach out to{" "}
                            <strong className="text-neutral-800">{currentInquiry.email}</strong>
                            {currentInquiry.phone ? ` or ${currentInquiry.phone}` : ""} shortly. Updates will appear here.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-10 flex flex-wrap items-center justify-between gap-6 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={() => handleDelete(currentInquiry.id)}
                      disabled={isDeleting}
                      className="p-2.5 -ml-2.5 rounded-full hover:bg-cyan-50 text-cyan-600 hover:text-cyan-700 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center group"
                      title="Delete this inquiry"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
                      ) : (
                        <Trash2 className="w-6 h-6 text-cyan-600 group-hover:scale-110 transition-transform" />
                      )}
                    </button>


                    <button
                      type="button"
                      onClick={handleOpenFormToSubmitAnother}
                      className="group inline-flex items-center text-sm font-semibold tracking-wide cursor-pointer"
                    >
                      <span className="group-hover:text-cyan-500 transition-colors">
                        Submit Another Inquiry
                      </span>
                      <span className="ml-4 h-0.5 w-8 bg-cyan-500 transition-all duration-500 group-hover:w-16" />
                    </button>
                  </div>

                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* Floating Bottom Toast Popup */}
      {/* ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-[calc(100%-3rem)] bg-neutral-900 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 pointer-events-auto border border-neutral-700"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xl">🎉</span>
              <p className="text-xs font-bold text-white truncate">
                {toastMessage}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowToast(false)}
              className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
