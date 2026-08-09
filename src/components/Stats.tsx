"use client";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";

interface DailyLog {
  date: string;
  physicsTime: number;
  chemistryTime: number;
  botanyTime: number;
  zoologyTime: number;
  physicsQuestions: number;
  chemistryQuestions: number;
  botanyQuestions: number;
  zoologyQuestions: number;
  questionsPracticed: number;
  completed: boolean;
}

interface MockTest {
  id: number;
  date: string;
  score: number;
  totalMarks: number;
  physicsScore: number;
  chemistryScore: number;
  botanyScore: number;
  zoologyScore: number;
  mistakes?: string;
}

type SubView = "study" | "tests";

export default function Stats() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [tests, setTests] = useState<MockTest[]>([]);
  const [subView, setSubView] = useState<SubView>("study");
  const [showTestForm, setShowTestForm] = useState(false);
  const [newTest, setNewTest] = useState({
    date: new Date().toISOString().split("T")[0],
    score: 0,
    totalMarks: 720,
    physicsScore: 0,
    chemistryScore: 0,
    botanyScore: 0,
    zoologyScore: 0,
    mistakes: "",
  });

  const loadData = useCallback(async () => {
    try {
      const [logsData, testsData] = await Promise.all([
        apiFetch("/api/daily"),
        apiFetch("/api/tests"),
      ]);
      if (Array.isArray(logsData)) setLogs(logsData);
      if (Array.isArray(testsData)) setTests(testsData);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Calculate weekly data for last 8 weeks
  const getWeeklyData = () => {
    const weeks: { week: string; hours: number; questions: number }[] = [];
    const now = new Date();
    for (let w = 7; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (w * 7 + now.getDay()));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekLogs = logs.filter((l) => {
        const d = l.date;
        return d >= weekStart.toISOString().split("T")[0] && d <= weekEnd.toISOString().split("T")[0];
      });

      const hours = weekLogs.reduce((s, l) => s + (l.physicsTime || 0) + (l.chemistryTime || 0) + (l.botanyTime || 0) + (l.zoologyTime || 0), 0);
      const questions = weekLogs.reduce((s, l) => s + (l.questionsPracticed || 0), 0);

      weeks.push({
        week: `W${8 - w}`,
        hours: Math.round(hours * 10) / 10,
        questions,
      });
    }
    return weeks;
  };

  const weeklyData = getWeeklyData();
  const maxHours = Math.max(...weeklyData.map((w) => w.hours), 1);
  const maxQuestions = Math.max(...weeklyData.map((w) => w.questions), 1);

  // Subject performance
  const totalPhysicsTime = logs.reduce((s, l) => s + (l.physicsTime || 0), 0);
  const totalChemistryTime = logs.reduce((s, l) => s + (l.chemistryTime || 0), 0);
  const totalBotanyTime = logs.reduce((s, l) => s + (l.botanyTime || 0), 0);
  const totalZoologyTime = logs.reduce((s, l) => s + (l.zoologyTime || 0), 0);
  const totalTime = totalPhysicsTime + totalChemistryTime + totalBotanyTime + totalZoologyTime;

  const totalPhysicsQ = logs.reduce((s, l) => s + (l.physicsQuestions || 0), 0);
  const totalChemistryQ = logs.reduce((s, l) => s + (l.chemistryQuestions || 0), 0);
  const totalBotanyQ = logs.reduce((s, l) => s + (l.botanyQuestions || 0), 0);
  const totalZoologyQ = logs.reduce((s, l) => s + (l.zoologyQuestions || 0), 0);

  const subjectData = [
    { name: "Physics", time: totalPhysicsTime, questions: totalPhysicsQ, color: "bg-black" },
    { name: "Chemistry", time: totalChemistryTime, questions: totalChemistryQ, color: "bg-gray-600" },
    { name: "Botany", time: totalBotanyTime, questions: totalBotanyQ, color: "bg-gray-400" },
    { name: "Zoology", time: totalZoologyTime, questions: totalZoologyQ, color: "bg-gray-300" },
  ];

  const weakest = subjectData.reduce((a, b) => (a.time + a.questions < b.time + b.questions ? a : b));

  // Test analytics
  const sortedTests = [...tests].sort((a, b) => a.date.localeCompare(b.date));
  const maxScore = Math.max(...tests.map((t) => t.score), 1);

  const addTest = async () => {
    await apiFetch("/api/tests", { method: "POST", body: JSON.stringify(newTest) });
    setNewTest({ date: new Date().toISOString().split("T")[0], score: 0, totalMarks: 720, physicsScore: 0, chemistryScore: 0, botanyScore: 0, zoologyScore: 0, mistakes: "" });
    setShowTestForm(false);
    loadData();
  };

  const deleteTest = async (id: number) => {
    await apiFetch(`/api/tests?id=${id}`, { method: "DELETE" });
    loadData();
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setSubView("study")}
          className={`px-4 py-2 rounded-lg text-xs font-medium ${subView === "study" ? "bg-black text-white" : "bg-gray-100 text-gray-600"}`}>
          📊 Study Analytics
        </button>
        <button onClick={() => setSubView("tests")}
          className={`px-4 py-2 rounded-lg text-xs font-medium ${subView === "tests" ? "bg-black text-white" : "bg-gray-100 text-gray-600"}`}>
          📝 Test Tracker
        </button>
      </div>

      {subView === "study" && (
        <>
          {/* Weak Subject */}
          {totalTime > 0 && (
            <div className="border border-orange-200 bg-orange-50 rounded-xl p-4">
              <div className="text-sm font-medium text-orange-700">⚠ Weak Subject Detected</div>
              <div className="text-xs text-orange-600 mt-1">{weakest.name} needs more attention ({weakest.time.toFixed(1)}h, {weakest.questions} questions)</div>
            </div>
          )}

          {/* Weekly Hours Bar Chart */}
          <div className="border border-gray-100 rounded-xl p-4">
            <h4 className="text-sm font-semibold mb-4">Study Hours / Week</h4>
            <div className="flex items-end gap-2 h-32">
              {weeklyData.map((w, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col justify-end h-24">
                    <div
                      className="w-full bg-black rounded-t-sm transition-all"
                      style={{ height: `${(w.hours / maxHours) * 100}%`, minHeight: w.hours > 0 ? 4 : 0 }}
                    />
                  </div>
                  <div className="text-[9px] text-gray-400 mt-1">{w.week}</div>
                  <div className="text-[9px] font-medium">{w.hours}h</div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Questions Bar Chart */}
          <div className="border border-gray-100 rounded-xl p-4">
            <h4 className="text-sm font-semibold mb-4">Questions Solved / Week</h4>
            <div className="flex items-end gap-2 h-32">
              {weeklyData.map((w, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col justify-end h-24">
                    <div
                      className="w-full bg-gray-600 rounded-t-sm transition-all"
                      style={{ height: `${(w.questions / maxQuestions) * 100}%`, minHeight: w.questions > 0 ? 4 : 0 }}
                    />
                  </div>
                  <div className="text-[9px] text-gray-400 mt-1">{w.week}</div>
                  <div className="text-[9px] font-medium">{w.questions}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Performance */}
          <div className="border border-gray-100 rounded-xl p-4">
            <h4 className="text-sm font-semibold mb-4">Subject-wise Performance</h4>
            <div className="space-y-3">
              {subjectData.map((s) => (
                <div key={s.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{s.name}</span>
                    <span className="text-gray-500">{s.time.toFixed(1)}h · {s.questions}Q</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`${s.color} rounded-full h-2 transition-all`}
                      style={{ width: totalTime > 0 ? `${(s.time / totalTime) * 100}%` : "0%" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-gray-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{totalTime.toFixed(1)}h</div>
              <div className="text-xs text-gray-500">Total Study Time</div>
            </div>
            <div className="border border-gray-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{totalPhysicsQ + totalChemistryQ + totalBotanyQ + totalZoologyQ}</div>
              <div className="text-xs text-gray-500">Total Questions</div>
            </div>
            <div className="border border-gray-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{logs.filter((l) => l.completed).length}</div>
              <div className="text-xs text-gray-500">Completed Days</div>
            </div>
            <div className="border border-gray-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{logs.length}</div>
              <div className="text-xs text-gray-500">Active Days</div>
            </div>
          </div>
        </>
      )}

      {subView === "tests" && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Mock Tests</h3>
            <button onClick={() => setShowTestForm(true)} className="text-xs bg-black text-white px-3 py-1.5 rounded-lg">+ Add Test</button>
          </div>

          {showTestForm && (
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase">Date</label>
                  <input type="date" value={newTest.date} onChange={(e) => setNewTest({ ...newTest, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase">Total Score</label>
                  <input type="number" value={newTest.score} onChange={(e) => setNewTest({ ...newTest, score: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(["physicsScore", "chemistryScore", "botanyScore", "zoologyScore"] as const).map((k) => (
                  <div key={k}>
                    <label className="text-[9px] text-gray-500 uppercase">{k.replace("Score", "")}</label>
                    <input type="number" value={newTest[k]} onChange={(e) => setNewTest({ ...newTest, [k]: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none" />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase">Mistakes Analysis</label>
                <textarea value={newTest.mistakes} onChange={(e) => setNewTest({ ...newTest, mistakes: e.target.value })}
                  rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none resize-none"
                  placeholder="Weak chapters, common mistakes..." />
              </div>
              <div className="flex gap-2">
                <button onClick={addTest} className="px-4 py-2 bg-black text-white rounded-lg text-xs">Save</button>
                <button onClick={() => setShowTestForm(false)} className="px-4 py-2 bg-gray-100 rounded-lg text-xs">Cancel</button>
              </div>
            </div>
          )}

          {/* Score Improvement Graph */}
          {sortedTests.length > 1 && (
            <div className="border border-gray-100 rounded-xl p-4">
              <h4 className="text-sm font-semibold mb-4">Score Trend</h4>
              <div className="flex items-end gap-2 h-32">
                {sortedTests.map((t, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col justify-end h-24">
                      <div
                        className="w-full bg-black rounded-t-sm transition-all"
                        style={{ height: `${(t.score / (t.totalMarks || 720)) * 100}%`, minHeight: 4 }}
                      />
                    </div>
                    <div className="text-[8px] text-gray-400 mt-1">{t.date.slice(5)}</div>
                    <div className="text-[9px] font-medium">{t.score}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test List */}
          <div className="space-y-2">
            {tests.map((t) => (
              <div key={t.id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-bold">{t.score}<span className="text-sm text-gray-400">/{t.totalMarks}</span></div>
                    <div className="text-xs text-gray-500">{t.date}</div>
                  </div>
                  <button onClick={() => deleteTest(t.id)} className="text-gray-400 hover:text-red-500 text-sm">✕</button>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-3">
                  <div className="text-center">
                    <div className="text-xs font-medium">{t.physicsScore}</div>
                    <div className="text-[9px] text-gray-400">Phy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium">{t.chemistryScore}</div>
                    <div className="text-[9px] text-gray-400">Chem</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium">{t.botanyScore}</div>
                    <div className="text-[9px] text-gray-400">Bot</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium">{t.zoologyScore}</div>
                    <div className="text-[9px] text-gray-400">Zoo</div>
                  </div>
                </div>
                {t.mistakes && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="text-[10px] text-gray-400 uppercase mb-1">Mistakes</div>
                    <div className="text-xs text-gray-600">{t.mistakes}</div>
                  </div>
                )}
              </div>
            ))}
            {tests.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No test records yet</p>}
          </div>
        </>
      )}
    </div>
  );
}
