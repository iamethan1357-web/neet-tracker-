"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ScreenBackgroundProps {
  srcs: string[];
  /** 0–1 darkness of the readability overlay (default 0.35) */
  overlay?: number;
}

/**
 * Full-screen image background. When the screen changes, the new image
 * crossfades in. Tries each candidate src in order and uses the first
 * image that actually loads.
 */
export default function ScreenBackground({ srcs, overlay = 0.35 }: ScreenBackgroundProps) {
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const currentSrc = srcs[Math.min(fallbackIndex, srcs.length - 1)];

  const handleError = () => {
    setLoaded(false);
    setFallbackIndex((i) => (i + 1 < srcs.length ? i + 1 : i));
  };

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-black">
      <AnimatePresence>
        <motion.img
          key={currentSrc}
          src={currentSrc}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          onLoad={() => setLoaded(true)}
          onError={handleError}
        />
      </AnimatePresence>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 z-10" style={{ backgroundColor: `rgba(0,0,0,${overlay})` }} />

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/25 via-transparent to-black/50" />

      {/* Vignette edges */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.45) 100%)",
        }}
      />
    </div>
  );
}
