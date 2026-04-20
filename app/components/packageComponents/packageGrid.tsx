"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";
import { packages, PackageCategory, packageCategories } from "@/app/lib/utils";
import PackageCard from "./packageCard";

export default function PackageGrid() {
  const t = useTranslations('PackageGrid');
  const gridRef = useRef<HTMLDivElement>(null);

  const [filter, setFilter] = useState<"All" | PackageCategory>("All");


  const filteredPackages =
    filter === "All"
      ? packages
      : packages.filter((pkg) => pkg.category === filter);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(".package-card", {
        opacity: 0,
        y: 60,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 85%",
        },
      });
    }, gridRef);

    return () => ctx.revert();
  }, [filter]);

  return (
    <section className="py-32 bg-white" ref={gridRef}>
      <div className="container mx-auto px-8">
        {/* Filter Bar */}
        <div className="mb-16 flex flex-wrap gap-4 items-center justify-between">
          <h2 className="text-4xl font-semibold tracking-tight">
            {t('heading')}
          </h2>

          <div className="flex gap-3 flex-wrap">
            {packageCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2 text-sm rounded-full border transition-all duration-300 ${
                  filter === cat
                    ? "bg-cyan-500 text-white border-cyan-500"
                    : "border-neutral-300 text-neutral-600 hover:border-cyan-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredPackages.map((pkg, i) => (
            <div key={i} className="break-inside-avoid package-card">
              <PackageCard pkg={pkg} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
