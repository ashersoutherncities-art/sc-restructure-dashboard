"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  CheckCircle2,
  Circle,
  AlertCircle,
  Loader2,
  CalendarDays,
  Building2,
  DollarSign,
  Banknote,
  TrendingUp,
} from "lucide-react";
import { Nav } from "@/components/Nav";
import { StatusBadge } from "@/components/StatusBadge";
import { Avatar } from "@/components/Avatar";
import { useActingAs } from "@/components/ActingAsProvider";
import type {
  Project,
  Task,
  TaskNote,
  TaskPriority,
  TaskStatus,
} from "@/lib/types";
import { STATUSES, TASK_PRIORITIES } from "@/lib/types";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { formatMoney, isTaskOverdue } from "@/lib/utils";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { people, actingAs } = useActingAs();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<TaskNote[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  const peopleById = new Map(people.map((p) => [p.id, p]));
  const tasksById = new Map(tasks.map((t) => [t.id, t]));

  async function load() {
    const [p, t] = await Promise.all([
      fetch(`/api/projects/${id}`).then((r) => r.json()),
      fetch(`/api/tasks?project_id=${id}`).then((r) => r.json()),
    ]);
    setProject(p);
    setTasks(t);

    if (t.length > 0) {
      const allNotes = await Promise.all(
        t.map((task: Task) =>
          fetch(`/api/tasks/${task.id}/notes`).then((r) => r.json()),
        ),
      );
      setNotes(allNotes.flat());
    } else {
      setNotes([]);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function toggleDone(t: Task) {
    const next: TaskStatus = t.status === "done" ? "todo" : "done";
    const body: Record<string, unknown> = { status: next };
    if (next === "done" && actingAs) body.completed_by = actingAs.id;
    await fetch(`/api/tasks/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    load();
  }

  async function setStatus(newStatus: string) {
    if (!project) return;
    await fetch(`/api/projects/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    load();
  }

  async function addTask(form: NewTaskValues) {
    setSaving(true);
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: id,
        title: form.title,
        description: form.description || null,
        assignee_id: form.assignee_id || null,
        priority: form.priority,
        due_date: form.due_date || null,
      }),
    });
    setSaving(false);
    setShowAdd(false);
    load();
  }

  if (!project) {
    return (
      <div className="flex-1">
        <Nav />
        <main className="max-w-5xl mx-auto px-4 py-12 text-center text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        </main>
      </div>
    );
  }

  const stats: { label: string; value: string; icon: typeof DollarSign }[] = [
    { label: "UPB", value: formatMoney(project.upb), icon: DollarSign },
    { label: "Undrawn", value: formatMoney(project.undrawn), icon: Banknote },
    { label: "Monthly", value: formatMoney(project.monthly_payment), icon: CalendarDays },
    { label: "Implied ARV", value: formatMoney(project.implied_arv), icon: TrendingUp },
  ];

  return (
    <div className="flex-1">
      <Nav />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#132452]"
        >
          <ArrowLeft className="w-4 h-4" /> All projects
        </Link>

        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wider text-[#fa8c41] font-semibold">
                {project.phase}
              </div>
              <h1 className="text-2xl font-bold text-[#132452] mt-1 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#fa8c41] shrink-0" />
                {project.property_address}
              </h1>
              <div className="text-sm text-gray-600 mt-1">
                Owner: <span className="font-medium text-gray-800">{project.owner_bucket}</span>
                {project.lender && (
                  <>
                    {" · "}Lender: <span className="font-medium text-gray-800">{project.lender}</span>
                  </>
                )}
                {project.servicing_status && (
                  <>
                    {" · "}
                    <span className="font-medium text-gray-800">{project.servicing_status}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={project.status}
                onChange={(e) => setStatus(e.target.value)}
                className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <StatusBadge value={project.status} variant="project" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="bg-gray-50 rounded-lg p-3 flex items-center gap-3"
                >
                  <Icon className="w-4 h-4 text-[#fa8c41]" />
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500">
                      {s.label}
                    </div>
                    <div className="text-sm font-semibold text-[#132452]">
                      {s.value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {project.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 text-sm text-amber-900">
              {project.notes}
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#132452]">
              Tasks ({tasks.length})
            </h2>
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 bg-[#fa8c41] hover:bg-[#e87a30] text-white rounded-lg font-medium transition"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>
          <ul className="divide-y divide-gray-100">
            {tasks.length === 0 ? (
              <li className="px-5 py-8 text-sm text-gray-500 text-center">
                No tasks yet. Add the first one.
              </li>
            ) : (
              tasks.map((t) => {
                const assignee = t.assignee_id ? peopleById.get(t.assignee_id) : null;
                const overdue = isTaskOverdue(t);
                return (
                  <li key={t.id} className="px-5 py-3 flex items-center gap-3">
                    <button
                      onClick={() => toggleDone(t)}
                      className="shrink-0"
                      title={t.status === "done" ? "Mark not done" : "Mark done"}
                    >
                      {t.status === "done" ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : t.status === "blocked" ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 hover:text-[#fa8c41]" />
                      )}
                    </button>
                    <Link
                      href={`/tasks/${t.id}`}
                      className="flex-1 min-w-0"
                    >
                      <div
                        className={`text-sm font-medium ${
                          t.status === "done"
                            ? "text-gray-400 line-through"
                            : "text-[#132452]"
                        }`}
                      >
                        {t.title}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                        <StatusBadge value={t.priority} variant="priority" />
                        <StatusBadge value={t.status} variant="task" />
                        {t.due_date && (
                          <span className={overdue ? "text-red-600 font-medium" : ""}>
                            Due {format(parseISO(t.due_date), "MMM d")}
                          </span>
                        )}
                      </div>
                    </Link>
                    {assignee && <Avatar person={assignee} size="sm" />}
                  </li>
                );
              })
            )}
          </ul>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-[#132452]">Activity</h2>
          </div>
          {notes.length === 0 ? (
            <div className="px-5 py-8 text-sm text-gray-500 text-center">
              No notes yet. Add a note from any task.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notes
                .slice()
                .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
                .map((n) => {
                  const author = n.author_id ? peopleById.get(n.author_id) : null;
                  const task = tasksById.get(n.task_id);
                  return (
                    <li key={n.id} className="px-5 py-3 flex items-start gap-3">
                      {author ? (
                        <Avatar person={author} size="sm" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gray-200" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-800">
                          <span className="font-medium">
                            {author?.name || "Someone"}
                          </span>{" "}
                          on{" "}
                          {task ? (
                            <Link
                              href={`/tasks/${task.id}`}
                              className="font-medium text-[#132452] hover:underline"
                            >
                              {task.title}
                            </Link>
                          ) : (
                            "a task"
                          )}
                        </div>
                        <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                          {n.content}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(parseISO(n.created_at), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    </li>
                  );
                })}
            </ul>
          )}
        </section>
      </main>

      {showAdd && (
        <AddTaskModal
          onClose={() => setShowAdd(false)}
          onSubmit={addTask}
          people={people}
          defaultAssignee={actingAs?.id ?? null}
          saving={saving}
        />
      )}
    </div>
  );
}

type NewTaskValues = {
  title: string;
  description: string;
  assignee_id: string;
  priority: TaskPriority;
  due_date: string;
};

function AddTaskModal({
  onClose,
  onSubmit,
  people,
  defaultAssignee,
  saving,
}: {
  onClose: () => void;
  onSubmit: (v: NewTaskValues) => void;
  people: { id: string; name: string }[];
  defaultAssignee: string | null;
  saving: boolean;
}) {
  const [v, setV] = useState<NewTaskValues>({
    title: "",
    description: "",
    assignee_id: defaultAssignee ?? "",
    priority: "medium",
    due_date: "",
  });

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-xl shadow-xl p-5 space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-[#132452]">New Task</h3>
        <input
          autoFocus
          placeholder="Title"
          value={v.title}
          onChange={(e) => setV({ ...v, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#fa8c41]"
        />
        <textarea
          placeholder="Description (optional)"
          value={v.description}
          onChange={(e) => setV({ ...v, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#fa8c41]"
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            value={v.assignee_id}
            onChange={(e) => setV({ ...v, assignee_id: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Unassigned</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            value={v.priority}
            onChange={(e) =>
              setV({ ...v, priority: e.target.value as TaskPriority })
            }
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm capitalize"
          >
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <input
          type="date"
          value={v.due_date}
          onChange={(e) => setV({ ...v, due_date: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => v.title && onSubmit(v)}
            disabled={!v.title || saving}
            className="flex-1 px-4 py-2 bg-[#fa8c41] hover:bg-[#e87a30] text-white rounded-lg text-sm font-medium disabled:opacity-60"
          >
            {saving ? "Saving..." : "Add Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
