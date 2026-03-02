import { Router, Request, Response } from "express";
import { pool, queryOne } from "./db";

export const tendersRouter = Router();

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  next();
}

async function requireAdmin(req: Request, res: Response, next: Function) {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  const user = await queryOne("SELECT role FROM users WHERE id = ?", [req.session.userId]);
  if (!user || user.role !== "admin") return res.status(403).json({ error: "Admin access required" });
  next();
}

function validateTenderFields(body: any) {
  const { title, budget_min, budget_max, status } = body;
  if (!title || !title.trim()) return "Title is required";
  const bMin = budget_min ? Number(budget_min) : null;
  const bMax = budget_max ? Number(budget_max) : null;
  if (bMin !== null && isNaN(bMin)) return "Invalid minimum budget";
  if (bMax !== null && isNaN(bMax)) return "Invalid maximum budget";
  if (bMin !== null && bMax !== null && bMin > bMax) return "Minimum budget cannot exceed maximum";
  const validStatuses = ["OPEN", "CLOSED", "AWARDED"];
  if (status && !validStatuses.includes(status)) return "Invalid status";
  return null;
}

function parseBudget(val: any): number | null {
  if (!val) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

tendersRouter.get("/user/applications", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT ta.*, t.title, t.category, t.status as tender_status, t.deadline
       FROM tender_applications ta
       JOIN tenders t ON t.id = ta.tender_id
       WHERE ta.user_id = ?
       ORDER BY ta.created_at DESC`,
      [req.session.userId]
    );
    res.json({ applications: rows });
  } catch (err: any) {
    console.error("Fetch user applications error:", err);
    res.status(500).json({ error: "Failed to load applications" });
  }
});

tendersRouter.get("/user/my-tenders", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT t.*, u.full_name as created_by_name,
       (SELECT COUNT(*) FROM tender_applications WHERE tender_id = t.id) as application_count
       FROM tenders t LEFT JOIN users u ON u.id = t.created_by
       WHERE t.created_by = ?
       ORDER BY t.created_at DESC`,
      [req.session.userId]
    );
    res.json({ tenders: rows });
  } catch (err: any) {
    console.error("Fetch user tenders error:", err);
    res.status(500).json({ error: "Failed to load your tenders" });
  }
});

