import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import { queryOne, execute } from "./db";

const BASE_URL = process.env.ADUMO_ENV === "production"
  ? "https://apiv3.adumoonline.com"
  : "https://staging-apiv3.adumoonline.com";

const APP_URL = process.env.APP_URL || `http://localhost:${process.env.PORT || 5000}`;

export const isMockMode = !process.env.ADUMO_CUID || !process.env.ADUMO_AUID;

let cachedOAuthToken: { token: string; expiresAt: number } | null = null;

async function getOAuthToken(): Promise<string> {
  if (cachedOAuthToken && Date.now() < cachedOAuthToken.expiresAt - 60000) {
    return cachedOAuthToken.token;
  }

  const clientId = process.env.ADUMO_CLIENT_ID;
  const clientSecret = process.env.ADUMO_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("ADUMO_CLIENT_ID and ADUMO_CLIENT_SECRET are required for Card API");
  }

  const url = `${BASE_URL}/oauth/token?grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`;

  const response = await fetch(url, { method: "POST" });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OAuth token request failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  cachedOAuthToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
  };

  console.log("[Adumo] OAuth token obtained, expires in", data.expires_in, "seconds");
  return cachedOAuthToken.token;
}

export function generateCheckoutToken(merchantRef: string, amount: string): string {
  return jwt.sign(
    {
      mref: merchantRef,
      amount,
      auid: process.env.ADUMO_AUID,
      cuid: process.env.ADUMO_CUID,
    },
    process.env.ADUMO_JWT_SECRET!,
    { algorithm: "HS256", expiresIn: 600 }
  );
}

export function generateSubscriptionToken(merchantRef: string, amount: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: "Adumo Subscription Portal",
    cuid: process.env.ADUMO_CUID,
    auid: process.env.ADUMO_AUID,
    amount,
    mref: merchantRef,
    jti: randomBytes(32).toString("base64"),
    iat: now - 60,
    exp: now + 600,
  };
  return jwt.sign(payload, process.env.ADUMO_JWT_SECRET!, { algorithm: "HS256" });
}

export function verifyResponseToken(token: string): any {
  return jwt.verify(token, process.env.ADUMO_JWT_SECRET!);
}

export function extractCardDetailsFromResponse(decoded: any): {
  puid: string | null;
  profileToken: string | null;
  cardToken: string | null;
  last4: string | null;
  brand: string | null;
} {
  const maskedCard = decoded.maskedCardNumber || decoded.masked_card || decoded.MaskedCardNumber || null;
  return {
    puid: decoded.puid || decoded.PUID || null,
    profileToken: decoded.profileToken || decoded.profile_token || decoded.ProfileToken || null,
    cardToken: decoded.cardToken || decoded.card_token || decoded.CardToken || null,
    last4: maskedCard ? maskedCard.slice(-4) : null,
    brand: decoded.cardBrand || decoded.card_brand || decoded.CardBrand || null,
  };
}

interface CardChargeResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  statusMessage?: string;
  authorisationCode?: string;
}

