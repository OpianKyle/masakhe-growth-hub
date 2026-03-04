# Masakhe - SMME Business Platform

## Overview
Masakhe is a digital platform designed to assist South African SMMEs with comprehensive business management. Its core purpose is to streamline business registration, establish a digital presence, ensure tax compliance, facilitate financial tracking, manage social media, and enhance customer engagement. The platform aims to empower SMMEs by providing essential tools within a single, integrated application, featuring a South African flag-inspired color palette for its UI.

## User Preferences
- Remote MySQL database on Xneelo (no SQLite, no paid Replit services)
- South African business context (Rand currency, SA tax/compliance)

## System Architecture
Masakhe utilizes a React 18 frontend with TypeScript and Vite, communicating with an Express.js backend using `mysql2/promise` for database interactions. The application is styled with Tailwind CSS and `shadcn/ui` components, employing React Router DOM for navigation, TanStack React Query for state management, and Recharts for data visualization. Authentication is managed via `express-session` and `express-mysql-session` with `bcryptjs`.

Key architectural features include:
- **Modular Design**: The system is organized into distinct modules for social media, billing, finance, and user management, each with dedicated API routes and logic.
- **Multi-tenancy**: The Social Media Hub supports a workspace system with roles (Owner, Admin, Editor, Viewer), enabling collaborative management for businesses.
- **Subscription & Billing via Adumo Online**: Implements a trial system (14-day free trial) with two plans (Starter R899/mo, Pro R2500/mo). Payment is processed via Adumo Online Virtual HPP (Hidden Form POST) for monthly debit order subscriptions. The checkout flow: user selects plan and fills subscriber details on BillingPage → `POST /api/billing/checkout-session` generates JWT token and returns Adumo form fields → hidden form POST submits to Adumo HPP → Adumo redirects back to `GET /api/billing/return-redirect` which verifies the response token, creates TRIAL subscription, and redirects to `/dashboard/billing?payment=success|failed|error`. Background scheduler handles trial expiry (TRIAL → ACTIVE transitions) and monthly renewal invoice creation. Feature gating restricts premium modules based on subscription status.
- **Registration Flow**: Registration (`/register`) is payment-free — 6 steps (Account, Business Status, Identity, Business Details, Contact & Location, Confirmation). After successful registration, users are redirected to `/onboarding`. Subscription is set up from the Billing section inside the dashboard portal.
- **Trial Banner & Walkthrough**: `TrialBanner` component (in dashboard) shows a dismissible banner with days remaining and a modal popup on first login during trial; locks access modal when trial expires or subscription is past-due. `DashboardWalkthrough` component shows a guided tour card on first login, stepping through all dashboard sections.
- **Dynamic Dashboard**: The dashboard provides a real-time overview of business KPIs, financial data, and social media activity through dynamic charts and aggregated data.
- **Content Management**: Features a comprehensive Social Media Hub with a content calendar, post builder supporting multi-platform targeting, and a media library. A background worker handles scheduled post publishing with retry logic.
- **User & Business Profile Management**: Includes a settings page for managing user and business profiles, including logo uploads.
- **Website Builder**: A customizable website builder with 21 industry-specific templates (Professional Services, Restaurant, Retail, Beauty, Construction, Creative, Legal, Accounting, Real Estate, Healthcare, Education, Fitness, Automotive, Cleaning, IT/Technology, Agriculture, Transport, Events, Security, Travel, Consulting) and dynamic sections allows SMMEs to establish their online presence. Templates defined in `src/components/website/templates.ts`, icons mapped in `src/pages/WebsiteBuilder.tsx`.
- **Tenders**: Both admins and regular businesses can create tenders (with title, description, category, budget range, location, deadline, requirements). Users can browse open tenders, search/filter by category, view details, and submit applications with cover letters and proposed amounts. Tender owners can review applications and update their status (Pending → Shortlisted → Accepted/Rejected). Users cannot apply to their own tenders. Admins have full oversight of all tenders via the admin panel. DB tables: `tenders` and `tender_applications`. API: `server/tenders.ts` mounted at `/api/tenders` (user routes at `/user/*`, admin routes at `/admin/*`). Frontend: `src/pages/TendersPage.tsx` (user dashboard with browse/create/manage views), `AdminTenders` component in `AdminDashboard.tsx` (admin panel).
- **Compliance & Grant Readiness**: Incorporates features for tracking compliance scores and assessing grant readiness.
- **Notifications**: Real-time notification system with bell icon dropdown in the dashboard header. DB table: `notifications`. API: `server/notifications.ts` at `/api/notifications`. Notifications are auto-generated for tender applications (to tender owner) and application status changes (to applicant). Dropdown shows unread count badge, mark-as-read, mark-all-read, clickable links to relevant pages. Polls every 30s for updates. Frontend: `src/components/NotificationDropdown.tsx`.
- **Trial/Subscription Popup**: TrialBanner shows once per session — if user has no subscription, shows a welcome popup explaining the 14-day trial with a "View Plans" CTA. If on TRIAL, shows days remaining popup. If TRIAL expired or PAST_DUE, shows a lock modal. A persistent banner also shows at the top of the dashboard.
- **Email System**: Sends branded HTML emails via SMTP (smtp.masakhegroup.co.za:465) using nodemailer with TLS. Includes welcome email on registration and password reset email flow. `APP_URL` env var set to `https://masakhegroup.co.za` (not replit.dev) to avoid Spamhaus blacklisting. Configured via `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_FROM`, `SMTP_SECURE`, `SMTP_PASSWORD` env vars. Implementation: `server/email.ts` (sendWelcomeEmail, sendPasswordResetEmail), called from `server/auth.ts` endpoints (fire-and-forget, non-blocking).
- **Password Reset Flow**: DB table `password_reset_tokens` (id, user_id, token VARCHAR(64), expires_at, used, created_at). Token expires in 1 hour, single-use, previous tokens invalidated on new request. Endpoints: `POST /api/auth/forgot-password` (always returns ok for security), `POST /api/auth/reset-password` (validates token, hashes new password). Frontend: `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`. Login page has "Forgot your password?" link.
- **Data Security**: Employs AES-256-GCM encryption for sensitive data like social account tokens.
- **PDF Generation**: Uses `pdf-lib` for server-side generation of invoices and terms PDFs.

