import "server-only";
import { addDays, addMinutes, parse, isValid } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getLLMProvider } from "@/lib/providers/llm";
import { getCalendarProvider } from "@/lib/providers/calendar";
import { getSMSProvider } from "@/lib/providers/sms";
import { getEmailProvider } from "@/lib/providers/email";
import type { BookingDraft, ChatMessage } from "@/lib/providers/types";
import { buildSystemPrompt } from "./system-prompt";

const DAY_WORDS: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function parseNaturalDateTime(
  preferredDate?: string,
  preferredTime?: string
): Date | null {
  if (!preferredDate || !preferredTime) return null;

  const now = new Date();
  let day = new Date(now);
  const lowerDate = preferredDate.toLowerCase().trim();
  if (lowerDate === "today") {
    // keep day = now
  } else if (lowerDate === "tomorrow") {
    day = addDays(now, 1);
  } else if (lowerDate in DAY_WORDS) {
    const target = DAY_WORDS[lowerDate];
    const diff = (target - now.getDay() + 7) % 7 || 7;
    day = addDays(now, diff);
  } else {
    // Try MM/DD or MM/DD/YYYY
    const parsed =
      tryParse(lowerDate, "M/d/yyyy") ||
      tryParse(lowerDate, "M/d/yy") ||
      tryParse(lowerDate, "M/d", now);
    if (parsed) day = parsed;
    else return null;
  }

  // Time: "3pm", "3:30 pm", "15:00"
  const timeNorm = preferredTime
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/(\d)(am|pm)/, "$1 $2");

  const time =
    tryParse(timeNorm, "h a") ||
    tryParse(timeNorm, "h:mm a") ||
    tryParse(timeNorm, "H:mm") ||
    tryParse(timeNorm.toUpperCase(), "h a");

  if (!time) return null;

  day.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return day;
}

function tryParse(input: string, fmt: string, ref?: Date): Date | null {
  const d = parse(input, fmt, ref ?? new Date());
  return isValid(d) ? d : null;
}

/** Ensures the mock LLM can parse `Services:` even when `customPrompt` omits that block. */
function appendStructuredServicesIfMissing(
  prompt: string,
  services: { name: string; durationMinutes: number; priceCents: number; isActive: boolean }[]
): string {
  const active = services.filter((s) => s.isActive);
  if (!active.length) return prompt;
  if (/\nServices:\n/.test(prompt)) return prompt;
  const body = active
    .map((s) => {
      const price =
        s.priceCents > 0 ? `, $${(s.priceCents / 100).toFixed(2)}` : "";
      return `- ${s.name} (${s.durationMinutes} min${price})`;
    })
    .join("\n");
  return `${prompt}\n\nServices:\n${body}`;
}

export interface ChatTurnInput {
  businessId: string;
  conversationId?: string;
  userMessage: string;
}

export interface ChatTurnResult {
  conversationId: string;
  reply: string;
  intent: string;
  bookingCreatedId?: string;
  bookingDraft?: BookingDraft;
}

