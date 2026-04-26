"use client";

import { Link } from "@/i18n/navigation";
import { LoginLink, LogoutLink, RegisterLink, useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";
import React from "react";
import prisma from "../lib/db";
import LoggedInMenu from "./loggedInMenu";

export default async function Navbar() {
  const t = useTranslations('Navigation');
  const { user, isAuthenticated, isLoading } = useKindeBrowserClient();

  let userData = null
  if(user || isAuthenticated){
    userData = await prisma.user.findUnique({
      where: {
        id: user?.id,
      },
      select:{
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profileImage: true,
      }
    })
  }

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

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher variant="transparent" />
          {!isLoading ? (
            isAuthenticated ? (
              <React.Fragment>
                {user?.picture ? (
                  <>
                    <img src={user.picture} alt="User" className="w-10 h-10 rounded-full" />
                    {/* <LoggedInMenu /> */}
                  </>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-500" />
                )}
                <LogoutLink className="rounded-full bg-blue-500 px-4 py-2 text-white">Logout</LogoutLink>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <LoginLink className="rounded-full bg-blue-500 px-4 py-2 text-white">Login</LoginLink>
                <RegisterLink className="rounded-full bg-blue-500 px-4 py-2 text-white">
                  Sign Up
                </RegisterLink>
              </React.Fragment>
            )
          ) : (
            <div className="w-20 h-10 animate-pulse bg-gray-200/20 rounded-full" />
          )}
        </div>

      </div>
    </motion.nav>
  );
}
