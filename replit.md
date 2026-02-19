# Masakhe - SMME Business Platform

## Overview
Masakhe is a Government-as-a-Platform application designed to help South African SMMEs (Small, Medium and Micro Enterprises) with business registration, digital presence, tax compliance, and customer engagement. It features a South African flag-inspired color palette.

## Recent Changes
- 2026-02-19: Migrated from Lovable to Replit environment
  - Updated Vite config to bind to port 5000 and allow all hosts
  - Removed lovable-tagger plugin reference
  - Set up workflow for development

## Project Architecture
- **Framework**: React 18 + TypeScript + Vite
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
│   └── NavLink.tsx  # Navigation link component
├── hooks/           # Custom hooks (use-mobile, use-toast)
├── lib/             # Utilities (utils.ts)
├── pages/           # Page components
│   ├── LandingPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── Index.tsx
│   └── NotFound.tsx
└── index.css        # Global styles with SA flag color tokens
```

### Key Configuration
- Vite dev server runs on port 5000
- Path alias: `@` maps to `./src`
- Font: Ubuntu (headings) + Open Sans (body)
- Color theme: SA flag inspired (green, gold, blue, red)

## User Preferences
- No specific preferences recorded yet
