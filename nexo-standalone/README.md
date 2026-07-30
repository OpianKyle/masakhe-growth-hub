# Nexo Standalone Portal

A self-contained, runnable version of the **Nexo Business Portal** — partner dashboard + admin panel.

## Stack

| Layer     | Tech                                              |
|-----------|---------------------------------------------------|
| Frontend  | React 18 + Vite + TypeScript + Tailwind CSS v4    |
| Backend   | Express + express-session (MySQL store)           |
| Database  | MySQL / MariaDB (same DB as main app, or separate)|
| Auth      | Session-based (bcrypt passwords)                  |

---

## Quick Start

### 1. Install dependencies

```bash
cd nexo-standalone
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your MySQL credentials and a long SESSION_SECRET
```

### 3. Create your first admin account

```bash
npm run seed:admin
# Follow the prompts — enter email, name, and password
```

### 4. Run in development

```bash
# Terminal 1 — backend (port 3001)
npx tsx server/index.ts

# Terminal 2 — frontend (port 5173, proxies /api → 3001)
npx vite
```

Open http://localhost:5173 → `/nexo`

---

## Routes

| URL              | Description                                                   |
|------------------|---------------------------------------------------------------|
| `/nexo`          | Login / Register page                                         |
| `/nexo/dashboard`| Partner dashboard (franchise/admin only)                      |
| `/nexo/admin`    | Admin panel — manage partners (admin only)                    |

---

## User Roles

| Role        | Access                                                  |
|-------------|---------------------------------------------------------|
| `user`      | Registers via partner link; no portal access            |
| `franchise` | Full partner dashboard (clients, promotions, reg link)  |
| `admin`     | Everything + admin panel at `/nexo/admin`               |

---

## Partner onboarding flow

1. A `franchise` user calls **POST /api/nexo/join** (done via the partner registration form — add a page if needed).
2. An admin approves them at `/nexo/admin` → **Approve** button.
3. The approved partner shares their registration link (`/nexo?tab=register&code=NEXO-XXXXX`).
4. New clients register with that link and are automatically linked to the partner.

---

## API Endpoints

### Auth
| Method | Path                  | Auth     | Description         |
|--------|-----------------------|----------|---------------------|
| GET    | `/api/auth/me`        | —        | Current session user|
| POST   | `/api/auth/login`     | —        | Log in              |
| POST   | `/api/auth/register`  | —        | Register            |
| POST   | `/api/auth/logout`    | session  | Log out             |

### Nexo Partners
| Method | Path                                     | Auth    | Description                     |
|--------|------------------------------------------|---------|---------------------------------|
| GET    | `/api/nexo/check/:code`                  | —       | Validate a partner code         |
| POST   | `/api/nexo/join`                         | session | Register as Nexo partner        |
| GET    | `/api/nexo/my/clients`                   | session | List my clients                 |
| POST   | `/api/nexo/my/clients/:id/impersonate`   | session | Impersonate a client session    |
| GET    | `/api/nexo/admin/list`                   | admin   | List all partners               |
| PATCH  | `/api/nexo/admin/:id/status`             | admin   | Approve/suspend/reactivate      |
| GET    | `/api/nexo/admin/:id/clients`            | admin   | View clients for a partner      |

### Franchise / Promotions
| Method | Path                              | Auth    | Description              |
|--------|-----------------------------------|---------|--------------------------|
| GET    | `/api/franchise/me`               | session | My franchise info + stats|
| GET    | `/api/franchise/promotions`       | session | List promotions          |
| POST   | `/api/franchise/promotions`       | session | Create promotion         |
| PUT    | `/api/franchise/promotions/:id`   | session | Update promotion         |
| DELETE | `/api/franchise/promotions/:id`   | session | Delete promotion         |

---

## Production Build

```bash
npm run build      # builds frontend → dist/client/
npm start          # runs Express serving dist/client/ on PORT
```

Set `NODE_ENV=production` in your `.env` for the production cookie settings.

---

## Database

The app auto-runs migrations on startup and creates all required tables:

- `users` — with `role ENUM('user','admin','franchise')`
- `business_profiles`
- `workspaces` + `workspace_members`
- `franchises` + `franchise_clients`
- `mtn_promotions`
- `nexo_partners` + `nexo_clients`
- `password_reset_tokens`
- `nexo_sessions` (express-mysql-session)

> **Tip:** You can point this at your existing main app database — migrations use `CREATE TABLE IF NOT EXISTS` and `ALTER TABLE … ADD COLUMN IF NOT EXISTS`, so they're safe to run against a database that already has these tables.
