import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  DollarSign,
  MessageSquareText,
  PhoneMissed,
  PlaySquare,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { BookingsChart } from "./bookings-chart";

const RANGE_OPTIONS = [
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 },
] as const;
type RangeKey = (typeof RANGE_OPTIONS)[number]["key"];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const user = await requireUser();
  const business = await prisma.business.findUnique({ where: { userId: user.id } });
  const params = await searchParams;
  const range = (RANGE_OPTIONS.find((r) => r.key === params.range) ?? RANGE_OPTIONS[0]) as
    (typeof RANGE_OPTIONS)[number];
  const since = new Date(Date.now() - range.days * 86_400_000);

  if (!business) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <EmptyState
          icon={<Sparkles className="h-5 w-5" />}
          title="Let's get your AI receptionist live"
          description="Set up your business profile to generate your tailored AI receptionist."
          action={
            <Button asChild>
              <Link href="/app/business?onboarding=1">Start setup</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const [
    aiConfig,
    conversationsCount,
    bookingsCount,
    escalated,
    recentConversations,
    upcomingBookings,
    revenue,
    bookingsInRange,
  ] = await Promise.all([
    prisma.aIConfig.findUnique({ where: { businessId: business.id } }),
    prisma.conversation.count({
      where: { businessId: business.id, startedAt: { gte: since } },
    }),
    prisma.booking.count({
      where: { businessId: business.id, createdAt: { gte: since } },
    }),
    prisma.conversation.count({
      where: { businessId: business.id, status: "escalated", startedAt: { gte: since } },
    }),
    prisma.conversation.findMany({
      where: { businessId: business.id },
      orderBy: { startedAt: "desc" },
      take: 5,
      include: { messages: { take: 1, orderBy: { createdAt: "desc" } } },
    }),
    prisma.booking.findMany({
      where: { businessId: business.id, startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 5,
      include: { service: true },
    }),
    prisma.conversation.aggregate({
      where: { businessId: business.id, startedAt: { gte: since } },
      _sum: { estimatedValueCents: true },
    }),
    prisma.booking.findMany({
      where: { businessId: business.id, createdAt: { gte: since } },
      select: { createdAt: true },
    }),
  ]);

  const recoveredCents = revenue._sum.estimatedValueCents ?? 0;

  return (
    <div className="space-y-8">
      {!aiConfig?.onboardingCompleted && (
        <Link
          href="/app/welcome"
          className="flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm transition-colors hover:bg-primary/10"
        >
          <span className="font-medium">
            Finish setting up your receptionist
          </span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s how your AI receptionist performed in the last {range.label.toLowerCase()}.
          </p>
        </div>
        <RangeToggle current={range.key} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<MessageSquareText className="h-4 w-4" />}
          label="Conversations"
          value={conversationsCount.toString()}
        />
        <MetricCard
          icon={<CalendarCheck className="h-4 w-4" />}
          label="Bookings"
          value={bookingsCount.toString()}
        />
        <MetricCard
          icon={<PhoneMissed className="h-4 w-4" />}
          label="Escalations"
          value={escalated.toString()}
        />
        <MetricCard
          icon={<DollarSign className="h-4 w-4" />}
          label="Est. revenue recovered"
          value={formatCurrency(recoveredCents)}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Bookings per day</CardTitle>
          <span className="text-xs text-muted-foreground">
            {bookingsInRange.length} in last {range.label.toLowerCase()}
          </span>
        </CardHeader>
        <CardContent>
          <BookingsChart bookings={bookingsInRange} rangeDays={range.days} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent conversations</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app/conversations">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentConversations.length === 0 ? (
              <EmptyState
                icon={<PlaySquare className="h-5 w-5" />}
                title="No conversations yet"
                description="Try the AI simulator to send your first message."
                action={
                  <Button asChild size="sm">
                    <Link href="/app/simulator">Open simulator</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y">
                {recentConversations.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-3 text-sm">
                    <Link
                      href={`/app/conversations/${c.id}`}
                      className="min-w-0 flex-1 hover:underline"
                    >
                      <p className="truncate font-medium">
                        {c.callerName ?? c.summary ?? "New conversation"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.messages[0]?.content ?? "—"}
                      </p>
                    </Link>
                    <div className="ml-4 flex items-center gap-2">
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
                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        {formatDate(c.startedAt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming bookings</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app/bookings">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length === 0 ? (
              <EmptyState
                icon={<CalendarClock className="h-5 w-5" />}
                title="No upcoming bookings"
                description="When the AI books an appointment, it shows up here."
              />
            ) : (
              <ul className="divide-y">
                {upcomingBookings.map((b) => (
                  <li key={b.id} className="flex items-center justify-between py-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{b.customerName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {b.service?.name ?? "Appointment"} · {formatDate(b.startsAt)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        b.status === "cancelled"
                          ? "destructive"
                          : b.status === "completed"
                            ? "success"
                            : "secondary"
                      }
                    >
                      {b.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RangeToggle({ current }: { current: RangeKey }) {
  return (
    <div className="inline-flex h-9 items-center rounded-lg border bg-background p-1 text-sm">
      {RANGE_OPTIONS.map((opt) => (
        <Link
          key={opt.key}
          href={opt.key === "7d" ? "/app" : `/app?range=${opt.key}`}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-medium transition-colors",
            current === opt.key
              ? "bg-primary text-primary-foreground shadow"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </Link>
      ))}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-sm font-medium">{label}</span>
          {icon}
        </div>
        <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
