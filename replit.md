# Masakhe - SMME Business Platform

## Overview
Masakhe is a Government-as-a-Platform application designed to help South African SMMEs (Small, Medium and Micro Enterprises) with business registration, digital presence, tax compliance, financial tracking, social media management, and customer engagement. It features a South African flag-inspired color palette.

## Recent Changes
- 2026-02-27: Integrated payment into registration flow and fixed billing pages
  - Plan selection step added to RegisterPage (7-step flow: Account, Business Status, Identity, Business Details, Contact, Choose Plan, Confirmation)
  - After registration, auto-starts checkout flow (mock card capture or Adumo HPP redirect)
  - Adumo form updated to 3D Secure format with full fields: puid, txtCurrencyCode, item details, shipping, Variable1/2
  - Pricing section added to landing page with plan cards and trial CTAs
  - Fixed CheckoutPage plans API parsing bug (data.plans vs data)
  - BillingReturnPage now handles merchantRef from URL params for Adumo redirect
  - Registration links from pricing/landing page pass ?plan= query param
- 2026-02-26: Added Billing & Trials module with subscription management
  - Two plans: Starter (R899/mo) and Pro (R2,500/mo)
  - 14-day free trial with card capture via Adumo Online Virtual HPP
  - Mock mode when Adumo credentials not set (ADUMO_CUID/ADUMO_AUID)
  - Billing scheduler runs hourly: trial reminders, expired trial processing, monthly renewals
  - Feature gating middleware for Social Media Hub write operations
  - Pricing page, checkout flow, billing return handling, billing dashboard
  - Tables: billing_plans, billing_subscriptions, billing_payment_methods, billing_invoices, billing_webhook_events
  - Invoice PDFs include business logo at top
- 2026-02-25: Made dashboard overview fully dynamic with real data and charts
  - New /api/dashboard/overview endpoint aggregates KPIs, finance, invoices, social stats
  - Revenue vs Expenses area chart (last 12 months from ledger)
  - Expenses by Category donut chart
  - Income by Category horizontal bar chart
  - Social Media Activity bar chart (posts per day, last 14 days)
  - KPI cards: Revenue MTD, Expenses MTD, Invoices, Social Posts (with month-over-month change %)
  - Recent Activity feed from real ledger entries and invoices
  - Business Status summary panel
  - Compliance Score card
  - Empty states with CTAs when no data exists
- 2026-02-25: Added Settings page with profile editing and logo upload
  - Business profile CRUD via /api/profile (GET, PUT)
  - Logo upload/delete via /api/profile/logo (POST, DELETE)
  - Logo stored in public/uploads/logos/, URL in business_profiles.logo_url column
  - Dashboard sidebar shows business logo + name instead of Masakhe branding when set
  - Top bar avatar links to settings and shows logo when available
  - Settings page has 3 tabs: Personal & Business, Business Details, Banking
  - Collapsed sidebar also shows logo
- 2026-02-25: Completed full migration from SQLite to remote MySQL (Xneelo)
  - All server files rewritten to async/await MySQL patterns (mysql2/promise)
  - Session store migrated to express-mysql-session
  - Database: remote MySQL on sql16.cpt3.host-h.net (opiandigital)
  - All queries converted: SUBSTR→LEFT, datetime()→DATE_SUB/DATE_ADD, result.changes→result.affectedRows
  - writeAuditLog is now async throughout the codebase
  - Schema migration includes safe ALTER TABLE for adding columns to existing tables
- 2026-02-24: Added Social Media Hub with full content management
  - Multi-tenant workspace system with roles (Owner, Admin, Editor, Viewer)
  - Connect social accounts (Meta Facebook/Instagram, LinkedIn, X, TikTok, YouTube) with Mock Provider Mode
  - Profile URL linking for each social account (direct links to profiles)
  - Content calendar with month view and post detail modals
  - Post builder: multi-platform targeting, text editor with char limits, hashtag suggestions, media attach, preview per platform
  - Schedule posts with Africa/Johannesburg timezone support
  - Background scheduler worker (runs every 60s) with retry logic (max 3 attempts)
  - Media library: upload images/videos (max 25MB), grid view with delete
  - Analytics dashboard: posts per day chart, platform pie chart, monthly activity report
  - Compliance & audit logging: action tracking, CSV export, marketing activity report
  - Social activity consistency score tied into grant readiness
  - Token encryption at rest (AES-256-GCM)
- 2026-02-23: Added Finance, Invoices, Compliance Score, and Grant Readiness features
- 2026-02-23: Redesigned Website Builder with 3 templates and dynamic sections
- 2026-02-23: Added authentication system and admin dashboard
- 2026-02-19: Migrated from Lovable to Replit environment

