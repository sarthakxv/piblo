# Design spec — Scaffold Ladder (bugs.md fix 2)

Date: 2026-07-08
Status: approved design, not yet implemented
Scope owner: tutor loop (`src/tutor/`), analyzer contract (`src/tutor/types.ts`)

## Problem

The tutor is pure Socratic questioning with a hard rule *"never give a direct
answer."* In a real session with a child (see `todo.md`, and the transcripts in
`bugs.md`) this produced two failures:

1. **Interrogation without teaching** — "it's still leaving me clueless… it
   should give hints that drive my thinking, so it also teaches in the process."
2. **The never-answer / stuck loop** — a stuck learner on a misconception
   (`soil_food`) never got unstuck and got frustrated, because the hard rule
   forbade ever resolving it.

## Goal

Replace endless questioning with a **scaffold ladder** that escalates support
when the learner is stuck and **terminates in giving the answer**, then re-checks
that answer later so "being told" is not mistaken for "knowing."

This spec covers **only `bugs.md` fix 2**. Deferred by the author's own fix-4
sequencing: full ACRE analyzer (fix 1), thinking dimensions (fix 3), finetuning
(fix 4), and the atomic-objective restructure.

## Design decisions (and deviations from the bugs.md draft)

Resolved with a consult to the Fable 5 model. Three deviations from the draft in
`bugs.md`, each justified:

1. **4 levels, not 6 rungs.** The draft's rungs 2–4 (worked example / analogy /
   heavy hint) are tutor *tactics*, not machine states; encoding them as states
   forces 5 stalls before the answer. Collapse to 4 and let the LLM pick the L2
   tactic → answer on the 3rd consecutive stall.
2. **Decay, not reset, on "progressing."** Reset-to-0 is a sawtooth: one lucky
   step restarts the whole climb, re-creating the loop. Decay by 1 keeps memory
   that the learner recently struggled.
3. **Single sticky episode, not a per-objective rung Record.** There is one
   conversation = one live episode. A `Record<id, rung>` just accumulates stale
   rungs. Returning to an objective later correctly starts a fresh episode.

## The ladder

```
L0  Question            pure Socratic probe
L1  Hint + re-question  a nudge, then ask again
L2  Heavy support       tutor PICKS the tactic: worked example, analogy, or a
                        hint that does most of the work (LLM chooses, informed
                        by the active misconception)
L3  Answer              state it plainly in ONE sentence, then ask ONE
                        reflection question. Overrides "never give a direct
                        answer" — the ladder terminates in the answer by design.
```

## State — additions to `LearnerModel`

```ts
focusObjective:   string | null   // sticky; the objective being worked now
scaffoldRung:     0 | 1 | 2 | 3   // support level for focusObjective
consecutiveStuck: number          // stalls in the current episode
answerRevealed:   string[]        // objectives told; pending a retrieval re-check
```

Unchanged: `masteryByObjective`, `activeMisconceptions`, `confidence`,
`turnCount`. `emptyLearnerModel()` initializes `focusObjective: null`,
`scaffoldRung: 0`, `consecutiveStuck: 0`, `answerRevealed: []`.

### Constants

```
RUNG_ANSWER        = 3
MASTERY_THRESHOLD  = 0.7    // objective considered mastered → advance focus
CONFIDENCE_FLOOR   = 0.25   // frustration accelerator
```

## Analyzer contract — additions (this round; NOT full ACRE)

`AnalyzerSchema` (Zod) gains three fields; the rest is unchanged from today:

```ts
assessable:        boolean            // (existing) non-answers no-op the model
addressedObjective: string            // NEW: objective id the student's message
                                      //   engaged; "" if meta / off-topic / none
scaffoldSignal:    "stuck" | "progressing" | "solved"   // NEW: drives the ladder
requestedAnswer:   boolean            // NEW: did they explicitly ask for the answer?
masteryDeltas:     Record<string, number>   // (existing) small ±0.15
detectedMisconceptions: string[]      // (existing)
resolvedMisconceptions: string[]      // (existing)
confidence:        number             // (existing) student epistemic stance 0..1
reasoning:         string             // (existing) one sentence, English
```

