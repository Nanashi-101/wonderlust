import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { getCurrentAdmin } from "@/lib/auth/admin";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const { getUser, isAuthenticated } = getKindeServerSession();
  const user = await getUser();
  const isAuth = !!(await isAuthenticated());
  const isAdmin = isAuth ? !!(await getCurrentAdmin()) : false;

  return <NavbarClient user={user} isAuth={isAuth} isAdmin={isAdmin} />;
}
