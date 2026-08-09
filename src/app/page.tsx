"use client";
import { useState, useEffect } from "react";
import AuthScreen from "@/components/AuthScreen";
import Dashboard from "@/components/Dashboard";
import Planner from "@/components/Planner";
import Calendar from "@/components/Calendar";
import Stats from "@/components/Stats";
import Profile from "@/components/Profile";

type Tab = "dashboard" | "planner" | "calendar" | "stats" | "profile";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [loaded, setLoaded] = useState(false);

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
        <div className="text-center">
          <div className="text-4xl mb-3">🎯</div>
          <div className="text-sm text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return (
      <AuthScreen
        onAuth={(t, u) => {
          setToken(t);
          setUser(u);
        }}
      />
    );
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "dashboard", label: "Home", icon: "🏠" },
    { key: "planner", label: "Planner", icon: "📋" },
    { key: "calendar", label: "Calendar", icon: "📅" },
    { key: "stats", label: "Stats", icon: "📊" },
    { key: "profile", label: "Profile", icon: "👤" },
  ];

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Top Bar */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-gray-100 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <span className="font-bold text-sm tracking-tight">NEET 2027</span>
          </div>
          <div className="text-xs text-gray-400">
            {tabs.find((t) => t.key === tab)?.label}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {tab === "dashboard" && <Dashboard user={user} />}
        {tab === "planner" && <Planner />}
        {tab === "calendar" && <Calendar />}
        {tab === "stats" && <Stats />}
        {tab === "profile" && (
          <Profile
            onLogout={() => {
              setToken(null);
              setUser(null);
            }}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40">
        <div className="max-w-2xl mx-auto flex">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors ${
                tab === t.key ? "text-black" : "text-gray-400"
              }`}
            >
              <span className="text-lg">{t.icon}</span>
              <span className="text-[10px] font-medium">{t.label}</span>
              {tab === t.key && <div className="w-1 h-1 bg-black rounded-full" />}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
