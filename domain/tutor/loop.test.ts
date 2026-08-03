import { test } from "node:test";
import assert from "node:assert/strict";
import { applyAnalysis, pickNextFocus } from "./loop.ts";
import { emptyLearnerModel, MASTERY_THRESHOLD, MAX_TURNS_ON_OBJECTIVE, RUNG_ANSWER, STRUGGLE_THRESHOLD, STRUGGLE_START_RUNG, type AnalyzerResult, type LearnerModel } from "../learner-model/types.ts";
import { PHOTOSYNTHESIS } from "../../content/concepts/photosynthesis.ts";

const C = PHOTOSYNTHESIS; // objective ids are the five learner-facing milestones

function result(over: Partial<AnalyzerResult> = {}): AnalyzerResult {
  return {
    assessable: true,
    addressedObjective: "",
    scaffoldSignal: "progressing",
    requestedAnswer: false,
    masteryDeltas: {},
    detectedMisconceptions: [],
    resolvedMisconceptions: [],
    confidence: 0.5,
    reasoning: "",
    ...over,
  };
}

function model(over: Partial<LearnerModel> = {}): LearnerModel {
  return { ...emptyLearnerModel(), ...over };
}

test("assessable=false only advances turnCount, nothing else moves", () => {
  const before = model({
    masteryByObjective: { "water-role": 0.2 }, activeMisconceptions: ["soil_food"],
    confidence: 0.3, turnCount: 4, focusObjective: "water-role", scaffoldRung: 2, consecutiveStuck: 2,
  });
  const after = applyAnalysis(before, result({ assessable: false, masteryDeltas: { "water-role": 0.3 } }), C);
  assert.deepEqual(after.masteryByObjective, { "water-role": 0.2 });
  assert.equal(after.confidence, 0.3);
  assert.equal(after.focusObjective, "water-role");
  assert.equal(after.scaffoldRung, 2);
  assert.equal(after.consecutiveStuck, 2);
  assert.equal(after.turnCount, 5);
});

test("assessable=true folds deltas, misconceptions, confidence", () => {
  const after = applyAnalysis(
    emptyLearnerModel(),
    result({ masteryDeltas: { "water-role": 0.15 }, detectedMisconceptions: ["soil_food"], confidence: 0.6 }),
    C,
  );
  assert.equal(after.masteryByObjective["water-role"], 0.15);
  assert.deepEqual(after.activeMisconceptions, ["soil_food"]);
  assert.equal(after.confidence, 0.6);
});

test("mastery deltas clamp to [0,1]", () => {
  const up = applyAnalysis(model({ masteryByObjective: { "water-role": 0.9 } }), result({ masteryDeltas: { "water-role": 0.5 } }), C);
  assert.equal(up.masteryByObjective["water-role"], 1);
  const down = applyAnalysis(model({ masteryByObjective: { "water-role": 0.9 } }), result({ masteryDeltas: { "water-role": -2 } }), C);
  assert.equal(down.masteryByObjective["water-role"], 0);
});

test("resolved misconception removed from active set", () => {
  const after = applyAnalysis(model({ activeMisconceptions: ["soil_food"] }), result({ resolvedMisconceptions: ["soil_food"] }), C);
  assert.deepEqual(after.activeMisconceptions, []);
});

test("null focus is initialized to the lowest-mastery objective", () => {
  const after = applyAnalysis(emptyLearnerModel(), result({ scaffoldSignal: "progressing" }), C);
  assert.equal(after.focusObjective, "gases"); // all mastery 0 -> first objective
});

test("first stuck answer at lesson start escalates (focus init before ladder)", () => {
  const after = applyAnalysis(
    emptyLearnerModel(),
    result({ scaffoldSignal: "stuck", addressedObjective: "", confidence: 0.8 }),
    C,
  );
  assert.equal(after.focusObjective, "gases"); // focus gets initialized
  assert.equal(after.scaffoldRung, 1); // and the stuck signal is NOT wiped by that init
  assert.equal(after.consecutiveStuck, 1);
});

test("stuck increments rung and consecutiveStuck", () => {
  const before = model({ focusObjective: "water-role", scaffoldRung: 0, consecutiveStuck: 0 });
  const after = applyAnalysis(before, result({ addressedObjective: "water-role", scaffoldSignal: "stuck", confidence: 0.8 }), C);
  assert.equal(after.scaffoldRung, 1);
  assert.equal(after.consecutiveStuck, 1);
});

test("progressing decays rung by 1 (not to 0) and zeroes consecutiveStuck", () => {
  const before = model({ focusObjective: "water-role", scaffoldRung: 2, consecutiveStuck: 2 });
  const after = applyAnalysis(before, result({ addressedObjective: "water-role", scaffoldSignal: "progressing" }), C);
  assert.equal(after.scaffoldRung, 1);
  assert.equal(after.consecutiveStuck, 0);
});

