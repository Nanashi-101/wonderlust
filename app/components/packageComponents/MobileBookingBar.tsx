"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface MobileBookingBarProps {
  price: string;
  duration: string;
}

export default function MobileBookingBar({ price, duration }: MobileBookingBarProps) {
  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/80 backdrop-blur-xl border-t border-neutral-200 p-4 pb-8 flex items-center justify-between shadow-[0_-10px_20px_rgba(0,0,0,0.05)]"
    >
      <div>
        <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">{duration}</p>
        <p className="text-xl font-bold text-cyan-600">{price}</p>
      </div>
      <Button className="rounded-full px-8 bg-cyan-600 hover:bg-cyan-500 font-bold">
        Book Now
      </Button>
    </motion.div>
  );
}
