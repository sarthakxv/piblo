import type { TopicSession } from "../session/session-schema.ts";

export type LevelProgress = "not-started" | "in-progress" | "complete";

export function getLevelProgress(session: TopicSession | null): LevelProgress {
    if (!session) return "not-started";
    return session.learnerModel?.lessonComplete ? "complete" : "in-progress";
}

export function getLearningLevelHref(
    topicId: string,
    levelId: string,
    progress: LevelProgress,
): string {
    const path = `/learn/${topicId}/${levelId}`;
    return progress === "complete" ? `${path}?recap=1` : path;
}
