"use client";

import { FieldLabel, NotebookTextarea } from "./move-shared.tsx";
import type { LearningMoveProps } from "./types.ts";

export function ReflectionMove({ answers, updateAnswers }: LearningMoveProps) {
    const originalPrediction = answers.prediction === "Something else"
        ? answers.predictionOther
        : answers.prediction.toLowerCase();

    return (
        <>
            <p className="text-xs font-bold uppercase text-graphite-muted">Reflect</p>
            <h1 id="move-title" className="mt-3 max-w-3xl text-balance font-notebook text-3xl font-bold leading-tight sm:text-4xl">
                What changed between your first idea and your explanation now?
            </h1>

            <article className="mt-7 rounded-lg border border-rule bg-paper p-5">
                <p className="text-xs font-bold uppercase text-graphite-muted">Your first prediction</p>
                <p className="mt-2 font-notebook text-xl leading-8">
                    “Most of the plant&apos;s new material comes from {originalPrediction}.”
                </p>
            </article>

            <div className="mt-6">
                <FieldLabel htmlFor="reflection">What do you think now?</FieldLabel>
                <NotebookTextarea
                    id="reflection"
                    value={answers.reflection}
                    onChange={(reflection) => updateAnswers({ reflection })}
                    placeholder="I now think that…"
                    rows={4}
                />
            </div>

            <div className="mt-6">
                <FieldLabel htmlFor="reflection-evidence">Which evidence changed or strengthened your thinking?</FieldLabel>
                <NotebookTextarea
                    id="reflection-evidence"
                    value={answers.reflectionEvidence}
                    onChange={(reflectionEvidence) => updateAnswers({ reflectionEvidence })}
                    placeholder="The evidence that mattered was…"
                />
            </div>
        </>
    );
}
