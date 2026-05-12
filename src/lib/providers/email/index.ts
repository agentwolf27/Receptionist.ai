import type { EmailProvider } from "../types";
import { mockEmailProvider } from "./mockEmailProvider";

/**
 * Email factory. Swap to SendGrid/Resend/Postmark when env is set, e.g.:
 *   if (process.env.RESEND_API_KEY) return new ResendEmailProvider();
 */
export function getEmailProvider(): EmailProvider {
  return mockEmailProvider;
}
