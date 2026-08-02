import type { Metadata } from "next";
import { ProfileView } from "@/features/learner-profile/profile-view.tsx";

export const metadata: Metadata = { title: "Learner profile" };

export default function ProfilePage() {
    return <ProfileView />;
}