test("requestedAnswer jumps to L3 ONLY after >=1 post-support attempt", () => {
  const yes = applyAnalysis(
    model({ focusObjective: "water-role", scaffoldRung: 1, consecutiveStuck: 1 }),
    result({ addressedObjective: "water-role", scaffoldSignal: "stuck", requestedAnswer: true, confidence: 0.8 }), C);
  assert.equal(yes.scaffoldRung, 3);

  const no = applyAnalysis(
    model({ focusObjective: "water-role", scaffoldRung: 0, consecutiveStuck: 0 }),
    result({ addressedObjective: "water-role", scaffoldSignal: "stuck", requestedAnswer: true, confidence: 0.8 }), C);
  assert.equal(no.scaffoldRung, 1); // hint, not an instant answer
});

test("frustration accelerator: low confidence + >=2 stalls jumps to L3", () => {
  const before = model({ focusObjective: "water-role", scaffoldRung: 0, consecutiveStuck: 1 });
  const after = applyAnalysis(before, result({ addressedObjective: "water-role", scaffoldSignal: "stuck", confidence: 0.1 }), C);
  assert.equal(after.consecutiveStuck, 2);
  assert.equal(after.scaffoldRung, 3);
});

test("off-topic answer is neutral for the ladder", () => {
  const before = model({ focusObjective: "water-role", scaffoldRung: 1, consecutiveStuck: 1 });
  const after = applyAnalysis(before, result({ addressedObjective: "sunlight-job", scaffoldSignal: "stuck" }), C);
  assert.equal(after.scaffoldRung, 1);
  assert.equal(after.consecutiveStuck, 1);
  assert.equal(after.focusObjective, "water-role");
});

test("solved advances focus once the objective crosses the mastery threshold", () => {
  const before = model({ focusObjective: "gases", masteryByObjective: { gases: 0.65 } });
  const after = applyAnalysis(before, result({ addressedObjective: "gases", scaffoldSignal: "solved", masteryDeltas: { gases: 0.1 } }), C);
  assert.ok(after.masteryByObjective.gases >= MASTERY_THRESHOLD);
  assert.equal(after.focusObjective, "water-role"); // gases now mastered -> next lowest
  assert.equal(after.scaffoldRung, 0);
  assert.equal(after.consecutiveStuck, 0);
});

test("solved completes the milestone even when the analyzer delta is conservative", () => {
  const before = model({ focusObjective: "gases", masteryByObjective: { gases: 0.2 } });
  const after = applyAnalysis(
    before,
    result({ addressedObjective: "gases", scaffoldSignal: "solved", masteryDeltas: { gases: 0.1 } }),
    C,
  );

  assert.equal(after.masteryByObjective.gases, MASTERY_THRESHOLD);
  assert.equal(after.focusObjective, "water-role");
});

test("terminal: prior rung 3 records support and completes the milestone before advancing", () => {
  const before = model({ focusObjective: "water-role", scaffoldRung: 3, masteryByObjective: { "water-role": 0.2 }, answerRevealed: [] });
  const after = applyAnalysis(before, result({ addressedObjective: "water-role", scaffoldSignal: "progressing", masteryDeltas: {} }), C);
  assert.deepEqual(after.answerRevealed, ["water-role"]);
  assert.notEqual(after.focusObjective, "water-role"); // advanced past the revealed one
  assert.equal(after.scaffoldRung, 0);
  assert.equal(after.consecutiveStuck, 0);
  assert.equal(after.masteryByObjective["water-role"], MASTERY_THRESHOLD);
});

test("emptyLearnerModel starts with lessonComplete=false", () => {
  assert.equal(emptyLearnerModel().lessonComplete, false);
});

test("lessonComplete becomes true once every objective's mastery crosses the threshold", () => {
  const lastId = C.objectives[C.objectives.length - 1].id;
  const almostAllMastered = Object.fromEntries(
    C.objectives.map((o) => [o.id, o.id === lastId ? 0.5 : 0.9]),
  );
  const before = model({ masteryByObjective: almostAllMastered, focusObjective: lastId });
  const after = applyAnalysis(
    before,
    result({ addressedObjective: lastId, scaffoldSignal: "solved", masteryDeltas: { [lastId]: 0.3 } }),
    C,
  );
  assert.equal(after.lessonComplete, true);
  assert.equal(after.focusObjective, null);
});

test("final solved signal completes the lesson despite a small analyzer delta", () => {
  const lastId = C.objectives[C.objectives.length - 1].id;
  const almostAllMastered = Object.fromEntries(
    C.objectives.map((o) => [o.id, o.id === lastId ? 0.1 : MASTERY_THRESHOLD]),
  );
  const after = applyAnalysis(
    model({ masteryByObjective: almostAllMastered, focusObjective: lastId }),
    result({ addressedObjective: lastId, scaffoldSignal: "solved", masteryDeltas: { [lastId]: 0.05 } }),
    C,
  );

  assert.equal(after.masteryByObjective[lastId], MASTERY_THRESHOLD);
  assert.equal(after.lessonComplete, true);
  assert.equal(after.focusObjective, null);
});

test("lessonComplete stays false while an objective remains below threshold", () => {
  const after = applyAnalysis(emptyLearnerModel(), result({ scaffoldSignal: "progressing" }), C);
  assert.equal(after.lessonComplete, false);
});

