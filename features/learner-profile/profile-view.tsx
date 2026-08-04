"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut } from "lucide-react";
import { AppHeader } from "@/components/app-header.tsx";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { createClient } from "@/lib/supabase/client.ts";
import { useLearnerProfile } from "./use-learner-profile.ts";

const BIRTH_DATE_FORMAT = new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" });

function formatBirthDate(dateOfBirth: string) {
    return BIRTH_DATE_FORMAT.format(new Date(`${dateOfBirth}T00:00:00Z`));
}

export function ProfileView() {
    const router = useRouter();
    const { profile, loaded } = useLearnerProfile();
    const [session, setSession] = useState<TopicSession | null>(null);
    const [sessionLoaded, setSessionLoaded] = useState(false);

    useEffect(() => {
        if (loaded) {
            setSession(readTopicSession("photosynthesis", "recommended"));
            setSessionLoaded(true);
        }
    }, [loaded]);

    if (!loaded || !profile) return <main className="min-h-dvh" aria-busy="true" />;

    const topicPassed = session?.learnerModel?.lessonComplete === true;
    const completedMilestones = topicPassed
        ? PHOTOSYNTHESIS.objectives.length
        : session?.learnerModel
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
        complete: "Topic complete",
    }[session?.stage ?? "overview"];
    const visibleStageLabel = topicPassed ? "Topic complete" : stageLabel;

    const clearLocalData = () => {
        clearAllTopicSessions();
        setSession(null);
    };

    const signOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.replace("/");
        router.refresh();
    };

    const initial = profile.name.trim().charAt(0).toUpperCase();

    return (
        <main className="min-h-dvh px-5 py-6 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-5xl">
                <AppHeader learnerName={profile.name} email={profile.email} avatarUrl={profile.avatarUrl} />

                <section className="py-10 sm:py-14">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/library"
                            aria-label="Back to library"
                            className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-rule bg-paper-raised text-graphite-soft transition-colors duration-150 hover:border-rule-strong hover:text-graphite"
                        >
                            <ArrowLeft aria-hidden="true" className="size-4" />
                        </Link>
                        <div>
                            <p className="text-sm font-bold text-ink">Your learning record</p>
                            <h1 className="mt-1 font-notebook text-4xl font-bold text-graphite">{profile.name}</h1>
                            <p className="mt-2 text-sm text-graphite-soft">Saved to your account, so it follows you across devices.</p>
                        </div>
                    </div>

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
                            {sessionLoaded && session ? (
                                <>
                                    <p className="mt-4 font-notebook text-2xl font-bold text-graphite">{visibleStageLabel}</p>
                                    <p className="mt-2 text-sm leading-6 text-graphite-soft">{completedMilestones} of {PHOTOSYNTHESIS.objectives.length} understanding milestones completed.</p>
                                    <Button nativeButton={false} render={<Link href="/learn/photosynthesis/recommended" />} className="mt-5 bg-graphite text-paper-raised">
                                        {topicPassed ? "Review topic" : "Resume topic"}
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

                        <article className="rounded-xl border border-rule bg-paper-raised p-6">
                            <p className="text-xs font-bold uppercase tracking-wide text-graphite-muted">Account</p>
                            <div className="mt-5 flex items-center gap-3">
                                <Avatar className="size-10 after:border-rule">
                                    {profile.avatarUrl ? <AvatarImage src={profile.avatarUrl} alt="" /> : null}
                                    <AvatarFallback className="bg-ink text-sm font-bold text-paper-raised">{initial}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-graphite">{profile.name}</p>
                                    {profile.email ? <p className="truncate text-xs text-graphite-muted">{profile.email}</p> : null}
                                </div>
                            </div>
                            <p className="mt-4 text-sm leading-6 text-graphite-soft">Signed in with Google. Your learner details live in your Piblo account.</p>
                            <Button type="button" variant="outline" onClick={signOut} className="mt-5 border-rule-strong text-graphite">
                                <LogOut aria-hidden="true" className="size-4" />
                                Sign out
                            </Button>
                        </article>

                        <article className="rounded-xl border border-rule bg-paper-raised p-6">
                            <p className="text-xs font-bold uppercase tracking-wide text-graphite-muted">Local data controls</p>
                            <p className="mt-4 text-sm leading-6 text-graphite-soft">Topic progress is still kept only in this browser for now. Clearing it does not affect your account profile.</p>
                            <AlertDialog>
                                <AlertDialogTrigger render={<Button type="button" variant="outline" className="mt-5 border-coral/50 text-coral" />}>
                                    Clear local progress
                                </AlertDialogTrigger>
                                <AlertDialogContent className="border border-rule bg-paper-raised">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="font-notebook text-2xl font-bold text-graphite">Clear saved topic progress?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-graphite-soft">This removes all topic progress stored in this browser. Your account profile is not affected. It cannot be undone.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogClose render={<Button variant="outline" className="border-rule-strong" />}>Keep data</AlertDialogClose>
                                        <AlertDialogClose render={<Button type="button" onClick={clearLocalData} className="bg-coral text-white hover:bg-coral/85" />}>Clear progress</AlertDialogClose>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </article>
                    </div>
                </section>
            </div>
        </main>
    );
}
