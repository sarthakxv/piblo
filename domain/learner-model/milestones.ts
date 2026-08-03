import type { Concept } from "../../content/concepts/types.ts";
import { MASTERY_THRESHOLD, type LearnerModel } from "./types.ts";

export type MilestoneStatus = "already-understood" | "complete" | "current" | "upcoming";

export interface MilestoneState {
    id: string;
    title: string;
    shortTitle: string;
    takeaway: string;
    status: MilestoneStatus;
}

export function deriveMilestoneStates(
    concept: Concept,
    learnerModel: LearnerModel | null,
    initialMasteryByObjective: Record<string, number>,
): MilestoneState[] {
    return concept.objectives.map((objective) => {
        const mastery = learnerModel?.masteryByObjective[objective.id] ?? 0;
        const initiallyMastered = (
            initialMasteryByObjective[objective.id] ?? 0
        ) >= MASTERY_THRESHOLD;
        let status: MilestoneStatus = "upcoming";

        if (mastery >= MASTERY_THRESHOLD) {
            status = initiallyMastered ? "already-understood" : "complete";
        } else if (learnerModel?.focusObjective === objective.id) {
            status = "current";
        }

        return {
            id: objective.id,
            title: objective.title,
            shortTitle: objective.shortTitle,
            takeaway: objective.takeaway,
            status,
        };
    });
}
