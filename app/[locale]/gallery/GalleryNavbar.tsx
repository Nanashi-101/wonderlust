"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";

export default function GalleryNavbar() {
  const t = useTranslations('Navigation');

  return (
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
          <Link className="opacity-80 hover:opacity-100" href="/#about">
            {t('home')}
          </Link>
          <Link
            className="opacity-80 hover:opacity-100"
            href="/#destination"
          >
            {t('destination')}
          </Link>
          <Link
            className="opacity-80 hover:opacity-100"
            href="/#featured-packages"
          >
            {t('packages')}
          </Link>
          <Link
            className="text-cyan-400 hover:opacity-100"
            href="/gallery"
          >
            {t('gallery')}
          </Link>
          <Link
            className="opacity-80 hover:opacity-100"
            href="/#contact"
          >
            {t('contact')}
          </Link>
        </div>

        <LanguageSwitcher variant="ghost" />
      </div>
    </motion.nav>
  );
}
