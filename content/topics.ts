export type LearningLevelId = "recommended" | "expert";

export interface LevelDefinition {
    id: LearningLevelId;
    name: string;
    description: string;
    available: boolean;
}

export interface TopicDefinition {
    id: string;
    name: string;
    description: string;
    levels: LevelDefinition[];
}

const levelsFor = (recommendedAvailable: boolean): LevelDefinition[] => [
    {
        id: "recommended",
        name: "Recommended",
        description: "Piblo first learns what you know, then adapts the conversation around your weak points.",
        available: recommendedAvailable,
    },
    {
        id: "expert",
        name: "Expert",
        description: "A faster, deeper path for learners ready to work beyond the core model.",
        available: false,
    },
];

export const TOPICS: TopicDefinition[] = [
    {
        id: "photosynthesis",
        name: "Photosynthesis",
        description: "Follow matter and energy as plants build the material they need.",
        levels: levelsFor(true),
    },
    {
        id: "cells",
        name: "Cells & systems",
        description: "Move from individual cells to the systems they build together.",
        levels: levelsFor(false),
    },
    {
        id: "forces",
        name: "Forces & motion",
        description: "Use patterns in motion to reason about pushes, pulls, and change.",
        levels: levelsFor(false),
    },
];

export function findTopic(topicId: string): TopicDefinition | undefined {
    return TOPICS.find((topic) => topic.id === topicId);
}

export function findLevel(topicId: string, levelId: string): LevelDefinition | undefined {
    return findTopic(topicId)?.levels.find((level) => level.id === levelId);
}
