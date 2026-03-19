import { Router, Request, Response } from "express";
import { queryOne, queryAll, execute } from "../db";
import { encrypt, decrypt } from "../crypto";
import { writeAuditLog } from "./audit";
import { randomUUID } from "crypto";
import crypto from "crypto";

export const metaOAuthRouter = Router();

const META_GRAPH_URL = "https://graph.facebook.com/v20.0";

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

    let workspaceId: string;
    let origin: string;
    try {
      const parsed = JSON.parse(Buffer.from(state as string, "base64url").toString());
      workspaceId = parsed.workspaceId;
      origin = parsed.origin;
    } catch {
      workspaceId = state as string;
      origin = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
    }

    const redirectUri = `${origin}/api/social/oauth/meta/callback`;

    const membership = await queryOne(
      "SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?",
      [workspaceId, userId]
    );
    if (!membership) {
      return res.redirect("/dashboard/social?error=Workspace+access+denied");
    }

    const tokenUrl = `${META_GRAPH_URL}/oauth/access_token?client_id=${process.env.META_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${process.env.META_APP_SECRET}&code=${code}`;
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

    const fbProfileRes = await fetch(`${META_GRAPH_URL}/me?fields=id&access_token=${userAccessToken}`);
    const fbProfileData = await fbProfileRes.json();
    const facebookUserId = fbProfileData.id || null;

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
            access_token_enc, refresh_token_enc, token_expires_at, connected_by_user_id, facebook_user_id, is_mock, created_at, updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            id, workspaceId, "META_FACEBOOK", page.name,
            `https://facebook.com/${page.id}`, page.id,
            encrypt(page.access_token), encrypt(userAccessToken), tokenExpiresAt,
            userId, facebookUserId, 0, now, now,
          ]
        );
        await writeAuditLog(workspaceId, userId, "CONNECTED_ACCOUNT", "social_account", id, {
          platform: "META_FACEBOOK",
          name: page.name,
          pageId: page.id,
        });
        connectedCount++;
      } else {
        await execute(
          "UPDATE social_accounts SET facebook_user_id = ? WHERE id = ? AND facebook_user_id IS NULL",
          [facebookUserId, existing.id]
        );
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
              access_token_enc, refresh_token_enc, token_expires_at, connected_by_user_id, facebook_user_id, is_mock, created_at, updated_at)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              igAccountId, workspaceId, "META_INSTAGRAM",
              igData.username || igData.name || `IG-${igId}`,
              igData.username ? `https://instagram.com/${igData.username}` : null,
              igId, encrypt(page.access_token), encrypt(userAccessToken), tokenExpiresAt,
              userId, facebookUserId, 0, now, now,
            ]
          );
          await writeAuditLog(workspaceId, userId, "CONNECTED_ACCOUNT", "social_account", igAccountId, {
            platform: "META_INSTAGRAM",
            igId,
            username: igData.username,
          });
          connectedCount++;
        } else {
          await execute(
            "UPDATE social_accounts SET facebook_user_id = ? WHERE id = ? AND facebook_user_id IS NULL",
            [facebookUserId, existingIg.id]
          );
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

metaOAuthRouter.post("/meta/data-deletion", async (req: Request, res: Response) => {
  try {
    const { signed_request } = req.body;

    if (!signed_request) {
      return res.status(400).json({ error: "Missing signed_request" });
    }

    const appSecret = process.env.META_APP_SECRET;
    if (!appSecret) {
      console.error("[Meta Data Deletion] META_APP_SECRET not configured");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const parts = signed_request.split(".");
    if (parts.length !== 2) {
      return res.status(400).json({ error: "Invalid signed_request format" });
    }

    const [encodedSig, encodedPayload] = parts;

    const expectedSig = crypto
      .createHmac("sha256", appSecret)
      .update(encodedPayload)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    if (encodedSig !== expectedSig) {
      console.warn("[Meta Data Deletion] Invalid signature");
      return res.status(400).json({ error: "Invalid signature" });
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8")
    );

    const facebookUserId = payload.user_id;
    if (!facebookUserId) {
      return res.status(400).json({ error: "No user_id in payload" });
    }

    const confirmationCode = randomUUID().replace(/-/g, "").toUpperCase();
    const id = randomUUID();

    const result = await execute(
      "DELETE FROM social_accounts WHERE facebook_user_id = ? AND platform IN ('META_FACEBOOK', 'META_INSTAGRAM')",
      [facebookUserId]
    );
    const deletedCount = (result as any).affectedRows || 0;

    await execute(
      `INSERT INTO meta_data_deletion_requests (id, confirmation_code, facebook_user_id, status, deleted_accounts, processed_at)
       VALUES (?, ?, ?, 'completed', ?, NOW())`,
      [id, confirmationCode, facebookUserId, deletedCount]
    );

    console.log(`[Meta Data Deletion] Deleted ${deletedCount} account(s) for FB user ${facebookUserId}, code: ${confirmationCode}`);

    const appUrl = process.env.APP_URL || "https://masakhegroup.co.za";

    res.json({
      url: `${appUrl}/meta-deletion-status?code=${confirmationCode}`,
      confirmation_code: confirmationCode,
    });
  } catch (err: any) {
    console.error("[Meta Data Deletion] Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

metaOAuthRouter.get("/meta/data-deletion/status", async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: "Missing code" });

    const record = await queryOne(
      "SELECT confirmation_code, status, deleted_accounts, created_at, processed_at FROM meta_data_deletion_requests WHERE confirmation_code = ?",
      [code]
    );

    if (!record) return res.status(404).json({ error: "Not found" });

    res.json({
      confirmation_code: record.confirmation_code,
      status: record.status,
      deleted_accounts: record.deleted_accounts,
      requested_at: record.created_at,
      processed_at: record.processed_at,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export async function publishToFacebook(
  pageId: string,
  accessTokenEnc: string,
  message: string,
  mediaUrl?: string,
  mediaBuffer?: Buffer,
  mediaMimeType?: string
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const accessToken = decrypt(accessTokenEnc);

    if (mediaBuffer) {
      const formData = new FormData();
      formData.append("message", message);
      formData.append("access_token", accessToken);
      const blob = new Blob([mediaBuffer], { type: mediaMimeType || "image/jpeg" });
      formData.append("source", blob, "image.jpg");
      const res = await fetch(`${META_GRAPH_URL}/${pageId}/photos`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) {
        console.error("[Facebook] Photo binary upload error:", data.error);
        return { success: false, error: data.error.message };
      }
      return { success: true, postId: data.id || data.post_id };
    }

    if (mediaUrl) {
      const res = await fetch(`${META_GRAPH_URL}/${pageId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: mediaUrl, message, access_token: accessToken }),
      });
      const data = await res.json();
      if (data.error) {
        console.error("[Facebook] Photo URL upload error:", data.error);
        return { success: false, error: data.error.message };
      }
      return { success: true, postId: data.id || data.post_id };
    }

    const res = await fetch(`${META_GRAPH_URL}/${pageId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, access_token: accessToken }),
    });
    const data = await res.json();
    if (data.error) {
      console.error("[Facebook] Feed post error:", data.error);
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

    console.log(`[Instagram] Creating media container for IG user ${igUserId}, image: ${imageUrl}`);

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
      console.error("[Instagram] Media container error:", containerData.error);
      return { success: false, error: containerData.error.message };
    }

    console.log("[Instagram] Media container created:", containerData.id);

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
