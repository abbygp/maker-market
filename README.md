# MakerMarket

The job board for craft fairs — connecting independent market organizers with artisan vendors.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS** + shadcn-style UI components
- **Supabase** (PostgreSQL, Auth, Row Level Security)

## Getting Started

### 1. Clone and install

```bash
cd ~/Projects/maker-market
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_initial_schema.sql` via the SQL Editor
3. Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

### 3. Set up Mapbox (optional — location autocomplete)

1. Create a free token at [mapbox.com](https://account.mapbox.com/access-tokens/)
2. Add `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` to `.env.local`

Without this, the location filter falls back to venues already listed on MakerMarket.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Cloudflare Workers

This app uses **Next.js server features** (middleware, API routes, Supabase auth). It cannot be deployed with a plain `next build` on Cloudflare Pages — use the **OpenNext Cloudflare** adapter instead.

The default `npm run build` script runs Next.js **and** produces the `.open-next/` bundle Wrangler needs, so Cloudflare's default build + deploy settings work out of the box.

### Build locally

```bash
npm run build:cf
```

### Deploy from CLI

```bash
npm run deploy:cf
```

### Deploy via Cloudflare dashboard (GitHub)

In **Workers & Pages → your project → Settings → Build**, use **one** of these setups:

**Option A (recommended — build once)**

| Setting | Value |
|---------|--------|
| Build command | `npm run build:cf` |
| Deploy command | `npx wrangler deploy` |
| Non-production branch deploy command | `npx opennextjs-cloudflare upload` |
| Node.js version | **22** (or use the `.node-version` file) |

**Option B (works with default `npm run build`)**

| Setting | Value |
|---------|--------|
| Build command | `npm run build` |
| Deploy command | `npm run deploy` |
| Non-production branch deploy command | `npm run upload` |
| Node.js version | **22** |

If deploy is `npx wrangler deploy` but build is only `npm run build`, deploy fails with:

`Could not find compiled Open Next config, did you run the build command?`

That happens because `next build` alone does not produce the `.open-next/` bundle Wrangler needs.

### Required environment variables

Set these in **Workers & Pages → Settings → Variables and Secrets**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` (optional, for location autocomplete)

Without Supabase vars, the app loads but login and data won't work.

## Features

- **Auth & onboarding** — Sign up, choose Vendor or Organizer role
- **Maker Resume** — Public vendor profile with portfolio gallery
- **Market feed** — Browse open markets with sidebar filters
- **One-click apply** — Vendors apply with their existing profile + optional note
- **Organizer kanban** — Manage applications across Pending / Approved / Waitlisted / Declined

## Project Structure

```
src/
├── app/
│   ├── (app)/          # Main app routes (markets, dashboard, profiles)
│   ├── (auth)/         # Login & signup
│   └── auth/           # Auth callbacks
├── components/
│   ├── dashboard/      # Kanban, create market
│   ├── markets/        # Feed, cards, apply modal
│   ├── profile/        # Profile editing
│   └── ui/             # shadcn-style primitives
├── lib/
│   ├── supabase/       # Client, server, middleware
│   └── constants.ts    # Categories, labels
└── types/
    └── database.ts     # TypeScript types
```

## Database Schema

See `supabase/migrations/001_initial_schema.sql` for the full schema including RLS policies for:

- `profiles` — User roles and maker resumes
- `markets` — Craft fair listings
- `applications` — Vendor applications with status pipeline
