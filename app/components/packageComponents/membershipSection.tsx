"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import MembershipImage from "@/public/member-pic.png"

import { useTranslations } from "next-intl";

export default function MembershipSection() {
  const t = useTranslations('Membership');
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".membership-card",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 bg-neutral-50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            {t('heading')}
          </h2>
          <p className="mt-6 text-lg text-neutral-600">
            {t('subtitle')}
          </p>
        </div>

        <div className="membership-card bg-white rounded-3xl shadow-xl p-12 md:p-16 grid md:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <h3 className="text-3xl font-semibold">{t('cardHeading')}</h3>

            <ul className="mt-8 space-y-4 text-neutral-600">
              <li>{t('benefit1')}</li>
              <li>{t('benefit2')}</li>
              <li>{t('benefit3')}</li>
              <li>{t('benefit4')}</li>
            </ul>

            <div className="mt-10 text-3xl font-semibold text-cyan-500">
              {t('price')}
            </div>

            <button className="mt-8 inline-flex items-center font-medium text-sm group">
              {t('cta')}
              <span className="ml-4 h-0.5 w-8 bg-cyan-500 transition-all duration-500 group-hover:w-16" />
            </button>
          </div>

          {/* Right Decorative Block */}
          <div className="relative h-64 md:h-full rounded-2xl overflow-hidden">
            <Image
              src={MembershipImage}
              alt="Membership Experience"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
