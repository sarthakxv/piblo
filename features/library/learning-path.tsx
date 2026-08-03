"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { TopicDefinition } from "@/content/topics.ts";
import { cn } from "@/lib/utils";

export function LearningPath({
    topic,
    expandedLevelId,
    onToggleLevel,
}: {
    topic: TopicDefinition;
    expandedLevelId: string | null;
    onToggleLevel: (levelId: string) => void;
}) {
    return (
        <section aria-labelledby="topic-path-title" className="min-w-0 p-5 sm:p-7 lg:p-9">
            <div className="border-b border-rule pb-6">
                <p className="text-xs font-bold uppercase tracking-wide text-graphite-soft">Learning path</p>
                <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                    <h2 id="topic-path-title" className="font-notebook text-3xl font-bold text-graphite">{topic.name}</h2>
                    <p className="text-xs font-semibold text-graphite-soft">{topic.levels.length} levels</p>
                </div>
            </div>

            <div className="mt-3">
                {topic.levels.map((level, index) => {
                    const expanded = level.id === expandedLevelId;
                    const panelId = `level-${topic.id}-${level.id}`;

                    return (
                        <article key={level.id} className="border-b border-rule last:border-b-0">
                            <button
                                type="button"
                                aria-expanded={expanded}
                                aria-controls={panelId}
                                onClick={() => onToggleLevel(level.id)}
                                className={cn("group flex w-full items-center gap-4 px-1 py-5 text-left transition-colors duration-150 sm:px-3", expanded ? "text-ink" : "text-graphite hover:text-ink")}
                            >
                                <span aria-hidden="true" className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-notebook text-sm font-bold tabular-nums", expanded ? "border-ink bg-ink text-paper-raised" : "border-rule-strong bg-paper text-graphite-soft")}>{index + 1}</span>
                                <span className="min-w-0 flex-1">
                                    <span className="block font-notebook text-xl font-bold">{level.name}</span>
                                    <span className="mt-1 block text-sm leading-6 text-graphite-soft">{level.description}</span>
                                </span>
                                <span className="flex shrink-0 items-center gap-3">
                                    <span className="hidden text-xs font-semibold text-graphite-soft sm:block">{level.lessons.length} lessons</span>
                                    <span aria-hidden="true" className={cn("text-graphite-muted transition-transform duration-150", expanded && "rotate-180")}>⌄</span>
                                </span>
                            </button>

                            <div id={panelId} hidden={!expanded} className="mb-5 ml-5 border-l-2 border-ink/30 pl-7 sm:ml-7 sm:pl-9">
                                {expanded ? (
                                    <ol className="grid gap-2">
                                        {level.lessons.map((lesson, lessonIndex) => (
                                            <li key={lesson.id}>
                                                {lesson.available ? (
                                                    <Button nativeButton={false} render={<Link href={`/learn/${lesson.id}`} />} variant="outline" className="h-auto w-full justify-start whitespace-normal border-ink/35 bg-ink-soft px-4 py-3 text-left hover:border-ink hover:bg-ink-soft">
                                                            <span className="pt-0.5 font-notebook text-sm font-bold tabular-nums text-graphite-soft">{index + 1}.{lessonIndex + 1}</span>
                                                            <span className="min-w-0 flex-1">
                                                                <span className="flex flex-wrap items-center justify-between gap-2">
                                                                    <span className="font-semibold text-graphite">{lesson.title}</span>
                                                                    <span className="text-[0.6875rem] font-bold uppercase tracking-wide text-ink">Start lesson</span>
                                                                </span>
                                                                <span className="mt-1 block text-xs leading-5 text-graphite-soft">{lesson.description}</span>
                                                            </span>
                                                    </Button>
                                                ) : (
                                                    <div className="flex w-full items-start gap-4 rounded-lg border border-transparent bg-paper px-4 py-3 text-left text-graphite-soft">
                                                        <span className="pt-0.5 font-notebook text-sm font-bold tabular-nums">{index + 1}.{lessonIndex + 1}</span>
                                                        <span className="min-w-0 flex-1">
                                                            <span className="flex flex-wrap items-center justify-between gap-2">
                                                                <span className="font-semibold text-graphite">{lesson.title}</span>
                                                                <span className="text-[0.6875rem] font-bold uppercase tracking-wide text-graphite-muted">Soon</span>
                                                            </span>
                                                            <span className="mt-1 block text-xs leading-5 text-graphite-soft">{lesson.description}</span>
                                                        </span>
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ol>
                                ) : null}
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
