# Piblo Interaction Design Specification

**Status:** Proposed direction for the first web experience  
**Initial concept:** Photosynthesis  
**Primary audience:** Learners in grades 6–10  
**Related roadmap:** [Future Scope and Product Roadmap](./future-scope-todo.md)

## Application implementation

The confirmed interaction direction is implemented in the modular Next.js
application under [`app/`](../app), [`components/`](../components), and
[`features/`](../features).

Run it with:

```bash
npm run dev
```

The learning workspace uses deterministic lesson moves and covers:

- the complete Photosynthesis happy path;
- a soil-mass misconception path;
- progressive hints through the plain explanation;
- an Ask Piblo detour that preserves the activity;
- failed-turn recovery without losing the learner's response;
- saved-session resume;
- desktop and mobile layouts;
- a final before-and-after reflection.

Local learner profiles and lesson sessions are persisted in the browser. The
server-only tutor route exposes the live analyzer and tutor pipeline, but mapping
its output into validated production activity schemas remains Phase 1 work.

## 1. Purpose

This specification defines how Piblo should evolve from a chat-based tutor into an
AI-directed learning experience.

The AI remains conversational, but conversation is not the primary interface.
The learner works with predictions, evidence, diagrams, explanations, rules,
and application scenarios while Piblo guides the process like a teacher at their
side.

This document should be reviewed before Phase 1 implementation because it
affects:

- the client information architecture;
- the API response format;
- the representation of tutor history;
- the lesson and learner-state models;
- the set of UI components that must be built;
- analytics and evaluation events.

## 2. Product intent

### Who is the learner?

The primary learner is a 12–15-year-old who has opened Piblo because a school
concept is confusing, incomplete, or currently being studied. They may be
uncertain, impatient, worried about being wrong, or tempted to request the
answer immediately.

They should not need to understand AI, prompts, mastery models, or educational
terminology.

### What must the learner accomplish?

The learner must construct, test, revise, generalize, and apply an idea. Sending
messages is not the goal; producing evidence of changed understanding is.

### What should the experience feel like?

Piblo should feel like a guided field notebook crossed with a small concept lab:

- calm enough to think;
- active rather than lecture-driven;
- warm without appearing childish;
- structured without feeling like a test;
- responsive without being animated for entertainment;
- forgiving when the learner is wrong or stuck.

## 3. Design decision

Piblo will use an **adaptive learning workspace**.

The primary unit of interaction is a **learning move**, not a chat message. A
learning move contains:

1. a short prompt from Piblo;
2. an artifact, observation, or problem;
3. a response mechanism suited to the thinking task;
4. an assessable learner artifact;
5. optional scaffold support.

Free-form conversation remains available as an escape hatch for curiosity,
confusion, clarification, and unexpected input.

### Direction comparison

| Direction | Strength | Limitation | Decision |
|---|---|---|---|
| Enhanced chat | Fast and topic-flexible | Resembles a generic AI chatbot | Supporting surface only |
| Adaptive workbook | Structured thinking and assessable evidence | Requires typed activity components | Primary direction |
| Interactive concept lab | Memorable and conceptually powerful | Bespoke and expensive to scale | Add selectively |

## 4. Domain and design territory

### Domain concepts

The interface should draw from the world of:

- field notebooks;
- lab observations;
- hypotheses and predictions;
- evidence collection;
- diagrams and annotations;
- teacher margin notes;
- revision and crossed-out thinking;
- worked examples;
- concept maps;
- checkpoints and reflection.

### Color world

The visual system should be explored through materials that belong to that
world:

- soft paper or parchment;
- graphite;
- fountain-pen blue;
- highlighter amber;
- lab-glass aqua;
- restrained correction coral;
- muted moss for established understanding.

These are design-territory references, not final color tokens. Color must carry
meaning and must not be the only way state is communicated.

### Signature interaction: the Thinking Trail

The product's signature is a persistent trail of the learner's changing
thinking:

```text
Prediction → Evidence noticed → Explanation built → Rule formed → Applied
```

The trail contains the learner's actual artifacts and short evidence statements.
It does not display raw mastery percentages.

