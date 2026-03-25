"use client";

import { useState, useEffect } from "react";

type Developer = { id: number; name: string };

export default function AddForm({ onAdded }: { onAdded: () => void }) {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [type, setType] = useState<"focal" | "ticket">("focal");
  const [number, setNumber] = useState("");
  const [title, setTitle] = useState("");
  const [developerId, setDeveloperId] = useState("");
  const [iteration, setIteration] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/developers")
      .then((r) => r.json())
      .then(setDevelopers);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const endpoint = type === "focal" ? "/api/focals" : "/api/tickets";
    const body: Record<string, string> = {
      [type === "focal" ? "focal_number" : "ticket_number"]: number,
      title,
      developer_id: developerId,
    };
    if (type === "ticket" && iteration) body.iteration = iteration;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setMessage(`${type === "focal" ? "Focal" : "Ticket"} ${number} tillagd!`);
      setNumber("");
      setTitle("");
      setDeveloperId("");
      setIteration("");
      onAdded();
    } else {
      const err = await res.json();
      setMessage(`Fel: ${err.error}`);
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h2 style={{ fontSize: 18, margin: "0 0 16px" }}>Lägg till ärende</h2>

      <div style={rowStyle}>
        <label style={labelStyle}>Typ</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "focal" | "ticket")}
          style={inputStyle}
        >
          <option value="focal">Focal</option>
          <option value="ticket">Ticket</option>
        </select>
      </div>

      <div style={rowStyle}>
        <label style={labelStyle}>
          {type === "focal" ? "Focal-nummer" : "Ticket-nummer"}
        </label>
        <input
          required
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder={type === "focal" ? "t.ex. F-1234" : "t.ex. T-567"}
          style={inputStyle}
        />
      </div>

      <div style={rowStyle}>
        <label style={labelStyle}>Beskrivning</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Kort beskrivning"
          style={inputStyle}
        />
      </div>

      <div style={rowStyle}>
        <label style={labelStyle}>Utvecklare</label>
        <select
          value={developerId}
          onChange={(e) => setDeveloperId(e.target.value)}
          style={inputStyle}
        >
          <option value="">— Ej tilldelad —</option>
          {developers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {type === "ticket" && (
        <div style={rowStyle}>
          <label style={labelStyle}>Iteration</label>
          <input
            value={iteration}
            onChange={(e) => setIteration(e.target.value)}
            placeholder="t.ex. Sprint 12"
            style={inputStyle}
          />
        </div>
      )}

      <button type="submit" disabled={saving} style={buttonStyle}>
        {saving ? "Sparar..." : "Lägg till"}
      </button>

      {message && (
        <p style={{ marginTop: 8, fontSize: 14, color: message.startsWith("Fel") ? "#e74c3c" : "#27ae60" }}>
          {message}
        </p>
      )}
    </form>
  );
}

const formStyle: React.CSSProperties = {
  backgroundColor: "white",
  borderRadius: 8,
  padding: 24,
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

const rowStyle: React.CSSProperties = {
  marginBottom: 12,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 4,
  color: "#333",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  fontSize: 14,
  border: "1px solid #ddd",
  borderRadius: 6,
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  marginTop: 8,
  padding: "10px 24px",
  fontSize: 14,
  fontWeight: 600,
  backgroundColor: "#1a1a2e",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};
