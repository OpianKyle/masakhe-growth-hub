import nodemailer from "nodemailer";

const smtpPort = parseInt(process.env.SMTP_PORT || "465");

const transporter = process.env.SMTP_PASSWORD
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.masakheportal.co.za",
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: process.env.SMTP_USER || "admin@masakheportal.co.za",
        pass: process.env.SMTP_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    })
  : null;

if (!transporter) {
  console.warn("[Email] SMTP_PASSWORD not set — emails disabled");
} else {
  console.log(`[Email] SMTP transporter ready → ${process.env.SMTP_HOST || "smtp.masakheportal.co.za"}:${smtpPort}`);
}

export function getSharedTransporter() {
  return transporter;
}

export function getBaseUrl(reqOrigin?: string): string {
  return reqOrigin || process.env.APP_URL || "https://masakheportal.co.za";
}

export async function sendWelcomeEmail(toEmail: string, fullName: string, baseUrl?: string) {
  if (!transporter) return;
  const firstName = fullName.split(" ")[0];

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <tr>
            <td style="background:linear-gradient(135deg,#007749 0%,#005C3A 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Masakhe Portal</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Digital Platform for South African SMMEs</p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 20px;color:#4a4a5a;font-size:15px;line-height:1.6;">Dear ${firstName},</p>

              <p style="margin:0 0 20px;color:#4a4a5a;font-size:15px;line-height:1.6;">
                <strong style="color:#1a1a2e;">Welcome to Masakhe Portal!!</strong>
              </p>

              <p style="margin:0 0 20px;color:#4a4a5a;font-size:15px;line-height:1.6;">
                It's great news that you joined our platform! — I noticed you have been a while on our system. I would like to connect with you on a call to determine your progress and how we can further assist in making it better for you.
              </p>

              <p style="margin:0 0 24px;color:#4a4a5a;font-size:15px;line-height:1.6;">
                Please select the link below to schedule a personal onboarding call with myself, Lance Heynes, CEO of Masakhe Technologies:
              </p>

              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 32px;">
                <tr>
                  <td style="background-color:#007749;border-radius:8px;">
                    <a href="https://calendly.com/masakhesystems" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">Schedule My Onboarding Call</a>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f9fafb;border-radius:8px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 10px;color:#4a4a5a;font-size:14px;line-height:1.8;">
                      📍 <strong>Format:</strong> Google Meet (link sent upon confirmation)
                    </p>
                    <p style="margin:0 0 10px;color:#4a4a5a;font-size:14px;line-height:1.8;">
                      🕐 <strong>Duration:</strong> 30 minutes
                    </p>
                    <p style="margin:0;color:#4a4a5a;font-size:14px;line-height:1.8;">
                      👤 <strong>With:</strong> Lance Heynes, CEO of Masakhe Technologies
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;color:#4a4a5a;font-size:15px;line-height:1.6;">
                Looking forward to meeting you!
              </p>

              <p style="margin:0;color:#4a4a5a;font-size:15px;line-height:1.8;">
                With Regards,<br><br>
                <strong style="color:#1a1a2e;">Lance Heynes</strong><br>
                <span style="color:#6b7280;font-size:13px;">CEO, Masakhe Technologies</span>
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color:#f8f8fa;padding:24px 40px;text-align:center;border-top:1px solid #e8e8ec;">
              <p style="margin:0;color:#9a9aaa;font-size:12px;line-height:1.5;">
                &copy; ${new Date().getFullYear()} Masakhe Technologies. A digital platform for South African SMMEs.<br>
                You received this email because you registered at Masakhe Portal.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const info = await transporter.sendMail({
      from: `"Lance Heynes - Masakhe" <${process.env.SMTP_FROM || "admin@masakheportal.co.za"}>`,
      replyTo: process.env.SMTP_FROM || "admin@masakheportal.co.za",
      to: toEmail,
      subject: `Welcome to Masakhe Portal`,
      html,
      headers: {
        "X-Priority": "3",
        "X-Mailer": "Masakhe Platform",
        "Precedence": "bulk",
      },
    });
    console.log(`[Email] Welcome sent to ${toEmail} — messageId: ${info.messageId}`);
  } catch (err: any) {
    console.error(`[Email] FAILED welcome to ${toEmail}:`, err.message, err.responseCode ?? "");
  }
}

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
  if (!transporter) return;
  const firstName = clientName.split(" ")[0];
  const appUrl = baseUrl || getBaseUrl();
  const amount = `R${(amountCents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <tr>
            <td style="background:linear-gradient(135deg,#007749 0%,#005C3A 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Masakhe</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Subscription Invoice</p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;font-weight:600;">Invoice #${invoiceNumber}</h2>
              <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Hi ${firstName}, please find your subscription invoice below.</p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
                <tr style="background-color:#f9fafb;">
                  <td style="padding:12px 16px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Description</td>
                  <td style="padding:12px 16px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;border-bottom:1px solid #e5e7eb;text-align:right;">Amount</td>
                </tr>
                <tr>
                  <td style="padding:16px;color:#1a1a2e;font-size:15px;">
                    <strong>${planName} Subscription</strong><br>
                    <span style="color:#6b7280;font-size:13px;">${description}</span>
                  </td>
                  <td style="padding:16px;color:#1a1a2e;font-size:15px;font-weight:700;text-align:right;">${amount}</td>
                </tr>
                <tr style="background-color:#f9fafb;border-top:2px solid #e5e7eb;">
                  <td style="padding:12px 16px;font-size:14px;font-weight:700;color:#1a1a2e;">Total Due</td>
                  <td style="padding:12px 16px;font-size:16px;font-weight:700;color:#007749;text-align:right;">${amount}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:4px 0;"><span style="color:#6b7280;font-size:13px;">Due Date:</span> <strong style="color:#1a1a2e;font-size:13px;">${dueDate}</strong></td>
                </tr>
              </table>

              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.6;">
                If you have any questions about this invoice, please contact us at admin@masakheportal.co.za.
              </p>
              <p style="margin:16px 0 0;color:#4a4a5a;font-size:14px;">
                Thank you for your business!<br>
                <strong style="color:#1a1a2e;">The Masakhe Team</strong>
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color:#f8f8fa;padding:24px 40px;text-align:center;border-top:1px solid #e8e8ec;">
              <p style="margin:0;color:#9a9aaa;font-size:12px;line-height:1.5;">
                &copy; ${new Date().getFullYear()} Masakhe. A digital platform for South African SMMEs.<br>
                You received this email because you are a Masakhe subscriber.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"Masakhe" <${process.env.SMTP_FROM || "admin@masakheportal.co.za"}>`,
      to: toEmail,
      subject: `Invoice #${invoiceNumber} — ${planName} Subscription`,
      html,
    });
    console.log(`Subscription invoice email sent to ${toEmail}`);
  } catch (err: any) {
    console.error(`Failed to send invoice email to ${toEmail}:`, err.message);
  }
}

