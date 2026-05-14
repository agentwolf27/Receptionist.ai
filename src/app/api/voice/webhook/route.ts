import { NextResponse } from "next/server";

/**
 * Stub for future voice providers (Vapi, Twilio, etc.).
 * Contract: POST JSON `{ "event": string, "callId"?: string, "transcript"?: string, ... }`
 * Optional auth: header `x-voice-webhook-secret` must match `VOICE_WEBHOOK_SECRET` when that env is set.
 * Does not create conversations yet — returns 202 so you can wire providers without changing the URL.
 */
export async function POST(req: Request) {
  const secret = process.env.VOICE_WEBHOOK_SECRET?.trim();
  if (secret) {
    const got = req.headers.get("x-voice-webhook-secret");
    if (got !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    if (process.env.NODE_ENV !== "production") {
      console.info("[voice/webhook] stub received", { event: body.event, callId: body.callId });
    }
    return NextResponse.json(
      {
        ok: true,
        received: true,
        message:
          "Voice webhook stub — persist transcript and call chatTurn from your provider integration when ready.",
      },
      { status: 202 }
    );
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
