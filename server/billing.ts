import { Router } from "express";
import { queryOne, queryAll, execute, pool } from "./db";
import { requireAuth } from "./auth";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";

export const billingRouter = Router();

const isMockMode = !process.env.ADUMO_CUID || !process.env.ADUMO_AUID;

const ADUMO_URL = process.env.ADUMO_ENV === "production"
  ? "https://apiv3.adumoonline.com/product/payment/v1/initialisevirtual"
  : "https://staging-apiv3.adumoonline.com/product/payment/v1/initialisevirtual";

const APP_URL = process.env.APP_URL || `http://localhost:${process.env.PORT || 5000}`;

async function ensureDefaultWorkspace(userId: string): Promise<string> {
  const existing = await queryOne(
    "SELECT w.id FROM workspaces w JOIN workspace_members wm ON wm.workspace_id = w.id WHERE wm.user_id = ? LIMIT 1",
    [userId]
  );
  if (existing) return existing.id;

  const user = await queryOne("SELECT full_name FROM users WHERE id = ?", [userId]);
  const bp = await queryOne("SELECT business_name FROM business_profiles WHERE user_id = ?", [userId]);
  const wsName = bp?.business_name || `${user?.full_name}'s Business`;

  const wsId = randomUUID();
  const now = new Date().toISOString();
  await execute("INSERT INTO workspaces (id, name, owner_id, created_at, updated_at) VALUES (?,?,?,?,?)", [wsId, wsName, userId, now, now]);
  await execute("INSERT INTO workspace_members (id, workspace_id, user_id, role, created_at) VALUES (?,?,?,?,?)", [randomUUID(), wsId, userId, "owner", now]);
  return wsId;
}

