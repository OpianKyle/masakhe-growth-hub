import { Request, Response, NextFunction, Router } from "express";
import { queryOne, execute } from "./db";
import { randomUUID, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendTeamInviteEmail,
  sendAdminSignupNotification,
  sendEmailVerificationEmail,
  sendOnboardingCallEmail,
  sendDripEmail,
  getBaseUrl,
} from "./email";
import { sendWelcomeSMS, sendCallScheduledSMS } from "./sms";
import { linkResellerClient, autoRegisterReseller } from "./reseller";
import { linkSmmeToMunicipality } from "./municipality";
import { OAuth2Client } from "google-auth-library";
import { fireSignupWebhook } from "./webhooks";

/**
 * For team-member accounts, returns the workspace owner's user_id (so all
 * data queries hit the owner's records). For owners and standalone users,
 * returns the logged-in user's own id. Use this in any data-scoped server
 * endpoint instead of req.session.userId.
 */
export function getDataOwnerId(req: Request): string {
  return (req.session as any).actingAsOwnerId || req.session.userId!;
}

/** True if the logged-in user is acting as a team member of someone else's business. */
export function isTeamMember(req: Request): boolean {
  return !!(req.session as any).actingAsOwnerId;
}

/**
 * Block team members from owner-only operations (billing changes, business
 * profile edits, etc). Owners and admins pass through.
 */
export function requireOwner(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  if (isTeamMember(req)) {
    return res.status(403).json({ error: "Only the business owner can perform this action." });
  }
  next();
}

