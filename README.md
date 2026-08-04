# Piblo - Adaptive learning

Piblo is an adaptive learning app built around a Socratic tutor and a learner-model analyzer.

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

The tutoring stack collapses into **two LLM calls per turn plus one piece of state** (the Learner Model). That is the core bet of the product.

## Run it

- Needs Node ≥ 22 (native TypeScript type-stripping)
- Uses the **Vercel AI SDK**; run `npm install` once.
- Set `OPENCODE_API_KEY` in `.env`.

```bash
npm install
npm run dev       # open the Next.js app at http://localhost:3000
npm run demo      # agent chat simulation
npm run chat      # talk to the tutor yourself; /state shows the learner model
npm run typecheck
npm test
npm run build
```

The learning workspace currently uses adpative levels based on a mini-quiz to know student's current knowldege; by this flow can be reviewed without consuming AI credits. Learner profiles and topic sessions is trackable under user profile.

## What this validates

- The tutor begins Socratically, then increases support through hints and a plain
  explanation when the learner remains stuck.
- Misconceptions are **detected and cleared** as structured state, not vibes.
- The **learner model moves** turn to turn — the substrate for the mastery dashboard
  and the recall scheduler.
- Provider choice is **one file** (`server/llm/index.ts`) - the tutor/analyzer never
  see a vendor.
