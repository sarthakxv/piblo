"use client";

import { useState } from "react";
import type { ReviewCard } from "@/content/concepts/types.ts";
import {
    createReviewCardState,
    toggleReviewCard,
} from "./review-card-state.ts";

export function ReviewFlashcards({ cards }: { cards: ReviewCard[] }) {
    const [state, setState] = useState(createReviewCardState);

    return (
        <section aria-labelledby="what-if-title">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-ink">Optional exploration</p>
                    <h2 id="what-if-title" className="mt-2 max-w-3xl text-balance font-notebook text-3xl font-bold leading-tight text-graphite sm:text-4xl">
                        Let&apos;s explore a little more with some “what ifs.”
                    </h2>
                </div>
                <p aria-live="polite" className="text-sm font-semibold tabular-nums text-graphite-soft">
                    Explored {state.exploredIds.size} of {cards.length}
                </p>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
                {cards.map((card) => {
                    const revealed = state.revealedIds.has(card.id);

                    return (
                        <button
                            key={card.id}
                            type="button"
                            aria-pressed={revealed}
                            aria-label={revealed
                                ? `Hide answer for: ${card.question}`
                                : `Show answer for: ${card.question}`}
                            onClick={() => setState((current) => toggleReviewCard(current, card.id))}
                            className="group min-h-64 w-full rounded-2xl text-left [perspective:1000px] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink"
                        >
                            <span
                                data-flipped={revealed}
                                className="relative grid min-h-64 w-full transition-transform duration-300 [transform-style:preserve-3d] data-[flipped=true]:[transform:rotateY(180deg)] motion-reduce:transition-none"
                            >
                                <span
                                    aria-hidden={revealed}
                                    className="col-start-1 row-start-1 flex min-h-64 flex-col justify-between rounded-2xl border border-amber-ink/25 bg-amber-note p-6 [backface-visibility:hidden] sm:p-8"
                                >
                                    <span className="text-xs font-bold uppercase tracking-wide text-amber-ink">What if?</span>
                                    <span className="my-8 text-balance font-notebook text-2xl font-bold leading-9 text-graphite">{card.question}</span>
                                    <span className="text-xs font-semibold text-amber-ink">Click to reveal the answer</span>
                                </span>
                                <span
                                    aria-hidden={!revealed}
                                    className="col-start-1 row-start-1 flex min-h-64 flex-col justify-between rounded-2xl border border-ink/25 bg-ink-soft p-6 [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-8"
                                >
                                    <span className="text-xs font-bold uppercase tracking-wide text-ink">Think it through</span>
                                    <span className="my-8 text-pretty text-lg font-semibold leading-8 text-graphite">{card.answer}</span>
                                    <span className="text-xs font-semibold text-ink">Click to see the question</span>
                                </span>
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
