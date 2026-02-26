import { Request, Response, NextFunction } from "express";
import { queryOne } from "./db";

export async function getSubscriptionStatus(workspaceId: string) {
  const sub = await queryOne(
    `SELECT bs.*, bp.code as plan_code, bp.name as plan_name, bp.price_cents, bp.currency, bp.bill_interval
     FROM billing_subscriptions bs
     JOIN billing_plans bp ON bp.id = bs.plan_id
     WHERE bs.workspace_id = ? AND bs.status IN ('TRIAL','ACTIVE')
     ORDER BY bs.created_at DESC LIMIT 1`,
    [workspaceId]
  );
  return sub || null;
}

export async function requireActiveSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const member = await queryOne(
      "SELECT workspace_id FROM workspace_members WHERE user_id = ? LIMIT 1",
      [userId]
    );

    if (!member) {
      return res.status(403).json({
        error: "subscription_required",
        message: "Active subscription required"
      });
    }

    const sub = await getSubscriptionStatus(member.workspace_id);

    if (
      sub &&
      (sub.status === "ACTIVE" ||
        (sub.status === "TRIAL" && sub.trial_end_at && new Date(sub.trial_end_at) > new Date()))
    ) {
      return next();
    }

    return res.status(403).json({
      error: "subscription_required",
      message: "Active subscription required"
    });
  } catch (err: any) {
    console.error("Feature gate error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}
