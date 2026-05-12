import type {
  LLMCompletionInput,
  LLMCompletionOutput,
  LLMProvider,
  BookingDraft,
} from "../types";

/**
 * Mock LLM that performs simple intent detection + slot filling so the
 * receptionist chat simulator works end-to-end without an API key.
 *
 * The system prompt is parsed for a `FAQ:` section so the mock can answer
 * common questions verbatim. Swap with a real LLM by replacing this file
 * (or pointing the factory at OpenAIProvider/AnthropicProvider).
 */

interface ParsedBusiness {
  name: string;
  services: { name: string; durationMinutes: number; priceCents: number }[];
  faqs: { question: string; answer: string }[];
  hours: string;
  greeting?: string;
}

function parseBusinessFromPrompt(prompt: string): ParsedBusiness {
  const name = /Business:\s*([^\n]+)/.exec(prompt)?.[1]?.trim() ?? "this business";
  const greetingMatch = /Greeting:\s*([^\n]+)/.exec(prompt)?.[1]?.trim();

  const services: ParsedBusiness["services"] = [];
  // Section terminator: `\n[A-Z][\w ]+:` requires at least 2 chars before `:` so we don't
  // match single-letter FAQ markers like `A:` / `Q:` while still matching `FAQs:`, `Hours:`, etc.
  const serviceBlock = /Services:\n([\s\S]*?)(?:\n[A-Z][\w ]+:|$)/.exec(prompt)?.[1] ?? "";
  for (const line of serviceBlock.split("\n")) {
    const m = /-\s*(.+?)\s*\((\d+)\s*min(?:,\s*\$?(\d+(?:\.\d+)?))?\)/.exec(line);
    if (m) {
      services.push({
        name: m[1].trim(),
        durationMinutes: parseInt(m[2], 10) || 30,
        priceCents: m[3] ? Math.round(parseFloat(m[3]) * 100) : 0,
      });
    }
  }

  const faqs: ParsedBusiness["faqs"] = [];
  const faqBlock = /FAQs:\n([\s\S]*?)(?:\n[A-Z][\w ]+:|$)/.exec(prompt)?.[1] ?? "";
  const faqMatches = faqBlock.matchAll(/Q:\s*([^\n]+)\nA:\s*([^\n]+)/g);
  for (const m of faqMatches) {
    faqs.push({ question: m[1].trim(), answer: m[2].trim() });
  }

  const hours = /Hours:\n([\s\S]*?)(?:\n[A-Z][\w ]+:|$)/.exec(prompt)?.[1]?.trim() ?? "";

  return { name, services, faqs, hours, greeting: greetingMatch };
}

