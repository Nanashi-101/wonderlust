"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Package as PackageIcon,
  MapPin,
  AlertTriangle,
  Loader2,
  Filter,
  LayoutGrid,
  Clock,
  Users,
  IndianRupee,
} from "lucide-react";
import Image from "next/image";
import { getImageUrl } from "@/lib/package-utils";

interface AdminPackagesPanelProps {
  packages: any[];
  onCreatePackage: () => void;
  onEditPackage: (pkg: any) => void;
  onDeletePackage: (id: string) => Promise<void>;
}

export default function AdminPackagesPanel({
  packages,
  onCreatePackage,
  onEditPackage,
  onDeletePackage,
}: AdminPackagesPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [deleteCandidate, setDeleteCandidate] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const categories = [
    "ALL",
    ...Array.from(new Set(packages.map((p) => p.category))),
  ];

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "ALL" || pkg.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      await onDeletePackage(deleteCandidate.id);
      setDeleteCandidate(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <PackageIcon className="w-5 h-5 text-cyan-600" /> Tour Package
              Inventory
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage, edit, or remove published expedition packages —{" "}
              <span className="font-semibold text-slate-700">
                {packages.length} total
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search packages or regions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none text-sm text-slate-700 transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {cat === "ALL" ? "All" : cat.replace(/([A-Z])/g, " $1").trim()}
                </button>
              ))}
            </div>

            {/* Add Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCreatePackage}
              className="py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer transition-all shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Package
            </motion.button>
          </div>
        </div>
      </div>

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
        {filteredPackages.map((pkg, i) => {
          const resolvedImg = getImageUrl(pkg.imagePath);

          return (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
            >
              {/* Image */}
              <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
                <Image
                  src={resolvedImg}
                  alt={pkg.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />

                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-cyan-500/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
                    {pkg.category}
                  </span>
                  <span className="px-2.5 py-1.5 rounded-lg bg-black/50 backdrop-blur-md text-white text-xs font-medium">
                    {pkg.difficulty}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-1 mb-1">
                    <MapPin className="w-3.5 h-3.5" /> {pkg.destination}
                  </span>
                  <h3 className="text-lg font-extrabold truncate drop-shadow-sm leading-tight">
                    {pkg.title}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-5">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <Clock className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                    <p className="text-sm font-bold text-slate-900">
                      {pkg.durationDays}D/{pkg.durationNights}N
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Duration</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <IndianRupee className="w-4 h-4 text-cyan-600 mx-auto mb-1" />
                    <p className="text-sm font-bold text-cyan-700">
                      {formatCurrency(pkg.priceFrom)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Starting
                    </p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <Users className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                    <p className="text-sm font-bold text-slate-900">
                      {pkg.groupSize || "2-15"}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Group</p>
                  </div>
                </div>

                {/* Highlights */}
                {pkg.highlights?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Key Highlights
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {pkg.highlights
                        .slice(0, 3)
                        .map((h: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 font-medium border border-slate-100"
                          >
                            ✓ {h}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onEditPackage(pkg)}
                    className="flex-1 py-3 rounded-xl bg-slate-50 hover:bg-cyan-50 text-slate-700 hover:text-cyan-800 font-semibold text-sm border border-slate-200 hover:border-cyan-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4 text-cyan-600" /> Edit
                    Expedition
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDeleteCandidate(pkg)}
                    className="p-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 border border-red-200 cursor-pointer transition-colors"
                    title="Delete Package"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredPackages.length === 0 && (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <PackageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">
            No packages found
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Try a different search or create a new expedition
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Delete This Expedition?
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  You're about to permanently delete{" "}
                  <strong className="text-slate-900">
                    {deleteCandidate.title}
                  </strong>
                  . This action cannot be undone and will remove it from the
                  public catalog.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteCandidate(null)}
                  disabled={isDeleting}
                  className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold shadow-lg shadow-red-600/20 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" /> Confirm Delete
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
