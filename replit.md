# Masakhe - SMME Business Platform

Masakhe is a digital platform that empowers South African SMMEs with invoicing, payroll, social media, website builder, client management, compliance, and more — all in one place.

## Run & Operate
- **Dev**: `npm run dev` — starts Express API (port 3001) + Vite frontend (port 5000) concurrently
- **Build**: `npm run build` — builds frontend to `dist/`
- **Production**: `NODE_ENV=production npx tsx server/index.ts` — serves built frontend + API on port 5000
- **Required env vars**: `XNEELO_DB_HOST`, `XNEELO_DB_PORT`, `XNEELO_DB_NAME`, `XNEELO_DB_USER`, `XNEELO_DB_PASSWORD`, `SESSION_SECRET`, `SMTP_*`, `OPENROUTER_API_KEY`, `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`

## Stack
- **Frontend**: React 18 + TypeScript + Vite 5 + Tailwind CSS + shadcn/ui + React Router DOM + TanStack Query
- **Backend**: Node.js 20 (ESM) + Express 5 + mysql2/promise
- **Database**: Remote MySQL on Xneelo (`sql16.cpt3.host-h.net`)
- **Session**: express-session + express-mysql-session
- **Auth**: Custom bcryptjs session auth (no external auth provider)
- **AI**: Replit OpenAI AI Integrations (`AI_INTEGRATIONS_OPENAI_*`) + OpenRouter (`OPENROUTER_API_KEY`)

## Where things live
- `server/index.ts` — Express entry point, mounts all routers
- `server/db.ts` — MySQL pool, migrations (~1000 lines of DDL), query helpers
- `server/auth.ts` — Session auth, requireAuth middleware
- `server/routes.ts` — Upload, onboarding, website builder endpoints
- `server/replit_integrations/` — OpenAI chat/image/audio integration modules
- `src/App.tsx` — React router + providers
- `src/pages/` — All page components
- `src/contexts/AuthContext.tsx` — Frontend auth context

## Architecture decisions
- **Remote MySQL only** — user preference, no SQLite, no Replit PostgreSQL
- **Split dev ports** — Vite on 5000 proxies `/api` to Express on 3001 in dev; production serves from single port 5000
- **Custom session auth** — express-session with MySQL store; no JWT for web sessions
- **OpenRouter for AI text** — used in finance, documents, social media content generation
- **Replit OpenAI Integration for structured AI** — chat conversations, image generation, audio

## Product
- Website builder (44 industry templates), social media hub with scheduler, invoicing/billing (Adumo Online), payroll, inventory, CRM, compliance tools, tenders, business funding toolkit, leave management, admin impersonation

## User preferences
- Remote MySQL on Xneelo (no SQLite, no paid Replit DB services)
- South African business context (ZAR, SA tax/compliance, POPIA)

## Gotchas
- DB migrations run on every server start (`runMigrations()`) — takes 5–15s before API is ready
- Vite proxy to port 3001 will show ECONNREFUSED during that startup window — normal
- `@zxing/library` requires Node ≥ 24 but runs fine on Node 20 (browser-only usage)
- Schedulers start after `app.listen`: social (60s), billing (hourly), invoice (6h), automations (30min)

## Pointers
- DB schema: `server/db.ts` (runMigrations function)
- Seed data: `server/seed.ts`
- Replit AI integration docs: `.local/skills/integrations/SKILL.md`
