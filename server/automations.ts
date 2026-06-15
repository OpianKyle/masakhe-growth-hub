import { Router } from "express";
import { queryOne, queryAll, execute } from "./db";
import { requireAuth, getDataOwnerId } from "./auth";
import { randomUUID } from "crypto";
import { getTransporterForUser } from "./email-settings";

export const automationsRouter = Router();

// ── Defaults ────────────────────────────────────────────────────────────────
export const DEFAULT_SETTINGS = {
  thank_you_enabled: 1,
  thank_you_subject: "Thank you — payment received",
  thank_you_body:
    "Dear {{customer_name}},\n\nThank you for your payment of {{amount}} for invoice {{invoice_number}}. Your payment has been received and recorded.\n\nWe appreciate your business.\n\nKind regards,\n{{business_name}}",
  late_fee_enabled: 0,
  late_fee_percent: 5.0,
  late_fee_after_days: 7,
  stop_credit_enabled: 0,
  stop_credit_threshold_cents: 1000000,
  quote_expiry_days: 30,
  quote_followup_enabled: 1,
  quote_followup_after_days: 5,
  quote_max_followups: 2,
  quote_followup_subject: "Following up on your quote",
  quote_followup_body:
    "Dear {{customer_name}},\n\nWe hope you're well. We're following up on quote {{invoice_number}} for {{amount}} sent on {{quote_date}}.\n\nPlease let us know if you have any questions or if you'd like to proceed.\n\nKind regards,\n{{business_name}}",
  lead_autoreply_enabled: 1,
  lead_autoreply_subject: "Thanks for reaching out",
  lead_autoreply_body:
    "Hi {{lead_name}},\n\nThanks for getting in touch with {{business_name}}. We've received your enquiry and will be in touch shortly.\n\nIn the meantime, feel free to reply to this email with any extra detail.\n\nKind regards,\n{{business_name}}",
  drip_enabled: 0,
  drip_emails_json: JSON.stringify([
    {
      delay_days: 2,
      subject: "Following up on your enquiry",
      body:
        "Hi {{lead_name}},\n\nJust checking in — did you get a chance to consider our offering? Happy to answer any questions.\n\nKind regards,\n{{business_name}}",
    },
    {
      delay_days: 5,
      subject: "Anything we can help with?",
      body:
        "Hi {{lead_name}},\n\nWanted to circle back one more time. If you'd like a chat, hit reply or give us a call.\n\nKind regards,\n{{business_name}}",
    },
    {
      delay_days: 10,
      subject: "Last note from us",
      body:
        "Hi {{lead_name}},\n\nWe haven't heard back so we'll stop reaching out. If your needs change in the future, we'd love to hear from you.\n\nKind regards,\n{{business_name}}",
    },
  ]),
  inactive_nudge_enabled: 0,
  inactive_nudge_after_days: 90,
  inactive_nudge_subject: "We miss you",
  inactive_nudge_body:
    "Hi {{customer_name}},\n\nIt's been a while since we last connected. We'd love to hear how things are going and whether there's anything we can help you with.\n\nKind regards,\n{{business_name}}",
  birthday_msg_enabled: 0,
  birthday_msg_subject: "Happy birthday from {{business_name}}!",
  birthday_msg_body:
    "Hi {{customer_name}},\n\nWishing you a wonderful birthday from everyone at {{business_name}}. Have a fantastic day!\n\nWarm wishes,\n{{business_name}}",
  anniversary_msg_enabled: 0,
  anniversary_msg_subject: "Happy anniversary!",
  anniversary_msg_body:
    "Hi {{customer_name}},\n\nIt's been another great year working with you. Thank you for your continued trust in {{business_name}} — here's to many more.\n\nKind regards,\n{{business_name}}",
};

// ── Helpers ─────────────────────────────────────────────────────────────────
export async function getSettings(userId: string) {
  let row = await queryOne(
    "SELECT * FROM automation_settings WHERE user_id = ?",
    [userId]
  );
  if (!row) {
    const userExists = await queryOne("SELECT id FROM users WHERE id = ?", [userId]);
    if (!userExists) return DEFAULT_SETTINGS;
    await execute(
      "INSERT INTO automation_settings (user_id) VALUES (?)",
      [userId]
    );
    row = await queryOne(
      "SELECT * FROM automation_settings WHERE user_id = ?",
      [userId]
    );
  }
  return { ...DEFAULT_SETTINGS, ...row };
}

