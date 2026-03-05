import { Router, Request, Response } from "express";
import { queryOne, queryAll, execute } from "../db";
import { encrypt, decrypt } from "../crypto";
import { writeAuditLog } from "./audit";
import { randomUUID } from "crypto";

export const metaOAuthRouter = Router();

const META_GRAPH_URL = "https://graph.facebook.com/v19.0";

function getRedirectUri() {
  return `${process.env.APP_URL || "http://localhost:5000"}/api/social/oauth/meta/callback`;
}

metaOAuthRouter.get("/oauth/meta/callback", async (req: Request, res: Response) => {
  try {
    const { code, state, error, error_description } = req.query;

    if (error) {
      return res.redirect(
        `/dashboard/social?error=${encodeURIComponent((error_description as string) || "Authorization denied")}`
      );
    }

    if (!code || !state) {
      return res.redirect("/dashboard/social?error=Missing+authorization+code");
    }

    const userId = req.session.userId;
    if (!userId) {
      return res.redirect("/login");
    }

    const workspaceId = state as string;

    const membership = await queryOne(
      "SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?",
      [workspaceId, userId]
    );
    if (!membership) {
      return res.redirect("/dashboard/social?error=Workspace+access+denied");
    }

    const tokenUrl = `${META_GRAPH_URL}/oauth/access_token?client_id=${process.env.META_APP_ID}&redirect_uri=${encodeURIComponent(getRedirectUri())}&client_secret=${process.env.META_APP_SECRET}&code=${code}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error("Meta token exchange error:", tokenData.error);
      return res.redirect(
        `/dashboard/social?error=${encodeURIComponent(tokenData.error.message || "Token exchange failed")}`
      );
    }

    const shortLivedToken = tokenData.access_token;

    const longLivedUrl = `${META_GRAPH_URL}/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&fb_exchange_token=${shortLivedToken}`;
    const longLivedRes = await fetch(longLivedUrl);
    const longLivedData = await longLivedRes.json();

    const userAccessToken = longLivedData.access_token || shortLivedToken;
    const expiresIn = longLivedData.expires_in || 5184000;
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    const pagesRes = await fetch(
      `${META_GRAPH_URL}/me/accounts?fields=id,name,access_token,category,instagram_business_account&access_token=${userAccessToken}`
    );
    const pagesData = await pagesRes.json();

    if (!pagesData.data || pagesData.data.length === 0) {
      return res.redirect(
        "/dashboard/social?error=No+Facebook+Pages+found.+Make+sure+your+Facebook+account+manages+at+least+one+Page."
      );
    }

    const now = new Date().toISOString();
    let connectedCount = 0;

    for (const page of pagesData.data) {
      const existing = await queryOne(
        "SELECT id FROM social_accounts WHERE workspace_id = ? AND platform = 'META_FACEBOOK' AND platform_account_id = ?",
        [workspaceId, page.id]
      );

      if (!existing) {
        const id = randomUUID();
        await execute(
          `INSERT INTO social_accounts (id, workspace_id, platform, account_name, profile_url, platform_account_id,
            access_token_enc, refresh_token_enc, token_expires_at, connected_by_user_id, is_mock, created_at, updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            id, workspaceId, "META_FACEBOOK", page.name,
            `https://facebook.com/${page.id}`, page.id,
            encrypt(page.access_token), encrypt(userAccessToken), tokenExpiresAt,
            userId, 0, now, now,
          ]
        );
        await writeAuditLog(workspaceId, userId, "CONNECTED_ACCOUNT", "social_account", id, {
          platform: "META_FACEBOOK",
          name: page.name,
          pageId: page.id,
        });
        connectedCount++;
      }

      if (page.instagram_business_account) {
        const igId = page.instagram_business_account.id;

        const existingIg = await queryOne(
          "SELECT id FROM social_accounts WHERE workspace_id = ? AND platform = 'META_INSTAGRAM' AND platform_account_id = ?",
          [workspaceId, igId]
        );

        if (!existingIg) {
          const igRes = await fetch(
            `${META_GRAPH_URL}/${igId}?fields=username,name,profile_picture_url&access_token=${page.access_token}`
          );
          const igData = await igRes.json();

          const igAccountId = randomUUID();
          await execute(
            `INSERT INTO social_accounts (id, workspace_id, platform, account_name, profile_url, platform_account_id,
              access_token_enc, refresh_token_enc, token_expires_at, connected_by_user_id, is_mock, created_at, updated_at)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              igAccountId, workspaceId, "META_INSTAGRAM",
              igData.username || igData.name || `IG-${igId}`,
              igData.username ? `https://instagram.com/${igData.username}` : null,
              igId, encrypt(page.access_token), encrypt(userAccessToken), tokenExpiresAt,
              userId, 0, now, now,
            ]
          );
          await writeAuditLog(workspaceId, userId, "CONNECTED_ACCOUNT", "social_account", igAccountId, {
            platform: "META_INSTAGRAM",
            igId,
            username: igData.username,
          });
          connectedCount++;
        }
      }
    }

    res.redirect(`/dashboard/social?connected=meta&count=${connectedCount}`);
  } catch (err: any) {
    console.error("Meta OAuth callback error:", err);
    res.redirect(
      `/dashboard/social?error=${encodeURIComponent(err.message || "Connection failed")}`
    );
  }
});

export async function publishToFacebook(
  pageId: string,
  accessTokenEnc: string,
  message: string,
  mediaUrl?: string
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const accessToken = decrypt(accessTokenEnc);
    let url: string;
    let body: Record<string, string>;

    if (mediaUrl) {
      url = `${META_GRAPH_URL}/${pageId}/photos`;
      body = { url: mediaUrl, message, access_token: accessToken };
    } else {
      url = `${META_GRAPH_URL}/${pageId}/feed`;
      body = { message, access_token: accessToken };
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (data.error) {
      return { success: false, error: data.error.message };
    }

    return { success: true, postId: data.id || data.post_id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function publishToInstagram(
  igUserId: string,
  accessTokenEnc: string,
  caption: string,
  imageUrl: string
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const accessToken = decrypt(accessTokenEnc);

    const containerRes = await fetch(`${META_GRAPH_URL}/${igUserId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: imageUrl,
        caption,
        access_token: accessToken,
      }),
    });
    const containerData = await containerRes.json();

    if (containerData.error) {
      return { success: false, error: containerData.error.message };
    }

    const creationId = containerData.id;

    let attempts = 0;
    while (attempts < 10) {
      await new Promise((r) => setTimeout(r, 3000));
      const statusRes = await fetch(
        `${META_GRAPH_URL}/${creationId}?fields=status_code&access_token=${accessToken}`
      );
      const statusData = await statusRes.json();
      if (statusData.status_code === "FINISHED") break;
      if (statusData.status_code === "ERROR") {
        return { success: false, error: "Instagram media processing failed" };
      }
      attempts++;
    }

    const publishRes = await fetch(`${META_GRAPH_URL}/${igUserId}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: accessToken,
      }),
    });
    const publishData = await publishRes.json();

    if (publishData.error) {
      return { success: false, error: publishData.error.message };
    }

    return { success: true, postId: publishData.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
