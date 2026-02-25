import { Router } from "express";
import { queryOne, queryAll } from "./db";
import { requireAuth } from "./auth";

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

dashboardRouter.get("/overview", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const prevMonth = now.getMonth() === 0
      ? `${now.getFullYear() - 1}-12`
      : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, "0")}`;

    const incomeThisMonth = (await queryOne(
      "SELECT COALESCE(SUM(amount_cents), 0) as total FROM ledger_entries WHERE user_id = ? AND type = 'INCOME' AND occurred_at LIKE ?",
      [userId, `${currentMonth}%`]
    ))?.total || 0;

    const expenseThisMonth = (await queryOne(
      "SELECT COALESCE(SUM(amount_cents), 0) as total FROM ledger_entries WHERE user_id = ? AND type = 'EXPENSE' AND occurred_at LIKE ?",
      [userId, `${currentMonth}%`]
    ))?.total || 0;

    const incomeLastMonth = (await queryOne(
      "SELECT COALESCE(SUM(amount_cents), 0) as total FROM ledger_entries WHERE user_id = ? AND type = 'INCOME' AND occurred_at LIKE ?",
      [userId, `${prevMonth}%`]
    ))?.total || 0;

    const expenseLastMonth = (await queryOne(
      "SELECT COALESCE(SUM(amount_cents), 0) as total FROM ledger_entries WHERE user_id = ? AND type = 'EXPENSE' AND occurred_at LIKE ?",
      [userId, `${prevMonth}%`]
    ))?.total || 0;

    const totalInvoices = (await queryOne("SELECT COUNT(*) as c FROM invoices WHERE user_id = ?", [userId]))?.c || 0;
    const pendingInvoices = await queryAll(
      "SELECT invoice_number, customer_name, total_cents, created_at FROM invoices WHERE user_id = ? AND status = 'final' ORDER BY created_at DESC LIMIT 5",
      [userId]
    );
    const totalInvoiceValue = (await queryOne(
      "SELECT COALESCE(SUM(total_cents), 0) as total FROM invoices WHERE user_id = ?",
      [userId]
    ))?.total || 0;

    const websiteCount = (await queryOne("SELECT COUNT(*) as c FROM websites WHERE owner_id = ?", [userId]))?.c || 0;
    const publishedWebsite = await queryOne("SELECT slug, status FROM websites WHERE owner_id = ? AND status = 'published' LIMIT 1", [userId]);

    const ledgerCount = (await queryOne("SELECT COUNT(*) as c FROM ledger_entries WHERE user_id = ?", [userId]))?.c || 0;

    const monthlySummary = await queryAll(
      `SELECT LEFT(occurred_at, 7) as month, type, SUM(amount_cents) as total
       FROM ledger_entries WHERE user_id = ?
       GROUP BY month, type
       ORDER BY month ASC`,
      [userId]
    );

    const monthlyData: Record<string, { month: string; income: number; expense: number }> = {};
    for (const row of monthlySummary) {
      if (!monthlyData[row.month]) monthlyData[row.month] = { month: row.month, income: 0, expense: 0 };
      if (row.type === "INCOME") monthlyData[row.month].income = row.total / 100;
      else monthlyData[row.month].expense = row.total / 100;
    }
    const revenueChart = Object.values(monthlyData).slice(-12);

    const expensesByCategory = await queryAll(
      `SELECT category, SUM(amount_cents) as total
       FROM ledger_entries WHERE user_id = ? AND type = 'EXPENSE'
       GROUP BY category ORDER BY total DESC LIMIT 8`,
      [userId]
    );

    const incomeByCategory = await queryAll(
      `SELECT category, SUM(amount_cents) as total
       FROM ledger_entries WHERE user_id = ? AND type = 'INCOME'
       GROUP BY category ORDER BY total DESC LIMIT 8`,
      [userId]
    );

    let socialStats = { totalPosts: 0, publishedPosts: 0, scheduledPosts: 0, connectedAccounts: 0 };
    let socialPostsByDay: any[] = [];
    try {
      const wsMember = await queryOne("SELECT workspace_id FROM workspace_members WHERE user_id = ? LIMIT 1", [userId]);
      if (wsMember) {
        const wsId = wsMember.workspace_id;
        socialStats.totalPosts = (await queryOne("SELECT COUNT(*) as c FROM social_posts WHERE workspace_id = ?", [wsId]))?.c || 0;
        socialStats.publishedPosts = (await queryOne("SELECT COUNT(*) as c FROM social_posts WHERE workspace_id = ? AND status = 'PUBLISHED'", [wsId]))?.c || 0;
        socialStats.scheduledPosts = (await queryOne("SELECT COUNT(*) as c FROM social_posts WHERE workspace_id = ? AND status = 'SCHEDULED'", [wsId]))?.c || 0;
        socialStats.connectedAccounts = (await queryOne("SELECT COUNT(*) as c FROM social_accounts WHERE workspace_id = ?", [wsId]))?.c || 0;

        socialPostsByDay = await queryAll(
          `SELECT LEFT(COALESCE(updated_at, created_at), 10) as day, COUNT(*) as count
           FROM social_posts WHERE workspace_id = ? AND status = 'PUBLISHED'
           GROUP BY day ORDER BY day DESC LIMIT 14`,
          [wsId]
        );
        socialPostsByDay.reverse();
      }
    } catch {}

    const recentLedger = await queryAll(
      "SELECT type, amount_cents, category, description, occurred_at FROM ledger_entries WHERE user_id = ? ORDER BY created_at DESC LIMIT 8",
      [userId]
    );

    const recentInvoices = await queryAll(
      "SELECT invoice_number, customer_name, total_cents, status, created_at FROM invoices WHERE user_id = ? ORDER BY created_at DESC LIMIT 5",
      [userId]
    );

    const revenueChange = incomeLastMonth > 0
      ? Math.round(((incomeThisMonth - incomeLastMonth) / incomeLastMonth) * 100)
      : incomeThisMonth > 0 ? 100 : 0;

    const expenseChange = expenseLastMonth > 0
      ? Math.round(((expenseThisMonth - expenseLastMonth) / expenseLastMonth) * 100)
      : expenseThisMonth > 0 ? 100 : 0;

    res.json({
      kpis: {
        revenueThisMonth: incomeThisMonth / 100,
        expenseThisMonth: expenseThisMonth / 100,
        netThisMonth: (incomeThisMonth - expenseThisMonth) / 100,
        revenueChange,
        expenseChange,
        totalInvoices,
        totalInvoiceValue: totalInvoiceValue / 100,
        pendingInvoiceCount: pendingInvoices.length,
        websiteCount,
        websitePublished: !!publishedWebsite,
        ledgerCount,
        socialPosts: socialStats.totalPosts,
        socialConnected: socialStats.connectedAccounts,
      },
      revenueChart,
      expensesByCategory: expensesByCategory.map((r: any) => ({ name: r.category, value: r.total / 100 })),
      incomeByCategory: incomeByCategory.map((r: any) => ({ name: r.category, value: r.total / 100 })),
      socialPostsByDay: socialPostsByDay.map((r: any) => ({ day: r.day.slice(5), count: r.count })),
      recentActivity: [
        ...recentLedger.map((e: any) => ({
          type: e.type === "INCOME" ? "payment" : "expense",
          text: e.description || `${e.type === "INCOME" ? "Income" : "Expense"}: ${e.category}`,
          amount: `R${(e.amount_cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`,
          time: e.occurred_at,
          category: e.category,
        })),
        ...recentInvoices.map((inv: any) => ({
          type: "invoice",
          text: `Invoice ${inv.invoice_number} - ${inv.customer_name}`,
          amount: `R${(inv.total_cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`,
          time: inv.created_at,
          category: "invoice",
        })),
      ].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 10),
    });
  } catch (err: any) {
    console.error("Dashboard overview error:", err);
    res.status(500).json({ error: "Failed to fetch overview data" });
  }
});
