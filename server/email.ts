import nodemailer from "nodemailer";

const smtpPort = parseInt(process.env.SMTP_PORT || "465");

const transporter = process.env.SMTP_PASSWORD
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.masakhegroup.co.za",
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: process.env.SMTP_USER || "admin@masakhegroup.co.za",
        pass: process.env.SMTP_PASSWORD,
      },
    })
  : null;

if (!transporter) {
  console.warn("SMTP_PASSWORD not set — welcome emails disabled");
}

export function getBaseUrl(reqOrigin?: string): string {
  return reqOrigin || process.env.APP_URL || "https://masakhegroup.co.za";
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
                Thank you for joining Masakhe. Your account has been created and your <strong>14-day free trial</strong> has started automatically.
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
                Your trial gives you full access to all features for 14 days. Subscribe anytime from your Billing page to continue after the trial ends.
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
      from: `"Masakhe" <${process.env.SMTP_FROM || "admin@masakhegroup.co.za"}>`,
      to: toEmail,
      subject: `Welcome to Masakhe, ${firstName}!`,
      html,
    });
    console.log(`Welcome email sent to ${toEmail}`);
  } catch (err: any) {
    console.error(`Failed to send welcome email to ${toEmail}:`, err.message);
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
      from: `"Masakhe" <${process.env.SMTP_FROM || "admin@masakhegroup.co.za"}>`,
      to: toEmail,
      subject: "Reset your Masakhe password",
      html,
    });
    console.log(`Password reset email sent to ${toEmail}`);
  } catch (err: any) {
    console.error(`Failed to send password reset email to ${toEmail}:`, err.message);
  }
}
