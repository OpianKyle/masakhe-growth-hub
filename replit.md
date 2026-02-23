# Masakhe - SMME Business Platform

## Overview
Masakhe is a Government-as-a-Platform application designed to help South African SMMEs (Small, Medium and Micro Enterprises) with business registration, digital presence, tax compliance, and customer engagement. It features a South African flag-inspired color palette.

## Recent Changes
- 2026-02-23: Added authentication system and admin dashboard
  - User registration with email/password (bcrypt hashed)
  - Login/logout with express-session + SQLite session store
  - RegisterPage now saves user credentials + business profile to database
  - Dashboard personalized to logged-in user
  - Admin dashboard at /admin with client list, stats, role management
  - Protected routes (ProtectedRoute, AdminRoute)
  - Default admin: admin@masakhe.co.za / admin123
- 2026-02-19: Migrated from Lovable to Replit environment
  - Updated Vite config to bind to port 5000 and allow all hosts
  - Removed lovable-tagger plugin reference
  - Set up workflow for development

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
├── assets/          # Static images (hero, market-stall, smme-owner)
├── components/
│   ├── ui/          # shadcn/ui base components
│   ├── ProtectedRoute.tsx  # Auth guards (ProtectedRoute, AdminRoute)
│   └── NavLink.tsx  # Navigation link component
├── contexts/
│   └── AuthContext.tsx  # Auth state provider (login, register, logout)
├── hooks/           # Custom hooks (use-mobile, use-toast)
├── lib/             # Utilities (utils.ts)
├── pages/
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx      # Login form
│   ├── RegisterPage.tsx   # Multi-step registration (saves to DB)
│   ├── DashboardPage.tsx  # User dashboard (personalized)
│   ├── AdminDashboard.tsx # Admin panel (client management)
│   ├── WebsiteBuilder.tsx
│   ├── Onboarding.tsx
│   ├── PublishedSite.tsx
│   └── NotFound.tsx
└── index.css        # Global styles with SA flag color tokens

server/
├── index.ts         # Express server setup with session middleware
├── db.ts            # SQLite connection + migrations (users, business_profiles)
├── auth.ts          # Auth endpoints + middleware (requireAuth, requireAdmin)
├── admin.ts         # Admin API (stats, clients, role management)
├── routes.ts        # General API routes (onboarding, websites)
└── seed.ts          # Seed data + default admin user
```

### Database Tables
- `users` - id, email, password_hash, full_name, role (user/admin), timestamps
- `business_profiles` - user_id FK, business details (name, type, sector, contact, etc.)
- `websites` - owner_id, slug, content_json, status
- `onboarding_flows/steps` - dynamic registration flow config
- `page_definitions/sections` - dynamic page content
- `submissions` - form submissions

### Key Configuration
- Vite dev server runs on port 5000 with proxy to API on port 3001
- Path alias: `@` maps to `./src`
- Font: Ubuntu (headings) + Open Sans (body)
- Color theme: SA flag inspired (green, gold, blue, red)
- Session: 7-day cookie, SQLite-backed session store

## User Preferences
- No specific preferences recorded yet
