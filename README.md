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
2. Add `MAPBOX_ACCESS_TOKEN` to `.env.local`

Without this, the location filter falls back to venues already listed on MakerMarket.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