export async function sendPaymentReminderEmail(
  toEmail: string,
  clientName: string,
  planName: string,
  amountCents: number,
  dueDate: string,
  baseUrl?: string
) {
  if (!transporter) return;
  const firstName = clientName.split(" ")[0];
  const appUrl = baseUrl || getBaseUrl();
  const amount = `R${(amountCents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <tr>
            <td style="background:linear-gradient(135deg,#d97706 0%,#b45309 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Masakhe</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">Subscription Renewal Reminder</p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;font-weight:600;">Your subscription renews soon, ${firstName}</h2>
              <p style="margin:0 0 20px;color:#4a4a5a;font-size:15px;line-height:1.6;">
                This is a friendly reminder that your <strong>${planName}</strong> subscription payment of <strong>${amount}</strong> is due on <strong>${dueDate}</strong>.
              </p>
              <p style="margin:0 0 24px;color:#4a4a5a;font-size:15px;line-height:1.6;">
                You can pay early or update your payment details from your billing page.
              </p>

              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background-color:#d97706;border-radius:8px;">
                    <a href="${appUrl}/dashboard/billing" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">Pay Now — ${amount}</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
                If payment is not received within 3 days of the due date, access to your dashboard will be temporarily suspended until payment is made.
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color:#f8f8fa;padding:24px 40px;text-align:center;border-top:1px solid #e8e8ec;">
              <p style="margin:0;color:#9a9aaa;font-size:12px;line-height:1.5;">
                &copy; ${new Date().getFullYear()} Masakhe. A digital platform for South African SMMEs.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"Masakhe" <${process.env.SMTP_FROM || "admin@masakheportal.co.za"}>`,
      to: toEmail,
      subject: `Subscription Renewal Due — ${dueDate}`,
      html,
    });
  } catch (err: any) {
    console.error(`Failed to send payment reminder to ${toEmail}:`, err.message);
  }
}

