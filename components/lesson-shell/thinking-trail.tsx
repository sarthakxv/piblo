import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PHASES } from "@/domain/lesson/types.ts";
import { cn } from "@/lib/utils";

function TrailArtifact({
    label,
    state,
    summary,
}: {
    label: string;
    state: "complete" | "current" | "upcoming";
    summary?: string;
}) {
    return (
        <li className="relative flex gap-3 pb-6 last:pb-0">
            <span aria-hidden="true" className={cn(
                "mt-1.5 size-3 shrink-0 rounded-full border-2",
                state === "complete" && "border-moss bg-moss",
                state === "current" && "border-ink bg-paper-raised",
                state === "upcoming" && "border-rule-strong bg-paper",
            )} />
            <div className="min-w-0">
                <p className={cn("text-sm font-semibold", state === "upcoming" ? "text-graphite-muted" : "text-graphite")}>{label}</p>
                {summary ? <p className="mt-1 text-pretty text-xs leading-5 text-graphite-soft">{summary}</p> : null}
            </div>
        </li>
    );
}

function TrailContents({ phaseIndex, summaries }: { phaseIndex: number; summaries: Array<string | undefined> }) {
    return (
        <ol className="mt-6">
            {PHASES.map((phase, index) => (
                <TrailArtifact
                    key={phase.key}
                    label={phase.trailLabel}
                    state={index < phaseIndex ? "complete" : index === phaseIndex ? "current" : "upcoming"}
                    summary={index < phaseIndex ? summaries[index] : undefined}
                />
            ))}
        </ol>
    );
}

export function DesktopThinkingTrail({ phaseIndex, summaries }: { phaseIndex: number; summaries: Array<string | undefined> }) {
    return (
        <aside className="hidden border-l border-rule pl-8 lg:block">
            <p className="font-notebook text-xl font-bold text-graphite">Thinking Trail</p>
            <p className="mt-1 text-xs leading-5 text-graphite-muted">Your ideas, evidence, and revisions—not a score.</p>
            <TrailContents phaseIndex={phaseIndex} summaries={summaries} />
        </aside>
    );
}

export function MobileThinkingTrail({ phaseIndex, summaries }: { phaseIndex: number; summaries: Array<string | undefined> }) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button type="button" variant="outline" className="border-rule-strong bg-paper-raised lg:hidden">Thinking Trail</Button>
            </SheetTrigger>
            <SheetContent className="border-rule bg-paper-raised p-6">
                <SheetHeader className="p-0">
                    <SheetTitle className="font-notebook text-xl font-bold text-graphite">Thinking Trail</SheetTitle>
                    <SheetDescription className="text-graphite-muted">Your ideas, evidence, and revisions—not a score.</SheetDescription>
                </SheetHeader>
                <TrailContents phaseIndex={phaseIndex} summaries={summaries} />
            </SheetContent>
        </Sheet>
    );
}
