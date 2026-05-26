import crypto from "crypto";
import { queryOne } from "./db";

export interface SignupWebhookPayload {
  event: "user.signup";
  user_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  referral_code: string | null;
  referred_by_agent: {
    id: string;
    name: string;
    email: string;
    reseller_code: string;
  } | null;
  business_name: string | null;
  industry_sector: string | null;
  signed_up_at: string;
}

export async function buildSignupPayload(opts: {
  userId: string;
  email: string;
  fullName: string;
  phone: string | null;
  referralCode: string | null;
  businessName: string | null;
  industrySector: string | null;
  now: string;
}): Promise<SignupWebhookPayload> {
  let referred_by_agent: SignupWebhookPayload["referred_by_agent"] = null;

  if (opts.referralCode) {
    try {
      const agent = await queryOne(
        `SELECT r.id, r.reseller_code, u.full_name, u.email
         FROM resellers r
         JOIN users u ON u.id = r.user_id
         WHERE r.reseller_code = ? AND r.status = 'active'`,
        [opts.referralCode]
      );
      if (agent) {
        referred_by_agent = {
          id: agent.id,
          name: agent.full_name,
          email: agent.email,
          reseller_code: agent.reseller_code,
        };
      }
    } catch {
      // non-fatal — send webhook without agent details
    }
  }

  return {
    event: "user.signup",
    user_id: opts.userId,
    email: opts.email,
    full_name: opts.fullName,
    phone: opts.phone,
    referral_code: opts.referralCode,
    referred_by_agent,
    business_name: opts.businessName,
    industry_sector: opts.industrySector,
    signed_up_at: opts.now,
  };
}

export async function fireSignupWebhook(payload: SignupWebhookPayload): Promise<void> {
  const url = process.env.WEBHOOK_SIGNUP_URL;
  if (!url) return;

  const body = JSON.stringify(payload);
  const secret = process.env.WEBHOOK_SECRET || "";

  const signature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Masakhe-Event": payload.event,
        "X-Masakhe-Signature": `sha256=${signature}`,
        "X-Masakhe-Timestamp": new Date().toISOString(),
      },
      body,
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.warn(`[Webhook] Signup webhook responded with ${res.status} for user ${payload.user_id}`);
    } else {
      const agent = payload.referred_by_agent;
      console.log(
        `[Webhook] Signup event sent for user ${payload.user_id}` +
        (agent ? ` (referred by agent: ${agent.name} / ${agent.reseller_code})` : ` (no referral)`)
      );
    }
  } catch (err: any) {
    console.error(`[Webhook] Failed to send signup event:`, err.message);
  }
}
