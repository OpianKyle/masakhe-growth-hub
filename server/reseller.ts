import { Router } from "express";
import { queryOne, queryAll, execute } from "./db";
import { requireAuth, requireAdmin } from "./auth";
import { randomUUID } from "crypto";
import { getTransporterForUser } from "./email-settings";
import { generateSubscriptionToken, verifyResponseToken } from "./adumo";

export const resellerRouter = Router();

const APP_URL = process.env.APP_URL || "https://masakheportal.co.za";

const ADUMO_URL = process.env.ADUMO_ENV === "production"
  ? "https://apiv3.adumoonline.com/product/payment/v1/initialisevirtual"
  : "https://staging-apiv3.adumoonline.com/product/payment/v1/initialisevirtual";

// Partner package definitions
const PARTNER_PACKAGES = {
  affiliate: { label: "Affiliate",       amountCents: 0,      currency: "ZAR" },
  reseller:  { label: "Reseller",        amountCents: 99900,  currency: "ZAR" },
  master:    { label: "Master Reseller", amountCents: 499900, currency: "ZAR" },
};

// ─── Rank definitions ────────────────────────────────────────────────────────
export const RANKS = [
  { key: "starter",       label: "Starter",       code: "S1",  recruits: 0,   mrrCents: 0,          directPct: 20, rankBonusCents: 0,      color: "#6b7280" },
  { key: "builder",       label: "Builder",       code: "B2",  recruits: 3,   mrrCents: 179700,     directPct: 20, rankBonusCents: 50000,  color: "#3b82f6" },
  { key: "leader",        label: "Leader",        code: "L3",  recruits: 10,  mrrCents: 599000,     directPct: 20, rankBonusCents: 150000, color: "#8b5cf6" },
  { key: "manager",       label: "Manager",       code: "M4",  recruits: 25,  mrrCents: 1000000,    directPct: 20, rankBonusCents: 500000, color: "#ec4899" },
  { key: "director",      label: "Director",      code: "D5",  recruits: 50,  mrrCents: 2500000,    directPct: 20, rankBonusCents: 1500000,color: "#f59e0b" },
  { key: "executive",     label: "Executive",     code: "E6",  recruits: 100, mrrCents: 5000000,    directPct: 20, rankBonusCents: 3000000,color: "#10b981" },
  { key: "diamond_elite", label: "Diamond Elite", code: "DE7", recruits: 250, mrrCents: 10000000,   directPct: 20, rankBonusCents: 5000000,color: "#f59e0b" },
];

// Commission rates per level
const COMMISSION_RATES: Record<number, number> = {
  1: 20,
  2: 10,
  3: 5,
  4: 3,
  5: 3,
};

function generateResellerCode(name: string): string {
  const base = name.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 4);
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${base}${suffix}`;
}

// Called from auth.ts when user registers with businessStatus = "reseller"
export async function autoRegisterReseller(userId: string, fullName: string): Promise<void> {
  const code = generateResellerCode(fullName);
  const id = randomUUID();
  const now = new Date().toISOString();
  await execute(
    `INSERT IGNORE INTO resellers (id, user_id, reseller_code, status, rank_key, created_at, approved_at)
     VALUES (?, ?, ?, 'active', 'starter', ?, ?)`,
    [id, userId, code, now, now]
  );
}

// ─── Migrations ──────────────────────────────────────────────────────────────
export async function runResellerMigrations() {
  await execute(`
    CREATE TABLE IF NOT EXISTS resellers (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL UNIQUE,
      reseller_code VARCHAR(20) NOT NULL UNIQUE,
      status ENUM('pending','active','suspended') DEFAULT 'pending',
      rank_key VARCHAR(30) DEFAULT 'starter',
      sponsor_id VARCHAR(36) NULL,
      total_clients INT DEFAULT 0,
      network_mrr_cents INT DEFAULT 0,
      total_earnings_cents INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      approved_at TIMESTAMP NULL
    )
  `, []).catch(() => {});

  await execute(`
    CREATE TABLE IF NOT EXISTS reseller_clients (
      id VARCHAR(36) PRIMARY KEY,
      reseller_id VARCHAR(36) NOT NULL,
      client_user_id VARCHAR(36) NOT NULL UNIQUE,
      plan_code VARCHAR(50) NULL,
      plan_amount_cents INT DEFAULT 0,
      status VARCHAR(20) DEFAULT 'active',
      registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, []).catch(() => {});

  await execute(`
    CREATE TABLE IF NOT EXISTS reseller_commissions (
      id VARCHAR(36) PRIMARY KEY,
      reseller_id VARCHAR(36) NOT NULL,
      client_user_id VARCHAR(36) NULL,
      level INT DEFAULT 1,
      commission_type ENUM('direct','level','binary','rank_bonus') DEFAULT 'direct',
      amount_cents INT DEFAULT 0,
      source_amount_cents INT DEFAULT 0,
      month VARCHAR(7) NULL,
      status ENUM('pending','paid') DEFAULT 'pending',
      description VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, []).catch(() => {});

  // Add referred_by column to users table
  await execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by VARCHAR(20) NULL`, []).catch(() => {});

  // Add package_tier and package_paid_at to resellers
  await execute(`ALTER TABLE resellers ADD COLUMN IF NOT EXISTS package_tier ENUM('affiliate','reseller','master') NULL`, []).catch(() => {});
  await execute(`ALTER TABLE resellers ADD COLUMN IF NOT EXISTS package_paid_at TIMESTAMP NULL`, []).catch(() => {});

  // Reseller once-off billing invoices
  await execute(`
    CREATE TABLE IF NOT EXISTS reseller_billing_invoices (
      id VARCHAR(36) PRIMARY KEY,
      reseller_id VARCHAR(36) NOT NULL,
      package_tier VARCHAR(20) NOT NULL,
      amount_cents INT NOT NULL,
      currency VARCHAR(10) DEFAULT 'ZAR',
      merchant_ref VARCHAR(80) NOT NULL UNIQUE,
      status ENUM('PENDING','PAID','FAILED') DEFAULT 'PENDING',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      paid_at TIMESTAMP NULL
    )
  `, []).catch(() => {});

  console.log("[Reseller] Migrations complete");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function computeRank(resellerId: string): Promise<string> {
  const r = await queryOne(
    `SELECT COUNT(*) as total_clients,
            COALESCE(SUM(rc.plan_amount_cents), 0) as mrr
     FROM reseller_clients rc
     WHERE rc.reseller_id = ? AND rc.status = 'active'`,
    [resellerId]
  );
  const clients = r?.total_clients || 0;
  const mrr = r?.mrr || 0;
  let rank = "starter";
  for (const tier of RANKS) {
    if (clients >= tier.recruits && mrr >= tier.mrrCents) rank = tier.key;
  }
  return rank;
}

