import { Router } from "express";
import { sqlite } from "../db";
import { requireAuth } from "../auth";
import { requireWorkspaceRole } from "./workspace";
import { randomUUID } from "crypto";

export const auditRouter = Router();
auditRouter.use(requireAuth);

export function writeAuditLog(
  workspaceId: string,
  actorUserId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, any>
) {
  sqlite.prepare(`
    INSERT INTO audit_logs (id, workspace_id, actor_user_id, action, entity_type, entity_id, metadata, created_at)
    VALUES (?,?,?,?,?,?,?,?)
  `).run(
    randomUUID(), workspaceId, actorUserId, action,
    entityType || null, entityId || null,
    JSON.stringify(metadata || {}), new Date().toISOString()
  );
}

auditRouter.get("/:workspaceId/audit", requireWorkspaceRole("owner", "admin"), (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;

    const logs = sqlite.prepare(`
      SELECT al.*, u.full_name as actor_name, u.email as actor_email
      FROM audit_logs al
      JOIN users u ON u.id = al.actor_user_id
      WHERE al.workspace_id = ?
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?
    `).all(req.params.workspaceId, limit, offset);

    const total = (sqlite.prepare("SELECT COUNT(*) as c FROM audit_logs WHERE workspace_id = ?").get(req.params.workspaceId) as any).c;

    res.json({ logs, total, limit, offset });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

auditRouter.get("/:workspaceId/audit/export", requireWorkspaceRole("owner", "admin"), (req, res) => {
  try {
    const logs = sqlite.prepare(`
      SELECT al.created_at, u.full_name as actor, u.email, al.action, al.entity_type, al.entity_id, al.metadata
      FROM audit_logs al
      JOIN users u ON u.id = al.actor_user_id
      WHERE al.workspace_id = ?
      ORDER BY al.created_at DESC
    `).all(req.params.workspaceId) as any[];

    const header = "Date,Actor,Email,Action,Entity Type,Entity ID,Details\n";
    const rows = logs.map(l =>
      `"${l.created_at}","${l.actor}","${l.email}","${l.action}","${l.entity_type || ""}","${l.entity_id || ""}","${(l.metadata || "").replace(/"/g, '""')}"`
    ).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=audit-log-${req.params.workspaceId}.csv`);
    res.send(header + rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

auditRouter.get("/:workspaceId/report/monthly", requireWorkspaceRole("owner", "admin"), (req, res) => {
  try {
    const wsId = req.params.workspaceId;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const postsPublished = (sqlite.prepare("SELECT COUNT(*) as c FROM social_posts WHERE workspace_id = ? AND status = 'PUBLISHED' AND updated_at BETWEEN ? AND ?").get(wsId, monthStart, monthEnd) as any).c;
    const postsScheduled = (sqlite.prepare("SELECT COUNT(*) as c FROM social_posts WHERE workspace_id = ? AND status = 'SCHEDULED' AND created_at BETWEEN ? AND ?").get(wsId, monthStart, monthEnd) as any).c;
    const postsFailed = (sqlite.prepare("SELECT COUNT(*) as c FROM social_posts WHERE workspace_id = ? AND status = 'FAILED' AND updated_at BETWEEN ? AND ?").get(wsId, monthStart, monthEnd) as any).c;
    const mediaUploaded = (sqlite.prepare("SELECT COUNT(*) as c FROM media_assets WHERE workspace_id = ? AND created_at BETWEEN ? AND ?").get(wsId, monthStart, monthEnd) as any).c;
    const auditActions = (sqlite.prepare("SELECT COUNT(*) as c FROM audit_logs WHERE workspace_id = ? AND created_at BETWEEN ? AND ?").get(wsId, monthStart, monthEnd) as any).c;

    const platformBreakdown = sqlite.prepare(`
      SELECT sa.platform, COUNT(DISTINCT sp.id) as post_count
      FROM social_post_targets spt
      JOIN social_posts sp ON sp.id = spt.social_post_id
      JOIN social_accounts sa ON sa.id = spt.social_account_id
      WHERE sp.workspace_id = ? AND sp.updated_at BETWEEN ? AND ?
      GROUP BY sa.platform
    `).all(wsId, monthStart, monthEnd);

    const consistencyDays = sqlite.prepare(`
      SELECT COUNT(DISTINCT substr(updated_at, 1, 10)) as active_days
      FROM social_posts
      WHERE workspace_id = ? AND status = 'PUBLISHED' AND updated_at BETWEEN ? AND ?
    `).get(wsId, monthStart, monthEnd) as any;

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const consistencyScore = Math.round((consistencyDays.active_days / daysInMonth) * 100);

    res.json({
      month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
      postsPublished, postsScheduled, postsFailed,
      mediaUploaded, auditActions,
      platformBreakdown,
      consistencyScore,
      activeDays: consistencyDays.active_days,
      daysInMonth,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
