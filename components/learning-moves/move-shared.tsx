"use client";

import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface Choice {
    value: string;
    label: ReactNode;
    description?: string;
}

export function ChoiceGroup({
    value,
    choices,
    onValueChange,
    idPrefix,
    className,
    itemClassName,
}: {
    value: string;
    choices: Choice[];
    onValueChange: (value: string) => void;
    idPrefix: string;
    className?: string;
    itemClassName?: string;
}) {
    return (
        <RadioGroup value={value} onValueChange={onValueChange} className={className}>
            {choices.map((choice) => {
                const id = `${idPrefix}-${choice.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

                return (
                    <Label
                        key={choice.value}
                        htmlFor={id}
                        className={cn(
                            "flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors duration-150",
                            "border-rule bg-paper-raised text-graphite hover:border-rule-strong",
                            "has-data-checked:border-ink has-data-checked:bg-ink-soft",
                            itemClassName,
                        )}
                    >
                        <RadioGroupItem id={id} value={choice.value} className="mt-0.5" />
                        <span>
                            <span className="block">{choice.label}</span>
                            {choice.description ? (
                                <span className="mt-1 block text-xs font-normal leading-5 text-graphite-soft">
                                    {choice.description}
                                </span>
                            ) : null}
                        </span>
                    </Label>
                );
            })}
        </RadioGroup>
    );
}

export function FieldLabel({
    children,
    htmlFor,
    optional = false,
}: {
    children: ReactNode;
    htmlFor?: string;
    optional?: boolean;
}) {
    return (
        <Label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-graphite">
            {children}
            {optional ? (
                <span className="ml-2 font-normal text-graphite-muted">Optional</span>
            ) : null}
        </Label>
    );
}

export function NotebookTextarea({
    id,
    value,
    onChange,
    placeholder,
    rows = 3,
}: {
    id: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    rows?: number;
}) {
    return (
        <Textarea
            id={id}
            value={value}
            rows={rows}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="w-full resize-y rounded-lg border-rule bg-paper-inset px-4 py-3 text-base text-graphite shadow-none placeholder:text-graphite-muted focus-visible:border-ink"
        />
    );
}
