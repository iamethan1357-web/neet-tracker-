"use client";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { getDailyQuote } from "@/lib/quotes";

interface DailyLog {
  id?: number;
  date: string;
  physicsStudy: boolean;
  chemistryStudy: boolean;
  botanyStudy: boolean;
  zoologyStudy: boolean;
  questionsPracticed: number;
  coachingHours: number;
  waterIntake: number;
  sleepHours: number;
  physicsTime: number;
  chemistryTime: number;
  botanyTime: number;
  zoologyTime: number;
  physicsQuestions: number;
  chemistryQuestions: number;
  botanyQuestions: number;
  zoologyQuestions: number;
  focusMinutes: number;
  completed: boolean;
}

const defaultLog: DailyLog = {
  date: new Date().toISOString().split("T")[0],
  physicsStudy: false,
  chemistryStudy: false,
  botanyStudy: false,
  zoologyStudy: false,
  questionsPracticed: 0,
  coachingHours: 6,
  waterIntake: 0,
  sleepHours: 0,
  physicsTime: 0,
  chemistryTime: 0,
  botanyTime: 0,
  zoologyTime: 0,
  physicsQuestions: 0,
  chemistryQuestions: 0,
  botanyQuestions: 0,
  zoologyQuestions: 0,
  focusMinutes: 0,
  completed: false,
};

