import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ReflectionMove } from "@/components/learning-moves/reflection-move.tsx";
import type { Concept } from "@/content/concepts/types.ts";
import type { LessonAnswers } from "@/domain/lesson/types.ts";
import { canSubmitMove } from "@/domain/lesson/transitions.ts";
import type { TopicSession } from "@/features/session/session-schema.ts";
import { DesktopMilestoneTrail, MobileMilestoneTrail } from "./milestone-trail.tsx";

export function ReflectionStage({
    concept,
    session,
    onUpdateAnswers,
    onComplete,
}: {
    concept: Concept;
    session: TopicSession & { learnerModel: NonNullable<TopicSession["learnerModel"]> };
    onUpdateAnswers: (update: Partial<LessonAnswers>) => void;
    onComplete: () => void;
}) {
    return (
        <main className="min-h-dvh lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
            <DesktopMilestoneTrail concept={concept} learnerModel={session.learnerModel} initialMasteryByObjective={session.initialMasteryByObjective} />
            <section className="min-w-0">
                <header className="border-b border-rule bg-paper-raised">
                    <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
                        <div>
                            <Link href="/library" className="font-notebook text-xl font-bold text-graphite lg:hidden">Piblo</Link>
                            <p className="hidden text-sm font-semibold text-graphite lg:block">One last step</p>
                            <p className="text-xs text-graphite-muted">Look back at how your explanation changed</p>
                        </div>
                        <MobileMilestoneTrail concept={concept} learnerModel={session.learnerModel} initialMasteryByObjective={session.initialMasteryByObjective} />
                    </div>
                </header>
                <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
                    <section aria-labelledby="move-title" className="rounded-xl border border-rule bg-paper-raised p-5 sm:p-8 lg:p-10">
                        <ReflectionMove answers={session.answers} updateAnswers={onUpdateAnswers} />
                        <div className="mt-8 flex justify-end border-t border-rule pt-5">
                            <Button type="button" disabled={!canSubmitMove(5, session.answers)} onClick={onComplete} className="bg-graphite px-5 text-paper-raised hover:bg-ink">
                                Finish my understanding trail
                            </Button>
                        </div>
                    </section>
                </div>
            </section>
        </main>
    );
}
