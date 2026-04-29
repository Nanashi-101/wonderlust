import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user === null || !user.id) {
    throw new Error("Something went wrong with authentication...");
  }

  // TODO: Sync user to your database (Supabase) here
  // Example: 
  // const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  // if (!dbUser) { await prisma.user.create({ data: { id: user.id, email: user.email } }); }

  return NextResponse.redirect("http://localhost:3000/en");
}
