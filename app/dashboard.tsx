"use client";

import { useState, useEffect, useCallback } from "react";
import AddForm from "./add-form";

type DevData = {
  name: string;
  focals: number;
  tickets: number;
  total: number;
};

export default function Dashboard() {
  const [data, setData] = useState<DevData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const res = await fetch("/api/dashboard");
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalFocals = data.reduce((sum, d) => sum + d.focals, 0);
  const totalTickets = data.reduce((sum, d) => sum + d.tickets, 0);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Team Dashboard</h1>
      <p style={{ color: "#666", marginBottom: 32 }}>
        Totalt: {totalFocals} focals, {totalTickets} tickets
      </p>

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

const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: 14,
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontSize: 15,
};
