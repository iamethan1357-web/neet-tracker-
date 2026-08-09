"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/api";

interface Task {
  id: number;
  title: string;
  description?: string;
  type: string;
  priority: string;
  pinned: boolean;
  completed: boolean;
  dueDate?: string;
}

interface RevisionTopic {
  id: number;
  subject: string;
  topic: string;
  status: string;
  nextReviewDate?: string;
  reviewCount: number;
}

interface Note {
  id: number;
  subject: string;
  title: string;
  content?: string;
}

interface Goal {
  id: number;
  title: string;
  type: string;
  targetValue?: number;
  currentValue: number;
  completed: boolean;
  dueDate?: string;
}

type SubTab = "tasks" | "revision" | "notes" | "goals" | "focus";

export default function Planner() {
  const [subTab, setSubTab] = useState<SubTab>("tasks");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [revisions, setRevisions] = useState<RevisionTopic[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [taskFilter, setTaskFilter] = useState("all");

  // Focus mode state
  const [focusActive, setFocusActive] = useState(false);
  const [focusDuration, setFocusDuration] = useState(25);
  const [focusRemaining, setFocusRemaining] = useState(0);
  const [totalFocused, setTotalFocused] = useState(0);
  const focusRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Form states
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);

  const [newTask, setNewTask] = useState({ title: "", type: "daily", priority: "medium" });
  const [newRevision, setNewRevision] = useState({ subject: "Physics", topic: "" });
  const [newNote, setNewNote] = useState({ subject: "Physics", title: "", content: "" });
  const [newGoal, setNewGoal] = useState({ title: "", type: "daily", targetValue: 0 });

  const loadTasks = useCallback(async () => { try { const d = await apiFetch("/api/tasks"); setTasks(d); } catch {} }, []);
  const loadRevisions = useCallback(async () => { try { const d = await apiFetch("/api/revision"); setRevisions(d); } catch {} }, []);
  const loadNotes = useCallback(async () => { try { const d = await apiFetch("/api/notes"); setNotes(d); } catch {} }, []);
  const loadGoals = useCallback(async () => { try { const d = await apiFetch("/api/goals"); setGoals(d); } catch {} }, []);

  useEffect(() => { loadTasks(); loadRevisions(); loadNotes(); loadGoals(); }, [loadTasks, loadRevisions, loadNotes, loadGoals]);

  // Focus timer
  useEffect(() => {
    if (focusActive && focusRemaining > 0) {
      focusRef.current = setInterval(() => {
        setFocusRemaining((r) => {
          if (r <= 1) {
            setFocusActive(false);
            setTotalFocused((t) => t + focusDuration);
            if (focusRef.current) clearInterval(focusRef.current);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
      return () => { if (focusRef.current) clearInterval(focusRef.current); };
    }
  }, [focusActive, focusRemaining, focusDuration]);

  const startFocus = () => {
    setFocusRemaining(focusDuration * 60);
    setFocusActive(true);
  };

  const stopFocus = () => {
    setFocusActive(false);
    const elapsed = focusDuration * 60 - focusRemaining;
    setTotalFocused((t) => t + Math.round(elapsed / 60));
    if (focusRef.current) clearInterval(focusRef.current);
    setFocusRemaining(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const addTask = async () => {
    if (!newTask.title) return;
    await apiFetch("/api/tasks", { method: "POST", body: JSON.stringify(newTask) });
    setNewTask({ title: "", type: "daily", priority: "medium" });
    setShowTaskForm(false);
    loadTasks();
  };

  const toggleTask = async (t: Task) => {
    await apiFetch("/api/tasks", { method: "PUT", body: JSON.stringify({ ...t, completed: !t.completed }) });
    loadTasks();
  };

  const pinTask = async (t: Task) => {
    await apiFetch("/api/tasks", { method: "PUT", body: JSON.stringify({ ...t, pinned: !t.pinned }) });
    loadTasks();
  };

  const deleteTask = async (id: number) => {
    await apiFetch(`/api/tasks?id=${id}`, { method: "DELETE" });
    loadTasks();
  };

  const addRevision = async () => {
    if (!newRevision.topic) return;
    await apiFetch("/api/revision", { method: "POST", body: JSON.stringify(newRevision) });
    setNewRevision({ subject: "Physics", topic: "" });
    setShowRevisionForm(false);
    loadRevisions();
  };

  const reviewTopic = async (r: RevisionTopic) => {
    await apiFetch("/api/revision", { method: "PUT", body: JSON.stringify({ id: r.id, action: "review" }) });
    loadRevisions();
  };

  const deleteRevision = async (id: number) => {
    await apiFetch(`/api/revision?id=${id}`, { method: "DELETE" });
    loadRevisions();
  };

  const addNote = async () => {
    if (!newNote.title) return;
    await apiFetch("/api/notes", { method: "POST", body: JSON.stringify(newNote) });
    setNewNote({ subject: "Physics", title: "", content: "" });
    setShowNoteForm(false);
    loadNotes();
  };

  const deleteNote = async (id: number) => {
    await apiFetch(`/api/notes?id=${id}`, { method: "DELETE" });
    loadNotes();
  };

  const addGoal = async () => {
    if (!newGoal.title) return;
    await apiFetch("/api/goals", { method: "POST", body: JSON.stringify(newGoal) });
    setNewGoal({ title: "", type: "daily", targetValue: 0 });
    setShowGoalForm(false);
    loadGoals();
  };

  const updateGoalProgress = async (g: Goal, val: number) => {
    await apiFetch("/api/goals", { method: "PUT", body: JSON.stringify({ ...g, currentValue: val, completed: g.targetValue ? val >= g.targetValue : false }) });
    loadGoals();
  };

  const deleteGoal = async (id: number) => {
    await apiFetch(`/api/goals?id=${id}`, { method: "DELETE" });
    loadGoals();
  };

  const filteredTasks = taskFilter === "all" ? tasks : tasks.filter((t) => t.type === taskFilter);
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    const pr: Record<string, number> = { high: 3, medium: 2, low: 1 };
    return (pr[b.priority] || 0) - (pr[a.priority] || 0);
  });

  const subTabs: { key: SubTab; label: string; icon: string }[] = [
    { key: "tasks", label: "Tasks", icon: "✓" },
    { key: "revision", label: "Revision", icon: "🔄" },
    { key: "notes", label: "Notes", icon: "📝" },
    { key: "goals", label: "Goals", icon: "🎯" },
    { key: "focus", label: "Focus", icon: "⏱" },
  ];

  const todayStr = new Date().toISOString().split("T")[0];
  const dueRevisions = revisions.filter((r) => r.nextReviewDate && r.nextReviewDate <= todayStr && r.status !== "strong");

  return (
    <div className="animate-fade-in">
      {/* Sub-tab nav */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {subTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setSubTab(t.key)}
            className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              subTab === t.key ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tasks */}
      {subTab === "tasks" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Tasks</h3>
            <button onClick={() => setShowTaskForm(true)} className="text-xs bg-black text-white px-3 py-1.5 rounded-lg">+ Add</button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {["all", "daily", "weekly", "monthly", "yearly"].map((f) => (
              <button key={f} onClick={() => setTaskFilter(f)}
                className={`px-3 py-1 rounded-full text-xs capitalize ${taskFilter === f ? "bg-black text-white" : "bg-gray-100 text-gray-600"}`}>
                {f}
              </button>
            ))}
          </div>

          {showTaskForm && (
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Task title" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black" />
              <div className="flex gap-2">
                <select value={newTask.type} onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={addTask} className="px-4 py-2 bg-black text-white rounded-lg text-xs">Save</button>
                <button onClick={() => setShowTaskForm(false)} className="px-4 py-2 bg-gray-100 rounded-lg text-xs">Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {sortedTasks.map((t) => (
              <div key={t.id} className={`flex items-center gap-3 p-3 border rounded-xl ${t.completed ? "border-gray-100 opacity-60" : "border-gray-200"}`}>
                <button onClick={() => toggleTask(t)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs flex-shrink-0 ${t.completed ? "bg-black border-black text-white" : "border-gray-300"}`}>
                  {t.completed && "✓"}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${t.completed ? "line-through" : ""}`}>
                    {t.pinned && <span className="text-yellow-500 mr-1">📌</span>}
                    {t.title}
                  </div>
                  <div className="flex gap-2 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      t.priority === "high" ? "bg-red-50 text-red-600" : t.priority === "medium" ? "bg-yellow-50 text-yellow-600" : "bg-green-50 text-green-600"
                    }`}>{t.priority}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{t.type}</span>
                  </div>
                </div>
                <button onClick={() => pinTask(t)} className="text-gray-400 hover:text-yellow-500 text-sm">📌</button>
                <button onClick={() => deleteTask(t.id)} className="text-gray-400 hover:text-red-500 text-sm">✕</button>
              </div>
            ))}
            {sortedTasks.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No tasks yet</p>}
          </div>
        </div>
      )}

      {/* Revision */}
      {subTab === "revision" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Spaced Repetition</h3>
            <button onClick={() => setShowRevisionForm(true)} className="text-xs bg-black text-white px-3 py-1.5 rounded-lg">+ Add Topic</button>
          </div>

          {dueRevisions.length > 0 && (
            <div className="border border-orange-200 bg-orange-50 rounded-xl p-4">
              <div className="text-sm font-medium text-orange-700 mb-2">📅 Due for Review ({dueRevisions.length})</div>
              {dueRevisions.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-orange-100 last:border-0">
                  <div>
                    <div className="text-sm">{r.topic}</div>
                    <div className="text-xs text-orange-600">{r.subject} · Review #{(r.reviewCount || 0) + 1}</div>
                  </div>
                  <button onClick={() => reviewTopic(r)} className="text-xs bg-orange-600 text-white px-3 py-1 rounded-lg">Mark Reviewed</button>
                </div>
              ))}
            </div>
          )}

          {showRevisionForm && (
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <select value={newRevision.subject} onChange={(e) => setNewRevision({ ...newRevision, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
                <option>Physics</option><option>Chemistry</option><option>Botany</option><option>Zoology</option>
              </select>
              <input value={newRevision.topic} onChange={(e) => setNewRevision({ ...newRevision, topic: e.target.value })}
                placeholder="Topic name" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black" />
              <div className="flex gap-2">
                <button onClick={addRevision} className="px-4 py-2 bg-black text-white rounded-lg text-xs">Save</button>
                <button onClick={() => setShowRevisionForm(false)} className="px-4 py-2 bg-gray-100 rounded-lg text-xs">Cancel</button>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-400 mb-2">Schedule: Review after 1, 3, 7, 15, 30 days</div>

          <div className="space-y-2">
            {revisions.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                <div>
                  <div className="text-sm font-medium">{r.topic}</div>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{r.subject}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      r.status === "strong" ? "bg-green-50 text-green-600" :
                      r.status === "revised" ? "bg-blue-50 text-blue-600" :
                      "bg-gray-100 text-gray-500"
                    }`}>{r.status === "not_done" ? "Not Done" : r.status === "revised" ? "Revised" : "Strong"}</span>
                    <span className="text-[10px] text-gray-400">Reviews: {r.reviewCount}</span>
                  </div>
                  {r.nextReviewDate && <div className="text-[10px] text-gray-400 mt-0.5">Next: {r.nextReviewDate}</div>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => reviewTopic(r)} className="text-xs px-2 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">✓</button>
                  <button onClick={() => deleteRevision(r.id)} className="text-xs px-2 py-1 border border-gray-200 rounded-lg hover:bg-red-50 text-red-400">✕</button>
                </div>
              </div>
            ))}
            {revisions.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No revision topics yet</p>}
          </div>
        </div>
      )}

      {/* Notes */}
      {subTab === "notes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Quick Notes</h3>
            <button onClick={() => setShowNoteForm(true)} className="text-xs bg-black text-white px-3 py-1.5 rounded-lg">+ Add</button>
          </div>

          {showNoteForm && (
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <select value={newNote.subject} onChange={(e) => setNewNote({ ...newNote, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
                <option>Physics</option><option>Chemistry</option><option>Botany</option><option>Zoology</option>
              </select>
              <input value={newNote.title} onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="Title / Formula name" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black" />
              <textarea value={newNote.content} onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Content / Formula / Concept..." rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black resize-none" />
              <div className="flex gap-2">
                <button onClick={addNote} className="px-4 py-2 bg-black text-white rounded-lg text-xs">Save</button>
                <button onClick={() => setShowNoteForm(false)} className="px-4 py-2 bg-gray-100 rounded-lg text-xs">Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {notes.map((n) => (
              <div key={n.id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium">{n.title}</div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 inline-block mt-1">{n.subject}</span>
                  </div>
                  <button onClick={() => deleteNote(n.id)} className="text-gray-400 hover:text-red-500 text-sm">✕</button>
                </div>
                {n.content && <p className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">{n.content}</p>}
              </div>
            ))}
            {notes.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No notes yet</p>}
          </div>
        </div>
      )}

      {/* Goals */}
      {subTab === "goals" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Goals</h3>
            <button onClick={() => setShowGoalForm(true)} className="text-xs bg-black text-white px-3 py-1.5 rounded-lg">+ Add</button>
          </div>

          {showGoalForm && (
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <input value={newGoal.title} onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                placeholder="Goal title" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black" />
              <div className="flex gap-2">
                <select value={newGoal.type} onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
                  <option value="daily">Daily</option><option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option><option value="neet">NEET Target</option>
                </select>
                <input type="number" value={newGoal.targetValue} onChange={(e) => setNewGoal({ ...newGoal, targetValue: parseInt(e.target.value) || 0 })}
                  placeholder="Target" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
              </div>
              <div className="flex gap-2">
                <button onClick={addGoal} className="px-4 py-2 bg-black text-white rounded-lg text-xs">Save</button>
                <button onClick={() => setShowGoalForm(false)} className="px-4 py-2 bg-gray-100 rounded-lg text-xs">Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {goals.map((g) => (
              <div key={g.id} className={`border rounded-xl p-4 ${g.completed ? "border-green-200 bg-green-50" : "border-gray-100"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{g.title}</div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block ${
                      g.type === "neet" ? "bg-purple-50 text-purple-600" : "bg-gray-100 text-gray-500"
                    }`}>{g.type}</span>
                  </div>
                  <button onClick={() => deleteGoal(g.id)} className="text-gray-400 hover:text-red-500 text-sm">✕</button>
                </div>
                {g.targetValue ? (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{g.currentValue} / {g.targetValue}</span>
                      <span>{Math.round((g.currentValue / g.targetValue) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-black rounded-full h-2 transition-all" style={{ width: `${Math.min((g.currentValue / g.targetValue) * 100, 100)}%` }} />
                    </div>
                    <input type="number" value={g.currentValue} onChange={(e) => updateGoalProgress(g, parseInt(e.target.value) || 0)}
                      className="mt-2 w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none" placeholder="Update progress" />
                  </div>
                ) : (
                  <div className="mt-2">
                    <button onClick={() => updateGoalProgress(g, g.completed ? 0 : 1)}
                      className={`text-xs px-3 py-1 rounded-lg ${g.completed ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {g.completed ? "✓ Completed" : "Mark Complete"}
                    </button>
                  </div>
                )}
              </div>
            ))}
            {goals.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No goals yet</p>}
          </div>
        </div>
      )}

      {/* Focus Mode */}
      {subTab === "focus" && (
        <div className="space-y-6">
          <h3 className="font-semibold">Focus Mode</h3>

          {focusActive && (
            <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-xs uppercase tracking-widest mb-4 text-gray-400">Focus Mode Active</div>
                <div className="text-7xl font-mono font-bold mb-2">{formatTime(focusRemaining)}</div>
                <div className="text-sm text-gray-400 mb-8">Stay focused. No distractions.</div>
                <button onClick={stopFocus} className="px-6 py-3 border border-gray-600 rounded-xl text-sm hover:bg-gray-800 transition-colors">
                  End Session
                </button>
              </div>
            </div>
          )}

          <div className="border border-gray-200 rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">⏱</div>
            <div className="text-sm text-gray-500 mb-4">Pomodoro Timer</div>
            <div className="flex justify-center gap-3 mb-6">
              {[25, 50, 90].map((m) => (
                <button key={m} onClick={() => setFocusDuration(m)}
                  className={`px-4 py-2 rounded-lg text-sm ${focusDuration === m ? "bg-black text-white" : "bg-gray-100 text-gray-600"}`}>
                  {m} min
                </button>
              ))}
            </div>
            <button onClick={startFocus} className="px-8 py-3 bg-black text-white rounded-xl font-medium text-sm">
              Start Focus
            </button>
          </div>

          <div className="border border-gray-100 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{totalFocused}</div>
            <div className="text-xs text-gray-500">Total focused minutes today</div>
          </div>
        </div>
      )}
    </div>
  );
}
