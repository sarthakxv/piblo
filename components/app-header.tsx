import Link from "next/link";

export function AppHeader({ learnerName }: { learnerName: string }) {
    const firstName = learnerName.split(/\s+/)[0];
    const initial = firstName.charAt(0).toUpperCase();

    return (
        <header className="flex items-center justify-between gap-4 border-b border-rule pb-5">
            <Link href="/library">
                <img src="/logo-text.svg" alt="Piblo" className="h-7 w-auto" />
            </Link>
            <Link
                href="/profile"
                aria-label={`${firstName}'s profile`}
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors duration-150 hover:bg-paper-raised"
            >
                <span aria-hidden="true" className="flex size-7 items-center justify-center rounded-full bg-ink text-xs font-bold text-paper-raised">
                    {initial}
                </span>
                <span className="text-xs font-semibold text-graphite-soft">{firstName}</span>
            </Link>
        </header>
    );
}