export async function sendTeamInviteEmail(
  toEmail: string,
  inviteeName: string,
  ownerName: string,
  businessName: string,
  setupToken: string,
  baseUrl?: string
) {
  if (!transporter) return;
  const firstName = (inviteeName || toEmail).split(" ")[0];
  const appUrl = baseUrl || getBaseUrl();
  const setupUrl = `${appUrl}/set-password?token=${setupToken}`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#007749 0%,#005C3A 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Masakhe</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">You've been invited to join a team</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;font-weight:600;">Hi ${firstName},</h2>
              <p style="margin:0 0 20px;color:#4a4a5a;font-size:15px;line-height:1.6;">
                <strong>${ownerName}</strong> has added you as a team member of <strong>${businessName}</strong> on Masakhe.
              </p>
              <p style="margin:0 0 24px;color:#4a4a5a;font-size:15px;line-height:1.6;">
                Click below to set your password and access the dashboard.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 24px;">
                <tr>
                  <td style="background-color:#007749;border-radius:8px;">
                    <a href="${setupUrl}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">Set my password</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 12px;color:#4a4a5a;font-size:14px;line-height:1.6;">
                This link will expire in <strong>7 days</strong>. If you weren't expecting this invitation, you can ignore this email.
              </p>
              <p style="margin:0;color:#9a9aaa;font-size:12px;line-height:1.6;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <span style="color:#007749;word-break:break-all;">${setupUrl}</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8f8fa;padding:24px 40px;text-align:center;border-top:1px solid #e8e8ec;">
              <p style="margin:0;color:#9a9aaa;font-size:12px;line-height:1.5;">
                &copy; ${new Date().getFullYear()} Masakhe. A digital platform for South African SMMEs.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"Masakhe" <${process.env.SMTP_FROM || "admin@masakheportal.co.za"}>`,
      to: toEmail,
      subject: `${ownerName} invited you to ${businessName} on Masakhe`,
      html,
    });
    console.log(`Team invite email sent to ${toEmail}`);
  } catch (err: any) {
    console.error(`Failed to send team invite email to ${toEmail}:`, err.message);
  }
}

export async function sendFranchiseClientInviteEmail(
  toEmail: string,
  inviteeName: string,
  franchiseName: string,
  ownerName: string,
  setupToken: string,
  baseUrl?: string
) {
  if (!transporter) return false;
  const firstName = (inviteeName || toEmail).split(" ")[0];
  const appUrl = baseUrl || getBaseUrl();
  const setupUrl = `${appUrl}/set-password?token=${setupToken}`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5 0%,#3730a3 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Masakhe</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">You've been invited to get started</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;font-weight:600;">Hi ${firstName},</h2>
              <p style="margin:0 0 20px;color:#4a4a5a;font-size:15px;line-height:1.6;">
                <strong>${ownerName}</strong> from <strong>${franchiseName}</strong> has invited you to start using the Masakhe SMME platform.
              </p>
              <p style="margin:0 0 24px;color:#4a4a5a;font-size:15px;line-height:1.6;">
                An account has been created for you. Click the button below to set your password and access your dashboard.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 24px;">
                <tr>
                  <td style="background-color:#4f46e5;border-radius:8px;">
                    <a href="${setupUrl}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">Set my password &amp; get started</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 12px;color:#4a4a5a;font-size:14px;line-height:1.6;">
                This link will expire in <strong>7 days</strong>. If you weren't expecting this invitation, you can ignore this email.
              </p>
              <p style="margin:0;color:#9a9aaa;font-size:12px;line-height:1.6;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <span style="color:#4f46e5;word-break:break-all;">${setupUrl}</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8f8fa;padding:24px 40px;text-align:center;border-top:1px solid #e8e8ec;">
              <p style="margin:0;color:#9a9aaa;font-size:12px;line-height:1.5;">
                &copy; ${new Date().getFullYear()} Masakhe. A digital platform for South African SMMEs.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"Masakhe" <${process.env.SMTP_FROM || "admin@masakheportal.co.za"}>`,
      to: toEmail,
      subject: `${ownerName} invited you to Masakhe`,
      html,
    });
    console.log(`Franchise client invite email sent to ${toEmail}`);
    return true;
  } catch (err: any) {
    console.error(`Failed to send franchise client invite email to ${toEmail}:`, err.message);
    return false;
  }
}