## Project Architecture
- **Frontend**: React 18 + TypeScript + Vite (port 5000)
- **Backend**: Express.js + mysql2/promise (port 3001, proxied via Vite)
- **Database**: Remote MySQL on Xneelo (sql16.cpt3.host-h.net, db: opiandigital)
- **Auth**: express-session + express-mysql-session + bcryptjs
- **PDF**: pdf-lib for server-side invoice PDF generation
- **File Upload**: multer (media library, max 25MB)
- **Encryption**: Node.js crypto (AES-256-GCM for token storage)
- **Billing**: jsonwebtoken for Adumo JWT tokens
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router DOM v6
- **State**: TanStack React Query v5
- **Animations**: Framer Motion
- **Charts**: Recharts

### Directory Structure
```
src/
├── assets/          # Static images
├── components/
│   ├── ui/          # shadcn/ui base components
│   ├── website/     # Website builder components
│   ├── ComplianceScoreCard.tsx
│   ├── ProtectedRoute.tsx
│   └── NavLink.tsx
├── contexts/
│   └── AuthContext.tsx
├── types/
│   └── site.ts
├── pages/
│   ├── social/
│   │   ├── SocialHub.tsx       # Main hub with sub-navigation
│   │   ├── SocialOverview.tsx  # Dashboard stats
│   │   ├── SocialCalendar.tsx  # Content calendar (month view)
│   │   ├── SocialCreate.tsx    # Post builder
│   │   ├── SocialMedia.tsx     # Media library
│   │   ├── SocialAccounts.tsx  # Connect/disconnect accounts
│   │   └── SocialAnalytics.tsx # Analytics + reports
│   ├── DashboardPage.tsx
│   ├── AdminDashboard.tsx
│   ├── WebsiteBuilder.tsx
│   ├── FinancePage.tsx
│   ├── InvoicesPage.tsx
│   ├── GrantReadinessPage.tsx
│   ├── PricingPage.tsx         # Public pricing with plan cards
│   ├── CheckoutPage.tsx        # Checkout flow + mock card capture
│   ├── BillingReturnPage.tsx   # Adumo HPP return handler
│   ├── BillingPage.tsx         # Billing dashboard in sidebar
│   ├── SettingsPage.tsx
│   └── ...
└── index.css

server/
├── social/
│   ├── index.ts       # Social router aggregator
│   ├── workspace.ts   # Workspace CRUD + membership + role middleware
│   ├── accounts.ts    # Social account connect/disconnect + OAuth stubs
│   ├── posts.ts       # Post CRUD + publish logic
│   ├── media.ts       # Media upload/delete (multer)
│   ├── analytics.ts   # Analytics queries
│   ├── audit.ts       # Audit logging + CSV export + monthly report
│   └── scheduler.ts   # Background post scheduler (60s interval)
├── billing.ts         # Billing API routes (plans, checkout, return, cancel, webhooks)
├── billing-scheduler.ts # Hourly billing scheduler (trials, renewals)
├── feature-gate.ts    # Subscription gating middleware
├── crypto.ts          # AES-256-GCM encrypt/decrypt for tokens
├── index.ts
├── db.ts              # MySQL connection pool + migrations + billing plan seeding
├── auth.ts
├── admin.ts
├── finance.ts
├── invoices.ts
├── compliance.ts
├── grants.ts
└── seed.ts
```

### Database (MySQL - Xneelo)
- **Host**: sql16.cpt3.host-h.net
- **Port**: 3306
- **Database**: opiandigital
- **User**: admin
- **Password**: XNEELO_DB_PASSWORD (env secret)
- **Connection**: mysql2/promise pool (10 connections, keepalive enabled)
- **Migrations**: Auto-run on startup via runMigrations() with CREATE TABLE IF NOT EXISTS
- **Schema additions**: Safe ALTER TABLE with addColumnIfMissing() for evolving schema