export function formatCents(cents: number): string {
  return `R${(cents / 100).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? "");
}

export function plainToHtml(text: string): string {
  return text
    .split("\n")
    .map((line) => `<p style="margin:0 0 12px;color:#374151;font-size:15px;line-height:1.6;">${escapeHtml(line) || "&nbsp;"}</p>`)
    .join("");
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function wrapEmail(opts: {
  businessName: string;
  accent?: string;
  bodyHtml: string;
  fromEmail: string;
}): string {
  const accent = opts.accent || "#007749";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);max-width:600px;width:100%;">
  <tr><td style="background:${accent};padding:24px 32px;">
    <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">${escapeHtml(opts.businessName)}</h1>
  </td></tr>
  <tr><td style="padding:28px 32px;">
    ${opts.bodyHtml}
  </td></tr>
  <tr><td style="background:#f8f8fa;padding:16px 32px;text-align:center;border-top:1px solid #e8e8ec;">
    <p style="margin:0;color:#9a9aaa;font-size:12px;">Sent via ${escapeHtml(opts.fromEmail)} · Powered by Masakhe</p>
  </td></tr>
</table>
</td></tr></table></body></html>`;
}

export async function logAutomation(opts: {
  userId: string;
  type: string;
  targetId?: string | null;
  recipient?: string | null;
  message?: string | null;
  status?: "sent" | "failed";
}) {
  try {
    await execute(
      `INSERT INTO automation_log (id, user_id, type, target_id, recipient, message, status) VALUES (?,?,?,?,?,?,?)`,
      [
        randomUUID(),
        opts.userId,
        opts.type,
        opts.targetId || null,
        opts.recipient || null,
        opts.message || null,
        opts.status || "sent",
      ]
    );
  } catch {}
}

