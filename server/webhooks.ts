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

export async function fireSignupWebhook(payload: SignupWebhookPayload): Promise<void> {
  const url = process.env.WEBHOOK_SIGNUP_URL;
  const secret = process.env.WEBHOOK_SECRET;

  if (!url) {
    console.warn("[Webhook] WEBHOOK_SIGNUP_URL is not set — skipping signup webhook");
    return;
  }

  const body = JSON.stringify({
    name: payload.fullName,
    email: payload.email,
    phone: payload.phone || undefined,
    business: payload.businessName || undefined,
    agentId: payload.referralCode || undefined,
  });

  console.log(`[Webhook] Sending signup to: ${url}`);
  console.log(`[Webhook] x-webhook-secret header: ${secret ? `set (${secret.length} chars)` : "NOT SET — this will cause a 401"}`);
  console.log(`[Webhook] Body: ${body}`);

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

    const responseText = await res.text().catch(() => "");
    if (!res.ok) {
      console.warn(`[Webhook] CRM responded ${res.status}: ${responseText}`);
    } else {
      console.log(`[Webhook] Success (${res.status}) for ${payload.email} — agentId: ${payload.referralCode ?? "none"}`);
    }
  } catch (err: any) {
    console.error(`[Webhook] Request failed:`, err.message);
  }
}
