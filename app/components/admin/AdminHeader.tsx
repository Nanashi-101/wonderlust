import { Link } from "@/i18n/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { ExternalLink, Compass, LogOut, ChevronRight, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { getCurrentAdmin } from "@/lib/auth/admin";

export default async function AdminHeader() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const admin = await getCurrentAdmin();

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-neutral-200 text-neutral-900 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Left: Brand & Breadcrumbs */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xl font-bold tracking-wider hover:text-cyan-600 transition-colors text-neutral-900"
          >
            <span>WONDERLUST</span>
            <span className="text-cyan-500 font-extrabold">.</span>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-600 border border-cyan-200 text-xs font-bold uppercase tracking-widest ml-1">
              Studio
            </span>
          </Link>

          {/* Breadcrumbs */}
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-neutral-500 border-l border-neutral-200 pl-6">
            <Link href="/" className="hover:text-neutral-900 transition-colors">
              Website
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-600">Creator Studio</span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-cyan-600 font-semibold">New Package</span>
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-colors border border-neutral-200"
          >
            <Compass className="w-4 h-4 text-cyan-600" />
            Visit Website
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
          </Link>

          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-neutral-200">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-cyan-500/40">
                {user.picture ? (
                  <Image
                    src={user.picture}
                    alt={user.given_name || "User"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-cyan-600 flex items-center justify-center text-xs font-bold text-white">
                    {user.given_name?.[0] || "U"}
                  </div>
                )}
              </div>
              <div className="hidden lg:block text-left">
                {admin && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 mb-0.5 rounded-md bg-amber-50 text-amber-600 text-[9px] font-bold uppercase tracking-wider border border-amber-200">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    {admin.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                  </span>
                )}
                <p className="text-xs font-semibold text-neutral-900 leading-tight">
                  {user.given_name} {user.family_name}
                </p>
              </div>

              <LogoutLink
                postLogoutRedirectURL="/"
                className="p-2 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </LogoutLink>

            </div>
          )}
        </div>
      </div>
    </header>
  );
}
