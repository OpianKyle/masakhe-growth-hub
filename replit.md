# Masakhe - SMME Business Platform

## Overview
Masakhe is a Government-as-a-Platform application designed to help South African SMMEs (Small, Medium and Micro Enterprises) with business registration, digital presence, tax compliance, financial tracking, and customer engagement. It features a South African flag-inspired color palette.

## Recent Changes
- 2026-02-23: Added Finance, Invoices, Compliance Score, and Grant Readiness features
  - Finance page: income/expense ledger with categories, monthly bar chart, summary stats
  - Invoice system: create/manage invoices, PDF download via pdf-lib
  - Compliance Score card on dashboard with auto-calculated checklist (0-100 points)
  - Grant Readiness page with 4 categories of auto+manual checks, print summary
  - Admin dashboard enhanced with aggregated financial stats and revenue chart
  - Database: ledger_entries, invoices, grant_readiness tables added
  - Navigation updated: Finance, Invoices, Funding Readiness sidebar items
- 2026-02-23: Redesigned Website Builder with 3 templates and dynamic sections
  - Template picker: Professional Services, Restaurant & Food, Retail & Shop
  - Dynamic sections: add, remove, reorder, toggle visibility
  - Section types: Hero, Stats, Features, About, Services, Gallery, Testimonials, Contact
  - Live preview with desktop/mobile toggle
  - Theme colors applied dynamically to all section renders
  - Backward compatibility for legacy site configs
- 2026-02-23: Added authentication system and admin dashboard
  - User registration with email/password (bcrypt hashed)
  - Login/logout with express-session + SQLite session store
  - RegisterPage saves user credentials + business profile to database
  - Dashboard personalized to logged-in user
  - Admin dashboard at /admin with client list, stats, role management
  - Protected routes (ProtectedRoute, AdminRoute)
  - Default admin: admin@masakhe.co.za / admin123
- 2026-02-19: Migrated from Lovable to Replit environment

## Project Architecture
- **Frontend**: React 18 + TypeScript + Vite (port 5000)
- **Backend**: Express.js + better-sqlite3 (port 3001, proxied via Vite)
- **Auth**: express-session + connect-sqlite3 + bcryptjs
- **PDF**: pdf-lib for server-side invoice PDF generation
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
│   ├── website/
│   │   ├── SectionRenderer.tsx  # Maps section types to preview components
│   │   ├── SectionEditor.tsx    # Maps section types to editor forms
│   │   ├── templates.ts         # 3 template presets with default sections
│   │   ├── ImageUploadField.tsx  # Image upload/URL input
│   │   └── SMMEWebsiteTemplate.tsx  # Legacy template (kept for reference)
│   ├── ComplianceScoreCard.tsx  # Dashboard compliance score widget
│   ├── ProtectedRoute.tsx  # Auth guards (ProtectedRoute, AdminRoute)
│   └── NavLink.tsx
├── contexts/
│   └── AuthContext.tsx  # Auth state provider
├── types/
│   └── site.ts          # SiteConfig, SiteSection, section type definitions
├── hooks/           # Custom hooks
├── lib/             # Utilities
├── pages/
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx   # Multi-step registration (saves to DB)
│   ├── DashboardPage.tsx  # User dashboard (personalized + compliance score)
│   ├── AdminDashboard.tsx # Admin panel with financial overview
│   ├── WebsiteBuilder.tsx # Template picker + section-based editor
│   ├── PublishedSite.tsx  # Renders published sites (with legacy migration)
│   ├── FinancePage.tsx    # Income/expense ledger + charts
│   ├── InvoicesPage.tsx   # Invoice CRUD + PDF download
│   ├── GrantReadinessPage.tsx  # Funding readiness checklist
│   ├── Onboarding.tsx
│   └── NotFound.tsx
└── index.css

server/
├── index.ts         # Express server + session middleware
├── db.ts            # SQLite migrations (all tables)
├── auth.ts          # Auth endpoints + middleware (requireAuth)
├── admin.ts         # Admin API + aggregated stats
├── routes.ts        # General API routes
├── finance.ts       # Ledger entries API + monthly summary
├── invoices.ts      # Invoice CRUD + PDF generation (pdf-lib)
├── compliance.ts    # Compliance score calculation API
├── grants.ts        # Grant readiness checklist API
└── seed.ts          # Seed data + default admin user
```

### Website Builder Architecture
- **SiteConfig** contains metadata + dynamic `sections[]` array
- Each section has: id, type, enabled flag, and type-specific data
- **Section types**: hero, stats, features, about, services, gallery, testimonials, contact
- **Templates**: Pre-built SiteConfig with appropriate sections for each business type
- **SectionRenderer**: Maps type → preview component
- **SectionEditor**: Maps type → editor form with add/remove list items

### Finance & Invoicing Architecture
- **ledger_entries**: user_id, type (income/expense), category, description, amount_cents, entry_date
- **invoices**: user_id, invoice_number (INV-YYYY-XXX), client details, line items JSON, totals, status, dates
- Categories: Sales/Services/Interest (income); Rent/Utilities/Supplies/Transport/Other (expense)
- PDF generated server-side with pdf-lib, SA Rand formatting

### Compliance Score System
- Auto-calculated 0-100 from platform activity checks
- Checks: profile complete, website published, invoices created, ledger entries, tax number
- ComplianceScoreCard widget with circular progress, checklist, and action links

### Grant Readiness System
- 4 categories: Business Fundamentals, Financial Records, Tax & Legal, Digital Presence
- Mix of auto-verified (from platform data) and manual user-confirmed items
- Stored in grant_readiness table (user_id, manual_checks JSON, tax_number, notes)

### Database Tables
- `users` - id, email, password_hash, full_name, role (user/admin), timestamps
- `business_profiles` - user_id FK, business details
- `websites` - owner_id, slug, content_json (stores full SiteConfig), status
- `ledger_entries` - user_id, type, category, description, amount_cents, entry_date
- `invoices` - user_id, invoice_number, client_name/email, line_items_json, subtotal/tax/total, status, dates
- `grant_readiness` - user_id, manual_checks (JSON), tax_number, notes
- `onboarding_flows/steps` - dynamic registration flow config
- `page_definitions/sections` - dynamic page content
- `submissions` - form submissions

### Key Configuration
- Vite dev server on port 5000 with proxy to API on port 3001
- Path alias: `@` maps to `./src`
- Font: Ubuntu (headings) + Open Sans (body)
- Color theme: SA flag inspired (green, gold, blue, red)
- Session: 7-day cookie, SQLite-backed session store

## User Preferences
- No paid Replit services (SQLite only, no PostgreSQL)
- South African business context (Rand currency, SA tax/compliance)
