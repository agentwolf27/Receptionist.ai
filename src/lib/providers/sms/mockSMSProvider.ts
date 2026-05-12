import { nanoid } from "nanoid";
import type { SMSMessage, SMSProvider, SMSSendResult } from "../types";

const sentLog: Array<SMSMessage & { id: string; sentAt: string }> = [];

export const mockSMSProvider: SMSProvider = {
  name: "mock-sms",
  async send(msg: SMSMessage): Promise<SMSSendResult> {
    const id = `sms_${nanoid(10)}`;
    sentLog.push({ ...msg, id, sentAt: new Date().toISOString() });
    if (process.env.NODE_ENV !== "test") {
      console.log(`[mockSMS] -> ${msg.to}: ${msg.body}`);
    }
    return { id, status: "sent", providerMessage: "Delivered to mock log" };
  },
};

export function getSentSMSLog() {
  return [...sentLog];
}
