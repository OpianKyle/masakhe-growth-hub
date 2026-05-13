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

// ─── Balance ────────────────────────────────────────────────────────────────

financeRouter.get("/balance", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const row = await queryOne("SELECT opening_balance_cents FROM finance_balance WHERE user_id = ?", [userId]);
    res.json({ opening_balance_cents: row?.opening_balance_cents ?? 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

financeRouter.post("/balance", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const { opening_balance_cents } = req.body;
    await execute(
      `INSERT INTO finance_balance (user_id, opening_balance_cents) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE opening_balance_cents = VALUES(opening_balance_cents)`,
      [userId, Math.round(opening_balance_cents)]
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Shared: fetch entries for export (optional month filter) ────────────────

async function getExportEntries(userId: string, month?: string): Promise<any[]> {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    return queryAll(
      "SELECT * FROM ledger_entries WHERE user_id = ? AND DATE_FORMAT(occurred_at, '%Y-%m') = ? ORDER BY occurred_at ASC, created_at ASC",
      [userId, month]
    );
  }
  return queryAll(
    "SELECT * FROM ledger_entries WHERE user_id = ? ORDER BY occurred_at ASC, created_at ASC",
    [userId]
  );
}

// Opening balance before the start of the given month (running balance up to that point)
async function getOpeningCentsForMonth(userId: string, month?: string): Promise<number> {
  const balRow = await queryOne("SELECT opening_balance_cents FROM finance_balance WHERE user_id = ?", [userId]);
  const globalOpening: number = balRow?.opening_balance_cents ?? 0;
  if (!month || !/^\d{4}-\d{2}$/.test(month)) return globalOpening;
  // Sum all entries before this month
  const prior = await queryAll(
    "SELECT type, amount_cents FROM ledger_entries WHERE user_id = ? AND DATE_FORMAT(occurred_at, '%Y-%m') < ? ORDER BY occurred_at ASC, created_at ASC",
    [userId, month]
  );
  let running = globalOpening;
  for (const e of prior as any[]) {
    running = e.type === "INCOME" ? running + e.amount_cents : running - e.amount_cents;
  }
  return running;
}

// ─── Export CSV (bank statement format) ──────────────────────────────────────

financeRouter.get("/export", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const month = (req.query.month as string) || "";
    const entries = await getExportEntries(userId, month);
    const openingCents = await getOpeningCentsForMonth(userId, month);

    const header = "Date,Type,Category,Description,Payments,Deposits,Balance";
    let runningCents = openingCents;
    const rows = entries.map((e: any) => {
      const date = e.occurred_at ? e.occurred_at.split("T")[0] : "";
      const amount = e.amount_cents / 100;
      const isIncome = e.type === "INCOME";
      runningCents = isIncome ? runningCents + e.amount_cents : runningCents - e.amount_cents;
      const payments = isIncome ? "" : amount.toFixed(2);
      const deposits = isIncome ? amount.toFixed(2) : "";
      const balance = (runningCents / 100).toFixed(2);
      const desc = (e.description || "").replace(/"/g, '""');
      const cat = (e.category || "").replace(/"/g, '""');
      return `${date},${e.type},"${cat}","${desc}",${payments},${deposits},${balance}`;
    });

    const periodLabel = month || "all";
    const csv = [`Opening Balance,${(openingCents / 100).toFixed(2)}`, header, ...rows, `Closing Balance,${(runningCents / 100).toFixed(2)}`].join("\n");
    const today = new Date().toISOString().split("T")[0];
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="statement-${periodLabel}-${today}.csv"`);
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to export" });
  }
});

// ─── Export Plain CSV (reimportable: Date,Type,Category,Amount,Description) ──

financeRouter.get("/export/plain-csv", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const month = (req.query.month as string) || "";
    const entries = await getExportEntries(userId, month);

    const header = "Date,Type,Category,Amount,Description";
    const rows = entries.map((e: any) => {
      const date = e.occurred_at ? e.occurred_at.split("T")[0] : "";
      const amount = (e.amount_cents / 100).toFixed(2);
      const desc = (e.description || "").replace(/"/g, '""');
      const cat = (e.category || "").replace(/"/g, '""');
      return `${date},${e.type},"${cat}",${amount},"${desc}"`;
    });

    const periodLabel = month || "all";
    const csv = [header, ...rows].join("\n");
    const today = new Date().toISOString().split("T")[0];
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="finance-plain-${periodLabel}-${today}.csv"`);
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to export" });
  }
});

// ─── Download Import Template (CSV) ─────────────────────────────────────────

financeRouter.get("/export/template-csv", async (_req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const lines = [
      "Date,Type,Category,Amount,Description",
      `# Instructions: Fill in your data below. Delete these comment lines before importing.`,
      `# Date format: YYYY-MM-DD  |  Type: INCOME or EXPENSE  |  Amount: numbers only (no R or commas)`,
      `# Valid INCOME categories: Sales, Consulting, Rental Income, Investment, Grant, Other Income`,
      `# Valid EXPENSE categories: Rent, Utilities, Salaries, Marketing, Travel, Supplies, Tax, Insurance, Other Expense`,
      `${today},INCOME,Sales,1500.00,Invoice payment from client`,
      `${today},EXPENSE,Rent,5000.00,Monthly office rent`,
      `${today},EXPENSE,Utilities,350.00,Electricity bill`,
    ];
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="finance-import-template.csv"`);
    res.send(lines.join("\n"));
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to generate template" });
  }
});

// ─── Download Import Template (XLSX) ────────────────────────────────────────

financeRouter.get("/export/template-xlsx", async (_req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const aoa: any[][] = [
      ["Date", "Type", "Category", "Amount", "Description"],
      [today, "INCOME", "Sales", 1500.00, "Invoice payment from client"],
      [today, "EXPENSE", "Rent", 5000.00, "Monthly office rent"],
      [today, "EXPENSE", "Utilities", 350.00, "Electricity bill"],
      [],
      ["--- INSTRUCTIONS ---", "", "", "", ""],
      ["Date format", "YYYY-MM-DD (e.g. 2026-05-01)", "", "", ""],
      ["Type", "Must be exactly: INCOME or EXPENSE", "", "", ""],
      ["Category (Income)", "Sales | Consulting | Rental Income | Investment | Grant | Other Income", "", "", ""],
      ["Category (Expense)", "Rent | Utilities | Salaries | Marketing | Travel | Supplies | Tax | Insurance | Other Expense", "", "", ""],
      ["Amount", "Numbers only — no R symbol, no commas (e.g. 1500.00)", "", "", ""],
      ["Description", "Optional free text", "", "", ""],
      [],
      ["Delete the instruction rows above before importing.", "", "", "", ""],
    ];

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [{ wch: 14 }, { wch: 12 }, { wch: 22 }, { wch: 12 }, { wch: 40 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="finance-import-template.xlsx"`);
    res.send(buf);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to generate template" });
  }
});

// ─── Export Plain XLSX (reimportable: Date,Type,Category,Amount,Description) ─

financeRouter.get("/export/plain-xlsx", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const month = (req.query.month as string) || "";
    const entries = await getExportEntries(userId, month);

    const aoa: any[][] = [];
    aoa.push(["Date", "Type", "Category", "Amount", "Description"]);
    for (const e of entries as any[]) {
      aoa.push([
        e.occurred_at ? String(e.occurred_at).slice(0, 10) : "",
        e.type,
        e.category || "",
        (e.amount_cents / 100).toFixed(2),
        e.description || "",
      ]);
    }

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [{ wch: 14 }, { wch: 10 }, { wch: 22 }, { wch: 14 }, { wch: 40 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Finance");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    const periodLabel = month || "all";
    const fileDate = new Date().toISOString().split("T")[0];
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="finance-plain-${periodLabel}-${fileDate}.xlsx"`);
    res.send(buf);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to export" });
  }
});

// ─── Export XLSX (bank-statement format) ────────────────────────────────────

financeRouter.get("/export/xlsx", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const month = (req.query.month as string) || "";
    const entries = await getExportEntries(userId, month);
    const openingCents = await getOpeningCentsForMonth(userId, month);
    const user = await queryOne(
      "SELECT u.full_name, bp.business_name FROM users u LEFT JOIN business_profiles bp ON bp.user_id = u.id WHERE u.id = ?",
      [userId]
    );
    const bizName = (user as any)?.business_name || (user as any)?.full_name || "Business";
    const today = new Date().toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "2-digit" });
    const periodLabel = month || "all";

    const aoa: any[][] = [];

    aoa.push([bizName, `Statement Export — ${month ? month : "All Months"} — ${today}`, "", "", "", ""]);
    aoa.push([]);
    aoa.push(["Date", "Description", "Category", "Payments", "Deposits", "Balance"]);
    aoa.push(["", "OPENING BALANCE", "", "", "", (openingCents / 100).toFixed(2)]);

    let runningCents = openingCents;
    for (const e of entries as any[]) {
      const date = e.occurred_at ? String(e.occurred_at).slice(0, 10) : "";
      const isIncome = e.type === "INCOME";
      const amount = e.amount_cents / 100;
      runningCents = isIncome ? runningCents + e.amount_cents : runningCents - e.amount_cents;

      aoa.push([
        date,
        e.description || e.category || "",
        e.category || "",
        isIncome ? "" : amount.toFixed(2),
        isIncome ? amount.toFixed(2) : "",
        (runningCents / 100).toFixed(2),
      ]);
      aoa.push(["", isIncome ? "DEPOSIT / INCOME" : "PAYMENT / EXPENSE", "", "", "", ""]);
    }

    aoa.push([]);
    aoa.push(["", "CLOSING BALANCE", "", "", "", (runningCents / 100).toFixed(2)]);

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [
      { wch: 14 }, { wch: 40 }, { wch: 20 }, { wch: 16 }, { wch: 16 }, { wch: 16 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Statement");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    const fileDate = new Date().toISOString().split("T")[0];
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="statement-${periodLabel}-${fileDate}.xlsx"`);
    res.send(buf);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to export" });
  }
});

