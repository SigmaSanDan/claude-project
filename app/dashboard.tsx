"use client";

import { useState, useEffect, useCallback } from "react";
import AddForm from "./add-form";

type DevData = {
  name: string;
  focals: number;
  focals_critical: number;
  focals_high: number;
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

const devPhotos: Record<string, string> = {
  Sebastian: "https://www.attire.se/wp-content/uploads/attire-sebastian-1.webp",
  "Björn": "https://www.attire.se/wp-content/uploads/attire-bjorn-1.webp",
  Rune: "https://www.attire.se/wp-content/uploads/Rune-Bivrin-f.webp",
  Ivo: "https://www.attire.se/wp-content/uploads/Ivo-Kalu-f.webp",
  Lasse: "https://www.attire.se/wp-content/uploads/Lasse-Magnusson-f.webp",
};

const chillQuotes = [
  "Sippar kaffe",
  "Lutar sig tillbaka",
  "Livet e gull",
  "Zen-läge",
  "Netflix-redo",
];

const sweatyQuotes = [
  "Svettas lite...",
  "Kaffe IV-dropp behövs",
  "Det är lugnt... typ",
  "Fler bollar än en jonglör",
  "Hjälp uppskattas",
];

const stressQuotes = [
  "HJÄLP",
  "Skicka Red Bull",
  "Överlevnadsläge",
  "Brinner överallt",
  "Ring ambulansen",
];

function getQuote(total: number, name: string) {
  // Use name as seed for consistent quote per person
  const seed = name.charCodeAt(0) + name.length;
  if (total === 0) return "Väntar på action";
  if (total <= 3) return chillQuotes[seed % chillQuotes.length];
  if (total <= 7) return sweatyQuotes[seed % sweatyQuotes.length];
  return stressQuotes[seed % stressQuotes.length];
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("sv-SE");
}

function daysUntil(d: string | null) {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
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

  const activeIteration = iterations.find((it) => {
    if (!it.deploy_date) return false;
    return new Date(it.deploy_date) >= new Date(new Date().toDateString());
  });

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16, marginBottom: 32 }}>
          {data.map((dev) => (
            <DevCard key={dev.name} dev={dev} />
          ))}
        </div>
      )}

      <AddForm onAdded={loadData} />
    </div>
  );
}

function DevCard({ dev }: { dev: DevData }) {
  const photo = devPhotos[dev.name];

  let borderColor: string;
  let bgColor: string;
  if (dev.total === 0) {
    borderColor = "#e0e0e0";
    bgColor = "#fafafa";
  } else if (dev.total <= 3) {
    borderColor = "#27ae60";
    bgColor = "#f0faf4";
  } else if (dev.total <= 7) {
    borderColor = "#e65100";
    bgColor = "#fff8f0";
  } else {
    borderColor = "#c62828";
    bgColor = "#fff5f5";
  }

  return (
    <div
      style={{
        backgroundColor: bgColor,
        borderRadius: 12,
        padding: 20,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        borderLeft: `4px solid ${borderColor}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo || `https://ui-avatars.com/api/?name=${dev.name}&background=1a1a2e&color=fff&size=160`}
        alt={dev.name}
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          objectFit: "cover",
          objectPosition: "top",
          marginBottom: 12,
          border: `3px solid ${borderColor}`,
        }}
      />

      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{dev.name}</div>
      <div style={{ fontSize: 13, color: "#888", marginBottom: 12, fontStyle: "italic" }}>
        &quot;{getQuote(dev.total, dev.name)}&quot;
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#e74c3c" }}>{dev.focals}</div>
          <div style={{ fontSize: 11, color: "#999" }}>Focals</div>
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#3498db" }}>{dev.tickets}</div>
          <div style={{ fontSize: 11, color: "#999" }}>Tickets</div>
        </div>
      </div>

      {(dev.focals_critical > 0 || dev.focals_high > 0) && (
        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {dev.focals_critical > 0 && (
            <span style={priorityBadge("#c62828")}>{dev.focals_critical} critical</span>
          )}
          {dev.focals_high > 0 && (
            <span style={priorityBadge("#e65100")}>{dev.focals_high} high</span>
          )}
        </div>
      )}

      <WorkloadBar total={dev.total} />
    </div>
  );
}

function WorkloadBar({ total }: { total: number }) {
  let label: string;
  let color: string;
  let barWidth: number;

  if (total === 0) {
    label = "Ledig";
    color = "#bbb";
    barWidth = 0;
  } else if (total <= 3) {
    label = "Chill";
    color = "#27ae60";
    barWidth = Math.round((total / 10) * 100);
  } else if (total <= 7) {
    label = "Svettigt";
    color = "#e65100";
    barWidth = Math.round((total / 10) * 100);
  } else {
    label = "STRESSIGT!";
    color = "#c62828";
    barWidth = 100;
  }

  return (
    <div style={{ width: "100%" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 4 }}>{label}</div>
      <div style={{ height: 6, backgroundColor: "#e0e0e0", borderRadius: 3, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${barWidth}%`,
            backgroundColor: color,
            borderRadius: 3,
            transition: "width 0.3s",
          }}
        />
      </div>
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

const priorityBadge = (bg: string): React.CSSProperties => ({
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: 10,
  backgroundColor: bg,
  color: "white",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.3,
});

const iterationCardStyle: React.CSSProperties = {
  backgroundColor: "white",
  borderRadius: 8,
  padding: 20,
  marginBottom: 24,
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  borderLeft: "4px solid #3498db",
};
