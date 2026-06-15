type Variant = "project" | "task" | "priority";

export function StatusBadge({ value, variant }: { value: string; variant: Variant }) {
  const map: Record<string, string> = {
    // project statuses
    "Not Started": "bg-gray-100 text-gray-700",
    "In Progress": "bg-blue-100 text-blue-800",
    "Blocked": "bg-red-100 text-red-800",
    "Complete": "bg-emerald-100 text-emerald-800",
    // task statuses
    todo: "bg-gray-100 text-gray-700",
    in_progress: "bg-blue-100 text-blue-800",
    done: "bg-emerald-100 text-emerald-800",
    blocked: "bg-red-100 text-red-800",
    // priority
    low: "bg-gray-100 text-gray-600",
    medium: "bg-sky-100 text-sky-800",
    high: "bg-amber-100 text-amber-800",
    urgent: "bg-red-100 text-red-800",
  };

  const label =
    variant === "task" || variant === "priority"
      ? value.replace("_", " ")
      : value;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] rounded-full font-medium capitalize ${
        map[value] || "bg-gray-100 text-gray-700"
      }`}
    >
      {label}
    </span>
  );
}
