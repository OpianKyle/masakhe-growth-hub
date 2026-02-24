# Masakhe - SMME Business Platform

## Overview
Masakhe is a Government-as-a-Platform application designed to help South African SMMEs (Small, Medium and Micro Enterprises) with business registration, digital presence, tax compliance, financial tracking, social media management, and customer engagement. It features a South African flag-inspired color palette.

## Recent Changes
- 2026-02-24: Added Social Media Hub with full content management
  - Multi-tenant workspace system with roles (Owner, Admin, Editor, Viewer)
  - Connect social accounts (Meta Facebook/Instagram, LinkedIn, X) with Mock Provider Mode
  - Content calendar with month view and post detail modals
  - Post builder: multi-platform targeting, text editor with char limits, hashtag suggestions, media attach, preview per platform
  - Schedule posts with Africa/Johannesburg timezone support
  - Background scheduler worker (runs every 60s) with retry logic (max 3 attempts)
  - Media library: upload images/videos (max 25MB), grid view with delete
  - Analytics dashboard: posts per day chart, platform pie chart, monthly activity report
  - Compliance & audit logging: action tracking, CSV export, marketing activity report
  - Social activity consistency score tied into grant readiness
  - Token encryption at rest (AES-256-GCM)
  - Database: workspaces, workspace_members, social_accounts, social_posts, social_post_targets, media_assets, audit_logs
- 2026-02-23: Added Finance, Invoices, Compliance Score, and Grant Readiness features
- 2026-02-23: Redesigned Website Builder with 3 templates and dynamic sections
- 2026-02-23: Added authentication system and admin dashboard
- 2026-02-19: Migrated from Lovable to Replit environment

## Project Architecture
- **Frontend**: React 18 + TypeScript + Vite (port 5000)
- **Backend**: Express.js + better-sqlite3 (port 3001, proxied via Vite)
- **Auth**: express-session + connect-sqlite3 + bcryptjs
- **PDF**: pdf-lib for server-side invoice PDF generation
- **File Upload**: multer (media library, max 25MB)
- **Encryption**: Node.js crypto (AES-256-GCM for token storage)
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
├── crypto.ts          # AES-256-GCM encrypt/decrypt for tokens
├── index.ts
├── db.ts
├── auth.ts
├── admin.ts
├── finance.ts
├── invoices.ts
├── compliance.ts
├── grants.ts
└── seed.ts
```

### Social Media Hub Architecture
- **Workspaces**: Each user auto-gets a workspace; supports multiple members with roles
- **Roles**: owner (full control), admin (manage accounts/team), editor (create/edit posts), viewer (read-only)
- **Accounts**: Connect via OAuth or Mock Provider Mode (when API keys not set)
- **Posts**: DRAFT → SCHEDULED → PUBLISHING → PUBLISHED/FAILED lifecycle
- **Scheduler**: Background worker polls every 60s for due posts, publishes with retry (max 3)
- **Media**: Uploaded to public/uploads/media/, served via Express static
- **Audit**: Every action logged with actor, entity, metadata; CSV export available
- **Mock Provider Mode**: When META_APP_ID / LINKEDIN_CLIENT_ID env vars not set, simulates connections and publishing

### Social Media Hub Routes
- `/dashboard/social` - Overview stats
- `/dashboard/social/calendar` - Content calendar
- `/dashboard/social/create` - Post builder
- `/dashboard/social/media` - Media library
- `/dashboard/social/accounts` - Connect/disconnect accounts
- `/dashboard/social/analytics` - Analytics + reports

### API Routes (Social)
- `GET /api/social/workspaces/mine` - List user's workspaces
- `GET/POST /api/social/ws/:wsId/accounts` - List/connect accounts
- `GET/POST /api/social/ws/:wsId/posts` - List/create posts
- `PUT/DELETE /api/social/ws/:wsId/posts/:id` - Update/delete post
- `GET/POST /api/social/ws/:wsId/media` - List/upload media
- `GET /api/social/ws/:wsId/analytics` - Analytics data
- `GET /api/social/ws/:wsId/audit` - Audit log
- `GET /api/social/ws/:wsId/audit/export` - CSV export
- `GET /api/social/ws/:wsId/report/monthly` - Monthly report

### Database Tables (Social)
- `workspaces` - id, name, owner_id, timestamps
- `workspace_members` - workspace_id, user_id, role (owner/admin/editor/viewer)
- `social_accounts` - workspace_id, platform, account_name, encrypted tokens, is_mock flag
- `social_posts` - workspace_id, content_text, media_asset_ids, scheduled_at, status, idempotency_key
- `social_post_targets` - post_id, account_id, platform, status, platform_post_id, error_message
- `media_assets` - workspace_id, url, type (IMAGE/VIDEO), file_name, size
- `audit_logs` - workspace_id, actor_user_id, action, entity_type/id, metadata JSON

### Key Configuration
- Vite dev server on port 5000 with proxy to API on port 3001
- Path alias: `@` maps to `./src`
- Font: Ubuntu (headings) + Open Sans (body)
- Color theme: SA flag inspired (green, gold, blue, red)
- Session: 7-day cookie, SQLite-backed session store
- Token encryption key: TOKEN_ENCRYPTION_KEY env var (defaults to dev key)

### Environment Variables (Optional for Social Hub)
- `META_APP_ID` - Meta/Facebook App ID (enables real OAuth)
- `META_APP_SECRET` - Meta/Facebook App Secret
- `LINKEDIN_CLIENT_ID` - LinkedIn Client ID
- `LINKEDIN_CLIENT_SECRET` - LinkedIn Client Secret
- `TOKEN_ENCRYPTION_KEY` - Custom encryption key for token storage
- `APP_URL` - Public URL for OAuth callbacks

## User Preferences
- No paid Replit services (SQLite only, no PostgreSQL)
- South African business context (Rand currency, SA tax/compliance)
