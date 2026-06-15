export type Person = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  color: string;
  created_at: string;
};

export type Project = {
  id: string;
  property_address: string;
  owner_bucket: string;
  phase: string;
  status: string;
  upb: number | null;
  undrawn: number | null;
  monthly_payment: number | null;
  implied_arv: number | null;
  lender: string | null;
  servicing_status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskStatus = "todo" | "in_progress" | "done" | "blocked";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type Task = {
  id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  assignee_id: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
  completed_at: string | null;
  completed_by: string | null;
};

export type TaskNote = {
  id: string;
  task_id: string;
  author_id: string | null;
  content: string;
  created_at: string;
};

export const PHASES = [
  "Phase 1A: Short Sale",
  "Phase 1B: Clean Transfer",
  "Phase 2: GC Pipeline",
  "Phase 3: Iantha Refi",
  "Phase 4: Active Build",
] as const;

export const STATUSES = ["Not Started", "In Progress", "Blocked", "Complete"] as const;

export const TASK_STATUSES: TaskStatus[] = ["todo", "in_progress", "done", "blocked"];
export const TASK_PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"];
