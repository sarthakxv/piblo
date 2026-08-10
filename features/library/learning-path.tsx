"use client";

import { useCallback, useSyncExternalStore } from "react";
import { ArrowRight, Check, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { TopicDefinition } from "@/content/topics.ts";
import { readTopicSession } from "@/features/session/session-storage.ts";
import { cn } from "@/lib/utils.ts";
import {
    getLearningLevelHref,
    getLevelProgress,
    type LevelProgress,
} from "./learning-path-state.ts";

const subscribeToSessionStorage = (onStoreChange: () => void) => {
    window.addEventListener("storage", onStoreChange);
    return () => window.removeEventListener("storage", onStoreChange);
};

const getServerProgressSnapshot = () => "{}";

export function LearningPath({ topic }: { topic: TopicDefinition }) {
    const getProgressSnapshot = useCallback(() => JSON.stringify(
        Object.fromEntries(
            topic.levels.map((level) => [
                level.id,
                getLevelProgress(readTopicSession(topic.id, level.id)),
            ]),
        ),
    ), [topic]);
    const progressSnapshot = useSyncExternalStore(
        subscribeToSessionStorage,
        getProgressSnapshot,
        getServerProgressSnapshot,
    );
    const progressByLevelId = JSON.parse(progressSnapshot) as Readonly<
        Record<string, LevelProgress>
    >;

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
                {topic.levels.map((level, index) => {
                    const progress = progressByLevelId[level.id] ?? "not-started";
                    const complete = level.available && progress === "complete";
                    const buttonLabel = complete
                        ? "Recap"
                        : progress === "in-progress" ? "Continue path" : "Begin path";

                    return (
                        <article
                            key={level.id}
                            className={cn(
                                "rounded-xl border p-5 sm:p-6",
                                complete && "border-moss/35 bg-moss-soft",
                                level.available && !complete && "border-ink/35 bg-ink-soft",
                                !level.available && "border-rule bg-paper",
                            )}
                        >
                            <div className="flex items-start gap-4">
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        "flex size-9 shrink-0 items-center justify-center rounded-full font-notebook text-sm font-bold",
                                        complete && "bg-moss text-paper-raised",
                                        level.available && !complete && "bg-ink text-paper-raised",
                                        !level.available && "border border-rule-strong text-graphite-muted",
                                    )}
                                >
                                    {complete
                                        ? <Check className="size-5" strokeWidth={2.5} />
                                        : level.available ? index + 1 : <LockKeyhole className="size-4" />}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <h3 className="text-balance font-notebook text-2xl font-bold text-graphite">{level.name}</h3>
                                        <span className={cn(
                                            "text-[0.6875rem] font-bold uppercase tracking-wide",
                                            complete && "text-moss",
                                            level.available && !complete && "text-ink",
                                            !level.available && "text-graphite-muted",
                                        )}
                                        >
                                            {complete ? "Completed" : level.available ? "Available" : "Coming soon"}
                                        </span>
                                    </div>
                                    <p className="mt-2 max-w-2xl text-pretty text-sm leading-6 text-graphite-soft">{level.description}</p>
                                    {level.available ? (
                                        <Button
                                            nativeButton={false}
                                            render={<Link href={getLearningLevelHref(topic.id, level.id, progress)} />}
                                            className={cn(
                                                "mt-5 px-5 text-paper-raised",
                                                complete ? "bg-moss hover:bg-moss/90" : "bg-graphite hover:bg-ink",
                                            )}
                                        >
                                            {buttonLabel}
                                            <ArrowRight aria-hidden="true" className="size-4" />
                                        </Button>
                                    ) : null}
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
