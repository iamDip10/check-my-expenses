# Our Ledger

A private, two-person daily expense journal for Dip (owner) and his wife (monitor). Built as a mobile-first Next.js app designed to deploy on Vercel with zero custom servers.

- **Dip (Owner)** adds, edits, and deletes expenses, and sees his own spending broken down by day, week, and month.
- **Wife (Monitor)** sees the same spending in a simplified, read-only view and reacts to any expense with a single emoji tap.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL
- NextAuth (credentials provider, JWT sessions)
- Recharts for charts

Everything runs as serverless Route Handlers / Server Components — there's no long-running custom server, so it deploys cleanly to Vercel.

## 1. Local setup

```bash
npm install
cp .env.example .env
```

Fill in `.env` (see below), then:

```bash
npm run db:push     # create tables from prisma/schema.prisma
npm run db:seed      # create the owner + monitor accounts and default categories
npm run dev
```

Visit `http://localhost:3000` and sign in with the `OWNER_EMAIL` / `OWNER_PASSWORD` (or the monitor equivalents) you set in `.env`.

## 2. Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Pooled Postgres connection string, used at runtime |
| `DIRECT_URL` | Direct (non-pooled) Postgres connection string, used only for migrations |
| `NEXTAUTH_SECRET` | Random secret for session encryption — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | The app's URL (`http://localhost:3000` locally, your Vercel URL in production) |
| `OWNER_NAME`, `OWNER_EMAIL`, `OWNER_PASSWORD` | Used once by the seed script to create Dip's account |
| `MONITOR_NAME`, `MONITOR_EMAIL`, `MONITOR_PASSWORD` | Used once by the seed script to create the monitor account |

There is no role picker on the login screen — whoever signs in is routed to the dashboard that matches the role stored against their account.

## 3. Database setup

Any managed Postgres works: **Vercel Postgres**, **Neon**, or **Supabase** are all a good fit for serverless deployments. Neon and Vercel Postgres both give you a pooled URL (`DATABASE_URL`) and a direct URL (`DIRECT_URL`) — Prisma needs both, since migrations must run over a direct (non-pooled) connection.

1. Create a Postgres database with your provider of choice.
2. Copy the pooled connection string into `DATABASE_URL` and the direct one into `DIRECT_URL`.
3. Run `npm run db:push` (or `npm run db:migrate` if you'd rather keep a migration history).

## 4. Migration commands

```bash
npm run db:push      # push the current schema straight to the database (fastest for a small private app)
npm run db:migrate   # create and apply a tracked migration (use if you want migration history)
npm run db:studio    # open Prisma Studio to browse data
npm run db:seed      # (re)create the owner/monitor accounts and default categories
```

## 5. Development command

```bash
npm run dev
```

## 6. Production build

```bash
npm run build
npm start
```

## 7. Deploying to Vercel

1. Push this project to a GitHub repository.
2. In Vercel, click **New Project** and import the repository.
3. Add all the environment variables from `.env.example` in the Vercel project's **Settings → Environment Variables**. Set `NEXTAUTH_URL` to your production URL (e.g. `https://our-ledger.vercel.app`).
4. Deploy. The `postinstall` script runs `prisma generate` automatically, and `npm run build` also runs `prisma generate` before `next build`.
5. After the first deploy, run the seed script once against your production database (from your machine, with `.env` pointed at the production `DATABASE_URL`/`DIRECT_URL`):
   ```bash
   npm run db:push
   npm run db:seed
   ```
6. Share the login page with your wife — there's nothing else to configure on her side.

No custom VPS, background workers, or always-on server are required.

## Notes on scope

This build covers the full feature set end-to-end (quick add, smart quick actions, daily timeline, emoji reactions, weekly/monthly analytics, deterministic insights, optional budget, category and quick-action management) with production-quality auth and server-side authorization. A few deliberate simplifications, called out here so they're easy to revisit:

- "This Week" uses a rolling Sunday-start calendar week rather than a fixed Sat–Fri layout — easy to change in `src/lib/utils.ts` (`startOfWeek`) if you'd prefer a different week start.
- Push notifications aren't implemented; the "wife reacted" signal currently surfaces as a badge on the expense row and in the Analytics "Wife's Reactions" section, which is intentionally structured so real push notifications can be layered on later without a redesign.
- Category icons are plain emoji rather than an icon library, matching the playful, personal tone requested.
