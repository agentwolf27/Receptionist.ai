"use client";

import { ScrollCinematicBg } from "./scroll-cinematic-bg";

export function LandingScrollShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <ScrollCinematicBg />
      <div className="relative z-10 flex min-h-screen flex-col">{children}</div>
    </div>
  );
}
