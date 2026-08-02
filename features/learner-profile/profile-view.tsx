"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { PHASES } from "@/domain/lesson/types.ts";
import { clearSession, readSession } from "@/features/session/session-storage.ts";
import type { Session } from "@/features/session/session-schema.ts";
import { useLearnerProfile } from "./use-learner-profile.ts";

function formatBirthDate(dateOfBirth: string) {
    return new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(
        new Date(`${dateOfBirth}T00:00:00Z`),
    );
}

export function ProfileView() {
    const router = useRouter();
    const { profile, loaded, resetProfile } = useLearnerProfile();
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        if (loaded && !profile) {
            router.replace("/");
            return;
        }
        if (loaded) setSession(readSession("plant-mass"));
    }, [loaded, profile, router]);

    if (!loaded || !profile) return <main className="min-h-dvh" aria-busy="true" />;

    const phase = session ? PHASES[session.phaseIndex] : null;
    const completedArtifacts = session
        ? session.complete ? PHASES.length : session.phaseIndex
        : 0;

    const clearLocalData = () => {
        clearSession("plant-mass");
        resetProfile();
        router.replace("/");
    };

    return (
        <main className="min-h-dvh px-5 py-6 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-5xl">
                <header className="flex items-center justify-between gap-4 border-b border-rule pb-5">
                    <div>
                        <Link href="/library" className="font-notebook text-2xl font-bold text-graphite">Piblo</Link>
                        <p className="text-xs text-graphite-muted">Learner profile</p>
                    </div>
                    <Button asChild variant="outline" className="border-rule-strong bg-paper-raised">
                        <Link href="/library">Back to library</Link>
                    </Button>
                </header>

                <section className="py-10 sm:py-14">
                    <p className="text-sm font-bold text-ink">Your learning record</p>
                    <h1 className="mt-2 font-notebook text-4xl font-bold text-graphite">{profile.name}</h1>
                    <p className="mt-3 text-sm text-graphite-soft">This information is stored only in this browser.</p>

                    <div className="mt-9 grid gap-5 md:grid-cols-2">
                        <article className="rounded-xl border border-rule bg-paper-raised p-6">
                            <p className="text-xs font-bold uppercase tracking-wide text-graphite-muted">Learner details</p>
                            <dl className="mt-5 grid gap-4">
                                <div>
                                    <dt className="text-xs text-graphite-muted">Name</dt>
                                    <dd className="mt-1 font-semibold text-graphite">{profile.name}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-graphite-muted">Date of birth</dt>
                                    <dd className="mt-1 font-semibold text-graphite">{formatBirthDate(profile.dateOfBirth)}</dd>
                                </div>
                            </dl>
                        </article>

                        <article className="rounded-xl border border-rule bg-paper-raised p-6">
                            <p className="text-xs font-bold uppercase tracking-wide text-graphite-muted">Photosynthesis</p>
                            {session ? (
                                <>
                                    <p className="mt-4 font-notebook text-2xl font-bold text-graphite">{session.complete ? "Lesson complete" : phase?.learnerLabel}</p>
                                    <p className="mt-2 text-sm leading-6 text-graphite-soft">{completedArtifacts} of {PHASES.length} Thinking Trail artifacts completed.</p>
                                    <Button asChild className="mt-5 bg-graphite text-paper-raised">
                                        <Link href="/learn/plant-mass">{session.complete ? "Review lesson" : "Resume lesson"}</Link>
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <p className="mt-4 font-notebook text-2xl font-bold text-graphite">Not started</p>
                                    <p className="mt-2 text-sm leading-6 text-graphite-soft">Begin with a prediction about where a plant&apos;s mass comes from.</p>
                                    <Button asChild className="mt-5 bg-graphite text-paper-raised"><Link href="/learn/plant-mass">Start lesson</Link></Button>
                                </>
                            )}
                        </article>
                    </div>

                    <section className="mt-8 border-t border-rule pt-8" aria-labelledby="local-data-title">
                        <h2 id="local-data-title" className="font-notebook text-2xl font-bold text-graphite">Local data controls</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-graphite-soft">Clearing your local data removes this profile and the saved Photosynthesis lesson from this browser.</p>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button type="button" variant="outline" className="mt-5 border-coral/50 text-coral">Clear local data</Button>
                            </DialogTrigger>
                            <DialogContent className="border border-rule bg-paper-raised">
                                <DialogHeader>
                                    <DialogTitle className="font-notebook text-2xl font-bold text-graphite">Clear this learner&apos;s data?</DialogTitle>
                                    <DialogDescription className="text-graphite-soft">This removes the profile and saved lesson progress from this browser. It cannot be undone.</DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <DialogClose asChild><Button variant="outline" className="border-rule-strong">Keep data</Button></DialogClose>
                                    <Button type="button" onClick={clearLocalData} className="bg-coral text-white hover:bg-coral/85">Clear data</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </section>
                </section>
            </div>
        </main>
    );
}
