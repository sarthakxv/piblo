# Piblo Future Scope and Product Roadmap

This document tracks the work required to turn the current Socratic tutor
prototype into a trustworthy, production-quality AI learning application.

The prototype already validates the core product thesis:

- A tutor response is adapted from a structured learner model.
- A separate analyzer evaluates each learner turn.
- Mastery, misconceptions, confidence, scaffold state, and lesson completion
  evolve during the session.
- The scaffold ladder escalates support and eventually provides the answer.
- The current state-transition and prompt behavior is covered by automated tests.

The next milestone is not simply to place a chat interface around the CLI. The
application should make the adaptive learning loop visible, controllable,
reliable, and useful across multiple sessions.

The required product interaction direction is defined in the
[Piblo Interaction Design Specification](./interaction-design-specification.md).
Review and validate that specification before implementing the first web
experience.

## Product principles

- [ ] Make Piblo feel like a learning experience, not a generic AI chat.
- [ ] Optimize for understanding rather than answer generation or engagement
      alone.
- [ ] Give the learner explicit control over how much help they receive.
- [ ] Show progress in language the learner can understand and trust.
- [ ] Avoid presenting uncertain AI judgments as precise measurements.
- [ ] Keep internal diagnostic state inspectable for development and evaluation.
- [ ] Protect learner privacy, especially when the product is used by minors.
- [ ] Treat AI quality, latency, cost, and failures as product concerns.

## Phase 1: Web application foundation

### Required design input

- [ ] Review and accept the
      [Piblo Interaction Design Specification](./interaction-design-specification.md).
- [ ] Prototype the complete Photosynthesis storyboard, including happy, stuck,
      Ask Piblo, and failure-recovery paths.
- [ ] Resolve the specification's blocking open design decisions before fixing
      the client layout or API response contract.
- [ ] Treat the adaptive learning workspace—not a vertical chat transcript—as
      the target product architecture.

### Application shell

- [ ] Scaffold the web application.
- [ ] Move or expose the existing tutor modules through a server-side API.
- [ ] Keep provider-specific model configuration inside the LLM layer.
- [ ] Ensure model credentials are never sent to the browser.
- [ ] Add environment validation for required server configuration.
- [ ] Create responsive application layouts for desktop, tablet, and mobile.
- [ ] Add a consistent navigation and session shell.

### Initial learner journey

- [ ] Create a welcome screen with a clear explanation of how Piblo teaches.
- [ ] Let the learner select what they want to learn.
- [ ] Collect an appropriate grade or difficulty level.
- [ ] Let the learner choose or describe a learning goal.
- [ ] Include Photosynthesis as the first supported lesson.
- [ ] Allow a learner to start a new session or resume an unfinished one.

### Server-side tutoring flow

- [ ] Add a server endpoint for submitting a learner message.
- [ ] Run the analyzer before generating the next tutor move.
- [ ] Persist the updated learner model before returning the completed turn.
- [ ] Stream the tutor response to the client when practical.
- [ ] Prevent duplicate turns when a request is retried.
- [ ] Support request cancellation and timeouts.
- [ ] Return typed, user-safe errors rather than raw provider failures.

## Phase 2: Learning workspace

Build one excellent learning workspace before adding broad dashboards or
secondary product surfaces.

### Core layout

- [ ] Add a top bar containing the lesson title and current lesson phase.
- [ ] Add a quiet, non-distracting session progress indicator.
- [ ] Build a readable central tutor conversation.
- [ ] Visually distinguish tutor prompts, learner responses, observations,
      hints, and explanations without making the interface noisy.
- [ ] Add a persistent response composer.
- [ ] Preserve scroll position and make the newest tutor move easy to locate.
- [ ] Design useful empty, loading, reconnecting, error, and completed states.

### AI interaction controls

- [ ] Add an explicit **I'm stuck** action.
- [ ] Add an explicit **Give me a hint** action.
- [ ] Add an explicit **Explain this** action.
- [ ] Map these actions to scaffold state instead of relying only on analyzer
      inference.
- [ ] Add **Stop generating** while a tutor response is in progress.
- [ ] Add safe retry behavior for a failed turn.
- [ ] Decide whether learners may edit or resubmit their most recent response.
- [ ] Clearly distinguish “assessing your answer” from “preparing the next
      question.”
