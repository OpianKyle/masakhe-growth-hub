import { Request, Response, NextFunction } from "express";
import { queryOne } from "./db";

const TRIAL_DAYS = 14;

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

function isWithinTrial(createdAt: string): boolean {
  const created = new Date(createdAt);
  const trialEnd = new Date(created.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
  return new Date() < trialEnd;
}

export async function requireActiveSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const member = await queryOne(
      "SELECT wm.workspace_id, w.created_at as workspace_created_at FROM workspace_members wm JOIN workspaces w ON w.id = wm.workspace_id WHERE wm.user_id = ? LIMIT 1",
      [userId]
    );

    if (!member) {
      return res.status(403).json({
        error: "subscription_required",
        message: "Active subscription required"
      });
    }

    // Allow if within the 14-day workspace trial window
    if (member.workspace_created_at && isWithinTrial(member.workspace_created_at)) {
      return next();
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
      message: "Your 14-day free trial has ended. Please subscribe to continue."
    });
  } catch (err: any) {
    console.error("Feature gate error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}
