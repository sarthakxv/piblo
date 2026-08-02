"use client";

import { Button } from "@/components/ui/button";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <main className="grid min-h-dvh place-items-center px-5">
            <section className="max-w-lg text-center">
                <p className="text-sm font-bold text-coral">Piblo hit a problem</p>
                <h1 className="mt-3 font-notebook text-4xl font-bold text-graphite">Your work is still stored in this browser.</h1>
                <p className="mt-4 text-graphite-soft">Try loading this part of the app again.</p>
                <Button type="button" onClick={reset} className="mt-6 bg-graphite text-paper-raised">Try again</Button>
            </section>
        </main>
    );
}
