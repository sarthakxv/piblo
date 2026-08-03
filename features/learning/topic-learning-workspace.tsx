"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import type { Concept } from "@/content/concepts/types.ts";
import type { LearningLevelId } from "@/content/topics.ts";
import { StartLearningResponseSchema } from "@/domain/assessment/types.ts";
import { LearnerModelSchema } from "@/domain/learner-model/schema.ts";
import type { LessonAnswers } from "@/domain/lesson/types.ts";
import { useLearnerProfile } from "@/features/learner-profile/use-learner-profile.ts";
import {
    clearTopicSession,
    readTopicSession,
    storeTopicSession,
} from "@/features/session/session-storage.ts";
import {
    createTopicSession,
    type TopicSession,
} from "@/features/session/session-schema.ts";
import { DiagnosticStage } from "./diagnostic-stage.tsx";
import { LearningChat } from "./learning-chat.tsx";
import { TopicComplete } from "./topic-complete.tsx";
import { TopicOverview } from "./topic-overview.tsx";

const TutorResponseSchema = z.object({
    reply: z.string().trim().min(1).max(8_000),
    learnerModel: LearnerModelSchema,
});

const withTimestamp = (session: TopicSession): TopicSession => ({
    ...session,
    updatedAt: new Date().toISOString(),
});

export function TopicLearningWorkspace({
    concept,
    levelId,
}: {
    concept: Concept;
    levelId: LearningLevelId;
}) {
    const router = useRouter();
    const { profile, loaded: profileLoaded } = useLearnerProfile();
    const [session, setSession] = useState<TopicSession | null>(null);
    const [sessionLoaded, setSessionLoaded] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (profileLoaded && !profile) router.replace("/");
    }, [profile, profileLoaded, router]);

    useEffect(() => {
        const stored = readTopicSession(concept.id, levelId);
        setSession(stored?.stage === "analyzing"
            ? { ...stored, stage: "diagnostic" }
            : stored ?? createTopicSession(concept.id, levelId));
        setSessionLoaded(true);
    }, [concept.id, levelId]);

    useEffect(() => {
        if (sessionLoaded && session) storeTopicSession(session);
    }, [session, sessionLoaded]);

    const updateSession = useCallback((update: (current: TopicSession) => TopicSession) => {
        setSession((current) => current ? withTimestamp(update(current)) : current);
    }, []);

    const updateAnswers = useCallback((update: Partial<LessonAnswers>) => {
        updateSession((current) => ({
            ...current,
            answers: { ...current.answers, ...update },
        }));
        setError("");
    }, [updateSession]);

    const analyzeDiagnostic = async () => {
        if (!session || busy) return;
        setBusy(true);
        setError("");
        updateSession((current) => ({ ...current, stage: "analyzing" }));

        try {
            const response = await fetch("/api/learning/start", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ topicId: concept.id, answers: session.answers }),
            });
            const body: unknown = await response.json();
            if (!response.ok) {
                const message = z.object({ error: z.string() }).safeParse(body);
                throw new Error(message.success ? message.data.error : "Piblo could not analyze these answers.");
            }
            const result = StartLearningResponseSchema.parse(body);

            updateSession((current) => ({
                ...current,
                stage: "chat",
                initialMasteryByObjective: result.diagnostic.initialMasteryByObjective,
                knowledgeSummary: result.diagnostic.knowledgeSummary,
                learnerModel: result.learnerModel,
                messages: [{ role: "assistant", content: result.opening }],
            }));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Piblo could not analyze these answers.");
            updateSession((current) => ({ ...current, stage: "diagnostic" }));
        } finally {
            setBusy(false);
        }
    };

    const requestTutorTurn = async (history: TopicSession["messages"]) => {
        if (!session?.learnerModel || busy) return;
        setBusy(true);
        setError("");

        try {
            const response = await fetch("/api/tutor", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    topicId: concept.id,
                    history,
                    learnerModel: session.learnerModel,
                }),
            });
            const body: unknown = await response.json();
            if (!response.ok) {
                const message = z.object({ error: z.string() }).safeParse(body);
                throw new Error(message.success ? message.data.error : "Piblo could not prepare the next step.");
            }
            const result = TutorResponseSchema.parse(body);
            updateSession((current) => ({
                ...current,
                stage: "chat",
                learnerModel: result.learnerModel,
                messages: [
                    ...history,
                    { role: "assistant" as const, content: result.reply },
                ].slice(-100),
            }));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Piblo could not prepare the next step.");
        } finally {
            setBusy(false);
        }
    };

    const sendMessage = (message: string) => {
        if (!session?.learnerModel || busy) return;
        const history = [
            ...session.messages,
            { role: "user" as const, content: message },
        ].slice(-99);
        updateSession((current) => ({ ...current, messages: history }));
        void requestTutorTurn(history);
    };

    const retryTurn = () => {
        if (!session || session.messages.at(-1)?.role !== "user") return;
        void requestTutorTurn(session.messages);
    };

    const restart = () => {
        clearTopicSession(concept.id, levelId);
        setError("");
        setSession(createTopicSession(concept.id, levelId));
    };

    if (!profileLoaded || !profile || !sessionLoaded || !session) {
        return <main className="min-h-dvh" aria-busy="true" />;
    }

    if (session.stage === "overview") {
        return <TopicOverview concept={concept} onBegin={() => updateSession((current) => ({ ...current, stage: "diagnostic" }))} />;
    }

    if (session.stage === "diagnostic" || session.stage === "analyzing") {
        return (
            <DiagnosticStage
                topicTitle={concept.title}
                step={session.diagnosticStep}
                answers={session.answers}
                analyzing={session.stage === "analyzing" || busy}
                error={error}
                onUpdateAnswers={updateAnswers}
                onBack={() => updateSession((current) => current.diagnosticStep === 0
                    ? { ...current, stage: "overview" }
                    : { ...current, diagnosticStep: current.diagnosticStep - 1 })}
                onContinue={() => {
                    if (session.diagnosticStep < 4) {
                        updateSession((current) => ({ ...current, diagnosticStep: current.diagnosticStep + 1 }));
                    } else {
                        void analyzeDiagnostic();
                    }
                }}
            />
        );
    }

    if (session.stage === "chat" && session.learnerModel) {
        return (
            <LearningChat
                concept={concept}
                session={{ ...session, learnerModel: session.learnerModel }}
                busy={busy}
                error={error}
                onSend={sendMessage}
                onRetry={retryTurn}
                onViewRecap={() => updateSession((current) => current.learnerModel?.lessonComplete
                    ? { ...current, stage: "complete" }
                    : current)}
            />
        );
    }

    return <TopicComplete concept={concept} onRestart={restart} />;
}
