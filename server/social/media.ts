import { Router } from "express";
import { queryOne, queryAll, execute } from "../db";
import { requireAuth } from "../auth";
import { requireWorkspaceRole } from "./workspace";
import { requireActiveSubscription } from "../feature-gate";
import { writeAuditLog } from "./audit";
import { randomUUID } from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";
import OpenAI from "openai";

function getOpenAI() {
  if (process.env.OPENROUTER_API_KEY) {
    return new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: { "HTTP-Referer": process.env.APP_URL || "https://masakhegroup.co.za", "X-Title": "Masakhe" },
    });
  }
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  if (!apiKey) throw new Error("No AI API key configured.");
  const opts: ConstructorParameters<typeof OpenAI>[0] = { apiKey };
  if (!process.env.OPENAI_API_KEY && process.env.AI_INTEGRATIONS_OPENAI_BASE_URL) {
    opts.baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  }
  return new OpenAI(opts);
}

function getOpenAIForImages() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  if (!apiKey) throw new Error("AI image generation requires an OpenAI API key (OPENAI_API_KEY). OpenRouter does not support this feature.");
  const opts: ConstructorParameters<typeof OpenAI>[0] = { apiKey };
  if (!process.env.OPENAI_API_KEY && process.env.AI_INTEGRATIONS_OPENAI_BASE_URL) {
    opts.baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  }
  return new OpenAI(opts);
}

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

function isUrlBroken(url: string): boolean {
  if (!url) return true;
  if (url.startsWith("data:")) return false;
  if (url.startsWith("http://") || url.startsWith("https://")) return false;
  const filePath = path.join(process.cwd(), "public", url.startsWith("/") ? url.slice(1) : url);
  return !fs.existsSync(filePath);
}

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

    const brokenIds: string[] = [];
    const good = assets.filter((a: any) => {
      if (isUrlBroken(a.url)) {
        brokenIds.push(a.id);
        return false;
      }
      return true;
    });

    if (brokenIds.length > 0) {
      await execute(
        `DELETE FROM media_assets WHERE id IN (${brokenIds.map(() => "?").join(",")})`,
        brokenIds
      );
    }

    res.json(good);
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

    const response = await getOpenAIForImages().images.generate({
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

mediaRouter.post("/:workspaceId/media/from-url", requireWorkspaceRole("owner", "admin", "editor"), async (req, res) => {
  try {
    const { url, fileName } = req.body;
    if (!url) return res.status(400).json({ error: "URL required" });

    const name = fileName || `template-image-${randomUUID()}.jpg`;

    const existing = await queryOne(
      "SELECT * FROM media_assets WHERE workspace_id = ? AND file_name = ? LIMIT 1",
      [req.params.workspaceId, name]
    );
    if (existing) {
      return res.json({ ok: true, id: existing.id, url: existing.url, type: existing.type, fileName: existing.file_name });
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image from URL");

    const buffer = Buffer.from(await response.arrayBuffer());
    const mimeType = response.headers.get("content-type") || "image/jpeg";
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const id = randomUUID();
    await execute(
      `INSERT INTO media_assets (id, workspace_id, url, type, file_name, size, uploaded_by_user_id, created_at)
       VALUES (?,?,?,?,?,?,?,?)`,
      [id, req.params.workspaceId, dataUrl, "IMAGE", name, buffer.length, req.session.userId!, new Date().toISOString()]
    );

    res.json({ ok: true, id, url: dataUrl, type: "IMAGE", fileName: name });
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
