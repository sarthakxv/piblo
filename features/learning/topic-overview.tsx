import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Concept } from "@/content/concepts/types.ts";

export function TopicOverview({ concept, onBegin }: { concept: Concept; onBegin: () => void }) {
    return (
        <main className="min-h-dvh px-5 py-6 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-7xl">
                <header className="flex items-center justify-between border-b border-rule pb-5">
                    <Link href="/library" className="font-notebook text-2xl font-bold text-graphite">Piblo</Link>
                    <span className="text-xs font-bold uppercase tracking-wide text-graphite-muted">Recommended path</span>
                </header>

                <section className="flex min-h-[calc(100dvh-7rem)] flex-col justify-center py-12" aria-labelledby="topic-overview-title">
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="text-sm font-bold text-ink">Today&apos;s topic</p>
                        <h1 id="topic-overview-title" className="mt-3 text-balance font-notebook text-5xl font-bold leading-tight text-graphite sm:text-6xl">{concept.title}</h1>
                        <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-8 text-graphite-soft">
                            We&apos;ll break this idea into five milestones. First, a few questions help Piblo understand where you should begin.
                        </p>
                    </div>

                    <ol className="relative mx-auto mt-16 hidden w-full max-w-6xl grid-cols-5 md:grid">
                        <span aria-hidden="true" className="absolute left-[10%] right-[10%] top-4 h-0.5 bg-rule-strong" />
                        {concept.objectives.map((objective, index) => (
                            <li key={objective.id} className="relative px-3 text-center">
                                <span aria-hidden="true" className="mx-auto flex size-8 items-center justify-center rounded-full border-4 border-rule-strong bg-paper-raised font-notebook text-xs font-bold text-graphite-soft">{index + 1}</span>
                                <p className="mt-5 text-balance font-notebook text-lg font-bold leading-6 text-graphite">{objective.title}</p>
                            </li>
                        ))}
                    </ol>

                    <ol className="mx-auto mt-12 grid w-full max-w-xl gap-3 md:hidden">
                        {concept.objectives.map((objective, index) => (
                            <li key={objective.id} className="flex items-center gap-3 rounded-lg border border-rule bg-paper-raised px-4 py-3">
                                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink-soft text-xs font-bold text-ink">{index + 1}</span>
                                <span className="font-semibold text-graphite">{objective.title}</span>
                            </li>
                        ))}
                    </ol>

                    <div className="mt-14 text-center">
                        <Button type="button" onClick={onBegin} className="min-h-12 bg-graphite px-6 text-paper-raised hover:bg-ink">
                            Show Piblo what I know
                            <ArrowRight aria-hidden="true" className="size-4" />
                        </Button>
                        <p className="mt-3 text-xs leading-5 text-graphite-muted">This is a starting point, not a grade.</p>
                    </div>
                </section>
            </div>
        </main>
    );
}