- [ ] Prevent multiple submissions while a turn is being processed.

### Learner-facing progress

- [ ] Add an optional progress drawer or panel.
- [ ] Represent objectives with understandable states such as:
      **Not explored**, **Working on**, and **Understood**.
- [ ] Show evidence-based progress statements, for example:
      “You identified all three inputs yourself.”
- [ ] Explain what the learner should revisit without labeling them as wrong.
- [ ] Avoid exposing raw mastery percentages, confidence scores, scaffold rung
      numbers, or misconception identifiers to learners.
- [ ] Keep a detailed diagnostic view available to developers.
- [ ] Design a separate future representation for teachers or parents rather
      than reusing the developer panel.

## Phase 3: Stateful lesson design

### POEGA lesson arc

The macro lesson arc and the micro scaffold ladder must remain separate:

- **POEGA:** Predict → Observe → Explain → Generalize → Apply
- **Scaffold ladder:** increasing support within a difficult learning moment

Tasks:

- [ ] Add the current POEGA phase to the learner or lesson-session state.
- [ ] Define explicit transitions between lesson phases.
- [ ] Require the learner to make an initial prediction.
- [ ] Record the prediction so it can be revisited later.
- [ ] Add an observation or evidence step where the concept supports it.
- [ ] Run the scaffold ladder primarily during the Explain phase.
- [ ] Add a Generalize prompt that tests movement from an example to a rule.
- [ ] Add an Apply prompt that tests transfer to a new situation.
- [ ] Prevent the tutor from skipping required phases without a recorded reason.
- [ ] Add unit tests for phase transitions and completion conditions.

### Scaffold controls and recovery

- [ ] Define the expected tutor behavior for every scaffold level.
- [ ] Ensure repeated struggle always leads to increased support.
- [ ] Honor an explicit request for the answer after a reasonable attempt.
- [ ] Ensure the terminal scaffold level states the answer plainly.
- [ ] Follow a revealed answer with reflection or retrieval rather than granting
      automatic mastery.
- [ ] Add a recovery path when the learner becomes frustrated or disengaged.
- [ ] Allow the system to reduce support when the learner begins progressing.
- [ ] Test off-topic, adversarial, contradictory, and ambiguous learner turns.

## Phase 4: Learner measurement and trust

### Replace the single confidence signal

- [ ] Design and implement an ACRE-style per-turn assessment:
    - answer correctness or claim quality;
    - learner confidence or epistemic stance;
    - learner-originated reasoning;
    - learner-originated evidence.
- [ ] Keep learner confidence separate from the analyzer's confidence in its own
      assessment.
- [ ] Do not credit reasoning or evidence supplied by the tutor and repeated by
      the learner.
- [ ] Make mastery objectives sufficiently atomic for reliable scoring.
- [ ] Bound and clamp mastery updates.
- [ ] Store why each state change occurred.
- [ ] Add tests for confident-but-wrong and correct-but-unsure cases.

### Thinking dimensions

- [ ] Define observable evidence rubrics before scoring broader thinking skills.
- [ ] Derive Curiosity from learner-initiated questions and “why/what-if” turns.
- [ ] Derive Observation from learner-originated evidence.
- [ ] Derive Logical Reasoning from valid mechanism or because-chains.
- [ ] Derive Abstraction from performance in the Generalize phase.
- [ ] Derive Systems Thinking from Apply performance and multi-variable
      reasoning.
- [ ] Aggregate signals across sufficient evidence rather than one conversation.
- [ ] Use bands such as **Emerging**, **Developing**, and **Strong** until the
      measurements are validated.
- [ ] Prevent one unusual session from causing large profile swings.
- [ ] Make every reported dimension traceable to supporting learner evidence.

### Completion and retrieval

- [ ] Require evidence across all objectives before completing a lesson.
- [ ] Re-check objectives whose answers were revealed.
- [ ] Distinguish “seen,” “answered with support,” and “independently retrieved.”
- [ ] Build a lesson-completion summary.
- [ ] Show what the learner can now explain.
- [ ] Show what still needs review.
- [ ] End with a short retrieval or transfer question.
- [ ] Schedule future recall sessions.

