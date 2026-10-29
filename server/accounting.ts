import { Router } from "express";
import { createHash, randomUUID } from "crypto";
import multer from "multer";
import * as XLSX from "xlsx";
import OpenAI from "openai";
import { pool, queryAll, queryOne, execute } from "./db";
import { getDataOwnerId, isTeamMember, requireAuth } from "./auth";

export const accountingRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
accountingRouter.use(requireAuth);

const DEFAULT_ACCOUNTS = [
  ["1000", "Bank and cash", "asset", "cash"],
  ["1100", "Accounts receivable", "asset", "receivable"],
  ["1200", "Inventory", "asset", "inventory"],
  ["1300", "VAT input", "asset", "tax"],
  ["2000", "Accounts payable", "liability", "payable"],
  ["2100", "VAT output", "liability", "tax"],
  ["3000", "Owner's equity", "equity", "equity"],
  ["3100", "Retained earnings", "equity", "equity"],
  ["4000", "Sales revenue", "income", "revenue"],
  ["4100", "Service revenue", "income", "revenue"],
  ["4200", "Sales returns and discounts", "income", "contra_revenue"],
  ["4900", "Other income", "income", "revenue"],
  ["5000", "Cost of goods sold", "expense", "cost_of_sales"],
  ["6100", "Rent", "expense", "operating"],
  ["6200", "Utilities", "expense", "operating"],
  ["6300", "Transport", "expense", "operating"],
  ["6400", "Salaries", "expense", "operating"],
  ["6500", "Marketing", "expense", "operating"],
  ["6600", "Supplies", "expense", "operating"],
  ["6700", "Equipment", "expense", "operating"],
  ["6900", "Other expenses", "expense", "operating"],
] as const;

async function ensureAccountingColumn(table: string, column: string, definition: string) {
  const existing = await queryOne(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column],
  );
  if (!existing) await execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

