"use client";
import { useEffect, useState } from "react";

interface DashboardVideoProps {
  videoId?: string;
}

const DEFAULT_VIDEO_ID = "Y4uyuzOqXcs";

export default function DashboardVideo({ videoId = DEFAULT_VIDEO_ID }: DashboardVideoProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [videoId]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Very subtle overlay — just enough to read text */}
      <div className="absolute inset-0 z-10 bg-black/20" />

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
          key={videoId}
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&iv_load_policy=3&fs=0`}
          className="w-full h-full border-0"
          allow="autoplay; encrypted-media"
          allowFullScreen={false}
          title="Dashboard Background"
          onLoad={() => setLoaded(true)}
          style={{
            pointerEvents: "none",
            opacity: loaded ? 1 : 0,
            transition: "opacity 2s ease-in",
          }}
        />
      </div>
    </div>
  );
}
