"use client";

import { ArrowRight, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { TopicDefinition } from "@/content/topics.ts";

export function LearningPath({ topic }: { topic: TopicDefinition }) {
    return (
        <section aria-labelledby="topic-path-title" className="min-w-0 p-5 sm:p-7 lg:p-9">
            <div className="border-b border-rule pb-6">
                <p className="text-xs font-bold uppercase tracking-wide text-graphite-soft">Choose your level</p>
                <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                    <h2 id="topic-path-title" className="font-notebook text-3xl font-bold text-graphite">{topic.name}</h2>
                    <p className="text-xs font-semibold text-graphite-soft">2 levels</p>
                </div>
            </div>

            <div className="mt-6 grid gap-4">
                {topic.levels.map((level, index) => (
                    <article
                        key={level.id}
                        className={level.available
                            ? "rounded-xl border border-ink/35 bg-ink-soft p-5 sm:p-6"
                            : "rounded-xl border border-rule bg-paper p-5 sm:p-6"}
                    >
                        <div className="flex items-start gap-4">
                            <span
                                aria-hidden="true"
                                className={level.available
                                    ? "flex size-9 shrink-0 items-center justify-center rounded-full bg-ink font-notebook text-sm font-bold text-paper-raised"
                                    : "flex size-9 shrink-0 items-center justify-center rounded-full border border-rule-strong text-graphite-muted"}
                            >
                                {level.available ? index + 1 : <LockKeyhole className="size-4" />}
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h3 className="font-notebook text-2xl font-bold text-graphite">{level.name}</h3>
                                    <span className={level.available
                                        ? "text-[0.6875rem] font-bold uppercase tracking-wide text-ink"
                                        : "text-[0.6875rem] font-bold uppercase tracking-wide text-graphite-muted"}
                                    >
                                        {level.available ? "Available" : "Coming soon"}
                                    </span>
                                </div>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-graphite-soft">{level.description}</p>
                                {level.available ? (
                                    <Button
                                        nativeButton={false}
                                        render={<Link href={`/learn/${topic.id}/${level.id}`} />}
                                        className="mt-5 bg-graphite px-5 text-paper-raised hover:bg-ink"
                                    >
                                        Begin recommended path
                                        <ArrowRight aria-hidden="true" className="size-4" />
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
