"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { ArrowUp, LoaderCircle, RotateCcw } from "lucide-react";
import Markdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Concept } from "@/content/concepts/types.ts";
import type { TopicSession } from "@/features/session/session-schema.ts";
import { formatChemNotation, promoteEquationLines } from "./chem-notation.ts";
import { DesktopMilestoneTrail, MobileMilestoneTrail } from "./milestone-trail.tsx";

function ChatMessageContent({
    content,
    role,
}: {
    content: string;
    role: "assistant" | "user";
}) {
    if (role === "user") {
        return (
            <p className="whitespace-pre-wrap text-pretty text-[0.9375rem] leading-7">{content}</p>
        );
    }

    const markdown = formatChemNotation(promoteEquationLines(content));

    return (
        <div className="text-pretty text-[0.9375rem] leading-7 [&_p]:mt-3 [&_p:first-child]:mt-0 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_li]:leading-7 [&_strong]:font-semibold [&_em]:italic">
            <Markdown
                components={{
                    pre: ({ children }) => (
                        <pre className="mt-3 overflow-x-auto rounded-lg bg-paper-inset px-4 py-3 font-mono text-[0.875rem] leading-6 first:mt-0 [&>code]:rounded-none [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-inherit">
                            {children}
                        </pre>
                    ),
                    code: ({ children }) => (
                        <code className="rounded-md bg-paper-inset px-1.5 py-0.5 font-mono text-[0.875em]">
                            {children}
                        </code>
                    ),
                }}
            >
                {markdown}
            </Markdown>
        </div>
    );
}

export function LearningChat({
    concept,
    session,
    busy,
    error,
    onSend,
    onRetry,
    onViewRecap,
}: {
    concept: Concept;
    session: TopicSession & { learnerModel: NonNullable<TopicSession["learnerModel"]> };
    busy: boolean;
    error: string;
    onSend: (message: string) => void;
    onRetry: () => void;
    onViewRecap: () => void;
}) {
    const [draft, setDraft] = useState("");
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [busy, session.messages.length]);

    const submit = (event?: FormEvent) => {
        event?.preventDefault();
        const message = draft.trim();
        if (!message || busy || error) return;
        setDraft("");
        onSend(message);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
        }
    };

    return (
        <main className="min-h-dvh lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
            <DesktopMilestoneTrail
                concept={concept}
                learnerModel={session.learnerModel}
                initialMasteryByObjective={session.initialMasteryByObjective}
                recapEnabled={session.learnerModel.lessonComplete}
                onViewRecap={onViewRecap}
            />

            <section className="flex min-h-dvh min-w-0 flex-col">
                <header className="sticky top-0 z-20 border-b border-rule bg-paper-raised/95 backdrop-blur-sm">
                    <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
                        <div>
                            <Link href="/library" className="lg:hidden">
                                <img src="/logo-text.svg" alt="Piblo" className="h-7 w-auto" />
                            </Link>
                            <p className="hidden text-sm font-semibold text-graphite lg:block">Learning with Piblo</p>
                            <p className="text-xs text-graphite-muted">{concept.title} · Recommended</p>
                        </div>
                        <MobileMilestoneTrail
                            concept={concept}
                            learnerModel={session.learnerModel}
                            initialMasteryByObjective={session.initialMasteryByObjective}
                            recapEnabled={session.learnerModel.lessonComplete}
                            onViewRecap={onViewRecap}
                        />
                    </div>
                </header>

                <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-5 py-7 sm:px-8 sm:py-10">
                    <article className="rounded-xl border border-moss/30 bg-moss-soft px-5 py-5 sm:px-6" aria-labelledby="knowledge-summary-title">
                        <p className="text-xs font-bold uppercase tracking-wide text-moss">What Piblo learned about you</p>
                        <h1 id="knowledge-summary-title" className="mt-2 font-notebook text-2xl font-bold text-graphite">Your starting point</h1>
                        <p className="mt-2 text-pretty text-sm leading-6 text-graphite">{session.knowledgeSummary}</p>
                    </article>

                    <div className="mt-8 grid gap-6" aria-live="polite">
                        {session.messages.map((message, index) => (
                            <article
                                key={`${message.role}-${index}`}
                                className={message.role === "assistant" ? "relative max-w-2xl" : "ml-auto max-w-2xl"}
                            >
                                {message.role === "assistant" ? (
                                    <>
                                        <img
                                            src="/logo.svg"
                                            alt=""
                                            aria-hidden="true"
                                            className="pointer-events-none absolute -left-8 top-1 size-6 sm:-left-10 sm:size-6"
                                        />
                                        <span className="sr-only">Piblo</span>
                                    </>
                                ) : (
                                    <p className="sr-only">
                                        You
                                    </p>
                                )}
                                <div className={message.role === "assistant"
                                    ? "rounded-xl rounded-tl-sm border border-rule bg-paper-raised px-5 py-4 text-graphite"
                                    : "rounded-xl rounded-tr-sm bg-ink px-5 py-4 text-paper-raised"}
                                >
                                    <ChatMessageContent content={message.content} role={message.role} />
                                </div>
                            </article>
                        ))}

                        {busy ? (
                            <div className="flex items-center gap-3 text-sm text-graphite-soft" role="status">
                                <LoaderCircle aria-hidden="true" className="size-4 animate-spin text-ink" />
                                Piblo is thinking…
                            </div>
                        ) : null}

                        {error ? (
                            <div role="alert" className="rounded-lg border border-coral/30 bg-coral-soft px-4 py-4 text-sm text-coral">
                                <p>{error}</p>
                                <Button type="button" variant="outline" onClick={onRetry} className="mt-3 border-coral/40 bg-paper-raised text-coral">
                                    <RotateCcw aria-hidden="true" className="size-4" />
                                    Retry this turn
                                </Button>
                            </div>
                        ) : null}
                        <div ref={endRef} />
                    </div>
                </div>

                <div className="sticky bottom-0 border-t border-rule bg-paper/95 px-5 py-4 backdrop-blur-sm sm:px-8">
                    {session.learnerModel.lessonComplete ? (
                        <div className="mx-auto max-w-4xl">
                            <p className="text-sm font-semibold text-moss">All five milestones are understood.</p>
                            <p className="mt-1 text-xs leading-5 text-graphite-muted">Open the understanding trail to view your topic recap.</p>
                        </div>
                    ) : (
                        <>
                            <form onSubmit={submit} className="mx-auto flex max-w-4xl items-end gap-3">
                                <div className="min-w-0 flex-1">
                                    <label htmlFor="learner-message" className="sr-only">Your answer to Piblo</label>
                                    <Textarea
                                        id="learner-message"
                                        value={draft}
                                        rows={1}
                                        maxLength={8_000}
                                        disabled={busy || Boolean(error)}
                                        onKeyDown={handleKeyDown}
                                        onChange={(event) => setDraft(event.target.value)}
                                        placeholder="Work the idea out here…"
                                        className="max-h-40 min-h-12 resize-none border-rule-strong bg-paper-inset px-4 py-[0.8125rem] [line-height:1.25rem] shadow-none focus-visible:border-ink"
                                    />
                                </div>
                                <Button type="submit" size="icon" disabled={!draft.trim() || busy || Boolean(error)} className="size-12 shrink-0 bg-graphite text-paper-raised hover:bg-ink" aria-label="Send answer">
                                    <ArrowUp aria-hidden="true" className="size-5" />
                                </Button>
                            </form>
                            <p className="mx-auto mt-2 max-w-4xl text-xs text-graphite-muted">Enter to send · Shift + Enter for a new line</p>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}