// ── Settings endpoints ─────────────────────────────────────────────────────
automationsRouter.get("/settings", requireAuth, async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const settings = await getSettings(userId);
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

automationsRouter.put("/settings", requireAuth, async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    await getSettings(userId); // ensure row exists

    const fields: Record<string, any> = {};
    const allowed = Object.keys(DEFAULT_SETTINGS);
    for (const k of allowed) {
      if (k in req.body) fields[k] = req.body[k];
    }

    // Coerce JSON arrays
    if (fields.drip_emails_json && typeof fields.drip_emails_json !== "string") {
      fields.drip_emails_json = JSON.stringify(fields.drip_emails_json);
    }

    if (Object.keys(fields).length === 0) {
      return res.json({ ok: true });
    }

    const setClause = Object.keys(fields).map((k) => `${k} = ?`).join(", ");
    const values = Object.values(fields);
    await execute(
      `UPDATE automation_settings SET ${setClause} WHERE user_id = ?`,
      [...values, userId]
    );

    const updated = await getSettings(userId);
    res.json({ ok: true, settings: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Recurring invoices CRUD ────────────────────────────────────────────────
automationsRouter.get("/recurring", requireAuth, async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const list = await queryAll(
      `SELECT * FROM recurring_invoices WHERE user_id = ? ORDER BY active DESC, next_run_at ASC`,
      [userId]
    );
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

automationsRouter.post("/recurring", requireAuth, async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const {
      name,
      customer_name,
      customer_email,
      customer_address,
      customer_phone,
      reference,
      payment_terms,
      notes,
      items,
      vat_enabled,
      vat_cents,
      total_cents,
      template,
      template_config,
      frequency,
      custom_days,
      start_date,
      end_date,
      auto_send,
    } = req.body;

    if (!name || !customer_name || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "name, customer_name and items are required" });
    }
    if (!start_date) {
      return res.status(400).json({ error: "start_date is required" });
    }

    const id = randomUUID();
    await execute(
      `INSERT INTO recurring_invoices
       (id, user_id, name, customer_name, customer_email, customer_address, customer_phone,
        reference, payment_terms, notes, items_json, vat_enabled, vat_cents, total_cents,
        template, template_config, frequency, custom_days, start_date, end_date, next_run_at,
        active, auto_send)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?)`,
      [
        id,
        userId,
        name,
        customer_name,
        customer_email || null,
        customer_address || null,
        customer_phone || null,
        reference || null,
        payment_terms || null,
        notes || null,
        JSON.stringify(items),
        vat_enabled ? 1 : 0,
        vat_cents || 0,
        total_cents || 0,
        template || 1,
        template_config ? JSON.stringify(template_config) : null,
        frequency || "monthly",
        custom_days || null,
        start_date,
        end_date || null,
        start_date,
        auto_send === false ? 0 : 1,
      ]
    );

    const created = await queryOne("SELECT * FROM recurring_invoices WHERE id = ?", [id]);
    res.json({ ok: true, recurring: created });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

automationsRouter.put("/recurring/:id", requireAuth, async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const existing = await queryOne(
      "SELECT id FROM recurring_invoices WHERE id = ? AND user_id = ?",
      [req.params.id, userId]
    );
    if (!existing) return res.status(404).json({ error: "Not found" });

    const allowed = [
      "name", "customer_name", "customer_email", "customer_address", "customer_phone",
      "reference", "payment_terms", "notes", "vat_enabled", "vat_cents", "total_cents",
      "template", "template_config", "frequency", "custom_days", "start_date", "end_date",
      "next_run_at", "active", "auto_send",
    ];
    const fields: Record<string, any> = {};
    for (const k of allowed) {
      if (k in req.body) fields[k] = req.body[k];
    }
    if ("items" in req.body) fields.items_json = JSON.stringify(req.body.items);
    if ("template_config" in fields && fields.template_config && typeof fields.template_config !== "string") {
      fields.template_config = JSON.stringify(fields.template_config);
    }
    if ("vat_enabled" in fields) fields.vat_enabled = fields.vat_enabled ? 1 : 0;
    if ("active" in fields) fields.active = fields.active ? 1 : 0;
    if ("auto_send" in fields) fields.auto_send = fields.auto_send ? 1 : 0;

    if (Object.keys(fields).length === 0) return res.json({ ok: true });
    const setClause = Object.keys(fields).map((k) => `${k} = ?`).join(", ");
    await execute(
      `UPDATE recurring_invoices SET ${setClause} WHERE id = ?`,
      [...Object.values(fields), req.params.id]
    );
    const updated = await queryOne("SELECT * FROM recurring_invoices WHERE id = ?", [req.params.id]);
    res.json({ ok: true, recurring: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

automationsRouter.delete("/recurring/:id", requireAuth, async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const existing = await queryOne(
      "SELECT id FROM recurring_invoices WHERE id = ? AND user_id = ?",
      [req.params.id, userId]
    );
    if (!existing) return res.status(404).json({ error: "Not found" });
    await execute("DELETE FROM recurring_invoices WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Activity log ────────────────────────────────────────────────────────────
automationsRouter.get("/log", requireAuth, async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const limit = Math.min(parseInt(String(req.query.limit || "50")), 200);
    const log = await queryAll(
      `SELECT id, type, target_id, recipient, message, status, created_at
       FROM automation_log WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
      [userId, limit]
    );
    res.json(log);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Send hooks (called from invoices.ts and leads.ts) ──────────────────────
export async function sendThankYouReceipt(invoiceId: string) {
  try {
    const inv = await queryOne(
      `SELECT i.*, bp.business_name, bp.trading_name
       FROM invoices i
       LEFT JOIN business_profiles bp ON bp.user_id = i.user_id
       WHERE i.id = ?`,
      [invoiceId]
    );
    if (!inv || !inv.customer_email) return;
    if (inv.thank_you_sent_at) return;

    const settings = await getSettings(inv.user_id);
    if (!settings.thank_you_enabled) return;

    const mailer = await getTransporterForUser(inv.user_id);
    if (!mailer) return;

    const businessName = inv.trading_name || inv.business_name || mailer.fromName;
    const vars = {
      customer_name: inv.customer_name || "Customer",
      amount: formatCents(inv.total_cents),
      invoice_number: inv.invoice_number,
      business_name: businessName,
    };

    const subject = renderTemplate(settings.thank_you_subject, vars);
    const bodyText = renderTemplate(settings.thank_you_body || DEFAULT_SETTINGS.thank_you_body, vars);
    const html = wrapEmail({
      businessName,
      bodyHtml: plainToHtml(bodyText),
      fromEmail: mailer.fromEmail,
      accent: "#007749",
    });

    await mailer.transporter.sendMail({
      from: `"${businessName}" <${mailer.fromEmail}>`,
      ...(mailer.replyTo ? { replyTo: mailer.replyTo } : {}),
      to: inv.customer_email,
      subject,
      html,
    });

    await execute(
      "UPDATE invoices SET thank_you_sent_at = NOW() WHERE id = ?",
      [invoiceId]
    );

    await logAutomation({
      userId: inv.user_id,
      type: "thank_you",
      targetId: invoiceId,
      recipient: inv.customer_email,
      message: `Thank-you receipt for ${inv.invoice_number}`,
    });
  } catch (err: any) {
    console.error("[Automations] sendThankYouReceipt failed:", err.message);
  }
}

// Send a copy of a new lead to the owner / a custom recipient.
// Called from POST /api/leads/submit when the contact form has notifyEmail set,
// or when the user has set up a default notification email in their account.
export async function sendNewLeadNotification(leadId: string, recipient: string) {
  try {
    if (!recipient || !leadId) return;
    const lead = await queryOne(
      `SELECT wl.*, bp.business_name, bp.trading_name, w.slug as website_slug
       FROM website_leads wl
       LEFT JOIN business_profiles bp ON bp.user_id = wl.user_id
       LEFT JOIN websites w ON w.id = wl.website_id
       WHERE wl.id = ?`,
      [leadId]
    );
    if (!lead) return;

    const mailer = await getTransporterForUser(lead.user_id);
    if (!mailer) return;

    const businessName = lead.trading_name || lead.business_name || mailer.fromName;
    const subject = `New website enquiry from ${lead.name || "a visitor"}`;

    const safeMessage = lead.message ? escapeHtml(lead.message).replace(/\n/g, "<br/>") : "";

    const bodyHtml = `
      <h2 style="margin:0 0 12px;color:#1d4ed8;font-size:18px;">New lead from your website</h2>
      <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">You've just received a new enquiry via your website's contact form.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:0 0 16px;">
        <tr><td style="padding:6px 0;color:#64748b;font-size:13px;width:30%;">Name</td><td style="padding:6px 0;font-weight:600;color:#0f172a;font-size:14px;">${escapeHtml(lead.name || "")}</td></tr>
        ${lead.email ? `<tr><td style="padding:6px 0;color:#64748b;font-size:13px;border-top:1px solid #e2e8f0;">Email</td><td style="padding:6px 0;color:#0f172a;font-size:14px;border-top:1px solid #e2e8f0;"><a href="mailto:${escapeHtml(lead.email)}" style="color:#1d4ed8;text-decoration:none;">${escapeHtml(lead.email)}</a></td></tr>` : ""}
        ${lead.phone ? `<tr><td style="padding:6px 0;color:#64748b;font-size:13px;border-top:1px solid #e2e8f0;">Phone</td><td style="padding:6px 0;color:#0f172a;font-size:14px;border-top:1px solid #e2e8f0;"><a href="tel:${escapeHtml(lead.phone)}" style="color:#1d4ed8;text-decoration:none;">${escapeHtml(lead.phone)}</a></td></tr>` : ""}
        ${lead.source ? `<tr><td style="padding:6px 0;color:#64748b;font-size:13px;border-top:1px solid #e2e8f0;">Source</td><td style="padding:6px 0;color:#0f172a;font-size:14px;border-top:1px solid #e2e8f0;">${escapeHtml(lead.source)}</td></tr>` : ""}
      </table>
      ${safeMessage ? `<div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:0 0 16px;"><div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Message</div><div style="color:#0f172a;font-size:14px;line-height:1.6;">${safeMessage}</div></div>` : ""}
      <p style="margin:0;color:#64748b;font-size:13px;">View and manage all leads in your <a href="${process.env.APP_URL || "https://masakhegroup.co.za"}/dashboard/leads" style="color:#1d4ed8;text-decoration:none;font-weight:600;">Leads dashboard</a>.</p>
    `;

    const html = wrapEmail({
      businessName,
      bodyHtml,
      fromEmail: mailer.fromEmail,
      accent: "#1d4ed8",
    });

    await mailer.transporter.sendMail({
      from: `"${businessName}" <${mailer.fromEmail}>`,
      ...(lead.email ? { replyTo: lead.email } : (mailer.replyTo ? { replyTo: mailer.replyTo } : {})),
      to: recipient,
      subject,
      html,
    });

    await logAutomation({
      userId: lead.user_id,
      type: "lead_notification",
      targetId: leadId,
      recipient,
      message: `New lead notification (${lead.name})`,
    });
  } catch (err: any) {
    console.error("[Automations] sendNewLeadNotification failed:", err.message);
  }
}

export async function sendLeadAutoreply(leadId: string) {
  try {
    const lead = await queryOne(
      `SELECT wl.*, bp.business_name, bp.trading_name
       FROM website_leads wl
       LEFT JOIN business_profiles bp ON bp.user_id = wl.user_id
       WHERE wl.id = ?`,
      [leadId]
    );
    if (!lead || !lead.email) return;
    if (lead.autoreply_sent_at) return;

    const settings = await getSettings(lead.user_id);
    if (!settings.lead_autoreply_enabled) return;

    const mailer = await getTransporterForUser(lead.user_id);
    if (!mailer) return;

    const businessName = lead.trading_name || lead.business_name || mailer.fromName;
    const vars = {
      lead_name: lead.name || "there",
      customer_name: lead.name || "there",
      business_name: businessName,
    };

    const subject = renderTemplate(settings.lead_autoreply_subject, vars);
    const bodyText = renderTemplate(settings.lead_autoreply_body || DEFAULT_SETTINGS.lead_autoreply_body, vars);
    const html = wrapEmail({
      businessName,
      bodyHtml: plainToHtml(bodyText),
      fromEmail: mailer.fromEmail,
      accent: "#1d4ed8",
    });

    await mailer.transporter.sendMail({
      from: `"${businessName}" <${mailer.fromEmail}>`,
      ...(mailer.replyTo ? { replyTo: mailer.replyTo } : {}),
      to: lead.email,
      subject,
      html,
    });

    await execute(
      "UPDATE website_leads SET autoreply_sent_at = NOW() WHERE id = ?",
      [leadId]
    );

    await logAutomation({
      userId: lead.user_id,
      type: "lead_autoreply",
      targetId: leadId,
      recipient: lead.email,
      message: `Auto-reply sent to ${lead.name}`,
    });
  } catch (err: any) {
    console.error("[Automations] sendLeadAutoreply failed:", err.message);
  }
}

export async function checkStopCreditAndAlert(userId: string, customerName: string, customerEmail: string | null) {
  try {
    const settings = await getSettings(userId);
    if (!settings.stop_credit_enabled) return null;

    const result = await queryOne(
      `SELECT COALESCE(SUM(total_cents),0) as outstanding
       FROM invoices
       WHERE user_id = ? AND customer_name = ? AND status IN ('sent','final')
         AND (paid_at IS NULL)
         AND type = 'invoice'`,
      [userId, customerName]
    );
    const outstanding = Number(result?.outstanding || 0);

    if (outstanding < Number(settings.stop_credit_threshold_cents)) return null;

    const owner = await queryOne(
      `SELECT u.email, u.full_name, bp.business_name, bp.trading_name
       FROM users u LEFT JOIN business_profiles bp ON bp.user_id = u.id
       WHERE u.id = ?`,
      [userId]
    );
    if (!owner?.email) return { outstanding, alerted: false };

    const mailer = await getTransporterForUser(userId);
    if (!mailer) return { outstanding, alerted: false };

    const businessName = owner.trading_name || owner.business_name || mailer.fromName;
    const html = wrapEmail({
      businessName,
      accent: "#dc2626",
      fromEmail: mailer.fromEmail,
      bodyHtml: `
        <h2 style="margin:0 0 12px;color:#dc2626;font-size:18px;">Stop-credit alert</h2>
        <p style="margin:0 0 12px;color:#374151;font-size:15px;line-height:1.6;">A customer's outstanding balance has crossed your stop-credit threshold.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:0 0 16px;">
          <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">Customer</td><td style="padding:6px 0;font-weight:600;color:#1a1a2e;text-align:right;font-size:14px;">${escapeHtml(customerName)}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;border-top:1px solid #fecaca;">Outstanding balance</td><td style="padding:6px 0;font-weight:700;color:#dc2626;text-align:right;font-size:16px;border-top:1px solid #fecaca;">${formatCents(outstanding)}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;border-top:1px solid #fecaca;">Threshold</td><td style="padding:6px 0;font-weight:600;color:#1a1a2e;text-align:right;font-size:14px;border-top:1px solid #fecaca;">${formatCents(Number(settings.stop_credit_threshold_cents))}</td></tr>
        </table>
        <p style="margin:0;color:#374151;font-size:14px;">Consider pausing further credit sales until this balance is settled.</p>
      `,
    });

    await mailer.transporter.sendMail({
      from: `"${businessName}" <${mailer.fromEmail}>`,
      to: owner.email,
      subject: `Stop-credit alert: ${customerName} owes ${formatCents(outstanding)}`,
      html,
    });

    await logAutomation({
      userId,
      type: "stop_credit",
      recipient: owner.email,
      message: `Stop-credit alert for ${customerName} (${formatCents(outstanding)})`,
    });

    return { outstanding, alerted: true };
  } catch (err: any) {
    console.error("[Automations] checkStopCreditAndAlert failed:", err.message);
    return null;
  }
}
