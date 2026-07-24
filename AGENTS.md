# Repository Guidelines

## Project Structure & Module Organization

This is a TypeScript prototype for a Socratic tutor and learner-model analyzer.

- `src/tutor/` contains the core loop, prompt construction, types, and unit tests.
- `src/concept/photosynthesis.ts` defines the current lesson's objectives and misconceptions.
- `src/llm/` isolates model-provider configuration from tutoring logic.
- `src/harness.ts` and `src/demo.ts` are interactive and scripted CLI entry points.
- `docs/` holds design, planning, and research notes. Keep implementation decisions close to the relevant document.

Place new lesson content under `src/concept/`; keep provider-specific code inside `src/llm/` so the tutor loop remains vendor-neutral.

## Build, Test, and Development Commands

Use Node.js 22 or newer and run `npm install` before development.

```bash
npm test          # run Node's built-in test suite
npm run typecheck # run TypeScript checks without emitting files
npm run demo      # run the scripted tutoring demonstration
npm run chat      # start the interactive CLI tutor
```

The demo and chat commands load `.env` (and a parent environment file when present). Set `OPENCODE_API_KEY` before making live model calls; never commit credentials.

## Coding Style & Naming Conventions

Write strict TypeScript using ES modules and explicit `.ts` import extensions. Follow the existing four-space indentation, semicolons, double quotes, and trailing commas in multi-line structures. Use `camelCase` for functions and variables, `PascalCase` for types, and `UPPER_SNAKE_CASE` for constants (for example, `MASTERY_THRESHOLD`). Prefer small pure functions for learner-state transitions and keep LLM prompts separate from orchestration.

## Testing Guidelines

Tests use `node:test` with `node:assert/strict`. Add colocated tests named `*.test.ts`, such as `src/tutor/loop.test.ts`. Cover normal transitions and boundary cases: mastery clamping, scaffold-rung changes, focus selection, and lesson completion. Run `npm test` and `npm run typecheck` before submitting changes. There is no configured coverage threshold; preserve and extend behavioral coverage for changed logic.

## Commit & Pull Request Guidelines

Recent history uses concise imperative commits, often Conventional Commit-style: `feat(tutor): ...`, `fix(tutor): ...`, and `refactor(llm): ...`. Use a scoped prefix when it clarifies the affected module. Keep each commit focused.

Pull requests should explain the learner-facing behavior change, identify affected modules, link related issues or design notes, and include test results. Provide terminal output or screenshots only when a CLI or UI behavior changes.
