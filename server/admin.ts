import { Router } from "express";
import { queryOne, queryAll, execute, pool } from "./db";
import { requireAdmin } from "./auth";
import { randomUUID, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { getTransporterForUser } from "./email-settings";
import { sendFranchiseOwnerInviteEmail, getSharedTransporter, emailShell } from "./email";
import nodemailer from "nodemailer";
import { encrypt, decrypt } from "./crypto";

export const adminRouter = Router();

// ───────────────────────── Drip email seed data ─────────────────────────
const DRIP_EMAIL_SEED = [
  { seq: 1,  subject: "One platform. Everything your SMME needs.", body: `Running a small business means juggling a dozen tools. Masakhe brings them all together – website, invoices, payroll, CRM, social media, and finances. No more jumping between tabs.\n\nClaim your 14-day free trial and see the difference.\n👉 Start now at www.masakheportal.co.za/register` },
  { seq: 2,  subject: "Your website, live in minutes (no developer needed)", body: `With Masakhe's AI website builder, you have a free "drag & drop" website builder. Edit with WYSIWYG What You See is What You Get Editor and post live! Professional, fast, and mobile-friendly – perfect for South African SMMEs.\n\nBuild yours free for 14 days.\n👉 Register at www.masakheportal.co.za/register` },
  { seq: 3,  subject: "Stop chasing payments. Start sending professional invoices.", body: `Choose from multiple templates, or create your own customised version, add your logo in settings, and send quotes and invoices in minutes from your dashboard!\nTrack what's paid and what's overdue – all from one dashboard.\n\nTry it free for two weeks.\n👉 Sign up at www.masakheportal.co.za/register` },
  { seq: 4,  subject: "Payroll headaches? Not anymore.", body: `Generate payslips, auto-calculate deductions, and manage employee records without spreadsheets. Masakhe handles the numbers so you can focus on your team.\n\nTest payroll with your free trial.\n👉 Start at www.masakheportal.co.za/register` },
  { seq: 5,  subject: "Never lose a lead again.", body: `Keep all client conversations, documents, and history in one place. Masakhe's CRM helps you nurture relationships and close deals faster – custom built for you at no extra cost.\n\nExperience the CRM free for 14 days.\n👉 Register now: www.masakheportal.co.za/register` },
  { seq: 6,  subject: "Plan a week of posts in minutes.", body: `Create, download and post to all your social channels from Masakhe in minutes!\nNo more last-minute rushes or forgotten posts – just consistent engagement.\n\nStart scheduling free today.\n👉 Claim your trial at www.masakheportal.co.za/register` },
  { seq: 7,  subject: "Know exactly where every rand goes.", body: `Link your transactions, track expenses, and see your cash flow at a glance. Masakhe gives you the financial clarity every SMME needs to grow.\n\nSee it in action with a free trial.\n👉 Sign up at www.masakheportal.co.za/register` },
  { seq: 8,  subject: "Reclaim your time. Let Masakhe do the busy work.", body: `Imagine not switching between six different apps. Masakhe automates invoicing, payroll, social media, and more – so you can focus on serving customers.\n\nTry the time-saver free for 14 days.\n👉 Register at www.masakheportal.co.za/register` },
  { seq: 9,  subject: "Stop paying for 5 separate tools.", body: `Website builder + invoicing + payroll + CRM + social scheduler = thousands of rands. Masakhe combines them all from R899/month after trial.\n\nFirst 14 days are on us.\n👉 Start free at www.masakheportal.co.za/register` },
  { seq: 10, subject: "Small business, big brand impression.", body: `A sleek website, branded invoices, and organised client management make you look like a market leader. Masakhe gives you that polished image without the high cost.\n\nBuild your professional presence free.\n👉 Register now: www.masakheportal.co.za/register` },
  { seq: 11, subject: "Designed for South African SMMEs – easy for everyone.", body: `Drag, drop, click, done. Masakhe's interface is intuitive, with guided steps for every feature. You don't need an IT degree to run your business like a pro.\n\nProve it to yourself – free trial.\n👉 Sign up at www.masakheportal.co.za/register` },
  { seq: 12, subject: "A free trial that's actually free.", body: `No credit card required. No hidden fees. Just 14 full days of access to everything Masakhe offers. If you love it, upgrade later. If not, walk away.\n\nStart your risk-free trial today.\n👉 www.masakheportal.co.za/register` },
  { seq: 13, subject: "Your 14-day roadmap to a smoother business.", body: `Day 1: Build your AI website. Day 2: Send an invoice. Day 3: Schedule social posts. By day 14, you'll wonder how you managed without Masakhe.\n\nGet the full roadmap – start free.\n👉 Register at www.masakheportal.co.za/register` },
  { seq: 14, subject: "Stop juggling. Start managing.", body: `When your clients, finances, and team are all in one place, running your business becomes calm and clear. Masakhe brings order to the chaos.\n\nExperience control free for 14 days.\n👉 Claim your trial at www.masakheportal.co.za/register` },
  { seq: 15, subject: "Your business is ready to scale. Is your software?", body: `Masakhe grows with you. Add more clients, more employees, more social accounts – the platform handles it all. No need to switch tools when you level up.\n\nTest the scalability free.\n👉 Start at www.masakheportal.co.za/register` },
  { seq: 16, subject: "Local taxes. Local rules. Local support.", body: `Masakhe understands SARS payroll requirements, local invoice regulations, and the way you do business. Not a generic international tool – made for you.\n\nTry the local advantage free.\n👉 Register now: www.masakheportal.co.za/register` },
  { seq: 17, subject: "Sleep better knowing your business data is protected.", body: `We take security seriously. Your client info, payroll records, and financial data are encrypted and backed up. So you can focus on growing, not worrying.\n\nSee our security features free.\n👉 Sign up at www.masakheportal.co.za/register` },
  { seq: 18, subject: "The dashboard that does it all.", body: `Log in once. From one dashboard, manage your website, send invoices, run payroll, talk to clients, schedule posts, and track money. That's the Masakhe power.\n\nExperience total control free.\n👉 Claim your 14-day trial at www.masakheportal.co.za/register` },
  { seq: 19, subject: "Join hundreds of South African businesses already saving time.", body: `"Masakhe cut my admin by 70%." "I built my site in 10 minutes." "Finally, one tool for everything." Don't just take our word for it.\n\nJoin them – start your free trial.\n👉 Register at www.masakheportal.co.za/register` },
  { seq: 20, subject: "Don't let another week slip away.", body: `Every day you wait is another day of juggling spreadsheets, missed social posts, and late invoices. Your 14-day free trial is ready – click below to claim it.\n\n👉 Start your free trial now at www.masakheportal.co.za/register` },
];

// ───────────────────────── Migrations: notes/tags + audit log + drip emails ─────────────────────────
export async function runAdminMigrations() {
  const conn = await pool.getConnection();
  try {
    try {
      await conn.query(`ALTER TABLE users ADD COLUMN admin_notes LONGTEXT NULL`);
    } catch (e: any) { if (!e.message?.includes("Duplicate column")) console.error("[Admin] notes col:", e.message); }
    try {
      await conn.query(`ALTER TABLE users ADD COLUMN admin_tags JSON NULL`);
    } catch (e: any) { if (!e.message?.includes("Duplicate column")) console.error("[Admin] tags col:", e.message); }

    await conn.query(`
      CREATE TABLE IF NOT EXISTS admin_audit_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id VARCHAR(36) NOT NULL,
        admin_name VARCHAR(255) NULL,
        admin_email VARCHAR(255) NULL,
        action VARCHAR(80) NOT NULL,
        target_type VARCHAR(40) NULL,
        target_id VARCHAR(64) NULL,
        target_label VARCHAR(255) NULL,
        details_json TEXT NULL,
        ip_address VARCHAR(64) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_audit_admin (admin_id),
        INDEX idx_audit_action (action),
        INDEX idx_audit_target (target_type, target_id),
        INDEX idx_audit_created (created_at)
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS system_smtp_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        smtp_host VARCHAR(255) NOT NULL DEFAULT '',
        smtp_port INT NOT NULL DEFAULT 465,
        smtp_secure TINYINT(1) NOT NULL DEFAULT 1,
        smtp_user VARCHAR(255) NOT NULL DEFAULT '',
        smtp_pass_enc TEXT NOT NULL DEFAULT '',
        from_name VARCHAR(255) NOT NULL DEFAULT 'Masakhe',
        from_email VARCHAR(255) NOT NULL DEFAULT '',
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS admin_drip_emails (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sequence_number INT NOT NULL,
        subject VARCHAR(500) NOT NULL,
        body_text LONGTEXT NOT NULL,
        enabled TINYINT(1) NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_drip_seq (sequence_number),
        INDEX idx_drip_enabled (enabled)
      ) ENGINE=InnoDB
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS admin_drip_sends (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        drip_email_id INT NOT NULL,
        sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_drip_user_email (user_id, drip_email_id),
        INDEX idx_drip_sends_user (user_id)
      ) ENGINE=InnoDB
    `);

    // Add send_on_day column if missing (migration)
    try {
      await conn.query(`ALTER TABLE admin_drip_emails ADD COLUMN send_on_day INT NOT NULL DEFAULT 1`);
      // Backfill existing rows with the old formula: (seq - 1) * 2 + 1
      await conn.query(`UPDATE admin_drip_emails SET send_on_day = (sequence_number - 1) * 2 + 1`);
      console.log("[Admin] send_on_day column added and backfilled");
    } catch (e: any) {
      const msg = e.message || "";
      if (!msg.includes("Duplicate column") && !msg.includes("already exists")) {
        console.error("[Admin] send_on_day col:", msg);
      }
    }

    // Seed the 20 drip emails if not yet seeded
    const existing = await conn.query(`SELECT COUNT(*) as c FROM admin_drip_emails`);
    const count = Number((existing[0] as any[])[0]?.c || 0);
    if (count === 0) {
      for (const e of DRIP_EMAIL_SEED) {
        await conn.query(
          `INSERT IGNORE INTO admin_drip_emails (sequence_number, send_on_day, subject, body_text, enabled) VALUES (?, ?, ?, ?, 0)`,
          [e.seq, (e.seq - 1) * 2 + 1, e.subject, e.body]
        );
      }
      console.log("[Admin] Seeded 20 drip emails");
    }

    // Create system_emails table for editable transactional emails (welcome, etc.)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS system_emails (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(50) NOT NULL UNIQUE,
        subject VARCHAR(500) NOT NULL,
        body_text LONGTEXT NOT NULL,
        from_name VARCHAR(255) NOT NULL DEFAULT 'Masakhe',
        enabled TINYINT(1) NOT NULL DEFAULT 1,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);

    // Seed welcome email if not yet seeded
    await conn.query(`
      INSERT IGNORE INTO system_emails (type, subject, body_text, from_name, enabled) VALUES (
        'welcome',
        'Welcome to Masakhe Portal',
        'Dear {{firstName}},\n\nWelcome to Masakhe Portal!\n\nIt''s great news that you''ve joined our platform. I would like to connect with you on a call to understand your needs and how we can further assist in growing your business.\n\nPlease book a free 30-minute onboarding call at a time that suits you:\nhttps://calendly.com/masakhesystems\n\nLooking forward to meeting you!\n\nWith Regards,\nLance Heynes\nCEO, Masakhe Technologies',
        'Lance Heynes - Masakhe',
        1
      )
    `);
  } finally {
    conn.release();
  }
}

