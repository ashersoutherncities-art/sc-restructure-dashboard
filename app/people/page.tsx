"use client";

import { useEffect, useState } from "react";
import { Plus, Mail, Phone, Briefcase, Trash2 } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Avatar } from "@/components/Avatar";
import { useActingAs } from "@/components/ActingAsProvider";
import type { Person, Task, Project } from "@/lib/types";
import Link from "next/link";

const PRESET_COLORS = ["#132452", "#fa8c41", "#1e8449", "#7e22ce", "#dc2626", "#0891b2"];

export default function PeoplePage() {
  const { people, refreshPeople } = useActingAs();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/tasks").then((r) => r.json()),
      fetch("/api/projects").then((r) => r.json()),
    ]).then(([t, p]) => {
      setTasks(t);
      setProjects(p);
    });
  }, []);

  const projectsById = new Map(projects.map((p) => [p.id, p]));

  async function addPerson(p: Partial<Person>) {
    await fetch("/api/people", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    });
    setShowAdd(false);
    refreshPeople();
  }

  async function removePerson(id: string) {
    if (!confirm("Remove this person? Their tasks stay but become unassigned.")) return;
    await fetch(`/api/people/${id}`, { method: "DELETE" });
    setOpenId(null);
    refreshPeople();
  }

  return (
    <div className="flex-1">
      <Nav />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#132452]">People</h1>
            <p className="text-sm text-gray-600 mt-1">
              {people.length} on the team.
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 text-sm px-3 py-2 bg-[#fa8c41] hover:bg-[#e87a30] text-white rounded-lg font-medium transition"
          >
            <Plus className="w-4 h-4" /> Add Person
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {people.map((p) => {
            const open = openId === p.id;
            const assigned = tasks.filter((t) => t.assignee_id === p.id);
            const openCount = assigned.filter((t) => t.status !== "done").length;
            return (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm"
              >
                <button
                  onClick={() => setOpenId(open ? null : p.id)}
                  className="w-full px-4 py-4 flex items-center gap-3 text-left"
                >
                  <Avatar person={p} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#132452]">{p.name}</div>
                    <div className="text-xs text-gray-500">
                      {p.role || "Team member"}
                      {assigned.length > 0 && ` · ${openCount} open / ${assigned.length} total`}
                    </div>
                  </div>
                </button>

                {open && (
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                    {(p.email || p.phone) && (
                      <div className="space-y-1 text-sm">
                        {p.email && (
                          <a href={`mailto:${p.email}`} className="flex items-center gap-2 text-gray-700 hover:text-[#fa8c41]">
                            <Mail className="w-4 h-4" /> {p.email}
                          </a>
                        )}
                        {p.phone && (
                          <a href={`tel:${p.phone}`} className="flex items-center gap-2 text-gray-700 hover:text-[#fa8c41]">
                            <Phone className="w-4 h-4" /> {p.phone}
                          </a>
                        )}
                        {p.role && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Briefcase className="w-4 h-4" /> {p.role}
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                        Assigned tasks
                      </div>
                      {assigned.length === 0 ? (
                        <div className="text-xs text-gray-400">None.</div>
                      ) : (
                        <ul className="space-y-1">
                          {assigned.slice(0, 8).map((t) => {
                            const proj = t.project_id ? projectsById.get(t.project_id) : null;
                            return (
                              <li key={t.id}>
                                <Link
                                  href={`/tasks/${t.id}`}
                                  className="block text-xs text-gray-700 hover:text-[#fa8c41]"
                                >
                                  <span
                                    className={
                                      t.status === "done" ? "line-through text-gray-400" : ""
                                    }
                                  >
                                    {t.title}
                                  </span>
                                  {proj && (
                                    <span className="block text-[10px] text-gray-400">
                                      {proj.property_address}
                                    </span>
                                  )}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>

                    <button
                      onClick={() => removePerson(p.id)}
                      className="text-xs text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Remove from team
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {showAdd && (
        <AddPersonModal onClose={() => setShowAdd(false)} onSubmit={addPerson} />
      )}
    </div>
  );
}

function AddPersonModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (p: Partial<Person>) => void;
}) {
  const [v, setV] = useState<Partial<Person>>({
    name: "",
    email: "",
    phone: "",
    role: "",
    color: PRESET_COLORS[1],
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
        <h3 className="text-lg font-semibold text-[#132452]">Add Person</h3>
        <input
          placeholder="Name"
          value={v.name ?? ""}
          onChange={(e) => setV({ ...v, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
        <input
          placeholder="Role (Partner, Attorney, etc.)"
          value={v.role ?? ""}
          onChange={(e) => setV({ ...v, role: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
        <input
          placeholder="Email"
          type="email"
          value={v.email ?? ""}
          onChange={(e) => setV({ ...v, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
        <input
          placeholder="Phone"
          value={v.phone ?? ""}
          onChange={(e) => setV({ ...v, phone: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
            Avatar color
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setV({ ...v, color: c })}
                className={`w-8 h-8 rounded-full border-2 ${v.color === c ? "border-[#132452]" : "border-transparent"}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => v.name && onSubmit(v)}
            disabled={!v.name}
            className="flex-1 px-4 py-2 bg-[#fa8c41] hover:bg-[#e87a30] text-white rounded-lg text-sm font-medium disabled:opacity-60"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
