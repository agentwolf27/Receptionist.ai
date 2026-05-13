import type {
  LLMCompletionInput,
  LLMCompletionOutput,
  LLMProvider,
  BookingDraft,
} from "../types";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/** Default model; override with GROQ_MODEL in env. See https://console.groq.com/docs/models */
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

const JSON_INSTRUCTION = `\n\nYou must reply with ONLY valid JSON (no markdown fence), shape:
{"reply":"string shown to customer","intent":"answer"|"book_appointment"|"escalate"|"smalltalk","bookingDraft":optional object}
bookingDraft optional keys: customerName, customerPhone, customerEmail, serviceName, preferredDate (e.g. tomorrow), preferredTime (e.g. 2pm), notes.
Include bookingDraft whenever you are collecting or confirming booking details. Use intent "escalate" if user wants a human/manager.`;


function coerceIntent(v: unknown): LLMCompletionOutput["intent"] {
  if (
    v === "answer" ||
    v === "book_appointment" ||
    v === "escalate" ||
    v === "smalltalk"
  ) {
    return v;
  }
  return "answer";
}

export function createGroqLLMProvider(apiKey: string): LLMProvider {
  const model = process.env.GROQ_MODEL?.trim() || DEFAULT_MODEL;

  return {
    name: "groq",

    async complete(input: LLMCompletionInput): Promise<LLMCompletionOutput> {
      const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
        { role: "system", content: input.systemPrompt + JSON_INSTRUCTION },
        ...input.messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ role: m.role, content: m.content })),
      ];

      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: input.temperature ?? 0.5,
          response_format: { type: "json_object" },
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`Groq API ${res.status}: ${errText.slice(0, 200)}`);
      }

      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const raw = data.choices?.[0]?.message?.content ?? "{}";

      try {
        const parsed = JSON.parse(raw) as {
          reply?: string;
          intent?: string;
          bookingDraft?: Partial<BookingDraft>;
        };
        const reply =
          typeof parsed.reply === "string" && parsed.reply.trim()
            ? parsed.reply.trim()
            : "Thanks — how else can I help?";
        return {
          reply,
          intent: coerceIntent(parsed.intent),
          bookingDraft: parsed.bookingDraft ?? undefined,
        };
      } catch {
        return { reply: raw.slice(0, 2000), intent: "answer" };
      }
    },
  };
}
