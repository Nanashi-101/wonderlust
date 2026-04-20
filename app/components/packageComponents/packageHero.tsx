"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import heroBG from "@/public/package-bg.png"

import { useTranslations } from "next-intl";

export default function PackageHero() {
  const t = useTranslations('PackageHero');
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-animate", {
        opacity: 0,
        y: 40,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative h-[70vh] flex items-center justify-center text-center overflow-hidden"
    >
      {/* Background Image */}
      <Image
        src={heroBG} // Replace with your actual image
        alt="Himalayan Expeditions"
        fill
        priority
        quality={100}
        className="object-cover"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 text-white max-w-3xl px-6">
        <h1 className="hero-animate text-6xl md:text-7xl font-semibold tracking-tight">
          {t('heading')}
        </h1>

        <p className="hero-animate mt-6 text-lg text-neutral-200 leading-relaxed">
          {t('subtitle')}
        </p>
      </div>
    </section>
  );
}
