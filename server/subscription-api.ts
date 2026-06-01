import { Router } from "express";
import { queryAll } from "./db";

export const subscriptionApiRouter = Router();

function requireApiKey(req: any, res: any, next: any) {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) {
    return res.status(503).json({ error: "WEBHOOK_SECRET is not configured on this server." });
  }
  const provided = req.headers["x-webhook-secret"];
  if (!provided || provided !== secret) {
    return res.status(401).json({ error: "Unauthorized — invalid or missing x-webhook-secret header." });
  }
  next();
}

subscriptionApiRouter.use(requireApiKey);

subscriptionApiRouter.get("/subscriptions", async (_req, res) => {
  try {
    const rows = await queryAll(
      `SELECT
         bs.id,
         bs.status,
         bs.trial_start_at,
         bs.trial_end_at,
         bs.next_billing_at,
         bs.created_at        AS subscribed_at,
         bp.code              AS plan_code,
         bp.name              AS plan_name,
         bp.price_cents,
         bp.currency,
         u.id                 AS user_id,
         u.full_name,
         u.email,
         u.phone,
         COALESCE(biz.business_name, u.full_name) AS business_name
       FROM billing_subscriptions bs
       JOIN billing_plans   bp  ON bp.id  = bs.plan_id
       JOIN workspaces      w   ON w.id   = bs.workspace_id
       JOIN users           u   ON u.id   = w.owner_id
       LEFT JOIN business_profiles biz ON biz.user_id = u.id
       WHERE bs.status IN ('TRIAL', 'ACTIVE')
         AND (
               bs.status = 'ACTIVE'
               OR (bs.status = 'TRIAL' AND (bs.trial_end_at IS NULL OR bs.trial_end_at > NOW()))
             )
       ORDER BY bs.created_at DESC`,
      []
    );

    const subscriptions = rows.map((r: any) => ({
      id: r.id,
      status: r.status,
      plan: {
        code: r.plan_code,
        name: r.plan_name,
        priceCents: r.price_cents,
        currency: r.currency,
        priceFormatted: `R ${(r.price_cents / 100).toFixed(2)}`,
      },
      user: {
        id: r.user_id,
        fullName: r.full_name,
        email: r.email,
        phone: r.phone || null,
        businessName: r.business_name,
      },
      trialStartAt: r.trial_start_at || null,
      trialEndAt: r.trial_end_at || null,
      nextBillingAt: r.next_billing_at || null,
      subscribedAt: r.subscribed_at,
    }));

    res.json({
      count: subscriptions.length,
      subscriptions,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[SubAPI] GET /subscriptions error:", err.message);
    res.status(500).json({ error: "Failed to fetch subscriptions." });
  }
});
