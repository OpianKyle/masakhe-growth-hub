import { Router } from "express";
import { queryOne, queryAll, execute, pool } from "./db";
import { requireAuth } from "./auth";
import { randomUUID } from "crypto";

export const franchiseRouter = Router();

// ─── Migrations ──────────────────────────────────────────────────────────────
export async function runFranchiseMigrations() {
  const conn = await pool.getConnection();
  try {
    try {
      await conn.query(`ALTER TABLE users MODIFY COLUMN role ENUM('user','admin','franchise') NOT NULL DEFAULT 'user'`);
    } catch (e: any) {
      if (!e.message?.includes("Duplicate") && !e.message?.includes("doesn't exist")) {
        console.error("[Franchise] role enum:", e.message);
      }
    }

    await conn.query(`
      CREATE TABLE IF NOT EXISTS franchises (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(20) NOT NULL UNIQUE,
        owner_user_id VARCHAR(36) NOT NULL UNIQUE,
        status ENUM('active','suspended') NOT NULL DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY(owner_user_id) REFERENCES users(id)
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS franchise_clients (
        id VARCHAR(36) PRIMARY KEY,
        franchise_id VARCHAR(36) NOT NULL,
        client_user_id VARCHAR(36) NOT NULL UNIQUE,
        status ENUM('active','inactive') NOT NULL DEFAULT 'active',
        linked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(franchise_id) REFERENCES franchises(id),
        FOREIGN KEY(client_user_id) REFERENCES users(id)
      ) ENGINE=InnoDB
    `);

    console.log("[Franchise] Migrations complete");
  } finally {
    conn.release();
  }
}

// ─── Middleware ───────────────────────────────────────────────────────────────
export async function requireFranchise(req: any, res: any, next: any) {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  const user = await queryOne("SELECT role FROM users WHERE id = ?", [req.session.userId]);
  if (!user || (user.role !== "franchise" && user.role !== "admin")) {
    return res.status(403).json({ error: "Franchise access required" });
  }
  next();
}

async function getMyFranchise(userId: string) {
  return queryOne("SELECT * FROM franchises WHERE owner_user_id = ?", [userId]);
}

// ─── Routes ──────────────────────────────────────────────────────────────────
franchiseRouter.use(requireAuth);

