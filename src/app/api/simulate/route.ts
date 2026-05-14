import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { chatTurn, ConversationNotFoundError } from "@/lib/ai/receptionist";
import { requireUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const business = await prisma.business.findUnique({ where: { userId: user.id } });
    if (!business) {
      return NextResponse.json({ error: "No business" }, { status: 400 });
    }
    const json = await req.json();
    const { message, conversationId } = bodySchema.parse(json);
    const result = await chatTurn({
      businessId: business.id,
      conversationId,
      userMessage: message,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof ConversationNotFoundError) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const isProd = process.env.NODE_ENV === "production";
    console.error(err);
    if (isProd) {
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
