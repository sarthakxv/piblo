# Piblo — Adaptive learning application

> **Canonical product name:** Piblo. Use this name in all learner-facing copy,
> documentation, and future product work.

Piblo is a Next.js adaptive learning application built around a Socratic tutor and
a separate learner-model analyzer. The first lesson teaches **photosynthesis**
through predictions, evidence, explanations, generalization, application, and
reflection.

## The idea in one diagram

```
student message
      │
      ├─▶ ANALYZER call  ──▶ structured JSON ──▶ update Learner Model
      │   (assessment engine,                    (mastery per objective,
      │    reads last answer)                      misconceptions, confidence)
      │                                                    │
      └─▶ TUTOR call  ◀───────────── reads model ──────────┘
          (adaptive Socratic move,
           hint, or explanation) ──▶ next step for the learner
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
npm run dev     # open the Next.js app at http://localhost:3000
npm run demo    # scripted student: starts wrong ("plants eat soil"), learns
npm run chat    # talk to the tutor yourself; /state shows the learner model
npm run typecheck
npm test
```

The learning workspace currently uses deterministic lesson moves so its complete
interaction flow can be reviewed without consuming AI credits. Learner profiles
and lesson sessions are saved in the current browser. The server-only
`/api/tutor` route exposes the live analyzer → state update → tutor pipeline for
the next integration step. The implementation follows the
[Piblo Interaction Design Specification](./docs/interaction-design-specification.md).

The tutor defaults to `glm-5.2` (needs to hold the Socratic line under
an instruction-heavy prompt); the analyzer defaults to `deepseek-v4-flash`
(cheap structured-JSON scoring is enough there). Override either with
`OPENCODE_TUTOR_MODEL` / `OPENCODE_ANALYZER_MODEL` (see the gateway's
`/v1/models`). Swapping to Anthropic/Google/OpenAI later is a one-file edit in
`server/llm/index.ts`.

## Layout

| File | Role |
|------|------|
| `app/` | Next.js routes, layouts, loading/error states, and the tutor API |
| `components/ui/` | shadcn primitive components |
| `components/learning-moves/` | trusted activity renderers |
| `features/` | onboarding, library, lesson, session, and profile features |
| `domain/tutor/` | provider-neutral tutor orchestration and prompts |
| `domain/learner-model/` | learner-model and analyzer contracts |
| `content/` | topic catalog and concept definitions |
| `server/` | model-provider configuration, tutor service, environment, and logging |
| `src/harness.ts` / `src/demo.ts` | CLI drivers retained as engine test harnesses |

## What this validates

- The tutor begins Socratically, then increases support through hints and a plain
  explanation when the learner remains stuck.
- Misconceptions are **detected and cleared** as structured state, not vibes.
- The **learner model moves** turn to turn — the substrate for the mastery dashboard
  and the recall scheduler.
- Provider choice is **one file** (`server/llm/index.ts`) — the tutor/analyzer never
  see a vendor. Validated live on OpenCode go / DeepSeek v4 (pro for the tutor,
  flash for the analyzer).

## Next step toward the product

Connect the trusted activity renderers to validated structured tutor moves, then
add authenticated server persistence, learner evidence history, recall, and
review flows. See [future-scope-todo.md](./docs/future-scope-todo.md) for the
full roadmap.
