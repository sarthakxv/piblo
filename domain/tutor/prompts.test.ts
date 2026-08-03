import { test } from "node:test";
import assert from "node:assert/strict";
import { buildTutorSystem, buildAnalyzerSystem, buildDiagnosticSystem } from "./prompts.ts";
import { EMPTY_ANSWERS } from "../lesson/types.ts";
import { emptyLearnerModel } from "../learner-model/types.ts";
import { PHOTOSYNTHESIS, type Concept } from "../../content/concepts/photosynthesis.ts";

test("tutor prompt injects the ladder level and focus objective title", () => {
  const model = { ...emptyLearnerModel(), focusObjective: "water-role", scaffoldRung: 2 };
  const p = buildTutorSystem(PHOTOSYNTHESIS, model);
  assert.match(p, /LADDER STATE/);
  assert.match(p, /scaffold level 2/);
  assert.match(p, /Finding water's role/); // focus objective title
  assert.match(p, /LESSON ARC/);
  assert.match(p, /FACTS vs IDEAS/);
  assert.match(p, /LANGUAGE: Respond only in English/);
  assert.match(p, /MISCONCEPTION CLOSE/);
});

test("tutor prompt with null focus gives the Predict opening, no rung", () => {
  const p = buildTutorSystem(PHOTOSYNTHESIS, emptyLearnerModel());
  assert.match(p, /PREDICTION|lesson is just starting/i);
});

test("tutor prompt shows a completion message when lessonComplete is true", () => {
  const model = { ...emptyLearnerModel(), lessonComplete: true, focusObjective: null };
  const p = buildTutorSystem(PHOTOSYNTHESIS, model);
  assert.match(p, /LESSON COMPLETE/i);
});

test("ladder rung 0 pairs the question with a directional hint", () => {
  const model = { ...emptyLearnerModel(), focusObjective: "water-role", scaffoldRung: 0 };
  const p = buildTutorSystem(PHOTOSYNTHESIS, model);
  assert.match(p, /L0 ask a Socratic question[^·]*hint/i);
});

test("tutor prompt honors concept.targetLanguage override", () => {
  const hindi: Concept = { ...PHOTOSYNTHESIS, targetLanguage: "Hindi" };
  const p = buildTutorSystem(hindi, { ...emptyLearnerModel(), focusObjective: "water-role", scaffoldRung: 0 });
  assert.match(p, /LANGUAGE: Respond only in Hindi/);
});

test("analyzer prompt asks for the new signals and attribution rule", () => {
  const p = buildAnalyzerSystem(PHOTOSYNTHESIS, "water-role");
  assert.match(p, /scaffoldSignal/);
  assert.match(p, /addressedObjective/);
  assert.match(p, /requestedAnswer/);
  assert.match(p, /working the objective "water-role"/);
  assert.match(p, /Do NOT credit/i);
});

test("analyzer prompt handles a null focus at lesson start", () => {
  const p = buildAnalyzerSystem(PHOTOSYNTHESIS, null);
  assert.match(p, /just starting/i);
});

test("diagnostic prompt grounds placement in the five milestones", () => {
  const p = buildDiagnosticSystem(PHOTOSYNTHESIS, EMPTY_ANSWERS);
  assert.match(p, /Discovering gases/);
  assert.match(p, /learnerSummary/);
  assert.match(p, /Never show percentages/);
});
