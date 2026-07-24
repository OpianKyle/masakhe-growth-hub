import { Router } from "express";
import { queryOne, queryAll, execute } from "./db";
import { requireAuth, requireAdmin } from "./auth";
import { randomUUID } from "crypto";

export const nexoRouter = Router();

// ─── Migrations ───────────────────────────────────────────────────────────────
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

  console.log("[Nexo] Migrations complete");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generatePartnerCode(name: string): string {
  const base = name.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 5);
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NEXO-${base}${suffix}`;
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

    const code = generatePartnerCode(partner_name);
    const id = randomUUID();

    await execute(
      `INSERT INTO nexo_partners (id, user_id, partner_name, partner_code, region, branch, contact_person, contact_email, contact_phone, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [id, userId, partner_name, code, region || null, branch || null, contact_person || null, contact_email || null, contact_phone || null]
    );

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

nexoRouter.patch("/admin/:id/status", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "active", "suspended"];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: "Invalid status" });
    await execute(
      `UPDATE nexo_partners SET status = ?, approved_at = ? WHERE id = ?`,
      [status, status === "active" ? new Date().toISOString() : null, req.params.id]
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Link SMME to Nexo partner when they register with a code ─────────────────
export async function linkClientToNexo(clientUserId: string, partnerCode: string, businessName?: string): Promise<void> {
  try {
    const partner = await queryOne("SELECT id FROM nexo_partners WHERE partner_code = ? AND status = 'active'", [partnerCode]);
    if (!partner) return;

    await execute(
      `INSERT IGNORE INTO nexo_clients (id, partner_id, client_user_id, business_name, status, registered_at)
       VALUES (?, ?, ?, ?, 'active', NOW())`,
      [randomUUID(), partner.id, clientUserId, businessName || null]
    );
    await execute(`UPDATE nexo_partners SET total_clients = total_clients + 1 WHERE id = ?`, [partner.id]);
  } catch {}
}
