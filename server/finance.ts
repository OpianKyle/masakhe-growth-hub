import { Router } from "express";
import { queryOne, queryAll, execute } from "./db";
import { requireAuth, getDataOwnerId } from "./auth";
import { randomUUID } from "crypto";
import multer from "multer";
import OpenAI from "openai";
import * as XLSX from "xlsx";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

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

financeRouter.get("/export/xlsx", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const entries = await queryAll("SELECT * FROM ledger_entries WHERE user_id = ? ORDER BY occurred_at DESC", [userId]);
    const rows = entries.map((e: any) => ({
      "Date": e.occurred_at ? String(e.occurred_at).slice(0, 10) : "",
      "Type": e.type || "",
      "Category": e.category || "",
      "Amount (R)": (e.amount_cents / 100).toFixed(2),
      "Description": e.description || "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Income & Expenses");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    const today = new Date().toISOString().split("T")[0];
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="finance-${today}.xlsx"`);
    res.send(buf);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to export" });
  }
});

financeRouter.get("/export/pdf", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const entries = await queryAll("SELECT * FROM ledger_entries WHERE user_id = ? ORDER BY occurred_at DESC", [userId]);
    const user = await queryOne(
      "SELECT u.full_name, bp.business_name FROM users u LEFT JOIN business_profiles bp ON bp.user_id = u.id WHERE u.id = ?",
      [userId]
    );
    const bizName = (user as any)?.business_name || (user as any)?.full_name || "Business";
    const today = new Date().toLocaleDateString("en-ZA");

    const totalIncome = entries.filter((e: any) => e.type === "INCOME").reduce((s: number, e: any) => s + e.amount_cents, 0);
    const totalExpense = entries.filter((e: any) => e.type === "EXPENSE").reduce((s: number, e: any) => s + e.amount_cents, 0);

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const green = rgb(0.08, 0.42, 0.25);
    const red = rgb(0.75, 0.15, 0.15);
    const black = rgb(0, 0, 0);
    const white = rgb(1, 1, 1);
    const grey = rgb(0.5, 0.5, 0.5);
    const lightGrey = rgb(0.95, 0.95, 0.95);

    const PAGE_W = 595, PAGE_H = 842, L = 30, R = PAGE_W - 30, TW = R - L;
    const cols = [
      { label: "Date", w: TW * 0.16 },
      { label: "Type", w: TW * 0.13 },
      { label: "Category", w: TW * 0.20 },
      { label: "Amount (R)", w: TW * 0.15 },
      { label: "Description", w: TW * 0.36 },
    ];
    const ROW_H = 17, HDR_H = 22;
    const ROWS_PER_PAGE = Math.floor((PAGE_H - 110 - HDR_H) / ROW_H);
    const totalPages = Math.max(1, Math.ceil(entries.length / ROWS_PER_PAGE));

    for (let pi = 0; pi < totalPages; pi++) {
      const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      let y = PAGE_H - 28;

      page.drawText(bizName, { x: L, y, size: 13, font: fontBold, color: green });
      page.drawText(`Income & Expense Export — ${today}   (Page ${pi + 1}/${totalPages})`, { x: L, y: y - 14, size: 9, font, color: grey });
      y -= 28;

      if (pi === 0) {
        page.drawText(`Total Income: R${(totalIncome / 100).toFixed(2)}`, { x: L, y, size: 9, font: fontBold, color: green });
        page.drawText(`Total Expenses: R${(totalExpense / 100).toFixed(2)}`, { x: L + 180, y, size: 9, font: fontBold, color: red });
        const net = totalIncome - totalExpense;
        page.drawText(`Net: R${(net / 100).toFixed(2)}`, { x: L + 360, y, size: 9, font: fontBold, color: net >= 0 ? green : red });
        y -= 20;
      }

      page.drawRectangle({ x: L, y: y - HDR_H, width: TW, height: HDR_H, color: green });
      let cx = L + 4;
      for (const col of cols) {
        page.drawText(col.label, { x: cx, y: y - HDR_H + 8, size: 7.5, font: fontBold, color: white });
        cx += col.w;
      }
      y -= HDR_H;

      const slice = entries.slice(pi * ROWS_PER_PAGE, (pi + 1) * ROWS_PER_PAGE);
      for (let i = 0; i < slice.length; i++) {
        const e = slice[i] as any;
        if (i % 2 === 0) page.drawRectangle({ x: L, y: y - ROW_H, width: TW, height: ROW_H, color: lightGrey });
        const isIncome = e.type === "INCOME";
        const vals = [
          e.occurred_at ? String(e.occurred_at).slice(0, 10) : "",
          e.type || "",
          e.category || "",
          (e.amount_cents / 100).toFixed(2),
          e.description || "",
        ];
        cx = L + 4;
        for (let j = 0; j < cols.length; j++) {
          let txt = String(vals[j] || "");
          while (txt.length > 1 && font.widthOfTextAtSize(txt, 7.5) > cols[j].w - 6) txt = txt.slice(0, -1);
          const col = j === 3 ? (isIncome ? green : red) : black;
          page.drawText(txt, { x: cx, y: y - ROW_H + 5, size: 7.5, font: j === 3 ? fontBold : font, color: col });
          cx += cols[j].w;
        }
        y -= ROW_H;
      }
    }

    const pdfBytes = await pdfDoc.save();
    const fileDate = new Date().toISOString().split("T")[0];
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="finance-${fileDate}.pdf"`);
    res.send(Buffer.from(pdfBytes));
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
