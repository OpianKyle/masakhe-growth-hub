import { Router } from "express";
import { queryAll, queryOne, execute } from "./db";
import { requireAuth } from "./auth";
import { randomUUID } from "crypto";
import nodemailer from "nodemailer";
import { getUserTransporter } from "./email-settings";

export const campaignsRouter = Router();
campaignsRouter.use(requireAuth);

function getGlobalTransporter() {
  if (!process.env.SMTP_PASSWORD) return null;
  const smtpPort = parseInt(process.env.SMTP_PORT || "465");
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.masakhegroup.co.za",
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: process.env.SMTP_USER || "admin@masakhegroup.co.za",
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

async function resolveTransporter(userId: string, campaign: any) {
  const userSettings = await getUserTransporter(userId);
  if (userSettings) {
    return {
      transporter: userSettings.transporter,
      fromEmail: campaign.from_email || userSettings.fromEmail,
      fromName: campaign.from_name || userSettings.fromName,
      replyTo: campaign.reply_to || userSettings.replyTo,
    };
  }
  return {
    transporter: getGlobalTransporter(),
    fromEmail: campaign.from_email || process.env.SMTP_FROM || "admin@masakhegroup.co.za",
    fromName: campaign.from_name || "Masakhe",
    replyTo: campaign.reply_to || campaign.from_email || process.env.SMTP_FROM || "admin@masakhegroup.co.za",
  };
}

function buildEmail(campaign: any, contactFirstName?: string): string {
  const firstName = contactFirstName || "Valued Client";
  const body = campaign.body_html || "<p>No content provided.</p>";
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${campaign.subject}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
      <tr>
        <td style="background:linear-gradient(135deg,#1a56db 0%,#1239a5 100%);padding:28px 40px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;">${campaign.from_name || "Masakhe"}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:36px 40px;">
          ${body.replace(/\{\{first_name\}\}/g, firstName).replace(/\{\{name\}\}/g, firstName)}
        </td>
      </tr>
      <tr>
        <td style="background:#f8f8fa;padding:20px 40px;text-align:center;border-top:1px solid #e8e8ec;">
          <p style="margin:0;color:#9a9aaa;font-size:11px;line-height:1.5;">
            You received this email because you are subscribed to communications from ${campaign.from_name || "us"}.<br>
            &copy; ${new Date().getFullYear()} ${campaign.from_name || "Masakhe Business Solutions"}.
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

// ── Stats ───────────────────────────────────────────────────────────────────

campaignsRouter.get("/stats", async (req, res) => {
  const userId = (req.session as any).userId;
  try {
    const [camps, contacts] = await Promise.all([
      queryAll("SELECT status, total_recipients, sent_count, opened_count FROM campaigns WHERE user_id = ?", [userId]),
      queryOne("SELECT COUNT(*) as total FROM campaign_contacts WHERE user_id = ? AND status = 'subscribed'", [userId]),
    ]);
    const totalCampaigns = camps.length;
    const totalContacts = (contacts as any)?.total || 0;
    const sent = camps.filter((c: any) => c.status === "sent");
    const totalSent = sent.reduce((s: number, c: any) => s + (c.sent_count || 0), 0);
    const totalOpened = sent.reduce((s: number, c: any) => s + (c.opened_count || 0), 0);
    const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
    res.json({ totalCampaigns, totalContacts, totalSent, openRate });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Campaign list & detail ───────────────────────────────────────────────────

campaignsRouter.get("/", async (req, res) => {
  const userId = (req.session as any).userId;
  try {
    const rows = await queryAll("SELECT * FROM campaigns WHERE user_id = ? ORDER BY created_at DESC", [userId]);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

campaignsRouter.get("/:id", async (req, res) => {
  const userId = (req.session as any).userId;
  try {
    const campaign = await queryOne("SELECT * FROM campaigns WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!campaign) return res.status(404).json({ error: "Not found" });
    const sends = await queryAll("SELECT * FROM campaign_sends WHERE campaign_id = ? ORDER BY sent_at DESC LIMIT 200", [req.params.id]);
    res.json({ ...campaign, sends });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Create campaign ──────────────────────────────────────────────────────────

campaignsRouter.post("/", async (req, res) => {
  const userId = (req.session as any).userId;
  const { name, subject, from_name, from_email, reply_to, body_html, template_key, audience, audience_tag } = req.body;
  if (!name || !subject) return res.status(400).json({ error: "Name and subject are required" });
  try {
    const id = randomUUID();
    await execute(
      `INSERT INTO campaigns (id, user_id, name, subject, from_name, from_email, reply_to, body_html, template_key, audience, audience_tag)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, name, subject, from_name || null, from_email || null, reply_to || null,
       body_html || null, template_key || "blank", audience || "all", audience_tag || null]
    );
    const campaign = await queryOne("SELECT * FROM campaigns WHERE id = ?", [id]);
    res.status(201).json(campaign);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Update campaign ──────────────────────────────────────────────────────────

campaignsRouter.put("/:id", async (req, res) => {
  const userId = (req.session as any).userId;
  const { name, subject, from_name, from_email, reply_to, body_html, template_key, audience, audience_tag, scheduled_at } = req.body;
  try {
    const existing = await queryOne("SELECT id FROM campaigns WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!existing) return res.status(404).json({ error: "Not found" });
    await execute(
      `UPDATE campaigns SET name=?, subject=?, from_name=?, from_email=?, reply_to=?, body_html=?,
       template_key=?, audience=?, audience_tag=?, scheduled_at=? WHERE id = ?`,
      [name, subject, from_name || null, from_email || null, reply_to || null, body_html || null,
       template_key || "blank", audience || "all", audience_tag || null, scheduled_at || null, req.params.id]
    );
    const campaign = await queryOne("SELECT * FROM campaigns WHERE id = ?", [req.params.id]);
    res.json(campaign);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Delete campaign ──────────────────────────────────────────────────────────

campaignsRouter.delete("/:id", async (req, res) => {
  const userId = (req.session as any).userId;
  try {
    const existing = await queryOne("SELECT id FROM campaigns WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!existing) return res.status(404).json({ error: "Not found" });
    await execute("DELETE FROM campaigns WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Send campaign ───────────────────────────────────────────────────────────

campaignsRouter.post("/:id/send", async (req, res) => {
  const userId = (req.session as any).userId;
  try {
    const campaign = await queryOne("SELECT * FROM campaigns WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!campaign) return res.status(404).json({ error: "Not found" });
    if (campaign.status === "sent") return res.status(400).json({ error: "Campaign already sent" });

    let contacts: any[];
    if (campaign.audience === "broker_clients") {
      const rows = await queryAll(
        "SELECT id, email, SUBSTRING_INDEX(full_name, ' ', 1) AS first_name FROM broker_clients WHERE user_id = ? AND email IS NOT NULL AND email != ''",
        [userId]
      );
      contacts = rows;
    } else if (campaign.audience === "all_with_clients") {
      const [cc, bc] = await Promise.all([
        queryAll("SELECT id, email, first_name FROM campaign_contacts WHERE user_id = ? AND status = 'subscribed'", [userId]),
        queryAll("SELECT id, email, SUBSTRING_INDEX(full_name, ' ', 1) AS first_name FROM broker_clients WHERE user_id = ? AND email IS NOT NULL AND email != ''", [userId]),
      ]);
      const seen = new Set<string>();
      contacts = [...cc, ...bc].filter(c => {
        if (!c.email || seen.has(c.email.toLowerCase())) return false;
        seen.add(c.email.toLowerCase());
        return true;
      });
    } else if (campaign.audience === "tagged" && campaign.audience_tag) {
      contacts = await queryAll(
        "SELECT * FROM campaign_contacts WHERE user_id = ? AND status = 'subscribed' AND FIND_IN_SET(?, REPLACE(tags, ', ', ','))",
        [userId, campaign.audience_tag]
      );
    } else {
      contacts = await queryAll(
        "SELECT * FROM campaign_contacts WHERE user_id = ? AND status = 'subscribed'",
        [userId]
      );
    }

    if (contacts.length === 0) {
      return res.status(400).json({ error: "No recipients found for this campaign" });
    }

    const { transporter, fromEmail, fromName, replyTo } = await resolveTransporter(userId, campaign);
    await execute("UPDATE campaigns SET status='sending', total_recipients=? WHERE id=?", [contacts.length, campaign.id]);

    let sentCount = 0;
    const sendPromises = contacts.map(async (contact: any) => {
      const sendId = randomUUID();
      const html = buildEmail(campaign, contact.first_name);
      try {
        if (transporter) {
          await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: contact.email,
            replyTo: replyTo || fromEmail,
            subject: campaign.subject,
            html,
          });
        }
        await execute(
          "INSERT INTO campaign_sends (id, campaign_id, contact_id, email, status, sent_at) VALUES (?, ?, ?, ?, 'sent', NOW())",
          [sendId, campaign.id, contact.id, contact.email]
        );
        sentCount++;
      } catch (err: any) {
        await execute(
          "INSERT INTO campaign_sends (id, campaign_id, contact_id, email, status, error_message) VALUES (?, ?, ?, ?, 'failed', ?)",
          [sendId, campaign.id, contact.id, contact.email, err.message]
        );
      }
    });

    await Promise.all(sendPromises);
    await execute(
      "UPDATE campaigns SET status='sent', sent_at=NOW(), sent_count=? WHERE id=?",
      [sentCount, campaign.id]
    );
    res.json({ success: true, sent: sentCount, total: contacts.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Test send ───────────────────────────────────────────────────────────────

campaignsRouter.post("/:id/test", async (req, res) => {
  const userId = (req.session as any).userId;
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Test email address required" });
  try {
    const campaign = await queryOne("SELECT * FROM campaigns WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!campaign) return res.status(404).json({ error: "Not found" });
    const { transporter, fromEmail, fromName, replyTo } = await resolveTransporter(userId, campaign);
    if (!transporter) return res.status(503).json({ error: "SMTP not configured. Please set up your email settings in Settings → Email." });
    const html = buildEmail(campaign, "Test Recipient");
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      replyTo: replyTo || fromEmail,
      subject: `[TEST] ${campaign.subject}`,
      html,
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Audience counts ─────────────────────────────────────────────────────────

campaignsRouter.get("/audience/counts", async (req, res) => {
  const userId = (req.session as any).userId;
  try {
    const [subscribed, brokerClients] = await Promise.all([
      queryOne("SELECT COUNT(*) as total FROM campaign_contacts WHERE user_id = ? AND status = 'subscribed'", [userId]),
      queryOne("SELECT COUNT(*) as total FROM broker_clients WHERE user_id = ? AND email IS NOT NULL AND email != ''", [userId]),
    ]);
    res.json({
      subscribed: (subscribed as any)?.total || 0,
      brokerClients: (brokerClients as any)?.total || 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Contacts ────────────────────────────────────────────────────────────────

campaignsRouter.get("/contacts/list", async (req, res) => {
  const userId = (req.session as any).userId;
  try {
    const rows = await queryAll("SELECT * FROM campaign_contacts WHERE user_id = ? ORDER BY created_at DESC", [userId]);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

campaignsRouter.post("/contacts/add", async (req, res) => {
  const userId = (req.session as any).userId;
  const { email, first_name, last_name, company, phone, tags } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });
  try {
    const exists = await queryOne(
      "SELECT id FROM campaign_contacts WHERE user_id = ? AND email = ?",
      [userId, email.toLowerCase()]
    );
    if (exists) return res.status(409).json({ error: "A contact with this email already exists" });
    const id = randomUUID();
    await execute(
      "INSERT INTO campaign_contacts (id, user_id, email, first_name, last_name, company, phone, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [id, userId, email.toLowerCase(), first_name || null, last_name || null, company || null, phone || null, tags || null]
    );
    const contact = await queryOne("SELECT * FROM campaign_contacts WHERE id = ?", [id]);
    res.status(201).json(contact);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

campaignsRouter.put("/contacts/:id", async (req, res) => {
  const userId = (req.session as any).userId;
  const { email, first_name, last_name, company, phone, tags, status } = req.body;
  try {
    const existing = await queryOne("SELECT id FROM campaign_contacts WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!existing) return res.status(404).json({ error: "Not found" });
    await execute(
      "UPDATE campaign_contacts SET email=?, first_name=?, last_name=?, company=?, phone=?, tags=?, status=? WHERE id=?",
      [email, first_name || null, last_name || null, company || null, phone || null, tags || null, status || "subscribed", req.params.id]
    );
    const contact = await queryOne("SELECT * FROM campaign_contacts WHERE id = ?", [req.params.id]);
    res.json(contact);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

campaignsRouter.delete("/contacts/:id", async (req, res) => {
  const userId = (req.session as any).userId;
  try {
    const existing = await queryOne("SELECT id FROM campaign_contacts WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    if (!existing) return res.status(404).json({ error: "Not found" });
    await execute("DELETE FROM campaign_contacts WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

campaignsRouter.post("/contacts/import", async (req, res) => {
  const userId = (req.session as any).userId;
  const { contacts } = req.body;
  if (!Array.isArray(contacts) || contacts.length === 0) {
    return res.status(400).json({ error: "No contacts provided" });
  }
  let imported = 0;
  let skipped = 0;
  for (const c of contacts) {
    if (!c.email) { skipped++; continue; }
    try {
      const exists = await queryOne(
        "SELECT id FROM campaign_contacts WHERE user_id = ? AND email = ?",
        [userId, c.email.toLowerCase()]
      );
      if (exists) { skipped++; continue; }
      const id = randomUUID();
      await execute(
        "INSERT INTO campaign_contacts (id, user_id, email, first_name, last_name, company, phone, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [id, userId, c.email.toLowerCase(), c.first_name || null, c.last_name || null, c.company || null, c.phone || null, c.tags || null]
      );
      imported++;
    } catch { skipped++; }
  }
  res.json({ imported, skipped });
});
