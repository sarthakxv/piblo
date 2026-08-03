import type { LessonAnswers } from "./types.ts";

export function canSubmitMove(phaseIndex: number, answers: LessonAnswers): boolean {
    switch (phaseIndex) {
        case 0:
            return Boolean(
                answers.prediction &&
                    (answers.prediction !== "Something else" || answers.predictionOther.trim()) &&
                    answers.confidence,
            );
        case 1:
            return Boolean(answers.observation);
        case 2:
            return Boolean(
                answers.explanation.trim() &&
                    ["carbon dioxide", "water", "light"].every(
                        (item) => answers.relationships[item],
                    ),
            );
        case 3:
            return Object.values(answers.generalization).every((value) => value.trim());
        case 4:
            return Boolean(answers.application && answers.applicationReason.trim());
        case 5:
            return Boolean(answers.reflection.trim() && answers.reflectionEvidence.trim());
        default:
            return false;
    }
}
