import Link from "next/link";
import { ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoveRenderer } from "@/components/learning-moves/move-renderer.tsx";
import { DIAGNOSTIC_PHASES, type LessonAnswers } from "@/domain/lesson/types.ts";
import { canSubmitMove } from "@/domain/lesson/transitions.ts";

export function DiagnosticStage({
    topicTitle,
    step,
    answers,
    analyzing,
    error,
    onUpdateAnswers,
    onBack,
    onContinue,
}: {
    topicTitle: string;
    step: number;
    answers: LessonAnswers;
    analyzing: boolean;
    error: string;
    onUpdateAnswers: (update: Partial<LessonAnswers>) => void;
    onBack: () => void;
    onContinue: () => void;
}) {
    const phase = DIAGNOSTIC_PHASES[step] ?? DIAGNOSTIC_PHASES[0];
    const finalStep = step === DIAGNOSTIC_PHASES.length - 1;

    return (
        <main className="min-h-dvh">
            <header className="border-b border-rule bg-paper-raised">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
                    <div className="flex items-center gap-5">
                        <Link href="/library" className="font-notebook text-xl font-bold text-graphite">Piblo</Link>
                        <div className="hidden border-l border-rule pl-5 sm:block">
                            <p className="text-sm font-semibold text-graphite">{topicTitle}</p>
                            <p className="text-xs text-graphite-muted">Getting to know what you understand</p>
                        </div>
                    </div>
                    <p className="tabular-nums text-xs font-bold text-graphite-soft">Question {step + 1} of {DIAGNOSTIC_PHASES.length}</p>
                </div>
            </header>

            <div className="mx-auto max-w-4xl px-5 py-7 sm:px-8 sm:py-12">
                <div className="mb-6 flex gap-2" aria-label={`Question ${step + 1} of ${DIAGNOSTIC_PHASES.length}`}>
                    {DIAGNOSTIC_PHASES.map((diagnosticPhase, index) => (
                        <span
                            key={diagnosticPhase.key}
                            aria-hidden="true"
                            className={index <= step ? "h-1 flex-1 rounded-full bg-ink" : "h-1 flex-1 rounded-full bg-rule"}
                        />
                    ))}
                </div>

                <section aria-labelledby="move-title" className="rounded-xl border border-rule bg-paper-raised p-5 sm:p-8 lg:p-10">
                    {analyzing ? (
                        <div className="flex min-h-96 flex-col items-center justify-center text-center" role="status">
                            <LoaderCircle aria-hidden="true" className="size-8 animate-spin text-ink" />
                            <h1 id="move-title" className="mt-6 font-notebook text-3xl font-bold text-graphite">Piblo is reading your thinking.</h1>
                            <p className="mt-3 max-w-md text-pretty leading-7 text-graphite-soft">Your choices and explanations are being compared with the five understanding milestones.</p>
                        </div>
                    ) : (
                        <>
                            <MoveRenderer phaseIndex={step} answers={answers} updateAnswers={onUpdateAnswers} />

                            {error ? (
                                <p role="alert" className="mt-6 rounded-lg border border-coral/30 bg-coral-soft px-4 py-3 text-sm text-coral">{error}</p>
                            ) : null}

                            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-5">
                                <Button type="button" variant="outline" onClick={onBack} className="border-rule-strong bg-paper-raised">
                                    <ArrowLeft aria-hidden="true" className="size-4" />
                                    Back
                                </Button>
                                <Button
                                    type="button"
                                    disabled={!canSubmitMove(step, answers)}
                                    onClick={onContinue}
                                    className="bg-graphite px-5 text-paper-raised hover:bg-ink"
                                >
                                    {finalStep ? "Analyze my answers" : "Continue"}
                                    <ArrowRight aria-hidden="true" className="size-4" />
                                </Button>
                            </div>
                        </>
                    )}
                </section>

                <p className="mt-4 text-center text-xs leading-5 text-graphite-muted">Piblo uses this only to choose the right starting point and amount of explanation.</p>
            </div>
        </main>
    );
}
