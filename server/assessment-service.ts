import "server-only";

import { generateText } from "ai";
import { z } from "zod";
import { findConcept } from "@/content/concepts/index.ts";
import {
    analysisFromDiagnosticModelText,
    fallbackLearnerSummary,
    learnerModelFromDiagnostic,
    mergeDiagnosticAnalysis,
    scoreDiagnosticAnswers,
} from "@/domain/assessment/diagnostic.ts";
import type { DiagnosticModelAnalysis } from "@/domain/assessment/types.ts";
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
    let modelAnalysis: DiagnosticModelAnalysis = {
        learnerSummary: fallbackLearnerSummary(concept),
    };
    try {
        const { text } = await generateText({
            model: getAnalyzerModel(),
            instructions: buildDiagnosticSystem(concept, request.answers),
            prompt: "Analyze these diagnostic answers and return the placement result as JSON.",
            temperature: 0,
            maxOutputTokens: 4096,
            providerOptions: {
                openai: { reasoningEffort: "low" },
            },
        });
        modelAnalysis = analysisFromDiagnosticModelText(text, concept);
    } catch (error) {
        console.error(JSON.stringify({
            event: "diagnostic_model_analysis_failed",
            errorName: error instanceof Error ? error.name : "UnknownError",
            errorMessage: error instanceof Error ? error.message : "Unknown error",
        }));
    }
    const diagnostic = mergeDiagnosticAnalysis(deterministic, modelAnalysis, concept);
    const learnerModel = learnerModelFromDiagnostic(diagnostic, concept);
    let opening: string;
    try {
        opening = await tutorTurn(getTutorModel(), concept, learnerModel, [
            {
                role: "user",
                content: "My diagnostic is complete. Begin from what I know and help me work on the first weak milestone.",
            },
        ]);
    } catch (error) {
        console.error(JSON.stringify({
            event: "diagnostic_opening_failed",
            errorName: error instanceof Error ? error.name : "UnknownError",
            errorMessage: error instanceof Error ? error.message : "Unknown error",
        }));
        opening = `Thanks for those answers. Let's start from what you already think about ${concept.title}. Before we work it out — what do you think a plant takes in as it grows?`;
    }

    return {
        diagnostic,
        learnerModel,
        opening,
    };
}
