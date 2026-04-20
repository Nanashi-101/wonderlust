"use client";

import gsap from "gsap";
import { motion } from "framer-motion";
import ScrollTrigger from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { usePathname, useRouter, Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
export default function About() {
  const t = useTranslations('About');
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.from(sectionRef.current, {
      opacity: 0,
      y: 80,
      duration: 1,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
      },
    });
  }, []);

  return (
    <section ref={sectionRef} className="bg-neutral-100 py-24">
      <motion.div
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="container mx-auto grid gap-12 px-6 md:grid-cols-3 scroll-mt-64"
        id="about"
      >
        {/* Left Label */}
        <div className="md:col-span-1">
          <div className="text-sm uppercase tracking-widest text-cyan-400">
            {t('label')}
          </div>
          <div className="mt-2 h-px w-20 bg-neutral-400" />
        </div>

        {/* Heading */}
        <div className="md:col-span-1">
          <h2 className="text-3xl font-semibold leading-snug md:text-4xl text-cyan-400">
            {t('heading')}
          </h2>
        </div>

        {/* Content */}
        <div className="md:col-span-1 text-neutral-600 space-y-6">
          <p>
            {t('paragraph1prefix')}<span className="font-semibold text-cyan-400">{t('brandName')}</span>{t('paragraph1')}
          </p>

          <p>
            {t('paragraph2')}
          </p>

          <p>
            {t('paragraph3')}
          </p>
          <Link
            href="#destination"
            className="group relative flex max-w-28 rounded-sm items-center gap-2 overflow-hidden px-2 text-sm text-white bg-cyan-400 hover:bg-cyan-500 cursor-pointer"
          >
            <div className="relative h-8 w-24 overflow-hidden">
              {/* Top Text */}
              <span className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full">
                {t('exploreMore')}
              </span>

              {/* Bottom Text */}
              <span className="absolute inset-0 flex items-center justify-center translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0">
                {t('exploreMore')}
              </span>
            </div>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