export async function sendFranchiseOwnerInviteEmail(
  toEmail: string,
  inviteeName: string,
  franchiseName: string,
  franchiseCode: string,
  setupToken: string,
  baseUrl?: string
) {
  if (!transporter) return false;
  const firstName = (inviteeName || toEmail).split(" ")[0];
  const appUrl = baseUrl || getBaseUrl();
  const setupUrl = `${appUrl}/set-password?token=${setupToken}`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Masakhe</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">You've been appointed as a Franchise Owner</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;font-weight:600;">Welcome, ${firstName}!</h2>
              <p style="margin:0 0 20px;color:#4a4a5a;font-size:15px;line-height:1.6;">
                The Masakhe admin team has appointed you as the franchise owner of <strong>${franchiseName}</strong> (Code: <strong style="font-family:monospace;">${franchiseCode}</strong>).
              </p>
              <p style="margin:0 0 12px;color:#4a4a5a;font-size:15px;line-height:1.6;">As a franchise owner you will be able to:</p>
              <ul style="margin:0 0 24px;padding-left:20px;color:#4a4a5a;font-size:15px;line-height:1.8;">
                <li>Manage your assigned client accounts</li>
                <li>Grant and revoke subscriptions for your clients</li>
                <li>Impersonate clients to assist them directly</li>
                <li>View your franchise dashboard and reporting</li>
              </ul>
              <p style="margin:0 0 24px;color:#4a4a5a;font-size:15px;line-height:1.6;">
                Click below to set your password and access your franchise portal.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 24px;">
                <tr>
                  <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);border-radius:8px;">
                    <a href="${setupUrl}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">Set my password &amp; get started</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 12px;color:#4a4a5a;font-size:14px;line-height:1.6;">
                This link will expire in <strong>7 days</strong>. If you weren't expecting this, you can safely ignore this email.
              </p>
              <p style="margin:0;color:#9a9aaa;font-size:12px;line-height:1.6;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <span style="color:#4f46e5;word-break:break-all;">${setupUrl}</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8f8fa;padding:24px 40px;text-align:center;border-top:1px solid #e8e8ec;">
              <p style="margin:0;color:#9a9aaa;font-size:12px;line-height:1.5;">
                &copy; ${new Date().getFullYear()} Masakhe. A digital platform for South African SMMEs.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"Masakhe" <${process.env.SMTP_FROM || "admin@masakheportal.co.za"}>`,
      to: toEmail,
      subject: `You've been appointed as a Franchise Owner on Masakhe`,
      html,
    });
    console.log(`Franchise owner invite email sent to ${toEmail}`);
    return true;
  } catch (err: any) {
    console.error(`Failed to send franchise owner invite email to ${toEmail}:`, err.message);
    return false;
  }
}

