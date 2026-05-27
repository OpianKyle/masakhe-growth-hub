import { queryOne } from "./db";

export interface SignupWebhookPayload {
  event: "user.signup";
  userId: string;
  email: string;
  fullName: string;
  phone: string | null;
  referralCode: string | null;
  businessName: string | null;
  industrySector: string | null;
  now: string;
}

export async function buildSignupPayload(opts: SignupWebhookPayload): Promise<SignupWebhookPayload> {
  return opts;
}

export async function fireSignupWebhook(payload: SignupWebhookPayload): Promise<void> {
  const url = process.env.WEBHOOK_SIGNUP_URL;
  const secret = process.env.WEBHOOK_SECRET;
  if (!url) return;

  const body = JSON.stringify({
    name: payload.fullName,
    email: payload.email,
    phone: payload.phone || undefined,
    business: payload.businessName || undefined,
    agentId: payload.referralCode || undefined,
  });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "x-webhook-secret": secret } : {}),
      },
      body,
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.warn(`[Webhook] Signup webhook responded with ${res.status} for user ${payload.userId}`);
    } else {
      console.log(
        `[Webhook] Signup sent for ${payload.email}` +
        (payload.referralCode ? ` (agentId: ${payload.referralCode})` : " (no referral)")
      );
    }
  } catch (err: any) {
    console.error(`[Webhook] Failed to send signup event:`, err.message);
  }
}
