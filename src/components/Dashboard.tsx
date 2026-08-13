"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  physicsStudy: false, chemistryStudy: false, botanyStudy: false, zoologyStudy: false,
  questionsPracticed: 0, coachingHours: 6, waterIntake: 0, sleepHours: 0,
  physicsTime: 0, chemistryTime: 0, botanyTime: 0, zoologyTime: 0,
  physicsQuestions: 0, chemistryQuestions: 0, botanyQuestions: 0, zoologyQuestions: 0,
  focusMinutes: 0, completed: false,
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } },
};

export default function Dashboard({ user }: { user: Record<string, unknown> }) {
  const [log, setLog] = useState<DailyLog>(defaultLog);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
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
        } else { break; }
      }
      for (const l of sortedLogs) {
        if (l.completed) { tempStreak++; maxStreak = Math.max(maxStreak, tempStreak); }
        else { tempStreak = 0; }
      }
      setStreak(currentStreak);
      setLongestStreak(maxStreak);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadToday(); loadStreak(); }, [loadToday, loadStreak]);

  const saveLog = async (updated: DailyLog) => {
    setSaving(true);
    try {
      const data = await apiFetch("/api/daily", {
        method: "POST",
        body: JSON.stringify({ ...updated, date: today.toISOString().split("T")[0] }),
      });
      setLog(data);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1500);
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
    { key: "physicsStudy" as keyof DailyLog, label: "Physics", icon: "⚡", desc: "Mechanics, Optics, Thermo..." },
    { key: "chemistryStudy" as keyof DailyLog, label: "Chemistry", icon: "🧪", desc: "Organic, Inorganic, Physical..." },
    { key: "botanyStudy" as keyof DailyLog, label: "Botany", icon: "🌿", desc: "Plant Anatomy, Ecology..." },
    { key: "zoologyStudy" as keyof DailyLog, label: "Zoology", icon: "🧬", desc: "Human Physio, Genetics..." },
  ];

  const progressItems = [
    log.physicsStudy, log.chemistryStudy, log.botanyStudy, log.zoologyStudy,
    log.questionsPracticed > 0, log.waterIntake >= 4, log.sleepHours >= 7,
  ];
  const progress = Math.round((progressItems.filter(Boolean).length / progressItems.length) * 100);

  const glass = "backdrop-blur-xl bg-white/[0.08] border border-white/[0.12]";
  const glassInput = "w-full px-3 py-2.5 bg-white/[0.08] border border-white/[0.12] rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.12]";
  const glassInputSm = "w-full px-2 py-1.5 bg-white/[0.08] border border-white/[0.12] rounded-lg text-white text-xs placeholder-white/30 focus:outline-none focus:border-white/30";
  const glassBtn = "border border-white/[0.15] rounded-xl hover:bg-white/[0.1] transition-colors font-medium text-white/80";

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-white drop-shadow-lg">
            Hello, {(user.name as string) || (user.username as string)}
            <motion.span
              animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
              className="inline-block origin-[70%_70%]"
            >👋</motion.span>
          </h2>
          <p className="text-white/60 text-sm mt-1">
            {dayNames[today.getDay()]}, {today.getDate()} {monthNames[today.getMonth()]} {today.getFullYear()}
          </p>
        </div>
        <motion.div
          className={`text-right ${glass} rounded-xl px-4 py-2`}
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-[10px] text-white/50 uppercase tracking-wider flex items-center gap-1">
            <span className="animate-heartbeat inline-block text-red-400 text-xs">♥</span> NEET 2027
          </div>
          <motion.div
            className="text-2xl font-bold tabular-nums text-white"
            key={daysUntilNeet}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {daysUntilNeet}
          </motion.div>
          <div className="text-[10px] text-white/50">days left</div>
        </motion.div>
      </motion.div>

      {/* Quote */}
      <motion.div variants={item} className={`${glass} rounded-xl p-4 relative overflow-hidden`}>
        <div className="absolute top-2 right-3 text-3xl opacity-10">🩺</div>
        <p className="text-sm text-white/70 italic leading-relaxed">&ldquo;{getDailyQuote()}&rdquo;</p>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        <motion.div className={`${glass} rounded-xl p-4 text-center`} whileHover={{ y: -3 }}>
          <motion.div className="text-2xl font-bold text-white" key={progress} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }}>
            {progress}%
          </motion.div>
          <div className="text-[10px] text-white/50 mt-1">Today</div>
        </motion.div>
        <motion.div className={`${glass} rounded-xl p-4 text-center relative`} whileHover={{ y: -3 }}>
          <div className="text-2xl font-bold flex items-center justify-center gap-1 text-white">
            {streak}
            <motion.span className="inline-block animate-fire" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>🔥</motion.span>
          </div>
          <div className="text-[10px] text-white/50 mt-1">Streak</div>
          {streak > 0 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-pulse-ring" />}
        </motion.div>
        <motion.div className={`${glass} rounded-xl p-4 text-center`} whileHover={{ y: -3 }}>
          <div className="text-2xl font-bold text-white">{longestStreak}</div>
          <div className="text-[10px] text-white/50 mt-1">Best</div>
        </motion.div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div variants={item}>
        <div className="flex justify-between text-xs text-white/60 mb-2">
          <span className="flex items-center gap-1">Daily Vitals <span className="text-[10px]">🏥</span></span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="w-full bg-white/[0.1] rounded-full h-3 overflow-hidden">
          <motion.div
            className={`h-3 rounded-full ${progress === 100 ? "bg-emerald-400" : "bg-white/80"}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Subject Checklist */}
      <motion.div variants={item}>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3 flex items-center gap-1.5">
          <span>📋</span> Study Checklist
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {subjects.map((s, i) => (
            <motion.button
              key={s.key}
              onClick={() => toggleSubject(s.key)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`p-4 rounded-xl border transition-all text-left relative overflow-hidden backdrop-blur-xl ${
                log[s.key]
                  ? "bg-white/20 text-white border-white/30"
                  : "bg-white/[0.06] text-white border-white/[0.1] hover:border-white/25"
              }`}
            >
              {log[s.key] && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] animate-tick">✓</motion.div>
              )}
              <div className="text-lg mb-1">{s.icon}</div>
              <div className="text-sm font-medium">{s.label}</div>
              <div className="text-[10px] opacity-60 mt-0.5">{log[s.key] ? "✓ Completed" : s.desc}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Questions */}
      <motion.div variants={item} className={`${glass} rounded-xl p-4`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-medium text-white flex items-center gap-1.5">🧠 Questions Practiced</div>
            <div className="text-[10px] text-white/40">Every question counts towards your rank</div>
          </div>
          <motion.div className="text-2xl font-bold tabular-nums text-white" key={log.questionsPracticed} initial={{ scale: 1.3 }} animate={{ scale: 1 }}>
            {log.questionsPracticed}
          </motion.div>
        </div>
        <div className="flex gap-2">
          {[10, 25, 50, 100].map((n) => (
            <motion.button key={n} onClick={() => updateField("questionsPracticed", (log.questionsPracticed || 0) + n)}
              whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
              className={`flex-1 py-2.5 text-xs ${glassBtn}`}>+{n}</motion.button>
          ))}
          <motion.button onClick={() => updateField("questionsPracticed", 0)} whileTap={{ scale: 0.95 }}
            className="py-2 px-3 text-xs border border-white/[0.1] rounded-xl hover:bg-white/[0.1] transition-colors text-white/40">↺</motion.button>
        </div>
      </motion.div>

      {/* Water Intake */}
      <motion.div variants={item} className={`${glass} rounded-xl p-4 relative overflow-hidden`}>
        <div className="absolute -bottom-4 -right-4 text-6xl opacity-10 rotate-12">💧</div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-medium text-white">💧 Hydration Tracker</div>
            <div className="text-[10px] text-white/40">Target: 4L/day — Stay hydrated, future doc!</div>
          </div>
          <motion.div className="text-lg font-bold text-blue-300" key={log.waterIntake} initial={{ scale: 1.2 }} animate={{ scale: 1 }}>
            {log.waterIntake.toFixed(1)}L
          </motion.div>
        </div>
        <div className="w-full bg-white/[0.1] rounded-full h-4 overflow-hidden mb-3">
          <motion.div className="bg-gradient-to-r from-blue-400 to-blue-300 rounded-full h-4"
            initial={{ width: 0 }} animate={{ width: `${Math.min((log.waterIntake / 4) * 100, 100)}%` }} transition={{ duration: 0.5 }} />
        </div>
        <div className="flex gap-2">
          {[0.25, 0.5, 1].map((n) => (
            <motion.button key={n} onClick={() => updateField("waterIntake", Math.min(log.waterIntake + n, 6))}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex-1 py-2.5 text-xs border border-blue-400/20 rounded-xl hover:bg-blue-400/10 transition-colors font-medium text-blue-300">+{n}L</motion.button>
          ))}
          <motion.button onClick={() => updateField("waterIntake", 0)} whileTap={{ scale: 0.95 }}
            className="py-2 px-3 text-xs border border-white/[0.1] rounded-xl hover:bg-white/[0.1] transition-colors text-white/40">↺</motion.button>
        </div>
      </motion.div>

      {/* Sleep & Coaching */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        <motion.div whileHover={{ y: -2 }} className={`${glass} rounded-xl p-4`}>
          <div className="text-sm font-medium mb-1 text-white flex items-center gap-1">😴 Sleep</div>
          <div className="text-[10px] text-white/40 mb-3">Target: 7-8h for peak cognition</div>
          <input type="number" min="0" max="12" step="0.5" value={log.sleepHours}
            onChange={(e) => updateField("sleepHours", parseFloat(e.target.value) || 0)} className={glassInput} />
          {log.sleepHours > 0 && log.sleepHours < 7 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-amber-300 mt-1.5">⚠ Sleep more for better memory retention</motion.p>
          )}
        </motion.div>
        <motion.div whileHover={{ y: -2 }} className={`${glass} rounded-xl p-4`}>
          <div className="text-sm font-medium mb-1 text-white flex items-center gap-1">🏫 Coaching</div>
          <div className="text-[10px] text-white/40 mb-3">Default: 6 hours</div>
          <input type="number" min="0" max="12" step="0.5" value={log.coachingHours}
            onChange={(e) => updateField("coachingHours", parseFloat(e.target.value) || 0)} className={glassInput} />
        </motion.div>
      </motion.div>

      {/* Study Time per Subject */}
      <motion.div variants={item}>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3 flex items-center gap-1.5">
          <span>⏱</span> Study Time & Questions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "physicsTime" as keyof DailyLog, label: "Physics ⚡", qKey: "physicsQuestions" as keyof DailyLog },
            { key: "chemistryTime" as keyof DailyLog, label: "Chemistry 🧪", qKey: "chemistryQuestions" as keyof DailyLog },
            { key: "botanyTime" as keyof DailyLog, label: "Botany 🌿", qKey: "botanyQuestions" as keyof DailyLog },
            { key: "zoologyTime" as keyof DailyLog, label: "Zoology 🧬", qKey: "zoologyQuestions" as keyof DailyLog },
          ].map((s, i) => (
            <motion.div key={s.key} className={`${glass} rounded-xl p-3`}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
              <div className="text-xs font-medium mb-2 text-white">{s.label}</div>
              <div className="space-y-2">
                <div>
                  <div className="text-[9px] text-white/40 mb-1">Hours</div>
                  <input type="number" min="0" max="12" step="0.5" value={log[s.key] as number}
                    onChange={(e) => updateField(s.key, parseFloat(e.target.value) || 0)} className={glassInputSm} />
                </div>
                <div>
                  <div className="text-[9px] text-white/40 mb-1">Questions</div>
                  <input type="number" min="0" step="1" value={log[s.qKey] as number}
                    onChange={(e) => updateField(s.qKey, parseInt(e.target.value) || 0)} className={glassInputSm} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Save indicator */}
      <AnimatePresence>
        {(saving || justSaved) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50">
            <div className={`text-xs px-4 py-2 rounded-full shadow-lg ${justSaved ? "bg-emerald-500 text-white" : "bg-white/20 backdrop-blur-xl text-white"}`}>
              {justSaved ? "✓ Saved!" : "Saving..."}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
