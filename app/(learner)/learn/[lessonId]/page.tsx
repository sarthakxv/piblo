import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findLesson } from "@/content/topics.ts";
import { LessonWorkspace } from "@/features/lesson/lesson-workspace.tsx";

export async function generateMetadata({ params }: { params: Promise<{ lessonId: string }> }): Promise<Metadata> {
    const { lessonId } = await params;
    const lesson = findLesson(lessonId);
    return { title: lesson?.title ?? "Lesson" };
}

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
    const { lessonId } = await params;
    const lesson = findLesson(lessonId);
    if (!lesson?.available) notFound();

    return <LessonWorkspace lessonId={lessonId} />;
}
