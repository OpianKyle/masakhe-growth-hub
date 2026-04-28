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
    if (!["admin", "editor", "viewer"].includes(role)) return res.status(400).json({ error: "Invalid role" });

    // Enforce per-plan seat limit. Only Enterprize Premium supports multi-user (up to 4 seats total).
    const wsId = req.params.workspaceId;
    const owner = await queryOne(
      "SELECT u.id, u.role, u.subscription_exempt FROM users u JOIN workspaces w ON w.owner_id = u.id WHERE w.id = ? LIMIT 1",
      [wsId]
    );
    let planCode: string | null = null;
    if (owner?.role === "admin" || owner?.subscription_exempt) {
      planCode = "premium";
    } else {
      const sub = await queryOne(
        `SELECT bp.code FROM billing_subscriptions bs
         JOIN billing_plans bp ON bp.id = bs.plan_id
         WHERE bs.workspace_id = ?
           AND bs.status IN ('ACTIVE','PAST_DUE','TRIAL')
           AND (bs.status != 'TRIAL' OR bs.trial_end_at > NOW())
         ORDER BY bs.created_at DESC LIMIT 1`,
        [wsId]
      );
      planCode = sub?.code || null;
    }
    if (planCode !== "premium") {
      return res.status(403).json({ error: "Multi-user is an Enterprize Premium feature. Upgrade to invite teammates." });
    }
    const seatCount = await queryOne("SELECT COUNT(*) as c FROM workspace_members WHERE workspace_id = ?", [wsId]);
    if ((seatCount?.c || 0) >= 4) {
      return res.status(400).json({ error: "Seat limit reached. Enterprize Premium supports up to 4 users." });
    }

    const user = await queryOne("SELECT id FROM users WHERE email = ?", [email.toLowerCase()]);
    if (!user) return res.status(404).json({ error: "No Masakhe account found for this email. Ask them to sign up first." });

    const existing = await queryOne("SELECT id FROM workspace_members WHERE workspace_id = ? AND user_id = ?", [wsId, user.id]);
    if (existing) return res.status(400).json({ error: "Already a member" });

    const id = randomUUID();
    await execute("INSERT INTO workspace_members (id, workspace_id, user_id, role, created_at) VALUES (?,?,?,?,?)", [id, wsId, user.id, role, new Date().toISOString()]);
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
