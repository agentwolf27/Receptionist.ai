"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveBusinessAction } from "../actions";

interface BusinessFormProps {
  initial: {
    name: string;
    industry: string | null;
    description: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    timezone: string;
    greeting: string | null;
  } | null;
  isNew: boolean;
}

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
  "UTC",
];

export function BusinessForm({ initial, isNew }: BusinessFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    try {
      await saveBusinessAction(formData);
      toast.success(isNew ? "Business created" : "Business saved");
      router.push(isNew ? "/app/hours?onboarding=1" : "/app/business");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Couldn't save business");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="name">Business name</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={initial?.name ?? ""}
          placeholder="Maple Dental"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <Input
          id="industry"
          name="industry"
          defaultValue={initial?.industry ?? ""}
          placeholder="Dentistry, auto repair, salon..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone</Label>
        <select
          id="timezone"
          name="timezone"
          defaultValue={initial?.timezone ?? "America/New_York"}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initial?.description ?? ""}
          placeholder="Family dentistry serving the Maple Heights neighborhood since 2007..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          defaultValue={initial?.phone ?? ""}
          placeholder="(555) 555-0142"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={initial?.email ?? ""}
          placeholder="hi@business.com"
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          defaultValue={initial?.address ?? ""}
          placeholder="123 Main St, Anywhere, USA"
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="greeting">AI greeting</Label>
        <Textarea
          id="greeting"
          name="greeting"
          rows={2}
          defaultValue={initial?.greeting ?? ""}
          placeholder="Hi! Thanks for calling Maple Dental — how can I help today?"
        />
        <p className="text-xs text-muted-foreground">
          What the AI says first. Leave blank for an auto-generated greeting.
        </p>
      </div>
      <div className="flex justify-end sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : isNew ? "Save and continue" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
