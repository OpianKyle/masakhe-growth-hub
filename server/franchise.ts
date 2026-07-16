import { Router } from "express";
import { queryOne, queryAll, execute, pool } from "./db";
import { requireAuth } from "./auth";
import { randomUUID } from "crypto";
import { sendFranchiseApplicationEmail, sendFranchiseClientInviteEmail } from "./email";
import bcrypt from "bcryptjs";

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

    // Patch: add missing columns to existing franchises tables created before migrations were updated
    const patchCols: Array<[string, string]> = [
      ["code",       "ALTER TABLE franchises ADD COLUMN code VARCHAR(20) NOT NULL DEFAULT '' AFTER name"],
      ["created_at", "ALTER TABLE franchises ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP AFTER status"],
      ["updated_at", "ALTER TABLE franchises ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at"],
    ];
    for (const [col, sql] of patchCols) {
      try {
        const [cols] = await conn.query(
          "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'franchises' AND COLUMN_NAME = ?",
          [col]
        );
        if ((cols as any[]).length === 0) {
          await conn.query(sql);
          console.log(`[Franchise] Added missing column: ${col}`);
        }
      } catch (e: any) {
        console.error(`[Franchise] patch column ${col}:`, e.message);
      }
    }

    // Patch: add UNIQUE index on code if missing (for tables that had code added without the index)
    try {
      const [idxRows] = await conn.query(
        "SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'franchises' AND COLUMN_NAME = 'code' AND NON_UNIQUE = 0"
      );
      if ((idxRows as any[]).length === 0) {
        await conn.query("ALTER TABLE franchises ADD UNIQUE INDEX idx_franchises_code (code)");
        console.log("[Franchise] Added UNIQUE index on code");
      }
    } catch (e: any) {
      console.error("[Franchise] patch code index:", e.message);
    }

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

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

async function ensureWorkspace(clientUserId: string): Promise<string> {
  let wm = await queryOne("SELECT workspace_id FROM workspace_members WHERE user_id = ? LIMIT 1", [clientUserId]);
  if (wm) return wm.workspace_id;
  const wsId = randomUUID();
  const now = new Date().toISOString();
  const u = await queryOne("SELECT full_name FROM users WHERE id = ?", [clientUserId]);
  await execute("INSERT INTO workspaces (id, name, owner_id, created_at, updated_at) VALUES (?,?,?,?,?)",
    [wsId, u?.full_name || "Business", clientUserId, now, now]);
  await execute("INSERT INTO workspace_members (id, workspace_id, user_id, role, created_at) VALUES (?,?,?,?,?)",
    [randomUUID(), wsId, clientUserId, "owner", now]);
  return wsId;
}

async function assertClientInFranchise(franchiseId: string, clientId: string) {
  return queryOne(
    "SELECT id FROM franchise_clients WHERE franchise_id = ? AND client_user_id = ? AND status = 'active'",
    [franchiseId, clientId]
  );
}

// ─── Public Routes (no auth) ──────────────────────────────────────────────────

