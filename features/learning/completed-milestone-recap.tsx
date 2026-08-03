import { Check } from "lucide-react";
import type { Concept } from "@/content/concepts/types.ts";

export function CompletedMilestoneRecap({ concept }: { concept: Concept }) {
    return (
        <section aria-labelledby="completed-trail-title" className="px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
            <div className="mx-auto max-w-7xl">
                <p className="text-xs font-bold uppercase tracking-wide text-moss">Understanding trail complete</p>
                <h1 id="completed-trail-title" className="mt-3 text-balance font-notebook text-4xl font-bold leading-tight text-graphite sm:text-5xl">
                    You connected the whole idea of {concept.title.toLowerCase()}.
                </h1>
                <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-graphite-soft">
                    These are the five ideas you can now use together.
                </p>

                <div className="relative mt-12 hidden md:block">
                    <span aria-hidden="true" className="absolute left-[10%] right-[10%] top-4 h-0.5 bg-moss/45" />
                    <ol className="relative grid grid-cols-5 gap-4">
                        {concept.objectives.map((objective) => (
                            <li key={objective.id} className="min-w-0 text-center">
                                <span aria-hidden="true" className="mx-auto flex size-8 items-center justify-center rounded-full border-2 border-moss bg-moss text-paper-raised">
                                    <Check className="size-4" strokeWidth={3} />
                                </span>
                                <h2 className="mt-5 text-balance font-notebook text-lg font-bold leading-6 text-graphite">{objective.title}</h2>
                                <p className="mx-auto mt-3 max-w-52 text-pretty text-xs leading-5 text-graphite-soft">{objective.takeaway}</p>
                            </li>
                        ))}
                    </ol>
                </div>

                <ol className="mt-9 grid gap-3 md:hidden">
                    {concept.objectives.map((objective) => (
                        <li key={objective.id} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 rounded-xl border border-moss/25 bg-moss-soft p-4">
                            <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-full bg-moss text-paper-raised">
                                <Check className="size-4" strokeWidth={3} />
                            </span>
                            <div>
                                <h2 className="font-notebook text-lg font-bold leading-6 text-graphite">{objective.title}</h2>
                                <p className="mt-1 text-sm leading-6 text-graphite-soft">{objective.takeaway}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
