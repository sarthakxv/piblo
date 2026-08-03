import "server-only";

import { z } from "zod";
import { findConcept } from "@/content/concepts/index.ts";
import { analyzeTurn, applyAnalysis, tutorTurn } from "@/domain/tutor/loop.ts";
import { LearnerModelSchema } from "@/domain/learner-model/schema.ts";
import { getAnalyzerModel, getTutorModel } from "@/server/llm/index.ts";
import { logTutorTurn } from "@/server/logging.ts";

export const ChatMessageSchema = z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(8_000),
});

export const TutorTurnRequestSchema = z.object({
    topicId: z.string().trim().min(1),
    history: z.array(ChatMessageSchema).min(1).max(100),
    learnerModel: LearnerModelSchema,
}).refine((request) => request.history.at(-1)?.role === "user", {
    message: "The conversation must end with a learner message.",
    path: ["history"],
});

export type TutorTurnRequest = z.infer<typeof TutorTurnRequestSchema>;

export async function runTutorTurn(request: TutorTurnRequest, requestId: string) {
    const concept = findConcept(request.topicId);
    if (!concept) throw new Error(`Unknown learning topic: ${request.topicId}`);

    const analyzerStartedAt = performance.now();
    const analysis = await analyzeTurn(
        getAnalyzerModel(),
        concept,
        request.history,
        request.learnerModel.focusObjective,
    );
    const analyzerDurationMs = Math.round(performance.now() - analyzerStartedAt);
    const learnerModel = applyAnalysis(request.learnerModel, analysis, concept);

    const tutorStartedAt = performance.now();
    const reply = await tutorTurn(
        getTutorModel(),
        concept,
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
