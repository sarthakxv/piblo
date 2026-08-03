import type { Concept } from "./types.ts";
import { PHOTOSYNTHESIS } from "./photosynthesis.ts";

const CONCEPTS: Record<string, Concept> = {
    [PHOTOSYNTHESIS.id]: PHOTOSYNTHESIS,
};

export function findConcept(topicId: string): Concept | undefined {
    return CONCEPTS[topicId];
}
