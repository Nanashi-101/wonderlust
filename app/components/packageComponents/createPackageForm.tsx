"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { PackageCategory, Difficulty } from "@prisma/client";
import { createPackageAction } from "@/lib/actions/packages";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import R2ImageUploader from "../admin/R2ImageUploader";
import CustomSelect, { type SelectOption } from "../admin/CustomSelect";

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
  { id: 1, name: "General Details", icon: Compass },
  { id: 2, name: "Pricing & Duration", icon: DollarSign },
  { id: 3, name: "Media & Overview", icon: FileText },
  { id: 4, name: "Highlights & Options", icon: ListChecks },
];

export default function CreatePackageForm() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [destination, setDestination] = useState("");
  const [category, setCategory] = useState<PackageCategory>(
    PackageCategory.Adventure
  );
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Moderate);
  const [durationDays, setDurationDays] = useState<number>(5);
  const [durationNights, setDurationNights] = useState<number>(4);
  const [priceFrom, setPriceFrom] = useState<number>(19999);
  const [maxAltitudeFt, setMaxAltitudeFt] = useState<string>("12000");
  const [imagePath, setImagePath] = useState("/destination/Ladakh.png");
  const [description, setDescription] = useState("");
  const [highlights, setHighlights] = useState<string[]>([
    "Guided mountain trekking",
    "Local cultural sightseeing",
  ]);
  const [newHighlight, setNewHighlight] = useState("");
  const [featured, setFeatured] = useState(false);
  const [active, setActive] = useState(true);

  // State & Validation Error
  const [stepError, setStepError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  // Auto-generate slug from title unless user edited slug manually
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
        setStepError("Please provide a destination region.");
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
        setStepError("Please provide an Image Path or select a preset.");
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
      const res = await createPackageAction({
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
      });

      if (res.success && res.packageSlug) {
        setCreatedSlug(res.packageSlug);
        setTimeout(() => {
          router.push(`/packages/${res.packageSlug}`);
        }, 1500);
      } else {
        setServerError(res.error || "Failed to create package.");
      }
    } catch (err: any) {
      setServerError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/packages"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-cyan-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Packages
        </Link>
        <span className="text-xs font-semibold uppercase tracking-widest text-cyan-600">
          Step {currentStep} of {STEPS.length}
        </span>
      </div>

      {/* Stepper Progress Bar */}
      <div className="mb-10 bg-white p-4 md:p-6 rounded-3xl border border-neutral-200 shadow-md">
        <div className="grid grid-cols-4 gap-2 relative">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => validateAndAdvance(step.id)}
                className={`flex flex-col md:flex-row items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer text-center md:text-left ${
                  isCurrent
                    ? "bg-cyan-50 border border-cyan-300 text-cyan-900"
                    : isCompleted
                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100/60"
                    : "bg-transparent text-neutral-400 hover:bg-neutral-50"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold transition-all ${
                    isCurrent
                      ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-neutral-100 text-neutral-400"
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                </div>
                <div className="hidden md:block">
                  <p className="text-xs font-semibold opacity-60">Step {step.id}</p>
                  <p className="text-xs font-bold leading-tight truncate">{step.name}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-3xl p-8 md:p-12 border border-neutral-200/80 shadow-xl relative overflow-hidden text-neutral-900">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Package Creator
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">
            {STEPS[currentStep - 1].name}
          </h1>
        </div>

        {/* Feedback Banners */}
        {createdSlug && (
          <div className="mb-8 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800">
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Package Published Successfully!</p>
              <p className="text-xs text-emerald-600 mt-0.5">Redirecting to tour page...</p>
            </div>
          </div>
        )}

        {serverError && (
          <div className="mb-8 p-5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800">
            <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Error Creating Package</p>
              <p className="text-xs text-rose-600 mt-0.5">{serverError}</p>
            </div>
          </div>
        )}

        {stepError && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-sm font-medium">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            {stepError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {/* STEP 1: GENERAL DETAILS */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                      Package Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Spiti Valley High-Altitude Trek"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl bg-white border border-neutral-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none text-sm text-neutral-900 placeholder-neutral-400 transition-all"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. spiti-valley-trek"
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value);
                        setIsSlugCustomized(true);
                      }}
                      className="w-full px-4 py-3.5 rounded-xl bg-white border border-neutral-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none text-sm font-mono text-cyan-700 placeholder-neutral-400 transition-all"
                    />
                  </div>

                  {/* Destination */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                      Destination Region *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Spiti, Ladakh, Kashmir, Manali"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl bg-white border border-neutral-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none text-sm text-neutral-900 placeholder-neutral-400 transition-all"
                    />
                  </div>

                  {/* Category */}
                  <CustomSelect
                    label="Category *"
                    value={category}
                    onChange={(val) => setCategory(val as PackageCategory)}
                    options={CATEGORY_OPTIONS}
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 2: PRICING & DURATION */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {/* Price */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                      Starting Price (₹ INR) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={priceFrom}
                      onChange={(e) => setPriceFrom(Number(e.target.value))}
                      className="w-full px-4 py-3.5 rounded-xl bg-white border border-neutral-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none text-sm font-bold text-cyan-600 transition-all"
                    />
                  </div>

                  {/* Difficulty */}
                  <CustomSelect
                    label="Difficulty Level *"
                    value={difficulty}
                    onChange={(val) => setDifficulty(val as Difficulty)}
                    options={DIFFICULTY_OPTIONS}
                  />

                  {/* Duration Days */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                      Duration (Days) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={durationDays}
                      onChange={(e) => setDurationDays(Number(e.target.value))}
                      className="w-full px-4 py-3.5 rounded-xl bg-white border border-neutral-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none text-sm text-neutral-900 transition-all"
                    />
                  </div>

                  {/* Duration Nights */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                      Duration (Nights) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={durationNights}
                      onChange={(e) => setDurationNights(Number(e.target.value))}
                      className="w-full px-4 py-3.5 rounded-xl bg-white border border-neutral-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none text-sm text-neutral-900 transition-all"
                    />
                  </div>
                </div>

                {/* Altitude */}
                <div className="max-w-xs">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                    Max Altitude (ft) (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 14500"
                    value={maxAltitudeFt}
                    onChange={(e) => setMaxAltitudeFt(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-white border border-neutral-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none text-sm text-neutral-900 placeholder-neutral-400 transition-all"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 3: MEDIA & OVERVIEW */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                    Detailed Tour Overview *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Describe the expedition details, scenic mountain passes, unique cultural experiences..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-white border border-neutral-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none text-sm leading-relaxed text-neutral-900 placeholder-neutral-400 transition-all"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 4: HIGHLIGHTS & OPTIONS */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Highlights List */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-3">
                    Key Highlights *
                  </label>

                  <div className="space-y-3 mb-4">
                    {highlights.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80"
                      >
                        <span className="text-sm text-neutral-800 font-medium">
                          • {item}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeHighlight(idx)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
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
                      className="flex-1 px-4 py-3 rounded-xl bg-white border border-neutral-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none text-sm text-neutral-900 placeholder-neutral-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={addHighlight}
                      className="px-5 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>

                {/* Toggles */}
                <div className="pt-4 flex flex-wrap gap-8 items-center border-t border-neutral-100">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="w-5 h-5 rounded accent-cyan-600 cursor-pointer"
                    />
                    <div>
                      <span className="text-sm font-semibold text-neutral-900 block">
                        Featured Package
                      </span>
                      <span className="text-xs text-neutral-500">
                        Showcase on homepage featured section
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="w-5 h-5 rounded accent-cyan-600 cursor-pointer"
                    />
                    <div>
                      <span className="text-sm font-semibold text-neutral-900 block">
                        Active Status
                      </span>
                      <span className="text-xs text-neutral-500">
                        Make visible in package listings
                      </span>
                    </div>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stepper Navigation Buttons */}
          <div className="mt-10 pt-6 border-t border-neutral-100 flex items-center justify-between gap-4">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => validateAndAdvance(currentStep - 1)}
                className="px-6 py-3.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Previous Step
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => validateAndAdvance(currentStep + 1)}
                className="px-8 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-600/25 transition-all cursor-pointer"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/25 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Publishing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Publish Package
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
