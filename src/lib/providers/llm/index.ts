import type { LLMProvider } from "../types";
import { mockLLMProvider } from "./mockLLMProvider";

/**
 * LLM factory. When OPENAI_API_KEY (or another provider key) is set, swap
 * to a real implementation here. Example:
 *
 *   if (process.env.OPENAI_API_KEY) return new OpenAIProvider();
 */
export function getLLMProvider(): LLMProvider {
  return mockLLMProvider;
}
