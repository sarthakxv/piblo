"use client";

import { ApplicationMove } from "./application-move.tsx";
import { ExplanationMove } from "./explanation-move.tsx";
import { GeneralizationMove } from "./generalization-move.tsx";
import { ObservationMove } from "./observation-move.tsx";
import { PredictionMove } from "./prediction-move.tsx";
import { ReflectionMove } from "./reflection-move.tsx";
import type { LearningMoveProps } from "./types.ts";

const MOVES = [
    PredictionMove,
    ObservationMove,
    ExplanationMove,
    GeneralizationMove,
    ApplicationMove,
    ReflectionMove,
];

export function MoveRenderer({ phaseIndex, ...props }: LearningMoveProps & { phaseIndex: number }) {
    const Move = MOVES[phaseIndex] ?? PredictionMove;
    return <Move {...props} />;
}
