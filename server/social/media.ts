import { Router } from "express";
import { sqlite } from "../db";
import { requireAuth } from "../auth";
import { requireWorkspaceRole } from "./workspace";
import { writeAuditLog } from "./audit";
import { randomUUID } from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "public", "uploads", "media");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|mp4|mov|avi)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Allowed: jpg, png, gif, webp, mp4, mov, avi"));
    }
  },
});

export const mediaRouter = Router();
mediaRouter.use(requireAuth);

mediaRouter.get("/:workspaceId/media", requireWorkspaceRole("owner", "admin", "editor", "viewer"), (req, res) => {
  try {
    const assets = sqlite.prepare(`
      SELECT ma.*, u.full_name as uploader_name
      FROM media_assets ma
      JOIN users u ON u.id = ma.uploaded_by_user_id
      WHERE ma.workspace_id = ?
      ORDER BY ma.created_at DESC
    `).all(req.params.workspaceId);
    res.json(assets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

mediaRouter.post("/:workspaceId/media/upload", requireWorkspaceRole("owner", "admin", "editor"), upload.single("file"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const id = randomUUID();
    const isVideo = /\.(mp4|mov|avi)$/i.test(req.file.originalname);
    const url = `/uploads/media/${req.file.filename}`;

    sqlite.prepare(`
      INSERT INTO media_assets (id, workspace_id, url, type, file_name, size, uploaded_by_user_id, created_at)
      VALUES (?,?,?,?,?,?,?,?)
    `).run(id, req.params.workspaceId, url, isVideo ? "VIDEO" : "IMAGE", req.file.originalname, req.file.size, req.session.userId!, new Date().toISOString());

    writeAuditLog(req.params.workspaceId, req.session.userId!, "UPLOADED_MEDIA", "media_asset", id, { fileName: req.file.originalname, size: req.file.size });

    res.json({ ok: true, id, url, type: isVideo ? "VIDEO" : "IMAGE", fileName: req.file.originalname });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

mediaRouter.delete("/:workspaceId/media/:assetId", requireWorkspaceRole("owner", "admin", "editor"), (req, res) => {
  try {
    const asset = sqlite.prepare("SELECT * FROM media_assets WHERE id = ? AND workspace_id = ?").get(req.params.assetId, req.params.workspaceId) as any;
    if (!asset) return res.status(404).json({ error: "Asset not found" });

    const filePath = path.join(process.cwd(), "public", asset.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    sqlite.prepare("DELETE FROM media_assets WHERE id = ?").run(req.params.assetId);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