export async function runAccountingMigrations() {
  await execute(`
    CREATE TABLE IF NOT EXISTS accounting_settings (
      user_id VARCHAR(36) PRIMARY KEY,
      fiscal_year_start_month TINYINT NOT NULL DEFAULT 1,
      approval_threshold_cents BIGINT NOT NULL DEFAULT 0,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);
  await execute(`
    CREATE TABLE IF NOT EXISTS accounting_accounts (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      code VARCHAR(20) NOT NULL,
      name VARCHAR(120) NOT NULL,
      account_type VARCHAR(20) NOT NULL,
      subtype VARCHAR(40) NULL,
      is_system TINYINT(1) NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_account_code (user_id, code),
      KEY idx_account_type (user_id, account_type, is_active)
    ) ENGINE=InnoDB
  `);
  await execute(`
    CREATE TABLE IF NOT EXISTS accounting_periods (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      name VARCHAR(100) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'open',
      closed_at DATETIME NULL,
      created_by VARCHAR(36) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_accounting_period (user_id, start_date, end_date),
      KEY idx_period_status (user_id, status, start_date, end_date)
    ) ENGINE=InnoDB
  `);
  await execute(`
    CREATE TABLE IF NOT EXISTS accounting_journals (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      entry_date DATE NOT NULL,
      memo VARCHAR(500) NOT NULL,
      reference VARCHAR(120) NULL,
      source_type VARCHAR(40) NOT NULL,
      source_id VARCHAR(100) NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'posted',
      created_by VARCHAR(36) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_journal_source (user_id, source_type, source_id),
      KEY idx_journal_date (user_id, entry_date, status),
      KEY idx_journal_source (user_id, source_type, source_id)
    ) ENGINE=InnoDB
  `);
  await execute(`
    CREATE TABLE IF NOT EXISTS accounting_journal_lines (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      journal_id VARCHAR(36) NOT NULL,
      account_id VARCHAR(36) NOT NULL,
      debit_cents BIGINT NOT NULL DEFAULT 0,
      credit_cents BIGINT NOT NULL DEFAULT 0,
      description VARCHAR(500) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY idx_journal_lines (user_id, journal_id),
      KEY idx_account_lines (user_id, account_id)
    ) ENGINE=InnoDB
  `);
  await execute(`
    CREATE TABLE IF NOT EXISTS accounting_supplier_bills (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      supplier_name VARCHAR(255) NOT NULL,
      supplier_reference VARCHAR(120) NULL,
      issue_date DATE NOT NULL,
      due_date DATE NULL,
      expense_account_id VARCHAR(36) NOT NULL,
      description VARCHAR(500) NOT NULL,
      inventory_product_id VARCHAR(36) NULL,
      quantity INT NOT NULL DEFAULT 0,
      subtotal_cents BIGINT NOT NULL,
      tax_cents BIGINT NOT NULL DEFAULT 0,
      total_cents BIGINT NOT NULL,
      paid_cents BIGINT NOT NULL DEFAULT 0,
      status VARCHAR(30) NOT NULL DEFAULT 'approved',
      notes TEXT NULL,
      created_by VARCHAR(36) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY idx_supplier_bill_due (user_id, status, due_date)
    ) ENGINE=InnoDB
  `);
  await ensureAccountingColumn("accounting_supplier_bills", "inventory_product_id", "VARCHAR(36) NULL");
  await ensureAccountingColumn("accounting_supplier_bills", "quantity", "INT NOT NULL DEFAULT 0");
  await execute(`
    CREATE TABLE IF NOT EXISTS accounting_supplier_bill_payments (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      bill_id VARCHAR(36) NOT NULL,
      payment_date DATE NOT NULL,
      amount_cents BIGINT NOT NULL,
      payment_method VARCHAR(40) NOT NULL DEFAULT 'bank',
      reference VARCHAR(120) NULL,
      journal_id VARCHAR(36) NOT NULL,
      created_by VARCHAR(36) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY idx_supplier_bill_payment (user_id, bill_id, payment_date)
    ) ENGINE=InnoDB
  `);
  await execute(`
    CREATE TABLE IF NOT EXISTS accounting_bill_inventory_receipts (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      bill_id VARCHAR(36) NOT NULL,
      product_id VARCHAR(36) NOT NULL,
      quantity INT NOT NULL,
      unit_cost_cents INT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_bill_inventory_receipt (user_id, bill_id)
    ) ENGINE=InnoDB
  `);
  await execute(`
    CREATE TABLE IF NOT EXISTS accounting_approvals (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      record_type VARCHAR(40) NOT NULL,
      record_id VARCHAR(36) NOT NULL,
      requested_by VARCHAR(36) NOT NULL,
      assigned_to VARCHAR(36) NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      request_note TEXT NULL,
      decision_note TEXT NULL,
      decided_by VARCHAR(36) NULL,
      requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      decided_at DATETIME NULL,
      KEY idx_approval_queue (user_id, status, requested_at),
      UNIQUE KEY uq_approval_record (user_id, record_type, record_id)
    ) ENGINE=InnoDB
  `);
  await execute(`
    CREATE TABLE IF NOT EXISTS accounting_bank_imports (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      imported_count INT NOT NULL DEFAULT 0,
      duplicate_count INT NOT NULL DEFAULT 0,
      imported_by VARCHAR(36) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY idx_bank_import_user (user_id, created_at)
    ) ENGINE=InnoDB
  `);
  await execute(`
    CREATE TABLE IF NOT EXISTS accounting_bank_transactions (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      import_id VARCHAR(36) NOT NULL,
      transaction_date DATE NOT NULL,
      description VARCHAR(500) NOT NULL,
      reference VARCHAR(120) NULL,
      amount_cents BIGINT NOT NULL,
      fingerprint CHAR(64) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'unmatched',
      matched_journal_id VARCHAR(36) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_bank_fingerprint (user_id, fingerprint),
      KEY idx_bank_reconcile (user_id, status, transaction_date)
    ) ENGINE=InnoDB
  `);
  await execute("INSERT IGNORE INTO accounting_settings (user_id) SELECT id FROM users");
  console.log("[Accounting] Migrations complete");
}

async function ensureChart(userId: string) {
  await execute("INSERT IGNORE INTO accounting_settings (user_id) VALUES (?)", [userId]);
  for (const [code, name, type, subtype] of DEFAULT_ACCOUNTS) {
    await execute(
      `INSERT IGNORE INTO accounting_accounts
       (id, user_id, code, name, account_type, subtype, is_system, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1, 1)`,
      [randomUUID(), userId, code, name, type, subtype],
    );
  }
}

async function account(userId: string, code: string) {
  const row = await queryOne("SELECT id FROM accounting_accounts WHERE user_id = ? AND code = ? AND is_active = 1", [userId, code]);
  if (!row) throw new Error(`Required account ${code} is not available`);
  return row.id as string;
}

type JournalLine = { account_id: string; debit_cents?: number; credit_cents?: number; description?: string | null };

async function assertOpenDate(conn: any, userId: string, date: string) {
  const [rows] = await conn.execute(
    "SELECT id FROM accounting_periods WHERE user_id = ? AND status = 'closed' AND start_date <= ? AND end_date >= ? LIMIT 1 FOR UPDATE",
    [userId, date, date],
  );
  if ((rows as any[]).length) throw new Error("This accounting period is closed. Reopen it before posting an adjustment.");
}

async function postJournal(options: {
  userId: string;
  actorId?: string | null;
  date: string;
  memo: string;
  reference?: string | null;
  sourceType: string;
  sourceId?: string | null;
  lines: JournalLine[];
}, existingConnection?: any) {
  const { userId, date, memo, sourceType, sourceId = null } = options;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T12:00:00Z`))) throw new Error("A valid journal date is required");
  if (!memo.trim() || options.lines.length < 2) throw new Error("A journal needs a description and at least two lines");
  const lines = options.lines.map((line) => ({
    ...line,
    debit_cents: Number(line.debit_cents || 0),
    credit_cents: Number(line.credit_cents || 0),
  }));
  for (const line of lines) {
    if (!Number.isSafeInteger(line.debit_cents) || !Number.isSafeInteger(line.credit_cents)
      || line.debit_cents < 0 || line.credit_cents < 0
      || (line.debit_cents > 0) === (line.credit_cents > 0)) {
      throw new Error("Each journal line must have a positive debit or credit, but not both");
    }
  }
  const debits = lines.reduce((sum, line) => sum + line.debit_cents, 0);
  const credits = lines.reduce((sum, line) => sum + line.credit_cents, 0);
  if (!debits || debits !== credits) throw new Error("Journal debits and credits must be equal and greater than zero");
  await ensureChart(userId);
  const ownsConnection = !existingConnection;
  const conn = existingConnection || await pool.getConnection();
  try {
    if (ownsConnection) await conn.beginTransaction();
    if (sourceId) {
      const [existingRows] = await conn.execute(
        "SELECT id FROM accounting_journals WHERE user_id = ? AND source_type = ? AND source_id = ? FOR UPDATE",
        [userId, sourceType, sourceId],
      );
      const existing = (existingRows as any[])[0];
      if (existing) {
        if (ownsConnection) await conn.commit();
        return existing.id as string;
      }
    }
    await assertOpenDate(conn, userId, date);
    for (const line of lines) {
      const [accountRows] = await conn.execute(
        "SELECT id FROM accounting_accounts WHERE id = ? AND user_id = ? AND is_active = 1",
        [line.account_id, userId],
      );
      if (!(accountRows as any[]).length) throw new Error("A selected account is unavailable");
    }
    const id = randomUUID();
    await conn.execute(
      `INSERT INTO accounting_journals
       (id, user_id, entry_date, memo, reference, source_type, source_id, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'posted', ?)`,
      [id, userId, date, memo.trim(), options.reference || null, sourceType, sourceId, options.actorId || null],
    );
    for (const line of lines) {
      await conn.execute(
        `INSERT INTO accounting_journal_lines
         (id, user_id, journal_id, account_id, debit_cents, credit_cents, description)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [randomUUID(), userId, id, line.account_id, line.debit_cents, line.credit_cents, line.description || null],
      );
    }
    if (ownsConnection) await conn.commit();
    return id;
  } catch (error) {
    if (ownsConnection) await conn.rollback().catch(() => {});
    throw error;
  } finally {
    if (ownsConnection) conn.release();
  }
}

function day(value: unknown, fallback = new Date().toISOString().slice(0, 10)) {
  const raw = value instanceof Date ? value.toISOString() : String(value ?? "").trim();
  const matched = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (matched) return matched[1];
  const parsed = raw ? new Date(raw) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString().slice(0, 10) : fallback;
}

function categoryAccount(type: string, category: string) {
  if (type === "INCOME") {
    if (/service|consult/i.test(category)) return "4100";
    if (/other|grant|interest|rental/i.test(category)) return "4900";
    return "4000";
  }
  if (/rent/i.test(category)) return "6100";
  if (/utilit/i.test(category)) return "6200";
  if (/transport|travel/i.test(category)) return "6300";
  if (/salary|wage/i.test(category)) return "6400";
  if (/market/i.test(category)) return "6500";
  if (/stock|cost of goods/i.test(category)) return "5000";
  if (/suppl/i.test(category)) return "6600";
  if (/equipment/i.test(category)) return "6700";
  return "6900";
}

async function syncLegacyEntries(userId: string) {
  await ensureChart(userId);
  const rows = await queryAll("SELECT * FROM ledger_entries WHERE user_id = ? ORDER BY occurred_at, created_at", [userId]);
  const cashId = await account(userId, "1000");
  for (const row of rows as any[]) {
    const amount = Number(row.amount_cents || 0);
    if (amount <= 0) continue;
    const otherId = await account(userId, categoryAccount(row.type, row.category || ""));
    await postJournal({
      userId, date: day(row.occurred_at), memo: row.description || row.category || "Imported finance entry",
      sourceType: "legacy_ledger", sourceId: row.id,
      lines: row.type === "INCOME"
        ? [{ account_id: cashId, debit_cents: amount }, { account_id: otherId, credit_cents: amount }]
        : [{ account_id: otherId, debit_cents: amount }, { account_id: cashId, credit_cents: amount }],
    });
  }
}

async function syncInvoices(userId: string) {
  await ensureChart(userId);
  const receivable = await account(userId, "1100");
  const revenue = await account(userId, "4000");
  const taxOutput = await account(userId, "2100");
  const cash = await account(userId, "1000");
  const invoices = await queryAll(
    `SELECT i.id, i.invoice_number, i.total_cents, i.vat_cents, i.status, i.type, i.created_at, i.paid_at, i.revision_number,
            COALESCE((SELECT SUM(p.amount_cents) FROM invoice_payments p WHERE p.invoice_id = i.id AND p.user_id = i.user_id),0) AS paid_cents
     FROM invoices i WHERE i.user_id = ? AND i.type = 'invoice'`,
    [userId],
  );
  for (const invoice of invoices as any[]) {
    const total = Number(invoice.total_cents || 0);
    const tax = Number(invoice.vat_cents || 0);
    const subtotal = total - tax;
    const isVoid = invoice.status === "void";
    const currentLines: JournalLine[] = [
      ...(total > 0 ? [{ account_id: receivable, debit_cents: total }] : []),
      ...(subtotal > 0 ? [{ account_id: revenue, credit_cents: subtotal }] : []),
      ...(tax > 0 ? [{ account_id: taxOutput, credit_cents: tax }] : []),
    ];
    const revision = Number(invoice.revision_number || 0);
    const revisionKey = `${invoice.id}:r${revision}`;
    const prior = await queryOne(
      `SELECT id FROM accounting_journals
       WHERE user_id = ? AND ((source_type = 'sales_invoice' AND source_id = ?)
         OR (source_type = 'sales_invoice_revision' AND source_id LIKE ?))
       ORDER BY created_at DESC LIMIT 1`,
      [userId, invoice.id, `${invoice.id}:r%`],
    );
    if (isVoid) {
      const voided = await queryOne(
        "SELECT id FROM accounting_journals WHERE user_id = ? AND source_type = 'sales_invoice_void' AND source_id = ?",
        [userId, invoice.id],
      );
      if (prior && !voided) {
        const oldLines = await queryAll("SELECT account_id, debit_cents, credit_cents, description FROM accounting_journal_lines WHERE journal_id = ? AND user_id = ?", [prior.id, userId]);
        const reversalLines = (oldLines as any[]).map((line) => ({
          account_id: line.account_id, debit_cents: Number(line.credit_cents), credit_cents: Number(line.debit_cents), description: line.description,
        })).filter((line) => line.debit_cents || line.credit_cents);
        await postJournal({
          userId, date: new Date().toISOString().slice(0, 10), memo: `Void invoice ${invoice.invoice_number}`,
          reference: invoice.invoice_number, sourceType: "sales_invoice_void", sourceId: invoice.id, lines: reversalLines,
        });
      }
    } else if (total > 0 && subtotal >= 0) {
      if (!prior) {
        const revisionRecord = revision > 0 ? await queryOne(
          "SELECT created_at FROM invoice_revisions WHERE user_id = ? AND invoice_id = ? AND revision_number = ?",
          [userId, invoice.id, revision],
        ) : null;
        await postJournal({
          userId, date: day(revisionRecord?.created_at || invoice.created_at), memo: `Sales invoice ${invoice.invoice_number}`,
          reference: invoice.invoice_number, sourceType: "sales_invoice", sourceId: invoice.id, lines: currentLines,
        });
      } else {
        const processed = await queryOne(
          "SELECT id FROM accounting_journals WHERE user_id = ? AND source_type = 'sales_invoice_revision' AND source_id = ?",
          [userId, revisionKey],
        );
        if (!processed) {
          const oldLines = await queryAll(
            "SELECT account_id, debit_cents, credit_cents, description FROM accounting_journal_lines WHERE journal_id = ? AND user_id = ?",
            [prior.id, userId],
          );
          const normalize = (lines: any[]) => lines.map((line) => ({
            account_id: line.account_id,
            debit_cents: Number(line.debit_cents || 0),
            credit_cents: Number(line.credit_cents || 0),
          })).sort((a, b) => a.account_id.localeCompare(b.account_id));
          const unchanged = JSON.stringify(normalize(oldLines as any[])) === JSON.stringify(normalize(currentLines));
          if (!unchanged) {
            const revisionRecord = await queryOne(
              "SELECT created_at FROM invoice_revisions WHERE user_id = ? AND invoice_id = ? AND revision_number = ?",
              [userId, invoice.id, revision],
            );
            const revisionDate = day(revisionRecord?.created_at);
            const reversalLines = (oldLines as any[]).map((line) => ({
              account_id: line.account_id,
              debit_cents: Number(line.credit_cents),
              credit_cents: Number(line.debit_cents),
              description: line.description,
            })).filter((line) => line.debit_cents || line.credit_cents);
            await postJournal({
              userId, date: revisionDate, memo: `Reverse previous amount for revised invoice ${invoice.invoice_number}`,
              reference: invoice.invoice_number, sourceType: "sales_invoice_revision_reversal", sourceId: revisionKey,
              lines: reversalLines,
            });
            await postJournal({
              userId, date: revisionDate, memo: `Revised sales invoice ${invoice.invoice_number}`,
              reference: invoice.invoice_number, sourceType: "sales_invoice_revision", sourceId: revisionKey,
              lines: currentLines,
            });
          }
        }
      }
    }
    if (!isVoid && invoice.paid_at && Number(invoice.paid_cents || 0) === 0) {
      await postJournal({
        userId, date: day(invoice.paid_at), memo: `Legacy payment received for ${invoice.invoice_number}`,
        reference: invoice.invoice_number, sourceType: "legacy_invoice_payment", sourceId: invoice.id,
        lines: [{ account_id: cash, debit_cents: total }, { account_id: receivable, credit_cents: total }],
      });
    }
  }
  const payments = await queryAll(
    `SELECT p.*, i.invoice_number FROM invoice_payments p
     JOIN invoices i ON i.id = p.invoice_id AND i.user_id = p.user_id
     WHERE p.user_id = ?`,
    [userId],
  );
  for (const payment of payments as any[]) {
    const amount = Number(payment.amount_cents || 0);
    if (amount <= 0) continue;
    await postJournal({
      userId, date: day(payment.paid_at), memo: `Payment received for ${payment.invoice_number}`,
      reference: payment.receipt_number, sourceType: "sales_receipt", sourceId: payment.id,
      lines: [{ account_id: cash, debit_cents: amount }, { account_id: receivable, credit_cents: amount }],
    });
  }
  const credits = await queryAll(
    `SELECT c.*, i.invoice_number, i.vat_enabled, i.tax_rate
     FROM invoice_credit_notes c JOIN invoices i ON i.id = c.invoice_id AND i.user_id = c.user_id
     WHERE c.user_id = ? AND c.status = 'issued'`,
    [userId],
  );
  const returns = await account(userId, "4200");
  for (const credit of credits as any[]) {
    const gross = Number(credit.amount_cents || 0);
    const rate = Number(credit.tax_rate || 0);
    const tax = credit.vat_enabled && rate > 0 ? Math.min(gross, Math.round(gross * rate / (100 + rate))) : 0;
    const net = gross - tax;
    if (gross <= 0 || net < 0) continue;
    await postJournal({
      userId, date: day(credit.created_at), memo: `Credit note ${credit.credit_number} for ${credit.invoice_number}`,
      reference: credit.credit_number, sourceType: "sales_credit_note", sourceId: credit.id,
      lines: [
        ...(net ? [{ account_id: returns, debit_cents: net }] : []),
        ...(tax ? [{ account_id: taxOutput, debit_cents: tax }] : []),
        { account_id: receivable, credit_cents: gross },
      ],
    });
  }
}

async function syncLedger(userId: string) {
  await ensureChart(userId);
  await syncLegacyEntries(userId);
  await syncInvoices(userId);
}

async function financePermission(req: any, res: any, next: any) {
  try {
    if (!isTeamMember(req)) return next();
    const ownerId = getDataOwnerId(req);
    const member = await queryOne(
      `SELECT wm.permissions FROM workspace_members wm
       JOIN workspaces w ON w.id = wm.workspace_id
       WHERE wm.user_id = ? AND w.owner_id = ? LIMIT 1`,
      [req.session.userId, ownerId],
    );
    let permissions: string[] = [];
    try { permissions = typeof member?.permissions === "string" ? JSON.parse(member.permissions) : (member?.permissions || []); } catch {}
    if (!permissions.includes("finance")) return res.status(403).json({ error: "You do not have permission to access accounting." });
    next();
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Could not verify accounting access" });
  }
}
accountingRouter.use(financePermission);

accountingRouter.get("/accounts", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    await ensureChart(userId);
    res.json(await queryAll("SELECT * FROM accounting_accounts WHERE user_id = ? ORDER BY code", [userId]));
  } catch (error: any) { res.status(500).json({ error: error.message || "Failed to load accounts" }); }
});

accountingRouter.post("/accounts", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const code = String(req.body.code || "").trim();
    const name = String(req.body.name || "").trim();
    const type = String(req.body.account_type || "");
    if (!/^[A-Z0-9-]{2,20}$/i.test(code) || !name || !["asset", "liability", "equity", "income", "expense"].includes(type)) {
      return res.status(400).json({ error: "Provide a valid account code, name, and type." });
    }
    await ensureChart(userId);
    const id = randomUUID();
    await execute(
      `INSERT INTO accounting_accounts (id, user_id, code, name, account_type, subtype, is_system, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 0, 1)`,
      [id, userId, code, name, type, String(req.body.subtype || "").trim() || null],
    );
    res.status(201).json(await queryOne("SELECT * FROM accounting_accounts WHERE id = ? AND user_id = ?", [id, userId]));
  } catch (error: any) { res.status(400).json({ error: error.message || "Could not create account" }); }
});

accountingRouter.patch("/accounts/:id", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const accountRow = await queryOne("SELECT id, is_system FROM accounting_accounts WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!accountRow) return res.status(404).json({ error: "Account not found" });
    if (req.body.is_active === false && accountRow.is_system) return res.status(400).json({ error: "System accounts cannot be deactivated." });
    await execute(
      "UPDATE accounting_accounts SET name = COALESCE(?, name), is_active = COALESCE(?, is_active) WHERE id = ? AND user_id = ?",
      [req.body.name ? String(req.body.name).trim() : null, typeof req.body.is_active === "boolean" ? Number(req.body.is_active) : null, req.params.id, userId],
    );
    res.json({ ok: true });
  } catch (error: any) { res.status(400).json({ error: error.message || "Could not update account" }); }
});

accountingRouter.get("/periods", async (req, res) => {
  try { res.json(await queryAll("SELECT * FROM accounting_periods WHERE user_id = ? ORDER BY start_date DESC", [getDataOwnerId(req)])); }
  catch (error: any) { res.status(500).json({ error: error.message || "Failed to load periods" }); }
});

accountingRouter.post("/periods", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const startDate = day(req.body.start_date, "");
    const endDate = day(req.body.end_date, "");
    const name = String(req.body.name || "").trim();
    if (!startDate || !endDate || startDate > endDate || !name) return res.status(400).json({ error: "Enter a name and a valid date range." });
    const id = randomUUID();
    await execute(
      "INSERT INTO accounting_periods (id, user_id, name, start_date, end_date, created_by) VALUES (?, ?, ?, ?, ?, ?)",
      [id, userId, name, startDate, endDate, req.session?.userId || null],
    );
    res.status(201).json(await queryOne("SELECT * FROM accounting_periods WHERE id = ? AND user_id = ?", [id, userId]));
  } catch (error: any) { res.status(400).json({ error: error.message || "Could not create accounting period" }); }
});

accountingRouter.post("/periods/:id/close", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const period = await queryOne("SELECT * FROM accounting_periods WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!period) return res.status(404).json({ error: "Period not found" });
    await execute("UPDATE accounting_periods SET status = 'closed', closed_at = NOW() WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    res.json({ ok: true });
  } catch (error: any) { res.status(500).json({ error: error.message || "Could not close period" }); }
});

accountingRouter.post("/periods/:id/reopen", async (req, res) => {
  try {
    if (isTeamMember(req)) return res.status(403).json({ error: "Only the business owner can reopen an accounting period." });
    const userId = getDataOwnerId(req);
    const result = await execute("UPDATE accounting_periods SET status = 'open', closed_at = NULL WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!result.affectedRows) return res.status(404).json({ error: "Period not found" });
    res.json({ ok: true });
  } catch (error: any) { res.status(500).json({ error: error.message || "Could not reopen period" }); }
});

accountingRouter.get("/journals", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    await syncLedger(userId);
    const from = String(req.query.from || "0001-01-01").slice(0, 10);
    const to = String(req.query.to || "9999-12-31").slice(0, 10);
    const journals = await queryAll(
      `SELECT j.*, COALESCE(SUM(l.debit_cents), 0) AS debit_cents,
              COALESCE(SUM(l.credit_cents), 0) AS credit_cents,
              EXISTS(SELECT 1 FROM accounting_journals r WHERE r.user_id = j.user_id
                     AND r.source_type = 'journal_reversal' AND r.source_id = j.id) AS reversed
       FROM accounting_journals j LEFT JOIN accounting_journal_lines l ON l.journal_id = j.id AND l.user_id = j.user_id
       WHERE j.user_id = ? AND j.entry_date BETWEEN ? AND ?
       GROUP BY j.id ORDER BY j.entry_date DESC, j.created_at DESC LIMIT 500`,
      [userId, from, to],
    );
    res.json(journals);
  } catch (error: any) { res.status(500).json({ error: error.message || "Failed to load journal" }); }
});

accountingRouter.get("/journals/:id", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const journal = await queryOne("SELECT * FROM accounting_journals WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!journal) return res.status(404).json({ error: "Journal entry not found" });
    res.json({ ...journal, lines: await queryAll(
      `SELECT l.*, a.code, a.name AS account_name, a.account_type
       FROM accounting_journal_lines l JOIN accounting_accounts a ON a.id = l.account_id AND a.user_id = l.user_id
       WHERE l.journal_id = ? AND l.user_id = ? ORDER BY a.code`,
      [req.params.id, userId],
    ), reversed: !!(await queryOne(
      "SELECT id FROM accounting_journals WHERE user_id = ? AND source_type = 'journal_reversal' AND source_id = ? LIMIT 1",
      [userId, req.params.id],
    )) });
  } catch (error: any) { res.status(500).json({ error: error.message || "Failed to load journal entry" }); }
});

accountingRouter.post("/journals", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const id = await postJournal({
      userId, actorId: req.session?.userId || null, date: day(req.body.entry_date, ""),
      memo: String(req.body.memo || ""), reference: req.body.reference,
      sourceType: "manual", lines: Array.isArray(req.body.lines) ? req.body.lines : [],
    });
    res.status(201).json({ ok: true, id });
  } catch (error: any) { res.status(400).json({ error: error.message || "Could not post journal entry" }); }
});

accountingRouter.post("/journals/:id/reverse", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const original = await queryOne(
      "SELECT * FROM accounting_journals WHERE id = ? AND user_id = ? AND source_type = 'manual'",
      [req.params.id, userId],
    );
    if (!original) return res.status(404).json({ error: "Only manual journals can be reversed directly. Correct source documents from their original section." });
    const existing = await queryOne(
      "SELECT id FROM accounting_journals WHERE user_id = ? AND source_type = 'journal_reversal' AND source_id = ?",
      [userId, original.id],
    );
    if (existing) return res.status(409).json({ error: "This journal has already been reversed." });
    const reason = String(req.body.reason || "").trim();
    if (!reason) return res.status(400).json({ error: "A reason is required for the reversal." });
    const originalLines = await queryAll(
      "SELECT account_id, debit_cents, credit_cents, description FROM accounting_journal_lines WHERE journal_id = ? AND user_id = ?",
      [original.id, userId],
    );
    const id = await postJournal({
      userId, actorId: req.session?.userId || null, date: day(req.body.entry_date),
      memo: `Reversal of ${original.memo}: ${reason}`.slice(0, 500),
      reference: original.reference ? `REV-${original.reference}`.slice(0, 120) : `REV-${String(original.id).slice(0, 32)}`,
      sourceType: "journal_reversal", sourceId: original.id,
      lines: (originalLines as any[]).map((line) => ({
        account_id: line.account_id, debit_cents: Number(line.credit_cents),
        credit_cents: Number(line.debit_cents), description: line.description,
      })).filter((line) => line.debit_cents || line.credit_cents),
    });
    res.status(201).json({ ok: true, id });
  } catch (error: any) { res.status(400).json({ error: error.message || "Could not reverse journal" }); }
});

async function accountBalances(userId: string, from?: string, to?: string, asOf?: string) {
  const dateFilter: string[] = ["j.user_id = ?", "j.status = 'posted'"];
  const params: any[] = [userId];
  if (from) { dateFilter.push("j.entry_date >= ?"); params.push(from); }
  if (to) { dateFilter.push("j.entry_date <= ?"); params.push(to); }
  if (asOf) { dateFilter.push("j.entry_date <= ?"); params.push(asOf); }
  params.push(userId);
  return queryAll(
    `SELECT a.id, a.code, a.name, a.account_type, a.subtype,
            COALESCE(b.debits, 0) AS debits, COALESCE(b.credits, 0) AS credits
     FROM accounting_accounts a
     LEFT JOIN (
       SELECT l.account_id, SUM(l.debit_cents) AS debits, SUM(l.credit_cents) AS credits
       FROM accounting_journal_lines l
       JOIN accounting_journals j ON j.id = l.journal_id AND j.user_id = l.user_id
       WHERE ${dateFilter.join(" AND ")}
       GROUP BY l.account_id
     ) b ON b.account_id = a.id
     WHERE a.user_id = ? AND a.is_active = 1
     ORDER BY a.code`,
    params,
  );
}

accountingRouter.get("/reports/trial-balance", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    await syncLedger(userId);
    const rows = await accountBalances(userId, String(req.query.from || "0001-01-01"), String(req.query.to || "9999-12-31"));
    const accounts = (rows as any[]).map((row) => ({
      ...row,
      debit_balance_cents: Math.max(0, Number(row.debits) - Number(row.credits)),
      credit_balance_cents: Math.max(0, Number(row.credits) - Number(row.debits)),
    }));
    res.json({ accounts, debit_total_cents: accounts.reduce((s, r) => s + r.debit_balance_cents, 0), credit_total_cents: accounts.reduce((s, r) => s + r.credit_balance_cents, 0) });
  } catch (error: any) { res.status(500).json({ error: error.message || "Could not build trial balance" }); }
});

accountingRouter.get("/reports/profit-loss", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    await syncLedger(userId);
    const rows = await accountBalances(userId, String(req.query.from || `${new Date().getFullYear()}-01-01`), String(req.query.to || new Date().toISOString().slice(0, 10)));
    const accounts = (rows as any[]).filter((r) => ["income", "expense"].includes(r.account_type)).map((r) => ({
      ...r, balance_cents: r.account_type === "income" ? Number(r.credits) - Number(r.debits) : Number(r.debits) - Number(r.credits),
    }));
    const income = accounts.filter((a) => a.account_type === "income").reduce((s, a) => s + a.balance_cents, 0);
    const expenses = accounts.filter((a) => a.account_type === "expense").reduce((s, a) => s + a.balance_cents, 0);
    res.json({ accounts, income_cents: income, expense_cents: expenses, net_profit_cents: income - expenses });
  } catch (error: any) { res.status(500).json({ error: error.message || "Could not build profit and loss report" }); }
});

accountingRouter.get("/reports/balance-sheet", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    await syncLedger(userId);
    const asOf = String(req.query.as_of || new Date().toISOString().slice(0, 10));
    const rows = await accountBalances(userId, undefined, undefined, asOf);
    const balances = (rows as any[]).map((r) => ({
      ...r, balance_cents: ["asset", "expense"].includes(r.account_type)
        ? Number(r.debits) - Number(r.credits)
        : Number(r.credits) - Number(r.debits),
    }));
    const assets = balances.filter((r) => r.account_type === "asset").reduce((s, r) => s + r.balance_cents, 0);
    const liabilities = balances.filter((r) => r.account_type === "liability").reduce((s, r) => s + r.balance_cents, 0);
    const equityAccounts = balances.filter((r) => r.account_type === "equity").reduce((s, r) => s + r.balance_cents, 0);
    const income = balances.filter((r) => r.account_type === "income").reduce((s, r) => s + r.balance_cents, 0);
    const expenses = balances.filter((r) => r.account_type === "expense").reduce((s, r) => s + r.balance_cents, 0);
    const currentEarnings = income - expenses;
    res.json({
      as_of: asOf, assets_cents: assets, liabilities_cents: liabilities,
      equity_cents: equityAccounts + currentEarnings, current_earnings_cents: currentEarnings,
      liabilities_and_equity_cents: liabilities + equityAccounts + currentEarnings,
      accounts: balances.filter((r) => ["asset", "liability", "equity"].includes(r.account_type)),
    });
  } catch (error: any) { res.status(500).json({ error: error.message || "Could not build balance sheet" }); }
});

accountingRouter.get("/reports/cash-flow", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    await syncLedger(userId);
    const cashId = await account(userId, "1000");
    const from = String(req.query.from || `${new Date().getFullYear()}-01-01`);
    const to = String(req.query.to || new Date().toISOString().slice(0, 10));
    const rows = await queryAll(
      `SELECT j.id, SUM(c.debit_cents - c.credit_cents) AS cash_delta,
              GROUP_CONCAT(DISTINCT a.account_type) AS counter_types
       FROM accounting_journals j
       JOIN accounting_journal_lines c ON c.journal_id = j.id AND c.user_id = j.user_id AND c.account_id = ?
       JOIN accounting_journal_lines l ON l.journal_id = j.id AND l.user_id = j.user_id AND l.account_id <> ?
       JOIN accounting_accounts a ON a.id = l.account_id AND a.user_id = l.user_id
       WHERE j.user_id = ? AND j.status = 'posted' AND j.entry_date BETWEEN ? AND ?
       GROUP BY j.id`,
      [cashId, cashId, userId, from, to],
    );
    let operating = 0, investing = 0, financing = 0;
    for (const row of rows as any[]) {
      const delta = Number(row.cash_delta || 0);
      const types = String(row.counter_types || "");
      if (types.includes("equity") || types.includes("liability")) financing += delta;
      else if (types.includes("asset") && !types.includes("income") && !types.includes("expense")) investing += delta;
      else operating += delta;
    }
    res.json({ from, to, operating_cents: operating, investing_cents: investing, financing_cents: financing, net_change_cents: operating + investing + financing });
  } catch (error: any) { res.status(500).json({ error: error.message || "Could not build cash flow report" }); }
});

accountingRouter.get("/reports/vat", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    await syncLedger(userId);
    const from = String(req.query.from || `${new Date().getFullYear()}-01-01`);
    const to = String(req.query.to || new Date().toISOString().slice(0, 10));
    const rows = await queryAll(
      `SELECT a.code, a.name, SUM(l.debit_cents) AS debits, SUM(l.credit_cents) AS credits
       FROM accounting_accounts a
       JOIN accounting_journal_lines l ON l.account_id = a.id AND l.user_id = a.user_id
       JOIN accounting_journals j ON j.id = l.journal_id AND j.user_id = l.user_id
       WHERE a.user_id = ? AND a.code IN ('1300','2100') AND j.status = 'posted' AND j.entry_date BETWEEN ? AND ?
       GROUP BY a.id`,
      [userId, from, to],
    );
    const input = (rows as any[]).find((r) => r.code === "1300");
    const output = (rows as any[]).find((r) => r.code === "2100");
    const inputCents = Number(input?.debits || 0) - Number(input?.credits || 0);
    const outputCents = Number(output?.credits || 0) - Number(output?.debits || 0);
    res.json({ from, to, input_vat_cents: inputCents, output_vat_cents: outputCents, net_vat_payable_cents: outputCents - inputCents });
  } catch (error: any) { res.status(500).json({ error: error.message || "Could not build VAT report" }); }
});

accountingRouter.get("/reports/receivables-aging", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    await syncInvoices(userId);
    const rows = await queryAll(
      `SELECT i.id, i.invoice_number, i.customer_name, i.due_date, i.created_at, i.paid_at, i.total_cents, i.status,
         COALESCE((SELECT SUM(p.amount_cents) FROM invoice_payments p WHERE p.invoice_id = i.id AND p.user_id = i.user_id),0) AS paid_cents,
         COALESCE((SELECT SUM(c.amount_cents) FROM invoice_credit_notes c WHERE c.invoice_id = i.id AND c.user_id = i.user_id AND c.status = 'issued'),0) AS credit_cents
       FROM invoices i WHERE i.user_id = ? AND i.type = 'invoice' AND i.status <> 'void'
       ORDER BY COALESCE(i.due_date, i.created_at) ASC`,
      [userId],
    );
    const today = new Date();
    const items = (rows as any[]).map((r) => {
      const recordedPayments = Number(r.paid_cents || 0);
      const paid = recordedPayments || (r.paid_at ? Number(r.total_cents) : 0);
      const balance = Math.max(0, Number(r.total_cents) - paid - Number(r.credit_cents));
      const due = r.due_date ? new Date(`${String(r.due_date).slice(0, 10)}T12:00:00`) : new Date(`${String(r.created_at).slice(0, 10)}T12:00:00`);
      const days = Math.floor((today.getTime() - due.getTime()) / 86400000);
      return { ...r, balance_cents: balance, days_overdue: Math.max(0, days), bucket: balance === 0 ? "settled" : days <= 0 ? "current" : days <= 30 ? "1-30" : days <= 60 ? "31-60" : days <= 90 ? "61-90" : "90+" };
    }).filter((r) => r.balance_cents > 0);
    const totals = Object.fromEntries(["current", "1-30", "31-60", "61-90", "90+"].map((bucket) => [bucket, items.filter((i) => i.bucket === bucket).reduce((s, i) => s + i.balance_cents, 0)]));
    res.json({ items, totals, total_cents: items.reduce((s, i) => s + i.balance_cents, 0) });
  } catch (error: any) { res.status(500).json({ error: error.message || "Could not build receivables aging" }); }
});

accountingRouter.get("/reports/forecast", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    await syncLedger(userId);
    const months = Math.max(1, Math.min(12, Number(req.query.months || 6)));
    const history = await queryAll(
      `SELECT LEFT(j.entry_date, 7) AS month,
              SUM(CASE WHEN a.account_type = 'income' THEN l.credit_cents - l.debit_cents ELSE 0 END) AS income_cents,
              SUM(CASE WHEN a.account_type = 'expense' THEN l.debit_cents - l.credit_cents ELSE 0 END) AS expense_cents
       FROM accounting_journals j JOIN accounting_journal_lines l ON l.journal_id = j.id AND l.user_id = j.user_id
       JOIN accounting_accounts a ON a.id = l.account_id AND a.user_id = l.user_id
       WHERE j.user_id = ? AND j.status = 'posted' AND j.entry_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
       GROUP BY LEFT(j.entry_date, 7)`,
      [userId],
    );
    const avgIncome = (history as any[]).reduce((s, r) => s + Number(r.income_cents || 0), 0) / 3;
    const avgExpense = (history as any[]).reduce((s, r) => s + Number(r.expense_cents || 0), 0) / 3;
    const cashAccount = await account(userId, "1000");
    const cashRow = await queryOne(
      "SELECT COALESCE(SUM(l.debit_cents - l.credit_cents), 0) AS balance FROM accounting_journal_lines l JOIN accounting_journals j ON j.id = l.journal_id AND j.user_id = l.user_id WHERE l.user_id = ? AND l.account_id = ? AND j.status = 'posted'",
      [userId, cashAccount],
    );
    const upcoming = await queryOne(
      `SELECT COALESCE(SUM(i.total_cents -
        COALESCE((SELECT SUM(p.amount_cents) FROM invoice_payments p WHERE p.invoice_id = i.id AND p.user_id = i.user_id),0) -
        COALESCE((SELECT SUM(c.amount_cents) FROM invoice_credit_notes c WHERE c.invoice_id = i.id AND c.user_id = i.user_id AND c.status = 'issued'),0)),0) AS receivables_cents
       FROM invoices i WHERE i.user_id = ? AND i.type = 'invoice' AND i.status <> 'void' AND i.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? MONTH)`,
      [userId, months],
    );
    const forecast = [];
    let projected = Number(cashRow?.balance || 0);
    for (let i = 1; i <= months; i++) {
      const dt = new Date(); dt.setMonth(dt.getMonth() + i);
      projected += avgIncome - avgExpense;
      forecast.push({ month: dt.toISOString().slice(0, 7), projected_cash_cents: Math.round(projected), average_income_cents: Math.round(avgIncome), average_expense_cents: Math.round(avgExpense) });
    }
    res.json({ current_cash_cents: Number(cashRow?.balance || 0), expected_receivables_cents: Number(upcoming?.receivables_cents || 0), average_monthly_income_cents: Math.round(avgIncome), average_monthly_expense_cents: Math.round(avgExpense), forecast });
  } catch (error: any) { res.status(500).json({ error: error.message || "Could not build forecast" }); }
});

accountingRouter.get("/reports/inventory-valuation", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const products = await queryAll(
      `SELECT id, sku, name, category, unit, cost_cents, quantity_on_hand,
              CAST(cost_cents * quantity_on_hand AS SIGNED) AS value_cents
       FROM inventory_products WHERE user_id = ? AND archived = 0 ORDER BY name`,
      [userId],
    );
    res.json({ products, total_value_cents: (products as any[]).reduce((s, p) => s + Number(p.value_cents || 0), 0) });
  } catch (error: any) { res.status(500).json({ error: error.message || "Could not calculate inventory valuation" }); }
});

async function receiveBillInventory(conn: any, userId: string, bill: any, actorId: string) {
  if (!bill.inventory_product_id || Number(bill.quantity) <= 0) return;
  const [receiptRows] = await conn.execute(
    "SELECT id FROM accounting_bill_inventory_receipts WHERE user_id = ? AND bill_id = ? FOR UPDATE",
    [userId, bill.id],
  );
  if ((receiptRows as any[]).length) return;
  const [productRows] = await conn.execute(
    "SELECT id, quantity_on_hand, cost_cents FROM inventory_products WHERE id = ? AND user_id = ? AND archived = 0 FOR UPDATE",
    [bill.inventory_product_id, userId],
  );
  const product = (productRows as any[])[0];
  if (!product) throw new Error("The linked inventory item is no longer available.");
  const quantity = Number(bill.quantity);
  const existingQty = Number(product.quantity_on_hand || 0);
  const nextQty = existingQty + quantity;
  if (!Number.isSafeInteger(nextQty) || nextQty > 2147483647) throw new Error("The resulting stock quantity is too large.");
  const unitCost = Math.round(Number(bill.subtotal_cents) / quantity);
  const weightedCost = nextQty > 0
    ? Math.round((existingQty * Number(product.cost_cents || 0) + Number(bill.subtotal_cents)) / nextQty)
    : unitCost;
  await conn.execute(
    "UPDATE inventory_products SET quantity_on_hand = ?, cost_cents = ?, updated_at = NOW() WHERE id = ? AND user_id = ?",
    [nextQty, weightedCost, bill.inventory_product_id, userId],
  );
  await conn.execute(
    `INSERT INTO inventory_movements
     (user_id, product_id, movement_type, qty_delta, qty_after, unit_cost_cents, note, reference, created_by)
     VALUES (?, ?, 'PURCHASE', ?, ?, ?, ?, ?, ?)`,
    [userId, bill.inventory_product_id, quantity, nextQty, unitCost, `Supplier bill from ${bill.supplier_name}`, bill.supplier_reference || bill.id, actorId],
  );
  await conn.execute(
    `INSERT INTO accounting_bill_inventory_receipts
     (id, user_id, bill_id, product_id, quantity, unit_cost_cents)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [randomUUID(), userId, bill.id, bill.inventory_product_id, quantity, unitCost],
  );
}