// GET /api/franchise/me
franchiseRouter.get("/me", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const user = await queryOne("SELECT role FROM users WHERE id = ?", [userId]);
    if (!user || (user.role !== "franchise" && user.role !== "admin")) {
      return res.status(403).json({ error: "Franchise access required" });
    }
    const franchise = await getMyFranchise(userId);
    if (!franchise) return res.status(404).json({ error: "No franchise found for this user" });

    const stats = await queryOne(`
      SELECT
        COUNT(fc.id) as total_clients,
        SUM(CASE WHEN bs.status IN ('ACTIVE','TRIAL') THEN 1 ELSE 0 END) as active_subs,
        SUM(CASE WHEN bp.code = 'starter' AND bs.status IN ('ACTIVE','TRIAL') THEN 1 ELSE 0 END) as starter_count,
        SUM(CASE WHEN bp.code = 'pro'     AND bs.status IN ('ACTIVE','TRIAL') THEN 1 ELSE 0 END) as pro_count,
        SUM(CASE WHEN bp.code = 'premium' AND bs.status IN ('ACTIVE','TRIAL') THEN 1 ELSE 0 END) as premium_count
      FROM franchise_clients fc
      LEFT JOIN workspace_members wm ON wm.user_id = fc.client_user_id
      LEFT JOIN billing_subscriptions bs ON bs.workspace_id = wm.workspace_id AND bs.status IN ('ACTIVE','TRIAL')
      LEFT JOIN billing_plans bp ON bp.id = bs.plan_id
      WHERE fc.franchise_id = ? AND fc.status = 'active'
    `, [franchise.id]);

    res.json({ franchise, stats });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/franchise/clients
franchiseRouter.get("/clients", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const user = await queryOne("SELECT role FROM users WHERE id = ?", [userId]);
    if (!user || (user.role !== "franchise" && user.role !== "admin")) {
      return res.status(403).json({ error: "Franchise access required" });
    }
    const franchise = await getMyFranchise(userId);
    if (!franchise) return res.status(404).json({ error: "No franchise found" });

    const clients = await queryAll(`
      SELECT u.id, u.email, u.full_name, u.created_at,
             COALESCE(bp2.business_name, bp2.trading_name, u.full_name) as business_name,
             bpl.code as plan_code, bpl.name as plan_name,
             bs.status as sub_status, bs.trial_end_at,
             fc.linked_at, fc.status as link_status
      FROM franchise_clients fc
      JOIN users u ON u.id = fc.client_user_id
      LEFT JOIN business_profiles bp2 ON bp2.user_id = u.id
      LEFT JOIN workspace_members wm ON wm.user_id = u.id
      LEFT JOIN billing_subscriptions bs ON bs.workspace_id = wm.workspace_id AND bs.status IN ('ACTIVE','TRIAL')
      LEFT JOIN billing_plans bpl ON bpl.id = bs.plan_id
      WHERE fc.franchise_id = ? AND fc.status = 'active'
      ORDER BY fc.linked_at DESC
    `, [franchise.id]);

    res.json(clients);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/franchise/clients/:id/subscription
franchiseRouter.post("/clients/:id/subscription", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const user = await queryOne("SELECT role FROM users WHERE id = ?", [userId]);
    if (!user || (user.role !== "franchise" && user.role !== "admin")) {
      return res.status(403).json({ error: "Franchise access required" });
    }
    const franchise = await getMyFranchise(userId);
    if (!franchise) return res.status(404).json({ error: "No franchise found" });

    const link = await queryOne(
      "SELECT id FROM franchise_clients WHERE franchise_id = ? AND client_user_id = ? AND status = 'active'",
      [franchise.id, req.params.id]
    );
    if (!link) return res.status(403).json({ error: "This client is not in your franchise" });

    const { plan } = req.body;
    if (!["starter", "pro", "premium"].includes(plan)) {
      return res.status(400).json({ error: "Invalid plan. Use starter, pro, or premium." });
    }

    const billingPlan = await queryOne("SELECT id FROM billing_plans WHERE code = ?", [plan]);
    if (!billingPlan) return res.status(404).json({ error: "Billing plan not found" });

    const wm = await queryOne("SELECT workspace_id FROM workspace_members WHERE user_id = ? LIMIT 1", [req.params.id]);
    if (!wm) return res.status(404).json({ error: "Client workspace not found" });

    const existing = await queryOne("SELECT id FROM billing_subscriptions WHERE workspace_id = ? LIMIT 1", [wm.workspace_id]);
    if (existing) {
      await execute(
        "UPDATE billing_subscriptions SET status = 'ACTIVE', plan_id = ?, cancelled_at = NULL, updated_at = NOW() WHERE id = ?",
        [billingPlan.id, existing.id]
      );
    } else {
      await execute(
        "INSERT INTO billing_subscriptions (workspace_id, plan_id, status) VALUES (?, ?, 'ACTIVE')",
        [wm.workspace_id, billingPlan.id]
      );
    }

    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/franchise/clients/:id/impersonate
franchiseRouter.post("/clients/:id/impersonate", async (req, res) => {
  try {
    const franchiseOwnerId = req.session.userId!;
    const user = await queryOne("SELECT role FROM users WHERE id = ?", [franchiseOwnerId]);
    if (!user || (user.role !== "franchise" && user.role !== "admin")) {
      return res.status(403).json({ error: "Franchise access required" });
    }

    const franchise = await getMyFranchise(franchiseOwnerId);
    if (!franchise) return res.status(404).json({ error: "No franchise found" });

    const link = await queryOne(
      "SELECT id FROM franchise_clients WHERE franchise_id = ? AND client_user_id = ? AND status = 'active'",
      [franchise.id, req.params.id]
    );
    if (!link) return res.status(403).json({ error: "This client is not in your franchise" });

    const target = await queryOne("SELECT id, full_name, email, role FROM users WHERE id = ?", [req.params.id]);
    if (!target) return res.status(404).json({ error: "User not found" });
    if (target.role === "admin" || target.role === "franchise") {
      return res.status(400).json({ error: "Cannot impersonate admin or franchise users" });
    }

    req.session.originalAdminId = franchiseOwnerId;
    req.session.userId = target.id;
    req.session.save(() => {
      res.json({ ok: true, targetName: target.full_name });
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
