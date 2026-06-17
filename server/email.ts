import nodemailer from "nodemailer";
import { queryOne } from "./db";
import { decrypt } from "./crypto";

/**
 * Creates a fresh SMTP transporter on every call.
 * Prefers admin DB settings (system_smtp_settings) over env vars.
 * A fresh connection per send avoids stale idle-connection 535 re-auth errors.
 */
async function getTransporter(): Promise<nodemailer.Transporter | null> {
  // 1. Prefer DB-stored admin SMTP settings
  try {
    const s = await queryOne("SELECT * FROM system_smtp_settings LIMIT 1");
    if (s && s.smtp_pass_enc) {
      const pass = decrypt(s.smtp_pass_enc);
      const port = Number(s.smtp_port) || 465;
      return nodemailer.createTransport({
        host: s.smtp_host,
        port,
        secure: port === 465 || Boolean(s.smtp_secure),
        auth: { user: s.smtp_user, pass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });
    }
  } catch (_) { /* fall through to env vars */ }

  // 2. Fall back to environment variables
  if (!process.env.SMTP_PASSWORD) return null;
  const port = parseInt(process.env.SMTP_PORT || "465");
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.masakheportal.co.za",
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER || "admin@masakheportal.co.za",
      pass: process.env.SMTP_PASSWORD,
    },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

/** Kept for backward compatibility — admin.ts import */
export function getSharedTransporter() {
  return null;
}

export function getBaseUrl(reqOrigin?: string): string {
  return reqOrigin || process.env.APP_URL || "https://masakheportal.co.za";
}

/* ─────────────────────────────────────────────────────────────────────────────
   SHARED TEMPLATE HELPERS
   ───────────────────────────────────────────────────────────────────────────── */

/** Reusable email shell — green-branded header + white card + footer */
export function emailShell(opts: {
  preheader?: string;
  subtitle: string;
  body: string;
  year?: number;
  footerNote?: string;
}): string {
  const year = opts.year ?? new Date().getFullYear();
  const footerNote = opts.footerNote ?? "You received this email because you have a Masakhe account.";
  const preheader = opts.preheader ?? "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>Masakhe</title>
</head>
<body style="margin:0;padding:0;background-color:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>` : ""}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#F3F4F6;padding:32px 16px 48px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;">

          <!-- HEADER LOGO BAR -->
          <tr>
            <td style="padding-bottom:20px;text-align:center;">
              <span style="font-size:22px;font-weight:800;color:#111827;letter-spacing:-0.5px;">
                <span style="display:inline-block;background:#007749;color:#fff;width:32px;height:32px;line-height:32px;border-radius:8px;font-size:18px;font-weight:900;text-align:center;vertical-align:middle;margin-right:8px;">M</span>Masakhe
              </span>
            </td>
          </tr>

          <!-- CARD -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.06);">

              <!-- GREEN HEADER BAND -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#007749 0%,#004d30 100%);padding:36px 48px;text-align:center;">
                    <p style="margin:0;color:rgba(255,255,255,0.7);font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;">${opts.subtitle}</p>
                  </td>
                </tr>
                <tr>
                  <td style="height:3px;background:linear-gradient(90deg,#34d399,#059669,#007749);"></td>
                </tr>
              </table>

              <!-- BODY -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:40px 48px;">
                    ${opts.body}
                  </td>
                </tr>
              </table>

              <!-- FOOTER -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background:#F9FAFB;border-top:1px solid #E5E7EB;padding:24px 48px;text-align:center;">
                    <p style="margin:0 0 6px;color:#9CA3AF;font-size:11px;line-height:1.6;">${footerNote}</p>
                    <p style="margin:0;color:#9CA3AF;font-size:11px;">&copy; ${year} Masakhe Business Solutions &nbsp;&bull;&nbsp; <a href="https://masakheportal.co.za" style="color:#007749;text-decoration:none;">masakheportal.co.za</a></p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Renders a primary CTA button */
function ctaButton(label: string, href: string, color = "#007749"): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
    <tr>
      <td style="background-color:${color};border-radius:10px;">
        <a href="${href}" style="display:inline-block;padding:15px 36px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;letter-spacing:-0.2px;">${label}</a>
      </td>
    </tr>
  </table>`;
}

/** Light-green info box */
function infoBox(html: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td style="background:#ECFDF5;border:1px solid #A7F3D0;border-radius:10px;padding:20px 24px;">
        ${html}
      </td>
    </tr>
  </table>`;
}

/** Fallback URL line shown below a button */
function fallbackUrl(url: string): string {
  return `<p style="margin:16px 0 0;color:#9CA3AF;font-size:12px;line-height:1.7;word-break:break-all;">
    If the button doesn't work, copy and paste this link into your browser:<br>
    <a href="${url}" style="color:#007749;">${url}</a>
  </p>`;
}

/* ─────────────────────────────────────────────────────────────────────────────
   1. WELCOME EMAIL
   ───────────────────────────────────────────────────────────────────────────── */
