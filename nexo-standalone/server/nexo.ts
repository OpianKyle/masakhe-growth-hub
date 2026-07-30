import { Router } from "express";
import { queryOne, queryAll, execute } from "./db.js";
import { requireAuth, requireAdmin } from "./auth.js";
import { randomUUID } from "crypto";

export const nexoRouter = Router();

// ─── Migrations (called from index.ts) ────────────────────────────────────────
export async function runNexoMigrations() {
  await execute(`
    CREATE TABLE IF NOT EXISTS nexo_partners (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL UNIQUE,
      partner_name VARCHAR(255) NOT NULL,
      partner_code VARCHAR(20) NOT NULL UNIQUE,
      region VARCHAR(100) NULL,
      branch VARCHAR(150) NULL,
      contact_person VARCHAR(150) NULL,
      contact_email VARCHAR(255) NULL,
      contact_phone VARCHAR(30) NULL,
      status ENUM('pending','active','suspended') DEFAULT 'pending',
      total_clients INT DEFAULT 0,
      notes TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      approved_at TIMESTAMP NULL
    )
  `, []).catch(() => {});

  await execute(`
    CREATE TABLE IF NOT EXISTS nexo_clients (
      id VARCHAR(36) PRIMARY KEY,
      partner_id VARCHAR(36) NOT NULL,
      client_user_id VARCHAR(36) NOT NULL UNIQUE,
      business_name VARCHAR(255) NULL,
      sector VARCHAR(100) NULL,
      status VARCHAR(20) DEFAULT 'active',
      registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, []).catch(() => {});

  await execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS nexo_code VARCHAR(50) NULL`, []).catch(() => {});
  console.log("[Nexo] Migrations complete");
}

// ─── Public: validate a partner code ──────────────────────────────────────────
nexoRouter.get("/check/:code", async (req, res) => {
  try {
    const partner = await queryOne(
      `SELECT id, partner_code, partner_name, region FROM nexo_partners WHERE partner_code = ? AND status = 'active'`,
      [req.params.code]
    );
    if (!partner) return res.json({ valid: false });
    res.json({ valid: true, name: partner.partner_name, region: partner.region, code: partner.partner_code });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Register as Nexo partner ──────────────────────────────────────────────────
nexoRouter.post("/join", requireAuth, async (req, res) => {
  try {
    const userId = req.session!.userId!;
    const existing = await queryOne("SELECT id FROM nexo_partners WHERE user_id = ?", [userId]);
    if (existing) return res.status(400).json({ error: "Already registered as a Nexo partner" });

    const { partner_name, region, branch, contact_person, contact_email, contact_phone } = req.body;
    if (!partner_name) return res.status(400).json({ error: "Partner/branch name is required" });

    const base = partner_name.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 5);
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `NEXO-${base}${suffix}`;
    const id = randomUUID();

    await execute(
      `INSERT INTO nexo_partners (id, user_id, partner_name, partner_code, region, branch, contact_person, contact_email, contact_phone, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [id, userId, partner_name, code, region || null, branch || null, contact_person || null, contact_email || null, contact_phone || null]
    );

    // Mirror into franchises so /api/franchise/me works
    await execute(
      `INSERT IGNORE INTO franchises (id, name, code, owner_user_id, status, created_at)
       VALUES (?, ?, ?, ?, 'active', NOW())`,
      [randomUUID(), partner_name, code, userId]
    ).catch(() => {});

    // Upgrade user role
    await execute(`UPDATE users SET role = 'franchise' WHERE id = ?`, [userId]);

    res.json({ ok: true, code, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Admin: list all nexo partners ────────────────────────────────────────────
nexoRouter.get("/admin/list", requireAuth, requireAdmin, async (req, res) => {
  try {
    const partners = await queryAll(
      `SELECT p.*, u.full_name, u.email,
              (SELECT COUNT(*) FROM nexo_clients c WHERE c.partner_id = p.id) as client_count
       FROM nexo_partners p
       JOIN users u ON u.id = p.user_id
       ORDER BY p.created_at DESC`,
      []
    );
    res.json(partners);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Admin: update partner status ─────────────────────────────────────────────
nexoRouter.patch("/admin/:id/status", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "active", "suspended"].includes(status))
      return res.status(400).json({ error: "Invalid status" });

    await execute(
      `UPDATE nexo_partners SET status = ?, approved_at = ? WHERE id = ?`,
      [status, status === "active" ? new Date().toISOString() : null, req.params.id]
    );

    const partner = await queryOne("SELECT user_id FROM nexo_partners WHERE id = ?", [req.params.id]);
    if (partner) {
      const fsStatus = status === "active" ? "active" : "suspended";
      await execute(`UPDATE franchises SET status = ? WHERE owner_user_id = ?`, [fsStatus, partner.user_id]).catch(() => {});
    }

    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Admin: get clients for a partner ─────────────────────────────────────────
nexoRouter.get("/admin/:id/clients", requireAuth, requireAdmin, async (req, res) => {
  try {
    const clients = await queryAll(
      `SELECT nc.id, nc.client_user_id, nc.business_name, nc.sector, nc.status, nc.registered_at,
              u.full_name, u.email, u.phone,
              bp.business_name as profile_business_name, bp.business_type, bp.industry_sector
       FROM nexo_clients nc
       JOIN users u ON u.id = nc.client_user_id
       LEFT JOIN business_profiles bp ON bp.user_id = nc.client_user_id
       WHERE nc.partner_id = ?
       ORDER BY nc.registered_at DESC`,
      [req.params.id]
    );
    res.json(clients);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/nexo/my/clients ─────────────────────────────────────────────────
nexoRouter.get("/my/clients", requireAuth, async (req, res) => {
  try {
    const userId = req.session!.userId!;
    const partner = await queryOne("SELECT id FROM nexo_partners WHERE user_id = ?", [userId]);
    if (!partner) return res.status(403).json({ error: "Not a Nexo partner" });

    const clients = await queryAll(
      `SELECT nc.id, nc.client_user_id, nc.business_name, nc.sector, nc.status, nc.registered_at,
              u.full_name, u.email, u.phone,
              bp.business_name as profile_business_name, bp.business_type, bp.industry_sector
       FROM nexo_clients nc
       JOIN users u ON u.id = nc.client_user_id
       LEFT JOIN business_profiles bp ON bp.user_id = nc.client_user_id
       WHERE nc.partner_id = ?
       ORDER BY nc.registered_at DESC`,
      [partner.id]
    );
    res.json(clients);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/nexo/my/clients/:id/impersonate ────────────────────────────────
nexoRouter.post("/my/clients/:clientUserId/impersonate", requireAuth, async (req, res) => {
  try {
    const userId = req.session!.userId!;
    const { clientUserId } = req.params;

    const partner = await queryOne("SELECT id FROM nexo_partners WHERE user_id = ?", [userId]);
    if (!partner) return res.status(403).json({ error: "Not a Nexo partner" });

    const client = await queryOne(
      "SELECT id FROM nexo_clients WHERE partner_id = ? AND client_user_id = ?",
      [partner.id, clientUserId]
    );
    if (!client) return res.status(404).json({ error: "Client not found" });

    const target = await queryOne("SELECT id, full_name FROM users WHERE id = ?", [clientUserId]);
    if (!target) return res.status(404).json({ error: "User not found" });

    req.session!.actingAsOwnerId = userId;
    req.session!.userId = clientUserId;
    await new Promise<void>((resolve, reject) => req.session!.save(e => e ? reject(e) : resolve()));
    res.json({ ok: true, name: target.full_name });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