async function cardApiRequest(endpoint: string, body: any): Promise<any> {
  const token = await getOAuthToken();
  const url = `${BASE_URL}/products/payments/v1/card${endpoint}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(`[Adumo] Card API ${endpoint} error:`, response.status, JSON.stringify(data));
    throw new Error(data.statusMessage || data.message || `Card API error: ${response.status}`);
  }

  return data;
}

export async function chargeCardOnFile(
  workspaceId: string,
  amountCents: number,
  merchantRef: string,
  description: string
): Promise<CardChargeResult> {
  if (isMockMode) {
    return { success: true, transactionId: `MOCK-${Date.now()}` };
  }

  const paymentMethod = await queryOne(
    "SELECT * FROM billing_payment_methods WHERE workspace_id = ? AND status = 'ON_FILE' LIMIT 1",
    [workspaceId]
  );

  if (!paymentMethod) {
    return { success: false, error: "No payment method on file" };
  }

  if (!paymentMethod.profile_token && !paymentMethod.puid) {
    return { success: false, error: "No stored card profile for recurring charges" };
  }

  const amount = amountCents / 100;

  try {
    console.log(`[Adumo] Initiating card-on-file charge for workspace ${workspaceId}, amount: R${amount.toFixed(2)}, ref: ${merchantRef}`);

    const initiateBody: any = {
      applicationUid: process.env.ADUMO_AUID,
      merchantUid: process.env.ADUMO_CUID,
      merchantReference: merchantRef,
      description,
      value: amount,
      budgetPeriod: 0,
      ipAddress: "127.0.0.1",
      userAgent: "Masakhe/1.0 Server-Side",
      profileUid: paymentMethod.profile_token || paymentMethod.puid,
      saveCardDetails: false,
    };

    if (paymentMethod.card_token) {
      initiateBody.cardToken = paymentMethod.card_token;
    }

    const initResult = await cardApiRequest("/initiate/", initiateBody);
    console.log(`[Adumo] Initiate result:`, JSON.stringify(initResult));

    if (initResult.threeDSecureAuthRequired) {
      console.warn(`[Adumo] 3DS required for card-on-file charge — cannot process server-side. Workspace: ${workspaceId}`);
      return { success: false, error: "3D Secure authentication required — customer must re-authenticate their card" };
    }

    if (initResult.profileUid && initResult.profileUid !== paymentMethod.profile_token) {
      await execute(
        "UPDATE billing_payment_methods SET profile_token = ?, updated_at = NOW() WHERE id = ?",
        [initResult.profileUid, paymentMethod.id]
      );
    }
    if (initResult.cardToken && initResult.cardToken !== paymentMethod.card_token) {
      await execute(
        "UPDATE billing_payment_methods SET card_token = ?, updated_at = NOW() WHERE id = ?",
        [initResult.cardToken, paymentMethod.id]
      );
    }

    const transactionId = initResult.transactionId;

    const authResult = await cardApiRequest("/authorise", {
      transactionId,
      amount,
    });
    console.log(`[Adumo] Authorise result:`, JSON.stringify(authResult));

    if (authResult.statusCode !== 200 && authResult.statusCode !== 0) {
      return {
        success: false,
        transactionId,
        error: authResult.statusMessage || "Authorisation failed",
      };
    }

    const settleResult = await cardApiRequest("/settle", {
      transactionId,
      amount,
    });
    console.log(`[Adumo] Settle result:`, JSON.stringify(settleResult));

    if (settleResult.statusCode !== 200 && settleResult.statusCode !== 0) {
      console.warn(`[Adumo] Settlement failed, attempting reversal for ${transactionId}`);
      try {
        await cardApiRequest("/reverse", { transactionId, amount });
      } catch (revErr: any) {
        console.error(`[Adumo] Reversal also failed:`, revErr.message);
      }
      return {
        success: false,
        transactionId,
        error: settleResult.statusMessage || "Settlement failed",
      };
    }

    console.log(`[Adumo] Card-on-file charge successful: ${transactionId}, auth: ${settleResult.authorisationCode}`);

    return {
      success: true,
      transactionId,
      statusMessage: settleResult.statusMessage,
      authorisationCode: settleResult.authorisationCode,
    };
  } catch (err: any) {
    console.error(`[Adumo] Card-on-file charge error for workspace ${workspaceId}:`, err.message);
    return { success: false, error: err.message };
  }
}

export async function refundTransaction(
  transactionId: string,
  amountCents: number
): Promise<CardChargeResult> {
  if (isMockMode) {
    return { success: true, transactionId };
  }

  try {
    const result = await cardApiRequest("/refund", {
      transactionId,
      amount: amountCents / 100,
    });

    return {
      success: result.statusCode === 200 || result.statusCode === 0,
      transactionId,
      statusMessage: result.statusMessage,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
