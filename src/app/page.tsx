"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuthScreen from "@/components/AuthScreen";
import Dashboard from "@/components/Dashboard";
import Planner from "@/components/Planner";
import Calendar from "@/components/Calendar";
import Stats from "@/components/Stats";
import Profile from "@/components/Profile";
import ScreenBackground from "@/components/ScreenBackground";
import { backgroundImages } from "@/lib/backgrounds";

type Tab = "dashboard" | "planner" | "calendar" | "stats" | "profile";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [loaded, setLoaded] = useState(false);
  const [showBackground, setShowBackground] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      try { setUser(JSON.parse(savedUser)); } catch { /* ignore */ }
    }
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.8, type: "spring" as const }}
        >
          <motion.div
            className="text-6xl mb-4 inline-block"
            animate={{ rotateY: [0, 360], scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformStyle: "preserve-3d" }}
          >
            🩺
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-gray-400"
          >
            Loading your dashboard...
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (!token || !user) {
    return <AuthScreen onAuth={(t, u) => { setToken(t); setUser(u); }} />;
  }

  const tabs: { key: Tab; label: string; icon: string; activeIcon: string }[] = [
    { key: "dashboard", label: "Home", icon: "🏠", activeIcon: "🏥" },
    { key: "planner", label: "Planner", icon: "📋", activeIcon: "📋" },
    { key: "calendar", label: "Calendar", icon: "📅", activeIcon: "📅" },
    { key: "stats", label: "Stats", icon: "📊", activeIcon: "📊" },
    { key: "profile", label: "Profile", icon: "👤", activeIcon: "🧑‍⚕️" },
  ];

  // Each screen (tab) has its own background image — it crossfades
  // automatically when the user switches tabs.
  const activeBackground = backgroundImages[tab];

  return (
    <div className="min-h-screen pb-20 perspective-container relative">
      {/* Screen background image (changes per tab) */}
      {showBackground && <ScreenBackground src={activeBackground} />}

      {/* Top Bar */}
      <motion.header
        initial={{ y: -60, opacity: 0, rotateX: -15 }}
        animate={{ y: 0, opacity: 1, rotateX: 0 }}
        transition={{ type: "spring" as const, stiffness: 100 }}
        className="sticky top-0 bg-black/20 backdrop-blur-md border-b border-white/10 z-40"
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.span
              className="text-lg"
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              style={{ display: "inline-block", transformStyle: "preserve-3d" }}
            >🩺</motion.span>
            <span className="font-bold text-sm tracking-tight text-white">NEET 2027</span>
            <span className="text-[9px] px-1.5 py-0.5 bg-white/10 text-white/60 rounded-full ml-1">MBBS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <motion.button
              onClick={() => setShowBackground(!showBackground)}
              whileTap={{ scale: 0.9 }}
              className={`text-[10px] px-2 py-1 rounded-full transition-all ${showBackground ? "bg-white/20 text-white" : "bg-white/10 text-white/50 hover:bg-white/20"}`}
              title="Toggle background image"
            >
              🖼️
            </motion.button>
            <motion.div
              className="text-xs text-white/60 flex items-center gap-1 ml-1"
              key={tab}
              initial={{ opacity: 0, y: -10, rotateX: -30 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
            >
              {tabs.find((t) => t.key === tab)?.activeIcon}{" "}
              {tabs.find((t) => t.key === tab)?.label}
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 30, rotateX: 5 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: -20, rotateX: -5 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "top center" }}
          >
            {tab === "dashboard" && <Dashboard user={user} />}
            {tab === "planner" && <Planner />}
            {tab === "calendar" && <Calendar />}
            {tab === "stats" && <Stats />}
            {tab === "profile" && <Profile onLogout={() => { setToken(null); setUser(null); }} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-md border-t border-white/10 z-40">
        <div className="max-w-2xl mx-auto flex">
          {tabs.map((t) => (
            <motion.button
              key={t.key}
              onClick={() => setTab(t.key)}
              whileTap={{ scale: 0.85, rotateX: 15 }}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors relative ${
                tab === t.key ? "text-white" : "text-white/40"
              }`}
            >
              <motion.span
                className="text-lg"
                animate={tab === t.key ? {
                  y: [0, -6, 0],
                  rotateY: [0, 180, 360],
                } : {}}
                transition={{ duration: 0.5 }}
                style={{ display: "inline-block", transformStyle: "preserve-3d" }}
              >
                {tab === t.key ? t.activeIcon : t.icon}
              </motion.span>
              <span className="text-[10px] font-medium">{t.label}</span>
              {tab === t.key && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-0 w-6 h-0.5 bg-white rounded-full"
                  transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </nav>
    </div>
  );
}
