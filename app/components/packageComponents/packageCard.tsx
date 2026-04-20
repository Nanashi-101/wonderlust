"use client";

import Image from "next/image";

interface PackageCardProps {
  pkg: {
    tKey: string;
    title: string;
    image: string;
    description: string;
    price: string;
    duration: string;
    difficulty: string;
  };
}

import { useTranslations } from "next-intl";

export default function PackageCard({ pkg }: PackageCardProps) {
  const t = useTranslations('PackageGrid');
  const t_data = useTranslations('PackagesData');

  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500">
      {/* Image */}
      <div className="relative w-full aspect-4/3 overflow-hidden">
        <Image
          src={pkg.image}
          alt={t_data(`${pkg.tKey}.title`)}
          fill
          quality={100}
          className="w-full object-cover h-auto transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />

        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-60" />

        {/* Title Over Image */}
        <div className="absolute bottom-6 left-6 text-white text-left">
          <h3 className="text-2xl font-semibold tracking-tight">
            {t_data(`${pkg.tKey}.title`)}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Meta */}
        <div className="flex justify-between text-sm text-neutral-500">
          <span>{t_data(`${pkg.tKey}.duration`)}</span>
          <span>{t_data(`${pkg.tKey}.difficulty`)}</span>
        </div>

        {/* Description */}
        <p className="mt-4 text-sm text-neutral-600 leading-relaxed line-clamp-3 text-left">
          {t_data(`${pkg.tKey}.description`)}
        </p>

        {/* Bottom */}
        <div className="mt-6 flex items-center justify-between">
          <span className="text-cyan-500 font-semibold">
            {t_data(`${pkg.tKey}.price`)}
          </span>

          <button className="text-sm font-medium tracking-wide transition-transform duration-300 group-hover:translate-x-1">
            {t('viewDetails')}
          </button>
        </div>
      </div>
    </div>
  );
}
