import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
    LearnerProfileInputSchema,
    type LearnerProfile,
    type LearnerProfileInput,
} from "./profile-schema.ts";

const PROFILE_COLUMNS = "id, name, date_of_birth, email, avatar_url";

interface ProfileRow {
    id: string;
    name: string;
    date_of_birth: string;
    email: string | null;
    avatar_url: string | null;
}

function rowToProfile(row: ProfileRow): LearnerProfile | null {
    const parsed = LearnerProfileInputSchema.safeParse({
        name: row.name,
        dateOfBirth: row.date_of_birth,
    });
    if (!parsed.success) return null;

    return {
        ...parsed.data,
        id: row.id,
        email: row.email,
        avatarUrl: row.avatar_url,
    };
}

export async function fetchLearnerProfile(
    supabase: SupabaseClient,
    userId: string,
): Promise<LearnerProfile | null> {
    const { data, error } = await supabase
        .from("profiles")
        .select(PROFILE_COLUMNS)
        .eq("id", userId)
        .maybeSingle();

    if (error || !data) return null;
    return rowToProfile(data as ProfileRow);
}

export async function upsertLearnerProfile(
    supabase: SupabaseClient,
    user: User,
    input: LearnerProfileInput,
): Promise<LearnerProfile | null> {
    const avatarUrl = user.user_metadata?.avatar_url;
    const { data, error } = await supabase
        .from("profiles")
        .upsert({
            id: user.id,
            name: input.name,
            date_of_birth: input.dateOfBirth,
            email: user.email ?? null,
            avatar_url: typeof avatarUrl === "string" ? avatarUrl : null,
        })
        .select(PROFILE_COLUMNS)
        .single();

    if (error || !data) return null;
    return rowToProfile(data as ProfileRow);
}
