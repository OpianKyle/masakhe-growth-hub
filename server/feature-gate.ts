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
  // Masakhe platform access is free. Keep the workspace argument for callers
  // that still use this helper, but never derive feature access from billing.
  return ["web_builder", "social_biz", "transactions_ops", "people_hr"];
}

export async function requireActiveSubscription(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  return next();
}
