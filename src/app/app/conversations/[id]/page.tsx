import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Mail, Phone, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime, cn } from "@/lib/utils";
import {
  markConversationResolvedAction,
  reopenConversationAction,
} from "@/app/app/actions";

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const business = await prisma.business.findUnique({ where: { userId: user.id } });
  if (!business) notFound();

  const convo = await prisma.conversation.findFirst({
    where: { id, businessId: business.id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      bookings: { include: { service: true } },
    },
  });
  if (!convo) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app/conversations">
            <ChevronLeft className="h-4 w-4" />
            Back to conversations
          </Link>
        </Button>
        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">
              {convo.callerName ?? "Conversation"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {convo.channel} · started {formatDate(convo.startedAt)}
            </p>
            {(convo.callerName ||
              convo.callerPhone ||
              convo.callerEmail) && (
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {convo.callerName && (
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3 w-3" /> {convo.callerName}
                  </span>
                )}
                {convo.callerPhone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {convo.callerPhone}
                  </span>
                )}
                {convo.callerEmail && (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {convo.callerEmail}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge
              variant={
                convo.status === "escalated"
                  ? "warning"
                  : convo.status === "resolved"
                    ? "success"
                    : "secondary"
              }
            >
              {convo.status}
            </Badge>
            {convo.status === "resolved" ? (
              <form action={reopenConversationAction}>
                <input type="hidden" name="id" value={convo.id} />
                <Button type="submit" variant="ghost" size="sm">
                  Reopen
                </Button>
              </form>
            ) : (
              <form action={markConversationResolvedAction}>
                <input type="hidden" name="id" value={convo.id} />
                <Button type="submit" size="sm">
                  Mark resolved
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {convo.bookings.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Bookings from this conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {convo.bookings.map((b) => (
                <li key={b.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">
                      {b.service?.name ?? "Appointment"} — {b.customerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(b.startsAt)}
                    </p>
                  </div>
                  <Badge variant="success">{b.status}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {convo.status === "escalated" ? (
        <Card className="border-amber-500/35 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-base">Human handoff</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {convo.escalatedReason ? (
              <p>
                <span className="font-medium text-foreground">What they said: </span>
                {convo.escalatedReason}
              </p>
            ) : null}
            {convo.escalatedCallback ? (
              <p>
                <span className="font-medium text-foreground">Callback: </span>
                {convo.escalatedCallback}
              </p>
            ) : (
              <p className="text-muted-foreground">No phone or email was detected in that message.</p>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {convo.messages.map((m) => (
              <li
                key={m.id}
                className={cn(
                  "flex w-full",
                  m.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                    m.role === "user"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-muted"
                  )}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  <p
                    className={cn(
                      "mt-1 text-[10px] opacity-70",
                      m.role === "user" ? "text-primary-foreground" : "text-muted-foreground"
                    )}
                  >
                    {m.role} · {formatTime(m.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
