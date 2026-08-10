import type { Concept } from "../../content/concepts/types.ts";
import { MASTERY_THRESHOLD, type LearnerModel } from "./types.ts";

// Choose the next objective in curriculum order below the mastery threshold,
// preferring one not already answer-revealed. Null when all are mastered.
export function pickNextFocus(
    mastery: Record<string, number>,
    concept: Concept,
    revealed: string[],
): string | null {
    const revealedSet = new Set(revealed);
    const below = concept.objectives.filter(
        (objective) => (mastery[objective.id] ?? 0) < MASTERY_THRESHOLD,
    );
    if (below.length === 0) return null;
    const fresh = below.filter((objective) => !revealedSet.has(objective.id));
    return (fresh[0] ?? below[0]).id;
}

export function reconcileLearnerModelFocus(
    model: LearnerModel,
    concept: Concept,
): LearnerModel {
    const focusObjective = pickNextFocus(
        model.masteryByObjective,
        concept,
        model.answerRevealed,
    );
    const lessonComplete = focusObjective === null;
    const focusChanged = focusObjective !== model.focusObjective;

    if (!focusChanged && lessonComplete === model.lessonComplete) return model;

    return {
        ...model,
        focusObjective,
        lessonComplete,
        scaffoldRung: focusChanged ? 0 : model.scaffoldRung,
        consecutiveStuck: focusChanged ? 0 : model.consecutiveStuck,
        turnsOnObjective: focusChanged ? 0 : model.turnsOnObjective,
    };
}
