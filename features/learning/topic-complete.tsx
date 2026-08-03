import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Concept } from "@/content/concepts/types.ts";
import type { TopicSession } from "@/features/session/session-schema.ts";

export function TopicComplete({
    concept,
    session,
    onRestart,
}: {
    concept: Concept;
    session: TopicSession;
    onRestart: () => void;
}) {
    const originalPrediction = session.answers.prediction === "Something else"
        ? session.answers.predictionOther
        : session.answers.prediction.toLowerCase();

    return (
        <main className="min-h-dvh px-5 py-6 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-5xl">
                <header className="flex items-center justify-between border-b border-rule pb-5">
                    <Link href="/library" className="font-notebook text-2xl font-bold text-graphite">Piblo</Link>
                    <span className="text-sm font-semibold text-moss">Understanding trail complete</span>
                </header>

                <section className="py-10 sm:py-16">
                    <p className="text-sm font-bold text-moss">{concept.title}</p>
                    <h1 className="mt-3 max-w-3xl text-balance font-notebook text-4xl font-bold leading-tight text-graphite sm:text-5xl">You built the whole idea, one milestone at a time.</h1>
                    <p className="mt-5 max-w-2xl text-pretty text-lg leading-8 text-graphite-soft">Piblo started from what you already knew, then concentrated the conversation on the parts that needed more work.</p>

                    <div className="mt-10 grid gap-5 md:grid-cols-2">
                        <article className="rounded-xl border border-rule bg-paper-raised p-6">
                            <p className="text-xs font-bold uppercase tracking-wide text-graphite-muted">At the start</p>
                            <p className="mt-3 font-notebook text-2xl leading-9 text-graphite">Most of the plant&apos;s new material comes from {originalPrediction}.</p>
                        </article>
                        <article className="rounded-xl border border-moss/35 bg-moss-soft p-6">
                            <p className="text-xs font-bold uppercase tracking-wide text-moss">Your understanding now</p>
                            <p className="mt-3 font-notebook text-2xl leading-9 text-graphite">{session.answers.reflection}</p>
                        </article>
                    </div>

                    <article className="mt-5 border-l-4 border-amber-ink bg-amber-note px-6 py-5">
                        <p className="text-sm font-bold text-amber-ink">Evidence that mattered</p>
                        <p className="mt-2 text-pretty leading-7 text-graphite">{session.answers.reflectionEvidence}</p>
                    </article>

                    <div className="mt-10 flex flex-wrap gap-3">
                        <Button nativeButton={false} render={<Link href="/library" />} className="bg-graphite px-5 text-paper-raised hover:bg-ink">Back to topics</Button>
                        <Button type="button" variant="outline" onClick={onRestart} className="border-rule-strong bg-paper-raised">
                            <RotateCcw aria-hidden="true" className="size-4" />
                            Restart this path
                        </Button>
                    </div>
                </section>
            </div>
        </main>
    );
}
