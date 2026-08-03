import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findConcept } from "@/content/concepts/index.ts";
import { findLevel, findTopic, type LearningLevelId } from "@/content/topics.ts";
import { TopicLearningWorkspace } from "@/features/learning/topic-learning-workspace.tsx";

interface LearningPageProps {
    params: Promise<{ topicId: string; levelId: string }>;
}

export async function generateMetadata({ params }: LearningPageProps): Promise<Metadata> {
    const { topicId } = await params;
    const topic = findTopic(topicId);
    return { title: topic ? `${topic.name} · Piblo` : "Learning path" };
}

export default async function LearningPage({ params }: LearningPageProps) {
    const { topicId, levelId } = await params;
    const concept = findConcept(topicId);
    const level = findLevel(topicId, levelId);
    if (!concept || !level?.available) notFound();

    return (
        <TopicLearningWorkspace
            key={`${topicId}:${levelId}`}
            concept={concept}
            levelId={levelId as LearningLevelId}
        />
    );
}
