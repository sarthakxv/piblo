import type { Concept } from "../../content/concepts/types.ts";
import type { LessonAnswers } from "../lesson/types.ts";
import { MASTERY_THRESHOLD, emptyLearnerModel, type LearnerModel } from "../learner-model/types.ts";
import { pickNextFocus } from "../tutor/loop.ts";
import type { DiagnosticModelAnalysis, DiagnosticResult } from "./types.ts";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const includesAny = (value: string, terms: string[]) => {
    const normalized = value.toLowerCase();
    return terms.some((term) => normalized.includes(term));
};

export interface DeterministicDiagnostic {
    masteryByObjective: Record<string, number>;
    maximumMasteryByObjective: Record<string, number>;
    detectedMisconceptions: string[];
    confidence: number;
}

function normalizeModelConfidence(
    confidence: DiagnosticModelAnalysis["confidence"],
): number | undefined {
    if (typeof confidence === "number") return clamp(confidence);
    if (confidence === "low") return 0.3;
    if (confidence === "medium") return 0.55;
    if (confidence === "high") return 0.8;
    return undefined;
}

export function scoreDiagnosticAnswers(answers: LessonAnswers): DeterministicDiagnostic {
    const mastery: Record<string, number> = {
        gases: 0,
        "water-role": 0,
        "sunlight-job": 0,
        "balanced-equation": 0,
        "final-understanding": 0,
    };
    const misconceptions = new Set<string>();
    const writtenEvidence = [
        answers.predictionReason,
        answers.explanation,
        answers.generalization.energy,
        answers.generalization.firstInput,
        answers.generalization.secondInput,
        answers.generalization.output,
        answers.applicationReason,
    ].join(" ");

    if (answers.prediction === "Air") mastery.gases += 0.25;
    if (answers.prediction === "Soil") {
        misconceptions.add("soil_food");
        misconceptions.add("mass_from_soil");
    }
    if (answers.prediction === "Water") misconceptions.add("water_is_food");
    if (answers.prediction === "Sunlight") misconceptions.add("light_is_matter");

    if (answers.observation === "The soil loss is too small") mastery.gases += 0.2;

    if (answers.relationships["carbon dioxide"] === "part") mastery.gases += 0.25;
    if (answers.relationships.water === "part") mastery["water-role"] += 0.25;
    if (answers.relationships.light === "part") mastery["sunlight-job"] += 0.2;
    if (answers.relationships.water === "not-part") misconceptions.add("water_is_food");
    if (answers.relationships.light === "not-part") misconceptions.add("light_optional");

    const { energy, firstInput, secondInput, output } = answers.generalization;
    const inputs = `${firstInput} ${secondInput}`;
    if (includesAny(energy, ["light", "sun"])) mastery["sunlight-job"] += 0.25;
    if (includesAny(inputs, ["carbon dioxide", "co2", "air"])) mastery.gases += 0.2;
    if (includesAny(inputs, ["water", "h2o"])) mastery["water-role"] += 0.25;
    if (includesAny(output, ["glucose", "sugar", "c6h12o6"])) {
        mastery["balanced-equation"] += 0.25;
        mastery["final-understanding"] += 0.15;
    }

    if (answers.application === "It cannot photosynthesize without light") {
        mastery["sunlight-job"] += 0.2;
        mastery["final-understanding"] += 0.15;
    } else if (answers.application) {
        misconceptions.add("light_optional");
    }
    if (includesAny(answers.applicationReason, ["energy", "light"])) {
        mastery["sunlight-job"] += 0.1;
        mastery["final-understanding"] += 0.1;
    }

    const confidenceByChoice = {
        Guessing: 0.3,
        "Somewhat sure": 0.55,
        Sure: 0.8,
    } as const;
    const confidence = answers.confidence
        ? confidenceByChoice[answers.confidence]
        : 0.3;
    const demonstratesFullSystem = (
        includesAny(writtenEvidence, ["chloroplast"])
        && includesAny(writtenEvidence, ["food chain", "ecosystem", "producer"])
    );

    return {
        masteryByObjective: Object.fromEntries(
            Object.entries(mastery).map(([id, value]) => [id, clamp(value)]),
        ),
        maximumMasteryByObjective: {
            gases: 1,
            "water-role": 1,
            "sunlight-job": 1,
            "balanced-equation": 1,
            "final-understanding": demonstratesFullSystem ? 1 : MASTERY_THRESHOLD - 0.05,
        },
        detectedMisconceptions: [...misconceptions],
        confidence,
    };
}

export function mergeDiagnosticAnalysis(
    deterministic: DeterministicDiagnostic,
    modelAnalysis: DiagnosticModelAnalysis,
    concept: Concept,
): DiagnosticResult {
    const objectiveIds = new Set(concept.objectives.map((objective) => objective.id));
    const misconceptionIds = new Set(
        concept.misconceptions.map((misconception) => misconception.id),
    );
    const modelMastery = modelAnalysis.masteryByObjective ?? modelAnalysis.milestones ?? {};
    const modelMisconceptions = modelAnalysis.detectedMisconceptions ?? Object.entries(
        modelAnalysis.misconceptions ?? {},
    ).filter(([, active]) => active).map(([id]) => id);
    const initialMasteryByObjective = Object.fromEntries(
        concept.objectives.map((objective) => {
            const fixedScore = deterministic.masteryByObjective[objective.id] ?? 0;
            const modelScore = modelMastery[objective.id];
            const maximumScore = deterministic.maximumMasteryByObjective[objective.id] ?? 1;
            return [
                objective.id,
                clamp(Math.min(
                    maximumScore,
                    typeof modelScore === "number" ? Math.max(fixedScore, modelScore) : fixedScore,
                )),
            ];
        }),
    );
    const activeMisconceptions = [
        ...new Set([
            ...deterministic.detectedMisconceptions,
            ...modelMisconceptions.filter((id) => misconceptionIds.has(id)),
        ]),
    ];
    const scores = Object.entries(initialMasteryByObjective)
        .filter(([id]) => objectiveIds.has(id))
        .map(([, score]) => score);
    const average = scores.reduce((sum, score) => sum + score, 0) / Math.max(scores.length, 1);
    const explanationDepth = average < 0.35
        ? "foundational"
        : average < 0.65
            ? "guided"
            : "concise";
    const modelConfidence = normalizeModelConfidence(modelAnalysis.confidence);

    return {
        initialMasteryByObjective,
        activeMisconceptions,
        confidence: modelConfidence !== undefined
            ? clamp((deterministic.confidence + modelConfidence) / 2)
            : deterministic.confidence,
        explanationDepth,
        knowledgeSummary: modelAnalysis.learnerSummary,
    };
}

export function learnerModelFromDiagnostic(
    result: DiagnosticResult,
    concept: Concept,
): LearnerModel {
    const lessonComplete = concept.objectives.every(
        (objective) => (result.initialMasteryByObjective[objective.id] ?? 0) >= MASTERY_THRESHOLD,
    );
    const focusObjective = lessonComplete
        ? null
        : pickNextFocus(result.initialMasteryByObjective, concept, []);

    return emptyLearnerModel({
        masteryByObjective: result.initialMasteryByObjective,
        activeMisconceptions: result.activeMisconceptions,
        confidence: result.confidence,
        focusObjective,
        lessonComplete,
        explanationDepth: result.explanationDepth,
    });
}
