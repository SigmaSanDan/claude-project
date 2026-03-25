import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabase
    .from("iterations")
    .select("*")
    .order("deploy_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, solution_proposal_date, dev_freeze_date, deploy_date } = body;

  if (!name) return NextResponse.json({ error: "Namn krävs" }, { status: 400 });

  const { data, error } = await supabase
    .from("iterations")
    .insert({ name, solution_proposal_date, dev_freeze_date, deploy_date })
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
    .from("iterations")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
