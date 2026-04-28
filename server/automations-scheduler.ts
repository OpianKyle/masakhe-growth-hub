import { queryAll, queryOne, execute } from "./db";
import { randomUUID } from "crypto";
import { getTransporterForUser } from "./email-settings";
import {
  getSettings,
  formatCents,
  renderTemplate,
  plainToHtml,
  wrapEmail,
  escapeHtml,
  logAutomation,
  DEFAULT_SETTINGS,
} from "./automations";

const RUN_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

// ── Helpers ─────────────────────────────────────────────────────────────────
function parseDueDays(paymentTerms: string | null | undefined): number {
  if (!paymentTerms) return 7;
  const m = paymentTerms.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 7;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addToDate(date: Date, frequency: string, customDays: number | null): Date {
  const d = new Date(date);
  switch (frequency) {
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "quarterly":
      d.setMonth(d.getMonth() + 3);
      break;
    case "yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
    case "custom_days":
      d.setDate(d.getDate() + (customDays || 30));
      break;
  }
  return d;
}

async function nextInvoiceNumber(userId: string): Promise<string> {
  const row = await queryOne(
    `SELECT invoice_number FROM invoices WHERE user_id = ? AND type = 'invoice' AND invoice_number LIKE 'INV-%' ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );
  let next = 1;
  if (row?.invoice_number) {
    const m = row.invoice_number.match(/INV-(\d+)/);
    if (m) next = parseInt(m[1], 10) + 1;
  }
  return `INV-${String(next).padStart(5, "0")}`;
}

// ── 1. Recurring invoices ───────────────────────────────────────────────────
async function processRecurringInvoices() {
  const today = isoDate(new Date());
  const due = await queryAll(
    `SELECT * FROM recurring_invoices
     WHERE active = 1 AND next_run_at <= ?
     AND (end_date IS NULL OR end_date >= ?)`,
    [today, today]
  );

  for (const r of due) {
    try {
      const invoiceNumber = await nextInvoiceNumber(r.user_id);
      const id = randomUUID();
      const now = new Date().toISOString().replace("T", " ").slice(0, 19);

      await execute(
        `INSERT INTO invoices
          (id, user_id, invoice_number, customer_name, customer_email, customer_address,
           customer_phone, reference, payment_terms, notes, total_cents, vat_enabled, vat_cents,
           items_json, status, type, template, template_config, recurring_id, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          id,
          r.user_id,
          invoiceNumber,
          r.customer_name,
          r.customer_email,
          r.customer_address,
          r.customer_phone,
          r.reference,
          r.payment_terms,
          r.notes,
          r.total_cents,
          r.vat_enabled,
          r.vat_cents,
          r.items_json,
          r.auto_send ? "sent" : "draft",
          "invoice",
          r.template,
          r.template_config,
          r.id,
          now,
        ]
      );

      // Send email if auto_send and customer email present
      if (r.auto_send && r.customer_email) {
        await sendRecurringInvoiceEmail(r, id, invoiceNumber);
      }

      // Schedule next run
      const next = addToDate(new Date(r.next_run_at), r.frequency, r.custom_days);
      await execute(
        `UPDATE recurring_invoices
         SET next_run_at = ?, last_run_at = NOW(), invoices_generated = invoices_generated + 1
         WHERE id = ?`,
        [isoDate(next), r.id]
      );

      await logAutomation({
        userId: r.user_id,
        type: "recurring_invoice",
        targetId: id,
        recipient: r.customer_email,
        message: `Recurring invoice ${invoiceNumber} generated for ${r.customer_name}`,
      });

      console.log(`[Automations] Recurring invoice ${invoiceNumber} created for ${r.customer_name}`);
    } catch (err: any) {
      console.error(`[Automations] Recurring invoice failed for ${r.id}:`, err.message);
    }
  }
}

