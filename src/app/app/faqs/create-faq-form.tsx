"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createFAQAction } from "../actions";

export function CreateFAQForm() {
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    try {
      await createFAQAction(formData);
      toast.success("FAQ added");
      ref.current?.reset();
      router.refresh();
    } catch {
      toast.error("Couldn't add FAQ");
    } finally {
      setPending(false);
    }
  }

  return (
    <form ref={ref} action={onSubmit} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="faq-question">Question</Label>
        <Input
          id="faq-question"
          name="question"
          required
          placeholder="Do you accept walk-ins?"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="faq-answer">Answer</Label>
        <Textarea
          id="faq-answer"
          name="answer"
          rows={3}
          required
          placeholder="Yes! We accept walk-ins Mon-Fri between 9am-3pm. Wait times vary."
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Adding..." : "Add FAQ"}
        </Button>
      </div>
    </form>
  );
}
