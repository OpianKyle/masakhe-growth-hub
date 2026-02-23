import { Router } from "express";
import { sqlite } from "./db";
import { requireAuth } from "./auth";
import { randomUUID } from "crypto";

export const financeRouter = Router();
financeRouter.use(requireAuth);

financeRouter.post("/entries", (req, res) => {
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

    sqlite.prepare(`
      INSERT INTO ledger_entries (id, user_id, type, amount_cents, category, description, occurred_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, type, Math.round(amountCents), category, description || null, occurredAt, now);

    res.json({ ok: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create entry" });
  }
});

financeRouter.get("/entries", (req, res) => {
  try {
    const userId = req.session.userId!;
    const month = req.query.month as string; // YYYY-MM

    let query = "SELECT * FROM ledger_entries WHERE user_id = ?";
    const params: any[] = [userId];

    if (month) {
      query += " AND occurred_at LIKE ?";
      params.push(`${month}%`);
    }

    query += " ORDER BY occurred_at DESC, created_at DESC";

    const entries = sqlite.prepare(query).all(...params);
    res.json(entries);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

financeRouter.delete("/entries/:id", (req, res) => {
  try {
    const userId = req.session.userId!;
    const result = sqlite.prepare("DELETE FROM ledger_entries WHERE id = ? AND user_id = ?").run(req.params.id, userId);
    if (result.changes === 0) return res.status(404).json({ error: "Entry not found" });
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete entry" });
  }
});

financeRouter.get("/summary", (req, res) => {
  try {
    const userId = req.session.userId!;
    const from = req.query.from as string; // YYYY-MM
    const to = req.query.to as string; // YYYY-MM

    let query = `
      SELECT 
        substr(occurred_at, 1, 7) as month,
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
      query += " AND occurred_at < date(?, '+1 month')";
      params.push(`${to}-01`);
    }

    query += " GROUP BY month, type ORDER BY month ASC";

    const rows = sqlite.prepare(query).all(...params) as any[];

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
