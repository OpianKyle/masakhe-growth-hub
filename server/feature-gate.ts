import { Request, Response, NextFunction } from "express";
import { queryOne } from "./db";

export const MODULE_PLAN_MAP: Record<string, string[]> = {
  starter:          ["web_builder"],
  pro:              ["web_builder", "social_biz", "transactions_ops"],
  premium:          ["web_builder", "social_biz", "transactions_ops", "people_hr"],
  web_builder:      ["web_builder"],
  social_biz:       ["social_biz"],
  transactions_ops: ["transactions_ops"],
  people_hr:        ["people_hr"],
  all_modules:      ["web_builder", "social_biz", "transactions_ops", "people_hr"],
};

export async function getSubscriptionStatus(workspaceId: string) {
  const sub = await queryOne(
    `SELECT bs.*, bp.code as plan_code, bp.name as plan_name, bp.price_cents, bp.currency, bp.bill_interval, bp.max_users
     FROM billing_subscriptions bs
     JOIN billing_plans bp ON bp.id = bs.plan_id
     WHERE bs.workspace_id = ?
       AND bs.status IN ('ACTIVE', 'TRIAL')
       AND (bs.status != 'TRIAL' OR bs.trial_end_at > NOW())
     ORDER BY bs.created_at DESC LIMIT 1`,
    [workspaceId]
  );
  return sub || null;
}

export async function getActiveModules(workspaceId: string): Promise<string[]> {
  const sub = await getSubscriptionStatus(workspaceId);
  if (!sub) return ["web_builder"];

  if (sub.modules) {
    try {
      const mods = JSON.parse(sub.modules);
      if (Array.isArray(mods) && mods.length > 0) return mods;
    } catch {}
  }

  const planCode = sub.plan_code || "";
  return MODULE_PLAN_MAP[planCode] || ["web_builder"];
}

export async function requireActiveSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await queryOne("SELECT role, subscription_exempt FROM users WHERE id = ?", [userId]);
    if (user?.role === "admin") return next();
    if (user?.subscription_exempt) return next();

    const member = await queryOne(
      "SELECT wm.workspace_id FROM workspace_members wm WHERE wm.user_id = ? LIMIT 1",
      [userId]
    );

    if (!member) {
      return res.status(403).json({
        error: "subscription_required",
        message: "An active subscription is required to access this feature.",
      });
    }

    const sub = await getSubscriptionStatus(member.workspace_id);

    if (sub && (sub.status === "ACTIVE" || (sub.status === "TRIAL" && new Date(sub.trial_end_at) > new Date()))) {
      return next();
    }

    return res.status(403).json({
      error: "subscription_required",
      message: "An active subscription is required. Please subscribe to continue.",
    });
  } catch (err: any) {
    console.error("Feature gate error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}
