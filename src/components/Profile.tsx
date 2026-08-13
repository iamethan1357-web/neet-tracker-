"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";

interface ProfileData { id: number; username: string; name: string; className: string; targetScore: number; weakSubjects: string; }

export default function Profile({ onLogout }: { onLogout: () => void }) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", className: "", targetScore: 720, weakSubjects: "" });
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const data = await apiFetch("/api/auth/profile");
      setProfile(data);
      setForm({ name: data.name || "", className: data.className || "", targetScore: data.targetScore || 720, weakSubjects: data.weakSubjects || "" });
    } catch {}
  }, []);
  useEffect(() => { loadProfile(); }, [loadProfile]);

  const saveProfile = async () => {
    setSaving(true);
    try { const data = await apiFetch("/api/auth/profile", { method: "PUT", body: JSON.stringify(form) }); setProfile(data); setEditing(false); } catch {}
    setSaving(false);
  };

  if (!profile) return (
    <div className="space-y-4 py-8">
      {[1,2,3].map((i) => <div key={i} className="h-16 animate-shimmer rounded-xl" />)}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Avatar & Name */}
      <motion.div className="text-center pt-4" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
        <motion.div
          className="w-24 h-24 bg-black text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto shadow-lg"
          whileHover={{ scale: 1.05, rotate: 2 }}
        >
          {(profile.name || profile.username).charAt(0).toUpperCase()}
        </motion.div>
        <motion.h3 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-xl font-bold mt-4">
          {profile.name || profile.username}
        </motion.h3>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-sm text-gray-400">
          @{profile.username}
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="inline-flex items-center gap-1 mt-2 text-xs px-3 py-1 bg-gray-100 rounded-full text-gray-500">
          🩺 Future Doctor
        </motion.div>
      </motion.div>

      <AnimatePresence mode="wait">
        {editing ? (
          <motion.div key="edit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black/5" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Class / Year</label>
              <input value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} placeholder="e.g., 12th / Dropper / 1st Year"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black/5" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">NEET Target Score</label>
              <input type="number" value={form.targetScore} onChange={(e) => setForm({ ...form, targetScore: parseInt(e.target.value) || 720 })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black/5" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Weak Subjects</label>
              <input value={form.weakSubjects} onChange={(e) => setForm({ ...form, weakSubjects: e.target.value })} placeholder="e.g., Organic Chemistry, Optics"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black/5" />
            </div>
            <div className="flex gap-2">
              <motion.button onClick={saveProfile} disabled={saving} whileTap={{ scale: 0.98 }}
                className="flex-1 py-3.5 bg-black text-white rounded-xl text-sm font-medium disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </motion.button>
              <motion.button onClick={() => setEditing(false)} whileTap={{ scale: 0.98 }} className="flex-1 py-3.5 bg-gray-100 rounded-xl text-sm">Cancel</motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="view" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-3">
            <div className="border border-gray-100 rounded-xl p-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">🏫 Class</div>
                  <div className="text-sm font-medium">{profile.className || "Not set"}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">🎯 Target Score</div>
                  <div className="text-sm font-medium">{profile.targetScore || 720}/720</div>
                </div>
                <div className="col-span-2">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">⚠️ Weak Subjects</div>
                  <div className="text-sm font-medium">{profile.weakSubjects || "Not set"}</div>
                </div>
              </div>
            </div>
            <motion.button onClick={() => setEditing(true)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              ✏️ Edit Profile
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Medical Journey Stats */}
      <div className="border border-gray-100 rounded-xl p-5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">🩺 Your NEET Journey</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-3xl mb-1">🧬</div>
            <div className="text-xs text-gray-500">Biology awaits</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-1">⚗️</div>
            <div className="text-xs text-gray-500">Chemistry mastery</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-1">🔭</div>
            <div className="text-xs text-gray-500">Physics conquest</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-1">🏆</div>
            <div className="text-xs text-gray-500">NEET 2027</div>
          </div>
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
    </motion.div>
  );
}