### Database Tables
- `users` - id, email, password_hash, full_name, role, timestamps
- `business_profiles` - user_id, business details, banking, POPIA consent
- `websites` - owner_id, slug, status, content_json
- `ledger_entries` - user_id, type (INCOME/EXPENSE), amount_cents, category
- `invoices` - user_id, invoice_number, customer, items_json, total_cents (customer invoices)
- `grant_readiness` - user_id, manual checklist items
- `workspaces` - id, name, owner_id, timestamps
- `workspace_members` - workspace_id, user_id, role (owner/admin/editor/viewer)
- `social_accounts` - workspace_id, platform, account_name, encrypted tokens, is_mock flag
- `social_posts` - workspace_id, content_text, media_asset_ids, scheduled_at, status, idempotency_key
- `social_post_targets` - post_id, account_id, platform, status, platform_post_id, error_message
- `media_assets` - workspace_id, url, type (IMAGE/VIDEO), file_name, size
- `audit_logs` - workspace_id, actor_user_id, action, entity_type/id, metadata JSON
- `billing_plans` - id, code (starter/pro), name, price_cents, currency, bill_interval
- `billing_subscriptions` - workspace_id, plan_id, status (TRIAL/ACTIVE/PAST_DUE/CANCELLED), trial dates, next_billing_at
- `billing_payment_methods` - workspace_id, provider, last4, brand, exp_month/year, status
- `billing_invoices` - workspace_id, subscription_id, amount_cents, status (PENDING/PAID/FAILED), merchant_ref, provider_ref
- `billing_webhook_events` - provider, event_key, payload_json, status (RECEIVED/PROCESSED)
- `onboarding_flows` / `onboarding_steps` - Registration wizard config
- `page_definitions` / `page_sections` - Dynamic page builder
- `submissions` - Form submissions
- `sessions` - express-mysql-session managed

### Billing & Trials Architecture
- **Plans**: Starter (R899/mo, code='starter'), Pro (R2500/mo, code='pro')
- **Trial**: 14 days, card captured upfront via Adumo HPP, no charge during trial
- **Lifecycle**: TRIAL → ACTIVE (auto on trial end) → PAST_DUE (failed charge) → CANCELLED
- **Mock Mode**: When ADUMO_CUID/ADUMO_AUID env vars not set, simulates card capture and charges
- **Scheduler**: Runs hourly - trial reminders (3 days before), expired trial processing, monthly renewals
- **Feature Gating**: Social Media Hub write operations (POST/PUT/DELETE on posts, accounts, media) require active subscription
- **Adumo Integration**: JWT-based token for HPP (MerchantID, ApplicationID, Amount, Token, RedirectURLs)
- **Important**: billing_invoices is separate from invoices table (customer invoices vs platform charges)
- **Pool queries**: Return handler uses pool helpers (queryOne/execute) not manual getConnection/transactions to avoid pool exhaustion with remote MySQL

### Social Media Hub Architecture
- **Workspaces**: Each user auto-gets a workspace; supports multiple members with roles
- **Roles**: owner (full control), admin (manage accounts/team), editor (create/edit posts), viewer (read-only)
- **Accounts**: Connect via OAuth or Mock Provider Mode (when API keys not set)
- **Posts**: DRAFT → SCHEDULED → PUBLISHING → PUBLISHED/FAILED lifecycle
- **Scheduler**: Background worker polls every 60s for due posts, publishes with retry (max 3)
- **Media**: Uploaded to public/uploads/media/, served via Express static
- **Audit**: Every action logged with actor, entity, metadata; CSV export available
- **Mock Provider Mode**: When META_APP_ID / LINKEDIN_CLIENT_ID env vars not set, simulates connections and publishing

### Key Configuration
- Vite dev server on port 5000 with proxy to API on port 3001
- Path alias: `@` maps to `./src`
- Font: Ubuntu (headings) + Open Sans (body)
- Color theme: SA flag inspired (green, gold, blue, red)
- Session: 7-day cookie, MySQL-backed session store (express-mysql-session)
- Token encryption key: TOKEN_ENCRYPTION_KEY env var (defaults to dev key)
- Production: `NODE_ENV=production npx tsx server/index.ts`, serves built frontend from dist/

### Environment Variables
- `XNEELO_DB_PASSWORD` - MySQL database password (required)
- `XNEELO_DB_HOST` - MySQL host (default: sql16.cpt3.host-h.net)
- `XNEELO_DB_PORT` - MySQL port (default: 3306)
- `XNEELO_DB_NAME` - Database name (default: opiandigital)
- `XNEELO_DB_USER` - Database user (default: admin)
- `SESSION_SECRET` - Express session secret
- `META_APP_ID` / `META_APP_SECRET` - Meta/Facebook OAuth (optional)
- `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET` - LinkedIn OAuth (optional)
- `TOKEN_ENCRYPTION_KEY` - Custom encryption key for token storage
- `APP_URL` - Public URL for OAuth callbacks
- `ADUMO_CUID` - Adumo Customer ID (optional, enables real payments)
- `ADUMO_AUID` - Adumo Application ID (optional, enables real payments)
- `ADUMO_JWT_SECRET` - Adumo JWT signing secret (required for real payments)

## User Preferences
- Remote MySQL database on Xneelo (no SQLite, no paid Replit services)
- South African business context (Rand currency, SA tax/compliance)
