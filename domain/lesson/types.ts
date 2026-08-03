import { z } from "zod";

export type Confidence = "Guessing" | "Somewhat sure" | "Sure";
export type RelationshipAnswer = "part" | "not-part";

export const LessonAnswersSchema = z.object({
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
});

export type LessonAnswers = z.infer<typeof LessonAnswersSchema>;

export interface PhaseDefinition {
    key: string;
    trailLabel: string;
    learnerLabel: string;
    eyebrow: string;
}

export const PHASES: PhaseDefinition[] = [
    {
        key: "predict",
        trailLabel: "Prediction",
        learnerLabel: "Make a prediction",
        eyebrow: "Start with what you think",
    },
    {
        key: "observe",
        trailLabel: "Evidence",
        learnerLabel: "Notice what changed",
        eyebrow: "Look closely at the evidence",
    },
    {
        key: "explain",
        trailLabel: "Explanation",
        learnerLabel: "Build the idea",
        eyebrow: "Connect the pieces",
    },
    {
        key: "generalize",
        trailLabel: "Rule",
        learnerLabel: "Find the rule",
        eyebrow: "Say what is true in general",
    },
    {
        key: "apply",
        trailLabel: "Application",
        learnerLabel: "Try it somewhere new",
        eyebrow: "Test the idea in a new situation",
    },
];

export const DIAGNOSTIC_PHASES = PHASES;

export const EMPTY_ANSWERS: LessonAnswers = {
    prediction: "",
    predictionOther: "",
    predictionReason: "",
    confidence: "",
    observation: "",
    explanation: "",
    relationships: {},
    generalization: {
        energy: "",
        firstInput: "",
        secondInput: "",
        output: "",
    },
    application: "",
    applicationReason: "",
};
