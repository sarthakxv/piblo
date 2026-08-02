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

export function buildTrailSummaries(answers: LessonAnswers): Array<string | undefined> {
    return [
        answers.prediction
            ? `You chose ${answers.prediction === "Something else" ? answers.predictionOther : answers.prediction.toLowerCase()}.`
            : undefined,
        answers.observation
            ? answers.observation === "The soil loss is too small"
                ? "The soil loss was too small to explain the plant's growth."
                : "You captured an observation to test against the evidence."
            : undefined,
        answers.explanation.trim()
            ? "You connected matter from air and water with energy from light."
            : undefined,
        answers.generalization.output.trim()
            ? `Your rule produces ${answers.generalization.output}.`
            : undefined,
        answers.application
            ? "You tested the rule on a plant kept in darkness."
            : undefined,
        answers.reflection.trim() ? "You explained how your thinking changed." : undefined,
    ];
}