// ─── Public: check reseller code validity (for registration page) ─────────────
resellerRouter.get("/check/:code", async (req, res) => {
  try {
    const reseller = await queryOne(
      `SELECT r.id, r.reseller_code, u.full_name, bp.business_name
       FROM resellers r
       JOIN users u ON u.id = r.user_id
       LEFT JOIN business_profiles bp ON bp.user_id = r.user_id
       WHERE r.reseller_code = ? AND r.status = 'active'`,
      [req.params.code]
    );
    if (!reseller) return res.json({ valid: false });
    res.json({ valid: true, name: reseller.business_name || reseller.full_name, code: reseller.reseller_code });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Authenticated routes ─────────────────────────────────────────────────────
resellerRouter.use(requireAuth);

// Apply to be a reseller
resellerRouter.post("/apply", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const existing = await queryOne("SELECT id FROM resellers WHERE user_id = ?", [userId]);
    if (existing) return res.status(400).json({ error: "You already have a reseller application." });

    const user = await queryOne("SELECT full_name FROM users WHERE id = ?", [userId]);
    const code = generateResellerCode(user?.full_name || "RES");

    const id = randomUUID();
    await execute(
      `INSERT INTO resellers (id, user_id, reseller_code, status, rank_key) VALUES (?, ?, ?, 'pending', 'starter')`,
      [id, userId, code]
    );
    res.json({ ok: true, message: "Application submitted. An admin will review and activate your account." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── SMME user joins partner programme with a package ────────────────────────
// Creates the reseller record (if missing) + selects/pays for the package in one step.
// Returns immediately for "affiliate" (free); returns Adumo form fields for paid tiers.
resellerRouter.post("/join", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { tier } = req.body;

    if (!tier || !["affiliate", "reseller", "master"].includes(tier)) {
      return res.status(400).json({ error: "Invalid tier" });
    }

    const userRecord = await queryOne("SELECT full_name, email FROM users WHERE id = ?", [userId]);

    // Ensure reseller record exists
    let r = await queryOne("SELECT id, package_tier FROM resellers WHERE user_id = ?", [userId]);
    if (!r) {
      const code = generateResellerCode(userRecord?.full_name || "RES");
      const newId = randomUUID();
      const now = new Date().toISOString();
      await execute(
        `INSERT INTO resellers (id, user_id, reseller_code, status, rank_key, created_at, approved_at)
         VALUES (?, ?, ?, 'active', 'starter', ?, ?)`,
        [newId, userId, code, now, now]
      );
      r = { id: newId, package_tier: null };
    }

    if (r.package_tier) {
      return res.status(400).json({ error: "You have already selected a package." });
    }

    // Free affiliate tier — activate immediately
    if (tier === "affiliate") {
      await execute(
        "UPDATE resellers SET package_tier = 'affiliate', package_paid_at = NOW() WHERE id = ?",
        [r.id]
      );
      return res.json({ ok: true, package_tier: "affiliate" });
    }

    // Paid tiers — create Adumo checkout with return to dashboard
    if (!process.env.ADUMO_CUID || !process.env.ADUMO_AUID || !process.env.ADUMO_JWT_SECRET) {
      return res.status(500).json({ error: "Payment gateway not configured" });
    }

    const pkg = PARTNER_PACKAGES[tier as keyof typeof PARTNER_PACKAGES];
    const amount = (pkg.amountCents / 100).toFixed(2);
    const merchantRef = `RJOIN_${tier.toUpperCase()}_${randomUUID().replace(/-/g, "").slice(0, 8)}`;
    const puid = randomUUID();

    await execute(
      `INSERT INTO reseller_billing_invoices (id, reseller_id, package_tier, amount_cents, currency, merchant_ref, status)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING')`,
      [randomUUID(), r.id, tier, pkg.amountCents, pkg.currency, merchantRef]
    );

    const token = generateSubscriptionToken(merchantRef, amount);

    const fields: Record<string, string> = {
      puid,
      MerchantID: process.env.ADUMO_CUID!,
      ApplicationID: process.env.ADUMO_AUID!,
      MerchantReference: merchantRef,
      Amount: amount,
      Token: token,
      txtCurrencyCode: pkg.currency,
      RedirectSuccessfulURL: `${APP_URL}/api/reseller/billing/return-redirect?status=success&merchantRef=${merchantRef}&returnPath=dashboard`,
      RedirectFailedURL:     `${APP_URL}/api/reseller/billing/return-redirect?status=failed&merchantRef=${merchantRef}&returnPath=dashboard`,
      Variable1: "PartnerJoin",
      Variable2: merchantRef,
      Qty1: "1",
      ItemRef1: tier,
      ItemDescr1: `${pkg.label} Partner Package - Once-off setup`,
      ItemAmount1: amount,
      ShippingCost: "0.00",
      Discount: "0.00",
      Recipient: userRecord?.full_name || "Partner",
      ShippingAddress1: "",
      ShippingAddress2: "",
      ShippingAddress3: "",
      frequency: "ONCE",
      contactNumber: "",
      mobileNumber: "",
      emailAddress: userRecord?.email || "",
      shouldSendSms: "false",
      shouldSendEmail: "true",
    };

    console.log("[Reseller Join] Checkout created:", { merchantRef, amount, tier });
    res.json({ formAction: ADUMO_URL, fields });
  } catch (err: any) {
    console.error("[Reseller Join] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get my reseller profile
resellerRouter.get("/me", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const reseller = await queryOne(
      `SELECT r.*, u.full_name, u.email,
              COALESCE(bp.business_name, u.full_name) as display_name,
              bp.logo_url, bp.phone
       FROM resellers r
       JOIN users u ON u.id = r.user_id
       LEFT JOIN business_profiles bp ON bp.user_id = r.user_id
       WHERE r.user_id = ?`,
      [userId]
    );
    if (!reseller) return res.json({ reseller: null });

    // Stats
    const stats = await queryOne(
      `SELECT COUNT(*) as total_clients,
              COALESCE(SUM(rc.plan_amount_cents), 0) as network_mrr,
              COUNT(CASE WHEN rc.registered_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_this_month
       FROM reseller_clients rc
       WHERE rc.reseller_id = ? AND rc.status = 'active'`,
      [reseller.id]
    );

    const earningsTotal = await queryOne(
      `SELECT COALESCE(SUM(amount_cents), 0) as total,
              COALESCE(SUM(CASE WHEN MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW()) THEN amount_cents ELSE 0 END), 0) as this_month
       FROM reseller_commissions WHERE reseller_id = ?`,
      [reseller.id]
    );

    const rankKey = await computeRank(reseller.id);
    if (rankKey !== reseller.rank_key) {
      await execute("UPDATE resellers SET rank_key = ? WHERE id = ?", [rankKey, reseller.id]);
      reseller.rank_key = rankKey;
    }

    const currentRankIdx = RANKS.findIndex(r => r.key === reseller.rank_key);
    const nextRank = currentRankIdx < RANKS.length - 1 ? RANKS[currentRankIdx + 1] : null;

    res.json({
      reseller: {
        ...reseller,
        referral_link: `${APP_URL}/register?ref=${reseller.reseller_code}`,
        total_clients: stats?.total_clients || 0,
        network_mrr_cents: stats?.network_mrr || 0,
        new_clients_this_month: stats?.new_this_month || 0,
        total_earnings_cents: earningsTotal?.total || 0,
        earnings_this_month_cents: earningsTotal?.this_month || 0,
        rank: RANKS[currentRankIdx] || RANKS[0],
        next_rank: nextRank,
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get my clients
resellerRouter.get("/me/clients", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const reseller = await queryOne("SELECT id FROM resellers WHERE user_id = ?", [userId]);
    if (!reseller) return res.status(404).json({ error: "Not a reseller" });

    const clients = await queryAll(
      `SELECT rc.*, u.full_name, u.email, u.created_at as user_created_at,
              bp.business_name, bp.phone,
              s.status as sub_status, s.plan_id,
              p.name as plan_name, p.amount_cents as plan_amount_cents
       FROM reseller_clients rc
       JOIN users u ON u.id = rc.client_user_id
       LEFT JOIN business_profiles bp ON bp.user_id = rc.client_user_id
       LEFT JOIN workspaces w ON w.owner_id = rc.client_user_id
       LEFT JOIN billing_subscriptions s ON s.workspace_id = w.id
       LEFT JOIN billing_plans p ON p.id = s.plan_id
       WHERE rc.reseller_id = ?
       ORDER BY rc.registered_at DESC`,
      [reseller.id]
    );
    res.json({ clients });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get my commissions
resellerRouter.get("/me/commissions", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const reseller = await queryOne("SELECT id FROM resellers WHERE user_id = ?", [userId]);
    if (!reseller) return res.status(404).json({ error: "Not a reseller" });

    const commissions = await queryAll(
      `SELECT c.*, u.full_name as client_name, bp.business_name as client_business
       FROM reseller_commissions c
       LEFT JOIN users u ON u.id = c.client_user_id
       LEFT JOIN business_profiles bp ON bp.user_id = c.client_user_id
       WHERE c.reseller_id = ?
       ORDER BY c.created_at DESC
       LIMIT 200`,
      [reseller.id]
    );
    res.json({ commissions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get leaderboard
resellerRouter.get("/leaderboard", async (req, res) => {
  try {
    const rows = await queryAll(
      `SELECT r.id, r.rank_key, r.reseller_code,
              COALESCE(bp.business_name, u.full_name) as display_name,
              bp.logo_url, u.full_name,
              COALESCE(u.city, bp.physical_address, 'South Africa') as location,
              COUNT(rc.id) as total_clients,
              COALESCE(SUM(c.amount_cents), 0) as total_earnings,
              COALESCE(SUM(CASE WHEN MONTH(c.created_at) = MONTH(NOW()) AND YEAR(c.created_at) = YEAR(NOW()) THEN c.amount_cents ELSE 0 END), 0) as this_month_earnings
       FROM resellers r
       JOIN users u ON u.id = r.user_id
       LEFT JOIN business_profiles bp ON bp.user_id = r.user_id
       LEFT JOIN reseller_clients rc ON rc.reseller_id = r.id
       LEFT JOIN reseller_commissions c ON c.reseller_id = r.id
       WHERE r.status = 'active'
       GROUP BY r.id, r.rank_key, r.reseller_code, bp.business_name, u.full_name, bp.logo_url, u.city, bp.physical_address
       ORDER BY this_month_earnings DESC
       LIMIT 20`,
      []
    );
    res.json({ leaderboard: rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Send invite email
resellerRouter.post("/me/invite", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { recipientEmail, recipientName } = req.body;
    if (!recipientEmail) return res.status(400).json({ error: "Recipient email is required" });

    const reseller = await queryOne(
      `SELECT r.reseller_code, COALESCE(bp.business_name, u.full_name) as display_name
       FROM resellers r JOIN users u ON u.id = r.user_id LEFT JOIN business_profiles bp ON bp.user_id = r.user_id
       WHERE r.user_id = ? AND r.status = 'active'`,
      [userId]
    );
    if (!reseller) return res.status(404).json({ error: "Active reseller account required" });

    const mailer = await getTransporterForUser(userId);
    if (!mailer) return res.status(400).json({ error: "Configure your SMTP email in Settings first." });

    const link = `${APP_URL}/register?ref=${reseller.reseller_code}`;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
<table width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:40px 20px;"><tr><td align="center">
<table width="600" cellspacing="0" cellpadding="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:32px 40px;">
  <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">${reseller.display_name}</h1>
  <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">Invites you to join Masakhe</p>
</td></tr>
<tr><td style="padding:36px 40px;">
  <p style="margin:0 0 16px;color:#4a4a5a;font-size:15px;line-height:1.6;">
    Hi${recipientName ? ` ${recipientName}` : ""},
  </p>
  <p style="margin:0 0 20px;color:#4a4a5a;font-size:15px;line-height:1.6;">
    <strong>${reseller.display_name}</strong> has invited you to join <strong>Masakhe SMME Growth Hub</strong> — South Africa's all-in-one business platform for invoicing, payroll, social media, and more.
  </p>
  <p style="margin:0 0 28px;color:#4a4a5a;font-size:15px;line-height:1.6;">Click the button below to register your business and get started:</p>
  <table cellspacing="0" cellpadding="0" style="margin:0 auto 28px;">
    <tr><td style="background:#007749;border-radius:8px;">
      <a href="${link}" style="display:inline-block;padding:16px 36px;color:#fff;text-decoration:none;font-size:16px;font-weight:700;">Create My Business Account →</a>
    </td></tr>
  </table>
  <p style="margin:0;color:#9a9aaa;font-size:12px;text-align:center;">Or copy this link: <span style="font-family:monospace;color:#007749;">${link}</span></p>
</td></tr>
<tr><td style="background:#f8f8fa;padding:20px 40px;text-align:center;border-top:1px solid #e8e8ec;">
  <p style="margin:0;color:#9a9aaa;font-size:12px;">Powered by Masakhe · South African SMME Platform</p>
</td></tr>
</table></td></tr></table></body></html>`;

    await mailer.transporter.sendMail({
      from: `"${mailer.fromName}" <${mailer.fromEmail}>`,
      to: recipientEmail,
      subject: `${reseller.display_name} invites you to join Masakhe`,
      html,
    });
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Billing: partner package selection ───────────────────────────────────────

// Get current package status
resellerRouter.get("/billing/status", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const r = await queryOne(
      "SELECT id, package_tier, package_paid_at FROM resellers WHERE user_id = ?",
      [userId]
    );
    if (!r) return res.status(404).json({ error: "Not a reseller" });
    res.json({ package_tier: r.package_tier || null, package_paid_at: r.package_paid_at || null });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Select the free "Affiliate" package — activates immediately
resellerRouter.post("/billing/select-free", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const r = await queryOne("SELECT id, package_tier FROM resellers WHERE user_id = ?", [userId]);
    if (!r) return res.status(404).json({ error: "Not a reseller" });
    if (r.package_tier) return res.status(400).json({ error: "Package already selected" });
    await execute(
      "UPDATE resellers SET package_tier = 'affiliate', package_paid_at = NOW() WHERE id = ?",
      [r.id]
    );
    res.json({ ok: true, package_tier: "affiliate" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Adumo once-off checkout for paid packages
resellerRouter.post("/billing/checkout", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { tier, recipientName, email, contactNumber } = req.body;

    if (!tier || !["reseller", "master"].includes(tier)) {
      return res.status(400).json({ error: "Invalid package tier" });
    }
    if (!process.env.ADUMO_CUID || !process.env.ADUMO_AUID || !process.env.ADUMO_JWT_SECRET) {
      return res.status(500).json({ error: "Payment gateway not configured" });
    }

    const r = await queryOne(
      "SELECT id, package_tier FROM resellers WHERE user_id = ?",
      [userId]
    );
    if (!r) return res.status(404).json({ error: "Not a reseller" });
    if (r.package_tier) return res.status(400).json({ error: "Package already selected" });

    const pkg = PARTNER_PACKAGES[tier as keyof typeof PARTNER_PACKAGES];
    const amount = (pkg.amountCents / 100).toFixed(2);
    const merchantRef = `RSEL_${tier.toUpperCase()}_${randomUUID().replace(/-/g, "").slice(0, 8)}`;
    const puid = randomUUID();

    await execute(
      `INSERT INTO reseller_billing_invoices (id, reseller_id, package_tier, amount_cents, currency, merchant_ref, status)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING')`,
      [randomUUID(), r.id, tier, pkg.amountCents, pkg.currency, merchantRef]
    );

    const token = generateSubscriptionToken(merchantRef, amount);
    const userRecord = await queryOne("SELECT full_name, email FROM users WHERE id = ?", [userId]);

    const fields: Record<string, string> = {
      puid,
      MerchantID: process.env.ADUMO_CUID!,
      ApplicationID: process.env.ADUMO_AUID!,
      MerchantReference: merchantRef,
      Amount: amount,
      Token: token,
      txtCurrencyCode: pkg.currency,
      RedirectSuccessfulURL: `${APP_URL}/api/reseller/billing/return-redirect?status=success&merchantRef=${merchantRef}`,
      RedirectFailedURL: `${APP_URL}/api/reseller/billing/return-redirect?status=failed&merchantRef=${merchantRef}`,
      Variable1: "PartnerPackage",
      Variable2: merchantRef,
      Qty1: "1",
      ItemRef1: tier,
      ItemDescr1: `${pkg.label} Partner Package - Once-off setup`,
      ItemAmount1: amount,
      ShippingCost: "0.00",
      Discount: "0.00",
      Recipient: recipientName || userRecord?.full_name || "Partner",
      ShippingAddress1: "",
      ShippingAddress2: "",
      ShippingAddress3: "",
      frequency: "ONCE",
      contactNumber: contactNumber || "",
      mobileNumber: contactNumber || "",
      emailAddress: email || userRecord?.email || "",
      shouldSendSms: "false",
      shouldSendEmail: "true",
    };

    console.log("[Reseller Billing] Checkout created:", { merchantRef, amount, tier });
    res.json({ formAction: ADUMO_URL, fields });
  } catch (err: any) {
    console.error("[Reseller Billing] Checkout error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Upgrade from current package to a higher tier
resellerRouter.post("/billing/upgrade", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { targetTier } = req.body;

    if (!targetTier || !["reseller", "master"].includes(targetTier)) {
      return res.status(400).json({ error: "Invalid target tier" });
    }
    if (!process.env.ADUMO_CUID || !process.env.ADUMO_AUID || !process.env.ADUMO_JWT_SECRET) {
      return res.status(500).json({ error: "Payment gateway not configured" });
    }

    const r = await queryOne("SELECT id, package_tier FROM resellers WHERE user_id = ?", [userId]);
    if (!r) return res.status(404).json({ error: "Not a reseller" });

    const TIER_ORDER: Record<string, number> = { affiliate: 0, reseller: 1, master: 2 };
    const currentOrder = TIER_ORDER[r.package_tier || ""] ?? -1;
    const targetOrder  = TIER_ORDER[targetTier] ?? -1;

    if (targetOrder <= currentOrder) {
      return res.status(400).json({ error: "Target tier must be higher than current tier" });
    }

    // Differential pricing
    const TIER_CENTS: Record<string, number> = { affiliate: 0, reseller: 99900, master: 499900 };
    const currentCents = TIER_CENTS[r.package_tier || "affiliate"] ?? 0;
    const targetCents  = TIER_CENTS[targetTier];
    const diffCents    = targetCents - currentCents;

    const pkg = PARTNER_PACKAGES[targetTier as keyof typeof PARTNER_PACKAGES];
    const amount = (diffCents / 100).toFixed(2);
    const merchantRef = `RUPG_${targetTier.toUpperCase()}_${randomUUID().replace(/-/g, "").slice(0, 8)}`;
    const puid = randomUUID();

    await execute(
      `INSERT INTO reseller_billing_invoices (id, reseller_id, package_tier, amount_cents, currency, merchant_ref, status)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING')`,
      [randomUUID(), r.id, targetTier, diffCents, pkg.currency, merchantRef]
    );

    const token = generateSubscriptionToken(merchantRef, amount);
    const userRecord = await queryOne("SELECT full_name, email FROM users WHERE id = ?", [userId]);

    const fields: Record<string, string> = {
      puid,
      MerchantID: process.env.ADUMO_CUID!,
      ApplicationID: process.env.ADUMO_AUID!,
      MerchantReference: merchantRef,
      Amount: amount,
      Token: token,
      txtCurrencyCode: pkg.currency,
      RedirectSuccessfulURL: `${APP_URL}/api/reseller/billing/return-redirect?status=success&merchantRef=${merchantRef}`,
      RedirectFailedURL: `${APP_URL}/api/reseller/billing/return-redirect?status=failed&merchantRef=${merchantRef}`,
      Variable1: "PartnerUpgrade",
      Variable2: merchantRef,
      Qty1: "1",
      ItemRef1: targetTier,
      ItemDescr1: `Upgrade to ${pkg.label} - Once-off`,
      ItemAmount1: amount,
      ShippingCost: "0.00",
      Discount: "0.00",
      Recipient: userRecord?.full_name || "Partner",
      ShippingAddress1: "",
      ShippingAddress2: "",
      ShippingAddress3: "",
      frequency: "ONCE",
      contactNumber: "",
      mobileNumber: "",
      emailAddress: userRecord?.email || "",
      shouldSendSms: "false",
      shouldSendEmail: "true",
    };

    console.log("[Reseller Billing] Upgrade checkout:", { merchantRef, amount, from: r.package_tier, to: targetTier });
    res.json({ formAction: ADUMO_URL, fields });
  } catch (err: any) {
    console.error("[Reseller Billing] Upgrade error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Adumo return redirect — activate package on successful payment
resellerRouter.get("/billing/return-redirect", async (req, res) => {
  const q = req.query as Record<string, string>;
  const status = q.status || q._RESULT || "";
  const merchantRef = (q.merchantRef || q._MERCHANTREFERENCE || q.MerchantReference || "") as string;

  console.log(`[Reseller Billing] Return redirect: status=${status}, merchantRef=${merchantRef}`);

  const returnPath = q.returnPath === "dashboard" ? "/dashboard/reseller" : "/partner";
  const redirectBase = `${APP_URL}${returnPath}`;

  if (!merchantRef) {
    return res.redirect(`${redirectBase}?payment=error`);
  }

  const invoice = await queryOne(
    "SELECT * FROM reseller_billing_invoices WHERE merchant_ref = ? AND status = 'PENDING'",
    [merchantRef]
  );

  if (!invoice) {
    console.warn(`[Reseller Billing] No pending invoice for merchantRef=${merchantRef}`);
    return res.redirect(`${redirectBase}?payment=error`);
  }

  const failed = status === "failed" || status.toLowerCase().includes("fail") || status === "0";
  if (failed) {
    await execute(
      "UPDATE reseller_billing_invoices SET status = 'FAILED' WHERE merchant_ref = ?",
      [merchantRef]
    );
    return res.redirect(`${redirectBase}?payment=failed`);
  }

  // Verify response token if present
  const responseToken = q._RESPONSETOKEN || q.ResponseToken || "";
  if (responseToken) {
    try {
      const decoded = verifyResponseToken(responseToken);
      if (decoded.mref && decoded.mref !== merchantRef) {
        console.error(`[Reseller Billing] Token mref mismatch: expected ${merchantRef}, got ${decoded.mref}`);
        return res.redirect(`${redirectBase}?payment=error`);
      }
    } catch (e: any) {
      console.error(`[Reseller Billing] Token verify failed:`, e.message);
    }
  }

  // Activate package
  await execute(
    "UPDATE reseller_billing_invoices SET status = 'PAID', paid_at = NOW() WHERE merchant_ref = ?",
    [merchantRef]
  );
  await execute(
    "UPDATE resellers SET package_tier = ?, package_paid_at = NOW() WHERE id = ?",
    [invoice.package_tier, invoice.reseller_id]
  );

  console.log(`[Reseller Billing] Package activated: tier=${invoice.package_tier}, reseller_id=${invoice.reseller_id}`);
  res.redirect(`${redirectBase}?payment=success`);
});

// ─── Custom Domain endpoints ───────────────────────────────────────────────────

// GET current domain status
resellerRouter.get("/me/domain", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const r = await queryOne(
      "SELECT custom_domain, domain_verified, package_tier FROM resellers WHERE user_id = ?",
      [userId]
    );
    if (!r) return res.status(404).json({ error: "Reseller record not found" });
    res.json({
      custom_domain:   r.custom_domain   ?? null,
      domain_verified: !!r.domain_verified,
      package_tier:    r.package_tier    ?? null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST save/update custom domain (reseller/master tier only)
resellerRouter.post("/me/domain", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const r = await queryOne(
      "SELECT id, package_tier FROM resellers WHERE user_id = ?",
      [userId]
    );
    if (!r) return res.status(404).json({ error: "Reseller record not found" });
    if (!["reseller", "master"].includes(r.package_tier)) {
      return res.status(403).json({ error: "Custom domain requires Reseller or Master Reseller package" });
    }

    let { domain } = req.body as { domain: string };
    if (!domain) return res.status(400).json({ error: "Domain is required" });

    // Sanitise: strip protocol and trailing slashes
    domain = domain.replace(/^https?:\/\//i, "").replace(/\/+$/, "").trim().toLowerCase();

    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
      return res.status(400).json({ error: "Invalid domain format" });
    }

    // Check uniqueness against other resellers
    const conflict = await queryOne(
      "SELECT id FROM resellers WHERE custom_domain = ? AND id != ?",
      [domain, r.id]
    );
    if (conflict) return res.status(409).json({ error: "This domain is already in use" });

    await execute(
      "UPDATE resellers SET custom_domain = ?, domain_verified = 0 WHERE id = ?",
      [domain, r.id]
    );
    res.json({ ok: true, custom_domain: domain, domain_verified: false });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST verify domain — checks CNAME via dns.promises
resellerRouter.post("/me/domain/verify", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const r = await queryOne(
      "SELECT id, custom_domain, package_tier FROM resellers WHERE user_id = ?",
      [userId]
    );
    if (!r) return res.status(404).json({ error: "Reseller record not found" });
    if (!r.custom_domain) return res.status(400).json({ error: "No domain set" });

    const dns = await import("dns");
    const dnsPromises = dns.promises;
    const TARGET = (process.env.APP_URL || "https://masakheportal.co.za")
      .replace(/^https?:\/\//i, "")
      .replace(/\/+$/, "");

    let verified = false;
    try {
      const cnames = await dnsPromises.resolveCname(r.custom_domain);
      verified = cnames.some((c: string) => c.replace(/\.+$/, "") === TARGET);
    } catch {
      // No CNAME — try A record lookup as fallback (won't confirm our server, but domain resolves)
      try {
        await dnsPromises.resolve4(r.custom_domain);
        // Domain resolves but CNAME mismatch — not verified
      } catch {
        return res.status(400).json({ ok: false, error: "Domain does not resolve in DNS. Please check your DNS settings." });
      }
    }

    if (verified) {
      await execute("UPDATE resellers SET domain_verified = 1 WHERE id = ?", [r.id]);
      return res.json({ ok: true, verified: true, message: "Domain verified successfully!" });
    }

    res.json({ ok: true, verified: false, message: `CNAME not pointing to ${TARGET} yet. DNS changes can take up to 48 hours.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE remove custom domain
resellerRouter.delete("/me/domain", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const r = await queryOne("SELECT id FROM resellers WHERE user_id = ?", [userId]);
    if (!r) return res.status(404).json({ error: "Reseller record not found" });
    await execute("UPDATE resellers SET custom_domain = NULL, domain_verified = 0 WHERE id = ?", [r.id]);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Admin routes ─────────────────────────────────────────────────────────────

// Admin summary stats
resellerRouter.get("/admin/stats", requireAdmin, async (req, res) => {
  try {
    const counts = await queryOne(`
      SELECT
        COUNT(*) as total,
        SUM(status = 'active') as active,
        SUM(status = 'pending') as pending,
        SUM(status = 'suspended') as suspended,
        SUM(package_tier = 'affiliate') as pkg_affiliate,
        SUM(package_tier = 'reseller') as pkg_reseller,
        SUM(package_tier = 'master') as pkg_master,
        SUM(package_tier IS NULL) as pkg_none
      FROM resellers
    `, []);

    const commissions = await queryOne(`
      SELECT
        COALESCE(SUM(amount_cents), 0) as total_cents,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount_cents ELSE 0 END), 0) as paid_cents,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount_cents ELSE 0 END), 0) as pending_cents
      FROM reseller_commissions
    `, []);

    const packageRevenue = await queryOne(`
      SELECT COALESCE(SUM(amount_cents), 0) as total_cents
      FROM reseller_billing_invoices
      WHERE status = 'PAID'
    `, []);

    res.json({
      total: counts?.total || 0,
      active: counts?.active || 0,
      pending: counts?.pending || 0,
      suspended: counts?.suspended || 0,
      pkg_affiliate: counts?.pkg_affiliate || 0,
      pkg_reseller: counts?.pkg_reseller || 0,
      pkg_master: counts?.pkg_master || 0,
      pkg_none: counts?.pkg_none || 0,
      commissions_total_cents: commissions?.total_cents || 0,
      commissions_paid_cents: commissions?.paid_cents || 0,
      commissions_pending_cents: commissions?.pending_cents || 0,
      package_revenue_cents: packageRevenue?.total_cents || 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: get commissions for a specific reseller
resellerRouter.get("/admin/:id/commissions", requireAdmin, async (req, res) => {
  try {
    const commissions = await queryAll(
      `SELECT c.*, u.full_name as client_name
       FROM reseller_commissions c
       LEFT JOIN users u ON u.id = c.client_user_id
       WHERE c.reseller_id = ?
       ORDER BY c.created_at DESC LIMIT 50`,
      [req.params.id]
    );
    res.json({ commissions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: get clients for a specific reseller
resellerRouter.get("/admin/:id/clients", requireAdmin, async (req, res) => {
  try {
    const clients = await queryAll(
      `SELECT rc.*, u.full_name, u.email,
              bp.business_name, bp.phone,
              s.status as sub_status, p.name as plan_name, p.price_cents
       FROM reseller_clients rc
       JOIN users u ON u.id = rc.client_user_id
       LEFT JOIN business_profiles bp ON bp.user_id = rc.client_user_id
       LEFT JOIN workspaces w ON w.owner_id = rc.client_user_id
       LEFT JOIN billing_subscriptions s ON s.workspace_id = w.id
       LEFT JOIN billing_plans p ON p.id = s.plan_id
       WHERE rc.reseller_id = ?
       ORDER BY rc.registered_at DESC`,
      [req.params.id]
    );
    res.json({ clients });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

resellerRouter.get("/admin/all", requireAdmin, async (req, res) => {
  try {
    const resellers = await queryAll(
      `SELECT r.*, COALESCE(bp.business_name, u.full_name) as display_name,
              u.full_name, u.email,
              COUNT(rc.id) as total_clients,
              COALESCE(SUM(c.amount_cents), 0) as total_earnings
       FROM resellers r
       JOIN users u ON u.id = r.user_id
       LEFT JOIN business_profiles bp ON bp.user_id = r.user_id
       LEFT JOIN reseller_clients rc ON rc.reseller_id = r.id
       LEFT JOIN reseller_commissions c ON c.reseller_id = r.id
       GROUP BY r.id, bp.business_name, u.full_name, u.email
       ORDER BY r.created_at DESC`,
      []
    );
    res.json({ resellers });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

resellerRouter.patch("/admin/:id/status", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "active", "suspended"].includes(status)) return res.status(400).json({ error: "Invalid status" });
    const updates: any[] = [status, req.params.id];
    const approvedAt = status === "active" ? ", approved_at = NOW()" : "";
    await execute(`UPDATE resellers SET status = ?${approvedAt} WHERE id = ?`, updates);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Add a manual commission entry (admin)
resellerRouter.post("/admin/commission", requireAdmin, async (req, res) => {
  try {
    const { resellerId, amountCents, type, description } = req.body;
    await execute(
      `INSERT INTO reseller_commissions (id, reseller_id, commission_type, amount_cents, description, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [randomUUID(), resellerId, type || "direct", amountCents, description || "Manual entry"]
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mark commissions as paid (admin)
resellerRouter.patch("/admin/commission/:id/pay", requireAdmin, async (req, res) => {
  try {
    await execute("UPDATE reseller_commissions SET status = 'paid' WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Hook: called from auth.ts after user registers with a ref code ───────────
export async function linkResellerClient(clientUserId: string, refCode: string) {
  try {
    const reseller = await queryOne("SELECT id FROM resellers WHERE reseller_code = ? AND status = 'active'", [refCode]);
    if (!reseller) return;
    const existing = await queryOne("SELECT id FROM reseller_clients WHERE client_user_id = ?", [clientUserId]);
    if (existing) return;
    await execute(
      `INSERT INTO reseller_clients (id, reseller_id, client_user_id, status, registered_at)
       VALUES (?, ?, ?, 'active', NOW())`,
      [randomUUID(), reseller.id, clientUserId]
    );
    // Record level 1 commission placeholder (will be updated when they subscribe)
    await execute(
      `INSERT INTO reseller_commissions (id, reseller_id, client_user_id, level, commission_type, amount_cents, description, status)
       VALUES (?, ?, ?, 1, 'direct', 0, 'Client registered — commission pending subscription', 'pending')`,
      [randomUUID(), reseller.id, clientUserId]
    );
    await execute("UPDATE resellers SET total_clients = total_clients + 1 WHERE id = ?", [reseller.id]);
    console.log(`[Reseller] Linked client ${clientUserId} to reseller ${reseller.id}`);
  } catch (err: any) {
    console.error("[Reseller] linkResellerClient error:", err.message);
  }
}
