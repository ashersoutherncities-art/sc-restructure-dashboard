"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { StatusBadge } from "@/components/StatusBadge";
import type { Project } from "@/lib/types";
import { PHASES, STATUSES } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

export default function ProjectsListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [phase, setPhase] = useState<string>("All");
  const [owner, setOwner] = useState<string>("All");
  const [status, setStatus] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  const owners = useMemo(
    () => Array.from(new Set(projects.map((p) => p.owner_bucket))).sort(),
    [projects],
  );

  const filtered = projects.filter(
    (p) =>
      (phase === "All" || p.phase === phase) &&
      (owner === "All" || p.owner_bucket === owner) &&
      (status === "All" || p.status === status),
  );

  return (
    <div className="flex-1">
      <Nav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#132452]">Projects</h1>
          <p className="text-sm text-gray-600 mt-1">
            {filtered.length} of {projects.length} properties.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-wrap gap-4 text-sm shadow-sm">
          <FilterChips
            label="Phase"
            value={phase}
            options={["All", ...PHASES]}
            onChange={setPhase}
            displayShort
          />
          <FilterChips
            label="Owner"
            value={owner}
            options={["All", ...owners]}
            onChange={setOwner}
          />
          <FilterChips
            label="Status"
            value={status}
            options={["All", ...STATUSES]}
            onChange={setStatus}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 h-40 animate-pulse" />
              ))
            : filtered.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-[#fa8c41]/50 transition flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs uppercase tracking-wider text-[#fa8c41] font-semibold">
                        {p.phase.split(":")[0]}
                      </div>
                      <div className="text-base font-semibold text-[#132452] mt-0.5 line-clamp-2">
                        {p.property_address}
                      </div>
                    </div>
                    <StatusBadge value={p.status} variant="project" />
                  </div>
                  <div className="text-xs text-gray-500">
                    Owner: <span className="font-medium text-gray-700">{p.owner_bucket}</span>
                    {p.lender && (
                      <>
                        {" · "}Lender: <span className="font-medium text-gray-700">{p.lender}</span>
                      </>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mt-1 pt-3 border-t border-gray-100">
                    <Stat label="UPB" value={formatMoney(p.upb)} />
                    <Stat label="Undrawn" value={formatMoney(p.undrawn)} />
                    <Stat label="Monthly" value={formatMoney(p.monthly_payment)} />
                    <Stat label="ARV" value={formatMoney(p.implied_arv)} />
                  </div>
                </Link>
              ))}
        </div>
      </main>
    </div>
  );
}

function FilterChips({
  label,
  value,
  options,
  onChange,
  displayShort = false,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  displayShort?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="text-xs uppercase tracking-wider text-gray-500 mr-1">
        {label}:
      </span>
      {options.map((opt) => {
        const active = value === opt;
        const display = displayShort && opt.includes(":") ? opt.split(":")[0] : opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-2.5 py-1 text-xs rounded-full border transition ${
              active
                ? "bg-[#132452] text-white border-[#132452]"
                : "bg-white text-gray-700 border-gray-200 hover:border-[#fa8c41]"
            }`}
          >
            {display}
          </button>
        );
      })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-gray-400">{label}</div>
      <div className="text-sm font-medium text-gray-800">{value}</div>
    </div>
  );
}
