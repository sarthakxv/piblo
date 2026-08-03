export interface Objective {
    id: string;
    title: string;
    shortTitle: string;
    masteryCriterion: string;
}

export interface Misconception {
    id: string;
    belief: string;
    reality: string;
}

export interface Concept {
    id: string;
    title: string;
    objectives: Objective[];
    misconceptions: Misconception[];
    targetLanguage?: string;
}
