import test from "node:test";
import assert from "node:assert/strict";
import { canSubmitMove } from "./transitions.ts";
import { EMPTY_ANSWERS, type LessonAnswers } from "./types.ts";

const answersWith = (update: Partial<LessonAnswers>): LessonAnswers => ({
    ...EMPTY_ANSWERS,
    ...update,
});

test("prediction requires a choice and confidence", () => {
    assert.equal(canSubmitMove(0, answersWith({ prediction: "Soil" })), false);
    assert.equal(
        canSubmitMove(0, answersWith({ prediction: "Soil", confidence: "Guessing" })),
        true,
    );
});

test("custom prediction requires the learner's text", () => {
    assert.equal(
        canSubmitMove(0, answersWith({ prediction: "Something else", confidence: "Sure" })),
        false,
    );
    assert.equal(
        canSubmitMove(0, answersWith({
            prediction: "Something else",
            predictionOther: "Minerals",
            confidence: "Sure",
        })),
        true,
    );
});

test("explanation requires every relationship and written reasoning", () => {
    const partial = answersWith({
        explanation: "The plant rearranges matter.",
        relationships: { "carbon dioxide": "part", water: "part" },
    });
    assert.equal(canSubmitMove(2, partial), false);
    assert.equal(
        canSubmitMove(2, {
            ...partial,
            relationships: { ...partial.relationships, light: "part" },
        }),
        true,
    );
});
