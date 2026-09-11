"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Megaphone, X, ChevronLeft, ChevronRight } from "lucide-react";

interface Advertisement {
  id: string;
  imageUrl: string;
}

export default function AdvertisementsGalleryClient({ ads }: { ads: Advertisement[] }) {
  const t = useTranslations("Advertisements");
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [onFooter, setOnFooter] = useState(false);

  const close = useCallback(() => setIsOpen(false), []);
  const prev = useCallback(() => setIndex((i) => (i - 1 + ads.length) % ads.length), [ads.length]);
  const next = useCallback(() => setIndex((i) => (i + 1) % ads.length), [ads.length]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [isOpen, close, prev, next]);

  // Turn white when button overlaps the footer
  useEffect(() => {
    const footer = document.getElementById("site-footer");
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOnFooter(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @keyframes spin-ring {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes bob {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-5px); }
        }
        .ad-btn-ring {
          animation: spin-ring 3s linear infinite;
          background: conic-gradient(
            from 0deg,
            transparent 0%,
            #22d3ee 40%,
            #06b6d4 60%,
            transparent 100%
          );
        }
        .ad-btn-bob {
          animation: bob 3s ease-in-out infinite;
        }
      `}</style>

      {/* Floating bottom-left circular button */}
      <motion.div
        className="fixed bottom-6 left-6 z-[100]"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.6 }}
      >
        <div className="group relative flex items-center">
          {/* Tooltip — slides up from above on hover */}
          <div className="
            absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5
            px-2.5 py-1 rounded-lg
            bg-neutral-900/90 text-white text-xs font-medium whitespace-nowrap
            shadow-lg pointer-events-none
            opacity-0 -translate-y-1
            group-hover:opacity-100 group-hover:translate-y-0
            transition-all duration-200 ease-out
          ">
            {t("heading")}
            <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-neutral-900/90 rotate-45" />
          </div>

          {/* Bob wrapper */}
          <div className="ad-btn-bob">
            {/* Spinning conic ring */}
            <div className="relative w-14 h-14">
              <div className="ad-btn-ring absolute inset-0 rounded-full" />
              {/* Inner fill — white on footer, cyan otherwise */}
              <div
                className={`absolute inset-[3px] rounded-full shadow-lg transition-all duration-500 ${
                  onFooter
                    ? "bg-white shadow-white/40"
                    : "bg-cyan-500 shadow-cyan-500/50"
                }`}
              />

              {/* Actual button */}
              <motion.button
                onClick={() => {
                  setIndex(0);
                  setIsOpen(true);
                }}
                aria-label={t("viewButton")}
                className="absolute inset-[3px] rounded-full flex items-center justify-center text-white cursor-pointer"
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.88 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
              >
                {/* Ripple on tap */}
                <motion.span
                  className="absolute inset-0 rounded-full bg-white"
                  initial={{ opacity: 0, scale: 0 }}
                  whileTap={{ opacity: 0.25, scale: 1.8 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
                <Megaphone
                  className={`w-5 h-5 relative z-10 transition-colors duration-500 ${
                    onFooter ? "text-cyan-500" : "text-white"
                  }`}
                />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Full-screen modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
          >
            {/* Counter */}
            <div className="absolute top-6 left-6 text-white/40 text-sm select-none">
              {index + 1} / {ads.length}
            </div>

            {/* Close */}
            <button
              onClick={close}
              aria-label={t("close")}
              className="absolute top-5 right-5 text-white/50 hover:text-white transition-colors duration-200 p-2 cursor-pointer z-10"
            >
              <X className="w-7 h-7" />
            </button>

            {/* Prev arrow */}
            {ads.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label={t("previous")}
                className="absolute left-4 md:left-8 text-white/50 hover:text-white transition-colors duration-200 p-3 cursor-pointer z-10"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            {/* Next arrow */}
            {ads.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label={t("next")}
                className="absolute right-4 md:right-8 text-white/50 hover:text-white transition-colors duration-200 p-3 cursor-pointer z-10"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}

            {/* Image */}
            <motion.div
              key={ads[index].id}
              className="relative w-full h-full max-w-5xl max-h-[80vh] mx-16 md:mx-24"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={ads[index].imageUrl}
                alt={t("imageAlt")}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
