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
      contact_whatsapp VARCHAR(30) NULL,
      status ENUM('pending','active','suspended') DEFAULT 'pending',
      total_smmEs INT DEFAULT 0,
      notes TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      approved_at TIMESTAMP NULL
    )
  `, []).catch(() => {});

  await execute(`ALTER TABLE municipalities ADD COLUMN IF NOT EXISTS contact_whatsapp VARCHAR(30) NULL`, []).catch(() => {});

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

  await execute(`
    CREATE TABLE IF NOT EXISTS municipality_departments (
      id VARCHAR(36) PRIMARY KEY,
      municipality_id VARCHAR(36) NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT NULL,
      department_code VARCHAR(40) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (municipality_id) REFERENCES municipalities(id) ON DELETE CASCADE
    )
  `, []).catch(() => {});

  await execute(`
    CREATE TABLE IF NOT EXISTS municipality_department_admins (
      id VARCHAR(36) PRIMARY KEY,
      department_id VARCHAR(36) NOT NULL,
      email VARCHAR(255) NOT NULL,
      full_name VARCHAR(255) NULL,
      status ENUM('pending','active') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES municipality_departments(id) ON DELETE CASCADE
    )
  `, []).catch(() => {});

  await execute(`ALTER TABLE municipality_smmEs ADD COLUMN IF NOT EXISTS department_id VARCHAR(36) NULL`, []).catch(() => {});

  console.log("[Municipality] Migrations complete");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateMunicipalityCode(name: string): string {
  const base = name.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 5);
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MUN-${base}${suffix}`;
}