async function loadActingContext(userId: string): Promise<{ actingAsOwnerId: string | null }> {
  const u = await queryOne("SELECT parent_owner_id FROM users WHERE id = ?", [userId]);
  return { actingAsOwnerId: u?.parent_owner_id || null };
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const APP_URL = process.env.APP_URL || `https://${process.env.REPLIT_DEV_DOMAIN || "localhost:5000"}`;
const GOOGLE_REDIRECT_URI = `${APP_URL}/api/auth/google/callback`;

export const authRouter = Router();

declare module "express-session" {
  interface SessionData {
    userId?: string;
    originalAdminId?: string;
    actingAsOwnerId?: string | null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const user = await queryOne("SELECT role FROM users WHERE id = ?", [req.session.userId]);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

authRouter.post("/register", async (req, res) => {
  try {
    const { email, password, fullName, businessData, referralCode, franchiseCode, municipalityCode } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: "Email, password, and full name are required" });
    }

    const existing = await queryOne("SELECT id FROM users WHERE email = ?", [email.toLowerCase()]);
    if (existing) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = randomUUID();
    const now = new Date().toISOString();
    const phone = businessData?.phone || null;

    await execute(
      `INSERT INTO users (id, email, password_hash, full_name, role, referred_by, phone, email_verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'user', ?, ?, 0, ?, ?)`,
      [userId, email.toLowerCase(), passwordHash, fullName, referralCode || null, phone, now, now]
    );

    if (businessData) {
      const profileId = randomUUID();
      await execute(
        `INSERT INTO business_profiles (id, user_id, business_name, trading_name, business_status, business_type, industry_sector,
          years_operating, employee_count, sa_id, cipc_number, phone, whatsapp, work_phone, email, physical_address,
          bank_name, account_type, account_number, branch_code, popia_consent, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          profileId, userId,
          businessData.businessName || null,
          businessData.tradingName || null,
          businessData.businessStatus || null,
          businessData.businessType || null,
          businessData.industrySector || null,
          businessData.yearsOperating || null,
          businessData.employeeCount || null,
          businessData.saId || null,
          businessData.cipcNumber || null,
          businessData.phone || null,
          businessData.whatsapp || null,
          businessData.workPhone || null,
          businessData.email || email,
          businessData.physicalAddress || null,
          businessData.bankName || null,
          businessData.accountType || null,
          businessData.accountNumber || null,
          businessData.branchCode || null,
          businessData.popiaConsent ? 1 : 0,
          now, now
        ]
      );
    }

    const wsName = businessData?.businessName || `${fullName}'s Business`;
    const wsId = randomUUID();
    await execute(
      "INSERT INTO workspaces (id, name, owner_id, created_at, updated_at) VALUES (?,?,?,?,?)",
      [wsId, wsName, userId, now, now]
    );
    await execute(
      "INSERT INTO workspace_members (id, workspace_id, user_id, role, created_at) VALUES (?,?,?,?,?)",
      [randomUUID(), wsId, userId, "owner", now]
    );

    // Trial subscription is no longer auto-created on registration.
    // After signup the user is redirected to /dashboard/billing where they
    // pick a plan and the trial is started against that plan via
    // POST /api/billing/start-trial.

    if (businessData?.businessStatus === "reseller") {
      await autoRegisterReseller(userId, fullName, referralCode || undefined).catch(() => {});
    }

    // Resolve which franchise code to use: explicit franchiseCode takes priority,
    // otherwise fall back to an MTN auto-link when referralCode is MTN-prefixed.
    const resolvedFranchiseCode = franchiseCode ||
      (referralCode && referralCode.toUpperCase().startsWith("MTN") ? "MTN001" : null);

    if (resolvedFranchiseCode) {
      try {
        const franchise = await queryOne(
          "SELECT id FROM franchises WHERE code = ? AND status = 'active'",
          [resolvedFranchiseCode]
        );
        if (franchise) {
          const { randomUUID: uuid } = await import("crypto");
          await execute(
            "INSERT INTO franchise_clients (id, franchise_id, client_user_id, status) VALUES (?, ?, ?, 'active')",
            [uuid(), franchise.id, userId]
          );
        }
      } catch (e: any) {
        console.error("[Auth] franchise auto-link error:", e.message);
      }
    }

    req.session.userId = userId;
    req.session.actingAsOwnerId = null;
    req.session.save(async () => {
      // Wrap entire callback so a thrown error never leaves res unsent
      let user: any = null;
      try {
        user = await queryOne(
          `SELECT u.id, u.email, u.full_name, u.role, u.created_at, u.phone, u.email_verified,
                  bp.business_name, bp.trading_name, bp.business_status, bp.industry_sector,
                  bp.business_type, bp.years_operating, bp.employee_count, bp.phone as bp_phone, bp.whatsapp,
                  bp.email as bp_email, bp.physical_address, bp.bank_name, bp.account_type,
                  bp.account_number, bp.branch_code, bp.sa_id, bp.cipc_number, bp.logo_url,
                  bp.vat_number, bp.invoice_color, bp.popia_consent,
                  IF(r.id IS NOT NULL OR bp.business_status = 'reseller', 1, 0) as is_reseller,
                  IF(mtnfc.id IS NOT NULL, 1, 0) as is_mtn_client,
                  mtnf.code as mtn_franchise_code
           FROM users u
           LEFT JOIN business_profiles bp ON bp.user_id = u.id
           LEFT JOIN resellers r ON r.user_id = u.id AND r.status = 'active'
           LEFT JOIN franchise_clients mtnfc ON mtnfc.client_user_id = u.id AND mtnfc.status = 'active'
           LEFT JOIN franchises mtnf ON mtnf.id = mtnfc.franchise_id AND LOWER(mtnf.code) LIKE 'mtn%'
           WHERE u.id = ?`,
          [userId]
        );
      } catch (e: any) {
        console.error("[Auth] session.save user-fetch error:", e.message);
      }

      const baseUrl = getBaseUrl(req.get("origin") || req.get("referer"));

      // 1. Send welcome email
      sendWelcomeEmail(email.toLowerCase(), fullName, baseUrl).catch((e: any) => {
        console.error("[Auth] Welcome email error:", e?.message);
      });

      // 2. Send email verification link
      const verifyToken = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      execute(
        "INSERT INTO email_verifications (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)",
        [randomUUID(), userId, verifyToken, expiresAt]
      ).then(() => {
        const verifyUrl = `${baseUrl}/verify-email?token=${verifyToken}`;
        console.log(`[Auth] Verification URL for ${email}: ${verifyUrl}`);
        sendEmailVerificationEmail(email.toLowerCase(), fullName, verifyUrl).catch((e: any) => {
          console.error("[Auth] Verification email error:", e?.message);
        });
      }).catch((e: any) => {
        console.error("[Auth] email_verifications insert error:", e?.message);
      });

      // 3. Notify admin of new signup
      sendAdminSignupNotification(email.toLowerCase(), fullName, phone, baseUrl).catch((e: any) => {
        console.error("[Auth] Admin notification error:", e?.message);
      });

      // 4a. Fire outbound webhook to external leads system
      fireSignupWebhook({
        event: "user.signup",
        userId,
        email: email.toLowerCase(),
        fullName,
        phone: phone || null,
        referralCode: referralCode || null,
        businessName: businessData?.businessName || null,
        industrySector: businessData?.industrySector || null,
        now,
      }).catch(() => {});

      // 4. Send onboarding call scheduled email to client
      sendOnboardingCallEmail(email.toLowerCase(), fullName, baseUrl).catch(() => {});

      // 5. Send welcome SMS if phone provided
      if (phone) {
        sendWelcomeSMS(phone, fullName).catch(() => {});
        sendCallScheduledSMS(phone, fullName).catch(() => {});
      }

      // 6. Log day-0 drip (welcome already sent) so scheduler skips it, then queue day-1
      execute(
        "INSERT IGNORE INTO drip_email_log (id, user_id, campaign_day, sent_at) VALUES (?, ?, 0, NOW())",
        [randomUUID(), userId]
      ).catch(() => {});

        if (referralCode) linkResellerClient(userId, referralCode).catch(() => {});

      // Auto-grant 2-week trial for SMMEs linking via a municipality code
      if (municipalityCode) {
        (async () => {
          try {
            await linkSmmeToMunicipality(userId, municipalityCode, businessData?.businessName || fullName);
            const plan = await queryOne("SELECT id FROM billing_plans WHERE code = 'premium' LIMIT 1", []);
            if (plan) {
              const trialEnd = new Date();
              trialEnd.setDate(trialEnd.getDate() + 14);
              const trialEndStr = trialEnd.toISOString().slice(0, 19).replace("T", " ");
              const nowStr = new Date().toISOString().slice(0, 19).replace("T", " ");
              const existing = await queryOne("SELECT id FROM billing_subscriptions WHERE workspace_id = ? LIMIT 1", [wsId]);
              if (existing) {
                await execute(
                  "UPDATE billing_subscriptions SET status = 'TRIAL', plan_id = ?, trial_start_at = ?, trial_end_at = ?, updated_at = NOW() WHERE id = ?",
                  [plan.id, nowStr, trialEndStr, existing.id]
                );
              } else {
                await execute(
                  "INSERT INTO billing_subscriptions (workspace_id, plan_id, status, trial_start_at, trial_end_at) VALUES (?, ?, 'TRIAL', ?, ?)",
                  [wsId, plan.id, nowStr, trialEndStr]
                );
              }
            }
          } catch (e: any) {
            console.error("[Auth] Municipality trial grant error:", e.message);
          }
        })();
      }

      try {
        res.json({ ok: true, user });
      } catch (e: any) {
        console.error("[Auth] res.json error:", e.message);
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Registration failed" });
  }
});

// GET: only checks token validity — does NOT consume it.
// This prevents email security scanners from burning the token before the user clicks.
authRouter.get("/verify-email", async (req, res) => {
  const { token } = req.query as { token?: string };
  if (!token) return res.status(400).json({ error: "Token required" });
  try {
    const record = await queryOne(
      "SELECT id FROM email_verifications WHERE token = ? AND used = 0 AND expires_at > NOW()",
      [token]
    );
    if (!record) return res.status(400).json({ error: "Invalid or expired verification link" });
    res.json({ valid: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST: actually consumes the token and marks the email as verified.
// Only called when the real user clicks the confirm button on the page.
authRouter.post("/verify-email", async (req, res) => {
  const { token } = req.body as { token?: string };
  if (!token) return res.status(400).json({ error: "Token required" });
  try {
    const record = await queryOne(
      "SELECT * FROM email_verifications WHERE token = ? AND used = 0 AND expires_at > NOW()",
      [token]
    );
    if (!record) return res.status(400).json({ error: "Invalid or expired verification link" });
    await execute("UPDATE users SET email_verified = 1 WHERE id = ?", [record.user_id]);
    await execute("UPDATE email_verifications SET used = 1 WHERE id = ?", [record.id]);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

authRouter.post("/resend-verification", requireAuth, async (req, res) => {
  try {
    const user = await queryOne("SELECT id, email, full_name, email_verified FROM users WHERE id = ?", [req.session.userId]);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.email_verified) return res.json({ ok: true, message: "Already verified" });
    const verifyToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await execute(
      "INSERT INTO email_verifications (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)",
      [randomUUID(), user.id, verifyToken, expiresAt]
    );
    const baseUrl = getBaseUrl(req.get("origin") || req.get("referer"));
    const verifyUrl = `${baseUrl}/verify-email?token=${verifyToken}`;
    await sendEmailVerificationEmail(user.email, user.full_name, verifyUrl);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await queryOne("SELECT * FROM users WHERE email = ?", [email.toLowerCase()]);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    req.session.userId = user.id;
    const ctx = await loadActingContext(user.id);
    req.session.actingAsOwnerId = ctx.actingAsOwnerId;
    req.session.save(async () => {
      const fullUser = await queryOne(
        `SELECT u.id, u.email, u.full_name, u.role, u.created_at,
                bp.business_name, bp.trading_name, bp.business_status, bp.industry_sector,
                bp.business_type, bp.years_operating, bp.employee_count, bp.phone, bp.whatsapp,
                bp.email as bp_email, bp.physical_address, bp.bank_name, bp.account_type,
                bp.account_number, bp.branch_code, bp.sa_id, bp.cipc_number, bp.logo_url,
                bp.vat_number, bp.invoice_color, bp.popia_consent,
                IF(r.id IS NOT NULL OR bp.business_status = 'reseller', 1, 0) as is_reseller
         FROM users u
         LEFT JOIN business_profiles bp ON bp.user_id = u.id
         LEFT JOIN resellers r ON r.user_id = u.id AND r.status = 'active'
         WHERE u.id = ?`,
        [user.id]
      );

      // Auto-verify admin accounts — super admins skip email verification
      if (fullUser?.role === 'admin' && !user.email_verified) {
        await execute("UPDATE users SET email_verified = 1 WHERE id = ?", [user.id]).catch(() => {});
        if (fullUser) fullUser.email_verified = 1;
      }

      // Auto-create reseller record if the account is a partner but has no active record
      if (fullUser?.business_status === 'reseller') {
        const existing = await queryOne(
          "SELECT id FROM resellers WHERE user_id = ?", [user.id]
        );
        if (!existing) {
          await autoRegisterReseller(user.id, user.full_name).catch(() => {});
        }
      }

      res.json({ ok: true, user: fullUser });
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Login failed" });
  }
});

authRouter.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

authRouter.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await queryOne("SELECT id, full_name FROM users WHERE email = ?", [email.toLowerCase()]);

    res.json({ ok: true });

    if (user) {
      await execute("UPDATE password_reset_tokens SET used = 1 WHERE user_id = ? AND used = 0", [user.id]);

      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ");

      await execute(
        "INSERT INTO password_reset_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)",
        [randomUUID(), user.id, token, expiresAt]
      );

      sendPasswordResetEmail(email.toLowerCase(), user.full_name, token).catch(() => {});
    }
  } catch (err: any) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

authRouter.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const resetToken = await queryOne(
      "SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > UTC_TIMESTAMP()",
      [token]
    );

    if (!resetToken) {
      return res.status(400).json({ error: "This reset link is invalid or has expired. Please request a new one." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    await execute("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?", [
      passwordHash, now, resetToken.user_id
    ]);

    await execute("UPDATE password_reset_tokens SET used = 1 WHERE id = ?", [resetToken.id]);

    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to reset password" });
  }
});

authRouter.get("/me", async (req, res) => {
  if (!req.session?.userId) {
    return res.json({ user: null });
  }

  // For team members, the dashboard should show the OWNER's business profile,
  // because the team member is working inside the owner's business. Their own
  // identity (full_name / email) still comes from their own user row.
  const ownerId = (req.session as any).actingAsOwnerId || req.session.userId;
  const user = await queryOne(
    `SELECT u.id, u.email, u.full_name, u.role, u.created_at, u.parent_owner_id,
            bp.business_name, bp.trading_name, bp.business_status, bp.industry_sector,
            bp.business_type, bp.years_operating, bp.employee_count, bp.phone, bp.whatsapp,
            bp.email as bp_email, bp.physical_address, bp.bank_name, bp.account_type,
            bp.account_number, bp.branch_code, bp.sa_id, bp.cipc_number, bp.logo_url,
            bp.vat_number, bp.invoice_color, bp.popia_consent,
            IF(r.id IS NOT NULL OR bp.business_status = 'reseller', 1, 0) as is_reseller
     FROM users u
     LEFT JOIN business_profiles bp ON bp.user_id = ?
     LEFT JOIN resellers r ON r.user_id = ? AND r.status = 'active'
     WHERE u.id = ?`,
    [ownerId, ownerId, req.session.userId]
  );

  if (!user) {
    return res.json({ user: null });
  }

  // Team-member context: load permissions and owner info.
  let teamMember: any = null;
  if (user.parent_owner_id) {
    const owner = await queryOne(
      "SELECT u.email, u.full_name, bp.business_name FROM users u LEFT JOIN business_profiles bp ON bp.user_id = u.id WHERE u.id = ?",
      [user.parent_owner_id]
    );
    const wm = await queryOne(
      `SELECT permissions FROM workspace_members wm
       JOIN workspaces w ON w.id = wm.workspace_id
       WHERE wm.user_id = ? AND w.owner_id = ?
       LIMIT 1`,
      [user.id, user.parent_owner_id]
    );
    let permissions: string[] = [];
    try { permissions = wm?.permissions ? JSON.parse(wm.permissions) : []; } catch {}
    teamMember = {
      owner_id: user.parent_owner_id,
      owner_email: owner?.email || null,
      owner_full_name: owner?.full_name || null,
      owner_business_name: owner?.business_name || null,
      permissions,
    };
  }

  const isImpersonating = !!req.session.originalAdminId;
  let originalAdminName: string | null = null;
  if (isImpersonating) {
    const adminUser = await queryOne("SELECT full_name FROM users WHERE id = ?", [req.session.originalAdminId]);
    originalAdminName = adminUser?.full_name || null;
  }

  // Detect if this user is a client under an MTN franchise
  const mtnFranchise = await queryOne(
    `SELECT f.code as franchise_code
     FROM franchise_clients fc
     JOIN franchises f ON f.id = fc.franchise_id
     WHERE fc.client_user_id = ? AND fc.status = 'active' AND LOWER(f.code) LIKE 'mtn%'
     LIMIT 1`,
    [req.session.userId]
  );
  const is_mtn_client = !!mtnFranchise;
  const mtn_franchise_code = mtnFranchise?.franchise_code || null;

  res.json({ user: { ...user, is_mtn_client, mtn_franchise_code }, isImpersonating, originalAdminName, teamMember });
});

// ---- Team-member password setup ----
// Verify a setup token (issued when an owner creates a team-member account).
// Returns the invitee's email + business name so the page can greet them.
authRouter.get("/setup-password/:token", async (req, res) => {
  try {
    const t = await queryOne(
      `SELECT prt.user_id, u.email, u.full_name, u.parent_owner_id
       FROM password_reset_tokens prt
       JOIN users u ON u.id = prt.user_id
       WHERE prt.token = ? AND prt.used = 0 AND prt.expires_at > UTC_TIMESTAMP()`,
      [req.params.token]
    );
    if (!t) return res.status(400).json({ error: "This invite link is invalid or has expired. Ask your business admin to send a new one." });
    let businessName: string | null = null;
    if (t.parent_owner_id) {
      const owner = await queryOne(
        "SELECT bp.business_name, u.full_name FROM users u LEFT JOIN business_profiles bp ON bp.user_id = u.id WHERE u.id = ?",
        [t.parent_owner_id]
      );
      businessName = owner?.business_name || owner?.full_name || null;
    }
    res.json({ email: t.email, full_name: t.full_name, business_name: businessName });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to validate invite link" });
  }
});

// Accept a setup token + new password, set the account password, log the user in.
authRouter.post("/setup-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: "Token and password are required" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    const t = await queryOne(
      "SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > UTC_TIMESTAMP()",
      [token]
    );
    if (!t) return res.status(400).json({ error: "This invite link is invalid or has expired." });

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    await execute("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?", [passwordHash, now, t.user_id]);
    await execute("UPDATE password_reset_tokens SET used = 1 WHERE id = ?", [t.id]);

    // Mark workspace_members row as no longer pending invite.
    await execute("UPDATE workspace_members SET invite_pending = 0 WHERE user_id = ?", [t.user_id]);

    // Log them in.
    req.session.userId = t.user_id;
    const ctx = await loadActingContext(t.user_id);
    req.session.actingAsOwnerId = ctx.actingAsOwnerId;
    req.session.save(() => res.json({ ok: true }));
  } catch (err: any) {
    res.status(500).json({ error: "Failed to set password" });
  }
});

authRouter.get("/google", (req, res) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.redirect(`/register?error=google_not_configured`);
  }
  console.log("[Google OAuth] Redirect URI being used:", GOOGLE_REDIRECT_URI);
  const ref = (req.query.ref as string) || "";
  const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
  const url = client.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
    state: ref ? `ref=${ref}` : "",
    prompt: "select_account",
  });
  res.redirect(url);
});

authRouter.get("/google/callback", async (req, res) => {
  const { code, state, error: oauthError } = req.query as Record<string, string>;
  if (oauthError || !code) {
    return res.redirect(`/login?error=google_denied`);
  }
  try {
    const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({ idToken: tokens.id_token!, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.redirect(`/login?error=google_no_email`);
    }

    const { email, name, given_name, family_name } = payload;
    const fullName = name || `${given_name || ""} ${family_name || ""}`.trim() || email;

    const referralCode = state?.startsWith("ref=") ? state.slice(4) : undefined;
    const now = new Date().toISOString();

    let user = await queryOne("SELECT id FROM users WHERE email = ?", [email.toLowerCase()]);
    if (!user) {
      const userId = randomUUID();
      await execute(
        `INSERT INTO users (id, email, password_hash, full_name, role, referred_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'user', ?, ?, ?)`,
        [userId, email.toLowerCase(), "", fullName, referralCode || null, now, now]
      );
      const profileId = randomUUID();
      await execute(
        `INSERT INTO business_profiles (id, user_id, email, popia_consent, created_at, updated_at) VALUES (?, ?, ?, 0, ?, ?)`,
        [profileId, userId, email.toLowerCase(), now, now]
      );
      const wsId = randomUUID();
      await execute(
        "INSERT INTO workspaces (id, name, owner_id, created_at, updated_at) VALUES (?,?,?,?,?)",
        [wsId, `${fullName}'s Business`, userId, now, now]
      );
      await execute(
        "INSERT INTO workspace_members (id, workspace_id, user_id, role, created_at) VALUES (?,?,?,?,?)",
        [randomUUID(), wsId, userId, "owner", now]
      );
      sendWelcomeEmail(email.toLowerCase(), fullName).catch(() => {});
      if (referralCode) linkResellerClient(userId, referralCode).catch(() => {});
      // Auto-link to MTN franchise if the referral/state code is MTN-prefixed
      if (referralCode && referralCode.toUpperCase().startsWith("MTN")) {
        try {
          const mtnFranchise = await queryOne(
            "SELECT id FROM franchises WHERE code = 'MTN001' AND status = 'active'"
          );
          if (mtnFranchise) {
            await execute(
              "INSERT IGNORE INTO franchise_clients (id, franchise_id, client_user_id, status) VALUES (?, ?, ?, 'active')",
              [randomUUID(), mtnFranchise.id, userId]
            );
          }
        } catch (e: any) {
          console.error("[Auth] Google OAuth MTN franchise auto-link error:", e.message);
        }
      }
      user = { id: userId, _isNew: true };
    }

    req.session.userId = user.id;
    const ctx = await loadActingContext(user.id);
    req.session.actingAsOwnerId = ctx.actingAsOwnerId;
    const redirectTo = (user as any)._isNew ? "/dashboard/billing?welcome=1" : "/dashboard";
    req.session.save(() => res.redirect(redirectTo));
  } catch (err: any) {
    console.error("Google OAuth error:", err.message);
    res.redirect(`/login?error=google_failed`);
  }
});

authRouter.post("/impersonate/end", async (req, res) => {
  try {
    const originalAdminId = req.session.originalAdminId;
    if (!originalAdminId) {
      return res.status(400).json({ error: "Not currently impersonating" });
    }

    const admin = await queryOne("SELECT id, role FROM users WHERE id = ?", [originalAdminId]);
    if (!admin || (admin.role !== "admin" && admin.role !== "franchise")) {
      return res.status(403).json({ error: "Original session is no longer an admin or franchise owner" });
    }

    req.session.userId = originalAdminId;
    req.session.originalAdminId = undefined;
    req.session.actingAsOwnerId = null;
    req.session.save(() => {
      res.json({ ok: true });
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to end impersonation" });
  }
});