### Defaults to avoid

| Generic default | Piblo replacement |
|---|---|
| Vertical transcript of chat bubbles | Active learning canvas |
| One universal text composer | Response control chosen for the learning move |
| Progress bar or mastery percentage | Evidence-backed Thinking Trail |
| Animated typing dots | Named system state such as “Checking your explanation” |
| Dashboard cards around the chat | One focused learning task with optional supporting drawers |
| AI-generated arbitrary interface | Validated move type rendered by trusted components |

## 5. Experience architecture

### Primary surfaces

The first learning workspace contains four surfaces:

1. **Lesson header**
    - concept title;
    - plain-language phase label;
    - leave or pause control;
    - Thinking Trail control on narrow screens.
2. **Learning canvas**
    - the current prompt;
    - the active artifact or activity;
    - the context-specific response control;
    - scaffold support.
3. **Thinking Trail**
    - completed learning artifacts;
    - evidence of revision and understanding;
    - the learner's current place in the lesson arc.
4. **Ask Piblo**
    - free-form questions;
    - clarification;
    - recovery from an unsupported response;
    - a clear route back to the active activity.

### Desktop layout

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Photosynthesis       Making sense of the evidence       Pause       │
├───────────────────────────────────────────────┬─────────────────────┤
│                                               │ Thinking Trail      │
│ Tutor prompt                                  │                     │
│                                               │ ✓ Prediction        │
│ Active observation / diagram / scenario       │ ✓ Observation       │
│                                               │ ● Explanation       │
│ Context-specific response                     │ ○ Generalize        │
│                                               │ ○ Apply             │
│ Hint / I'm stuck / Ask Piblo                  │                     │
└───────────────────────────────────────────────┴─────────────────────┘
```

The learning canvas owns most of the width. The Thinking Trail is supportive,
not a competing dashboard.

### Mobile layout

- The lesson header remains compact and sticky.
- The active learning move occupies the page.
- The Thinking Trail becomes a drawer or sheet.
- Response controls remain near the bottom without covering content.
- Ask Piblo opens as a reversible sheet or inline expansion.
- No interaction may depend on hover, drag, or a wide viewport.

## 6. Lesson flow

The macro learning arc is:

```text
Predict → Observe → Explain → Generalize → Apply → Reflect
```

The scaffold ladder operates inside a difficult learning moment, primarily
during Explain. It does not replace the macro lesson arc.

### Flow requirements

- The learner commits to a prediction before receiving the explanation.
- Observations give the learner something concrete to reason from.
- Explain captures the learner's causal model.
- Generalize tests whether the learner can move from an instance to a rule.
- Apply tests transfer to a meaningfully different situation.
- Reflect returns to the learner's original prediction and makes change visible.
- A lesson may revisit a phase when evidence shows that understanding is not
  stable.
- Phase transitions must be stored as application state, not inferred only from
  prompt history.

## 7. MVP learning move library

The initial Photosynthesis experience should support six trusted renderers.

### 7.1 Prediction move

**Purpose:** Elicit an initial model and create commitment.

**Possible controls:**

- single or multiple choice;
- short explanation;
- confidence band: **Guessing**, **Somewhat sure**, or **Sure**.

**Requirements:**

- The learner must be able to provide an unlisted answer.
- Confidence is optional and uses bands rather than a precise slider.
- The prediction is saved unchanged for later reflection.
- The UI must not reveal correctness immediately unless the lesson design calls
  for it.

### 7.2 Evidence comparison move

**Purpose:** Help the learner notice a conflict, pattern, or relevant fact.

**Possible controls:**

- select the surprising observation;
- highlight part of a table or statement;
- compare two measurements;
- annotate an image;
- answer “What do you notice?”

**Requirements:**

- The activity distinguishes noticing evidence from explaining it.
- Source or curriculum provenance is retained.
- Keyboard and screen-reader alternatives exist for visual annotation.
- Piblo may direct attention without stating the complete inference.

### 7.3 Open explanation move

**Purpose:** Capture the learner's own causal reasoning.

**Possible controls:**

- short text response;
- voice input later;
- sentence starters after support is requested;
- optional “because” chain.

**Requirements:**

- Preserve the learner's original wording.
- Record which hints or examples were visible before submission.
- Avoid crediting reasoning supplied by Piblo.
- Do not require essay-length responses.

### 7.4 Relationship mapping move

**Purpose:** Make inputs, outputs, locations, sequences, or causal relationships
visible.

**Possible controls:**

- label a diagram;
- connect items with arrows;
- arrange a sequence;
- place terms into regions;
- select a relationship from an accessible menu.

**Requirements:**

- Drag-and-drop always has click, keyboard, and screen-reader alternatives.
- The learner can revise before committing.
- The submitted relationship graph is stored as structured data.
- Support can progressively pre-fill part of the structure.

### 7.5 Example sorting move

**Purpose:** Test generalization through examples and non-examples.

**Possible controls:**

- sort scenarios into categories;
- choose which examples follow a rule;
- explain one uncertain classification.

**Requirements:**

- Do not reduce the task to vocabulary matching.
- Include at least one near-miss when pedagogically appropriate.
- Record classification and reasoning separately.
- Feedback should address the rule, not only mark an item incorrect.

### 7.6 Application scenario move

**Purpose:** Test transfer to a new context.

**Possible controls:**

- predict what changes in a scenario;
- change one variable;
- select and justify an outcome;
- compare two cases.

**Requirements:**

- The scenario must differ from the example used during teaching.
- The learner should explain the mechanism, not only select an answer.
- The activity must make unsupported guessing distinguishable from transfer.
- Later versions may use simulations, but the first renderer can use structured
  scenarios.

### Reflection treatment

Reflection is a composition of saved artifacts rather than a seventh required
renderer. It places the original prediction beside the learner's new
explanation and asks:

- What changed?
- What evidence changed it?
- How would you now explain the idea to someone else?

## 8. Tutor presence and free-form conversation

### Tutor voice

- Piblo speaks in one to three short sentences around an activity.
- Tutor text appears as guidance attached to the active move, not as a growing
  stack of bubbles.
- Encouragement names the thinking behavior or evidence rather than offering
  generic praise.
- Longer factual explanations use an expandable explanation treatment.
- Vocabulary and proper nouns may be supplied directly.

### Ask Piblo

- Ask Piblo is available from every learning move.
- Opening it does not discard or submit the active response.
- The learner can ask an unrestricted question in natural language.
- Piblo may answer briefly, provide a hint, or propose a related learning move.
- After the exchange, the interface offers **Return to activity**.
- Relevant questions may be added to the learning record.
- Off-topic conversation must not change mastery or scaffold state.
- Ask Piblo must not become the default route through the lesson.

### Unsupported learner intent

Every structured activity includes **Something else** or an equivalent path
where needed. A learner must never be forced to select an answer they do not
believe merely because it matches the available controls.

## 9. Scaffold interaction behavior

Support should change the activity itself, not only append more tutor text.

| Scaffold level | Interaction treatment |
|---|---|
| L0 | Directional prompt points to what should be noticed |
| L1 | Stronger hint highlights a relationship or reduces the search space |
| L2 | Partial structure, analogy, or worked example does most of the setup |
| L3 | State the answer plainly, then require reflection or retrieval |

Requirements:

- **I'm stuck** advances support explicitly.
- **Give me a hint** requests the next appropriate support treatment.
- **Explain this** may advance to the terminal explanation after the configured
  struggle policy.
- The UI communicates that support was requested without shaming the learner.
- A revealed answer never grants automatic mastery.
- Evidence collected after support records the level of assistance.
- Returning to a lower support level should preserve orientation and prior work.

## 10. Thinking Trail behavior

The Thinking Trail translates learner-model evidence into a learner-facing
story.

### It may show

- the learner's initial prediction;
- evidence they selected or described;
- an explanation they constructed;
- a rule they generalized;
- the result of an application challenge;
- a visible revision from an earlier idea;
- an item marked for future review.

### It must not show

- raw mastery percentages;
- analyzer confidence;
- hidden reasoning;
- scaffold rung numbers;
- misconception IDs;
- diagnostic labels presented as personality traits;
- praise or criticism unsupported by evidence.

### Artifact states

- **Current:** the active place in the lesson.
- **Captured:** submitted but not necessarily understood.
- **Revised:** changed after new evidence.
- **Demonstrated:** independently shown in an appropriate task.
- **Review later:** needs a future retrieval check.

The learner can inspect earlier artifacts, but editing a historical artifact
creates a revision rather than silently overwriting the original.

## 11. Tutor move protocol

The current `tutorTurn` returns plain text. The web application should evolve
toward a validated structured protocol.

```ts
type LessonPhase =
    | "predict"
    | "observe"
    | "explain"
    | "generalize"
    | "apply"
    | "reflect";

