"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Compass } from "lucide-react";

type NotFoundCopy = {
  eyebrow: string;
  heading: string;
  description: string;
  cta: string;
};

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

type LinkComponent = React.ElementType<{ href: string; className?: string; children: React.ReactNode }>;

// Default is resolved client-side (this whole module is "use client") — a plain
// <a>. A Server Component caller (the root not-found.tsx) can't pass a function
// prop across the RSC boundary, so it relies on this default instead of a prop.
const DefaultHomeLink: LinkComponent = (props) => <a {...props} />;

export default function NotFoundScene({
  copy,
  homeHref,
  HomeLink = DefaultHomeLink,
}: {
  copy: NotFoundCopy;
  homeHref: string;
  /** Locale-aware `Link` under `[locale]`. Omit at the root, where no locale is known — falls back to a plain `<a>`. */
  HomeLink?: LinkComponent;
}) {
  const prefersReducedMotion = useReducedMotion();

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: prefersReducedMotion ? 0 : 0.12, delayChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
  };

  return (
    <div className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-white px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: -30 }}
        animate={
          prefersReducedMotion
            ? { opacity: 1, scale: 1, rotate: 0 }
            : { opacity: 1, scale: 1, rotate: [0, -12, 10, -6, 0] }
        }
        transition={
          prefersReducedMotion
            ? { duration: 0.5 }
            : { duration: 1.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.4 }
        }
        className="mb-8 flex size-20 items-center justify-center rounded-full bg-cyan-50 text-cyan-500 sm:size-24"
      >
        <Compass className="size-10 sm:size-12" strokeWidth={1.5} aria-hidden="true" />
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex max-w-xl flex-col items-center"
      >
        <motion.span variants={item} className="text-sm font-medium tracking-[0.3em] text-cyan-600">
          {copy.eyebrow}
        </motion.span>

        <motion.h1
          variants={item}
          className="mt-4 font-serif text-3xl font-medium text-neutral-900 sm:text-4xl"
        >
          {copy.heading}
        </motion.h1>

        <motion.p variants={item} className="mt-4 text-base text-neutral-500 sm:text-lg">
          {copy.description}
        </motion.p>

        <motion.div variants={item} className="mt-10">
          <HomeLink
            href={homeHref}
            className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-8 py-4 font-medium tracking-wide text-white transition-all duration-300 hover:scale-105 hover:bg-cyan-600 hover:shadow-xl"
          >
            {copy.cta}
          </HomeLink>
        </motion.div>
      </motion.div>
    </div>
  );
}
