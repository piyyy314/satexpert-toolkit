# SatExpert Toolkit

A web dashboard for satellite-communications field work. It bundles a field toolkit, link-budget and look-angle calculators, and a view of the owner's GitHub profile, repositories and activity, plus a small local project tracker.

## Stack

- **Client:** React, Vite, Tailwind CSS, Radix UI, TanStack Query (`client/`)
- **Server:** Express and TypeScript (`server/`)
- **Storage:** SQLite via Drizzle ORM (`shared/schema.ts`)

## Pages

| Page | Purpose |
| --- | --- |
| Dashboard | Overview |
| Field Toolkit | Field reference tools |
| Link Budget | Link-budget calculator |
| Look Angles | Antenna look-angle calculator |
| Repos / Activity | GitHub repositories and recent events (`/api/github/*`) |
| Projects | Local projects (`/api/projects`) |

## Getting started

```bash
npm install
npm run dev      # development server
npm run check    # type-check
npm run build    # production build to dist/
npm start        # run the production build
npm run db:push  # push the Drizzle schema
```

The server listens on `PORT` when it is set.

## Project layout

```
client/   React front end
server/   Express API, static serving, storage
shared/   Drizzle schema shared by client and server
script/   Build script
```
