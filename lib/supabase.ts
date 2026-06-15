import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function getServerClient() {
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase env vars");
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getPublicClient() {
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const T = {
  people: "sc_restructure_people",
  projects: "sc_restructure_projects",
  tasks: "sc_restructure_tasks",
  notes: "sc_restructure_task_notes",
};
