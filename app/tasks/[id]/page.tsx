"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Loader2, Trash2 } from "lucide-react";
import { Nav } from "@/components/Nav";
import { StatusBadge } from "@/components/StatusBadge";
import { Avatar } from "@/components/Avatar";
import { useActingAs } from "@/components/ActingAsProvider";
import type { Task, TaskNote, TaskStatus, TaskPriority, Project } from "@/lib/types";
import { TASK_STATUSES, TASK_PRIORITIES } from "@/lib/types";
import { formatDistanceToNow, parseISO, format } from "date-fns";
import { useRouter } from "next/navigation";

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { people, actingAs } = useActingAs();
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [notes, setNotes] = useState<TaskNote[]>([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const peopleById = new Map(people.map((p) => [p.id, p]));

  async function load() {
    const t: Task = await fetch(`/api/tasks/${id}`).then((r) => r.json());
    setTask(t);
    if (t.project_id) {
      const p: Project = await fetch(`/api/projects/${t.project_id}`).then((r) => r.json());
      setProject(p);
    }
    const n: TaskNote[] = await fetch(`/api/tasks/${id}/notes`).then((r) => r.json());
    setNotes(n);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function update(body: Partial<Task>) {
    const payload: Record<string, unknown> = { ...body };
    if (body.status === "done" && actingAs) payload.completed_by = actingAs.id;
    await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    load();
  }

  async function addNote() {
    if (!note.trim()) return;
    setSubmitting(true);
    await fetch(`/api/tasks/${id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        author_id: actingAs?.id ?? null,
        content: note.trim(),
      }),
    });
    setNote("");
    setSubmitting(false);
    load();
  }

  async function deleteTask() {
    if (!confirm("Delete this task and all its notes?")) return;
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (project) router.push(`/projects/${project.id}`);
    else router.push("/");
  }

  if (!task) {
    return (
      <div className="flex-1">
        <Nav />
        <main className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        </main>
      </div>
    );
  }

  const assignee = task.assignee_id ? peopleById.get(task.assignee_id) : null;

  return (
    <div className="flex-1">
      <Nav />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {project ? (
          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#132452]"
          >
            <ArrowLeft className="w-4 h-4" /> {project.property_address}
          </Link>
        ) : (
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#132452]"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
        )}

        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-[#132452] flex-1">
              {task.title}
            </h1>
            <button
              onClick={deleteTask}
              title="Delete task"
              className="text-gray-400 hover:text-red-600 p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {task.description && (
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {task.description}
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-100">
            <Field label="Status">
              <select
                value={task.status}
                onChange={(e) => update({ status: e.target.value as TaskStatus })}
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1 capitalize"
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Priority">
              <select
                value={task.priority}
                onChange={(e) => update({ priority: e.target.value as TaskPriority })}
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1 capitalize"
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Assignee">
              <select
                value={task.assignee_id ?? ""}
                onChange={(e) =>
                  update({ assignee_id: e.target.value || null })
                }
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1"
              >
                <option value="">Unassigned</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Due date">
              <input
                type="date"
                value={task.due_date ?? ""}
                onChange={(e) => update({ due_date: e.target.value || null })}
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1"
              />
            </Field>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <StatusBadge value={task.status} variant="task" />
            <StatusBadge value={task.priority} variant="priority" />
            {task.due_date && (
              <span className="text-xs text-gray-500">
                Due {format(parseISO(task.due_date), "MMM d, yyyy")}
              </span>
            )}
            {assignee && (
              <div className="ml-auto flex items-center gap-2 text-xs text-gray-600">
                Assigned to <Avatar person={assignee} size="xs" /> {assignee.name}
              </div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-[#132452]">Notes</h2>
          </div>
          <ul className="divide-y divide-gray-100">
            {notes.length === 0 ? (
              <li className="px-5 py-8 text-sm text-gray-500 text-center">
                No notes yet. Be the first to add one.
              </li>
            ) : (
              notes.map((n) => {
                const author = n.author_id ? peopleById.get(n.author_id) : null;
                return (
                  <li key={n.id} className="px-5 py-3 flex items-start gap-3">
                    {author ? (
                      <Avatar person={author} size="sm" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gray-200" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500">
                        <span className="font-medium text-gray-800">
                          {author?.name || "Someone"}
                        </span>{" "}
                        ·{" "}
                        {formatDistanceToNow(parseISO(n.created_at), {
                          addSuffix: true,
                        })}
                      </div>
                      <div className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">
                        {n.content}
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
          <div className="border-t border-gray-100 p-3 flex gap-2">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                actingAs
                  ? `Add a note as ${actingAs.name}...`
                  : "Add a note..."
              }
              rows={2}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#fa8c41]"
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") addNote();
              }}
            />
            <button
              onClick={addNote}
              disabled={!note.trim() || submitting}
              className="self-end px-4 py-2 bg-[#fa8c41] hover:bg-[#e87a30] text-white rounded-lg text-sm font-medium disabled:opacity-60 flex items-center gap-1"
            >
              <Send className="w-4 h-4" />
              Post
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
        {label}
      </div>
      {children}
    </div>
  );
}
