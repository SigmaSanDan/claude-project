import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { focal_number, title, developer_id, status } = body;

  if (!focal_number) {
    return NextResponse.json({ error: "focal_number krävs" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("focals")
    .insert({ focal_number, title, developer_id: developer_id || null, status: status || "open" })
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
    .from("focals")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
