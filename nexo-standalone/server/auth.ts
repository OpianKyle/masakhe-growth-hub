import { Request, Response, NextFunction, Router } from "express";
import { queryOne, execute } from "./db.js";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

export const authRouter = Router();

declare module "express-session" {
  interface SessionData {
    userId?: string;
    originalAdminId?: string;
    actingAsOwnerId?: string | null;
  }
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  const user = await queryOne("SELECT role FROM users WHERE id = ?", [req.session.userId]);
  if (!user || user.role !== "admin") return res.status(403).json({ error: "Admin access required" });
  next();
}

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

authRouter.get("/me", async (req, res) => {
  if (!req.session?.userId) return res.json({ user: null });
  try {
    const user = await queryOne(
      `SELECT u.id, u.email, u.full_name, u.role, u.phone,
              bp.business_name, bp.industry_sector, bp.business_type
       FROM users u
       LEFT JOIN business_profiles bp ON bp.user_id = u.id
       WHERE u.id = ?`,
      [req.session.userId]
    );
    const isImpersonating = !!(req.session as any).actingAsOwnerId;
    let originalAdminName: string | null = null;
    if (isImpersonating) {
      const admin = await queryOne("SELECT full_name FROM users WHERE id = ?", [(req.session as any).actingAsOwnerId]);
      originalAdminName = admin?.full_name || null;
    }
    res.json({ user, isImpersonating, originalAdminName });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const user = await queryOne("SELECT * FROM users WHERE email = ?", [email.toLowerCase()]);
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: "Invalid email or password" });

    req.session.userId = user.id;
    req.session.actingAsOwnerId = null;

    await new Promise<void>((resolve, reject) => req.session.save(e => e ? reject(e) : resolve()));
    res.json({ ok: true, user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/auth/register ──────────────────────────────────────────────────

authRouter.post("/register", async (req, res) => {
  try {
    const { email, password, fullName, businessData, franchiseCode } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: "Email, password, and full name are required" });
    }

    const existing = await queryOne("SELECT id FROM users WHERE email = ?", [email.toLowerCase()]);
    if (existing) return res.status(400).json({ error: "An account with this email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = randomUUID();
    const now = new Date().toISOString();

    await execute(
      `INSERT INTO users (id, email, password_hash, full_name, role, phone, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'user', ?, ?, ?)`,
      [userId, email.toLowerCase(), passwordHash, fullName, businessData?.phone || null, now, now]
    );

    if (businessData) {
      await execute(
        `INSERT INTO business_profiles (id, user_id, business_name, business_type, industry_sector, phone, email, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [randomUUID(), userId, businessData.businessName || null, businessData.businessType || null,
         businessData.industrySector || null, businessData.phone || null, email.toLowerCase(), now, now]
      ).catch(() => {});
    }

    const wsId = randomUUID();
    await execute("INSERT INTO workspaces (id, name, owner_id, created_at, updated_at) VALUES (?,?,?,?,?)",
      [wsId, businessData?.businessName || `${fullName}'s Business`, userId, now, now]);
    await execute("INSERT INTO workspace_members (id, workspace_id, user_id, role, created_at) VALUES (?,?,?,?,?)",
      [randomUUID(), wsId, userId, "owner", now]);

    // Link to nexo partner if a NEXO code was provided
    if (franchiseCode && franchiseCode.toUpperCase().startsWith("NEXO")) {
      await execute("UPDATE users SET nexo_code = ? WHERE id = ?", [franchiseCode, userId]).catch(() => {});
      try {
        const partner = await queryOne(
          "SELECT id FROM nexo_partners WHERE partner_code = ? AND status = 'active'",
          [franchiseCode]
        );
        if (partner) {
          const bName = businessData?.businessName || fullName;
          await execute(
            `INSERT IGNORE INTO nexo_clients (id, partner_id, client_user_id, business_name, status, registered_at)
             VALUES (?, ?, ?, ?, 'active', NOW())`,
            [randomUUID(), partner.id, userId, bName || null]
          );
          await execute("UPDATE nexo_partners SET total_clients = total_clients + 1 WHERE id = ?", [partner.id]);
        }
      } catch (e: any) {
        console.error("[Auth] nexo client link error:", e.message);
      }
    }

    req.session.userId = userId;
    req.session.actingAsOwnerId = null;
    await new Promise<void>((resolve, reject) => req.session.save(e => e ? reject(e) : resolve()));

    res.json({ ok: true, user: { id: userId, email: email.toLowerCase(), full_name: fullName, role: "user" } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────

authRouter.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});
