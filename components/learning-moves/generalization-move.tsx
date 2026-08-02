"use client";

import { Input } from "@/components/ui/input";
import type { LessonAnswers } from "@/domain/lesson/types.ts";
import type { LearningMoveProps } from "./types.ts";

type GeneralizationField = [keyof LessonAnswers["generalization"], string];

function BlankInput({
    field,
    value,
    onChange,
}: {
    field: GeneralizationField;
    value: string;
    onChange: (value: string) => void;
}) {
    const [key, label] = field;

    return (
        <span className="mx-2 inline-block">
            <label htmlFor={`generalization-${key}`} className="sr-only">{label}</label>
            <Input
                id={`generalization-${key}`}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={label}
                className="h-auto w-44 rounded-none border-0 border-b-2 border-ink bg-transparent px-2 py-1 font-sans text-base shadow-none focus-visible:border-ink"
            />
        </span>
    );
}

export function GeneralizationMove({ answers, updateAnswers }: LearningMoveProps) {
    const fields: GeneralizationField[] = [
        ["energy", "type of energy"],
        ["firstInput", "first input"],
        ["secondInput", "second input"],
        ["output", "stored-energy output"],
    ];

    return (
        <>
            <p className="text-xs font-bold uppercase text-graphite-muted">Generalize</p>
            <h1 id="move-title" className="mt-3 max-w-3xl text-balance font-notebook text-3xl font-bold leading-tight sm:text-4xl">
                Turn your explanation into a rule.
            </h1>
            <p className="mt-4 max-w-2xl text-pretty leading-7 text-graphite-soft">
                Complete the sentence so it would still be true for many different plants.
            </p>

            <div className="mt-8 rounded-lg border border-rule bg-paper p-5 sm:p-7">
                <p className="font-notebook text-xl leading-10 sm:text-2xl">
                    Plants use
                    <BlankInput
                        field={fields[0]}
                        value={answers.generalization.energy}
                        onChange={(energy) => updateAnswers({ generalization: { ...answers.generalization, energy } })}
                    />
                    energy to transform
                    <BlankInput
                        field={fields[1]}
                        value={answers.generalization.firstInput}
                        onChange={(firstInput) => updateAnswers({ generalization: { ...answers.generalization, firstInput } })}
                    />
                    and
                    <BlankInput
                        field={fields[2]}
                        value={answers.generalization.secondInput}
                        onChange={(secondInput) => updateAnswers({ generalization: { ...answers.generalization, secondInput } })}
                    />
                    into
                    <BlankInput
                        field={fields[3]}
                        value={answers.generalization.output}
                        onChange={(output) => updateAnswers({ generalization: { ...answers.generalization, output } })}
                    />.
                </p>
            </div>
        </>
    );
}
