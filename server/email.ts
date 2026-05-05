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
    })
  : null;

if (!transporter) {
  console.warn("SMTP_PASSWORD not set — welcome emails disabled");
}

export function getBaseUrl(reqOrigin?: string): string {
  return reqOrigin || process.env.APP_URL || "https://masakheportal.co.za";
}

export async function sendWelcomeEmail(toEmail: string, fullName: string, baseUrl?: string) {
  if (!transporter) return;
  const firstName = fullName.split(" ")[0];
  const appUrl = baseUrl || getBaseUrl();

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
              <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;font-weight:600;">Welcome aboard, ${firstName}!</h2>
              <p style="margin:0 0 20px;color:#4a4a5a;font-size:15px;line-height:1.6;">
                Thank you for joining Masakhe. Your account has been created and you're ready to get started.
              </p>
              <p style="margin:0 0 20px;color:#4a4a5a;font-size:15px;line-height:1.6;">
                With Masakhe, you can:
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                    <span style="color:#007749;font-weight:bold;margin-right:8px;">&#10003;</span>
                    <span style="color:#4a4a5a;font-size:14px;">Register & manage your business</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                    <span style="color:#007749;font-weight:bold;margin-right:8px;">&#10003;</span>
                    <span style="color:#4a4a5a;font-size:14px;">Build a professional website</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                    <span style="color:#007749;font-weight:bold;margin-right:8px;">&#10003;</span>
                    <span style="color:#4a4a5a;font-size:14px;">Track finances & create invoices</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                    <span style="color:#007749;font-weight:bold;margin-right:8px;">&#10003;</span>
                    <span style="color:#4a4a5a;font-size:14px;">Stay tax compliant</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                    <span style="color:#007749;font-weight:bold;margin-right:8px;">&#10003;</span>
                    <span style="color:#4a4a5a;font-size:14px;">Manage social media</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <span style="color:#007749;font-weight:bold;margin-right:8px;">&#10003;</span>
                    <span style="color:#4a4a5a;font-size:14px;">Find & apply for tenders</span>
                  </td>
                </tr>
              </table>

              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 24px;">
                <tr>
                  <td style="background-color:#007749;border-radius:8px;">
                    <a href="${appUrl}/dashboard" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">Go to Dashboard</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;color:#4a4a5a;font-size:15px;line-height:1.6;">
                Subscribe from your Billing page to unlock all Masakhe features and grow your business.
              </p>
              <p style="margin:24px 0 0;color:#4a4a5a;font-size:15px;line-height:1.6;">
                Welcome to the Masakhe community!<br>
                <strong style="color:#1a1a2e;">The Masakhe Team</strong>
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color:#f8f8fa;padding:24px 40px;text-align:center;border-top:1px solid #e8e8ec;">
              <p style="margin:0;color:#9a9aaa;font-size:12px;line-height:1.5;">
                &copy; ${new Date().getFullYear()} Masakhe. A digital platform for South African SMMEs.<br>
                You received this email because you registered at Masakhe.
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
      subject: `Welcome to Masakhe, ${firstName}!`,
      html,
    });
    console.log(`Welcome email sent to ${toEmail}`);
  } catch (err: any) {
    console.error(`Failed to send welcome email to ${toEmail}:`, err.message);
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