tendersRouter.post("/user/create", requireAuth, async (req, res) => {
  try {
    const { title, description, category, budget_min, budget_max, location, deadline, requirements } = req.body;
    const err = validateTenderFields(req.body);
    if (err) return res.status(400).json({ error: err });

    const [result]: any = await pool.execute(
      `INSERT INTO tenders (title, description, category, budget_min, budget_max, location, deadline, requirements, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title.trim(), description || null, category || null, parseBudget(budget_min), parseBudget(budget_max), location || null, deadline || null, requirements || null, req.session.userId]
    );
    res.json({ ok: true, id: result.insertId });
  } catch (err: any) {
    console.error("Create tender error:", err);
    res.status(500).json({ error: "Failed to create tender" });
  }
});

tendersRouter.put("/user/:id", requireAuth, async (req, res) => {
  try {
    const tender = await queryOne("SELECT * FROM tenders WHERE id = ? AND created_by = ?", [req.params.id, req.session.userId]);
    if (!tender) return res.status(403).json({ error: "You can only edit your own tenders" });

    const { title, description, category, budget_min, budget_max, location, deadline, requirements, status } = req.body;
    const err = validateTenderFields(req.body);
    if (err) return res.status(400).json({ error: err });

    await pool.execute(
      `UPDATE tenders SET title=?, description=?, category=?, budget_min=?, budget_max=?, location=?, deadline=?, requirements=?, status=?, updated_at=NOW()
       WHERE id=? AND created_by=?`,
      [title.trim(), description || null, category || null, parseBudget(budget_min), parseBudget(budget_max), location || null, deadline || null, requirements || null, status || 'OPEN', req.params.id, req.session.userId]
    );
    res.json({ ok: true });
  } catch (err: any) {
    console.error("Update tender error:", err);
    res.status(500).json({ error: "Failed to update tender" });
  }
});

tendersRouter.delete("/user/:id", requireAuth, async (req, res) => {
  try {
    const tender = await queryOne("SELECT * FROM tenders WHERE id = ? AND created_by = ?", [req.params.id, req.session.userId]);
    if (!tender) return res.status(403).json({ error: "You can only delete your own tenders" });

    await pool.execute("DELETE FROM tender_applications WHERE tender_id = ?", [req.params.id]);
    await pool.execute("DELETE FROM tenders WHERE id = ? AND created_by = ?", [req.params.id, req.session.userId]);
    res.json({ ok: true });
  } catch (err: any) {
    console.error("Delete tender error:", err);
    res.status(500).json({ error: "Failed to delete tender" });
  }
});

tendersRouter.get("/user/:id/applications", requireAuth, async (req, res) => {
  try {
    const tender = await queryOne("SELECT * FROM tenders WHERE id = ? AND created_by = ?", [req.params.id, req.session.userId]);
    if (!tender) return res.status(403).json({ error: "You can only view applications for your own tenders" });

    const [rows] = await pool.execute(
      `SELECT ta.*, u.full_name, u.email, bp.business_name, bp.phone, bp.industry_sector
       FROM tender_applications ta
       JOIN users u ON u.id = ta.user_id
       LEFT JOIN business_profiles bp ON bp.user_id = ta.user_id
       WHERE ta.tender_id = ?
       ORDER BY ta.created_at DESC`,
      [req.params.id]
    );
    res.json({ applications: rows });
  } catch (err: any) {
    console.error("Fetch tender applications error:", err);
    res.status(500).json({ error: "Failed to load applications" });
  }
});

tendersRouter.put("/user/applications/:id/status", requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["PENDING", "SHORTLISTED", "ACCEPTED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const app = await queryOne(
      `SELECT ta.id, t.created_by FROM tender_applications ta
       JOIN tenders t ON t.id = ta.tender_id
       WHERE ta.id = ?`,
      [req.params.id]
    );
    if (!app || app.created_by !== req.session.userId) {
      return res.status(403).json({ error: "You can only manage applications on your own tenders" });
    }

    await pool.execute("UPDATE tender_applications SET status = ?, updated_at = NOW() WHERE id = ?", [status, req.params.id]);
    res.json({ ok: true });
  } catch (err: any) {
    console.error("Update application status error:", err);
    res.status(500).json({ error: "Failed to update application status" });
  }
});

tendersRouter.get("/admin/all", requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT t.*, u.full_name as created_by_name,
       (SELECT COUNT(*) FROM tender_applications WHERE tender_id = t.id) as application_count
       FROM tenders t LEFT JOIN users u ON u.id = t.created_by
       ORDER BY t.created_at DESC`
    );
    res.json({ tenders: rows });
  } catch (err: any) {
    console.error("Fetch admin tenders error:", err);
    res.status(500).json({ error: "Failed to load tenders" });
  }
});

tendersRouter.get("/admin/:id/applications", requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT ta.*, u.full_name, u.email, bp.business_name, bp.phone, bp.industry_sector
       FROM tender_applications ta
       JOIN users u ON u.id = ta.user_id
       LEFT JOIN business_profiles bp ON bp.user_id = ta.user_id
       WHERE ta.tender_id = ?
       ORDER BY ta.created_at DESC`,
      [req.params.id]
    );
    res.json({ applications: rows });
  } catch (err: any) {
    console.error("Fetch tender applications error:", err);
    res.status(500).json({ error: "Failed to load applications" });
  }
});

tendersRouter.put("/admin/applications/:id/status", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["PENDING", "SHORTLISTED", "ACCEPTED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    await pool.execute("UPDATE tender_applications SET status = ?, updated_at = NOW() WHERE id = ?", [status, req.params.id]);
    res.json({ ok: true });
  } catch (err: any) {
    console.error("Update application status error:", err);
    res.status(500).json({ error: "Failed to update application status" });
  }
});

tendersRouter.post("/admin", requireAdmin, async (req, res) => {
  try {
    const { title, description, category, budget_min, budget_max, location, deadline, requirements } = req.body;
    const err = validateTenderFields(req.body);
    if (err) return res.status(400).json({ error: err });

    const [result]: any = await pool.execute(
      `INSERT INTO tenders (title, description, category, budget_min, budget_max, location, deadline, requirements, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title.trim(), description || null, category || null, parseBudget(budget_min), parseBudget(budget_max), location || null, deadline || null, requirements || null, req.session.userId]
    );
    res.json({ ok: true, id: result.insertId });
  } catch (err: any) {
    console.error("Create tender error:", err);
    res.status(500).json({ error: "Failed to create tender" });
  }
});

