import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import AdminDashboardShell from "@/app/components/admin/AdminDashboardShell";
import { getPackages } from "@/lib/actions/packages";
import {
  getAdminDashboardStats,
  getInquiriesAction,
  getAdminUsersAction,
} from "@/lib/actions/admin";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { isAuthenticated, getUser } = getKindeServerSession();

  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect(`/api/auth/login`);
  }

  const user = await getUser();

  // Fetch dashboard data
  const [stats, packages, inquiries, admins] = await Promise.all([
    getAdminDashboardStats(),
    getPackages(),
    getInquiriesAction(),
    getAdminUsersAction(),
  ]);

  return (
    <AdminDashboardShell
      initialStats={stats}
      initialPackages={packages}
      initialInquiries={inquiries}
      initialAdmins={admins}
      user={user ? { name: user.given_name || "Admin", email: user.email || "", picture: user.picture || null } : null}
    />
  );
}
