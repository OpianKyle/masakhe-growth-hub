import { Router } from "express";
import { queryOne, queryAll, execute } from "./db";
import { requireAdmin } from "./auth";

export const adminRouter = Router();

adminRouter.use(requireAdmin);

adminRouter.get("/stats", async (req, res) => {
  try {
    const totalUsers = (await queryOne("SELECT COUNT(*) as c FROM users"))?.c || 0;
    const totalWebsites = (await queryOne("SELECT COUNT(*) as c FROM websites"))?.c || 0;
    const publishedWebsites = (await queryOne("SELECT COUNT(*) as c FROM websites WHERE status = 'published'"))?.c || 0;
    const totalProfiles = (await queryOne("SELECT COUNT(*) as c FROM business_profiles"))?.c || 0;
    const recentUsers = (await queryOne("SELECT COUNT(*) as c FROM users WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)"))?.c || 0;
    const totalInvoices = (await queryOne("SELECT COUNT(*) as c FROM invoices"))?.c || 0;
    const totalLedgerEntries = (await queryOne("SELECT COUNT(*) as c FROM ledger_entries"))?.c || 0;

    const monthlyTotals = await queryAll(
      `SELECT LEFT(occurred_at, 7) as month, type, SUM(amount_cents) as total
       FROM ledger_entries
       GROUP BY month, type
       ORDER BY month DESC
       LIMIT 24`
    );

    const revenueByMonth: Record<string, { income: number; expense: number }> = {};
    for (const row of monthlyTotals) {
      if (!revenueByMonth[row.month]) revenueByMonth[row.month] = { income: 0, expense: 0 };
      if (row.type === "INCOME") revenueByMonth[row.month].income = row.total;
      else revenueByMonth[row.month].expense = row.total;
    }

    res.json({
      totalUsers, totalWebsites, publishedWebsites, totalProfiles, recentUsers,
      totalInvoices, totalLedgerEntries,
      revenueByMonth: Object.entries(revenueByMonth).map(([month, d]) => ({ month, ...d })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

adminRouter.get("/clients", async (req, res) => {
  try {
    const clients = await queryAll(
      `SELECT u.id, u.email, u.full_name, u.role, u.created_at,
              bp.business_name, bp.trading_name, bp.business_status, bp.business_type,
              bp.industry_sector, bp.phone, bp.physical_address,
              (SELECT COUNT(*) FROM websites WHERE owner_id = u.id) as website_count
       FROM users u
       LEFT JOIN business_profiles bp ON bp.user_id = u.id
       ORDER BY u.created_at DESC`
    );
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

adminRouter.get("/clients/:id", async (req, res) => {
  try {
    const user = await queryOne(
      `SELECT u.id, u.email, u.full_name, u.role, u.created_at, u.updated_at,
              bp.business_name, bp.trading_name, bp.business_status, bp.business_type,
              bp.industry_sector, bp.years_operating, bp.employee_count,
              bp.phone, bp.whatsapp, bp.email as bp_email, bp.physical_address
       FROM users u
       LEFT JOIN business_profiles bp ON bp.user_id = u.id
       WHERE u.id = ?`,
      [req.params.id]
    );

    if (!user) return res.status(404).json({ error: "Client not found" });

    const websites = await queryAll("SELECT * FROM websites WHERE owner_id = ?", [req.params.id]);

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
        email: user.bp_email,
        physical_address: user.physical_address,
      },
      websites: websites.map((w: any) => ({ ...w, content: JSON.parse(w.content_json) })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch client" });
  }
});

adminRouter.patch("/clients/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    await execute("UPDATE users SET role = ?, updated_at = ? WHERE id = ?",
      [role, new Date().toISOString(), req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update role" });
  }
});

adminRouter.delete("/clients/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    if (userId === req.session?.userId) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }
    await execute("DELETE FROM websites WHERE owner_id = ?", [userId]);
    await execute("DELETE FROM business_profiles WHERE user_id = ?", [userId]);
    await execute("DELETE FROM users WHERE id = ?", [userId]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete client" });
  }
});
