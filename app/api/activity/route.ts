import { NextResponse } from "next/server";
import { getServerClient, T } from "@/lib/supabase";

export async function GET() {
  const sb = getServerClient();
  const [notesRes, tasksRes] = await Promise.all([
    sb
      .from(T.notes)
      .select("id, task_id, author_id, content, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
    sb
      .from(T.tasks)
      .select("id, project_id, title, status, completed_at, completed_by, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (notesRes.error)
    return NextResponse.json({ error: notesRes.error.message }, { status: 500 });
  if (tasksRes.error)
    return NextResponse.json({ error: tasksRes.error.message }, { status: 500 });

  const notesEvents = (notesRes.data ?? []).map((n) => ({
    kind: "note" as const,
    id: n.id,
    task_id: n.task_id,
    author_id: n.author_id,
    content: n.content,
    created_at: n.created_at,
  }));
  const tasksEvents = (tasksRes.data ?? []).map((t) => ({
    kind: t.status === "done" && t.completed_at ? ("completed" as const) : ("created" as const),
    id: t.id,
    task_id: t.id,
    project_id: t.project_id,
    title: t.title,
    actor_id: t.completed_by,
    created_at: t.completed_at ?? t.created_at,
  }));

  const merged = [...notesEvents, ...tasksEvents]
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, 15);

  return NextResponse.json(merged);
}
