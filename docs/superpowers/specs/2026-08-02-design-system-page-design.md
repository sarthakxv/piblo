# Piblo Design System — Single-Page Reference

**Date:** 2026-08-02
**Status:** Approved
**Deliverable:** `docs/design-system.html`

## Purpose

Put the complete Piblo design system on one page: a full-reference style guide
that documents the system's foundations, components, patterns, and rules. The
page dogfoods the system it describes — it is rendered in Piblo's own tokens,
typography, and component styles, so it serves as both documentation and proof.

## Sources of truth

1. `app/globals.css` — design tokens (colors, fonts, focus, selection,
   reduced motion). Values are copied verbatim into CSS custom properties.
2. `docs/interaction-design-specification.md` — principles, surfaces, learning
   moves, scaffold ladder, motion, turn lifecycle, tutor voice, accessibility,
   defaults-to-avoid.
3. `app/piblo-prototype.tsx` — component styling patterns (Tailwind classes),
   hand-ported to plain CSS for the live examples.

## Constraints

- Single self-contained HTML file; no build step.
- No JavaScript and no external requests (system font stacks only, matching
  the existing tokens). The page works offline.
- Hand-written CSS using custom properties mirroring the `@theme` tokens.
- Honors `prefers-reduced-motion`; real `:focus-visible` ink outlines.

## Page structure

Max-width content column with a sticky sidebar anchor nav on desktop,
collapsing to a simple list on mobile. Sections, in order:

1. **Header** — name, one-line identity ("guided field notebook × concept
   lab"), links to the three source files.
2. **Principles** — the six experience qualities and the domain territory
   (spec §2, §4).
3. **Color** — swatch grid of all 16 tokens with name, hex, CSS variable, and
   semantic role; the "color is never the sole indicator" rule.
4. **Typography** — both font stacks rendered live; eyebrow, heading, body,
   notebook-serif, and caption specimens.
5. **Components** — live rendered examples: primary and secondary buttons,
   choice option (default / selected / disabled), confidence chips, text input
   with error state, amber hint callout, ink "Ask Piblo" panel, coral error
   callout, status banner, Thinking Trail dots (complete / current /
   upcoming), level badge, lesson card.
6. **Surfaces & layout** — the four surfaces with a desktop layout diagram;
   Thinking Trail artifact states (Current, Captured, Revised, Demonstrated,
   Review later).
7. **Learning moves** — the six move types as cards: purpose and controls.
8. **Scaffold ladder** — L0–L3 interaction treatments.
9. **Motion** — the four timing bands and the behavior rules.
10. **Turn lifecycle** — the nine visible states and their learner-facing
    copy.
11. **Tutor voice** — do / don't examples.
12. **Accessibility** — the spec's checklist with a live focus-ring demo.
13. **Defaults to avoid** — the generic-default → Piblo-replacement table.

## Error handling

Not applicable beyond robustness of static markup: no external dependencies,
so the only failure mode is a missing local file. Content degrades gracefully
without CSS (semantic HTML remains readable).

## Testing / verification

- Re-read the generated file to confirm structure and completeness against
  the section list above.
- Visual check in a browser.
- No unit tests (pure HTML/CSS; repo test suite covers TypeScript only).