## Phase 5: Persistence and product data

### Core records

- [ ] Define and persist a `User`.
- [ ] Define and persist a `LessonSession`.
- [ ] Define and persist each conversation `Message`.
- [ ] Persist learner-model snapshots or an auditable event history.
- [ ] Store concept and objective versions used by each session.
- [ ] Store tutor model, analyzer model, and prompt versions per turn.
- [ ] Store lesson completion and review state.
- [ ] Add migrations and seed data for the initial concept.

### Session behavior

- [ ] Resume an interrupted session without losing scaffold or lesson phase.
- [ ] List recent and completed lessons.
- [ ] Allow learners to restart a lesson intentionally.
- [ ] Keep separate learner models for different users.
- [ ] Handle simultaneous sessions safely.
- [ ] Define retention and deletion behavior.
- [ ] Summarize or compact long conversation history before it exceeds model
      context limits.

## Phase 6: Learner model, memory, and retrieval infrastructure

The learner model must be an evidence-backed memory system, not a JSON object
that is repeatedly overwritten. Different kinds of memory have different
lifetimes, retrieval rules, and privacy requirements.

### Memory layers

- [ ] Define **working memory** for the active lesson:
    - recent messages;
    - current objective;
    - current POEGA phase;
    - scaffold level and struggle state;
    - active misconceptions;
    - pending answer-reveal re-checks.
- [ ] Define **episodic memory** as a history of learning events:
    - learner claims and answers;
    - tutor support provided;
    - analyzer assessments;
    - objective evidence;
    - misconception detection and resolution;
    - lesson completions and retrieval attempts.
- [ ] Define **semantic learner memory** as the durable profile derived from
      evidence across sessions:
    - objective mastery bands;
    - stable misconceptions;
    - independently retrieved knowledge;
    - learner preferences and accessibility needs;
    - broader thinking dimensions only after sufficient evidence.
- [ ] Define **pedagogical memory** as versioned system knowledge rather than
      learner memory:
    - tutoring policies;
    - scaffold behavior;
    - assessment rubrics;
    - concept prerequisites;
    - curriculum content and examples.
- [ ] Document which memory layer each field belongs to and how long it should
      persist.
- [ ] Do not place transient frustration or one-off behavior into a permanent
      learner profile.

### Evidence-based learner model

- [ ] Introduce an append-only `LearnerEvidenceEvent` or equivalent record.
- [ ] Record the learner-originated evidence that supports every mastery or
      misconception update.
- [ ] Record how much tutor assistance preceded the evidence.
- [ ] Distinguish independent recall from answers produced after hints,
      examples, or an answer reveal.
- [ ] Derive the current learner-model snapshot from evidence events using a
      deterministic, tested reducer.
- [ ] Keep periodic snapshots for fast reads while preserving the underlying
      event history for audit and recomputation.
- [ ] Support correction or invalidation of a bad analyzer judgment without
      deleting the original event.
- [ ] Version scoring rules so learner state can be recomputed after a rubric
      change.
- [ ] Add evidence recency, decay, and spaced-retrieval rules where
      pedagogically appropriate.
- [ ] Define how contradictory evidence changes mastery and misconception state.
- [ ] Store uncertainty and evidence count alongside any derived learner trait.

### Conversation memory and context management

- [ ] Stop sending unbounded raw conversation history to every model call.
- [ ] Define a recent-turn window for verbatim conversational context.
- [ ] Generate a structured session summary when older turns leave the window.
- [ ] Preserve unresolved questions, active misconceptions, learner claims, and
      tutor-provided information in the summary.
- [ ] Mark whether an idea originated with the learner or tutor.
- [ ] Retrieve only memory relevant to the active objective and lesson phase.
- [ ] Prevent stale or unrelated memories from steering the current lesson.
- [ ] Detect and resolve conflicting summaries or profile memories.
- [ ] Evaluate whether memory improves tutoring quality before expanding its
      scope.

### Curriculum retrieval and RAG

RAG should ground the tutor in reviewed curriculum content; it should not be the
source of truth for learner mastery. The first Photosynthesis lesson can use a
deterministic concept pack. Vector retrieval becomes useful as the content
library grows.

