import { Router, Request, Response } from "express";
import { queryOne, execute } from "../db";
import { encrypt, decrypt } from "../crypto";
import { writeAuditLog } from "./audit";
import { randomUUID } from "crypto";

export const linkedinOAuthRouter = Router();

const LINKEDIN_API = "https://api.linkedin.com/v2";

// ─── OAuth callback ────────────────────────────────────────────────────────────

linkedinOAuthRouter.get("/oauth/linkedin/callback", async (req: Request, res: Response) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    return res.redirect(
      `/dashboard/social?error=${encodeURIComponent((error_description as string) || "LinkedIn authorization denied")}`
    );
  }

  if (!code || !state) {
    return res.redirect("/dashboard/social?error=Missing+LinkedIn+authorization+code");
  }

  const userId = req.session.userId;
  if (!userId) return res.redirect("/login");

  const workspaceId = state as string;

  const membership = await queryOne(
    "SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?",
    [workspaceId, userId]
  );
  if (!membership) {
    return res.redirect("/dashboard/social?error=Workspace+access+denied");
  }

  try {
    const host = (req.headers["x-forwarded-host"] as string) || req.get("host") || "";
    const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol;
    const origin = `${proto}://${host}`;
    const redirectUri = `${origin}/api/social/oauth/linkedin/callback`;

    // Exchange code for access token
    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code as string,
        redirect_uri: redirectUri,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }).toString(),
    });

    const tokenData = await tokenRes.json() as any;
    if (tokenData.error) {
      console.error("[LinkedIn OAuth] Token error:", tokenData.error_description);
      return res.redirect(
        `/dashboard/social?error=${encodeURIComponent(tokenData.error_description || "LinkedIn token exchange failed")}`
      );
    }

    const accessToken = tokenData.access_token;
    const expiresIn = tokenData.expires_in || 5184000;
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Get profile info via OpenID Connect userinfo endpoint (works with openid + profile + email scopes)
    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profileData = await profileRes.json() as any;

    if (!profileRes.ok || profileData.error) {
      console.error("[LinkedIn OAuth] Profile error:", profileData);
      return res.redirect(
        `/dashboard/social?error=${encodeURIComponent("Could not fetch LinkedIn profile: " + (profileData.message || profileData.error || profileRes.status))}`
      );
    }

    // OpenID userinfo returns: sub, name, given_name, family_name, email, picture
    const linkedinId = profileData.sub;
    const displayName = profileData.name || `${profileData.given_name || ""} ${profileData.family_name || ""}`.trim() || `LinkedIn-${linkedinId}`;
    const emailAddress = profileData.email || "";

    const profileUrl = `https://www.linkedin.com/in/${linkedinId}`;
    const now = new Date().toISOString();

    // Upsert the account
    const existing = await queryOne(
      "SELECT id FROM social_accounts WHERE workspace_id = ? AND platform = 'LINKEDIN' AND platform_account_id = ?",
      [workspaceId, linkedinId]
    );

    if (existing) {
      await execute(
        "UPDATE social_accounts SET account_name = ?, access_token_enc = ?, token_expires_at = ?, updated_at = ? WHERE id = ?",
        [displayName, encrypt(accessToken), tokenExpiresAt, now, existing.id]
      );
      await writeAuditLog(workspaceId, userId, "RECONNECTED_ACCOUNT", "social_account", existing.id, { platform: "LINKEDIN", name: displayName });
    } else {
      const id = randomUUID();
      await execute(
        `INSERT INTO social_accounts (id, workspace_id, platform, account_name, profile_url, platform_account_id,
          access_token_enc, refresh_token_enc, token_expires_at, connected_by_user_id, is_mock, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [id, workspaceId, "LINKEDIN", displayName, profileUrl, linkedinId, encrypt(accessToken), null, tokenExpiresAt, userId, 0, now, now]
      );
      await writeAuditLog(workspaceId, userId, "CONNECTED_ACCOUNT", "social_account", id, { platform: "LINKEDIN", name: displayName, email: emailAddress });
    }

    console.log(`[LinkedIn OAuth] Connected: ${displayName} (${linkedinId}) for workspace ${workspaceId}`);
    res.redirect(`/dashboard/social?connected=linkedin&name=${encodeURIComponent(displayName)}`);
  } catch (err: any) {
    console.error("[LinkedIn OAuth] Error:", err.message);
    res.redirect(`/dashboard/social?error=${encodeURIComponent(err.message || "LinkedIn connection failed")}`);
  }
});

// ─── Publish a post to LinkedIn ───────────────────────────────────────────────

export async function publishToLinkedIn(
  linkedinId: string,
  accessTokenEnc: string,
  text: string,
  mediaUrl?: string,
  mediaBuffer?: Buffer,
  mediaMimeType?: string
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const accessToken = decrypt(accessTokenEnc);
    const authorUrn = `urn:li:person:${linkedinId}`;

    let body: any;

    if (mediaBuffer && mediaMimeType && mediaMimeType.startsWith("image/")) {
      // Step 1: Register image upload
      const registerRes = await fetch(`${LINKEDIN_API}/assets?action=registerUpload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({
          registerUploadRequest: {
            recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
            owner: authorUrn,
            serviceRelationships: [{ relationshipType: "OWNER", identifier: "urn:li:userGeneratedContent" }],
          },
        }),
      });
      const registerData = await registerRes.json() as any;

      if (registerData.serviceErrorCode) {
        return { success: false, error: `LinkedIn image register failed: ${registerData.message}` };
      }

      const uploadUrl = registerData.value?.uploadMechanism?.["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"]?.uploadUrl;
      const assetUrn = registerData.value?.asset;

      if (!uploadUrl || !assetUrn) {
        return { success: false, error: "LinkedIn image registration did not return upload URL" };
      }

      // Step 2: Upload the image
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": mediaMimeType,
        },
        body: mediaBuffer,
      });

      if (!uploadRes.ok) {
        return { success: false, error: `LinkedIn image upload failed: ${uploadRes.status}` };
      }

      // Step 3: Create post with image
      body = {
        author: authorUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text },
            shareMediaCategory: "IMAGE",
            media: [{ status: "READY", description: { text: text.slice(0, 200) }, media: assetUrn, title: { text: "Image" } }],
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      };
    } else if (mediaUrl) {
      // Share with external URL / article
      body = {
        author: authorUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text },
            shareMediaCategory: "ARTICLE",
            media: [{ status: "READY", originalUrl: mediaUrl }],
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      };
    } else {
      // Text-only post
      body = {
        author: authorUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text },
            shareMediaCategory: "NONE",
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      };
    }

    const postRes = await fetch(`${LINKEDIN_API}/ugcPosts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(body),
    });

    const postData = await postRes.json() as any;

    if (!postRes.ok || postData.serviceErrorCode) {
      console.error("[LinkedIn publish] Error:", JSON.stringify(postData));
      return { success: false, error: postData.message || `LinkedIn post failed (${postRes.status})` };
    }

    const postId = postData.id || postRes.headers.get("x-restli-id") || "";
    console.log(`[LinkedIn publish] Success: ${postId}`);
    return { success: true, postId };
  } catch (err: any) {
    console.error("[LinkedIn publish] Exception:", err.message);
    return { success: false, error: err.message };
  }
}
