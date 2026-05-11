/**
 * SMS abstraction layer — Africa's Talking provider.
 * Set AFRICASTALKING_USERNAME and AFRICASTALKING_API_KEY in env vars to enable.
 * Without those, all sends are logged to console only (no-op mode).
 */

const AT_USERNAME = process.env.AFRICASTALKING_USERNAME || "";
const AT_API_KEY = process.env.AFRICASTALKING_API_KEY || "";
const AT_SENDER = process.env.AFRICASTALKING_SENDER_ID || "Masakhe";
const SMS_ENABLED = !!(AT_USERNAME && AT_API_KEY);

if (!SMS_ENABLED) {
  console.info("[SMS] AFRICASTALKING_USERNAME / AFRICASTALKING_API_KEY not set — SMS sending disabled (console-only mode)");
}

async function sendSMS(to: string, message: string): Promise<void> {
  const phone = normalisePhone(to);
  if (!phone) {
    console.warn(`[SMS] Invalid phone number: ${to}`);
    return;
  }

  if (!SMS_ENABLED) {
    console.log(`[SMS:MOCK] To: ${phone} | Message: ${message}`);
    return;
  }

  try {
    const body = new URLSearchParams({
      username: AT_USERNAME,
      to: phone,
      message,
      from: AT_SENDER,
    });

    const res = await fetch("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: {
        apiKey: AT_API_KEY,
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const data: any = await res.json();
    const recipients = data?.SMSMessageData?.Recipients || [];
    const success = recipients.some((r: any) => r.status === "Success");
    if (success) {
      console.log(`[SMS] Sent to ${phone}`);
    } else {
      console.warn(`[SMS] Unexpected response for ${phone}:`, JSON.stringify(data));
    }
  } catch (err: any) {
    console.error(`[SMS] Failed to send to ${phone}:`, err.message);
  }
}

function normalisePhone(raw: string): string | null {
  if (!raw) return null;
  let p = raw.replace(/[\s\-()]/g, "");
  if (p.startsWith("0") && p.length === 10) {
    p = "+27" + p.slice(1);
  } else if (p.startsWith("27") && !p.startsWith("+")) {
    p = "+" + p;
  } else if (!p.startsWith("+")) {
    p = "+" + p;
  }
  return p;
}

export async function sendWelcomeSMS(phone: string, fullName: string): Promise<void> {
  const firstName = fullName.split(" ")[0];
  const message =
    `Hi ${firstName}! Welcome to Masakhe — your all-in-one SMME platform. ` +
    `Log in at masakheportal.co.za to get started. Our team will be in touch shortly!`;
  await sendSMS(phone, message);
}

export async function sendOtpSMS(phone: string, otp: string): Promise<void> {
  const message = `Your Masakhe verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;
  await sendSMS(phone, message);
}

export async function sendCallScheduledSMS(phone: string, fullName: string): Promise<void> {
  const firstName = fullName.split(" ")[0];
  const message =
    `Hi ${firstName}, the Masakhe team will contact you shortly to schedule your free onboarding call. ` +
    `We're excited to help your business grow!`;
  await sendSMS(phone, message);
}
