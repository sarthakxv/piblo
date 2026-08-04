"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldLabel } from "@/components/learning-moves/move-shared.tsx";
import { DateOfBirthField } from "./date-of-birth-field.tsx";
import { parseDateOfBirth, type DateOfBirthParts } from "@/features/learner-profile/profile-schema.ts";
import { useLearnerProfile } from "@/features/learner-profile/use-learner-profile.ts";
import { cn } from "@/lib/utils";

interface OnboardingFormProps {
    initialName: string;
    email: string | null;
}

export function OnboardingForm({ initialName, email }: OnboardingFormProps) {
    const router = useRouter();
    const { saveProfile } = useLearnerProfile();
    const [name, setName] = useState(initialName);
    const [dateOfBirth, setDateOfBirth] = useState<DateOfBirthParts>({ day: "", month: "", year: "" });
    const [errors, setErrors] = useState<{ name?: string; dateOfBirth?: string; form?: string }>({});
    const [submitting, setSubmitting] = useState(false);
    const nameRef = useRef<HTMLInputElement>(null);
    const dateOfBirthDayRef = useRef<HTMLInputElement>(null);

    const updateDateOfBirth = (part: keyof DateOfBirthParts, value: string) => {
        setDateOfBirth((current) => ({ ...current, [part]: value }));
        if (errors.dateOfBirth) setErrors((current) => ({ ...current, dateOfBirth: undefined }));
    };

    const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
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

        setSubmitting(true);
        const saved = await saveProfile({ name: normalizedName, dateOfBirth: normalizedDateOfBirth });
        if (!saved) {
            setSubmitting(false);
            setErrors({ form: "Could not save your profile. Check your connection and try again." });
            return;
        }
        router.push("/library");
    };

    return (
        <main className="min-h-dvh px-5 py-6 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-6xl">
                <header>
                    <img src="/logo-text.svg" alt="Piblo" className="h-7 w-auto" />
                </header>

                <div className="grid py-10 lg:min-h-[calc(100dvh-7rem)] lg:place-items-center lg:py-16">
                    <section aria-labelledby="onboarding-title" className="w-full max-w-md rounded-xl border border-rule bg-paper-raised p-6 sm:p-8">
                        <div className="h-1 w-16 rounded-full bg-ink" aria-hidden="true" />
                        <p className="mt-7 text-xs font-bold uppercase tracking-wide text-graphite-soft">One last step</p>
                        <h2 id="onboarding-title" className="mt-3 text-balance font-notebook text-3xl font-bold leading-tight text-graphite">Let&apos;s set up your learning space.</h2>
                        <p className="mt-3 text-pretty text-sm leading-6 text-graphite-soft">
                            {email ? `Signed in as ${email}. ` : ""}Just tell us what to call you — the rest comes from your Google account.
                        </p>

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
                            <Button type="submit" disabled={submitting} className="mt-7 min-h-12 w-full bg-graphite px-5 font-semibold text-paper-raised hover:bg-ink">
                                {submitting ? "Saving…" : "Continue to Piblo"}
                            </Button>
                            {errors.form ? <p role="alert" className="mt-2 text-sm font-medium text-coral">{errors.form}</p> : null}
                            <p className="mt-4 text-center text-xs leading-5 text-graphite-soft">Saved to your account, so it follows you across devices.</p>
                        </form>
                    </section>
                </div>
            </div>
        </main>
    );
}
