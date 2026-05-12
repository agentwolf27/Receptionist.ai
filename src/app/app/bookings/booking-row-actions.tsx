"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import {
  cancelBookingAction,
  completeBookingAction,
  rescheduleBookingAction,
} from "@/app/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Props {
  bookingId: string;
  status: string;
  startsAt: Date;
}

/** Build a value for `<input type="datetime-local" />` from a Date. */
function toLocalInputValue(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function BookingRowActions({ bookingId, status, startsAt }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [when, setWhen] = useState(() => toLocalInputValue(new Date(startsAt)));

  const isFinal = status === "cancelled" || status === "completed";

  const run = (label: string, fn: () => Promise<void>) => {
    startTransition(async () => {
      try {
        await fn();
        toast.success(label);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : `Couldn't ${label.toLowerCase()}`);
      }
    });
  };

  return (
    <div className="flex flex-wrap justify-end gap-1">
      <Button
        size="sm"
        variant="ghost"
        disabled={pending || isFinal}
        onClick={() =>
          run("Marked complete", async () => {
            const fd = new FormData();
            fd.append("id", bookingId);
            await completeBookingAction(fd);
          })
        }
      >
        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
        Complete
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="ghost" disabled={pending || isFinal}>
            <Clock className="mr-1 h-3.5 w-3.5" />
            Reschedule
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule booking</DialogTitle>
            <DialogDescription>
              Pick a new date and time. We&apos;ll check it against your business
              hours and existing bookings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reschedule-when">New date and time</Label>
            <Input
              id="reschedule-when"
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" type="button">Cancel</Button>
            </DialogClose>
            <Button
              type="button"
              disabled={pending}
              onClick={() =>
                run("Booking rescheduled", async () => {
                  const fd = new FormData();
                  fd.append("id", bookingId);
                  fd.append("startsAt", when);
                  await rescheduleBookingAction(fd);
                  setOpen(false);
                })
              }
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button
        size="sm"
        variant="ghost"
        className="text-destructive hover:text-destructive"
        disabled={pending || status === "cancelled"}
        onClick={() =>
          run("Booking cancelled", async () => {
            const fd = new FormData();
            fd.append("id", bookingId);
            await cancelBookingAction(fd);
          })
        }
      >
        <XCircle className="mr-1 h-3.5 w-3.5" />
        Cancel
      </Button>
    </div>
  );
}