- [ ] Create reviewed curriculum documents linked to concept, objective, grade
      level, vocabulary, misconception, and content version.
- [ ] Chunk content along pedagogical boundaries rather than arbitrary token
      lengths.
- [ ] Store structured metadata for filtering before semantic retrieval.
- [ ] Retrieve content for the current objective, lesson phase, learner level,
      and active misconception.
- [ ] Prefer deterministic lookup by concept and objective before vector search.
- [ ] Add embeddings and vector search only where metadata lookup is
      insufficient.
- [ ] Keep retrieved curriculum content separate from learner-memory retrieval.
- [ ] Include source identifiers in the model context and operational trace.
- [ ] Require the tutor to stay within retrieved, reviewed factual content.
- [ ] Define when citations should be visible to the learner.
- [ ] Add fallback behavior when retrieval returns weak, conflicting, or no
      content.
- [ ] Evaluate retrieval relevance, factual faithfulness, and citation accuracy.
- [ ] Version embeddings and support re-indexing when content or embedding
      models change.

### Memory retrieval pipeline

- [ ] Build a context assembler that combines:
    1. active lesson state;
    2. relevant recent messages;
    3. structured session summary;
    4. relevant durable learner evidence;
    5. reviewed curriculum content;
    6. versioned tutor and assessment policy.
- [ ] Give the analyzer and tutor different context views based on their roles.
- [ ] Ensure the analyzer can see prior tutor support for attribution checks.
- [ ] Ensure the tutor receives learner evidence without private developer
      reasoning or unnecessary historical data.
- [ ] Apply explicit token budgets to every context section.
- [ ] Log which memories and curriculum sources were retrieved for each turn.
- [ ] Test context assembly as deterministic application logic.

### Storage and privacy choices

- [ ] Use relational records or JSON storage for authoritative lesson and
      learner state.
- [ ] Do not use a vector database as the authoritative learner model.
- [ ] Add vector storage only for curriculum or carefully selected memory
      retrieval use cases.
- [ ] Avoid embedding raw conversations from minors by default.
- [ ] If learner-memory embeddings are introduced, redact sensitive data and
      define deletion behavior for both source records and vectors.
- [ ] Scope all memory retrieval by authenticated learner and tenant.
- [ ] Prevent memories from one learner appearing in another learner's context.
- [ ] Allow a learner or guardian to inspect and delete durable memory.
- [ ] Define retention periods separately for raw transcripts, evidence events,
      derived profiles, summaries, and operational logs.

## Phase 7: AI reliability and evaluation

### Observability

- [ ] Log turn latency for analyzer and tutor calls separately.
- [ ] Record model and prompt versions.
- [ ] Record structured analyzer output and resulting state transitions.
- [ ] Record token usage and estimated cost.
- [ ] Track empty, truncated, invalid, timed-out, and provider-error responses.
- [ ] Add correlation IDs across the browser, API, analyzer, tutor, and database.
- [ ] Redact sensitive learner data from operational logs.

### Evaluation system

- [ ] Create a versioned set of representative tutoring conversations.
- [ ] Include correct, incorrect, hesitant, stuck, off-topic, adversarial, and
      answer-seeking learner behavior.
- [ ] Add checks for Socratic behavior, appropriate hints, answer-reveal
      behavior, language consistency, and lesson closure.
- [ ] Hand-label analyzer outputs for a meaningful evaluation set.
- [ ] Measure analyzer agreement on correctness, misconception detection,
      scaffold signal, and objective selection.
- [ ] Evaluate tutor and analyzer changes before promoting a model or prompt.
- [ ] Define minimum quality thresholds for releases.
- [ ] Add production feedback and conversation-review workflows.
- [ ] Do not fine-tune until the rubric is stable and enough reviewed examples
      exist.

### Resilience

- [ ] Add retry policies appropriate to each failure type.
- [ ] Define provider or model fallback behavior.
- [ ] Prevent a fallback from silently changing pedagogical behavior.
- [ ] Gracefully recover when structured analyzer output is invalid.
- [ ] Preserve the learner's submitted message when a turn fails.
- [ ] Provide a safe generic response if the tutoring pipeline cannot continue.

