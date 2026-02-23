import { Router } from "express";
import { sqlite } from "./db";
import { requireAdmin } from "./auth";

export const adminRouter = Router();

adminRouter.use(requireAdmin);

adminRouter.get("/stats", (req, res) => {
  try {
    const totalUsers = (sqlite.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'user'").get() as any).c;
    const totalWebsites = (sqlite.prepare("SELECT COUNT(*) as c FROM websites").get() as any).c;
    const publishedWebsites = (sqlite.prepare("SELECT COUNT(*) as c FROM websites WHERE status = 'published'").get() as any).c;
    const totalProfiles = (sqlite.prepare("SELECT COUNT(*) as c FROM business_profiles").get() as any).c;
    const recentUsers = (sqlite.prepare("SELECT COUNT(*) as c FROM users WHERE created_at > datetime('now', '-7 days')").get() as any).c;

    res.json({ totalUsers, totalWebsites, publishedWebsites, totalProfiles, recentUsers });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

adminRouter.get("/clients", (req, res) => {
  try {
    const clients = sqlite.prepare(`
      SELECT u.id, u.email, u.full_name, u.role, u.created_at,
             bp.business_name, bp.trading_name, bp.business_status, bp.business_type,
             bp.industry_sector, bp.phone, bp.physical_address,
             (SELECT COUNT(*) FROM websites WHERE owner_id = u.id) as website_count
      FROM users u
      LEFT JOIN business_profiles bp ON bp.user_id = u.id
      ORDER BY u.created_at DESC
    `).all();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

adminRouter.get("/clients/:id", (req, res) => {
  try {
    const user = sqlite.prepare(`
      SELECT u.*, bp.*
      FROM users u
      LEFT JOIN business_profiles bp ON bp.user_id = u.id
      WHERE u.id = ?
    `).get(req.params.id) as any;

    if (!user) return res.status(404).json({ error: "Client not found" });

    const websites = sqlite.prepare("SELECT * FROM websites WHERE owner_id = ?").all(req.params.id);

    res.json({
      user: {
        id: user.id, email: user.email, full_name: user.full_name, role: user.role, created_at: user.created_at
      },
      profile: {
        business_name: user.business_name,
        trading_name: user.trading_name,
        business_status: user.business_status,
        business_type: user.business_type,
        industry_sector: user.industry_sector,
        years_operating: user.years_operating,
        employee_count: user.employee_count,
        phone: user.phone,
        whatsapp: user.whatsapp,
        email: user.email,
        physical_address: user.physical_address,
      },
      websites: websites.map((w: any) => ({ ...w, content: JSON.parse(w.content_json) })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch client" });
  }
});

adminRouter.patch("/clients/:id/role", (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    sqlite.prepare("UPDATE users SET role = ?, updated_at = ? WHERE id = ?")
      .run(role, new Date().toISOString(), req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update role" });
  }
});

adminRouter.delete("/clients/:id", (req, res) => {
  try {
    const userId = req.params.id;
    if (userId === req.session?.userId) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }
    sqlite.prepare("DELETE FROM websites WHERE owner_id = ?").run(userId);
    sqlite.prepare("DELETE FROM business_profiles WHERE user_id = ?").run(userId);
    sqlite.prepare("DELETE FROM users WHERE id = ?").run(userId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete client" });
  }
});
