"use client";

import { ChoiceGroup, FieldLabel, NotebookTextarea } from "./move-shared.tsx";
import type { LearningMoveProps } from "./types.ts";

const EXPLANATION_ITEMS = ["carbon dioxide", "water", "light"];

export function ExplanationMove({ answers, updateAnswers }: LearningMoveProps) {
    return (
        <>
            <p className="text-xs font-bold uppercase text-graphite-muted">Explanation</p>
            <h1 id="move-title" className="mt-3 max-w-3xl text-balance font-notebook text-3xl font-bold leading-tight sm:text-4xl">
                Which pieces belong in the plant&apos;s food-making process?
            </h1>
            <p className="mt-4 max-w-2xl text-pretty leading-7 text-graphite-soft">
                Decide what belongs, then explain how matter and energy play different roles.
            </p>

            <div className="mt-8 overflow-hidden rounded-lg border border-rule">
                {EXPLANATION_ITEMS.map((item, index) => (
                    <div key={item} className={`grid gap-3 bg-paper px-4 py-4 sm:grid-cols-[1fr_auto] ${index > 0 ? "border-t border-rule" : ""}`}>
                        <p className="self-center font-semibold capitalize">{item}</p>
                        <ChoiceGroup
                            value={answers.relationships[item] ?? ""}
                            idPrefix={`relationship-${item.replace(/\s+/g, "-")}`}
                            choices={[
                                { value: "part", label: "Part of it" },
                                { value: "not-part", label: "Not part" },
                            ]}
                            onValueChange={(value) => updateAnswers({
                                relationships: { ...answers.relationships, [item]: value as "part" | "not-part" },
                            })}
                            className="grid-cols-2"
                            itemClassName="min-h-0 px-3 py-2 text-xs"
                        />
                    </div>
                ))}
            </div>

            <div className="mt-6">
                <FieldLabel htmlFor="explanation">How could these pieces explain the plant&apos;s new material?</FieldLabel>
                <NotebookTextarea
                    id="explanation"
                    value={answers.explanation}
                    onChange={(explanation) => updateAnswers({ explanation })}
                    placeholder="The plant takes in… Light helps by…"
                    rows={4}
                />
            </div>
        </>
    );
}
