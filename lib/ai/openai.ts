import { createOpenAI } from "@ai-sdk/openai";

let provider: ReturnType<typeof createOpenAI> | null = null;

/** Returns null when `OPENAI_API_KEY` is missing (caller returns 503). */
export function getOpenAIProvider() {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;
  if (!provider) provider = createOpenAI({ apiKey: key });
  return provider;
}

export function getChatModel() {
  const p = getOpenAIProvider();
  if (!p) return null;
  const modelId = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  return p(modelId);
}