billingRouter.get("/plans", async (_req, res) => {
  try {
    const plans = await queryAll("SELECT * FROM billing_plans ORDER BY price_cents ASC");
    res.json({ plans });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

billingRouter.get("/subscription", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const workspace = await queryOne(
      "SELECT w.id FROM workspaces w JOIN workspace_members wm ON wm.workspace_id = w.id WHERE wm.user_id = ? LIMIT 1",
      [userId]
    );
    if (!workspace) {
      return res.json({ subscription: null, plan: null, paymentMethod: null, mock: isMockMode });
    }

    const subscription = await queryOne(
      `SELECT bs.*, bp.code as plan_code, bp.name as plan_name, bp.price_cents, bp.currency, bp.bill_interval
       FROM billing_subscriptions bs
       JOIN billing_plans bp ON bp.id = bs.plan_id
       WHERE bs.workspace_id = ? AND bs.status IN ('TRIAL','ACTIVE','PAST_DUE')
       ORDER BY bs.created_at DESC LIMIT 1`,
      [workspace.id]
    );

    const paymentMethod = await queryOne(
      "SELECT * FROM billing_payment_methods WHERE workspace_id = ? AND status = 'ON_FILE' ORDER BY created_at DESC LIMIT 1",
      [workspace.id]
    );

    const invoices = await queryAll(
      "SELECT * FROM billing_invoices WHERE workspace_id = ? ORDER BY created_at DESC LIMIT 20",
      [workspace.id]
    );

    res.json({ subscription, plan: subscription ? { code: subscription.plan_code, name: subscription.plan_name, price_cents: subscription.price_cents, currency: subscription.currency, bill_interval: subscription.bill_interval } : null, paymentMethod, invoices, mock: isMockMode });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

billingRouter.get("/status", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const workspace = await queryOne(
      "SELECT w.id FROM workspaces w JOIN workspace_members wm ON wm.workspace_id = w.id WHERE wm.user_id = ? LIMIT 1",
      [userId]
    );
    if (!workspace) {
      return res.json({ active: false, status: null, mock: isMockMode });
    }

    const subscription = await queryOne(
      "SELECT status, trial_end_at FROM billing_subscriptions WHERE workspace_id = ? AND status IN ('TRIAL','ACTIVE') ORDER BY created_at DESC LIMIT 1",
      [workspace.id]
    );

    if (!subscription) {
      return res.json({ active: false, status: null, mock: isMockMode });
    }

    const active = subscription.status === 'ACTIVE' || (subscription.status === 'TRIAL' && new Date(subscription.trial_end_at) > new Date());
    res.json({ active, status: subscription.status, mock: isMockMode });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

billingRouter.post("/checkout-session", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { planCode } = req.body;

    if (!planCode || !['starter', 'pro'].includes(planCode)) {
      return res.status(400).json({ error: "Invalid plan code" });
    }

    const plan = await queryOne("SELECT * FROM billing_plans WHERE code = ?", [planCode]);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    const workspaceId = await ensureDefaultWorkspace(userId);

    const existingSub = await queryOne(
      "SELECT id FROM billing_subscriptions WHERE workspace_id = ? AND status IN ('TRIAL','ACTIVE')",
      [workspaceId]
    );
    if (existingSub) {
      return res.status(400).json({ error: "You already have an active subscription" });
    }

    const merchantRef = `MSK-${Date.now()}-${randomUUID().slice(0, 8)}`;

    const invoiceResult = await execute(
      "INSERT INTO billing_invoices (workspace_id, amount_cents, currency, status, merchant_ref) VALUES (?, ?, ?, 'PENDING', ?)",
      [workspaceId, plan.price_cents, plan.currency, merchantRef]
    );
    const invoiceId = invoiceResult.insertId;

    if (isMockMode) {
      return res.json({ mock: true, invoiceId, merchantRef, planCode });
    }

    const amount = (plan.price_cents / 100).toFixed(2);
    const token = jwt.sign(
      {
        mref: merchantRef,
        amount,
        auid: process.env.ADUMO_AUID,
        cuid: process.env.ADUMO_CUID,
      },
      process.env.ADUMO_JWT_SECRET!,
      { algorithm: "HS256", expiresIn: 600 }
    );

    const user = await queryOne("SELECT full_name FROM users WHERE id = ?", [userId]);
    const bp = await queryOne("SELECT business_name, physical_address FROM business_profiles WHERE user_id = ?", [userId]);

    const formData: Record<string, string> = {
      MerchantID: process.env.ADUMO_CUID!,
      ApplicationID: process.env.ADUMO_AUID!,
      MerchantReference: merchantRef,
      Amount: amount,
      Token: token,
      txtCurrencyCode: "ZAR",
      RedirectSuccessfulURL: `${APP_URL}/billing/return?status=success&merchantRef=${merchantRef}`,
      RedirectFailedURL: `${APP_URL}/billing/return?status=failed&merchantRef=${merchantRef}`,
      Variable1: "Subscription",
      Variable2: merchantRef,
      Qty1: "1",
      ItemRef1: plan.code,
      ItemDescr1: `Masakhe ${plan.name} Plan - 14 Day Trial then ${amount}/mo`,
      ItemAmount1: amount,
      ShippingCost: "0.00",
      Discount: "0.00",
      Recipient: user?.full_name || "Customer",
      ShippingAddress1: bp?.physical_address || "",
      ShippingAddress2: "",
      ShippingAddress3: "",
      ShippingAddress4: "",
      ShippingAddress5: "South Africa",
    };

    res.json({ mock: false, formAction: ADUMO_URL, formData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

billingRouter.post("/return", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const workspaceId = await ensureDefaultWorkspace(userId);

    if (isMockMode) {
      const { merchantRef, status } = req.body;
      if (!merchantRef) {
        return res.status(400).json({ error: "merchantRef required" });
      }

      const invoice = await queryOne("SELECT * FROM billing_invoices WHERE merchant_ref = ? AND workspace_id = ?", [merchantRef, workspaceId]);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      if (status === "success") {
        await execute("UPDATE billing_invoices SET status = 'PAID', paid_at = NOW() WHERE id = ?", [invoice.id]);

        const plan = await queryOne("SELECT * FROM billing_plans WHERE price_cents = ?", [invoice.amount_cents]);

        const existingSub = await queryOne(
          "SELECT id FROM billing_subscriptions WHERE workspace_id = ? AND status IN ('TRIAL','ACTIVE')",
          [workspaceId]
        );

        let subscriptionId;
        if (existingSub) {
          await execute(
            "UPDATE billing_subscriptions SET status = 'TRIAL', plan_id = ?, trial_start_at = NOW(), trial_end_at = DATE_ADD(NOW(), INTERVAL 14 DAY), updated_at = NOW() WHERE id = ?",
            [plan.id, existingSub.id]
          );
          subscriptionId = existingSub.id;
        } else {
          const subResult = await execute(
            "INSERT INTO billing_subscriptions (workspace_id, plan_id, status, trial_start_at, trial_end_at) VALUES (?, ?, 'TRIAL', NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY))",
            [workspaceId, plan.id]
          );
          subscriptionId = subResult.insertId;
        }

        await execute("UPDATE billing_invoices SET subscription_id = ? WHERE id = ?", [subscriptionId, invoice.id]);

        const existingPm = await queryOne("SELECT id FROM billing_payment_methods WHERE workspace_id = ?", [workspaceId]);
        if (existingPm) {
          await execute(
            "UPDATE billing_payment_methods SET last4 = '4242', brand = 'Visa', exp_month = 12, exp_year = 2026, status = 'ON_FILE', updated_at = NOW() WHERE id = ?",
            [existingPm.id]
          );
        } else {
          await execute(
            "INSERT INTO billing_payment_methods (workspace_id, provider, last4, brand, exp_month, exp_year, status) VALUES (?, 'MOCK', '4242', 'Visa', 12, 2026, 'ON_FILE')",
            [workspaceId]
          );
        }

        const subscription = await queryOne("SELECT * FROM billing_subscriptions WHERE id = ?", [subscriptionId]);
        return res.json({ ok: true, subscription });
      } else {
        await execute("UPDATE billing_invoices SET status = 'FAILED', failure_reason = 'Payment declined (mock)' WHERE id = ?", [invoice.id]);
        return res.json({ ok: false, error: "Payment failed" });
      }
    }

    const { _RESPONSE_TOKEN, _RESULT, _TRANSACTIONINDEX, _MERCHANTREFERENCE, _AMOUNT, _ERROR_CODE, _ERROR_MESSAGE } = req.body;

    if (!_RESPONSE_TOKEN) {
      return res.status(400).json({ error: "Missing response token" });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(_RESPONSE_TOKEN, process.env.ADUMO_JWT_SECRET!);
    } catch (e) {
      return res.status(400).json({ error: "Invalid response token" });
    }

    if (decoded.cuid !== process.env.ADUMO_CUID || decoded.auid !== process.env.ADUMO_AUID) {
      return res.status(400).json({ error: "Token validation failed" });
    }

    const invoice = await queryOne("SELECT * FROM billing_invoices WHERE merchant_ref = ? AND workspace_id = ?", [_MERCHANTREFERENCE || decoded.mref, workspaceId]);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    if (String(_RESULT) === "0") {
      await execute("UPDATE billing_invoices SET status = 'PAID', paid_at = NOW(), provider_ref = ? WHERE id = ?", [_TRANSACTIONINDEX, invoice.id]);

      const plan = await queryOne("SELECT * FROM billing_plans WHERE price_cents = ?", [invoice.amount_cents]);

      const subResult = await execute(
        "INSERT INTO billing_subscriptions (workspace_id, plan_id, status, trial_start_at, trial_end_at) VALUES (?, ?, 'TRIAL', NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY))",
        [workspaceId, plan.id]
      );

      await execute("UPDATE billing_invoices SET subscription_id = ? WHERE id = ?", [subResult.insertId, invoice.id]);

      await execute(
        "INSERT INTO billing_payment_methods (workspace_id, provider, provider_payment_method_ref, status) VALUES (?, 'ADUMO', ?, 'ON_FILE')",
        [workspaceId, _TRANSACTIONINDEX]
      );

      const subscription = await queryOne("SELECT * FROM billing_subscriptions WHERE id = ?", [subResult.insertId]);
      return res.json({ ok: true, subscription });
    } else {
      const errorDetail = _ERROR_MESSAGE || _ERROR_CODE || "Payment failed";
      await execute("UPDATE billing_invoices SET status = 'FAILED', failure_reason = ? WHERE id = ?", [errorDetail, invoice.id]);
      return res.json({ ok: false, error: errorDetail });
    }
  } catch (err: any) {
    console.error("[Billing] Return handler error:", err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});

billingRouter.post("/cancel", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const workspace = await queryOne(
      "SELECT w.id FROM workspaces w JOIN workspace_members wm ON wm.workspace_id = w.id WHERE wm.user_id = ? LIMIT 1",
      [userId]
    );
    if (!workspace) {
      return res.status(404).json({ error: "No workspace found" });
    }

    const subscription = await queryOne(
      "SELECT id FROM billing_subscriptions WHERE workspace_id = ? AND status IN ('TRIAL','ACTIVE')",
      [workspace.id]
    );
    if (!subscription) {
      return res.status(404).json({ error: "No active subscription found" });
    }

    await execute(
      "UPDATE billing_subscriptions SET status = 'CANCELLED', cancelled_at = NOW(), updated_at = NOW() WHERE id = ?",
      [subscription.id]
    );

    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

billingRouter.post("/webhooks/adumo", async (req, res) => {
  try {
    const body = req.body;
    const eventKey = body._TRANSACTIONINDEX;
    if (!eventKey) {
      return res.status(400).json({ error: "Missing transaction index" });
    }

    await execute(
      "INSERT IGNORE INTO billing_webhook_events (provider, event_key, payload_json, status) VALUES ('ADUMO', ?, ?, 'RECEIVED')",
      [eventKey, JSON.stringify(body)]
    );

    const merchantRef = body._MERCHANTREFERENCE;
    if (merchantRef) {
      const invoice = await queryOne("SELECT * FROM billing_invoices WHERE merchant_ref = ?", [merchantRef]);
      if (invoice) {
        if (String(body._RESULT) === "0") {
          await execute("UPDATE billing_invoices SET status = 'PAID', paid_at = NOW(), provider_ref = ? WHERE id = ?", [eventKey, invoice.id]);
          if (invoice.subscription_id) {
            await execute("UPDATE billing_subscriptions SET status = 'ACTIVE', updated_at = NOW() WHERE id = ?", [invoice.subscription_id]);
          }
        } else {
          const errorDetail = body._ERROR_MESSAGE || body._ERROR_CODE || "Payment failed";
          await execute("UPDATE billing_invoices SET status = 'FAILED', failure_reason = ? WHERE id = ?", [errorDetail, invoice.id]);
          if (invoice.subscription_id) {
            await execute("UPDATE billing_subscriptions SET status = 'PAST_DUE', updated_at = NOW() WHERE id = ?", [invoice.subscription_id]);
          }
        }
      }
    }

    await execute(
      "UPDATE billing_webhook_events SET status = 'PROCESSED', processed_at = NOW() WHERE event_key = ?",
      [eventKey]
    );

    res.json({ ok: true });
  } catch (err: any) {
    console.error("Webhook processing error:", err.message);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

billingRouter.post("/mock/simulate-charge", requireAuth, async (req, res) => {
  if (!isMockMode) {
    return res.status(400).json({ error: "Only available in mock mode" });
  }

  try {
    const userId = req.session.userId!;
    const { success } = req.body;

    const workspace = await queryOne(
      "SELECT w.id FROM workspaces w JOIN workspace_members wm ON wm.workspace_id = w.id WHERE wm.user_id = ? LIMIT 1",
      [userId]
    );
    if (!workspace) {
      return res.status(404).json({ error: "No workspace found" });
    }

    const subscription = await queryOne(
      `SELECT bs.*, bp.price_cents, bp.currency
       FROM billing_subscriptions bs
       JOIN billing_plans bp ON bp.id = bs.plan_id
       WHERE bs.workspace_id = ? AND bs.status IN ('TRIAL','ACTIVE')
       ORDER BY bs.created_at DESC LIMIT 1`,
      [workspace.id]
    );
    if (!subscription) {
      return res.status(404).json({ error: "No active subscription" });
    }

    const merchantRef = `MSK-${Date.now()}-${randomUUID().slice(0, 8)}`;

    const invoiceResult = await execute(
      "INSERT INTO billing_invoices (workspace_id, subscription_id, amount_cents, currency, status, merchant_ref) VALUES (?, ?, ?, ?, 'PENDING', ?)",
      [workspace.id, subscription.id, subscription.price_cents, subscription.currency, merchantRef]
    );

    if (success !== false) {
      await execute("UPDATE billing_invoices SET status = 'PAID', paid_at = NOW() WHERE id = ?", [invoiceResult.insertId]);
      await execute(
        "UPDATE billing_subscriptions SET status = 'ACTIVE', next_billing_at = DATE_ADD(NOW(), INTERVAL 1 MONTH), updated_at = NOW() WHERE id = ?",
        [subscription.id]
      );
      res.json({ ok: true, status: "PAID", invoiceId: invoiceResult.insertId });
    } else {
      await execute("UPDATE billing_invoices SET status = 'FAILED', failure_reason = 'Simulated failure' WHERE id = ?", [invoiceResult.insertId]);
      await execute(
        "UPDATE billing_subscriptions SET status = 'PAST_DUE', updated_at = NOW() WHERE id = ?",
        [subscription.id]
      );
      res.json({ ok: true, status: "FAILED", invoiceId: invoiceResult.insertId });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
