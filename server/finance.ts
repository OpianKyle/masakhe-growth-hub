import { Router } from "express";
import { queryOne, queryAll, execute } from "./db";
import { requireAuth } from "./auth";
import { randomUUID } from "crypto";

export const financeRouter = Router();
financeRouter.use(requireAuth);

financeRouter.post("/entries", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { type, amountCents, category, description, occurredAt } = req.body;

    if (!type || !amountCents || !category || !occurredAt) {
      return res.status(400).json({ error: "type, amountCents, category, and occurredAt are required" });
    }
    if (!["INCOME", "EXPENSE"].includes(type)) {
      return res.status(400).json({ error: "type must be INCOME or EXPENSE" });
    }

    const id = randomUUID();
    const now = new Date().toISOString();

    await execute(
      `INSERT INTO ledger_entries (id, user_id, type, amount_cents, category, description, occurred_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, type, Math.round(amountCents), category, description || null, occurredAt, now]
    );

    res.json({ ok: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create entry" });
  }
});

financeRouter.get("/entries", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const month = req.query.month as string;

    let query = "SELECT * FROM ledger_entries WHERE user_id = ?";
    const params: any[] = [userId];

    if (month) {
      query += " AND occurred_at LIKE ?";
      params.push(`${month}%`);
    }

    query += " ORDER BY occurred_at DESC, created_at DESC";

    const entries = await queryAll(query, params);
    res.json(entries);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

financeRouter.delete("/entries/:id", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const result = await execute("DELETE FROM ledger_entries WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Entry not found" });
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete entry" });
  }
});

financeRouter.get("/summary", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const from = req.query.from as string;
    const to = req.query.to as string;

    let query = `
      SELECT 
        LEFT(occurred_at, 7) as month,
        type,
        SUM(amount_cents) as total
      FROM ledger_entries
      WHERE user_id = ?
    `;
    const params: any[] = [userId];

    if (from) {
      query += " AND occurred_at >= ?";
      params.push(`${from}-01`);
    }
    if (to) {
      query += " AND occurred_at < DATE_ADD(?, INTERVAL 1 MONTH)";
      params.push(`${to}-01`);
    }

    query += " GROUP BY month, type ORDER BY month ASC";

    const rows = await queryAll(query, params);

    const monthMap: Record<string, { income: number; expense: number }> = {};
    for (const row of rows) {
      if (!monthMap[row.month]) monthMap[row.month] = { income: 0, expense: 0 };
      if (row.type === "INCOME") monthMap[row.month].income = row.total;
      else monthMap[row.month].expense = row.total;
    }

    const summary = Object.entries(monthMap).map(([month, data]) => ({
      month,
      income: data.income,
      expense: data.expense,
      net: data.income - data.expense,
    }));

    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});
