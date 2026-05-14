"use client";

import { useEffect, useState } from "react";
import { FlaskConical, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "receptionist-demo-banner-dismissed";

export function DemoSiteBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(STORAGE_KEY) !== "1");
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  return (
    <div className="sticky top-0 z-[60] border-b border-amber-500/30 bg-amber-500/15 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 text-sm sm:px-6">
        <FlaskConical className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
        <p className="min-w-0 flex-1 text-amber-950/90 dark:text-amber-100/90">
          <span className="font-semibold">Demo &amp; testing.</span>{" "}
          This site is a live preview — not production software. See{" "}
          <a href="#demo-expectations" className="font-medium underline underline-offset-2">
            what to expect
          </a>{" "}
          before you rely on it.
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-amber-900/80 hover:bg-amber-500/20 dark:text-amber-100/80"
          onClick={dismiss}
          aria-label="Dismiss demo notice"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
