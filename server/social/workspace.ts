import { Router, Request, Response, NextFunction } from "express";
import { queryOne, queryAll, execute } from "../db";
import { requireAuth } from "../auth";
import { randomUUID } from "crypto";

export const workspaceRouter = Router();
workspaceRouter.use(requireAuth);

export type WorkspaceRole = "owner" | "admin" | "editor" | "viewer";

export async function getWorkspaceRole(workspaceId: string, userId: string): Promise<WorkspaceRole | null> {
  const member = await queryOne(
    "SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?",
    [workspaceId, userId]
  );
  return member?.role || null;
}

export function requireWorkspaceRole(...roles: WorkspaceRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const workspaceId = req.params.workspaceId || req.body?.workspaceId || req.query?.workspaceId;
    if (!workspaceId) return res.status(400).json({ error: "workspaceId required" });
    const role = await getWorkspaceRole(workspaceId as string, req.session.userId!);
    if (!role) return res.status(403).json({ error: "Not a member of this workspace" });
    if (!roles.includes(role)) return res.status(403).json({ error: `Requires role: ${roles.join(" or ")}` });
    (req as any).workspaceRole = role;
    (req as any).workspaceId = workspaceId;
    next();
  };
}

async function ensureDefaultWorkspace(userId: string): Promise<string> {
  const existing = await queryOne(
    "SELECT w.id FROM workspaces w JOIN workspace_members wm ON wm.workspace_id = w.id WHERE wm.user_id = ? LIMIT 1",
    [userId]
  );
  if (existing) return existing.id;

  const user = await queryOne("SELECT full_name FROM users WHERE id = ?", [userId]);
  const bp = await queryOne("SELECT business_name FROM business_profiles WHERE user_id = ?", [userId]);
  const wsName = bp?.business_name || `${user?.full_name}'s Business`;

  const wsId = randomUUID();
  const now = new Date().toISOString();
  await execute("INSERT INTO workspaces (id, name, owner_id, created_at, updated_at) VALUES (?,?,?,?,?)", [wsId, wsName, userId, now, now]);
  await execute("INSERT INTO workspace_members (id, workspace_id, user_id, role, created_at) VALUES (?,?,?,?,?)", [randomUUID(), wsId, userId, "owner", now]);
  return wsId;
}

workspaceRouter.get("/mine", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const wsId = await ensureDefaultWorkspace(userId);
    const workspaces = await queryAll(
      `SELECT w.*, wm.role as my_role,
        (SELECT COUNT(*) FROM workspace_members WHERE workspace_id = w.id) as member_count,
        (SELECT COUNT(*) FROM social_accounts WHERE workspace_id = w.id) as account_count
       FROM workspaces w
       JOIN workspace_members wm ON wm.workspace_id = w.id
       WHERE wm.user_id = ?
       ORDER BY w.created_at ASC`,
      [userId]
    );
    res.json({ workspaces, defaultId: wsId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

workspaceRouter.get("/:workspaceId/members", requireWorkspaceRole("owner", "admin", "editor", "viewer"), async (req, res) => {
  try {
    const members = await queryAll(
      `SELECT wm.id, wm.role, wm.created_at, u.id as user_id, u.email, u.full_name
       FROM workspace_members wm
       JOIN users u ON u.id = wm.user_id
       WHERE wm.workspace_id = ?
       ORDER BY wm.created_at ASC`,
      [req.params.workspaceId]
    );
    res.json(members);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

workspaceRouter.post("/:workspaceId/members", requireWorkspaceRole("owner", "admin"), async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email || !role) return res.status(400).json({ error: "email and role required" });
    const user = await queryOne("SELECT id FROM users WHERE email = ?", [email.toLowerCase()]);
    if (!user) return res.status(404).json({ error: "User not found" });

    const existing = await queryOne("SELECT id FROM workspace_members WHERE workspace_id = ? AND user_id = ?", [req.params.workspaceId, user.id]);
    if (existing) return res.status(400).json({ error: "Already a member" });

    const id = randomUUID();
    await execute("INSERT INTO workspace_members (id, workspace_id, user_id, role, created_at) VALUES (?,?,?,?,?)", [id, req.params.workspaceId, user.id, role, new Date().toISOString()]);
    res.json({ ok: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

workspaceRouter.patch("/:workspaceId/members/:memberId", requireWorkspaceRole("owner", "admin"), async (req, res) => {
  try {
    const { role } = req.body;
    if (!["admin", "editor", "viewer"].includes(role)) return res.status(400).json({ error: "Invalid role" });
    await execute("UPDATE workspace_members SET role = ? WHERE id = ? AND workspace_id = ?", [role, req.params.memberId, req.params.workspaceId]);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

workspaceRouter.delete("/:workspaceId/members/:memberId", requireWorkspaceRole("owner", "admin"), async (req, res) => {
  try {
    const member = await queryOne("SELECT user_id, role FROM workspace_members WHERE id = ?", [req.params.memberId]);
    if (member?.role === "owner") return res.status(400).json({ error: "Cannot remove owner" });
    await execute("DELETE FROM workspace_members WHERE id = ? AND workspace_id = ?", [req.params.memberId, req.params.workspaceId]);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
