import { Router } from "express";
import { queryOne, queryAll, execute } from "./db";
import { requireAuth, requireAdmin, getDataOwnerId } from "./auth";
import { randomUUID } from "crypto";

export const municipalityRouter = Router();

const APP_URL = process.env.APP_URL || "https://masakheportal.co.za";

// ─── Migrations ───────────────────────────────────────────────────────────────
export async function runMunicipalityMigrations() {
  await execute(`
    CREATE TABLE IF NOT EXISTS municipalities (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL UNIQUE,
      municipality_name VARCHAR(255) NOT NULL,
      municipality_code VARCHAR(20) NOT NULL UNIQUE,
      province VARCHAR(100) NULL,
      district VARCHAR(150) NULL,
      contact_person VARCHAR(150) NULL,
      contact_email VARCHAR(255) NULL,
      contact_phone VARCHAR(30) NULL,
      status ENUM('pending','active','suspended') DEFAULT 'pending',
      total_smmEs INT DEFAULT 0,
      notes TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      approved_at TIMESTAMP NULL
    )
  `, []).catch(() => {});

  await execute(`
    CREATE TABLE IF NOT EXISTS municipality_smmEs (
      id VARCHAR(36) PRIMARY KEY,
      municipality_id VARCHAR(36) NOT NULL,
      smme_user_id VARCHAR(36) NOT NULL UNIQUE,
      business_name VARCHAR(255) NULL,
      sector VARCHAR(100) NULL,
      status VARCHAR(20) DEFAULT 'active',
      registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, []).catch(() => {});

  await execute(`
    CREATE TABLE IF NOT EXISTS municipality_support_tickets (
      id VARCHAR(36) PRIMARY KEY,
      municipality_id VARCHAR(36) NOT NULL,
      smme_user_id VARCHAR(36) NULL,
      subject VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      status ENUM('open','in_progress','resolved','closed') DEFAULT 'open',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      resolved_at TIMESTAMP NULL
    )
  `, []).catch(() => {});

  await execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS municipality_code VARCHAR(20) NULL`, []).catch(() => {});

  console.log("[Municipality] Migrations complete");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateMunicipalityCode(name: string): string {
  const base = name.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 5);
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MUN-${base}${suffix}`;
}

// ─── Public: validate a municipality code (used during SMME registration) ─────
municipalityRouter.get("/check/:code", async (req, res) => {
  try {
    const mun = await queryOne(
      `SELECT m.id, m.municipality_code, m.municipality_name, m.province
       FROM municipalities m
       WHERE m.municipality_code = ? AND m.status = 'active'`,
      [req.params.code]
    );
    if (!mun) return res.json({ valid: false });
    res.json({ valid: true, name: mun.municipality_name, province: mun.province, code: mun.municipality_code });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Register / join ──────────────────────────────────────────────────────────
municipalityRouter.post("/join", requireAuth, async (req, res) => {
  try {
    const userId = req.session!.userId!;
    const existing = await queryOne("SELECT id FROM municipalities WHERE user_id = ?", [userId]);
    if (existing) return res.status(400).json({ error: "Already registered as a municipality" });

    const { municipality_name, province, district, contact_person, contact_email, contact_phone } = req.body;
    if (!municipality_name) return res.status(400).json({ error: "Municipality name is required" });

    const code = generateMunicipalityCode(municipality_name);
    const id = randomUUID();
    const now = new Date().toISOString();

    await execute(
      `INSERT INTO municipalities (id, user_id, municipality_name, municipality_code, province, district, contact_person, contact_email, contact_phone, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [id, userId, municipality_name, code, province || null, district || null, contact_person || null, contact_email || null, contact_phone || null, now]
    );

    res.json({ ok: true, code, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Get own municipality profile + stats ─────────────────────────────────────
municipalityRouter.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.session!.userId!;
    const mun = await queryOne(
      `SELECT m.*, 
              (SELECT COUNT(*) FROM municipality_smmEs ms WHERE ms.municipality_id = m.id AND ms.status = 'active') as smme_count,
              (SELECT COUNT(*) FROM municipality_support_tickets st WHERE st.municipality_id = m.id AND st.status = 'open') as open_tickets
       FROM municipalities m WHERE m.user_id = ?`,
      [userId]
    );
    if (!mun) return res.status(404).json({ error: "Not registered as a municipality" });
    res.json(mun);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── List SMMEs under this municipality ───────────────────────────────────────
municipalityRouter.get("/me/smmEs", requireAuth, async (req, res) => {
  try {
    const userId = req.session!.userId!;
    const mun = await queryOne("SELECT id FROM municipalities WHERE user_id = ?", [userId]);
    if (!mun) return res.status(404).json({ error: "Not found" });

    const smmEs = await queryAll(
      `SELECT ms.id, ms.smme_user_id, ms.business_name, ms.sector, ms.status, ms.registered_at,
              u.full_name, u.email,
              bp.business_name as profile_business_name, bp.business_type
       FROM municipality_smmEs ms
       JOIN users u ON u.id = ms.smme_user_id
       LEFT JOIN business_profiles bp ON bp.user_id = ms.smme_user_id
       WHERE ms.municipality_id = ?
       ORDER BY ms.registered_at DESC`,
      [mun.id]
    );
    res.json(smmEs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Support tickets ──────────────────────────────────────────────────────────
municipalityRouter.get("/me/tickets", requireAuth, async (req, res) => {
  try {
    const userId = req.session!.userId!;
    const mun = await queryOne("SELECT id FROM municipalities WHERE user_id = ?", [userId]);
    if (!mun) return res.status(404).json({ error: "Not found" });

    const tickets = await queryAll(
      `SELECT st.*, u.full_name, u.email
       FROM municipality_support_tickets st
       LEFT JOIN users u ON u.id = st.smme_user_id
       WHERE st.municipality_id = ?
       ORDER BY st.created_at DESC`,
      [mun.id]
    );
    res.json(tickets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

municipalityRouter.patch("/me/tickets/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.session!.userId!;
    const mun = await queryOne("SELECT id FROM municipalities WHERE user_id = ?", [userId]);
    if (!mun) return res.status(404).json({ error: "Not found" });

    const { status } = req.body;
    const validStatuses = ["open", "in_progress", "resolved", "closed"];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: "Invalid status" });

    await execute(
      `UPDATE municipality_support_tickets SET status = ?, resolved_at = ? WHERE id = ? AND municipality_id = ?`,
      [status, status === "resolved" || status === "closed" ? new Date().toISOString() : null, req.params.id, mun.id]
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── SMME: get my linked municipality info ────────────────────────────────────
municipalityRouter.get("/my-info", requireAuth, async (req, res) => {
  try {
    const userId = req.session!.userId!;
    const row = await queryOne(
      `SELECT m.municipality_name, m.province, m.district, m.contact_person,
              m.contact_email, m.contact_phone, m.municipality_code, m.status
       FROM municipality_smmEs ms
       JOIN municipalities m ON m.id = ms.municipality_id
       WHERE ms.smme_user_id = ?`,
      [userId]
    );
    if (!row) return res.json({ linked: false });
    res.json({ linked: true, ...row });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── SMME: submit a support ticket ───────────────────────────────────────────
municipalityRouter.post("/my-tickets", requireAuth, async (req, res) => {
  try {
    const userId = req.session!.userId!;
    const ms = await queryOne(
      `SELECT ms.municipality_id FROM municipality_smmEs ms WHERE ms.smme_user_id = ?`,
      [userId]
    );
    if (!ms) return res.status(400).json({ error: "You are not linked to a municipality." });
    const { subject, message } = req.body;
    if (!subject || !message) return res.status(400).json({ error: "Subject and message are required." });
    await execute(
      `INSERT INTO municipality_support_tickets (id, municipality_id, smme_user_id, subject, message, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'open', NOW())`,
      [randomUUID(), ms.municipality_id, userId, subject, message]
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── SMME: view my submitted tickets ─────────────────────────────────────────
municipalityRouter.get("/my-tickets", requireAuth, async (req, res) => {
  try {
    const userId = req.session!.userId!;
    const tickets = await queryAll(
      `SELECT st.id, st.subject, st.message, st.status, st.created_at, st.resolved_at
       FROM municipality_support_tickets st
       JOIN municipality_smmEs ms ON ms.municipality_id = st.municipality_id
       WHERE ms.smme_user_id = ? AND st.smme_user_id = ?
       ORDER BY st.created_at DESC`,
      [userId, userId]
    );
    res.json(tickets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Update profile ───────────────────────────────────────────────────────────
municipalityRouter.put("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.session!.userId!;
    const { municipality_name, province, district, contact_person, contact_email, contact_phone, notes } = req.body;
    await execute(
      `UPDATE municipalities SET municipality_name=?, province=?, district=?, contact_person=?, contact_email=?, contact_phone=?, notes=? WHERE user_id=?`,
      [municipality_name, province || null, district || null, contact_person || null, contact_email || null, contact_phone || null, notes || null, userId]
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Link SMME to municipality when they register with a code ─────────────────
export async function linkSmmeToMunicipality(smmeUserId: string, municipalityCode: string, businessName?: string): Promise<void> {
  try {
    const mun = await queryOne("SELECT id FROM municipalities WHERE municipality_code = ? AND status = 'active'", [municipalityCode]);
    if (!mun) return;

    await execute(
      `INSERT IGNORE INTO municipality_smmEs (id, municipality_id, smme_user_id, business_name, status, registered_at)
       VALUES (?, ?, ?, ?, 'active', NOW())`,
      [randomUUID(), mun.id, smmeUserId, businessName || null]
    );
    await execute(`UPDATE municipalities SET total_smmEs = total_smmEs + 1 WHERE id = ?`, [mun.id]);
  } catch {}
}

// ─── Admin routes ─────────────────────────────────────────────────────────────
municipalityRouter.get("/admin/list", requireAuth, requireAdmin, async (req, res) => {
  try {
    const muns = await queryAll(
      `SELECT m.*, u.full_name, u.email,
              (SELECT COUNT(*) FROM municipality_smmEs ms WHERE ms.municipality_id = m.id) as smme_count
       FROM municipalities m
       JOIN users u ON u.id = m.user_id
       ORDER BY m.created_at DESC`,
      []
    );
    res.json(muns);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

municipalityRouter.get("/admin/smmEs", requireAuth, requireAdmin, async (req, res) => {
  try {
    const rows = await queryAll(
      `SELECT ms.id, ms.smme_user_id, ms.business_name, ms.sector, ms.status, ms.registered_at,
              u.full_name, u.email,
              bp.business_name as profile_business_name, bp.business_type,
              m.municipality_name, m.province, m.municipality_code
       FROM municipality_smmEs ms
       JOIN users u ON u.id = ms.smme_user_id
       JOIN municipalities m ON m.id = ms.municipality_id
       LEFT JOIN business_profiles bp ON bp.user_id = ms.smme_user_id
       ORDER BY ms.registered_at DESC`,
      []
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

municipalityRouter.patch("/admin/:id/status", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "active", "suspended"];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: "Invalid status" });
    await execute(
      `UPDATE municipalities SET status = ?, approved_at = ? WHERE id = ?`,
      [status, status === "active" ? new Date().toISOString() : null, req.params.id]
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