async function isAccountingApprover(userId: string, ownerId: string) {
  if (userId === ownerId) return true;
  const member = await queryOne(
    `SELECT wm.permissions FROM workspace_members wm
     JOIN workspaces w ON w.id = wm.workspace_id
     WHERE wm.user_id = ? AND w.owner_id = ? LIMIT 1`,
    [userId, ownerId],
  );
  try {
    const permissions = typeof member?.permissions === "string" ? JSON.parse(member.permissions) : (member?.permissions || []);
    return Array.isArray(permissions) && permissions.includes("finance");
  } catch { return false; }
}

accountingRouter.get("/approvers", async (req, res) => {
  try {
    const ownerId = getDataOwnerId(req);
    const members = await queryAll(
      `SELECT u.id, u.full_name, u.email, wm.role, wm.permissions
       FROM workspaces w JOIN workspace_members wm ON wm.workspace_id = w.id
       JOIN users u ON u.id = wm.user_id
       WHERE w.owner_id = ? ORDER BY u.full_name, u.email`,
      [ownerId],
    );
    const eligible = (members as any[]).filter((member) => {
      try {
        const permissions = typeof member.permissions === "string" ? JSON.parse(member.permissions) : (member.permissions || []);
        return member.id === ownerId || (Array.isArray(permissions) && permissions.includes("finance"));
      } catch { return member.id === ownerId; }
    }).map(({ permissions: _permissions, ...member }) => member);
    res.json(eligible);
  } catch (error: any) { res.status(500).json({ error: error.message || "Failed to load approvers" }); }
});

