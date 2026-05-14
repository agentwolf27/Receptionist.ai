"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function ScrollCinematicBg() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const { scrollY } = useScroll();
  
  // As user scrolls down, the background darkens to put focus on content
  const overlayOpacity = useTransform(scrollY, [0, 1500], [0.1, 0.85]);
  // Slowly move the gradients up as the user scrolls down
  const yOffset1 = useTransform(scrollY, [0, 2000], ["0%", "30%"]);
  const yOffset2 = useTransform(scrollY, [0, 2000], ["0%", "-30%"]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onMq = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onMq);

    return () => mq.removeEventListener("change", onMq);
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
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background" aria-hidden>
      {/* Animated Aurora Blobs */}
      <div className="absolute inset-0 opacity-80 mix-blend-screen dark:mix-blend-lighten filter blur-[100px]">
        {/* Blob 1 */}
        <motion.div
          style={{ y: yOffset1 }}
          animate={{
            x: ["0%", "20%", "-20%", "0%"],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-emerald-500/30"
        />
        {/* Blob 2 */}
        <motion.div
          style={{ y: yOffset2 }}
          animate={{
            x: ["0%", "-25%", "15%", "0%"],
            scale: [1, 0.8, 1.2, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-violet-600/30"
        />
        {/* Blob 3 */}
        <motion.div
          animate={{
            x: ["0%", "15%", "-15%", "0%"],
            y: ["0%", "20%", "-20%", "0%"],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute top-[40%] left-[20%] w-[50%] h-[50%] rounded-full bg-blue-500/20"
        />
      </div>

      {/* Grid Pattern overlay for tech aesthetic */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Scroll darkening overlay */}
      <motion.div 
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
      />
      
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,color-mix(in_oklch,var(--primary)_15%,transparent),transparent)]" />
    </div>
  );
}
