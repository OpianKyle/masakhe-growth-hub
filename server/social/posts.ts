import { Router } from "express";
import { sqlite } from "../db";
import { requireAuth } from "../auth";
import { requireWorkspaceRole } from "./workspace";
import { writeAuditLog } from "./audit";
import { randomUUID } from "crypto";

export const postsRouter = Router();
postsRouter.use(requireAuth);

postsRouter.get("/:workspaceId/posts", requireWorkspaceRole("owner", "admin", "editor", "viewer"), (req, res) => {
  try {
    const { status, month } = req.query;
    let query = "SELECT sp.*, u.full_name as creator_name FROM social_posts sp JOIN users u ON u.id = sp.created_by_user_id WHERE sp.workspace_id = ?";
    const params: any[] = [req.params.workspaceId];

    if (status) { query += " AND sp.status = ?"; params.push(status); }
    if (month) { query += " AND substr(COALESCE(sp.scheduled_at, sp.created_at), 1, 7) = ?"; params.push(month); }

    query += " ORDER BY COALESCE(sp.scheduled_at, sp.created_at) DESC LIMIT 200";

    const posts = sqlite.prepare(query).all(...params) as any[];

    const postIds = posts.map(p => p.id);
    const targets = postIds.length > 0
      ? sqlite.prepare(`
          SELECT spt.*, sa.account_name, sa.platform as account_platform
          FROM social_post_targets spt
          JOIN social_accounts sa ON sa.id = spt.social_account_id
          WHERE spt.social_post_id IN (${postIds.map(() => "?").join(",")})
        `).all(...postIds) as any[]
      : [];

    const targetMap: Record<string, any[]> = {};
    for (const t of targets) {
      if (!targetMap[t.social_post_id]) targetMap[t.social_post_id] = [];
      targetMap[t.social_post_id].push(t);
    }

    const result = posts.map(p => ({
      ...p,
      media_asset_ids: JSON.parse(p.media_asset_ids || "[]"),
      targets: targetMap[p.id] || [],
    }));

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

postsRouter.get("/:workspaceId/posts/:postId", requireWorkspaceRole("owner", "admin", "editor", "viewer"), (req, res) => {
  try {
    const post = sqlite.prepare("SELECT * FROM social_posts WHERE id = ? AND workspace_id = ?").get(req.params.postId, req.params.workspaceId) as any;
    if (!post) return res.status(404).json({ error: "Post not found" });

    const targets = sqlite.prepare(`
      SELECT spt.*, sa.account_name
      FROM social_post_targets spt
      JOIN social_accounts sa ON sa.id = spt.social_account_id
      WHERE spt.social_post_id = ?
    `).all(post.id);

    res.json({ ...post, media_asset_ids: JSON.parse(post.media_asset_ids || "[]"), targets });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

postsRouter.post("/:workspaceId/posts", requireWorkspaceRole("owner", "admin", "editor"), (req, res) => {
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

    sqlite.prepare(`
      INSERT INTO social_posts (id, workspace_id, created_by_user_id, content_text, media_asset_ids, scheduled_at, status, idempotency_key, created_at, updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?)
    `).run(postId, req.params.workspaceId, req.session.userId!, contentText || "", JSON.stringify(mediaAssetIds || []), scheduledAt || null, status, idempotencyKey, now, now);

    if (targetAccountIds && targetAccountIds.length > 0) {
      const insertTarget = sqlite.prepare(`
        INSERT INTO social_post_targets (id, social_post_id, social_account_id, platform, status)
        VALUES (?,?,?,?,?)
      `);

      for (const accountId of targetAccountIds) {
        const account = sqlite.prepare("SELECT platform FROM social_accounts WHERE id = ? AND workspace_id = ?").get(accountId, req.params.workspaceId) as any;
        if (account) {
          insertTarget.run(randomUUID(), postId, accountId, account.platform, status === "PUBLISHING" ? "PUBLISHING" : "SCHEDULED");
        }
      }
    }

    const auditAction = status === "SCHEDULED" ? "SCHEDULED_POST" : status === "PUBLISHING" ? "PUBLISHED_POST" : "CREATED_POST";
    writeAuditLog(req.params.workspaceId, req.session.userId!, auditAction, "social_post", postId, { status, targetCount: targetAccountIds?.length || 0 });

    if (status === "PUBLISHING") {
      publishPostNow(postId, req.params.workspaceId, req.session.userId!);
    }

    res.json({ ok: true, id: postId, status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

postsRouter.put("/:workspaceId/posts/:postId", requireWorkspaceRole("owner", "admin", "editor"), (req, res) => {
  try {
    const post = sqlite.prepare("SELECT * FROM social_posts WHERE id = ? AND workspace_id = ?").get(req.params.postId, req.params.workspaceId) as any;
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (!["DRAFT", "SCHEDULED", "FAILED"].includes(post.status)) {
      return res.status(400).json({ error: "Cannot edit a post that is already publishing or published" });
    }

    const { contentText, mediaAssetIds, scheduledAt, targetAccountIds, action } = req.body;
    let status = post.status;
    if (action === "schedule" && scheduledAt) status = "SCHEDULED";
    if (action === "draft") status = "DRAFT";

    sqlite.prepare(`
      UPDATE social_posts SET content_text = ?, media_asset_ids = ?, scheduled_at = ?, status = ?, updated_at = ?
      WHERE id = ?
    `).run(contentText || post.content_text, JSON.stringify(mediaAssetIds || []), scheduledAt || null, status, new Date().toISOString(), req.params.postId);

    if (targetAccountIds) {
      sqlite.prepare("DELETE FROM social_post_targets WHERE social_post_id = ?").run(req.params.postId);
      const insertTarget = sqlite.prepare("INSERT INTO social_post_targets (id, social_post_id, social_account_id, platform, status) VALUES (?,?,?,?,?)");
      for (const accountId of targetAccountIds) {
        const account = sqlite.prepare("SELECT platform FROM social_accounts WHERE id = ? AND workspace_id = ?").get(accountId, req.params.workspaceId) as any;
        if (account) {
          insertTarget.run(randomUUID(), req.params.postId, accountId, account.platform, "SCHEDULED");
        }
      }
    }

    writeAuditLog(req.params.workspaceId, req.session.userId!, "UPDATED_POST", "social_post", req.params.postId, { status });
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

postsRouter.delete("/:workspaceId/posts/:postId", requireWorkspaceRole("owner", "admin", "editor"), (req, res) => {
  try {
    const post = sqlite.prepare("SELECT status FROM social_posts WHERE id = ? AND workspace_id = ?").get(req.params.postId, req.params.workspaceId) as any;
    if (!post) return res.status(404).json({ error: "Post not found" });

    sqlite.prepare("DELETE FROM social_post_targets WHERE social_post_id = ?").run(req.params.postId);
    sqlite.prepare("DELETE FROM social_posts WHERE id = ?").run(req.params.postId);

    writeAuditLog(req.params.workspaceId, req.session.userId!, "DELETED_POST", "social_post", req.params.postId, {});
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export function publishPostNow(postId: string, workspaceId: string, userId: string) {
  const targets = sqlite.prepare(`
    SELECT spt.*, sa.is_mock, sa.platform, sa.account_name
    FROM social_post_targets spt
    JOIN social_accounts sa ON sa.id = spt.social_account_id
    WHERE spt.social_post_id = ?
  `).all(postId) as any[];

  let allSuccess = true;
  const now = new Date().toISOString();

  for (const target of targets) {
    const success = Math.random() > 0.1;
    if (success) {
      sqlite.prepare("UPDATE social_post_targets SET status = 'PUBLISHED', platform_post_id = ?, published_at = ? WHERE id = ?").run(`mock_${Date.now()}_${target.id.slice(0, 8)}`, now, target.id);
    } else {
      allSuccess = false;
      sqlite.prepare("UPDATE social_post_targets SET status = 'FAILED', error_message = ? WHERE id = ?").run("Simulated transient error (mock mode)", target.id);
    }
  }

  const finalStatus = targets.length === 0 ? "PUBLISHED" : allSuccess ? "PUBLISHED" : "FAILED";
  sqlite.prepare("UPDATE social_posts SET status = ?, updated_at = ? WHERE id = ?").run(finalStatus, now, postId);

  writeAuditLog(workspaceId, userId, finalStatus === "PUBLISHED" ? "PUBLISHED_POST" : "FAILED_POST", "social_post", postId, { targetCount: targets.length, allSuccess });
}
