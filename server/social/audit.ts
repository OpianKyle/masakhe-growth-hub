import { Router } from "express";
import { queryOne, queryAll, execute } from "../db";
import { requireAuth } from "../auth";
import { requireWorkspaceRole } from "./workspace";
import { randomUUID } from "crypto";

export const auditRouter = Router();
auditRouter.use(requireAuth);

export async function writeAuditLog(
  workspaceId: string,
  actorUserId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, any>
) {
  await execute(
    `INSERT INTO audit_logs (id, workspace_id, actor_user_id, action, entity_type, entity_id, metadata, created_at)
     VALUES (?,?,?,?,?,?,?,?)`,
    [
      randomUUID(), workspaceId, actorUserId, action,
      entityType || null, entityId || null,
      JSON.stringify(metadata || {}), new Date().toISOString()
    ]
  );
}

auditRouter.get("/:workspaceId/audit", requireWorkspaceRole("owner", "admin"), async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;

    const logs = await queryAll(
      `SELECT al.*, u.full_name as actor_name, u.email as actor_email
       FROM audit_logs al
       JOIN users u ON u.id = al.actor_user_id
       WHERE al.workspace_id = ?
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.params.workspaceId, limit, offset]
    );

    const total = (await queryOne("SELECT COUNT(*) as c FROM audit_logs WHERE workspace_id = ?", [req.params.workspaceId]))?.c || 0;

    res.json({ logs, total, limit, offset });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

auditRouter.get("/:workspaceId/audit/export", requireWorkspaceRole("owner", "admin"), async (req, res) => {
  try {
    const logs = await queryAll(
      `SELECT al.created_at, u.full_name as actor, u.email, al.action, al.entity_type, al.entity_id, al.metadata
       FROM audit_logs al
       JOIN users u ON u.id = al.actor_user_id
       WHERE al.workspace_id = ?
       ORDER BY al.created_at DESC`,
      [req.params.workspaceId]
    );

    const header = "Date,Actor,Email,Action,Entity Type,Entity ID,Details\n";
    const rows = logs.map((l: any) =>
      `"${l.created_at}","${l.actor}","${l.email}","${l.action}","${l.entity_type || ""}","${l.entity_id || ""}","${(l.metadata || "").toString().replace(/"/g, '""')}"`
    ).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=audit-log-${req.params.workspaceId}.csv`);
    res.send(header + rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

auditRouter.get("/:workspaceId/report/monthly", requireWorkspaceRole("owner", "admin"), async (req, res) => {
  try {
    const wsId = req.params.workspaceId;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const postsPublished = (await queryOne("SELECT COUNT(*) as c FROM social_posts WHERE workspace_id = ? AND status = 'PUBLISHED' AND updated_at BETWEEN ? AND ?", [wsId, monthStart, monthEnd]))?.c || 0;
    const postsScheduled = (await queryOne("SELECT COUNT(*) as c FROM social_posts WHERE workspace_id = ? AND status = 'SCHEDULED' AND created_at BETWEEN ? AND ?", [wsId, monthStart, monthEnd]))?.c || 0;
    const postsFailed = (await queryOne("SELECT COUNT(*) as c FROM social_posts WHERE workspace_id = ? AND status = 'FAILED' AND updated_at BETWEEN ? AND ?", [wsId, monthStart, monthEnd]))?.c || 0;
    const mediaUploaded = (await queryOne("SELECT COUNT(*) as c FROM media_assets WHERE workspace_id = ? AND created_at BETWEEN ? AND ?", [wsId, monthStart, monthEnd]))?.c || 0;
    const auditActions = (await queryOne("SELECT COUNT(*) as c FROM audit_logs WHERE workspace_id = ? AND created_at BETWEEN ? AND ?", [wsId, monthStart, monthEnd]))?.c || 0;

    const platformBreakdown = await queryAll(
      `SELECT sa.platform, COUNT(DISTINCT sp.id) as post_count
       FROM social_post_targets spt
       JOIN social_posts sp ON sp.id = spt.social_post_id
       JOIN social_accounts sa ON sa.id = spt.social_account_id
       WHERE sp.workspace_id = ? AND sp.updated_at BETWEEN ? AND ?
       GROUP BY sa.platform`,
      [wsId, monthStart, monthEnd]
    );

    const consistencyDays = await queryOne(
      `SELECT COUNT(DISTINCT LEFT(updated_at, 10)) as active_days
       FROM social_posts
       WHERE workspace_id = ? AND status = 'PUBLISHED' AND updated_at BETWEEN ? AND ?`,
      [wsId, monthStart, monthEnd]
    );

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const consistencyScore = Math.round(((consistencyDays?.active_days || 0) / daysInMonth) * 100);

    res.json({
      month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
      postsPublished, postsScheduled, postsFailed,
      mediaUploaded, auditActions,
      platformBreakdown,
      consistencyScore,
      activeDays: consistencyDays?.active_days || 0,
      daysInMonth,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
