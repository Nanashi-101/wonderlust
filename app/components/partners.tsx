"use client";

import { motion, useAnimationFrame } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";
import { staticImage } from "@/lib/static-images";

const partners = [
  staticImage("partners/makemytrip.png"),
  staticImage("partners/airbnb.png"),
  staticImage("partners/booking.webp"),
  staticImage("partners/Incredibleindia.png"),
  staticImage("partners/stripe.png"),
  staticImage("partners/tripadvisor.png"),
];

export default function Partners() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);

  const speed = 100;

  useAnimationFrame((_, delta) => {
    const moveBy = (speed * delta) / 1000;
    setX((prev) => {
      const newX = prev - moveBy;

      if (!containerRef.current) return newX;

      const width = containerRef.current.scrollWidth / 2;

      if (Math.abs(newX) >= width) {
        return 0;
      }

      return newX;
    });
  });

  return (
    <section className="bg-white py-14">
      <div className="max-w-[65%] mx-auto overflow-hidden px-6">
        <div className="relative">
          <motion.div ref={containerRef} style={{ x }} className="flex gap-24">
            {[...partners, ...partners].map((logo, index) => (
              <Image
                key={index}
                src={logo}
                alt="Partner Logo"
                width={180}
                height={60}
                className="h-12 w-auto object-contain opacity-70 brightness-100 transition hover:opacity-100"
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
