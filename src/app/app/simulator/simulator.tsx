"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Send, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface UIMessage {
  role: "user" | "assistant";
  content: string;
  bookingCreatedId?: string;
}

export function Simulator({ greeting }: { greeting: string }) {
  const router = useRouter();
  const [messages, setMessages] = useState<UIMessage[]>([
    { role: "assistant", content: greeting },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, pending]);

  async function send() {
    const text = input.trim();
    if (!text || pending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setPending(true);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, conversationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed");
      setConversationId(data.conversationId);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.reply,
          bookingCreatedId: data.bookingCreatedId,
        },
      ]);
      if (data.bookingCreatedId) {
        toast.success("Booking created", {
          description: "Saved to your dashboard.",
        });
        router.refresh();
      } else if (data.intent === "escalate") {
        toast.warning("Conversation escalated to a human");
      }
    } catch (err) {
      console.error(err);
      toast.error("Couldn't reach the AI");
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry — I hit an error. Try again." },
      ]);
    } finally {
      setPending(false);
    }
  }

  function reset() {
    setConversationId(undefined);
    setMessages([{ role: "assistant", content: greeting }]);
  }

  return (
    <div className="flex h-[calc(100vh-260px)] flex-col">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-auto pr-1">
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
      <div className="mt-3 flex gap-2 border-t pt-3">
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
