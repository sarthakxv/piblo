"use client";

import {
    useRef,
    useState,
    type FormEvent,
    type ReactNode,
    type RefObject,
} from "react";
import { cn } from "../lib/cn";

type View = "onboarding" | "home" | "lesson" | "complete";
type TurnStatus = "idle" | "assessing" | "preparing" | "error";
type Confidence = "Guessing" | "Somewhat sure" | "Sure";
type RelationshipAnswer = "part" | "not-part";

interface LessonAnswers {
    prediction: string;
    predictionOther: string;
    predictionReason: string;
    confidence: Confidence | "";
    observation: string;
    explanation: string;
    relationships: Record<string, RelationshipAnswer | undefined>;
    generalization: {
        energy: string;
        firstInput: string;
        secondInput: string;
        output: string;
    };
    application: string;
    applicationReason: string;
    reflection: string;
    reflectionEvidence: string;
}

interface LearnerProfile {
    version: 1;
    name: string;
    dateOfBirth: string;
}

interface DateOfBirthParts {
    day: string;
    month: string;
    year: string;
}

interface PhaseDefinition {
    key: string;
    trailLabel: string;
    learnerLabel: string;
    eyebrow: string;
}

const PROFILE_STORAGE_KEY = "piblo-demo-profile-v1";

const DATE_OF_BIRTH_FIELDS: Array<{
    part: keyof DateOfBirthParts;
    id: string;
    name: string;
    label: string;
    placeholder: string;
    autoComplete: string;
    maxLength: number;
    width: string;
}> = [
    {
        part: "day",
        id: "learner-birth-day",
        name: "birthDay",
        label: "Birth day",
        placeholder: "DD",
        autoComplete: "bday-day",
        maxLength: 2,
        width: "w-10",
    },
    {
        part: "month",
        id: "learner-birth-month",
        name: "birthMonth",
        label: "Birth month",
        placeholder: "MM",
        autoComplete: "bday-month",
        maxLength: 2,
        width: "w-10",
    },
    {
        part: "year",
        id: "learner-birth-year",
        name: "birthYear",
        label: "Birth year",
        placeholder: "YYYY",
        autoComplete: "bday-year",
        maxLength: 4,
        width: "w-20",
    },
];

const PHASES: PhaseDefinition[] = [
    {
        key: "predict",
        trailLabel: "Prediction",
        learnerLabel: "Make a prediction",
        eyebrow: "Start with what you think",
    },
    {
        key: "observe",
        trailLabel: "Evidence",
        learnerLabel: "Notice what changed",
        eyebrow: "Look closely at the evidence",
    },
    {
        key: "explain",
        trailLabel: "Explanation",
        learnerLabel: "Build the idea",
        eyebrow: "Connect the pieces",
    },
    {
        key: "generalize",
        trailLabel: "Rule",
        learnerLabel: "Find the rule",
        eyebrow: "Say what is true in general",
    },
    {
        key: "apply",
        trailLabel: "Application",
        learnerLabel: "Try it somewhere new",
        eyebrow: "Test the idea in a new situation",
    },
    {
        key: "reflect",
        trailLabel: "Reflection",
        learnerLabel: "Look back",
        eyebrow: "Notice how your thinking changed",
    },
];

const EMPTY_ANSWERS: LessonAnswers = {
    prediction: "",
    predictionOther: "",
    predictionReason: "",
    confidence: "",
    observation: "",
    explanation: "",
    relationships: {},
    generalization: {
        energy: "",
        firstInput: "",
        secondInput: "",
        output: "",
    },
    application: "",
    applicationReason: "",
    reflection: "",
    reflectionEvidence: "",
};

const parseDateOfBirth = (
    dayText: string,
    monthText: string,
    yearText: string,
) => {
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
};

const readLearnerProfile = (): LearnerProfile | null => {
    try {
        const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
        if (!raw) return null;

        const profile = JSON.parse(raw) as Partial<LearnerProfile>;
        const storedDate =
            typeof profile.dateOfBirth === "string"
                ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(profile.dateOfBirth)
                : null;
        const validatedDate = storedDate
            ? parseDateOfBirth(storedDate[3], storedDate[2], storedDate[1])
            : null;

        if (
            profile.version !== 1 ||
            typeof profile.name !== "string" ||
            !profile.name.trim() ||
            !validatedDate
        ) {
            return null;
        }

        return {
            version: 1,
            name: profile.name.trim(),
            dateOfBirth: validatedDate,
        };
    } catch {
        return null;
    }
};

const wait = (milliseconds: number) =>
    new Promise<void>((resolve) => {
        window.setTimeout(resolve, milliseconds);
    });

function OptionButton({
    selected,
    children,
    onClick,
    className,
}: {
    selected: boolean;
    children: ReactNode;
    onClick: () => void;
    className?: string;
}) {
    return (
        <button
            type="button"
            aria-pressed={selected}
            onClick={onClick}
            className={cn(
                "min-h-12 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors duration-150",
                "focus-visible:outline-ink hover:border-rule-strong",
                selected
                    ? "border-ink bg-ink-soft text-graphite"
                    : "border-rule bg-paper-raised text-graphite",
                className,
            )}
        >
            {children}
        </button>
    );
}

function FieldLabel({
    children,
    htmlFor,
    optional = false,
}: {
    children: ReactNode;
    htmlFor?: string;
    optional?: boolean;
}) {
    return (
        <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-graphite">
            {children}
            {optional ? (
                <span className="ml-2 font-normal text-graphite-muted">Optional</span>
            ) : null}
        </label>
    );
}

function NotebookTextarea({
    id,
    value,
    onChange,
    placeholder,
    rows = 3,
}: {
    id: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    rows?: number;
}) {
    return (
        <textarea
            id={id}
            value={value}
            rows={rows}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className={cn(
                "w-full resize-y rounded-lg border border-rule bg-paper-inset px-4 py-3",
                "text-base text-graphite placeholder:text-graphite-muted",
                "focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/20",
            )}
        />
    );
}

