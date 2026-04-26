import { useState, useEffect } from "react";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, provider, db } from "./firebase";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function weekKey(monday) {
  return monday.toISOString().slice(0, 10);
}

function formatWeekLabel(monday) {
  const end = new Date(monday);
  end.setDate(end.getDate() + 6);
  const fmt = d => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(monday)} – ${fmt(end)}`;
}

const s = {
  wrap: { fontFamily: "sans-serif", padding: "1.5rem 1rem", maxWidth: 640, margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  h1: { fontSize: 20, fontWeight: 500, margin: 0 },
  weekLabel: { fontSize: 13, color: "#888" },
  addRow: { display: "flex", gap: 8, marginBottom: "1.5rem" },
  input: { flex: 1, padding: "8px 12px", fontSize: 14, borderRadius: 8, border: "1px solid #ddd", outline: "none" },
  numInput: { width: 60, padding: "8px 10px", fontSize: 14, borderRadius: 8, border: "1px solid #ddd", outline: "none", textAlign: "center" },
  btn: { padding: "8px 16px", fontSize: 14, borderRadius: 8, border: "1px solid #ddd", background: "transparent", cursor: "pointer" },
  card: { background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 12 },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  taskName: { fontSize: 15, fontWeight: 500, margin: 0 },
  target: { fontSize: 12, color: "#888" },
  daysRow: { display: "flex", gap: 6, marginBottom: 10 },
  dayBtn: (checked, met) => ({
    width: 36, height: 36, borderRadius: 8,
    border: checked ? "none" : "1px solid #eee",
    background: checked ? (met ? "#1D9E75" : "#378ADD") : "#f7f7f7",
    color: checked ? "#fff" : "#888",
    fontSize: 12, fontWeight: checked ? 500 : 400,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
  }),
  progressWrap: { height: 4, borderRadius: 4, background: "#f0f0f0", overflow: "hidden" },
  progressBar: (pct, met) => ({ height: "100%", width: `${Math.min(100, pct)}%`, borderRadius: 4, background: met ? "#1D9E75" : "#378ADD", transition: "width 0.2s" }),
  progressLabel: { fontSize: 11, color: "#aaa", marginTop: 4 },
  historyH2: { fontSize: 14, fontWeight: 500, color: "#888", marginBottom: 12 },
  histRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f0f0f0", fontSize: 13 },
  dot: (met) => ({ width: 8, height: 8, borderRadius: "50%", background: met ? "#1D9E75" : "#aaa", display: "inline-block", marginRight: 6 }),
  deleteBtn: { background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 16, padding: "0 4px" },
  empty: { fontSize: 14, color: "#aaa", textAlign: "center", padding: "2rem 0" },
  loginWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 },
  loginBtn: { padding: "12px 24px", fontSize: 15, borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" },
  avatar: { width: 28, height: 28, borderRadius: "50%", objectFit: "cover" },
  userRow: { display: "flex", alignItems: "center", gap: 8 },
};

export default function App() {
  const today = new Date();
  const currentMonday = getMonday(today);
  const currentKey = weekKey(currentMonday);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [checks, setChecks] = useState({});
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState(3);
  const [viewingHistory, setViewingHistory] = useState(false);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      setUser(u);
      if (u) await loadData(u.uid);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Save to Firestore whenever tasks or checks change
  useEffect(() => {
    if (user) saveData(user.uid);
  }, [tasks, checks]);

  async function loadData(uid) {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      setTasks(data.tasks || []);
      setChecks(data.checks || {});
    }
  }

  async function saveData(uid) {
    const ref = doc(db, "users", uid);
    await setDoc(ref, { tasks, checks }, { merge: true });
  }

  async function login() {
    try { await signInWithPopup(auth, provider); } catch (e) { console.error(e); }
  }

  async function logout() {
    await signOut(auth);
    setTasks([]);
    setChecks({});
  }

  function addTask() {
    if (!newName.trim()) return;
    setTasks(prev => [...prev, { id: Date.now(), name: newName.trim(), target: Math.max(1, Math.min(7, Number(newTarget))) }]);
    setNewName("");
    setNewTarget(3);
  }

  function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
    setChecks(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { if (k.startsWith(id + "_")) delete next[k]; });
      return next;
    });
  }

  function toggleDay(taskId, dayIdx) {
    const key = `${taskId}_${currentKey}_${dayIdx}`;
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function getDayChecks(taskId) {
    return DAYS.map((_, i) => !!checks[`${taskId}_${currentKey}_${i}`]);
  }

  const pastWeeks = [...new Set(
    Object.keys(checks).map(k => k.split("_")[1]).filter(w => w && w !== currentKey)
  )].sort().reverse().slice(0, 8);

  if (loading) return <div style={{ ...s.loginWrap }}><p style={{ color: "#aaa" }}>Loading...</p></div>;

  if (!user) return (
    <div style={s.loginWrap}>
      <h1 style={s.h1}>Do It Tracker</h1>
      <p style={{ color: "#888", fontSize: 14 }}>Sign in to track your weekly tasks</p>
      <button style={s.loginBtn} onClick={login}>
        <img src="https://www.google.com/favicon.ico" width={18} height={18} alt="Google" />
        Sign in with Google
      </button>
    </div>
  );

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <h1 style={s.h1}>Weekly tasks</h1>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <div style={s.userRow}>
            {user.photoURL && <img src={user.photoURL} alt="avatar" style={s.avatar} />}
            <button style={{ ...s.btn, fontSize: 12, padding: "4px 10px" }} onClick={logout}>Sign out</button>
          </div>
          <span style={s.weekLabel}>{formatWeekLabel(currentMonday)}</span>
          <button style={{ ...s.btn, fontSize: 12, padding: "4px 10px" }} onClick={() => setViewingHistory(v => !v)}>
            {viewingHistory ? "Current week" : "History"}
          </button>
        </div>
      </div>

      {!viewingHistory ? (
        <>
          <div style={s.addRow}>
            <input style={s.input} placeholder="New task name..." value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addTask()} />
            <input style={s.numInput} type="number" min={1} max={7} value={newTarget}
              onChange={e => setNewTarget(e.target.value)} title="Days per week" />
            <button style={s.btn} onClick={addTask}>Add</button>
          </div>

          {tasks.length === 0 && <p style={s.empty}>No tasks yet. Add one above.</p>}

          {tasks.map(task => {
            const dayChecks = getDayChecks(task.id);
            const count = dayChecks.filter(Boolean).length;
            const met = count >= task.target;
            return (
              <div key={task.id} style={s.card}>
                <div style={s.cardTop}>
                  <div>
                    <p style={s.taskName}>{task.name}</p>
                    <p style={s.target}>{task.target} days/week</p>
                  </div>
                  <button style={s.deleteBtn} onClick={() => deleteTask(task.id)}>×</button>
                </div>
                <div style={s.daysRow}>
                  {DAYS.map((d, i) => (
                    <button key={d} style={s.dayBtn(dayChecks[i], met)} onClick={() => toggleDay(task.id, i)}>
                      {d}
                    </button>
                  ))}
                </div>
                <div style={s.progressWrap}>
                  <div style={s.progressBar((count / task.target) * 100, met)} />
                </div>
                <p style={s.progressLabel}>{count} / {task.target} days {met ? "— done!" : ""}</p>
              </div>
            );
          })}
        </>
      ) : (
        <div>
          <p style={s.historyH2}>Past weeks</p>
          {pastWeeks.length === 0 && <p style={s.empty}>No history yet.</p>}
          {pastWeeks.map(wk => {
            const mon = new Date(wk + "T00:00:00");
            return (
              <div key={wk}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#aaa", margin: "1rem 0 4px" }}>{formatWeekLabel(mon)}</p>
                {tasks.map(task => {
                  const count = DAYS.reduce((acc, _, i) => acc + (!!checks[`${task.id}_${wk}_${i}`] ? 1 : 0), 0);
                  const met = count >= task.target;
                  if (count === 0) return null;
                  return (
                    <div key={task.id} style={s.histRow}>
                      <span><span style={s.dot(met)} />{task.name}</span>
                      <span style={{ color: met ? "#1D9E75" : "#aaa" }}>{count}/{task.target}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}