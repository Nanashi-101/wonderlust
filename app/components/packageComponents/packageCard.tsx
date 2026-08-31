"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { LocalisedPackage } from "@/lib/package-utils";

interface PackageCardProps {
  pkg: LocalisedPackage;
}

export default function PackageCard({ pkg }: PackageCardProps) {
  const t = useTranslations("PackageGrid");

  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500">
      {/* Image */}
      <div className="relative w-full aspect-4/3 overflow-hidden">
        <Image
          src={pkg.imagePath}
          alt={pkg.title}
          fill
          quality={100}
          className="w-full object-cover h-auto transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-60" />

        {/* Title Over Image */}
        <div className="absolute bottom-6 left-6 text-white text-left">
          <h3 className="text-2xl font-semibold tracking-tight">{pkg.title}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Meta */}
        <div className="flex justify-between text-sm text-neutral-500">
          <span>{pkg.durationDisplay}</span>
          <span>{pkg.difficulty}</span>
        </div>

        {/* Description */}
        <p className="mt-4 text-sm text-neutral-600 leading-relaxed line-clamp-3 text-left">
          {pkg.description}
        </p>

        {/* Bottom */}
        <div className="mt-6 flex items-center justify-between">
          <span className="text-cyan-500 font-semibold">{pkg.priceDisplay}</span>

          <Link
            href={`/packages/${pkg.slug}`}
            className="text-sm font-medium tracking-wide transition-all duration-300 group-hover:translate-x-1 group-hover:text-cyan-600 flex items-center gap-1"
          >
            {t("viewDetails")}
          </Link>
        </div>
      </div>
    </div>
  );
}
