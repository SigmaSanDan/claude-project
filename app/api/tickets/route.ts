import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { ticket_number, title, developer_id, iteration_id, status } = body;

  if (!ticket_number) {
    return NextResponse.json({ error: "ticket_number krävs" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("tickets")
    .insert({ ticket_number, title, developer_id: developer_id || null, iteration_id: iteration_id || null, status: status || "open" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "id krävs" }, { status: 400 });

  const { data, error } = await supabase
    .from("tickets")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
