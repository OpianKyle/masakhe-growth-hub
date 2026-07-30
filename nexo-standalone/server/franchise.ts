import { Router } from "express";
import { queryOne, queryAll, execute } from "./db.js";
import { requireAuth } from "./auth.js";
import { randomUUID } from "crypto";

export const franchiseRouter = Router();
franchiseRouter.use(requireAuth);

// ─── GET /api/franchise/me ────────────────────────────────────────────────────
franchiseRouter.get("/me", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const user = await queryOne("SELECT role FROM users WHERE id = ?", [userId]);
    if (!user || (user.role !== "franchise" && user.role !== "admin")) {
      return res.status(403).json({ error: "Franchise access required" });
    }
    const franchise = await queryOne("SELECT * FROM franchises WHERE owner_user_id = ?", [userId]);
    if (!franchise) return res.status(404).json({ error: "No franchise found" });

    const stats = await queryOne(
      `SELECT COUNT(fc.id) as total_clients,
              SUM(CASE WHEN fc.status = 'active' THEN 1 ELSE 0 END) as active_clients
       FROM franchise_clients fc
       WHERE fc.franchise_id = ?`,
      [franchise.id]
    );

    res.json({ franchise, stats });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/franchise/promotions ───────────────────────────────────────────
franchiseRouter.get("/promotions", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const franchise = await queryOne("SELECT * FROM franchises WHERE owner_user_id = ?", [userId]);
    if (!franchise) return res.status(404).json({ error: "No franchise found" });

    const promos = await queryAll(
      "SELECT * FROM mtn_promotions WHERE franchise_id = ? ORDER BY created_at DESC",
      [franchise.id]
    );
    res.json(promos);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/franchise/promotions ──────────────────────────────────────────
franchiseRouter.post("/promotions", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const franchise = await queryOne("SELECT * FROM franchises WHERE owner_user_id = ?", [userId]);
    if (!franchise) return res.status(404).json({ error: "No franchise found" });

    const { title, description, promo_type, image_url, cta_text, cta_url, status, target_audience, scheduled_at } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: "Title is required" });

    const id = randomUUID();
    await execute(
      `INSERT INTO mtn_promotions (id, franchise_id, title, description, promo_type, image_url, cta_text, cta_url, status, target_audience, scheduled_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, franchise.id, title, description || null, promo_type || "general",
       image_url || null, cta_text || null, cta_url || null,
       status || "draft", target_audience || "all",
       scheduled_at || null]
    );
    res.json({ ok: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/franchise/promotions/:id ───────────────────────────────────────
franchiseRouter.put("/promotions/:id", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const franchise = await queryOne("SELECT * FROM franchises WHERE owner_user_id = ?", [userId]);
    if (!franchise) return res.status(404).json({ error: "No franchise found" });

    const promo = await queryOne("SELECT id FROM mtn_promotions WHERE id = ? AND franchise_id = ?", [req.params.id, franchise.id]);
    if (!promo) return res.status(404).json({ error: "Promotion not found" });

    const { title, description, promo_type, image_url, cta_text, cta_url, status, target_audience, scheduled_at } = req.body;
    await execute(
      `UPDATE mtn_promotions SET title=?, description=?, promo_type=?, image_url=?, cta_text=?, cta_url=?, status=?, target_audience=?, scheduled_at=?, updated_at=NOW()
       WHERE id = ?`,
      [title, description || null, promo_type || "general", image_url || null, cta_text || null,
       cta_url || null, status || "draft", target_audience || "all", scheduled_at || null, req.params.id]
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/franchise/promotions/:id ────────────────────────────────────
franchiseRouter.delete("/promotions/:id", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const franchise = await queryOne("SELECT * FROM franchises WHERE owner_user_id = ?", [userId]);
    if (!franchise) return res.status(404).json({ error: "No franchise found" });

    await execute("DELETE FROM mtn_promotions WHERE id = ? AND franchise_id = ?", [req.params.id, franchise.id]);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
