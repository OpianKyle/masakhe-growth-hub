import { Router } from "express";
import { queryOne, queryAll, execute } from "./db";
import { requireAuth, requireAdmin } from "./auth";
import { randomUUID } from "crypto";

export const mtnRouter = Router();

// ─── Migrations ───────────────────────────────────────────────────────────────
export async function runMtnMigrations() {
  await execute(`
    CREATE TABLE IF NOT EXISTS mtn_partners (
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
    CREATE TABLE IF NOT EXISTS mtn_clients (
      id VARCHAR(36) PRIMARY KEY,
      partner_id VARCHAR(36) NOT NULL,
      client_user_id VARCHAR(36) NOT NULL UNIQUE,
      business_name VARCHAR(255) NULL,
      sector VARCHAR(100) NULL,
      status VARCHAR(20) DEFAULT 'active',
      registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, []).catch(() => {});

  await execute(`
    CREATE TABLE IF NOT EXISTS mtn_support_tickets (
      id VARCHAR(36) PRIMARY KEY,
      partner_id VARCHAR(36) NOT NULL,
      client_user_id VARCHAR(36) NULL,
      subject VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      status ENUM('open','in_progress','resolved','closed') DEFAULT 'open',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      resolved_at TIMESTAMP NULL
    )
  `, []).catch(() => {});

  await execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS mtn_partner_code VARCHAR(20) NULL`, []).catch(() => {});

  console.log("[MTN] Migrations complete");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generatePartnerCode(name: string): string {
  const base = name.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 5);
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MTN-${base}${suffix}`;
}

// ─── Public: validate a partner code ──────────────────────────────────────────
mtnRouter.get("/check/:code", async (req, res) => {
  try {
    const partner = await queryOne(
      `SELECT id, partner_code, partner_name, region FROM mtn_partners WHERE partner_code = ? AND status = 'active'`,
      [req.params.code]
    );
    if (!partner) return res.json({ valid: false });
    res.json({ valid: true, name: partner.partner_name, region: partner.region, code: partner.partner_code });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Register as MTN partner ───────────────────────────────────────────────────
mtnRouter.post("/join", requireAuth, async (req, res) => {
  try {
    const userId = req.session!.userId!;
    const existing = await queryOne("SELECT id FROM mtn_partners WHERE user_id = ?", [userId]);
    if (existing) return res.status(400).json({ error: "Already registered as an MTN partner" });

    const { partner_name, region, branch, contact_person, contact_email, contact_phone } = req.body;
    if (!partner_name) return res.status(400).json({ error: "Partner/branch name is required" });

    const code = generatePartnerCode(partner_name);
    const id = randomUUID();
    const now = new Date().toISOString();

    await execute(
      `INSERT INTO mtn_partners (id, user_id, partner_name, partner_code, region, branch, contact_person, contact_email, contact_phone, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [id, userId, partner_name, code, region || null, branch || null, contact_person || null, contact_email || null, contact_phone || null, now]
    );

    res.json({ ok: true, code, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Get own partner profile + stats ──────────────────────────────────────────
mtnRouter.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.session!.userId!;
    const partner = await queryOne(
      `SELECT p.*,
              (SELECT COUNT(*) FROM mtn_clients c WHERE c.partner_id = p.id AND c.status = 'active') as client_count,
              (SELECT COUNT(*) FROM mtn_support_tickets t WHERE t.partner_id = p.id AND t.status = 'open') as open_tickets
       FROM mtn_partners p WHERE p.user_id = ?`,
      [userId]
    );
    if (!partner) return res.status(404).json({ error: "Not registered as an MTN partner" });
    res.json(partner);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── List clients under this partner ──────────────────────────────────────────
mtnRouter.get("/me/clients", requireAuth, async (req, res) => {
  try {
    const userId = req.session!.userId!;
    const partner = await queryOne("SELECT id FROM mtn_partners WHERE user_id = ?", [userId]);
    if (!partner) return res.status(404).json({ error: "Not found" });

    const clients = await queryAll(
      `SELECT c.id, c.client_user_id, c.business_name, c.sector, c.status, c.registered_at,
              u.full_name, u.email,
              bp.business_name as profile_business_name, bp.business_type
       FROM mtn_clients c
       JOIN users u ON u.id = c.client_user_id
       LEFT JOIN business_profiles bp ON bp.user_id = c.client_user_id
       WHERE c.partner_id = ?
       ORDER BY c.registered_at DESC`,
      [partner.id]
    );
    res.json(clients);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Support tickets (portal side) ────────────────────────────────────────────
mtnRouter.get("/me/tickets", requireAuth, async (req, res) => {
  try {
    const userId = req.session!.userId!;
    const partner = await queryOne("SELECT id FROM mtn_partners WHERE user_id = ?", [userId]);
    if (!partner) return res.status(404).json({ error: "Not found" });

    const tickets = await queryAll(
      `SELECT t.*, u.full_name, u.email
       FROM mtn_support_tickets t
       LEFT JOIN users u ON u.id = t.client_user_id
       WHERE t.partner_id = ?
       ORDER BY t.created_at DESC`,
      [partner.id]
    );
    res.json(tickets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

mtnRouter.patch("/me/tickets/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.session!.userId!;
    const partner = await queryOne("SELECT id FROM mtn_partners WHERE user_id = ?", [userId]);
    if (!partner) return res.status(404).json({ error: "Not found" });

    const { status } = req.body;
    const validStatuses = ["open", "in_progress", "resolved", "closed"];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: "Invalid status" });

    await execute(
      `UPDATE mtn_support_tickets SET status = ?, resolved_at = ? WHERE id = ? AND partner_id = ?`,
      [status, status === "resolved" || status === "closed" ? new Date().toISOString() : null, req.params.id, partner.id]
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Update profile ────────────────────────────────────────────────────────────
mtnRouter.put("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.session!.userId!;
    const { partner_name, region, branch, contact_person, contact_email, contact_phone, notes } = req.body;
    await execute(
      `UPDATE mtn_partners SET partner_name=?, region=?, branch=?, contact_person=?, contact_email=?, contact_phone=?, notes=? WHERE user_id=?`,
      [partner_name, region || null, branch || null, contact_person || null, contact_email || null, contact_phone || null, notes || null, userId]
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Link SMME to MTN partner when they register with a code ──────────────────
export async function linkClientToMtn(clientUserId: string, partnerCode: string, businessName?: string): Promise<void> {
  try {
    const partner = await queryOne("SELECT id FROM mtn_partners WHERE partner_code = ? AND status = 'active'", [partnerCode]);
    if (!partner) return;

    await execute(
      `INSERT IGNORE INTO mtn_clients (id, partner_id, client_user_id, business_name, status, registered_at)
       VALUES (?, ?, ?, ?, 'active', NOW())`,
      [randomUUID(), partner.id, clientUserId, businessName || null]
    );
    await execute(`UPDATE mtn_partners SET total_clients = total_clients + 1 WHERE id = ?`, [partner.id]);
  } catch {}
}

// ─── Admin routes ──────────────────────────────────────────────────────────────
mtnRouter.get("/admin/list", requireAuth, requireAdmin, async (req, res) => {
  try {
    const partners = await queryAll(
      `SELECT p.*, u.full_name, u.email,
              (SELECT COUNT(*) FROM mtn_clients c WHERE c.partner_id = p.id) as client_count
       FROM mtn_partners p
       JOIN users u ON u.id = p.user_id
       ORDER BY p.created_at DESC`,
      []
    );
    res.json(partners);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

mtnRouter.patch("/admin/:id/status", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "active", "suspended"];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: "Invalid status" });
    await execute(
      `UPDATE mtn_partners SET status = ?, approved_at = ? WHERE id = ?`,
      [status, status === "active" ? new Date().toISOString() : null, req.params.id]
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
