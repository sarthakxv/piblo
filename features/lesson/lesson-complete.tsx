"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { LessonAnswers } from "@/domain/lesson/types.ts";

export function LessonComplete({
    answers,
    onTryAnotherApplication,
}: {
    answers: LessonAnswers;
    onTryAnotherApplication: () => void;
}) {
    return (
        <main className="min-h-dvh px-5 py-8 sm:px-8">
            <div className="mx-auto max-w-5xl">
                <header className="flex items-center justify-between border-b border-rule pb-5">
                    <Link href="/library" className="font-notebook text-2xl font-bold">Piblo</Link>
                    <span className="text-sm text-graphite-muted">Lesson complete</span>
                </header>

                <section className="py-10 sm:py-16">
                    <p className="text-sm font-bold text-moss">Your Thinking Trail</p>
                    <h1 className="mt-3 max-w-3xl text-balance font-notebook text-4xl font-bold leading-tight sm:text-5xl">
                        You changed more than your answer—you changed your explanation.
                    </h1>

                    <div className="mt-10 grid gap-6 lg:grid-cols-2">
                        <article className="rounded-xl border border-rule bg-paper-raised p-6">
                            <p className="text-xs font-bold uppercase text-graphite-muted">At the start</p>
                            <p className="mt-3 font-notebook text-2xl leading-9 text-graphite">
                                “Most of the plant&apos;s mass comes from {answers.prediction === "Something else" ? answers.predictionOther : answers.prediction.toLowerCase()}.”
                            </p>
                        </article>
                        <article className="rounded-xl border border-moss/35 bg-moss-soft p-6">
                            <p className="text-xs font-bold uppercase text-moss">Now</p>
                            <p className="mt-3 font-notebook text-2xl leading-9 text-graphite">“{answers.reflection}”</p>
                        </article>
                    </div>

                    <article className="mt-6 border-l-4 border-amber-ink bg-amber-note px-6 py-5">
                        <p className="text-sm font-bold text-amber-ink">Evidence that changed your mind</p>
                        <p className="mt-2 text-pretty leading-7 text-graphite">{answers.reflectionEvidence}</p>
                    </article>

                    <div className="mt-10 flex flex-wrap gap-3">
                        <Button type="button" onClick={onTryAnotherApplication} className="bg-graphite px-5 text-paper-raised">Try another application</Button>
                        <Button render={<Link href="/library" />} variant="outline" className="border-rule-strong bg-paper-raised px-5 text-graphite">Browse more lessons</Button>
                    </div>
                </section>
            </div>
        </main>
    );
}
