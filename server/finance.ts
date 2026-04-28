import { Router } from "express";
import { queryOne, queryAll, execute } from "./db";
import { requireAuth, getDataOwnerId } from "./auth";
import { randomUUID } from "crypto";
import multer from "multer";
import OpenAI from "openai";

const upload = multer({ storage: multer.memoryStorage() });

export const financeRouter = Router();
financeRouter.use(requireAuth);

financeRouter.get("/export", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const entries = await queryAll(
      "SELECT * FROM ledger_entries WHERE user_id = ? ORDER BY occurred_at DESC",
      [userId]
    );

    const header = "Date,Type,Category,Amount,Description";
    const rows = entries.map((e: any) => {
      const date = e.occurred_at ? e.occurred_at.split("T")[0] : "";
      const amount = (e.amount_cents / 100).toFixed(2);
      const desc = (e.description || "").replace(/"/g, '""');
      const cat = (e.category || "").replace(/"/g, '""');
      return `${date},${e.type},"${cat}",${amount},"${desc}"`;
    });

    const csv = [header, ...rows].join("\n");
    const today = new Date().toISOString().split("T")[0];

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="finance-export-${today}.csv"`);
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to export" });
  }
});

financeRouter.post("/import", upload.single("file"), async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const content = file.buffer.toString("utf-8");
    const lines = content.split(/\r?\n/).filter((l) => l.trim());

    if (lines.length < 2) return res.status(400).json({ error: "CSV must have a header and at least one data row" });

    // Determine delimiter (comma or semicolon)
    const headerLine = lines[0];
    const delimiter = headerLine.includes(";") ? ";" : ",";

    let imported = 0;
    const now = new Date().toISOString();

    for (let i = 1; i < lines.length; i++) {
      const parts = parseCSVLine(lines[i], delimiter);
      
      // Standard Format: Date,Type,Category,Amount,Description
      // User Format: Date;Description;Payments;Deposits;Balance
      
      let date, type, category, amountCents, description;

      if (delimiter === ";") {
        if (parts.length < 4) continue;
        const [rawDate, rawDesc, payments, deposits] = parts;
        date = rawDate.replace(/\//g, "-"); // Convert YYYY/MM/DD to YYYY-MM-DD
        description = rawDesc;
        
        const paymentVal = parseFloat(payments.replace(/,/g, "")) || 0;
        const depositVal = parseFloat(deposits.replace(/,/g, "")) || 0;
        
        if (depositVal !== 0) {
          type = "INCOME";
          amountCents = Math.round(depositVal * 100);
          category = "Other Income";
        } else if (paymentVal !== 0) {
          type = "EXPENSE";
          amountCents = Math.round(Math.abs(paymentVal) * 100);
          category = "Other Expense";
        } else {
          continue;
        }
      } else {
        if (parts.length < 4) continue;
        const [rawDate, rawType, rawCat, amountStr, rawDesc] = parts;
        date = rawDate;
        type = rawType.toUpperCase();
        category = rawCat;
        description = rawDesc;
        amountCents = Math.round(parseFloat(amountStr) * 100);
      }

      if (!date || !type || isNaN(amountCents)) continue;
      if (!["INCOME", "EXPENSE"].includes(type)) continue;

      const id = randomUUID();
      await execute(
        `INSERT INTO ledger_entries (id, user_id, type, amount_cents, category, description, occurred_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, userId, type, amountCents, category || "Other", description || null, date, now]
      );
      imported++;
    }

    res.json({ ok: true, imported });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to import" });
  }
});

function parseCSVLine(line: string, delimiter: string = ","): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === delimiter) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}

financeRouter.post("/entries", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
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
    const userId = getDataOwnerId(req);
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
    const userId = getDataOwnerId(req);
    const result = await execute("DELETE FROM ledger_entries WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Entry not found" });
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete entry" });
  }
});

financeRouter.post("/scan-receipt", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image provided" });
    if (!process.env.OPENROUTER_API_KEY) return res.status(500).json({ error: "AI not configured" });

    const base64 = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype || "image/jpeg";

    const client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.APP_URL || "https://masakheportal.co.za",
        "X-Title": "Masakhe",
      },
    });

    const response = await client.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [{
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${base64}` },
          } as any,
          {
            type: "text",
            text: `You are an expense extraction assistant. Look at this receipt image and extract the key information.

Return ONLY a valid JSON object (no markdown, no extra text) with these fields:
{
  "amount": <number in Rands, e.g. 150.00>,
  "date": "<YYYY-MM-DD format, today if not visible>",
  "description": "<store/vendor name and brief description of purchase>",
  "category": "<one of exactly: Rent, Utilities, Transport, Stock, Salaries, Marketing, Equipment, Other Expense>",
  "type": "EXPENSE"
}

If the amount includes VAT, use the total (VAT-inclusive) amount. If date is unclear use today's date. Pick the most appropriate category.`,
          },
        ],
      }],
      max_tokens: 300,
      temperature: 0.1,
    });

    const raw = response.choices[0]?.message?.content || "";
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    let data: any;
    try {
      data = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) data = JSON.parse(match[0]);
      else return res.status(422).json({ error: "Could not parse receipt data", raw: cleaned });
    }

    res.json({ ok: true, data });
  } catch (err: any) {
    console.error("[Finance] Receipt scan error:", err.message);
    res.status(500).json({ error: err.message || "Failed to scan receipt" });
  }
});

financeRouter.get("/summary", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
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
