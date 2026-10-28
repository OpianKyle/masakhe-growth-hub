import { Router } from "express";
import { randomUUID } from "crypto";
import { pool, queryAll, queryOne, execute } from "./db";
import { getDataOwnerId, requireAuth } from "./auth";

export const commercialDocumentsRouter = Router();
export const quotePublicRouter = Router();
commercialDocumentsRouter.use(requireAuth);

export async function runCommercialDocumentMigrations() {
  await execute(`
    CREATE TABLE IF NOT EXISTS commercial_document_settings (
      user_id VARCHAR(36) PRIMARY KEY,
      default_tax_enabled TINYINT(1) NOT NULL DEFAULT 1,
      tax_rate DECIMAL(5,2) NOT NULL DEFAULT 15.00,
      tax_label VARCHAR(40) NOT NULL DEFAULT 'VAT',
      invoice_prefix VARCHAR(20) NOT NULL DEFAULT 'INV',
      quote_prefix VARCHAR(20) NOT NULL DEFAULT 'QUO',
      receipt_prefix VARCHAR(20) NOT NULL DEFAULT 'REC',
      default_payment_terms VARCHAR(100) NOT NULL DEFAULT '30 days',
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);
  await execute(`
    CREATE TABLE IF NOT EXISTS document_sequences (
      user_id VARCHAR(36) NOT NULL,
      doc_type VARCHAR(20) NOT NULL,
      period_year INT NOT NULL,
      next_number INT NOT NULL DEFAULT 1,
      PRIMARY KEY (user_id, doc_type, period_year)
    ) ENGINE=InnoDB
  `);
  await execute(`
    CREATE TABLE IF NOT EXISTS document_catalog_items (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      item_type ENUM('product','service') NOT NULL DEFAULT 'service',
      code VARCHAR(80) NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT NULL,
      unit VARCHAR(40) NOT NULL DEFAULT 'unit',
      unit_price_cents INT NOT NULL DEFAULT 0,
      archived TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_doc_catalog_user (user_id, archived)
    ) ENGINE=InnoDB
  `);
  await execute(`
    CREATE TABLE IF NOT EXISTS invoice_revisions (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      invoice_id VARCHAR(36) NOT NULL,
      revision_number INT NOT NULL,
      snapshot_json LONGTEXT NOT NULL,
      changed_by VARCHAR(36) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_invoice_revision (invoice_id, revision_number),
      INDEX idx_revision_user_doc (user_id, invoice_id, created_at)
    ) ENGINE=InnoDB
  `);
  await execute(`
    CREATE TABLE IF NOT EXISTS invoice_payments (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      invoice_id VARCHAR(36) NOT NULL,
      receipt_number VARCHAR(50) NOT NULL,
      amount_cents INT NOT NULL,
      payment_method VARCHAR(50) NOT NULL DEFAULT 'other',
      reference VARCHAR(255) NULL,
      notes TEXT NULL,
      paid_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_receipt_number (user_id, receipt_number),
      INDEX idx_invoice_payments (user_id, invoice_id, paid_at)
    ) ENGINE=InnoDB
  `);
  await execute(`
    CREATE TABLE IF NOT EXISTS invoice_credit_notes (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      invoice_id VARCHAR(36) NOT NULL,
      credit_number VARCHAR(50) NOT NULL,
      amount_cents INT NOT NULL,
      reason TEXT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'issued',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_credit_number (user_id, credit_number),
      INDEX idx_invoice_credit_notes (user_id, invoice_id, created_at)
    ) ENGINE=InnoDB
  `);
  await execute(`
    CREATE TABLE IF NOT EXISTS invoice_audit_log (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      invoice_id VARCHAR(36) NOT NULL,
      actor_user_id VARCHAR(36) NULL,
      action VARCHAR(60) NOT NULL,
      details_json LONGTEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_invoice_audit (user_id, invoice_id, created_at)
    ) ENGINE=InnoDB
  `);

  const columns: Record<string, string> = {
    acceptance_token: "VARCHAR(64) NULL",
    accepted_at: "DATETIME NULL",
    converted_to_invoice_id: "VARCHAR(36) NULL",
    converted_from_quote_id: "VARCHAR(36) NULL",
    revision_number: "INT NOT NULL DEFAULT 0",
    tax_rate: "DECIMAL(5,2) NOT NULL DEFAULT 15.00",
    tax_label: "VARCHAR(40) NULL",
    payment_merchant_amount_cents: "INT NULL",
  };
  for (const [column, definition] of Object.entries(columns)) {
    const current = await queryOne(
      "SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'invoices' AND COLUMN_NAME = ?",
      [column],
    );
    if (Number(current?.count || 0) > 0) continue;
    try {
      await execute(`ALTER TABLE invoices ADD COLUMN ${column} ${definition}`);
    } catch (error) {
      const afterAttempt = await queryOne(
        "SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'invoices' AND COLUMN_NAME = ?",
        [column],
      );
      if (Number(afterAttempt?.count || 0) === 0) throw error;
    }
  }
  console.log("[Commercial Documents] Migrations complete");
}

export async function getDocumentSettings(userId: string) {
  await execute("INSERT IGNORE INTO commercial_document_settings (user_id) VALUES (?)", [userId]);
  return await queryOne("SELECT * FROM commercial_document_settings WHERE user_id = ?", [userId]);
}

export async function allocateDocumentNumber(
  userId: string,
  docType: "invoice" | "quote" | "receipt" | "credit",
  customStart?: number,
) {
  const settings = await getDocumentSettings(userId);
  const prefix = docType === "invoice" ? settings.invoice_prefix
    : docType === "quote" ? settings.quote_prefix
    : docType === "receipt" ? settings.receipt_prefix
    : "CN";
  const year = new Date().getFullYear();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [sequenceRows] = await conn.execute(
      "SELECT next_number FROM document_sequences WHERE user_id = ? AND doc_type = ? AND period_year = ? FOR UPDATE",
      [userId, docType, year],
    );
    const sequence = (sequenceRows as any[])[0];
    let number: number;
    if (sequence) {
      number = Number(sequence.next_number);
      if (customStart && Number.isInteger(customStart) && customStart > number) number = customStart;
      await conn.execute(
        "UPDATE document_sequences SET next_number = ? WHERE user_id = ? AND doc_type = ? AND period_year = ?",
        [number + 1, userId, docType, year],
      );
    } else {
      const invoiceType = docType === "invoice" ? "invoice" : docType === "quote" ? "quote" : null;
      let existingNumbers: any[] = [];
      if (invoiceType) {
        const [rows] = await conn.execute(
          "SELECT invoice_number FROM invoices WHERE user_id = ? AND type = ?",
          [userId, invoiceType],
        );
        existingNumbers = rows as any[];
      } else if (docType === "receipt") {
        const [rows] = await conn.execute(
          "SELECT receipt_number AS invoice_number FROM invoice_payments WHERE user_id = ?",
          [userId],
        );
        existingNumbers = rows as any[];
      } else {
        const [rows] = await conn.execute(
          "SELECT credit_number AS invoice_number FROM invoice_credit_notes WHERE user_id = ?",
          [userId],
        );
        existingNumbers = rows as any[];
      }
      const numberPattern = new RegExp(`^(?:${prefix}|${docType === "invoice" ? "INV" : prefix})-${year}-(\\d+)$`);
      const maxExisting = existingNumbers.reduce((max, row) => {
        const match = String(row.invoice_number || "").match(numberPattern);
        return match ? Math.max(max, Number(match[1])) : max;
      }, 0);
      let legacyNext = 1;
      if (docType === "invoice") {
        const [userRows] = await conn.execute("SELECT invoice_next_seq FROM users WHERE id = ?", [userId]);
        const legacy = (userRows as any[])[0]?.invoice_next_seq;
        if (legacy != null) legacyNext = Number(legacy) || 1;
      }
      number = Math.max(1, maxExisting + 1, legacyNext);
      if (customStart && Number.isInteger(customStart) && customStart > number && existingNumbers.length === 0) number = customStart;
      await conn.execute(
        "INSERT INTO document_sequences (user_id, doc_type, period_year, next_number) VALUES (?, ?, ?, ?)",
        [userId, docType, year, number + 1],
      );
    }
    await conn.commit();
    return `${prefix}-${year}-${String(number).padStart(3, "0")}`;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function writeInvoiceAudit(
  userId: string,
  invoiceId: string,
  actorUserId: string | null,
  action: string,
  details?: unknown,
) {
  await execute(
    `INSERT INTO invoice_audit_log (id, user_id, invoice_id, actor_user_id, action, details_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [randomUUID(), userId, invoiceId, actorUserId, action, details == null ? null : JSON.stringify(details)],
  );
}

commercialDocumentsRouter.get("/settings", async (req, res) => {
  try {
    res.json(await getDocumentSettings(getDataOwnerId(req)));
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to load document settings" });
  }
});

commercialDocumentsRouter.put("/settings", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const current = await getDocumentSettings(userId);
    const taxRate = Number(req.body.tax_rate);
    const prefixes = ["invoice_prefix", "quote_prefix", "receipt_prefix"] as const;
    const values: Record<string, string> = {};
    for (const key of prefixes) {
      const value = String(req.body[key] ?? current[key]).trim().toUpperCase();
      if (!/^[A-Z0-9]{1,10}$/.test(value)) return res.status(400).json({ error: `${key.replace("_", " ")} must be 1–10 letters or numbers` });
      values[key] = value;
    }
    if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
      return res.status(400).json({ error: "Tax rate must be between 0 and 100 percent" });
    }
    const taxLabel = String(req.body.tax_label ?? current.tax_label).trim().slice(0, 40) || "Tax";
    const terms = String(req.body.default_payment_terms ?? current.default_payment_terms).trim().slice(0, 100) || "30 days";
    await execute(
      `UPDATE commercial_document_settings
       SET default_tax_enabled = ?, tax_rate = ?, tax_label = ?, invoice_prefix = ?, quote_prefix = ?,
           receipt_prefix = ?, default_payment_terms = ?
       WHERE user_id = ?`,
      [
        req.body.default_tax_enabled ? 1 : 0, taxRate, taxLabel, values.invoice_prefix,
        values.quote_prefix, values.receipt_prefix, terms, userId,
      ],
    );
    res.json(await getDocumentSettings(userId));
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to save document settings" });
  }
});

