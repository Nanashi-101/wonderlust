"use client";

import { useState, useRef } from "react";
import { UploadCloud, Loader2, CheckCircle2, Image as ImageIcon, X, AlertCircle } from "lucide-react";
import Image from "next/image";

interface R2ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  presets?: Array<{ name: string; path: string }>;
}

export default function R2ImageUploader({
  value,
  onChange,
  presets = [],
}: R2ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setError(null);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (PNG, JPG, WebP, etc.).");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload file to Cloudflare R2.");
      }

      // Update parent component with the new R2 public URL
      onChange(data.url);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err?.message || "An error occurred while uploading to Cloudflare R2.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const isR2Url = value.includes("r2.dev") || value.includes("cloudflarestorage.com");

  return (
    <div className="space-y-4">
      {/* Upload Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 transition-all text-center cursor-pointer overflow-hidden ${
          dragActive
            ? "border-cyan-500 bg-cyan-50/70 scale-[1.01]"
            : isUploading
            ? "border-cyan-400 bg-cyan-50/40 pointer-events-none"
            : "border-neutral-300 hover:border-cyan-500 hover:bg-neutral-50/80 bg-white"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />

        {isUploading ? (
          <div className="py-4 flex flex-col items-center gap-3 text-cyan-700">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
            <div>
              <p className="text-sm font-bold">Uploading to Cloudflare R2...</p>
              <p className="text-xs text-cyan-600/80 mt-0.5">Storing image securely in bucket</p>
            </div>
          </div>
        ) : (
          <div className="py-2 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shadow-xs mb-1">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-800">
                Click to upload image <span className="text-neutral-400 font-normal">or drag & drop</span>
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Upload directly to Cloudflare R2 bucket (PNG, JPG, WebP up to 10MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          {error}
        </div>
      )}

      {/* Direct URL Input */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
          Or Enter Image URL / Path Manually
        </label>
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="/destination/Ladakh.png or https://..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none text-xs font-mono text-cyan-700 transition-all pr-24"
          />
          {isR2Url && (
            <span className="absolute right-3 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> R2 Cloud
            </span>
          )}
        </div>
      </div>

      {/* Preset selector */}
      {presets.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-neutral-500 font-medium mr-1 flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5" /> Presets:
          </span>
          {presets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => onChange(preset.path)}
              className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                value === preset.path
                  ? "bg-cyan-600 text-white font-semibold shadow-md"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-200"
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
