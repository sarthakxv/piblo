import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logTutorTurn } from "@/server/logging.ts";
import { runTutorTurn, TutorTurnRequestSchema } from "@/server/tutor-service.ts";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
    const requestId = crypto.randomUUID();

    try {
        const input = TutorTurnRequestSchema.parse(await request.json());
        const result = await runTutorTurn(input, requestId);
        return NextResponse.json(result, {
            headers: { "x-request-id": requestId },
        });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: "The tutor request was invalid.", requestId },
                { status: 400, headers: { "x-request-id": requestId } },
            );
        }

        logTutorTurn({
            event: "tutor_turn_failed",
            requestId,
            errorName: error instanceof Error ? error.name : "UnknownError",
        });
        return NextResponse.json(
            { error: "Piblo could not prepare the next step. Please retry.", requestId },
            { status: 502, headers: { "x-request-id": requestId } },
        );
    }
}
