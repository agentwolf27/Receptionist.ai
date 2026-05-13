import bcrypt from "bcryptjs";
import { addDays, addMinutes, setHours, setMinutes } from "date-fns";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("demo1234", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@receptionist.ai" },
    update: { passwordHash, name: "Demo Owner" },
    create: {
      email: "demo@receptionist.ai",
      passwordHash,
      name: "Demo Owner",
    },
  });

  await prisma.business.deleteMany({ where: { userId: user.id } });

  const business = await prisma.business.create({
    data: {
      userId: user.id,
      name: "Maple Dental",
      industry: "Family dentistry",
      description:
        "Family-owned dentistry practice serving the Maple Heights neighborhood since 2007. We specialize in preventive care, cosmetic dentistry, and emergency visits.",
      phone: "(555) 555-0142",
      email: "hi@mapledental.example.com",
      address: "123 Maple Ave, Springfield",
      timezone: "America/New_York",
      greeting:
        "Hi! Thanks for calling Maple Dental — this is your AI receptionist. How can I help today?",
    },
  });

  await prisma.aIConfig.create({
    data: {
      businessId: business.id,
      voice: "friendly",
      escalationEmail: "owner@mapledental.example.com",
      escalationPhone: "(555) 555-0143",
    },
  });

  const hourData = Array.from({ length: 7 }, (_, dow) => ({
    businessId: business.id,
    dayOfWeek: dow,
    openTime: "09:00",
    closeTime: "17:00",
    isClosed: dow === 0 || dow === 6,
  }));
  await prisma.businessHour.createMany({ data: hourData });

  const services = await prisma.$transaction([
    prisma.service.create({
      data: {
        businessId: business.id,
        name: "Teeth cleaning",
        description: "Routine dental cleaning and polish.",
        durationMinutes: 45,
        priceCents: 12000,
      },
    }),
    prisma.service.create({
      data: {
        businessId: business.id,
        name: "New patient consultation",
        description: "First visit, X-rays, full mouth assessment.",
        durationMinutes: 60,
        priceCents: 15000,
      },
    }),
    prisma.service.create({
      data: {
        businessId: business.id,
        name: "Teeth whitening",
        description: "In-office whitening session.",
        durationMinutes: 60,
        priceCents: 35000,
      },
    }),
  ]);

  await prisma.appointmentType.createMany({
    data: [
      {
        businessId: business.id,
        name: "Cleaning",
        durationMinutes: 45,
        bufferMinutes: 15,
        serviceId: services[0].id,
      },
      {
        businessId: business.id,
        name: "Consultation",
        durationMinutes: 60,
        bufferMinutes: 0,
        serviceId: services[1].id,
      },
      {
        businessId: business.id,
        name: "Whitening",
        durationMinutes: 60,
        bufferMinutes: 15,
        serviceId: services[2].id,
      },
    ],
  });

  await prisma.fAQ.createMany({
    data: [
      {
        businessId: business.id,
        question: "Do you accept walk-ins?",
        answer: "Yes! Walk-ins are welcome Mon-Fri between 9am-3pm. Wait times vary, so calling ahead is recommended.",
        order: 0,
      },
      {
        businessId: business.id,
        question: "What insurance do you accept?",
        answer: "We accept Delta Dental, Cigna, MetLife, and most major PPO plans. Call us with your plan and we'll verify coverage before your visit.",
        order: 1,
      },
      {
        businessId: business.id,
        question: "Do you treat children?",
        answer: "Absolutely. We see patients age 3 and up. Dr. Chen specializes in pediatric care.",
        order: 2,
      },
      {
        businessId: business.id,
        question: "Is there parking?",
        answer: "Yes, free parking right outside the building on Maple Ave.",
        order: 3,
      },
      {
        businessId: business.id,
        question: "Do you offer emergency visits?",
        answer: "Yes — for severe pain or trauma, call our main line and select option 2. We hold same-day slots open until 4pm daily.",
        order: 4,
      },
    ],
  });

  // Sample conversation 1: FAQ answered
  const c1 = await prisma.conversation.create({
    data: {
      businessId: business.id,
      channel: "chat",
      status: "resolved",
      callerName: "Priya Shah",
      summary: "Asked about insurance coverage",
    },
  });
  await prisma.message.createMany({
    data: [
      { conversationId: c1.id, role: "user", content: "Hi, do you take Delta Dental?" },
      {
        conversationId: c1.id,
        role: "assistant",
        content:
          "Yes! We accept Delta Dental, Cigna, MetLife, and most major PPO plans. Want me to verify your specific plan?",
      },
      { conversationId: c1.id, role: "user", content: "No thanks, that's all I needed!" },
      {
        conversationId: c1.id,
        role: "assistant",
        content: "Glad I could help, Priya. Have a great day!",
      },
    ],
  });

  // Sample conversation 2: Booking flow
  const c2 = await prisma.conversation.create({
    data: {
      businessId: business.id,
      channel: "voice",
      status: "open",
      callerName: "Alex Rivera",
      callerPhone: "(555) 555-0199",
      summary: "Booked: Teeth cleaning",
      estimatedValueCents: 12000,
    },
  });
  await prisma.message.createMany({
    data: [
      { conversationId: c2.id, role: "user", content: "I want to book a cleaning tomorrow at 2pm." },
      {
        conversationId: c2.id,
        role: "assistant",
        content: "Of course! Could I get your name?",
      },
      { conversationId: c2.id, role: "user", content: "Alex Rivera, 555-0199." },
      {
        conversationId: c2.id,
        role: "assistant",
        content:
          "You're all set, Alex! Teeth cleaning is booked for tomorrow at 2pm. We just sent a confirmation by SMS.",
      },
    ],
  });

  const tomorrow2pm = setMinutes(setHours(addDays(new Date(), 1), 14), 0);
  await prisma.booking.create({
    data: {
      businessId: business.id,
      conversationId: c2.id,
      serviceId: services[0].id,
      customerName: "Alex Rivera",
      customerPhone: "(555) 555-0199",
      startsAt: tomorrow2pm,
      endsAt: addMinutes(tomorrow2pm, 45),
      status: "confirmed",
      confirmationSentAt: new Date(),
    },
  });

  // Another upcoming booking 3 days out
  const futureSlot = setMinutes(setHours(addDays(new Date(), 3), 10), 30);
  await prisma.booking.create({
    data: {
      businessId: business.id,
      serviceId: services[1].id,
      customerName: "Sam Greene",
      customerEmail: "sam@example.com",
      startsAt: futureSlot,
      endsAt: addMinutes(futureSlot, 60),
      status: "confirmed",
    },
  });

  // Sample conversation 3: Escalated
  const c3 = await prisma.conversation.create({
    data: {
      businessId: business.id,
      channel: "chat",
      status: "escalated",
      callerName: "Jordan Lee",
      summary: "Wanted to speak with the office manager",
    },
  });
  await prisma.message.createMany({
    data: [
      {
        conversationId: c3.id,
        role: "user",
        content: "I'd like to speak to a manager about a billing issue.",
      },
      {
        conversationId: c3.id,
        role: "assistant",
        content:
          "Got it — I'll flag this for the team and someone will reach out as soon as possible. Could I grab your name and best contact number first?",
      },
      { conversationId: c3.id, role: "user", content: "Jordan Lee, 555-0177." },
      {
        conversationId: c3.id,
        role: "assistant",
        content: "Thanks Jordan. The office manager will call you back today before 5pm.",
      },
    ],
  });

  console.log("Seed complete.");
  console.log("Login: demo@receptionist.ai / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