// ─── Export PDF ──────────────────────────────────────────────────────────────

financeRouter.get("/export/pdf", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const month = (req.query.month as string) || "";
    const entries = await getExportEntries(userId, month);
    const openingCents = await getOpeningCentsForMonth(userId, month);
    const user = await queryOne(
      "SELECT u.full_name, bp.business_name FROM users u LEFT JOIN business_profiles bp ON bp.user_id = u.id WHERE u.id = ?",
      [userId]
    );
    const bizName = (user as any)?.business_name || (user as any)?.full_name || "Business";
    const today = new Date().toLocaleDateString("en-ZA");
    const periodLabel = month || "all";

    const totalIncome = entries.filter((e: any) => e.type === "INCOME").reduce((s: number, e: any) => s + e.amount_cents, 0);
    const totalExpense = entries.filter((e: any) => e.type === "EXPENSE").reduce((s: number, e: any) => s + e.amount_cents, 0);
    const closingBalance = openingCents + totalIncome - totalExpense;

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const green = rgb(0.08, 0.42, 0.25);
    const red = rgb(0.75, 0.15, 0.15);
    const black = rgb(0, 0, 0);
    const white = rgb(1, 1, 1);
    const grey = rgb(0.5, 0.5, 0.5);
    const lightGrey = rgb(0.95, 0.95, 0.95);
    const blue = rgb(0.12, 0.36, 0.7);

    const PAGE_W = 595, PAGE_H = 842, L = 30, R = PAGE_W - 30, TW = R - L;
    const cols = [
      { label: "Date", w: TW * 0.13 },
      { label: "Description", w: TW * 0.28 },
      { label: "Category", w: TW * 0.18 },
      { label: "Payments", w: TW * 0.13 },
      { label: "Deposits", w: TW * 0.13 },
      { label: "Balance", w: TW * 0.15 },
    ];
    const ROW_H = 17, HDR_H = 22;
    const ROWS_PER_PAGE = Math.floor((PAGE_H - 130 - HDR_H) / ROW_H);
    const totalPages = Math.max(1, Math.ceil(entries.length / ROWS_PER_PAGE));

    let runningCents = openingCents;

    for (let pi = 0; pi < totalPages; pi++) {
      const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      let y = PAGE_H - 28;

      page.drawText(bizName, { x: L, y, size: 13, font: fontBold, color: green });
      page.drawText(`Statement Export — ${today}   (Page ${pi + 1}/${totalPages})`, { x: L, y: y - 14, size: 9, font, color: grey });
      y -= 32;

      if (pi === 0) {
        page.drawText(`Opening Balance: R${(openingCents / 100).toFixed(2)}`, { x: L, y, size: 9, font: fontBold, color: blue });
        page.drawText(`Total Income: R${(totalIncome / 100).toFixed(2)}`, { x: L + 160, y, size: 9, font: fontBold, color: green });
        page.drawText(`Total Expenses: R${(totalExpense / 100).toFixed(2)}`, { x: L + 310, y, size: 9, font: fontBold, color: red });
        page.drawText(`Closing Balance: R${(closingBalance / 100).toFixed(2)}`, { x: L + 450, y, size: 9, font: fontBold, color: closingBalance >= 0 ? green : red });
        y -= 20;
      }

      page.drawRectangle({ x: L, y: y - HDR_H, width: TW, height: HDR_H, color: green });
      let cx = L + 4;
      for (const col of cols) {
        page.drawText(col.label, { x: cx, y: y - HDR_H + 8, size: 7.5, font: fontBold, color: white });
        cx += col.w;
      }
      y -= HDR_H;

      if (pi === 0) {
        page.drawRectangle({ x: L, y: y - ROW_H, width: TW, height: ROW_H, color: lightGrey });
        cx = L + 4;
        const obVals = ["", "OPENING BALANCE", "", "", "", (openingCents / 100).toFixed(2)];
        for (let j = 0; j < cols.length; j++) {
          page.drawText(obVals[j], { x: cx, y: y - ROW_H + 5, size: 7.5, font: fontBold, color: blue });
          cx += cols[j].w;
        }
        y -= ROW_H;
      }

      const slice = entries.slice(pi * ROWS_PER_PAGE, (pi + 1) * ROWS_PER_PAGE);
      for (let i = 0; i < slice.length; i++) {
        const e = slice[i] as any;
        const isIncome = e.type === "INCOME";
        runningCents = isIncome ? runningCents + e.amount_cents : runningCents - e.amount_cents;
        const amount = (e.amount_cents / 100).toFixed(2);

        if (i % 2 === 0) page.drawRectangle({ x: L, y: y - ROW_H, width: TW, height: ROW_H, color: lightGrey });
        const vals = [
          e.occurred_at ? String(e.occurred_at).slice(0, 10) : "",
          e.description || e.category || "",
          e.category || "",
          isIncome ? "" : amount,
          isIncome ? amount : "",
          (runningCents / 100).toFixed(2),
        ];
        cx = L + 4;
        for (let j = 0; j < cols.length; j++) {
          let txt = String(vals[j] || "");
          while (txt.length > 1 && font.widthOfTextAtSize(txt, 7.5) > cols[j].w - 6) txt = txt.slice(0, -1);
          const col = j === 3 ? red : j === 4 ? green : j === 5 ? (runningCents >= 0 ? green : red) : black;
          page.drawText(txt, { x: cx, y: y - ROW_H + 5, size: 7.5, font: [3, 4, 5].includes(j) ? fontBold : font, color: col });
          cx += cols[j].w;
        }
        y -= ROW_H;
      }
    }

    const pdfBytes = await pdfDoc.save();
    const fileDate = new Date().toISOString().split("T")[0];
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="statement-${periodLabel}-${fileDate}.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to export" });
  }
});

