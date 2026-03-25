import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const [{ data: developers }, { data: focals }, { data: tickets }] =
    await Promise.all([
      supabase.from("developers").select("id, name").order("name"),
      supabase
        .from("focals")
        .select("developer_id, priority")
        .not("developer_id", "is", null)
        .in("status", ["open", "in_progress"]),
      supabase
        .from("tickets")
        .select("id, ticket_number, title, developer_id, status, iteration_id")
        .not("status", "eq", "done"),
    ]);

  type FocalRow = { developer_id: number; priority: string };
  type TicketRow = { id: number; ticket_number: string; title: string; developer_id: number | null; status: string; iteration_id: number | null };

  const focalMap = new Map<number, number>();
  const criticalMap = new Map<number, number>();
  const highMap = new Map<number, number>();

  (focals ?? []).forEach((r: FocalRow) => {
    focalMap.set(r.developer_id, (focalMap.get(r.developer_id) ?? 0) + 1);
    if (r.priority === "critical") {
      criticalMap.set(r.developer_id, (criticalMap.get(r.developer_id) ?? 0) + 1);
    } else if (r.priority === "high") {
      highMap.set(r.developer_id, (highMap.get(r.developer_id) ?? 0) + 1);
    }
  });

  const ticketMap = new Map<number, number>();
  (tickets ?? []).forEach((r: TicketRow) => {
    if (r.developer_id) {
      ticketMap.set(r.developer_id, (ticketMap.get(r.developer_id) ?? 0) + 1);
    }
  });

  const devs = (developers ?? []).map((dev: { id: number; name: string }) => ({
    name: dev.name,
    focals: focalMap.get(dev.id) ?? 0,
    focals_critical: criticalMap.get(dev.id) ?? 0,
    focals_high: highMap.get(dev.id) ?? 0,
    tickets: ticketMap.get(dev.id) ?? 0,
    total: (focalMap.get(dev.id) ?? 0) + (ticketMap.get(dev.id) ?? 0),
  }));

  // Build developer name lookup
  const devNameMap = new Map<number, string>();
  (developers ?? []).forEach((d: { id: number; name: string }) => devNameMap.set(d.id, d.name));

  const ticketList = (tickets ?? []).map((t: TicketRow) => ({
    id: t.id,
    ticket_number: t.ticket_number,
    title: t.title,
    developer: t.developer_id ? devNameMap.get(t.developer_id) ?? null : null,
    status: t.status,
  }));

  return NextResponse.json({ developers: devs, tickets: ticketList });
}
