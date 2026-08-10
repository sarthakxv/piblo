"use client";

import Link from "next/link";
import { UserMenu } from "@/components/user-menu.tsx";

interface AppHeaderProps {
    learnerName: string;
    email?: string | null;
    avatarUrl?: string | null;
}

export function AppHeader({ learnerName, email, avatarUrl }: AppHeaderProps) {
    return (
        <header className="flex items-center justify-between gap-4 border-b border-rule pb-5">
            <Link href="/library">
                <img src="/logo-text.svg" alt="Piblo" className="h-7 w-auto" />
            </Link>
            <UserMenu learnerName={learnerName} email={email} avatarUrl={avatarUrl} />
        </header>
    );
}
