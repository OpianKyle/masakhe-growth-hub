import { Router } from "express";
import { queryOne, queryAll, execute } from "../db";
import { requireAuth } from "../auth";
import { requireWorkspaceRole } from "./workspace";
import { requireActiveSubscription } from "../feature-gate";
import { writeAuditLog } from "./audit";
import { randomUUID } from "crypto";
import multer from "multer";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const upload = multer({
  storage: multer.memoryStorage(),
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

mediaRouter.get("/:workspaceId/media", requireWorkspaceRole("owner", "admin", "editor", "viewer"), async (req, res) => {
  try {
    const assets = await queryAll(
      `SELECT ma.*, u.full_name as uploader_name
       FROM media_assets ma
       JOIN users u ON u.id = ma.uploaded_by_user_id
       WHERE ma.workspace_id = ?
       ORDER BY ma.created_at DESC`,
      [req.params.workspaceId]
    );
    res.json(assets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

mediaRouter.post("/:workspaceId/media/upload", requireActiveSubscription, requireWorkspaceRole("owner", "admin", "editor"), upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const id = randomUUID();
    const isVideo = /\.(mp4|mov|avi)$/i.test(req.file.originalname);
    const mimeType = req.file.mimetype || (isVideo ? "video/mp4" : "image/jpeg");
    const base64 = req.file.buffer.toString("base64");
    const url = `data:${mimeType};base64,${base64}`;

    await execute(
      `INSERT INTO media_assets (id, workspace_id, url, type, file_name, size, uploaded_by_user_id, created_at)
       VALUES (?,?,?,?,?,?,?,?)`,
      [id, req.params.workspaceId, url, isVideo ? "VIDEO" : "IMAGE", req.file.originalname, req.file.size, req.session.userId!, new Date().toISOString()]
    );

    await writeAuditLog(req.params.workspaceId, req.session.userId!, "UPLOADED_MEDIA", "media_asset", id, { fileName: req.file.originalname, size: req.file.size });

    res.json({ ok: true, id, url, type: isVideo ? "VIDEO" : "IMAGE", fileName: req.file.originalname });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

mediaRouter.post("/:workspaceId/media/generate", requireActiveSubscription, requireWorkspaceRole("owner", "admin", "editor"), async (req, res) => {
  try {
    const { prompt, postContent, businessName } = req.body;

    const finalPrompt = prompt || [
      `Create a professional, eye-catching social media ad image for a South African small business`,
      businessName ? `called "${businessName}"` : "",
      postContent ? `promoting: ${postContent.slice(0, 300)}` : "",
      `Style: modern, vibrant, clean layout, suitable for Facebook and Instagram. No text overlays.`,
    ].filter(Boolean).join(" ");

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: finalPrompt,
      n: 1,
      size: "1024x1024",
    });

    const base64 = response.data[0]?.b64_json;
    if (!base64) return res.status(500).json({ error: "No image returned from generator" });

    const filename = `ai-generated-${randomUUID()}.png`;
    const url = `data:image/png;base64,${base64}`;
    const fileSize = Buffer.from(base64, "base64").length;

    const id = randomUUID();

    await execute(
      `INSERT INTO media_assets (id, workspace_id, url, type, file_name, size, uploaded_by_user_id, created_at)
       VALUES (?,?,?,?,?,?,?,?)`,
      [id, req.params.workspaceId, url, "IMAGE", filename, fileSize, req.session.userId!, new Date().toISOString()]
    );

    await writeAuditLog(req.params.workspaceId, req.session.userId!, "GENERATED_MEDIA", "media_asset", id, { prompt: finalPrompt });

    res.json({ ok: true, id, url, type: "IMAGE", fileName: filename });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

mediaRouter.delete("/:workspaceId/media/:assetId", requireActiveSubscription, requireWorkspaceRole("owner", "admin", "editor"), async (req, res) => {
  try {
    const asset = await queryOne("SELECT * FROM media_assets WHERE id = ? AND workspace_id = ?", [req.params.assetId, req.params.workspaceId]);
    if (!asset) return res.status(404).json({ error: "Asset not found" });

    await execute("DELETE FROM media_assets WHERE id = ?", [req.params.assetId]);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
