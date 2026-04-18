# 🎮 Fail Frenzy: Échos du Vide

A competitive arcade space game — pilot your Echo Ship, collect stellar light echoes and fuel Xylos.

## Stack

- **Frontend**: React 19 + Vite + TailwindCSS 4 + wouter (SPA)
- **Backend**: tRPC 11 serverless functions (Vercel)
- **Database**: PostgreSQL via Drizzle ORM (Supabase)
- **Auth**: Supabase Auth (email/password + OAuth)
- **Payments**: Stripe (subscriptions + one-time purchases)
- **Game Engine**: Custom Canvas 2D (NeonRenderer, ECS architecture)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env
# Fill in your Supabase + Stripe credentials

# 3. Run database migrations
npm run db:push

# 4. Start dev server (Express + Vite)
npm run dev
```

## Deployment (Vercel)

The project deploys as:
- **Frontend**: Static SPA built by Vite → `dist/public/`
- **API**: Serverless functions in `api/` directory
  - `api/trpc/[trpc].ts` — tRPC handler with Supabase JWT auth
  - `api/stripe/webhook.ts` — Stripe webhook with signature verification

### Vercel Environment Variables

Set these in your Vercel project dashboard:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_URL` | Supabase project URL (server) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `DATABASE_URL` | PostgreSQL connection string |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_PREMIUM_MONTHLY` | Stripe price ID |
| `STRIPE_PRICE_PREMIUM_YEARLY` | Stripe price ID |
| `STRIPE_PRICE_TOKENS_*` | Stripe price IDs for token packs |

## Project Structure

```
├── client/src/           # React SPA
│   ├── engine/           # Game engine (GameEngine, NeonRenderer, Physics)
│   ├── game/             # Fail Frenzy game logic (FailFrenzyGame, Skins)
│   ├── systems/          # Game systems (Audio, Achievements, Combos...)
│   ├── pages/            # Route pages (Home, Game, Shop, Leaderboard...)
│   ├── components/       # UI components (shadcn/ui)
│   └── lib/              # Utilities (trpc client, supabase client)
├── api/                  # Vercel serverless functions
│   ├── trpc/[trpc].ts    # tRPC API handler
│   └── stripe/webhook.ts # Stripe webhook handler
├── server/               # Backend logic (shared between dev + serverless)
│   ├── _core/            # tRPC setup, context, env
│   ├── stripe/           # Stripe integration
│   ├── routers.ts        # All tRPC routes
│   └── db.ts             # Database layer (Drizzle + PostgreSQL)
├── drizzle/              # DB schema & migrations
└── shared/               # Shared types & constants
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (Express + Vite HMR) |
| `npm run build` | Build frontend + backend |
| `npm run build:frontend` | Build frontend only |
| `npm run check` | TypeScript type check |
| `npm run test` | Run tests (Vitest) |
| `npm run db:push` | Generate + apply DB migrations |

## Game Modes

- **Classic** — Survival scoring, increasing difficulty
- **Time Trial** — Maximum score in limited time
- **Infinite** — Endless endurance
- **Seeds** — Reproducible runs via shared seed

## Monetization

- **Premium** ($4.99/mo or $39.99/yr): All modes, no ads, global leaderboard
- **Token Packs** ($0.99–$6.99): In-game currency for cosmetic skins

## License

MIT
