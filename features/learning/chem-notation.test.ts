import test from "node:test";
import assert from "node:assert/strict";
import {
    formatChemNotation,
    isEquationLine,
    promoteEquationLines,
} from "./chem-notation.ts";

test("formatChemNotation subscripts digits after element symbols", () => {
    assert.equal(formatChemNotation("H2O"), "H₂O");
    assert.equal(formatChemNotation("CO2"), "CO₂");
    assert.equal(formatChemNotation("O2"), "O₂");
    assert.equal(formatChemNotation("C6H12O6"), "C₆H₁₂O₆");
});

test("formatChemNotation leaves ordinary prose numbers alone", () => {
    assert.equal(formatChemNotation("around 70%"), "around 70%");
    assert.equal(formatChemNotation("grades 6–10"), "grades 6–10");
    assert.equal(formatChemNotation("one molecule"), "one molecule");
});

test("formatChemNotation handles charges as superscripts", () => {
    assert.equal(formatChemNotation("Fe^3+"), "Fe³⁺");
    assert.equal(formatChemNotation("SO4^2-"), "SO₄²⁻");
});

test("formatChemNotation formats a full equation line", () => {
    assert.equal(
        formatChemNotation("H2O + CO2 → C6H12O6 + O2"),
        "H₂O + CO₂ → C₆H₁₂O₆ + O₂",
    );
});

test("isEquationLine detects chemical equations", () => {
    assert.equal(isEquationLine("H2O + CO2 → C6H12O6 + O2"), true);
    assert.equal(isEquationLine("H2O + CO2 -> C6H12O6 + O2"), true);
    assert.equal(isEquationLine("6CO2 + 6H2O = C6H12O6 + 6O2"), true);
});

test("isEquationLine rejects ordinary prose", () => {
    assert.equal(isEquationLine("Exactly right – the leftover oxygen gets released."), false);
    assert.equal(isEquationLine("So now your equation is looking something like this:"), false);
    assert.equal(isEquationLine("If you only use one of each on the left side?"), false);
});

test("promoteEquationLines wraps bare equation lines in fences", () => {
    const input = [
        "So now your equation is looking something like this:",
        "",
        "H2O + CO2 → C6H12O6 + O2",
        "",
        "Here's the thing though.",
    ].join("\n");

    const expected = [
        "So now your equation is looking something like this:",
        "",
        "```",
        "H2O + CO2 → C6H12O6 + O2",
        "```",
        "",
        "Here's the thing though.",
    ].join("\n");

    assert.equal(promoteEquationLines(input), expected);
});

test("promoteEquationLines leaves existing fenced blocks alone", () => {
    const input = [
        "```",
        "H2O + CO2 → C6H12O6 + O2",
        "```",
    ].join("\n");

    assert.equal(promoteEquationLines(input), input);
});