// ─── Public: validate a municipality OR department code ───────────────────────
municipalityRouter.get("/check/:code", async (req, res) => {
  try {
    // Check municipality code first
    const mun = await queryOne(
      `SELECT m.id, m.municipality_code, m.municipality_name, m.province
       FROM municipalities m
       WHERE m.municipality_code = ? AND m.status = 'active'`,
      [req.params.code]
    );
    if (mun) {
      return res.json({ valid: true, name: mun.municipality_name, province: mun.province, code: mun.municipality_code });
    }
    // Check department code
    const dept = await queryOne(
      `SELECT d.id, d.department_code, d.name AS department_name,
              m.municipality_name, m.province, m.municipality_code
       FROM municipality_departments d
       JOIN municipalities m ON m.id = d.municipality_id
       WHERE d.department_code = ? AND m.status = 'active'`,
      [req.params.code]
    );
    if (!dept) return res.json({ valid: false });
    res.json({
      valid: true,
      name: dept.municipality_name,
      province: dept.province,
      code: dept.department_code,
      department_name: dept.department_name,
      is_department: true,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Register / join ──────────────────────────────────────────────────────────
municipalityRouter.post("/join", async (req, res) => {
  try {
    const userId = req.session?.userId || req.session?.pending2FAUserId;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });
    const existing = await queryOne("SELECT id FROM municipalities WHERE user_id = ?", [userId]);
    if (existing) return res.status(400).json({ error: "Already registered as a municipality" });

    const { municipality_name, province, district, contact_person, contact_email, contact_phone, contact_whatsapp } = req.body;
    if (!municipality_name) return res.status(400).json({ error: "Municipality name is required" });
    if (!contact_phone?.trim() || !contact_whatsapp?.trim()) {
      return res.status(400).json({ error: "Phone number and WhatsApp number are required" });
    }

    const code = generateMunicipalityCode(municipality_name);
    const id = randomUUID();
    const now = new Date().toISOString();

    await execute(
      `INSERT INTO municipalities (id, user_id, municipality_name, municipality_code, province, district, contact_person, contact_email, contact_phone, contact_whatsapp, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [id, userId, municipality_name, code, province || null, district || null, contact_person || null, contact_email || null, contact_phone, contact_whatsapp, now]
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
    const { municipality_name, province, district, contact_person, contact_email, contact_phone, contact_whatsapp, notes } = req.body;
    if (!contact_phone?.trim() || !contact_whatsapp?.trim()) {
      return res.status(400).json({ error: "Phone number and WhatsApp number are required" });
    }
    await execute(
      `UPDATE municipalities SET municipality_name=?, province=?, district=?, contact_person=?, contact_email=?, contact_phone=?, contact_whatsapp=?, notes=? WHERE user_id=?`,
      [municipality_name, province || null, district || null, contact_person || null, contact_email || null, contact_phone, contact_whatsapp, notes || null, userId]
    );
    await execute("UPDATE users SET phone = ?, updated_at = ? WHERE id = ?", [contact_phone, new Date().toISOString(), userId]);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Link SMME to municipality (or department) when they register with a code ──
export async function linkSmmeToMunicipality(smmeUserId: string, code: string, businessName?: string): Promise<void> {
  try {
    // Try municipality code first
    let mun = await queryOne("SELECT id FROM municipalities WHERE municipality_code = ? AND status = 'active'", [code]);
    let departmentId: string | null = null;

    if (!mun) {
      // Try department code
      const dept = await queryOne(
        `SELECT d.id AS dept_id, m.id AS mun_id
         FROM municipality_departments d
         JOIN municipalities m ON m.id = d.municipality_id
         WHERE d.department_code = ? AND m.status = 'active'`,
        [code]
      );
      if (!dept) return;
      mun = { id: dept.mun_id };
      departmentId = dept.dept_id;
    }

    await execute(
      `INSERT IGNORE INTO municipality_smmEs (id, municipality_id, department_id, smme_user_id, business_name, status, registered_at)
       VALUES (?, ?, ?, ?, ?, 'active', NOW())`,
      [randomUUID(), mun.id, departmentId, smmeUserId, businessName || null]
    );
    await execute(`UPDATE municipalities SET total_smmEs = total_smmEs + 1 WHERE id = ?`, [mun.id]);
  } catch {}
}

// ─── Departments ──────────────────────────────────────────────────────────────
function generateDeptCode(munCode: string, deptName: string): string {
  const base = deptName.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 6);
  const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${munCode}-${base}${suffix}`;
}

// List departments (with their admins)
municipalityRouter.get("/me/departments", requireAuth, async (req, res) => {
  try {
    const userId = req.session!.userId!;
    const mun = await queryOne("SELECT id FROM municipalities WHERE user_id = ?", [userId]);
    if (!mun) return res.status(404).json({ error: "Not found" });

    const depts = await queryAll(
      `SELECT d.id, d.name, d.description, d.department_code, d.created_at,
              (SELECT COUNT(*) FROM municipality_smmEs ms WHERE ms.department_id = d.id) AS smme_count
       FROM municipality_departments d
       WHERE d.municipality_id = ?
       ORDER BY d.created_at ASC`,
      [mun.id]
    );

    // Attach admins to each department
    for (const dept of depts) {
      dept.admins = await queryAll(
        `SELECT id, email, full_name, status, created_at FROM municipality_department_admins WHERE department_id = ? ORDER BY created_at ASC`,
        [dept.id]
      );
    }

    res.json(depts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create department
municipalityRouter.post("/me/departments", requireAuth, async (req, res) => {
  try {
    const userId = req.session!.userId!;
    const mun = await queryOne("SELECT id, municipality_code FROM municipalities WHERE user_id = ?", [userId]);
    if (!mun) return res.status(404).json({ error: "Not found" });

    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "Department name is required" });

    const id = randomUUID();
    const department_code = generateDeptCode(mun.municipality_code, name);

    await execute(
      `INSERT INTO municipality_departments (id, municipality_id, name, description, department_code, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [id, mun.id, name, description || null, department_code]
    );
    res.json({ ok: true, id, department_code });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update department
municipalityRouter.put("/me/departments/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.session!.userId!;
    const mun = await queryOne("SELECT id FROM municipalities WHERE user_id = ?", [userId]);
    if (!mun) return res.status(404).json({ error: "Not found" });

    const { name, description } = req.body;
    await execute(
      `UPDATE municipality_departments SET name = ?, description = ? WHERE id = ? AND municipality_id = ?`,
      [name, description || null, req.params.id, mun.id]
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete department
municipalityRouter.delete("/me/departments/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.session!.userId!;
    const mun = await queryOne("SELECT id FROM municipalities WHERE user_id = ?", [userId]);
    if (!mun) return res.status(404).json({ error: "Not found" });

    await execute(`DELETE FROM municipality_departments WHERE id = ? AND municipality_id = ?`, [req.params.id, mun.id]);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Appoint admin to department
municipalityRouter.post("/me/departments/:id/admins", requireAuth, async (req, res) => {
  try {
    const userId = req.session!.userId!;
    const mun = await queryOne("SELECT id FROM municipalities WHERE user_id = ?", [userId]);
    if (!mun) return res.status(404).json({ error: "Not found" });

    const dept = await queryOne(`SELECT id FROM municipality_departments WHERE id = ? AND municipality_id = ?`, [req.params.id, mun.id]);
    if (!dept) return res.status(404).json({ error: "Department not found" });

    const { email, full_name } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const existing = await queryOne(`SELECT id FROM municipality_department_admins WHERE department_id = ? AND email = ?`, [dept.id, email]);
    if (existing) return res.status(400).json({ error: "This person is already an admin of this department" });

    await execute(
      `INSERT INTO municipality_department_admins (id, department_id, email, full_name, status, created_at) VALUES (?, ?, ?, ?, 'pending', NOW())`,
      [randomUUID(), dept.id, email, full_name || null]
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Remove admin from department
municipalityRouter.delete("/me/departments/:id/admins/:adminId", requireAuth, async (req, res) => {
  try {
    const userId = req.session!.userId!;
    const mun = await queryOne("SELECT id FROM municipalities WHERE user_id = ?", [userId]);
    if (!mun) return res.status(404).json({ error: "Not found" });

    await execute(
      `DELETE mda FROM municipality_department_admins mda
       JOIN municipality_departments d ON d.id = mda.department_id
       WHERE mda.id = ? AND d.municipality_id = ?`,
      [req.params.adminId, mun.id]
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

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
