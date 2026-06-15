# SC Restructure Dashboard

Custom project management dashboard for Southern Cities Enterprises'
2026 portfolio restructuring. Tracks 14 real estate properties across
short-sale, clean-transfer, refi, and active-build phases.

## Stack

- Next.js 16 (App Router, TypeScript, Turbopack)
- Tailwind CSS v4
- Supabase (Postgres)
- Vercel hosting
- Password-gate auth via middleware

## Local setup

```bash
cp .env.example .env.local
# fill in Supabase keys + DASHBOARD_PASSWORD
npm install
npm run seed   # pre-populates people, projects, tasks
npm run dev
```

## Database schema

Schema lives in `supabase/schema.sql`. Tables are prefixed
`sc_restructure_` so they coexist with other apps in the shared
Supabase project. Apply with:

```bash
psql "$DATABASE_URL" -f supabase/schema.sql
```

## Pages

- `/` dashboard with stats, projects-by-phase, recent activity
- `/projects` filterable project list
- `/projects/[id]` project detail with tasks and activity
- `/people` team management
- `/tasks/[id]` task detail with notes thread
