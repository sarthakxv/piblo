import { Check, CircleDot } from "lucide-react";
import Link from "next/link";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { Concept } from "@/content/concepts/types.ts";
import type { LearnerModel } from "@/domain/learner-model/types.ts";
import { deriveMilestoneStates, type MilestoneState } from "@/domain/learner-model/milestones.ts";
import { cn } from "@/lib/utils";

function TrailItems({ milestones }: { milestones: MilestoneState[] }) {
    return (
        <ol className="mt-7">
            {milestones.map((milestone, index) => {
                const done = milestone.status === "complete" || milestone.status === "already-understood";
                const current = milestone.status === "current";

                return (
                    <li
                        key={milestone.id}
                        aria-current={current ? "step" : undefined}
                        className="relative grid grid-cols-[1.25rem_minmax(0,1fr)] gap-3 pb-8 last:pb-0"
                    >
                        {index < milestones.length - 1 ? (
                            <span aria-hidden="true" className={cn(
                                "absolute left-[0.5625rem] top-5 h-[calc(100%-0.25rem)] w-px",
                                done ? "bg-moss/55" : "bg-rule-strong",
                            )} />
                        ) : null}
                        <span aria-hidden="true" className={cn(
                            "relative z-10 mt-0.5 flex size-5 items-center justify-center rounded-full border-2 bg-paper",
                            done && "border-moss bg-moss text-paper-raised",
                            current && "border-ink bg-ink-soft text-ink",
                            milestone.status === "upcoming" && "border-rule-strong text-graphite-muted",
                        )}>
                            {done ? <Check className="size-3" strokeWidth={3} /> : current ? <CircleDot className="size-3" /> : null}
                        </span>
                        <div className="min-w-0">
                            <p className={cn(
                                "text-sm font-semibold leading-5",
                                current ? "text-ink" : done ? "text-graphite" : "text-graphite-muted",
                            )}>{milestone.title}</p>
                            {milestone.status === "already-understood" ? (
                                <p className="mt-1 text-[0.6875rem] font-bold uppercase tracking-wide text-moss">Already understood</p>
                            ) : milestone.status === "complete" ? (
                                <p className="mt-1 text-[0.6875rem] font-bold uppercase tracking-wide text-moss">Understood</p>
                            ) : current ? (
                                <p className="mt-1 text-[0.6875rem] font-bold uppercase tracking-wide text-ink">Working here</p>
                            ) : null}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}

export function DesktopMilestoneTrail({
    concept,
    learnerModel,
    initialMasteryByObjective,
}: {
    concept: Concept;
    learnerModel: LearnerModel | null;
    initialMasteryByObjective: Record<string, number>;
}) {
    const milestones = deriveMilestoneStates(concept, learnerModel, initialMasteryByObjective);

    return (
        <aside className="sticky top-0 hidden h-dvh border-r border-rule bg-paper px-6 py-6 lg:block">
            <Link href="/library" className="font-notebook text-2xl font-bold text-graphite">Piblo</Link>
            <div className="mt-12">
                <p className="text-xs font-bold uppercase tracking-wide text-graphite-muted">Understanding trail</p>
                <h2 className="mt-2 font-notebook text-2xl font-bold text-graphite">{concept.title}</h2>
                <p className="mt-2 text-xs leading-5 text-graphite-soft">Your path changes as Piblo learns what you understand.</p>
            </div>
            <TrailItems milestones={milestones} />
        </aside>
    );
}

export function MobileMilestoneTrail({
    concept,
    learnerModel,
    initialMasteryByObjective,
}: {
    concept: Concept;
    learnerModel: LearnerModel | null;
    initialMasteryByObjective: Record<string, number>;
}) {
    const milestones = deriveMilestoneStates(concept, learnerModel, initialMasteryByObjective);

    return (
        <Sheet>
            <SheetTrigger render={<Button type="button" variant="outline" className="border-rule-strong bg-paper-raised lg:hidden" />}>
                Understanding trail
            </SheetTrigger>
            <SheetContent className="border-rule bg-paper p-6">
                <SheetHeader className="p-0">
                    <SheetTitle className="font-notebook text-2xl font-bold text-graphite">{concept.title}</SheetTitle>
                    <SheetDescription className="text-graphite-soft">The milestones Piblo is helping you build.</SheetDescription>
                </SheetHeader>
                <TrailItems milestones={milestones} />
            </SheetContent>
        </Sheet>
    );
}
