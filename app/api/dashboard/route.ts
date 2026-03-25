import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const [{ data: developers }, { data: focals }, { data: ticketCounts }] =
    await Promise.all([
      supabase.from("developers").select("id, name").order("name"),
      supabase
        .from("focals")
        .select("developer_id, priority")
        .not("developer_id", "is", null)
        .in("status", ["open", "in_progress"]),
      supabase
        .from("tickets")
        .select("developer_id")
        .not("developer_id", "is", null)
        .in("status", ["open", "in_progress"]),
    ]);

  type FocalRow = { developer_id: number; priority: string };

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
  (ticketCounts ?? []).forEach((r: { developer_id: number }) => {
    ticketMap.set(r.developer_id, (ticketMap.get(r.developer_id) ?? 0) + 1);
  });

  const result = (developers ?? []).map((dev: { id: number; name: string }) => ({
    name: dev.name,
    focals: focalMap.get(dev.id) ?? 0,
    focals_critical: criticalMap.get(dev.id) ?? 0,
    focals_high: highMap.get(dev.id) ?? 0,
    tickets: ticketMap.get(dev.id) ?? 0,
    total: (focalMap.get(dev.id) ?? 0) + (ticketMap.get(dev.id) ?? 0),
  }));

  return NextResponse.json(result);
}
