"use client";

import { useState, useEffect } from "react";

type Developer = { id: number; name: string };
type Iteration = {
  id: number;
  name: string;
  solution_proposal_date: string | null;
  dev_freeze_date: string | null;
  deploy_date: string | null;
};

export default function AddForm({ onAdded }: { onAdded: () => void }) {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [iterations, setIterations] = useState<Iteration[]>([]);
  const [type, setType] = useState<"focal" | "ticket">("focal");
  const [number, setNumber] = useState("");
  const [title, setTitle] = useState("");
  const [developerId, setDeveloperId] = useState("");
  const [priority, setPriority] = useState("medium");
  const [iterationId, setIterationId] = useState("");
  const [ticketStatus, setTicketStatus] = useState("start");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // New iteration form
  const [showNewIteration, setShowNewIteration] = useState(false);
  const [newIterName, setNewIterName] = useState("");
  const [newIterSolution, setNewIterSolution] = useState("");
  const [newIterFreeze, setNewIterFreeze] = useState("");
  const [newIterDeploy, setNewIterDeploy] = useState("");

  useEffect(() => {
    fetch("/api/developers").then((r) => r.json()).then(setDevelopers);
    loadIterations();
  }, []);

  function loadIterations() {
    fetch("/api/iterations").then((r) => r.json()).then(setIterations);
  }

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
    if (type === "focal") body.priority = priority;
    if (type === "ticket") {
      body.status = ticketStatus;
      if (iterationId) body.iteration_id = iterationId;
    }

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
      setPriority("medium");
      setTicketStatus("start");
      setIterationId("");
      onAdded();
    } else {
      const err = await res.json();
      setMessage(`Fel: ${err.error}`);
    }
    setSaving(false);
  }

  async function handleNewIteration(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/iterations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newIterName,
        solution_proposal_date: newIterSolution || null,
        dev_freeze_date: newIterFreeze || null,
        deploy_date: newIterDeploy || null,
      }),
    });

    if (res.ok) {
      const iter = await res.json();
      setNewIterName("");
      setNewIterSolution("");
      setNewIterFreeze("");
      setNewIterDeploy("");
      setShowNewIteration(false);
      loadIterations();
      setIterationId(String(iter.id));
      onAdded();
    } else {
      const err = await res.json();
      setMessage(`Fel: ${err.error}`);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2 style={{ fontSize: 18, margin: "0 0 16px" }}>Lägg till ärende</h2>

        <div style={rowStyle}>
          <label style={labelStyle}>Typ</label>
          <select value={type} onChange={(e) => setType(e.target.value as "focal" | "ticket")} style={inputStyle}>
            <option value="focal">Focal</option>
            <option value="ticket">Ticket</option>
          </select>
        </div>

        <div style={rowStyle}>
          <label style={labelStyle}>{type === "focal" ? "Focal-nummer" : "Ticket-nummer"}</label>
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
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Kort beskrivning" style={inputStyle} />
        </div>

        <div style={rowStyle}>
          <label style={labelStyle}>Utvecklare</label>
          <select value={developerId} onChange={(e) => setDeveloperId(e.target.value)} style={inputStyle}>
            <option value="">— Ej tilldelad —</option>
            {developers.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {type === "focal" && (
          <div style={rowStyle}>
            <label style={labelStyle}>Prioritet</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} style={inputStyle}>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        )}

        {type === "ticket" && (
          <div style={rowStyle}>
            <label style={labelStyle}>Status</label>
            <select value={ticketStatus} onChange={(e) => setTicketStatus(e.target.value)} style={inputStyle}>
              <option value="start">Start</option>
              <option value="losningsforslag">Lösningsförslag</option>
              <option value="development">Development</option>
              <option value="pull_request">Pull Request</option>
              <option value="testning">Testning</option>
            </select>
          </div>
        )}

        {type === "ticket" && (
          <div style={rowStyle}>
            <label style={labelStyle}>Iteration</label>
            <div style={{ display: "flex", gap: 8 }}>
              <select value={iterationId} onChange={(e) => setIterationId(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
                <option value="">— Ingen —</option>
                {iterations.map((it) => (
                  <option key={it.id} value={it.id}>{it.name}</option>
                ))}
              </select>
              <button type="button" onClick={() => setShowNewIteration(!showNewIteration)} style={smallButtonStyle}>
                {showNewIteration ? "Avbryt" : "+ Ny"}
              </button>
            </div>
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

      {showNewIteration && (
        <form onSubmit={handleNewIteration} style={{ ...formStyle, marginTop: 16 }}>
          <h2 style={{ fontSize: 18, margin: "0 0 16px" }}>Ny iteration</h2>

          <div style={rowStyle}>
            <label style={labelStyle}>Namn</label>
            <input required value={newIterName} onChange={(e) => setNewIterName(e.target.value)} placeholder="t.ex. Sprint 12" style={inputStyle} />
          </div>

          <div style={rowStyle}>
            <label style={labelStyle}>Lösningsförslag</label>
            <input type="date" value={newIterSolution} onChange={(e) => setNewIterSolution(e.target.value)} style={inputStyle} />
          </div>

          <div style={rowStyle}>
            <label style={labelStyle}>Utvecklingsstopp</label>
            <input type="date" value={newIterFreeze} onChange={(e) => setNewIterFreeze(e.target.value)} style={inputStyle} />
          </div>

          <div style={rowStyle}>
            <label style={labelStyle}>Deploy</label>
            <input type="date" value={newIterDeploy} onChange={(e) => setNewIterDeploy(e.target.value)} style={inputStyle} />
          </div>

          <button type="submit" style={buttonStyle}>Skapa iteration</button>
        </form>
      )}
    </div>
  );
}

const formStyle: React.CSSProperties = {
  backgroundColor: "white",
  borderRadius: 8,
  padding: 24,
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

const rowStyle: React.CSSProperties = { marginBottom: 12 };

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

const smallButtonStyle: React.CSSProperties = {
  padding: "8px 14px",
  fontSize: 13,
  fontWeight: 600,
  backgroundColor: "#eee",
  color: "#333",
  border: "1px solid #ddd",
  borderRadius: 6,
  cursor: "pointer",
  whiteSpace: "nowrap",
};
