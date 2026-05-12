import { CalendarClock } from "lucide-react";
import { getCurrentBusinessOrRedirect } from "@/lib/data/business";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { BookingRowActions } from "./booking-row-actions";

type Booking = Awaited<
  ReturnType<typeof prisma.booking.findMany<{ include: { service: true } }>>
>[number];

function bookingsTable(rows: Booking[], emptyTitle: string, emptyDesc: string) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<CalendarClock className="h-5 w-5" />}
        title={emptyTitle}
        description={emptyDesc}
      />
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>When</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Confirmation</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((b) => (
          <TableRow key={b.id}>
            <TableCell className="font-medium">{b.customerName}</TableCell>
            <TableCell>{b.service?.name ?? "—"}</TableCell>
            <TableCell>{formatDate(b.startsAt)}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {b.customerPhone ?? b.customerEmail ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {b.confirmationSentAt
                ? b.confirmationChannel === "both"
                  ? "SMS + Email sent"
                  : b.confirmationChannel === "email"
                    ? "Email sent"
                    : b.confirmationChannel === "sms"
                      ? "SMS sent"
                      : "Sent"
                : "Pending"}
            </TableCell>
            <TableCell>
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
            </TableCell>
            <TableCell className="text-right">
              <BookingRowActions
                bookingId={b.id}
                status={b.status}
                startsAt={b.startsAt}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default async function BookingsPage() {
  const business = await getCurrentBusinessOrRedirect();
  const all = await prisma.booking.findMany({
    where: { businessId: business.id },
    orderBy: { startsAt: "asc" },
    include: { service: true },
  });

  const now = new Date();
  const upcoming = all.filter(
    (b) => b.status !== "cancelled" && b.status !== "completed" && b.startsAt >= now
  );
  const past = all.filter(
    (b) => b.status === "completed" || (b.status !== "cancelled" && b.startsAt < now)
  );
  const cancelled = all.filter((b) => b.status === "cancelled");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every appointment created by the AI receptionist.
        </p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>All bookings</CardTitle>
          <span className="text-xs text-muted-foreground">
            {all.length} total · {upcoming.length} upcoming
          </span>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upcoming">
            <TabsList>
              <TabsTrigger value="upcoming">
                Upcoming ({upcoming.length})
              </TabsTrigger>
              <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelled ({cancelled.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming">
              {bookingsTable(
                upcoming,
                "No upcoming bookings",
                "When the AI books an appointment, it shows up here."
              )}
            </TabsContent>
            <TabsContent value="past">
              {bookingsTable(
                past,
                "No past bookings",
                "Completed and elapsed bookings will live here."
              )}
            </TabsContent>
            <TabsContent value="cancelled">
              {bookingsTable(
                cancelled,
                "No cancelled bookings",
                "Cancelled appointments stay here for your records."
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