Analyzer prompt gains (from bugs.md drop-in deltas):
- Judge `scaffoldSignal` **relative to `focusObjective`** (passed into the prompt).
- `addressedObjective`: name the objective the message actually engaged.
- **Do NOT credit reasoning/evidence the tutor supplied in the previous turn** —
  only score what the student originated. (Requires the prior tutor turn, which
  the analyzer already receives in history.)
- **Misconceptions are expensive to add**: only tag when the message positively
  evidences the specific misconception, not merely a wrong guess. Prefer
  resolving over persisting.

## `applyAnalysis` — transition algorithm

Two signals stay **orthogonal**: mastery deltas touch `masteryByObjective` only;
`scaffoldSignal` touches the rung only. Precedence on contradiction is defined
below; never derive one from the other.

```
applyAnalysis(model, result):
  turn = model.turnCount + 1

  # 1. Non-answer gate (existing): meta/off-topic → no movement.
  if not result.assessable:
      return { ...model, turnCount: turn }

  # 2. Mastery + misconceptions + confidence (existing, independent of ladder).
  mastery = clampApply(model.masteryByObjective, result.masteryDeltas)
  misconceptions = (model.active ∪ detected) \ resolved
  confidence = clamp(result.confidence)

  rung   = model.scaffoldRung
  stuck  = model.consecutiveStuck
  focus  = model.focusObjective
  revealed = model.answerRevealed

  # 3. Finalize a just-delivered answer.
  #    If the PREVIOUS rung was RUNG_ANSWER, the tutor answered last turn.
  #    Record it, do NOT bump mastery for it, advance focus, fresh episode.
  if rung == RUNG_ANSWER:
      revealed = revealed ∪ { focus }
      focus = pickNextFocus(mastery, concept, revealed)   # advance past it
      rung = 0; stuck = 0
      # This turn is the learner answering the reflection question → treat as a
      # fresh L0 episode for the new focus; skip laddering below.
  else:
      # 4. Ladder update — only when the exchange was about the focus objective.
      offTopic = result.addressedObjective != "" and result.addressedObjective != focus
      if not offTopic:
          if result.requestedAnswer and stuck >= 1:
              rung = RUNG_ANSWER                     # explicit ask, post-support
          elif result.scaffoldSignal == "stuck":
              stuck += 1
              rung = min(rung + 1, RUNG_ANSWER)
              if confidence < CONFIDENCE_FLOOR and stuck >= 2:
                  rung = RUNG_ANSWER                 # frustration accelerator
          elif result.scaffoldSignal == "progressing":
              rung = max(rung - 1, 0); stuck = 0     # decay, not reset
          elif result.scaffoldSignal == "solved":
              focus = pickNextFocus(mastery, concept, revealed)
              rung = 0; stuck = 0
      # offTopic → neutral: no rung/stuck change, focus unchanged.

  # 5. Focus (re)selection at episode boundaries.
  if focus == null or mastery[focus] >= MASTERY_THRESHOLD:
      focus = pickNextFocus(mastery, concept, revealed)
      rung = 0; stuck = 0

  return { masteryByObjective: mastery, activeMisconceptions: misconceptions,
           confidence, turnCount: turn,
           focusObjective: focus, scaffoldRung: rung,
           consecutiveStuck: stuck, answerRevealed: revealed }
```

Signature change: `applyAnalysis` gains a `concept` (objective list) parameter so
it can select focus — today it is `applyAnalysis(model, result)`, becoming
`applyAnalysis(model, result, concept)`. Call sites in `demo.ts`/`harness.ts`
update accordingly.

`pickNextFocus(mastery, concept, revealed)`: the lowest-mastery objective with
`mastery < MASTERY_THRESHOLD`, preferring one NOT in `revealed` (so a freshly
told objective isn't immediately re-probed; it comes back only once other
objectives are worked — a lightweight retrieval re-check). Returns `null` when
all objectives are at/above threshold (lesson complete).

