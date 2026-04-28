import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";

function buildTokenPayload(merchantRef: string, amount: string) {
  const now = Math.floor(Date.now() / 1000);
  return {
    iss: "Masakhe",
    cuid: (process.env.ADUMO_MERCHANT_ID || "").toLowerCase(),
    auid: (process.env.ADUMO_APPLICATION_ID || "").toLowerCase(),
    amount,
    mref: merchantRef,
    jti: randomBytes(32).toString("base64"),
    iat: now - 60,
    exp: now + 600,
  };
}

export function generatePaymentToken(merchantRef: string, amount: string): string {
  return jwt.sign(buildTokenPayload(merchantRef, amount), process.env.ADUMO_JWT_SECRET!, { algorithm: "HS256" });
}

export function generateSubscriptionToken(merchantRef: string, amount: string): string {
  return jwt.sign(buildTokenPayload(merchantRef, amount), process.env.ADUMO_JWT_SECRET!, { algorithm: "HS256" });
}

export function verifyResponseToken(token: string): any {
  return jwt.verify(token, process.env.ADUMO_JWT_SECRET!);
}
