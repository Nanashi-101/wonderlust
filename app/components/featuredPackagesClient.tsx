"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import type { LocalisedPackage } from "@/lib/package-utils";

interface Props {
  packages: LocalisedPackage[];
}

export default function FeaturedPackagesClient({ packages }: Props) {
  const t = useTranslations("FeaturedPackages");
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".featured-card");

      gsap.set(cards, { opacity: 0, y: 60 });

      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          once: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="featured-packages"
      ref={sectionRef}
      className="py-40 bg-neutral-50 text-neutral-900"
    >
      <div className="container mx-auto px-8">
        {/* Heading */}
        <div className="packages-heading mb-20 max-w-3xl">
          <h2 className="text-5xl md:text-6xl font-semibold tracking-tight">
            {t("heading")}
          </h2>
          <p className="mt-6 text-lg text-neutral-600 leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-12">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="featured-card group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              {/* Image */}
              <div className="relative aspect-4/3 overflow-hidden">
                <Image
                  src={pkg.imagePath}
                  alt={pkg.title}
                  fill
                  quality={100}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="p-8">
                <h3 className="text-2xl font-semibold tracking-tight">
                  {pkg.title}
                </h3>

                <p className="mt-4 text-neutral-600 text-sm leading-relaxed">
                  {pkg.description}
                </p>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-cyan-500 font-semibold">
                      {pkg.priceDisplay}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {pkg.durationDisplay}
                    </span>
                  </div>

                  <Link
                    href="/packages"
                    className="text-sm font-medium group-hover:translate-x-2 transition-transform duration-300 cursor-pointer"
                  >
                    {t("explore")}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-20 text-center">
          <Link
            href="/packages"
            className="group inline-flex items-center text-sm font-medium tracking-wide cursor-pointer"
          >
            {t("viewAll")}
            <span className="ml-4 h-0.5 w-8 bg-cyan-500 transition-all duration-500 group-hover:w-16" />
          </Link>
        </div>
      </div>
    </section>
  );
}
