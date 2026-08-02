"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldLabel } from "@/components/learning-moves/move-shared.tsx";
import { DateOfBirthField } from "./date-of-birth-field.tsx";
import { parseDateOfBirth, type DateOfBirthParts } from "@/features/learner-profile/profile-schema.ts";
import { useLearnerProfile } from "@/features/learner-profile/use-learner-profile.ts";
import { cn } from "@/lib/utils";

export function OnboardingForm() {
    const router = useRouter();
    const { profile, loaded, saveProfile } = useLearnerProfile();
    const [name, setName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState<DateOfBirthParts>({ day: "", month: "", year: "" });
    const [errors, setErrors] = useState<{ name?: string; dateOfBirth?: string }>({});
    const nameRef = useRef<HTMLInputElement>(null);
    const dateOfBirthDayRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (loaded && profile) router.replace("/library");
    }, [loaded, profile, router]);

    const updateDateOfBirth = (part: keyof DateOfBirthParts, value: string) => {
        setDateOfBirth((current) => ({ ...current, [part]: value }));
        if (errors.dateOfBirth) setErrors((current) => ({ ...current, dateOfBirth: undefined }));
    };

    const submitProfile = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const normalizedName = name.trim().replace(/\s+/g, " ");
        const normalizedDateOfBirth = parseDateOfBirth(
            dateOfBirth.day.padStart(2, "0"),
            dateOfBirth.month.padStart(2, "0"),
            dateOfBirth.year,
        );
        const nextErrors = {
            name: normalizedName ? undefined : "Enter your name to continue.",
            dateOfBirth: normalizedDateOfBirth ? undefined : "Enter a valid date in the past.",
        };
        setErrors(nextErrors);

        if (nextErrors.name) return nameRef.current?.focus();
        if (nextErrors.dateOfBirth || !normalizedDateOfBirth) return dateOfBirthDayRef.current?.focus();

        saveProfile({ version: 1, name: normalizedName, dateOfBirth: normalizedDateOfBirth });
        router.push("/library");
    };

    if (!loaded || profile) return <main className="min-h-dvh" aria-busy="true" />;

    return (
        <main className="min-h-dvh px-5 py-6 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-6xl">
                <header className="border-b border-rule pb-5">
                    <p className="font-notebook text-2xl font-bold text-graphite">Piblo</p>
                    <p className="text-xs text-graphite-soft">A learning space that thinks with you</p>
                </header>

                <div className="grid gap-10 py-10 lg:min-h-[calc(100dvh-7rem)] lg:grid-cols-[minmax(0,1fr)_28rem] lg:items-center lg:gap-16 lg:py-16">
                    <section className="max-w-2xl">
                        <p className="text-sm font-bold text-ink">A guided way to work ideas out</p>
                        <h1 className="mt-4 max-w-xl text-balance font-notebook text-4xl font-bold leading-tight text-graphite sm:text-5xl">Bring what you know. Leave with a clearer idea.</h1>
                        <p className="mt-6 max-w-xl text-pretty text-lg leading-8 text-graphite-soft">Piblo gives you evidence, small challenges, and the right amount of help while you build an explanation for yourself.</p>
                        <div className="mt-10 max-w-xl border-l-2 border-ink pl-5">
                            <p className="text-xs font-bold uppercase tracking-wide text-graphite-soft">Your thinking trail</p>
                            <ol className="mt-3 flex flex-wrap items-center gap-2 font-notebook text-lg font-semibold text-graphite">
                                <li>Prediction</li><li aria-hidden="true" className="text-rule-strong">→</li><li>Evidence</li><li aria-hidden="true" className="text-rule-strong">→</li><li>Explanation</li>
                            </ol>
                            <p className="mt-2 text-sm leading-6 text-graphite-soft">Start with your own idea, then make it stronger.</p>
                        </div>
                    </section>

                    <section aria-labelledby="onboarding-title" className="rounded-xl border border-rule bg-paper-raised p-6 sm:p-8">
                        <div className="h-1 w-16 rounded-full bg-ink" aria-hidden="true" />
                        <p className="mt-7 text-xs font-bold uppercase tracking-wide text-graphite-soft">Before we begin</p>
                        <h2 id="onboarding-title" className="mt-3 text-balance font-notebook text-3xl font-bold leading-tight text-graphite">Let&apos;s set up your learning space.</h2>
                        <p className="mt-3 text-pretty text-sm leading-6 text-graphite-soft">No account or password needed. Just tell us what to call you.</p>

                        <form className="mt-8" noValidate onSubmit={submitProfile}>
                            <FieldLabel htmlFor="learner-name">Your name</FieldLabel>
                            <Input
                                ref={nameRef}
                                id="learner-name"
                                name="name"
                                autoComplete="name"
                                maxLength={80}
                                required
                                value={name}
                                aria-invalid={Boolean(errors.name)}
                                aria-describedby={errors.name ? "learner-name-error" : undefined}
                                onChange={(event) => {
                                    setName(event.target.value);
                                    if (errors.name) setErrors((current) => ({ ...current, name: undefined }));
                                }}
                                className={cn("min-h-12 border-rule bg-paper-inset px-4 text-base shadow-none", errors.name && "border-coral")}
                                placeholder="What should Piblo call you?"
                            />
                            {errors.name ? <p id="learner-name-error" role="alert" className="mt-2 text-sm font-medium text-coral">{errors.name}</p> : null}

                            <DateOfBirthField value={dateOfBirth} error={errors.dateOfBirth} dayRef={dateOfBirthDayRef} onChange={updateDateOfBirth} />
                            <Button type="submit" className="mt-7 min-h-12 w-full bg-graphite px-5 font-semibold text-paper-raised hover:bg-ink">Continue to Piblo</Button>
                            <p className="mt-4 text-center text-xs leading-5 text-graphite-soft">For now, your details stay only in this browser.</p>
                        </form>
                    </section>
                </div>
            </div>
        </main>
    );
}
