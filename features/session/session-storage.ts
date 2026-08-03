import { TopicSessionSchema, type TopicSession } from "./session-schema.ts";

const TOPIC_SESSION_PREFIX = "piblo-topic-session-v2:";
const LEGACY_SESSION_PREFIX = "piblo-session-v1:";

const storageKey = (topicId: string, levelId: string) => (
    `${TOPIC_SESSION_PREFIX}${topicId}:${levelId}`
);

export function readTopicSession(topicId: string, levelId: string): TopicSession | null {
    try {
        const raw = window.localStorage.getItem(storageKey(topicId, levelId));
        return raw ? TopicSessionSchema.parse(JSON.parse(raw)) : null;
    } catch {
        return null;
    }
}

export function storeTopicSession(session: TopicSession): boolean {
    try {
        window.localStorage.setItem(
            storageKey(session.topicId, session.levelId),
            JSON.stringify(session),
        );
        return true;
    } catch {
        return false;
    }
}

export function clearTopicSession(topicId: string, levelId: string): void {
    try {
        window.localStorage.removeItem(storageKey(topicId, levelId));
    } catch {
        // The current in-memory session can still reset when storage is unavailable.
    }
}

export function clearAllTopicSessions(): void {
    try {
        const keys = Array.from(
            { length: window.localStorage.length },
            (_, index) => window.localStorage.key(index),
        ).filter((key): key is string => Boolean(
            key?.startsWith(TOPIC_SESSION_PREFIX) || key?.startsWith(LEGACY_SESSION_PREFIX),
        ));
        for (const key of keys) window.localStorage.removeItem(key);
    } catch {
        // The profile still resets even if browser storage is unavailable.
    }
}
