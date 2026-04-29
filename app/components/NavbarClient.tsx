"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";
import { LoginLink, RegisterLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import type { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";
import { User, LogOut, LogIn, UserPlus, Package, CalendarDays, Settings, ChevronDown, Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { useState } from "react";

interface NavbarClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: KindeUser<any> | null;
  isAuth: boolean;
}

export default function NavbarClient({ user, isAuth }: NavbarClientProps) {
  const t = useTranslations('Navigation');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t('home') },
    { href: "#destination", label: t('destination') },
    { href: "#featured-packages", label: t('packages') },
    { href: "/gallery", label: t('gallery') },
    { href: "#contact", label: t('contact') },
  ];

  return (
    <>
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

          {/* Desktop Links */}
          <div className="hidden gap-8 md:flex">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                className="nav-link opacity-80 hover:opacity-100 transition-opacity" 
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop Auth */}
            <div className="hidden items-center gap-4 lg:flex">
              {isAuth ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none">
                    <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/10 group">
                      {user?.picture ? (
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20">
                          <Image 
                            src={user.picture} 
                            alt={user.given_name || "User"} 
                            fill 
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <span className="text-sm font-medium opacity-90 group-hover:opacity-100">
                        {user?.given_name}
                      </span>
                      <ChevronDown className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2 bg-white/90 backdrop-blur-md border-neutral-200 shadow-xl rounded-xl p-2">
                    <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      {t('welcome')}, {user?.given_name}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-neutral-100" />
                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg py-2.5 focus:bg-cyan-50 focus:text-cyan-600">
                      <Link href="/packages" className="flex items-center w-full">
                        <Package className="w-4 h-4 mr-3" />
                        <span className="font-medium">{t('myPackages')}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg py-2.5 focus:bg-cyan-50 focus:text-cyan-600">
                      <Link href="/bookings" className="flex items-center w-full">
                        <CalendarDays className="w-4 h-4 mr-3" />
                        <span className="font-medium">{t('myBookings')}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer rounded-lg py-2.5 focus:bg-cyan-50 focus:text-cyan-600">
                      <Settings className="w-4 h-4 mr-3" />
                      <span className="font-medium">Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-neutral-100" />
                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg py-2.5 focus:bg-red-50 focus:text-red-600 text-red-500">
                      <LogoutLink className="flex items-center w-full">
                        <LogOut className="w-4 h-4 mr-3" />
                        <span className="font-medium">{t('logout')}</span>
                      </LogoutLink>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-4">
                  <LoginLink className="group relative h-10 w-24 overflow-hidden rounded-full border border-white/20 bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="relative h-full w-full">
                      <span className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full">
                        {t('login')}
                      </span>
                      <span className="absolute inset-0 flex items-center justify-center translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 text-cyan-400">
                        {t('login')}
                      </span>
                    </div>
                  </LoginLink>
                  <RegisterLink className="group relative h-10 w-32 overflow-hidden rounded-full bg-cyan-600 hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-900/20">
                    <div className="relative h-full w-full">
                      <span className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full">
                        {t('register')}
                      </span>
                      <span className="absolute inset-0 flex items-center justify-center translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0">
                        Let's Go!
                      </span>
                    </div>
                  </RegisterLink>
                </div>
              )}
            </div>
            
            <LanguageSwitcher variant="transparent" className="hidden sm:flex" />
            
            {/* Hamburger Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 md:hidden transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-neutral-900/95 backdrop-blur-lg md:hidden flex flex-col p-8 pt-24"
          >
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <div className="flex flex-col gap-6 text-2xl font-medium text-white mb-12">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="hover:text-cyan-400 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-auto space-y-6">
              {isAuth ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5">
                    {user?.picture ? (
                      <Image src={user.picture} alt="User" width={48} height={48} className="rounded-full" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-cyan-600 flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="text-white font-bold">{user?.given_name}</p>
                      <p className="text-white/50 text-sm">{user?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Link href="/packages" className="p-4 rounded-2xl bg-white/5 flex flex-col items-center gap-2 hover:bg-white/10 transition-colors">
                      <Package className="w-6 h-6 text-cyan-400" />
                      <span className="text-white text-xs">{t('myPackages')}</span>
                    </Link>
                    <Link href="/bookings" className="p-4 rounded-2xl bg-white/5 flex flex-col items-center gap-2 hover:bg-white/10 transition-colors">
                      <CalendarDays className="w-6 h-6 text-cyan-400" />
                      <span className="text-white text-xs">{t('myBookings')}</span>
                    </Link>
                  </div>
                  <LogoutLink className="block w-full p-4 rounded-2xl bg-red-500/20 text-red-500 text-center font-bold">
                    {t('logout')}
                  </LogoutLink>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  <LoginLink className="w-full py-4 rounded-2xl bg-white/5 text-white text-center font-bold border border-white/10">
                    {t('login')}
                  </LoginLink>
                  <RegisterLink className="w-full py-4 rounded-2xl bg-cyan-600 text-white text-center font-bold">
                    {t('register')}
                  </RegisterLink>
                </div>
              )}
              <div className="flex justify-center pt-6">
                <LanguageSwitcher variant="transparent" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
