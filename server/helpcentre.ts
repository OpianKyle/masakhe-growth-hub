import { Router } from "express";
import { queryAll, queryOne, execute } from "./db";
import { requireAuth, requireAdmin } from "./auth";
import { randomUUID } from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";

export const helpRouter = Router();

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const videoUploadDir = path.join(process.cwd(), "public", "uploads", "help-videos");
const imageUploadDir = path.join(process.cwd(), "public", "uploads", "help-images");

if (!fs.existsSync(videoUploadDir)) fs.mkdirSync(videoUploadDir, { recursive: true });
if (!fs.existsSync(imageUploadDir)) fs.mkdirSync(imageUploadDir, { recursive: true });

const imageUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, imageUploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
      cb(null, `${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|webp|gif)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Allowed: JPG, PNG, WebP, GIF"));
    }
  },
});

helpRouter.post("/admin/upload-image", requireAdmin, (req, res) => {
  imageUpload.single("image")(req, res, (err: any) => {
    if (err) return res.status(400).json({ error: err.message || "Image upload failed" });
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    res.json({ ok: true, url: `/uploads/help-images/${req.file.filename}` });
  });
});

const videoUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, videoUploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || ".mp4";
      cb(null, `${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(mp4|mov|webm|avi|mkv|m4v)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Allowed video formats: mp4, mov, webm, avi, mkv, m4v"));
    }
  },
});

helpRouter.post("/admin/upload-video", requireAdmin, (req, res) => {
  videoUpload.single("video")(req, res, (err: any) => {
    if (err) return res.status(400).json({ error: err.message || "Video upload failed" });
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    res.json({ ok: true, url: `/uploads/help-videos/${req.file.filename}` });
  });
});

// ── Public / User routes ─────────────────────────────────────────────────────

helpRouter.get("/categories", async (_req, res) => {
  try {
    const cats = await queryAll(
      "SELECT * FROM help_categories ORDER BY order_index ASC, name ASC"
    );
    res.json(cats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

helpRouter.get("/articles", requireAuth, async (req, res) => {
  const { category, q } = req.query as Record<string, string>;
  try {
    let sql = `SELECT a.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
               FROM help_articles a LEFT JOIN help_categories c ON a.category_id = c.id
               WHERE a.status = 'published'`;
    const params: any[] = [];
    if (category) { sql += " AND a.category_id = ?"; params.push(category); }
    if (q) { sql += " AND (a.title LIKE ? OR a.summary LIKE ? OR a.tags LIKE ?)"; const like = `%${q}%`; params.push(like, like, like); }
    sql += " ORDER BY a.pinned DESC, a.order_index ASC, a.created_at DESC";
    const rows = await queryAll(sql, params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

helpRouter.get("/articles/:id", requireAuth, async (req, res) => {
  try {
    const article = await queryOne(
      `SELECT a.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
       FROM help_articles a LEFT JOIN help_categories c ON a.category_id = c.id
       WHERE a.id = ? AND a.status = 'published'`,
      [req.params.id]
    );
    if (!article) return res.status(404).json({ error: "Article not found" });
    await execute("UPDATE help_articles SET view_count = view_count + 1 WHERE id = ?", [req.params.id]);
    res.json(article);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin routes ─────────────────────────────────────────────────────────────

helpRouter.get("/admin/categories", requireAdmin, async (_req, res) => {
  try {
    const cats = await queryAll(
      `SELECT c.*, COUNT(a.id) as article_count
       FROM help_categories c
       LEFT JOIN help_articles a ON a.category_id = c.id
       GROUP BY c.id ORDER BY c.order_index ASC, c.name ASC`
    );
    res.json(cats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

helpRouter.post("/admin/categories", requireAdmin, async (req, res) => {
  const { name, description, icon, color, order_index, image_url } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  try {
    const id = randomUUID();
    await execute(
      "INSERT INTO help_categories (id, name, description, icon, color, order_index, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, name, description || null, icon || "💡", color || "blue", order_index || 0, image_url || null]
    );
    res.status(201).json(await queryOne("SELECT * FROM help_categories WHERE id = ?", [id]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

helpRouter.put("/admin/categories/:id", requireAdmin, async (req, res) => {
  const { name, description, icon, color, order_index, image_url } = req.body;
  try {
    await execute(
      "UPDATE help_categories SET name=?, description=?, icon=?, color=?, order_index=?, image_url=? WHERE id=?",
      [name, description || null, icon || "💡", color || "blue", order_index || 0, image_url || null, req.params.id]
    );
    res.json(await queryOne("SELECT * FROM help_categories WHERE id = ?", [req.params.id]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

helpRouter.delete("/admin/categories/:id", requireAdmin, async (req, res) => {
  try {
    await execute("DELETE FROM help_categories WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

helpRouter.get("/admin/articles", requireAdmin, async (req, res) => {
  const { category, status } = req.query as Record<string, string>;
  try {
    let sql = `SELECT a.*, c.name AS category_name, c.icon AS category_icon
               FROM help_articles a LEFT JOIN help_categories c ON a.category_id = c.id WHERE 1=1`;
    const params: any[] = [];
    if (category) { sql += " AND a.category_id = ?"; params.push(category); }
    if (status) { sql += " AND a.status = ?"; params.push(status); }
    sql += " ORDER BY a.pinned DESC, a.order_index ASC, a.created_at DESC";
    res.json(await queryAll(sql, params));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

helpRouter.post("/admin/articles", requireAdmin, async (req, res) => {
  const { category_id, title, summary, body, content_type, video_url, thumbnail_url, tags, status, pinned, order_index } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });
  try {
    const id = randomUUID();
    const baseSlug = slugify(title);
    const existing = await queryOne("SELECT id FROM help_articles WHERE slug = ?", [baseSlug]);
    const slug = existing ? `${baseSlug}-${id.substring(0, 6)}` : baseSlug;
    await execute(
      `INSERT INTO help_articles (id, category_id, title, slug, summary, body, content_type, video_url, thumbnail_url, tags, status, pinned, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, category_id || null, title, slug, summary || null, body || null,
       content_type || "article", video_url || null, thumbnail_url || null,
       tags || null, status || "draft", pinned ? 1 : 0, order_index || 0]
    );
    res.status(201).json(await queryOne("SELECT * FROM help_articles WHERE id = ?", [id]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

helpRouter.put("/admin/articles/:id", requireAdmin, async (req, res) => {
  const { category_id, title, summary, body, content_type, video_url, thumbnail_url, tags, status, pinned, order_index } = req.body;
  try {
    await execute(
      `UPDATE help_articles SET category_id=?, title=?, summary=?, body=?, content_type=?,
       video_url=?, thumbnail_url=?, tags=?, status=?, pinned=?, order_index=?, updated_at=NOW()
       WHERE id=?`,
      [category_id || null, title, summary || null, body || null,
       content_type || "article", video_url || null, thumbnail_url || null,
       tags || null, status || "draft", pinned ? 1 : 0, order_index || 0, req.params.id]
    );
    res.json(await queryOne("SELECT * FROM help_articles WHERE id = ?", [req.params.id]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

helpRouter.delete("/admin/articles/:id", requireAdmin, async (req, res) => {
  try {
    await execute("DELETE FROM help_articles WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
