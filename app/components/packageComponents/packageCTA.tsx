"use client";

import Link from "next/link";
import BrowseAllPageBtn from "../browseAllPageBtn";

import { useTranslations } from "next-intl";

export default function PackagesCTA() {
  const t = useTranslations('PackagesCTA');

  return (
    <section className="py-32 bg-cyan-500 text-white">
      <div className="container mx-auto px-6 text-center max-w-4xl">
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
          {t('heading')}
        </h2>

        <p className="mt-6 text-lg text-white/80">
          {t('subtitle')}
        </p>

        <BrowseAllPageBtn/>
      </div>
    </section>
  );
}
