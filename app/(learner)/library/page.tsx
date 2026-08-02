import type { Metadata } from "next";
import { TopicLibrary } from "@/features/library/topic-library.tsx";

export const metadata: Metadata = { title: "Learning library" };

export default function LibraryPage() {
    return <TopicLibrary />;
}
