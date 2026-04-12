import { Router } from "express";
import { queryOne, queryAll, execute } from "./db";
import { requireAdmin } from "./auth";
import { randomUUID } from "crypto";
import { getBaseUrl } from "./email";
import { getTransporterForUser } from "./email-settings";

export const adminRouter = Router();

async function ensureWorkspaceForUser(userId: string): Promise<string> {
  const existing = await queryOne(
    "SELECT w.id FROM workspaces w JOIN workspace_members wm ON wm.workspace_id = w.id WHERE wm.user_id = ? LIMIT 1",
    [userId]
  );
  if (existing) return existing.id;

  const user = await queryOne("SELECT full_name, email FROM users WHERE id = ?", [userId]);
  const wsName = user?.full_name ? `${user.full_name}'s Business` : (user?.email || "Business");
  const wsId = randomUUID();
  const now = new Date().toISOString();
  await execute("INSERT INTO workspaces (id, name, owner_id, created_at, updated_at) VALUES (?,?,?,?,?)", [wsId, wsName, userId, now, now]);
  await execute("INSERT INTO workspace_members (id, workspace_id, user_id, role, created_at) VALUES (?,?,?,?,?)", [randomUUID(), wsId, userId, "owner", now]);
  return wsId;
}

adminRouter.use(requireAdmin);

