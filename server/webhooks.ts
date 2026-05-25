import crypto from "crypto";

export interface SignupWebhookPayload {
  event: "user.signup";
  user_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  referral_code: string | null;
  business_name: string | null;
  industry_sector: string | null;
  signed_up_at: string;
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
      console.log(`[Webhook] Signup event sent for user ${payload.user_id} (ref: ${payload.referral_code ?? "none"})`);
    }
  } catch (err: any) {
    console.error(`[Webhook] Failed to send signup event:`, err.message);
  }
}
