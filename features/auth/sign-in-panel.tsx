"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client.ts";

function GoogleMark() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
            <path
                fill="#EA4335"
                d="M12 5.04c1.7 0 3.22.59 4.42 1.73l3.29-3.29C17.72 1.65 15.06.5 12 .5 7.62.5 3.86 3.02 2.06 6.62l3.84 2.98C6.81 6.92 9.17 5.04 12 5.04z"
            />
            <path
                fill="#4285F4"
                d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45c-.28 1.5-1.13 2.77-2.4 3.62l3.71 2.88c2.17-2 3.74-4.96 3.74-8.69z"
            />
            <path
                fill="#FBBC05"
                d="M5.91 14.4a7.2 7.2 0 0 1 0-4.8L2.06 6.62a11.5 11.5 0 0 0 0 10.76l3.85-2.98z"
            />
            <path
                fill="#34A853"
                d="M12 23.5c3.06 0 5.63-1.01 7.5-2.74l-3.71-2.88c-1.03.69-2.35 1.1-3.79 1.1-2.83 0-5.19-1.88-6.1-4.56l-3.84 2.98C3.86 20.98 7.62 23.5 12 23.5z"
            />
        </svg>
    );
}

export function SignInPanel() {
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const signInWithGoogle = async () => {
        setSubmitting(true);
        setError(null);

        const supabase = createClient();
        const { error: signInError } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (signInError) {
            setError("Could not start Google sign-in. Please try again.");
            setSubmitting(false);
        }
    };

    return (
        <section aria-labelledby="sign-in-title" className="rounded-xl border border-rule bg-paper-raised p-6 sm:p-8">
            <div className="h-1 w-16 rounded-full bg-ink" aria-hidden="true" />
            <p className="mt-7 text-xs font-bold uppercase tracking-wide text-graphite-soft">Before we begin</p>
            <h2 id="sign-in-title" className="mt-3 text-balance font-notebook text-3xl font-bold leading-tight text-graphite">Sign in to set up your learning space.</h2>
            <p className="mt-3 text-pretty text-sm leading-6 text-graphite-soft">One Google account keeps your profile and progress with you.</p>

            <Button
                type="button"
                onClick={signInWithGoogle}
                disabled={submitting}
                className="mt-8 min-h-12 w-full gap-3 bg-graphite px-5 font-semibold text-paper-raised hover:bg-ink"
            >
                <GoogleMark />
                {submitting ? "Opening Google…" : "Continue with Google"}
            </Button>
            {error ? <p role="alert" className="mt-2 text-sm font-medium text-coral">{error}</p> : null}
        </section>
    );
}
