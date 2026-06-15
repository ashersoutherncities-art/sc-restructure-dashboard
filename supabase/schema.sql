-- SC Restructure Dashboard schema
-- Tables are prefixed `sc_restructure_` to coexist with other apps
-- in the shared Supabase project.

create extension if not exists "pgcrypto";

drop table if exists sc_restructure_task_notes cascade;
drop table if exists sc_restructure_tasks cascade;
drop table if exists sc_restructure_projects cascade;
drop table if exists sc_restructure_people cascade;

create table sc_restructure_people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  role text,
  color text default '#fa8c41',
  created_at timestamptz default now()
);

create table sc_restructure_projects (
  id uuid primary key default gen_random_uuid(),
  property_address text not null,
  owner_bucket text not null,
  phase text not null,
  status text default 'Not Started',
  upb numeric,
  undrawn numeric,
  monthly_payment numeric,
  implied_arv numeric,
  lender text,
  servicing_status text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table sc_restructure_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references sc_restructure_projects(id) on delete cascade,
  title text not null,
  description text,
  assignee_id uuid references sc_restructure_people(id) on delete set null,
  status text default 'todo',
  priority text default 'medium',
  due_date date,
  created_at timestamptz default now(),
  completed_at timestamptz,
  completed_by uuid references sc_restructure_people(id) on delete set null
);

create table sc_restructure_task_notes (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references sc_restructure_tasks(id) on delete cascade,
  author_id uuid references sc_restructure_people(id) on delete set null,
  content text not null,
  created_at timestamptz default now()
);

create index on sc_restructure_tasks (project_id);
create index on sc_restructure_tasks (assignee_id);
create index on sc_restructure_tasks (status);
create index on sc_restructure_task_notes (task_id);
create index on sc_restructure_projects (phase);
create index on sc_restructure_projects (owner_bucket);
