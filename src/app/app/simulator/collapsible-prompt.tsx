"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

interface Props {
  systemPrompt: string;
}

/**
 * Disclosure-style wrapper for the system-prompt preview.
 * Open by default on lg+ viewports, collapsed on mobile so it doesn't
 * dominate the scroll. Pure <details>/<summary>, no extra deps.
 */
export function CollapsiblePrompt({ systemPrompt }: Props) {
  // SSR renders open; we re-evaluate after mount so search engines and
  // no-JS users get the full prompt, while real mobile clients see it
  // collapsed once hydrated.
  const [open, setOpen] = useState(true);
  useEffect(() => {
    setOpen(window.matchMedia("(min-width: 1024px)").matches);
  }, []);

  return (
    <details
      className="group"
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted [&::-webkit-details-marker]:hidden">
        <span>
          {open ? "Hide prompt" : "Show full prompt"} · {systemPrompt.length} chars
        </span>
        <ChevronRight className="h-3.5 w-3.5 transition-transform group-open:rotate-90" />
      </summary>
      <pre className="mt-3 max-h-72 overflow-auto rounded-md bg-muted p-3 text-[11px] leading-relaxed">
        {systemPrompt}
      </pre>
    </details>
  );
}
