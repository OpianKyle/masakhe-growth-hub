import { Router } from "express";
import { sqlite } from "./db";
import { randomUUID } from "crypto";

export const router = Router();

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
