import type { CalendarProvider } from "../types";
import { mockCalendarProvider } from "./mockCalendarProvider";

/**
 * Calendar factory. Swap with Google Calendar / Microsoft Graph when ready:
 *   if (process.env.GOOGLE_CALENDAR_CLIENT_ID) return new GoogleCalendarProvider();
 */
export function getCalendarProvider(): CalendarProvider {
  return mockCalendarProvider;
}
