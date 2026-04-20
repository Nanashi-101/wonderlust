"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import GalleryNavbar from "./GalleryNavbar";
import Footer from "../../components/footer";
import BrowseAllPageBtn from "../../components/browseAllPageBtn";
import PackagesCTA from "../../components/packageComponents/packageCTA";

/* ─── Types ─────────────────────────────────────────── */
type Destination = "All" | "Kashmir" | "Manali" | "Rishikesh" | "Ladakh";

interface GalleryPhoto {
  id: number;
  destination: Exclude<Destination, "All">;
  caption: string;
  location: string;
  src: string;
  tag: string;
  width: number;
  height: number;
}

/* ─── Data ───────────────────────────────────────────── */
const photos: GalleryPhoto[] = [
  {
    id: 1,
    destination: "Kashmir",
    caption: "Dal Lake at Golden Hour",
    location: "Srinagar, Kashmir",
    src: "/gallery/kashmir_dal_lake.png",
    tag: "Lake",
    width: 1280,
    height: 720,
  },
  {
    id: 2,
    destination: "Kashmir",
    caption: "Gulmarg in Winter",
    location: "Gulmarg, Kashmir",
    src: "/gallery/kashmir_gulmarg.png",
    tag: "Snow",
    width: 1280,
    height: 960,
  },
  {
    id: 3,
    destination: "Kashmir",
    caption: "Pahalgam Valley",
    location: "Pahalgam, Kashmir",
    src: "/gallery/kashmir_pahalgam.png",
    tag: "Valley",
    width: 1280,
    height: 720,
  },
  {
    id: 4,
    destination: "Ladakh",
    caption: "Pangong Tso Lake",
    location: "Ladakh",
    src: "/gallery/ladakh_pangong.png",
    tag: "Lake",
    width: 1280,
    height: 720,
  },
  {
    id: 5,
    destination: "Ladakh",
    caption: "Khardung La Pass",
    location: "Ladakh",
    src: "/gallery/ladakh_khardung.png",
    tag: "Mountain",
    width: 1280,
    height: 960,
  },
  {
    id: 6,
    destination: "Ladakh",
    caption: "Thiksey Monastery",
    location: "Leh, Ladakh",
    src: "/gallery/ladakh_thiksey.png",
    tag: "Culture",
    width: 1280,
    height: 960,
  },
  {
    id: 7,
    destination: "Manali",
    caption: "Himalayan Valley",
    location: "Manali, Himachal Pradesh",
    src: "/destination/manali.png",
    tag: "Valley",
    width: 1280,
    height: 720,
  },
  {
    id: 8,
    destination: "Manali",
    caption: "Mountain Panorama",
    location: "Manali, Himachal Pradesh",
    src: "/destination/manali.jpg",
    tag: "Mountain",
    width: 1280,
    height: 853,
  },
  {
    id: 9,
    destination: "Rishikesh",
    caption: "Sacred Ganges River",
    location: "Rishikesh, Uttarakhand",
    src: "/destination/rishikesh.png",
    tag: "River",
    width: 1280,
    height: 720,
  },
  {
    id: 10,
    destination: "Rishikesh",
    caption: "Adventure at the Banks",
    location: "Rishikesh, Uttarakhand",
    src: "/destination/rishikesh.jpg",
    tag: "Adventure",
    width: 1280,
    height: 853,
  },
];

const tabs: Destination[] = ["All", "Kashmir", "Manali", "Rishikesh", "Ladakh"];