export default function Dashboard({ user }: { user: Record<string, unknown> }) {
  const [log, setLog] = useState<DailyLog>(defaultLog);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [saving, setSaving] = useState(false);
  const today = new Date();
  const neetDate = new Date("2027-05-03");
  const daysUntilNeet = Math.ceil((neetDate.getTime() - today.getTime()) / 86400000);

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const loadToday = useCallback(async () => {
    try {
      const dateStr = today.toISOString().split("T")[0];
      const data = await apiFetch(`/api/daily?date=${dateStr}`);
      if (data) setLog(data);
    } catch { /* ignore */ }
  }, []);

  const loadStreak = useCallback(async () => {
    try {
      const data = await apiFetch("/api/daily");
      if (!Array.isArray(data)) return;

      let currentStreak = 0;
      let maxStreak = 0;
      let tempStreak = 0;
      const sortedLogs = data.sort((a: DailyLog, b: DailyLog) => b.date.localeCompare(a.date));

      for (let i = 0; i < sortedLogs.length; i++) {
        const logDate = new Date(sortedLogs[i].date);
        const expected = new Date(today);
        expected.setDate(expected.getDate() - i);
        if (logDate.toISOString().split("T")[0] === expected.toISOString().split("T")[0] && sortedLogs[i].completed) {
          currentStreak++;
        } else if (i === 0 && !sortedLogs[i].completed) {
          break;
        } else {
          break;
        }
      }

      for (const l of sortedLogs) {
        if (l.completed) {
          tempStreak++;
          maxStreak = Math.max(maxStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      setStreak(currentStreak);
      setLongestStreak(maxStreak);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    loadToday();
    loadStreak();
  }, [loadToday, loadStreak]);

  const saveLog = async (updated: DailyLog) => {
    setSaving(true);
    try {
      const data = await apiFetch("/api/daily", {
        method: "POST",
        body: JSON.stringify({ ...updated, date: today.toISOString().split("T")[0] }),
      });
      setLog(data);
    } catch { /* ignore */ }
    setSaving(false);
  };

  const toggleSubject = (key: keyof DailyLog) => {
    const updated = { ...log, [key]: !log[key] };
    setLog(updated);
    saveLog(updated);
  };

  const updateField = (key: keyof DailyLog, value: number) => {
    const updated = { ...log, [key]: value };
    setLog(updated);
    saveLog(updated);
  };

  const subjects = [
    { key: "physicsStudy" as keyof DailyLog, label: "Physics", icon: "⚡" },
    { key: "chemistryStudy" as keyof DailyLog, label: "Chemistry", icon: "🧪" },
    { key: "botanyStudy" as keyof DailyLog, label: "Botany", icon: "🌿" },
    { key: "zoologyStudy" as keyof DailyLog, label: "Zoology", icon: "🦎" },
  ];

  const completedSubjects = subjects.filter((s) => log[s.key]).length;
  const progressItems = [
    log.physicsStudy,
    log.chemistryStudy,
    log.botanyStudy,
    log.zoologyStudy,
    log.questionsPracticed > 0,
    log.waterIntake >= 4,
    log.sleepHours >= 7,
  ];
  const progress = Math.round((progressItems.filter(Boolean).length / progressItems.length) * 100);

  const waterGlasses = Math.floor(log.waterIntake * 4);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Hello, {(user.name as string) || (user.username as string)} 👋
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {dayNames[today.getDay()]}, {today.getDate()} {monthNames[today.getMonth()]} {today.getFullYear()}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400 uppercase tracking-wider">NEET 2027</div>
          <div className="text-2xl font-bold">{daysUntilNeet}</div>
          <div className="text-xs text-gray-500">days left</div>
        </div>
      </div>

      {/* Quote */}
      <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
        <p className="text-sm text-gray-600 italic">"{getDailyQuote()}"</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-gray-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">{progress}%</div>
          <div className="text-xs text-gray-500 mt-1">Today&apos;s Progress</div>
        </div>
        <div className="border border-gray-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold flex items-center justify-center gap-1">
            {streak} <span className="text-orange-500">🔥</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Current Streak</div>
        </div>
        <div className="border border-gray-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">{longestStreak}</div>
          <div className="text-xs text-gray-500 mt-1">Best Streak</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Daily Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-black rounded-full h-2 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Subject Checklist */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">Study Checklist</h3>
        <div className="grid grid-cols-2 gap-3">
          {subjects.map((s) => (
            <button
              key={s.key}
              onClick={() => toggleSubject(s.key)}
              className={`p-4 rounded-xl border transition-all text-left ${
                log[s.key]
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-gray-200 hover:border-gray-400"
              }`}
            >
              <div className="text-lg mb-1">{s.icon}</div>
              <div className="text-sm font-medium">{s.label}</div>
              <div className="text-xs opacity-70 mt-0.5">{log[s.key] ? "✓ Done" : "Pending"}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Questions */}
      <div className="border border-gray-100 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-medium">Questions Practiced</div>
            <div className="text-xs text-gray-500">Track your daily question count</div>
          </div>
          <div className="text-2xl font-bold">{log.questionsPracticed}</div>
        </div>
        <div className="flex gap-2">
          {[10, 25, 50, 100].map((n) => (
            <button
              key={n}
              onClick={() => updateField("questionsPracticed", (log.questionsPracticed || 0) + n)}
              className="flex-1 py-2 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              +{n}
            </button>
          ))}
          <button
            onClick={() => updateField("questionsPracticed", 0)}
            className="py-2 px-3 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-400"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Water Intake */}
      <div className="border border-gray-100 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-medium">💧 Water Intake</div>
            <div className="text-xs text-gray-500">Target: 4L per day</div>
          </div>
          <div className="text-lg font-bold">{log.waterIntake.toFixed(1)}L</div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 mb-3">
          <div
            className="bg-blue-400 rounded-full h-3 transition-all duration-300"
            style={{ width: `${Math.min((log.waterIntake / 4) * 100, 100)}%` }}
          />
        </div>
        <div className="flex gap-2">
          {[0.25, 0.5, 1].map((n) => (
            <button
              key={n}
              onClick={() => updateField("waterIntake", Math.min(log.waterIntake + n, 6))}
              className="flex-1 py-2 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              +{n}L
            </button>
          ))}
          <button
            onClick={() => updateField("waterIntake", 0)}
            className="py-2 px-3 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-400"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Sleep & Coaching */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-gray-100 rounded-xl p-4">
          <div className="text-sm font-medium mb-2">😴 Sleep Hours</div>
          <div className="text-xs text-gray-500 mb-3">Target: 7-8 hours</div>
          <input
            type="number"
            min="0"
            max="12"
            step="0.5"
            value={log.sleepHours}
            onChange={(e) => updateField("sleepHours", parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
          />
        </div>
        <div className="border border-gray-100 rounded-xl p-4">
          <div className="text-sm font-medium mb-2">📚 Coaching Hours</div>
          <div className="text-xs text-gray-500 mb-3">Default: 6 hours</div>
          <input
            type="number"
            min="0"
            max="12"
            step="0.5"
            value={log.coachingHours}
            onChange={(e) => updateField("coachingHours", parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Study Time per Subject */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">Study Time (hours)</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "physicsTime" as keyof DailyLog, label: "Physics ⚡", qKey: "physicsQuestions" as keyof DailyLog },
            { key: "chemistryTime" as keyof DailyLog, label: "Chemistry 🧪", qKey: "chemistryQuestions" as keyof DailyLog },
            { key: "botanyTime" as keyof DailyLog, label: "Botany 🌿", qKey: "botanyQuestions" as keyof DailyLog },
            { key: "zoologyTime" as keyof DailyLog, label: "Zoology 🦎", qKey: "zoologyQuestions" as keyof DailyLog },
          ].map((s) => (
            <div key={s.key} className="border border-gray-100 rounded-xl p-3">
              <div className="text-xs font-medium mb-2">{s.label}</div>
              <div className="space-y-2">
                <div>
                  <div className="text-[10px] text-gray-400 mb-1">Hours</div>
                  <input
                    type="number"
                    min="0"
                    max="12"
                    step="0.5"
                    value={log[s.key] as number}
                    onChange={(e) => updateField(s.key, parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 mb-1">Questions</div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={log[s.qKey] as number}
                    onChange={(e) => updateField(s.qKey, parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {saving && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-4 py-2 rounded-full">
          Saving...
        </div>
      )}
    </div>
  );
}
