import test from "node:test";
import assert from "node:assert/strict";
import { PHOTOSYNTHESIS } from "../../content/concepts/photosynthesis.ts";
import {
    emptyLearnerModel,
    MASTERY_THRESHOLD,
} from "../../domain/learner-model/types.ts";
import { EMPTY_ANSWERS } from "../../domain/lesson/types.ts";
import {
    createTopicSession,
    migrateTopicSessionV2,
    reconcileTopicSession,
} from "./session-schema.ts";

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

test("existing chat sessions resume at the earliest unmet milestone", () => {
    const existing = {
        ...createTopicSession("photosynthesis", "recommended"),
        stage: "chat" as const,
        learnerModel: emptyLearnerModel({
            masteryByObjective: {
                gases: 0.2,
                "water-role": 0.9,
                "sunlight-job": 0.3,
                "balanced-equation": 0.1,
            },
            focusObjective: "balanced-equation",
            scaffoldRung: 2,
            consecutiveStuck: 2,
            turnsOnObjective: 3,
        }),
    };

    const reconciled = reconcileTopicSession(existing, PHOTOSYNTHESIS);

    assert.equal(reconciled.learnerModel?.focusObjective, "gases");
    assert.equal(reconciled.learnerModel?.masteryByObjective["water-role"], 0.9);
    assert.equal(reconciled.learnerModel?.scaffoldRung, 0);
    assert.equal(reconciled.learnerModel?.consecutiveStuck, 0);
    assert.equal(reconciled.learnerModel?.turnsOnObjective, 0);
});

test("existing terminal tutor sign-off completes the final milestone", () => {
    const finalObjective = PHOTOSYNTHESIS.objectives.at(-1);
    assert.ok(finalObjective);
    const masteryByObjective = Object.fromEntries(
        PHOTOSYNTHESIS.objectives.map((objective) => [
            objective.id,
            objective.id === finalObjective.id ? 0.6 : MASTERY_THRESHOLD,
        ]),
    );
    const existing = {
        ...createTopicSession("photosynthesis", "recommended"),
        stage: "chat" as const,
        learnerModel: emptyLearnerModel({
            masteryByObjective,
            focusObjective: finalObjective.id,
        }),
        messages: [{
            role: "assistant" as const,
            content: "That is a clear and complete explanation. Nice work today.",
        }],
    };

    const reconciled = reconcileTopicSession(existing, PHOTOSYNTHESIS);

    assert.equal(
        reconciled.learnerModel?.masteryByObjective[finalObjective.id],
        MASTERY_THRESHOLD,
    );
    assert.equal(reconciled.learnerModel?.focusObjective, null);
    assert.equal(reconciled.learnerModel?.lessonComplete, true);
});

test("existing final-milestone question remains active", () => {
    const finalObjective = PHOTOSYNTHESIS.objectives.at(-1);
    assert.ok(finalObjective);
    const masteryByObjective = Object.fromEntries(
        PHOTOSYNTHESIS.objectives.map((objective) => [
            objective.id,
            objective.id === finalObjective.id ? 0.6 : MASTERY_THRESHOLD,
        ]),
    );
    const existing = {
        ...createTopicSession("photosynthesis", "recommended"),
        stage: "chat" as const,
        learnerModel: emptyLearnerModel({
            masteryByObjective,
            focusObjective: finalObjective.id,
        }),
        messages: [{
            role: "assistant" as const,
            content: "How do those pieces connect into one explanation?",
        }],
    };

    const reconciled = reconcileTopicSession(existing, PHOTOSYNTHESIS);

    assert.equal(reconciled.learnerModel?.focusObjective, finalObjective.id);
    assert.equal(reconciled.learnerModel?.lessonComplete, false);
});
