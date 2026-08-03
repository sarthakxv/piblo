import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Concept } from "@/content/concepts/types.ts";
import { CompletedMilestoneRecap } from "./completed-milestone-recap.tsx";
import { ReviewFlashcards } from "./review-flashcards.tsx";

export function TopicComplete({
    concept,
    onRestart,
}: {
    concept: Concept;
    onRestart: () => void;
}) {
    return (
        <main className="min-h-dvh">
            <header className="border-b border-rule px-5 py-5 sm:px-8 lg:px-12">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                    <Link href="/library" className="font-notebook text-2xl font-bold text-graphite">Piblo</Link>
                    <span className="text-sm font-semibold text-moss">Understanding trail complete</span>
                </div>
            </header>

            <CompletedMilestoneRecap concept={concept} />

            <section className="border-t border-rule bg-paper-raised px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
                <div className="mx-auto max-w-6xl">
                    <ReviewFlashcards cards={concept.reviewCards} />

                    <div className="mt-12 flex flex-wrap gap-3 border-t border-rule pt-6">
                        <Button nativeButton={false} render={<Link href="/library" />} className="bg-graphite px-5 text-paper-raised hover:bg-ink">Back to topics</Button>
                        <Button type="button" variant="outline" onClick={onRestart} className="border-rule-strong bg-paper-raised">
                            <RotateCcw aria-hidden="true" className="size-4" />
                            Restart this path
                        </Button>
                    </div>
                </div>
            </section>
        </main>
    );
}