## Adumo Online Integration
- **Files**: `server/adumo.ts` (JWT generation/verification), `server/billing.ts` (checkout-session + return-redirect endpoints)
- **Secrets**: `ADUMO_CUID` (MerchantID), `ADUMO_AUID` (ApplicationID), `ADUMO_JWT_SECRET`, `ADUMO_ENV` (staging/production), `APP_URL`
- **JWT Token**: HS256 signed, contains `iss`, `cuid`, `auid`, `amount`, `mref`, `jti`, `iat` (now-60s), `exp` (now+600s)
- **Form Fields**: puid, MerchantID, ApplicationID, MerchantReference, Amount, Token, txtCurrencyCode (ZAR), RedirectSuccessfulURL/RedirectFailedURL, subscription fields (frequency=MONTHLY, collectionDay, startDate, endDate, collectionValue, accountNumber, contactNumber, mobileNumber, emailAddress)
- **Return Flow**: Adumo redirects to `GET /api/billing/return-redirect?status=success&merchantRef=SUB_xxx`. Server verifies `_RESPONSE_TOKEN` JWT (validates mref + amount match), marks invoice PAID, creates TRIAL subscription with 14-day trial, extracts card details if available, then redirects to `/dashboard/billing?payment=success`
- **Security**: Response token verification validates merchant reference and amount match before accepting payment. Invoice uses stored `plan_id` for subscription creation (not amount-based lookup). T&C acceptance checkbox required before form submission.

## External Dependencies
- **Database**: Remote MySQL hosted on Xneelo (`sql16.cpt3.host-h.net`).
- **Payment Gateway**: Adumo Online (Virtual HPP form POST for debit order subscriptions).
- **Social Media APIs**: Integrations with Meta (Facebook/Instagram), LinkedIn, X, TikTok, and YouTube (with a Mock Provider Mode for development).
- **Session Management**: `express-mysql-session` for storing session data in MySQL.
- **PDF Generation**: `pdf-lib` for creating PDF documents.
- **File Uploads**: `multer` for handling media file uploads.
