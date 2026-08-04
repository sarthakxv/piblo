const SUBSCRIPT_DIGITS = "₀₁₂₃₄₅₆₇₈₉";
const SUPERSCRIPT_DIGITS = "⁰¹²³⁴⁵⁶⁷⁸⁹";

const CHEM_TOKEN = /(?:[A-Z][a-z]?\d*)+/;
const EQUATION_ARROW = /(?:→|->|⇒|⟶)/;
const EQUATION_EQUALS = /(?<![<>!=])=(?!=)/;

function toSubscripts(digits: string): string {
    return [...digits].map((d) => SUBSCRIPT_DIGITS[Number(d)] ?? d).join("");
}

function toSuperscripts(digits: string): string {
    return [...digits].map((d) => SUPERSCRIPT_DIGITS[Number(d)] ?? d).join("");
}

function formatCharge(sign: string): string {
    return sign === "+" ? "⁺" : "⁻";
}

/** Rewrite element-attached digits to Unicode subscripts; ^charges to superscripts. */
export function formatChemNotation(text: string): string {
    // Element symbol + trailing digits → subscripts (H2O, C6H12O6, Fe2)
    let result = text.replace(/([A-Z][a-z]?)(\d+)/g, (_match, symbol: string, digits: string) => {
        return `${symbol}${toSubscripts(digits)}`;
    });

    // Explicit caret charges: Fe^3+, SO4^2-, Cl^-
    result = result.replace(
        /\^(\d*)([+-])/g,
        (_match, digits: string, sign: string) => {
            return `${toSuperscripts(digits)}${formatCharge(sign)}`;
        },
    );

    return result;
}

export function isEquationLine(line: string): boolean {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith(">") || trimmed.startsWith("- ")) {
        return false;
    }

    const hasArrow = EQUATION_ARROW.test(trimmed);
    const hasEquals = EQUATION_EQUALS.test(trimmed);
    if (!hasArrow && !hasEquals) return false;

    const chemMatches = trimmed.match(new RegExp(CHEM_TOKEN.source, "g")) ?? [];
    return chemMatches.length >= 2;
}

/** Wrap bare equation lines in fenced code blocks; leave existing fences alone. */
export function promoteEquationLines(markdown: string): string {
    const lines = markdown.split("\n");
    const out: string[] = [];
    let inFence = false;

    for (const line of lines) {
        if (/^```/.test(line.trimStart())) {
            inFence = !inFence;
            out.push(line);
            continue;
        }

        if (!inFence && isEquationLine(line)) {
            out.push("```", line.trim(), "```");
            continue;
        }

        out.push(line);
    }

    return out.join("\n");
}
