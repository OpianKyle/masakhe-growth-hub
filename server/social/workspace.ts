import { Router, Request, Response, NextFunction } from "express";
import { queryOne, queryAll, execute } from "../db";
import { requireAuth } from "../auth";
import { randomUUID, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { sendTeamInviteEmail } from "../email";

// All dashboard sections an owner can grant to a team member.
// Keep in sync with PERMISSION_KEYS on the frontend (TeamMembersPage / DashboardPage).
const ALLOWED_PERMISSIONS = new Set<string>([
  "overview", "website", "social", "biz_connect", "support",
  "finance", "invoices",
  "clients", "campaigns",
  "payroll", "leave",
]);

function sanitizePermissions(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const out: string[] = [];
  for (const p of input) if (typeof p === "string" && ALLOWED_PERMISSIONS.has(p)) out.push(p);
  return Array.from(new Set(out));
}

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
      `SELECT wm.id, wm.role, wm.created_at, wm.permissions, wm.invite_pending,
              u.id as user_id, u.email, u.full_name
       FROM workspace_members wm
       JOIN users u ON u.id = wm.user_id
       WHERE wm.workspace_id = ?
       ORDER BY wm.created_at ASC`,
      [req.params.workspaceId]
    );
    const out = members.map((m: any) => ({
      ...m,
      permissions: (() => { try { return m.permissions ? JSON.parse(m.permissions) : []; } catch { return []; } })(),
      invite_pending: !!m.invite_pending,
    }));
    res.json(out);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function assertPremiumOwner(wsId: string): Promise<void> {
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
    const e: any = new Error("Multi-user is an Enterprize Premium feature. Upgrade to invite teammates.");
    e.status = 403;
    throw e;
  }
}