franchiseRouter.get("/info/:code", async (req, res) => {
  try {
    const franchise = await queryOne(
      "SELECT name, code FROM franchises WHERE code = ? AND status = 'active'",
      [req.params.code]
    );
    if (!franchise) return res.status(404).json({ error: "Franchise not found" });
    res.json({ name: franchise.name, code: franchise.code });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Authenticated Routes ────────────────────────────────────────────────────
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
             u.admin_notes, u.admin_tags, u.subscription_exempt,
             COALESCE(bp2.business_name, bp2.trading_name, u.full_name) as business_name,
             bp2.phone, bp2.industry_sector,
             bpl.code as plan_code, bpl.name as plan_name, bpl.price_cents as plan_price_cents,
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

    const parsed = clients.map((c: any) => ({
      ...c,
      admin_tags: typeof c.admin_tags === "string"
        ? (() => { try { return JSON.parse(c.admin_tags); } catch { return []; } })()
        : (c.admin_tags || []),
      subscription_exempt: !!c.subscription_exempt,
    }));

    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Notes ───────────────────────────────────────────────────────────────────
franchiseRouter.patch("/clients/:id/notes", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const user = await queryOne("SELECT role FROM users WHERE id = ?", [userId]);
    if (!user || (user.role !== "franchise" && user.role !== "admin")) return res.status(403).json({ error: "Franchise access required" });
    const franchise = await getMyFranchise(userId);
    if (!franchise) return res.status(404).json({ error: "No franchise found" });
    if (!await assertClientInFranchise(franchise.id, req.params.id)) return res.status(403).json({ error: "Client not in your franchise" });

    const { notes } = req.body;
    await execute("UPDATE users SET admin_notes = ?, updated_at = ? WHERE id = ?",
      [notes ?? null, new Date().toISOString(), req.params.id]);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Tags ────────────────────────────────────────────────────────────────────
franchiseRouter.patch("/clients/:id/tags", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const user = await queryOne("SELECT role FROM users WHERE id = ?", [userId]);
    if (!user || (user.role !== "franchise" && user.role !== "admin")) return res.status(403).json({ error: "Franchise access required" });
    const franchise = await getMyFranchise(userId);
    if (!franchise) return res.status(404).json({ error: "No franchise found" });
    if (!await assertClientInFranchise(franchise.id, req.params.id)) return res.status(403).json({ error: "Client not in your franchise" });

    const tags = Array.isArray(req.body?.tags) ? req.body.tags : [];
    const cleaned = Array.from(new Set(
      tags.map((t: any) => String(t || "").trim()).filter((t: string) => t.length > 0 && t.length <= 40)
    )).slice(0, 12);
    await execute("UPDATE users SET admin_tags = ?, updated_at = ? WHERE id = ?",
      [JSON.stringify(cleaned), new Date().toISOString(), req.params.id]);
    res.json({ ok: true, tags: cleaned });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Grant Trial ─────────────────────────────────────────────────────────────
franchiseRouter.post("/clients/:id/trial", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const user = await queryOne("SELECT role FROM users WHERE id = ?", [userId]);
    if (!user || (user.role !== "franchise" && user.role !== "admin")) return res.status(403).json({ error: "Franchise access required" });
    const franchise = await getMyFranchise(userId);
    if (!franchise) return res.status(404).json({ error: "No franchise found" });
    if (!await assertClientInFranchise(franchise.id, req.params.id)) return res.status(403).json({ error: "Client not in your franchise" });

    const premiumPlan = await queryOne("SELECT id FROM billing_plans WHERE code = 'premium'");
    if (!premiumPlan) return res.status(404).json({ error: "Premium plan not found" });

    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);
    const trialEndStr = trialEnd.toISOString().slice(0, 19).replace("T", " ");
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    const workspaceId = await ensureWorkspace(req.params.id);
    const existing = await queryOne("SELECT id FROM billing_subscriptions WHERE workspace_id = ? LIMIT 1", [workspaceId]);
    if (existing) {
      await execute(
        "UPDATE billing_subscriptions SET status = 'TRIAL', plan_id = ?, trial_start_at = ?, trial_end_at = ?, updated_at = NOW() WHERE id = ?",
        [premiumPlan.id, now, trialEndStr, existing.id]
      );
    } else {
      await execute(
        "INSERT INTO billing_subscriptions (workspace_id, plan_id, status, trial_start_at, trial_end_at) VALUES (?, ?, 'TRIAL', ?, ?)",
        [workspaceId, premiumPlan.id, now, trialEndStr]
      );
    }
    res.json({ ok: true, trialEndsAt: trialEndStr });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Grant Subscription ───────────────────────────────────────────────────────
franchiseRouter.post("/clients/:id/subscription", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const user = await queryOne("SELECT role FROM users WHERE id = ?", [userId]);
    if (!user || (user.role !== "franchise" && user.role !== "admin")) return res.status(403).json({ error: "Franchise access required" });
    const franchise = await getMyFranchise(userId);
    if (!franchise) return res.status(404).json({ error: "No franchise found" });
    if (!await assertClientInFranchise(franchise.id, req.params.id)) return res.status(403).json({ error: "Client not in your franchise" });

    const { plan } = req.body;
    if (!["starter", "pro", "premium"].includes(plan)) return res.status(400).json({ error: "Invalid plan." });

    const billingPlan = await queryOne("SELECT id FROM billing_plans WHERE code = ?", [plan]);
    if (!billingPlan) return res.status(404).json({ error: "Billing plan not found" });

    const workspaceId = await ensureWorkspace(req.params.id);
    const existing = await queryOne("SELECT id FROM billing_subscriptions WHERE workspace_id = ? LIMIT 1", [workspaceId]);
    if (existing) {
      await execute(
        "UPDATE billing_subscriptions SET status = 'ACTIVE', plan_id = ?, cancelled_at = NULL, updated_at = NOW() WHERE id = ?",
        [billingPlan.id, existing.id]
      );
    } else {
      await execute(
        "INSERT INTO billing_subscriptions (workspace_id, plan_id, status) VALUES (?, ?, 'ACTIVE')",
        [workspaceId, billingPlan.id]
      );
    }
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Revoke Subscription ──────────────────────────────────────────────────────
franchiseRouter.delete("/clients/:id/subscription", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const user = await queryOne("SELECT role FROM users WHERE id = ?", [userId]);
    if (!user || (user.role !== "franchise" && user.role !== "admin")) return res.status(403).json({ error: "Franchise access required" });
    const franchise = await getMyFranchise(userId);
    if (!franchise) return res.status(404).json({ error: "No franchise found" });
    if (!await assertClientInFranchise(franchise.id, req.params.id)) return res.status(403).json({ error: "Client not in your franchise" });

    const workspaceId = await ensureWorkspace(req.params.id);
    await execute(
      "UPDATE billing_subscriptions SET status = 'CANCELLED', cancelled_at = NOW(), updated_at = NOW() WHERE workspace_id = ? AND status IN ('ACTIVE','TRIAL')",
      [workspaceId]
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Free Access (Exemption) ──────────────────────────────────────────────────
franchiseRouter.patch("/clients/:id/exempt", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const user = await queryOne("SELECT role FROM users WHERE id = ?", [userId]);
    if (!user || (user.role !== "franchise" && user.role !== "admin")) return res.status(403).json({ error: "Franchise access required" });
    const franchise = await getMyFranchise(userId);
    if (!franchise) return res.status(404).json({ error: "No franchise found" });
    if (!await assertClientInFranchise(franchise.id, req.params.id)) return res.status(403).json({ error: "Client not in your franchise" });

    const value = req.body.exempt ? 1 : 0;
    await execute("UPDATE users SET subscription_exempt = ?, updated_at = ? WHERE id = ?",
      [value, new Date().toISOString(), req.params.id]);
    res.json({ ok: true, exempt: !!value });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Impersonate ──────────────────────────────────────────────────────────────
franchiseRouter.post("/clients/:id/impersonate", async (req, res) => {
  try {
    const franchiseOwnerId = req.session.userId!;
    const user = await queryOne("SELECT role FROM users WHERE id = ?", [franchiseOwnerId]);
    if (!user || (user.role !== "franchise" && user.role !== "admin")) return res.status(403).json({ error: "Franchise access required" });

    const franchise = await getMyFranchise(franchiseOwnerId);
    if (!franchise) return res.status(404).json({ error: "No franchise found" });
    if (!await assertClientInFranchise(franchise.id, req.params.id)) return res.status(403).json({ error: "Client not in your franchise" });

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

// ─── Invite Client (creates account if needed) ───────────────────────────────
franchiseRouter.post("/clients/invite", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const franchiseOwner = await queryOne(
      `SELECT u.id, u.full_name, u.email, f.id as franchise_id, f.name as franchise_name
       FROM users u
       JOIN franchises f ON f.owner_user_id = u.id
       WHERE u.id = ? AND (u.role = 'franchise' OR u.role = 'admin') AND f.status = 'active'`,
      [userId]
    );
    if (!franchiseOwner) return res.status(403).json({ error: "Franchise access required" });

    const { email, fullName } = req.body;
    if (!email || typeof email !== "string") return res.status(400).json({ error: "Email is required" });
    const cleanEmail = email.toLowerCase().trim();

    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    let existing = await queryOne("SELECT id, full_name FROM users WHERE email = ?", [cleanEmail]);

    if (existing) {
      const alreadyLinked = await queryOne(
        "SELECT id FROM franchise_clients WHERE franchise_id = ? AND client_user_id = ? AND status = 'active'",
        [franchiseOwner.franchise_id, existing.id]
      );
      if (alreadyLinked) return res.status(409).json({ error: "This client is already linked to your franchise." });

      await execute(
        "INSERT INTO franchise_clients (id, franchise_id, client_user_id, status) VALUES (?, ?, ?, 'active')",
        [randomUUID(), franchiseOwner.franchise_id, existing.id]
      );
      return res.json({ ok: true, created: false, message: "Existing user linked to your franchise." });
    }

    const name = (fullName || "").trim() || cleanEmail.split("@")[0];
    const tempHash = await bcrypt.hash(randomUUID(), 10);
    const newUserId = randomUUID();

    await execute(
      `INSERT INTO users (id, email, password_hash, full_name, role, parent_owner_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'user', ?, ?, ?)`,
      [newUserId, cleanEmail, tempHash, name, userId, now, now]
    );

    const wsId = randomUUID();
    await execute(
      "INSERT INTO workspaces (id, name, owner_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
      [wsId, `${name}'s Business`, newUserId, now, now]
    );
    await execute(
      "INSERT INTO workspace_members (id, workspace_id, user_id, role, created_at) VALUES (?, ?, ?, 'owner', ?)",
      [randomUUID(), wsId, newUserId, now]
    );

    await execute(
      "INSERT INTO franchise_clients (id, franchise_id, client_user_id, status) VALUES (?, ?, ?, 'active')",
      [randomUUID(), franchiseOwner.franchise_id, newUserId]
    );

    const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ");
    const setupToken = randomUUID().replace(/-/g, "");
    await execute(
      "INSERT INTO password_reset_tokens (id, user_id, token, expires_at, used) VALUES (?, ?, ?, ?, 0)",
      [randomUUID(), newUserId, setupToken, tokenExpiry]
    );

    const baseUrl = req.headers.origin || process.env.APP_URL || "https://masakheportal.co.za";
    const emailSent = await sendFranchiseClientInviteEmail(
      cleanEmail,
      name,
      franchiseOwner.franchise_name,
      franchiseOwner.full_name || franchiseOwner.email,
      setupToken,
      baseUrl
    );

    res.json({ ok: true, created: true, emailSent, message: "Account created and invite email sent." });
  } catch (err: any) {
    console.error("[Franchise invite]", err.message);
    res.status(500).json({ error: err.message || "Failed to send invite" });
  }
});

// ─── Franchise Application ────────────────────────────────────────────────────
franchiseRouter.post("/apply", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const user = await queryOne(
      `SELECT u.full_name, u.email,
              COALESCE(bp.business_name, bp.trading_name) as business_name,
              bp.phone
       FROM users u
       LEFT JOIN business_profiles bp ON bp.user_id = u.id
       WHERE u.id = ?`,
      [userId]
    );
    if (!user) return res.status(404).json({ error: "User not found" });

    const { message, phone } = req.body;

    const sent = await sendFranchiseApplicationEmail({
      applicantName: user.full_name || user.email,
      applicantEmail: user.email,
      businessName: user.business_name || "",
      phone: phone || user.phone || "",
      message: message || "",
    });

    res.json({ ok: true, emailSent: sent });
  } catch (err: any) {
    console.error("Franchise apply error:", err.message);
    res.status(500).json({ error: "Failed to submit application" });
  }
});

// ─── Unlink Client ────────────────────────────────────────────────────────────
franchiseRouter.delete("/clients/:id", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const user = await queryOne("SELECT role FROM users WHERE id = ?", [userId]);
    if (!user || (user.role !== "franchise" && user.role !== "admin")) return res.status(403).json({ error: "Franchise access required" });
    const franchise = await getMyFranchise(userId);
    if (!franchise) return res.status(404).json({ error: "No franchise found" });
    if (!await assertClientInFranchise(franchise.id, req.params.id)) return res.status(403).json({ error: "Client not in your franchise" });

    await execute(
      "UPDATE franchise_clients SET status = 'inactive' WHERE franchise_id = ? AND client_user_id = ?",
      [franchise.id, req.params.id]
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
