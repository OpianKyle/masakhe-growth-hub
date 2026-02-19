import { Router } from "express";
import { sqlite } from "./db";
import { randomUUID } from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";

export const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "public/uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ ok: true, url: `/uploads/${req.file.filename}` });
});

router.get("/onboarding/flow", (req, res) => {
  try {
    const flow = sqlite.prepare(`SELECT * FROM onboarding_flows WHERE active=1 LIMIT 1`).get();
    if (!flow) return res.status(404).json({ error: "No active flow" });
    
    const steps = sqlite.prepare(`SELECT * FROM onboarding_steps WHERE flow_id=? ORDER BY order_index ASC`).all((flow as any).id);
    res.json({
      flow,
      steps: steps.map((s: any) => ({
        ...s,
        condition: s.condition_json ? JSON.parse(s.condition_json) : null,
        fields: JSON.parse(s.fields_json),
      }))
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch flow" });
  }
});

router.post("/submissions", (req, res) => {
  try {
    const id = randomUUID();
    sqlite.prepare(`INSERT INTO submissions (id, kind, payload_json, created_at) VALUES (?, ?, ?, ?)`)
      .run(id, req.body.kind || "onboarding", JSON.stringify(req.body.payload || {}), new Date().toISOString());
    res.json({ ok: true, id });
  } catch (err) {
    res.status(500).json({ error: "Failed to save submission" });
  }
});

router.get("/pages", (req, res) => {
  const pages = sqlite.prepare(`SELECT * FROM page_definitions`).all();
  res.json(pages);
});

router.get("/pages/by-route", (req, res) => {
  const route = String(req.query.route || "");
  const page = sqlite.prepare(`SELECT * FROM page_definitions WHERE route=?`).get(route);
  if (!page) return res.status(404).json({ error: "Not found" });
  const sections = sqlite.prepare(`SELECT * FROM page_sections WHERE page_id=? ORDER BY order_index ASC`).all((page as any).id);
  res.json({
    page,
    sections: sections.map((s: any) => ({
      ...s,
      config: JSON.parse(s.config_json),
    })),
  });
});

// Website Builder Endpoints
router.post("/websites", (req, res) => {
  try {
    const { id, slug, content } = req.body;
    const ownerId = "local";
    const now = new Date().toISOString();
    
    const existing = id ? sqlite.prepare("SELECT id FROM websites WHERE id = ?").get(id) : null;
    
    // Check slug uniqueness
    const slugOwner = sqlite.prepare("SELECT id FROM websites WHERE slug = ?").get(slug);
    if (slugOwner && (slugOwner as any).id !== id) {
      return res.status(400).json({ error: "Slug is already taken" });
    }
    
    if (existing) {
      sqlite.prepare(`
        UPDATE websites 
        SET slug = ?, content_json = ?, updated_at = ? 
        WHERE id = ?
      `).run(slug, JSON.stringify(content), now, id);
      res.json({ id, ok: true });
    } else {
      const newId = id || randomUUID();
      sqlite.prepare(`
        INSERT INTO websites (id, owner_id, slug, status, content_json, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(newId, ownerId, slug, "draft", JSON.stringify(content), now, now);
      res.json({ id: newId, ok: true });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to save website" });
  }
});

router.get("/websites/mine", (req, res) => {
  try {
    const sites = sqlite.prepare("SELECT * FROM websites WHERE owner_id = 'local'").all();
    res.json(sites.map((s: any) => ({ ...s, content: JSON.parse(s.content_json) })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch websites" });
  }
});

router.get("/websites/:slug", (req, res) => {
  try {
    const site = sqlite.prepare("SELECT * FROM websites WHERE slug = ?").get(req.params.slug);
    if (!site) return res.status(404).json({ error: "Website not found" });
    res.json({ ...site, content: JSON.parse((site as any).content_json) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch website" });
  }
});

router.post("/websites/:id/publish", (req, res) => {
  try {
    const now = new Date().toISOString();
    sqlite.prepare("UPDATE websites SET status = 'published', updated_at = ? WHERE id = ?").run(now, req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to publish" });
  }
});