// ─── Import (CSV or XLSX) ────────────────────────────────────────────────────

financeRouter.post("/import", upload.single("file"), async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const ext = (file.originalname || "").toLowerCase().split(".").pop();
    const now = new Date().toISOString();
    let imported = 0;
    let openingBalanceCents: number | null = null;

    if (ext === "xlsx" || ext === "xls" || file.mimetype?.includes("spreadsheetml")) {
      // Parse XLSX bank statement format
      const wb = XLSX.read(file.buffer, { type: "buffer" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

      for (let i = 0; i < raw.length; i++) {
        const row = raw[i];
        const col0 = String(row[0] || "").trim();
        const col1 = String(row[1] || "").trim();
        const col3 = String(row[3] || "").trim(); // payments (negative/expense)
        const col4 = String(row[4] || "").trim(); // deposits (positive/income)
        const col5 = String(row[5] || "").trim(); // balance

        // Opening balance row
        if (!col0 && (col1.toUpperCase().includes("OPENING BALANCE") || col1.toUpperCase().includes("STATEMENT OPENING"))) {
          const balStr = col5 || col4 || col3;
          const bal = parseFloat(balStr.replace(/,/g, "").replace(/[^0-9.-]/g, ""));
          if (!isNaN(bal)) {
            openingBalanceCents = Math.round(bal * 100);
          }
          continue;
        }

        // Skip rows without a date in col0
        if (!col0 || col0.toLowerCase() === "date" || col0.toLowerCase().startsWith("column")) continue;

        // Parse date — support "14 Nov 25", "2025-11-14", "14/11/2025", "14/11/25"
        let date = "";
        const monthNames: Record<string, string> = {
          jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
          jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
        };
        const ddMmmYy = col0.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{2,4})$/);
        if (ddMmmYy) {
          const mm = monthNames[ddMmmYy[2].toLowerCase()] || "01";
          const yy = ddMmmYy[3].length === 2 ? `20${ddMmmYy[3]}` : ddMmmYy[3];
          date = `${yy}-${mm}-${ddMmmYy[1].padStart(2, "0")}`;
        } else if (/^\d{4}-\d{2}-\d{2}/.test(col0)) {
          date = col0.slice(0, 10);
        } else if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(col0)) {
          const parts = col0.split(/[\/\-]/);
          const yy = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
          date = `${yy}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
        } else {
          continue;
        }

        const description = col1;
        const paymentStr = col3.replace(/,/g, "").replace(/[^0-9.-]/g, "");
        const depositStr = col4.replace(/,/g, "").replace(/[^0-9.-]/g, "");
        const payment = parseFloat(paymentStr) || 0;
        const deposit = parseFloat(depositStr) || 0;

        if (deposit > 0) {
          const id = randomUUID();
          await execute(
            `INSERT INTO ledger_entries (id, user_id, type, amount_cents, category, description, occurred_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, userId, "INCOME", Math.round(Math.abs(deposit) * 100), "Other Income", description || null, date, now]
          );
          imported++;
        } else if (Math.abs(payment) > 0) {
          const id = randomUUID();
          await execute(
            `INSERT INTO ledger_entries (id, user_id, type, amount_cents, category, description, occurred_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, userId, "EXPENSE", Math.round(Math.abs(payment) * 100), "Other Expense", description || null, date, now]
          );
          imported++;
        }
      }

      if (openingBalanceCents !== null) {
        await execute(
          `INSERT INTO finance_balance (user_id, opening_balance_cents) VALUES (?, ?)
           ON DUPLICATE KEY UPDATE opening_balance_cents = VALUES(opening_balance_cents)`,
          [userId, openingBalanceCents]
        );
      }
    } else {
      // CSV import
      const content = file.buffer.toString("utf-8");
      const lines = content.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) return res.status(400).json({ error: "CSV must have a header and at least one data row" });

      const headerLine = lines[0];
      const delimiter = headerLine.includes(";") ? ";" : ",";

      for (let i = 1; i < lines.length; i++) {
        const parts = parseCSVLine(lines[i], delimiter);
        let date, type, category, amountCents, description;

        if (delimiter === ";") {
          if (parts.length < 4) continue;
          const [rawDate, rawDesc, payments, deposits] = parts;
          date = rawDate.replace(/\//g, "-");
          description = rawDesc;
          const paymentVal = parseFloat(payments.replace(/,/g, "")) || 0;
          const depositVal = parseFloat(deposits.replace(/,/g, "")) || 0;
          if (depositVal !== 0) {
            type = "INCOME"; amountCents = Math.round(depositVal * 100); category = "Other Income";
          } else if (paymentVal !== 0) {
            type = "EXPENSE"; amountCents = Math.round(Math.abs(paymentVal) * 100); category = "Other Expense";
          } else { continue; }
        } else {
          if (parts.length < 4) continue;
          const [rawDate, rawType, rawCat, amountStr, rawDesc] = parts;
          date = rawDate; type = rawType.toUpperCase(); category = rawCat;
          description = rawDesc; amountCents = Math.round(parseFloat(amountStr) * 100);
        }

        if (!date || !type || isNaN(amountCents)) continue;
        if (!["INCOME", "EXPENSE"].includes(type)) continue;

        const id = randomUUID();
        await execute(
          `INSERT INTO ledger_entries (id, user_id, type, amount_cents, category, description, occurred_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, userId, type, amountCents, category || "Other", description || null, date, now]
        );
        imported++;
      }
    }

    res.json({ ok: true, imported, openingBalanceImported: openingBalanceCents !== null });
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
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { current += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === delimiter) { result.push(current.trim()); current = ""; }
      else { current += ch; }
    }
  }
  result.push(current.trim());
  return result;
}

// ─── Entries ─────────────────────────────────────────────────────────────────

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
      `INSERT INTO ledger_entries (id, user_id, type, amount_cents, category, description, occurred_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
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

    query += " ORDER BY occurred_at ASC, created_at ASC";

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

// ─── Scan Receipt ────────────────────────────────────────────────────────────

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
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } } as any,
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

// ─── Summary ─────────────────────────────────────────────────────────────────

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

    if (from) { query += " AND occurred_at >= ?"; params.push(`${from}-01`); }
    if (to) { query += " AND occurred_at < DATE_ADD(?, INTERVAL 1 MONTH)"; params.push(`${to}-01`); }

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