function StatusPanel({
    status,
    onRetry,
    onStop,
}: {
    status: TurnStatus;
    onRetry: () => void;
    onStop: () => void;
}) {
    if (status === "idle") return null;

    if (status === "error") {
        return (
            <div
                role="alert"
                className="mt-4 rounded-lg border border-coral/40 bg-coral-soft px-4 py-3"
            >
                <p className="font-semibold text-graphite">Piblo could not prepare the next step.</p>
                <p className="mt-1 text-sm text-graphite-soft">
                    Your answer is still here. Retry when you are ready.
                </p>
                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-3 rounded-lg bg-graphite px-4 py-2 text-sm font-semibold text-paper-raised"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div
            role="status"
            aria-live="polite"
            className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink/25 bg-ink-soft px-4 py-3"
        >
            <div>
                <p className="font-semibold text-graphite">
                    {status === "assessing"
                        ? "Checking your explanation…"
                        : "Preparing the next step…"}
                </p>
                <p className="mt-1 text-sm text-graphite-soft">
                    Your response has been preserved.
                </p>
            </div>
            <button
                type="button"
                onClick={onStop}
                className="rounded-lg border border-rule-strong bg-paper-raised px-3 py-2 text-sm font-semibold"
            >
                Stop
            </button>
        </div>
    );
}

function HelpPanel({
    phaseIndex,
    level,
}: {
    phaseIndex: number;
    level: number;
}) {
    if (level === 0) return null;

    const hints: Record<number, string[]> = {
        0: [
            "Think about which source could provide enough material for a plant to become much heavier.",
            "Separate matter from energy: sunlight powers the process, but light is not the material that becomes wood.",
            "Most of a plant's dry material is built from carbon dioxide in the air.",
        ],
        1: [
            "Compare the size of the two changes, not only their direction.",
            "The plant gained 50 kg while the soil lost less than 1 kg. Ask whether those amounts can balance.",
            "The soil change is too small to explain the plant's new mass.",
        ],
        2: [
            "Start with the pieces you already know: air, water, and light.",
            "Carbon dioxide and water provide matter. Light provides the energy to rearrange that matter.",
            "Plants use light energy to turn carbon dioxide and water into glucose, releasing oxygen.",
        ],
        3: [
            "Think of the sentence as inputs → energy-driven change → output.",
            "Use the words from your diagram: light, carbon dioxide, water, and glucose.",
            "Plants use light energy to transform carbon dioxide and water into glucose.",
        ],
        4: [
            "Only one condition changed: the plant no longer receives light.",
            "Water and carbon dioxide are still present, but the energy source for photosynthesis is missing.",
            "The plant cannot photosynthesize in darkness because the process requires light energy.",
        ],
        5: [
            "Look back at your first answer and name the specific evidence that challenged it.",
            "A strong reflection says what changed and why, rather than only stating the final fact.",
            "Your original prediction can be wrong; the important part is showing how evidence changed it.",
        ],
    };

    const currentHints = hints[phaseIndex] ?? hints[2];
    const index = Math.min(level - 1, currentHints.length - 1);

    return (
        <aside className="mt-5 rounded-lg border border-amber-ink/25 bg-amber-note px-4 py-4">
            <p className="text-xs font-bold uppercase text-amber-ink">
                {level >= 3 ? "Plain explanation" : level === 2 ? "Stronger hint" : "Hint"}
            </p>
            <p className="mt-2 text-pretty text-sm leading-6 text-graphite">
                {currentHints[index]}
            </p>
        </aside>
    );
}

function AskPiblo({
    open,
    question,
    answer,
    onOpenChange,
    onQuestionChange,
    onSubmit,
}: {
    open: boolean;
    question: string;
    answer: string;
    onOpenChange: (open: boolean) => void;
    onQuestionChange: (question: string) => void;
    onSubmit: () => void;
}) {
    if (!open) {
        return (
            <button
                type="button"
                aria-expanded="false"
                onClick={() => onOpenChange(true)}
                className="rounded-lg border border-rule-strong bg-paper-raised px-4 py-2 text-sm font-semibold text-graphite"
            >
                Ask Piblo
            </button>
        );
    }

    return (
        <aside
            aria-label="Ask Piblo"
            className="mt-5 w-full basis-full border-l-4 border-ink bg-ink-soft px-5 py-5"
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="font-semibold text-graphite">Ask without leaving your work</p>
                    <p className="mt-1 text-sm text-graphite-soft">
                        Your current activity will stay exactly as it is.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="rounded-lg border border-rule-strong bg-paper-raised px-3 py-2 text-sm font-semibold"
                >
                    Return to activity
                </button>
            </div>

            {answer ? (
                <div className="mt-4 rounded-lg border border-ink/25 bg-paper-raised px-4 py-4">
                    <p className="font-notebook text-lg leading-7 text-graphite">{answer}</p>
                </div>
            ) : (
                <div className="mt-4">
                    <FieldLabel htmlFor="ask-piblo-question">What are you wondering?</FieldLabel>
                    <NotebookTextarea
                        id="ask-piblo-question"
                        value={question}
                        onChange={onQuestionChange}
                        placeholder="For example: Why does light count as energy?"
                        rows={2}
                    />
                    <button
                        type="button"
                        disabled={!question.trim()}
                        onClick={onSubmit}
                        className={cn(
                            "mt-3 rounded-lg px-4 py-2 text-sm font-semibold",
                            question.trim()
                                ? "bg-ink text-paper-raised"
                                : "cursor-not-allowed bg-rule text-graphite-muted",
                        )}
                    >
                        Ask question
                    </button>
                </div>
            )}
        </aside>
    );
}

function TrailArtifact({
    label,
    state,
    summary,
}: {
    label: string;
    state: "complete" | "current" | "upcoming";
    summary?: string;
}) {
    return (
        <li className="relative flex gap-3 pb-6 last:pb-0">
            <span
                aria-hidden="true"
                className={cn(
                    "mt-1.5 size-3 shrink-0 rounded-full border-2",
                    state === "complete" && "border-moss bg-moss",
                    state === "current" && "border-ink bg-paper-raised",
                    state === "upcoming" && "border-rule-strong bg-paper",
                )}
            />
            <div className="min-w-0">
                <p
                    className={cn(
                        "text-sm font-semibold",
                        state === "upcoming" ? "text-graphite-muted" : "text-graphite",
                    )}
                >
                    {label}
                </p>
                {summary ? (
                    <p className="mt-1 text-pretty text-xs leading-5 text-graphite-soft">
                        {summary}
                    </p>
                ) : null}
            </div>
        </li>
    );
}

function DateOfBirthField({
    value,
    error,
    dayRef,
    onChange,
}: {
    value: DateOfBirthParts;
    error?: string;
    dayRef: RefObject<HTMLInputElement | null>;
    onChange: (part: keyof DateOfBirthParts, value: string) => void;
}) {
    const describedBy = error
        ? "learner-date-of-birth-hint learner-date-of-birth-error"
        : "learner-date-of-birth-hint";

    return (
        <fieldset className="mt-6">
            <legend className="mb-2 block text-sm font-semibold text-graphite">
                Date of birth
            </legend>
            <div
                className={cn(
                    "flex min-h-12 items-center rounded-lg border bg-paper-inset px-3",
                    "focus-within:ring-2 focus-within:ring-ink/20",
                    error
                        ? "border-coral focus-within:border-coral"
                        : "border-rule focus-within:border-ink",
                )}
            >
                {DATE_OF_BIRTH_FIELDS.map((field, index) => (
                    <div key={field.part} className="contents">
                        {index > 0 ? (
                            <span aria-hidden="true" className="px-1 text-rule-strong">
                                /
                            </span>
                        ) : null}
                        <label htmlFor={field.id} className="sr-only">
                            {field.label}
                        </label>
                        <input
                            ref={field.part === "day" ? dayRef : undefined}
                            id={field.id}
                            name={field.name}
                            type="text"
                            inputMode="numeric"
                            autoComplete={field.autoComplete}
                            maxLength={field.maxLength}
                            required
                            value={value[field.part]}
                            aria-invalid={Boolean(error)}
                            aria-describedby={describedBy}
                            onChange={(event) => onChange(field.part, event.target.value)}
                            className={cn(
                                field.width,
                                "border-0 bg-transparent px-1 py-3 text-center text-base text-graphite",
                                "placeholder:text-graphite-soft focus:outline-none",
                            )}
                            placeholder={field.placeholder}
                        />
                    </div>
                ))}
            </div>
            <p
                id="learner-date-of-birth-hint"
                className="mt-2 text-xs leading-5 text-graphite-soft"
            >
                Use day, month, then year.
            </p>
            {error ? (
                <p
                    id="learner-date-of-birth-error"
                    role="alert"
                    className="mt-2 text-sm font-medium text-coral"
                >
                    {error}
                </p>
            ) : null}
        </fieldset>
    );
}

function OnboardingView({
    onComplete,
}: {
    onComplete: (profile: LearnerProfile) => void;
}) {
    const [name, setName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState<DateOfBirthParts>({
        day: "",
        month: "",
        year: "",
    });
    const [errors, setErrors] = useState<{
        name?: string;
        dateOfBirth?: string;
    }>({});
    const nameRef = useRef<HTMLInputElement>(null);
    const dateOfBirthDayRef = useRef<HTMLInputElement>(null);

    const updateDateOfBirth = (part: keyof DateOfBirthParts, value: string) => {
        setDateOfBirth((current) => ({
            ...current,
            [part]: value.replace(/\D/g, "").slice(0, part === "year" ? 4 : 2),
        }));

        if (errors.dateOfBirth) {
            setErrors((current) => ({
                ...current,
                dateOfBirth: undefined,
            }));
        }
    };

    const submitProfile = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const normalizedName = name.trim().replace(/\s+/g, " ");
        const normalizedDateOfBirth = parseDateOfBirth(
            dateOfBirth.day.padStart(2, "0"),
            dateOfBirth.month.padStart(2, "0"),
            dateOfBirth.year,
        );
        const nextErrors = {
            name: normalizedName ? undefined : "Enter your name to continue.",
            dateOfBirth: normalizedDateOfBirth
                ? undefined
                : "Enter a valid date in the past.",
        };

        setErrors(nextErrors);

        if (nextErrors.name) {
            nameRef.current?.focus();
            return;
        }

        if (nextErrors.dateOfBirth || !normalizedDateOfBirth) {
            dateOfBirthDayRef.current?.focus();
            return;
        }

        onComplete({
            version: 1,
            name: normalizedName,
            dateOfBirth: normalizedDateOfBirth,
        });
    };

    return (
        <main className="min-h-dvh px-5 py-6 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-6xl">
                <header className="border-b border-rule pb-5">
                    <p className="font-notebook text-2xl font-bold text-graphite">Piblo</p>
                    <p className="text-xs text-graphite-soft">A learning space that thinks with you</p>
                </header>

                <div className="grid gap-10 py-10 lg:min-h-[calc(100dvh-7rem)] lg:grid-cols-[minmax(0,1fr)_28rem] lg:items-center lg:gap-16 lg:py-16">
                    <section className="max-w-2xl">
                        <p className="text-sm font-bold text-ink">
                            A guided way to work ideas out
                        </p>
                        <h1 className="mt-4 max-w-xl text-balance font-notebook text-4xl font-bold leading-tight text-graphite sm:text-5xl">
                            Bring what you know. Leave with a clearer idea.
                        </h1>
                        <p className="mt-6 max-w-xl text-pretty text-lg leading-8 text-graphite-soft">
                            Piblo gives you evidence, small challenges, and the right amount of
                            help while you build an explanation for yourself.
                        </p>

                        <div className="mt-10 max-w-xl border-l-2 border-ink pl-5">
                            <p className="text-xs font-bold uppercase tracking-wide text-graphite-soft">
                                Your thinking trail
                            </p>
                            <ol className="mt-3 flex flex-wrap items-center gap-2 font-notebook text-lg font-semibold text-graphite">
                                <li>Prediction</li>
                                <li aria-hidden="true" className="text-rule-strong">
                                    →
                                </li>
                                <li>Evidence</li>
                                <li aria-hidden="true" className="text-rule-strong">
                                    →
                                </li>
                                <li>Explanation</li>
                            </ol>
                            <p className="mt-2 text-sm leading-6 text-graphite-soft">
                                Start with your own idea, then make it stronger.
                            </p>
                        </div>
                    </section>

                    <section
                        aria-labelledby="onboarding-title"
                        className="rounded-xl border border-rule bg-paper-raised p-6 sm:p-8"
                    >
                        <div className="h-1 w-16 rounded-full bg-ink" aria-hidden="true" />
                        <p className="mt-7 text-xs font-bold uppercase tracking-wide text-graphite-soft">
                            Before we begin
                        </p>
                        <h2
                            id="onboarding-title"
                            className="mt-3 text-balance font-notebook text-3xl font-bold leading-tight text-graphite"
                        >
                            Let&apos;s set up your learning space.
                        </h2>
                        <p className="mt-3 text-pretty text-sm leading-6 text-graphite-soft">
                            No account or password needed. Just tell us what to call you.
                        </p>

                        <form className="mt-8" noValidate onSubmit={submitProfile}>
                            <div>
                                <FieldLabel htmlFor="learner-name">Your name</FieldLabel>
                                <input
                                    ref={nameRef}
                                    id="learner-name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    maxLength={80}
                                    required
                                    value={name}
                                    aria-invalid={Boolean(errors.name)}
                                    aria-describedby={errors.name ? "learner-name-error" : undefined}
                                    onChange={(event) => {
                                        setName(event.target.value);
                                        if (errors.name) {
                                            setErrors((current) => ({
                                                ...current,
                                                name: undefined,
                                            }));
                                        }
                                    }}
                                    className={cn(
                                        "min-h-12 w-full rounded-lg border bg-paper-inset px-4 py-3 text-base text-graphite",
                                        "placeholder:text-graphite-soft focus:outline-none focus:ring-2 focus:ring-ink/20",
                                        errors.name
                                            ? "border-coral focus:border-coral"
                                            : "border-rule focus:border-ink",
                                    )}
                                    placeholder="What should Piblo call you?"
                                />
                                {errors.name ? (
                                    <p
                                        id="learner-name-error"
                                        role="alert"
                                        className="mt-2 text-sm font-medium text-coral"
                                    >
                                        {errors.name}
                                    </p>
                                ) : null}
                            </div>

                            <DateOfBirthField
                                value={dateOfBirth}
                                error={errors.dateOfBirth}
                                dayRef={dateOfBirthDayRef}
                                onChange={updateDateOfBirth}
                            />

                            <button
                                type="submit"
                                className="mt-7 min-h-12 w-full rounded-lg bg-graphite px-5 py-3 font-semibold text-paper-raised transition-colors duration-150 hover:bg-ink"
                            >
                                Continue to Piblo
                            </button>
                            <p className="mt-4 text-center text-xs leading-5 text-graphite-soft">
                                For this demo, your details stay only in this browser.
                            </p>
                        </form>
                    </section>
                </div>
            </div>
        </main>
    );
}

export function PibloPrototype() {
    const [profile, setProfile] = useState<LearnerProfile | null>(readLearnerProfile);
    const [view, setView] = useState<View>(profile ? "home" : "onboarding");
    const [storageWarning, setStorageWarning] = useState(false);
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [grade, setGrade] = useState("Grades 6–8");
    const [goal, setGoal] = useState("Understand the idea");
    const [answers, setAnswers] = useState<LessonAnswers>(EMPTY_ANSWERS);
    const [supportLevel, setSupportLevel] = useState(0);
    const [status, setStatus] = useState<TurnStatus>("idle");
    const [askOpen, setAskOpen] = useState(false);
    const [askQuestion, setAskQuestion] = useState("");
    const [askAnswer, setAskAnswer] = useState("");
    const [trailOpen, setTrailOpen] = useState(false);
    const [failNextTurn, setFailNextTurn] = useState(false);
    const requestId = useRef(0);
    const homeHeadingRef = useRef<HTMLHeadingElement>(null);

    const phase = PHASES[phaseIndex] ?? PHASES[0];
    const busy = status === "assessing" || status === "preparing";

    const updateAnswers = (update: Partial<LessonAnswers>) => {
        setAnswers((current) => ({ ...current, ...update }));
    };

    const completeOnboarding = (nextProfile: LearnerProfile) => {
        let profileWasStored = true;

        try {
            window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
        } catch {
            profileWasStored = false;
        }

        setProfile(nextProfile);
        setStorageWarning(!profileWasStored);
        setView("home");
        window.scrollTo({ top: 0 });
        window.requestAnimationFrame(() => homeHeadingRef.current?.focus());
    };

    const resetLearnerProfile = () => {
        try {
            window.localStorage.removeItem(PROFILE_STORAGE_KEY);
        } catch {
            // The in-memory reset still gives the next learner a clean start.
        }

        setProfile(null);
        setStorageWarning(false);
        setView("onboarding");
        window.scrollTo({ top: 0 });
    };

    const startLesson = () => {
        requestId.current += 1;
        setAnswers(EMPTY_ANSWERS);
        setPhaseIndex(0);
        setSupportLevel(0);
        setStatus("idle");
        setAskOpen(false);
        setAskQuestion("");
        setAskAnswer("");
        setView("lesson");
        window.scrollTo({ top: 0 });
    };

    const canSubmit = (() => {
        switch (phaseIndex) {
            case 0:
                return Boolean(
                    answers.prediction &&
                        (answers.prediction !== "Something else" ||
                            answers.predictionOther.trim()) &&
                        answers.confidence,
                );
            case 1:
                return Boolean(answers.observation);
            case 2:
                return Boolean(
                    answers.explanation.trim() &&
                        ["carbon dioxide", "water", "light"].every(
                            (item) => answers.relationships[item],
                        ),
                );
            case 3:
                return Object.values(answers.generalization).every((value) => value.trim());
            case 4:
                return Boolean(answers.application && answers.applicationReason.trim());
            case 5:
                return Boolean(answers.reflection.trim() && answers.reflectionEvidence.trim());
            default:
                return false;
        }
    })();

    const submitMove = async () => {
        if (!canSubmit || busy) return;

        const currentRequest = requestId.current + 1;
        requestId.current = currentRequest;
        setStatus("assessing");
        await wait(650);
        if (requestId.current !== currentRequest) return;

        if (failNextTurn) {
            setFailNextTurn(false);
            setStatus("error");
            return;
        }

        setStatus("preparing");
        await wait(500);
        if (requestId.current !== currentRequest) return;

        const nextPhaseIndex = phaseIndex + 1;
        if (nextPhaseIndex >= PHASES.length) {
            setView("complete");
        } else {
            setPhaseIndex(nextPhaseIndex);
            setSupportLevel(0);
            setAskOpen(false);
            setAskQuestion("");
            setAskAnswer("");
        }
        setStatus("idle");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const stopTurn = () => {
        requestId.current += 1;
        setStatus("idle");
    };

    const requestSupport = () => {
        setSupportLevel((current) => Math.min(current + 1, 3));
    };

    const submitAskQuestion = () => {
        if (!askQuestion.trim()) return;
        setAskAnswer(
            "Light is energy rather than plant material. It powers the rearrangement of carbon dioxide and water into glucose—like electricity powers a machine without becoming the product.",
        );
    };

    const trailSummaries = [
        answers.prediction
            ? `You chose ${answers.prediction === "Something else" ? answers.predictionOther : answers.prediction.toLowerCase()}.`
            : undefined,
        answers.observation
            ? answers.observation === "The soil loss is too small"
                ? "The soil loss was too small to explain the plant's growth."
                : "You captured an observation to test against the evidence."
            : undefined,
        answers.explanation.trim()
            ? "You connected matter from air and water with energy from light."
            : undefined,
        answers.generalization.output.trim()
            ? `Your rule produces ${answers.generalization.output}.`
            : undefined,
        answers.application
            ? "You tested the rule on a plant kept in darkness."
            : undefined,
        answers.reflection.trim() ? "You explained how your thinking changed." : undefined,
    ];

    if (view === "onboarding") {
        return <OnboardingView onComplete={completeOnboarding} />;
    }

    if (view === "home") {
        const firstName = profile?.name.split(/\s+/)[0];

        return (
            <main className="min-h-dvh px-5 py-6 sm:px-8 lg:px-12">
                <div className="mx-auto max-w-6xl">
                    <header className="flex items-center justify-between gap-4 border-b border-rule pb-5">
                        <div>
                            <p className="font-notebook text-2xl font-bold text-graphite">Piblo</p>
                            <p className="text-xs text-graphite-muted">Learning workspace prototype</p>
                        </div>
                        <button
                            type="button"
                            onClick={resetLearnerProfile}
                            className="rounded-lg border border-rule bg-paper-raised px-3 py-2 text-xs font-semibold text-graphite-soft transition-colors duration-150 hover:border-rule-strong hover:text-graphite"
                        >
                            Not {firstName ?? "you"}?
                        </button>
                    </header>

                    <div className="grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_28rem] lg:items-start lg:gap-16 lg:py-20">
                        <section className="max-w-2xl">
                            <p className="text-sm font-bold text-ink">
                                {firstName
                                    ? `Welcome, ${firstName}`
                                    : "A guided way to work ideas out"}
                            </p>
                            <h1
                                ref={homeHeadingRef}
                                tabIndex={-1}
                                className="mt-4 max-w-xl text-balance font-notebook text-4xl font-bold leading-tight text-graphite focus:outline-none sm:text-5xl"
                            >
                                Don&apos;t just get the answer. See your thinking change.
                            </h1>
                            <p className="mt-6 max-w-xl text-pretty text-lg leading-8 text-graphite-soft">
                                Piblo gives you evidence, diagrams, and small challenges while
                                adapting the amount of help along the way.
                            </p>

                            <ol className="mt-10 grid gap-4 sm:grid-cols-3">
                                {[
                                    ["1", "Make a prediction"],
                                    ["2", "Work with evidence"],
                                    ["3", "Apply the idea"],
                                ].map(([number, label]) => (
                                    <li key={number} className="border-l-2 border-rule pl-4">
                                        <p className="tabular-nums text-xs font-bold text-graphite-muted">
                                            {number}
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-graphite">
                                            {label}
                                        </p>
                                    </li>
                                ))}
                            </ol>
                        </section>

                        <div>
                            {storageWarning ? (
                                <div
                                    role="status"
                                    className="mb-4 rounded-lg border border-amber-ink/25 bg-amber-note px-4 py-3 text-sm leading-6 text-graphite"
                                >
                                    You can continue, but this browser won&apos;t remember your
                                    details.
                                </div>
                            ) : null}
                            <section
                                aria-labelledby="lesson-card-title"
                                className="rounded-xl border border-rule bg-paper-raised p-6 sm:p-8"
                            >
                                <p className="text-xs font-bold uppercase text-graphite-muted">
                                    First lesson
                                </p>
                                <h2
                                    id="lesson-card-title"
                                    className="mt-3 text-balance font-notebook text-3xl font-bold text-graphite"
                                >
                                    Where does a plant&apos;s mass come from?
                                </h2>
                                <p className="mt-3 text-pretty text-sm leading-6 text-graphite-soft">
                                    Build an explanation of photosynthesis through one prediction,
                                    one surprising observation, and one new situation.
                                </p>

                                <fieldset className="mt-7">
                                    <legend className="text-sm font-semibold text-graphite">
                                        Learning level
                                    </legend>
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        {["Grades 6–8", "Grades 9–10"].map((option) => (
                                            <OptionButton
                                                key={option}
                                                selected={grade === option}
                                                onClick={() => setGrade(option)}
                                            >
                                                {option}
                                            </OptionButton>
                                        ))}
                                    </div>
                                </fieldset>

                                <fieldset className="mt-6">
                                    <legend className="text-sm font-semibold text-graphite">
                                        What do you want from this lesson?
                                    </legend>
                                    <div className="mt-3 grid gap-2">
                                        {["Understand the idea", "Prepare for class"].map(
                                            (option) => (
                                                <OptionButton
                                                    key={option}
                                                    selected={goal === option}
                                                    onClick={() => setGoal(option)}
                                                >
                                                    {option}
                                                </OptionButton>
                                            ),
                                        )}
                                    </div>
                                </fieldset>

                                <button
                                    type="button"
                                    onClick={startLesson}
                                    className="mt-7 w-full rounded-lg bg-graphite px-5 py-3 font-semibold text-paper-raised"
                                >
                                    Start with a prediction
                                </button>
                            </section>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (view === "complete") {
        return (
            <main className="min-h-dvh px-5 py-8 sm:px-8">
                <div className="mx-auto max-w-5xl">
                    <header className="flex items-center justify-between border-b border-rule pb-5">
                        <p className="font-notebook text-2xl font-bold">Piblo</p>
                        <span className="text-sm text-graphite-muted">Lesson complete</span>
                    </header>

                    <section className="py-10 sm:py-16">
                        <p className="text-sm font-bold text-moss">Your Thinking Trail</p>
                        <h1 className="mt-3 max-w-3xl text-balance font-notebook text-4xl font-bold leading-tight sm:text-5xl">
                            You changed more than your answer—you changed your explanation.
                        </h1>

                        <div className="mt-10 grid gap-6 lg:grid-cols-2">
                            <article className="rounded-xl border border-rule bg-paper-raised p-6">
                                <p className="text-xs font-bold uppercase text-graphite-muted">
                                    At the start
                                </p>
                                <p className="mt-3 font-notebook text-2xl leading-9 text-graphite">
                                    “Most of the plant&apos;s mass comes from{" "}
                                    {answers.prediction === "Something else"
                                        ? answers.predictionOther
                                        : answers.prediction.toLowerCase()}
                                    .”
                                </p>
                            </article>
                            <article className="rounded-xl border border-moss/35 bg-moss-soft p-6">
                                <p className="text-xs font-bold uppercase text-moss">Now</p>
                                <p className="mt-3 font-notebook text-2xl leading-9 text-graphite">
                                    “{answers.reflection}”
                                </p>
                            </article>
                        </div>

                        <article className="mt-6 border-l-4 border-amber-ink bg-amber-note px-6 py-5">
                            <p className="text-sm font-bold text-amber-ink">
                                Evidence that changed your mind
                            </p>
                            <p className="mt-2 text-pretty leading-7 text-graphite">
                                {answers.reflectionEvidence}
                            </p>
                        </article>

                        <div className="mt-10 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setView("lesson");
                                    setPhaseIndex(4);
                                }}
                                className="rounded-lg bg-graphite px-5 py-3 font-semibold text-paper-raised"
                            >
                                Try another application
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setView("home");
                                    window.scrollTo({ top: 0 });
                                }}
                                className="rounded-lg border border-rule-strong bg-paper-raised px-5 py-3 font-semibold text-graphite"
                            >
                                Return home
                            </button>
                        </div>
                    </section>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-dvh">
            <header className="border-b border-rule bg-paper-raised">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
                    <div className="flex items-center gap-5">
                        <button
                            type="button"
                            onClick={() => {
                                setView("home");
                                window.scrollTo({ top: 0 });
                            }}
                            className="font-notebook text-xl font-bold text-graphite"
                        >
                            Piblo
                        </button>
                        <div className="hidden border-l border-rule pl-5 sm:block">
                            <p className="text-sm font-semibold text-graphite">Photosynthesis</p>
                            <p className="text-xs text-graphite-muted">{phase.learnerLabel}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            aria-expanded={trailOpen}
                            onClick={() => setTrailOpen((current) => !current)}
                            className="rounded-lg border border-rule-strong bg-paper-raised px-3 py-2 text-sm font-semibold lg:hidden"
                        >
                            Thinking Trail
                        </button>
                        <details className="relative">
                            <summary className="cursor-pointer rounded-lg border border-rule-strong bg-paper-raised px-3 py-2 text-sm font-semibold">
                                Prototype states
                            </summary>
                            <div className="absolute right-0 z-20 mt-2 w-64 rounded-lg border border-rule bg-paper-raised p-4">
                                <p className="text-sm font-semibold">Failure recovery</p>
                                <p className="mt-1 text-xs leading-5 text-graphite-soft">
                                    Make the next submitted move fail once.
                                </p>
                                <button
                                    type="button"
                                    aria-pressed={failNextTurn}
                                    onClick={() => setFailNextTurn((current) => !current)}
                                    className={cn(
                                        "mt-3 w-full rounded-lg border px-3 py-2 text-left text-sm font-semibold",
                                        failNextTurn
                                            ? "border-coral bg-coral-soft"
                                            : "border-rule-strong bg-paper",
                                    )}
                                >
                                    {failNextTurn ? "Failure armed" : "Simulate next failure"}
                                </button>
                            </div>
                        </details>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 sm:py-10">
                {trailOpen ? (
                    <aside className="mb-6 rounded-xl border border-rule bg-paper-raised p-5 lg:hidden">
                        <p className="font-notebook text-xl font-bold">Thinking Trail</p>
                        <ol className="mt-5">
                            {PHASES.map((item, index) => (
                                <TrailArtifact
                                    key={item.key}
                                    label={item.trailLabel}
                                    state={
                                        index < phaseIndex
                                            ? "complete"
                                            : index === phaseIndex
                                              ? "current"
                                              : "upcoming"
                                    }
                                    summary={index < phaseIndex ? trailSummaries[index] : undefined}
                                />
                            ))}
                        </ol>
                    </aside>
                ) : null}

                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-12">
                    <section aria-labelledby="move-title" className="min-w-0">
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <p className="text-sm font-bold text-ink">{phase.eyebrow}</p>
                            <p className="tabular-nums text-xs font-semibold text-graphite-muted">
                                Step {phaseIndex + 1} of {PHASES.length}
                            </p>
                        </div>

                        <div className="rounded-xl border border-rule bg-paper-raised p-5 sm:p-8 lg:p-10">
                            {phaseIndex === 0 ? (
                                <PredictionMove answers={answers} updateAnswers={updateAnswers} />
                            ) : null}
                            {phaseIndex === 1 ? (
                                <ObservationMove answers={answers} updateAnswers={updateAnswers} />
                            ) : null}
                            {phaseIndex === 2 ? (
                                <ExplanationMove answers={answers} updateAnswers={updateAnswers} />
                            ) : null}
                            {phaseIndex === 3 ? (
                                <GeneralizationMove
                                    answers={answers}
                                    updateAnswers={updateAnswers}
                                />
                            ) : null}
                            {phaseIndex === 4 ? (
                                <ApplicationMove answers={answers} updateAnswers={updateAnswers} />
                            ) : null}
                            {phaseIndex === 5 ? (
                                <ReflectionMove answers={answers} updateAnswers={updateAnswers} />
                            ) : null}

                            <HelpPanel phaseIndex={phaseIndex} level={supportLevel} />

                            <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-5">
                                <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                                    <button
                                        type="button"
                                        disabled={supportLevel >= 3}
                                        onClick={requestSupport}
                                        className={cn(
                                            "rounded-lg border px-4 py-2 text-sm font-semibold",
                                            supportLevel >= 3
                                                ? "cursor-not-allowed border-rule bg-paper text-graphite-muted"
                                                : "border-amber-ink/35 bg-amber-note text-amber-ink",
                                        )}
                                    >
                                        Give me a hint
                                    </button>
                                    <button
                                        type="button"
                                        disabled={supportLevel >= 3}
                                        onClick={requestSupport}
                                        className="rounded-lg border border-rule-strong bg-paper-raised px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:text-graphite-muted"
                                    >
                                        I&apos;m stuck
                                    </button>
                                    <AskPiblo
                                        open={askOpen}
                                        question={askQuestion}
                                        answer={askAnswer}
                                        onOpenChange={(open) => {
                                            setAskOpen(open);
                                            if (!open) {
                                                setAskQuestion("");
                                                setAskAnswer("");
                                            }
                                        }}
                                        onQuestionChange={setAskQuestion}
                                        onSubmit={submitAskQuestion}
                                    />
                                </div>

                                <button
                                    type="button"
                                    disabled={!canSubmit || busy}
                                    onClick={submitMove}
                                    className={cn(
                                        "min-w-36 rounded-lg px-5 py-3 font-semibold",
                                        canSubmit && !busy
                                            ? "bg-graphite text-paper-raised"
                                            : "cursor-not-allowed bg-rule text-graphite-muted",
                                    )}
                                >
                                    {phaseIndex === PHASES.length - 1
                                        ? "Finish lesson"
                                        : "Commit and continue"}
                                </button>
                            </div>

                            <StatusPanel
                                status={status}
                                onRetry={submitMove}
                                onStop={stopTurn}
                            />
                        </div>
                    </section>

                    <aside className="hidden border-l border-rule pl-8 lg:block">
                        <p className="font-notebook text-xl font-bold text-graphite">
                            Thinking Trail
                        </p>
                        <p className="mt-1 text-xs leading-5 text-graphite-muted">
                            Your ideas, evidence, and revisions—not a score.
                        </p>
                        <ol className="mt-6">
                            {PHASES.map((item, index) => (
                                <TrailArtifact
                                    key={item.key}
                                    label={item.trailLabel}
                                    state={
                                        index < phaseIndex
                                            ? "complete"
                                            : index === phaseIndex
                                              ? "current"
                                              : "upcoming"
                                    }
                                    summary={index < phaseIndex ? trailSummaries[index] : undefined}
                                />
                            ))}
                        </ol>
                    </aside>
                </div>
            </div>
        </main>
    );
}

function PredictionMove({
    answers,
    updateAnswers,
}: {
    answers: LessonAnswers;
    updateAnswers: (update: Partial<LessonAnswers>) => void;
}) {
    const options = ["Soil", "Water", "Air", "Sunlight", "Something else"];
    const confidenceOptions: Confidence[] = ["Guessing", "Somewhat sure", "Sure"];

    return (
        <>
            <p className="text-xs font-bold uppercase text-graphite-muted">Prediction</p>
            <h1
                id="move-title"
                className="mt-3 max-w-3xl text-balance font-notebook text-3xl font-bold leading-tight sm:text-4xl"
            >
                A young tree gains about 50 kg as it grows. Where does most of that new
                material come from?
            </h1>
            <p className="mt-4 max-w-2xl text-pretty leading-7 text-graphite-soft">
                Commit to what you think before we work it out. This is a starting point,
                not a test.
            </p>

            <fieldset className="mt-8">
                <legend className="text-sm font-semibold">Choose the closest answer</legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {options.map((option) => (
                        <OptionButton
                            key={option}
                            selected={answers.prediction === option}
                            onClick={() => updateAnswers({ prediction: option })}
                        >
                            {option}
                        </OptionButton>
                    ))}
                </div>
            </fieldset>

            {answers.prediction === "Something else" ? (
                <div className="mt-5">
                    <FieldLabel htmlFor="prediction-other">Your answer</FieldLabel>
                    <input
                        id="prediction-other"
                        value={answers.predictionOther}
                        onChange={(event) =>
                            updateAnswers({ predictionOther: event.target.value })
                        }
                        className="w-full rounded-lg border border-rule bg-paper-inset px-4 py-3 focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
                    />
                </div>
            ) : null}

            <div className="mt-6">
                <FieldLabel htmlFor="prediction-reason" optional>
                    Why does that seem likely?
                </FieldLabel>
                <NotebookTextarea
                    id="prediction-reason"
                    value={answers.predictionReason}
                    onChange={(predictionReason) => updateAnswers({ predictionReason })}
                    placeholder="I think this because…"
                />
            </div>

            <fieldset className="mt-6">
                <legend className="text-sm font-semibold">How sure are you?</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                    {confidenceOptions.map((option) => (
                        <OptionButton
                            key={option}
                            selected={answers.confidence === option}
                            onClick={() => updateAnswers({ confidence: option })}
                            className="min-h-0 py-2 text-center"
                        >
                            {option}
                        </OptionButton>
                    ))}
                </div>
            </fieldset>
        </>
    );
}

function ObservationMove({
    answers,
    updateAnswers,
}: {
    answers: LessonAnswers;
    updateAnswers: (update: Partial<LessonAnswers>) => void;
}) {
    const observations = [
        ["The soil loss is too small", "Less than 1 kg cannot explain 50 kg of growth."],
        ["The plant must be mostly water", "Water may matter, but the evidence does not show that yet."],
        ["The numbers do not tell us anything", "There is no useful relationship here."],
    ];

    return (
        <>
            <p className="text-xs font-bold uppercase text-graphite-muted">Observation</p>
            <h1
                id="move-title"
                className="mt-3 max-w-3xl text-balance font-notebook text-3xl font-bold leading-tight sm:text-4xl"
            >
                What does this evidence make difficult to explain?
            </h1>
            <p className="mt-4 max-w-2xl text-pretty leading-7 text-graphite-soft">
                A tree was grown in a large container. Its mass and the soil&apos;s mass
                were measured carefully.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <article className="rounded-lg border border-rule bg-paper p-5">
                    <p className="text-xs font-bold uppercase text-graphite-muted">
                        Plant mass gained
                    </p>
                    <p className="mt-2 tabular-nums font-notebook text-4xl font-bold text-graphite">
                        50 kg
                    </p>
                </article>
                <article className="rounded-lg border border-rule bg-paper p-5">
                    <p className="text-xs font-bold uppercase text-graphite-muted">
                        Soil mass lost
                    </p>
                    <p className="mt-2 tabular-nums font-notebook text-4xl font-bold text-graphite">
                        &lt; 1 kg
                    </p>
                </article>
            </div>

            <fieldset className="mt-7">
                <legend className="text-sm font-semibold">
                    Choose the observation you would investigate
                </legend>
                <div className="mt-3 grid gap-2">
                    {observations.map(([label, description]) => (
                        <OptionButton
                            key={label}
                            selected={answers.observation === label}
                            onClick={() => updateAnswers({ observation: label })}
                        >
                            <span className="block">{label}</span>
                            <span className="mt-1 block text-xs font-normal leading-5 text-graphite-soft">
                                {description}
                            </span>
                        </OptionButton>
                    ))}
                </div>
            </fieldset>
        </>
    );
}

function ExplanationMove({
    answers,
    updateAnswers,
}: {
    answers: LessonAnswers;
    updateAnswers: (update: Partial<LessonAnswers>) => void;
}) {
    const items = ["carbon dioxide", "water", "light"];

    return (
        <>
            <p className="text-xs font-bold uppercase text-graphite-muted">Explanation</p>
            <h1
                id="move-title"
                className="mt-3 max-w-3xl text-balance font-notebook text-3xl font-bold leading-tight sm:text-4xl"
            >
                Which pieces belong in the plant&apos;s food-making process?
            </h1>
            <p className="mt-4 max-w-2xl text-pretty leading-7 text-graphite-soft">
                Decide what belongs, then explain how matter and energy play different
                roles.
            </p>

            <div className="mt-8 overflow-hidden rounded-lg border border-rule">
                {items.map((item, index) => (
                    <div
                        key={item}
                        className={cn(
                            "grid gap-3 bg-paper px-4 py-4 sm:grid-cols-[1fr_auto]",
                            index > 0 && "border-t border-rule",
                        )}
                    >
                        <p className="self-center font-semibold capitalize">{item}</p>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                ["part", "Part of it"],
                                ["not-part", "Not part"],
                            ].map(([value, label]) => (
                                <OptionButton
                                    key={value}
                                    selected={answers.relationships[item] === value}
                                    onClick={() =>
                                        updateAnswers({
                                            relationships: {
                                                ...answers.relationships,
                                                [item]: value as RelationshipAnswer,
                                            },
                                        })
                                    }
                                    className="min-h-0 px-3 py-2 text-center text-xs"
                                >
                                    {label}
                                </OptionButton>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6">
                <FieldLabel htmlFor="explanation">
                    How could these pieces explain the plant&apos;s new material?
                </FieldLabel>
                <NotebookTextarea
                    id="explanation"
                    value={answers.explanation}
                    onChange={(explanation) => updateAnswers({ explanation })}
                    placeholder="The plant takes in… Light helps by…"
                    rows={4}
                />
            </div>
        </>
    );
}

function GeneralizationMove({
    answers,
    updateAnswers,
}: {
    answers: LessonAnswers;
    updateAnswers: (update: Partial<LessonAnswers>) => void;
}) {
    const fields: Array<[keyof LessonAnswers["generalization"], string]> = [
        ["energy", "type of energy"],
        ["firstInput", "first input"],
        ["secondInput", "second input"],
        ["output", "stored-energy output"],
    ];

    return (
        <>
            <p className="text-xs font-bold uppercase text-graphite-muted">Generalize</p>
            <h1
                id="move-title"
                className="mt-3 max-w-3xl text-balance font-notebook text-3xl font-bold leading-tight sm:text-4xl"
            >
                Turn your explanation into a rule.
            </h1>
            <p className="mt-4 max-w-2xl text-pretty leading-7 text-graphite-soft">
                Complete the sentence so it would still be true for many different
                plants.
            </p>

            <div className="mt-8 rounded-lg border border-rule bg-paper p-5 sm:p-7">
                <p className="font-notebook text-xl leading-10 sm:text-2xl">
                    Plants use
                    <BlankInput
                        field={fields[0]}
                        value={answers.generalization.energy}
                        onChange={(energy) =>
                            updateAnswers({
                                generalization: { ...answers.generalization, energy },
                            })
                        }
                    />
                    energy to transform
                    <BlankInput
                        field={fields[1]}
                        value={answers.generalization.firstInput}
                        onChange={(firstInput) =>
                            updateAnswers({
                                generalization: { ...answers.generalization, firstInput },
                            })
                        }
                    />
                    and
                    <BlankInput
                        field={fields[2]}
                        value={answers.generalization.secondInput}
                        onChange={(secondInput) =>
                            updateAnswers({
                                generalization: { ...answers.generalization, secondInput },
                            })
                        }
                    />
                    into
                    <BlankInput
                        field={fields[3]}
                        value={answers.generalization.output}
                        onChange={(output) =>
                            updateAnswers({
                                generalization: { ...answers.generalization, output },
                            })
                        }
                    />
                    .
                </p>
            </div>
        </>
    );
}

function BlankInput({
    field,
    value,
    onChange,
}: {
    field: [keyof LessonAnswers["generalization"], string];
    value: string;
    onChange: (value: string) => void;
}) {
    const [key, label] = field;
    return (
        <span className="mx-2 inline-block">
            <label htmlFor={`generalization-${key}`} className="sr-only">
                {label}
            </label>
            <input
                id={`generalization-${key}`}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={label}
                className="w-44 border-0 border-b-2 border-ink bg-transparent px-2 py-1 font-sans text-base focus:outline-none focus:ring-2 focus:ring-ink/20"
            />
        </span>
    );
}

function ApplicationMove({
    answers,
    updateAnswers,
}: {
    answers: LessonAnswers;
    updateAnswers: (update: Partial<LessonAnswers>) => void;
}) {
    const options = [
        "It keeps photosynthesizing normally",
        "It cannot photosynthesize without light",
        "It replaces light with nutrients from soil",
    ];

    return (
        <>
            <p className="text-xs font-bold uppercase text-graphite-muted">Apply</p>
            <h1
                id="move-title"
                className="mt-3 max-w-3xl text-balance font-notebook text-3xl font-bold leading-tight sm:text-4xl"
            >
                A healthy plant has water and carbon dioxide but is kept in total darkness.
                What changes?
            </h1>
            <p className="mt-4 max-w-2xl text-pretty leading-7 text-graphite-soft">
                Use your rule on a situation we did not use to build it.
            </p>

            <fieldset className="mt-8">
                <legend className="text-sm font-semibold">Choose an outcome</legend>
                <div className="mt-3 grid gap-2">
                    {options.map((option) => (
                        <OptionButton
                            key={option}
                            selected={answers.application === option}
                            onClick={() => updateAnswers({ application: option })}
                        >
                            {option}
                        </OptionButton>
                    ))}
                </div>
            </fieldset>

            <div className="mt-6">
                <FieldLabel htmlFor="application-reason">
                    Explain the mechanism, not only the outcome
                </FieldLabel>
                <NotebookTextarea
                    id="application-reason"
                    value={answers.applicationReason}
                    onChange={(applicationReason) => updateAnswers({ applicationReason })}
                    placeholder="This happens because…"
                />
            </div>
        </>
    );
}

function ReflectionMove({
    answers,
    updateAnswers,
}: {
    answers: LessonAnswers;
    updateAnswers: (update: Partial<LessonAnswers>) => void;
}) {
    const originalPrediction =
        answers.prediction === "Something else"
            ? answers.predictionOther
            : answers.prediction.toLowerCase();

    return (
        <>
            <p className="text-xs font-bold uppercase text-graphite-muted">Reflect</p>
            <h1
                id="move-title"
                className="mt-3 max-w-3xl text-balance font-notebook text-3xl font-bold leading-tight sm:text-4xl"
            >
                What changed between your first idea and your explanation now?
            </h1>

            <article className="mt-7 rounded-lg border border-rule bg-paper p-5">
                <p className="text-xs font-bold uppercase text-graphite-muted">
                    Your first prediction
                </p>
                <p className="mt-2 font-notebook text-xl leading-8">
                    “Most of the plant&apos;s new material comes from {originalPrediction}.”
                </p>
            </article>

            <div className="mt-6">
                <FieldLabel htmlFor="reflection">What do you think now?</FieldLabel>
                <NotebookTextarea
                    id="reflection"
                    value={answers.reflection}
                    onChange={(reflection) => updateAnswers({ reflection })}
                    placeholder="I now think that…"
                    rows={4}
                />
            </div>

            <div className="mt-6">
                <FieldLabel htmlFor="reflection-evidence">
                    Which evidence changed or strengthened your thinking?
                </FieldLabel>
                <NotebookTextarea
                    id="reflection-evidence"
                    value={answers.reflectionEvidence}
                    onChange={(reflectionEvidence) =>
                        updateAnswers({ reflectionEvidence })
                    }
                    placeholder="The evidence that mattered was…"
                />
            </div>
        </>
    );
}
