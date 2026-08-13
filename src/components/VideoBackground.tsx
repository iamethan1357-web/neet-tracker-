"use client";
import { useState } from "react";

interface VideoBackgroundProps {
  videoId?: string;
}

// User's chosen background video
const DEFAULT_VIDEO_ID = "MseiEBDkT1k";

export default function VideoBackground({ videoId }: VideoBackgroundProps) {
  const vid = videoId || DEFAULT_VIDEO_ID;
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-black">
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 z-10 bg-black/40" />

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

      {/* Vignette edges */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      {/* YouTube iframe — scaled up to cover full screen for Shorts (9:16) */}
      <div
        className="absolute z-0"
        style={{
          top: "50%",
          left: "50%",
          width: "max(300vw, 178vh)",
          height: "max(300vh, 178vw)",
          transform: "translate(-50%, -50%)",
        }}
      >
        <iframe
          src={`https://www.youtube.com/embed/${vid}?autoplay=1&mute=1&loop=1&playlist=${vid}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&iv_load_policy=3&fs=0`}
          className="w-full h-full border-0"
          allow="autoplay; encrypted-media"
          allowFullScreen={false}
          title="Background Video"
          onLoad={() => setLoaded(true)}
          style={{
            pointerEvents: "none",
            opacity: loaded ? 1 : 0,
            transition: "opacity 1.5s ease-in",
          }}
        />
      </div>

      {/* Fallback gradient while video loads */}
      <div
        className="absolute inset-0 z-0 transition-opacity duration-[2s]"
        style={{ opacity: loaded ? 0 : 1 }}
      >
        <div className="w-full h-full bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#000008]" />
        {/* Animated stars fallback */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                width: `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: 0.2 + Math.random() * 0.5,
                animationDuration: `${2 + Math.random() * 4}s`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
