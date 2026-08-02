import { z } from "zod";

const LessonAnswersSchema = z.object({
    prediction: z.string(),
    predictionOther: z.string(),
    predictionReason: z.string(),
    confidence: z.union([
        z.literal(""),
        z.literal("Guessing"),
        z.literal("Somewhat sure"),
        z.literal("Sure"),
    ]),
    observation: z.string(),
    explanation: z.string(),
    relationships: z.record(
        z.string(),
        z.union([z.literal("part"), z.literal("not-part")]).optional(),
    ),
    generalization: z.object({
        energy: z.string(),
        firstInput: z.string(),
        secondInput: z.string(),
        output: z.string(),
    }),
    application: z.string(),
    applicationReason: z.string(),
    reflection: z.string(),
    reflectionEvidence: z.string(),
});

export const SessionSchema = z.object({
    version: z.literal(1),
    lessonId: z.string().min(1),
    phaseIndex: z.number().int().min(0).max(5),
    answers: LessonAnswersSchema,
    complete: z.boolean(),
    updatedAt: z.iso.datetime(),
});

export type Session = z.infer<typeof SessionSchema>;
