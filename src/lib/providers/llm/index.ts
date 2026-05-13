import type { LLMProvider } from "../types";
import { createGroqLLMProvider } from "./groqLLMProvider";
import { mockLLMProvider } from "./mockLLMProvider";

/**
 * LLM factory. Set `GROQ_API_KEY` for Groq (see .env.example). Otherwise mock (no API key).
 */
let groqSingleton: LLMProvider | undefined;

export function getLLMProvider(): LLMProvider {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (groqKey) {
    if (!groqSingleton) groqSingleton = createGroqLLMProvider(groqKey);
    return groqSingleton;
  }
  return mockLLMProvider;
}

export function isUsingGroq(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}
