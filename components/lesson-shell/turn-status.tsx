"use client";

import { Button } from "@/components/ui/button";

export type TurnStatus = "idle" | "assessing" | "preparing" | "error";

export function TurnStatusPanel({
    status,
    onRetry,
    onStop,
}: {
    status: TurnStatus;
    onRetry: () => void;
    onStop: () => void;
}) {
    if (status === "idle") return null;

    if (status === "error") {
        return (
            <div role="alert" className="mt-4 rounded-lg border border-coral/40 bg-coral-soft px-4 py-3">
                <p className="font-semibold text-graphite">Piblo could not prepare the next step.</p>
                <p className="mt-1 text-sm text-graphite-soft">Your answer is still here. Retry when you are ready.</p>
                <Button type="button" onClick={onRetry} className="mt-3 bg-graphite text-paper-raised">Retry</Button>
            </div>
        );
    }

    return (
        <div role="status" aria-live="polite" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink/25 bg-ink-soft px-4 py-3">
            <div>
                <p className="font-semibold text-graphite">
                    {status === "assessing" ? "Checking your explanation…" : "Preparing the next step…"}
                </p>
                <p className="mt-1 text-sm text-graphite-soft">Your response has been preserved.</p>
            </div>
            <Button type="button" variant="outline" onClick={onStop} className="border-rule-strong bg-paper-raised">Stop</Button>
        </div>
    );
}
