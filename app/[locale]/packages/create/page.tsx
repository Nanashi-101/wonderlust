import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import CreatePackageForm from "@/app/components/packageComponents/createPackageForm";
import { getCurrentAdmin } from "@/lib/auth/admin";

export default async function CreatePackagePage({
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
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-between text-neutral-900">
      <div>
        <Navbar />
        <div className="pt-32 pb-16">
          <CreatePackageForm />
        </div>
      </div>
      <Footer />
    </div>
  );
}
