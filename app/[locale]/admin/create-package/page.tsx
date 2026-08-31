import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import BgPicture from "@/public/bgpiclogo.png";
import AdminHeader from "@/app/components/admin/AdminHeader";
import AdminFooter from "@/app/components/admin/AdminFooter";
import CreatorStudioWizard from "@/app/components/admin/CreatorStudioWizard";
import { getCurrentAdmin } from "@/lib/auth/admin";

export default async function AdminCreatePackagePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { isAuthenticated } = getKindeServerSession();

  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect(`/api/auth/login`);
  }

  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect(`/${locale}`);
  }

  return (
    <div className="min-h-screen bg-neutral-100/90 text-neutral-900 flex flex-col justify-between relative overflow-hidden">
      {/* Immersive Atmospheric Hero Background Backdrop with Ambient Light Blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Animated Floating Light Orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-400/25 filter blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-emerald-400/20 filter blur-3xl animate-pulse" />

        {/* Hero Background Image */}
        <Image
          src={BgPicture}
          alt="Hero Background"
          fill
          priority
          className="object-cover object-center scale-105 filter blur-xl opacity-25 saturate-150"
        />
        <div className="absolute inset-0 bg-neutral-100/80 backdrop-blur-sm" />
      </div>

      <div>
        <AdminHeader />
        <main className="py-8">
          <CreatorStudioWizard />
        </main>
      </div>
      <AdminFooter />
    </div>
  );
}