commercialDocumentsRouter.get("/catalog", async (req, res) => {
  try {
    res.json(await queryAll(
      "SELECT * FROM document_catalog_items WHERE user_id = ? AND archived = 0 ORDER BY name ASC",
      [getDataOwnerId(req)],
    ));
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to load catalogue" });
  }
});

commercialDocumentsRouter.post("/catalog", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const { item_type, code, name, description, unit, unit_price } = req.body;
    const price = Number(unit_price);
    if (!String(name || "").trim()) return res.status(400).json({ error: "Item name is required" });
    if (!Number.isFinite(price) || price < 0) return res.status(400).json({ error: "Unit price must be zero or greater" });
    const id = randomUUID();
    await execute(
      `INSERT INTO document_catalog_items
       (id, user_id, item_type, code, name, description, unit, unit_price_cents, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [id, userId, item_type === "product" ? "product" : "service", String(code || "").trim() || null,
        String(name).trim(), String(description || "").trim() || null, String(unit || "unit").trim(),
        Math.round(price * 100)],
    );
    res.json({ ok: true, id });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create catalogue item" });
  }
});

commercialDocumentsRouter.put("/catalog/:id", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const { item_type, code, name, description, unit, unit_price } = req.body;
    const price = Number(unit_price);
    if (!String(name || "").trim()) return res.status(400).json({ error: "Item name is required" });
    if (!Number.isFinite(price) || price < 0) return res.status(400).json({ error: "Unit price must be zero or greater" });
    const result = await execute(
      `UPDATE document_catalog_items SET item_type = ?, code = ?, name = ?, description = ?, unit = ?, unit_price_cents = ?
       WHERE id = ? AND user_id = ? AND archived = 0`,
      [item_type === "product" ? "product" : "service", String(code || "").trim() || null, String(name).trim(),
        String(description || "").trim() || null, String(unit || "unit").trim(), Math.round(price * 100),
        req.params.id, userId],
    );
    if (!(result as any).affectedRows) return res.status(404).json({ error: "Catalogue item not found" });
    res.json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update catalogue item" });
  }
});

commercialDocumentsRouter.delete("/catalog/:id", async (req, res) => {
  try {
    const result = await execute(
      "UPDATE document_catalog_items SET archived = 1 WHERE id = ? AND user_id = ?",
      [req.params.id, getDataOwnerId(req)],
    );
    if (!(result as any).affectedRows) return res.status(404).json({ error: "Catalogue item not found" });
    res.json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to archive catalogue item" });
  }
});

quotePublicRouter.get("/:token", async (req, res) => {
  try {
    const quote = await queryOne(
      `SELECT i.id, i.invoice_number, i.customer_name, i.total_cents, i.vat_enabled, i.vat_cents, i.tax_rate, i.tax_label,
              i.items_json, i.status, i.created_at, i.valid_until, i.payment_terms, i.notes, i.accepted_at,
              COALESCE(bp.business_name, u.full_name) AS business_name
       FROM invoices i JOIN users u ON u.id = i.user_id
       LEFT JOIN business_profiles bp ON bp.user_id = u.id
       WHERE i.acceptance_token = ? AND i.type = 'quote'`,
      [req.params.token],
    );
    if (!quote || quote.status === "void") return res.status(404).json({ error: "Quote not found or no longer available" });
    res.json({
      id: quote.id,
      number: quote.invoice_number,
      customer_name: quote.customer_name,
      total_cents: Number(quote.total_cents),
      vat_enabled: !!quote.vat_enabled,
      vat_cents: Number(quote.vat_cents || 0),
      tax_rate: Number(quote.tax_rate ?? 15),
      tax_label: quote.tax_label || "VAT",
      items: JSON.parse(quote.items_json || "[]"),
      status: quote.status,
      created_at: quote.created_at,
      valid_until: quote.valid_until,
      payment_terms: quote.payment_terms,
      notes: quote.notes,
      accepted_at: quote.accepted_at,
      business_name: quote.business_name || "Business",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to load quote" });
  }
});

quotePublicRouter.post("/:token/accept", async (req, res) => {
  try {
    const quote = await queryOne(
      "SELECT id, user_id, invoice_number, status, accepted_at FROM invoices WHERE acceptance_token = ? AND type = 'quote'",
      [req.params.token],
    );
    if (!quote || quote.status === "void" || quote.status === "converted") {
      return res.status(404).json({ error: "This quote is no longer available to accept" });
    }
    if (quote.status === "accepted" || quote.accepted_at) return res.json({ ok: true, alreadyAccepted: true });
    await execute(
      "UPDATE invoices SET status = 'accepted', accepted_at = NOW() WHERE id = ? AND user_id = ? AND type = 'quote'",
      [quote.id, quote.user_id],
    );
    await writeInvoiceAudit(quote.user_id, quote.id, null, "quote_accepted", { invoice_number: quote.invoice_number });
    res.json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to accept quote" });
  }
});
