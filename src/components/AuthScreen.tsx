"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScreenBackground from "@/components/ScreenBackground";
import SolarSystem from "@/components/SolarSystem";
import { backgroundImages } from "@/lib/backgrounds";

interface AuthScreenProps {
  onAuth: (token: string, user: Record<string, unknown>) => void;
}

type AuthMode = "login" | "signup" | "forgot";

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLink, setResetLink] = useState("");
  const [bgMode, setBgMode] = useState<"image" | "solar">("image");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onAuth(data.token, data.user);
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) { setError("Email is required"); return; }
    if (!username) { setError("Username is required"); return; }
    if (!password || password.length < 4) { setError("Password must be at least 4 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onAuth(data.token, data.user);
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) { setError("Please enter your email"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); return; }
      setResetSent(true);
      if (data.resetToken) {
        setResetLink(`${window.location.origin}/reset-password?token=${data.resetToken}`);
      }
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError("");
    setResetSent(false);
    setResetLink("");
  };

  const copyResetLink = () => {
    navigator.clipboard.writeText(resetLink);
  };

  const inputClass = "w-full px-4 py-3 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/[0.1] transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background layer */}
      {bgMode === "image" ? <ScreenBackground src={backgroundImages.auth} /> : <SolarSystem />}

      {/* Form layer */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md mx-4 relative z-20"
      >
        <div className="backdrop-blur-xl bg-white/[0.07] border border-white/[0.12] rounded-3xl p-8 shadow-2xl">
          {/* Title */}
          <div className="text-center mb-6">
            <motion.div
              className="inline-block text-5xl mb-3"
              animate={{ rotateY: [0, 360], scale: [1, 1.1, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformStyle: "preserve-3d" }}
            >
              🩺
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight text-white">NEET 2027</h1>
            <p className="text-white/40 mt-1.5 text-sm">
              {mode === "forgot" ? "Reset your password" : "Your journey to becoming a doctor starts here"}
            </p>
            {mode !== "forgot" && (
              <div className="flex items-center justify-center gap-2 mt-3">
                {["⚡ Physics", "🧪 Chemistry", "🌿 Botany", "🧬 Zoology"].map((s, i) => (
                  <motion.span
                    key={s}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.1, type: "spring" as const }}
                    className="text-[10px] px-2 py-0.5 bg-white/[0.08] border border-white/[0.08] rounded-full text-white/50"
                  >{s}</motion.span>
                ))}
              </div>
            )}
          </div>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {/* LOGIN */}
            {mode === "login" && (
              <motion.form key="login" onSubmit={handleLogin} className="space-y-4"
                initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.3 }}>
                <div>
                  <label className="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-1.5">Email or Username</label>
                  <input type="text" value={login} onChange={(e) => setLogin(e.target.value)} className={inputClass} placeholder="your@email.com or username" required />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-1.5">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="••••••••" required />
                </div>
                <div className="text-right">
                  <button type="button" onClick={() => switchMode("forgot")} className="text-[11px] text-white/40 hover:text-white/70 underline underline-offset-4 transition-colors">
                    Forgot password?
                  </button>
                </div>
                <AnimatePresence>
                  {error && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">{error}</motion.p>}
                </AnimatePresence>
                <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(255,255,255,0.1)" }} whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 bg-white text-black rounded-xl font-semibold text-sm disabled:opacity-50 transition-all">
                  {loading ? "Signing in..." : "Enter the Universe →"}
                </motion.button>
              </motion.form>
            )}

            {/* SIGNUP */}
            {mode === "signup" && (
              <motion.form key="signup" onSubmit={handleSignup} className="space-y-3.5"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                <div>
                  <label className="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-1.5">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Dr. (Future) Your Name" />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-1.5">Email <span className="text-red-400">*</span></label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="your@email.com" required />
                  <p className="text-[10px] text-white/25 mt-1">Used for login & password recovery</p>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-1.5">Username <span className="text-red-400">*</span></label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} placeholder="future_doctor" required />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-1.5">Password <span className="text-red-400">*</span></label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="Min 4 characters" required minLength={4} />
                </div>
                <AnimatePresence>
                  {error && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">{error}</motion.p>}
                </AnimatePresence>
                <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(255,255,255,0.1)" }} whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 bg-white text-black rounded-xl font-semibold text-sm disabled:opacity-50 transition-all">
                  {loading ? "Creating account..." : "Begin Your Journey →"}
                </motion.button>
              </motion.form>
            )}

            {/* FORGOT PASSWORD */}
            {mode === "forgot" && (
              <motion.div key="forgot" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                {!resetSent ? (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="text-center mb-2">
                      <div className="text-3xl mb-2">🔐</div>
                      <p className="text-white/50 text-xs">Enter the email linked to your account</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-1.5">Email Address</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="your@email.com" required />
                    </div>
                    <AnimatePresence>
                      {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">{error}</motion.p>}
                    </AnimatePresence>
                    <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="w-full py-3.5 bg-white text-black rounded-xl font-semibold text-sm disabled:opacity-50 transition-all">
                      {loading ? "Sending..." : "Send Reset Link →"}
                    </motion.button>
                  </form>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ duration: 0.5 }} className="text-4xl mb-3 inline-block">📧</motion.div>
                    <h3 className="text-white font-semibold text-lg mb-2">Reset Link Ready!</h3>
                    <p className="text-white/40 text-xs mb-4">Use the link below to reset your password. It expires in 1 hour.</p>
                    {resetLink && (
                      <div className="space-y-3 mb-4">
                        <div className="bg-white/[0.05] border border-white/[0.1] rounded-xl p-3">
                          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Your Reset Link</p>
                          <p className="text-white/70 text-[11px] break-all leading-relaxed font-mono">{resetLink}</p>
                        </div>
                        <div className="flex gap-2">
                          <motion.button onClick={copyResetLink} whileTap={{ scale: 0.95 }} className="flex-1 py-2.5 bg-white/10 text-white rounded-xl text-xs font-medium hover:bg-white/15 transition-all">📋 Copy Link</motion.button>
                          <motion.a href={resetLink} whileTap={{ scale: 0.95 }} className="flex-1 py-2.5 bg-white text-black rounded-xl text-xs font-semibold text-center hover:bg-white/90 transition-all">Reset Now →</motion.a>
                        </div>
                      </div>
                    )}
                    <p className="text-white/25 text-[10px]">💡 In production, this link would be emailed automatically.</p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mode switcher */}
          <div className="text-center text-sm text-white/30 mt-6">
            {mode === "login" && (
              <p>New aspirant?{" "}
                <button onClick={() => switchMode("signup")} className="text-white/70 font-medium underline underline-offset-4 hover:text-white transition-colors">Create account</button>
              </p>
            )}
            {mode === "signup" && (
              <p>Already have an account?{" "}
                <button onClick={() => switchMode("login")} className="text-white/70 font-medium underline underline-offset-4 hover:text-white transition-colors">Sign in</button>
              </p>
            )}
            {mode === "forgot" && (
              <p>Remember your password?{" "}
                <button onClick={() => switchMode("login")} className="text-white/70 font-medium underline underline-offset-4 hover:text-white transition-colors">Sign in</button>
              </p>
            )}
          </div>
        </div>

        {/* Background toggle + hint */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <motion.button
            onClick={() => setBgMode(bgMode === "image" ? "solar" : "image")}
            whileTap={{ scale: 0.9 }}
            className="text-[10px] px-3 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.1] text-white/40 hover:text-white/70 hover:bg-white/[0.12] transition-all"
          >
            {bgMode === "image" ? "🪐 Switch to Solar System" : "🖼️ Switch to Wallpaper"}
          </motion.button>
        </div>
        <p className="text-center text-[10px] text-white/15 mt-2">
          {bgMode === "image" ? "🖼️ Cinematic wallpaper background" : "🌌 Move your mouse to interact"}
        </p>
      </motion.div>
    </div>
  );
}
