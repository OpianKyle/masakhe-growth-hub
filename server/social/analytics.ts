import { Router } from "express";
import { queryOne, queryAll } from "../db";
import { requireAuth } from "../auth";
import { requireWorkspaceRole } from "./workspace";

export const analyticsRouter = Router();
analyticsRouter.use(requireAuth);

analyticsRouter.get("/:workspaceId/analytics", requireWorkspaceRole("owner", "admin", "editor", "viewer"), async (req, res) => {
  try {
    const wsId = req.params.workspaceId;

    const totalPosts = (await queryOne("SELECT COUNT(*) as c FROM social_posts WHERE workspace_id = ?", [wsId]))?.c || 0;
    const publishedPosts = (await queryOne("SELECT COUNT(*) as c FROM social_posts WHERE workspace_id = ? AND status = 'PUBLISHED'", [wsId]))?.c || 0;
    const scheduledPosts = (await queryOne("SELECT COUNT(*) as c FROM social_posts WHERE workspace_id = ? AND status = 'SCHEDULED'", [wsId]))?.c || 0;
    const failedPosts = (await queryOne("SELECT COUNT(*) as c FROM social_posts WHERE workspace_id = ? AND status = 'FAILED'", [wsId]))?.c || 0;
    const draftPosts = (await queryOne("SELECT COUNT(*) as c FROM social_posts WHERE workspace_id = ? AND status = 'DRAFT'", [wsId]))?.c || 0;
    const connectedAccounts = (await queryOne("SELECT COUNT(*) as c FROM social_accounts WHERE workspace_id = ?", [wsId]))?.c || 0;
    const mediaCount = (await queryOne("SELECT COUNT(*) as c FROM media_assets WHERE workspace_id = ?", [wsId]))?.c || 0;

    const postsByPlatform = await queryAll(
      `SELECT sa.platform, COUNT(DISTINCT spt.social_post_id) as post_count,
             SUM(CASE WHEN spt.status = 'PUBLISHED' THEN 1 ELSE 0 END) as published_count,
             SUM(CASE WHEN spt.status = 'FAILED' THEN 1 ELSE 0 END) as failed_count
       FROM social_post_targets spt
       JOIN social_accounts sa ON sa.id = spt.social_account_id
       JOIN social_posts sp ON sp.id = spt.social_post_id
       WHERE sp.workspace_id = ?
       GROUP BY sa.platform`,
      [wsId]
    );

    const postsByDay = await queryAll(
      `SELECT LEFT(COALESCE(updated_at, created_at), 10) as day, COUNT(*) as count
       FROM social_posts
       WHERE workspace_id = ? AND status = 'PUBLISHED'
       GROUP BY day
       ORDER BY day DESC
       LIMIT 30`,
      [wsId]
    );

    const recentPosts = await queryAll(
      `SELECT sp.id, sp.content_text, sp.status, sp.updated_at, sp.created_at, u.full_name as creator
       FROM social_posts sp
       JOIN users u ON u.id = sp.created_by_user_id
       WHERE sp.workspace_id = ? AND sp.status = 'PUBLISHED'
       ORDER BY sp.updated_at DESC
       LIMIT 10`,
      [wsId]
    );

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
