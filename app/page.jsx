"use client";
import { useEffect, useMemo, useState } from "react";

const KEY = "saif-flash-cards-v1";
const LEVELS = [
  { label: "Very Hard", days: 0, color: "#dc2626" },
  { label: "Hard", days: 1, color: "#ea580c" },
  { label: "Normal", days: 3, color: "#ca8a04" },
  { label: "Easy", days: 7, color: "#16a34a" },
  { label: "Very Easy", days: 21, color: "#2563eb" },
];
const DAY = 86400000;
const btn = { border: "0", borderRadius: 12, padding: "12px 17px", fontWeight: 700, cursor: "pointer" };
const input = { width: "100%", padding: 14, border: "1px solid #cbd5e1", borderRadius: 12, font: "inherit", boxSizing: "border-box", background: "#fff", color: "#0f172a" };

export default function Home() {
  const [cards, setCards] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("review");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [notes, setNotes] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [sessionDone, setSessionDone] = useState(0);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    try { const stored = JSON.parse(localStorage.getItem(KEY) || "[]"); if (Array.isArray(stored)) setCards(stored); } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem(KEY, JSON.stringify(cards)); }, [cards, loaded]);
  const due = useMemo(() => cards.filter(c => (c.dueAt || 0) <= now).sort((a,b) => (a.dueAt || 0) - (b.dueAt || 0)), [cards, now]);
  const active = due[0];
  function addCard(e) {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    setCards(old => [...old, { id: crypto.randomUUID(), front: front.trim(), back: back.trim(), notes: notes.trim(), dueAt: Date.now(), interval: 0, reviews: 0, lastLevel: null }]);
    setFront(""); setBack(""); setNotes(""); setNow(Date.now()); setTab("cards");
  }
  function rate(index) {
    if (!active) return;
    const level = LEVELS[index];
    // Very Hard stays due in the current session; the other levels schedule future reviews.
    // Repeated successes grow the interval, while hard ratings reset it.
    const previous = active.interval || 0;
    const days = index < 2 ? level.days : Math.max(level.days, previous * [0, 0, 1.5, 2, 2.5][index]);
    const next = index === 0 ? Date.now() : Date.now() + days * DAY;
    setCards(old => old.map(c => c.id === active.id ? { ...c, dueAt: next, interval: days, reviews: (c.reviews || 0) + 1, lastLevel: level.label } : c));
    setRevealed(false); setSessionDone(x => x + 1); setNow(Date.now());
  }
  function remove(id) { if (window.confirm("Delete this flashcard?")) setCards(old => old.filter(c => c.id !== id)); }
  function exportCards() {
    const blob = new Blob([JSON.stringify(cards, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "saif-flash-cards-backup.json"; a.click(); URL.revokeObjectURL(url);
  }
  async function importCards(e) {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!Array.isArray(parsed) || !parsed.every(c => typeof c.front === "string" && typeof c.back === "string")) throw Error();
      setCards(old => [...old, ...parsed.map(c => ({ ...c, id: crypto.randomUUID(), dueAt: Number(c.dueAt) || Date.now() }))]);
      setNow(Date.now());
    } catch { alert("Invalid backup file"); }
    e.target.value = "";
  }
  const cardStyle = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 24, boxShadow: "0 8px 30px #0f172a08" };
  return (
    <main style={{ minHeight: "100vh", background: "#f4f7fc", color: "#0f172a", fontFamily: "Arial, sans-serif", padding: "28px 16px 60px" }}>
      <div style={{ maxWidth: 850, margin: "0 auto" }}>
        <header style={{ marginBottom: 26 }}>
          <div style={{ fontSize: 13, color: "#64748b", fontWeight: 700, letterSpacing: 2 }}>FRENCH CHUNKS • DAILY PRACTICE</div>
          <h1 style={{ margin: "9px 0", fontSize: "clamp(28px, 5vw, 42px)", color: "#1d4ed8" }}>🧠 Saif Flash Cards</h1>
          <p style={{ color: "#64748b", margin: 0 }}>Build your French, one useful phrase at a time.</p>
        </header>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 22 }}>
          {[["Total cards", cards.length], ["Due today", due.length], ["Reviewed now", sessionDone]].map(([label, value]) =>
            <div key={label} style={{ ...cardStyle, padding: 16 }}><div style={{ fontSize: 27, fontWeight: 800 }}>{value}</div><div style={{ fontSize: 12, color: "#64748b" }}>{label}</div></div>)}
        </div>
        <nav style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {[["review", "📖 Review"], ["add", "＋ Add phrase"], ["cards", "🗂 My cards"]].map(([id,label]) =>
            <button key={id} onClick={() => { setTab(id); setRevealed(false); setNow(Date.now()); }} style={{ ...btn, background: tab === id ? "#2563eb" : "#fff", color: tab === id ? "#fff" : "#334155", border: "1px solid #dbe3f0" }}>{label}</button>)}
        </nav>
        {tab === "review" && <section style={cardStyle}>
          {!loaded ? <p>Loading...</p> : !active ? <div style={{ textAlign: "center", padding: "36px 10px" }}>
            <div style={{ fontSize: 48 }}>🎉</div><h2>All caught up!</h2>
            <p style={{ color: "#64748b" }}>{cards.length ? "No cards are due right now. Come back when your next review is ready." : "Start by adding your first French phrase."}</p>
            <button style={{ ...btn, background: "#2563eb", color: "white" }} onClick={() => setTab("add")}>＋ Add a phrase</button>
          </div> : <div style={{ textAlign: "center" }}>
            <div style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>YOUR FRENCH CHUNK</div>
            <div style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 750, minHeight: 90, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{revealed ? active.back : active.front}</div>
            {revealed && active.notes && <p style={{ color: "#64748b", whiteSpace: "pre-wrap" }}>{active.notes}</p>}
            {!revealed ? <button style={{ ...btn, background: "#2563eb", color: "white", marginTop: 12 }} onClick={() => setRevealed(true)}>Show answer</button> :
              <><p style={{ color: "#64748b", fontSize: 14, marginTop: 22 }}>How well did you remember it?</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>{LEVELS.map((level,i) =>
                  <button key={level.label} onClick={() => rate(i)} style={{ ...btn, background: level.color, color: "white", fontSize: 13 }}>{level.label}</button>)}</div>
                <p style={{ color: "#94a3b8", fontSize: 12 }}>Very Hard repeats now · Hard 1 day · Normal 3 days · Easy 7 days · Very Easy 21 days (longer with progress)</p>
              </>}
          </div>}
        </section>}
        {tab === "add" && <section style={cardStyle}><h2 style={{ marginTop: 0 }}>Add a French chunk</h2>
          <form onSubmit={addCard} style={{ display: "grid", gap: 14 }}>
            <label>Front — French sentence<textarea required value={front} onChange={e => setFront(e.target.value)} placeholder="J'ai hâte de te voir." rows={3} style={{ ...input, resize: "vertical", marginTop: 7 }}/></label>
            <label>Back — meaning / translation<textarea required value={back} onChange={e => setBack(e.target.value)} placeholder="I can't wait to see you. / متشوق نشوفك" rows={3} style={{ ...input, resize: "vertical", marginTop: 7 }}/></label>
            <label>Extra notes (optional)<textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="When to use it, pronunciation..." rows={2} style={{ ...input, resize: "vertical", marginTop: 7 }}/></label>
            <button type="submit" style={{ ...btn, background: "#2563eb", color: "white" }}>Save flashcard</button>
          </form></section>}
        {tab === "cards" && <section style={cardStyle}><h2 style={{ marginTop: 0 }}>My flashcards ({cards.length})</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
            <button style={{ ...btn, background: "#e0e7ff", color: "#1d4ed8" }} onClick={exportCards}>⬇ Export backup</button>
            <label style={{ ...btn, background: "#e2e8f0", cursor: "pointer" }}>⬆ Import backup<input type="file" accept=".json,application/json" onChange={importCards} style={{ display: "none" }}/></label>
          </div>
          {!cards.length && <p style={{ color: "#64748b" }}>No cards yet. Add your first phrase!</p>}
          <div style={{ display: "grid", gap: 12 }}>{cards.map(c => <div key={c.id} style={{ border: "1px solid #e2e8f0", borderRadius: 14, padding: 15 }}>
            <strong style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{c.front}</strong>
            <p style={{ color: "#475569", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{c.back}</p>
            <small style={{ color: "#64748b" }}>{c.lastLevel || "New"} · {c.dueAt <= now ? "Due now" : "Next: " + new Date(c.dueAt).toLocaleString()}</small>
            <div><button onClick={() => remove(c.id)} style={{ ...btn, background: "#fee2e2", color: "#991b1b", marginTop: 10, padding: "8px 12px" }}>Delete</button></div>
          </div>)}</div>
        </section>}
        <p style={{ textAlign: "center", color: "#64748b", fontSize: 12, marginTop: 25 }}>Your cards are saved in this browser. Export backups regularly. Cloud sync will be added after Supabase is connected.</p>
      </div>
    </main>
  );
}
