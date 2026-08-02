"use client";

import { ChoiceGroup, FieldLabel, NotebookTextarea } from "./move-shared.tsx";
import type { LearningMoveProps } from "./types.ts";

export function ApplicationMove({ answers, updateAnswers }: LearningMoveProps) {
    const options = [
        "It keeps photosynthesizing normally",
        "It cannot photosynthesize without light",
        "It replaces light with nutrients from soil",
    ];

    return (
        <>
            <p className="text-xs font-bold uppercase text-graphite-muted">Apply</p>
            <h1 id="move-title" className="mt-3 max-w-3xl text-balance font-notebook text-3xl font-bold leading-tight sm:text-4xl">
                A healthy plant has water and carbon dioxide but is kept in total darkness. What changes?
            </h1>
            <p className="mt-4 max-w-2xl text-pretty leading-7 text-graphite-soft">
                Use your rule on a situation we did not use to build it.
            </p>

            <fieldset className="mt-8">
                <legend className="text-sm font-semibold">Choose an outcome</legend>
                <ChoiceGroup
                    value={answers.application}
                    idPrefix="application"
                    choices={options.map((option) => ({ value: option, label: option }))}
                    onValueChange={(application) => updateAnswers({ application })}
                    className="mt-3"
                />
            </fieldset>

            <div className="mt-6">
                <FieldLabel htmlFor="application-reason">Explain the mechanism, not only the outcome</FieldLabel>
                <NotebookTextarea
                    id="application-reason"
                    value={answers.applicationReason}
                    onChange={(applicationReason) => updateAnswers({ applicationReason })}
                    placeholder="This happens because…"
                />
            </div>
        </>
    );
}
