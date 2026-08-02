export interface LessonDefinition {
    id: string;
    title: string;
    description: string;
    available?: boolean;
}

export interface LevelDefinition {
    id: string;
    name: string;
    description: string;
    lessons: LessonDefinition[];
}

export interface TopicDefinition {
    id: string;
    name: string;
    description: string;
    levels: LevelDefinition[];
}

export const TOPICS: TopicDefinition[] = [
    {
        id: "photosynthesis",
        name: "Photosynthesis",
        description: "Follow matter and energy as plants build the material they need.",
        levels: [
            {
                id: "notice-the-puzzle",
                name: "Notice the puzzle",
                description: "Begin with the surprising question behind plant growth.",
                lessons: [
                    {
                        id: "plant-mass",
                        title: "Where does a plant's mass come from?",
                        description: "Make a prediction, examine evidence, and revise your model.",
                        available: true,
                    },
                    {
                        id: "van-helmont",
                        title: "A tree, a pot, and five years",
                        description: "Use a classic investigation to challenge the soil explanation.",
                    },
                ],
            },
            {
                id: "trace-the-inputs",
                name: "Trace the inputs",
                description: "Work out what enters a plant and what each input contributes.",
                lessons: [
                    {
                        id: "matter-from-air",
                        title: "Can solid material come from air?",
                        description: "Track the carbon in carbon dioxide into plant tissue.",
                    },
                    {
                        id: "water-role",
                        title: "What role does water play?",
                        description: "Separate water's role as matter from its role in transport.",
                    },
                    {
                        id: "light-energy",
                        title: "Is sunlight food?",
                        description: "Distinguish energy entering a system from matter entering it.",
                    },
                ],
            },
            {
                id: "build-the-model",
                name: "Build the model",
                description: "Connect matter, energy, and chemical change into one explanation.",
                lessons: [
                    {
                        id: "photosynthesis-model",
                        title: "Build a photosynthesis model",
                        description: "Explain how the inputs become glucose and oxygen.",
                    },
                    {
                        id: "darkness-transfer",
                        title: "What changes in darkness?",
                        description: "Apply the model to a plant without light.",
                    },
                ],
            },
        ],
    },
    {
        id: "cells",
        name: "Cells & systems",
        description: "Move from individual cells to the systems they build together.",
        levels: [
            {
                id: "cell-patterns",
                name: "Spot the patterns",
                description: "Compare cells and identify the structures they share.",
                lessons: [
                    {
                        id: "cell-boundary",
                        title: "What makes a cell a cell?",
                        description: "Look for the common boundaries and internal structures.",
                    },
                    {
                        id: "cell-scale",
                        title: "How small is a cell?",
                        description: "Use scale to connect what we see to what is actually there.",
                    },
                ],
            },
            {
                id: "specialization",
                name: "Explain specialization",
                description: "Connect a cell's structure to the work it can do.",
                lessons: [
                    {
                        id: "shape-and-job",
                        title: "Why do cells have different shapes?",
                        description: "Compare form and function across specialized cells.",
                    },
                    {
                        id: "tissues",
                        title: "When cells work together",
                        description: "Build the path from cells to tissues and organs.",
                    },
                ],
            },
        ],
    },
    {
        id: "forces",
        name: "Forces & motion",
        description: "Use patterns in motion to reason about pushes, pulls, and change.",
        levels: [
            {
                id: "describe-motion",
                name: "Describe motion",
                description: "Notice what must be measured before motion can be explained.",
                lessons: [
                    {
                        id: "reference-points",
                        title: "Moving compared with what?",
                        description: "Use reference points to make motion descriptions precise.",
                    },
                    {
                        id: "motion-graphs",
                        title: "Tell a motion story from a graph",
                        description: "Translate position and time into a changing journey.",
                    },
                ],
            },
            {
                id: "explain-change",
                name: "Explain change",
                description: "Connect balanced and unbalanced forces to changes in motion.",
                lessons: [
                    {
                        id: "balanced-forces",
                        title: "Can forces act without motion changing?",
                        description: "Reason about situations where forces balance.",
                    },
                    {
                        id: "net-force",
                        title: "Which way will it change?",
                        description: "Use net force to predict changes in motion.",
                    },
                ],
            },
        ],
    },
];

export function findLesson(lessonId: string): LessonDefinition | undefined {
    return TOPICS.flatMap((topic) => topic.levels)
        .flatMap((level) => level.lessons)
        .find((lesson) => lesson.id === lessonId);
}
