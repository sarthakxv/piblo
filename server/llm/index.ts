import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";
import { getServerEnvironment } from "../env.ts";

// ── The provider registry ────────────────────────────────────────────────────
// The ONLY place that knows which vendor we talk to. Everything downstream
// (tutor + analyzer) sees an opaque `LanguageModel`. Swap backends by editing
// this file alone — e.g. `import { anthropic } from "@ai-sdk/anthropic"`
// and returning `anthropic("claude-...")`. That's the whole abstraction.
//
// Default backend: OpenCode "go" — a cheap, OpenAI-compatible gateway to
// curated open models (DeepSeek, GLM, Kimi, Qwen…). It's just an authenticated
// HTTPS endpoint, so it runs identically on a laptop and on Vercel serverless.
//
// Tutor and analyzer get different models: the tutor has to hold the Socratic
// line under an instruction-following-heavy system prompt, so it gets the
// stronger/pricier model. The analyzer only scores structured JSON against a
// fixed schema, so a fast/cheap model is enough.

// The gateway doesn't support JSON-schema `response_format`, so the AI SDK logs
// a warning on every analyzer call. The fallback works (validated), but the
// warning leaks into the interactive chat UI. Silence it here. Remove this if we
// move to a model with native structured-output support.
(globalThis as { AI_SDK_LOG_WARNINGS?: boolean }).AI_SDK_LOG_WARNINGS = false;

const GO_BASE_URL = "https://opencode.ai/zen/go/v1";

// Muse Spark is served on the Responses API, not chat/completions.
function usesResponsesApi(modelId: string): boolean {
  return modelId.startsWith("muse-spark-");
}

function opencodeChatClient() {
  const environment = getServerEnvironment();

  return createOpenAICompatible({
    name: "opencode-go",
    apiKey: environment.opencodeApiKey,
    baseURL: GO_BASE_URL,
  });
}

function opencodeResponsesClient() {
  const environment = getServerEnvironment();

  return createOpenAI({
    name: "opencode-go",
    apiKey: environment.opencodeApiKey,
    baseURL: GO_BASE_URL,
  });
}

function languageModel(modelId: string): LanguageModel {
  if (usesResponsesApi(modelId)) {
    return opencodeResponsesClient().responses(modelId);
  }
  return opencodeChatClient()(modelId);
}

export function getTutorModel(): LanguageModel {
  return languageModel(getServerEnvironment().tutorModel);
}

export function getAnalyzerModel(): LanguageModel {
  return languageModel(getServerEnvironment().analyzerModel);
}

// Human-readable label for logs / the UI panel.
export function modelLabel(): string {
  const environment = getServerEnvironment();
  return `opencode-go · tutor=${environment.tutorModel} · analyzer=${environment.analyzerModel}`;
}
