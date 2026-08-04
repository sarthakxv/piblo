# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js application for a Socratic tutor and learner-model analyzer.

- `app/` contains App Router pages, layouts, and server route handlers (including `/auth/callback`).
- `components/ui/` contains shadcn primitives; product components live under `components/learning-moves/`.
- `features/` contains learner-facing capabilities (`auth`, `onboarding`, `learner-profile`, `library`, `learning`, `session`).
- `lib/supabase/` contains browser, server, and session-refresh Supabase clients.
- `supabase/` holds SQL migrations and local CLI config (`config.toml`).
- `domain/tutor/` contains the core loop, prompt construction, and unit tests.
- `domain/learner-model/` contains learner-model and analyzer contracts.
- `content/` contains topic and concept definitions.
- `server/` isolates model-provider configuration and server-only orchestration from tutoring logic.
- `src/harness.ts` and `src/demo.ts` are interactive and scripted CLI entry points.
- `docs/` holds design, planning, and research notes. Keep implementation decisions close to the relevant document.

Place new lesson content under `content/`; keep provider-specific code inside `server/llm/` so the tutor loop remains vendor-neutral. Add reusable primitives through shadcn rather than hand-rolling equivalents. Keep Supabase access behind `lib/supabase/` and `features/*/profile-queries` rather than scattering client creation.

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

Copy `.env.example` to `.env`. Set `OPENCODE_API_KEY` before making live model calls. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for auth and learner profiles. For the local Supabase CLI stack (`supabase start`), also set `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET` (referenced by `supabase/config.toml`). Never commit credentials.

## Coding Style & Naming Conventions

Write strict TypeScript using ES modules and explicit `.ts` import extensions. Follow the existing four-space indentation, semicolons, double quotes, and trailing commas in multi-line structures. Use `camelCase` for functions and variables, `PascalCase` for types, and `UPPER_SNAKE_CASE` for constants (for example, `MASTERY_THRESHOLD`). Prefer small pure functions for learner-state transitions and keep LLM prompts separate from orchestration.

## Testing Guidelines

Tests use `node:test` with `node:assert/strict`. Add colocated tests named `*.test.ts`, such as `domain/tutor/loop.test.ts`. Cover normal transitions and boundary cases: mastery clamping, scaffold-rung changes, focus selection, and lesson completion. Run `npm test`, `npm run typecheck`, and `npm run build` before submitting changes. There is no configured coverage threshold; preserve and extend behavioral coverage for changed logic.

## Commit & Pull Request Guidelines

Recent history uses concise imperative commits, often Conventional Commit-style: `feat(tutor): ...`, `fix(tutor): ...`, and `refactor(llm): ...`. Use a scoped prefix when it clarifies the affected module. Keep each commit focused.

Never stage or commit changes under `docs/`; keep those changes local.

Pull requests should explain the learner-facing behavior change, identify affected modules, link related issues or design notes, and include test results. Provide terminal output or screenshots only when a CLI or UI behavior changes.

## Cursor Cloud specific instructions

Auth and learner profiles use Supabase (Google OAuth + `public.profiles`). Topic sessions still persist in the browser via localStorage. The app does not require Docker for day-to-day Next.js work if you point at a hosted Supabase project; local `supabase start` is optional and does need Docker plus the Google client secret env var.

- Standard commands live in `package.json` and the "Build, Test, and Development Commands" section above. Use `npm run dev` (http://localhost:3000) for development; `npm test`, `npm run typecheck`, and `npm run build` for verification. There is no lint script — `npm run typecheck` is the closest static check.
- Web auth, onboarding, library, profile, and `/learn/...` require `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Apply `supabase/migrations/` on the project (hosted SQL editor or `supabase db reset` locally).
- The learning workspace uses deterministic lesson moves and needs no API key. Only the live model pipeline — `npm run demo`, `npm run chat`, and the `/api/tutor` and `/api/learning/start` routes — requires `OPENCODE_API_KEY` (OpenAI-compatible gateway). Without it, those specific paths fail, but the rest of the signed-in app works.
- Session cookies are refreshed by `proxy.ts` (Next.js 16 proxy convention) via `lib/supabase/middleware.ts`. Signed-in users without a profile row are sent to `/onboarding`; users with a profile reach `/library`. Home `/` shows Google sign-in and redirects authenticated users toward the library.
