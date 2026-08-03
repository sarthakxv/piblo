import { z } from "zod";
import { LearnerModelSchema } from "../learner-model/schema.ts";

export const DiagnosticModelAnalysisSchema = z.object({
    masteryByObjective: z.record(z.string(), z.number()).optional(),
    milestones: z.record(z.string(), z.number()).optional(),
    detectedMisconceptions: z.array(z.string()).optional(),
    misconceptions: z.record(z.string(), z.boolean()).optional(),
    confidence: z.union([
        z.number(),
        z.enum(["low", "medium", "high"]),
    ]).optional(),
    learnerSummary: z.string().trim().min(1).max(800),
    reasoning: z.string().trim().min(1).max(800).optional(),
});

export type DiagnosticModelAnalysis = z.infer<typeof DiagnosticModelAnalysisSchema>;

export const DiagnosticResultSchema = z.object({
    initialMasteryByObjective: z.record(z.string(), z.number()),
    activeMisconceptions: z.array(z.string()),
    confidence: z.number(),
    explanationDepth: z.enum(["foundational", "guided", "concise"]),
    knowledgeSummary: z.string().trim().min(1).max(800),
});

export type DiagnosticResult = z.infer<typeof DiagnosticResultSchema>;

export const StartLearningResponseSchema = z.object({
    diagnostic: DiagnosticResultSchema,
    learnerModel: LearnerModelSchema,
    opening: z.string().trim().min(1).max(8_000),
});
