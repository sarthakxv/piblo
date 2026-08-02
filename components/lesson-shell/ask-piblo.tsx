"use client";

import { Button } from "@/components/ui/button";
import { FieldLabel, NotebookTextarea } from "@/components/learning-moves/move-shared.tsx";

export function AskPiblo({
    open,
    question,
    answer,
    onOpenChange,
    onQuestionChange,
    onSubmit,
}: {
    open: boolean;
    question: string;
    answer: string;
    onOpenChange: (open: boolean) => void;
    onQuestionChange: (question: string) => void;
    onSubmit: () => void;
}) {
    if (!open) {
        return (
            <Button type="button" variant="outline" aria-expanded="false" onClick={() => onOpenChange(true)} className="border-rule-strong bg-paper-raised text-graphite">
                Ask Piblo
            </Button>
        );
    }

    return (
        <aside aria-label="Ask Piblo" className="mt-5 w-full basis-full border-l-4 border-ink bg-ink-soft px-5 py-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="font-semibold text-graphite">Ask without leaving your work</p>
                    <p className="mt-1 text-sm text-graphite-soft">Your current activity will stay exactly as it is.</p>
                </div>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-rule-strong bg-paper-raised">
                    Return to activity
                </Button>
            </div>

            {answer ? (
                <div className="mt-4 rounded-lg border border-ink/25 bg-paper-raised px-4 py-4">
                    <p className="font-notebook text-lg leading-7 text-graphite">{answer}</p>
                </div>
            ) : (
                <div className="mt-4">
                    <FieldLabel htmlFor="ask-piblo-question">What are you wondering?</FieldLabel>
                    <NotebookTextarea
                        id="ask-piblo-question"
                        value={question}
                        onChange={onQuestionChange}
                        placeholder="For example: Why does light count as energy?"
                        rows={2}
                    />
                    <Button type="button" disabled={!question.trim()} onClick={onSubmit} className="mt-3 bg-ink text-paper-raised hover:bg-ink/85">
                        Ask question
                    </Button>
                </div>
            )}
        </aside>
    );
}
