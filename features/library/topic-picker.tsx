"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { TOPICS, type TopicDefinition } from "@/content/topics.ts";
import { cn } from "@/lib/utils";

export function TopicPicker({
    selectedTopic,
    onSelectTopic,
}: {
    selectedTopic: TopicDefinition;
    onSelectTopic: (topicId: string) => void;
}) {
    const [exploreNoticeVisible, setExploreNoticeVisible] = useState(false);
    const topicPickerRef = useRef<HTMLDetailsElement>(null);
    const topicSummaryRef = useRef<HTMLElement>(null);

    const selectTopic = (topicId: string) => {
        onSelectTopic(topicId);
        setExploreNoticeVisible(false);
        if (topicPickerRef.current) topicPickerRef.current.open = false;
        window.requestAnimationFrame(() => topicSummaryRef.current?.focus());
    };

    return (
        <aside className="flex flex-col border-b border-rule bg-paper-inset/55 p-5 sm:p-7 lg:border-r lg:border-b-0">
            <div>
                <p className="text-xs font-bold uppercase tracking-wide text-graphite-soft">Topic</p>
                <details ref={topicPickerRef} className="group relative mt-3">
                    <summary ref={topicSummaryRef} className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-lg border border-rule-strong bg-paper-raised px-4 py-3 font-semibold text-graphite transition-colors duration-150 marker:content-none hover:border-ink [&::-webkit-details-marker]:hidden">
                        <span>{selectedTopic.name}</span>
                        <span aria-hidden="true" className="text-graphite-muted transition-transform duration-150 group-open:rotate-180">⌄</span>
                    </summary>
                    <div className="absolute z-20 mt-2 w-full rounded-lg border border-rule bg-paper-raised p-2">
                        {TOPICS.map((topic) => {
                            const selected = topic.id === selectedTopic.id;
                            return (
                                <button
                                    key={topic.id}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() => selectTopic(topic.id)}
                                    className={cn("w-full rounded-md px-3 py-3 text-left transition-colors duration-150", selected ? "bg-ink-soft text-graphite" : "text-graphite-soft hover:bg-paper-inset hover:text-graphite")}
                                >
                                    <span className="block text-sm font-semibold">{topic.name}</span>
                                    <span className="mt-1 block text-xs leading-5 text-graphite-soft">{topic.levels.length} levels</span>
                                </button>
                            );
                        })}
                    </div>
                </details>
                <p className="mt-4 text-sm leading-6 text-graphite-soft">{selectedTopic.description}</p>
            </div>

            <div className="mt-8 lg:mt-auto lg:pt-8">
                {exploreNoticeVisible ? <p id="explore-topics-notice" role="status" className="mb-3 text-xs leading-5 text-graphite-soft">The full topic explorer is coming in the next iteration.</p> : null}
                <Button
                    type="button"
                    variant="outline"
                    aria-describedby={exploreNoticeVisible ? "explore-topics-notice" : undefined}
                    onClick={() => setExploreNoticeVisible(true)}
                    className="min-h-12 w-full border-rule-strong bg-paper-raised text-graphite hover:border-ink hover:text-ink"
                >
                    Explore topics
                </Button>
            </div>
        </aside>
    );
}
