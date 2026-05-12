// Cross-provider type contracts. Swap implementations in `index.ts`
// for each provider when ready to integrate real APIs.

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
  toolCallId?: string;
}

export interface LLMCompletionInput {
  systemPrompt: string;
  messages: ChatMessage[];
  temperature?: number;
  model?: string;
  // Structured-output schema hint for the mock to parse intents
  intentHints?: string[];
}

export interface LLMCompletionOutput {
  reply: string;
  intent?: "answer" | "book_appointment" | "escalate" | "smalltalk";
  // Slot filling for booking intent
  bookingDraft?: Partial<BookingDraft>;
  // Confidence / debug
  metadata?: Record<string, unknown>;
}

export interface BookingDraft {
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  serviceName?: string;
  preferredDate?: string; // ISO or natural
  preferredTime?: string;
  notes?: string;
}

export interface LLMProvider {
  name: string;
  complete(input: LLMCompletionInput): Promise<LLMCompletionOutput>;
}

// ---------- SMS ----------
export interface SMSMessage {
  to: string;
  from?: string;
  body: string;
}

export interface SMSSendResult {
  id: string;
  status: "queued" | "sent" | "failed";
  providerMessage?: string;
}

export interface SMSProvider {
  name: string;
  send(msg: SMSMessage): Promise<SMSSendResult>;
}

// ---------- Email ----------
export interface EmailMessage {
  to: string;
  from?: string;
  subject: string;
  body: string;
}

export interface EmailSendResult {
  id: string;
  status: "queued" | "sent" | "failed";
  providerMessage?: string;
}

export interface EmailProvider {
  name: string;
  send(msg: EmailMessage): Promise<EmailSendResult>;
}

// ---------- Voice ----------
export interface VoiceCallInput {
  to: string;
  from?: string;
  greeting: string;
}

export interface VoiceTranscriptSegment {
  role: "caller" | "assistant";
  text: string;
  at: string; // ISO timestamp
}

export interface VoiceCallResult {
  callId: string;
  status: "initiated" | "completed" | "failed";
  transcript?: VoiceTranscriptSegment[];
}

export interface VoiceProvider {
  name: string;
  startCall(input: VoiceCallInput): Promise<VoiceCallResult>;
  getTranscript(callId: string): Promise<VoiceTranscriptSegment[]>;
}

// ---------- Calendar ----------
export interface AvailabilitySlot {
  startsAt: Date;
  endsAt: Date;
}

export interface AvailabilityQuery {
  businessId: string;
  rangeStart: Date;
  rangeEnd: Date;
  durationMinutes: number;
}

export interface CalendarProvider {
  name: string;
  findAvailability(q: AvailabilityQuery): Promise<AvailabilitySlot[]>;
  createEvent(input: {
    businessId: string;
    title: string;
    description?: string;
    startsAt: Date;
    endsAt: Date;
    attendees?: { name: string; email?: string; phone?: string }[];
  }): Promise<{ eventId: string; status: "created" | "failed" }>;
}
