import type { SMSProvider } from "../types";
import { mockSMSProvider } from "./mockSMSProvider";

/**
 * SMS factory. Swap to Twilio when env is set, e.g.:
 *   if (process.env.TWILIO_ACCOUNT_SID) return new TwilioSMSProvider();
 */
export function getSMSProvider(): SMSProvider {
  return mockSMSProvider;
}
