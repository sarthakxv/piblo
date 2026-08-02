"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MoveRenderer } from "@/components/learning-moves/move-renderer.tsx";
import { AskPiblo } from "@/components/lesson-shell/ask-piblo.tsx";
import { DesktopThinkingTrail } from "@/components/lesson-shell/thinking-trail.tsx";
import { HelpPanel } from "@/components/lesson-shell/help-panel.tsx";
import { LessonHeader } from "@/components/lesson-shell/lesson-header.tsx";
import { TurnStatusPanel, type TurnStatus } from "@/components/lesson-shell/turn-status.tsx";
import { EMPTY_ANSWERS, PHASES, type LessonAnswers } from "@/domain/lesson/types.ts";
import { buildTrailSummaries, canSubmitMove } from "@/domain/lesson/transitions.ts";
import { useLearnerProfile } from "@/features/learner-profile/use-learner-profile.ts";
import { readSession, storeSession } from "@/features/session/session-storage.ts";
import { LessonComplete } from "./lesson-complete.tsx";

const wait = (milliseconds: number) => new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
});

export function LessonWorkspace({ lessonId }: { lessonId: string }) {
    const router = useRouter();
    const { profile, loaded: profileLoaded } = useLearnerProfile();
    const [sessionLoaded, setSessionLoaded] = useState(false);
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [answers, setAnswers] = useState<LessonAnswers>(EMPTY_ANSWERS);
    const [complete, setComplete] = useState(false);
    const [supportLevel, setSupportLevel] = useState(0);
    const [status, setStatus] = useState<TurnStatus>("idle");
    const [askOpen, setAskOpen] = useState(false);
    const [askQuestion, setAskQuestion] = useState("");
    const [askAnswer, setAskAnswer] = useState("");
    const [failNextTurn, setFailNextTurn] = useState(false);
    const requestId = useRef(0);

    useEffect(() => {
        if (profileLoaded && !profile) router.replace("/");
    }, [profile, profileLoaded, router]);

    useEffect(() => {
        const stored = readSession(lessonId);
        if (stored) {
            setPhaseIndex(stored.phaseIndex);
            setAnswers(stored.answers);
            setComplete(stored.complete);
        }
        setSessionLoaded(true);
    }, [lessonId]);

    useEffect(() => {
        if (!sessionLoaded) return;
        storeSession({
            version: 1,
            lessonId,
            phaseIndex,
            answers,
            complete,
            updatedAt: new Date().toISOString(),
        });
    }, [answers, complete, lessonId, phaseIndex, sessionLoaded]);

    const updateAnswers = useCallback((update: Partial<LessonAnswers>) => {
        setAnswers((current) => ({ ...current, ...update }));
    }, []);

    const busy = status === "assessing" || status === "preparing";
    const canSubmit = canSubmitMove(phaseIndex, answers);
    const phase = PHASES[phaseIndex] ?? PHASES[0];
    const trailSummaries = buildTrailSummaries(answers);

    const submitMove = async () => {
        if (!canSubmit || busy) return;

        const currentRequest = requestId.current + 1;
        requestId.current = currentRequest;
        setStatus("assessing");
        await wait(650);
        if (requestId.current !== currentRequest) return;

        if (failNextTurn) {
            setFailNextTurn(false);
            setStatus("error");
            return;
        }

        setStatus("preparing");
        await wait(500);
        if (requestId.current !== currentRequest) return;

        const nextPhaseIndex = phaseIndex + 1;
        if (nextPhaseIndex >= PHASES.length) {
            setComplete(true);
        } else {
            setPhaseIndex(nextPhaseIndex);
            setSupportLevel(0);
            setAskOpen(false);
            setAskQuestion("");
            setAskAnswer("");
        }
        setStatus("idle");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const stopTurn = () => {
        requestId.current += 1;
        setStatus("idle");
    };

    if (!profileLoaded || !profile || !sessionLoaded) return <main className="min-h-dvh" aria-busy="true" />;

    if (complete) {
        return <LessonComplete answers={answers} onTryAnotherApplication={() => { setComplete(false); setPhaseIndex(4); }} />;
    }

    return (
        <main className="min-h-dvh">
            <LessonHeader
                phaseLabel={phase.learnerLabel}
                phaseIndex={phaseIndex}
                trailSummaries={trailSummaries}
                failNextTurn={failNextTurn}
                onToggleFailure={() => setFailNextTurn((current) => !current)}
            />

            <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 sm:py-10">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-12">
                    <section aria-labelledby="move-title" className="min-w-0">
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <p className="text-sm font-bold text-ink">{phase.eyebrow}</p>
                            <p className="tabular-nums text-xs font-semibold text-graphite-muted">Step {phaseIndex + 1} of {PHASES.length}</p>
                        </div>

                        <div className="rounded-xl border border-rule bg-paper-raised p-5 sm:p-8 lg:p-10">
                            <MoveRenderer phaseIndex={phaseIndex} answers={answers} updateAnswers={updateAnswers} />
                            <HelpPanel phaseIndex={phaseIndex} level={supportLevel} />

                            <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-5">
                                <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={supportLevel >= 3}
                                        onClick={() => setSupportLevel((current) => Math.min(current + 1, 3))}
                                        className="border-amber-ink/35 bg-amber-note text-amber-ink"
                                    >
                                        Give me a hint
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={supportLevel >= 3}
                                        onClick={() => setSupportLevel((current) => Math.min(current + 1, 3))}
                                        className="border-rule-strong bg-paper-raised"
                                    >
                                        I&apos;m stuck
                                    </Button>
                                    <AskPiblo
                                        open={askOpen}
                                        question={askQuestion}
                                        answer={askAnswer}
                                        onOpenChange={(open) => {
                                            setAskOpen(open);
                                            if (!open) {
                                                setAskQuestion("");
                                                setAskAnswer("");
                                            }
                                        }}
                                        onQuestionChange={setAskQuestion}
                                        onSubmit={() => {
                                            if (!askQuestion.trim()) return;
                                            setAskAnswer("Light is energy rather than plant material. It powers the rearrangement of carbon dioxide and water into glucose—like electricity powers a machine without becoming the product.");
                                        }}
                                    />
                                </div>

                                <Button
                                    type="button"
                                    disabled={!canSubmit || busy}
                                    onClick={submitMove}
                                    className="min-w-36 bg-graphite px-5 text-paper-raised hover:bg-ink"
                                >
                                    {phaseIndex === PHASES.length - 1 ? "Finish lesson" : "Commit and continue"}
                                </Button>
                            </div>

                            <TurnStatusPanel status={status} onRetry={submitMove} onStop={stopTurn} />
                        </div>
                    </section>

                    <DesktopThinkingTrail phaseIndex={phaseIndex} summaries={trailSummaries} />
                </div>
            </div>
        </main>
    );
}
