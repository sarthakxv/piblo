"use client";

import { useCallback, useEffect, useState } from "react";
import type { LearnerProfile } from "./profile-schema.ts";
import {
    clearLearnerProfile,
    readLearnerProfile,
    storeLearnerProfile,
    syncProfilePresentCookie,
} from "./profile-storage.ts";

export function useLearnerProfile() {
    const [profile, setProfile] = useState<LearnerProfile | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [storageWarning, setStorageWarning] = useState(false);

    useEffect(() => {
        const next = readLearnerProfile();
        setProfile(next);
        syncProfilePresentCookie(Boolean(next));
        setLoaded(true);
    }, []);

    const saveProfile = useCallback((nextProfile: LearnerProfile) => {
        const stored = storeLearnerProfile(nextProfile);
        setProfile(nextProfile);
        setStorageWarning(!stored);
        return stored;
    }, []);

    const resetProfile = useCallback(() => {
        clearLearnerProfile();
        setProfile(null);
        setStorageWarning(false);
    }, []);

    return {
        profile,
        loaded,
        storageWarning,
        saveProfile,
        resetProfile,
    };
}
