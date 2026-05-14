import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { getCurrentBusinessOrRedirect } from "@/lib/data/business";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatDate } from "@/lib/utils";

type FilterKey = "all" | "open" | "resolved" | "escalated" | "with_booking";
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "resolved", label: "Resolved" },
  { key: "escalated", label: "Escalated" },
  { key: "with_booking", label: "Has booking" },
];

function buildWhere(
  businessId: string,
  filter: FilterKey,
  q: string
): Prisma.ConversationWhereInput {
  const where: Prisma.ConversationWhereInput = { businessId };
  if (filter === "open" || filter === "resolved" || filter === "escalated") {
    where.status = filter;
  }
  if (filter === "with_booking") {
    where.bookings = { some: {} };
  }
  if (q) {
    where.OR = [
      { callerName: { contains: q } },
      { callerPhone: { contains: q } },
      { callerEmail: { contains: q } },
      { summary: { contains: q } },
      { messages: { some: { content: { contains: q } } } },
    ];
  }
  return where;
}

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const business = await getCurrentBusinessOrRedirect();
  const params = await searchParams;
  const filter = (FILTERS.find((f) => f.key === params.filter)?.key ?? "all") as FilterKey;
  const q = (params.q ?? "").trim();

  const conversations = await prisma.conversation.findMany({
    where: buildWhere(business.id, filter, q),
    orderBy: { startedAt: "desc" },
    include: {
      messages: { take: 1, orderBy: { createdAt: "desc" } },
      _count: { select: { messages: true, bookings: true } },
    },
  });

  const chipHref = (key: FilterKey) => {
    const sp = new URLSearchParams();
    if (key !== "all") sp.set("filter", key);
    if (q) sp.set("q", q);
    const qs = sp.toString();
    return qs ? `/app/conversations?${qs}` : `/app/conversations`;
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Conversations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every chat, call, and SMS thread the AI has handled.
        </p>
      </div>
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>All conversations</CardTitle>
            <form className="flex w-full max-w-xs items-center gap-2 sm:w-auto">
              {filter !== "all" && (
                <input type="hidden" name="filter" value={filter} />
              )}
              <Input
                name="q"
                defaultValue={q}
                placeholder="Search caller or message…"
                className="h-9"
              />
              <Button type="submit" size="sm" variant="secondary">
                Search
              </Button>
            </form>
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <Link
                key={f.key}
                href={chipHref(f.key)}
                className={cn(
                  "inline-flex h-7 items-center rounded-full border px-3 text-xs font-medium transition-colors",
                  filter === f.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted"
                )}
              >
                {f.label}
              </Link>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {conversations.length === 0 ? (
            <EmptyState
              icon={<MessageSquareText className="h-5 w-5" />}
              title={
                q || filter !== "all"
                  ? "No conversations match"
                  : "No conversations yet"
              }
              description={
                q || filter !== "all"
                  ? "Try clearing the filter or searching for something else."
                  : "Start one from the AI simulator."
              }
              action={
                <Button asChild size="sm">
                  <Link href="/app/simulator">Open simulator</Link>
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Caller</TableHead>
                  <TableHead>Last message</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Booking</TableHead>
                  <TableHead>Human handoff</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversations.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      {c.callerName ?? c.callerPhone ?? c.callerEmail ?? "Anonymous"}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <span className="line-clamp-2 text-sm text-muted-foreground">
                        {c.messages[0]?.content ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{c.channel}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          c.status === "escalated"
                            ? "warning"
                            : c.status === "resolved"
                              ? "success"
                              : "secondary"
                        }
                      >
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c._count.bookings > 0 ? `${c._count.bookings} booked` : "—"}
                    </TableCell>
                    <TableCell className="max-w-[160px] text-xs text-muted-foreground">
                      {c.status === "escalated" && c.escalatedReason ? (
                        <span className="line-clamp-2" title={c.escalatedReason}>
                          {c.escalatedReason}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(c.startedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/app/conversations/${c.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
