import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server.ts";

export default async function LearnerLayout({ children }: Readonly<{ children: ReactNode }>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/");

    const { data: profileRow } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
    if (!profileRow) redirect("/onboarding");

    return children;
}
