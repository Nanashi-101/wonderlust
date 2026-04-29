"use client";

import Image from "next/image";
import MountainBg from "@/public/destination/pause-bg.png"; // use subtle image
import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Link from "next/link";

import { useTranslations } from "next-intl";

export default function ExperiencePause() {
  const t = useTranslations('ExperiencePause');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(".pause-inner", {
        opacity: 0,
        y: 60,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 80%",
        },
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <section className="py-40 bg-white">
      <div ref={ref} className="pause-inner container mx-auto px-8">
        <div className="relative h-112.5 md:h-125 overflow-hidden rounded-3xl shadow-2xl bg-black/90 text-white flex flex-col md:flex-row items-center">
          <div className="absolute inset-0">
            <Image
              src={MountainBg}
              alt="Mountains"
              quality={100}
              fill
              className="object-cover opacity-65"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 flex-1 p-8 sm:p-16 md:p-20 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-semibold leading-tight">
              {t('headingLine1')}
              <br />
              <span className="text-cyan-400">{t('headingLine2')}</span>
            </h2>

            <p className="mt-8 text-neutral-300 max-w-xl">
              {t('description')}
            </p>

            <Link href="#featured-packages" className="mt-10 inline-flex items-center gap-3 group text-sm font-medium">
              {t('cta')}
              <span className="h-0.5 w-8 bg-cyan-400 transition-all duration-500 group-hover:w-16" />
            </Link>
          </div>

          {/* Optional Right Spacer for balance */}
          <div className="hidden md:block flex-1" />
        </div>
      </div>
    </section>
  );
}