type LearningMoveKind =
    | "prediction"
    | "evidence-comparison"
    | "open-explanation"
    | "relationship-map"
    | "example-sort"
    | "application-scenario"
    | "conversation";

interface TutorMove {
    id: string;
    kind: LearningMoveKind;
    phase: LessonPhase;
    objectiveId: string;
    narration: string;
    content: unknown;
    response: ResponseSpecification;
    support: {
        level: number;
        availableActions: Array<"hint" | "stuck" | "explain">;
    };
    provenance: {
        conceptVersion: string;
        sourceIds: string[];
    };
}
```

The final types should use a discriminated union so each `kind` has typed
`content` and `response` fields.

### Protocol rules

- The model may select only registered move kinds.
- The server validates every generated move before returning it.
- The browser renders only trusted components.
- Correct answers, private rubrics, and hidden analyzer data are not sent in the
  activity payload.
- The server stores both the semantic move and the learner submission.
- Unknown or invalid move kinds fall back to a safe conversation or
  open-explanation move.
- Model-generated HTML, JavaScript, or arbitrary component code is prohibited.

## 12. Turn lifecycle and feedback

```text
Learner submits
      ↓
Submission is preserved locally
      ↓
Analyzer checks the learner artifact
      ↓
Learner model and evidence history update
      ↓
