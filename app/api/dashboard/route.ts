import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const [{ data: developers }, { data: focals }, { data: tickets }] =
    await Promise.all([
      supabase.from("developers").select("id, name").order("name"),
      supabase
        .from("focals")
        .select("id, focal_number, title, developer_id, priority, status")
        .not("developer_id", "is", null)
        .in("status", ["open", "in_progress"]),
      supabase
        .from("tickets")
        .select("id, ticket_number, title, developer_id, status, iteration_id")
        .not("status", "eq", "done"),
    ]);

  type FocalRow = { id: number; focal_number: string; title: string; developer_id: number; priority: string; status: string };
  type TicketRow = { id: number; ticket_number: string; title: string; developer_id: number | null; status: string; iteration_id: number | null };

  const devNameMap = new Map<number, string>();
  (developers ?? []).forEach((d: { id: number; name: string }) => devNameMap.set(d.id, d.name));

  // Per-developer focal details
  const devFocals = new Map<number, FocalRow[]>();
  const criticalMap = new Map<number, number>();
  const highMap = new Map<number, number>();

  (focals ?? []).forEach((r: FocalRow) => {
    const list = devFocals.get(r.developer_id) ?? [];
    list.push(r);
    devFocals.set(r.developer_id, list);
    if (r.priority === "critical") criticalMap.set(r.developer_id, (criticalMap.get(r.developer_id) ?? 0) + 1);
    if (r.priority === "high") highMap.set(r.developer_id, (highMap.get(r.developer_id) ?? 0) + 1);
  });

  // Per-developer ticket details
  const devTickets = new Map<number, TicketRow[]>();
  (tickets ?? []).forEach((r: TicketRow) => {
    if (r.developer_id) {
      const list = devTickets.get(r.developer_id) ?? [];
      list.push(r);
      devTickets.set(r.developer_id, list);
    }
  });

  const devs = (developers ?? []).map((dev: { id: number; name: string }) => {
    const focalList = devFocals.get(dev.id) ?? [];
    const ticketList = devTickets.get(dev.id) ?? [];
    return {
      name: dev.name,
      focals: focalList.length,
      focals_critical: criticalMap.get(dev.id) ?? 0,
      focals_high: highMap.get(dev.id) ?? 0,
      focal_items: focalList.map((f) => ({
        focal_number: f.focal_number,
        title: f.title,
        priority: f.priority,
      })),
      tickets: ticketList.length,
      ticket_items: ticketList.map((t) => ({
        ticket_number: t.ticket_number,
        title: t.title,
        status: t.status,
      })),
      total: focalList.length + ticketList.length,
    };
  });

  const allTickets = (tickets ?? []).map((t: TicketRow) => ({
    id: t.id,
    ticket_number: t.ticket_number,
    title: t.title,
    developer: t.developer_id ? devNameMap.get(t.developer_id) ?? null : null,
    status: t.status,
  }));

  return NextResponse.json({ developers: devs, tickets: allTickets });
}
