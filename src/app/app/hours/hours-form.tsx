"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DAYS_OF_WEEK } from "@/lib/utils";
import { saveHoursAction } from "../actions";

interface Hour {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export function HoursForm({
  initial,
  isOnboarding = false,
}: {
  initial: Hour[];
  isOnboarding?: boolean;
}) {
  const router = useRouter();
  const initialMap = new Map(initial.map((h) => [h.dayOfWeek, h]));
  const [rows, setRows] = useState<Hour[]>(
    Array.from({ length: 7 }, (_, dow) =>
      initialMap.get(dow) ?? {
        dayOfWeek: dow,
        openTime: "09:00",
        closeTime: "17:00",
        isClosed: dow === 0 || dow === 6,
      }
    )
  );
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    try {
      await saveHoursAction(formData);
      toast.success("Hours updated");
      if (isOnboarding) {
        router.push("/app/welcome");
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Couldn't save hours");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="space-y-3">
      {rows.map((row) => (
        <div
          key={row.dayOfWeek}
          className="grid grid-cols-[100px_1fr_1fr_auto] items-center gap-3 rounded-lg border p-3"
        >
          <Label className="font-medium">{DAYS_OF_WEEK[row.dayOfWeek]}</Label>
          <Input
            type="time"
            name={`open-${row.dayOfWeek}`}
            value={row.openTime}
            disabled={row.isClosed}
            onChange={(e) =>
              setRows((r) =>
                r.map((x) =>
                  x.dayOfWeek === row.dayOfWeek ? { ...x, openTime: e.target.value } : x
                )
              )
            }
          />
          <Input
            type="time"
            name={`close-${row.dayOfWeek}`}
            value={row.closeTime}
            disabled={row.isClosed}
            onChange={(e) =>
              setRows((r) =>
                r.map((x) =>
                  x.dayOfWeek === row.dayOfWeek ? { ...x, closeTime: e.target.value } : x
                )
              )
            }
          />
          <div className="flex items-center gap-2">
            <Switch
              name={`closed-${row.dayOfWeek}`}
              checked={row.isClosed}
              onCheckedChange={(v) =>
                setRows((r) =>
                  r.map((x) =>
                    x.dayOfWeek === row.dayOfWeek ? { ...x, isClosed: !!v } : x
                  )
                )
              }
            />
            <span className="text-xs text-muted-foreground">
              {row.isClosed ? "Closed" : "Open"}
            </span>
          </div>
        </div>
      ))}
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save hours"}
        </Button>
      </div>
    </form>
  );
}