accountingRouter.get("/supplier-bills", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    res.json(await queryAll(
      `SELECT b.*, p.name AS inventory_product_name
       FROM accounting_supplier_bills b LEFT JOIN inventory_products p ON p.id = b.inventory_product_id AND p.user_id = b.user_id
       WHERE b.user_id = ? ORDER BY b.issue_date DESC, b.created_at DESC`,
      [userId],
    ));
  }
  catch (error: any) { res.status(500).json({ error: error.message || "Failed to load supplier bills" }); }
});

accountingRouter.post("/supplier-bills", async (req, res) => {
  let conn: any;
  try {
    const userId = getDataOwnerId(req);
    await ensureChart(userId);
    const supplier = String(req.body.supplier_name || "").trim();
    const description = String(req.body.description || "").trim();
    const accountId = String(req.body.expense_account_id || "");
    const subtotal = Number(req.body.subtotal_cents);
    const tax = Number(req.body.tax_cents || 0);
    const issueDate = day(req.body.issue_date, "");
    const dueDate = req.body.due_date ? day(req.body.due_date, "") : null;
    const inventoryProductId = String(req.body.inventory_product_id || "").trim() || null;
    const quantity = Number(req.body.quantity || 0);
    const actorId = String(req.session?.userId || userId);
    if (!supplier || !description || !issueDate || !Number.isSafeInteger(subtotal) || subtotal <= 0 || !Number.isSafeInteger(tax) || tax < 0) {
      return res.status(400).json({ error: "Supplier, description, issue date, and valid subtotal/tax amounts are required." });
    }
    const accountRow = await queryOne("SELECT id, code, account_type FROM accounting_accounts WHERE id = ? AND user_id = ? AND account_type IN ('expense','asset') AND is_active = 1", [accountId, userId]);
    if (!accountRow) return res.status(400).json({ error: "Choose an active expense or inventory account." });
    if ((inventoryProductId && (accountRow.code !== "1200" || !Number.isSafeInteger(quantity) || quantity <= 0))
      || (!inventoryProductId && (quantity !== 0 || accountRow.code === "1200"))) {
      return res.status(400).json({ error: "Inventory purchases must link an inventory product and a positive received quantity." });
    }
    if (inventoryProductId) {
      const product = await queryOne("SELECT id FROM inventory_products WHERE id = ? AND user_id = ? AND archived = 0", [inventoryProductId, userId]);
      if (!product) return res.status(400).json({ error: "Choose an active inventory product." });
    }
    const total = subtotal + tax;
    if (!Number.isSafeInteger(total)) return res.status(400).json({ error: "The bill total is too large." });
    const id = randomUUID();
    const assignedTo = String(req.body.approver_user_id || "").trim() || null;
    if (assignedTo && (assignedTo === actorId || !(await isAccountingApprover(assignedTo, userId)))) {
      return res.status(400).json({ error: "Choose another team member who has accounting access to approve this bill." });
    }
    const status = assignedTo ? "pending_approval" : "approved";
    const ap = assignedTo ? null : await account(userId, "2000");
    const taxInput = assignedTo || !tax ? null : await account(userId, "1300");
    conn = await pool.getConnection();
    await conn.beginTransaction();
    await conn.execute(
      `INSERT INTO accounting_supplier_bills
       (id, user_id, supplier_name, supplier_reference, issue_date, due_date, expense_account_id, description,
        inventory_product_id, quantity, subtotal_cents, tax_cents, total_cents, status, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, supplier, String(req.body.supplier_reference || "").trim() || null, issueDate, dueDate, accountId,
        description, inventoryProductId, quantity, subtotal, tax, total, status, String(req.body.notes || "").trim() || null, actorId],
    );
    if (assignedTo) {
      await conn.execute(
        `INSERT INTO accounting_approvals (id, user_id, record_type, record_id, requested_by, assigned_to, request_note)
         VALUES (?, ?, 'supplier_bill', ?, ?, ?, ?)`,
        [randomUUID(), userId, id, actorId, assignedTo, String(req.body.approval_note || "").trim() || null],
      );
    } else {
      await postJournal({
        userId, actorId, date: issueDate, memo: `Supplier bill ${supplier}: ${description}`,
        reference: req.body.supplier_reference, sourceType: "supplier_bill", sourceId: id,
        lines: [
          { account_id: accountId, debit_cents: subtotal },
          ...(tax ? [{ account_id: taxInput!, debit_cents: tax }] : []),
          { account_id: ap!, credit_cents: total },
        ],
      }, conn);
      if (inventoryProductId) {
        await receiveBillInventory(conn, userId, {
          id, inventory_product_id: inventoryProductId, quantity, subtotal_cents: subtotal,
          supplier_name: supplier, supplier_reference: String(req.body.supplier_reference || "").trim() || null,
        }, actorId);
      }
    }
    await conn.commit();
    res.status(201).json(await queryOne("SELECT * FROM accounting_supplier_bills WHERE id = ? AND user_id = ?", [id, userId]));
  } catch (error: any) {
    if (conn) await conn.rollback().catch(() => {});
    res.status(400).json({ error: error.message || "Could not save supplier bill" });
  } finally { conn?.release(); }
});

accountingRouter.post("/supplier-bills/:id/payments", async (req, res) => {
  let conn: any;
  try {
    const userId = getDataOwnerId(req);
    const amount = Number(req.body.amount_cents);
    const date = day(req.body.payment_date, "");
    if (!Number.isSafeInteger(amount) || amount <= 0 || !date) return res.status(400).json({ error: "Enter a valid payment amount and date." });
    const payable = await account(userId, "2000");
    const cash = await account(userId, "1000");
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const [billRows] = await conn.execute("SELECT * FROM accounting_supplier_bills WHERE id = ? AND user_id = ? FOR UPDATE", [req.params.id, userId]);
    const bill = (billRows as any[])[0];
    if (!bill || bill.status !== "approved" && bill.status !== "partially_paid") throw new Error("Only approved supplier bills can be paid.");
    const balance = Number(bill.total_cents) - Number(bill.paid_cents);
    if (amount > balance) throw new Error("Payment exceeds the supplier bill balance.");
    const paymentId = randomUUID();
    const journalId = await postJournal({
      userId, actorId: req.session?.userId || null, date, memo: `Supplier payment: ${bill.supplier_name}`,
      reference: req.body.reference, sourceType: "supplier_bill_payment", sourceId: paymentId,
      lines: [{ account_id: payable, debit_cents: amount }, { account_id: cash, credit_cents: amount }],
    }, conn);
    await conn.execute(
      `INSERT INTO accounting_supplier_bill_payments
       (id, user_id, bill_id, payment_date, amount_cents, payment_method, reference, journal_id, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [paymentId, userId, req.params.id, date, amount, String(req.body.payment_method || "bank"), String(req.body.reference || "").trim() || null, journalId, req.session?.userId || userId],
    );
    await conn.execute(
      "UPDATE accounting_supplier_bills SET status = IF(paid_cents + ? >= total_cents, 'paid', 'partially_paid'), paid_cents = paid_cents + ? WHERE id = ? AND user_id = ?",
      [amount, amount, req.params.id, userId],
    );
    await conn.commit();
    res.json({ ok: true, id: paymentId, balance_cents: balance - amount });
  } catch (error: any) {
    if (conn) await conn.rollback().catch(() => {});
    res.status(400).json({ error: error.message || "Could not record supplier payment" });
  } finally { conn?.release(); }
});

accountingRouter.get("/supplier-bills/:id/payments", async (req, res) => {
  try {
    res.json(await queryAll(
      "SELECT * FROM accounting_supplier_bill_payments WHERE bill_id = ? AND user_id = ? ORDER BY payment_date DESC, created_at DESC",
      [req.params.id, getDataOwnerId(req)],
    ));
  } catch (error: any) { res.status(500).json({ error: error.message || "Could not load supplier bill payments" }); }
});

accountingRouter.get("/approvals", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const assignedOnly = isTeamMember(req) ? "AND (a.assigned_to IS NULL OR a.assigned_to = ?)" : "";
    res.json(await queryAll(
      `SELECT a.*, b.supplier_name, b.supplier_reference, b.total_cents, b.issue_date, b.description
       FROM accounting_approvals a LEFT JOIN accounting_supplier_bills b ON b.id = a.record_id AND b.user_id = a.user_id
       WHERE a.user_id = ? ${assignedOnly} ORDER BY a.status = 'pending' DESC, a.requested_at DESC`,
      isTeamMember(req) ? [userId, req.session?.userId] : [userId],
    ));
  } catch (error: any) { res.status(500).json({ error: error.message || "Failed to load approvals" }); }
});

