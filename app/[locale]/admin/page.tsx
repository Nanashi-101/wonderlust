import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import AdminDashboardShell from "@/app/components/admin/AdminDashboardShell";
import { getPackages } from "@/lib/actions/packages";
import {
  getAdminDashboardStats,
  getInquiriesAction,
  getAdminUsersAction,
  getAllBookingsAction,
} from "@/lib/actions/admin";
import { getCurrentAdmin } from "@/lib/auth/admin";

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

  // Any admin (standard or Super) can enter the panel; the Admin Team panel
  // itself is further restricted to Super Admins inside AdminDashboardShell.
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect(`/${locale}`);
  }

  const isSuperAdmin = admin.role === "SUPER_ADMIN";
  const kindeUser = await getUser();

  // Fetch dashboard data — the admin directory is Super Admin-only, so skip it otherwise
  const [stats, packages, inquiries, admins, bookings] = await Promise.all([
    getAdminDashboardStats(),
    getPackages(),
    getInquiriesAction(),
    isSuperAdmin ? getAdminUsersAction() : Promise.resolve([]),
    getAllBookingsAction(),
  ]);

  return (
    <AdminDashboardShell
      initialStats={stats}
      initialPackages={packages}
      initialInquiries={inquiries}
      initialAdmins={admins}
      initialBookings={bookings}
      user={{ name: admin.name || kindeUser?.given_name || "Admin", email: admin.email, picture: kindeUser?.picture || null, role: admin.role }}
    />
  );
}
