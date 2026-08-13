"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";

interface Task { id: number; title: string; description?: string; type: string; priority: string; pinned: boolean; completed: boolean; dueDate?: string; }
interface RevisionTopic { id: number; subject: string; topic: string; status: string; nextReviewDate?: string; reviewCount: number; }
interface Note { id: number; subject: string; title: string; content?: string; }
interface Goal { id: number; title: string; type: string; targetValue?: number; currentValue: number; completed: boolean; dueDate?: string; }

type SubTab = "tasks" | "revision" | "notes" | "goals" | "focus";

export default function Planner() {
  const [subTab, setSubTab] = useState<SubTab>("tasks");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [revisions, setRevisions] = useState<RevisionTopic[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [taskFilter, setTaskFilter] = useState("all");
  const [focusActive, setFocusActive] = useState(false);
  const [focusDuration, setFocusDuration] = useState(25);
  const [focusRemaining, setFocusRemaining] = useState(0);
  const [totalFocused, setTotalFocused] = useState(0);
  const focusRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", type: "daily", priority: "medium" });
  const [newRevision, setNewRevision] = useState({ subject: "Physics", topic: "" });
  const [newNote, setNewNote] = useState({ subject: "Physics", title: "", content: "" });
  const [newGoal, setNewGoal] = useState({ title: "", type: "daily", targetValue: 0 });

  const loadTasks = useCallback(async () => { try { setTasks(await apiFetch("/api/tasks")); } catch {} }, []);
  const loadRevisions = useCallback(async () => { try { setRevisions(await apiFetch("/api/revision")); } catch {} }, []);
  const loadNotes = useCallback(async () => { try { setNotes(await apiFetch("/api/notes")); } catch {} }, []);
  const loadGoals = useCallback(async () => { try { setGoals(await apiFetch("/api/goals")); } catch {} }, []);
  useEffect(() => { loadTasks(); loadRevisions(); loadNotes(); loadGoals(); }, [loadTasks, loadRevisions, loadNotes, loadGoals]);

  useEffect(() => {
    if (focusActive && focusRemaining > 0) {
      focusRef.current = setInterval(() => {
        setFocusRemaining((r) => {
          if (r <= 1) { setFocusActive(false); setTotalFocused((t) => t + focusDuration); if (focusRef.current) clearInterval(focusRef.current); return 0; }
          return r - 1;
        });
      }, 1000);
      return () => { if (focusRef.current) clearInterval(focusRef.current); };
    }
  }, [focusActive, focusRemaining, focusDuration]);

  const startFocus = () => { setFocusRemaining(focusDuration * 60); setFocusActive(true); };
  const stopFocus = () => { setFocusActive(false); setTotalFocused((t) => t + Math.round((focusDuration * 60 - focusRemaining) / 60)); if (focusRef.current) clearInterval(focusRef.current); setFocusRemaining(0); };
  const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

  const addTask = async () => { if (!newTask.title) return; await apiFetch("/api/tasks", { method: "POST", body: JSON.stringify(newTask) }); setNewTask({ title: "", type: "daily", priority: "medium" }); setShowTaskForm(false); loadTasks(); };
  const toggleTask = async (t: Task) => { await apiFetch("/api/tasks", { method: "PUT", body: JSON.stringify({ ...t, completed: !t.completed }) }); loadTasks(); };
  const pinTask = async (t: Task) => { await apiFetch("/api/tasks", { method: "PUT", body: JSON.stringify({ ...t, pinned: !t.pinned }) }); loadTasks(); };
  const deleteTask = async (id: number) => { await apiFetch(`/api/tasks?id=${id}`, { method: "DELETE" }); loadTasks(); };
  const addRevision = async () => { if (!newRevision.topic) return; await apiFetch("/api/revision", { method: "POST", body: JSON.stringify(newRevision) }); setNewRevision({ subject: "Physics", topic: "" }); setShowRevisionForm(false); loadRevisions(); };
  const reviewTopic = async (r: RevisionTopic) => { await apiFetch("/api/revision", { method: "PUT", body: JSON.stringify({ id: r.id, action: "review" }) }); loadRevisions(); };
  const deleteRevision = async (id: number) => { await apiFetch(`/api/revision?id=${id}`, { method: "DELETE" }); loadRevisions(); };
  const addNote = async () => { if (!newNote.title) return; await apiFetch("/api/notes", { method: "POST", body: JSON.stringify(newNote) }); setNewNote({ subject: "Physics", title: "", content: "" }); setShowNoteForm(false); loadNotes(); };
  const deleteNote = async (id: number) => { await apiFetch(`/api/notes?id=${id}`, { method: "DELETE" }); loadNotes(); };
  const addGoal = async () => { if (!newGoal.title) return; await apiFetch("/api/goals", { method: "POST", body: JSON.stringify(newGoal) }); setNewGoal({ title: "", type: "daily", targetValue: 0 }); setShowGoalForm(false); loadGoals(); };
  const updateGoalProgress = async (g: Goal, val: number) => { await apiFetch("/api/goals", { method: "PUT", body: JSON.stringify({ ...g, currentValue: val, completed: g.targetValue ? val >= g.targetValue : false }) }); loadGoals(); };
  const deleteGoal = async (id: number) => { await apiFetch(`/api/goals?id=${id}`, { method: "DELETE" }); loadGoals(); };

  const filteredTasks = taskFilter === "all" ? tasks : tasks.filter((t) => t.type === taskFilter);
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1; if (!a.pinned && b.pinned) return 1;
    const pr: Record<string, number> = { high: 3, medium: 2, low: 1 };
    return (pr[b.priority] || 0) - (pr[a.priority] || 0);
  });

  const subTabs: { key: SubTab; label: string; icon: string }[] = [
    { key: "tasks", label: "Tasks", icon: "✓" }, { key: "revision", label: "Revision", icon: "🔄" },
    { key: "notes", label: "Notes", icon: "📝" }, { key: "goals", label: "Goals", icon: "🎯" },
    { key: "focus", label: "Focus", icon: "⏱" },
  ];
  const todayStr = new Date().toISOString().split("T")[0];
  const dueRevisions = revisions.filter((r) => r.nextReviewDate && r.nextReviewDate <= todayStr && r.status !== "strong");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Sub-tab nav */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
        {subTabs.map((t) => (
          <motion.button key={t.key} onClick={() => setSubTab(t.key)} whileTap={{ scale: 0.95 }}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${subTab === t.key ? "bg-black text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {t.icon} {t.label}
            {t.key === "revision" && dueRevisions.length > 0 && (
              <span className="ml-1 w-4 h-4 bg-red-500 text-white rounded-full inline-flex items-center justify-center text-[9px]">{dueRevisions.length}</span>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={subTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

          {/* Tasks */}
          {subTab === "tasks" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-1.5">📋 Tasks</h3>
                <motion.button onClick={() => setShowTaskForm(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-xs bg-black text-white px-3 py-1.5 rounded-xl">+ Add</motion.button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {["all", "daily", "weekly", "monthly", "yearly"].map((f) => (
                  <motion.button key={f} onClick={() => setTaskFilter(f)} whileTap={{ scale: 0.95 }}
                    className={`px-3 py-1 rounded-full text-xs capitalize transition-all ${taskFilter === f ? "bg-black text-white" : "bg-gray-100 text-gray-600"}`}>{f}</motion.button>
                ))}
              </div>
              <AnimatePresence>
                {showTaskForm && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="border border-gray-200 rounded-xl p-4 space-y-3 overflow-hidden">
                    <input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="What do you need to do?" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
                    <div className="flex gap-2">
                      <select value={newTask.type} onChange={(e) => setNewTask({ ...newTask, type: e.target.value })} className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm"><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select>
                      <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })} className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm"><option value="high">🔴 High</option><option value="medium">🟡 Medium</option><option value="low">🟢 Low</option></select>
                    </div>
                    <div className="flex gap-2">
                      <motion.button onClick={addTask} whileTap={{ scale: 0.95 }} className="px-4 py-2 bg-black text-white rounded-xl text-xs">Save</motion.button>
                      <motion.button onClick={() => setShowTaskForm(false)} whileTap={{ scale: 0.95 }} className="px-4 py-2 bg-gray-100 rounded-xl text-xs">Cancel</motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="space-y-2">
                <AnimatePresence>
                  {sortedTasks.map((t, i) => (
                    <motion.div key={t.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: i * 0.03 }}
                      className={`flex items-center gap-3 p-3.5 border rounded-xl card-hover ${t.completed ? "border-gray-100 opacity-60" : "border-gray-200"}`}>
                      <motion.button onClick={() => toggleTask(t)} whileTap={{ scale: 0.8 }}
                        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center text-xs flex-shrink-0 transition-all ${t.completed ? "bg-black border-black text-white" : "border-gray-300 hover:border-black"}`}>
                        {t.completed && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.span>}
                      </motion.button>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm ${t.completed ? "line-through" : ""}`}>{t.pinned && "📌 "}{t.title}</div>
                        <div className="flex gap-2 mt-0.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${t.priority === "high" ? "bg-red-50 text-red-600" : t.priority === "medium" ? "bg-yellow-50 text-yellow-600" : "bg-green-50 text-green-600"}`}>{t.priority}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500">{t.type}</span>
                        </div>
                      </div>
                      <motion.button onClick={() => pinTask(t)} whileTap={{ scale: 0.8 }} className="text-gray-400 hover:text-yellow-500 text-sm">📌</motion.button>
                      <motion.button onClick={() => deleteTask(t.id)} whileTap={{ scale: 0.8 }} className="text-gray-300 hover:text-red-500 text-sm">✕</motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {sortedTasks.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                    <div className="text-4xl mb-3 animate-float">📋</div>
                    <p className="text-gray-400 text-sm">No tasks yet. Add your first task!</p>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Revision */}
          {subTab === "revision" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-1.5">🧠 Spaced Repetition</h3>
                <motion.button onClick={() => setShowRevisionForm(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-xs bg-black text-white px-3 py-1.5 rounded-xl">+ Add Topic</motion.button>
              </div>
              {dueRevisions.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4">
                  <div className="text-sm font-medium text-orange-700 mb-2 flex items-center gap-1.5">
                    <span className="animate-heartbeat inline-block">🔔</span> Due for Review ({dueRevisions.length})
                  </div>
                  {dueRevisions.map((r) => (
                    <motion.div key={r.id} whileHover={{ x: 4 }} className="flex items-center justify-between py-2.5 border-b border-orange-100 last:border-0">
                      <div><div className="text-sm">{r.topic}</div><div className="text-xs text-orange-600">{r.subject} · Review #{(r.reviewCount || 0) + 1}</div></div>
                      <motion.button onClick={() => reviewTopic(r)} whileTap={{ scale: 0.95 }} className="text-xs bg-orange-600 text-white px-3 py-1.5 rounded-xl">✓ Reviewed</motion.button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
              <AnimatePresence>
                {showRevisionForm && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="border border-gray-200 rounded-xl p-4 space-y-3 overflow-hidden">
                    <select value={newRevision.subject} onChange={(e) => setNewRevision({ ...newRevision, subject: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"><option>Physics</option><option>Chemistry</option><option>Botany</option><option>Zoology</option></select>
                    <input value={newRevision.topic} onChange={(e) => setNewRevision({ ...newRevision, topic: e.target.value })} placeholder="e.g., Cell Division - Mitosis" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
                    <div className="flex gap-2">
                      <motion.button onClick={addRevision} whileTap={{ scale: 0.95 }} className="px-4 py-2 bg-black text-white rounded-xl text-xs">Save</motion.button>
                      <motion.button onClick={() => setShowRevisionForm(false)} whileTap={{ scale: 0.95 }} className="px-4 py-2 bg-gray-100 rounded-xl text-xs">Cancel</motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">💡 Schedule: 1d → 3d → 7d → 15d → 30d</div>
              <div className="space-y-2">
                {revisions.map((r, i) => (
                  <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between p-3.5 border border-gray-100 rounded-xl card-hover">
                    <div>
                      <div className="text-sm font-medium">{r.topic}</div>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500">{r.subject}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${r.status === "strong" ? "bg-emerald-50 text-emerald-600" : r.status === "revised" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                          {r.status === "not_done" ? "Not Done" : r.status === "revised" ? "Revised" : "💪 Strong"}
                        </span>
                        <span className="text-[10px] text-gray-400">×{r.reviewCount}</span>
                      </div>
                      {r.nextReviewDate && <div className="text-[10px] text-gray-400 mt-0.5">Next: {r.nextReviewDate}</div>}
                    </div>
                    <div className="flex gap-1">
                      <motion.button onClick={() => reviewTopic(r)} whileTap={{ scale: 0.8 }} className="text-xs px-2 py-1 border border-gray-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-200">✓</motion.button>
                      <motion.button onClick={() => deleteRevision(r.id)} whileTap={{ scale: 0.8 }} className="text-xs px-2 py-1 border border-gray-200 rounded-lg hover:bg-red-50 text-red-400">✕</motion.button>
                    </div>
                  </motion.div>
                ))}
                {revisions.length === 0 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12"><div className="text-4xl mb-3 animate-float">🧠</div><p className="text-gray-400 text-sm">Add topics for spaced repetition!</p></motion.div>}
              </div>
            </div>
          )}

          {/* Notes */}
          {subTab === "notes" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-1.5">📝 Quick Notes</h3>
                <motion.button onClick={() => setShowNoteForm(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-xs bg-black text-white px-3 py-1.5 rounded-xl">+ Add</motion.button>
              </div>
              <AnimatePresence>
                {showNoteForm && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="border border-gray-200 rounded-xl p-4 space-y-3 overflow-hidden">
                    <select value={newNote.subject} onChange={(e) => setNewNote({ ...newNote, subject: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"><option>Physics</option><option>Chemistry</option><option>Botany</option><option>Zoology</option></select>
                    <input value={newNote.title} onChange={(e) => setNewNote({ ...newNote, title: e.target.value })} placeholder="e.g., Newton's Laws Formula" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
                    <textarea value={newNote.content} onChange={(e) => setNewNote({ ...newNote, content: e.target.value })} placeholder="F = ma, E = mc²..." rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black resize-none" />
                    <div className="flex gap-2">
                      <motion.button onClick={addNote} whileTap={{ scale: 0.95 }} className="px-4 py-2 bg-black text-white rounded-xl text-xs">Save</motion.button>
                      <motion.button onClick={() => setShowNoteForm(false)} whileTap={{ scale: 0.95 }} className="px-4 py-2 bg-gray-100 rounded-xl text-xs">Cancel</motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="space-y-2">
                {notes.map((n, i) => (
                  <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border border-gray-100 rounded-xl p-4 card-hover">
                    <div className="flex items-start justify-between">
                      <div><div className="text-sm font-medium">{n.title}</div><span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500 inline-block mt-1">{n.subject}</span></div>
                      <motion.button onClick={() => deleteNote(n.id)} whileTap={{ scale: 0.8 }} className="text-gray-300 hover:text-red-500 text-sm">✕</motion.button>
                    </div>
                    {n.content && <p className="text-xs text-gray-600 mt-2 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-2.5">{n.content}</p>}
                  </motion.div>
                ))}
                {notes.length === 0 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12"><div className="text-4xl mb-3 animate-float">📝</div><p className="text-gray-400 text-sm">Save formulas & quick notes here!</p></motion.div>}
              </div>
            </div>
          )}

          {/* Goals */}
          {subTab === "goals" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-1.5">🎯 Goals</h3>
                <motion.button onClick={() => setShowGoalForm(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-xs bg-black text-white px-3 py-1.5 rounded-xl">+ Add</motion.button>
              </div>
              <AnimatePresence>
                {showGoalForm && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="border border-gray-200 rounded-xl p-4 space-y-3 overflow-hidden">
                    <input value={newGoal.title} onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })} placeholder="e.g., Score 600+ in next mock" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
                    <div className="flex gap-2">
                      <select value={newGoal.type} onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })} className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm"><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="neet">🏥 NEET Target</option></select>
                      <input type="number" value={newGoal.targetValue} onChange={(e) => setNewGoal({ ...newGoal, targetValue: parseInt(e.target.value) || 0 })} placeholder="Target" className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm" />
                    </div>
                    <div className="flex gap-2">
                      <motion.button onClick={addGoal} whileTap={{ scale: 0.95 }} className="px-4 py-2 bg-black text-white rounded-xl text-xs">Save</motion.button>
                      <motion.button onClick={() => setShowGoalForm(false)} whileTap={{ scale: 0.95 }} className="px-4 py-2 bg-gray-100 rounded-xl text-xs">Cancel</motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="space-y-2">
                {goals.map((g, i) => (
                  <motion.div key={g.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className={`border rounded-xl p-4 card-hover ${g.completed ? "border-emerald-200 bg-emerald-50" : "border-gray-100"}`}>
                    <div className="flex items-center justify-between">
                      <div><div className="text-sm font-medium">{g.title}</div><span className={`text-[10px] px-1.5 py-0.5 rounded-md mt-1 inline-block ${g.type === "neet" ? "bg-purple-50 text-purple-600" : "bg-gray-100 text-gray-500"}`}>{g.type}</span></div>
                      <motion.button onClick={() => deleteGoal(g.id)} whileTap={{ scale: 0.8 }} className="text-gray-300 hover:text-red-500 text-sm">✕</motion.button>
                    </div>
                    {g.targetValue ? (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1"><span>{g.currentValue} / {g.targetValue}</span><span>{Math.round((g.currentValue / g.targetValue) * 100)}%</span></div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((g.currentValue / g.targetValue) * 100, 100)}%` }} className={`h-2.5 rounded-full ${g.completed ? "bg-emerald-500" : "bg-black"}`} />
                        </div>
                        <input type="number" value={g.currentValue} onChange={(e) => updateGoalProgress(g, parseInt(e.target.value) || 0)} className="mt-2 w-full px-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none" placeholder="Update progress" />
                      </div>
                    ) : (
                      <div className="mt-2">
                        <motion.button onClick={() => updateGoalProgress(g, g.completed ? 0 : 1)} whileTap={{ scale: 0.95 }}
                          className={`text-xs px-3 py-1.5 rounded-xl ${g.completed ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                          {g.completed ? "✓ Completed" : "Mark Complete"}
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                ))}
                {goals.length === 0 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12"><div className="text-4xl mb-3 animate-float">🎯</div><p className="text-gray-400 text-sm">Set goals to track your NEET journey!</p></motion.div>}
              </div>
            </div>
          )}

          {/* Focus Mode */}
          {subTab === "focus" && (
            <div className="space-y-6">
              <h3 className="font-semibold flex items-center gap-1.5">🧘 Focus Mode</h3>
              <AnimatePresence>
                {focusActive && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }} className="text-xs uppercase tracking-[0.3em] mb-6 text-gray-500">
                        🧬 Focus Mode Active · No Distractions
                      </motion.div>
                      <motion.div className="text-8xl font-mono font-bold mb-2 tabular-nums" key={focusRemaining} initial={{ scale: 1.05 }} animate={{ scale: 1 }}>
                        {formatTime(focusRemaining)}
                      </motion.div>
                      <motion.div animate={{ scaleX: [1, 0.3, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-32 h-0.5 bg-white/20 rounded-full mx-auto my-6" />
                      <p className="text-sm text-gray-500 mb-8">Your future patients need you focused.</p>
                      <motion.button onClick={stopFocus} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-8 py-3 border border-gray-700 rounded-xl text-sm hover:bg-gray-900 transition-colors">
                        End Session
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border border-gray-200 rounded-2xl p-8 text-center">
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-5xl mb-4">⏱</motion.div>
                <div className="text-sm text-gray-500 mb-1">Pomodoro Timer</div>
                <div className="text-xs text-gray-400 mb-6">Focused study = better retention 🧠</div>
                <div className="flex justify-center gap-3 mb-8">
                  {[25, 50, 90].map((m) => (
                    <motion.button key={m} onClick={() => setFocusDuration(m)} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
                      className={`px-5 py-2.5 rounded-xl text-sm transition-all ${focusDuration === m ? "bg-black text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                      {m} min
                    </motion.button>
                  ))}
                </div>
                <motion.button onClick={startFocus} whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }} whileTap={{ scale: 0.95 }}
                  className="px-10 py-3.5 bg-black text-white rounded-xl font-medium text-sm">
                  Start Focus →
                </motion.button>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="border border-gray-100 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{totalFocused}</div>
                <div className="text-xs text-gray-500">focused minutes today</div>
              </motion.div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
