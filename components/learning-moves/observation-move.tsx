"use client";

import { ChoiceGroup } from "./move-shared.tsx";
import type { LearningMoveProps } from "./types.ts";

const OBSERVATIONS = [
    ["The soil loss is too small", "Less than 1 kg cannot explain 50 kg of growth."],
    ["The plant must be mostly water", "Water may matter, but the evidence does not show that yet."],
    ["The numbers do not tell us anything", "There is no useful relationship here."],
];

export function ObservationMove({ answers, updateAnswers }: LearningMoveProps) {
    return (
        <>
            <p className="text-xs font-bold uppercase text-graphite-muted">Observation</p>
            <h1 id="move-title" className="mt-3 max-w-3xl text-balance font-notebook text-3xl font-bold leading-tight sm:text-4xl">
                What does this evidence make difficult to explain?
            </h1>
            <p className="mt-4 max-w-2xl text-pretty leading-7 text-graphite-soft">
                A tree was grown in a large container. Its mass and the soil&apos;s mass were measured carefully.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <article className="rounded-lg border border-rule bg-paper p-5">
                    <p className="text-xs font-bold uppercase text-graphite-muted">Plant mass gained</p>
                    <p className="mt-2 tabular-nums font-notebook text-4xl font-bold text-graphite">50 kg</p>
                </article>
                <article className="rounded-lg border border-rule bg-paper p-5">
                    <p className="text-xs font-bold uppercase text-graphite-muted">Soil mass lost</p>
                    <p className="mt-2 tabular-nums font-notebook text-4xl font-bold text-graphite">&lt; 1 kg</p>
                </article>
            </div>

            <fieldset className="mt-7">
                <legend className="text-sm font-semibold">Choose the observation you would investigate</legend>
                <ChoiceGroup
                    value={answers.observation}
                    idPrefix="observation"
                    choices={OBSERVATIONS.map(([label, description]) => ({ value: label, label, description }))}
                    onValueChange={(observation) => updateAnswers({ observation })}
                    className="mt-3"
                />
            </fieldset>
        </>
    );
}
