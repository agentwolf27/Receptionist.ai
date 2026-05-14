import { ChevronRight } from "lucide-react";
import { DEMO_HELP_WANTED, DEMO_SITE_CHECKLIST } from "@/lib/marketing/demo-checklist";

export function DemoExpectationsSection() {
  return (
    <section
      id="demo-expectations"
      className="border-t border-border/60 bg-card/40 py-16 backdrop-blur-sm"
    >
      <div className="mx-auto w-full max-w-6xl px-6">
        <h2 className="text-2xl font-semibold tracking-tight">Demo &amp; testing — what to know</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          If you share this link, people should understand what it is (and isn&apos;t). Use the list
          below as your social disclaimer or README blurb.
        </p>

        <ul className="mt-8 space-y-4">
          {DEMO_SITE_CHECKLIST.map((item, i) => (
            <li
              key={item.title}
              className="flex gap-3 rounded-xl border bg-card/70 p-4 shadow-sm backdrop-blur-md transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {i + 1}
              </span>
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
              </div>
            </li>
          ))}
        </ul>

        <details className="group mt-10 rounded-xl border bg-muted/30 backdrop-blur-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
            <span>How you can help make the next version look amazing</span>
            <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90" />
          </summary>
          <ul className="space-y-2 border-t px-4 py-3 text-sm text-muted-foreground">
            {DEMO_HELP_WANTED.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="text-primary" aria-hidden>
                  →
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </section>
  );
}