async function sendRecurringInvoiceEmail(r: any, invoiceId: string, invoiceNumber: string) {
  try {
    const mailer = await getTransporterForUser(r.user_id);
    if (!mailer) return;
    const owner = await queryOne(
      `SELECT bp.business_name, bp.trading_name FROM business_profiles bp WHERE bp.user_id = ?`,
      [r.user_id]
    );
    const businessName = owner?.trading_name || owner?.business_name || mailer.fromName;
    const html = wrapEmail({
      businessName,
      fromEmail: mailer.fromEmail,
      bodyHtml: `
        <p style="margin:0 0 12px;color:#374151;font-size:15px;">Dear ${escapeHtml(r.customer_name)},</p>
        <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">Please find your recurring invoice <strong>${escapeHtml(invoiceNumber)}</strong> for <strong>${formatCents(r.total_cents)}</strong>.</p>
        <p style="margin:0;color:#6b7280;font-size:13px;">If you have any questions about this invoice, simply reply to this email.</p>
        <p style="margin:16px 0 0;color:#374151;font-size:14px;">Kind regards,<br><strong>${escapeHtml(businessName)}</strong></p>
      `,
    });
    await mailer.transporter.sendMail({
      from: `"${businessName}" <${mailer.fromEmail}>`,
      ...(mailer.replyTo ? { replyTo: mailer.replyTo } : {}),
      to: r.customer_email,
      subject: `Invoice ${invoiceNumber} from ${businessName} — ${formatCents(r.total_cents)}`,
      html,
    });
  } catch (err: any) {
    console.error("[Automations] Recurring invoice email failed:", err.message);
  }
}

// ── 2. Quote follow-ups + expiry ────────────────────────────────────────────
async function processQuoteFollowups() {
  const quotes = await queryAll(
    `SELECT i.*, bp.business_name, bp.trading_name
     FROM invoices i
     LEFT JOIN business_profiles bp ON bp.user_id = i.user_id
     WHERE i.type = 'quote'
       AND i.status NOT IN ('accepted','converted','rejected')
       AND i.customer_email IS NOT NULL AND i.customer_email != ''`,
    []
  );

  const now = new Date();

  for (const q of quotes) {
    try {
      if (!q.customer_email || !String(q.customer_email).trim().includes("@")) continue;
      const settings = await getSettings(q.user_id);
      const expiryDays = Number(settings.quote_expiry_days || 30);
      const followupAfter = Number(settings.quote_followup_after_days || 5);
      const maxFollowups = Number(settings.quote_max_followups || 2);

      const created = new Date(q.created_at);
      const ageDays = Math.floor((now.getTime() - created.getTime()) / 86400000);
      const expiresAt = q.valid_until ? new Date(q.valid_until) : new Date(created.getTime() + expiryDays * 86400000);
      const expired = now > expiresAt;
      const daysSinceLast = q.last_quote_followup_at
        ? Math.floor((now.getTime() - new Date(q.last_quote_followup_at).getTime()) / 86400000)
        : ageDays;

      const mailer = await getTransporterForUser(q.user_id);
      if (!mailer) continue;
      const businessName = q.trading_name || q.business_name || mailer.fromName;
      const vars = {
        customer_name: q.customer_name || "Customer",
        amount: formatCents(q.total_cents),
        invoice_number: q.invoice_number,
        quote_date: created.toLocaleDateString("en-ZA", { day: "2-digit", month: "long", year: "numeric" }),
        business_name: businessName,
      };

      // Expiry notice (one-shot)
      if (expired && !q.quote_expiry_notified_at) {
        const subject = `Quote ${q.invoice_number} has expired`;
        const html = wrapEmail({
          businessName,
          accent: "#9a3412",
          fromEmail: mailer.fromEmail,
          bodyHtml: `
            <p style="margin:0 0 12px;color:#374151;font-size:15px;">Dear ${escapeHtml(vars.customer_name)},</p>
            <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">Quote <strong>${escapeHtml(q.invoice_number)}</strong> for <strong>${formatCents(q.total_cents)}</strong> has now expired.</p>
            <p style="margin:0 0 12px;color:#374151;font-size:15px;line-height:1.6;">If you'd still like to proceed, please reply to this email and we'll be happy to issue a fresh quote.</p>
            <p style="margin:16px 0 0;color:#374151;font-size:14px;">Kind regards,<br><strong>${escapeHtml(businessName)}</strong></p>
          `,
        });
        await mailer.transporter.sendMail({
          from: `"${businessName}" <${mailer.fromEmail}>`,
          ...(mailer.replyTo ? { replyTo: mailer.replyTo } : {}),
          to: q.customer_email,
          subject,
          html,
        });
        await execute("UPDATE invoices SET quote_expiry_notified_at = NOW() WHERE id = ?", [q.id]);
        await logAutomation({
          userId: q.user_id,
          type: "quote_expiry",
          targetId: q.id,
          recipient: q.customer_email,
          message: `Expiry notice for quote ${q.invoice_number}`,
        });
        continue;
      }

      // Auto follow-ups (only while not expired)
      if (
        settings.quote_followup_enabled &&
        !expired &&
        q.quote_followups_sent < maxFollowups &&
        daysSinceLast >= followupAfter
      ) {
        const subject = renderTemplate(settings.quote_followup_subject || DEFAULT_SETTINGS.quote_followup_subject, vars);
        const bodyText = renderTemplate(settings.quote_followup_body || DEFAULT_SETTINGS.quote_followup_body, vars);
        const html = wrapEmail({
          businessName,
          fromEmail: mailer.fromEmail,
          bodyHtml: plainToHtml(bodyText),
        });
        await mailer.transporter.sendMail({
          from: `"${businessName}" <${mailer.fromEmail}>`,
          ...(mailer.replyTo ? { replyTo: mailer.replyTo } : {}),
          to: q.customer_email,
          subject: `${subject} (${q.invoice_number})`,
          html,
        });
        await execute(
          "UPDATE invoices SET quote_followups_sent = quote_followups_sent + 1, last_quote_followup_at = NOW() WHERE id = ?",
          [q.id]
        );
        await logAutomation({
          userId: q.user_id,
          type: "quote_followup",
          targetId: q.id,
          recipient: q.customer_email,
          message: `Follow-up #${q.quote_followups_sent + 1} for quote ${q.invoice_number}`,
        });
      }
    } catch (err: any) {
      console.error(`[Automations] Quote follow-up failed for ${q.id}:`, err.message);
    }
  }
}