// Create a new team-member account directly. The owner sets the email,
// full name and permissions; the system creates a user record (no password)
// and emails the invitee a "set your password" link.
workspaceRouter.post("/:workspaceId/members", requireWorkspaceRole("owner", "admin"), async (req, res) => {
  try {
    const wsId = req.params.workspaceId;
    const { email, full_name, permissions } = req.body || {};
    if (!email || !full_name) return res.status(400).json({ error: "Email and full name are required" });

    await assertPremiumOwner(wsId);

    const seatCount = await queryOne("SELECT COUNT(*) as c FROM workspace_members WHERE workspace_id = ?", [wsId]);
    if ((seatCount?.c || 0) >= 4) {
      return res.status(400).json({ error: "Seat limit reached. Enterprize Premium supports up to 4 users." });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const existingUser = await queryOne("SELECT id, parent_owner_id FROM users WHERE email = ?", [cleanEmail]);
    if (existingUser) {
      return res.status(400).json({
        error: "An account with this email already exists. Use a different email address — team-member emails must be unique.",
      });
    }

    const ws = await queryOne("SELECT owner_id FROM workspaces WHERE id = ?", [wsId]);
    if (!ws) return res.status(404).json({ error: "Workspace not found" });
    const ownerId = ws.owner_id;

    const owner = await queryOne(
      "SELECT u.full_name, bp.business_name FROM users u LEFT JOIN business_profiles bp ON bp.user_id = u.id WHERE u.id = ?",
      [ownerId]
    );
    const businessName = owner?.business_name || `${owner?.full_name || "your"}'s Business`;

    // Create user with a placeholder hash that can never match any password.
    const placeholderHash = `!setup-pending!${randomUUID()}`;
    const userId = randomUUID();
    const now = new Date().toISOString();
    await execute(
      `INSERT INTO users (id, email, password_hash, full_name, role, parent_owner_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'user', ?, ?, ?)`,
      [userId, cleanEmail, placeholderHash, full_name.trim(), ownerId, now, now]
    );

    const perms = sanitizePermissions(permissions);
    const memberId = randomUUID();
    await execute(
      "INSERT INTO workspace_members (id, workspace_id, user_id, role, permissions, invite_pending, created_at) VALUES (?,?,?,?,?,?,?)",
      [memberId, wsId, userId, "editor", JSON.stringify(perms), 1, now]
    );

    // Generate a setup token (7-day expiry) using the existing password_reset_tokens table.
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString().slice(0, 19).replace("T", " ");
    await execute(
      "INSERT INTO password_reset_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)",
      [randomUUID(), userId, token, expiresAt]
    );

    sendTeamInviteEmail(cleanEmail, full_name, owner?.full_name || "Your business owner", businessName, token).catch(() => {});

    res.json({ ok: true, id: memberId, user_id: userId, invite_sent: true });
  } catch (err: any) {
    if (err?.status === 403) return res.status(403).json({ error: err.message });
    res.status(500).json({ error: err.message || "Failed to create team member" });
  }
});

// Update a team member's permissions.
workspaceRouter.patch("/:workspaceId/members/:memberId", requireWorkspaceRole("owner", "admin"), async (req, res) => {
  try {
    const { permissions } = req.body || {};
    if (!Array.isArray(permissions)) return res.status(400).json({ error: "permissions array required" });

    const member = await queryOne(
      "SELECT user_id, role FROM workspace_members WHERE id = ? AND workspace_id = ?",
      [req.params.memberId, req.params.workspaceId]
    );
    if (!member) return res.status(404).json({ error: "Member not found" });
    if (member.role === "owner") return res.status(400).json({ error: "Cannot change owner permissions" });

    const perms = sanitizePermissions(permissions);
    await execute(
      "UPDATE workspace_members SET permissions = ? WHERE id = ? AND workspace_id = ?",
      [JSON.stringify(perms), req.params.memberId, req.params.workspaceId]
    );
    res.json({ ok: true, permissions: perms });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Re-send the password setup email (invalidates any prior tokens for this user).
workspaceRouter.post("/:workspaceId/members/:memberId/resend-invite", requireWorkspaceRole("owner", "admin"), async (req, res) => {
  try {
    const member = await queryOne(
      `SELECT wm.user_id, u.email, u.full_name, u.parent_owner_id
       FROM workspace_members wm JOIN users u ON u.id = wm.user_id
       WHERE wm.id = ? AND wm.workspace_id = ?`,
      [req.params.memberId, req.params.workspaceId]
    );
    if (!member) return res.status(404).json({ error: "Member not found" });

    const owner = await queryOne(
      "SELECT u.full_name, bp.business_name FROM users u LEFT JOIN business_profiles bp ON bp.user_id = u.id WHERE u.id = ?",
      [member.parent_owner_id]
    );
    const businessName = owner?.business_name || `${owner?.full_name || "your"}'s Business`;

    await execute("UPDATE password_reset_tokens SET used = 1 WHERE user_id = ? AND used = 0", [member.user_id]);
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString().slice(0, 19).replace("T", " ");
    await execute(
      "INSERT INTO password_reset_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)",
      [randomUUID(), member.user_id, token, expiresAt]
    );
    await execute("UPDATE workspace_members SET invite_pending = 1 WHERE id = ?", [req.params.memberId]);

    sendTeamInviteEmail(member.email, member.full_name, owner?.full_name || "Your business owner", businessName, token).catch(() => {});
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Remove a team member. Also deletes their user record because team-member
// accounts have no independent existence outside the owner's business.
workspaceRouter.delete("/:workspaceId/members/:memberId", requireWorkspaceRole("owner", "admin"), async (req, res) => {
  try {
    const member = await queryOne(
      "SELECT user_id, role FROM workspace_members WHERE id = ? AND workspace_id = ?",
      [req.params.memberId, req.params.workspaceId]
    );
    if (!member) return res.status(404).json({ error: "Member not found" });
    if (member.role === "owner") return res.status(400).json({ error: "Cannot remove owner" });

    await execute("DELETE FROM workspace_members WHERE id = ? AND workspace_id = ?", [req.params.memberId, req.params.workspaceId]);

    // If this user was created as a team-member (parent_owner_id set) and has no other workspace memberships,
    // delete the user record + any setup tokens.
    const u = await queryOne("SELECT parent_owner_id FROM users WHERE id = ?", [member.user_id]);
    if (u?.parent_owner_id) {
      const otherMemberships = await queryOne(
        "SELECT COUNT(*) as c FROM workspace_members WHERE user_id = ?",
        [member.user_id]
      );
      if ((otherMemberships?.c || 0) === 0) {
        await execute("DELETE FROM password_reset_tokens WHERE user_id = ?", [member.user_id]);
        await execute("DELETE FROM users WHERE id = ?", [member.user_id]);
      }
    }
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
