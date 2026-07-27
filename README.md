# Piblo Prototype — Socratic tutor + analyzer loop

> **Canonical product name:** Piblo. Use this name in all learner-facing copy,
> documentation, and future product work.

Proves the riskiest, highest-value part of Piblo before any UI is built: an AI loop
that teaches **photosynthesis** by *never giving the answer*, while measuring real
mastery under the hood.

## The idea in one diagram

```
student message
      │
      ├─▶ ANALYZER call  ──▶ structured JSON ──▶ update Learner Model
      │   (assessment engine,                    (mastery per objective,
      │    reads last answer)                      misconceptions, confidence)
      │                                                    │
      └─▶ TUTOR call  ◀───────────── reads model ──────────┘
          (Socratic move, never
           a direct answer)  ──▶ next question to student
```

The nine "engines" in `docs/03_SYSTEM_ARCHITECTURE.md` collapse into **two LLM calls
per turn plus one piece of state** (the Learner Model). That is the core bet of the
product, and it runs here today.

## Run it

Needs Node ≥ 22 (native TypeScript type-stripping). Uses the **Vercel AI SDK**;
run `npm install` once. Set `OPENCODE_API_KEY` in `prototype/.env` (a cheap
OpenAI-compatible gateway — subscribe at https://opencode.ai/docs/go/).

```bash
cd prototype
npm install
npm run dev     # open the clickable lo-fi learning workspace
npm run demo    # scripted student: starts wrong ("plants eat soil"), learns
npm run chat    # talk to the tutor yourself; /state shows the learner model
npx tsc --noEmit   # typecheck
```

The browser prototype runs at `http://localhost:5173`. It uses deterministic
mock lesson state rather than live model calls, so the complete interaction flow
can be reviewed without consuming AI credits. The implementation follows the
[Piblo Interaction Design Specification](./docs/interaction-design-specification.md).

The tutor defaults to `glm-5.2` (needs to hold the Socratic line under
an instruction-heavy prompt); the analyzer defaults to `deepseek-v4-flash`
(cheap structured-JSON scoring is enough there). Override either with
`OPENCODE_TUTOR_MODEL` / `OPENCODE_ANALYZER_MODEL` (see the gateway's
`/v1/models`). Swapping to Anthropic/Google/OpenAI later is a one-file edit in
`src/llm/index.ts`.

## Layout

| File | Role |
|------|------|
| `src/llm/` | provider registry: `getTutorModel()` / `getAnalyzerModel()` return Vercel AI SDK models |
| `src/concept/photosynthesis.ts` | concept graph: objectives + misconceptions |
| `src/tutor/prompts.ts` | Socratic tutor + analyzer system prompts |
| `src/tutor/loop.ts` | orchestration: `tutorTurn`, `analyzeTurn`, `applyAnalysis` |
| `src/tutor/types.ts` | `LearnerModel` shape |
| `src/harness.ts` / `src/demo.ts` | CLI drivers retained as engine test harnesses |
| `app/` | React lo-fi adaptive learning workspace |

## What this validates

- The tutor **withholds answers** and drives with questions (design principle #1).
- Misconceptions are **detected and cleared** as structured state, not vibes.
- The **learner model moves** turn to turn — the substrate for the mastery dashboard
  and the recall scheduler.
- Provider choice is **one file** (`src/llm/index.ts`) — the tutor/analyzer never
  see a vendor. Validated live on OpenCode go / DeepSeek v4 (pro for the tutor,
  flash for the analyzer).

## Next step toward the product

Use the confirmed interaction prototype as the client foundation → expose the
tutor loop through a server API → replace deterministic moves with validated
structured tutor moves → persist the learner model → add recall and review
flows. See [future-scope-todo.md](./docs/future-scope-todo.md) for the full
roadmap.
