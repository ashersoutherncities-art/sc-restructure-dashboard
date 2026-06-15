/* Seed script — pre-populates SC Restructure Dashboard with people, projects, tasks. */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  try {
    const raw = readFileSync(join(__dirname, "..", ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {}
}
loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const T = {
  people: "sc_restructure_people",
  projects: "sc_restructure_projects",
  tasks: "sc_restructure_tasks",
  notes: "sc_restructure_task_notes",
};

async function wipe() {
  console.log("Clearing existing data...");
  await sb.from(T.notes).delete().not("id", "is", null);
  await sb.from(T.tasks).delete().not("id", "is", null);
  await sb.from(T.projects).delete().not("id", "is", null);
  await sb.from(T.people).delete().not("id", "is", null);
}

async function seedPeople() {
  console.log("Seeding people...");
  const people = [
    {
      name: "Darius Walton",
      email: "dariuswalton906@gmail.com",
      role: "Admin",
      color: "#132452",
    },
    { name: "Iantha", role: "Partner", color: "#fa8c41" },
    { name: "Josiah", role: "Partner", color: "#1e8449" },
  ];
  const { data, error } = await sb.from(T.people).insert(people).select();
  if (error) throw error;
  const byName = Object.fromEntries(data.map((p) => [p.name, p.id]));
  console.log(`  Inserted ${data.length} people`);
  return byName;
}

async function seedProjects() {
  console.log("Seeding projects...");
  const projects = [
    // Phase 1A: Short Sale
    {
      property_address: "1105 Hoover St, Mt Holly NC",
      owner_bucket: "Madison",
      phase: "Phase 1A: Short Sale",
      status: "Not Started",
      upb: 175700,
      undrawn: 41500,
      monthly_payment: 1749.68,
      implied_arv: 271500,
      lender: "Kiavi",
      servicing_status: "DQ60 / Collections",
    },
    {
      property_address: "114 Corban Ave SE, Concord NC",
      owner_bucket: "Madison",
      phase: "Phase 1A: Short Sale",
      status: "Not Started",
      upb: 276085,
      undrawn: 53410,
      monthly_payment: 2528.48,
      implied_arv: 439326,
      lender: "Kiavi",
      servicing_status: "Reperforming / returned pmt",
    },
    {
      property_address: "913 Church St, Newport NC",
      owner_bucket: "Madison",
      phase: "Phase 1A: Short Sale",
      status: "Not Started",
      upb: 235403,
      undrawn: 76497,
      monthly_payment: 1665.48,
      implied_arv: 415867,
      lender: "Kiavi",
      servicing_status: "DQ60 / Collections",
    },
    // Phase 1B: Clean Transfer
    {
      property_address: "202 Pine Dale Rd, Havelock NC",
      owner_bucket: "Madison",
      phase: "Phase 1B: Clean Transfer",
      status: "Not Started",
      upb: 216929,
      undrawn: 671,
      monthly_payment: 2160.25,
      implied_arv: 290133,
      lender: "Kiavi",
      servicing_status: "Reperforming / returned pmt",
    },
    {
      property_address: "215 Trappers Trail, New Bern NC",
      owner_bucket: "Madison",
      phase: "Phase 1B: Clean Transfer",
      status: "Not Started",
      upb: 236100,
      undrawn: 0,
      monthly_payment: 2162.28,
      implied_arv: 314800,
      lender: "Kiavi",
      servicing_status: "Reperforming / returned pmt",
    },
    {
      property_address: "1311 N Main St, Lenoir NC",
      owner_bucket: "Trisha",
      phase: "Phase 1B: Clean Transfer",
      status: "Blocked",
      upb: 267000,
      undrawn: 65200,
      monthly_payment: 2670,
      implied_arv: 511077,
      lender: "GLS",
      servicing_status: "Foreclosure 133d overdue",
      notes: "URGENT. GLS foreclosure timer running.",
    },
    {
      property_address: "333 Dobbs St, Hertford NC",
      owner_bucket: "Trisha",
      phase: "Phase 1B: Clean Transfer",
      status: "Blocked",
      upb: 168000,
      undrawn: 41700,
      monthly_payment: 1680,
      implied_arv: 322615,
      lender: "GLS",
      servicing_status: "Foreclosure 133d overdue",
      notes: "URGENT. GLS foreclosure timer running.",
    },
    {
      property_address: "1209 National Ave, New Bern NC",
      owner_bucket: "Justin Gadson",
      phase: "Phase 1B: Clean Transfer",
      status: "Not Started",
      upb: 310295,
      undrawn: 8405,
      monthly_payment: 2841.79,
      implied_arv: 424933,
      lender: "Kiavi",
      servicing_status: "Current, matures 2026-08-01",
    },
    {
      property_address: "723 Pee Dee Ave, Albemarle NC",
      owner_bucket: "Justin Gadson",
      phase: "Phase 1B: Clean Transfer",
      status: "Not Started",
      upb: 129600,
      undrawn: 57900,
      monthly_payment: 1186.92,
      implied_arv: 250000,
      lender: "Kiavi",
      servicing_status: "Current, matures 2026-08-01",
    },
    // Phase 3: Iantha Refi Track
    {
      property_address: "226 S Morrow Ave, Albemarle NC",
      owner_bucket: "Iantha",
      phase: "Phase 3: Iantha Refi",
      status: "In Progress",
      undrawn: 18876,
      notes: "DSCR refi target. Blockers: credit score + lot subdivision.",
    },
    {
      property_address: "107 Cherokee Trail, Seven Lakes / West End NC",
      owner_bucket: "Iantha",
      phase: "Phase 3: Iantha Refi",
      status: "Blocked",
      implied_arv: 525000,
      notes: "HOA access issue. Need consistent contractor pass.",
    },
    {
      property_address: "432 Finley Ave, Lenoir NC",
      owner_bucket: "Iantha",
      phase: "Phase 3: Iantha Refi",
      status: "Blocked",
      implied_arv: 230000,
      notes: "Tenant in place. Cash for Keys or eviction required first.",
    },
    // Phase 4: Active Build
    {
      property_address: "701 Live Oak St, Shelby NC",
      owner_bucket: "Josiah",
      phase: "Phase 4: Active Build",
      status: "In Progress",
      undrawn: 69900,
      lender: "Kiavi (DRF Loan #35181365)",
      notes:
        "Trenching/excavation underway. TORC budget rebalance pending CORF submission.",
    },
    {
      property_address: "1115 N Long St, East Spencer NC",
      owner_bucket: "Josiah",
      phase: "Phase 4: Active Build",
      status: "In Progress",
      upb: 135000,
      undrawn: 52500,
      implied_arv: 250000,
      notes: "Framing demo + re-frame required before continuing.",
    },
  ];

  const { data, error } = await sb.from(T.projects).insert(projects).select();
  if (error) throw error;
  console.log(`  Inserted ${data.length} projects`);
  const byAddr = Object.fromEntries(data.map((p) => [p.property_address, p.id]));
  return { byAddr, projects: data };
}

async function seedTasks(peopleByName, projectsByAddr) {
  console.log("Seeding tasks...");
  const D = peopleByName["Darius Walton"];
  const I = peopleByName["Iantha"];
  const J = peopleByName["Josiah"];

  const tasks = [];

  const phase1A = [
    "1105 Hoover St, Mt Holly NC",
    "114 Corban Ave SE, Concord NC",
    "913 Church St, Newport NC",
  ];
  for (const addr of phase1A) {
    const pid = projectsByAddr[addr];
    tasks.push({
      project_id: pid,
      title: "Submit short-sale request to Kiavi servicing",
      priority: "high",
      due_date: "2026-07-15",
      assignee_id: D,
    });
    tasks.push({
      project_id: pid,
      title: "Iantha or Josiah submit offer below UPB",
      priority: "high",
      due_date: "2026-08-01",
    });
  }

  const phase1B = [
    "202 Pine Dale Rd, Havelock NC",
    "215 Trappers Trail, New Bern NC",
    "1311 N Main St, Lenoir NC",
    "333 Dobbs St, Hertford NC",
    "1209 National Ave, New Bern NC",
    "723 Pee Dee Ave, Albemarle NC",
  ];
  for (const addr of phase1B) {
    const pid = projectsByAddr[addr];
    tasks.push({
      project_id: pid,
      title: "Engage RE attorney for transfer docs",
      priority: "high",
      due_date: "2026-07-15",
      assignee_id: D,
    });
    tasks.push({
      project_id: pid,
      title: "Allocate buyer (Iantha or Josiah)",
      priority: "high",
      due_date: "2026-07-01",
      assignee_id: D,
    });
  }

  // Urgent foreclosure call
  for (const addr of ["1311 N Main St, Lenoir NC", "333 Dobbs St, Hertford NC"]) {
    tasks.push({
      project_id: projectsByAddr[addr],
      title: "URGENT: Call GLS to negotiate foreclosure workout",
      priority: "urgent",
      due_date: "2026-06-20",
      assignee_id: D,
    });
  }

  // Justin Gadson maturity tasks
  for (const addr of ["1209 National Ave, New Bern NC", "723 Pee Dee Ave, Albemarle NC"]) {
    tasks.push({
      project_id: projectsByAddr[addr],
      title: "Complete transfer before 2026-08-01 maturity",
      priority: "high",
      due_date: "2026-08-01",
    });
  }

  // 226 S Morrow
  {
    const pid = projectsByAddr["226 S Morrow Ave, Albemarle NC"];
    tasks.push({
      project_id: pid,
      title: "Pull Iantha tri-merge credit report",
      priority: "high",
      due_date: "2026-07-01",
      assignee_id: I,
    });
    tasks.push({
      project_id: pid,
      title: "Engage credit repair specialist",
      priority: "high",
      due_date: "2026-07-15",
    });
    tasks.push({
      project_id: pid,
      title: "File subdivision plat with Stanly County",
      priority: "medium",
      due_date: "2026-08-15",
    });
  }

  // 107 Cherokee
  {
    const pid = projectsByAddr["107 Cherokee Trail, Seven Lakes / West End NC"];
    tasks.push({
      project_id: pid,
      title: "Identify Seven Lakes HOA president / property manager",
      priority: "high",
      due_date: "2026-06-30",
      assignee_id: I,
    });
    tasks.push({
      project_id: pid,
      title: "Request standing contractor access pass",
      priority: "medium",
      due_date: "2026-07-15",
    });
  }

  // 432 Finley
  {
    const pid = projectsByAddr["432 Finley Ave, Lenoir NC"];
    tasks.push({
      project_id: pid,
      title: "Review lease terms (end date, MTM status)",
      priority: "high",
      due_date: "2026-06-30",
    });
    tasks.push({
      project_id: pid,
      title: "Offer Cash for Keys ($1,500 to $3,000)",
      priority: "high",
      due_date: "2026-07-15",
      assignee_id: I,
    });
  }

  // 701 Live Oak
  {
    const pid = projectsByAddr["701 Live Oak St, Shelby NC"];
    tasks.push({
      project_id: pid,
      title: "Submit CORF to changeorders@kiavi.com with v2 rebalanced budget",
      priority: "urgent",
      due_date: "2026-06-20",
      assignee_id: D,
    });
    tasks.push({
      project_id: pid,
      title: "Renegotiate TORC labor down to $21,900",
      priority: "high",
      due_date: "2026-06-25",
      assignee_id: D,
    });
    tasks.push({
      project_id: pid,
      title: "Submit Draw 1 DRF for Foundation + Framing",
      priority: "high",
      due_date: "2026-07-10",
    });
  }

  // 1115 N Long
  {
    const pid = projectsByAddr["1115 N Long St, East Spencer NC"];
    tasks.push({
      project_id: pid,
      title: "Document re-frame scope and cost",
      priority: "high",
      due_date: "2026-06-25",
      assignee_id: J,
    });
    tasks.push({
      project_id: pid,
      title: "Determine framer warranty / liability",
      priority: "high",
      due_date: "2026-06-30",
      assignee_id: D,
    });
  }

  const { data, error } = await sb.from(T.tasks).insert(tasks).select();
  if (error) throw error;
  console.log(`  Inserted ${data.length} tasks`);
}

async function main() {
  await wipe();
  const people = await seedPeople();
  const { byAddr } = await seedProjects();
  await seedTasks(people, byAddr);
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
