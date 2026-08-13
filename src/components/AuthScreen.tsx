"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SolarSystem from "@/components/SolarSystem";

interface AuthScreenProps {
  onAuth: (token: string, user: Record<string, unknown>) => void;
}

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const body = mode === "login" ? { username, password } : { username, password, name };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onAuth(data.token, data.user);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Solar System Background */}
      <SolarSystem />

      {/* Glassmorphic Form */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9, rotateX: 10 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md mx-4 relative z-10"
        style={{ perspective: "1000px" }}
      >
        <div className="backdrop-blur-xl bg-white/[0.07] border border-white/[0.12] rounded-3xl p-8 shadow-2xl">
          {/* Title */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-block text-5xl mb-3"
              animate={{
                rotateY: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformStyle: "preserve-3d" }}
            >
              🩺
            </motion.div>
            <motion.h1
              className="text-3xl font-bold tracking-tight text-white"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              NEET 2027
            </motion.h1>
            <motion.p
              className="text-white/40 mt-1.5 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Your journey to becoming a doctor starts here
            </motion.p>
            <motion.div
              className="flex items-center justify-center gap-2 mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {["⚡ Physics", "🧪 Chemistry", "🌿 Botany", "🧬 Zoology"].map((s, i) => (
                <motion.span
                  key={s}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1, type: "spring" as const }}
                  className="text-[10px] px-2 py-0.5 bg-white/[0.08] border border-white/[0.08] rounded-full text-white/50"
                >
                  {s}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              onSubmit={handleSubmit}
              className="space-y-4"
              initial={{ opacity: 0, x: mode === "login" ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === "login" ? 30 : -30 }}
              transition={{ duration: 0.3 }}
            >
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/[0.1] transition-all"
                    placeholder="Dr. (Future) Your Name"
                  />
                </motion.div>
              )}
              <div>
                <label className="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-1.5">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/[0.1] transition-all"
                  placeholder="future_doctor"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/[0.1] transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 bg-white text-black rounded-xl font-semibold text-sm disabled:opacity-50 transition-all hover:bg-white/90"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block"
                    >⏳</motion.span>
                    Please wait...
                  </span>
                ) : mode === "login" ? (
                  "Enter the Universe →"
                ) : (
                  "Begin Your Journey →"
                )}
              </motion.button>
            </motion.form>
          </AnimatePresence>

          <motion.p
            className="text-center text-sm text-white/30 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {mode === "login" ? "New aspirant?" : "Already have an account?"}{" "}
            <button
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
              className="text-white/70 font-medium underline underline-offset-4 hover:text-white transition-colors"
            >
              {mode === "login" ? "Create account" : "Sign in"}
            </button>
          </motion.p>
        </div>

        {/* Bottom hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-[10px] text-white/20 mt-4"
        >
          🌌 Move your mouse to interact with the solar system
        </motion.p>
      </motion.div>
    </div>
  );
}
