"use client";

import { Input } from "@/components/ui/input";
import type { Confidence } from "@/domain/lesson/types.ts";
import { ChoiceGroup, FieldLabel, NotebookTextarea } from "./move-shared.tsx";
import type { LearningMoveProps } from "./types.ts";

export function PredictionMove({ answers, updateAnswers }: LearningMoveProps) {
    const options = ["Soil", "Water", "Air", "Sunlight", "Something else"];
    const confidenceOptions: Confidence[] = ["Guessing", "Somewhat sure", "Sure"];

    return (
        <>
            <p className="text-xs font-bold uppercase text-graphite-muted">Prediction</p>
            <h1 id="move-title" className="mt-3 max-w-3xl text-balance font-notebook text-3xl font-bold leading-tight sm:text-4xl">
                A young tree gains about 50 kg as it grows. Where does most of that new material come from?
            </h1>
            <p className="mt-4 max-w-2xl text-pretty leading-7 text-graphite-soft">
                Commit to what you think before we work it out. This is a starting point, not a test.
            </p>

            <fieldset className="mt-8">
                <legend className="text-sm font-semibold">Choose the closest answer</legend>
                <ChoiceGroup
                    value={answers.prediction}
                    idPrefix="prediction"
                    choices={options.map((option) => ({ value: option, label: option }))}
                    onValueChange={(prediction) => updateAnswers({ prediction })}
                    className="mt-3 sm:grid-cols-2"
                />
            </fieldset>

            {answers.prediction === "Something else" ? (
                <div className="mt-5">
                    <FieldLabel htmlFor="prediction-other">Your answer</FieldLabel>
                    <Input
                        id="prediction-other"
                        value={answers.predictionOther}
                        onChange={(event) => updateAnswers({ predictionOther: event.target.value })}
                        className="min-h-12 border-rule bg-paper-inset px-4 text-base shadow-none focus-visible:border-ink"
                    />
                </div>
            ) : null}

            <div className="mt-6">
                <FieldLabel htmlFor="prediction-reason" optional>Why does that seem likely?</FieldLabel>
                <NotebookTextarea
                    id="prediction-reason"
                    value={answers.predictionReason}
                    onChange={(predictionReason) => updateAnswers({ predictionReason })}
                    placeholder="I think this because…"
                />
            </div>

            <fieldset className="mt-6">
                <legend className="text-sm font-semibold">How sure are you?</legend>
                <ChoiceGroup
                    value={answers.confidence}
                    idPrefix="confidence"
                    choices={confidenceOptions.map((option) => ({ value: option, label: option }))}
                    onValueChange={(confidence) => updateAnswers({ confidence: confidence as Confidence })}
                    className="mt-3 flex flex-wrap"
                    itemClassName="min-h-0 py-2"
                />
            </fieldset>
        </>
    );
}