export async function sendFranchiseApplicationEmail(opts: {
  applicantName: string;
  applicantEmail: string;
  businessName: string;
  phone: string;
  message: string;
}) {
  if (!transporter) {
    console.warn("SMTP not configured — franchise application email skipped");
    return false;
  }
  const { applicantName, applicantEmail, businessName, phone, message } = opts;
  const submittedAt = new Date().toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg", dateStyle: "long", timeStyle: "short" });

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5 0%,#3730a3 100%);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">Masakhe</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">New Franchise Application</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 20px;color:#1a1a2e;font-size:22px;">New Franchise Application</h2>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
              <tr style="background:#f9fafb;">
                <td colspan="2" style="padding:10px 16px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Applicant Details</td>
              </tr>
              <tr style="border-bottom:1px solid #f3f4f6;">
                <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#6b7280;width:160px;">Name</td>
                <td style="padding:12px 16px;font-size:14px;color:#1a1a2e;">${applicantName}</td>
              </tr>
              <tr style="border-bottom:1px solid #f3f4f6;">
                <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#6b7280;">Email</td>
                <td style="padding:12px 16px;font-size:14px;color:#1a1a2e;"><a href="mailto:${applicantEmail}" style="color:#4f46e5;">${applicantEmail}</a></td>
              </tr>
              <tr style="border-bottom:1px solid #f3f4f6;">
                <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#6b7280;">Business</td>
                <td style="padding:12px 16px;font-size:14px;color:#1a1a2e;">${businessName || "Not provided"}</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#6b7280;">Phone</td>
                <td style="padding:12px 16px;font-size:14px;color:#1a1a2e;">${phone || "Not provided"}</td>
              </tr>
            </table>
            ${message ? `
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:24px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;">Message</p>
              <p style="margin:0;font-size:14px;color:#1a1a2e;line-height:1.6;">${message.replace(/\n/g, "<br>")}</p>
            </div>` : ""}
            <p style="margin:0 0 16px;color:#6b7280;font-size:13px;">Submitted: ${submittedAt}</p>
            <p style="margin:0;color:#4a4a5a;font-size:14px;line-height:1.6;">
              Reply directly to this email or use the applicant's contact details above to follow up.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background-color:#f8f8fa;padding:24px 40px;text-align:center;border-top:1px solid #e8e8ec;">
            <p style="margin:0;color:#9a9aaa;font-size:12px;">&copy; ${new Date().getFullYear()} Masakhe. A digital platform for South African SMMEs.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"Masakhe Platform" <${process.env.SMTP_FROM || "admin@masakheportal.co.za"}>`,
      to: "admin@masakhegroup.co.za",
      replyTo: applicantEmail,
      subject: `Franchise Application — ${applicantName} (${businessName || applicantEmail})`,
      html,
    });
    return true;
  } catch (err: any) {
    console.error("Failed to send franchise application email:", err.message);
    return false;
  }
}

export async function sendPasswordResetEmail(toEmail: string, fullName: string, resetToken: string, baseUrl?: string) {
  if (!transporter) return;
  const firstName = fullName.split(" ")[0];
  const appUrl = baseUrl || getBaseUrl();
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <tr>
            <td style="background:linear-gradient(135deg,#007749 0%,#005C3A 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Masakhe</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Digital Platform for South African SMMEs</p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;font-weight:600;">Password Reset Request</h2>
              <p style="margin:0 0 20px;color:#4a4a5a;font-size:15px;line-height:1.6;">
                Hi ${firstName}, we received a request to reset your password. Click the button below to create a new password.
              </p>

              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 24px;">
                <tr>
                  <td style="background-color:#007749;border-radius:8px;">
                    <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">Reset My Password</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 12px;color:#4a4a5a;font-size:14px;line-height:1.6;">
                This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.
              </p>
              <p style="margin:0 0 0;color:#9a9aaa;font-size:12px;line-height:1.6;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <span style="color:#007749;word-break:break-all;">${resetUrl}</span>
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color:#f8f8fa;padding:24px 40px;text-align:center;border-top:1px solid #e8e8ec;">
              <p style="margin:0;color:#9a9aaa;font-size:12px;line-height:1.5;">
                &copy; ${new Date().getFullYear()} Masakhe. A digital platform for South African SMMEs.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"Masakhe" <${process.env.SMTP_FROM || "admin@masakheportal.co.za"}>`,
      to: toEmail,
      subject: "Reset your Masakhe password",
      html,
    });
    console.log(`Password reset email sent to ${toEmail}`);
  } catch (err: any) {
    console.error(`Failed to send password reset email to ${toEmail}:`, err.message);
  }
}

/* ────────────────────────────────────────────────────────────────────────────
   ADMIN SIGNUP NOTIFICATION
   ──────────────────────────────────────────────────────────────────────────── */
