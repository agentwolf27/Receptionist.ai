"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, CalendarClock, Send, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { BookingDraft } from "@/lib/providers/types";

interface UIMessage {
  role: "user" | "assistant";
  content: string;
  bookingCreatedId?: string;
}

function formatDraftLine(label: string, value: string | undefined) {
  if (!value?.trim()) return null;
  return (
    <div className="flex justify-between gap-3 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[65%] truncate font-medium text-foreground">{value}</span>
    </div>
  );
}

function BookingDraftPanel({
  draft,
}: {
  draft: Partial<BookingDraft> | null;
}) {
  if (!draft) return null;
  const rows = [
    formatDraftLine("Name", draft.customerName),
    formatDraftLine("Service", draft.serviceName),
    formatDraftLine("Date", draft.preferredDate),
    formatDraftLine("Time", draft.preferredTime),
    formatDraftLine("Phone", draft.customerPhone),
    formatDraftLine("Email", draft.customerEmail),
  ].filter(Boolean);
  if (rows.length === 0) return null;

  return (
    <Card className="border-dashed bg-muted/30 shadow-none">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 py-3">
        <CalendarClock className="h-4 w-4 text-muted-foreground" />
        <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground">
          Booking progress (this chat)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5 pb-3 pt-0">{rows}</CardContent>
    </Card>
  );
}

export function Simulator({ greeting }: { greeting: string }) {
  const router = useRouter();
  const [messages, setMessages] = useState<UIMessage[]>([
    { role: "assistant", content: greeting },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [bookingDraft, setBookingDraft] = useState<Partial<BookingDraft> | null>(null);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, pending, bookingDraft, suggestedReplies.length]);

  async function send(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || pending) return;
    if (!overrideText) setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setPending(true);
    setSuggestedReplies([]);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, conversationId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        conversationId?: string;
        reply?: string;
        bookingCreatedId?: string;
        intent?: string;
        bookingDraft?: Partial<BookingDraft>;
        suggestedReplies?: string[];
      };
      if (!res.ok) {
        const msg = data?.error ?? "Request failed";
        if (res.status === 401) toast.error("Session expired — sign in again.");
        else if (res.status === 404) toast.error("Chat not found — try Reset.");
        else toast.error(msg);
        setMessages((m) => [
          ...m,
          { role: "assistant", content: "Something went wrong. You can try again or hit Reset." },
        ]);
        return;
      }
      setConversationId(data.conversationId);
      setBookingDraft(
        typeof data.bookingDraft === "object" && data.bookingDraft !== null
          ? data.bookingDraft
          : null
      );
      if (Array.isArray(data.suggestedReplies) && data.suggestedReplies.length > 0) {
        setSuggestedReplies(data.suggestedReplies);
      } else {
        setSuggestedReplies([]);
      }
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.reply ?? "",
          bookingCreatedId: data.bookingCreatedId,
        },
      ]);
      if (data.bookingCreatedId) {
        toast.success("Booking created", {
          description: "Saved to your dashboard.",
        });
        router.refresh();
      } else if (data.intent === "escalate") {
        toast.warning("Escalated — your team can follow up in Conversations.");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Couldn't reach the AI");
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry — I hit a network error. Try again." },
      ]);
    } finally {
      setPending(false);
    }
  }

  function reset() {
    setConversationId(undefined);
    setBookingDraft(null);
    setSuggestedReplies([]);
    setMessages([{ role: "assistant", content: greeting }]);
  }

  return (
    <div className="flex h-[calc(100vh-260px)] flex-col gap-3">
      <BookingDraftPanel draft={bookingDraft} />
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-auto pr-1">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "flex w-full items-end gap-2",
              m.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {m.role === "assistant" ? (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bot className="h-3.5 w-3.5" />
              </span>
            ) : null}
            <div
              className={cn(
                "max-w-[78%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm",
                m.role === "user"
                  ? "rounded-br-sm bg-primary text-primary-foreground"
                  : "rounded-bl-sm bg-muted text-foreground"
              )}
            >
              <p className="whitespace-pre-wrap">{m.content}</p>
              {m.bookingCreatedId ? (
                <p className="mt-1 text-[11px] font-medium opacity-80">
                  ✓ Booking confirmed
                </p>
              ) : null}
            </div>
            {m.role === "user" ? (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <User className="h-3.5 w-3.5" />
              </span>
            ) : null}
          </div>
        ))}
        {pending ? (
          <div className="flex items-end gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bot className="h-3.5 w-3.5" />
            </span>
            <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3 text-sm">
              <span className="inline-flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40" />
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {suggestedReplies.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {suggestedReplies.map((s) => (
            <Button
              key={s}
              type="button"
              variant="secondary"
              size="sm"
              className="h-auto max-w-full whitespace-normal rounded-full px-3 py-1.5 text-left text-xs font-normal"
              disabled={pending}
              onClick={() => void send(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      ) : null}

      <div className="mt-auto flex gap-2 border-t pt-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          placeholder="Type a message as if you were a customer..."
          disabled={pending}
        />
        <Button onClick={() => void send()} disabled={pending || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={reset} disabled={pending}>
          Reset
        </Button>
      </div>
    </div>
  );
}
