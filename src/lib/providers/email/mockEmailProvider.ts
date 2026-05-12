import { nanoid } from "nanoid";
import type { EmailMessage, EmailProvider, EmailSendResult } from "../types";

const sentLog: Array<EmailMessage & { id: string; sentAt: string }> = [];

export const mockEmailProvider: EmailProvider = {
  name: "mock-email",
  async send(msg: EmailMessage): Promise<EmailSendResult> {
    const id = `email_${nanoid(10)}`;
    sentLog.push({ ...msg, id, sentAt: new Date().toISOString() });
    if (process.env.NODE_ENV !== "test") {
      console.log(`[mockEmail] -> ${msg.to} :: ${msg.subject}\n${msg.body}`);
    }
    return { id, status: "sent", providerMessage: "Delivered to mock log" };
  },
};

export function getSentEmailLog() {
  return [...sentLog];
}
