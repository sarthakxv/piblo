export type Confidence = "Guessing" | "Somewhat sure" | "Sure";
export type RelationshipAnswer = "part" | "not-part";

export interface LessonAnswers {
    prediction: string;
    predictionOther: string;
    predictionReason: string;
    confidence: Confidence | "";
    observation: string;
    explanation: string;
    relationships: Record<string, RelationshipAnswer | undefined>;
    generalization: {
        energy: string;
        firstInput: string;
        secondInput: string;
        output: string;
    };
    application: string;
    applicationReason: string;
    reflection: string;
    reflectionEvidence: string;
}

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
    {
        key: "reflect",
        trailLabel: "Reflection",
        learnerLabel: "Look back",
        eyebrow: "Notice how your thinking changed",
    },
];

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
    reflection: "",
    reflectionEvidence: "",
};
