"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderKanban,
  CheckSquare,
  AlertTriangle,
  Users,
  Clock,
  MessageSquare,
  PlusCircle,
} from "lucide-react";
import { Nav } from "@/components/Nav";
import { StatusBadge } from "@/components/StatusBadge";
import { Avatar } from "@/components/Avatar";
import { useActingAs } from "@/components/ActingAsProvider";
import type { Project, Task } from "@/lib/types";
import { PHASES } from "@/lib/types";
import { formatDistanceToNow, isPast, parseISO } from "date-fns";

type Activity = {
  kind: "note" | "completed" | "created";
  id: string;
  task_id: string;
  project_id?: string | null;
  content?: string;
  title?: string;
  author_id?: string | null;
  actor_id?: string | null;
  created_at: string;
};

export default function DashboardPage() {
  const { people } = useActingAs();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then((r) => r.json()),
      fetch("/api/tasks").then((r) => r.json()),
      fetch("/api/activity").then((r) => r.json()),
    ])
      .then(([p, t, a]) => {
        setProjects(p);
        setTasks(t);
        setActivity(a);
      })
      .finally(() => setLoading(false));
  }, []);

  const peopleById = new Map(people.map((p) => [p.id, p]));
  const projectById = new Map(projects.map((p) => [p.id, p]));

  const activeTasks = tasks.filter((t) => t.status !== "done").length;
  const overdueTasks = tasks.filter(
    (t) => t.status !== "done" && t.due_date && isPast(parseISO(t.due_date)),
  ).length;

  const stats = [
    {
      label: "Projects",
      value: projects.length,
      icon: FolderKanban,
      color: "bg-[#132452]",
    },
    {
      label: "Active Tasks",
      value: activeTasks,
      icon: CheckSquare,
      color: "bg-[#fa8c41]",
    },
    {
      label: "Overdue",
      value: overdueTasks,
      icon: AlertTriangle,
      color: "bg-red-600",
    },
    {
      label: "People",
      value: people.length,
      icon: Users,
      color: "bg-emerald-600",
    },
  ];

  const projectsByPhase = PHASES.map((phase) => ({
    phase,
    projects: projects.filter((p) => p.phase === phase),
  })).filter((g) => g.projects.length > 0);

  return (
    <div className="flex-1">
      <Nav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex items-end justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#132452]">
              Portfolio Restructuring
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              14 properties. 9 transfers in motion. 5 strategic holds.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
              >
                <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center text-white`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#132452] leading-none">
                    {loading ? "..." : s.value}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">
                    {s.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#132452]">Projects by Phase</h2>
            <Link href="/projects" className="text-sm text-[#fa8c41] hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projectsByPhase.map((g) => (
              <div key={g.phase} className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="text-xs uppercase tracking-wider text-[#fa8c41] font-semibold">
                    {g.phase.split(":")[0]}
                  </div>
                  <div className="text-sm font-medium text-[#132452]">
                    {g.phase.split(":").slice(1).join(":").trim() || g.phase}
                  </div>
                </div>
                <ul className="divide-y divide-gray-100">
                  {g.projects.map((p) => {
                    const projectTasks = tasks.filter((t) => t.project_id === p.id);
                    const done = projectTasks.filter((t) => t.status === "done").length;
                    return (
                      <li key={p.id}>
                        <Link
                          href={`/projects/${p.id}`}
                          className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-gray-50 transition"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-[#132452] truncate">
                              {p.property_address}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {p.owner_bucket}
                              {projectTasks.length > 0 &&
                                ` · ${done}/${projectTasks.length} tasks done`}
                            </div>
                          </div>
                          <StatusBadge value={p.status} variant="project" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#132452]">Recent Activity</h2>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          {activity.length === 0 ? (
            <div className="px-4 py-8 text-sm text-gray-500 text-center">
              No activity yet. Activity will appear as tasks are created, completed, or commented on.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {activity.slice(0, 10).map((a) => {
                const project = a.project_id ? projectById.get(a.project_id) : null;
                const author =
                  (a.author_id && peopleById.get(a.author_id)) ||
                  (a.actor_id && peopleById.get(a.actor_id)) ||
                  null;
                return (
                  <li key={`${a.kind}-${a.id}`} className="px-4 py-3 flex items-start gap-3">
                    <div className="mt-0.5">
                      {a.kind === "note" ? (
                        <MessageSquare className="w-4 h-4 text-[#fa8c41]" />
                      ) : a.kind === "completed" ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <PlusCircle className="w-4 h-4 text-[#132452]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-800">
                        {a.kind === "note" ? (
                          <>
                            <span className="font-medium">
                              {author?.name || "Someone"}
                            </span>{" "}
                            commented:{" "}
                            <span className="text-gray-600">{a.content}</span>
                          </>
                        ) : a.kind === "completed" ? (
                          <>
                            Completed{" "}
                            <Link
                              href={`/tasks/${a.task_id}`}
                              className="font-medium text-[#132452] hover:underline"
                            >
                              {a.title}
                            </Link>
                          </>
                        ) : (
                          <>
                            New task{" "}
                            <Link
                              href={`/tasks/${a.task_id}`}
                              className="font-medium text-[#132452] hover:underline"
                            >
                              {a.title}
                            </Link>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {project && (
                          <Link
                            href={`/projects/${project.id}`}
                            className="hover:underline"
                          >
                            {project.property_address}
                          </Link>
                        )}
                        {project && " · "}
                        {formatDistanceToNow(parseISO(a.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    {author && <Avatar person={author} size="xs" />}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
