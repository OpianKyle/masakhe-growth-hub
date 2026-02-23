# Masakhe - SMME Business Platform

## Overview
Masakhe is a Government-as-a-Platform application designed to help South African SMMEs (Small, Medium and Micro Enterprises) with business registration, digital presence, tax compliance, and customer engagement. It features a South African flag-inspired color palette.

## Recent Changes
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
│   ├── DashboardPage.tsx  # User dashboard (personalized)
│   ├── AdminDashboard.tsx # Admin panel
│   ├── WebsiteBuilder.tsx # Template picker + section-based editor
│   ├── PublishedSite.tsx  # Renders published sites (with legacy migration)
│   ├── Onboarding.tsx
│   └── NotFound.tsx
└── index.css

server/
├── index.ts         # Express server + session middleware
├── db.ts            # SQLite migrations (users, business_profiles, websites, etc.)
├── auth.ts          # Auth endpoints + middleware
├── admin.ts         # Admin API
├── routes.ts        # General API routes
└── seed.ts          # Seed data + default admin user
```

### Website Builder Architecture
- **SiteConfig** contains metadata + dynamic `sections[]` array
- Each section has: id, type, enabled flag, and type-specific data
- **Section types**: hero, stats, features, about, services, gallery, testimonials, contact
- **Templates**: Pre-built SiteConfig with appropriate sections for each business type
- **SectionRenderer**: Maps type → preview component
- **SectionEditor**: Maps type → editor form with add/remove list items

### Database Tables
- `users` - id, email, password_hash, full_name, role (user/admin), timestamps
- `business_profiles` - user_id FK, business details
- `websites` - owner_id, slug, content_json (stores full SiteConfig), status
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
- No specific preferences recorded yet