accountingRouter.patch("/approvals/:id", async (req, res) => {
  let conn: any;
  try {
    const userId = getDataOwnerId(req);
    const actorId = String(req.session?.userId || "");
    const decision = String(req.body.status || "");
    if (!["approved", "rejected"].includes(decision)) return res.status(400).json({ error: "Choose approve or reject." });
    const ap = decision === "approved" ? await account(userId, "2000") : null;
    const taxInput = decision === "approved" ? await account(userId, "1300") : null;
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const [approvalRows] = await conn.execute("SELECT * FROM accounting_approvals WHERE id = ? AND user_id = ? FOR UPDATE", [req.params.id, userId]);
    const approval = (approvalRows as any[])[0];
    if (!approval || approval.status !== "pending") throw new Error("Pending approval not found.");
    if (approval.assigned_to && approval.assigned_to !== actorId) throw new Error("This approval is assigned to another team member.");
    if (approval.requested_by === actorId) throw new Error("A request cannot be approved by the person who submitted it.");
    if (approval.record_type !== "supplier_bill") throw new Error("This approval type is not supported.");
    const [billRows] = await conn.execute("SELECT * FROM accounting_supplier_bills WHERE id = ? AND user_id = ? FOR UPDATE", [approval.record_id, userId]);
    const bill = (billRows as any[])[0];
    if (!bill || bill.status !== "pending_approval") throw new Error("Supplier bill is no longer awaiting approval.");
    if (decision === "approved") {
      await postJournal({
        userId, actorId, date: day(bill.issue_date), memo: `Supplier bill ${bill.supplier_name}: ${bill.description}`,
        reference: bill.supplier_reference, sourceType: "supplier_bill", sourceId: bill.id,
        lines: [
          { account_id: bill.expense_account_id, debit_cents: Number(bill.subtotal_cents) },
          ...(Number(bill.tax_cents) ? [{ account_id: taxInput!, debit_cents: Number(bill.tax_cents) }] : []),
          { account_id: ap!, credit_cents: Number(bill.total_cents) },
        ],
      }, conn);
      await receiveBillInventory(conn, userId, bill, actorId);
      await conn.execute("UPDATE accounting_supplier_bills SET status = 'approved' WHERE id = ? AND user_id = ?", [bill.id, userId]);
    } else {
      await conn.execute("UPDATE accounting_supplier_bills SET status = 'rejected' WHERE id = ? AND user_id = ?", [bill.id, userId]);
    }
    await conn.execute(
      "UPDATE accounting_approvals SET status = ?, decision_note = ?, decided_by = ?, decided_at = NOW() WHERE id = ? AND user_id = ? AND status = 'pending'",
      [decision, String(req.body.note || "").trim() || null, actorId, req.params.id, userId],
    );
    await conn.commit();
    res.json({ ok: true });
  } catch (error: any) {
    if (conn) await conn.rollback().catch(() => {});
    res.status(400).json({ error: error.message || "Could not record approval" });
  } finally { conn?.release(); }
});

