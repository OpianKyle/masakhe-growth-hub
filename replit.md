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
- **Subscription & Billing**: Implements a trial system (14-day free trial) with two plans (Starter R899/mo, Pro R2500/mo) and integrates with Adumo for payment processing. Uses Adumo Virtual HPP `initialisevirtual` endpoint with subscription fields (`frequency=MONTHLY`, `collectionDay`, `startDate`, `endDate`, `collectionValue`, `accountNumber`) to trigger the subscription/debit order flow (not 3D Secure card payment). Merchant reference format: `SUB_xxxxx`. Response includes `formAction`, `fields`, and `subscriptionId`. Redirect URLs point to frontend `/payment/success?ref=` and `/payment/failed?ref=` routes. Card-on-File API (OAuth2 → initiate → authorise → settle) serves as fallback. Background scheduler handles trial reminders and status sync. Feature gating restricts premium modules based on subscription status.
- **Dynamic Dashboard**: The dashboard provides a real-time overview of business KPIs, financial data, and social media activity through dynamic charts and aggregated data.
- **Content Management**: Features a comprehensive Social Media Hub with a content calendar, post builder supporting multi-platform targeting, and a media library. A background worker handles scheduled post publishing with retry logic.
- **User & Business Profile Management**: Includes a settings page for managing user and business profiles, including logo uploads.
- **Website Builder**: A customizable website builder with multiple templates and dynamic sections allows SMMEs to establish their online presence.
- **Compliance & Grant Readiness**: Incorporates features for tracking compliance scores and assessing grant readiness.
- **Data Security**: Employs AES-256-GCM encryption for sensitive data like social account tokens.
- **PDF Generation**: Uses `pdf-lib` for server-side generation of invoices.

## External Dependencies
- **Database**: Remote MySQL hosted on Xneelo (`sql16.cpt3.host-h.net`).
- **Payment Gateway**: Adumo Online — Virtual HPP for 3D Secure card capture with puid tokenization and built-in subscription fields (frequency, collectionDay, startDate, endDate, collectionValue) for Adumo-managed recurring billing; Card-on-File API (OAuth2 + REST) as fallback for server-to-server charges (initiate/authorise/settle); webhook notifications for both initial and recurring transaction confirmations.
- **Social Media APIs**: Integrations with Meta (Facebook/Instagram), LinkedIn, X, TikTok, and YouTube (with a Mock Provider Mode for development).
- **Session Management**: `express-mysql-session` for storing session data in MySQL.
- **PDF Generation**: `pdf-lib` for creating PDF documents.
- **File Uploads**: `multer` for handling media file uploads.
- **JWT**: `jsonwebtoken` for secure information exchange, particularly with Adumo.