import { Router } from "express";
import { queryOne, queryAll, execute } from "../db";
import { requireAuth } from "../auth";
import { requireWorkspaceRole } from "./workspace";
import { requireActiveSubscription } from "../feature-gate";
import { writeAuditLog } from "./audit";
import { randomUUID } from "crypto";

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
    `SELECT spt.*, sa.is_mock, sa.platform, sa.account_name
     FROM social_post_targets spt
     JOIN social_accounts sa ON sa.id = spt.social_account_id
     WHERE spt.social_post_id = ?`,
    [postId]
  );

  let allSuccess = true;
  const now = new Date().toISOString();

  for (const target of targets) {
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

  await writeAuditLog(workspaceId, userId, finalStatus === "PUBLISHED" ? "PUBLISHED_POST" : "FAILED_POST", "social_post", postId, { targetCount: targets.length, allSuccess });
}
