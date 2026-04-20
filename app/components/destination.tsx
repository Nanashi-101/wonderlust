"use client";

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";   

import { Images } from "../lib/utils";

const destinations = [
  {
    name: "Kashmir",
    image: Images.Kashmir,
    description: "Snow peaks, alpine lakes & timeless beauty.",
  },
  {
    name: "Manali",
    image: Images.Manali,
    description: "Adventure, valleys & Himalayan charm.",
  },
  {
    name: "Rishikesh",
    image: Images.Rishikesh,
    description: "Sacred rivers & spiritual serenity.",
  },
  {
    name: "Ladakh",
    image: Images.Ladakh,
    description: "High passes & dramatic landscapes.",
  },
];

export default function Destinations() {
  const t = useTranslations('Destinations');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const sectionRef = useRef<HTMLDivElement>(null);

  const localDestinations = [
    {
      name: t('kashmir'),
      image: Images.Kashmir,
      description: t('kashmirDesc'),
    },
    {
      name: t('manali'),
      image: Images.Manali,
      description: t('manaliDesc'),
    },
    {
      name: t('rishikesh'),
      image: Images.Rishikesh,
      description: t('rishikeshDesc'),
    },
    {
      name: t('ladakh'),
      image: Images.Ladakh,
      description: t('ladakhDesc'),
    },
  ];

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(".destination-card", {
        opacity: 0,
        y: 80,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="destination" className="py-40 bg-neutral-50">
      <div className="container mx-auto px-8">
        {/* Heading */}
        <div className="text-center mb-32">
          <h2 className="text-6xl font-semibold tracking-tight text-neutral-900">
            {t('headingPrefix')}<span className="text-cyan-500">{t('headingHighlight')}</span>
          </h2>

          <p className="mt-6 text-lg text-neutral-500 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-20 md:grid-cols-2">
          {localDestinations.map((place, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-3xl bg-neutral-900 cursor-pointer"
            >
              {/* Image */}
              <div className="relative aspect-4/3 rounded-3xl overflow-hidden">
                <Image
                  src={place.image}
                  alt={place.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={100}
                  priority={i === 0}
                  className="object-cover transition-transform duration-1200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
              </div>

              {/* Soft cinematic overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-700 group-hover:from-black/80" onClick={() => window.location.href = `/${locale}/gallery`} />

              {/* Content */}
              <div className="absolute bottom-12 left-12 right-12 text-white">
                <h3 className="text-4xl font-semibold tracking-tight">
                  {place.name}
                </h3>

                <p className="mt-4 text-lg text-white/80 max-w-md opacity-0 translate-y-6 transition-all duration-700 group-hover:opacity-100 group-hover:translate-y-0">
                  {place.description}
                </p>

                <div className="mt-6 w-0 h-0.5 bg-cyan-400 transition-all duration-700 group-hover:w-16" />
              </div>

              {/* Premium lift effect */}
              <div className="absolute inset-0 rounded-3xl shadow-[0_40px_80px_rgba(0,0,0,0.35)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
