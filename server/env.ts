export interface ServerEnvironment {
    opencodeApiKey: string;
    tutorModel: string;
    analyzerModel: string;
}

export function getServerEnvironment(): ServerEnvironment {
    const opencodeApiKey = process.env.OPENCODE_API_KEY;
    if (!opencodeApiKey) {
        throw new Error("OPENCODE_API_KEY is not configured.");
    }

    return {
        opencodeApiKey,
        tutorModel: process.env.OPENCODE_TUTOR_MODEL ?? "muse-spark-1.3-contributor",
        analyzerModel: process.env.OPENCODE_ANALYZER_MODEL ?? "muse-spark-1.3-contributor",
    };
}
