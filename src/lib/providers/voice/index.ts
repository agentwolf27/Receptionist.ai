import type { VoiceProvider } from "../types";
import { mockVoiceProvider } from "./mockVoiceProvider";

/**
 * Voice factory. Swap with Vapi/Twilio Voice/Bland when ready:
 *   if (process.env.VAPI_API_KEY) return new VapiVoiceProvider();
 */
export function getVoiceProvider(): VoiceProvider {
  return mockVoiceProvider;
}
