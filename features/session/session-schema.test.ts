import test from "node:test";
import assert from "node:assert/strict";
import { emptyLearnerModel } from "../../domain/learner-model/types.ts";
import { EMPTY_ANSWERS } from "../../domain/lesson/types.ts";
import { createTopicSession, migrateTopicSessionV2 } from "./session-schema.ts";

const legacySession = (lessonComplete: boolean) => ({
    ...createTopicSession("photosynthesis", "recommended"),
    version: 2 as const,
    stage: "reflection" as const,
    answers: {
        ...EMPTY_ANSWERS,
        reflection: "I changed my explanation.",
        reflectionEvidence: "The gas evidence mattered.",
    },
    learnerModel: emptyLearnerModel({ lessonComplete }),
});

test("completed v2 reflection sessions migrate directly to the recap", () => {
    const migrated = migrateTopicSessionV2(legacySession(true));

    assert.equal(migrated.version, 3);
    assert.equal(migrated.stage, "complete");
    assert.equal("reflection" in migrated.answers, false);
    assert.equal("reflectionEvidence" in migrated.answers, false);
});

test("incomplete v2 reflection sessions return safely to chat", () => {
    const migrated = migrateTopicSessionV2(legacySession(false));

    assert.equal(migrated.stage, "chat");
});
