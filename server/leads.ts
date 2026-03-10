import { Router } from "express";
import { queryOne, queryAll, execute } from "./db";
import { requireAuth } from "./auth";
import { randomUUID } from "crypto";

export const leadsRouter = Router();

leadsRouter.post("/submit", async (req, res) => {
  try {
    const { websiteId, vehicleId, name, email, phone, message, source } = req.body;
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
    res.json({ ok: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

leadsRouter.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
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
    const userId = req.session.userId!;
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
    const userId = req.session.userId!;
    const existing = await queryOne("SELECT id FROM website_leads WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!existing) return res.status(404).json({ error: "Lead not found" });
    await execute("DELETE FROM website_leads WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

leadsRouter.get("/stats", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
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
