"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ScreenBackground from "@/components/ScreenBackground";
import { backgroundImages } from "@/lib/backgrounds";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [valid, setValid] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/reset-password?token=${token}`);
        const data = await res.json();
        setValid(data.valid);
        if (data.email) setMaskedEmail(data.email);
        if (!data.valid) setError(data.error || "Invalid reset link");
      } catch {
        setError("Failed to verify reset link");
      }
      setVerifying(false);
    };
    verify();
  }, [token]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to reset password");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <ScreenBackground src={backgroundImages.reset} />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md mx-4 relative z-10"
      >
        <div className="backdrop-blur-xl bg-white/[0.07] border border-white/[0.12] rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <motion.div
              className="text-4xl mb-3 inline-block"
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              style={{ transformStyle: "preserve-3d", display: "inline-block" }}
            >
              🔐
            </motion.div>
            <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          </div>

          {verifying ? (
            <div className="text-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="text-3xl inline-block mb-3"
              >⏳</motion.div>
              <p className="text-white/40 text-sm">Verifying reset link...</p>
            </div>
          ) : !token ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">❌</div>
              <p className="text-white/60 text-sm mb-4">No reset token found in URL.</p>
              <a href="/" className="text-white/80 underline underline-offset-4 text-sm hover:text-white">
                ← Go to Sign In
              </a>
            </div>
          ) : success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ duration: 0.5 }}
                className="text-5xl mb-4 inline-block"
              >✅</motion.div>
              <h3 className="text-white font-semibold text-lg mb-2">Password Reset!</h3>
              <p className="text-white/50 text-sm mb-6">You can now sign in with your new password.</p>
              <a
                href="/"
                className="inline-block px-6 py-3 bg-white text-black rounded-xl font-semibold text-sm hover:bg-white/90 transition-all"
              >
                Sign In →
              </a>
            </motion.div>
          ) : !valid ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">⏰</div>
              <p className="text-red-400 text-sm mb-2">{error}</p>
              <p className="text-white/40 text-xs mb-4">Reset links expire after 1 hour.</p>
              <a href="/" className="text-white/80 underline underline-offset-4 text-sm hover:text-white">
                ← Request a new reset link
              </a>
            </div>
          ) : (
            <>
              {maskedEmail && (
                <p className="text-center text-white/40 text-sm mb-4">
                  Resetting password for <span className="text-white/70">{maskedEmail}</span>
                </p>
              )}

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/[0.1] transition-all"
                    placeholder="Enter new password"
                    required
                    minLength={4}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/[0.1] transition-all"
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl"
                    >{error}</motion.p>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 bg-white text-black rounded-xl font-semibold text-sm disabled:opacity-50"
                >
                  {loading ? "Resetting..." : "Reset Password →"}
                </motion.button>
              </form>

              <p className="text-center text-white/30 text-sm mt-5">
                <a href="/" className="underline underline-offset-4 hover:text-white/60">← Back to Sign In</a>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white/40 text-sm">Loading...</div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
