"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Users, LogOut } from "lucide-react";
import { useActingAs } from "./ActingAsProvider";
import { Avatar } from "./Avatar";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/people", label: "People", icon: Users },
];

export function Nav() {
  const pathname = usePathname();
  const { people, actingAs, setActingAs } = useActingAs();

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.href = "/login";
  }

  return (
    <header className="bg-[#132452] text-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded bg-[#fa8c41] flex items-center justify-center font-bold text-[#132452]">
            SC
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-wide">Restructure</div>
            <div className="text-[10px] uppercase tracking-widest text-white/60">
              2026 Portfolio
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-6">
          {links.map((l) => {
            const Icon = l.icon;
            const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded-lg px-2 py-1.5">
            <span className="text-[10px] uppercase tracking-wider text-white/60">
              Acting as
            </span>
            <select
              className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
              value={actingAs?.id ?? ""}
              onChange={(e) => {
                const p = people.find((x) => x.id === e.target.value) ?? null;
                setActingAs(p);
              }}
            >
              {people.length === 0 && <option value="">No people</option>}
              {people.map((p) => (
                <option key={p.id} value={p.id} className="text-black">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          {actingAs && <Avatar person={actingAs} size="sm" />}
          <button
            onClick={logout}
            title="Sign out"
            className="p-2 rounded-lg text-white/70 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <nav className="md:hidden border-t border-white/10">
        <div className="flex">
          {links.map((l) => {
            const Icon = l.icon;
            const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