Precedence note: analyzer says "solved" but mastery still low → "solved" ends the
*episode* (advance focus), mastery keeps the objective eligible for re-selection.
Coherent, not a conflict. **Forbidden coupling:** never set mastery high because
an answer was revealed — the retrieval re-check earns the bump.

## Tutor prompt — additions

`buildTutorSystem(concept, model)` reads `model.focusObjective` and
`model.scaffoldRung` and injects (from bugs.md drop-in deltas, adapted to 4
levels):

```
LADDER STATE: You are at scaffold level {scaffoldRung} for the objective
"{focusObjective}". Make only that level's move:
  L0 ask a Socratic question · L1 give a hint, then re-ask ·
  L2 heavy support — pick ONE: a worked example, an analogy, or a hint that does
     most of the work (choose based on the active misconception), then re-ask ·
  L3 state the answer plainly in ONE sentence, then ask ONE reflection question.
At L3 this OVERRIDES "never give a direct answer" — the ladder ends in the answer
by design. If focusObjective is null, open the lesson (see LESSON ARC) — no rung.

LESSON ARC: Predict → Observe → Explain → Generalize → Apply. Open with a
prediction the learner commits to before reasoning ("before we work it out — what
do you think happens to …?"). The Explain phase is where the ladder runs.

FACTS vs IDEAS: Supply names, labels, and vocabulary directly (e.g. "carbon
dioxide", "glucose"). Only withhold the underlying IDEA for the learner to reason
toward. Never make a learner derive a proper noun.

LANGUAGE: Respond only in {targetLanguage} (default English). Never switch scripts.

MISCONCEPTION CLOSE: If a misconception is active, surface it — pose the
observation that puts it in conflict with what the learner now believes. Do not
route around it.
```

The existing HARD RULE "Never give a direct, complete answer" is amended to carry
the explicit L3 exception, so it no longer contradicts the ladder.

`{targetLanguage}` is a new parameter on the model/concept (default "English");
for the MVP it is constant, but plumbed so it isn't hardcoded in the prompt.

## Opening turn (Predict)

At session start `focusObjective` is `null`. The tutor's first turn is a Predict
move (per LESSON ARC) rather than a generic "what do you know." The first student
answer runs the analyzer, which sets `focusObjective` via `pickNextFocus`.

## Testing

Deterministic unit tests (`node:test`) for `applyAnalysis` — the ladder is pure
and fully testable without an LLM:

- `stuck` increments rung and `consecutiveStuck`; caps at 3.
- `progressing` decays rung by 1 (not to 0) and zeroes `consecutiveStuck`.
- `solved` advances focus and resets the episode.
- Accelerator: `requestedAnswer` with `consecutiveStuck >= 1` jumps to L3; with
  `consecutiveStuck == 0` does NOT (no instant cave on first "I don't know").
- Frustration: `confidence < 0.25` and `consecutiveStuck >= 2` → L3.
- Off-topic: `addressedObjective != focus` → neutral (no rung/stuck change).
- Terminal: prior rung 3 → objective added to `answerRevealed`, focus advances,
  episode resets, mastery NOT bumped for the reveal.
- `pickNextFocus` skips `answerRevealed` objectives until others are worked;
  returns null when all mastered.
- Retained: `assessable=false` no-op; mastery-delta clamping.

Live verification (`npm run chat`): a session that stalls repeatedly on one
objective escalates L0→L1→L2→L3 and gets the answer within 3 stalls; proper nouns
are supplied, not quizzed; output stays in English.

## Files touched

- `src/tutor/types.ts` — `LearnerModel` fields + `AnalyzerSchema` fields + consts.
- `src/tutor/loop.ts` — `applyAnalysis` transitions, `pickNextFocus`.
- `src/tutor/prompts.ts` — tutor ladder/arc/facts/language/misconception blocks;
  analyzer `scaffoldSignal`/`addressedObjective`/attribution rules.
- `src/tutor/loop.test.ts` — ladder transition tests.
- `src/demo.ts` / `src/harness.ts` — Predict opening; `targetLanguage` plumbing.
