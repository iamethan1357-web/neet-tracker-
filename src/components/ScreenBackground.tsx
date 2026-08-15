"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ScreenBackgroundProps {
  src: string;
  /** 0–1 darkness of the readability overlay (default 0.35) */
  overlay?: number;
}

/**
 * Full-screen image background. When `src` changes (e.g. user switches
 * tabs), the old image crossfades into the new one.
 */
export default function ScreenBackground({ src, overlay = 0.35 }: ScreenBackgroundProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-black">
      <AnimatePresence>
        <motion.img
          key={src}
          src={src}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          onLoad={() => setLoaded(true)}
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
