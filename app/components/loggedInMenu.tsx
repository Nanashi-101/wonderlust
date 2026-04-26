"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import prisma from "../lib/db";
import Link from "next/link";
import { useKindeBrowserClient, LogoutLink } from "@kinde-oss/kinde-auth-nextjs";

export default async function LoggedInMenu() {
    const { user, isAuthenticated, isLoading } = useKindeBrowserClient();

    // let userData = null

    // if (user && isAuthenticated && !isLoading ) {
    //     userData = await prisma.user.findUnique({
    //         where: {
    //             id: user?.id,
    //         },
    //         select:{
    //             id: true,
    //             email: true,
    //             firstName: true,
    //             lastName: true,
    //             profileImage: true,
    //         }
    //     })
    // }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                {user?.picture ? (
                    <img src={user?.picture} alt="User" className="w-10 h-10 rounded-full" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-500" />
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>
                    <Link href="/dashboard" className="rounded-full bg-blue-500 px-4 py-2 text-white">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Link href="/settings" className="rounded-full bg-blue-500 px-4 py-2 text-white">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <LogoutLink className="rounded-full bg-blue-500 px-4 py-2 text-white">Logout</LogoutLink>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
