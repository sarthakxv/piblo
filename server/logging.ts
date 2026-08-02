interface TutorTurnLog {
    event: "tutor_turn_completed" | "tutor_turn_failed";
    requestId: string;
    analyzerDurationMs?: number;
    tutorDurationMs?: number;
    turnCount?: number;
    errorName?: string;
}

export function logTutorTurn(entry: TutorTurnLog): void {
    const payload = JSON.stringify({
        ...entry,
        timestamp: new Date().toISOString(),
    });

    if (entry.event === "tutor_turn_failed") {
        console.error(payload);
    } else {
        console.info(payload);
    }
}
