const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const EXERCISES = [
  {
    id: "countdown7s",
    name: "Count down 7s",
    description: "Count down from 100 by 7",
    detail: "100 → 93 → 86 → 79 → 72 → 65 → 58 → 51 → 44 → 37 → 30 → 23 → 16 → 9 → 2",
  },
  {
    id: "letgo",
    name: "Let go",
    description: "Letting go of your thoughts",
    detail: "Picture your thought as a balloon you're holding. Take a breath, release it, and watch it float away.",
  },
  {
    id: "fivesenses",
    name: "5 Senses",
    description: "Ground yourself in the present moment",
    detail: "5 things you see · 4 you can touch · 3 you hear · 2 you smell · 1 you taste",
  },
];

const m = {
  sectionLabel: { fontSize: 13, color: "#aaa", marginBottom: 16 },
  card: { background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 12 },
  name: { fontSize: 15, fontWeight: 600, margin: "0 0 3px" },
  desc: { fontSize: 13, color: "#555", margin: "0 0 4px" },
  detail: { fontSize: 12, color: "#aaa", margin: "0 0 14px", fontStyle: "italic", lineHeight: 1.5 },
  daysRow: { display: "flex", gap: 6, marginBottom: 10 },
  dayBtn: (checked) => ({
    width: 36, height: 36, borderRadius: 8,
    border: checked ? "none" : "1px solid #eee",
    background: checked ? "#1D9E75" : "#f7f7f7",
    color: checked ? "#fff" : "#888",
    fontSize: 12, fontWeight: checked ? 500 : 400,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  }),
  progressWrap: { height: 4, borderRadius: 4, background: "#f0f0f0", overflow: "hidden" },
  progressBar: (pct) => ({ height: "100%", width: `${Math.min(100, pct)}%`, borderRadius: 4, background: "#1D9E75", transition: "width 0.2s" }),
  progressLabel: { fontSize: 11, color: "#aaa", marginTop: 4 },
};

export default function MeditationTab({ checks, onToggle, weekKey }) {
  return (
    <div>
      <p style={m.sectionLabel}>Tap a day to mark each practice done</p>
      {EXERCISES.map(ex => {
        const dayChecks = DAYS.map((_, i) => !!checks[`${ex.id}_${weekKey}_${i}`]);
        const count = dayChecks.filter(Boolean).length;
        return (
          <div key={ex.id} style={m.card}>
            <p style={m.name}>{ex.name}</p>
            <p style={m.desc}>{ex.description}</p>
            <p style={m.detail}>{ex.detail}</p>
            <div style={m.daysRow}>
              {DAYS.map((d, i) => (
                <button key={d} style={m.dayBtn(dayChecks[i])} onClick={() => onToggle(ex.id, i)}>
                  {d}
                </button>
              ))}
            </div>
            <div style={m.progressWrap}>
              <div style={m.progressBar((count / 7) * 100)} />
            </div>
            <p style={m.progressLabel}>{count} / 7 days this week{count === 7 ? " — perfect week!" : ""}</p>
          </div>
        );
      })}
    </div>
  );
}
