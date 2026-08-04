import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server.ts";
import { fetchLearnerProfile } from "@/features/learner-profile/profile-queries.ts";
import { OnboardingForm } from "@/features/onboarding/onboarding-form.tsx";

export const metadata: Metadata = { title: "Welcome" };

export default async function OnboardingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/");

    const profile = await fetchLearnerProfile(supabase, user.id);
    if (profile) redirect("/library");

    const googleName = user.user_metadata?.full_name;
    return (
        <OnboardingForm
            initialName={typeof googleName === "string" ? googleName : ""}
            email={user.email ?? null}
        />
    );
}
