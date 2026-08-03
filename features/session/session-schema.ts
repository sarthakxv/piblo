import { z } from "zod";
import { LearnerModelSchema } from "../../domain/learner-model/schema.ts";
import { EMPTY_ANSWERS, LessonAnswersSchema } from "../../domain/lesson/types.ts";

export const LEARNING_LEVEL_IDS = ["recommended", "expert"] as const;

const TopicSessionFields = {
    topicId: z.string().min(1),
    levelId: z.enum(LEARNING_LEVEL_IDS),
    diagnosticStep: z.number().int().min(0).max(4),
    answers: LessonAnswersSchema,
    initialMasteryByObjective: z.record(z.string(), z.number()),
    knowledgeSummary: z.string(),
    learnerModel: LearnerModelSchema.nullable(),
    messages: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(8_000),
    })).max(100),
    updatedAt: z.iso.datetime(),
};

export const TopicSessionSchema = z.object({
    version: z.literal(3),
    ...TopicSessionFields,
    stage: z.enum([
        "overview",
        "diagnostic",
        "analyzing",
        "chat",
        "complete",
    ]),
});

export type TopicSession = z.infer<typeof TopicSessionSchema>;

const LegacyTopicSessionV2Schema = z.object({
    version: z.literal(2),
    ...TopicSessionFields,
    stage: z.enum([
        "overview",
        "diagnostic",
        "analyzing",
        "chat",
        "reflection",
        "complete",
    ]),
});

export function migrateTopicSessionV2(input: unknown): TopicSession {
    const legacy = LegacyTopicSessionV2Schema.parse(input);
    const stage = legacy.stage === "reflection"
        ? legacy.learnerModel?.lessonComplete ? "complete" : "chat"
        : legacy.stage;

    return TopicSessionSchema.parse({
        ...legacy,
        version: 3,
        stage,
    });
}

export function createTopicSession(
    topicId: string,
    levelId: TopicSession["levelId"],
): TopicSession {
    return {
        version: 3,
        topicId,
        levelId,
        stage: "overview",
        diagnosticStep: 0,
        answers: EMPTY_ANSWERS,
        initialMasteryByObjective: {},
        knowledgeSummary: "",
        learnerModel: null,
        messages: [],
        updatedAt: new Date().toISOString(),
    };
}