// ── 3. Late fees ────────────────────────────────────────────────────────────
async function processLateFees() {
  const overdue = await queryAll(
    `SELECT i.*, bp.business_name, bp.trading_name
     FROM invoices i
     LEFT JOIN business_profiles bp ON bp.user_id = i.user_id
     WHERE i.type = 'invoice'
       AND i.status IN ('sent','final')
       AND i.paid_at IS NULL
       AND COALESCE(i.late_fee_applied_at, NULL) IS NULL`,
    []
  );

  const now = new Date();
  for (const inv of overdue) {
    try {
      const settings = await getSettings(inv.user_id);
      if (!settings.late_fee_enabled) continue;
      if (inv.customer_email && !String(inv.customer_email).trim().includes("@")) {
        // Skip invalid email; we still apply the fee but won't try to email
      }

      const dueDays = parseDueDays(inv.payment_terms);
      const created = new Date(inv.created_at);
      const dueDate = new Date(created);
      dueDate.setDate(dueDate.getDate() + dueDays);
      const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / 86400000);
      if (daysOverdue < Number(settings.late_fee_after_days || 7)) continue;

      const feeCents = Math.round(inv.total_cents * Number(settings.late_fee_percent) / 100);
      if (feeCents <= 0) continue;
      const newTotal = inv.total_cents + feeCents;

      await execute(
        "UPDATE invoices SET late_fee_cents = ?, late_fee_applied_at = NOW(), total_cents = ? WHERE id = ?",
        [feeCents, newTotal, inv.id]
      );

      // Notify customer
      if (inv.customer_email && String(inv.customer_email).trim().includes("@")) {
        const mailer = await getTransporterForUser(inv.user_id);
        if (mailer) {
          const businessName = inv.trading_name || inv.business_name || mailer.fromName;
          const html = wrapEmail({
            businessName,
            accent: "#dc2626",
            fromEmail: mailer.fromEmail,
            bodyHtml: `
              <p style="margin:0 0 12px;color:#374151;font-size:15px;">Dear ${escapeHtml(inv.customer_name)},</p>
              <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">A late-payment fee of <strong style="color:#dc2626;">${formatCents(feeCents)}</strong> (${Number(settings.late_fee_percent).toFixed(2)}%) has been added to invoice <strong>${escapeHtml(inv.invoice_number)}</strong>, which is ${daysOverdue} days overdue.</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;padding:14px;margin:0 0 16px;">
                <tr><td style="padding:4px 0;color:#6b7280;font-size:14px;">Original total</td><td style="padding:4px 0;text-align:right;color:#1a1a2e;font-size:14px;">${formatCents(inv.total_cents)}</td></tr>
                <tr><td style="padding:4px 0;color:#6b7280;font-size:14px;border-top:1px solid #e5e7eb;">Late fee</td><td style="padding:4px 0;text-align:right;color:#dc2626;font-size:14px;border-top:1px solid #e5e7eb;">+ ${formatCents(feeCents)}</td></tr>
                <tr><td style="padding:8px 0;color:#1a1a2e;font-size:15px;font-weight:700;border-top:1px solid #e5e7eb;">New total</td><td style="padding:8px 0;text-align:right;color:#1a1a2e;font-size:16px;font-weight:700;border-top:1px solid #e5e7eb;">${formatCents(newTotal)}</td></tr>
              </table>
              <p style="margin:16px 0 0;color:#374151;font-size:14px;">Kind regards,<br><strong>${escapeHtml(businessName)}</strong></p>
            `,
          });
          await mailer.transporter.sendMail({
            from: `"${businessName}" <${mailer.fromEmail}>`,
            ...(mailer.replyTo ? { replyTo: mailer.replyTo } : {}),
            to: inv.customer_email,
            subject: `Late fee added to invoice ${inv.invoice_number}`,
            html,
          });
        }
      }

      await logAutomation({
        userId: inv.user_id,
        type: "late_fee",
        targetId: inv.id,
        recipient: inv.customer_email,
        message: `Late fee ${formatCents(feeCents)} added to ${inv.invoice_number}`,
      });
    } catch (err: any) {
      console.error(`[Automations] Late fee failed for ${inv.id}:`, err.message);
    }
  }
}

