"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client.ts";

interface AppHeaderProps {
    learnerName: string;
    email?: string | null;
    avatarUrl?: string | null;
}

export function AppHeader({ learnerName, email, avatarUrl }: AppHeaderProps) {
    const router = useRouter();
    const firstName = learnerName.split(/\s+/)[0];
    const initial = firstName.charAt(0).toUpperCase();

    const signOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.replace("/");
        router.refresh();
    };

    return (
        <header className="flex items-center justify-between gap-4 border-b border-rule pb-5">
            <Link href="/library">
                <img src="/logo-text.svg" alt="Piblo" className="h-7 w-auto" />
            </Link>
            <DropdownMenu>
                <DropdownMenuTrigger
                    aria-label={`${firstName}'s account`}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors duration-150 outline-none hover:bg-paper-raised focus-visible:bg-paper-raised"
                >
                    <Avatar className="size-7 after:border-rule">
                        {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
                        <AvatarFallback className="bg-ink text-xs font-bold text-paper-raised">{initial}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-semibold text-graphite-soft">{firstName}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border border-rule bg-paper-raised text-graphite">
                    <DropdownMenuLabel className="px-3 py-2">
                        <span className="block text-sm font-semibold text-graphite">{learnerName}</span>
                        {email ? <span className="mt-0.5 block text-xs font-normal text-graphite-muted">{email}</span> : null}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-rule" />
                    <DropdownMenuItem
                        className="cursor-pointer px-3 py-2 text-sm focus:bg-paper-inset focus:text-graphite"
                        onClick={() => router.push("/profile")}
                    >
                        <UserRound aria-hidden="true" className="size-4" />
                        Your profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        variant="destructive"
                        className="cursor-pointer px-3 py-2 text-sm text-coral focus:bg-coral/10 focus:text-coral"
                        onClick={signOut}
                    >
                        <LogOut aria-hidden="true" className="size-4" />
                        Sign out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
