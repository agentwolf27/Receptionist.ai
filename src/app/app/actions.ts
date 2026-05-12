"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/auth";

async function userBusinessId(): Promise<string> {
  const user = await requireUser();
  const b = await prisma.business.findUnique({ where: { userId: user.id } });
  if (!b) throw new Error("Business not found");
  return b.id;
}

// FormData.get returns string | File | null; Zod string schemas reject null.
// Coerce any missing/non-string value to an empty string so `.optional().or(z.literal(""))` schemas accept it.
const str = (v: FormDataEntryValue | null) => (v == null ? "" : String(v));

// ---------- Business profile ----------
const businessSchema = z.object({
  name: z.string().min(1).max(120),
  industry: z.string().max(80).optional().or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().max(240).optional().or(z.literal("")),
  timezone: z.string().min(1).max(80),
  greeting: z.string().max(500).optional().or(z.literal("")),
});

export async function saveBusinessAction(formData: FormData) {
  const user = await requireUser();
  const parsed = businessSchema.parse({
    name: str(formData.get("name")),
    industry: str(formData.get("industry")),
    description: str(formData.get("description")),
    phone: str(formData.get("phone")),
    email: str(formData.get("email")),
    address: str(formData.get("address")),
    timezone: str(formData.get("timezone")) || "America/New_York",
    greeting: str(formData.get("greeting")),
  });

  const clean = {
    ...parsed,
    industry: parsed.industry || null,
    description: parsed.description || null,
    phone: parsed.phone || null,
    email: parsed.email || null,
    address: parsed.address || null,
    greeting: parsed.greeting || null,
  };

  const existing = await prisma.business.findUnique({ where: { userId: user.id } });
  if (existing) {
    await prisma.business.update({ where: { id: existing.id }, data: clean });
  } else {
    const created = await prisma.business.create({
      data: { ...clean, userId: user.id },
    });
    await prisma.aIConfig.create({ data: { businessId: created.id } });
    const defaultHours = Array.from({ length: 7 }, (_, dow) => ({
      businessId: created.id,
      dayOfWeek: dow,
      openTime: "09:00",
      closeTime: "17:00",
      isClosed: dow === 0 || dow === 6,
    }));
    await prisma.businessHour.createMany({ data: defaultHours });
  }

  revalidatePath("/app", "layout");
}

// ---------- Services ----------
const serviceSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(1000).optional().or(z.literal("")),
  durationMinutes: z.coerce.number().int().min(5).max(8 * 60),
  priceCents: z.coerce.number().int().min(0),
  isActive: z.coerce.boolean().optional(),
});

export async function createServiceAction(formData: FormData) {
  const businessId = await userBusinessId();
  // Treat a missing checkbox as undefined (defaults to active downstream) so
  // services added from minimal forms aren't silently hidden from the AI.
  const rawActive = formData.get("isActive");
  const data = serviceSchema.parse({
    name: str(formData.get("name")),
    description: str(formData.get("description")),
    durationMinutes: str(formData.get("durationMinutes")) || 30,
    priceCents: Math.round(Number(str(formData.get("priceDollars")) || 0) * 100),
    isActive:
      rawActive == null ? undefined : rawActive === "on" || rawActive === "true",
  });
  await prisma.service.create({
    data: {
      businessId,
      name: data.name,
      description: data.description || null,
      durationMinutes: data.durationMinutes,
      priceCents: data.priceCents,
      isActive: data.isActive ?? true,
    },
  });
  revalidatePath("/app/services");
}

export async function deleteServiceAction(formData: FormData) {
  const businessId = await userBusinessId();
  const id = String(formData.get("id"));
  await prisma.service.deleteMany({ where: { id, businessId } });
  revalidatePath("/app/services");
}

// ---------- Appointment Types ----------
const apptTypeSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(1000).optional().or(z.literal("")),
  durationMinutes: z.coerce.number().int().min(5).max(8 * 60),
  bufferMinutes: z.coerce.number().int().min(0).max(120),
  serviceId: z.string().optional().or(z.literal("")),
});

