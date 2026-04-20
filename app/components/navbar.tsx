"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const t = useTranslations('Navigation');

  return (
    <motion.nav
      className="absolute top-0 z-50 w-full px-6 xl:px-20 py-6 text-white"
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="mx-auto flex items-center xl:text-xl justify-between">
        <Link href="/" className="cursor-pointer text-xl font-semibold tracking-[0.05em] text-white">
          WANDER<span className="text-cyan-500">LUST</span>
        </Link>

        <div className="hidden gap-8 md:flex">
          <Link className="nav-link opacity-80 hover:opacity-100" href="#about">
            {t('home')}
          </Link>
          <Link
            className="nav-link opacity-80 hover:opacity-100"
            href="#destination"
          >
            {t('destination')}
          </Link>
          <Link
            className="nav-link opacity-80 hover:opacity-100"
            href="#featured-packages"
          >
            {t('packages')}
          </Link>
          <Link
            className="nav-link opacity-80 hover:opacity-100"
            href="/gallery"
          >
            {t('gallery')}
          </Link>
          <Link
            className="nav-link opacity-80 hover:opacity-100"
            href="#contact"
          >
            {t('contact')}
          </Link>
        </div>

        <LanguageSwitcher variant="transparent" />
      </div>
    </motion.nav>
  );
}
