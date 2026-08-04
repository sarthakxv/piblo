"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header.tsx";
import { TOPICS } from "@/content/topics.ts";
import type { LearnerProfile } from "@/features/learner-profile/profile-schema.ts";
import { useLearnerProfile } from "@/features/learner-profile/use-learner-profile.ts";
import { TopicPicker } from "./topic-picker.tsx";
import { LearningPath } from "./learning-path.tsx";

type TopicLibraryProps = {
    initialProfile?: LearnerProfile;
};

export function TopicLibrary({ initialProfile }: TopicLibraryProps = {}) {
    const router = useRouter();
    const { profile: storedProfile, loaded, storageWarning } = useLearnerProfile();
    const [selectedTopicId, setSelectedTopicId] = useState(TOPICS[0].id);
    const profile = storedProfile ?? initialProfile ?? null;
    const profileLoaded = loaded || Boolean(initialProfile);

    useEffect(() => {
        if (profileLoaded && !profile) router.replace("/");
    }, [profileLoaded, profile, router]);

    if (!profileLoaded || !profile) return <main className="min-h-dvh" aria-busy="true" />;

    const selectedTopic = TOPICS.find((topic) => topic.id === selectedTopicId) ?? TOPICS[0];
    const firstName = profile.name.split(/\s+/)[0];

    return (
        <main className="min-h-dvh px-5 py-6 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-6xl">
                <AppHeader learnerName={profile.name} />

                <section className="py-8 sm:py-12 lg:py-16" aria-labelledby="library-title">
                    <div className="mb-7 sm:mb-9">
                        <p className="text-sm font-bold text-ink">Welcome, {firstName}</p>
                        <h1 id="library-title" className="mt-2 max-w-3xl text-balance font-notebook text-3xl font-bold leading-tight text-graphite sm:text-4xl">Choose a topic, then follow the idea as far as you want.</h1>
                    </div>

                    {storageWarning ? <div role="status" className="mb-4 rounded-lg border border-amber-ink/25 bg-amber-note px-4 py-3 text-sm leading-6 text-graphite">You can continue, but this browser won&apos;t remember your details.</div> : null}

                    <div className="overflow-hidden rounded-xl border border-rule bg-paper-raised lg:grid lg:min-h-[36rem] lg:grid-cols-[20rem_minmax(0,1fr)]">
                        <TopicPicker selectedTopic={selectedTopic} onSelectTopic={setSelectedTopicId} />
                        <LearningPath topic={selectedTopic} />
                    </div>
                </section>
            </div>
        </main>
    );
}