export async function createAppointmentTypeAction(formData: FormData) {
  const businessId = await userBusinessId();
  const data = apptTypeSchema.parse({
    name: str(formData.get("name")),
    description: str(formData.get("description")),
    durationMinutes: str(formData.get("durationMinutes")) || 30,
    bufferMinutes: str(formData.get("bufferMinutes")) || 0,
    serviceId: str(formData.get("serviceId")),
  });
  await prisma.appointmentType.create({
    data: {
      businessId,
      name: data.name,
      description: data.description || null,
      durationMinutes: data.durationMinutes,
      bufferMinutes: data.bufferMinutes,
      serviceId: data.serviceId || null,
    },
  });
  revalidatePath("/app/services");
}

export async function deleteAppointmentTypeAction(formData: FormData) {
  const businessId = await userBusinessId();
  const id = String(formData.get("id"));
  await prisma.appointmentType.deleteMany({ where: { id, businessId } });
  revalidatePath("/app/services");
}

// ---------- FAQs ----------
const faqSchema = z.object({
  question: z.string().min(1).max(280),
  answer: z.string().min(1).max(2000),
});

export async function createFAQAction(formData: FormData) {
  const businessId = await userBusinessId();
  const data = faqSchema.parse({
    question: str(formData.get("question")),
    answer: str(formData.get("answer")),
  });
  const last = await prisma.fAQ.findFirst({
    where: { businessId },
    orderBy: { order: "desc" },
  });
  await prisma.fAQ.create({
    data: {
      businessId,
      question: data.question,
      answer: data.answer,
      order: (last?.order ?? -1) + 1,
    },
  });
  revalidatePath("/app/faqs");
}

export async function deleteFAQAction(formData: FormData) {
  const businessId = await userBusinessId();
  const id = String(formData.get("id"));
  await prisma.fAQ.deleteMany({ where: { id, businessId } });
  revalidatePath("/app/faqs");
}

// ---------- Hours ----------
export async function saveHoursAction(formData: FormData) {
  const businessId = await userBusinessId();
  for (let dow = 0; dow < 7; dow++) {
    const isClosed = formData.get(`closed-${dow}`) === "on";
    const openTime = String(formData.get(`open-${dow}`) ?? "09:00");
    const closeTime = String(formData.get(`close-${dow}`) ?? "17:00");
    await prisma.businessHour.upsert({
      where: { businessId_dayOfWeek: { businessId, dayOfWeek: dow } },
      update: { openTime, closeTime, isClosed },
      create: { businessId, dayOfWeek: dow, openTime, closeTime, isClosed },
    });
  }
  revalidatePath("/app/hours");
}

// ---------- Onboarding ----------
/**
 * Idempotent: upserts AIConfig and flips onboardingCompleted = true.
 * Called on /app/welcome page load so users hit the finish screen exactly
 * once after first-time setup.
 */
export async function completeOnboardingAction(): Promise<void> {
  const businessId = await userBusinessId();
  await prisma.aIConfig.upsert({
    where: { businessId },
    update: { onboardingCompleted: true },
    create: { businessId, onboardingCompleted: true },
  });
  revalidatePath("/app");
}

// ---------- AI Settings ----------
const aiConfigSchema = z.object({
  voice: z.enum(["friendly", "professional", "playful"]),
  customPrompt: z.string().max(8000).optional().or(z.literal("")),
  escalationPhone: z.string().max(40).optional().or(z.literal("")),
  escalationEmail: z.string().email().optional().or(z.literal("")),
  model: z.string().max(80),
  temperature: z.coerce.number().min(0).max(2),
});

// ---------- Conversations ----------
export async function markConversationResolvedAction(formData: FormData) {
  const businessId = await userBusinessId();
  const id = str(formData.get("id"));
  await prisma.conversation.updateMany({
    where: { id, businessId },
    data: { status: "resolved", endedAt: new Date() },
  });
  revalidatePath("/app/conversations");
  revalidatePath(`/app/conversations/${id}`);
}

export async function reopenConversationAction(formData: FormData) {
  const businessId = await userBusinessId();
  const id = str(formData.get("id"));
  await prisma.conversation.updateMany({
    where: { id, businessId },
    data: { status: "open", endedAt: null },
  });
  revalidatePath("/app/conversations");
  revalidatePath(`/app/conversations/${id}`);
}

