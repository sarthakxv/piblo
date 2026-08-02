"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TOPICS } from "@/content/topics.ts";
import { useLearnerProfile } from "@/features/learner-profile/use-learner-profile.ts";
import { TopicPicker } from "./topic-picker.tsx";
import { LearningPath } from "./learning-path.tsx";

export function TopicLibrary() {
    const router = useRouter();
    const { profile, loaded, storageWarning } = useLearnerProfile();
    const [selectedTopicId, setSelectedTopicId] = useState(TOPICS[0].id);
    const [expandedLevelId, setExpandedLevelId] = useState<string | null>(null);

    useEffect(() => {
        if (loaded && !profile) router.replace("/");
    }, [loaded, profile, router]);

    if (!loaded || !profile) return <main className="min-h-dvh" aria-busy="true" />;

    const selectedTopic = TOPICS.find((topic) => topic.id === selectedTopicId) ?? TOPICS[0];
    const firstName = profile.name.split(/\s+/)[0];

    return (
        <main className="min-h-dvh px-5 py-6 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-6xl">
                <header className="flex items-center justify-between gap-4 border-b border-rule pb-5">
                    <div>
                        <Link href="/library" className="font-notebook text-2xl font-bold text-graphite">Piblo</Link>
                        <p className="text-xs text-graphite-muted">A learning space that thinks with you</p>
                    </div>
                    <Link href="/profile" className="rounded-lg border border-rule bg-paper-raised px-3 py-2 text-xs font-semibold text-graphite-soft transition-colors duration-150 hover:border-rule-strong hover:text-graphite">{firstName}&apos;s profile</Link>
                </header>

                <section className="py-8 sm:py-12 lg:py-16" aria-labelledby="library-title">
                    <div className="mb-7 sm:mb-9">
                        <p className="text-sm font-bold text-ink">Welcome, {firstName}</p>
                        <h1 id="library-title" className="mt-2 max-w-3xl text-balance font-notebook text-3xl font-bold leading-tight text-graphite sm:text-4xl">Choose a topic, then follow the idea as far as you want.</h1>
                    </div>

                    {storageWarning ? <div role="status" className="mb-4 rounded-lg border border-amber-ink/25 bg-amber-note px-4 py-3 text-sm leading-6 text-graphite">You can continue, but this browser won&apos;t remember your details.</div> : null}

                    <div className="overflow-hidden rounded-xl border border-rule bg-paper-raised lg:grid lg:min-h-[36rem] lg:grid-cols-[20rem_minmax(0,1fr)]">
                        <TopicPicker selectedTopic={selectedTopic} onSelectTopic={(topicId) => { setSelectedTopicId(topicId); setExpandedLevelId(null); }} />
                        <LearningPath topic={selectedTopic} expandedLevelId={expandedLevelId} onToggleLevel={(levelId) => setExpandedLevelId((current) => current === levelId ? null : levelId)} />
                    </div>
                </section>
            </div>
        </main>
    );
}
