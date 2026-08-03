import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { startLearning, StartLearningRequestSchema } from "@/server/assessment-service.ts";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
    const requestId = crypto.randomUUID();

    try {
        const input = StartLearningRequestSchema.parse(await request.json());
        const result = await startLearning(input);
        return NextResponse.json(result, {
            headers: { "x-request-id": requestId },
        });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: "The diagnostic answers were invalid.", requestId },
                { status: 400, headers: { "x-request-id": requestId } },
            );
        }

        const errorRecord = error && typeof error === "object"
            ? error as Record<string, unknown>
            : {};
        console.error(JSON.stringify({
            event: "learning_start_failed",
            requestId,
            errorName: error instanceof Error ? error.name : "UnknownError",
            errorMessage: error instanceof Error ? error.message : "Unknown error",
            errorText: typeof errorRecord.text === "string" ? errorRecord.text : undefined,
            errorCause: errorRecord.cause instanceof Error
                ? errorRecord.cause.message
                : undefined,
            timestamp: new Date().toISOString(),
        }));

        return NextResponse.json(
            { error: "Piblo could not analyze these answers. Please retry.", requestId },
            { status: 502, headers: { "x-request-id": requestId } },
        );
    }
}
