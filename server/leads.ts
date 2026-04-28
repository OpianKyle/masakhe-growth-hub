import { Router } from "express";
import { queryOne, queryAll, execute } from "./db";
import { requireAuth, getDataOwnerId } from "./auth";
import { randomUUID } from "crypto";
import { sendLeadAutoreply, sendNewLeadNotification } from "./automations";

export const leadsRouter = Router();

leadsRouter.post("/submit", async (req, res) => {
  try {
    const { websiteId, vehicleId, name, email, phone, message, source, notifyEmail } = req.body;
    if (!websiteId || !name) {
      return res.status(400).json({ error: "Website ID and name are required" });
    }

    const website = await queryOne("SELECT owner_id FROM websites WHERE id = ?", [websiteId]);
    if (!website) return res.status(404).json({ error: "Website not found" });

    const id = randomUUID();
    await execute(
      `INSERT INTO website_leads (id, website_id, user_id, vehicle_id, name, email, phone, message, source)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [id, websiteId, website.owner_id, vehicleId || null, name, email || null, phone || null, message || null, source || "contact_form"]
    );

    // Fire auto-reply to the visitor (non-blocking)
    if (email) {
      sendLeadAutoreply(id).catch(() => {});
    }

    // Notify the business owner / configured recipient (non-blocking)
    const recipient = (notifyEmail && typeof notifyEmail === "string" && /\S+@\S+\.\S+/.test(notifyEmail))
      ? notifyEmail.trim()
      : null;
    if (recipient) {
      sendNewLeadNotification(id, recipient).catch(() => {});
    }

    res.json({ ok: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

leadsRouter.get("/", requireAuth, async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const websiteId = req.query.websiteId as string;
    let leads;
    if (websiteId) {
      leads = await queryAll(
        `SELECT wl.*, vl.make as vehicle_make, vl.model as vehicle_model, vl.year as vehicle_year
         FROM website_leads wl
         LEFT JOIN vehicle_listings vl ON vl.id = wl.vehicle_id
         WHERE wl.user_id = ? AND wl.website_id = ?
         ORDER BY wl.created_at DESC`,
        [userId, websiteId]
      );
    } else {
      leads = await queryAll(
        `SELECT wl.*, vl.make as vehicle_make, vl.model as vehicle_model, vl.year as vehicle_year
         FROM website_leads wl
         LEFT JOIN vehicle_listings vl ON vl.id = wl.vehicle_id
         WHERE wl.user_id = ?
         ORDER BY wl.created_at DESC`,
        [userId]
      );
    }
    res.json(leads);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

leadsRouter.patch("/:id", requireAuth, async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const existing = await queryOne("SELECT id FROM website_leads WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!existing) return res.status(404).json({ error: "Lead not found" });

    const { status, notes } = req.body;
    const updates: string[] = [];
    const values: any[] = [];

    if (status) { updates.push("status = ?"); values.push(status); }
    if (notes !== undefined) { updates.push("notes = ?"); values.push(notes); }
    updates.push("updated_at = NOW()");

    if (updates.length > 1) {
      values.push(req.params.id);
      await execute(`UPDATE website_leads SET ${updates.join(", ")} WHERE id = ?`, values);
    }
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

leadsRouter.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const existing = await queryOne("SELECT id FROM website_leads WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!existing) return res.status(404).json({ error: "Lead not found" });
    await execute("DELETE FROM website_leads WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

leadsRouter.get("/export", requireAuth, async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const leads = await queryAll(
      `SELECT wl.name, wl.email, wl.phone, wl.message, wl.source, wl.status, wl.notes,
              wl.created_at, vl.make as vehicle_make, vl.model as vehicle_model, vl.year as vehicle_year
       FROM website_leads wl
       LEFT JOIN vehicle_listings vl ON vl.id = wl.vehicle_id
       WHERE wl.user_id = ? ORDER BY wl.created_at DESC`,
      [userId]
    );
    const esc = (v: any) => {
      if (v == null) return "";
      const s = String(v).replace(/"/g, '""');
      return s.includes(",") || s.includes("\n") || s.includes('"') ? `"${s}"` : s;
    };
    const headers = ["Name","Email","Phone","Message","Source","Status","Notes","Vehicle","Date"];
    const rows = leads.map((l: any) => {
      const veh = [l.vehicle_year, l.vehicle_make, l.vehicle_model].filter(Boolean).join(" ");
      return [esc(l.name),esc(l.email),esc(l.phone),esc(l.message),esc(l.source),esc(l.status),esc(l.notes),esc(veh),esc(l.created_at)].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="leads-${Date.now()}.csv"`);
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

leadsRouter.post("/import", requireAuth, async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const { rows, websiteId } = req.body as { rows: any[]; websiteId?: string };
    if (!Array.isArray(rows) || rows.length === 0) return res.status(400).json({ error: "No rows provided" });

    let wId = websiteId;
    if (!wId) {
      const site = await queryOne("SELECT id FROM websites WHERE owner_id = ? LIMIT 1", [userId]);
      wId = site?.id;
    }
    if (!wId) return res.status(400).json({ error: "No website found. Please create a website first." });

    let imported = 0; let skipped = 0;
    for (const row of rows) {
      const name = (row["Name"] || row["name"] || "").trim();
      if (!name) { skipped++; continue; }
      const id = randomUUID();
      await execute(
        `INSERT INTO website_leads (id, website_id, user_id, name, email, phone, message, source, status, notes)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [id, wId, userId, name,
          row["Email"] || row["email"] || null,
          row["Phone"] || row["phone"] || null,
          row["Message"] || row["message"] || null,
          row["Source"] || row["source"] || "import",
          (row["Status"] || row["status"] || "new").toLowerCase(),
          row["Notes"] || row["notes"] || null]
      );
      imported++;
    }
    res.json({ ok: true, imported, skipped });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

leadsRouter.get("/stats", requireAuth, async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const total = await queryOne("SELECT COUNT(*) as count FROM website_leads WHERE user_id = ?", [userId]);
    const newLeads = await queryOne("SELECT COUNT(*) as count FROM website_leads WHERE user_id = ? AND status = 'new'", [userId]);
    const contacted = await queryOne("SELECT COUNT(*) as count FROM website_leads WHERE user_id = ? AND status = 'contacted'", [userId]);
    const converted = await queryOne("SELECT COUNT(*) as count FROM website_leads WHERE user_id = ? AND status = 'converted'", [userId]);
    res.json({
      total: total?.count || 0,
      new: newLeads?.count || 0,
      contacted: contacted?.count || 0,
      converted: converted?.count || 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
