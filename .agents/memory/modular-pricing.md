---
name: Modular pricing system
description: Architecture decisions for the 4-module pick-and-choose pricing overhaul replacing the old 3-tier plan system.
---

## The rule
Masakhe uses 4 standalone modules (not tiers). Users pick what they need. Old tier codes (starter/pro/premium) remain in DB for backward compat but are no longer surfaced in the UI.

**Why:** User requested modular pricing so businesses only pay for what they use.

## Module codes and prices
- `web_builder` — R299/month, 2 users
- `social_biz` — R500/month, 3 users
- `transactions_ops` — R500/month, 5 users
- `people_hr` — R500/month, 10 users
- `all_modules` — R1,499/month, 10 users (bundle of all 4)

## Trial
- 7 days for new users (was 14)
- 30 days for reseller/partner accounts
- Trial always uses `all_modules` plan — full access

## How to apply
- `server/feature-gate.ts`: `getActiveModules(workspaceId)` → `string[]`; checks `billing_subscriptions.modules` JSON column first, falls back to `MODULE_PLAN_MAP[plan.code]`
- `server/billing.ts`: `/status` returns `{ modules: string[], maxUsers: number }`; `/start-trial` uses `all_modules` + stores modules JSON; return-redirect activation also sets modules from plan code
- `src/pages/DashboardPage.tsx`: `activeModules: string[]` state; `hasModule(m?)` gate; `requiresModule` on nav items; `ModuleGate` component instead of `UpgradeGate`
- `src/pages/BillingPage.tsx`: Module card selector + bundle option + checkout form → Adumo
- `src/pages/PricingPage.tsx`: Public pricing page with 4 module cards + bundle banner
- `src/pages/DashboardOverview.tsx`: Module status strip shows active/inactive modules
