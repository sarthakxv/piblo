import "server-only";

import { z } from "zod";
import { PHOTOSYNTHESIS } from "@/content/concepts/photosynthesis.ts";
import { analyzeTurn, applyAnalysis, tutorTurn } from "@/domain/tutor/loop.ts";
import { getAnalyzerModel, getTutorModel } from "@/server/llm/index.ts";
import { logTutorTurn } from "@/server/logging.ts";

const ChatMessageSchema = z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(8_000),
});

const LearnerModelSchema = z.object({
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
});

export const TutorTurnRequestSchema = z.object({
    history: z.array(ChatMessageSchema).min(1).max(100),
    learnerModel: LearnerModelSchema,
}).refine((request) => request.history.at(-1)?.role === "user", {
    message: "The conversation must end with a learner message.",
    path: ["history"],
});

export type TutorTurnRequest = z.infer<typeof TutorTurnRequestSchema>;

export async function runTutorTurn(request: TutorTurnRequest, requestId: string) {
    const analyzerStartedAt = performance.now();
    const analysis = await analyzeTurn(
        getAnalyzerModel(),
        PHOTOSYNTHESIS,
        request.history,
        request.learnerModel.focusObjective,
    );
    const analyzerDurationMs = Math.round(performance.now() - analyzerStartedAt);
    const learnerModel = applyAnalysis(request.learnerModel, analysis, PHOTOSYNTHESIS);

    const tutorStartedAt = performance.now();
    const reply = await tutorTurn(
        getTutorModel(),
        PHOTOSYNTHESIS,
        learnerModel,
        request.history,
    );
    const tutorDurationMs = Math.round(performance.now() - tutorStartedAt);

    logTutorTurn({
        event: "tutor_turn_completed",
        requestId,
        analyzerDurationMs,
        tutorDurationMs,
        turnCount: learnerModel.turnCount,
    });

    return { reply, analysis, learnerModel };
}
