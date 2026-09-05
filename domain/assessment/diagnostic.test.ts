import test from "node:test";
import assert from "node:assert/strict";
import { PHOTOSYNTHESIS } from "../../content/concepts/photosynthesis.ts";
import { EMPTY_ANSWERS, type LessonAnswers } from "../lesson/types.ts";
import {
    analysisFromDiagnosticModelText,
    learnerModelFromDiagnostic,
    mergeDiagnosticAnalysis,
    scoreDiagnosticAnswers,
} from "./diagnostic.ts";

const answersWith = (update: Partial<LessonAnswers>): LessonAnswers => ({
    ...EMPTY_ANSWERS,
    ...update,
});

test("closed diagnostic answers create evidence for the matching milestones", () => {
    const result = scoreDiagnosticAnswers(answersWith({
        prediction: "Air",
        confidence: "Sure",
        observation: "The soil loss is too small",
        relationships: {
            "carbon dioxide": "part",
            water: "part",
            light: "part",
        },
        generalization: {
            energy: "light",
            firstInput: "carbon dioxide",
            secondInput: "water",
            output: "glucose",
        },
        application: "It cannot photosynthesize without light",
        applicationReason: "Light provides the energy.",
    }));

    assert.ok(result.masteryByObjective.gases >= 0.6);
    assert.ok(result.masteryByObjective["water-role"] >= 0.5);
    assert.ok(result.masteryByObjective["sunlight-job"] >= 0.7);
    assert.ok(result.masteryByObjective["balanced-equation"] > 0);
    assert.equal(result.confidence, 0.8);
});

test("direct correct gas answers complete the gases milestone", () => {
    const result = scoreDiagnosticAnswers(answersWith({
        prediction: "Air",
        observation: "The soil loss is too small",
        relationships: { "carbon dioxide": "part" },
    }));

    assert.ok(result.masteryByObjective.gases >= 0.7);
});

test("diagnostic choices retain evidenced misconceptions", () => {
    const result = scoreDiagnosticAnswers(answersWith({
        prediction: "Soil",
        confidence: "Somewhat sure",
        relationships: { water: "not-part", light: "not-part" },
    }));

    assert.ok(result.detectedMisconceptions.includes("mass_from_soil"));
    assert.ok(result.detectedMisconceptions.includes("water_is_food"));
    assert.ok(result.detectedMisconceptions.includes("light_optional"));
});

test("hybrid merge keeps deterministic evidence and rejects invented ids", () => {
    const deterministic = scoreDiagnosticAnswers(answersWith({
        prediction: "Air",
        confidence: "Guessing",
    }));
    const result = mergeDiagnosticAnalysis(
        deterministic,
        {
            masteryByObjective: { gases: 0.1, "water-role": 0.8, invented: 1 },
            detectedMisconceptions: ["light_optional", "invented"],
            confidence: 0.5,
            learnerSummary: "You already see one useful connection. We will begin with the role of gases.",
            reasoning: "The written answers show partial understanding.",
        },
        PHOTOSYNTHESIS,
    );

    assert.equal(result.initialMasteryByObjective.gases, 0.25);
    assert.equal(result.initialMasteryByObjective["water-role"], 0.8);
    assert.equal(result.initialMasteryByObjective.invented, undefined);
    assert.deepEqual(result.activeMisconceptions, ["light_optional"]);
});

test("diagnostic cannot declare final understanding without system-level evidence", () => {
    const deterministic = scoreDiagnosticAnswers(answersWith({
        predictionReason: "Plants use carbon dioxide and water to make glucose.",
    }));
    const result = mergeDiagnosticAnalysis(
        deterministic,
        {
            masteryByObjective: { "final-understanding": 0.95 },
            learnerSummary: "You understand the ingredients, and we will connect them into the full system.",
        },
        PHOTOSYNTHESIS,
    );

    assert.ok(result.initialMasteryByObjective["final-understanding"] < 0.7);
});

test("hybrid merge accepts qualitative model confidence", () => {
    const result = mergeDiagnosticAnalysis(
        scoreDiagnosticAnswers(answersWith({ confidence: "Guessing" })),
        {
            confidence: "medium",
            learnerSummary: "You have a useful starting point.",
        },
        PHOTOSYNTHESIS,
    );

    assert.ok(Math.abs(result.confidence - 0.425) < Number.EPSILON);
});

test("learner model starts at the earliest unmastered milestone", () => {
    const diagnostic = {
        initialMasteryByObjective: {
            gases: 0.9,
            "water-role": 0.2,
            "sunlight-job": 0.6,
            "balanced-equation": 0.1,
            "final-understanding": 0.3,
        },
        activeMisconceptions: [],
        confidence: 0.6,
        explanationDepth: "guided" as const,
        knowledgeSummary: "You have a useful starting point.",
    };
    const model = learnerModelFromDiagnostic(diagnostic, PHOTOSYNTHESIS);

    assert.equal(model.focusObjective, "water-role");
    assert.equal(model.masteryByObjective.gases, 0.9);
    assert.equal(model.explanationDepth, "guided");
});

test("later diagnostic mastery does not skip an earlier knowledge gap", () => {
    const diagnostic = {
        initialMasteryByObjective: {
            gases: 0.2,
            "water-role": 0.9,
            "sunlight-job": 0.8,
            "balanced-equation": 0.1,
            "final-understanding": 0.1,
        },
        activeMisconceptions: [],
        confidence: 0.6,
        explanationDepth: "guided" as const,
        knowledgeSummary: "You understand water and sunlight, but need to revisit gases.",
    };

    const model = learnerModelFromDiagnostic(diagnostic, PHOTOSYNTHESIS);

    assert.equal(model.focusObjective, "gases");
    assert.equal(model.masteryByObjective["water-role"], 0.9);
});

test("quiz analysis accepts JSON wrapped in prose", () => {
    const analysis = analysisFromDiagnosticModelText(
        `Here you go:\n{\n  "learnerSummary": "You already notice water and light. We will start with what the plant takes from the air.",\n  "reasoning": "Prediction named soil as food."\n}\n`,
        PHOTOSYNTHESIS,
    );

    assert.match(analysis.learnerSummary, /water and light/);
});

test("quiz analysis truncates overlong model fields instead of rejecting the quiz", () => {
    const analysis = analysisFromDiagnosticModelText(
        JSON.stringify({
            learnerSummary: `${"You already have a useful starting point. ".repeat(40)}We will begin with gases.`,
            reasoning: "x".repeat(1200),
            detectedMisconceptions: ["soil_food"],
        }),
        PHOTOSYNTHESIS,
    );

    assert.equal(analysis.learnerSummary.length, 800);
    assert.equal(analysis.reasoning?.length, 800);
    assert.deepEqual(analysis.detectedMisconceptions, ["soil_food"]);
});

test("quiz analysis falls back when the model returns no JSON", () => {
    const analysis = analysisFromDiagnosticModelText("", PHOTOSYNTHESIS);

    assert.match(analysis.learnerSummary, /Photosynthesis/);
    assert.equal(analysis.detectedMisconceptions, undefined);
});
