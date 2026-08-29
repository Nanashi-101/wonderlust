"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { PackageCategory, Difficulty } from "@prisma/client";
import { createPackageAction, updatePackageAction } from "@/lib/actions/packages";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import R2ImageUploader from "./R2ImageUploader";
import CustomSelect, { type SelectOption } from "./CustomSelect";
import {
  Sparkles,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  DollarSign,
  FileText,
  ListChecks,
  Eye,
  CalendarDays,
  MapPin,
  SignalHigh,
  Heart,
  X,
} from "lucide-react";

const PRESET_IMAGES = [
  { name: "Ladakh", path: "/destination/Ladakh.png" },
  { name: "Kashmir", path: "/destination/kashmir.png" },
  { name: "Manali", path: "/destination/manali.png" },
  { name: "Rishikesh", path: "/destination/rishikesh.png" },
  { name: "Puri", path: "/destination/puri.png" },
];

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: "Adventure", label: "Adventure" },
  { value: "Spiritual", label: "Spiritual" },
  { value: "Expedition", label: "Expedition" },
  { value: "Retreat", label: "Retreat" },
  { value: "WomensOnly", label: "Women's Only", badge: "Women-Led" },
];

const DIFFICULTY_OPTIONS: SelectOption[] = [
  { value: "Easy", label: "Easy" },
  { value: "Moderate", label: "Moderate" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

const STEPS = [
  { id: 1, name: "Tour Identity", icon: Compass },
  { id: 2, name: "Pricing & Specs", icon: DollarSign },
  { id: 3, name: "Media & Overview", icon: FileText },
  { id: 4, name: "Highlights & Publish", icon: ListChecks },
];

interface CreatorStudioWizardProps {
  initialData?: any;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function CreatorStudioWizard({
  initialData,
  onCancel,
  onSuccess,
}: CreatorStudioWizardProps) {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);

  // Form Fields (Pre-filled if editing existing package)
  const [title, setTitle] = useState(
    initialData?.title || "Spiti Valley High-Altitude Expedition"
  );
  const [slug, setSlug] = useState(initialData?.slug || "spiti-valley-expedition");
  const [isSlugCustomized, setIsSlugCustomized] = useState(Boolean(initialData));
  const [destination, setDestination] = useState(initialData?.destination || "Spiti");
  const [category, setCategory] = useState<PackageCategory>(
    initialData?.category || PackageCategory.Expedition
  );
  const [difficulty, setDifficulty] = useState<Difficulty>(
    initialData?.difficulty || Difficulty.Advanced
  );
  const [durationDays, setDurationDays] = useState<number>(
    initialData?.durationDays || 7
  );
  const [durationNights, setDurationNights] = useState<number>(
    initialData?.durationNights || 6
  );
  const [priceFrom, setPriceFrom] = useState<number>(
    initialData?.priceFrom || 29999
  );
  const [maxAltitudeFt, setMaxAltitudeFt] = useState<string>(
    initialData?.maxAltitudeFt ? String(initialData.maxAltitudeFt) : "14500"
  );
  const [imagePath, setImagePath] = useState(
    initialData?.imagePath || "/destination/Ladakh.png"
  );
  const [description, setDescription] = useState(
    initialData?.description ||
      "Embark on a high-altitude expedition through remote Himalayan passes, ancient monasteries, and stunning alpine lakes in Spiti Valley."
  );
  const [highlights, setHighlights] = useState<string[]>(
    initialData?.highlights || [
      "Key Monastery Exploration",
      "Chandratal Lake Sunrise",
      "Kunzum Pass Drive (14,931 ft)",
    ]
  );
  const [newHighlight, setNewHighlight] = useState("");
  const [featured, setFeatured] = useState(
    initialData?.featured !== undefined ? initialData.featured : true
  );
  const [active, setActive] = useState(
    initialData?.active !== undefined ? initialData.active : true
  );

  // State & Errors
  const [stepError, setStepError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugCustomized) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      setSlug(generated);
    }
  };

  const addHighlight = () => {
    if (newHighlight.trim()) {
      setHighlights([...highlights, newHighlight.trim()]);
      setNewHighlight("");
      setStepError(null);
    }
  };

  const removeHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  // Validate step before advancing
  const validateAndAdvance = (targetStep: number) => {
    setStepError(null);

    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      return;
    }

    if (currentStep === 1) {
      if (!title.trim() || title.length < 3) {
        setStepError("Package Title must be at least 3 characters.");
        return;
      }
      if (!slug.trim() || slug.length < 3) {
        setStepError("URL Slug must be at least 3 characters.");
        return;
      }
      if (!destination.trim()) {
        setStepError("Please specify a destination region.");
        return;
      }
    }

    if (currentStep === 2) {
      if (!priceFrom || priceFrom <= 0) {
        setStepError("Starting price must be greater than ₹0.");
        return;
      }
      if (!durationDays || durationDays < 1) {
        setStepError("Duration days must be at least 1 day.");
        return;
      }
      if (durationNights < 0) {
        setStepError("Duration nights cannot be negative.");
        return;
      }
    }

    if (currentStep === 3) {
      if (!imagePath.trim()) {
        setStepError("Please specify an Image Path or upload an image.");
        return;
      }
      if (!description.trim() || description.length < 10) {
        setStepError("Description must be at least 10 characters long.");
        return;
      }
    }

    setCurrentStep(targetStep);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (highlights.length === 0) {
      setStepError("Please add at least 1 highlight for this package.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title,
        slug,
        destination,
        category,
        difficulty,
        durationDays: Number(durationDays),
        durationNights: Number(durationNights),
        priceFrom: Number(priceFrom),
        maxAltitudeFt: maxAltitudeFt ? Number(maxAltitudeFt) : null,
        imagePath,
        description,
        highlights,
        featured,
        active,
      };

      const res = initialData?.id
        ? await updatePackageAction(initialData.id, payload)
        : await createPackageAction(payload);

      if (res.success && res.packageSlug) {
        setCreatedSlug(res.packageSlug);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setServerError(res.error || "Failed to save package.");
      }
    } catch (err: any) {
      setServerError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = (currentStep / STEPS.length) * 100;

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 py-6">
      {/* Studio Header Bar with Entrance Animation */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200/80 pb-6"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-semibold uppercase tracking-wider mb-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />{" "}
            {initialData ? "Update Studio" : "Expedition Studio"}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">
            {initialData ? "Edit Tour Expedition" : "Create Tour Expedition"}
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            {initialData
              ? "Update tour specs, images, and pricing with real-time live R2 preview."
              : "Build and publish tour packages with real-time site preview."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <X className="w-4 h-4 text-neutral-500" /> Cancel & Exit
            </button>
          )}
          <span className="text-xs text-neutral-600 font-bold px-3.5 py-2 rounded-xl bg-white border border-neutral-200 shadow-xs">
            Step {currentStep} of {STEPS.length}
          </span>
        </div>
      </motion.div>

      {/* Grid: Equal 50/50 Split Screen (Form 50% | Live Preview 50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left Column: Form & Stepper (50% width) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Stepper Bar with Animated Progress Line */}
          <div className="bg-white/90 backdrop-blur-md border border-neutral-200/90 p-4 rounded-3xl shadow-lg relative overflow-hidden">
            {/* Animated Progress Bar */}
            <div className="w-full bg-neutral-100 h-1.5 rounded-full mb-4 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full shadow-sm"
                initial={{ width: "25%" }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
            </div>

            <div className="grid grid-cols-4 gap-2 relative">
              {STEPS.map((step) => {
                const Icon = step.icon;
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;

                return (
                  <motion.button
                    key={step.id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => validateAndAdvance(step.id)}
                    className={`relative flex flex-col sm:flex-row items-center gap-2.5 p-3 rounded-2xl transition-all cursor-pointer text-center sm:text-left ${
                      isCurrent
                        ? "text-cyan-950 font-bold"
                        : isCompleted
                        ? "text-emerald-700 hover:bg-emerald-50/60"
                        : "text-neutral-400 hover:bg-neutral-50"
                    }`}
                  >
                    {/* Active Background Glow Pill */}
                    {isCurrent && (
                      <motion.div
                        layoutId="active-step-bg"
                        className="absolute inset-0 bg-cyan-50 border border-cyan-200 rounded-2xl shadow-xs -z-0"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}

                    <div
                      className={`relative z-10 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold transition-all shadow-xs ${
                        isCurrent
                          ? "bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-md shadow-cyan-500/30"
                          : isCompleted
                          ? "bg-emerald-600 text-white"
                          : "bg-neutral-100 text-neutral-400"
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>

                    <div className="relative z-10 hidden sm:block">
                      <p className="text-[10px] font-semibold opacity-60 uppercase tracking-wider">
                        Step {step.id}
                      </p>
                      <p className="text-xs font-bold truncate leading-tight">{step.name}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Form Container Glassmorphic Card */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/90 rounded-3xl p-6 sm:p-9 shadow-2xl shadow-cyan-950/5 relative text-neutral-900">
            {/* Feedback Banners */}
            {createdSlug && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 shadow-sm"
              >
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Package Published Successfully!</p>
                  <p className="text-xs text-emerald-600 mt-0.5">Redirecting to tour page...</p>
                </div>
              </motion.div>
            )}

            {serverError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 shadow-sm"
              >
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Submission Error</p>
                  <p className="text-xs text-rose-600 mt-0.5">{serverError}</p>
                </div>
              </motion.div>
            )}

            {stepError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-amber-800 text-xs font-medium shadow-xs"
              >
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                {stepError}
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {/* STEP 1: IDENTITY */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20, scale: 0.99 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.99 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="space-y-5"
                  >
                    <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
                      <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shadow-xs">
                        <Compass className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-neutral-900 leading-tight">
                          Tour Basic Identity
                        </h2>
                        <p className="text-xs text-neutral-500">Name, slug, category, and difficulty</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Title */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                          Package Title *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Spiti Valley High-Altitude Expedition"
                          value={title}
                          onChange={(e) => handleTitleChange(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none text-sm text-neutral-900 placeholder-neutral-400 transition-all shadow-xs"
                        />
                      </div>

                      {/* Slug */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                          URL Slug *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. spiti-valley-expedition"
                          value={slug}
                          onChange={(e) => {
                            setSlug(e.target.value);
                            setIsSlugCustomized(true);
                          }}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none text-sm font-mono text-cyan-700 placeholder-neutral-400 transition-all shadow-xs"
                        />
                      </div>

                      {/* Destination */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                          Destination Region *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Spiti, Ladakh, Kashmir, Manali"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none text-sm text-neutral-900 placeholder-neutral-400 transition-all shadow-xs"
                        />
                      </div>

                      {/* Category */}
                      <CustomSelect
                        label="Category *"
                        value={category}
                        onChange={(val) => setCategory(val as PackageCategory)}
                        options={CATEGORY_OPTIONS}
                      />

                      {/* Difficulty */}
                      <CustomSelect
                        label="Difficulty *"
                        value={difficulty}
                        onChange={(val) => setDifficulty(val as Difficulty)}
                        options={DIFFICULTY_OPTIONS}
                      />
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: PRICING & SPECS */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20, scale: 0.99 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.99 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="space-y-5"
                  >
                    <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
                      <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shadow-xs">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-neutral-900 leading-tight">
                          Pricing & Duration Specs
                        </h2>
                        <p className="text-xs text-neutral-500">Starting price, days, nights, and altitude</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Price */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                          Starting Price (₹ INR) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={priceFrom}
                          onChange={(e) => setPriceFrom(Number(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none text-sm font-bold text-cyan-600 transition-all shadow-xs"
                        />
                      </div>

                      {/* Altitude */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                          Max Altitude (ft) (Optional)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 14500"
                          value={maxAltitudeFt}
                          onChange={(e) => setMaxAltitudeFt(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none text-sm text-neutral-900 placeholder-neutral-400 transition-all shadow-xs"
                        />
                      </div>

                      {/* Duration Days */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                          Duration (Days) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={durationDays}
                          onChange={(e) => setDurationDays(Number(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none text-sm text-neutral-900 transition-all shadow-xs"
                        />
                      </div>

                      {/* Duration Nights */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                          Duration (Nights) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={durationNights}
                          onChange={(e) => setDurationNights(Number(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none text-sm text-neutral-900 transition-all shadow-xs"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: MEDIA & OVERVIEW */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20, scale: 0.99 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.99 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="space-y-5"
                  >
                    <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
                      <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shadow-xs">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-neutral-900 leading-tight">
                          Media & Tour Storytelling
                        </h2>
                        <p className="text-xs text-neutral-500">Cloudflare R2 image cover & description</p>
                      </div>
                    </div>

                    {/* Header Cover Image (Cloudflare R2 Upload or Preset) */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                        Header Cover Image *
                      </label>
                      <R2ImageUploader
                        value={imagePath}
                        onChange={(url) => setImagePath(url)}
                        presets={PRESET_IMAGES}
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                        Detailed Tour Overview *
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Describe the expedition details, scenic mountain passes, unique cultural experiences..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none text-sm leading-relaxed text-neutral-900 placeholder-neutral-400 transition-all shadow-xs"
                      />
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: HIGHLIGHTS & OPTIONS */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20, scale: 0.99 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.99 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
                      <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shadow-xs">
                        <ListChecks className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-neutral-900 leading-tight">
                          Key Highlights & Settings
                        </h2>
                        <p className="text-xs text-neutral-500">Key features and publication toggles</p>
                      </div>
                    </div>

                    {/* Highlights List */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                        Key Tour Highlights *
                      </label>

                      <div className="space-y-2 mb-3">
                        <AnimatePresence>
                          {highlights.map((item, idx) => (
                            <motion.div
                              key={idx}
                              layout
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="flex items-center justify-between gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 shadow-xs"
                            >
                              <span className="text-xs text-neutral-800 font-medium">
                                • {item}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeHighlight(idx)}
                                className="p-1 text-neutral-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add a highlight (e.g. Khardung La Pass visit)"
                          value={newHighlight}
                          onChange={(e) => setNewHighlight(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addHighlight();
                            }
                          }}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-neutral-300 focus:border-cyan-500 outline-none text-xs text-neutral-900 placeholder-neutral-400 transition-all shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={addHighlight}
                          className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs inline-flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      </div>
                    </div>

                    {/* Settings Toggles */}
                    <div className="pt-4 flex flex-wrap gap-6 items-center border-t border-neutral-100">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={featured}
                          onChange={(e) => setFeatured(e.target.checked)}
                          className="w-4 h-4 rounded accent-cyan-600 cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-semibold text-neutral-900 block">
                            Featured Package
                          </span>
                          <span className="text-[11px] text-neutral-500">
                            Showcase on homepage
                          </span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={(e) => setActive(e.target.checked)}
                          className="w-4 h-4 rounded accent-cyan-600 cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-semibold text-neutral-900 block">
                            Active Status
                          </span>
                          <span className="text-[11px] text-neutral-500">
                            Make visible in tour listings
                          </span>
                        </div>
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Controls */}
              <div className="mt-8 pt-5 border-t border-neutral-100 flex items-center justify-between gap-4">
                {currentStep > 1 ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => validateAndAdvance(currentStep - 1)}
                    className="px-5 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Previous Step
                  </motion.button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => validateAndAdvance(currentStep + 1)}
                    className="px-7 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/25 transition-all cursor-pointer"
                  >
                    Next Step <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="px-7 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Publishing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Publish Tour Package
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Real-Time Live Preview Card (50% equal width) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-1 lg:sticky lg:top-24 space-y-4"
        >
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <Eye className="w-4 h-4 text-cyan-600" /> Live Site Preview
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 font-mono font-semibold shadow-xs">
              Live Mockup
            </span>
          </div>

          {/* Floating Live Package Card with Hover Lift Animation */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border border-neutral-200/90 text-neutral-900 transition-shadow hover:shadow-cyan-900/10"
          >
            {/* Cover Image with Crossfade Animation */}
            <div className="relative w-full aspect-4/3 overflow-hidden bg-neutral-900">
              <AnimatePresence mode="wait">
                <motion.div
                  key={imagePath}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={imagePath || "/destination/Ladakh.png"}
                    alt={title || "Package Preview"}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

              {/* Category & Difficulty Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-full bg-cyan-600 text-white text-xs font-semibold shadow-md">
                  {category}
                </span>
                {featured && (
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-semibold shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Featured
                  </span>
                )}
              </div>

              {/* Title Over Image */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-xl font-bold tracking-tight line-clamp-1">
                  {title || "Untitled Package"}
                </h3>
                <p className="text-xs text-white/80 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-400" /> {destination || "Region"}
                </p>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6">
              {/* Specs */}
              <div className="flex justify-between text-xs text-neutral-500 border-b border-neutral-100 pb-3">
                <span className="flex items-center gap-1 font-medium">
                  <CalendarDays className="w-3.5 h-3.5 text-cyan-600" />
                  {durationDays} Days · {durationNights} Nights
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <SignalHigh className="w-3.5 h-3.5 text-cyan-600" />
                  {difficulty}
                </span>
              </div>

              {/* Description */}
              <p className="mt-3 text-xs text-neutral-600 leading-relaxed line-clamp-3">
                {description || "No description provided."}
              </p>

              {/* Highlights */}
              {highlights.length > 0 && (
                <div className="mt-4 pt-3 border-t border-neutral-100 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Highlights
                  </p>
                  {highlights.slice(0, 3).map((hl, i) => (
                    <div key={i} className="text-xs text-neutral-700 flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
                      {hl}
                    </div>
                  ))}
                </div>
              )}

              {/* Price & CTA */}
              <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-neutral-400 font-semibold block">
                    Starting From
                  </span>
                  <span className="text-lg font-extrabold text-cyan-600">
                    ₹{priceFrom ? priceFrom.toLocaleString("en-IN") : "0"}
                  </span>
                </div>

                <div className="px-4 py-2 rounded-full bg-cyan-600 text-white text-xs font-bold shadow-md shadow-cyan-600/20">
                  View Details →
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
