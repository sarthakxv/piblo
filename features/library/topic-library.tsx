"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-header.tsx";
import { TOPICS } from "@/content/topics.ts";
import { useLearnerProfile } from "@/features/learner-profile/use-learner-profile.ts";
import { TopicPicker } from "./topic-picker.tsx";
import { LearningPath } from "./learning-path.tsx";

export function TopicLibrary() {
    const { profile, loaded } = useLearnerProfile();
    const [selectedTopicId, setSelectedTopicId] = useState(TOPICS[0].id);

    if (!loaded || !profile) return <main className="min-h-dvh" aria-busy="true" />;

    const selectedTopic = TOPICS.find((topic) => topic.id === selectedTopicId) ?? TOPICS[0];
    const firstName = profile.name.split(/\s+/)[0];

    return (
        <main className="min-h-dvh px-5 py-6 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-6xl">
                <AppHeader learnerName={profile.name} email={profile.email} avatarUrl={profile.avatarUrl} />

                <section className="py-8 sm:py-12 lg:py-16" aria-labelledby="library-title">
                    <div className="mb-7 sm:mb-9">
                        <p className="text-sm font-bold text-ink">Welcome, {firstName}</p>
                        <h1 id="library-title" className="mt-2 max-w-3xl text-balance font-notebook text-3xl font-bold leading-tight text-graphite sm:text-4xl">Choose a topic, then follow the idea as far as you want.</h1>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-rule bg-paper-raised lg:grid lg:min-h-[36rem] lg:grid-cols-[20rem_minmax(0,1fr)]">
                        <TopicPicker selectedTopic={selectedTopic} onSelectTopic={setSelectedTopicId} />
                        <LearningPath topic={selectedTopic} />
                    </div>
                </section>
            </div>
        </main>
    );
}