// ── 4. Lead drip ────────────────────────────────────────────────────────────
async function processLeadDrip() {
  const leads = await queryAll(
    `SELECT wl.*, bp.business_name, bp.trading_name
     FROM website_leads wl
     LEFT JOIN business_profiles bp ON bp.user_id = wl.user_id
     WHERE wl.email IS NOT NULL AND wl.email != ''
       AND wl.drip_completed = 0
       AND wl.status IN ('new','contacted')`,
    []
  );

  const now = new Date();
  for (const lead of leads) {
    try {
      if (!lead.email || !String(lead.email).trim().includes("@")) continue;
      const settings = await getSettings(lead.user_id);
      if (!settings.drip_enabled) continue;

      let drips: Array<{ delay_days: number; subject: string; body: string }> = [];
      try {
        drips = JSON.parse(settings.drip_emails_json || "[]");
      } catch {
        continue;
      }
      if (!Array.isArray(drips) || drips.length === 0) continue;

      const step = lead.drip_step || 0;
      if (step >= drips.length) {
        await execute("UPDATE website_leads SET drip_completed = 1 WHERE id = ?", [lead.id]);
        continue;
      }

      const next = drips[step];
      const referenceTime = lead.drip_last_sent_at
        ? new Date(lead.drip_last_sent_at)
        : (lead.autoreply_sent_at ? new Date(lead.autoreply_sent_at) : new Date(lead.created_at));
      const daysSince = Math.floor((now.getTime() - referenceTime.getTime()) / 86400000);
      const delay = Number(next.delay_days) || 0;
      if (daysSince < delay) continue;

      const mailer = await getTransporterForUser(lead.user_id);
      if (!mailer) continue;

      const businessName = lead.trading_name || lead.business_name || mailer.fromName;
      const vars = {
        lead_name: lead.name || "there",
        customer_name: lead.name || "there",
        business_name: businessName,
      };
      const subject = renderTemplate(next.subject || "Following up", vars);
      const bodyText = renderTemplate(next.body || "", vars);
      const html = wrapEmail({
        businessName,
        accent: "#1d4ed8",
        fromEmail: mailer.fromEmail,
        bodyHtml: plainToHtml(bodyText),
      });

      await mailer.transporter.sendMail({
        from: `"${businessName}" <${mailer.fromEmail}>`,
        ...(mailer.replyTo ? { replyTo: mailer.replyTo } : {}),
        to: lead.email,
        subject,
        html,
      });

      const newStep = step + 1;
      const completed = newStep >= drips.length ? 1 : 0;
      await execute(
        "UPDATE website_leads SET drip_step = ?, drip_last_sent_at = NOW(), drip_completed = ? WHERE id = ?",
        [newStep, completed, lead.id]
      );

      await logAutomation({
        userId: lead.user_id,
        type: "lead_drip",
        targetId: lead.id,
        recipient: lead.email,
        message: `Drip email #${newStep} sent to ${lead.name}`,
      });
    } catch (err: any) {
      console.error(`[Automations] Lead drip failed for ${lead.id}:`, err.message);
    }
  }
}