// ───────────────────────── Audit-log helper ─────────────────────────
async function logAudit(req: any, action: string, opts: {
  targetType?: string;
  targetId?: string;
  targetLabel?: string;
  details?: Record<string, any>;
} = {}) {
  try {
    // Use the original admin id when impersonating, so impersonated actions are still attributed.
    const adminId = req.session?.originalAdminId || req.session?.userId;
    if (!adminId) return;
    const admin = await queryOne("SELECT full_name, email FROM users WHERE id = ?", [adminId]);
    const ip = (req.headers["x-forwarded-for"]?.toString().split(",")[0].trim()) || req.ip || null;
    await execute(
      `INSERT INTO admin_audit_log (admin_id, admin_name, admin_email, action, target_type, target_id, target_label, details_json, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        adminId,
        admin?.full_name || null,
        admin?.email || null,
        action,
        opts.targetType || null,
        opts.targetId || null,
        opts.targetLabel || null,
        opts.details ? JSON.stringify(opts.details) : null,
        ip,
      ]
    );
  } catch (e: any) {
    console.error("[Audit] failed to log:", e.message);
  }
}

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

// ───────────────────────── Overview stats (existing) ─────────────────────────
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

// ───────────────────────── Financial stats: MRR / ARR / churn / conversion ─────────────────────────
adminRouter.get("/financial-stats", async (req, res) => {
  try {
    // MRR: sum of price_cents of currently ACTIVE subscriptions on monthly plans.
    const mrrRow = await queryOne(
      `SELECT COALESCE(SUM(bp.price_cents), 0) as mrr_cents,
              COUNT(*) as active_subs
       FROM billing_subscriptions bs
       JOIN billing_plans bp ON bp.id = bs.plan_id
       WHERE bs.status = 'ACTIVE' AND bp.bill_interval = 'MONTHLY'`
    );
    const mrrCents = Number(mrrRow?.mrr_cents || 0);
    const activeSubs = Number(mrrRow?.active_subs || 0);

    const trialRow = await queryOne(
      `SELECT COUNT(*) as c FROM billing_subscriptions
       WHERE status = 'TRIAL' AND (trial_end_at IS NULL OR trial_end_at > NOW())`
    );
    const activeTrials = Number(trialRow?.c || 0);

    const expiredTrialRow = await queryOne(
      `SELECT COUNT(*) as c FROM billing_subscriptions
       WHERE status = 'TRIAL' AND trial_end_at IS NOT NULL AND trial_end_at <= NOW()`
    );
    const expiredTrials = Number(expiredTrialRow?.c || 0);

    const pastDueRow = await queryOne(
      `SELECT COUNT(*) as c FROM billing_subscriptions WHERE status = 'PAST_DUE'`
    );
    const pastDue = Number(pastDueRow?.c || 0);

    // Cancellations in the last 30 days.
    const cancelled30Row = await queryOne(
      `SELECT COUNT(*) as c FROM billing_subscriptions
       WHERE status = 'CANCELLED' AND (cancelled_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) OR updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY))`
    );
    const cancelled30 = Number(cancelled30Row?.c || 0);
    const churnPct = (activeSubs + cancelled30) > 0
      ? +((cancelled30 / (activeSubs + cancelled30)) * 100).toFixed(1)
      : 0;

    // Trial → paid conversion: subs that have moved past TRIAL into ACTIVE / total trials ever.
    const totalTrialsRow = await queryOne(
      `SELECT COUNT(*) as c FROM billing_subscriptions WHERE trial_start_at IS NOT NULL`
    );
    const convertedRow = await queryOne(
      `SELECT COUNT(*) as c FROM billing_subscriptions
       WHERE trial_start_at IS NOT NULL AND status = 'ACTIVE'`
    );
    const totalTrials = Number(totalTrialsRow?.c || 0);
    const converted = Number(convertedRow?.c || 0);
    const conversionPct = totalTrials > 0 ? +((converted / totalTrials) * 100).toFixed(1) : 0;

    const arpu = activeSubs > 0 ? Math.round(mrrCents / activeSubs) : 0;

    // Revenue this month — paid invoices.
    const paidThisMonthRow = await queryOne(
      `SELECT COALESCE(SUM(amount_cents), 0) as total, COUNT(*) as c
       FROM billing_invoices
       WHERE LOWER(status) = 'paid' AND paid_at >= DATE_FORMAT(NOW(), '%Y-%m-01')`
    );
    const paidThisMonthCents = Number(paidThisMonthRow?.total || 0);
    const paidThisMonthCount = Number(paidThisMonthRow?.c || 0);

    const pendingInvRow = await queryOne(
      `SELECT COUNT(*) as c, COALESCE(SUM(amount_cents),0) as total
       FROM billing_invoices WHERE UPPER(status) = 'PENDING'`
    );
    const failedInvRow = await queryOne(
      `SELECT COUNT(*) as c, COALESCE(SUM(amount_cents),0) as total
       FROM billing_invoices WHERE UPPER(status) IN ('FAILED','VOIDED')`
    );

    // Revenue by month (last 6 months) from paid billing invoices.
    const revRows = await queryAll(
      `SELECT DATE_FORMAT(paid_at, '%Y-%m') as month, COALESCE(SUM(amount_cents), 0) as total
       FROM billing_invoices
       WHERE LOWER(status) = 'paid' AND paid_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY month
       ORDER BY month ASC`
    );

    // Plan distribution
    const planRows = await queryAll(
      `SELECT bp.code, bp.name, COUNT(*) as c
       FROM billing_subscriptions bs
       JOIN billing_plans bp ON bp.id = bs.plan_id
       WHERE bs.status IN ('ACTIVE','TRIAL')
         AND (bs.status != 'TRIAL' OR bs.trial_end_at > NOW())
       GROUP BY bp.code, bp.name`
    );

    res.json({
      mrrCents,
      arrCents: mrrCents * 12,
      arpuCents: arpu,
      activeSubs,
      activeTrials,
      expiredTrials,
      pastDue,
      cancelled30Days: cancelled30,
      churnPct,
      conversionPct,
      totalTrialsEver: totalTrials,
      convertedToActive: converted,
      paidThisMonthCents,
      paidThisMonthCount,
      pendingInvoices: { count: Number(pendingInvRow?.c || 0), totalCents: Number(pendingInvRow?.total || 0) },
      failedInvoices: { count: Number(failedInvRow?.c || 0), totalCents: Number(failedInvRow?.total || 0) },
      revenueByMonth: revRows.map((r: any) => ({ month: r.month, totalCents: Number(r.total) })),
      planDistribution: planRows.map((r: any) => ({ code: r.code, name: r.name, count: Number(r.c) })),
    });
  } catch (err: any) {
    console.error("[Admin] financial-stats error:", err.message);
    res.status(500).json({ error: "Failed to fetch financial stats" });
  }
});

// ───────────────────────── Client list (now with notes/tags) ─────────────────────────
adminRouter.get("/clients", async (req, res) => {
  try {
    const clients = await queryAll(
      `SELECT u.id, u.email, u.full_name, u.role, u.created_at, u.subscription_exempt,
              u.admin_notes, u.admin_tags,
              bp.business_name, bp.trading_name, bp.business_status, bp.business_type,
              bp.industry_sector, COALESCE(u.phone, bp.phone) as phone, bp.physical_address,
              (SELECT COUNT(*) FROM websites WHERE owner_id = u.id) as website_count,
              bs.status as subscription_status, bs.trial_end_at,
              bpl.code as plan_code, bpl.name as plan_name, bpl.price_cents as plan_price_cents
       FROM users u
       LEFT JOIN business_profiles bp ON bp.user_id = u.id
       LEFT JOIN workspace_members wm ON wm.user_id = u.id
       LEFT JOIN billing_subscriptions bs ON bs.workspace_id = wm.workspace_id AND bs.status IN ('ACTIVE','TRIAL') AND (bs.status != 'TRIAL' OR bs.trial_end_at > NOW())
       LEFT JOIN billing_plans bpl ON bpl.id = bs.plan_id
       ORDER BY u.created_at DESC`
    );
    // admin_tags is stored as JSON; mysql2 can return it as string or already-parsed.
    const normalised = clients.map((c: any) => ({
      ...c,
      admin_tags: typeof c.admin_tags === "string" ? safeParse(c.admin_tags) : (c.admin_tags || []),
    }));
    res.json(normalised);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

function safeParse(s: string | null): any[] {
  if (!s) return [];
  try { const v = JSON.parse(s); return Array.isArray(v) ? v : []; } catch { return []; }
}

adminRouter.get("/clients/:id", async (req, res) => {
  try {
    const user = await queryOne(
      `SELECT u.id, u.email, u.full_name, u.role, u.created_at, u.updated_at,
              u.admin_notes, u.admin_tags,
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
        id: user.id, email: user.email, full_name: user.full_name, role: user.role, created_at: user.created_at,
        admin_notes: user.admin_notes,
        admin_tags: typeof user.admin_tags === "string" ? safeParse(user.admin_tags) : (user.admin_tags || []),
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

// ───────────────────────── Notes & tags ─────────────────────────
adminRouter.patch("/clients/:id/notes", async (req, res) => {
  try {
    const { notes } = req.body;
    const target = await queryOne("SELECT full_name FROM users WHERE id = ?", [req.params.id]);
    if (!target) return res.status(404).json({ error: "Client not found" });
    await execute("UPDATE users SET admin_notes = ?, updated_at = ? WHERE id = ?",
      [notes ?? null, new Date().toISOString(), req.params.id]);
    await logAudit(req, "client.notes.updated", {
      targetType: "user", targetId: req.params.id, targetLabel: target.full_name,
      details: { length: typeof notes === "string" ? notes.length : 0 },
    });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to save notes" });
  }
});

adminRouter.patch("/clients/:id/tags", async (req, res) => {
  try {
    const tags = Array.isArray(req.body?.tags) ? req.body.tags : [];
    const cleaned = Array.from(new Set(
      tags.map((t: any) => String(t || "").trim()).filter((t: string) => t.length > 0 && t.length <= 40)
    )).slice(0, 12);
    const target = await queryOne("SELECT full_name FROM users WHERE id = ?", [req.params.id]);
    if (!target) return res.status(404).json({ error: "Client not found" });
    await execute("UPDATE users SET admin_tags = ?, updated_at = ? WHERE id = ?",
      [JSON.stringify(cleaned), new Date().toISOString(), req.params.id]);
    await logAudit(req, "client.tags.updated", {
      targetType: "user", targetId: req.params.id, targetLabel: target.full_name,
      details: { tags: cleaned },
    });
    res.json({ ok: true, tags: cleaned });
  } catch {
    res.status(500).json({ error: "Failed to save tags" });
  }
});

// ───────────────────────── Subscription / role / exemption (with audit) ─────────────────────────
adminRouter.post("/clients/:id/trial", async (req, res) => {
  try {
    const target = await queryOne("SELECT full_name FROM users WHERE id = ?", [req.params.id]);
    const workspaceId = await ensureWorkspaceForUser(req.params.id);
    const workspace = { id: workspaceId };

    const premiumPlan = await queryOne("SELECT id FROM billing_plans WHERE code = 'premium'");
    if (!premiumPlan) return res.status(404).json({ error: "Premium plan not found" });

    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);
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
    await logAudit(req, "subscription.trial_granted", {
      targetType: "user", targetId: req.params.id, targetLabel: target?.full_name,
      details: { plan: "premium", trialEndsAt: trialEndStr },
    });
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
    const target = await queryOne("SELECT full_name FROM users WHERE id = ?", [req.params.id]);
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
    await logAudit(req, "subscription.granted", {
      targetType: "user", targetId: req.params.id, targetLabel: target?.full_name,
      details: { plan },
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to grant subscription" });
  }
});

adminRouter.delete("/clients/:id/subscription", async (req, res) => {
  try {
    const target = await queryOne("SELECT full_name FROM users WHERE id = ?", [req.params.id]);
    const workspaceId = await ensureWorkspaceForUser(req.params.id);
    const workspace = { id: workspaceId };
    await execute(
      "UPDATE billing_subscriptions SET status = 'CANCELLED', cancelled_at = NOW(), updated_at = NOW() WHERE workspace_id = ? AND status IN ('ACTIVE','TRIAL')",
      [workspace.id]
    );
    await logAudit(req, "subscription.revoked", {
      targetType: "user", targetId: req.params.id, targetLabel: target?.full_name,
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to revoke subscription" });
  }
});

adminRouter.patch("/clients/:id/exempt", async (req, res) => {
  try {
    const { exempt } = req.body;
    const value = exempt ? 1 : 0;
    const target = await queryOne("SELECT full_name FROM users WHERE id = ?", [req.params.id]);
    await execute(
      "UPDATE users SET subscription_exempt = ?, updated_at = ? WHERE id = ?",
      [value, new Date().toISOString(), req.params.id]
    );
    await logAudit(req, value ? "client.free_access_granted" : "client.free_access_removed", {
      targetType: "user", targetId: req.params.id, targetLabel: target?.full_name,
    });
    res.json({ ok: true, exempt: !!value });
  } catch (err) {
    res.status(500).json({ error: "Failed to update exemption" });
  }
});

adminRouter.patch("/clients/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    const target = await queryOne("SELECT full_name, role FROM users WHERE id = ?", [req.params.id]);
    await execute("UPDATE users SET role = ?, updated_at = ? WHERE id = ?",
      [role, new Date().toISOString(), req.params.id]);
    await logAudit(req, "client.role_changed", {
      targetType: "user", targetId: req.params.id, targetLabel: target?.full_name,
      details: { from: target?.role, to: role },
    });
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
    await logAudit({ session: { userId: adminId, originalAdminId: adminId }, headers: req.headers, ip: req.ip } as any,
      "client.impersonated", {
        targetType: "user", targetId, targetLabel: target.full_name,
        details: { email: target.email },
      });
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
    const appUrl = process.env.APP_URL || "https://masakheportal.co.za";
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

    await logAudit(req, "client.invoice_created", {
      targetType: "user", targetId: req.params.id, targetLabel: clientUser.full_name,
      details: { invoiceNumber, amountCents, planName, emailSent },
    });

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
    const target = await queryOne("SELECT full_name, email FROM users WHERE id = ?", [userId]);
    if (!target) return res.status(404).json({ error: "User not found" });

    // Log the audit BEFORE deleting (audit_logs references users via actor_user_id)
    await logAudit(req, "client.deleted", {
      targetType: "user", targetId: userId, targetLabel: target.full_name,
      details: { email: target.email },
    });

    // Delete in FK-safe order — children before parents.
    // 1. social_post_targets (child of social_posts, which is child of workspaces)
    await execute(`
      DELETE spt FROM social_post_targets spt
      INNER JOIN social_posts sp ON sp.id = spt.social_post_id
      INNER JOIN workspaces w ON w.id = sp.workspace_id
      WHERE w.owner_id = ?`, [userId]);
    await execute(`
      DELETE spt FROM social_post_targets spt
      INNER JOIN social_posts sp ON sp.id = spt.social_post_id
      WHERE sp.created_by_user_id = ?`, [userId]);

    // 2. social_posts
    await execute(`DELETE sp FROM social_posts sp INNER JOIN workspaces w ON w.id = sp.workspace_id WHERE w.owner_id = ?`, [userId]);
    await execute("DELETE FROM social_posts WHERE created_by_user_id = ?", [userId]);

    // 3. media_assets
    await execute(`DELETE ma FROM media_assets ma INNER JOIN workspaces w ON w.id = ma.workspace_id WHERE w.owner_id = ?`, [userId]);
    await execute("DELETE FROM media_assets WHERE uploaded_by_user_id = ?", [userId]);

    // 4. social_accounts (FK to workspaces + connected_by_user_id)
    await execute(`DELETE sa FROM social_accounts sa INNER JOIN workspaces w ON w.id = sa.workspace_id WHERE w.owner_id = ?`, [userId]);
    await execute("DELETE FROM social_accounts WHERE connected_by_user_id = ?", [userId]);

    // 5. audit_logs (FK to workspaces + actor_user_id)
    await execute(`DELETE al FROM audit_logs al INNER JOIN workspaces w ON w.id = al.workspace_id WHERE w.owner_id = ?`, [userId]);
    await execute("DELETE FROM audit_logs WHERE actor_user_id = ?", [userId]);

    // 6. workspace_members
    await execute(`DELETE wm FROM workspace_members wm INNER JOIN workspaces w ON w.id = wm.workspace_id WHERE w.owner_id = ?`, [userId]);
    await execute("DELETE FROM workspace_members WHERE user_id = ?", [userId]);

    // 7. billing tables that FK to workspaces (must come before workspaces)
    await execute(`
      DELETE bi FROM billing_invoices bi
      INNER JOIN workspaces w ON w.id = bi.workspace_id
      WHERE w.owner_id = ?`, [userId]);
    await execute(`
      DELETE bs FROM billing_subscriptions bs
      INNER JOIN workspaces w ON w.id = bs.workspace_id
      WHERE w.owner_id = ?`, [userId]);
    await execute(`
      DELETE bpm FROM billing_payment_methods bpm
      INNER JOIN workspaces w ON w.id = bpm.workspace_id
      WHERE w.owner_id = ?`, [userId]);

    // 8. workspaces
    await execute("DELETE FROM workspaces WHERE owner_id = ?", [userId]);

    // 9. payroll_runs (must come before employees)
    await execute("DELETE FROM payroll_runs WHERE user_id = ?", [userId]);

    // 10. broker_client_documents then broker_clients
    await execute("DELETE FROM broker_client_documents WHERE user_id = ?", [userId]);
    await execute("DELETE FROM broker_clients WHERE user_id = ?", [userId]);

    // 11. employees (after payroll_runs)
    await execute("DELETE FROM employees WHERE user_id = ?", [userId]);

    // 12. Remaining tables with non-cascading FK to users
    await execute("DELETE FROM ledger_entries WHERE user_id = ?", [userId]);
    await execute("DELETE FROM invoices WHERE user_id = ?", [userId]);
    await execute("DELETE FROM grant_readiness WHERE user_id = ?", [userId]);
    await execute("DELETE FROM websites WHERE owner_id = ?", [userId]);
    await execute("DELETE FROM business_profiles WHERE user_id = ?", [userId]);

    // 12. Franchises owned by this user (FK owner_user_id → users)
    await execute("DELETE FROM franchises WHERE owner_user_id = ?", [userId]);

    // 13. Finally, delete the user
    await execute("DELETE FROM users WHERE id = ?", [userId]);

    res.json({ ok: true });
  } catch (err: any) {
    console.error("[Admin] Delete client error:", err.message);
    res.status(500).json({ error: "Failed to delete client: " + err.message });
  }
});

// ───────────────────────── Audit log read API ─────────────────────────
adminRouter.get("/audit-log", async (req, res) => {
  try {
    const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 100));
    const offset = Math.max(0, Number(req.query.offset) || 0);
    const where: string[] = [];
    const params: any[] = [];
    if (req.query.adminId) { where.push("admin_id = ?"); params.push(req.query.adminId); }
    if (req.query.action) { where.push("action = ?"); params.push(req.query.action); }
    if (req.query.targetId) { where.push("target_id = ?"); params.push(req.query.targetId); }
    if (req.query.q) {
      const q = `%${req.query.q}%`;
      where.push("(admin_name LIKE ? OR target_label LIKE ? OR action LIKE ?)");
      params.push(q, q, q);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const rows = await queryAll(
      `SELECT id, admin_id, admin_name, admin_email, action, target_type, target_id,
              target_label, details_json, ip_address, created_at
       FROM admin_audit_log ${whereSql}
       ORDER BY created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );
    const totalRow = await queryOne(
      `SELECT COUNT(*) as c FROM admin_audit_log ${whereSql}`, params
    );
    res.json({
      total: Number(totalRow?.c || 0),
      limit, offset,
      entries: rows.map((r: any) => ({
        ...r,
        details: r.details_json ? safeJsonParse(r.details_json) : null,
      })),
    });
  } catch (err: any) {
    console.error("[Admin] audit-log error:", err.message);
    res.status(500).json({ error: "Failed to fetch audit log" });
  }
});

function safeJsonParse(s: string): any {
  try { return JSON.parse(s); } catch { return null; }
}

// ─── Franchise admin endpoints ────────────────────────────────────────────────

// GET /api/admin/franchises
adminRouter.get("/franchises", async (_req, res) => {
  try {
    const rows = await queryAll(`
      SELECT f.*, u.full_name as owner_name, u.email as owner_email,
             COUNT(fc.id) as client_count
      FROM franchises f
      JOIN users u ON u.id = f.owner_user_id
      LEFT JOIN franchise_clients fc ON fc.franchise_id = f.id AND fc.status = 'active'
      GROUP BY f.id
      ORDER BY f.created_at DESC
    `);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/franchises/invite — create user + franchise in one step, send invite email
adminRouter.post("/franchises/invite", requireAdmin, async (req, res) => {
  try {
    const { name, email, franchise_name, franchise_code } = req.body;
    if (!name || !email || !franchise_name || !franchise_code) {
      return res.status(400).json({ error: "name, email, franchise_name, and franchise_code are all required" });
    }

    const emailLower = email.trim().toLowerCase();

    // Check email not already taken
    const existing = await queryOne("SELECT id, role FROM users WHERE email = ?", [emailLower]);
    if (existing) return res.status(400).json({ error: "A user with this email already exists. Use 'Create Franchise' and select them instead." });

    // Check franchise code not taken
    const codeExists = await queryOne("SELECT id FROM franchises WHERE code = ?", [franchise_code.toUpperCase()]);
    if (codeExists) return res.status(400).json({ error: "Franchise code is already in use. Choose a different code." });

    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    // Create user (no password yet — set via invite link)
    const userId = randomUUID();
    const tempHash = await bcrypt.hash(randomBytes(32).toString("hex"), 10);
    await execute(
      "INSERT INTO users (id, email, full_name, password_hash, role, created_at, updated_at) VALUES (?,?,?,?,?,?,?)",
      [userId, emailLower, name.trim(), tempHash, "franchise", now, now]
    );

    // Create workspace for the user
    const wsId = randomUUID();
    await execute(
      "INSERT INTO workspaces (id, name, owner_id, created_at, updated_at) VALUES (?,?,?,?,?)",
      [wsId, `${name.trim()}'s Workspace`, userId, now, now]
    );
    await execute(
      "INSERT INTO workspace_members (id, workspace_id, user_id, role, created_at) VALUES (?,?,?,?,?)",
      [randomUUID(), wsId, userId, "owner", now]
    );

    // Create the franchise record
    const franchiseId = randomUUID();
    await execute(
      "INSERT INTO franchises (id, name, code, owner_user_id, status) VALUES (?,?,?,?,'active')",
      [franchiseId, franchise_name.trim(), franchise_code.toUpperCase(), userId]
    );

    // Create setup token (7 days)
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ");
    await execute(
      "INSERT INTO password_reset_tokens (id, user_id, token, expires_at, used) VALUES (?,?,?,?,0)",
      [randomUUID(), userId, token, expiresAt]
    );

    // Send the invite email (non-blocking — don't fail the request if email fails)
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    sendFranchiseOwnerInviteEmail(emailLower, name.trim(), franchise_name.trim(), franchise_code.toUpperCase(), token, baseUrl)
      .catch(err => console.error("[franchise invite email]", err));

    res.json({ ok: true, franchise_id: franchiseId, user_id: userId, invite_sent: true });
  } catch (err: any) {
    console.error("[franchise invite]", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/franchises — create franchise, promote user to franchise role
adminRouter.post("/franchises", async (req, res) => {
  try {
    const { name, code, owner_user_id } = req.body;
    if (!name || !code || !owner_user_id) {
      return res.status(400).json({ error: "name, code, and owner_user_id are required" });
    }

    const owner = await queryOne("SELECT id, role FROM users WHERE id = ?", [owner_user_id]);
    if (!owner) return res.status(404).json({ error: "Owner user not found" });

    const existing = await queryOne("SELECT id FROM franchises WHERE owner_user_id = ?", [owner_user_id]);
    if (existing) return res.status(400).json({ error: "This user already owns a franchise" });

    const codeExists = await queryOne("SELECT id FROM franchises WHERE code = ?", [code.toUpperCase()]);
    if (codeExists) return res.status(400).json({ error: "Franchise code already in use" });

    const id = randomUUID();
    await execute(
      "INSERT INTO franchises (id, name, code, owner_user_id, status) VALUES (?, ?, ?, ?, 'active')",
      [id, name, code.toUpperCase(), owner_user_id]
    );
    await execute("UPDATE users SET role = 'franchise' WHERE id = ?", [owner_user_id]);

    res.json({ ok: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/franchises/:id/clients
adminRouter.get("/franchises/:id/clients", async (req, res) => {
  try {
    const rows = await queryAll(`
      SELECT u.id, u.email, u.full_name, u.created_at,
             COALESCE(bp2.business_name, bp2.trading_name, u.full_name) as business_name,
             bpl.code as plan_code, bpl.name as plan_name,
             bs.status as sub_status, fc.linked_at, fc.status as link_status
      FROM franchise_clients fc
      JOIN users u ON u.id = fc.client_user_id
      LEFT JOIN business_profiles bp2 ON bp2.user_id = u.id
      LEFT JOIN workspace_members wm ON wm.user_id = u.id
      LEFT JOIN billing_subscriptions bs ON bs.workspace_id = wm.workspace_id AND bs.status IN ('ACTIVE','TRIAL')
      LEFT JOIN billing_plans bpl ON bpl.id = bs.plan_id
      WHERE fc.franchise_id = ?
      ORDER BY fc.linked_at DESC
    `, [req.params.id]);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/franchises/:id/clients — assign a client to franchise
adminRouter.post("/franchises/:id/clients", async (req, res) => {
  try {
    const { client_user_id } = req.body;
    if (!client_user_id) return res.status(400).json({ error: "client_user_id is required" });

    const franchise = await queryOne("SELECT id FROM franchises WHERE id = ?", [req.params.id]);
    if (!franchise) return res.status(404).json({ error: "Franchise not found" });

    const client = await queryOne("SELECT id, role FROM users WHERE id = ?", [client_user_id]);
    if (!client) return res.status(404).json({ error: "Client user not found" });
    if (client.role === "admin" || client.role === "franchise") {
      return res.status(400).json({ error: "Cannot link admin or franchise users as clients" });
    }

    const existing = await queryOne("SELECT id FROM franchise_clients WHERE client_user_id = ?", [client_user_id]);
    if (existing) {
      await execute("UPDATE franchise_clients SET franchise_id = ?, status = 'active' WHERE client_user_id = ?", [req.params.id, client_user_id]);
    } else {
      const id = randomUUID();
      await execute(
        "INSERT INTO franchise_clients (id, franchise_id, client_user_id, status) VALUES (?, ?, ?, 'active')",
        [id, req.params.id, client_user_id]
      );
    }

    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/franchises/:id/clients/:clientId — unlink client
adminRouter.delete("/franchises/:id/clients/:clientId", async (req, res) => {
  try {
    await execute(
      "UPDATE franchise_clients SET status = 'inactive' WHERE franchise_id = ? AND client_user_id = ?",
      [req.params.id, req.params.clientId]
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/franchises/:id/status
adminRouter.patch("/franchises/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ error: "status must be active or suspended" });
    }
    await execute("UPDATE franchises SET status = ? WHERE id = ?", [status, req.params.id]);
    if (status === "suspended") {
      const f = await queryOne("SELECT owner_user_id FROM franchises WHERE id = ?", [req.params.id]);
      if (f) await execute("UPDATE users SET role = 'user' WHERE id = ?", [f.owner_user_id]);
    }
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/franchises/:id — delete franchise
adminRouter.delete("/franchises/:id", async (req, res) => {
  try {
    const f = await queryOne("SELECT owner_user_id FROM franchises WHERE id = ?", [req.params.id]);
    if (!f) return res.status(404).json({ error: "Franchise not found" });
    await execute("DELETE FROM franchise_clients WHERE franchise_id = ?", [req.params.id]);
    await execute("UPDATE users SET role = 'user' WHERE id = ?", [f.owner_user_id]);
    await execute("DELETE FROM franchises WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get("/audit-log/actions", async (req, res) => {
  try {
    const rows = await queryAll(
      `SELECT action, COUNT(*) as c FROM admin_audit_log GROUP BY action ORDER BY action ASC`
    );
    res.json(rows.map((r: any) => ({ action: r.action, count: Number(r.c) })));
  } catch {
    res.status(500).json({ error: "Failed to fetch actions" });
  }
});

// ───────────────────────── Drip Email Campaign Routes ─────────────────────────

// GET /api/admin/drip-emails — list all drip emails with send stats
adminRouter.get("/drip-emails", async (req, res) => {
  try {
    const rows = await queryAll(`
      SELECT de.*,
        (SELECT COUNT(*) FROM admin_drip_sends ads WHERE ads.drip_email_id = de.id) as sends_count
      FROM admin_drip_emails de
      ORDER BY de.sequence_number ASC
    `);
    const totalUsers = (await queryOne("SELECT COUNT(*) as c FROM users WHERE role = 'user'"))?.c || 0;
    res.json({ emails: rows, totalUsers: Number(totalUsers) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/drip-emails/:id — update subject, body_text, send_on_day, and/or enabled
adminRouter.patch("/drip-emails/:id", async (req, res) => {
  try {
    const { subject, body_text, enabled, send_on_day } = req.body;
    const id = req.params.id;
    const existing = await queryOne("SELECT id FROM admin_drip_emails WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ error: "Email not found" });

    const updates: string[] = [];
    const params: any[] = [];

    if (subject !== undefined) { updates.push("subject = ?"); params.push(subject); }
    if (body_text !== undefined) { updates.push("body_text = ?"); params.push(body_text); }
    if (enabled !== undefined) { updates.push("enabled = ?"); params.push(enabled ? 1 : 0); }
    if (send_on_day !== undefined) { updates.push("send_on_day = ?"); params.push(Number(send_on_day)); }

    if (updates.length === 0) return res.status(400).json({ error: "Nothing to update" });

    params.push(id);
    await execute(`UPDATE admin_drip_emails SET ${updates.join(", ")} WHERE id = ?`, params);

    await logAudit(req, "drip_email_update", {
      targetType: "drip_email",
      targetId: String(id),
      details: { enabled, hasContentChange: subject !== undefined || body_text !== undefined },
    });

    const updated = await queryOne("SELECT * FROM admin_drip_emails WHERE id = ?", [id]);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/drip-emails/:id/send-test — send test to logged-in admin (or custom address)
adminRouter.post("/drip-emails/:id/send-test", async (req, res) => {
  try {
    const id = req.params.id;
    const email = await queryOne("SELECT * FROM admin_drip_emails WHERE id = ?", [id]);
    if (!email) return res.status(404).json({ error: "Email not found" });

    const admin = await queryOne("SELECT email, full_name FROM users WHERE id = ?", [req.session?.userId]);
    if (!admin) return res.status(401).json({ error: "Not authenticated" });

    // Prefer DB-stored system SMTP settings; fall back to env vars
    const sysSettings = await queryOne("SELECT * FROM system_smtp_settings LIMIT 1");
    let smtpHost: string, smtpPort: number, smtpUser: string, smtpPass: string;
    if (sysSettings && sysSettings.smtp_pass_enc) {
      smtpHost = sysSettings.smtp_host;
      smtpPort = sysSettings.smtp_port;
      smtpUser = sysSettings.smtp_user;
      smtpPass = decrypt(sysSettings.smtp_pass_enc);
    } else if (process.env.SMTP_PASSWORD) {
      smtpHost = process.env.SMTP_HOST || "smtp.masakheportal.co.za";
      smtpPort = parseInt(process.env.SMTP_PORT || "465");
      smtpUser = process.env.SMTP_USER || process.env.SMTP_FROM || "admin@masakheportal.co.za";
      smtpPass = process.env.SMTP_PASSWORD;
    } else {
      return res.status(503).json({ error: "SMTP not configured — add settings in Admin → Settings or set SMTP_PASSWORD env var" });
    }

    console.log(`[DripTest] SMTP host=${smtpHost} port=${smtpPort} user=${smtpUser} passLen=${smtpPass.length} source=${sysSettings?.smtp_pass_enc ? "db" : "env"}`);

    // Create a fresh transporter per request — avoids stale idle-connection re-auth failures (SMTP 535)
    const freshTransporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });

    try {
      await freshTransporter.verify();
      console.log("[DripTest] SMTP verify OK");
    } catch (verifyErr: any) {
      console.error("[DripTest] SMTP verify failed:", verifyErr.message);
      return res.status(502).json({ error: `SMTP connection failed: ${verifyErr.message}` });
    }

    const toAddress: string = req.body?.to || admin.email;

    const bodyHtml = email.body_text
      .split("\n")
      .map((line: string) => line.trim() === "" ? "<br>" : `<p style="margin:0 0 12px;color:#4a4a5a;font-size:15px;line-height:1.6;">${line.replace(/👉/g, "👉")}</p>`)
      .join("\n");

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#007749 0%,#005C3A 100%);padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">Masakhe</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Digital Platform for South African SMMEs</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="font-size:11px;color:#999;margin:0 0 16px;border-bottom:1px dashed #eee;padding-bottom:8px;">TEST EMAIL — Email #${email.sequence_number} of the drip campaign</p>
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:20px 40px;background:#f9f9fb;text-align:center;font-size:12px;color:#999;">
          Masakhe SMME Platform · <a href="https://www.masakheportal.co.za" style="color:#007749;">masakheportal.co.za</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await freshTransporter.sendMail({
      from: `"Masakhe" <${process.env.SMTP_FROM || smtpUser}>`,
      to: toAddress,
      subject: `[TEST] ${email.subject}`,
      html,
      text: email.body_text,
    });
    console.log(`[DripTest] Sent OK → ${toAddress}`);

    res.json({ ok: true, sentTo: toAddress });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/drip-emails/stats — overall drip campaign stats
adminRouter.get("/drip-emails/stats", async (req, res) => {
  try {
    const enabledCount = (await queryOne("SELECT COUNT(*) as c FROM admin_drip_emails WHERE enabled = 1"))?.c || 0;
    const totalEmails = (await queryOne("SELECT COUNT(*) as c FROM admin_drip_emails"))?.c || 0;
    const totalSends = (await queryOne("SELECT COUNT(*) as c FROM admin_drip_sends"))?.c || 0;
    const uniqueRecipients = (await queryOne("SELECT COUNT(DISTINCT user_id) as c FROM admin_drip_sends"))?.c || 0;
    res.json({
      enabledCount: Number(enabledCount),
      totalEmails: Number(totalEmails),
      totalSends: Number(totalSends),
      uniqueRecipients: Number(uniqueRecipients),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ───────────────────────── System Emails (Transactional) ─────────────────────────

// GET /api/admin/system-emails
adminRouter.get("/system-emails", requireAdmin, async (req, res) => {
  try {
    const emails = await queryAll("SELECT * FROM system_emails ORDER BY type ASC");
    res.json({ emails });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/system-emails/:type
adminRouter.patch("/system-emails/:type", requireAdmin, async (req, res) => {
  try {
    const { type } = req.params;
    const { subject, body_text, from_name, enabled } = req.body;
    const existing = await queryOne("SELECT id FROM system_emails WHERE type = ?", [type]);
    if (!existing) return res.status(404).json({ error: "Email not found" });

    const updates: string[] = [];
    const params: any[] = [];
    if (subject !== undefined) { updates.push("subject = ?"); params.push(subject); }
    if (body_text !== undefined) { updates.push("body_text = ?"); params.push(body_text); }
    if (from_name !== undefined) { updates.push("from_name = ?"); params.push(from_name); }
    if (enabled !== undefined) { updates.push("enabled = ?"); params.push(enabled ? 1 : 0); }
    if (updates.length === 0) return res.status(400).json({ error: "Nothing to update" });

    params.push(type);
    await execute(`UPDATE system_emails SET ${updates.join(", ")} WHERE type = ?`, params);
    await logAudit(req, "system_email_update", { targetType: "system_email", targetId: type });

    const updated = await queryOne("SELECT * FROM system_emails WHERE type = ?", [type]);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/system-emails/:type/send-test
adminRouter.post("/system-emails/:type/send-test", requireAdmin, async (req, res) => {
  try {
    const { type } = req.params;
    const emailRow = await queryOne("SELECT * FROM system_emails WHERE type = ?", [type]);
    if (!emailRow) return res.status(404).json({ error: "Email not found" });

    const admin = await queryOne("SELECT email, full_name FROM users WHERE id = ?", [(req.session as any).userId]);
    if (!admin) return res.status(401).json({ error: "Not authenticated" });

    const sysSettings = await queryOne("SELECT * FROM system_smtp_settings LIMIT 1");
    let smtpHost: string, smtpPort: number, smtpUser: string, smtpPass: string;
    if (sysSettings && sysSettings.smtp_pass_enc) {
      smtpHost = sysSettings.smtp_host;
      smtpPort = sysSettings.smtp_port;
      smtpUser = sysSettings.smtp_user;
      smtpPass = decrypt(sysSettings.smtp_pass_enc);
    } else if (process.env.SMTP_PASSWORD) {
      smtpHost = process.env.SMTP_HOST || "smtp.masakheportal.co.za";
      smtpPort = parseInt(process.env.SMTP_PORT || "465");
      smtpUser = process.env.SMTP_USER || "admin@masakheportal.co.za";
      smtpPass = process.env.SMTP_PASSWORD;
    } else {
      return res.status(503).json({ error: "SMTP not configured" });
    }

    const freshTransporter = nodemailer.createTransport({
      host: smtpHost, port: smtpPort, secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000, greetingTimeout: 10000,
    });
    await freshTransporter.verify();

    const toAddress: string = req.body?.to || admin.email;
    const firstName = (admin.full_name || "Admin").split(" ")[0];
    const appUrl = process.env.APP_URL || "https://masakheportal.co.za";

    const subject = `[TEST] ${emailRow.subject
      .replace(/\{\{firstName\}\}/g, firstName)
      .replace(/\{\{fullName\}\}/g, admin.full_name || firstName)}`;

    const rawBody = emailRow.body_text
      .replace(/\{\{firstName\}\}/g, firstName)
      .replace(/\{\{fullName\}\}/g, admin.full_name || firstName)
      .replace(/\{\{appUrl\}\}/g, appUrl);

    const bodyHtml = rawBody.split("\n").map((line: string) =>
      line.trim() === ""
        ? '<div style="height:12px;"></div>'
        : `<p style="margin:0 0 12px;color:#374151;font-size:15px;line-height:1.7;">${line}</p>`
    ).join("");

    const html = emailShell({
      subtitle: "Welcome to Masakhe Portal",
      body: `<p style="display:inline-block;background:#FEF3C7;color:#92400E;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;margin:0 0 20px;">TEST PREVIEW</p>${bodyHtml}`,
      footerNote: "This is a test preview of your welcome email template.",
    });

    await freshTransporter.sendMail({
      from: `"${emailRow.from_name}" <${process.env.SMTP_FROM || smtpUser}>`,
      to: toAddress,
      subject,
      html,
    });

    res.json({ ok: true, sentTo: toAddress });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ───────────────────────── System SMTP Settings ─────────────────────────

// GET /api/admin/system-settings — return current settings (no password)
adminRouter.get("/system-settings", requireAdmin, async (req, res) => {
  try {
    const row = await queryOne(
      "SELECT id, smtp_host, smtp_port, smtp_secure, smtp_user, from_name, from_email, updated_at FROM system_smtp_settings LIMIT 1"
    );
    res.json({ ok: true, settings: row || null });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/system-settings — save/update settings
adminRouter.put("/system-settings", requireAdmin, async (req, res) => {
  try {
    const { smtp_host, smtp_port, smtp_secure, smtp_user, smtp_pass, from_name, from_email } = req.body;
    if (!smtp_host || !smtp_user || !from_email) {
      return res.status(400).json({ error: "Host, username, and from email are required" });
    }
    const existing = await queryOne("SELECT id, smtp_pass_enc FROM system_smtp_settings LIMIT 1");
    const passEnc = smtp_pass ? encrypt(smtp_pass) : (existing?.smtp_pass_enc || "");
    if (!passEnc) {
      return res.status(400).json({ error: "Password is required for initial setup" });
    }
    if (existing) {
      await execute(
        "UPDATE system_smtp_settings SET smtp_host=?, smtp_port=?, smtp_secure=?, smtp_user=?, smtp_pass_enc=?, from_name=?, from_email=? WHERE id=?",
        [smtp_host, smtp_port || 465, smtp_secure ? 1 : 0, smtp_user, passEnc, from_name || "Masakhe", from_email, existing.id]
      );
    } else {
      await execute(
        "INSERT INTO system_smtp_settings (smtp_host, smtp_port, smtp_secure, smtp_user, smtp_pass_enc, from_name, from_email) VALUES (?,?,?,?,?,?,?)",
        [smtp_host, smtp_port || 465, smtp_secure ? 1 : 0, smtp_user, passEnc, from_name || "Masakhe", from_email]
      );
    }
    await logAudit(req, "system_smtp_updated", { details: { smtp_host, smtp_user, from_email } });
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/system-settings/test — verify and send a test email
adminRouter.post("/system-settings/test", requireAdmin, async (req, res) => {
  try {
    const sysSettings = await queryOne("SELECT * FROM system_smtp_settings LIMIT 1");
    if (!sysSettings || !sysSettings.smtp_pass_enc) {
      return res.status(400).json({ error: "No SMTP settings saved yet. Save your settings first." });
    }
    const freshTransporter = nodemailer.createTransport({
      host: sysSettings.smtp_host,
      port: sysSettings.smtp_port,
      secure: !!sysSettings.smtp_secure,
      auth: { user: sysSettings.smtp_user, pass: decrypt(sysSettings.smtp_pass_enc) },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });
    try {
      await freshTransporter.verify();
    } catch (verifyErr: any) {
      return res.status(502).json({ error: `SMTP connection failed: ${verifyErr.message}` });
    }
    const adminUser = await queryOne("SELECT email, full_name FROM users WHERE id = ?", [(req.session as any).userId]);
    const toAddress: string = req.body?.to || adminUser?.email;
    await freshTransporter.sendMail({
      from: `"${sysSettings.from_name || "Masakhe"}" <${sysSettings.from_email}>`,
      to: toAddress,
      subject: "Masakhe — System SMTP Test",
      html: `<p>Hi${adminUser?.full_name ? " " + adminUser.full_name : ""},</p><p>Your system SMTP settings are working correctly.</p><p>Sent from <strong>${sysSettings.from_email}</strong> via ${sysSettings.smtp_host}:${sysSettings.smtp_port}.</p><p>— Masakhe Admin</p>`,
    });
    res.json({ ok: true, sentTo: toAddress });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
