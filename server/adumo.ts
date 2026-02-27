import jwt from "jsonwebtoken";
import { queryOne, execute } from "./db";

const ADUMO_STAGING_BASE = "https://staging-apiv3.adumoonline.com";
const ADUMO_PROD_BASE = "https://apiv3.adumoonline.com";

const BASE_URL = process.env.ADUMO_ENV === "production" ? ADUMO_PROD_BASE : ADUMO_STAGING_BASE;
const APP_URL = process.env.APP_URL || `http://localhost:${process.env.PORT || 5000}`;

export const isMockMode = !process.env.ADUMO_CUID || !process.env.ADUMO_AUID;

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

export function verifyResponseToken(token: string): any {
  return jwt.verify(token, process.env.ADUMO_JWT_SECRET!);
}

export async function chargeCardOnFile(
  workspaceId: string,
  amountCents: number,
  merchantRef: string,
  description: string
): Promise<{ success: boolean; error?: string; transactionIndex?: string }> {
  if (isMockMode) {
    return { success: true, transactionIndex: `MOCK-${Date.now()}` };
  }

  const paymentMethod = await queryOne(
    "SELECT * FROM billing_payment_methods WHERE workspace_id = ? AND status = 'ON_FILE' LIMIT 1",
    [workspaceId]
  );

  if (!paymentMethod || !paymentMethod.puid) {
    return { success: false, error: "No payment method with puid on file" };
  }

  const amount = (amountCents / 100).toFixed(2);

  const token = generateCheckoutToken(merchantRef, amount);

  try {
    const formData: Record<string, string> = {
      MerchantID: process.env.ADUMO_CUID!,
      ApplicationID: process.env.ADUMO_AUID!,
      MerchantReference: merchantRef,
      Amount: amount,
      Token: token,
      puid: paymentMethod.puid,
      txtCurrencyCode: "ZAR",
      RedirectSuccessfulURL: `${APP_URL}/api/billing/webhooks/adumo`,
      RedirectFailedURL: `${APP_URL}/api/billing/webhooks/adumo`,
      NotifyURL: `${APP_URL}/api/billing/webhooks/adumo`,
      Variable1: "Recurring",
      Variable2: merchantRef,
      Qty1: "1",
      ItemRef1: "renewal",
      ItemDescr1: description,
      ItemAmount1: amount,
      ShippingCost: "0.00",
      Discount: "0.00",
    };

    const params = new URLSearchParams(formData);
    const initiateUrl = process.env.ADUMO_ENV === "production"
      ? "https://apiv3.adumoonline.com/product/payment/v1/initialisevirtual"
      : "https://staging-apiv3.adumoonline.com/product/payment/v1/initialisevirtual";

    const response = await fetch(initiateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const responseText = await response.text();
    console.log(`[Adumo] Card-on-file charge response for ${merchantRef}:`, response.status, responseText.substring(0, 500));

    if (response.ok) {
      return { success: true, transactionIndex: merchantRef };
    } else {
      return { success: false, error: `Adumo charge failed: ${response.status} ${responseText.substring(0, 200)}` };
    }
  } catch (err: any) {
    console.error(`[Adumo] Card-on-file charge error:`, err.message);
    return { success: false, error: err.message };
  }
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