adminRouter.get("/stats", async (req, res) => {
  try {
    const totalUsers = (await queryOne("SELECT COUNT(*) as c FROM users"))?.c || 0;
    const totalWebsites = (await queryOne("SELECT COUNT(*) as c FROM websites"))?.c || 0;
    const publishedWebsites = (await queryOne("SELECT COUNT(*) as c FROM websites WHERE status = 'published'"))?.c || 0;
    const totalProfiles = (await queryOne("SELECT COUNT(*) as c FROM business_profiles"))?.c || 0;
    const recentUsers = (await queryOne("SELECT COUNT(*) as c FROM users WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)"))?.c || 0;
    const totalInvoices = (await queryOne("SELECT COUNT(*) as c FROM invoices"))?.c || 0;
    const totalLedgerEntries = (await queryOne("SELECT COUNT(*) as c FROM ledger_entries"))?.c || 0;

    const monthlyTotals = await queryAll(
      `SELECT LEFT(occurred_at, 7) as month, type, SUM(amount_cents) as total
       FROM ledger_entries
       GROUP BY month, type
       ORDER BY month DESC
       LIMIT 24`
    );

    const revenueByMonth: Record<string, { income: number; expense: number }> = {};
    for (const row of monthlyTotals) {
      if (!revenueByMonth[row.month]) revenueByMonth[row.month] = { income: 0, expense: 0 };
      if (row.type === "INCOME") revenueByMonth[row.month].income = row.total;
      else revenueByMonth[row.month].expense = row.total;
    }

    res.json({
      totalUsers, totalWebsites, publishedWebsites, totalProfiles, recentUsers,
      totalInvoices, totalLedgerEntries,
      revenueByMonth: Object.entries(revenueByMonth).map(([month, d]) => ({ month, ...d })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

adminRouter.get("/clients", async (req, res) => {
  try {
    const clients = await queryAll(
      `SELECT u.id, u.email, u.full_name, u.role, u.created_at,
              bp.business_name, bp.trading_name, bp.business_status, bp.business_type,
              bp.industry_sector, bp.phone, bp.physical_address,
              (SELECT COUNT(*) FROM websites WHERE owner_id = u.id) as website_count,
              bs.status as subscription_status, bs.trial_end_at,
              bpl.code as plan_code, bpl.name as plan_name
       FROM users u
       LEFT JOIN business_profiles bp ON bp.user_id = u.id
       LEFT JOIN workspace_members wm ON wm.user_id = u.id
       LEFT JOIN billing_subscriptions bs ON bs.workspace_id = wm.workspace_id AND bs.status IN ('ACTIVE','TRIAL') AND (bs.status != 'TRIAL' OR bs.trial_end_at > NOW())
       LEFT JOIN billing_plans bpl ON bpl.id = bs.plan_id
       ORDER BY u.created_at DESC`
    );
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

adminRouter.get("/clients/:id", async (req, res) => {
  try {
    const user = await queryOne(
      `SELECT u.id, u.email, u.full_name, u.role, u.created_at, u.updated_at,
              bp.business_name, bp.trading_name, bp.business_status, bp.business_type,
              bp.industry_sector, bp.years_operating, bp.employee_count,
              bp.phone, bp.whatsapp, bp.email as bp_email, bp.physical_address
       FROM users u
       LEFT JOIN business_profiles bp ON bp.user_id = u.id
       WHERE u.id = ?`,
      [req.params.id]
    );

    if (!user) return res.status(404).json({ error: "Client not found" });

    const websites = await queryAll("SELECT * FROM websites WHERE owner_id = ?", [req.params.id]);

    res.json({
      user: {
        id: user.id, email: user.email, full_name: user.full_name, role: user.role, created_at: user.created_at
      },
      profile: {
        business_name: user.business_name,
        trading_name: user.trading_name,
        business_status: user.business_status,
        business_type: user.business_type,
        industry_sector: user.industry_sector,
        years_operating: user.years_operating,
        employee_count: user.employee_count,
        phone: user.phone,
        whatsapp: user.whatsapp,
        email: user.bp_email,
        physical_address: user.physical_address,
      },
      websites: websites.map((w: any) => ({ ...w, content: JSON.parse(w.content_json) })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch client" });
  }
});

adminRouter.post("/clients/:id/trial", async (req, res) => {
  try {
    const workspaceId = await ensureWorkspaceForUser(req.params.id);
    const workspace = { id: workspaceId };

    const premiumPlan = await queryOne("SELECT id FROM billing_plans WHERE code = 'premium'");
    if (!premiumPlan) return res.status(404).json({ error: "Premium plan not found" });

    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);
    const trialEndStr = trialEnd.toISOString().slice(0, 19).replace("T", " ");
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    const existing = await queryOne(
      "SELECT id FROM billing_subscriptions WHERE workspace_id = ? LIMIT 1",
      [workspace.id]
    );
    if (existing) {
      await execute(
        "UPDATE billing_subscriptions SET status = 'TRIAL', plan_id = ?, trial_start_at = ?, trial_end_at = ?, updated_at = NOW() WHERE id = ?",
        [premiumPlan.id, now, trialEndStr, existing.id]
      );
    } else {
      await execute(
        "INSERT INTO billing_subscriptions (workspace_id, plan_id, status, trial_start_at, trial_end_at) VALUES (?, ?, 'TRIAL', ?, ?)",
        [workspace.id, premiumPlan.id, now, trialEndStr]
      );
    }
    res.json({ ok: true, trialEndsAt: trialEndStr });
  } catch (err) {
    res.status(500).json({ error: "Failed to grant trial" });
  }
});

adminRouter.post("/clients/:id/subscription", async (req, res) => {
  try {
    const { plan } = req.body;
    if (!["starter", "pro", "premium"].includes(plan)) {
      return res.status(400).json({ error: "Invalid plan. Use 'starter', 'pro', or 'premium'." });
    }
    const workspaceId = await ensureWorkspaceForUser(req.params.id);
    const workspace = { id: workspaceId };
    const billingPlan = await queryOne("SELECT id FROM billing_plans WHERE code = ?", [plan]);
    if (!billingPlan) return res.status(404).json({ error: "Billing plan not found" });
    const existing = await queryOne(
      "SELECT id FROM billing_subscriptions WHERE workspace_id = ? LIMIT 1",
      [workspace.id]
    );
    if (existing) {
      await execute(
        "UPDATE billing_subscriptions SET status = 'ACTIVE', plan_id = ?, updated_at = NOW() WHERE id = ?",
        [billingPlan.id, existing.id]
      );
    } else {
      await execute(
        "INSERT INTO billing_subscriptions (workspace_id, plan_id, status) VALUES (?, ?, 'ACTIVE')",
        [workspace.id, billingPlan.id]
      );
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to grant subscription" });
  }
});

adminRouter.delete("/clients/:id/subscription", async (req, res) => {
  try {
    const workspaceId = await ensureWorkspaceForUser(req.params.id);
    const workspace = { id: workspaceId };
    await execute(
      "UPDATE billing_subscriptions SET status = 'CANCELLED', updated_at = NOW() WHERE workspace_id = ? AND status IN ('ACTIVE','TRIAL')",
      [workspace.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to revoke subscription" });
  }
});

adminRouter.patch("/clients/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    await execute("UPDATE users SET role = ?, updated_at = ? WHERE id = ?",
      [role, new Date().toISOString(), req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update role" });
  }
});

adminRouter.post("/impersonate/:userId", async (req, res) => {
  try {
    const targetId = req.params.userId;
    const adminId = req.session.userId!;

    if (targetId === adminId) {
      return res.status(400).json({ error: "Cannot impersonate yourself" });
    }

    const target = await queryOne("SELECT id, full_name, email, role FROM users WHERE id = ?", [targetId]);
    if (!target) return res.status(404).json({ error: "User not found" });

    if (target.role === "admin") {
      return res.status(400).json({ error: "Cannot impersonate another admin" });
    }

    req.session.originalAdminId = adminId;
    req.session.userId = targetId;
    req.session.save(() => {
      res.json({ ok: true, targetName: target.full_name });
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to impersonate user" });
  }
});


adminRouter.get("/websites", async (req, res) => {
  try {
    const websites = await queryAll(
      `SELECT w.id, w.slug, w.status, w.created_at, w.updated_at,
              u.id as owner_id, u.full_name, u.email,
              bp.business_name, bp.trading_name
       FROM websites w
       JOIN users u ON u.id = w.owner_id
       LEFT JOIN business_profiles bp ON bp.user_id = u.id
       ORDER BY w.updated_at DESC`
    );
    res.json(websites);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch websites" });
  }
});

adminRouter.post("/clients/:id/invoice", async (req, res) => {
  try {
    const { amountCents, description, planOverride } = req.body;
    if (!amountCents || amountCents < 1) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const clientUser = await queryOne(
      `SELECT u.id, u.email, u.full_name,
              bp.business_name
       FROM users u
       LEFT JOIN business_profiles bp ON bp.user_id = u.id
       WHERE u.id = ?`,
      [req.params.id]
    );
    if (!clientUser) return res.status(404).json({ error: "Client not found" });

    const workspaceId = await ensureWorkspaceForUser(req.params.id);

    const subscription = await queryOne(
      `SELECT bs.id, bs.status, bs.plan_id, bp.code as plan_code, bp.name as plan_name, bp.price_cents
       FROM billing_subscriptions bs
       JOIN billing_plans bp ON bp.id = bs.plan_id
       WHERE bs.workspace_id = ? AND bs.status IN ('ACTIVE','TRIAL')
       ORDER BY bs.created_at DESC LIMIT 1`,
      [workspaceId]
    );

    const planName = planOverride || subscription?.plan_name || "Subscription";
    const merchantRef = `INV-ADM-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });

    await execute(
      `INSERT INTO billing_invoices (workspace_id, subscription_id, plan_id, amount_cents, currency, status, merchant_ref, created_at)
       VALUES (?, ?, ?, ?, 'ZAR', 'PENDING', ?, ?)`,
      [workspaceId, subscription?.id || null, subscription?.plan_id || null, amountCents, merchantRef, now]
    );

    const invoiceNumber = merchantRef;
    const descText = description || `Monthly ${planName} subscription`;
    const appUrl = getBaseUrl(req.get("origin") || undefined);
    const firstName = (clientUser.full_name || clientUser.email).split(" ")[0];
    const amountFormatted = `R${(amountCents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;

    let emailSent = false;
    const mailer = await getTransporterForUser(req.session.userId!);
    if (mailer) {
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
<table width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:40px 20px;"><tr><td align="center">
<table width="600" cellspacing="0" cellpadding="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#007749,#005C3A);padding:32px 40px;text-align:center;">
  <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700;">Masakhe</h1>
  <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Subscription Invoice</p>
</td></tr>
<tr><td style="padding:40px;">
  <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;">Invoice #${invoiceNumber}</h2>
  <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Hi ${firstName}, please find your subscription invoice below.</p>
  <table width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
    <tr style="background:#f9fafb;"><td style="padding:12px 16px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Description</td><td style="padding:12px 16px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;border-bottom:1px solid #e5e7eb;text-align:right;">Amount</td></tr>
    <tr><td style="padding:16px;color:#1a1a2e;font-size:15px;"><strong>${planName} Subscription</strong><br><span style="color:#6b7280;font-size:13px;">${descText}</span></td><td style="padding:16px;color:#1a1a2e;font-size:15px;font-weight:700;text-align:right;">${amountFormatted}</td></tr>
    <tr style="background:#f9fafb;border-top:2px solid #e5e7eb;"><td style="padding:12px 16px;font-size:14px;font-weight:700;color:#1a1a2e;">Total Due</td><td style="padding:12px 16px;font-size:16px;font-weight:700;color:#007749;text-align:right;">${amountFormatted}</td></tr>
  </table>
  <p style="margin:0 0 16px;color:#6b7280;font-size:13px;">Due Date: <strong style="color:#1a1a2e;">${dueDate}</strong></p>
  <table cellspacing="0" cellpadding="0" style="margin:0 0 24px;"><tr><td style="background:#007749;border-radius:8px;"><a href="${appUrl}/dashboard/billing" style="display:inline-block;padding:14px 32px;color:#fff;text-decoration:none;font-size:15px;font-weight:600;">Pay Now</a></td></tr></table>
  <p style="margin:0;color:#6b7280;font-size:13px;">If you have questions, contact us at ${mailer.fromEmail}.</p>
</td></tr>
<tr><td style="background:#f8f8fa;padding:24px 40px;text-align:center;border-top:1px solid #e8e8ec;">
  <p style="margin:0;color:#9a9aaa;font-size:12px;">&copy; ${new Date().getFullYear()} Masakhe. A digital platform for South African SMMEs.</p>
</td></tr>
</table></td></tr></table></body></html>`;

      try {
        await mailer.transporter.sendMail({
          from: `"${mailer.fromName}" <${mailer.fromEmail}>`,
          to: clientUser.email,
          ...(mailer.replyTo ? { replyTo: mailer.replyTo } : {}),
          subject: `Invoice #${invoiceNumber} — ${planName} Subscription`,
          html,
        });
        emailSent = true;
      } catch (mailErr: any) {
        console.error("Invoice email failed:", mailErr.message);
      }
    }

    res.json({ ok: true, invoiceNumber, emailSent });
  } catch (err: any) {
    console.error("Admin invoice creation error:", err);
    res.status(500).json({ error: "Failed to create invoice" });
  }
});

adminRouter.get("/clients/subscribed", async (req, res) => {
  try {
    const clients = await queryAll(
      `SELECT u.id, u.email, u.full_name,
              bp.business_name,
              bs.status as subscription_status,
              bpl.code as plan_code, bpl.name as plan_name, bpl.price_cents
       FROM users u
       LEFT JOIN business_profiles bp ON bp.user_id = u.id
       JOIN workspace_members wm ON wm.user_id = u.id
       JOIN billing_subscriptions bs ON bs.workspace_id = wm.workspace_id AND bs.status IN ('ACTIVE','TRIAL')
       JOIN billing_plans bpl ON bpl.id = bs.plan_id
       ORDER BY u.full_name ASC`
    );
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subscribed clients" });
  }
});

adminRouter.delete("/clients/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    if (userId === req.session?.userId) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }
    await execute("DELETE FROM websites WHERE owner_id = ?", [userId]);
    await execute("DELETE FROM business_profiles WHERE user_id = ?", [userId]);
    await execute("DELETE FROM users WHERE id = ?", [userId]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete client" });
  }
});
