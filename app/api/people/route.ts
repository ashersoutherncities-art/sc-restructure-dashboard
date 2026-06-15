import { NextRequest, NextResponse } from "next/server";
import { getServerClient, T } from "@/lib/supabase";

export async function GET() {
  const sb = getServerClient();
  const { data, error } = await sb
    .from(T.people)
    .select("*")
    .order("name", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const sb = getServerClient();
  const { data, error } = await sb.from(T.people).insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
