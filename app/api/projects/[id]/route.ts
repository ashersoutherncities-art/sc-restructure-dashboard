import { NextRequest, NextResponse } from "next/server";
import { getServerClient, T } from "@/lib/supabase";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const sb = getServerClient();
  const { data, error } = await sb.from(T.projects).select("*").eq("id", id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json();
  const sb = getServerClient();
  const { data, error } = await sb
    .from(T.projects)
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const sb = getServerClient();
  const { error } = await sb.from(T.projects).delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