tendersRouter.put("/admin/:id", requireAdmin, async (req, res) => {
  try {
    const { title, description, category, budget_min, budget_max, location, deadline, requirements, status } = req.body;
    const err = validateTenderFields(req.body);
    if (err) return res.status(400).json({ error: err });

    await pool.execute(
      `UPDATE tenders SET title=?, description=?, category=?, budget_min=?, budget_max=?, location=?, deadline=?, requirements=?, status=?, updated_at=NOW()
       WHERE id=?`,
      [title.trim(), description || null, category || null, parseBudget(budget_min), parseBudget(budget_max), location || null, deadline || null, requirements || null, status || 'OPEN', req.params.id]
    );
    res.json({ ok: true });
  } catch (err: any) {
    console.error("Update tender error:", err);
    res.status(500).json({ error: "Failed to update tender" });
  }
});

tendersRouter.delete("/admin/:id", requireAdmin, async (req, res) => {
  try {
    await pool.execute("DELETE FROM tender_applications WHERE tender_id = ?", [req.params.id]);
    await pool.execute("DELETE FROM tenders WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err: any) {
    console.error("Delete tender error:", err);
    res.status(500).json({ error: "Failed to delete tender" });
  }
});

tendersRouter.get("/", requireAuth, async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let sql = `SELECT t.*, u.full_name as created_by_name,
               (SELECT COUNT(*) FROM tender_applications WHERE tender_id = t.id) as application_count
               FROM tenders t
               LEFT JOIN users u ON u.id = t.created_by
               WHERE 1=1`;
    const params: any[] = [];

    if (category && category !== "all") {
      sql += " AND t.category = ?";
      params.push(category);
    }
    if (status && status !== "all") {
      sql += " AND t.status = ?";
      params.push(status);
    } else {
      sql += " AND t.status = 'OPEN'";
    }
    if (search) {
      sql += " AND (t.title LIKE ? OR t.description LIKE ? OR t.location LIKE ?)";
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    sql += " ORDER BY t.created_at DESC";
    const [rows] = await pool.execute(sql, params);
    res.json({ tenders: rows });
  } catch (err: any) {
    console.error("List tenders error:", err);
    res.status(500).json({ error: "Failed to load tenders" });
  }
});

tendersRouter.get("/:id", requireAuth, async (req, res) => {
  try {
    const tender = await queryOne(
      `SELECT t.*, u.full_name as created_by_name,
       (SELECT COUNT(*) FROM tender_applications WHERE tender_id = t.id) as application_count
       FROM tenders t LEFT JOIN users u ON u.id = t.created_by
       WHERE t.id = ?`,
      [req.params.id]
    );
    if (!tender) return res.status(404).json({ error: "Tender not found" });

    const hasApplied = await queryOne(
      "SELECT id FROM tender_applications WHERE tender_id = ? AND user_id = ?",
      [req.params.id, req.session.userId]
    );
    tender.has_applied = !!hasApplied;
    tender.is_owner = tender.created_by === req.session.userId;

    res.json({ tender });
  } catch (err: any) {
    console.error("Get tender error:", err);
    res.status(500).json({ error: "Failed to load tender" });
  }
});

tendersRouter.post("/:id/apply", requireAuth, async (req, res) => {
  try {
    const { cover_letter, proposed_amount } = req.body;
    const tenderId = req.params.id;
    const userId = req.session.userId;

    const tender = await queryOne("SELECT * FROM tenders WHERE id = ? AND status = 'OPEN'", [tenderId]);
    if (!tender) return res.status(400).json({ error: "Tender is not open for applications" });

    if (tender.created_by === userId) {
      return res.status(400).json({ error: "You cannot apply to your own tender" });
    }

    const existing = await queryOne(
      "SELECT id FROM tender_applications WHERE tender_id = ? AND user_id = ?",
      [tenderId, userId]
    );
    if (existing) return res.status(400).json({ error: "You have already applied to this tender" });

    const validAmount = proposed_amount ? Number(proposed_amount) : null;
    if (validAmount !== null && (isNaN(validAmount) || validAmount <= 0)) {
      return res.status(400).json({ error: "Invalid proposed amount" });
    }

    await pool.execute(
      `INSERT INTO tender_applications (tender_id, user_id, cover_letter, proposed_amount) VALUES (?, ?, ?, ?)`,
      [tenderId, userId, cover_letter || null, validAmount]
    );
    res.json({ ok: true });
  } catch (err: any) {
    console.error("Apply tender error:", err);
    res.status(500).json({ error: "Failed to submit application" });
  }
});
