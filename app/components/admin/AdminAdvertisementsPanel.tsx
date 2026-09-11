"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Loader2,
  ImageOff,
} from "lucide-react";
import Image from "next/image";
import R2ImageUploader from "./R2ImageUploader";

interface Advertisement {
  id: string;
  imageUrl: string;
  imageKey: string;
  order: number;
  active: boolean;
}

interface AdminAdvertisementsPanelProps {
  advertisements: Advertisement[];
  onUpload: (imageUrl: string, imageKey: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleActive: (id: string) => Promise<void>;
  onMove: (id: string, direction: "up" | "down") => Promise<void>;
}

export default function AdminAdvertisementsPanel({
  advertisements,
  onUpload,
  onDelete,
  onToggleActive,
  onMove,
}: AdminAdvertisementsPanelProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleUploaded = async (url: string, key?: string) => {
    if (!key) return;
    setIsUploading(true);
    try {
      await onUpload(url, key);
    } finally {
      setIsUploading(false);
    }
  };

  const withBusy = async (id: string, action: () => Promise<void>) => {
    setBusyId(id);
    try {
      await action();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /> Advertisements
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Upload promotional images for the homepage scroll gallery —{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {advertisements.length} total, {advertisements.filter((a) => a.active).length} live
          </span>
        </p>
      </div>

      {/* Uploader */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
          Upload New Advertisement
        </h3>
        <R2ImageUploader value="" onChange={handleUploaded} folder="advertisements" />
        {isUploading && (
          <div className="mt-3 flex items-center gap-2 text-sm text-cyan-700 dark:text-cyan-400">
            <Loader2 className="w-4 h-4 animate-spin" /> Saving advertisement...
          </div>
        )}
      </div>

      {/* Gallery grid */}
      {advertisements.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <ImageOff className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
            No advertisements yet
          </h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Upload an image above to add it to the homepage gallery
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {advertisements.map((ad, i) => {
              const isBusy = busyId === ad.id;
              return (
                <motion.div
                  key={ad.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden shadow-sm ${
                    ad.active
                      ? "border-slate-200/80 dark:border-slate-800"
                      : "border-slate-200/80 dark:border-slate-800 opacity-60"
                  }`}
                >
                  <div className="relative aspect-video bg-slate-100 dark:bg-slate-800">
                    <Image
                      src={ad.imageUrl}
                      alt="Advertisement"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                    {!ad.active && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-white bg-black/60 px-2.5 py-1 rounded-full">
                          Hidden
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => withBusy(ad.id, () => onMove(ad.id, "up"))}
                        disabled={isBusy}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors disabled:opacity-40"
                        title="Move earlier"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => withBusy(ad.id, () => onMove(ad.id, "down"))}
                        disabled={isBusy}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors disabled:opacity-40"
                        title="Move later"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => withBusy(ad.id, () => onToggleActive(ad.id))}
                        disabled={isBusy}
                        className="p-2 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 dark:hover:text-cyan-400 cursor-pointer transition-colors disabled:opacity-40"
                        title={ad.active ? "Hide from gallery" : "Show in gallery"}
                      >
                        {ad.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => withBusy(ad.id, () => onDelete(ad.id))}
                        disabled={isBusy}
                        className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer transition-colors disabled:opacity-40"
                        title="Delete permanently"
                      >
                        {isBusy ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
