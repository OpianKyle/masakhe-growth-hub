import { Router, Request, Response, NextFunction } from "express";
import { sqlite } from "../db";
import { requireAuth } from "../auth";
import { randomUUID } from "crypto";

export const workspaceRouter = Router();
workspaceRouter.use(requireAuth);

export type WorkspaceRole = "owner" | "admin" | "editor" | "viewer";

export function getWorkspaceRole(workspaceId: string, userId: string): WorkspaceRole | null {
  const member = sqlite.prepare(
    "SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?"
  ).get(workspaceId, userId) as any;
  return member?.role || null;
}

export function requireWorkspaceRole(...roles: WorkspaceRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const workspaceId = req.params.workspaceId || req.body?.workspaceId || req.query?.workspaceId;
    if (!workspaceId) return res.status(400).json({ error: "workspaceId required" });
    const role = getWorkspaceRole(workspaceId as string, req.session.userId!);
    if (!role) return res.status(403).json({ error: "Not a member of this workspace" });
    if (!roles.includes(role)) return res.status(403).json({ error: `Requires role: ${roles.join(" or ")}` });
    (req as any).workspaceRole = role;
    (req as any).workspaceId = workspaceId;
    next();
  };
}

function ensureDefaultWorkspace(userId: string): string {
  const existing = sqlite.prepare(
    "SELECT w.id FROM workspaces w JOIN workspace_members wm ON wm.workspace_id = w.id WHERE wm.user_id = ? LIMIT 1"
  ).get(userId) as any;
  if (existing) return existing.id;

  const user = sqlite.prepare("SELECT full_name FROM users WHERE id = ?").get(userId) as any;
  const bp = sqlite.prepare("SELECT business_name FROM business_profiles WHERE user_id = ?").get(userId) as any;
  const wsName = bp?.business_name || `${user?.full_name}'s Business`;

  const wsId = randomUUID();
  const now = new Date().toISOString();
  sqlite.prepare("INSERT INTO workspaces (id, name, owner_id, created_at, updated_at) VALUES (?,?,?,?,?)").run(wsId, wsName, userId, now, now);
  sqlite.prepare("INSERT INTO workspace_members (id, workspace_id, user_id, role, created_at) VALUES (?,?,?,?,?)").run(randomUUID(), wsId, userId, "owner", now);
  return wsId;
}

workspaceRouter.get("/mine", (req, res) => {
  try {
    const userId = req.session.userId!;
    const wsId = ensureDefaultWorkspace(userId);
    const workspaces = sqlite.prepare(`
      SELECT w.*, wm.role as my_role,
        (SELECT COUNT(*) FROM workspace_members WHERE workspace_id = w.id) as member_count,
        (SELECT COUNT(*) FROM social_accounts WHERE workspace_id = w.id) as account_count
      FROM workspaces w
      JOIN workspace_members wm ON wm.workspace_id = w.id
      WHERE wm.user_id = ?
      ORDER BY w.created_at ASC
    `).all(userId);
    res.json({ workspaces, defaultId: wsId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

workspaceRouter.get("/:workspaceId/members", requireWorkspaceRole("owner", "admin", "editor", "viewer"), (req, res) => {
  try {
    const members = sqlite.prepare(`
      SELECT wm.id, wm.role, wm.created_at, u.id as user_id, u.email, u.full_name
      FROM workspace_members wm
      JOIN users u ON u.id = wm.user_id
      WHERE wm.workspace_id = ?
      ORDER BY wm.created_at ASC
    `).all(req.params.workspaceId);
    res.json(members);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

workspaceRouter.post("/:workspaceId/members", requireWorkspaceRole("owner", "admin"), (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email || !role) return res.status(400).json({ error: "email and role required" });
    const user = sqlite.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase()) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    const existing = sqlite.prepare("SELECT id FROM workspace_members WHERE workspace_id = ? AND user_id = ?").get(req.params.workspaceId, user.id);
    if (existing) return res.status(400).json({ error: "Already a member" });

    const id = randomUUID();
    sqlite.prepare("INSERT INTO workspace_members (id, workspace_id, user_id, role, created_at) VALUES (?,?,?,?,?)").run(id, req.params.workspaceId, user.id, role, new Date().toISOString());
    res.json({ ok: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

workspaceRouter.patch("/:workspaceId/members/:memberId", requireWorkspaceRole("owner", "admin"), (req, res) => {
  try {
    const { role } = req.body;
    if (!["admin", "editor", "viewer"].includes(role)) return res.status(400).json({ error: "Invalid role" });
    sqlite.prepare("UPDATE workspace_members SET role = ? WHERE id = ? AND workspace_id = ?").run(role, req.params.memberId, req.params.workspaceId);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

workspaceRouter.delete("/:workspaceId/members/:memberId", requireWorkspaceRole("owner", "admin"), (req, res) => {
  try {
    const member = sqlite.prepare("SELECT user_id, role FROM workspace_members WHERE id = ?").get(req.params.memberId) as any;
    if (member?.role === "owner") return res.status(400).json({ error: "Cannot remove owner" });
    sqlite.prepare("DELETE FROM workspace_members WHERE id = ? AND workspace_id = ?").run(req.params.memberId, req.params.workspaceId);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
