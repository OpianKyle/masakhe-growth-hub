import { Router } from "express";
import { queryOne, queryAll, execute } from "./db";
import { requireAuth } from "./auth";
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

router.get("/onboarding/flow", async (req, res) => {
  try {
    const flow = await queryOne("SELECT * FROM onboarding_flows WHERE active=1 LIMIT 1");
    if (!flow) return res.status(404).json({ error: "No active flow" });
    
    const steps = await queryAll("SELECT * FROM onboarding_steps WHERE flow_id=? ORDER BY order_index ASC", [flow.id]);
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

router.post("/onboarding/complete", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { bankName, accountType, accountNumber, branchCode, taxNumber, vatNumber, popiaConsent } = req.body;
    const now = new Date().toISOString();

    const existing = await queryOne("SELECT id FROM business_profiles WHERE user_id = ?", [userId]);

    if (existing) {
      await execute(
        `UPDATE business_profiles SET
          bank_name = COALESCE(?, bank_name),
          account_type = COALESCE(?, account_type),
          account_number = COALESCE(?, account_number),
          branch_code = COALESCE(?, branch_code),
          tax_number = COALESCE(?, tax_number),
          vat_number = COALESCE(?, vat_number),
          popia_consent = COALESCE(?, popia_consent),
          updated_at = ?
        WHERE user_id = ?`,
        [bankName, accountType, accountNumber, branchCode, taxNumber, vatNumber, popiaConsent ? 1 : null, now, userId]
      );
    } else {
      await execute(
        `INSERT INTO business_profiles (id, user_id, bank_name, account_type, account_number, branch_code, tax_number, vat_number, popia_consent, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [randomUUID(), userId, bankName, accountType, accountNumber, branchCode, taxNumber, vatNumber, popiaConsent ? 1 : 0, now, now]
      );
    }

    await execute(
      "INSERT INTO submissions (id, kind, payload_json, created_at) VALUES (?, ?, ?, ?)",
      [randomUUID(), "onboarding", JSON.stringify(req.body), now]
    );

    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to complete onboarding" });
  }
});

router.post("/submissions", async (req, res) => {
  try {
    const id = randomUUID();
    await execute(
      "INSERT INTO submissions (id, kind, payload_json, created_at) VALUES (?, ?, ?, ?)",
      [id, req.body.kind || "onboarding", JSON.stringify(req.body.payload || {}), new Date().toISOString()]
    );
    res.json({ ok: true, id });
  } catch (err) {
    res.status(500).json({ error: "Failed to save submission" });
  }
});

router.get("/pages", async (req, res) => {
  const pages = await queryAll("SELECT * FROM page_definitions");
  res.json(pages);
});

router.get("/pages/by-route", async (req, res) => {
  const route = String(req.query.route || "");
  const page = await queryOne("SELECT * FROM page_definitions WHERE route=?", [route]);
  if (!page) return res.status(404).json({ error: "Not found" });
  const sections = await queryAll("SELECT * FROM page_sections WHERE page_id=? ORDER BY order_index ASC", [page.id]);
  res.json({
    page,
    sections: sections.map((s: any) => ({
      ...s,
      config: JSON.parse(s.config_json),
    })),
  });
});

router.post("/websites", async (req, res) => {
  try {
    const { id, slug, content } = req.body;
    const ownerId = req.session?.userId || "local";
    const now = new Date().toISOString();
    
    const existing = id ? await queryOne("SELECT id FROM websites WHERE id = ?", [id]) : null;
    
    const slugOwner = await queryOne("SELECT id FROM websites WHERE slug = ?", [slug]);
    if (slugOwner && slugOwner.id !== id) {
      return res.status(400).json({ error: "Slug is already taken" });
    }
    
    if (existing) {
      await execute(
        "UPDATE websites SET slug = ?, content_json = ?, updated_at = ? WHERE id = ?",
        [slug, JSON.stringify(content), now, id]
      );
      res.json({ id, ok: true });
    } else {
      const newId = id || randomUUID();
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

router.get("/websites/mine", async (req, res) => {
  try {
    const ownerId = req.session?.userId || "local";
    const sites = await queryAll("SELECT * FROM websites WHERE owner_id = ?", [ownerId]);
    res.json(sites.map((s: any) => ({ ...s, content: JSON.parse(s.content_json) })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch websites" });
  }
});

router.get("/websites/:slug", async (req, res) => {
  try {
    const site = await queryOne("SELECT * FROM websites WHERE slug = ?", [req.params.slug]);
    if (!site) return res.status(404).json({ error: "Website not found" });
    res.json({ ...site, content: JSON.parse(site.content_json) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch website" });
  }
});

router.post("/websites/:id/publish", async (req, res) => {
  try {
    const now = new Date().toISOString();
    await execute("UPDATE websites SET status = 'published', updated_at = ? WHERE id = ?", [now, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to publish" });
  }
});