accountingRouter.post("/bank/import", upload.single("file"), async (req: any, res) => {
  try {
    const userId = getDataOwnerId(req);
    const file = req.file;
    if (!file) return res.status(400).json({ error: "Choose a CSV or Excel statement." });
    const workbook = XLSX.read(file.buffer, { type: "buffer", cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) return res.status(400).json({ error: "The uploaded statement has no worksheet." });
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false }) as Record<string, any>[];
    if (!rows.length) return res.status(400).json({ error: "The statement contains no transactions." });
    const importId = randomUUID();
    await execute("INSERT INTO accounting_bank_imports (id, user_id, file_name, imported_by) VALUES (?, ?, ?, ?)", [
      importId, userId, String(file.originalname || "statement").slice(0, 255), req.session?.userId || null,
    ]);
    let imported = 0, duplicates = 0, skipped = 0;
    for (const row of rows) {
      const normalized: Record<string, any> = {};
      for (const [key, value] of Object.entries(row)) normalized[key.toLowerCase().replace(/[^a-z0-9]/g, "")] = value;
      const dateValue = normalized.date || normalized.transactiondate || normalized.postingdate || normalized.valuedate;
      const date = day(dateValue instanceof Date ? dateValue.toISOString() : dateValue, "");
      const description = String(normalized.description || normalized.details || normalized.narrative || normalized.transactiondescription || "").trim();
      const reference = String(normalized.reference || normalized.ref || normalized.transactionid || "").trim().slice(0, 120) || null;
      const parseAmount = (value: any) => Math.round(Number(String(value || "").replace(/[R,\s]/g, "").replace(/[()]/g, (x: string) => x === "(" ? "-" : "")) * 100);
      let amount = normalized.amount !== undefined ? parseAmount(normalized.amount) : 0;
      const debit = parseAmount(normalized.debit || normalized.payment || normalized.withdrawal);
      const credit = parseAmount(normalized.credit || normalized.deposit || normalized.receipt);
      if (credit > 0 || debit > 0) amount = credit > 0 ? credit : -Math.abs(debit);
      if (!date || !description || !Number.isSafeInteger(amount) || amount === 0) { skipped++; continue; }
      const fingerprint = createHash("sha256").update(`${date}|${description.toLowerCase().replace(/\s+/g, " ").trim()}|${reference || ""}|${amount}`).digest("hex");
      const result = await execute(
        `INSERT IGNORE INTO accounting_bank_transactions
         (id, user_id, import_id, transaction_date, description, reference, amount_cents, fingerprint)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [randomUUID(), userId, importId, date, description.slice(0, 500), reference, amount, fingerprint],
      );
      if (result.affectedRows) imported++; else duplicates++;
    }
    await execute("UPDATE accounting_bank_imports SET imported_count = ?, duplicate_count = ? WHERE id = ? AND user_id = ?", [imported, duplicates, importId, userId]);
    res.json({ ok: true, import_id: importId, imported, duplicates, skipped });
  } catch (error: any) { res.status(400).json({ error: error.message || "Could not import bank statement" }); }
});

accountingRouter.get("/bank/transactions", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const status = String(req.query.status || "");
    const where = status ? "AND t.status = ?" : "";
    res.json(await queryAll(
      `SELECT t.*, b.file_name FROM accounting_bank_transactions t
       JOIN accounting_bank_imports b ON b.id = t.import_id AND b.user_id = t.user_id
       WHERE t.user_id = ? ${where} ORDER BY t.transaction_date DESC, t.created_at DESC LIMIT 1000`,
      status ? [userId, status] : [userId],
    ));
  } catch (error: any) { res.status(500).json({ error: error.message || "Could not load bank transactions" }); }
});

accountingRouter.post("/bank/transactions/:id/match", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const transaction = await queryOne("SELECT * FROM accounting_bank_transactions WHERE id = ? AND user_id = ? FOR UPDATE", [req.params.id, userId]);
    if (!transaction) return res.status(404).json({ error: "Bank transaction not found" });
    if (transaction.status !== "unmatched") return res.status(409).json({ error: "This bank transaction has already been reconciled." });
    const journal = await queryOne("SELECT id FROM accounting_journals WHERE id = ? AND user_id = ? AND status = 'posted'", [req.body.journal_id, userId]);
    if (!journal) return res.status(404).json({ error: "Journal entry not found" });
    const cashId = await account(userId, "1000");
    const impact = await queryOne(
      "SELECT COALESCE(SUM(debit_cents - credit_cents),0) AS amount FROM accounting_journal_lines WHERE journal_id = ? AND user_id = ? AND account_id = ?",
      [journal.id, userId, cashId],
    );
    if (Number(impact?.amount || 0) !== Number(transaction.amount_cents)) return res.status(400).json({ error: "The journal's bank/cash movement does not match this statement amount." });
    await execute("UPDATE accounting_bank_transactions SET status = 'matched', matched_journal_id = ? WHERE id = ? AND user_id = ?", [journal.id, transaction.id, userId]);
    res.json({ ok: true });
  } catch (error: any) { res.status(400).json({ error: error.message || "Could not match bank transaction" }); }
});

accountingRouter.post("/bank/transactions/:id/ignore", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const result = await execute("UPDATE accounting_bank_transactions SET status = 'ignored' WHERE id = ? AND user_id = ? AND status = 'unmatched'", [req.params.id, userId]);
    if (!result.affectedRows) return res.status(404).json({ error: "Unmatched bank transaction not found" });
    res.json({ ok: true });
  } catch (error: any) { res.status(500).json({ error: error.message || "Could not ignore transaction" }); }
});

accountingRouter.post("/ai-summary", async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) return res.status(503).json({ error: "AI summary is not configured." });
    const userId = getDataOwnerId(req);
    await syncLedger(userId);
    const from = String(req.body.from || `${new Date().getFullYear()}-01-01`);
    const to = String(req.body.to || new Date().toISOString().slice(0, 10));
    const [profitLoss, balanceSheet, receivables, forecast] = await Promise.all([
      (async () => {
        const rows = await accountBalances(userId, from, to);
        const income = (rows as any[]).filter((r) => r.account_type === "income").reduce((s, r) => s + Number(r.credits) - Number(r.debits), 0);
        const expenses = (rows as any[]).filter((r) => r.account_type === "expense").reduce((s, r) => s + Number(r.debits) - Number(r.credits), 0);
        return { income_cents: income, expenses_cents: expenses, profit_cents: income - expenses };
      })(),
      queryOne(
        `SELECT SUM(CASE WHEN a.account_type='asset' THEN l.debit_cents-l.credit_cents ELSE 0 END) AS assets,
                SUM(CASE WHEN a.account_type='liability' THEN l.credit_cents-l.debit_cents ELSE 0 END) AS liabilities
         FROM accounting_journals j JOIN accounting_journal_lines l ON l.journal_id=j.id AND l.user_id=j.user_id
         JOIN accounting_accounts a ON a.id=l.account_id AND a.user_id=l.user_id
         WHERE j.user_id=? AND j.status='posted' AND j.entry_date<=?`,
        [userId, to],
      ),
      queryOne(
        `SELECT COALESCE(SUM(i.total_cents -
         COALESCE((SELECT SUM(p.amount_cents) FROM invoice_payments p WHERE p.invoice_id=i.id AND p.user_id=i.user_id),0) -
         COALESCE((SELECT SUM(c.amount_cents) FROM invoice_credit_notes c WHERE c.invoice_id=i.id AND c.user_id=i.user_id AND c.status='issued'),0)),0) AS open_cents
         FROM invoices i WHERE i.user_id=? AND i.type='invoice' AND i.status<>'void'`,
        [userId],
      ),
      queryOne(
        `SELECT COALESCE(SUM(CASE WHEN a.code='1000' THEN l.debit_cents-l.credit_cents ELSE 0 END),0) AS cash_cents
         FROM accounting_journals j JOIN accounting_journal_lines l ON l.journal_id=j.id AND l.user_id=j.user_id
         JOIN accounting_accounts a ON a.id=l.account_id AND a.user_id=l.user_id
         WHERE j.user_id=? AND j.status='posted'`,
        [userId],
      ),
    ]);
    const client = new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY, baseURL: "https://openrouter.ai/api/v1" });
    const answer = await client.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash",
      temperature: 0.2, max_tokens: 700,
      messages: [
        { role: "system", content: "Write a concise, plain-language business finance summary from the supplied figures. Do not invent causes, tax advice, or certainty. Flag missing or unusual data and distinguish actual results from forecasts." },
        { role: "user", content: JSON.stringify({ period: { from, to }, profit_and_loss: profitLoss, balance_sheet: balanceSheet, open_receivables_cents: Number(receivables?.open_cents || 0), cash_balance_cents: Number(forecast?.cash_cents || 0) }) },
      ],
    });
    res.json({ summary: answer.choices[0]?.message?.content || "No summary returned." });
  } catch (error: any) { res.status(500).json({ error: error.message || "Could not create financial summary" }); }
});
