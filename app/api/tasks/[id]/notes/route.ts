import { NextRequest, NextResponse } from "next/server";
import { getServerClient, T } from "@/lib/supabase";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const sb = getServerClient();
  const { data, error } = await sb
    .from(T.notes)
    .select("*")
    .eq("task_id", id)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json();
  const sb = getServerClient();
  const { data, error } = await sb
    .from(T.notes)
    .insert({
      task_id: id,
      author_id: body.author_id ?? null,
      content: body.content,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
