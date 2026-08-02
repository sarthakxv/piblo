const HINTS: Record<number, string[]> = {
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

export function HelpPanel({ phaseIndex, level }: { phaseIndex: number; level: number }) {
    if (level === 0) return null;

    const currentHints = HINTS[phaseIndex] ?? HINTS[2];
    const hint = currentHints[Math.min(level - 1, currentHints.length - 1)];

    return (
        <aside className="mt-5 rounded-lg border border-amber-ink/25 bg-amber-note px-4 py-4">
            <p className="text-xs font-bold uppercase text-amber-ink">
                {level >= 3 ? "Plain explanation" : level === 2 ? "Stronger hint" : "Hint"}
            </p>
            <p className="mt-2 text-pretty text-sm leading-6 text-graphite">{hint}</p>
        </aside>
    );
}
