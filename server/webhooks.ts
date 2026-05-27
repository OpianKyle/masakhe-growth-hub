import https from "https";
import http from "http";
import { URL } from "url";

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

function httpPost(urlStr: string, headers: Record<string, string>, body: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr);
    const transport = parsed.protocol === "https:" ? https : http;

    const req = transport.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method: "POST",
        headers: { ...headers, "Content-Length": Buffer.byteLength(body) },
        timeout: 8000,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode ?? 0, body: data }));
      }
    );

    req.on("timeout", () => { req.destroy(); reject(new Error("Request timed out after 8s")); });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
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

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (secret) {
    headers["x-webhook-secret"] = secret;
  }

  console.log(`[Webhook] Sending signup to: ${url}`);
  console.log(`[Webhook] x-webhook-secret: ${secret ? `set (${secret.length} chars)` : "NOT SET — will cause 401"}`);
  console.log(`[Webhook] Body: ${body}`);

  try {
    const res = await httpPost(url, headers, body);
    if (res.status >= 200 && res.status < 300) {
      console.log(`[Webhook] Success (${res.status}) for ${payload.email} — agentId: ${payload.referralCode ?? "none"}`);
    } else {
      console.warn(`[Webhook] CRM responded ${res.status}: ${res.body}`);
    }
  } catch (err: any) {
    console.error(`[Webhook] Request failed: ${err.message} (code: ${err.code ?? "unknown"})`);
  }
}
