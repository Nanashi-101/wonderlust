"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import { Menu, X } from "lucide-react";

export default function GalleryNavbar() {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isPackages = pathname === "/packages" || pathname.startsWith("/packages");
  const isGallery = pathname === "/gallery" || pathname.startsWith("/gallery");

  const navLinks = [
    { href: "/#about", label: t('home'), active: false },
    { href: "/#destination", label: t('destination'), active: false },
    { href: "/packages", label: t('packages'), active: isPackages },
    { href: "/gallery", label: t('gallery'), active: isGallery },
    { href: "/#contact", label: t('contact'), active: false },
  ];

  return (
    <>
      <motion.nav
        className="fixed top-0 z-50 w-full px-6 xl:px-20 py-6 bg-white/80 backdrop-blur-md border-b border-neutral-100"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mx-auto flex items-center xl:text-xl justify-between">
          <Link
            href="/"
            className="cursor-pointer text-xl font-semibold tracking-[0.05em] text-neutral-900"
          >
            WANDER<span className="text-cyan-500">LUST</span>
          </Link>

          <div className="hidden gap-8 md:flex items-center text-neutral-700">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                className={link.active ? "text-cyan-500 hover:opacity-100" : "opacity-80 hover:opacity-100"}
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="ghost" className="hidden sm:flex" />

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 md:hidden transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6 text-neutral-900" /> : <Menu className="w-6 h-6 text-neutral-900" />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-white md:hidden flex flex-col p-8 pt-24"
          >
            <button
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
              className="absolute top-6 right-6 p-2 rounded-full bg-neutral-100 hover:bg-neutral-200"
            >
              <X className="w-6 h-6 text-neutral-900" />
            </button>

            <div className="flex flex-col gap-6 text-2xl font-medium text-neutral-900 mb-12">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={link.active ? "text-cyan-500" : "hover:text-cyan-500 transition-colors"}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex justify-center pt-6">
              <LanguageSwitcher variant="ghost" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
