import { EMPTY_ANSWERS, type LessonAnswers } from "./types.ts";

export interface LessonWorkspaceState {
    sessionLoaded: boolean;
    phaseIndex: number;
    answers: LessonAnswers;
    complete: boolean;
    supportLevel: number;
    askOpen: boolean;
    askQuestion: string;
    askAnswer: string;
}

interface StoredLessonProgress {
    phaseIndex: number;
    answers: LessonAnswers;
    complete: boolean;
}

export type LessonWorkspaceAction =
    | { type: "hydrate"; progress: StoredLessonProgress | null }
    | { type: "update-answers"; update: Partial<LessonAnswers> }
    | { type: "increase-support" }
    | { type: "set-ask-open"; open: boolean }
    | { type: "set-ask-question"; question: string }
    | { type: "set-ask-answer"; answer: string }
    | { type: "advance-phase" }
    | { type: "finish-lesson" }
    | { type: "retry-application" };

export const INITIAL_LESSON_WORKSPACE_STATE: LessonWorkspaceState = {
    sessionLoaded: false,
    phaseIndex: 0,
    answers: EMPTY_ANSWERS,
    complete: false,
    supportLevel: 0,
    askOpen: false,
    askQuestion: "",
    askAnswer: "",
};

export function lessonWorkspaceReducer(
    state: LessonWorkspaceState,
    action: LessonWorkspaceAction,
): LessonWorkspaceState {
    switch (action.type) {
        case "hydrate":
            return {
                ...INITIAL_LESSON_WORKSPACE_STATE,
                ...(action.progress ?? {}),
                sessionLoaded: true,
            };
        case "update-answers":
            return {
                ...state,
                answers: { ...state.answers, ...action.update },
            };
        case "increase-support":
            return {
                ...state,
                supportLevel: Math.min(state.supportLevel + 1, 3),
            };
        case "set-ask-open":
            return action.open
                ? { ...state, askOpen: true }
                : { ...state, askOpen: false, askQuestion: "", askAnswer: "" };
        case "set-ask-question":
            return { ...state, askQuestion: action.question };
        case "set-ask-answer":
            return { ...state, askAnswer: action.answer };
        case "advance-phase":
            return {
                ...state,
                phaseIndex: state.phaseIndex + 1,
                supportLevel: 0,
                askOpen: false,
                askQuestion: "",
                askAnswer: "",
            };
        case "finish-lesson":
            return { ...state, complete: true };
        case "retry-application":
            return { ...state, complete: false, phaseIndex: 4 };
    }
}
