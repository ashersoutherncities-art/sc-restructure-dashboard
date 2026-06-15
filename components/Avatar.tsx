import type { Person } from "@/lib/types";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({
  person,
  size = "md",
}: {
  person: Pick<Person, "name" | "color">;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const sizes: Record<string, string> = {
    xs: "w-5 h-5 text-[9px]",
    sm: "w-7 h-7 text-[10px]",
    md: "w-9 h-9 text-xs",
    lg: "w-12 h-12 text-sm",
  };
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
      style={{ background: person.color || "#fa8c41" }}
      title={person.name}
    >
      {initials(person.name)}
    </div>
  );
}
