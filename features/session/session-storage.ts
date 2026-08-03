import {
    migrateTopicSessionV2,
    TopicSessionSchema,
    type TopicSession,
} from "./session-schema.ts";

const TOPIC_SESSION_PREFIX = "piblo-topic-session-v3:";
const V2_SESSION_PREFIX = "piblo-topic-session-v2:";
const LEGACY_SESSION_PREFIX = "piblo-session-v1:";

const storageKey = (prefix: string, topicId: string, levelId: string) => (
    `${prefix}${topicId}:${levelId}`
);

export function readTopicSession(topicId: string, levelId: string): TopicSession | null {
    try {
        const current = window.localStorage.getItem(
            storageKey(TOPIC_SESSION_PREFIX, topicId, levelId),
        );
        if (current) return TopicSessionSchema.parse(JSON.parse(current));

        const legacy = window.localStorage.getItem(
            storageKey(V2_SESSION_PREFIX, topicId, levelId),
        );
        if (!legacy) return null;

        const migrated = migrateTopicSessionV2(JSON.parse(legacy));
        storeTopicSession(migrated);
        return migrated;
    } catch {
        return null;
    }
}

export function storeTopicSession(session: TopicSession): boolean {
    try {
        window.localStorage.setItem(
            storageKey(TOPIC_SESSION_PREFIX, session.topicId, session.levelId),
            JSON.stringify(session),
        );
        return true;
    } catch {
        return false;
    }
}

export function clearTopicSession(topicId: string, levelId: string): void {
    try {
        window.localStorage.removeItem(
            storageKey(TOPIC_SESSION_PREFIX, topicId, levelId),
        );
        window.localStorage.removeItem(
            storageKey(V2_SESSION_PREFIX, topicId, levelId),
        );
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
            key?.startsWith(TOPIC_SESSION_PREFIX)
            || key?.startsWith(V2_SESSION_PREFIX)
            || key?.startsWith(LEGACY_SESSION_PREFIX),
        ));
        for (const key of keys) window.localStorage.removeItem(key);
    } catch {
        // The profile still resets even if browser storage is unavailable.
    }
}
