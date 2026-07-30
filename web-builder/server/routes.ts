import { Router } from "express";
import { queryOne, queryAll, execute } from "./db.js";
import { requireAuth, getDataOwnerId } from "./auth.js";
import { randomUUID } from "crypto";
import multer from "multer";
import nodemailer from "nodemailer";

export const websiteRouter = Router();
export const leadsRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

websiteRouter.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const mimeType = req.file.mimetype || "image/jpeg";
  const base64 = req.file.buffer.toString("base64");
  const url = `data:${mimeType};base64,${base64}`;
  res.json({ ok: true, url });
});

websiteRouter.post("/", async (req, res) => {
  try {
    const { id, slug, content } = req.body;
    const ownerId = req.session?.userId || "local";
    const now = new Date().toISOString();

    const slugOwner = await queryOne("SELECT id FROM websites WHERE slug = ?", [slug]);
    let targetId = id || null;
    if (!targetId) {
      const userSite = await queryOne("SELECT id FROM websites WHERE owner_id = ?", [ownerId]);
      if (userSite) targetId = userSite.id;
    }

    if (slugOwner && slugOwner.id !== targetId) {
      return res.status(400).json({ error: "Slug is already taken" });
    }

    if (targetId) {
      const owned = await queryOne("SELECT id FROM websites WHERE id = ? AND owner_id = ?", [targetId, ownerId]);
      if (!owned) return res.status(403).json({ error: "Not authorized to update this website" });
      await execute(
        "UPDATE websites SET slug = ?, content_json = ?, updated_at = ? WHERE id = ?",
        [slug, JSON.stringify(content), now, targetId]
      );
      res.json({ id: targetId, ok: true });
    } else {
      const newId = randomUUID();
      await execute(
        "INSERT INTO websites (id, owner_id, slug, status, content_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [newId, ownerId, slug, "draft", JSON.stringify(content), now, now]
      );
      res.json({ id: newId, ok: true });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to save website" });
  }
});

websiteRouter.get("/mine", async (req, res) => {
  try {
    const ownerId = req.session?.userId || "local";
    const sites = await queryAll("SELECT * FROM websites WHERE owner_id = ?", [ownerId]);
    res.json(sites.map((s: any) => ({ ...s, content: JSON.parse(s.content_json) })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch websites" });
  }
});

websiteRouter.get("/by-domain", async (req, res) => {
  try {
    const hostname = String(req.query.hostname || "").trim().toLowerCase();
    if (!hostname) return res.json({ site: null });
    const site = await queryOne(
      "SELECT id, slug, custom_domain, status FROM websites WHERE custom_domain = ?",
      [hostname]
    );
    if (!site) return res.json({ site: null });
    res.json({ site: { slug: site.slug, status: site.status } });
  } catch {
    res.json({ site: null });
  }
});

websiteRouter.get("/:slug", async (req, res) => {
  try {
    const site = await queryOne("SELECT * FROM websites WHERE slug = ?", [req.params.slug]);
    if (!site) return res.status(404).json({ error: "Website not found" });
    res.json({ ...site, content: JSON.parse(site.content_json) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch website" });
  }
});

websiteRouter.post("/:id/publish", async (req, res) => {
  try {
    const ownerId = req.session?.userId || "local";
    const owned = await queryOne("SELECT id FROM websites WHERE id = ? AND owner_id = ?", [req.params.id, ownerId]);
    if (!owned) return res.status(403).json({ error: "Not authorized" });
    const now = new Date().toISOString();
    await execute("UPDATE websites SET status = 'published', updated_at = ? WHERE id = ?", [now, req.params.id]);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to publish" });
  }
});

websiteRouter.put("/:id/domain", requireAuth, async (req, res) => {
  try {
    const ownerId = req.session?.userId || "local";
    const owned = await queryOne("SELECT id FROM websites WHERE id = ? AND owner_id = ?", [req.params.id, ownerId]);
    if (!owned) return res.status(403).json({ error: "Not authorized" });

    const { customDomain } = req.body;
    const domain = customDomain
      ? customDomain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "")
      : null;

    if (domain) {
      const taken = await queryOne("SELECT id FROM websites WHERE custom_domain = ? AND id != ?", [domain, req.params.id]);
      if (taken) return res.status(400).json({ error: "Domain already registered to another site" });
    }

    await execute("UPDATE websites SET custom_domain = ?, domain_verified = 0 WHERE id = ?", [domain, req.params.id]);
    res.json({ ok: true, customDomain: domain });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update domain" });
  }
});

function getMailer() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

leadsRouter.post("/submit", async (req, res) => {
  try {
    const { websiteId, name, email, phone, message, source, notifyEmail } = req.body;
    if (!websiteId || !name) return res.status(400).json({ error: "Website ID and name are required" });

    const website = await queryOne("SELECT owner_id FROM websites WHERE id = ?", [websiteId]);
    if (!website) return res.status(404).json({ error: "Website not found" });

    const id = randomUUID();
    await execute(
      `INSERT INTO website_leads (id, website_id, user_id, name, email, phone, message, source)
       VALUES (?,?,?,?,?,?,?,?)`,
      [id, websiteId, website.owner_id, name, email || null, phone || null, message || null, source || "contact_form"]
    );

    const mailer = getMailer();
    if (mailer && notifyEmail && /\S+@\S+\.\S+/.test(notifyEmail)) {
      mailer.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: notifyEmail,
        subject: `New lead from your website: ${name}`,
        text: `Name: ${name}\nEmail: ${email || "-"}\nPhone: ${phone || "-"}\n\n${message || ""}`,
      }).catch(() => {});
    }

    res.json({ ok: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

leadsRouter.get("/", requireAuth, async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const leads = await queryAll(
      "SELECT * FROM website_leads WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
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
      "SELECT name, email, phone, message, source, status, notes, created_at FROM website_leads WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    const esc = (v: any) => {
      if (v == null) return "";
      const s = String(v).replace(/"/g, '""');
      return s.includes(",") || s.includes("\n") || s.includes('"') ? `"${s}"` : s;
    };
    const headers = ["Name", "Email", "Phone", "Message", "Source", "Status", "Notes", "Date"];
    const rows = leads.map((l: any) =>
      [esc(l.name), esc(l.email), esc(l.phone), esc(l.message), esc(l.source), esc(l.status), esc(l.notes), esc(l.created_at)].join(",")
    );
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="leads-${Date.now()}.csv"`);
    res.send([headers.join(","), ...rows].join("\n"));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
