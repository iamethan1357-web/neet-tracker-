"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { downloadPDF, sharePDF } from "@/lib/generatePdf";

interface DailyLog {
  date: string; physicsStudy: boolean; chemistryStudy: boolean; botanyStudy: boolean; zoologyStudy: boolean;
  physicsTime: number; chemistryTime: number; botanyTime: number; zoologyTime: number;
  physicsQuestions: number; chemistryQuestions: number; botanyQuestions: number; zoologyQuestions: number;
  questionsPracticed: number; waterIntake: number; sleepHours: number; completed: boolean;
}
interface MockTest { id: number; date: string; score: number; totalMarks: number; physicsScore: number; chemistryScore: number; botanyScore: number; zoologyScore: number; mistakes?: string; }
interface UserProfile { name: string; username: string; className?: string; targetScore?: number; }
type SubView = "study" | "tests";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function Stats() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [tests, setTests] = useState<MockTest[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subView, setSubView] = useState<SubView>("study");
  const [showTestForm, setShowTestForm] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [newTest, setNewTest] = useState({ date: new Date().toISOString().split("T")[0], score: 0, totalMarks: 720, physicsScore: 0, chemistryScore: 0, botanyScore: 0, zoologyScore: 0, mistakes: "" });

  const loadData = useCallback(async () => {
    try {
      const [l, t, p] = await Promise.all([apiFetch("/api/daily"), apiFetch("/api/tests"), apiFetch("/api/auth/profile")]);
      if (Array.isArray(l)) setLogs(l); if (Array.isArray(t)) setTests(t); if (p) setProfile(p);
    } catch {}
  }, []);
  useEffect(() => { loadData(); }, [loadData]);

  const calculateStreak = () => {
    const today = new Date(); let streak = 0; let longest = 0; let temp = 0;
    const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
    for (let i = 0; i < sorted.length; i++) {
      const d = new Date(sorted[i].date); const exp = new Date(today); exp.setDate(exp.getDate() - i);
      if (d.toISOString().split("T")[0] === exp.toISOString().split("T")[0] && sorted[i].completed) streak++; else break;
    }
    for (const l of sorted) { if (l.completed) { temp++; longest = Math.max(longest, temp); } else temp = 0; }
    return { streak, longestStreak: longest };
  };
  const { streak, longestStreak } = calculateStreak();

  const handleExportPDF = async () => {
    if (!profile) return; setExporting(true);
    try { downloadPDF({ user: profile, logs, tests, streak, longestStreak }); } catch (e) { console.error(e); }
    setExporting(false);
  };
  const handleSharePDF = async () => {
    if (!profile) return; setExporting(true);
    try {
      const blob = sharePDF({ user: profile, logs, tests, streak, longestStreak });
      const file = new File([blob], `NEET_Progress_${profile.username}.pdf`, { type: "application/pdf" });
      if (navigator.share && navigator.canShare({ files: [file] })) { await navigator.share({ title: "My NEET 2027 Progress", text: "Check my progress!", files: [file] }); }
      else { downloadPDF({ user: profile, logs, tests, streak, longestStreak }); }
    } catch { handleExportPDF(); }
    setExporting(false);
  };

  const getWeeklyData = () => {
    const weeks: { week: string; hours: number; questions: number }[] = []; const now = new Date();
    for (let w = 7; w >= 0; w--) {
      const ws = new Date(now); ws.setDate(ws.getDate() - (w * 7 + now.getDay())); const we = new Date(ws); we.setDate(we.getDate() + 6);
      const wl = logs.filter((l) => l.date >= ws.toISOString().split("T")[0] && l.date <= we.toISOString().split("T")[0]);
      weeks.push({ week: `W${8 - w}`, hours: Math.round(wl.reduce((s, l) => s + (l.physicsTime||0) + (l.chemistryTime||0) + (l.botanyTime||0) + (l.zoologyTime||0), 0) * 10) / 10, questions: wl.reduce((s, l) => s + (l.questionsPracticed||0), 0) });
    }
    return weeks;
  };
  const weeklyData = getWeeklyData();
  const maxHours = Math.max(...weeklyData.map((w) => w.hours), 1);
  const maxQuestions = Math.max(...weeklyData.map((w) => w.questions), 1);

  const tPT = logs.reduce((s, l) => s + (l.physicsTime||0), 0); const tCT = logs.reduce((s, l) => s + (l.chemistryTime||0), 0);
  const tBT = logs.reduce((s, l) => s + (l.botanyTime||0), 0); const tZT = logs.reduce((s, l) => s + (l.zoologyTime||0), 0); const tT = tPT+tCT+tBT+tZT;
  const tPQ = logs.reduce((s, l) => s + (l.physicsQuestions||0), 0); const tCQ = logs.reduce((s, l) => s + (l.chemistryQuestions||0), 0);
  const tBQ = logs.reduce((s, l) => s + (l.botanyQuestions||0), 0); const tZQ = logs.reduce((s, l) => s + (l.zoologyQuestions||0), 0);

  const subjectData = [
    { name: "Physics", icon: "⚡", time: tPT, questions: tPQ, color: "bg-black" },
    { name: "Chemistry", icon: "🧪", time: tCT, questions: tCQ, color: "bg-gray-600" },
    { name: "Botany", icon: "🌿", time: tBT, questions: tBQ, color: "bg-gray-400" },
    { name: "Zoology", icon: "🧬", time: tZT, questions: tZQ, color: "bg-gray-300" },
  ];
  const weakest = subjectData.reduce((a, b) => (a.time + a.questions < b.time + b.questions ? a : b));
  const sortedTests = [...tests].sort((a, b) => a.date.localeCompare(b.date));

  const addTest = async () => { await apiFetch("/api/tests", { method: "POST", body: JSON.stringify(newTest) }); setNewTest({ date: new Date().toISOString().split("T")[0], score: 0, totalMarks: 720, physicsScore: 0, chemistryScore: 0, botanyScore: 0, zoologyScore: 0, mistakes: "" }); setShowTestForm(false); loadData(); };
  const deleteTest = async (id: number) => { await apiFetch(`/api/tests?id=${id}`, { method: "DELETE" }); loadData(); };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Export Buttons */}
      <motion.div variants={item} className="flex gap-2">
        <motion.button onClick={handleExportPDF} disabled={exporting || !profile} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="flex-1 py-3.5 bg-white/20 text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
          {exporting ? "Generating..." : <><span>📄</span> Download PDF</>}
        </motion.button>
        <motion.button onClick={handleSharePDF} disabled={exporting || !profile} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="flex-1 py-3.5 border border-black text-black rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
          {exporting ? "..." : <><span>📤</span> Share</>}
        </motion.button>
      </motion.div>

      <motion.div variants={item} className="flex gap-2">
        {(["study", "tests"] as SubView[]).map((v) => (
          <motion.button key={v} onClick={() => setSubView(v)} whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${subView === v ? "bg-white/20 text-white shadow-md" : "bg-white/[0.08] text-white/60"}`}>
            {v === "study" ? "📊 Study Analytics" : "📝 Test Tracker"}
          </motion.button>
        ))}
      </motion.div>

      {subView === "study" && (
        <>
          {tT > 0 && (
            <motion.div variants={item} className="border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4">
              <div className="text-sm font-medium text-orange-700 flex items-center gap-1.5"><span className="animate-heartbeat inline-block">⚠️</span> Weak Subject: {weakest.name}</div>
              <div className="text-xs text-orange-600 mt-1">Only {weakest.time.toFixed(1)}h and {weakest.questions} questions — needs more focus!</div>
            </motion.div>
          )}

          <motion.div variants={item} className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-xl p-4">
            <h4 className="text-sm font-semibold mb-4 flex items-center gap-1.5">📈 Study Hours / Week</h4>
            <div className="flex items-end gap-2 h-32">
              {weeklyData.map((w, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col justify-end h-24">
                    <motion.div initial={{ height: 0 }} animate={{ height: `${(w.hours / maxHours) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.08 }}
                      className="w-full bg-black rounded-t-md" style={{ minHeight: w.hours > 0 ? 4 : 0 }} />
                  </div>
                  <div className="text-[9px] text-gray-400 mt-1">{w.week}</div>
                  <div className="text-[9px] font-medium">{w.hours}h</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={item} className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-xl p-4">
            <h4 className="text-sm font-semibold mb-4 flex items-center gap-1.5">🧠 Questions Solved / Week</h4>
            <div className="flex items-end gap-2 h-32">
              {weeklyData.map((w, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col justify-end h-24">
                    <motion.div initial={{ height: 0 }} animate={{ height: `${(w.questions / maxQuestions) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.08 }}
                      className="w-full bg-gray-600 rounded-t-md" style={{ minHeight: w.questions > 0 ? 4 : 0 }} />
                  </div>
                  <div className="text-[9px] text-gray-400 mt-1">{w.week}</div>
                  <div className="text-[9px] font-medium">{w.questions}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={item} className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-xl p-4">
            <h4 className="text-sm font-semibold mb-4">🔬 Subject Performance</h4>
            <div className="space-y-3">
              {subjectData.map((s, i) => (
                <motion.div key={s.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="flex items-center gap-1">{s.icon} {s.name}</span>
                    <span className="text-white/50">{s.time.toFixed(1)}h · {s.questions}Q</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: tT > 0 ? `${(s.time / tT) * 100}%` : "0%" }} transition={{ duration: 1, delay: i * 0.15 }}
                      className={`${s.color} rounded-full h-2.5`} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={item} className="grid grid-cols-2 gap-3">
            {[
              { val: `${tT.toFixed(1)}h`, label: "Total Study", icon: "📚" },
              { val: `${tPQ+tCQ+tBQ+tZQ}`, label: "Total Questions", icon: "🧠" },
              { val: `${logs.filter(l=>l.completed).length}`, label: "Completed Days", icon: "✅" },
              { val: `${logs.length}`, label: "Active Days", icon: "📅" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.08 }}
                className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-xl p-4 text-center card-hover">
                <div className="text-[10px] mb-1">{s.icon}</div>
                <motion.div className="text-2xl font-bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{s.val}</motion.div>
                <div className="text-[10px] text-gray-500 mt-0.5">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}

      {subView === "tests" && (
        <>
          <motion.div variants={item} className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-1.5">🏥 Mock Tests</h3>
            <motion.button onClick={() => setShowTestForm(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-xs bg-white/20 text-white px-3 py-1.5 rounded-xl">+ Add Test</motion.button>
          </motion.div>
          {showTestForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-xl p-4 space-y-3 overflow-hidden">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] text-gray-500 uppercase">Date</label><input type="date" value={newTest.date} onChange={(e) => setNewTest({...newTest, date: e.target.value})} className="w-full px-3 py-2 backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-xl text-sm" /></div>
                <div><label className="text-[10px] text-gray-500 uppercase">Total Score</label><input type="number" value={newTest.score} onChange={(e) => setNewTest({...newTest, score: parseInt(e.target.value)||0})} className="w-full px-3 py-2 backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-xl text-sm" /></div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(["physicsScore","chemistryScore","botanyScore","zoologyScore"] as const).map((k) => (
                  <div key={k}><label className="text-[9px] text-gray-500 uppercase">{k.replace("Score","")}</label><input type="number" value={newTest[k]} onChange={(e) => setNewTest({...newTest,[k]:parseInt(e.target.value)||0})} className="w-full px-2 py-1.5 bg-white/[0.08] border border-white/[0.12] rounded text-xs text-white" /></div>
                ))}
              </div>
              <div><label className="text-[10px] text-gray-500 uppercase">Mistakes</label><textarea value={newTest.mistakes} onChange={(e) => setNewTest({...newTest, mistakes: e.target.value})} rows={2} className="w-full px-3 py-2 backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-xl text-sm resize-none" placeholder="Weak areas..." /></div>
              <div className="flex gap-2">
                <motion.button onClick={addTest} whileTap={{ scale: 0.95 }} className="px-4 py-2 bg-white/20 text-white rounded-xl text-xs">Save</motion.button>
                <motion.button onClick={() => setShowTestForm(false)} whileTap={{ scale: 0.95 }} className="px-4 py-2 bg-white/[0.1] rounded-xl text-xs text-white/60">Cancel</motion.button>
              </div>
            </motion.div>
          )}
          {sortedTests.length > 1 && (
            <motion.div variants={item} className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-xl p-4">
              <h4 className="text-sm font-semibold mb-4">📈 Score Trend</h4>
              <div className="flex items-end gap-2 h-32">
                {sortedTests.map((t, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col justify-end h-24">
                      <motion.div initial={{ height: 0 }} animate={{ height: `${(t.score / (t.totalMarks||720)) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="w-full bg-black rounded-t-md" style={{ minHeight: 4 }} />
                    </div>
                    <div className="text-[8px] text-gray-400 mt-1">{t.date.slice(5)}</div>
                    <div className="text-[9px] font-medium">{t.score}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          <div className="space-y-2">
            {tests.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-xl p-4 card-hover">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-bold">{t.score}<span className="text-sm text-white/40">/{t.totalMarks}</span></div>
                    <div className="text-xs text-white/50">{t.date}</div>
                  </div>
                  <motion.button onClick={() => deleteTest(t.id)} whileTap={{ scale: 0.8 }} className="text-white/30 hover:text-red-400 text-sm text-white/80">✕</motion.button>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {[{l:"Phy",v:t.physicsScore},{l:"Chem",v:t.chemistryScore},{l:"Bot",v:t.botanyScore},{l:"Zoo",v:t.zoologyScore}].map((s) => (
                    <div key={s.l} className="text-center bg-gray-50 rounded-lg py-1.5"><div className="text-xs font-medium">{s.v}</div><div className="text-[9px] text-white/40">{s.l}</div></div>
                  ))}
                </div>
                {t.mistakes && <div className="mt-2 pt-2 border-t border-gray-100"><div className="text-[10px] text-gray-400 uppercase mb-1">Mistakes</div><div className="text-xs text-white/60">{t.mistakes}</div></div>}
              </motion.div>
            ))}
            {tests.length === 0 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12"><div className="text-4xl mb-3 animate-float">📝</div><p className="text-white/40 text-sm text-white/80">No test records yet</p></motion.div>}
          </div>
        </>
      )}
    </motion.div>
  );
}
