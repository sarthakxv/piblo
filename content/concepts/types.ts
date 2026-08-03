export interface Objective {
    id: string;
    title: string;
    shortTitle: string;
    takeaway: string;
    masteryCriterion: string;
}

export interface ReviewCard {
    id: string;
    question: string;
    answer: string;
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
    reviewCards: ReviewCard[];
    targetLanguage?: string;
}
