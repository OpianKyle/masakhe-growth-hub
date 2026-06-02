import { Router } from "express";
import { queryOne, queryAll, execute } from "./db";
import { requireAuth, getDataOwnerId } from "./auth";
import { randomUUID } from "crypto";
import multer from "multer";

export const clientsRouter = Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// ── List clients ──────────────────────────────────────────────────────────────
clientsRouter.get("/", requireAuth, async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const clients = await queryAll(
      `SELECT id, full_name, id_number, email, phone, employment_status,
              monthly_income_cents, risk_profile, policy_number, status,
              date_of_birth, gender, marital_status, occupation, credit_score,
              whatsapp, physical_address, postal_address, employer_name, dependants,
              property_interest, notes,
              business_name, business_registration, vat_number, business_type,
              business_website, business_email, business_phone, business_whatsapp, business_address,
              client_type, created_at, updated_at
       FROM broker_clients WHERE user_id = ? ORDER BY full_name ASC`,
      [userId]
    );
    res.json(clients);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Platform registered users (admin only) ────────────────────────────────────
clientsRouter.get("/platform-users", requireAuth, async (req, res) => {
  try {
    const requestingUser = await queryOne("SELECT role FROM users WHERE id = ?", [req.session.userId]);
    if (!requestingUser || requestingUser.role !== "admin") {
      return res.status(403).json({ error: "Admin only" });
    }
    const users = await queryAll(
      `SELECT u.id, u.full_name, u.email, u.created_at,
              bp.business_name, bp.trading_name, bp.business_type,
              bp.phone AS business_phone, bp.email AS business_email,
              bp.physical_address AS business_address,
              bp.phone AS phone
       FROM users u
       LEFT JOIN business_profiles bp ON bp.user_id = u.id
       WHERE u.role = 'user'
       ORDER BY u.full_name ASC`,
      []
    );
    console.log(`[Platform Users] Returning ${users.length} users`);
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Lightweight client list for invoice/quote picker ──────────────────────────
clientsRouter.get("/for-invoice", requireAuth, async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const requestingUser = await queryOne("SELECT role FROM users WHERE id = ?", [req.session.userId]);
    const isAdminNotImpersonating = requestingUser?.role === "admin" && !(req.session as any).actingAsOwnerId;

    const clients = isAdminNotImpersonating
      ? await queryAll(
          `SELECT u.id,
                  u.full_name,
                  COALESCE(bp.business_name, '') AS business_name,
                  u.email,
                  COALESCE(bp.email, u.email) AS business_email,
                  u.phone,
                  bp.phone AS business_phone,
                  bp.physical_address,
                  bp.physical_address AS business_address,
                  bp.vat_number,
                  CASE WHEN bp.business_name IS NOT NULL THEN 'business' ELSE 'individual' END AS client_type,
                  NULL AS owner_name
           FROM users u
           LEFT JOIN business_profiles bp ON bp.user_id = u.id
           WHERE u.role = 'user'
           ORDER BY u.full_name ASC`,
          []
        )
      : await queryAll(
          `SELECT id, full_name, business_name, email, business_email, phone, business_phone,
                  physical_address, business_address, vat_number, client_type
           FROM broker_clients WHERE user_id = ? ORDER BY full_name ASC`,
          [userId]
        );

    res.json(clients);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Stats ─────────────────────────────────────────────────────────────────────
clientsRouter.get("/stats", requireAuth, async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const [total, active, prospects, inactive] = await Promise.all([
      queryOne("SELECT COUNT(*) as count FROM broker_clients WHERE user_id = ?", [userId]),
      queryOne("SELECT COUNT(*) as count FROM broker_clients WHERE user_id = ? AND status = 'active'", [userId]),
      queryOne("SELECT COUNT(*) as count FROM broker_clients WHERE user_id = ? AND status = 'prospect'", [userId]),
      queryOne("SELECT COUNT(*) as count FROM broker_clients WHERE user_id = ? AND status = 'inactive'", [userId]),
    ]);
    res.json({ total: total?.count || 0, active: active?.count || 0, prospects: prospects?.count || 0, inactive: inactive?.count || 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Export CSV ────────────────────────────────────────────────────────────────
clientsRouter.get("/export", requireAuth, async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const clients = await queryAll(
      `SELECT full_name, id_number, date_of_birth, gender, marital_status, email, phone, whatsapp,
              physical_address, postal_address, employment_status, employer_name, occupation,
              monthly_income_cents, dependants, risk_profile, credit_score, policy_number,
              property_interest, status, notes
       FROM broker_clients WHERE user_id = ? ORDER BY full_name ASC`,
      [userId]
    );

    const escape = (v: any) => {
      if (v == null) return "";
      const s = String(v).replace(/"/g, '""');
      return s.includes(",") || s.includes("\n") || s.includes('"') ? `"${s}"` : s;
    };

    const headers = [
      "Full Name","ID Number","Date of Birth","Gender","Marital Status","Email","Phone","WhatsApp",
      "Physical Address","Postal Address","Employment Status","Employer","Occupation",
      "Monthly Income (ZAR)","Dependants","Risk Profile","Credit Score","Policy Number",
      "Property Interest","Status","Notes"
    ];

    const rows = clients.map((c: any) => [
      escape(c.full_name), escape(c.id_number), escape(c.date_of_birth), escape(c.gender),
      escape(c.marital_status), escape(c.email), escape(c.phone), escape(c.whatsapp),
      escape(c.physical_address), escape(c.postal_address), escape(c.employment_status),
      escape(c.employer_name), escape(c.occupation),
      escape(c.monthly_income_cents ? (c.monthly_income_cents / 100).toFixed(2) : ""),
      escape(c.dependants), escape(c.risk_profile), escape(c.credit_score),
      escape(c.policy_number), escape(c.property_interest), escape(c.status), escape(c.notes),
    ].join(","));

    const csv = [headers.join(","), ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="clients-${Date.now()}.csv"`);
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Import CSV ────────────────────────────────────────────────────────────────
clientsRouter.post("/import", requireAuth, async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const { rows } = req.body as { rows: any[] };
    if (!Array.isArray(rows) || rows.length === 0) return res.status(400).json({ error: "No rows provided" });

    let imported = 0;
    let skipped = 0;
    for (const row of rows) {
      const name = (row["Full Name"] || row["full_name"] || "").trim();
      if (!name) { skipped++; continue; }
      const id = randomUUID();
      const rawIncome = row["Monthly Income (ZAR)"] || row["monthly_income"] || "";
      const incomeCents = rawIncome ? Math.round(parseFloat(rawIncome) * 100) : 0;
      await execute(
        `INSERT INTO broker_clients
         (id, user_id, full_name, id_number, date_of_birth, gender, marital_status, email, phone, whatsapp,
          physical_address, postal_address, employment_status, employer_name, occupation,
          monthly_income_cents, dependants, risk_profile, credit_score, policy_number, property_interest, status, notes)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          id, userId, name,
          row["ID Number"] || row["id_number"] || null,
          row["Date of Birth"] || row["date_of_birth"] || null,
          row["Gender"] || row["gender"] || null,
          row["Marital Status"] || row["marital_status"] || null,
          row["Email"] || row["email"] || null,
          row["Phone"] || row["phone"] || null,
          row["WhatsApp"] || row["whatsapp"] || null,
          row["Physical Address"] || row["physical_address"] || null,
          row["Postal Address"] || row["postal_address"] || null,
          row["Employment Status"] || row["employment_status"] || null,
          row["Employer"] || row["employer_name"] || null,
          row["Occupation"] || row["occupation"] || null,
          incomeCents,
          parseInt(row["Dependants"] || row["dependants"] || "0") || 0,
          row["Risk Profile"] || row["risk_profile"] || "medium",
          row["Credit Score"] ? parseInt(row["Credit Score"]) : null,
          row["Policy Number"] || row["policy_number"] || null,
          row["Property Interest"] || row["property_interest"] || null,
          (row["Status"] || row["status"] || "prospect").toLowerCase(),
          row["Notes"] || row["notes"] || null,
        ]
      );
      imported++;
    }
    res.json({ ok: true, imported, skipped });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get single client ─────────────────────────────────────────────────────────
clientsRouter.get("/:id", requireAuth, async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const client = await queryOne("SELECT * FROM broker_clients WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json(client);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Invoice history for a client ──────────────────────────────────────────────
clientsRouter.get("/:id/invoices", requireAuth, async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const client = await queryOne(
      "SELECT id, email, business_email FROM broker_clients WHERE id = ? AND user_id = ?",
      [req.params.id, userId]
    );
    if (!client) return res.status(404).json({ error: "Client not found" });

    const emails: string[] = [];
    if (client.email) emails.push(client.email);
    if (client.business_email && client.business_email !== client.email) emails.push(client.business_email);

    let invoices: any[] = [];
    if (emails.length > 0) {
      const placeholders = emails.map(() => "?").join(",");
      invoices = await queryAll(
        `SELECT id, invoice_number, customer_name, customer_email, total_cents, vat_cents,
                vat_enabled, status, type, template, created_at, paid_at, due_date
         FROM invoices
         WHERE user_id = ? AND (client_id = ? OR customer_email IN (${placeholders}))
         ORDER BY created_at DESC`,
        [userId, req.params.id, ...emails]
      );
    } else {
      invoices = await queryAll(
        `SELECT id, invoice_number, customer_name, customer_email, total_cents, vat_cents,
                vat_enabled, status, type, template, created_at, paid_at, due_date
         FROM invoices
         WHERE user_id = ? AND client_id = ?
         ORDER BY created_at DESC`,
        [userId, req.params.id]
      );
    }

    const monthlyMap: Record<string, { month: string; count: number; total_cents: number; paid_cents: number }> = {};
    for (const inv of invoices) {
      const key = (inv.created_at || "").slice(0, 7);
      if (!monthlyMap[key]) {
        const d = new Date(inv.created_at);
        monthlyMap[key] = {
          month: d.toLocaleDateString("en-ZA", { month: "long", year: "numeric" }),
          count: 0,
          total_cents: 0,
          paid_cents: 0,
        };
      }
      monthlyMap[key].count++;
      monthlyMap[key].total_cents += inv.total_cents || 0;
      if (inv.paid_at) monthlyMap[key].paid_cents += inv.total_cents || 0;
    }

    const monthly = Object.entries(monthlyMap)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([, v]) => v);

    res.json({ invoices: invoices.map((inv: any) => ({ ...inv, vat_enabled: !!inv.vat_enabled })), monthly });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Create client ─────────────────────────────────────────────────────────────
clientsRouter.post("/", requireAuth, async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const {
      full_name, id_number, date_of_birth, gender, marital_status, email, phone, whatsapp,
      physical_address, postal_address, employment_status, employer_name, occupation,
      monthly_income, dependants, risk_profile, credit_score, policy_number,
      property_interest, status, notes, client_type,
      business_name, business_registration, vat_number, business_type,
      business_website, business_email, business_phone, business_whatsapp, business_address,
    } = req.body;
    if (!full_name) return res.status(400).json({ error: client_type === "business" ? "Contact person name is required" : "Full name is required" });

    const id = randomUUID();
    await execute(
      `INSERT INTO broker_clients
       (id, user_id, full_name, id_number, date_of_birth, gender, marital_status, email, phone, whatsapp,
        physical_address, postal_address, employment_status, employer_name, occupation,
        monthly_income_cents, dependants, risk_profile, credit_score, policy_number, property_interest, status, notes,
        client_type, business_name, business_registration, vat_number, business_type,
        business_website, business_email, business_phone, business_whatsapp, business_address)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id, userId, full_name, id_number || null, date_of_birth || null, gender || null,
        marital_status || null, email || null, phone || null, whatsapp || null,
        physical_address || null, postal_address || null, employment_status || null,
        employer_name || null, occupation || null,
        monthly_income ? Math.round(parseFloat(monthly_income) * 100) : 0,
        dependants || 0, risk_profile || "medium",
        credit_score ? parseInt(credit_score) : null,
        policy_number || null, property_interest || null, status || "prospect", notes || null,
        client_type || "personal",
        business_name || null, business_registration || null, vat_number || null, business_type || null,
        business_website || null, business_email || null, business_phone || null, business_whatsapp || null, business_address || null,
      ]
    );
    res.json({ ok: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Update client ─────────────────────────────────────────────────────────────
clientsRouter.put("/:id", requireAuth, async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const existing = await queryOne("SELECT id FROM broker_clients WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!existing) return res.status(404).json({ error: "Client not found" });

    const {
      full_name, id_number, date_of_birth, gender, marital_status, email, phone, whatsapp,
      physical_address, postal_address, employment_status, employer_name, occupation,
      monthly_income, dependants, risk_profile, credit_score, policy_number,
      property_interest, status, notes, client_type,
      business_name, business_registration, vat_number, business_type,
      business_website, business_email, business_phone, business_whatsapp, business_address,
    } = req.body;

    await execute(
      `UPDATE broker_clients SET
       full_name=?, id_number=?, date_of_birth=?, gender=?, marital_status=?, email=?, phone=?, whatsapp=?,
       physical_address=?, postal_address=?, employment_status=?, employer_name=?, occupation=?,
       monthly_income_cents=?, dependants=?, risk_profile=?, credit_score=?, policy_number=?,
       property_interest=?, status=?, notes=?, client_type=?,
       business_name=?, business_registration=?, vat_number=?, business_type=?,
       business_website=?, business_email=?, business_phone=?, business_whatsapp=?, business_address=?,
       updated_at=NOW()
       WHERE id = ?`,
      [
        full_name, id_number || null, date_of_birth || null, gender || null,
        marital_status || null, email || null, phone || null, whatsapp || null,
        physical_address || null, postal_address || null, employment_status || null,
        employer_name || null, occupation || null,
        monthly_income ? Math.round(parseFloat(monthly_income) * 100) : 0,
        dependants || 0, risk_profile || "medium",
        credit_score ? parseInt(credit_score) : null,
        policy_number || null, property_interest || null, status || "prospect", notes || null,
        client_type || "personal",
        business_name || null, business_registration || null, vat_number || null, business_type || null,
        business_website || null, business_email || null, business_phone || null, business_whatsapp || null, business_address || null,
        req.params.id,
      ]
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Delete client ─────────────────────────────────────────────────────────────
clientsRouter.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const existing = await queryOne("SELECT id FROM broker_clients WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!existing) return res.status(404).json({ error: "Client not found" });
    await execute("DELETE FROM broker_clients WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── List documents for a client ───────────────────────────────────────────────
clientsRouter.get("/:id/documents", requireAuth, async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const client = await queryOne("SELECT id FROM broker_clients WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!client) return res.status(404).json({ error: "Client not found" });
    const docs = await queryAll(
      "SELECT id, document_name, document_type, file_size, mime_type, created_at FROM broker_client_documents WHERE client_id = ? ORDER BY created_at DESC",
      [req.params.id]
    );
    res.json(docs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Upload document ───────────────────────────────────────────────────────────
clientsRouter.post("/:id/documents", requireAuth, upload.single("file"), async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const client = await queryOne("SELECT id FROM broker_clients WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!client) return res.status(404).json({ error: "Client not found" });
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const mimeType = req.file.mimetype;
    const base64 = req.file.buffer.toString("base64");
    const fileData = `data:${mimeType};base64,${base64}`;

    const id = randomUUID();
    await execute(
      `INSERT INTO broker_client_documents (id, client_id, user_id, document_name, document_type, file_data, file_size, mime_type)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        id, req.params.id, userId,
        req.body.document_name || req.file.originalname,
        req.body.document_type || "other",
        fileData,
        req.file.size,
        mimeType,
      ]
    );
    res.json({ ok: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Download / view document ──────────────────────────────────────────────────
clientsRouter.get("/:id/documents/:docId", requireAuth, async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const client = await queryOne("SELECT id FROM broker_clients WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!client) return res.status(404).json({ error: "Client not found" });
    const doc = await queryOne("SELECT * FROM broker_client_documents WHERE id = ? AND client_id = ?", [req.params.docId, req.params.id]);
    if (!doc) return res.status(404).json({ error: "Document not found" });
    res.json(doc);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Delete document ───────────────────────────────────────────────────────────
clientsRouter.delete("/:id/documents/:docId", requireAuth, async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const client = await queryOne("SELECT id FROM broker_clients WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!client) return res.status(404).json({ error: "Client not found" });
    await execute("DELETE FROM broker_client_documents WHERE id = ? AND client_id = ?", [req.params.docId, req.params.id]);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
