"use client";

import BgPicture from "@/public/bgpiclogo.png";
import { motion } from "framer-motion";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  FaArrowRight,
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";

export default function Hero() {
  const t = useTranslations('Hero');
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.to(bgRef.current, {
      y: 200,
      scrollTrigger: {
        trigger: bgRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div ref={bgRef} className="absolute inset-0 -z-10">
        <Image
          src={BgPicture}
          alt="Mountains"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="container flex h-full min-h-screen max-w-7xl flex-col justify-center px-6 sm:px-10 lg:px-16">
        <div className="container mx-auto flex h-full flex-col justify-center px-6">
          {" "}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl text-3xl sm:text-5xl font-bold leading-tight text-white md:text-7xl"
          >
            {" "}
            <span className="inline-block first-letter:text-cyan-400">
              {" "}
              {t('weaving')}{" "}
            </span>{" "}
            {t('dreamsInto')}{" "}
            <span className="text-3xl sm:text-5xl md:text-7xl font-bold underline decoration-cyan-400 underline-offset-4 decoration-6 ">
              {" "}
              {t('unforgettable')}{" "}
            </span>{" "}
            <br /> {t('adventures')}{""}{""}
            <span className="inline-block size-3 bg-cyan-400 rounded-full p-1 ml-1"></span>{""}
            <span className="inline-block size-3 bg-cyan-400 rounded-full p-1 ml-1"></span>{""}
            <span className="inline-block size-3 bg-cyan-400 rounded-full p-1 ml-1"></span>{""}
          </motion.h1>{" "}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-6 max-w-xl text-white/80 text-sm sm:text-lg md:text-xl"
          >
            {" "}
            {t('description')}{" "}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-8"
          >
            {" "}
            <Link
              href="#featured-packages"
              className="group relative max-w-38 flex items-center gap-2 overflow-hidden px-2 md:px-4 py-1 md:py-2 rounded-xs text-sm sm:text-lg text-white bg-neutral-300/30 hover:bg-neutral-300/30 cursor-pointer"
            >
              {" "}
              <div className="relative h-14 w-28 overflow-hidden">
                {" "}
                {/* Top Text */}{" "}
                <span className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full">
                  {" "}
                  {t('bookNow')}{" "}
                </span>{" "}
                {/* Bottom Text */}{" "}
                <span className="absolute inset-0 flex items-center justify-center translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0">
                  {" "}
                  {t('letsGo')}{" "}
                </span>{" "}
              </div>{" "}
              <FaArrowRight className="size-3 md:size-4" />{" "}
            </Link>{" "}
          </motion.div>
        </div>
      </div>

      {/* Social Icons (hidden on mobile) */}
      <motion.div
        className="absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col gap-8 text-white md:flex"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <FaInstagram
          className="cursor-pointer opacity-60 transition hover:opacity-100 hover:scale-110"
          size={22}
        />
        <FaFacebook
          className="cursor-pointer opacity-60 transition hover:opacity-100 hover:scale-110"
          size={22}
        />
        <a href="https://wa.me/919330424772">
          <FaWhatsapp
            className="cursor-pointer opacity-60 transition hover:opacity-100 hover:scale-110"
            size={22}
          />
        </a>
      </motion.div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 text-white/80">
        {" "}
        <Link
          href="#about"
          className="group relative flex items-center gap-3 overflow-hidden px-2 text-sm text-white bg-white/1 hover:bg-white/1 cursor-pointer"
        >
          {" "}
          <div className="relative h-8 w-38 overflow-hidden">
            {" "}
            {/* Top Text */}{" "}
            <span className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full">
              {" "}
              {t('scrollDown')}{" "}
            </span>{" "}
            {/* Bottom Text */}{" "}
            <span className="absolute inset-0 flex items-center justify-center translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0">
              {" "}
              {t('scrollDown')}{" "}
            </span>{" "}
          </div>{" "}
        </Link>{" "}
      </div>
    </section>
  );
}
