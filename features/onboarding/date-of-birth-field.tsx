"use client";

import { useRef, type KeyboardEvent, type RefObject } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { DateOfBirthParts } from "@/features/learner-profile/profile-schema.ts";

const FIELDS: Array<{
    part: keyof DateOfBirthParts;
    id: string;
    name: string;
    label: string;
    placeholder: string;
    autoComplete: string;
    maxLength: number;
    width: string;
}> = [
    { part: "day", id: "learner-birth-day", name: "birthDay", label: "Birth day", placeholder: "DD", autoComplete: "bday-day", maxLength: 2, width: "w-10" },
    { part: "month", id: "learner-birth-month", name: "birthMonth", label: "Birth month", placeholder: "MM", autoComplete: "bday-month", maxLength: 2, width: "w-10" },
    { part: "year", id: "learner-birth-year", name: "birthYear", label: "Birth year", placeholder: "YYYY", autoComplete: "bday-year", maxLength: 4, width: "w-20" },
];

export function DateOfBirthField({
    value,
    error,
    dayRef,
    onChange,
}: {
    value: DateOfBirthParts;
    error?: string;
    dayRef: RefObject<HTMLInputElement | null>;
    onChange: (part: keyof DateOfBirthParts, value: string) => void;
}) {
    const monthRef = useRef<HTMLInputElement>(null);
    const yearRef = useRef<HTMLInputElement>(null);
    const describedBy = error ? "learner-date-of-birth-hint learner-date-of-birth-error" : "learner-date-of-birth-hint";

    const fieldRef = (part: keyof DateOfBirthParts) => {
        if (part === "day") return dayRef;
        if (part === "month") return monthRef;
        return yearRef;
    };

    const handlePartChange = (part: keyof DateOfBirthParts, rawValue: string) => {
        const maxLength = part === "year" ? 4 : 2;
        const nextValue = rawValue.replace(/\D/g, "").slice(0, maxLength);
        onChange(part, nextValue);

        if (nextValue.length < maxLength) return;
        if (part === "day") monthRef.current?.focus();
        if (part === "month") yearRef.current?.focus();
    };

    const handlePartKeyDown = (part: keyof DateOfBirthParts, event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== "Backspace" || value[part].length > 0) return;
        if (part === "year") {
            event.preventDefault();
            monthRef.current?.focus();
        }
        if (part === "month") {
            event.preventDefault();
            dayRef.current?.focus();
        }
    };

    return (
        <fieldset className="mt-6">
            <legend className="mb-2 block text-sm font-semibold text-graphite">Date of birth</legend>
            <div className={cn("flex min-h-12 items-center rounded-lg border bg-paper-inset px-3", error ? "border-coral" : "border-rule")}>
                {FIELDS.map((field, index) => (
                    <div key={field.part} className="contents">
                        {index > 0 ? <span aria-hidden="true" className="px-1 text-rule-strong">/</span> : null}
                        <label htmlFor={field.id} className="sr-only">{field.label}</label>
                        <Input
                            ref={fieldRef(field.part)}
                            id={field.id}
                            name={field.name}
                            type="text"
                            inputMode="numeric"
                            autoComplete={field.autoComplete}
                            maxLength={field.maxLength}
                            required
                            value={value[field.part]}
                            aria-invalid={Boolean(error)}
                            aria-describedby={describedBy}
                            onChange={(event) => handlePartChange(field.part, event.target.value)}
                            onKeyDown={(event) => handlePartKeyDown(field.part, event)}
                            className={cn(field.width, "h-auto border-0 bg-transparent px-1 py-3 text-center text-base text-graphite shadow-none placeholder:text-graphite-soft focus-visible:ring-0")}
                            placeholder={field.placeholder}
                        />
                    </div>
                ))}
            </div>
            <p id="learner-date-of-birth-hint" className="mt-2 text-xs leading-5 text-graphite-soft">Use day, month, then year.</p>
            {error ? <p id="learner-date-of-birth-error" role="alert" className="mt-2 text-sm font-medium text-coral">{error}</p> : null}
        </fieldset>
    );
}
