import test from "node:test";
import assert from "node:assert/strict";
import {
    INITIAL_LESSON_WORKSPACE_STATE,
    lessonWorkspaceReducer,
} from "./workspace-state.ts";
import { EMPTY_ANSWERS } from "./types.ts";

test("hydrates stored progress as one state transition", () => {
    const answers = { ...EMPTY_ANSWERS, explanation: "Stored explanation" };
    const state = lessonWorkspaceReducer(INITIAL_LESSON_WORKSPACE_STATE, {
        type: "hydrate",
        progress: { phaseIndex: 3, answers, complete: false },
    });

    assert.equal(state.sessionLoaded, true);
    assert.equal(state.phaseIndex, 3);
    assert.equal(state.answers, answers);
    assert.equal(state.complete, false);
});

test("hydrates an empty lesson from clean defaults", () => {
    const staleState = {
        ...INITIAL_LESSON_WORKSPACE_STATE,
        sessionLoaded: true,
        phaseIndex: 4,
        complete: true,
        supportLevel: 3,
        askOpen: true,
        askQuestion: "A stale question",
        askAnswer: "A stale answer",
    };
    const state = lessonWorkspaceReducer(staleState, { type: "hydrate", progress: null });

    assert.deepEqual(state, { ...INITIAL_LESSON_WORKSPACE_STATE, sessionLoaded: true });
});

test("advancing a phase resets phase-specific assistance", () => {
    const state = lessonWorkspaceReducer(
        {
            ...INITIAL_LESSON_WORKSPACE_STATE,
            sessionLoaded: true,
            supportLevel: 2,
            askOpen: true,
            askQuestion: "Why?",
            askAnswer: "Because.",
        },
        { type: "advance-phase" },
    );

    assert.equal(state.phaseIndex, 1);
    assert.equal(state.supportLevel, 0);
    assert.equal(state.askOpen, false);
    assert.equal(state.askQuestion, "");
    assert.equal(state.askAnswer, "");
});

test("closing Ask Piblo clears its conversation", () => {
    const state = lessonWorkspaceReducer(
        {
            ...INITIAL_LESSON_WORKSPACE_STATE,
            askOpen: true,
            askQuestion: "Why?",
            askAnswer: "Because.",
        },
        { type: "set-ask-open", open: false },
    );

    assert.equal(state.askOpen, false);
    assert.equal(state.askQuestion, "");
    assert.equal(state.askAnswer, "");
});
