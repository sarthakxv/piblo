import { z } from "zod";

export interface DateOfBirthParts {
    day: string;
    month: string;
    year: string;
}

export function parseDateOfBirth(
    dayText: string,
    monthText: string,
    yearText: string,
): string | null {
    if (
        !/^\d{2}$/.test(dayText) ||
        !/^\d{2}$/.test(monthText) ||
        !/^\d{4}$/.test(yearText)
    ) {
        return null;
    }

    const day = Number(dayText);
    const month = Number(monthText);
    const year = Number(yearText);
    const date = new Date(Date.UTC(year, month - 1, day));
    const today = new Date();
    const todayAtMidnight = Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
    );

    if (
        year < 1900 ||
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day ||
        date.getTime() >= todayAtMidnight
    ) {
        return null;
    }

    return `${yearText}-${monthText}-${dayText}`;
}

export const LearnerProfileInputSchema = z.object({
    name: z.string().trim().min(1).max(80),
    dateOfBirth: z.string().refine((value) => {
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
        return match ? parseDateOfBirth(match[3], match[2], match[1]) === value : false;
    }),
});

export type LearnerProfileInput = z.infer<typeof LearnerProfileInputSchema>;

export interface LearnerProfile extends LearnerProfileInput {
    id: string;
    email: string | null;
    avatarUrl: string | null;
}
