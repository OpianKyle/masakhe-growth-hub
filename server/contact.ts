import { Router } from "express";
import { execute } from "./db";
import nodemailer from "nodemailer";

export const contactRouter = Router();

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

const runMigration = async () => {
  await execute(`
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      subject VARCHAR(500) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};
runMigration().catch(console.error);

contactRouter.post("/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  try {
    await execute(
      "INSERT INTO contact_submissions (name, email, subject, message) VALUES (?, ?, ?, ?)",
      [name.trim(), email.trim(), subject.trim(), message.trim()]
    );

    if (transporter) {
      const adminEmail = process.env.SMTP_USER || "admin@masakheportal.co.za";
      await transporter.sendMail({
        from: `"Masakhe Contact" <${adminEmail}>`,
        to: adminEmail,
        replyTo: email.trim(),
        subject: `New Contact Form: ${subject.trim()}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px;">
            <h2 style="color:#1e293b;margin-top:0;">New Contact Form Submission</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;font-weight:bold;color:#475569;width:100px;">Name:</td><td style="padding:8px 0;color:#1e293b;">${name.trim()}</td></tr>
              <tr><td style="padding:8px 0;font-weight:bold;color:#475569;">Email:</td><td style="padding:8px 0;color:#1e293b;"><a href="mailto:${email.trim()}">${email.trim()}</a></td></tr>
              <tr><td style="padding:8px 0;font-weight:bold;color:#475569;">Subject:</td><td style="padding:8px 0;color:#1e293b;">${subject.trim()}</td></tr>
            </table>
            <div style="margin-top:16px;padding:16px;background:#fff;border-radius:8px;border:1px solid #e2e8f0;">
              <p style="font-weight:bold;color:#475569;margin-top:0;">Message:</p>
              <p style="color:#1e293b;white-space:pre-wrap;margin-bottom:0;">${message.trim()}</p>
            </div>
            <p style="margin-top:16px;font-size:12px;color:#94a3b8;">Submitted via masakheportal.co.za</p>
          </div>
        `,
      }).catch(err => console.error("[Contact] Email send error:", err.message));
    }

    res.json({ ok: true });
  } catch (err: any) {
    console.error("[Contact] DB error:", err.message);
    res.status(500).json({ error: "Failed to submit. Please try again." });
  }
});
