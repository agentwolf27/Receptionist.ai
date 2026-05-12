import { addMinutes, isAfter, isBefore, startOfDay, addDays, setHours, setMinutes } from "date-fns";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import type {
  AvailabilityQuery,
  AvailabilitySlot,
  CalendarProvider,
} from "../types";

function parseTime(t: string): { h: number; m: number } {
  const [h, m] = t.split(":").map((x) => parseInt(x, 10));
  return { h: h || 0, m: m || 0 };
}

export const mockCalendarProvider: CalendarProvider = {
  name: "mock-calendar",

  async findAvailability(q: AvailabilityQuery): Promise<AvailabilitySlot[]> {
    const hours = await prisma.businessHour.findMany({
      where: { businessId: q.businessId },
    });
    const byDay = new Map<number, (typeof hours)[number]>();
    for (const h of hours) byDay.set(h.dayOfWeek, h);

    const existing = await prisma.booking.findMany({
      where: {
        businessId: q.businessId,
        startsAt: { gte: q.rangeStart, lte: q.rangeEnd },
        status: { not: "cancelled" },
      },
      select: { startsAt: true, endsAt: true },
    });

    const slots: AvailabilitySlot[] = [];
    let cursor = startOfDay(q.rangeStart);
    const SLOT_STEP = 30; // minutes between candidate slot starts

    while (isBefore(cursor, q.rangeEnd)) {
      const dow = cursor.getDay();
      const h = byDay.get(dow);
      if (h && !h.isClosed) {
        const open = parseTime(h.openTime);
        const close = parseTime(h.closeTime);
        let startWindow = setMinutes(setHours(cursor, open.h), open.m);
        const closeWindow = setMinutes(setHours(cursor, close.h), close.m);
        while (
          isBefore(addMinutes(startWindow, q.durationMinutes), closeWindow) ||
          +addMinutes(startWindow, q.durationMinutes) === +closeWindow
        ) {
          const slotEnd = addMinutes(startWindow, q.durationMinutes);
          if (isAfter(startWindow, q.rangeStart) || +startWindow === +q.rangeStart) {
            const collides = existing.some(
              (e) =>
                isBefore(startWindow, e.endsAt) && isAfter(slotEnd, e.startsAt)
            );
            if (!collides) {
              slots.push({ startsAt: startWindow, endsAt: slotEnd });
              if (slots.length >= 24) return slots;
            }
          }
          startWindow = addMinutes(startWindow, SLOT_STEP);
        }
      }
      cursor = addDays(cursor, 1);
    }

    return slots;
  },

  async createEvent(input) {
    if (process.env.NODE_ENV !== "test") {
      console.log(
        `[mockCalendar] event "${input.title}" ${input.startsAt.toISOString()} - ${input.endsAt.toISOString()}`
      );
    }
    return { eventId: `evt_${nanoid(10)}`, status: "created" };
  },
};
