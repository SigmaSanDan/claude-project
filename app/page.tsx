import { supabase } from "@/lib/supabase";

type Developer = {
  id: number;
  name: string;
};

type CountRow = {
  developer_id: number;
  count: number;
};

async function getDashboardData() {
  const [{ data: developers }, { data: focalCounts }, { data: ticketCounts }] =
    await Promise.all([
      supabase.from("developers").select("id, name").order("name"),
      supabase
        .from("focals")
        .select("developer_id")
        .not("developer_id", "is", null)
        .in("status", ["open", "in_progress"]),
      supabase
        .from("tickets")
        .select("developer_id")
        .not("developer_id", "is", null)
        .in("status", ["open", "in_progress"]),
    ]);

  const focalMap = new Map<number, number>();
  (focalCounts ?? []).forEach((r: { developer_id: number }) => {
    focalMap.set(r.developer_id, (focalMap.get(r.developer_id) ?? 0) + 1);
  });

  const ticketMap = new Map<number, number>();
  (ticketCounts ?? []).forEach((r: { developer_id: number }) => {
    ticketMap.set(r.developer_id, (ticketMap.get(r.developer_id) ?? 0) + 1);
  });

  return (developers ?? []).map((dev: Developer) => ({
    name: dev.name,
    focals: focalMap.get(dev.id) ?? 0,
    tickets: ticketMap.get(dev.id) ?? 0,
    total: (focalMap.get(dev.id) ?? 0) + (ticketMap.get(dev.id) ?? 0),
  }));
}

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const data = await getDashboardData();
  const totalFocals = data.reduce((sum, d) => sum + d.focals, 0);
  const totalTickets = data.reduce((sum, d) => sum + d.tickets, 0);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Team Dashboard</h1>
      <p style={{ color: "#666", marginBottom: 32 }}>
        Totalt: {totalFocals} focals, {totalTickets} tickets
      </p>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "white",
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
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

      <p style={{ marginTop: 16, fontSize: 13, color: "#999" }}>
        Visar aktiva ärenden (open / in_progress)
      </p>
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
