"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "@/i18n/navigation";

export default function Contact() {
  const t = useTranslations('Contact');
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".contact-fade",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.15,
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
    <section
      id="contact"
      ref={sectionRef}
      className="py-40 bg-white text-neutral-900"
    >
      <div className="container mx-auto px-8 max-w-6xl">
        {/* Heading */}
        <div className="contact-fade mb-20 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-cyan-400">
            {t('heading')}
          </h2>
          <p className="mt-6 text-lg text-neutral-600 leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        {/* Form */}
        <form className="grid md:grid-cols-2 gap-12">
          <div className="contact-fade space-y-8">
            <div>
              <label className="block text-sm mb-2 text-neutral-600">
                {t('fullName')}
              </label>
              <input
                type="text"
                className="w-full border-b border-neutral-300 py-3 focus:outline-none focus:border-cyan-500 transition"
                placeholder={t('fullNamePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-neutral-600">
                {t('email')}
              </label>
              <input
                type="email"
                className="w-full border-b border-neutral-300 py-3 focus:outline-none focus:border-cyan-500 transition"
                placeholder={t('emailPlaceholder')}
              />
            </div>
          </div>

          <div className="contact-fade">
            <label className="block text-sm mb-2 text-neutral-600">
              {t('message')}
            </label>
            <textarea
              rows={6}
              className="w-full border-b border-neutral-300 py-3 resize-none focus:outline-none focus:border-cyan-500 transition"
              placeholder={t('messagePlaceholder')}
            />
          </div>
        </form>

        {/* Button */}
        <div className="contact-fade mt-16">
          <button className="group inline-flex items-center text-sm font-medium tracking-wide">
            {t('submit')}
            <span className="ml-4 h-0.5 w-8 bg-cyan-500 transition-all duration-500 group-hover:w-16" />
          </button>
        </div>
      </div>
    </section>
  );
}
