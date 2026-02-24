import { Router } from "express";
import { sqlite } from "../db";
import { requireAuth } from "../auth";
import { requireWorkspaceRole } from "./workspace";
import { encrypt, decrypt } from "../crypto";
import { writeAuditLog } from "./audit";
import { randomUUID } from "crypto";

export const accountsRouter = Router();
accountsRouter.use(requireAuth);

const MOCK_MODE = !process.env.META_APP_ID && !process.env.LINKEDIN_CLIENT_ID;

accountsRouter.get("/:workspaceId/accounts", requireWorkspaceRole("owner", "admin", "editor", "viewer"), (req, res) => {
  try {
    const accounts = sqlite.prepare(`
      SELECT id, workspace_id, platform, account_name, platform_account_id, is_mock,
             token_expires_at, connected_by_user_id, created_at, updated_at
      FROM social_accounts WHERE workspace_id = ?
      ORDER BY created_at DESC
    `).all(req.params.workspaceId);
    res.json({ accounts, mockMode: MOCK_MODE });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

accountsRouter.post("/:workspaceId/accounts/connect", requireWorkspaceRole("owner", "admin"), (req, res) => {
  try {
    const { platform, accountName } = req.body;
    if (!platform || !accountName) return res.status(400).json({ error: "platform and accountName required" });

    const validPlatforms = ["META_FACEBOOK", "META_INSTAGRAM", "LINKEDIN", "X"];
    if (!validPlatforms.includes(platform)) return res.status(400).json({ error: "Invalid platform" });

    const id = randomUUID();
    const now = new Date().toISOString();
    const mockToken = encrypt(`mock_token_${platform}_${Date.now()}`);

    sqlite.prepare(`
      INSERT INTO social_accounts (id, workspace_id, platform, account_name, platform_account_id,
        access_token_enc, refresh_token_enc, token_expires_at, connected_by_user_id, is_mock, created_at, updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      id, req.params.workspaceId, platform, accountName,
      `mock_${platform.toLowerCase()}_${Date.now()}`,
      mockToken, null, null,
      req.session.userId!, MOCK_MODE ? 1 : 0, now, now
    );

    writeAuditLog(req.params.workspaceId, req.session.userId!, "CONNECTED_ACCOUNT", "social_account", id, { platform, accountName, mock: MOCK_MODE });

    res.json({ ok: true, id, mockMode: MOCK_MODE });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

accountsRouter.post("/:workspaceId/accounts/oauth/meta/start", requireWorkspaceRole("owner", "admin"), (req, res) => {
  if (!process.env.META_APP_ID || !process.env.META_APP_SECRET) {
    return res.json({ mockMode: true, message: "Meta credentials not configured. Using mock mode." });
  }
  const redirectUri = `${process.env.APP_URL || "http://localhost:5000"}/api/social/oauth/meta/callback`;
  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${process.env.META_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=pages_show_list,pages_manage_posts,instagram_basic,instagram_content_publish&state=${req.params.workspaceId}`;
  res.json({ authUrl });
});

accountsRouter.post("/:workspaceId/accounts/oauth/linkedin/start", requireWorkspaceRole("owner", "admin"), (req, res) => {
  if (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_CLIENT_SECRET) {
    return res.json({ mockMode: true, message: "LinkedIn credentials not configured. Using mock mode." });
  }
  const redirectUri = `${process.env.APP_URL || "http://localhost:5000"}/api/social/oauth/linkedin/callback`;
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=w_member_social%20r_liteprofile&state=${req.params.workspaceId}`;
  res.json({ authUrl });
});

accountsRouter.delete("/:workspaceId/accounts/:accountId", requireWorkspaceRole("owner", "admin"), (req, res) => {
  try {
    const account = sqlite.prepare("SELECT * FROM social_accounts WHERE id = ? AND workspace_id = ?").get(req.params.accountId, req.params.workspaceId) as any;
    if (!account) return res.status(404).json({ error: "Account not found" });

    sqlite.prepare("DELETE FROM social_post_targets WHERE social_account_id = ?").run(req.params.accountId);
    sqlite.prepare("DELETE FROM social_accounts WHERE id = ?").run(req.params.accountId);

    writeAuditLog(req.params.workspaceId, req.session.userId!, "DISCONNECTED_ACCOUNT", "social_account", req.params.accountId, { platform: account.platform });

    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
