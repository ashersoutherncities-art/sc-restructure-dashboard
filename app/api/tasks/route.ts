import { NextRequest, NextResponse } from "next/server";
import { getServerClient, T } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const sb = getServerClient();
  const projectId = req.nextUrl.searchParams.get("project_id");
  let q = sb.from(T.tasks).select("*").order("created_at", { ascending: false });
  if (projectId) q = q.eq("project_id", projectId);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const sb = getServerClient();
  const { data, error } = await sb.from(T.tasks).insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
