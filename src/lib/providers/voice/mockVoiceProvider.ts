import { nanoid } from "nanoid";
import type {
  VoiceCallInput,
  VoiceCallResult,
  VoiceProvider,
  VoiceTranscriptSegment,
} from "../types";

const transcripts = new Map<string, VoiceTranscriptSegment[]>();

export const mockVoiceProvider: VoiceProvider = {
  name: "mock-voice",

  async startCall(input: VoiceCallInput): Promise<VoiceCallResult> {
    const callId = `call_${nanoid(10)}`;
    transcripts.set(callId, [
      { role: "assistant", text: input.greeting, at: new Date().toISOString() },
    ]);
    if (process.env.NODE_ENV !== "test") {
      console.log(`[mockVoice] call started -> ${input.to}: ${input.greeting}`);
    }
    return { callId, status: "initiated" };
  },

  async getTranscript(callId: string): Promise<VoiceTranscriptSegment[]> {
    return transcripts.get(callId) ?? [];
  },
};
