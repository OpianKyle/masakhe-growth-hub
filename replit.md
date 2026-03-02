# Masakhe - SMME Business Platform

## Overview
Masakhe is a Government-as-a-Platform application designed to assist South African SMMEs with comprehensive business management. Its core purpose is to streamline business registration, establish a digital presence, ensure tax compliance, facilitate financial tracking, manage social media, and enhance customer engagement. The platform aims to empower SMMEs by providing essential tools within a single, integrated application, featuring a South African flag-inspired color palette for its UI.

## User Preferences
- Remote MySQL database on Xneelo (no SQLite, no paid Replit services)
- South African business context (Rand currency, SA tax/compliance)

## System Architecture
Masakhe utilizes a React 18 frontend with TypeScript and Vite, communicating with an Express.js backend using `mysql2/promise` for database interactions. The application is styled with Tailwind CSS and `shadcn/ui` components, employing React Router DOM for navigation, TanStack React Query for state management, and Recharts for data visualization. Authentication is managed via `express-session` and `express-mysql-session` with `bcryptjs`.

Key architectural features include:
- **Modular Design**: The system is organized into distinct modules for social media, billing, finance, and user management, each with dedicated API routes and logic.
- **Multi-tenancy**: The Social Media Hub supports a workspace system with roles (Owner, Admin, Editor, Viewer), enabling collaborative management for businesses.
- **Subscription & Billing**: Implements a trial system (14-day free trial) with two plans (Starter R899/mo, Pro R2500/mo). No payment provider is currently integrated — subscriptions are created directly via `POST /api/billing/subscribe` with plan selection. Background scheduler handles trial expiry (TRIAL → ACTIVE transitions) and monthly renewal invoice creation. Feature gating restricts premium modules based on subscription status. Subscription checkout is embedded directly in `BillingPage` (no separate checkout page).
- **Registration Flow**: Registration (`/register`) is payment-free — 6 steps (Account, Business Status, Identity, Business Details, Contact & Location, Confirmation). After successful registration, users are redirected to `/onboarding`. Subscription is set up from the Billing section inside the dashboard portal.
- **Trial Banner & Walkthrough**: `TrialBanner` component (in dashboard) shows a dismissible banner with days remaining and a modal popup on first login during trial; locks access modal when trial expires or subscription is past-due. `DashboardWalkthrough` component shows a guided tour card on first login, stepping through all dashboard sections.
- **Dynamic Dashboard**: The dashboard provides a real-time overview of business KPIs, financial data, and social media activity through dynamic charts and aggregated data.
- **Content Management**: Features a comprehensive Social Media Hub with a content calendar, post builder supporting multi-platform targeting, and a media library. A background worker handles scheduled post publishing with retry logic.
- **User & Business Profile Management**: Includes a settings page for managing user and business profiles, including logo uploads.
- **Website Builder**: A customizable website builder with multiple templates and dynamic sections allows SMMEs to establish their online presence.
- **Compliance & Grant Readiness**: Incorporates features for tracking compliance scores and assessing grant readiness.
- **Data Security**: Employs AES-256-GCM encryption for sensitive data like social account tokens.
- **PDF Generation**: Uses `pdf-lib` for server-side generation of invoices and terms PDFs.

## External Dependencies
- **Database**: Remote MySQL hosted on Xneelo (`sql16.cpt3.host-h.net`).
- **Payment Gateway**: None currently integrated. Billing infrastructure (plans, subscriptions, invoices, trial management) is in place and ready for a payment provider to be added.
- **Social Media APIs**: Integrations with Meta (Facebook/Instagram), LinkedIn, X, TikTok, and YouTube (with a Mock Provider Mode for development).
- **Session Management**: `express-mysql-session` for storing session data in MySQL.
- **PDF Generation**: `pdf-lib` for creating PDF documents.
- **File Uploads**: `multer` for handling media file uploads.