// ── 5. Inactive client nudge ────────────────────────────────────────────────
async function processInactiveClients() {
  const clients = await queryAll(
    `SELECT bc.*, bp.business_name, bp.trading_name
     FROM broker_clients bc
     LEFT JOIN business_profiles bp ON bp.user_id = bc.user_id
     WHERE bc.email IS NOT NULL AND bc.email != ''
       AND bc.status IN ('active','prospect')
       AND (bc.inactive_nudge_sent_at IS NULL
            OR bc.inactive_nudge_sent_at < DATE_SUB(NOW(), INTERVAL 180 DAY))`,
    []
  );

  const now = new Date();
  for (const c of clients) {
    try {
      if (!c.email || !String(c.email).trim().includes("@")) continue;
      const settings = await getSettings(c.user_id);
      if (!settings.inactive_nudge_enabled) continue;

      const lastContact = c.last_contacted_at ? new Date(c.last_contacted_at) : new Date(c.created_at);
      const daysSince = Math.floor((now.getTime() - lastContact.getTime()) / 86400000);
      if (daysSince < Number(settings.inactive_nudge_after_days || 90)) continue;

      const mailer = await getTransporterForUser(c.user_id);
      if (!mailer) continue;
      const businessName = c.trading_name || c.business_name || mailer.fromName;
      const vars = {
        customer_name: c.full_name || "there",
        business_name: businessName,
      };
      const subject = renderTemplate(settings.inactive_nudge_subject || DEFAULT_SETTINGS.inactive_nudge_subject, vars);
      const bodyText = renderTemplate(settings.inactive_nudge_body || DEFAULT_SETTINGS.inactive_nudge_body, vars);
      const html = wrapEmail({
        businessName,
        fromEmail: mailer.fromEmail,
        bodyHtml: plainToHtml(bodyText),
      });

      await mailer.transporter.sendMail({
        from: `"${businessName}" <${mailer.fromEmail}>`,
        ...(mailer.replyTo ? { replyTo: mailer.replyTo } : {}),
        to: c.email,
        subject,
        html,
      });

      await execute("UPDATE broker_clients SET inactive_nudge_sent_at = NOW() WHERE id = ?", [c.id]);
      await logAutomation({
        userId: c.user_id,
        type: "inactive_nudge",
        targetId: c.id,
        recipient: c.email,
        message: `Inactive-client nudge sent to ${c.full_name}`,
      });
    } catch (err: any) {
      console.error(`[Automations] Inactive nudge failed for ${c.id}:`, err.message);
    }
  }
}

