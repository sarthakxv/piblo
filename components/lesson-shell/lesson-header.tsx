"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MobileThinkingTrail } from "./thinking-trail.tsx";

export function LessonHeader({
    phaseLabel,
    phaseIndex,
    trailSummaries,
    failNextTurn,
    onToggleFailure,
}: {
    phaseLabel: string;
    phaseIndex: number;
    trailSummaries: Array<string | undefined>;
    failNextTurn: boolean;
    onToggleFailure: () => void;
}) {
    return (
        <header className="border-b border-rule bg-paper-raised">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
                <div className="flex items-center gap-5">
                    <Link href="/library" className="font-notebook text-xl font-bold text-graphite">Piblo</Link>
                    <div className="hidden border-l border-rule pl-5 sm:block">
                        <p className="text-sm font-semibold text-graphite">Photosynthesis</p>
                        <p className="text-xs text-graphite-muted">{phaseLabel}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <MobileThinkingTrail phaseIndex={phaseIndex} summaries={trailSummaries} />
                    <details className="relative">
                        <summary className="cursor-pointer rounded-lg border border-rule-strong bg-paper-raised px-3 py-2 text-sm font-semibold">
                            Prototype states
                        </summary>
                        <div className="absolute right-0 z-20 mt-2 w-64 rounded-lg border border-rule bg-paper-raised p-4">
                            <p className="text-sm font-semibold">Failure recovery</p>
                            <p className="mt-1 text-xs leading-5 text-graphite-soft">Make the next submitted move fail once.</p>
                            <Button
                                type="button"
                                variant="outline"
                                aria-pressed={failNextTurn}
                                onClick={onToggleFailure}
                                className={failNextTurn ? "mt-3 w-full border-coral bg-coral-soft" : "mt-3 w-full border-rule-strong bg-paper"}
                            >
                                {failNextTurn ? "Failure armed" : "Simulate next failure"}
                            </Button>
                        </div>
                    </details>
                </div>
            </div>
        </header>
    );
}
