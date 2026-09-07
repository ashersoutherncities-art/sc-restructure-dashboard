import { isPast, parseISO } from "date-fns";
import type { Task } from "@/lib/types";

export function formatMoney(n: number | null) {
  if (n == null) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function isTaskOverdue(task: Pick<Task, "status" | "due_date">): boolean {
  return task.status !== "done" && !!task.due_date && isPast(parseISO(task.due_date));
}
