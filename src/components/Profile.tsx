"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";

interface ProfileData {
  id: number;
  username: string;
  email: string | null;
  name: string;
  className: string;
  targetScore: number;
  weakSubjects: string;
}

export default function Profile({ onLogout }: { onLogout: () => void }) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", className: "", targetScore: 720, weakSubjects: "" });
  const [saving, setSaving] = useState(false);
  const [showEmailBanner, setShowEmailBanner] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      const data = await apiFetch("/api/auth/profile");
      setProfile(data);
      setForm({
        name: data.name || "",
        email: data.email || "",
        className: data.className || "",
        targetScore: data.targetScore || 720,
        weakSubjects: data.weakSubjects || "",
      });
      // Show banner if no email
      if (!data.email) setShowEmailBanner(true);
    } catch {}
  }, []);
  useEffect(() => { loadProfile(); }, [loadProfile]);

  const saveProfile = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || "Failed to save");
        setSaving(false);
        return;
      }
      setProfile(data);
      setEditing(false);
      setShowEmailBanner(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch {
      setSaveError("Network error");
    }
    setSaving(false);
  };

  if (!profile) return (
    <div className="space-y-4 py-8">
      {[1,2,3].map((i) => <div key={i} className="h-16 animate-shimmer rounded-xl" />)}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Email banner for old users */}
      <AnimatePresence>
        {showEmailBanner && !editing && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="border border-amber-200 bg-amber-50 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">📧</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-amber-800">Add Your Email</h4>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                    Add an email to your account to enable password recovery.
                    You can use your email to log in too!
                  </p>
                  <div className="flex gap-2 mt-3">
                    <motion.button
                      onClick={() => setEditing(true)}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-medium"
                    >
                      Add Email Now
                    </motion.button>
                    <motion.button
                      onClick={() => setShowEmailBanner(false)}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-amber-100 text-amber-700 rounded-xl text-xs"
                    >
                      Later
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar & Name */}
      <motion.div className="text-center pt-4" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
        <motion.div
          className="w-24 h-24 bg-white/20 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto shadow-lg"
          whileHover={{ scale: 1.05, rotate: 2 }}
        >
          {(profile.name || profile.username).charAt(0).toUpperCase()}
        </motion.div>
        <motion.h3 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-xl font-bold mt-4">
          {profile.name || profile.username}
        </motion.h3>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-sm text-white/40">
          @{profile.username}
        </motion.p>
        {profile.email && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="text-xs text-gray-400 mt-0.5">
            {profile.email}
          </motion.p>
        )}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="inline-flex items-center gap-1 mt-2 text-xs px-3 py-1 bg-gray-100 rounded-full text-white/50">
          🩺 Future Doctor
        </motion.div>
      </motion.div>

      <AnimatePresence mode="wait">
        {editing ? (
          <motion.div key="edit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-xl text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-black/5" />
            </div>

            {/* Email field - highlighted for old users */}
            <div className={!profile.email ? "p-3 border-2 border-amber-300 rounded-2xl bg-amber-50" : ""}>
              {!profile.email && (
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-sm text-white/80">⭐</span>
                  <span className="text-xs font-semibold text-amber-700">NEW — Add your email</span>
                </div>
              )}
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Email {!profile.email && <span className="text-amber-600">(Recommended)</span>}
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                className="w-full px-4 py-3 backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-xl text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-black/5"
              />
              <p className="text-[10px] text-gray-400 mt-1">Used for login & password recovery</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Class / Year</label>
              <input value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} placeholder="e.g., 12th / Dropper / 1st Year"
                className="w-full px-4 py-3 backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-xl text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-black/5" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">NEET Target Score</label>
              <input type="number" value={form.targetScore} onChange={(e) => setForm({ ...form, targetScore: parseInt(e.target.value) || 720 })}
                className="w-full px-4 py-3 backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-xl text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-black/5" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Weak Subjects</label>
              <input value={form.weakSubjects} onChange={(e) => setForm({ ...form, weakSubjects: e.target.value })} placeholder="e.g., Organic Chemistry, Optics"
                className="w-full px-4 py-3 backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-xl text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-black/5" />
            </div>

            <AnimatePresence>
              {saveError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-xl border border-red-200">
                  {saveError}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="flex gap-2">
              <motion.button onClick={saveProfile} disabled={saving} whileTap={{ scale: 0.98 }}
                className="flex-1 py-3.5 bg-white/20 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </motion.button>
              <motion.button onClick={() => { setEditing(false); setSaveError(""); }} whileTap={{ scale: 0.98 }} className="flex-1 py-3.5 bg-gray-100 rounded-xl text-sm text-white/80">
                Cancel
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="view" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-3">
            <div className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-xl p-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">📧 Email</div>
                  <div className="text-sm font-medium text-white">
                    {profile.email || (
                      <span className="text-amber-500 text-xs">Not set — <button onClick={() => setEditing(true)} className="underline">add now</button></span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">🏫 Class</div>
                  <div className="text-sm font-medium text-white">{profile.className || "Not set"}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">🎯 Target</div>
                  <div className="text-sm font-medium text-white">{profile.targetScore || 720}/720</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">⚠️ Weak</div>
                  <div className="text-sm font-medium text-white">{profile.weakSubjects || "Not set"}</div>
                </div>
              </div>
            </div>
            <motion.button onClick={() => setEditing(true)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-xl text-sm font-medium hover:bg-white/[0.1] transition-colors">
              ✏️ Edit Profile
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Medical Journey */}
      <div className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-xl p-5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">🩺 Your NEET Journey</h4>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: "🧬", text: "Biology awaits" },
            { icon: "⚗️", text: "Chemistry mastery" },
            { icon: "🔭", text: "Physics conquest" },
            { icon: "🏆", text: "NEET 2027" },
          ].map((item) => (
            <div key={item.icon} className="text-center">
              <div className="text-3xl mb-1">{item.icon}</div>
              <div className="text-xs text-white/50">{item.text}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <motion.button onClick={onLogout} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          className="w-full py-3.5 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors">
          Sign Out
        </motion.button>
      </div>

      <div className="text-center text-[10px] text-gray-300 pt-2 pb-4">
        NEET 2027 Study Tracker · Built with ❤️ for future doctors
      </div>

      {/* Save success toast */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white text-xs px-4 py-2 rounded-full shadow-lg"
          >
            ✓ Profile saved!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