export async function sendWelcomeEmail(toEmail: string, fullName: string, baseUrl?: string) {
  const t = await getTransporter();
  if (!t) return;
  const firstName = fullName.split(" ")[0];
  const appUrl = baseUrl || getBaseUrl();

  // Try loading content from DB (admin-editable system_emails table)
  try {
    const dbEmail = await queryOne("SELECT * FROM system_emails WHERE type = 'welcome' AND enabled = 1");
    if (dbEmail) {
      const subject = dbEmail.subject
        .replace(/\{\{firstName\}\}/g, firstName)
        .replace(/\{\{fullName\}\}/g, fullName);
      const rawBody = dbEmail.body_text
        .replace(/\{\{firstName\}\}/g, firstName)
        .replace(/\{\{fullName\}\}/g, fullName)
        .replace(/\{\{appUrl\}\}/g, appUrl);
      const bodyHtml = rawBody.split("\n").map((line: string) =>
        line.trim() === ""
          ? '<div style="height:12px;"></div>'
          : `<p style="margin:0 0 12px;color:#374151;font-size:15px;line-height:1.7;">${line}</p>`
      ).join("");
      const body = `
        <h2 style="margin:0 0 8px;color:#111827;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Welcome, ${firstName}!</h2>
        <p style="margin:0 0 20px;color:#6B7280;font-size:14px;">We're really glad you're here.</p>
        ${bodyHtml}
      `;
      const html = emailShell({
        preheader: `Welcome to Masakhe, ${firstName}`,
        subtitle: "Welcome to Masakhe Portal",
        body,
        footerNote: "You received this email because you registered at Masakhe Portal.",
      });
      const fromName = dbEmail.from_name || "Masakhe";
      const info = await t.sendMail({
        from: `"${fromName}" <${process.env.SMTP_FROM || "admin@masakheportal.co.za"}>`,
        replyTo: process.env.SMTP_FROM || "admin@masakheportal.co.za",
        to: toEmail,
        subject,
        html,
        headers: { "X-Priority": "3", "X-Mailer": "Masakhe Platform", "Precedence": "bulk" },
      });
      console.log(`[Email] Welcome sent to ${toEmail} (db template) — messageId: ${info.messageId}`);
      return;
    }
  } catch (dbErr: any) {
    console.warn("[Email] Could not load welcome template from DB, using default:", dbErr.message);
  }

  // Fallback: hardcoded default template
  const body = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:26px;font-weight:800;letter-spacing:-0.5px;">Welcome, ${firstName}!</h2>
    <p style="margin:0 0 24px;color:#6B7280;font-size:14px;">We're really glad you're here.</p>

    <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.7;">
      Your Masakhe account is ready. I'd love to connect with you personally to make sure you're getting the most out of the platform — and to understand how we can best support your business growth.
    </p>

    <p style="margin:0 0 28px;color:#374151;font-size:15px;line-height:1.7;">
      Please book a free 30-minute onboarding call with me at a time that suits you:
    </p>

    ${ctaButton("Schedule My Onboarding Call", "https://calendly.com/masakhesystems")}

    <div style="height:32px;"></div>

    ${infoBox(`
      <p style="margin:0 0 12px;color:#065F46;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Call details</p>
      <p style="margin:0 0 8px;color:#374151;font-size:14px;">&#128205;&nbsp; <strong>Format:</strong> Google Meet (link sent on confirmation)</p>
      <p style="margin:0 0 8px;color:#374151;font-size:14px;">&#128336;&nbsp; <strong>Duration:</strong> 30 minutes</p>
      <p style="margin:0;color:#374151;font-size:14px;">&#128100;&nbsp; <strong>With:</strong> Lance Heynes, CEO &mdash; Masakhe Technologies</p>
    `)}

    <div style="height:32px;"></div>

    <p style="margin:0;color:#374151;font-size:15px;line-height:1.8;">
      Looking forward to meeting you!<br><br>
      <strong style="color:#111827;">Lance Heynes</strong><br>
      <span style="color:#6B7280;font-size:13px;">CEO, Masakhe Technologies</span>
    </p>
  `;

  const html = emailShell({
    preheader: `Welcome to Masakhe, ${firstName} — book your free onboarding call`,
    subtitle: "Welcome to Masakhe Portal",
    body,
    footerNote: "You received this email because you registered at Masakhe Portal.",
  });

  try {
    const info = await t.sendMail({
      from: `"Lance Heynes - Masakhe" <${process.env.SMTP_FROM || "admin@masakheportal.co.za"}>`,
      replyTo: process.env.SMTP_FROM || "admin@masakheportal.co.za",
      to: toEmail,
      subject: `Welcome to Masakhe Portal`,
      html,
      headers: { "X-Priority": "3", "X-Mailer": "Masakhe Platform", "Precedence": "bulk" },
    });
    console.log(`[Email] Welcome sent to ${toEmail} — messageId: ${info.messageId}`);
  } catch (err: any) {
    console.error(`[Email] FAILED welcome to ${toEmail}:`, err.message, err.responseCode ?? "");
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   2. SUBSCRIPTION INVOICE EMAIL
   ───────────────────────────────────────────────────────────────────────────── */
export async function sendSubscriptionInvoiceEmail(
  toEmail: string,
  clientName: string,
  invoiceNumber: string,
  planName: string,
  amountCents: number,
  description: string,
  dueDate: string,
  baseUrl?: string
) {
  const t = await getTransporter();
  if (!t) return;
  const firstName = clientName.split(" ")[0];
  const amount = `R${(amountCents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;

  const body = `
    <h2 style="margin:0 0 6px;color:#111827;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Invoice #${invoiceNumber}</h2>
    <p style="margin:0 0 28px;color:#6B7280;font-size:14px;">Hi ${firstName}, please find your subscription invoice below.</p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;margin-bottom:24px;">
      <tr style="background:#F9FAFB;">
        <td style="padding:10px 16px;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #E5E7EB;">Description</td>
        <td style="padding:10px 16px;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #E5E7EB;text-align:right;">Amount</td>
      </tr>
      <tr>
        <td style="padding:16px;color:#111827;font-size:15px;">
          <strong>${planName} Subscription</strong><br>
          <span style="color:#6B7280;font-size:13px;">${description}</span>
        </td>
        <td style="padding:16px;color:#111827;font-size:15px;font-weight:700;text-align:right;">${amount}</td>
      </tr>
      <tr style="background:#F9FAFB;border-top:2px solid #E5E7EB;">
        <td style="padding:12px 16px;font-size:14px;font-weight:700;color:#111827;">Total Due</td>
        <td style="padding:12px 16px;font-size:16px;font-weight:800;color:#007749;text-align:right;">${amount}</td>
      </tr>
    </table>

    <p style="margin:0 0 24px;color:#374151;font-size:14px;">
      <strong>Due Date:</strong> ${dueDate}
    </p>

    <p style="margin:0 0 8px;color:#6B7280;font-size:13px;line-height:1.7;">
      Questions about this invoice? Contact us at <a href="mailto:admin@masakhegroup.co.za" style="color:#007749;">admin@masakhegroup.co.za</a>
    </p>
    <p style="margin:0;color:#374151;font-size:14px;">
      Thank you for your business &mdash; <strong style="color:#111827;">The Masakhe Team</strong>
    </p>
  `;

  const html = emailShell({
    preheader: `Invoice #${invoiceNumber} for ${planName} — ${amount} due ${dueDate}`,
    subtitle: "Subscription Invoice",
    body,
    footerNote: "You received this email because you are a Masakhe subscriber.",
  });

  try {
    await t.sendMail({
      from: `"Masakhe" <${process.env.SMTP_FROM || "admin@masakheportal.co.za"}>`,
      to: toEmail,
      subject: `Invoice #${invoiceNumber} — ${planName} Subscription`,
      html,
    });
    console.log(`[Email] Invoice sent to ${toEmail}`);
  } catch (err: any) {
    console.error(`[Email] FAILED invoice to ${toEmail}:`, err.message);
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   3. PAYMENT REMINDER EMAIL
   ───────────────────────────────────────────────────────────────────────────── */
export async function sendPaymentReminderEmail(
  toEmail: string,
  clientName: string,
  planName: string,
  amountCents: number,
  dueDate: string,
  baseUrl?: string
) {
  const t = await getTransporter();
  if (!t) return;
  const firstName = clientName.split(" ")[0];
  const appUrl = baseUrl || getBaseUrl();
  const amount = `R${(amountCents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;

  const body = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Subscription renewal due, ${firstName}</h2>
    <p style="margin:0 0 24px;color:#6B7280;font-size:14px;">A friendly reminder about your upcoming payment.</p>

    <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.7;">
      Your <strong>${planName}</strong> subscription payment of <strong>${amount}</strong> is due on <strong>${dueDate}</strong>.
    </p>
    <p style="margin:0 0 28px;color:#374151;font-size:15px;line-height:1.7;">
      You can pay early or update your payment details from your billing page.
    </p>

    ${ctaButton(`Pay Now — ${amount}`, `${appUrl}/dashboard/billing`)}

    <div style="height:28px;"></div>

    <p style="margin:0;color:#6B7280;font-size:13px;line-height:1.7;">
      If payment is not received within 3 days of the due date, access to your dashboard will be temporarily suspended until payment is made.
    </p>
  `;

  const html = emailShell({
    preheader: `Your ${planName} subscription of ${amount} is due on ${dueDate}`,
    subtitle: "Subscription Renewal Reminder",
    body,
    footerNote: "You received this email because you are a Masakhe subscriber.",
  });

  try {
    await t.sendMail({
      from: `"Masakhe" <${process.env.SMTP_FROM || "admin@masakheportal.co.za"}>`,
      to: toEmail,
      subject: `Subscription Renewal Due — ${dueDate}`,
      html,
    });
    console.log(`[Email] Payment reminder sent to ${toEmail}`);
  } catch (err: any) {
    console.error(`[Email] FAILED payment reminder to ${toEmail}:`, err.message);
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   4. TEAM INVITE EMAIL
   ───────────────────────────────────────────────────────────────────────────── */
export async function sendTeamInviteEmail(
  toEmail: string,
  inviteeName: string,
  ownerName: string,
  businessName: string,
  setupToken: string,
  baseUrl?: string
) {
  const t = await getTransporter();
  if (!t) return;
  const firstName = (inviteeName || toEmail).split(" ")[0];
  const appUrl = baseUrl || getBaseUrl();
  const setupUrl = `${appUrl}/set-password?token=${setupToken}`;

  const body = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Hi ${firstName},</h2>
    <p style="margin:0 0 24px;color:#6B7280;font-size:14px;">You've been invited to join a team on Masakhe.</p>

    <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.7;">
      <strong>${ownerName}</strong> has added you as a team member of <strong>${businessName}</strong> on Masakhe. Click the button below to set your password and access the dashboard.
    </p>

    <div style="margin-bottom:28px;">
      ${ctaButton("Set My Password &amp; Get Started", setupUrl)}
    </div>

    <p style="margin:0 0 8px;color:#374151;font-size:14px;line-height:1.7;">
      This link will expire in <strong>7 days</strong>. If you weren't expecting this invitation, you can safely ignore this email.
    </p>
    ${fallbackUrl(setupUrl)}
  `;

  const html = emailShell({
    preheader: `${ownerName} has invited you to join ${businessName} on Masakhe`,
    subtitle: "Team Invitation",
    body,
  });

  try {
    await t.sendMail({
      from: `"Masakhe" <${process.env.SMTP_FROM || "admin@masakheportal.co.za"}>`,
      to: toEmail,
      subject: `${ownerName} invited you to ${businessName} on Masakhe`,
      html,
    });
    console.log(`[Email] Team invite sent to ${toEmail}`);
  } catch (err: any) {
    console.error(`[Email] FAILED team invite to ${toEmail}:`, err.message);
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   5. FRANCHISE CLIENT INVITE EMAIL
   ───────────────────────────────────────────────────────────────────────────── */
export async function sendFranchiseClientInviteEmail(
  toEmail: string,
  inviteeName: string,
  franchiseName: string,
  ownerName: string,
  setupToken: string,
  baseUrl?: string
) {
  const t = await getTransporter();
  if (!t) return false;
  const firstName = (inviteeName || toEmail).split(" ")[0];
  const appUrl = baseUrl || getBaseUrl();
  const setupUrl = `${appUrl}/set-password?token=${setupToken}`;

  const body = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Hi ${firstName},</h2>
    <p style="margin:0 0 24px;color:#6B7280;font-size:14px;">You've been invited to get started on Masakhe.</p>

    <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.7;">
      <strong>${ownerName}</strong> from <strong>${franchiseName}</strong> has set up a Masakhe account for you. Click below to create your password and access your SMME dashboard.
    </p>

    <div style="margin-bottom:28px;">
      ${ctaButton("Set My Password &amp; Get Started", setupUrl)}
    </div>

    <p style="margin:0 0 8px;color:#374151;font-size:14px;line-height:1.7;">
      This link will expire in <strong>7 days</strong>. If you weren't expecting this invitation, you can safely ignore this email.
    </p>
    ${fallbackUrl(setupUrl)}
  `;

  const html = emailShell({
    preheader: `${ownerName} from ${franchiseName} has set up a Masakhe account for you`,
    subtitle: "Your Masakhe Account is Ready",
    body,
  });

  try {
    await t.sendMail({
      from: `"Masakhe" <${process.env.SMTP_FROM || "admin@masakheportal.co.za"}>`,
      to: toEmail,
      subject: `${ownerName} invited you to Masakhe`,
      html,
    });
    console.log(`[Email] Franchise client invite sent to ${toEmail}`);
    return true;
  } catch (err: any) {
    console.error(`[Email] FAILED franchise client invite to ${toEmail}:`, err.message);
    return false;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   6. FRANCHISE OWNER INVITE EMAIL
   ───────────────────────────────────────────────────────────────────────────── */
export async function sendFranchiseOwnerInviteEmail(
  toEmail: string,
  inviteeName: string,
  franchiseName: string,
  franchiseCode: string,
  setupToken: string,
  baseUrl?: string
) {
  const t = await getTransporter();
  if (!t) return false;
  const firstName = (inviteeName || toEmail).split(" ")[0];
  const appUrl = baseUrl || getBaseUrl();
  const setupUrl = `${appUrl}/set-password?token=${setupToken}`;

  const body = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Welcome, ${firstName}!</h2>
    <p style="margin:0 0 24px;color:#6B7280;font-size:14px;">You've been appointed as a Franchise Owner.</p>

    <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.7;">
      The Masakhe admin team has appointed you as the franchise owner of <strong>${franchiseName}</strong>.
    </p>

    ${infoBox(`
      <p style="margin:0 0 10px;color:#065F46;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Franchise Details</p>
      <p style="margin:0 0 8px;color:#374151;font-size:14px;"><strong>Franchise Name:</strong> ${franchiseName}</p>
      <p style="margin:0;color:#374151;font-size:14px;"><strong>Franchise Code:</strong> <code style="background:#D1FAE5;padding:2px 8px;border-radius:4px;font-size:13px;color:#065F46;">${franchiseCode}</code></p>
    `)}

    <div style="height:24px;"></div>

    <p style="margin:0 0 8px;color:#374151;font-size:14px;font-weight:600;">As a franchise owner you can:</p>
    <ul style="margin:0 0 24px;padding-left:20px;color:#374151;font-size:14px;line-height:2;">
      <li>Manage your assigned client accounts</li>
      <li>Grant and revoke subscriptions for your clients</li>
      <li>Assist clients by impersonating their accounts</li>
      <li>View your franchise dashboard and reporting</li>
    </ul>

    <div style="margin-bottom:28px;">
      ${ctaButton("Set My Password &amp; Get Started", setupUrl)}
    </div>

    <p style="margin:0 0 8px;color:#374151;font-size:14px;line-height:1.7;">
      This link will expire in <strong>7 days</strong>. If you weren't expecting this, you can safely ignore this email.
    </p>
    ${fallbackUrl(setupUrl)}
  `;

  const html = emailShell({
    preheader: `You've been appointed as Franchise Owner of ${franchiseName} on Masakhe`,
    subtitle: "Franchise Owner Appointment",
    body,
  });

  try {
    await t.sendMail({
      from: `"Masakhe" <${process.env.SMTP_FROM || "admin@masakheportal.co.za"}>`,
      to: toEmail,
      subject: `You've been appointed as a Franchise Owner on Masakhe`,
      html,
    });
    console.log(`[Email] Franchise owner invite sent to ${toEmail}`);
    return true;
  } catch (err: any) {
    console.error(`[Email] FAILED franchise owner invite to ${toEmail}:`, err.message);
    return false;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   7. FRANCHISE APPLICATION EMAIL (internal alert to admin)
   ───────────────────────────────────────────────────────────────────────────── */
export async function sendFranchiseApplicationEmail(opts: {
  applicantName: string;
  applicantEmail: string;
  businessName: string;
  phone: string;
  message: string;
}) {
  const t = await getTransporter();
  if (!t) {
    console.warn("SMTP not configured — franchise application email skipped");
    return false;
  }
  const { applicantName, applicantEmail, businessName, phone, message } = opts;
  const submittedAt = new Date().toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg", dateStyle: "long", timeStyle: "short" });

  const body = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:24px;font-weight:800;letter-spacing:-0.5px;">New Franchise Application</h2>
    <p style="margin:0 0 24px;color:#6B7280;font-size:14px;">Submitted ${submittedAt} (SAST)</p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;margin-bottom:24px;">
      <tr style="background:#F9FAFB;">
        <td colspan="2" style="padding:10px 16px;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #E5E7EB;">Applicant Details</td>
      </tr>
      <tr style="border-bottom:1px solid #F3F4F6;">
        <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#6B7280;width:130px;white-space:nowrap;">Name</td>
        <td style="padding:12px 16px;font-size:14px;color:#111827;">${applicantName}</td>
      </tr>
      <tr style="border-bottom:1px solid #F3F4F6;">
        <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#6B7280;">Email</td>
        <td style="padding:12px 16px;font-size:14px;"><a href="mailto:${applicantEmail}" style="color:#007749;font-weight:600;">${applicantEmail}</a></td>
      </tr>
      <tr style="border-bottom:1px solid #F3F4F6;">
        <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#6B7280;">Business</td>
        <td style="padding:12px 16px;font-size:14px;color:#111827;">${businessName || "Not provided"}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#6B7280;">Phone</td>
        <td style="padding:12px 16px;font-size:14px;color:#111827;">${phone || "Not provided"}</td>
      </tr>
    </table>

    ${message ? `
    <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;">Message</p>
      <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;">${message.replace(/\n/g, "<br>")}</p>
    </div>` : ""}

    <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">
      Reply directly to this email or use the contact details above to follow up.
    </p>
  `;

  const html = emailShell({
    subtitle: "New Franchise Application",
    body,
    footerNote: "This is an automated notification from the Masakhe platform.",
  });

  try {
    await t.sendMail({
      from: `"Masakhe Platform" <${process.env.SMTP_FROM || "admin@masakheportal.co.za"}>`,
      to: "admin@masakhegroup.co.za",
      replyTo: applicantEmail,
      subject: `Franchise Application — ${applicantName} (${businessName || applicantEmail})`,
      html,
    });
    return true;
  } catch (err: any) {
    console.error("[Email] FAILED franchise application email:", err.message);
    return false;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   8. PASSWORD RESET EMAIL
   ───────────────────────────────────────────────────────────────────────────── */
export async function sendPasswordResetEmail(toEmail: string, fullName: string, resetToken: string, baseUrl?: string) {
  const t = await getTransporter();
  if (!t) return;
  const firstName = fullName.split(" ")[0];
  const appUrl = baseUrl || getBaseUrl();
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

  const body = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Password Reset Request</h2>
    <p style="margin:0 0 24px;color:#6B7280;font-size:14px;">Hi ${firstName}, we received a request to reset your password.</p>

    <p style="margin:0 0 28px;color:#374151;font-size:15px;line-height:1.7;">
      Click the button below to create a new password. If you didn't request this, you can safely ignore this email &mdash; your password won't change.
    </p>

    <div style="margin-bottom:28px;">
      ${ctaButton("Reset My Password", resetUrl)}
    </div>

    <p style="margin:0 0 8px;color:#374151;font-size:14px;line-height:1.7;">
      This link will expire in <strong>1 hour</strong>.
    </p>
    ${fallbackUrl(resetUrl)}
  `;

  const html = emailShell({
    preheader: "Reset your Masakhe password — link expires in 1 hour",
    subtitle: "Password Reset",
    body,
    footerNote: "You received this email because a password reset was requested for your Masakhe account.",
  });

  try {
    await t.sendMail({
      from: `"Masakhe" <${process.env.SMTP_FROM || "admin@masakheportal.co.za"}>`,
      to: toEmail,
      subject: "Reset your Masakhe password",
      html,
    });
    console.log(`[Email] Password reset sent to ${toEmail}`);
  } catch (err: any) {
    console.error(`[Email] FAILED password reset to ${toEmail}:`, err.message);
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   9. ADMIN SIGNUP NOTIFICATION (internal)
   ───────────────────────────────────────────────────────────────────────────── */
export async function sendAdminSignupNotification(
  clientEmail: string,
  clientName: string,
  clientPhone: string | null,
  baseUrl?: string
): Promise<void> {
  const t = await getTransporter();
  if (!t) return;
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || "admin@masakhegroup.co.za";
  const adminRecipients = [adminEmail, "lance.heynes@gmail.com"].join(", ");
  const appUrl = baseUrl || getBaseUrl();
  const signupTime = new Date().toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" });

  const body = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:24px;font-weight:800;letter-spacing:-0.5px;">&#127881; New Signup Alert</h2>
    <p style="margin:0 0 24px;color:#6B7280;font-size:14px;">A new client just registered &mdash; please reach out <strong>within the hour</strong>.</p>

    ${infoBox(`
      <p style="margin:0 0 10px;color:#065F46;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Client Details</p>
      <p style="margin:0 0 8px;color:#374151;font-size:14px;"><strong>Name:</strong> ${clientName}</p>
      <p style="margin:0 0 8px;color:#374151;font-size:14px;"><strong>Email:</strong> <a href="mailto:${clientEmail}" style="color:#007749;font-weight:600;">${clientEmail}</a></p>
      <p style="margin:0 0 8px;color:#374151;font-size:14px;"><strong>Cell:</strong> ${clientPhone ? `<a href="tel:${clientPhone}" style="color:#007749;font-weight:600;">${clientPhone}</a>` : "Not provided"}</p>
      <p style="margin:0;color:#374151;font-size:14px;"><strong>Signed up:</strong> ${signupTime} (SAST)</p>
    `)}

    <div style="height:24px;"></div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:20px;">
      <tr>
        <td style="padding-right:6px;" width="50%">
          <a href="tel:${clientPhone || ''}" style="display:block;text-align:center;background:#007749;color:#fff;text-decoration:none;padding:13px 16px;border-radius:10px;font-size:14px;font-weight:700;">&#128222; Call Now</a>
        </td>
        <td style="padding-left:6px;" width="50%">
          <a href="${appUrl}/admin/users" style="display:block;text-align:center;background:#111827;color:#fff;text-decoration:none;padding:13px 16px;border-radius:10px;font-size:14px;font-weight:700;">View in Admin Panel</a>
        </td>
      </tr>
    </table>

    <p style="margin:0;color:#9CA3AF;font-size:12px;line-height:1.6;">
      The client has also received a welcome email letting them know your team will be in touch.
    </p>
  `;

  const html = emailShell({
    subtitle: "Internal Signup Notification",
    body,
    footerNote: "This is an automated notification from the Masakhe platform.",
  });

  try {
    await t.sendMail({
      from: `"Masakhe System" <${process.env.SMTP_FROM || "admin@masakheportal.co.za"}>`,
      to: adminRecipients,
      subject: `New Signup: ${clientName} — Call to onboard`,
      html,
    });
    console.log(`[Email] Admin signup notification sent for ${clientEmail}`);
  } catch (err: any) {
    console.error(`[Email] FAILED admin signup notification:`, err.message);
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   10. EMAIL VERIFICATION
   ───────────────────────────────────────────────────────────────────────────── */
export async function sendEmailVerificationEmail(
  toEmail: string,
  fullName: string,
  verifyUrl: string
): Promise<void> {
  const t = await getTransporter();
  if (!t) return;
  const firstName = fullName.split(" ")[0];

  const body = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Hi ${firstName}, one quick step!</h2>
    <p style="margin:0 0 24px;color:#6B7280;font-size:14px;">Verify your email to unlock your full Masakhe account.</p>

    <p style="margin:0 0 28px;color:#374151;font-size:15px;line-height:1.7;">
      Please verify your email address to confirm your account and access all the features of your Masakhe platform.
    </p>

    <div style="margin-bottom:28px;">
      ${ctaButton("Verify My Email Address", verifyUrl)}
    </div>

    <p style="margin:0 0 8px;color:#374151;font-size:14px;line-height:1.7;">
      This link expires in <strong>24 hours</strong>. If you didn't create a Masakhe account, you can safely ignore this email.
    </p>
    ${fallbackUrl(verifyUrl)}
  `;

  const html = emailShell({
    preheader: `Hi ${firstName}, please verify your email to activate your Masakhe account`,
    subtitle: "Email Verification",
    body,
    footerNote: "You received this email because you created a Masakhe account.",
  });

  try {
    const info = await t.sendMail({
      from: `"Masakhe" <${process.env.SMTP_FROM || "admin@masakheportal.co.za"}>`,
      replyTo: process.env.SMTP_FROM || "admin@masakheportal.co.za",
      to: toEmail,
      subject: `Please verify your Masakhe email address`,
      html,
      headers: { "X-Priority": "1", "X-Mailer": "Masakhe Platform" },
    });
    console.log(`[Email] Verification sent to ${toEmail} — messageId: ${info.messageId}`);
  } catch (err: any) {
    console.error(`[Email] FAILED verification to ${toEmail}:`, err.message, err.responseCode ?? "");
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   11. ONBOARDING CALL EMAIL
   ───────────────────────────────────────────────────────────────────────────── */
export async function sendOnboardingCallEmail(
  toEmail: string,
  fullName: string,
  baseUrl?: string,
): Promise<void> {
  const t = await getTransporter();
  if (!t) return;
  const firstName = fullName.split(" ")[0];
  const appUrl = baseUrl || getBaseUrl();

  const body = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:24px;font-weight:800;letter-spacing:-0.5px;">We're reaching out, ${firstName}!</h2>
    <p style="margin:0 0 24px;color:#6B7280;font-size:14px;">Your free onboarding call is being arranged.</p>

    <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.7;">
      Welcome to Masakhe! Our team will be calling you <strong>within the next few hours</strong> to schedule your free, personalised onboarding session.
    </p>

    ${infoBox(`
      <p style="margin:0 0 10px;color:#065F46;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">What your onboarding call covers</p>
      <p style="margin:0 0 6px;color:#374151;font-size:14px;">&#10003;&nbsp; Personalised platform walkthrough</p>
      <p style="margin:0 0 6px;color:#374151;font-size:14px;">&#10003;&nbsp; Setting up your business profile &amp; website</p>
      <p style="margin:0 0 6px;color:#374151;font-size:14px;">&#10003;&nbsp; Invoicing and payroll configuration</p>
      <p style="margin:0;color:#374151;font-size:14px;">&#10003;&nbsp; Answers to all your questions</p>
    `)}

    <div style="height:24px;"></div>

    <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">
      In the meantime, feel free to explore your dashboard and start setting up your business.
    </p>

    <div style="margin-bottom:28px;">
      ${ctaButton("Explore My Dashboard", `${appUrl}/dashboard`)}
    </div>

    <p style="margin:0;color:#374151;font-size:14px;line-height:1.8;">
      Looking forward to speaking with you!<br>
      <strong style="color:#111827;">The Masakhe Onboarding Team</strong>
    </p>
  `;

  const html = emailShell({
    preheader: `Hi ${firstName}, your Masakhe onboarding call is being arranged — we'll call you soon`,
    subtitle: "Your Personal Onboarding Call",
    body,
    footerNote: "You received this email because you registered at Masakhe Portal.",
  });

  try {
    const info = await t.sendMail({
      from: `"Masakhe Team" <${process.env.SMTP_FROM || "admin@masakheportal.co.za"}>`,
      replyTo: process.env.SMTP_FROM || "admin@masakheportal.co.za",
      to: toEmail,
      subject: `Your Masakhe onboarding — next steps`,
      html,
      headers: { "X-Priority": "3", "X-Mailer": "Masakhe Platform", "Precedence": "bulk" },
    });
    console.log(`[Email] Onboarding sent to ${toEmail} — messageId: ${info.messageId}`);
  } catch (err: any) {
    console.error(`[Email] FAILED onboarding to ${toEmail}:`, err.message, err.responseCode ?? "");
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   12. DRIP EMAIL CAMPAIGN
   Days: 1, 3, 7, 14, 30
   ───────────────────────────────────────────────────────────────────────────── */

const DRIP_CONFIGS: Record<number, { subject: (name: string) => string; headline: string; body: string; cta: string; ctaPath: string }> = {
  1: {
    subject: (n) => `${n}, your first steps on Masakhe`,
    headline: "Let's get your business set up",
    body: `Your account is ready &mdash; now let's make it work hard for your business. Here are the 3 most important things to do today:
    <br><br>
    <strong style="color:#007749;">1. Complete your business profile</strong> &mdash; Add your logo, address, and business details so your invoices and website look professional.
    <br><br>
    <strong style="color:#007749;">2. Create your first invoice</strong> &mdash; Send professional invoices with our pre-built templates in under 2 minutes.
    <br><br>
    <strong style="color:#007749;">3. Launch your website</strong> &mdash; Choose from 44 industry templates and go live with your business website today.`,
    cta: "Complete My Setup",
    ctaPath: "/dashboard",
  },
  3: {
    subject: (n) => `${n}, have you tried your website builder yet?`,
    headline: "Your professional website is one click away",
    body: `Many Masakhe clients have their business website live within 30 minutes of signing up. Your website builder includes:
    <br><br>
    &#10003;&nbsp; <strong>44 industry-specific templates</strong> &mdash; retail, beauty, construction, food &amp; more<br>
    &#10003;&nbsp; <strong>AI-generated content</strong> &mdash; describe your business and let AI write the copy<br>
    &#10003;&nbsp; <strong>Professional domain linking</strong> &mdash; connect your own .co.za domain<br>
    &#10003;&nbsp; <strong>Lead capture forms</strong> &mdash; collect enquiries directly from your site
    <br><br>
    Clients with a professional website close <strong>3&times; more deals</strong> on average.`,
    cta: "Build My Website",
    ctaPath: "/dashboard/website",
  },
  7: {
    subject: (n) => `One week in, ${n} — here's what's next`,
    headline: "One week with Masakhe — you're on your way!",
    body: `Congratulations on your first week! Businesses that take action in their first week are 5&times; more likely to become long-term, successful clients.
    <br><br>
    Here's what other clients are using this week:
    <br><br>
    <strong style="color:#007749;">Payroll</strong> &mdash; Run payslips for your team in minutes, fully SARS-compliant.<br>
    <strong style="color:#007749;">Social Media Hub</strong> &mdash; Schedule posts for Facebook, Instagram &amp; more from one place.<br>
    <strong style="color:#007749;">Client Management (CRM)</strong> &mdash; Track all your clients, notes, and follow-ups.<br>
    <strong style="color:#007749;">Tender Finder</strong> &mdash; Discover and apply for government tenders relevant to your business.
    <br><br>
    All features are available in your dashboard right now.`,
    cta: "Explore My Dashboard",
    ctaPath: "/dashboard",
  },
  14: {
    subject: (n) => `${n}, how is your business growing?`,
    headline: "Two weeks in — let's accelerate your growth",
    body: `We hope Masakhe is already making a difference for your business. To get even more out of your subscription, here are three power-user tips:
    <br><br>
    <strong style="color:#007749;">Automate your follow-ups</strong> &mdash; Use our Automations feature to automatically send reminders to clients who haven't paid.
    <br><br>
    <strong style="color:#007749;">Track every Rand</strong> &mdash; Log your income and expenses in the Finance section to stay on top of your cash flow and prepare for tax season.
    <br><br>
    <strong style="color:#007749;">Stay B-BBEE compliant</strong> &mdash; Use our Compliance toolkit to manage your B-BBEE status documents and deadlines.
    <br><br>
    If you have any questions or need help with anything, reply to this email &mdash; we're here for you!`,
    cta: "Go to My Dashboard",
    ctaPath: "/dashboard",
  },
  30: {
    subject: (n) => `${n}, 30 days with Masakhe — keep the momentum going!`,
    headline: "30 days in — you're building something great",
    body: `You've been part of the Masakhe community for a month &mdash; that's a big deal! South African SMMEs that use digital tools consistently grow <strong>2.4&times; faster</strong> than those that don't.
    <br><br>
    To keep that momentum going, make sure you have an active subscription that gives you unlimited access to all features:
    <br><br>
    &#10003;&nbsp; Unlimited invoices, quotes &amp; clients<br>
    &#10003;&nbsp; Full payroll management<br>
    &#10003;&nbsp; AI website builder with custom domain<br>
    &#10003;&nbsp; Social media scheduling (all platforms)<br>
    &#10003;&nbsp; Tender finder &amp; compliance tools<br>
    &#10003;&nbsp; Priority support from our SA-based team
    <br><br>
    Plans start at <strong>R599/month</strong> &mdash; less than a tank of petrol.`,
    cta: "View My Subscription",
    ctaPath: "/dashboard/billing",
  },
};

export async function sendDripEmail(
  day: number,
  toEmail: string,
  fullName: string,
  baseUrl?: string
): Promise<void> {
  const t = await getTransporter();
  if (!t) return;
  const config = DRIP_CONFIGS[day];
  if (!config) return;

  const firstName = fullName.split(" ")[0];
  const appUrl = baseUrl || getBaseUrl();
  const subject = config.subject(firstName);

  const body = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:24px;font-weight:800;letter-spacing:-0.5px;">${config.headline}</h2>
    <p style="margin:0 0 24px;color:#6B7280;font-size:14px;">Hi ${firstName},</p>

    <p style="margin:0 0 28px;color:#374151;font-size:15px;line-height:1.7;">${config.body}</p>

    <div style="margin-bottom:28px;">
      ${ctaButton(config.cta, `${appUrl}${config.ctaPath}`)}
    </div>

    <p style="margin:0;color:#374151;font-size:14px;line-height:1.8;">
      Always here to help,<br>
      <strong style="color:#111827;">The Masakhe Team</strong>
    </p>
  `;

  const html = emailShell({
    preheader: subject,
    subtitle: "Masakhe — South Africa's SMME Platform",
    body,
    footerNote: `You received this email because you have a Masakhe account. <a href="${appUrl}/dashboard/settings" style="color:#007749;text-decoration:none;">Manage email preferences</a>`,
  });

  try {
    await t.sendMail({
      from: `"Masakhe" <${process.env.SMTP_FROM || "admin@masakheportal.co.za"}>`,
      to: toEmail,
      subject,
      html,
    });
    console.log(`[Email] Drip day-${day} sent to ${toEmail}`);
  } catch (err: any) {
    console.error(`[Email] FAILED drip day-${day} to ${toEmail}:`, err.message);
  }
}