// ── 6. Birthday + Anniversary messages ──────────────────────────────────────
async function processBirthdaysAndAnniversaries() {
  const now = new Date();
  const todayMonth = now.getMonth() + 1;
  const todayDay = now.getDate();
  const todayYear = now.getFullYear();

  const candidates = await queryAll(
    `SELECT bc.*, bp.business_name, bp.trading_name
     FROM broker_clients bc
     LEFT JOIN business_profiles bp ON bp.user_id = bc.user_id
     WHERE bc.email IS NOT NULL AND bc.email != ''
       AND ((bc.date_of_birth IS NOT NULL
              AND MONTH(bc.date_of_birth) = ? AND DAY(bc.date_of_birth) = ?
              AND (bc.last_birthday_msg_year IS NULL OR bc.last_birthday_msg_year < ?))
         OR (bc.company_anniversary IS NOT NULL
              AND MONTH(bc.company_anniversary) = ? AND DAY(bc.company_anniversary) = ?
              AND (bc.last_anniversary_msg_year IS NULL OR bc.last_anniversary_msg_year < ?))
         OR (bc.client_since IS NOT NULL
              AND MONTH(bc.client_since) = ? AND DAY(bc.client_since) = ?
              AND YEAR(bc.client_since) < ?
              AND (bc.last_anniversary_msg_year IS NULL OR bc.last_anniversary_msg_year < ?)))`,
    [todayMonth, todayDay, todayYear, todayMonth, todayDay, todayYear, todayMonth, todayDay, todayYear, todayYear]
  );

  for (const c of candidates) {
    try {
      if (!c.email || !String(c.email).trim().includes("@")) continue;
      const settings = await getSettings(c.user_id);
      const mailer = await getTransporterForUser(c.user_id);
      if (!mailer) continue;
      const businessName = c.trading_name || c.business_name || mailer.fromName;
      const vars = {
        customer_name: c.full_name || "there",
        business_name: businessName,
      };

      // Birthday
      if (
        settings.birthday_msg_enabled &&
        c.date_of_birth &&
        new Date(c.date_of_birth).getMonth() + 1 === todayMonth &&
        new Date(c.date_of_birth).getDate() === todayDay &&
        (c.last_birthday_msg_year || 0) < todayYear
      ) {
        const subject = renderTemplate(settings.birthday_msg_subject || DEFAULT_SETTINGS.birthday_msg_subject, vars);
        const bodyText = renderTemplate(settings.birthday_msg_body || DEFAULT_SETTINGS.birthday_msg_body, vars);
        const html = wrapEmail({
          businessName,
          accent: "#db2777",
          fromEmail: mailer.fromEmail,
          bodyHtml: plainToHtml(bodyText),
        });
        await mailer.transporter.sendMail({
          from: `"${businessName}" <${mailer.fromEmail}>`,
          ...(mailer.replyTo ? { replyTo: mailer.replyTo } : {}),
          to: c.email,
          subject,
          html,
        });
        await execute(
          "UPDATE broker_clients SET last_birthday_msg_year = ? WHERE id = ?",
          [todayYear, c.id]
        );
        await logAutomation({
          userId: c.user_id,
          type: "birthday",
          targetId: c.id,
          recipient: c.email,
          message: `Birthday message sent to ${c.full_name}`,
        });
      }

      // Anniversary (company anniversary OR client_since)
      const anniversaryDate = c.company_anniversary || c.client_since;
      if (
        settings.anniversary_msg_enabled &&
        anniversaryDate &&
        new Date(anniversaryDate).getMonth() + 1 === todayMonth &&
        new Date(anniversaryDate).getDate() === todayDay &&
        new Date(anniversaryDate).getFullYear() < todayYear &&
        (c.last_anniversary_msg_year || 0) < todayYear
      ) {
        const subject = renderTemplate(settings.anniversary_msg_subject || DEFAULT_SETTINGS.anniversary_msg_subject, vars);
        const bodyText = renderTemplate(settings.anniversary_msg_body || DEFAULT_SETTINGS.anniversary_msg_body, vars);
        const html = wrapEmail({
          businessName,
          accent: "#9333ea",
          fromEmail: mailer.fromEmail,
          bodyHtml: plainToHtml(bodyText),
        });
        await mailer.transporter.sendMail({
          from: `"${businessName}" <${mailer.fromEmail}>`,
          ...(mailer.replyTo ? { replyTo: mailer.replyTo } : {}),
          to: c.email,
          subject,
          html,
        });
        await execute(
          "UPDATE broker_clients SET last_anniversary_msg_year = ? WHERE id = ?",
          [todayYear, c.id]
        );
        await logAutomation({
          userId: c.user_id,
          type: "anniversary",
          targetId: c.id,
          recipient: c.email,
          message: `Anniversary message sent to ${c.full_name}`,
        });
      }
    } catch (err: any) {
      console.error(`[Automations] Birthday/anniversary failed for ${c.id}:`, err.message);
    }
  }
}

// ── Master loop ─────────────────────────────────────────────────────────────
async function runAll() {
  try { await processRecurringInvoices(); } catch (e: any) { console.error("[Automations] processRecurringInvoices:", e.message); }
  try { await processQuoteFollowups(); } catch (e: any) { console.error("[Automations] processQuoteFollowups:", e.message); }
  try { await processLateFees(); } catch (e: any) { console.error("[Automations] processLateFees:", e.message); }
  try { await processLeadDrip(); } catch (e: any) { console.error("[Automations] processLeadDrip:", e.message); }
  try { await processInactiveClients(); } catch (e: any) { console.error("[Automations] processInactiveClients:", e.message); }
  try { await processBirthdaysAndAnniversaries(); } catch (e: any) { console.error("[Automations] processBirthdays:", e.message); }
}

export function startAutomationsScheduler() {
  setTimeout(runAll, 15_000); // first run shortly after boot
  setInterval(runAll, RUN_INTERVAL_MS);
  console.log(`[Automations] Scheduler started (runs every ${RUN_INTERVAL_MS / 60000} min)`);
}
