import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { AppHeader } from "@/components/app-header.tsx";
import { Button } from "@/components/ui/button";
import type { Concept } from "@/content/concepts/types.ts";
import { CompletedMilestoneRecap } from "./completed-milestone-recap.tsx";
import { ReviewFlashcards } from "./review-flashcards.tsx";

export function TopicComplete({
    concept,
    learnerName,
    onRestart,
}: {
    concept: Concept;
    learnerName: string;
    onRestart: () => void;
}) {
    return (
        <main className="min-h-dvh px-5 py-6 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-7xl">
                <AppHeader learnerName={learnerName} />
            </div>

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
