"use client";

import { useEffect, useState } from "react";

/** Unsplash — business / workspace imagery (hotlink OK for demos; swap for your own assets in production). */
const LAYERS = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=75",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=75",
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=2000&q=75",
] as const;

function scrollWeights(): [number, number, number] {
  if (typeof document === "undefined") return [1, 0, 0];
  const el = document.documentElement;
  const max = Math.max(1, el.scrollHeight - window.innerHeight);
  const p = Math.min(1, Math.max(0, el.scrollTop / max));
  if (p < 0.5) {
    const w0 = 1 - 2 * p;
    const w1 = 2 * p;
    return [w0, w1, 0];
  }
  const q = p - 0.5;
  const w1 = 1 - 2 * q;
  const w2 = 2 * q;
  return [0, w1, w2];
}

/**
 * Fixed full-viewport layers that crossfade as the user scrolls the page.
 * Optional: replace image URLs with `<video>` in public/ — see comment in map below.
 */
export function ScrollCinematicBg() {
  const [weights, setWeights] = useState<[number, number, number]>([1, 0, 0]);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onMq = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onMq);

    if (mq.matches) {
      return () => mq.removeEventListener("change", onMq);
    }

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setWeights(scrollWeights()));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      mq.removeEventListener("change", onMq);
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (reducedMotion) {
    return (
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(1200px_circle_at_20%_-10%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_55%),radial-gradient(900px_circle_at_90%_20%,color-mix(in_oklch,#10b981_14%,transparent),transparent_50%),var(--background)]"
        aria-hidden
      />
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {LAYERS.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 overflow-hidden"
          style={{
            opacity: weights[i] * 0.58,
            transition: "opacity 140ms ease-out",
          }}
        >
          <div
            className="h-full w-full bg-cover bg-center motion-safe:animate-ken-burns"
            style={{ backgroundImage: `url(${src})` }}
          />
        </div>
      ))}
      {/* To use video instead of an image for layer `i`: place e.g. /public/hero-1.mp4 and render
          <video className="absolute inset-0 h-full w-full object-cover" src="/hero-1.mp4" muted playsInline loop /> */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/55 to-background/92 motion-safe:animate-shimmer-drift" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent)]" />
    </div>
  );
}
