import { Router } from "express";
import nodemailer from "nodemailer";
import { queryOne, execute } from "./db";
import { encrypt, decrypt } from "./crypto";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) return res.status(401).json({ error: "Unauthorized" });
  next();
}

function buildTransporter(settings: any) {
  return nodemailer.createTransport({
    host: settings.smtp_host,
    port: settings.smtp_port,
    secure: !!settings.smtp_secure,
    auth: {
      user: settings.smtp_user,
      pass: decrypt(settings.smtp_pass_enc),
    },
  });
}

router.get("/", requireAuth, async (req: any, res) => {
  try {
    const row = await queryOne(
      "SELECT id, provider, smtp_host, smtp_port, smtp_secure, smtp_user, from_name, from_email, reply_to FROM user_email_settings WHERE user_id = ?",
      [req.session.userId]
    );
    res.json({ ok: true, settings: row || null });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/", requireAuth, async (req: any, res) => {
  const { provider, smtp_host, smtp_port, smtp_secure, smtp_user, smtp_pass, from_name, from_email, reply_to } = req.body;

  if (!smtp_host || !smtp_user || !from_email) {
    return res.status(400).json({ error: "Host, username, and from address are required." });
  }

  try {
    const existing = await queryOne(
      "SELECT id, smtp_pass_enc FROM user_email_settings WHERE user_id = ?",
      [req.session.userId]
    );

    const passEnc = smtp_pass ? encrypt(smtp_pass) : (existing?.smtp_pass_enc || "");

    if (existing) {
      await execute(
        `UPDATE user_email_settings SET provider=?, smtp_host=?, smtp_port=?, smtp_secure=?, smtp_user=?, smtp_pass_enc=?, from_name=?, from_email=?, reply_to=?, updated_at=NOW() WHERE user_id=?`,
        [provider || "smtp", smtp_host, smtp_port || 587, smtp_secure ? 1 : 0, smtp_user, passEnc, from_name || "", from_email, reply_to || "", req.session.userId]
      );
    } else {
      const id = crypto.randomUUID();
      await execute(
        `INSERT INTO user_email_settings (id, user_id, provider, smtp_host, smtp_port, smtp_secure, smtp_user, smtp_pass_enc, from_name, from_email, reply_to) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [id, req.session.userId, provider || "smtp", smtp_host, smtp_port || 587, smtp_secure ? 1 : 0, smtp_user, passEnc, from_name || "", from_email, reply_to || ""]
      );
    }

    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/test", requireAuth, async (req: any, res) => {
  try {
    const settings = await queryOne(
      "SELECT * FROM user_email_settings WHERE user_id = ?",
      [req.session.userId]
    );
    if (!settings || !settings.smtp_pass_enc) {
      return res.status(400).json({ error: "No email settings saved yet." });
    }

    const transporter = buildTransporter(settings);
    await transporter.verify();

    const userRow = await queryOne("SELECT email, full_name FROM users WHERE id = ?", [req.session.userId]);
    await transporter.sendMail({
      from: `"${settings.from_name || "Masakhe"}" <${settings.from_email}>`,
      to: userRow?.email || settings.smtp_user,
      subject: "Masakhe — Email Settings Test",
      html: `<p>Hi ${userRow?.full_name || "there"},</p><p>Your email settings are working correctly! You can now send campaigns from <strong>${settings.from_email}</strong>.</p><p>— Masakhe Platform</p>`,
    });

    res.json({ ok: true, message: `Test email sent to ${userRow?.email}.` });
  } catch (e: any) {
    res.status(400).json({ error: `Connection failed: ${e.message}` });
  }
});

export { router as emailSettingsRouter };

export async function getUserTransporter(userId: string) {
  const settings = await queryOne(
    "SELECT * FROM user_email_settings WHERE user_id = ?",
    [userId]
  );
  if (!settings || !settings.smtp_pass_enc) return null;
  return {
    transporter: buildTransporter(settings),
    fromName: settings.from_name || "Masakhe",
    fromEmail: settings.from_email,
    replyTo: settings.reply_to || undefined,
  };
}
