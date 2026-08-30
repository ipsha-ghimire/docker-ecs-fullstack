import { useEffect, useState } from "react";

export default function App() {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");

  const load = () => fetch("/api/notes").then((r) => r.json()).then(setNotes);

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!text.trim()) return;
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text }),
    });
    setText("");
    load();
  };

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "40px auto" }}>
      <h1>Notes</h1>
      <p style={{ color: "#666" }}>v1</p>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a note"
        style={{ padding: 8, width: "70%" }}
      />
      <button onClick={save} style={{ padding: 8, marginLeft: 8 }}>Save</button>
      <ul>
        {notes.map((n) => <li key={n.id}>{n.body}</li>)}
      </ul>
    </div>
  );
}