export async function sendAdminSignupNotification(
  clientEmail: string,
  clientName: string,
  clientPhone: string | null,
  baseUrl?: string
): Promise<void> {
  if (!transporter) return;
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || "admin@masakhegroup.co.za";
  const adminRecipients = [adminEmail, "lance.heynes@gmail.com"].join(", ");
  const appUrl = baseUrl || getBaseUrl();
  const signupTime = new Date().toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" });

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <tr>
          <td style="background:linear-gradient(135deg,#1e3a5f 0%,#0f2040 100%);padding:24px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">🎉 New Signup Alert</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Masakhe Platform — Action Required</p>
          </td>
        </tr>

        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 24px;color:#4a4a5a;font-size:15px;line-height:1.6;">
              A new client has just signed up on Masakhe. Please reach out <strong>within the hour</strong> to schedule their onboarding call.
            </p>

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8faff;border:1px solid #dce4f5;border-radius:10px;margin-bottom:24px;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 10px;"><span style="color:#6b7280;font-size:13px;display:inline-block;width:90px;">Name:</span><strong style="color:#1a1a2e;font-size:14px;">${clientName}</strong></p>
                  <p style="margin:0 0 10px;"><span style="color:#6b7280;font-size:13px;display:inline-block;width:90px;">Email:</span><a href="mailto:${clientEmail}" style="color:#007749;font-size:14px;font-weight:600;">${clientEmail}</a></p>
                  <p style="margin:0 0 10px;"><span style="color:#6b7280;font-size:13px;display:inline-block;width:90px;">Cell:</span><strong style="color:#1a1a2e;font-size:14px;">${clientPhone || "Not provided"}</strong></p>
                  <p style="margin:0;"><span style="color:#6b7280;font-size:13px;display:inline-block;width:90px;">Signed up:</span><span style="color:#4a4a5a;font-size:14px;">${signupTime} (SAST)</span></p>
                </td>
              </tr>
            </table>

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:16px;">
              <tr>
                <td style="padding-right:8px;" width="50%">
                  <a href="tel:${clientPhone || ''}" style="display:block;text-align:center;background:#007749;color:#fff;text-decoration:none;padding:12px 16px;border-radius:8px;font-size:14px;font-weight:600;">📞 Call Now</a>
                </td>
                <td style="padding-left:8px;" width="50%">
                  <a href="${appUrl}/admin/users" style="display:block;text-align:center;background:#1e3a5f;color:#fff;text-decoration:none;padding:12px 16px;border-radius:8px;font-size:14px;font-weight:600;">View in Admin Panel</a>
                </td>
              </tr>
            </table>

            <p style="margin:16px 0 0;color:#9a9aaa;font-size:12px;line-height:1.5;">
              This is an automated notification from the Masakhe platform. The client has also received a welcome email letting them know your team will be in touch.
            </p>
          </td>
        </tr>

        <tr>
          <td style="background-color:#f8f8fa;padding:20px 40px;text-align:center;border-top:1px solid #e8e8ec;">
            <p style="margin:0;color:#9a9aaa;font-size:12px;">&copy; ${new Date().getFullYear()} Masakhe — Internal Notification</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"Masakhe System" <${process.env.SMTP_FROM || "admin@masakheportal.co.za"}>`,
      to: adminRecipients,
      subject: `🎉 New Signup: ${clientName} — Call to onboard`,
      html,
    });
    console.log(`Admin signup notification sent for ${clientEmail}`);
  } catch (err: any) {
    console.error(`Failed to send admin signup notification:`, err.message);
  }
}

/* ────────────────────────────────────────────────────────────────────────────
   EMAIL VERIFICATION
   ──────────────────────────────────────────────────────────────────────────── */
export async function sendEmailVerificationEmail(
  toEmail: string,
  fullName: string,
  verifyUrl: string
): Promise<void> {
  if (!transporter) return;
  const firstName = fullName.split(" ")[0];

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <tr>
          <td style="background:linear-gradient(135deg,#007749 0%,#005C3A 100%);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Masakhe</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Please verify your email address</p>
          </td>
        </tr>

        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;font-weight:600;">Hi ${firstName}, one quick step!</h2>
            <p style="margin:0 0 24px;color:#4a4a5a;font-size:15px;line-height:1.6;">
              Please verify your email address to confirm your account and unlock all features of your Masakhe platform.
            </p>

            <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 28px;">
              <tr>
                <td style="background-color:#007749;border-radius:8px;">
                  <a href="${verifyUrl}" style="display:inline-block;padding:15px 36px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;">Verify My Email Address</a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.6;">
              This link expires in <strong>24 hours</strong>. If you didn't create a Masakhe account, you can safely ignore this email.
            </p>
            <p style="margin:0;color:#9a9aaa;font-size:12px;line-height:1.6;word-break:break-all;">
              Or copy this link: <span style="color:#007749;">${verifyUrl}</span>
            </p>
          </td>
        </tr>

        <tr>
          <td style="background-color:#f8f8fa;padding:24px 40px;text-align:center;border-top:1px solid #e8e8ec;">
            <p style="margin:0;color:#9a9aaa;font-size:12px;">&copy; ${new Date().getFullYear()} Masakhe. A digital platform for South African SMMEs.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const info = await transporter.sendMail({
      from: `"Masakhe" <${process.env.SMTP_FROM || "admin@masakheportal.co.za"}>`,
      replyTo: process.env.SMTP_FROM || "admin@masakheportal.co.za",
      to: toEmail,
      subject: `Please verify your Masakhe email address`,
      html,
      headers: {
        "X-Priority": "1",
        "X-Mailer": "Masakhe Platform",
      },
    });
    console.log(`[Email] Verification sent to ${toEmail} — messageId: ${info.messageId}`);
  } catch (err: any) {
    console.error(`[Email] FAILED verification to ${toEmail}:`, err.message, err.responseCode ?? "");
  }
}

/* ────────────────────────────────────────────────────────────────────────────
   ONBOARDING CALL SCHEDULED — sent to client immediately after signup
   ──────────────────────────────────────────────────────────────────────────── */
export async function sendOnboardingCallEmail(
  toEmail: string,
  fullName: string,
  baseUrl?: string,
): Promise<void> {
  if (!transporter) return;
  const firstName = fullName.split(" ")[0];
  const appUrl = baseUrl || getBaseUrl();

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <tr>
          <td style="background:linear-gradient(135deg,#007749 0%,#005C3A 100%);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Masakhe</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Your personal onboarding call</p>
          </td>
        </tr>

        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;font-weight:600;">We're reaching out to you, ${firstName}!</h2>
            <p style="margin:0 0 20px;color:#4a4a5a;font-size:15px;line-height:1.6;">
              Welcome to Masakhe! Our team will be calling you <strong>within the next few hours</strong> to schedule your free, personalised onboarding session.
            </p>

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0faf5;border:1px solid #bbf0d8;border-radius:10px;margin:0 0 24px;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 10px;color:#1a1a2e;font-size:14px;font-weight:700;">What your onboarding call covers:</p>
                  <p style="margin:0 0 8px;color:#374151;font-size:14px;">&#10003; &nbsp;Personalised platform walkthrough</p>
                  <p style="margin:0 0 8px;color:#374151;font-size:14px;">&#10003; &nbsp;Setting up your business profile & website</p>
                  <p style="margin:0 0 8px;color:#374151;font-size:14px;">&#10003; &nbsp;Invoicing and payroll configuration</p>
                  <p style="margin:0;color:#374151;font-size:14px;">&#10003; &nbsp;Answers to all your questions</p>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 20px;color:#4a4a5a;font-size:15px;line-height:1.6;">
              In the meantime, feel free to explore your dashboard and start setting up your business.
            </p>

            <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
              <tr>
                <td style="background-color:#007749;border-radius:8px;">
                  <a href="${appUrl}/dashboard" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">Explore My Dashboard</a>
                </td>
              </tr>
            </table>

            <p style="margin:0;color:#4a4a5a;font-size:14px;line-height:1.6;">
              Looking forward to speaking with you!<br>
              <strong style="color:#1a1a2e;">The Masakhe Onboarding Team</strong>
            </p>
          </td>
        </tr>

        <tr>
          <td style="background-color:#f8f8fa;padding:24px 40px;text-align:center;border-top:1px solid #e8e8ec;">
            <p style="margin:0;color:#9a9aaa;font-size:12px;">&copy; ${new Date().getFullYear()} Masakhe. A digital platform for South African SMMEs.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const info = await transporter.sendMail({
      from: `"Masakhe Team" <${process.env.SMTP_FROM || "admin@masakheportal.co.za"}>`,
      replyTo: process.env.SMTP_FROM || "admin@masakheportal.co.za",
      to: toEmail,
      subject: `Your Masakhe onboarding — next steps`,
      html,
      headers: {
        "X-Priority": "3",
        "X-Mailer": "Masakhe Platform",
        "Precedence": "bulk",
      },
    });
    console.log(`[Email] Onboarding sent to ${toEmail} — messageId: ${info.messageId}`);
  } catch (err: any) {
    console.error(`[Email] FAILED onboarding to ${toEmail}:`, err.message, err.responseCode ?? "");
  }
}

/* ────────────────────────────────────────────────────────────────────────────
   DRIP EMAIL CAMPAIGN
   Days: 1, 3, 7, 14, 30
   ──────────────────────────────────────────────────────────────────────────── */

const DRIP_CONFIGS: Record<number, { subject: (name: string) => string; headline: string; body: string; cta: string; ctaPath: string }> = {
  1: {
    subject: (n) => `${n}, your first steps on Masakhe`,
    headline: "Let's get your business set up",
    body: `Your account is ready — now let's make it work hard for your business. Here are the 3 most important things to do today:
    <br><br>
    <strong style="color:#007749;">1. Complete your business profile</strong> — Add your logo, address, and business details so your invoices and website look professional.
    <br><br>
    <strong style="color:#007749;">2. Create your first invoice</strong> — Send professional invoices with our pre-built templates in under 2 minutes.
    <br><br>
    <strong style="color:#007749;">3. Launch your website</strong> — Choose from 44 industry templates and go live with your business website today.`,
    cta: "Complete My Setup",
    ctaPath: "/dashboard",
  },
  3: {
    subject: (n) => `${n}, have you tried your website builder yet?`,
    headline: "Your professional website is one click away",
    body: `Many Masakhe clients have their business website live within 30 minutes of signing up. Your website builder includes:
    <br><br>
    &#10003; &nbsp;<strong>44 industry-specific templates</strong> — retail, beauty, construction, food & more<br>
    &#10003; &nbsp;<strong>AI-generated content</strong> — describe your business and let AI write the copy<br>
    &#10003; &nbsp;<strong>Professional domain linking</strong> — connect your own .co.za domain<br>
    &#10003; &nbsp;<strong>Lead capture forms</strong> — collect enquiries directly from your site
    <br><br>
    Clients with a professional website close <strong>3× more deals</strong> on average.`,
    cta: "Build My Website",
    ctaPath: "/dashboard/website",
  },
  7: {
    subject: (n) => `One week in, ${n} — here's what's next`,
    headline: "One week with Masakhe — you're on your way!",
    body: `Congratulations on your first week! Businesses that take action in their first week are 5× more likely to become long-term, successful clients.
    <br><br>
    Here's what other clients are using this week:
    <br><br>
    <strong style="color:#007749;">Payroll</strong> — Run payslips for your team in minutes, fully SARS-compliant.<br>
    <strong style="color:#007749;">Social Media Hub</strong> — Schedule posts for Facebook, Instagram & more from one place.<br>
    <strong style="color:#007749;">Client Management (CRM)</strong> — Track all your clients, notes, and follow-ups.<br>
    <strong style="color:#007749;">Tender Finder</strong> — Discover and apply for government tenders relevant to your business.
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
    <strong style="color:#007749;">Automate your follow-ups</strong> — Use our Automations feature to automatically send reminders to clients who haven't paid.
    <br><br>
    <strong style="color:#007749;">Track every Rand</strong> — Log your income and expenses in the Finance section to stay on top of your cash flow and prepare for tax season.
    <br><br>
    <strong style="color:#007749;">Stay B-BBEE compliant</strong> — Use our Compliance toolkit to manage your B-BBEE status documents and deadlines.
    <br><br>
    If you have any questions or need help with anything, reply to this email — we're here for you!`,
    cta: "Go to My Dashboard",
    ctaPath: "/dashboard",
  },
  30: {
    subject: (n) => `${n}, 30 days with Masakhe — keep the momentum going!`,
    headline: "30 days in — you're building something great",
    body: `You've been part of the Masakhe community for a month — that's a big deal! South African SMMEs that use digital tools consistently grow <strong>2.4× faster</strong> than those that don't.
    <br><br>
    To keep that momentum going, make sure you have an active subscription that gives you unlimited access to all features:
    <br><br>
    &#10003; &nbsp;Unlimited invoices, quotes & clients<br>
    &#10003; &nbsp;Full payroll management<br>
    &#10003; &nbsp;AI website builder with custom domain<br>
    &#10003; &nbsp;Social media scheduling (all platforms)<br>
    &#10003; &nbsp;Tender finder & compliance tools<br>
    &#10003; &nbsp;Priority support from our SA-based team
    <br><br>
    Plans start at <strong>R599/month</strong> — less than a tank of petrol.`,
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
  if (!transporter) return;
  const config = DRIP_CONFIGS[day];
  if (!config) return;

  const firstName = fullName.split(" ")[0];
  const appUrl = baseUrl || getBaseUrl();
  const subject = config.subject(firstName);

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <tr>
          <td style="background:linear-gradient(135deg,#007749 0%,#005C3A 100%);padding:28px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">Masakhe</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Digital Platform for South African SMMEs</p>
          </td>
        </tr>

        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 20px;color:#1a1a2e;font-size:22px;font-weight:600;">${config.headline}</h2>
            <p style="margin:0 0 28px;color:#4a4a5a;font-size:15px;line-height:1.7;">${config.body}</p>

            <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 28px;">
              <tr>
                <td style="background-color:#007749;border-radius:8px;">
                  <a href="${appUrl}${config.ctaPath}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">${config.cta}</a>
                </td>
              </tr>
            </table>

            <p style="margin:0;color:#4a4a5a;font-size:14px;line-height:1.6;">
              Always here to help,<br>
              <strong style="color:#1a1a2e;">The Masakhe Team</strong>
            </p>
          </td>
        </tr>

        <tr>
          <td style="background-color:#f8f8fa;padding:20px 40px;text-align:center;border-top:1px solid #e8e8ec;">
            <p style="margin:0;color:#9a9aaa;font-size:12px;line-height:1.5;">
              &copy; ${new Date().getFullYear()} Masakhe. A digital platform for South African SMMEs.<br>
              You received this email because you have a Masakhe account. <a href="${appUrl}/dashboard/settings" style="color:#9a9aaa;">Manage email preferences</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"Masakhe" <${process.env.SMTP_FROM || "admin@masakheportal.co.za"}>`,
      to: toEmail,
      subject,
      html,
    });
    console.log(`Drip day-${day} email sent to ${toEmail}`);
  } catch (err: any) {
    console.error(`Failed to send drip day-${day} email to ${toEmail}:`, err.message);
  }
}
