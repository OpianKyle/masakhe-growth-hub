import { Router } from "express";
import { sqlite } from "../db";
import { requireAuth } from "../auth";
import { requireWorkspaceRole } from "./workspace";

export const analyticsRouter = Router();
analyticsRouter.use(requireAuth);

analyticsRouter.get("/:workspaceId/analytics", requireWorkspaceRole("owner", "admin", "editor", "viewer"), (req, res) => {
  try {
    const wsId = req.params.workspaceId;

    const totalPosts = (sqlite.prepare("SELECT COUNT(*) as c FROM social_posts WHERE workspace_id = ?").get(wsId) as any).c;
    const publishedPosts = (sqlite.prepare("SELECT COUNT(*) as c FROM social_posts WHERE workspace_id = ? AND status = 'PUBLISHED'").get(wsId) as any).c;
    const scheduledPosts = (sqlite.prepare("SELECT COUNT(*) as c FROM social_posts WHERE workspace_id = ? AND status = 'SCHEDULED'").get(wsId) as any).c;
    const failedPosts = (sqlite.prepare("SELECT COUNT(*) as c FROM social_posts WHERE workspace_id = ? AND status = 'FAILED'").get(wsId) as any).c;
    const draftPosts = (sqlite.prepare("SELECT COUNT(*) as c FROM social_posts WHERE workspace_id = ? AND status = 'DRAFT'").get(wsId) as any).c;
    const connectedAccounts = (sqlite.prepare("SELECT COUNT(*) as c FROM social_accounts WHERE workspace_id = ?").get(wsId) as any).c;
    const mediaCount = (sqlite.prepare("SELECT COUNT(*) as c FROM media_assets WHERE workspace_id = ?").get(wsId) as any).c;

    const postsByPlatform = sqlite.prepare(`
      SELECT sa.platform, COUNT(DISTINCT spt.social_post_id) as post_count,
             SUM(CASE WHEN spt.status = 'PUBLISHED' THEN 1 ELSE 0 END) as published_count,
             SUM(CASE WHEN spt.status = 'FAILED' THEN 1 ELSE 0 END) as failed_count
      FROM social_post_targets spt
      JOIN social_accounts sa ON sa.id = spt.social_account_id
      JOIN social_posts sp ON sp.id = spt.social_post_id
      WHERE sp.workspace_id = ?
      GROUP BY sa.platform
    `).all(wsId);

    const postsByDay = sqlite.prepare(`
      SELECT substr(COALESCE(updated_at, created_at), 1, 10) as day, COUNT(*) as count
      FROM social_posts
      WHERE workspace_id = ? AND status = 'PUBLISHED'
      GROUP BY day
      ORDER BY day DESC
      LIMIT 30
    `).all(wsId);

    const recentPosts = sqlite.prepare(`
      SELECT sp.id, sp.content_text, sp.status, sp.updated_at, sp.created_at, u.full_name as creator
      FROM social_posts sp
      JOIN users u ON u.id = sp.created_by_user_id
      WHERE sp.workspace_id = ? AND sp.status = 'PUBLISHED'
      ORDER BY sp.updated_at DESC
      LIMIT 10
    `).all(wsId);

    res.json({
      overview: { totalPosts, publishedPosts, scheduledPosts, failedPosts, draftPosts, connectedAccounts, mediaCount },
      postsByPlatform,
      postsByDay: (postsByDay as any[]).reverse(),
      recentPosts,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
