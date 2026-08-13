"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";

interface DayData {
  date: string; completed: boolean; physicsStudy: boolean; chemistryStudy: boolean;
  botanyStudy: boolean; zoologyStudy: boolean; questionsPracticed: number;
  waterIntake: number; sleepHours: number; physicsTime: number; chemistryTime: number;
  botanyTime: number; zoologyTime: number;
}

export default function Calendar() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [logs, setLogs] = useState<Record<string, DayData>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`/api/daily?from=${year}-01-01&to=${year}-12-31`);
      const map: Record<string, DayData> = {};
      if (Array.isArray(data)) data.forEach((d: DayData) => { map[d.date] = d; });
      setLogs(map);
    } catch {}
    setLoading(false);
  }, [year]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const getDaysInMonth = (m: number) => new Date(year, m + 1, 0).getDate();
  const getFirstDayOfMonth = (m: number) => new Date(year, m, 1).getDay();

  const getDayColor = (dateStr: string): string => {
    const log = logs[dateStr];
    const today = new Date().toISOString().split("T")[0];
    if (dateStr > today) return "bg-white text-gray-300";
    if (!log) return dateStr <= today ? "bg-gray-100 text-gray-400" : "bg-white";
    const done = [log.physicsStudy, log.chemistryStudy, log.botanyStudy, log.zoologyStudy].filter(Boolean).length;
    if (log.completed || done >= 3) return "bg-white/20 text-white";
    if (done >= 1) return "bg-gray-500 text-white";
    return "bg-gray-200 text-gray-600";
  };

  const selected = selectedDate ? logs[selectedDate] : null;
  const completedDays = Object.values(logs).filter((l) => l.completed).length;
  const partialDays = Object.values(logs).filter((l) => { const d = [l.physicsStudy, l.chemistryStudy, l.botanyStudy, l.zoologyStudy].filter(Boolean).length; return d > 0 && !l.completed; }).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-1.5">📅 Year Calendar</h3>
        <div className="flex gap-2 items-center">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setYear(year - 1)} className="w-8 h-8 backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-xl text-sm flex items-center justify-center hover:bg-white/[0.1]">←</motion.button>
          <motion.span key={year} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="px-2 font-medium text-sm tabular-nums">{year}</motion.span>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setYear(year + 1)} className="w-8 h-8 backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-xl text-sm flex items-center justify-center hover:bg-white/[0.1]">→</motion.button>
        </div>
      </div>

      <div className="flex gap-4 text-xs text-gray-500 flex-wrap">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-black rounded-sm" /> Completed ({completedDays})</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-gray-500 rounded-sm" /> Partial ({partialDays})</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-gray-200 rounded-sm" /> Missed</div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(12)].map((_, i) => <div key={i} className="h-40 animate-shimmer rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {months.map((month, mi) => {
            const daysInMonth = getDaysInMonth(mi);
            const firstDay = getFirstDayOfMonth(mi);
            return (
              <motion.div key={month} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: mi * 0.04 }}
                className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-xl p-3 card-hover">
                <div className="text-xs font-semibold text-gray-600 mb-2">{month}</div>
                <div className="grid grid-cols-7 gap-0.5">
                  {["S","M","T","W","T","F","S"].map((d, i) => <div key={i} className="text-[8px] text-center text-gray-400 pb-0.5">{d}</div>)}
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${year}-${String(mi + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const isSelected = selectedDate === dateStr;
                    const isToday = dateStr === new Date().toISOString().split("T")[0];
                    return (
                      <motion.button key={day} onClick={() => setSelectedDate(dateStr)} whileHover={{ scale: 1.3 }} whileTap={{ scale: 0.9 }}
                        className={`aspect-square text-[9px] rounded-sm transition-all ${getDayColor(dateStr)} ${isSelected ? "ring-2 ring-black ring-offset-1" : ""} ${isToday ? "ring-1 ring-blue-400" : ""}`}>
                        {day}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selectedDate && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-sm flex items-center gap-1.5">📋 {selectedDate}</h4>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSelectedDate(null)} className="text-gray-400 hover:text-black text-sm text-white/80">✕</motion.button>
            </div>
            {selected ? (
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { label: "Physics", done: selected.physicsStudy, icon: "⚡" },
                  { label: "Chemistry", done: selected.chemistryStudy, icon: "🧪" },
                  { label: "Botany", done: selected.botanyStudy, icon: "🌿" },
                  { label: "Zoology", done: selected.zoologyStudy, icon: "🧬" },
                ].map((s) => (
                  <div key={s.label} className={`flex items-center gap-2 p-2 rounded-lg ${s.done ? "bg-emerald-50" : "bg-gray-50"}`}>
                    <span>{s.icon}</span>
                    <span className={s.done ? "text-emerald-700" : "text-gray-400"}>{s.label}</span>
                    <span className="ml-auto">{s.done ? "✓" : "—"}</span>
                  </div>
                ))}
                <div className="col-span-2 pt-2 border-t border-gray-100 mt-1 space-y-1.5 text-white/60">
                  <div>🧠 Questions: <strong>{selected.questionsPracticed}</strong></div>
                  <div>💧 Water: <strong>{selected.waterIntake}L</strong></div>
                  <div>😴 Sleep: <strong>{selected.sleepHours}h</strong></div>
                  <div>📚 Study: P:{selected.physicsTime}h C:{selected.chemistryTime}h B:{selected.botanyTime}h Z:{selected.zoologyTime}h</div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">No data recorded for this date</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
