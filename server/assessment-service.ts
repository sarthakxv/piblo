import "server-only";

import { generateText, Output } from "ai";
import { z } from "zod";
import { findConcept } from "@/content/concepts/index.ts";
import {
    learnerModelFromDiagnostic,
    mergeDiagnosticAnalysis,
    scoreDiagnosticAnswers,
} from "@/domain/assessment/diagnostic.ts";
import { DiagnosticModelAnalysisSchema } from "@/domain/assessment/types.ts";
import { LessonAnswersSchema } from "@/domain/lesson/types.ts";
import { buildDiagnosticSystem } from "@/domain/tutor/prompts.ts";
import { tutorTurn } from "@/domain/tutor/loop.ts";
import { getAnalyzerModel, getTutorModel } from "@/server/llm/index.ts";

export const StartLearningRequestSchema = z.object({
    topicId: z.string().trim().min(1),
    answers: LessonAnswersSchema,
});

export type StartLearningRequest = z.infer<typeof StartLearningRequestSchema>;

export async function startLearning(request: StartLearningRequest) {
    const concept = findConcept(request.topicId);
    if (!concept) throw new Error(`Unknown learning topic: ${request.topicId}`);

    const deterministic = scoreDiagnosticAnswers(request.answers);
    const { output: modelAnalysis } = await generateText({
        model: getAnalyzerModel(),
        system: buildDiagnosticSystem(concept, request.answers),
        prompt: "Analyze these diagnostic answers and return the placement result.",
        temperature: 0,
        output: Output.object({ schema: DiagnosticModelAnalysisSchema }),
    });
    const diagnostic = mergeDiagnosticAnalysis(deterministic, modelAnalysis, concept);
    const learnerModel = learnerModelFromDiagnostic(diagnostic, concept);
    const opening = await tutorTurn(getTutorModel(), concept, learnerModel, [
        {
            role: "user",
            content: "My diagnostic is complete. Begin from what I know and help me work on the first weak milestone.",
        },
    ]);

    return {
        diagnostic,
        learnerModel,
        opening,
    };
}
