import {
    LearnerProfileSchema,
    PROFILE_PRESENT_COOKIE,
    PROFILE_STORAGE_KEY,
    type LearnerProfile,
} from "./profile-schema.ts";

function writeProfilePresentCookie(present: boolean): void {
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = present
        ? `${PROFILE_PRESENT_COOKIE}=1; path=/; max-age=31536000; SameSite=Lax${secure}`
        : `${PROFILE_PRESENT_COOKIE}=; path=/; max-age=0; SameSite=Lax${secure}`;
}

export function syncProfilePresentCookie(present: boolean): void {
    try {
        writeProfilePresentCookie(present);
    } catch {
        // Cookie sync is best-effort; localStorage remains the source of truth.
    }
}

export function readLearnerProfile(): LearnerProfile | null {
    try {
        const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
        return raw ? LearnerProfileSchema.parse(JSON.parse(raw)) : null;
    } catch {
        return null;
    }
}

export function storeLearnerProfile(profile: LearnerProfile): boolean {
    try {
        window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
        syncProfilePresentCookie(true);
        return true;
    } catch {
        return false;
    }
}

export function clearLearnerProfile(): void {
    try {
        window.localStorage.removeItem(PROFILE_STORAGE_KEY);
    } catch {
        // The in-memory view still resets when browser storage is unavailable.
    }
    syncProfilePresentCookie(false);
}
