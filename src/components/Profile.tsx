"use client";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";

interface ProfileData {
  id: number;
  username: string;
  name: string;
  className: string;
  targetScore: number;
  weakSubjects: string;
}

export default function Profile({ onLogout }: { onLogout: () => void }) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", className: "", targetScore: 720, weakSubjects: "" });
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const data = await apiFetch("/api/auth/profile");
      setProfile(data);
      setForm({
        name: data.name || "",
        className: data.className || "",
        targetScore: data.targetScore || 720,
        weakSubjects: data.weakSubjects || "",
      });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const data = await apiFetch("/api/auth/profile", { method: "PUT", body: JSON.stringify(form) });
      setProfile(data);
      setEditing(false);
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onLogout();
  };

  if (!profile) return <div className="text-center text-gray-400 py-8">Loading...</div>;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center pt-4">
        <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
          {(profile.name || profile.username).charAt(0).toUpperCase()}
        </div>
        <h3 className="text-lg font-bold mt-3">{profile.name || profile.username}</h3>
        <p className="text-sm text-gray-500">@{profile.username}</p>
      </div>

      {editing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Class</label>
            <input value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })}
              placeholder="e.g., 12th / Dropper"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Target Score</label>
            <input type="number" value={form.targetScore} onChange={(e) => setForm({ ...form, targetScore: parseInt(e.target.value) || 720 })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Weak Subjects</label>
            <input value={form.weakSubjects} onChange={(e) => setForm({ ...form, weakSubjects: e.target.value })}
              placeholder="e.g., Physics, Organic Chemistry"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black" />
          </div>
          <div className="flex gap-2">
            <button onClick={saveProfile} disabled={saving}
              className="flex-1 py-3 bg-black text-white rounded-lg text-sm font-medium disabled:opacity-50">
              {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setEditing(false)} className="flex-1 py-3 bg-gray-100 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="border border-gray-100 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] text-gray-400 uppercase">Class</div>
                <div className="text-sm font-medium">{profile.className || "Not set"}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 uppercase">Target Score</div>
                <div className="text-sm font-medium">{profile.targetScore || 720}/720</div>
              </div>
              <div className="col-span-2">
                <div className="text-[10px] text-gray-400 uppercase">Weak Subjects</div>
                <div className="text-sm font-medium">{profile.weakSubjects || "Not set"}</div>
              </div>
            </div>
          </div>
          <button onClick={() => setEditing(true)}
            className="w-full py-3 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Edit Profile
          </button>
        </div>
      )}

      <div className="pt-4 border-t border-gray-100">
        <button onClick={handleLogout}
          className="w-full py-3 border border-red-200 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
          Sign Out
        </button>
      </div>

      <div className="text-center text-xs text-gray-300 pt-4">
        NEET 2027 Tracker v1.0
      </div>
    </div>
  );
}
