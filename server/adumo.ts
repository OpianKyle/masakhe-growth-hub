import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";

export function generateSubscriptionToken(merchantRef: string, amount: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: "Masakhe",
    cuid: process.env.ADUMO_MERCHANT_ID,
    auid: process.env.ADUMO_APPLICATION_ID,
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
