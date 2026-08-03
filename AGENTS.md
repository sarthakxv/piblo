# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js application for a Socratic tutor and learner-model analyzer.

- `app/` contains App Router pages, layouts, and server route handlers.
- `components/ui/` contains shadcn primitives; product components live under `components/learning-moves/` and `components/lesson-shell/`.
- `features/` contains complete learner-facing capabilities and local persistence adapters.
- `domain/tutor/` contains the core loop, prompt construction, and unit tests.
- `domain/learner-model/` contains learner-model and analyzer contracts.
- `content/` contains topic and concept definitions.
- `server/` isolates model-provider configuration and server-only orchestration from tutoring logic.
- `src/harness.ts` and `src/demo.ts` are interactive and scripted CLI entry points.
- `docs/` holds design, planning, and research notes. Keep implementation decisions close to the relevant document.

Place new lesson content under `content/`; keep provider-specific code inside `server/llm/` so the tutor loop remains vendor-neutral. Add reusable primitives through shadcn rather than hand-rolling equivalents.

## Build, Test, and Development Commands

Use Node.js 22 or newer and run `npm install` before development.

```bash
npm test          # run Node's built-in test suite
npm run typecheck # run TypeScript checks without emitting files
npm run build     # create the production Next.js build
npm run dev       # start the application at http://localhost:3000
npm run demo      # run the scripted tutoring demonstration
npm run chat      # start the interactive CLI tutor
```

The demo and chat commands load `.env` (and a parent environment file when present). Set `OPENCODE_API_KEY` before making live model calls; never commit credentials.

## Coding Style & Naming Conventions

Write strict TypeScript using ES modules and explicit `.ts` import extensions. Follow the existing four-space indentation, semicolons, double quotes, and trailing commas in multi-line structures. Use `camelCase` for functions and variables, `PascalCase` for types, and `UPPER_SNAKE_CASE` for constants (for example, `MASTERY_THRESHOLD`). Prefer small pure functions for learner-state transitions and keep LLM prompts separate from orchestration.

## Testing Guidelines

Tests use `node:test` with `node:assert/strict`. Add colocated tests named `*.test.ts`, such as `domain/tutor/loop.test.ts`. Cover normal transitions and boundary cases: mastery clamping, scaffold-rung changes, focus selection, and lesson completion. Run `npm test`, `npm run typecheck`, and `npm run build` before submitting changes. There is no configured coverage threshold; preserve and extend behavioral coverage for changed logic.

## Commit & Pull Request Guidelines

Recent history uses concise imperative commits, often Conventional Commit-style: `feat(tutor): ...`, `fix(tutor): ...`, and `refactor(llm): ...`. Use a scoped prefix when it clarifies the affected module. Keep each commit focused.

Never stage or commit changes under `docs/`; keep those changes local.

Pull requests should explain the learner-facing behavior change, identify affected modules, link related issues or design notes, and include test results. Provide terminal output or screenshots only when a CLI or UI behavior changes.
