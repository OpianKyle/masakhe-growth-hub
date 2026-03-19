import { Router } from "express";
import { queryOne, queryAll, execute } from "../db";
import { requireAuth } from "../auth";
import { requireWorkspaceRole } from "./workspace";
import { requireActiveSubscription } from "../feature-gate";
import { writeAuditLog } from "./audit";
import { randomUUID } from "crypto";
import { publishToFacebook, publishToInstagram } from "./meta-oauth";
import fs from "fs";
import path from "path";

export const postsRouter = Router();
postsRouter.use(requireAuth);

postsRouter.get("/:workspaceId/posts", requireWorkspaceRole("owner", "admin", "editor", "viewer"), async (req, res) => {
  try {
    const { status, month } = req.query;
    let query = "SELECT sp.*, u.full_name as creator_name FROM social_posts sp JOIN users u ON u.id = sp.created_by_user_id WHERE sp.workspace_id = ?";
    const params: any[] = [req.params.workspaceId];

    if (status) { query += " AND sp.status = ?"; params.push(status); }
    if (month) { query += " AND LEFT(COALESCE(sp.scheduled_at, sp.created_at), 7) = ?"; params.push(month); }

    query += " ORDER BY COALESCE(sp.scheduled_at, sp.created_at) DESC LIMIT 200";

    const posts = await queryAll(query, params);

    const postsWithTargets = [];
    for (const post of posts) {
      const targets = await queryAll(
        `SELECT spt.*, sa.account_name, sa.platform as account_platform
         FROM social_post_targets spt
         JOIN social_accounts sa ON sa.id = spt.social_account_id
         WHERE spt.social_post_id = ?`,
        [post.id]
      );
      postsWithTargets.push({
        ...post,
        media_asset_ids: JSON.parse(post.media_asset_ids || "[]"),
        targets
      });
    }

    res.json(postsWithTargets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

postsRouter.get("/:workspaceId/posts/:postId", requireWorkspaceRole("owner", "admin", "editor", "viewer"), async (req, res) => {
  try {
    const post = await queryOne("SELECT * FROM social_posts WHERE id = ? AND workspace_id = ?", [req.params.postId, req.params.workspaceId]);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const targets = await queryAll(
      `SELECT spt.*, sa.account_name
       FROM social_post_targets spt
       JOIN social_accounts sa ON sa.id = spt.social_account_id
       WHERE spt.social_post_id = ?`,
      [post.id]
    );

    res.json({ ...post, media_asset_ids: JSON.parse(post.media_asset_ids || "[]"), targets });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

postsRouter.post("/:workspaceId/posts", requireActiveSubscription, requireWorkspaceRole("owner", "admin", "editor"), async (req, res) => {
  try {
    const { contentText, mediaAssetIds, scheduledAt, targetAccountIds, action } = req.body;
    if (!contentText && (!mediaAssetIds || mediaAssetIds.length === 0)) {
      return res.status(400).json({ error: "Content text or media required" });
    }

    if (action === "schedule" && scheduledAt) {
      const schedDate = new Date(scheduledAt);
      if (schedDate <= new Date()) {
        return res.status(400).json({ error: "Cannot schedule in the past" });
      }
    }

    const postId = randomUUID();
    const now = new Date().toISOString();
    let status = "DRAFT";
    if (action === "schedule" && scheduledAt) status = "SCHEDULED";
    if (action === "publish") status = "PUBLISHING";

    const idempotencyKey = `post_${postId}_${Date.now()}`;

    await execute(
      `INSERT INTO social_posts (id, workspace_id, created_by_user_id, content_text, media_asset_ids, scheduled_at, status, idempotency_key, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [postId, req.params.workspaceId, req.session.userId!, contentText || "", JSON.stringify(mediaAssetIds || []), scheduledAt || null, status, idempotencyKey, now, now]
    );

    if (targetAccountIds && targetAccountIds.length > 0) {
      for (const accountId of targetAccountIds) {
        const account = await queryOne("SELECT platform FROM social_accounts WHERE id = ? AND workspace_id = ?", [accountId, req.params.workspaceId]);
        if (account) {
          await execute(
            "INSERT INTO social_post_targets (id, social_post_id, social_account_id, platform, status) VALUES (?,?,?,?,?)",
            [randomUUID(), postId, accountId, account.platform, status === "PUBLISHING" ? "PUBLISHING" : "SCHEDULED"]
          );
        }
      }
    }

    const auditAction = status === "SCHEDULED" ? "SCHEDULED_POST" : status === "PUBLISHING" ? "PUBLISHED_POST" : "CREATED_POST";
    await writeAuditLog(req.params.workspaceId, req.session.userId!, auditAction, "social_post", postId, { status, targetCount: targetAccountIds?.length || 0 });

    if (status === "PUBLISHING") {
      await publishPostNow(postId, req.params.workspaceId, req.session.userId!);
    }

    res.json({ ok: true, id: postId, status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

postsRouter.put("/:workspaceId/posts/:postId", requireActiveSubscription, requireWorkspaceRole("owner", "admin", "editor"), async (req, res) => {
  try {
    const post = await queryOne("SELECT * FROM social_posts WHERE id = ? AND workspace_id = ?", [req.params.postId, req.params.workspaceId]);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (!["DRAFT", "SCHEDULED", "FAILED"].includes(post.status)) {
      return res.status(400).json({ error: "Cannot edit a post that is already publishing or published" });
    }

    const { contentText, mediaAssetIds, scheduledAt, targetAccountIds, action } = req.body;
    let status = post.status;
    if (action === "schedule" && scheduledAt) status = "SCHEDULED";
    if (action === "draft") status = "DRAFT";

    await execute(
      `UPDATE social_posts SET content_text = ?, media_asset_ids = ?, scheduled_at = ?, status = ?, updated_at = ? WHERE id = ?`,
      [contentText || post.content_text, JSON.stringify(mediaAssetIds || []), scheduledAt || null, status, new Date().toISOString(), req.params.postId]
    );

    if (targetAccountIds) {
      await execute("DELETE FROM social_post_targets WHERE social_post_id = ?", [req.params.postId]);
      for (const accountId of targetAccountIds) {
        const account = await queryOne("SELECT platform FROM social_accounts WHERE id = ? AND workspace_id = ?", [accountId, req.params.workspaceId]);
        if (account) {
          await execute(
            "INSERT INTO social_post_targets (id, social_post_id, social_account_id, platform, status) VALUES (?,?,?,?,?)",
            [randomUUID(), req.params.postId, accountId, account.platform, "SCHEDULED"]
          );
        }
      }
    }

    await writeAuditLog(req.params.workspaceId, req.session.userId!, "UPDATED_POST", "social_post", req.params.postId, { status });
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

postsRouter.post("/:workspaceId/posts/:postId/retry", requireActiveSubscription, requireWorkspaceRole("owner", "admin", "editor"), async (req, res) => {
  try {
    const post = await queryOne("SELECT * FROM social_posts WHERE id = ? AND workspace_id = ?", [req.params.postId, req.params.workspaceId]);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.status !== "FAILED") return res.status(400).json({ error: "Only failed posts can be retried" });

    const now = new Date().toISOString();
    await execute("UPDATE social_posts SET status = 'PUBLISHING', updated_at = ? WHERE id = ?", [now, req.params.postId]);
    await execute("UPDATE social_post_targets SET status = 'PUBLISHING', error_message = NULL WHERE social_post_id = ? AND status = 'FAILED'", [req.params.postId]);

    publishPostNow(req.params.postId, req.params.workspaceId, req.session.userId!).catch(console.error);

    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

postsRouter.delete("/:workspaceId/posts/:postId", requireActiveSubscription, requireWorkspaceRole("owner", "admin", "editor"), async (req, res) => {
  try {
    const post = await queryOne("SELECT status FROM social_posts WHERE id = ? AND workspace_id = ?", [req.params.postId, req.params.workspaceId]);
    if (!post) return res.status(404).json({ error: "Post not found" });

    await execute("DELETE FROM social_post_targets WHERE social_post_id = ?", [req.params.postId]);
    await execute("DELETE FROM social_posts WHERE id = ?", [req.params.postId]);

    await writeAuditLog(req.params.workspaceId, req.session.userId!, "DELETED_POST", "social_post", req.params.postId, {});
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export async function publishPostNow(postId: string, workspaceId: string, userId: string) {
  const targets = await queryAll(
    `SELECT spt.*, sa.is_mock, sa.platform, sa.account_name, sa.platform_account_id, sa.access_token_enc
     FROM social_post_targets spt
     JOIN social_accounts sa ON sa.id = spt.social_account_id
     WHERE spt.social_post_id = ?`,
    [postId]
  );

  const post = await queryOne("SELECT content_text, media_asset_ids FROM social_posts WHERE id = ?", [postId]);
  const contentText = post?.content_text || "";
  const mediaAssetIds = JSON.parse(post?.media_asset_ids || "[]");

  let mediaUrl: string | undefined;
  let mediaBuffer: Buffer | undefined;
  let mediaMimeType: string | undefined;
  let tempFilePath: string | undefined;
  let mediaResolutionError: string | undefined;

  if (mediaAssetIds.length > 0) {
    const asset = await queryOne("SELECT url, file_name FROM media_assets WHERE id = ?", [mediaAssetIds[0]]);
    if (asset?.url) {
      if (asset.url.startsWith("data:")) {
        const match = asset.url.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mediaMimeType = match[1];
          mediaBuffer = Buffer.from(match[2], "base64");

          // Also create a temp file for Instagram (needs a public URL)
          const ext = mediaMimeType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
          const fileName = `social-${randomUUID()}.${ext}`;
          const uploadDir = path.join(process.cwd(), "public", "uploads", "social-temp");
          if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
          tempFilePath = path.join(uploadDir, fileName);
          fs.writeFileSync(tempFilePath, mediaBuffer);

          // Use the Replit dev domain when running locally, else use APP_URL (production)
          const replitDomain = process.env.REPLIT_DOMAINS?.split(",")[0];
          const baseUrl = replitDomain
            ? `https://${replitDomain}`
            : (process.env.APP_URL || "http://localhost:5000");
          mediaUrl = `${baseUrl}/uploads/social-temp/${fileName}`;
          console.log(`[publish] Image resolved: buffer=${mediaBuffer.length}b, url=${mediaUrl}`);
        } else {
          mediaResolutionError = "Image data is corrupted and cannot be published";
        }
      } else if (asset.url.startsWith("http://") || asset.url.startsWith("https://")) {
        mediaUrl = asset.url;
      } else {
        const relativePath = asset.url.startsWith("/") ? asset.url.slice(1) : asset.url;
        const diskPath = path.join(process.cwd(), "public", relativePath);
        if (fs.existsSync(diskPath)) {
          const replitDomain = process.env.REPLIT_DOMAINS?.split(",")[0];
          const baseUrl = replitDomain
            ? `https://${replitDomain}`
            : (process.env.APP_URL || "http://localhost:5000");
          mediaUrl = `${baseUrl}/${relativePath}`;
          mediaBuffer = fs.readFileSync(diskPath);
        } else {
          mediaResolutionError = `Image file "${asset.file_name || asset.url}" no longer exists on the server. Please re-upload the image.`;
        }
      }
    } else if (asset) {
      mediaResolutionError = "Image has no URL data. Please re-upload the image.";
    }
  }

  let allSuccess = true;
  const now = new Date().toISOString();

  if (mediaResolutionError) {
    for (const target of targets) {
      await execute(
        "UPDATE social_post_targets SET status = 'FAILED', error_message = ? WHERE id = ?",
        [mediaResolutionError, target.id]
      );
    }
    await execute("UPDATE social_posts SET status = 'FAILED', updated_at = ? WHERE id = ?", [now, postId]);
    return;
  }

  for (const target of targets) {
    if (target.is_mock) {
      const success = Math.random() > 0.1;
      if (success) {
        await execute(
          "UPDATE social_post_targets SET status = 'PUBLISHED', platform_post_id = ?, published_at = ? WHERE id = ?",
          [`mock_${Date.now()}_${target.id.slice(0, 8)}`, now, target.id]
        );
      } else {
        allSuccess = false;
        await execute(
          "UPDATE social_post_targets SET status = 'FAILED', error_message = ? WHERE id = ?",
          ["Simulated transient error (mock mode)", target.id]
        );
      }
      continue;
    }

    if (target.platform === "META_FACEBOOK" && target.access_token_enc) {
      const result = await publishToFacebook(
        target.platform_account_id,
        target.access_token_enc,
        contentText,
        mediaBuffer ? undefined : mediaUrl,
        mediaBuffer,
        mediaMimeType
      );
      if (result.success) {
        await execute(
          "UPDATE social_post_targets SET status = 'PUBLISHED', platform_post_id = ?, published_at = ? WHERE id = ?",
          [result.postId || "", now, target.id]
        );
      } else {
        allSuccess = false;
        await execute(
          "UPDATE social_post_targets SET status = 'FAILED', error_message = ? WHERE id = ?",
          [result.error || "Facebook publish failed", target.id]
        );
      }
      continue;
    }

    if (target.platform === "META_INSTAGRAM" && target.access_token_enc) {
      if (!mediaUrl) {
        allSuccess = false;
        await execute(
          "UPDATE social_post_targets SET status = 'FAILED', error_message = ? WHERE id = ?",
          ["Instagram requires an image to publish", target.id]
        );
        continue;
      }
      const result = await publishToInstagram(
        target.platform_account_id,
        target.access_token_enc,
        contentText,
        mediaUrl
      );
      if (result.success) {
        await execute(
          "UPDATE social_post_targets SET status = 'PUBLISHED', platform_post_id = ?, published_at = ? WHERE id = ?",
          [result.postId || "", now, target.id]
        );
      } else {
        allSuccess = false;
        await execute(
          "UPDATE social_post_targets SET status = 'FAILED', error_message = ? WHERE id = ?",
          [result.error || "Instagram publish failed", target.id]
        );
      }
      continue;
    }

    const success = Math.random() > 0.1;
    if (success) {
      await execute(
        "UPDATE social_post_targets SET status = 'PUBLISHED', platform_post_id = ?, published_at = ? WHERE id = ?",
        [`mock_${Date.now()}_${target.id.slice(0, 8)}`, now, target.id]
      );
    } else {
      allSuccess = false;
      await execute(
        "UPDATE social_post_targets SET status = 'FAILED', error_message = ? WHERE id = ?",
        ["Simulated transient error (mock mode)", target.id]
      );
    }
  }

  const finalStatus = targets.length === 0 ? "PUBLISHED" : allSuccess ? "PUBLISHED" : "FAILED";
  await execute("UPDATE social_posts SET status = ?, updated_at = ? WHERE id = ?", [finalStatus, now, postId]);

  if (tempFilePath && fs.existsSync(tempFilePath)) {
    try { fs.unlinkSync(tempFilePath); } catch {}
  }

  await writeAuditLog(workspaceId, userId, finalStatus === "PUBLISHED" ? "PUBLISHED_POST" : "FAILED_POST", "social_post", postId, { targetCount: targets.length, allSuccess });
}
