import { DAYS_OF_WEEK } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

type BusinessFull = Prisma.BusinessGetPayload<{
  include: {
    hours: true;
    services: true;
    appointmentTypes: true;
    faqs: { orderBy: { order: "asc" } };
    aiConfig: true;
  };
}>;

/**
 * Build the system prompt used by the AI receptionist from business data.
 * The format is parsed by the mock LLM and is also suitable as a real
 * OpenAI/Anthropic system prompt.
 */
export function buildSystemPrompt(business: BusinessFull): string {
  if (business.aiConfig?.customPrompt) {
    return business.aiConfig.customPrompt;
  }

  const lines: string[] = [];
  lines.push(
    `You are the friendly, professional AI receptionist for ${business.name}.`
  );
  lines.push(
    `Stay strictly on topic. Only answer using the business profile, services, FAQs, and hours below. If unsure, offer to escalate to a human teammate.`
  );
  lines.push("");
  lines.push(`Business: ${business.name}`);
  if (business.industry) lines.push(`Industry: ${business.industry}`);
  if (business.description) lines.push(`About: ${business.description}`);
  if (business.address) lines.push(`Address: ${business.address}`);
  if (business.phone) lines.push(`Phone: ${business.phone}`);
  if (business.email) lines.push(`Email: ${business.email}`);
  lines.push(`Timezone: ${business.timezone}`);
  if (business.greeting) lines.push(`Greeting: ${business.greeting}`);

  if (business.services.length) {
    lines.push("");
    lines.push("Services:");
    for (const s of business.services.filter((x) => x.isActive)) {
      const price =
        s.priceCents > 0 ? `, $${(s.priceCents / 100).toFixed(2)}` : "";
      lines.push(`- ${s.name} (${s.durationMinutes} min${price})`);
      if (s.description) lines.push(`  ${s.description}`);
    }
  }

  if (business.appointmentTypes.length) {
    lines.push("");
    lines.push("Appointment Types:");
    for (const a of business.appointmentTypes.filter((x) => x.isActive)) {
      lines.push(`- ${a.name} (${a.durationMinutes} min)`);
    }
  }

  if (business.hours.length) {
    lines.push("");
    lines.push("Hours:");
    const byDay = new Map(business.hours.map((h) => [h.dayOfWeek, h]));
    for (let i = 0; i < 7; i++) {
      const h = byDay.get(i);
      if (!h || h.isClosed) {
        lines.push(`- ${DAYS_OF_WEEK[i]}: Closed`);
      } else {
        lines.push(`- ${DAYS_OF_WEEK[i]}: ${h.openTime} - ${h.closeTime}`);
      }
    }
  }

  if (business.faqs.length) {
    lines.push("");
    lines.push("FAQs:");
    for (const f of business.faqs) {
      lines.push(`Q: ${f.question}`);
      lines.push(`A: ${f.answer}`);
    }
  }

  lines.push("");
  lines.push("Behavior:");
  lines.push("- Greet callers warmly and identify yourself as the AI receptionist.");
  lines.push("- Ask what they need.");
  lines.push("- To book an appointment, collect: name, phone OR email, desired service, preferred date and time.");
  lines.push("- Confirm details before booking.");
  lines.push("- If you cannot answer confidently, say you'll escalate to the team.");

  return lines.join("\n");
}
