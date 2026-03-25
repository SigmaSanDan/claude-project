"use client";

import { useState, useEffect, useCallback } from "react";
import AddForm from "./add-form";

type DevData = {
  name: string;
  focals: number;
  tickets: number;
  total: number;
};

type Iteration = {
  id: number;
  name: string;
  solution_proposal_date: string | null;
  dev_freeze_date: string | null;
  deploy_date: string | null;
};

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("sv-SE");
}

function daysUntil(d: string | null) {
  if (!d) return null;
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  return diff;
}

function milestoneColor(days: number | null) {
  if (days === null) return "#999";
  if (days < 0) return "#999";
  if (days <= 3) return "#e74c3c";
  if (days <= 7) return "#f39c12";
  return "#27ae60";
}

export default function Dashboard() {
  const [data, setData] = useState<DevData[]>([]);
  const [iterations, setIterations] = useState<Iteration[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const [dashRes, iterRes] = await Promise.all([
      fetch("/api/dashboard"),
      fetch("/api/iterations"),
    ]);
    setData(await dashRes.json());
    setIterations(await iterRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalFocals = data.reduce((sum, d) => sum + d.focals, 0);
  const totalTickets = data.reduce((sum, d) => sum + d.tickets, 0);

  // Find the next upcoming iteration (closest deploy_date in the future)
  const activeIteration = iterations.find((it) => {
    if (!it.deploy_date) return false;
    return new Date(it.deploy_date) >= new Date(new Date().toDateString());
  });

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Team Dashboard</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Totalt: {totalFocals} focals, {totalTickets} tickets
      </p>

      {activeIteration && (
        <div style={iterationCardStyle}>
          <h2 style={{ fontSize: 16, margin: "0 0 12px" }}>{activeIteration.name}</h2>
          <div style={{ display: "flex", gap: 24 }}>
            <Milestone label="Lösningsförslag" date={activeIteration.solution_proposal_date} />
            <Milestone label="Utvecklingsstopp" date={activeIteration.dev_freeze_date} />
            <Milestone label="Deploy" date={activeIteration.deploy_date} />
          </div>
        </div>
      )}

      {loading ? (
        <p>Laddar...</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "white",
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            marginBottom: 32,
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#1a1a2e", color: "white" }}>
              <th style={thStyle}>Utvecklare</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Focals</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Tickets</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Totalt</th>
            </tr>
          </thead>
          <tbody>
            {data.map((dev) => (
              <tr key={dev.name} style={{ borderBottom: "1px solid #eee" }}>
                <td style={tdStyle}>{dev.name}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  <Badge count={dev.focals} color="#e74c3c" />
                </td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  <Badge count={dev.tickets} color="#3498db" />
                </td>
                <td style={{ ...tdStyle, textAlign: "center", fontWeight: 600 }}>
                  {dev.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p style={{ marginBottom: 16, fontSize: 13, color: "#999" }}>
        Visar aktiva ärenden (open / in_progress)
      </p>

      <AddForm onAdded={loadData} />
    </div>
  );
}

function Milestone({ label, date }: { label: string; date: string | null }) {
  const days = daysUntil(date);
  const color = milestoneColor(days);
  const daysText =
    days === null ? "" : days < 0 ? "(passerat)" : days === 0 ? "(idag)" : `(${days} dagar)`;

  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color }}>{formatDate(date)}</div>
      <div style={{ fontSize: 12, color }}>{daysText}</div>
    </div>
  );
}

function Badge({ count, color }: { count: number; color: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        minWidth: 28,
        padding: "2px 8px",
        borderRadius: 12,
        backgroundColor: count > 0 ? color : "#e0e0e0",
        color: count > 0 ? "white" : "#999",
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      {count}
    </span>
  );
}

const iterationCardStyle: React.CSSProperties = {
  backgroundColor: "white",
  borderRadius: 8,
  padding: 20,
  marginBottom: 24,
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  borderLeft: "4px solid #3498db",
};

const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: 14,
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontSize: 15,
};
