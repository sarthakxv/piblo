"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client.ts";
import { fetchLearnerProfile, upsertLearnerProfile } from "./profile-queries.ts";
import type { LearnerProfile, LearnerProfileInput } from "./profile-schema.ts";

export function useLearnerProfile() {
    const [profile, setProfile] = useState<LearnerProfile | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const supabase = createClient();
        let active = true;

        void (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            const next = user ? await fetchLearnerProfile(supabase, user.id) : null;
            if (!active) return;
            setProfile(next);
            setLoaded(true);
        })();

        return () => {
            active = false;
        };
    }, []);

    const saveProfile = useCallback(async (input: LearnerProfileInput): Promise<LearnerProfile | null> => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const next = await upsertLearnerProfile(supabase, user, input);
        if (next) setProfile(next);
        return next;
    }, []);

    return {
        profile,
        loaded,
        saveProfile,
    };
}