## Phase 8: Content and curriculum

- [ ] Define a reusable concept schema independent of Photosynthesis.
- [ ] Support prerequisites and relationships between concepts.
- [ ] Support atomic objectives, mastery criteria, misconceptions, examples,
      observations, applications, and vocabulary.
- [ ] Build at least one additional concept to validate generalization.
- [ ] Add content validation and tests.
- [ ] Define a review or authoring workflow for educators.
- [ ] Version concept content so historical sessions remain interpretable.
- [ ] Ground factual explanations in reviewed curriculum content.
- [ ] Decide when learner-facing sources or citations should be shown.
- [ ] Avoid unrestricted topic generation until content and safety behavior are
      reliable.

## Phase 9: Safety, privacy, and security

- [ ] Add authentication and authorization.
- [ ] Keep API keys and provider credentials server-side.
- [ ] Add per-user and per-IP rate limits.
- [ ] Validate and limit all user input.
- [ ] Protect against prompt injection affecting hidden state or system behavior.
- [ ] Define age-appropriate interaction and content policies.
- [ ] Add moderation and crisis-response behavior where appropriate.
- [ ] Publish a clear privacy policy.
- [ ] Minimize collection of personally identifying learner data.
- [ ] Provide account data export and deletion.
- [ ] Define parental consent requirements for supported age groups and markets.
- [ ] Encrypt sensitive data in transit and at rest.
- [ ] Audit access to learner conversations and profiles.

## Phase 10: Accessibility and experience quality

- [ ] Meet WCAG 2.2 AA expectations for the core learning flow.
- [ ] Support full keyboard navigation.
- [ ] Provide visible focus indicators.
- [ ] Use semantic structure and useful screen-reader announcements.
- [ ] Announce streaming, assessment, error, and completion states appropriately.
- [ ] Maintain sufficient color contrast.
- [ ] Do not rely on color alone to communicate progress.
- [ ] Support text zoom and narrow viewports.
- [ ] Respect reduced-motion preferences.
- [ ] Test with screen readers and keyboard-only navigation.
- [ ] Keep language readable for the target learner age.

## Phase 11: Long-term learning and secondary surfaces

These features should follow a successful, well-instrumented learning workspace.

- [ ] Build a review queue based on retrieval needs.
- [ ] Add spaced-repetition reminders.
- [ ] Show learning history across concepts.
- [ ] Recommend the next concept based on prerequisites and demonstrated mastery.
- [ ] Create a learner dashboard focused on useful actions rather than scores.
- [ ] Explore a teacher view with evidence, intervention needs, and session
      summaries.
- [ ] Explore a parent view using careful, non-diagnostic language.
- [ ] Add educator controls for assigning lessons and reviewing progress.
- [ ] Validate every dashboard metric before presenting it as a learner trait.

## First UI milestone: definition of done

The first UI milestone is complete when a learner can:

- [ ] Open the application and select Photosynthesis.
- [ ] Start a lesson at an appropriate level.
- [ ] Receive the prediction prompt.
- [ ] Exchange messages with the tutor through the web interface.
- [ ] See clear assessment and generation states.
- [ ] Ask explicitly for a hint or indicate they are stuck.
- [ ] Recover from a failed or interrupted turn without losing their response.
- [ ] View understandable objective progress without raw diagnostic scores.
- [ ] Complete the lesson and receive a useful learning summary.
- [ ] Refresh or return later and resume the same session.

The development team must also be able to:

- [ ] Inspect the detailed learner model.
- [ ] Trace each message through analyzer output, state transition, and tutor
      response.
- [ ] Identify which model, prompt, and concept version produced a turn.
- [ ] Measure latency, failures, and cost.
- [ ] Run unit tests, type checks, and the initial AI evaluation suite.

## Deferred until after the first UI milestone

- [ ] Broad subject coverage.
- [ ] Parent and teacher dashboards.
- [ ] Social or collaborative learning.
- [ ] Gamification and streak systems.
- [ ] Native mobile applications.
- [ ] Voice tutoring.
- [ ] Fine-tuning or distillation.
- [ ] Institution administration and classroom rostering.
- [ ] High-stakes grading or diagnostic claims.
