"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { Languages, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "ghost" | "outline" | "transparent";
}

export default function LanguageSwitcher({
  className,
  variant = "transparent",
}: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const locales = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
    { code: "bn", label: "বাংলা" },
    { code: "pl", label: "Polski" },
    { code: "fr", label: "Français" },
  ];

  const currentLanguage = locales.find((l) => l.code === locale) || locales[0];

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className={cn("flex items-center", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200",
              variant === "transparent" && "hover:bg-white/20 text-white",
              variant === "ghost" && "hover:bg-neutral-100 text-neutral-900",
              variant === "outline" && "border border-neutral-200 hover:bg-neutral-50"
            )}
          >
            <Languages className="w-4 h-4 opacity-80" />
            <span className="text-sm font-medium uppercase">{locale}</span>
            <ChevronDown className="w-3 h-3 opacity-50" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32 bg-white/90 backdrop-blur-md border-neutral-200 shadow-xl rounded-xl">
          {locales.map((l) => (
            <DropdownMenuItem
              key={l.code}
              onClick={() => handleLanguageChange(l.code)}
              className={cn(
                "cursor-pointer text-sm py-2 px-4 focus:bg-cyan-50 focus:text-cyan-600 transition-colors",
                locale === l.code && "bg-cyan-50 text-cyan-600 font-semibold"
              )}
            >
              {l.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
