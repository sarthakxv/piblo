import test from "node:test";
import assert from "node:assert/strict";
import { emptyLearnerModel } from "../../domain/learner-model/types.ts";
import { createTopicSession } from "../session/session-schema.ts";
import {
    getLearningLevelHref,
    getLevelProgress,
} from "./learning-path-state.ts";

test("completed learner models produce completed level progress", () => {
    const session = {
        ...createTopicSession("photosynthesis", "recommended"),
        stage: "chat" as const,
        learnerModel: emptyLearnerModel({ lessonComplete: true }),
    };

    assert.equal(getLevelProgress(session), "complete");
});

test("completed levels link directly to recap", () => {
    assert.equal(
        getLearningLevelHref("photosynthesis", "recommended", "complete"),
        "/learn/photosynthesis/recommended?recap=1",
    );
    assert.equal(
        getLearningLevelHref("photosynthesis", "recommended", "in-progress"),
        "/learn/photosynthesis/recommended",
    );
});