export async function chatTurn(input: ChatTurnInput): Promise<ChatTurnResult> {
  const business = await prisma.business.findUniqueOrThrow({
    where: { id: input.businessId },
    include: {
      hours: true,
      services: true,
      appointmentTypes: true,
      faqs: { orderBy: { order: "asc" } },
      aiConfig: true,
    },
  });

  let conversation = input.conversationId
    ? await prisma.conversation.findUnique({
        where: { id: input.conversationId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      })
    : null;

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { businessId: business.id, channel: "chat", status: "open" },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
  }

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: "user",
      content: input.userMessage,
    },
  });

  const systemPrompt = buildSystemPrompt(business);
  const llmSystemPrompt = appendStructuredServicesIfMissing(
    systemPrompt,
    business.services
  );

  const messages: ChatMessage[] = [
    ...conversation.messages.map((m) => ({
      role: m.role as ChatMessage["role"],
      content: m.content,
      name: m.metadata ?? undefined,
    })),
    { role: "user", content: input.userMessage },
  ];

  const llm = getLLMProvider();

  const out = await llm.complete({
    systemPrompt: llmSystemPrompt,
    messages,
    temperature: business.aiConfig?.temperature ?? 0.7,
  });

  let bookingCreatedId: string | undefined;
  let finalReply = out.reply;

  if (out.intent === "book_appointment" && out.bookingDraft) {
    const draft = out.bookingDraft as BookingDraft;
    const allSlotsFilled =
      draft.customerName &&
      draft.serviceName &&
      draft.preferredDate &&
      draft.preferredTime &&
      (draft.customerPhone || draft.customerEmail);

    if (allSlotsFilled) {
      const service = business.services.find(
        (s) => s.name.toLowerCase() === draft.serviceName?.toLowerCase()
      );
      const durationMinutes = service?.durationMinutes ?? 30;
      const startsAt = parseNaturalDateTime(draft.preferredDate, draft.preferredTime);

      if (!startsAt) {
        finalReply = `I couldn't quite parse "${draft.preferredDate} at ${draft.preferredTime}". Could you give me a specific date and time? For example: "Tuesday at 2pm" or "11/14 at 10:30am".`;
      } else {
        const calendar = getCalendarProvider();
        const availability = await calendar.findAvailability({
          businessId: business.id,
          rangeStart: startsAt,
          rangeEnd: addMinutes(startsAt, 60),
          durationMinutes,
        });

        const exact = availability.find(
          (s) => +s.startsAt === +startsAt
        );
        const chosen = exact ?? availability[0];

        if (!chosen) {
          finalReply = `That time isn't available. Could we try another day or time?`;
        } else {
          const endsAt = addMinutes(chosen.startsAt, durationMinutes);
          const booking = await prisma.booking.create({
            data: {
              businessId: business.id,
              conversationId: conversation.id,
              serviceId: service?.id,
              customerName: draft.customerName!,
              customerPhone: draft.customerPhone,
              customerEmail: draft.customerEmail,
              startsAt: chosen.startsAt,
              endsAt,
              status: "confirmed",
              notes: draft.notes,
            },
          });

          await calendar.createEvent({
            businessId: business.id,
            title: `${draft.serviceName} - ${draft.customerName}`,
            startsAt: chosen.startsAt,
            endsAt,
            attendees: [
              {
                name: draft.customerName!,
                email: draft.customerEmail,
                phone: draft.customerPhone,
              },
            ],
          });

          // Pick the confirmation channel based on what the caller gave us.
          // Phone alone -> SMS. Email alone -> Email. Both -> send via both.
          const sentChannels: string[] = [];
          const summary = `you're booked for ${draft.serviceName} on ${chosen.startsAt.toLocaleString()} at ${business.name}`;

          if (draft.customerPhone) {
            const sms = getSMSProvider();
            const result = await sms.send({
              to: draft.customerPhone,
              body: `Hi ${draft.customerName}, ${summary}. Reply STOP to cancel.`,
            });
            if (result.status === "sent") sentChannels.push("sms");
          }
          if (draft.customerEmail) {
            const email = getEmailProvider();
            const result = await email.send({
              to: draft.customerEmail,
              subject: `Your appointment at ${business.name} is confirmed`,
              body: `Hi ${draft.customerName},\n\n${summary[0].toUpperCase()}${summary.slice(1)}.\n\nYou can reply to this email to make changes.\n\n— ${business.name}`,
            });
            if (result.status === "sent") sentChannels.push("email");
          }

          if (sentChannels.length > 0) {
            const channel =
              sentChannels.length === 2 ? "both" : sentChannels[0];
            await prisma.booking.update({
              where: { id: booking.id },
              data: {
                confirmationSentAt: new Date(),
                confirmationChannel: channel,
              },
            });
          }

          bookingCreatedId = booking.id;
          const confirmCopy =
            sentChannels.length === 2
              ? "We just sent a confirmation by SMS and email."
              : sentChannels[0] === "sms"
                ? "We just sent a confirmation by SMS."
                : sentChannels[0] === "email"
                  ? "We just sent a confirmation by email."
                  : "We'll follow up shortly to confirm.";
          finalReply = `You're all set, ${draft.customerName}! ${draft.serviceName} is booked for ${chosen.startsAt.toLocaleString()}. ${confirmCopy}`;
        }
      }
    }
  }

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: "assistant",
      content: finalReply,
      metadata: out.bookingDraft ? JSON.stringify({ bookingDraft: out.bookingDraft }) : null,
    },
  });

  // Persist caller details onto the conversation as the AI collects them so
  // the conversations list functions as a real lead capture. Only fill blanks
  // — never overwrite a value we already saved from an earlier turn.
  if (out.bookingDraft) {
    const draft = out.bookingDraft as BookingDraft;
    const callerPatch: { callerName?: string; callerPhone?: string; callerEmail?: string } = {};
    if (!conversation.callerName && draft.customerName) callerPatch.callerName = draft.customerName;
    if (!conversation.callerPhone && draft.customerPhone) callerPatch.callerPhone = draft.customerPhone;
    if (!conversation.callerEmail && draft.customerEmail) callerPatch.callerEmail = draft.customerEmail;
    if (Object.keys(callerPatch).length > 0) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: callerPatch,
      });
    }
  }

  if (out.intent === "escalate") {
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { status: "escalated" },
    });
  }
  if (bookingCreatedId) {
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        summary: `Booked: ${out.bookingDraft?.serviceName} for ${out.bookingDraft?.customerName}`,
        estimatedValueCents:
          business.services.find(
            (s) => s.name.toLowerCase() === out.bookingDraft?.serviceName?.toLowerCase()
          )?.priceCents ?? 0,
      },
    });
  }

  return {
    conversationId: conversation.id,
    reply: finalReply,
    intent: out.intent ?? "answer",
    bookingCreatedId,
    bookingDraft: out.bookingDraft as BookingDraft | undefined,
  };
}