/* ─── Page ───────────────────────────────────────────── */
export default function GalleryPage() {
  const t = useTranslations('Gallery');
  const [activeTab, setActiveTab] = useState<Destination>("All");
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  const filtered =
    activeTab === "All"
      ? photos
      : photos.filter((p) => p.destination === activeTab);

  const openLightbox = (photo: GalleryPhoto) => {
    const index = filtered.indexOf(photo);
    setLightboxIndex(index);
    setLightboxPhoto(photo);
  };

  const closeLightbox = useCallback(() => setLightboxPhoto(null), []);

  const prevPhoto = useCallback(() => {
    const next = (lightboxIndex - 1 + filtered.length) % filtered.length;
    setLightboxIndex(next);
    setLightboxPhoto(filtered[next]);
  }, [lightboxIndex, filtered]);

  const nextPhoto = useCallback(() => {
    const next = (lightboxIndex + 1) % filtered.length;
    setLightboxIndex(next);
    setLightboxPhoto(filtered[next]);
  }, [lightboxIndex, filtered]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!lightboxPhoto) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "ArrowRight") nextPhoto();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxPhoto, closeLightbox, prevPhoto, nextPhoto]);

  return (
    <div className="min-h-screen bg-white">
      <GalleryNavbar />

      {/* ── Hero ── */}
      <section className="relative pt-44 pb-20 overflow-hidden">
        {/* radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(6,182,212,0.08)_0%,_transparent_65%)]" />

        <div className="container mx-auto px-8 text-center relative z-10">
          <motion.p
            className="text-cyan-400 text-xs tracking-[0.35em] uppercase mb-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {t('visualStories')}
          </motion.p>

          <motion.h1
            className="text-6xl md:text-8xl font-semibold tracking-tight text-neutral-900 leading-none"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {t('titlePrefix')}{" "}
            <span className="text-cyan-500">{t('titleHighlight')}</span>
          </motion.h1>

          <motion.p
            className="mt-8 text-base text-neutral-500 max-w-lg mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
          >
            {t('description')}
          </motion.p>

          {/* decorative line */}
          <motion.div
            className="mx-auto mt-10 w-12 h-px bg-cyan-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          />
        </div>
      </section>

      {/* ── Filter Tabs ── */}
      <div className="container mx-auto px-8 mb-14">
        <motion.div
          className="flex gap-3 flex-wrap justify-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              id={`gallery-tab-${tab.toLowerCase()}`}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all duration-300 border cursor-pointer ${
                activeTab === tab
                  ? "bg-cyan-500 border-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                  : "border-neutral-300 text-neutral-500 hover:border-cyan-400 hover:text-neutral-900"
              }`}
            >
              {t(`filter${tab}`)}
            </button>
          ))}
        </motion.div>
      </div>

      {/* ── Photo Grid ── */}
      <div className="container mx-auto px-8 pb-32">
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((photo) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.35 }}
                className="group relative overflow-hidden rounded-2xl cursor-pointer aspect-[4/3]"
                onClick={() => openLightbox(photo)}
              >
                <Image
                  src={photo.src}
                  alt={photo.caption}
                  width={photo.width}
                  height={photo.height}
                  className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  quality={100}
                />

                {/* cinematic overlay on hover */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* destination badge (always visible) */}
                <div className="absolute top-4 left-4">
                  <span className="text-[10px] font-medium tracking-widest uppercase bg-black/50 backdrop-blur-sm border border-white/10 text-white/80 px-3 py-1 rounded-full">
                    {photo.destination}
                  </span>
                </div>

                {/* caption slides up on hover */}
                <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <span className="text-[10px] tracking-widest text-cyan-400 uppercase">
                    {photo.tag}
                  </span>
                  <p className="text-white font-medium text-sm mt-1">
                    {photo.caption}
                  </p>
                  <p className="text-neutral-400 text-xs mt-0.5">
                    {photo.location}
                  </p>
                </div>

                {/* zoom icon */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-full p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="11" y1="8" x2="11" y2="14" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeLightbox}
          >
            {/* Counter */}
            <div className="absolute top-6 left-6 text-white/40 text-sm select-none">
              {lightboxIndex + 1} / {filtered.length}
            </div>

            {/* Close */}
            <button
              id="lightbox-close"
              className="absolute top-5 right-5 text-white/50 hover:text-white transition-colors duration-200 p-2 cursor-pointer z-10"
              onClick={closeLightbox}
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Prev arrow */}
            <button
              id="lightbox-prev"
              className="absolute left-4 md:left-8 text-white/50 hover:text-white transition-colors duration-200 p-3 cursor-pointer z-10"
              onClick={(e) => {
                e.stopPropagation();
                prevPhoto();
              }}
              aria-label="Previous photo"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Next arrow */}
            <button
              id="lightbox-next"
              className="absolute right-4 md:right-8 text-white/50 hover:text-white transition-colors duration-200 p-3 cursor-pointer z-10"
              onClick={(e) => {
                e.stopPropagation();
                nextPhoto();
              }}
              aria-label="Next photo"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {/* Image container */}
            <motion.div
              className="relative max-w-5xl w-full mx-16 md:mx-24"
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              transition={{ duration: 0.28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightboxPhoto.src}
                alt={lightboxPhoto.caption}
                width={lightboxPhoto.width}
                height={lightboxPhoto.height}
                className="w-full h-auto max-h-[72vh] object-contain rounded-2xl"
                quality={100}
              />

              {/* Caption below */}
              <motion.div
                className="mt-5 text-center"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <p className="text-cyan-400 text-[10px] tracking-[0.3em] uppercase">
                  {lightboxPhoto.tag} &middot; {lightboxPhoto.destination}
                </p>
                <p className="text-white font-medium text-lg mt-2">
                  {lightboxPhoto.caption}
                </p>
                <p className="text-neutral-400 text-sm mt-1">
                  {lightboxPhoto.location}
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <PackagesCTA/>
      <Footer/>
    </div>
  );
}