Next tutor move is generated and validated
      ↓
Canvas transitions to the next move
```

### Visible states

| State | Learner-facing treatment |
|---|---|
| Drafting | Normal editable activity |
| Submitting | Immediate control feedback; response remains visible |
| Assessing | “Checking your explanation…” |
| Preparing | “Preparing the next step…” |
| Streaming narration | Text may appear progressively without shifting the activity |
| Ready | Focus moves to the new prompt |
| Offline | Draft remains local; retry is available |
| Failed | Explain what was preserved and offer retry |
| Completed | Show reflection and session summary |

### Failure and recovery rules

- Never clear a response before the server acknowledges it.
- Retrying must not create duplicate learner evidence or duplicate turns.
- A failed tutor generation must not roll back a successfully persisted learner
  submission.
- Refreshing the page restores the last acknowledged state and any recoverable
  local draft.
- The learner can cancel generation without losing their submitted work.
- Error copy must not expose provider names, stack traces, or model internals.
- If the next structured move cannot be generated, provide a safe
  open-explanation fallback.

## 13. Motion and microinteraction specification

Motion communicates feedback, orientation, focus, and continuity. It must not
gamify correctness or distract from thinking.

### Timing

| Duration | Use |
|---|---|
| 100–150 ms | Button, selection, and focus feedback |
| 180–240 ms | Hint expansion and small state changes |
| 240–320 ms | Moving between learning moves |
| 300–400 ms | Opening Ask Piblo or the Thinking Trail drawer |

### Behavior

- Selected answers receive immediate visual and non-visual confirmation.
- Submitting locks only the controls that could duplicate the action.
- A new Thinking Trail artifact appears with a restrained emphasis treatment.
- Moving to a new learning move preserves the spatial position of persistent
  controls.
- Feedback explaining a conflict appears near the relevant artifact.
- Correctness does not trigger confetti, shaking, or celebratory interruption.
- Incorrect answers do not use alarming motion.
- Animations use transform and opacity where possible.
- Long animations are interruptible.
- The experience remains usable without animation.
- `prefers-reduced-motion` removes nonessential movement while preserving state
  changes.

## 14. Accessibility requirements

- All functionality is usable by keyboard.
- Every activity uses semantic controls where possible.
- Custom relationship and sorting interactions expose accessible alternatives.
- Focus moves predictably after submission, drawer opening, errors, and move
  transitions.
- Assessment and generation states use polite live-region announcements.
- Error announcements describe both the problem and the recovery action.
- Color is never the sole indicator of correctness, phase, selection, or
  progress.
- The interface supports 200% text zoom.
- Touch targets are appropriate for mobile use.
- Reading level and sentence length remain appropriate for the target learner.
- Visual artifacts include meaningful text equivalents.
- Time pressure is not introduced unless it serves a deliberate learning goal.

## 15. Data and analytics events

The interaction design requires semantic events, not only page views and
message counts.

Minimum events:

- lesson started, resumed, paused, and completed;
- learning move presented;
- response drafted and submitted;
- help requested by type;
- scaffold level changed;
- Ask Piblo opened, questioned, and closed;
- artifact revised;
- phase changed;
- submission restored after failure;
- turn failed and retried;
- application or retrieval completed independently.

Events should include move, objective, phase, and support metadata without
placing unnecessary learner text into analytics systems.

## 16. Initial Photosynthesis storyboard

The first prototype should demonstrate the complete interaction model:

1. **Predict:** Where does most of a growing plant's new material come from?
2. **Observe:** Compare plant mass gained with soil mass lost.
3. **Explain:** Construct the relationship between air, water, light, and plant
   material.
4. **Generalize:** Complete or express the photosynthesis transformation rule.
5. **Apply:** Reason about a watered plant kept in darkness.
6. **Reflect:** Compare the first prediction with the final explanation and name
   the evidence that caused the revision.

The storyboard must include at least one designed stuck path that demonstrates
all scaffold treatments.

## 17. First interaction milestone

The interaction milestone is complete when:

- [ ] The full Photosynthesis lesson can be completed without relying on a
      vertical chat transcript.
- [ ] All six MVP move types have trusted, typed renderers.
- [ ] The model cannot request an unregistered interface component.
- [ ] The learner can use Ask Piblo at any point and return to the active activity.
- [ ] I'm stuck and Give me a hint visibly adapt the active activity.
- [ ] The Thinking Trail contains the learner's prediction, evidence,
      explanation, generalization, and application.
- [ ] The reflection view makes a change in thinking visible.
- [ ] Responses survive retries, refreshes, and recoverable failures.
- [ ] The complete flow works on mobile and with keyboard navigation.
- [ ] Reduced-motion behavior is verified.
- [ ] Internal analytics can distinguish independent evidence from evidence
      produced after support.

## 18. Deferred interactions

- Voice tutoring and spoken responses.
- Open-ended canvas drawing.
- Real-time collaborative learning.
- Fully simulated science labs.
- Arbitrary AI-generated UI.
- Game economies, streaks, and competitive leaderboards.
- Teacher-authored custom activity builders.
- Native mobile gestures that have no web equivalent.

## 19. Open design decisions

These questions should be resolved through low-fidelity prototypes and learner
testing before visual polish:

- Should the Thinking Trail remain visible on desktop or open on demand?
- Should Ask Piblo use a side sheet, an inline expansion, or both by viewport?
- How often should an activity require a written reason after a selection?
- Should phase names be visible to learners or translated into friendlier
  language?
- What is the smallest relationship-mapping interaction that remains accessible?
- How should Piblo respond when a learner asks an interesting question that leaves
  the planned lesson path?
- Which lesson moves should be authored deterministically, and which may be
  generated or adapted by the AI?
- How much of the internal learner evidence should be visible in a session
  summary?

## 20. Next design deliverable

Before application implementation, produce a low-fidelity prototype covering:

- the happy path in the Photosynthesis storyboard;
- one misconception path;
- one repeated-stuck path through L3;
- one free-form Ask Piblo detour;
- one failed-turn recovery;
- desktop and mobile layouts;
- keyboard navigation through a relationship-mapping activity.

The prototype should test the interaction model and information hierarchy before
visual styling, animation polish, or broad content expansion.
