import {
    LearnerProfileSchema,
    PROFILE_STORAGE_KEY,
    type LearnerProfile,
} from "./profile-schema.ts";

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
}
