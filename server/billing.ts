import { Router } from "express";
import { queryOne, queryAll, execute, pool } from "./db";
import { requireAuth } from "./auth";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import { isMockMode, generateCheckoutToken, verifyResponseToken, extractCardDetailsFromResponse } from "./adumo";

export const billingRouter = Router();

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
    const token = generateCheckoutToken(merchantRef, amount);

    const user = await queryOne("SELECT full_name FROM users WHERE id = ?", [userId]);
    const bp = await queryOne("SELECT business_name, physical_address, phone FROM business_profiles WHERE user_id = ?", [userId]);

    const puid = `MSK-${workspaceId}`;

    const trialDays = 14;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + trialDays);
    const collectionDay = startDate.getDate();
    const startDateStr = startDate.toISOString().split("T")[0];

    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 5);
    const endDateStr = endDate.toISOString().split("T")[0];

    const userEmail = await queryOne("SELECT email FROM users WHERE id = ?", [userId]);

    const formData: Record<string, string> = {
      MerchantID: process.env.ADUMO_CUID!,
      ApplicationID: process.env.ADUMO_AUID!,
      MerchantReference: merchantRef,
      Amount: amount,
      Token: token,
      puid,
      txtCurrencyCode: "ZAR",
      RedirectSuccessfulURL: `${APP_URL}/api/billing/return-redirect?status=success&merchantRef=${merchantRef}`,
      RedirectFailedURL: `${APP_URL}/api/billing/return-redirect?status=failed&merchantRef=${merchantRef}`,
      NotifyURL: `${APP_URL}/api/billing/webhooks/adumo`,
      Variable1: "Subscription",
      Variable2: merchantRef,
      Qty1: "1",
      ItemRef1: plan.code,
      ItemDescr1: `Masakhe ${plan.name} Plan`,
      ItemAmount1: amount,
      ShippingCost: "0.00",
      Discount: "0.00",
      Recipient: user?.full_name || "Customer",
      ShippingAddress1: bp?.physical_address || "",
      ShippingAddress2: "",
      ShippingAddress3: "",
      ShippingAddress4: "",
      ShippingAddress5: "South Africa",

      frequency: "MONTHLY",
      collectionDay: String(collectionDay),
      accountNumber: `MSK-${workspaceId.slice(0, 12)}`,
      startDate: startDateStr,
      endDate: endDateStr,
      collectionValue: amount,
      contactNumber: bp?.phone || "",
      mobileNumber: bp?.phone || "",
      emailAddress: userEmail?.email || "",
      shouldSendSms: "false",
      shouldSendEmail: "true",
    };

    console.log("[Billing] Checkout form data for Adumo subscription:", JSON.stringify({
      MerchantReference: formData.MerchantReference,
      Amount: formData.Amount,
      frequency: formData.frequency,
      collectionDay: formData.collectionDay,
      startDate: formData.startDate,
      endDate: formData.endDate,
      collectionValue: formData.collectionValue,
      accountNumber: formData.accountNumber,
      emailAddress: formData.emailAddress,
      contactNumber: formData.contactNumber,
      mobileNumber: formData.mobileNumber,
      puid: formData.puid,
    }));

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

    const { _RESPONSE_TOKEN, _RESULT, _TRANSACTIONINDEX, _MERCHANTREFERENCE, _AMOUNT, _ERROR_CODE, _ERROR_MESSAGE, subscriptionId: bodySubId, _SUBSCRIPTIONID } = req.body;
    const adumoSubId = bodySubId || _SUBSCRIPTIONID || null;

    if (!_RESPONSE_TOKEN) {
      return res.status(400).json({ error: "Missing response token" });
    }

    let decoded: any;
    try {
      decoded = verifyResponseToken(_RESPONSE_TOKEN);
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

      const existingSub = await queryOne(
        "SELECT id FROM billing_subscriptions WHERE workspace_id = ? AND status IN ('TRIAL','ACTIVE')",
        [workspaceId]
      );

      let subscriptionId;
      if (existingSub) {
        await execute(
          "UPDATE billing_subscriptions SET status = 'TRIAL', plan_id = ?, trial_start_at = NOW(), trial_end_at = DATE_ADD(NOW(), INTERVAL 14 DAY), adumo_subscription_id = COALESCE(?, adumo_subscription_id), updated_at = NOW() WHERE id = ?",
          [plan.id, adumoSubId, existingSub.id]
        );
        subscriptionId = existingSub.id;
      } else {
        const subResult = await execute(
          "INSERT INTO billing_subscriptions (workspace_id, plan_id, status, trial_start_at, trial_end_at, adumo_subscription_id) VALUES (?, ?, 'TRIAL', NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY), ?)",
          [workspaceId, plan.id, adumoSubId]
        );
        subscriptionId = subResult.insertId;
      }

      await execute("UPDATE billing_invoices SET subscription_id = ? WHERE id = ?", [subscriptionId, invoice.id]);

      const cardDetails = extractCardDetailsFromResponse(decoded);
      const responsePuid = cardDetails.puid || `MSK-${workspaceId}`;
      const { profileToken, cardToken, last4, brand } = cardDetails;

      const existingPm = await queryOne("SELECT id FROM billing_payment_methods WHERE workspace_id = ?", [workspaceId]);
      if (existingPm) {
        await execute(
          `UPDATE billing_payment_methods SET provider = 'ADUMO', provider_payment_method_ref = ?, puid = ?, profile_token = ?, card_token = ?, last4 = COALESCE(?, last4), brand = COALESCE(?, brand), status = 'ON_FILE', updated_at = NOW() WHERE id = ?`,
          [_TRANSACTIONINDEX, responsePuid, profileToken, cardToken, last4, brand, existingPm.id]
        );
      } else {
        await execute(
          `INSERT INTO billing_payment_methods (workspace_id, provider, provider_payment_method_ref, puid, profile_token, card_token, last4, brand, status) VALUES (?, 'ADUMO', ?, ?, ?, ?, ?, ?, 'ON_FILE')`,
          [workspaceId, _TRANSACTIONINDEX, responsePuid, profileToken, cardToken, last4, brand]
        );
      }

      const subscription = await queryOne("SELECT * FROM billing_subscriptions WHERE id = ?", [subscriptionId]);
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

billingRouter.get("/return-redirect", async (req, res) => {
  try {
    const status = req.query.status as string || "";
    const merchantRef = (req.query.merchantRef || req.query._MERCHANTREFERENCE || req.query.MerchantReference) as string || "";
    const adumoResult = req.query._RESULT as string || "";
    const transactionIndex = req.query._TRANSACTIONINDEX as string || "";
    const responseToken = req.query._RESPONSE_TOKEN as string || "";
    const adumoSubId = (req.query.subscriptionId || req.query._SUBSCRIPTIONID) as string || "";

    console.log(`[Billing] Return redirect: status=${status}, merchantRef=${merchantRef}, _RESULT=${adumoResult}`);

    if (merchantRef) {
      const invoice = await queryOne("SELECT * FROM billing_invoices WHERE merchant_ref = ?", [merchantRef]);

      if (invoice && invoice.status === "PENDING") {
        const isSuccess = status === "success" || adumoResult === "0";

        if (isSuccess) {
          await execute("UPDATE billing_invoices SET status = 'PAID', paid_at = NOW(), provider_ref = ? WHERE id = ?", [transactionIndex || null, invoice.id]);

          const plan = await queryOne("SELECT * FROM billing_plans WHERE price_cents = ?", [invoice.amount_cents]);

          if (plan) {
            const existingSub = await queryOne(
              "SELECT id FROM billing_subscriptions WHERE workspace_id = ? AND status IN ('TRIAL','ACTIVE')",
              [invoice.workspace_id]
            );

            let subscriptionId;
            if (existingSub) {
              await execute(
                "UPDATE billing_subscriptions SET status = 'TRIAL', plan_id = ?, trial_start_at = NOW(), trial_end_at = DATE_ADD(NOW(), INTERVAL 14 DAY), adumo_subscription_id = COALESCE(?, adumo_subscription_id), updated_at = NOW() WHERE id = ?",
                [plan.id, adumoSubId || null, existingSub.id]
              );
              subscriptionId = existingSub.id;
            } else {
              const subResult = await execute(
                "INSERT INTO billing_subscriptions (workspace_id, plan_id, status, trial_start_at, trial_end_at, adumo_subscription_id) VALUES (?, ?, 'TRIAL', NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY), ?)",
                [invoice.workspace_id, plan.id, adumoSubId || null]
              );
              subscriptionId = subResult.insertId;
            }

            await execute("UPDATE billing_invoices SET subscription_id = ? WHERE id = ?", [subscriptionId, invoice.id]);
          }

          if (responseToken && process.env.ADUMO_JWT_SECRET) {
            try {
              const decoded = verifyResponseToken(responseToken);
              const cardDetails = extractCardDetailsFromResponse(decoded);
              const puid = cardDetails.puid || null;
              const { profileToken, cardToken, last4, brand } = cardDetails;

              const existingPm = await queryOne("SELECT id FROM billing_payment_methods WHERE workspace_id = ?", [invoice.workspace_id]);
              if (existingPm) {
                await execute(
                  `UPDATE billing_payment_methods SET provider = 'ADUMO', provider_payment_method_ref = ?, puid = COALESCE(?, puid), profile_token = COALESCE(?, profile_token), card_token = COALESCE(?, card_token), last4 = COALESCE(?, last4), brand = COALESCE(?, brand), status = 'ON_FILE', updated_at = NOW() WHERE id = ?`,
                  [transactionIndex, puid, profileToken, cardToken, last4, brand, existingPm.id]
                );
              } else {
                await execute(
                  `INSERT INTO billing_payment_methods (workspace_id, provider, provider_payment_method_ref, puid, profile_token, card_token, last4, brand, status) VALUES (?, 'ADUMO', ?, ?, ?, ?, ?, ?, 'ON_FILE')`,
                  [invoice.workspace_id, transactionIndex, puid, profileToken, cardToken, last4, brand]
                );
              }
            } catch (e: any) {
              console.warn("[Billing] Return redirect JWT parse error:", e.message);
            }
          }

          console.log(`[Billing] Return redirect: payment confirmed for merchantRef ${merchantRef}`);
        } else {
          const errorMsg = (req.query._ERROR_MESSAGE as string) || "Payment failed";
          await execute("UPDATE billing_invoices SET status = 'FAILED', failure_reason = ? WHERE id = ?", [errorMsg, invoice.id]);
          console.log(`[Billing] Return redirect: payment failed for merchantRef ${merchantRef}: ${errorMsg}`);
        }
      }
    }

    if (status === "success" || adumoResult === "0") {
      return res.redirect("/dashboard/billing?payment=success");
    } else {
      return res.redirect("/dashboard/billing?payment=failed");
    }
  } catch (err: any) {
    console.error("[Billing] Return redirect error:", err.message, err.stack);
    return res.redirect("/dashboard/billing?payment=error");
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
    console.log("[Billing Webhook] Received:", JSON.stringify(body));

    const eventKey = body._TRANSACTIONINDEX || body.TransactionIndex || `wh-${Date.now()}`;

    const alreadyProcessed = await queryOne(
      "SELECT id FROM billing_webhook_events WHERE event_key = ? AND status = 'PROCESSED'",
      [eventKey]
    );
    if (alreadyProcessed) {
      return res.json({ ok: true, message: "Already processed" });
    }

    await execute(
      "INSERT IGNORE INTO billing_webhook_events (provider, event_key, payload_json, status) VALUES ('ADUMO', ?, ?, 'RECEIVED')",
      [eventKey, JSON.stringify(body)]
    );

    if (body._RESPONSE_TOKEN && process.env.ADUMO_JWT_SECRET) {
      try {
        const decoded = verifyResponseToken(body._RESPONSE_TOKEN);
        console.log("[Billing Webhook] JWT verified, mref:", decoded.mref);
      } catch (e: any) {
        console.warn("[Billing Webhook] JWT verification failed:", e.message);
      }
    }

    const merchantRef = body._MERCHANTREFERENCE || body.MerchantReference;
    const result = String(body._RESULT ?? body.Result ?? "");
    const adumoSubId = body.subscriptionId || body.SubscriptionId || body._SUBSCRIPTIONID || null;
    const isRecurring = !!(body.isRecurring || body.IsRecurring || body._ISRECURRING || adumoSubId);

    if (isRecurring && adumoSubId) {
      const sub = await queryOne(
        "SELECT bs.*, bp.price_cents FROM billing_subscriptions bs JOIN billing_plans bp ON bp.id = bs.plan_id WHERE bs.adumo_subscription_id = ?",
        [adumoSubId]
      );

      if (sub) {
        const recurringRef = `MSK-REC-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const invoiceResult = await execute(
          "INSERT INTO billing_invoices (workspace_id, subscription_id, amount_cents, currency, status, merchant_ref, provider_ref) VALUES (?, ?, ?, 'ZAR', 'PENDING', ?, ?)",
          [sub.workspace_id, sub.id, sub.price_cents, recurringRef, eventKey]
        );

        if (result === "0") {
          await execute("UPDATE billing_invoices SET status = 'PAID', paid_at = NOW() WHERE id = ?", [invoiceResult.insertId]);
          await execute(
            "UPDATE billing_subscriptions SET status = 'ACTIVE', next_billing_at = DATE_ADD(NOW(), INTERVAL 1 MONTH), updated_at = NOW() WHERE id = ?",
            [sub.id]
          );
          console.log(`[Billing Webhook] Recurring charge succeeded for workspace ${sub.workspace_id}, adumo sub: ${adumoSubId}`);
        } else {
          const errorDetail = body._ERROR_MESSAGE || body._ERROR_CODE || body.ErrorMessage || "Recurring charge failed";
          await execute("UPDATE billing_invoices SET status = 'FAILED', failure_reason = ? WHERE id = ?", [errorDetail, invoiceResult.insertId]);
          await execute("UPDATE billing_subscriptions SET status = 'PAST_DUE', updated_at = NOW() WHERE id = ?", [sub.id]);
          console.log(`[Billing Webhook] Recurring charge failed for workspace ${sub.workspace_id}: ${errorDetail}`);
        }
      } else {
        console.warn("[Billing Webhook] Recurring charge for unknown adumo subscription:", adumoSubId);
      }
    } else if (merchantRef) {
      const invoice = await queryOne("SELECT * FROM billing_invoices WHERE merchant_ref = ?", [merchantRef]);
      if (invoice) {
        if (result === "0") {
          await execute(
            "UPDATE billing_invoices SET status = 'PAID', paid_at = NOW(), provider_ref = ? WHERE id = ?",
            [eventKey, invoice.id]
          );

          if (invoice.subscription_id) {
            const sub = await queryOne("SELECT status FROM billing_subscriptions WHERE id = ?", [invoice.subscription_id]);
            if (sub && sub.status !== 'ACTIVE' && sub.status !== 'TRIAL') {
              await execute("UPDATE billing_subscriptions SET status = 'ACTIVE', updated_at = NOW() WHERE id = ?", [invoice.subscription_id]);
            }
            if (adumoSubId) {
              await execute("UPDATE billing_subscriptions SET adumo_subscription_id = ?, updated_at = NOW() WHERE id = ?", [adumoSubId, invoice.subscription_id]);
            }
          } else {
            const plan = await queryOne("SELECT * FROM billing_plans WHERE price_cents = ?", [invoice.amount_cents]);
            if (plan) {
              const existingSub = await queryOne(
                "SELECT id FROM billing_subscriptions WHERE workspace_id = ? AND status IN ('TRIAL','ACTIVE')",
                [invoice.workspace_id]
              );
              if (!existingSub) {
                const subResult = await execute(
                  "INSERT INTO billing_subscriptions (workspace_id, plan_id, status, trial_start_at, trial_end_at, adumo_subscription_id) VALUES (?, ?, 'TRIAL', NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY), ?)",
                  [invoice.workspace_id, plan.id, adumoSubId]
                );
                await execute("UPDATE billing_invoices SET subscription_id = ? WHERE id = ?", [subResult.insertId, invoice.id]);
                console.log("[Billing Webhook] Created subscription via webhook for workspace:", invoice.workspace_id);
              } else if (adumoSubId) {
                await execute("UPDATE billing_subscriptions SET adumo_subscription_id = ?, updated_at = NOW() WHERE id = ?", [adumoSubId, existingSub.id]);
              }
            }
          }

          const existingPm = await queryOne("SELECT id FROM billing_payment_methods WHERE workspace_id = ?", [invoice.workspace_id]);
          if (existingPm) {
            await execute(
              "UPDATE billing_payment_methods SET provider = 'ADUMO', provider_payment_method_ref = ?, status = 'ON_FILE', updated_at = NOW() WHERE id = ?",
              [eventKey, existingPm.id]
            );
          } else {
            await execute(
              "INSERT INTO billing_payment_methods (workspace_id, provider, provider_payment_method_ref, status) VALUES (?, 'ADUMO', ?, 'ON_FILE')",
              [invoice.workspace_id, eventKey]
            );
          }
        } else {
          const errorDetail = body._ERROR_MESSAGE || body._ERROR_CODE || body.ErrorMessage || "Payment failed";
          await execute(
            "UPDATE billing_invoices SET status = 'FAILED', failure_reason = ? WHERE id = ?",
            [errorDetail, invoice.id]
          );
          if (invoice.subscription_id) {
            await execute("UPDATE billing_subscriptions SET status = 'PAST_DUE', updated_at = NOW() WHERE id = ?", [invoice.subscription_id]);
          }
        }
      } else {
        console.warn("[Billing Webhook] No invoice found for merchantRef:", merchantRef);
      }
    }

    await execute(
      "UPDATE billing_webhook_events SET status = 'PROCESSED', processed_at = NOW() WHERE event_key = ?",
      [eventKey]
    );

    console.log("[Billing Webhook] Processed event:", eventKey, "result:", result, "recurring:", isRecurring);
    res.json({ ok: true });
  } catch (err: any) {
    console.error("[Billing Webhook] Processing error:", err.message, err.stack);
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
