# Masakhe - SMME Business Platform

## Overview
Masakhe is a digital platform designed to empower South African SMMEs with comprehensive business management tools. It streamlines operations such as business registration, digital presence establishment, tax compliance, financial tracking, social media management, and customer engagement. The platform integrates essential functionalities into a single application, utilizing a South African flag-inspired color palette for its user interface. The project aims to provide a robust, all-in-one solution for SMMEs to thrive in the South African market.

## User Preferences
- Remote MySQL database on Xneelo (no SQLite, no paid Replit services)
- South African business context (Rand currency, SA tax/compliance)

## System Architecture
Masakhe employs a modern web architecture with a React 18 frontend, TypeScript, and Vite, interacting with an Express.js backend using `mysql2/promise` for database operations. Styling is managed with Tailwind CSS and `shadcn/ui` components. Navigation is handled by React Router DOM, state management by TanStack React Query, and data visualization by Recharts. Authentication uses `express-session` and `express-mysql-session` with `bcryptjs`.

Key architectural and feature specifications include:

-   **Modular Design**: The application is structured into distinct modules for social media, billing, finance, and user management, each with dedicated API routes and logic.
-   **Multi-tenancy**: The Social Media Hub features a workspace system with role-based access (Owner, Admin, Editor, Viewer) to support collaborative business management.
-   **Subscription & Billing**: Implemented via Adumo Online, offering three tiered plans (Enterprize, Enterprize Plus, Enterprize Premium) with plan-tier feature gating in the dashboard. This includes free trials, promo code integration (WELCOME50 for first-month discount), and upgrade/downgrade functionalities.
-   **Registration Flow**: A 6-step payment-free registration process leading to plan selection and trial initiation on the billing page.
-   **Dynamic Dashboard**: Provides real-time insights into business KPIs, financial data, and social media activity through interactive charts and aggregated data.
-   **Content Management**: A Social Media Hub offers a content calendar, multi-platform post builder, and a media library. Scheduled posts are handled by a background worker.
-   **Custom Domain Hosting**: Allows users to link custom domains to their Masakhe-built websites, utilizing a `CustomDomainGate` for direct site rendering.
-   **User & Business Profile Management**: Comprehensive settings for managing user and business details, including logo uploads.
-   **Website Builder**: Features 44 industry-specific templates (41 standard, 3 premium). Includes a Template Picker UI with search, sort, and category filters.
-   **Vehicle Inventory System**: (Pro plan) Integrated for Car Showroom template users, enabling management of vehicle listings with public and authenticated CRUD APIs.
-   **Website Leads System**: (Pro plan) Captures leads from website contact forms, storing them in `website_leads` and providing management, export, and import functionalities.
-   **Clients Management**: A Brokerage CRM for client portfolio management, including document uploads and comprehensive CRUD operations.
-   **Tenders**: Functionality for users to create, browse, apply for, and manage tenders. Admins have full oversight.
-   **Business Funding Toolkit**: A suite of 6 integrated modules: CIPC Company Verification, AI-powered Business Plan Builder, Funding Proposal Generator, Annual Financial Statements, Funding Application Generator, and Funding Scoring (Grant Readiness).
-   **WhatsApp Support Portal**: Provides direct WhatsApp support with pre-filled messages for quick topic resolution.
-   **Team Members**: (Premium plan) Multi-user workspace management with role assignment and seat-limit enforcement.
-   **Notifications**: Real-time notification system with a dashboard bell icon, displaying unread counts and clickable links.
-   **Email System**: Branded HTML emails sent via SMTP using nodemailer for welcome and password reset functionalities.
-   **Password Reset Flow**: Secure password reset mechanism with token-based validation and expiration.
-   **Leave & HR Module**: Full leave management with request creation, approval, and balance tracking.
-   **Payroll Module**: Comprehensive South African payroll management including employee CRUD, live calculation previews, allowances, deductions, and payslip generation.
-   **Admin Impersonation**: Allows administrators to log in as other non-admin users for support, with clear visual indicators and a return function.
-   **Inventory & Stock-take**: (Pro plan) Barcode-driven inventory management including product tracking, stock movements, stock-take sessions with scanner integration, and low-stock alerts.
-   **Admin Enhancements**: Includes client filtering and search, per-client notes and tags, a financial dashboard overview with key metrics, and an auditable log for admin actions.
-   **Data Security**: Utilizes AES-256-GCM encryption for sensitive data such as social account tokens.
-   **PDF Generation**: Employs `pdf-lib` for server-side generation of invoices and other documents.

## External Dependencies
-   **Database**: Remote MySQL on Xneelo (`sql16.cpt3.host-h.net`).
-   **Payment Gateway**: Adumo Online (Virtual HPP for debit order subscriptions).
-   **Social Media APIs**: Meta (Facebook/Instagram) for OAuth and Graph API publishing. LinkedIn, X, TikTok, and YouTube are currently in mock mode.
-   **Session Management**: `express-mysql-session` for storing session data.
-   **PDF Generation**: `pdf-lib` for creating PDF documents.
-   **File Uploads**: `multer` for handling media file uploads.
-   **CSV Import/Export**: Integrated CSV functionalities for finance ledger entries and invoices.
-   **Automations**: Scheduled and reactive automations for invoices, quotes, leads, and client engagement.
-   **Barcode Scanning**: `@zxing/browser` and `@zxing/library` for client-side barcode scanning.