function tokens(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function similarity(a: string, b: string) {
  const A = new Set(tokens(a));
  const B = new Set(tokens(b));
  if (A.size === 0 || B.size === 0) return 0;
  let overlap = 0;
  for (const w of A) if (B.has(w)) overlap++;
  return overlap / Math.max(A.size, B.size);
}

function detectIntent(text: string): "answer" | "book_appointment" | "escalate" | "smalltalk" {
  const t = text.toLowerCase();
  if (/\b(book|schedule|appointment|reserve|set up|reservation)\b/.test(t)) {
    return "book_appointment";
  }
  if (/\b(speak to|talk to|manager|human|owner|agent|representative|complain)\b/.test(t)) {
    return "escalate";
  }
  if (/\b(hi|hello|hey|good (morning|afternoon|evening)|thanks|thank you)\b/.test(t) && t.length < 40) {
    return "smalltalk";
  }
  return "answer";
}

function extractName(text: string): string | undefined {
  // Case-insensitive so "My name is Sam Tester" matches as well as "my name is sam".
  const m =
    /\bmy name is\s+([A-Za-z][A-Za-z]+(?:\s+[A-Za-z][A-Za-z]+)?)/i.exec(text) ||
    /\bi'?m\s+([A-Za-z][A-Za-z]+(?:\s+[A-Za-z][A-Za-z]+)?)/i.exec(text) ||
    /\bthis is\s+([A-Za-z][A-Za-z]+(?:\s+[A-Za-z][A-Za-z]+)?)/i.exec(text);
  return m?.[1];
}

function extractPhone(text: string): string | undefined {
  // Min 8 chars total (covers short forms like "555-0142") with at least one separator.
  const m = /(\+?\d[\d\s().-]{6,}\d)/.exec(text);
  return m?.[1]?.replace(/\s+/g, " ").trim();
}

function extractEmail(text: string): string | undefined {
  const m = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/.exec(text);
  return m?.[1];
}

function extractServiceName(text: string, services: ParsedBusiness["services"]): string | undefined {
  // Containment score: how much of the service name appears in the user's text.
  // Divides by the service-name token count so long user sentences aren't penalized.
  const userSet = new Set(tokens(text));
  let best: { name: string; score: number } | null = null;
  for (const s of services) {
    const nameTokens = tokens(s.name);
    if (!nameTokens.length) continue;
    const overlap = nameTokens.filter((t) => userSet.has(t)).length;
    const score = overlap / nameTokens.length;
    if (score >= 0.5 && (!best || score > best.score)) best = { name: s.name, score };
  }
  return best?.name;
}

function extractDateTime(text: string): { preferredDate?: string; preferredTime?: string } {
  const t = text.toLowerCase();
  let preferredDate: string | undefined;
  let preferredTime: string | undefined;

  const dateWords = [
    "today",
    "tomorrow",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
    "next week",
    "this week",
  ];
  for (const w of dateWords) {
    if (t.includes(w)) {
      preferredDate = w;
      break;
    }
  }
  const dateRegex = /\b(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\b/.exec(t);
  if (!preferredDate && dateRegex) preferredDate = dateRegex[1];

  const timeRegex = /\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i.exec(text);
  if (timeRegex) preferredTime = timeRegex[1];

  return { preferredDate, preferredTime };
}

function bestFaqAnswer(question: string, faqs: ParsedBusiness["faqs"]): string | null {
  let best: { answer: string; score: number } | null = null;
  for (const faq of faqs) {
    const s = similarity(question, faq.question + " " + faq.answer);
    if (s > 0.18 && (!best || s > best.score)) best = { answer: faq.answer, score: s };
  }
  return best?.answer ?? null;
}

function nextMissingSlot(draft: BookingDraft): keyof BookingDraft | null {
  if (!draft.customerName) return "customerName";
  if (!draft.serviceName) return "serviceName";
  if (!draft.preferredDate) return "preferredDate";
  if (!draft.preferredTime) return "preferredTime";
  if (!draft.customerPhone && !draft.customerEmail) return "customerPhone";
  return null;
}

function askForSlot(slot: keyof BookingDraft, businessName: string): string {
  switch (slot) {
    case "customerName":
      return "Of course! Could I get your name?";
    case "serviceName":
      return "Great. Which service would you like to book?";
    case "preferredDate":
      return "What day works best for you?";
    case "preferredTime":
      return "What time would you prefer?";
    case "customerPhone":
      return "Last thing — can I grab a phone number or email so we can send a confirmation?";
    default:
      return `Anything else I can help you with from ${businessName}?`;
  }
}

function mergeDraft(prev: BookingDraft | undefined, next: Partial<BookingDraft>): BookingDraft {
  return { ...(prev ?? { customerName: "" }), ...next } as BookingDraft;
}

export const mockLLMProvider: LLMProvider = {
  name: "mock-llm-v1",

  async complete(input: LLMCompletionInput): Promise<LLMCompletionOutput> {
    const business = parseBusinessFromPrompt(input.systemPrompt);
    const lastUser = [...input.messages].reverse().find((m) => m.role === "user");
    const text = lastUser?.content ?? "";

    const previousDraft = (input.messages
      .map((m) => {
        if (m.role !== "assistant") return null;
        try {
          const md = m.name ? JSON.parse(m.name) : null;
          return md?.bookingDraft as BookingDraft | undefined;
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .pop() ?? undefined) as BookingDraft | undefined;

    const intent = detectIntent(text);

    if (intent === "escalate") {
      return {
        reply:
          "Got it — I'll flag this for the team and someone will reach out as soon as possible. Could I grab your name and best contact number first?",
        intent: "escalate",
      };
    }

    if (intent === "smalltalk" && !previousDraft) {
      const greeting =
        business.greeting ??
        `Hi! Thanks for contacting ${business.name}. How can I help you today?`;
      return { reply: greeting, intent: "smalltalk" };
    }

    if (intent === "book_appointment" || previousDraft) {
      const name = extractName(text);
      const phone = extractPhone(text);
      const email = extractEmail(text);
      const service = extractServiceName(text, business.services);
      const dt = extractDateTime(text);

      const draft = mergeDraft(previousDraft, {
        ...(name ? { customerName: name } : {}),
        ...(phone ? { customerPhone: phone } : {}),
        ...(email ? { customerEmail: email } : {}),
        ...(service ? { serviceName: service } : {}),
        ...(dt.preferredDate ? { preferredDate: dt.preferredDate } : {}),
        ...(dt.preferredTime ? { preferredTime: dt.preferredTime } : {}),
      });

      const missing = nextMissingSlot(draft);
      if (missing) {
        return {
          reply: askForSlot(missing, business.name),
          intent: "book_appointment",
          bookingDraft: draft,
        };
      }

      return {
        reply: `Perfect — I'll book ${draft.serviceName} for ${draft.customerName} on ${draft.preferredDate} at ${draft.preferredTime}. You'll get a confirmation shortly.`,
        intent: "book_appointment",
        bookingDraft: { ...draft, notes: "Booked via AI receptionist" },
      };
    }

    const faqAnswer = bestFaqAnswer(text, business.faqs);
    if (faqAnswer) {
      return { reply: faqAnswer, intent: "answer" };
    }

    if (business.services.length && /price|cost|how much|rates/.test(text.toLowerCase())) {
      const list = business.services
        .map((s) => `${s.name}: $${(s.priceCents / 100).toFixed(2)} (${s.durationMinutes} min)`)
        .join(", ");
      return {
        reply: `Here's what we offer: ${list}. Would you like to book one?`,
        intent: "answer",
      };
    }

    if (/hour|open|closed|when/.test(text.toLowerCase()) && business.hours) {
      return { reply: `Our hours are:\n${business.hours}`, intent: "answer" };
    }

    return {
      reply: `I want to make sure I get this right. I can answer questions about ${business.name}, share our services and hours, or book you an appointment. Could you tell me a bit more about what you need?`,
      intent: "answer",
    };
  },
};
