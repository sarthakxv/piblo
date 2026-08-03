import test from "node:test";
import assert from "node:assert/strict";
import { createReviewCardState, toggleReviewCard } from "./review-card-state.ts";

test("opening a review card reveals it and counts it as explored", () => {
    const state = toggleReviewCard(createReviewCardState(), "darkness");

    assert.equal(state.revealedIds.has("darkness"), true);
    assert.equal(state.exploredIds.has("darkness"), true);
    assert.equal(state.exploredIds.size, 1);
});

test("closing a review card keeps it in the explored count", () => {
    const opened = toggleReviewCard(createReviewCardState(), "darkness");
    const closed = toggleReviewCard(opened, "darkness");

    assert.equal(closed.revealedIds.has("darkness"), false);
    assert.equal(closed.exploredIds.has("darkness"), true);
    assert.equal(closed.exploredIds.size, 1);
});

test("review cards track exploration independently", () => {
    const first = toggleReviewCard(createReviewCardState(), "darkness");
    const second = toggleReviewCard(first, "no-water");

    assert.deepEqual([...second.revealedIds], ["darkness", "no-water"]);
    assert.equal(second.exploredIds.size, 2);
});
