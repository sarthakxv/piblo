import test from "node:test";
import assert from "node:assert/strict";
import { PHOTOSYNTHESIS } from "../../content/concepts/photosynthesis.ts";
import { emptyLearnerModel } from "./types.ts";
import { deriveMilestoneStates } from "./milestones.ts";

test("milestone trail distinguishes placement mastery from learned mastery", () => {
    const model = emptyLearnerModel({
        masteryByObjective: {
            gases: 0.9,
            "water-role": 0.8,
            "sunlight-job": 0.2,
        },
        focusObjective: "sunlight-job",
    });
    const states = deriveMilestoneStates(
        PHOTOSYNTHESIS,
        model,
        { gases: 0.9, "water-role": 0.1 },
    );

    assert.equal(states[0].status, "already-understood");
    assert.equal(states[1].status, "complete");
    assert.equal(states[2].status, "current");
    assert.equal(states[3].status, "upcoming");
});
