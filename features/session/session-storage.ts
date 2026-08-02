import { SessionSchema, type Session } from "./session-schema.ts";

const SESSION_STORAGE_PREFIX = "piblo-session-v1:";

const storageKey = (lessonId: string) => `${SESSION_STORAGE_PREFIX}${lessonId}`;

export function readSession(lessonId: string): Session | null {
    try {
        const raw = window.localStorage.getItem(storageKey(lessonId));
        return raw ? SessionSchema.parse(JSON.parse(raw)) : null;
    } catch {
        return null;
    }
}

export function storeSession(session: Session): boolean {
    try {
        window.localStorage.setItem(storageKey(session.lessonId), JSON.stringify(session));
        return true;
    } catch {
        return false;
    }
}

export function clearSession(lessonId: string): void {
    try {
        window.localStorage.removeItem(storageKey(lessonId));
    } catch {
        // A fresh in-memory session is still available when storage is unavailable.
    }
}
