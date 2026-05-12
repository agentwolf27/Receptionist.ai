"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAppointmentTypeAction } from "../actions";

interface Props {
  services: { id: string; name: string }[];
}

export function CreateAppointmentTypeForm({ services }: Props) {
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    try {
      await createAppointmentTypeAction(formData);
      toast.success("Appointment type added");
      ref.current?.reset();
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Couldn't add appointment type");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      ref={ref}
      action={onSubmit}
      className="grid items-end gap-3 sm:grid-cols-[1.5fr_1fr_1fr_1fr_auto]"
    >
      <div className="space-y-1">
        <Label htmlFor="at-name">Name</Label>
        <Input id="at-name" name="name" required placeholder="New patient consultation" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="at-duration">Duration (min)</Label>
        <Input
          id="at-duration"
          name="durationMinutes"
          type="number"
          min={5}
          defaultValue={30}
          required
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="at-buffer">Buffer (min)</Label>
        <Input
          id="at-buffer"
          name="bufferMinutes"
          type="number"
          min={0}
          defaultValue={0}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="at-service">Service</Label>
        <select
          id="at-service"
          name="serviceId"
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
        >
          <option value="">— None —</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" disabled={pending}>
        <Plus className="h-4 w-4" />
        {pending ? "Adding..." : "Add"}
      </Button>
    </form>
  );
}