// ---------- Bookings ----------
export async function cancelBookingAction(formData: FormData) {
  const businessId = await userBusinessId();
  const id = str(formData.get("id"));
  await prisma.booking.updateMany({
    where: { id, businessId },
    data: { status: "cancelled" },
  });
  revalidatePath("/app/bookings");
  revalidatePath("/app");
}

export async function completeBookingAction(formData: FormData) {
  const businessId = await userBusinessId();
  const id = str(formData.get("id"));
  await prisma.booking.updateMany({
    where: { id, businessId },
    data: { status: "completed" },
  });
  revalidatePath("/app/bookings");
  revalidatePath("/app");
}

const rescheduleSchema = z.object({
  id: z.string().min(1),
  // <input type="datetime-local"> emits "YYYY-MM-DDTHH:mm"
  startsAt: z
    .string()
    .min(1)
    .transform((v) => new Date(v))
    .refine((d) => !isNaN(d.getTime()), "Invalid date"),
});

function timeStringToMinutes(t: string): number {
  const [h, m] = t.split(":").map((x) => parseInt(x, 10));
  return (h || 0) * 60 + (m || 0);
}

export async function rescheduleBookingAction(formData: FormData) {
  const businessId = await userBusinessId();
  const { id, startsAt } = rescheduleSchema.parse({
    id: str(formData.get("id")),
    startsAt: str(formData.get("startsAt")),
  });
  const existing = await prisma.booking.findFirst({
    where: { id, businessId },
    include: { service: true },
  });
  if (!existing) throw new Error("Booking not found");

  const durationMinutes =
    existing.service?.durationMinutes ??
    Math.max(15, Math.round((+existing.endsAt - +existing.startsAt) / 60000));
  const endsAt = new Date(+startsAt + durationMinutes * 60 * 1000);

  // Validate against business hours and existing bookings (excluding this one).
  const hours = await prisma.businessHour.findMany({ where: { businessId } });
  const dayHours = hours.find((h) => h.dayOfWeek === startsAt.getDay());
  if (!dayHours || dayHours.isClosed) {
    throw new Error("That day is outside business hours.");
  }
  const startMin = startsAt.getHours() * 60 + startsAt.getMinutes();
  const endMin = startMin + durationMinutes;
  if (
    startMin < timeStringToMinutes(dayHours.openTime) ||
    endMin > timeStringToMinutes(dayHours.closeTime)
  ) {
    throw new Error("That time is outside business hours.");
  }

  const collision = await prisma.booking.findFirst({
    where: {
      businessId,
      id: { not: id },
      status: { not: "cancelled" },
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
    },
    select: { id: true },
  });
  if (collision) throw new Error("That time conflicts with another booking.");

  await prisma.booking.update({
    where: { id },
    data: { startsAt, endsAt, status: "confirmed" },
  });
  revalidatePath("/app/bookings");
  revalidatePath("/app");
}

export async function saveAIConfigAction(formData: FormData) {
  const businessId = await userBusinessId();
  const data = aiConfigSchema.parse({
    voice: str(formData.get("voice")) || "friendly",
    customPrompt: str(formData.get("customPrompt")),
    escalationPhone: str(formData.get("escalationPhone")),
    escalationEmail: str(formData.get("escalationEmail")),
    model: str(formData.get("model")) || "mock-llm-v1",
    temperature: str(formData.get("temperature")) || 0.7,
  });
  await prisma.aIConfig.upsert({
    where: { businessId },
    update: {
      voice: data.voice,
      customPrompt: data.customPrompt || null,
      escalationPhone: data.escalationPhone || null,
      escalationEmail: data.escalationEmail || null,
      model: data.model,
      temperature: data.temperature,
    },
    create: {
      businessId,
      voice: data.voice,
      customPrompt: data.customPrompt || null,
      escalationPhone: data.escalationPhone || null,
      escalationEmail: data.escalationEmail || null,
      model: data.model,
      temperature: data.temperature,
    },
  });
  revalidatePath("/app/settings");
}
