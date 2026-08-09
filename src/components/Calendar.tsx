"use client";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";

interface DayData {
  date: string;
  completed: boolean;
  physicsStudy: boolean;
  chemistryStudy: boolean;
  botanyStudy: boolean;
  zoologyStudy: boolean;
  questionsPracticed: number;
  waterIntake: number;
  sleepHours: number;
  physicsTime: number;
  chemistryTime: number;
  botanyTime: number;
  zoologyTime: number;
}

export default function Calendar() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [logs, setLogs] = useState<Record<string, DayData>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const from = `${year}-01-01`;
      const to = `${year}-12-31`;
      const data = await apiFetch(`/api/daily?from=${from}&to=${to}`);
      const map: Record<string, DayData> = {};
      if (Array.isArray(data)) {
        data.forEach((d: DayData) => { map[d.date] = d; });
      }
      setLogs(map);
    } catch { /* ignore */ }
    setLoading(false);
  }, [year]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const getDaysInMonth = (month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number) => new Date(year, month, 1).getDay();

  const getDayColor = (dateStr: string): string => {
    const log = logs[dateStr];
    const today = new Date().toISOString().split("T")[0];
    if (dateStr > today) return "bg-white";
    if (!log) return dateStr <= today ? "bg-gray-100" : "bg-white";

    const subjects = [log.physicsStudy, log.chemistryStudy, log.botanyStudy, log.zoologyStudy];
    const done = subjects.filter(Boolean).length;

    if (log.completed || done >= 3) return "bg-black text-white";
    if (done >= 1) return "bg-gray-400 text-white";
    return "bg-gray-200";
  };

  const selected = selectedDate ? logs[selectedDate] : null;

  const totalDaysWithData = Object.keys(logs).length;
  const completedDays = Object.values(logs).filter((l) => l.completed).length;
  const partialDays = Object.values(logs).filter((l) => {
    const done = [l.physicsStudy, l.chemistryStudy, l.botanyStudy, l.zoologyStudy].filter(Boolean).length;
    return done > 0 && !l.completed;
  }).length;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Year Calendar</h3>
        <div className="flex gap-2">
          <button onClick={() => setYear(year - 1)} className="px-3 py-1 border border-gray-200 rounded-lg text-sm">←</button>
          <span className="px-3 py-1 font-medium text-sm">{year}</span>
          <button onClick={() => setYear(year + 1)} className="px-3 py-1 border border-gray-200 rounded-lg text-sm">→</button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-black rounded-sm" /> Completed ({completedDays})</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-400 rounded-sm" /> Partial ({partialDays})</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-200 rounded-sm" /> Missed</div>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {months.map((month, mi) => {
            const daysInMonth = getDaysInMonth(mi);
            const firstDay = getFirstDayOfMonth(mi);
            return (
              <div key={month} className="border border-gray-100 rounded-xl p-3">
                <div className="text-xs font-semibold text-gray-600 mb-2">{month}</div>
                <div className="grid grid-cols-7 gap-0.5">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <div key={i} className="text-[9px] text-center text-gray-400 pb-0.5">{d}</div>
                  ))}
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${year}-${String(mi + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const colorClass = getDayColor(dateStr);
                    const isSelected = selectedDate === dateStr;
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`aspect-square text-[9px] rounded-sm transition-all ${colorClass} ${isSelected ? "ring-2 ring-black ring-offset-1" : ""}`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected day details */}
      {selectedDate && (
        <div className="border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm">{selectedDate}</h4>
            <button onClick={() => setSelectedDate(null)} className="text-gray-400 text-sm">✕</button>
          </div>
          {selected ? (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${selected.physicsStudy ? "bg-green-500" : "bg-gray-300"}`} />
                Physics
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${selected.chemistryStudy ? "bg-green-500" : "bg-gray-300"}`} />
                Chemistry
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${selected.botanyStudy ? "bg-green-500" : "bg-gray-300"}`} />
                Botany
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${selected.zoologyStudy ? "bg-green-500" : "bg-gray-300"}`} />
                Zoology
              </div>
              <div className="col-span-2 pt-2 border-t border-gray-100 mt-1 space-y-1">
                <div>Questions: {selected.questionsPracticed}</div>
                <div>Water: {selected.waterIntake}L</div>
                <div>Sleep: {selected.sleepHours}h</div>
                <div>Study: P:{selected.physicsTime}h C:{selected.chemistryTime}h B:{selected.botanyTime}h Z:{selected.zoologyTime}h</div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400">No data for this date</p>
          )}
        </div>
      )}
    </div>
  );
}
