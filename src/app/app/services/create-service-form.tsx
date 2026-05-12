"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createServiceAction } from "../actions";

export function CreateServiceForm() {
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    try {
      await createServiceAction(formData);
      toast.success("Service added");
      ref.current?.reset();
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Couldn't add service");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      ref={ref}
      action={onSubmit}
      className="grid items-end gap-3 sm:grid-cols-[1.5fr_1fr_1fr_auto]"
    >
      <div className="space-y-1">
        <Label htmlFor="svc-name">Name</Label>
        <Input id="svc-name" name="name" required placeholder="Teeth cleaning" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="svc-duration">Duration (min)</Label>
        <Input
          id="svc-duration"
          name="durationMinutes"
          type="number"
          min={5}
          defaultValue={30}
          required
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="svc-price">Price ($)</Label>
        <Input
          id="svc-price"
          name="priceDollars"
          type="number"
          step="0.01"
          min={0}
          defaultValue={0}
          required
        />
      </div>
      <Button type="submit" disabled={pending}>
        <Plus className="h-4 w-4" />
        {pending ? "Adding..." : "Add"}
      </Button>
    </form>
  );
}
