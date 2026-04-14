import { queryAll, execute } from "./db";
import { getTransporterForUser } from "./email-settings";

const APP_URL = process.env.APP_URL || "https://masakheportal.co.za";

function parseDueDays(paymentTerms: string | null | undefined): number {
  if (!paymentTerms) return 7;
  const match = paymentTerms.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 7;
}

function formatCents(cents: number): string {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function reminderEmailHtml(opts: {
  invoiceNumber: string;
  customerName: string;
  totalCents: number;
  dueDateStr: string;
  businessName: string;
  fromEmail: string;
  invoiceId: string;
  daysOverdue: number;
  reminderNum: number;
  isAdmin: boolean;
}): string {
  const { invoiceNumber, customerName, totalCents, dueDateStr, businessName, fromEmail, invoiceId, daysOverdue, reminderNum, isAdmin } = opts;
  const isUrgent = reminderNum >= 3;
  const accentColor = isUrgent ? "#dc2626" : "#007749";
  const subject = isUrgent
    ? `FINAL NOTICE: Invoice ${invoiceNumber} is ${daysOverdue} days overdue`
    : `Friendly reminder: Invoice ${invoiceNumber} payment due`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);max-width:600px;width:100%;">
  <tr><td style="background:${accentColor};padding:28px 40px;">
    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">${businessName}</h1>
    <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Payment Reminder</p>
  </td></tr>
  <tr><td style="padding:32px 40px;">
    <p style="margin:0 0 16px;color:#4a4a5a;font-size:15px;">Dear <strong>${customerName}</strong>,</p>
    ${isUrgent
      ? `<p style="margin:0 0 16px;color:#dc2626;font-size:15px;line-height:1.6;"><strong>FINAL NOTICE:</strong> This is our final reminder regarding your outstanding invoice. Please arrange payment immediately to avoid any disruption.</p>`
      : `<p style="margin:0 0 16px;color:#4a4a5a;font-size:15px;line-height:1.6;">This is a friendly reminder that the following invoice is now overdue. Please arrange payment at your earliest convenience.</p>`
    }
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;padding:20px;margin:0 0 24px;">
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Invoice Number</td><td style="padding:8px 0;color:#1a1a2e;font-weight:600;text-align:right;font-size:14px;">${invoiceNumber}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;border-top:1px solid #e5e7eb;">Original Due Date</td><td style="padding:8px 0;color:#1a1a2e;font-weight:600;text-align:right;font-size:14px;border-top:1px solid #e5e7eb;">${dueDateStr}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;border-top:1px solid #e5e7eb;">Days Overdue</td><td style="padding:8px 0;color:${accentColor};font-weight:700;text-align:right;font-size:14px;border-top:1px solid #e5e7eb;">${daysOverdue} day${daysOverdue !== 1 ? "s" : ""}</td></tr>
      <tr style="background:#f0fdf4;"><td style="padding:12px;color:#1a1a2e;font-size:16px;font-weight:700;border-top:1px solid #e5e7eb;">Amount Due</td><td style="padding:12px;color:${accentColor};font-size:18px;font-weight:700;text-align:right;border-top:1px solid #e5e7eb;">${formatCents(totalCents)}</td></tr>
    </table>
    ${isAdmin ? `<table cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
      <tr><td style="background:${accentColor};border-radius:8px;">
        <a href="${APP_URL}/dashboard/billing?invId=${invoiceId}" style="display:inline-block;padding:14px 32px;color:#fff;text-decoration:none;font-size:15px;font-weight:600;">Pay Now — ${formatCents(totalCents)}</a>
      </td></tr>
    </table>` : ""}
    <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">If you have already made this payment, please disregard this notice. For any queries, please reply to this email or contact us at ${fromEmail}.</p>
    <p style="margin:16px 0 0;color:#4a4a5a;font-size:14px;">Kind regards,<br><strong style="color:#1a1a2e;">${businessName}</strong></p>
  </td></tr>
  <tr><td style="background:#f8f8fa;padding:20px 40px;text-align:center;border-top:1px solid #e8e8ec;">
    <p style="margin:0;color:#9a9aaa;font-size:12px;">Powered by Masakhe · South African SMME Platform</p>
  </td></tr>
</table>
</td></tr></table></body></html>`;
}

async function runReminderCheck() {
  try {
    const invoices = await queryAll(
      `SELECT i.id, i.user_id, i.invoice_number, i.customer_name, i.customer_email,
              i.total_cents, i.payment_terms, i.created_at,
              COALESCE(i.reminders_sent, 0) as reminders_sent,
              i.last_reminder_at,
              COALESCE(u.is_admin, 0) as is_admin
       FROM invoices i
       JOIN users u ON u.id = i.user_id
       WHERE i.status = 'sent'
         AND i.customer_email IS NOT NULL
         AND i.customer_email != ''
         AND COALESCE(i.reminders_sent, 0) < 3`,
      []
    );

    const now = new Date();

    for (const inv of invoices) {
      try {
        const dueDays = parseDueDays(inv.payment_terms);
        const createdAt = new Date(inv.created_at);
        const dueDate = new Date(createdAt);
        dueDate.setDate(dueDate.getDate() + dueDays);

        const msOverdue = now.getTime() - dueDate.getTime();
        const daysOverdue = Math.floor(msOverdue / (1000 * 60 * 60 * 24));

        if (daysOverdue < 1) continue;

        const remindersSent = inv.reminders_sent || 0;

        const shouldSend =
          (remindersSent === 0 && daysOverdue >= 3) ||
          (remindersSent === 1 && daysOverdue >= 7) ||
          (remindersSent === 2 && daysOverdue >= 14);

        if (!shouldSend) continue;

        const lastSentAt = inv.last_reminder_at ? new Date(inv.last_reminder_at) : null;
        if (lastSentAt) {
          const hoursSinceLast = (now.getTime() - lastSentAt.getTime()) / (1000 * 60 * 60);
          if (hoursSinceLast < 20) continue;
        }

        const mailer = await getTransporterForUser(inv.user_id);
        if (!mailer) {
          console.log(`[InvoiceScheduler] No mailer for user ${inv.user_id}, skipping invoice ${inv.invoice_number}`);
          continue;
        }

        const dueDateStr = dueDate.toLocaleDateString("en-ZA", { day: "2-digit", month: "long", year: "numeric" });
        const reminderNum = remindersSent + 1;

        const html = reminderEmailHtml({
          invoiceNumber: inv.invoice_number,
          customerName: inv.customer_name,
          totalCents: inv.total_cents,
          dueDateStr,
          businessName: mailer.fromName,
          fromEmail: mailer.fromEmail,
          invoiceId: inv.id,
          daysOverdue,
          reminderNum,
          isAdmin: !!inv.is_admin,
        });

        const subjectPrefix = reminderNum >= 3 ? "FINAL NOTICE" : reminderNum === 2 ? "Second Reminder" : "Payment Reminder";
        await mailer.transporter.sendMail({
          from: `"${mailer.fromName}" <${mailer.fromEmail}>`,
          ...(mailer.replyTo ? { replyTo: mailer.replyTo } : {}),
          to: inv.customer_email,
          subject: `${subjectPrefix}: Invoice ${inv.invoice_number} — ${formatCents(inv.total_cents)}`,
          html,
        });

        await execute(
          `UPDATE invoices SET reminders_sent = COALESCE(reminders_sent, 0) + 1, last_reminder_at = NOW() WHERE id = ?`,
          [inv.id]
        );

        console.log(`[InvoiceScheduler] Reminder #${reminderNum} sent for invoice ${inv.invoice_number} to ${inv.customer_email} (${daysOverdue} days overdue)`);
      } catch (err: any) {
        console.error(`[InvoiceScheduler] Error processing invoice ${inv.invoice_number}:`, err.message);
      }
    }
  } catch (err: any) {
    console.error("[InvoiceScheduler] Error running reminder check:", err.message);
  }
}

async function runMigration() {
  try {
    await execute(
      `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS reminders_sent INT DEFAULT 0`,
      []
    ).catch(() => {});
    await execute(
      `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS last_reminder_at DATETIME NULL`,
      []
    ).catch(() => {});
  } catch {}
}

export function startInvoiceScheduler() {
  runMigration().then(() => {
    runReminderCheck();
    setInterval(runReminderCheck, 6 * 60 * 60 * 1000);
    console.log("[InvoiceScheduler] Payment reminder scheduler started (runs every 6 hours)");
  });
}
