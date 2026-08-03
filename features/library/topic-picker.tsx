"use client";

import { useId, useState } from "react";
import { Combobox } from "@base-ui/react/combobox";
import { ChevronDown } from "lucide-react";
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
    const topicInputId = useId();

    const selectTopic = (topic: TopicDefinition | null) => {
        if (!topic) return;

        onSelectTopic(topic.id);
        setExploreNoticeVisible(false);
    };

    return (
        <aside className="flex flex-col border-b border-rule bg-paper-inset/55 p-5 sm:p-7 lg:border-r lg:border-b-0">
            <div>
                <Combobox.Root
                    items={TOPICS}
                    value={selectedTopic}
                    onValueChange={selectTopic}
                    itemToStringLabel={(topic) => topic.name}
                    itemToStringValue={(topic) => topic.id}
                    autoHighlight
                >
                    <label htmlFor={topicInputId} className="text-xs font-bold uppercase tracking-wide text-graphite-soft">Topic</label>
                    <Combobox.InputGroup className="relative mt-3 flex min-h-14 items-center rounded-lg border border-rule-strong bg-paper-raised focus-within:border-ink focus-within:ring-2 focus-within:ring-ink/20">
                        <Combobox.Input
                            id={topicInputId}
                            placeholder="Search topics"
                            className="min-h-14 w-full min-w-0 rounded-lg bg-transparent px-4 py-3 pr-12 font-semibold text-graphite outline-none placeholder:text-graphite-muted"
                        />
                        <Combobox.Trigger
                            aria-label="Show topics"
                            className="group absolute right-1 flex size-11 items-center justify-center rounded-md text-graphite-muted outline-none hover:text-graphite focus-visible:ring-2 focus-visible:ring-ink/40 data-popup-open:text-graphite"
                        >
                            <ChevronDown aria-hidden="true" className="size-5 group-data-[popup-open]:rotate-180" strokeWidth={2.25} />
                        </Combobox.Trigger>
                    </Combobox.InputGroup>

                    <Combobox.Portal>
                        <Combobox.Positioner className="z-50 outline-none" sideOffset={8}>
                            <Combobox.Popup className="w-[var(--anchor-width)] max-w-[var(--available-width)] rounded-lg border border-rule bg-paper-raised p-2 text-graphite">
                                <Combobox.Empty className="px-3 py-4 text-sm leading-6 text-graphite-soft">
                                    No topics match. Try another search.
                                </Combobox.Empty>
                                <Combobox.List className="max-h-[min(24rem,var(--available-height))] overflow-y-auto overscroll-contain outline-none data-empty:p-0">
                                    {(topic: TopicDefinition) => (
                                        <Combobox.Item
                                            key={topic.id}
                                            value={topic}
                                            className={({ highlighted, selected }) => cn(
                                                "cursor-pointer rounded-md px-3 py-3 text-left text-graphite-soft outline-none select-none",
                                                selected
                                                    ? "bg-ink-soft text-graphite"
                                                    : highlighted
                                                        ? "bg-paper-inset text-graphite"
                                                        : "hover:bg-paper-inset hover:text-graphite",
                                            )}
                                        >
                                            <span className="block text-sm font-semibold">{topic.name}</span>
                                            <span className="mt-1 block text-xs leading-5 text-graphite-soft">{topic.levels.length} levels</span>
                                        </Combobox.Item>
                                    )}
                                </Combobox.List>
                            </Combobox.Popup>
                        </Combobox.Positioner>
                    </Combobox.Portal>
                </Combobox.Root>
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
