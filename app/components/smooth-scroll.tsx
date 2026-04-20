/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

export default function SmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });

    (window as any).lenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    lenis.on("scroll", ScrollTrigger.update);

    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (typeof value === "number") {
          lenis.scrollTo(value);
        }
        return window.scrollY;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });

    ScrollTrigger.refresh();

    // 🔥 IMPROVED ANCHOR HANDLER WITH DIFFERENT OFFSETS
    const offsets: Record<string, number> = {
      "#about": -246,
      "#destination": 36,
      "#packages": 50,
    };

    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      const el = document.querySelector(href);

      if (el instanceof HTMLElement) {
        e.preventDefault();

        // Dynamic navbar height fallback
        const navbarHeight = document.querySelector("nav")?.clientHeight ?? 0;

        const offset = offsets[href] ?? -navbarHeight;

        lenis.scrollTo(el, {
          offset,
          duration: 1.2,
        });

        // Update URL hash without jump
        history.pushState(null, "", href);
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
      lenis.destroy();
      ScrollTrigger.killAll();
    };
  }, []);

  return null;
}
