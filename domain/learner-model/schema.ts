import { z } from "zod";

export const LearnerModelSchema = z.object({
    masteryByObjective: z.record(z.string(), z.number()),
    activeMisconceptions: z.array(z.string()),
    confidence: z.number(),
    turnCount: z.number().int().min(0),
    focusObjective: z.string().nullable(),
    scaffoldRung: z.number().int().min(0).max(3),
    consecutiveStuck: z.number().int().min(0),
    answerRevealed: z.array(z.string()),
    turnsOnObjective: z.number().int().min(0),
    lessonComplete: z.boolean(),
    explanationDepth: z.enum(["foundational", "guided", "concise"]),
});
