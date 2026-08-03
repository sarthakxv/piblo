"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogClose,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PHOTOSYNTHESIS } from "@/content/concepts/photosynthesis.ts";
import { MASTERY_THRESHOLD } from "@/domain/learner-model/types.ts";
import { clearAllTopicSessions, readTopicSession } from "@/features/session/session-storage.ts";
import type { TopicSession } from "@/features/session/session-schema.ts";
import { useLearnerProfile } from "./use-learner-profile.ts";

const BIRTH_DATE_FORMAT = new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" });

function formatBirthDate(dateOfBirth: string) {
    return BIRTH_DATE_FORMAT.format(new Date(`${dateOfBirth}T00:00:00Z`));
}

export function ProfileView() {
    const router = useRouter();
    const { profile, loaded, resetProfile } = useLearnerProfile();
    const [session, setSession] = useState<TopicSession | null>(null);

    useEffect(() => {
        if (loaded && !profile) {
            router.replace("/");
            return;
        }
        if (loaded) setSession(readTopicSession("photosynthesis", "recommended"));
    }, [loaded, profile, router]);

    if (!loaded || !profile) return <main className="min-h-dvh" aria-busy="true" />;

    const completedMilestones = session?.learnerModel
        ? PHOTOSYNTHESIS.objectives.filter(
            (objective) => (
                session.learnerModel?.masteryByObjective[objective.id] ?? 0
            ) >= MASTERY_THRESHOLD,
        ).length
        : 0;
    const stageLabel = {
        overview: "Ready to begin",
        diagnostic: "Getting to know your starting point",
        analyzing: "Analyzing your starting point",
        chat: "Learning with Piblo",
        reflection: "Reflecting on your understanding",
        complete: "Topic complete",
    }[session?.stage ?? "overview"];

    const clearLocalData = () => {
        clearAllTopicSessions();
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
                    <Button nativeButton={false} render={<Link href="/library" />} variant="outline" className="border-rule-strong bg-paper-raised">
                        Back to library
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
                                    <p className="mt-4 font-notebook text-2xl font-bold text-graphite">{stageLabel}</p>
                                    <p className="mt-2 text-sm leading-6 text-graphite-soft">{completedMilestones} of {PHOTOSYNTHESIS.objectives.length} understanding milestones completed.</p>
                                    <Button nativeButton={false} render={<Link href="/learn/photosynthesis/recommended" />} className="mt-5 bg-graphite text-paper-raised">
                                        {session.stage === "complete" ? "Review topic" : "Resume topic"}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <p className="mt-4 font-notebook text-2xl font-bold text-graphite">Not started</p>
                                    <p className="mt-2 text-sm leading-6 text-graphite-soft">See the five milestones, then show Piblo what you already understand.</p>
                                    <Button nativeButton={false} render={<Link href="/learn/photosynthesis/recommended" />} className="mt-5 bg-graphite text-paper-raised">Start topic</Button>
                                </>
                            )}
                        </article>
                    </div>

                    <section className="mt-8 border-t border-rule pt-8" aria-labelledby="local-data-title">
                        <h2 id="local-data-title" className="font-notebook text-2xl font-bold text-graphite">Local data controls</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-graphite-soft">Clearing your local data removes this profile and all saved topic progress from this browser.</p>
                        <AlertDialog>
                            <AlertDialogTrigger render={<Button type="button" variant="outline" className="mt-5 border-coral/50 text-coral" />}>
                                Clear local data
                            </AlertDialogTrigger>
                            <AlertDialogContent className="border border-rule bg-paper-raised">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="font-notebook text-2xl font-bold text-graphite">Clear this learner&apos;s data?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-graphite-soft">This removes the profile and all saved topic progress from this browser. It cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogClose render={<Button variant="outline" className="border-rule-strong" />}>Keep data</AlertDialogClose>
                                    <Button type="button" onClick={clearLocalData} className="bg-coral text-white hover:bg-coral/85">Clear data</Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </section>
                </section>
            </div>
        </main>
    );
}