test("pickNextFocus: lowest mastery, skips revealed, null when all mastered", () => {
  assert.equal(pickNextFocus({}, C, []), "gases");
  assert.equal(pickNextFocus({ gases: 0.8 }, C, []), "water-role");
  assert.equal(pickNextFocus({}, C, ["gases"]), "water-role");
  const allMastered = Object.fromEntries(C.objectives.map((o) => [o.id, 0.9]));
  assert.equal(pickNextFocus(allMastered, C, []), null);
});

// ── #3a: per-objective turn-count backstop ────────────────────────────────────

test("turnsOnObjective increments on each on-topic assessable turn", () => {
  const before = model({ focusObjective: "water-role", scaffoldRung: 0, turnsOnObjective: 0 });
  const after = applyAnalysis(before, result({ addressedObjective: "water-role", scaffoldSignal: "stuck", confidence: 0.8 }), C);
  assert.equal(after.turnsOnObjective, 1);
});

test("turnsOnObjective does NOT increment on off-topic or non-assessable turns", () => {
  const offTopic = applyAnalysis(
    model({ focusObjective: "water-role", turnsOnObjective: 2 }),
    result({ addressedObjective: "sunlight-job", scaffoldSignal: "stuck" }),
    C,
  );
  assert.equal(offTopic.turnsOnObjective, 2);

  const nonAssessable = applyAnalysis(
    model({ focusObjective: "water-role", turnsOnObjective: 2 }),
    result({ assessable: false }),
    C,
  );
  assert.equal(nonAssessable.turnsOnObjective, 2);
});

test("turnsOnObjective backstop: after MAX_TURNS_ON_OBJECTIVE alternating stuck/progressing, forces RUNG_ANSWER", () => {
  // Simulate 4 prior turns oscillating stuck/progressing (never solving, never hitting rung 3)
  let m = model({ focusObjective: "water-role", scaffoldRung: 1, turnsOnObjective: 0 });
  for (let i = 0; i < MAX_TURNS_ON_OBJECTIVE - 1; i++) {
    const signal = i % 2 === 0 ? "stuck" : "progressing";
    m = applyAnalysis(m, result({ addressedObjective: "water-role", scaffoldSignal: signal, confidence: 0.5 }), C);
  }
  assert.equal(m.turnsOnObjective, MAX_TURNS_ON_OBJECTIVE - 1);
  assert.ok(m.scaffoldRung < RUNG_ANSWER, `rung should be below answer before backstop, got ${m.scaffoldRung}`);

  // 5th turn — backstop kicks in regardless of signal
  const after = applyAnalysis(m, result({ addressedObjective: "water-role", scaffoldSignal: "progressing", confidence: 0.5 }), C);
  assert.equal(after.scaffoldRung, RUNG_ANSWER);
});

test("turnsOnObjective resets when objective is solved and focus advances", () => {
  const before = model({ focusObjective: "gases", masteryByObjective: { gases: 0.65 }, turnsOnObjective: 4 });
  const after = applyAnalysis(before, result({ addressedObjective: "gases", scaffoldSignal: "solved", masteryDeltas: { gases: 0.1 } }), C);
  assert.equal(after.focusObjective, "water-role");
  assert.equal(after.turnsOnObjective, 0);
});

test("turnsOnObjective resets when answer is revealed and focus advances", () => {
  const before = model({ focusObjective: "water-role", scaffoldRung: RUNG_ANSWER, turnsOnObjective: 5 });
  const after = applyAnalysis(before, result({ addressedObjective: "water-role", scaffoldSignal: "progressing" }), C);
  assert.notEqual(after.focusObjective, "water-role");
  assert.equal(after.turnsOnObjective, 0);
});

// ── #3b: session-level struggle memory ────────────────────────────────────────

test("session struggle: after STRUGGLE_THRESHOLD answer reveals, new objective starts at STRUGGLE_START_RUNG", () => {
  // Two objectives already had answers revealed
  const before = model({
    focusObjective: "sunlight-job", scaffoldRung: RUNG_ANSWER,
    masteryByObjective: { gases: 0.9, "water-role": 0.9 },
    answerRevealed: ["gases", "water-role"],
    turnsOnObjective: 5,
  });
  const after = applyAnalysis(before, result({ addressedObjective: "sunlight-job", scaffoldSignal: "progressing" }), C);
  assert.notEqual(after.focusObjective, "sunlight-job");
  assert.equal(after.scaffoldRung, STRUGGLE_START_RUNG, `should start at ${STRUGGLE_START_RUNG} due to prior struggle`);
});

test("session struggle: below threshold, new objective starts at rung 0 (existing behavior)", () => {
  const before = model({
    focusObjective: "water-role", scaffoldRung: RUNG_ANSWER,
    masteryByObjective: { gases: 0.9 },
    answerRevealed: [],
    turnsOnObjective: 5,
  });
  const after = applyAnalysis(before, result({ addressedObjective: "water-role", scaffoldSignal: "progressing" }), C);
  assert.notEqual(after.focusObjective, "water-role");
  assert.equal(after.scaffoldRung, 0, `should start at 0 with only ${STRUGGLE_THRESHOLD - 1} reveal`);
});
