import type { LessonAnswers } from "@/domain/lesson/types.ts";

export interface LearningMoveProps {
    answers: LessonAnswers;
    updateAnswers: (update: Partial<LessonAnswers>) => void;
}
