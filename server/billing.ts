import { Router } from "express";
import { queryOne, queryAll, execute } from "./db";
import { requireAuth } from "./auth";
import { randomUUID } from "crypto";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { generateSubscriptionToken, verifyResponseToken } from "./adumo";

export const billingRouter = Router();

const ADUMO_URL = process.env.ADUMO_ENV === "production"
  ? "https://apiv3.adumoonline.com/product/payment/v1/initialisevirtual"
  : "https://staging-apiv3.adumoonline.com/product/payment/v1/initialisevirtual";

const APP_URL = process.env.ADUMO_ENV === "production"
  ? (process.env.APP_URL || "https://masakheportal.co.za")
  : `https://${process.env.REPLIT_DEV_DOMAIN || `localhost:${process.env.PORT || 5000}`}`;

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

billingRouter.get("/terms-pdf", async (_req, res) => {
  try {
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 10;
    const titleSize = 18;
    const headingSize = 12;
    const lineHeight = 16;
    const margin = 50;

    const addPage = () => {
      const page = pdf.addPage([595, 842]);
      return { page, y: 842 - margin };
    };

    let { page, y } = addPage();
    const pageWidth = 595 - margin * 2;

    const drawText = (text: string, options: { font?: any; size?: number; indent?: number } = {}) => {
      const f = options.font || font;
      const s = options.size || fontSize;
      const indent = options.indent || 0;
      const maxWidth = pageWidth - indent;
      const words = text.split(" ");
      let line = "";

      for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;
        const testWidth = f.widthOfTextAtSize(testLine, s);
        if (testWidth > maxWidth && line) {
          if (y < margin + 20) {
            ({ page, y } = addPage());
          }
          page.drawText(line, { x: margin + indent, y, size: s, font: f, color: rgb(0.1, 0.1, 0.1) });
          y -= lineHeight;
          line = word;
        } else {
          line = testLine;
        }
      }
      if (line) {
        if (y < margin + 20) {
          ({ page, y } = addPage());
        }
        page.drawText(line, { x: margin + indent, y, size: s, font: f, color: rgb(0.1, 0.1, 0.1) });
        y -= lineHeight;
      }
    };

    const spacer = (n = 1) => { y -= lineHeight * n; };

    drawText("MASAKHE PLATFORM", { font: fontBold, size: titleSize });
    drawText("SUBSCRIPTION TERMS AND CONDITIONS", { font: fontBold, size: 14 });
    spacer();
    drawText(`Effective Date: ${new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}`);
    spacer();

    drawText("1. SUBSCRIPTION AND RECURRING BILLING", { font: fontBold, size: headingSize });
    spacer(0.5);
    drawText("1.1 By subscribing to Masakhe, you authorise a recurring debit order to be processed against your nominated bank account or payment method on the selected collection day each month.", { indent: 10 });
    spacer(0.5);
    drawText("1.2 Billing will continue automatically each month until you cancel your subscription in accordance with Section 2 below.", { indent: 10 });
    spacer(0.5);
    drawText("1.3 The subscription amount corresponds to the plan selected at checkout (Starter or Pro) and is denominated in South African Rand (ZAR).", { indent: 10 });
    spacer();

    drawText("2. CANCELLATION POLICY", { font: fontBold, size: headingSize });
    spacer(0.5);
    drawText("2.1 Your subscription will NOT be suspended or cancelled automatically. It will remain active and you will continue to be billed until a cancellation request is received and processed.", { indent: 10 });
    spacer(0.5);
    drawText("2.2 To cancel your subscription, you must send a written cancellation request via email to: support@masakhe.co.za", { indent: 10 });
    spacer(0.5);
    drawText("2.3 Cancellation requests will be processed within 5 (five) business days of receipt. You will receive an email confirmation once your cancellation has been processed.", { indent: 10 });
    spacer(0.5);
    drawText("2.4 You remain responsible for all charges incurred up to and including the date your cancellation is confirmed.", { indent: 10 });
    spacer();

    drawText("3. SUBSCRIPTIONS", { font: fontBold, size: headingSize });
    spacer(0.5);
    drawText("3.1 Subscriptions are activated immediately upon successful payment processing.", { indent: 10 });
    spacer(0.5);
    drawText("3.2 There is no free trial period. All plans are billed from the date of subscription.", { indent: 10 });
    spacer(0.5);
    drawText("3.3 Trial access may be granted at the sole discretion of Masakhe on a case-by-case basis.", { indent: 10 });
    spacer();

    drawText("4. REFUND POLICY", { font: fontBold, size: headingSize });
    spacer(0.5);
    drawText("4.1 Subscription fees are non-refundable once processed.", { indent: 10 });
    spacer(0.5);
    drawText("4.2 You may cancel at any time, but no partial or pro-rated refunds will be issued for the remaining billing period.", { indent: 10 });
    spacer();

    drawText("5. PRICING AND SERVICE CHANGES", { font: fontBold, size: headingSize });
    spacer(0.5);
    drawText("5.1 Masakhe reserves the right to update subscription pricing or platform features.", { indent: 10 });
    spacer(0.5);
    drawText("5.2 You will be given at least 30 (thirty) days written notice of any pricing changes via email.", { indent: 10 });
    spacer(0.5);
    drawText("5.3 Continued use of the platform after receiving such notice constitutes acceptance of the updated terms.", { indent: 10 });
    spacer();

    drawText("6. PAYMENT PROCESSING", { font: fontBold, size: headingSize });
    spacer(0.5);
    drawText("6.1 All payments are processed securely through Adumo Online, a registered South African payment gateway.", { indent: 10 });
    spacer(0.5);
    drawText("6.2 Masakhe does not store your banking or card details on its servers.", { indent: 10 });
    spacer(0.5);
    drawText("6.3 If a scheduled debit order fails, Masakhe may reattempt collection. Repeated failures may result in service suspension after written notice.", { indent: 10 });
    spacer();

    drawText("7. CONTACT INFORMATION", { font: fontBold, size: headingSize });
    spacer(0.5);
    drawText("For billing enquiries, cancellations, or support:", { indent: 10 });
    drawText("Email: support@masakhe.co.za", { indent: 10 });
    spacer(2);

    drawText("By checking the acceptance box on the checkout page, you confirm that you have read, understood, and agree to these Terms and Conditions.", { font: fontBold });

    const pdfBytes = await pdf.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="Masakhe_Terms_and_Conditions.pdf"');
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

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
    const user = await queryOne("SELECT role FROM users WHERE id = ?", [userId]);
    
    // Admin users always have pro access
    if (user?.role === "admin") {
      const adminPlan = await queryOne("SELECT * FROM billing_plans WHERE code = 'pro' LIMIT 1");
      return res.json({
        subscription: {
          status: "ACTIVE",
          plan_code: "pro",
          plan_name: "Pro",
          price_cents: adminPlan?.price_cents || 250000,
          currency: "ZAR",
          bill_interval: "month"
        },
        plan: adminPlan || { code: "pro", name: "Pro" },
        invoices: []
      });
    }
    
    const workspace = await queryOne(
      "SELECT w.id, w.created_at FROM workspaces w JOIN workspace_members wm ON wm.workspace_id = w.id WHERE wm.user_id = ? LIMIT 1",
      [userId]
    );
    if (!workspace) {
      return res.json({ subscription: null, plan: null, invoices: [] });
    }

    let subscription = await queryOne(
      `SELECT bs.*, bp.code as plan_code, bp.name as plan_name, bp.price_cents, bp.currency, bp.bill_interval
       FROM billing_subscriptions bs
       JOIN billing_plans bp ON bp.id = bs.plan_id
       WHERE bs.workspace_id = ?
         AND bs.status IN ('ACTIVE','PAST_DUE','TRIAL')
         AND (bs.status != 'TRIAL' OR bs.trial_end_at > NOW())
       ORDER BY bs.created_at DESC LIMIT 1`,
      [workspace.id]
    );

    const invoices = await queryAll(
      "SELECT * FROM billing_invoices WHERE workspace_id = ? ORDER BY created_at DESC LIMIT 20",
      [workspace.id]
    );

    res.json({
      subscription,
      plan: subscription ? { code: subscription.plan_code, name: subscription.plan_name, price_cents: subscription.price_cents, currency: subscription.currency, bill_interval: subscription.bill_interval } : null,
      invoices,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

billingRouter.get("/status", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const user = await queryOne("SELECT role FROM users WHERE id = ?", [userId]);
    
    // Admin users always have pro access
    if (user?.role === "admin") {
      return res.json({ active: true, status: "ACTIVE", plan: "pro" });
    }
    
    const workspace = await queryOne(
      "SELECT w.id, w.created_at FROM workspaces w JOIN workspace_members wm ON wm.workspace_id = w.id WHERE wm.user_id = ? LIMIT 1",
      [userId]
    );
    if (!workspace) {
      return res.json({ active: false, status: null, plan: null });
    }

    const subscription = await queryOne(
      `SELECT bs.status, bs.plan_id, bp.code as plan_code, bs.trial_end_at
       FROM billing_subscriptions bs
       LEFT JOIN billing_plans bp ON bp.id = bs.plan_id
       WHERE bs.workspace_id = ?
         AND bs.status IN ('ACTIVE','TRIAL')
         AND (bs.status != 'TRIAL' OR bs.trial_end_at > NOW())
       ORDER BY bs.created_at DESC LIMIT 1`,
      [workspace.id]
    );

    if (!subscription) {
      return res.json({ active: false, status: null, plan: null });
    }

    res.json({ active: true, status: subscription.status, plan: subscription.plan_code || null, trialEndsAt: subscription.trial_end_at || null });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

billingRouter.get("/access-status", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const user = await queryOne("SELECT role FROM users WHERE id = ?", [userId]);

    if (user?.role === "admin") {
      return res.json({ blocked: false, showPayNow: false, daysUntilBilling: null, nextBillingDate: null, subscriptionStatus: "ACTIVE" });
    }

    const workspace = await queryOne(
      "SELECT w.id FROM workspaces w JOIN workspace_members wm ON wm.workspace_id = w.id WHERE wm.user_id = ? LIMIT 1",
      [userId]
    );
    if (!workspace) {
      return res.json({ blocked: false, showPayNow: false, daysUntilBilling: null, nextBillingDate: null, subscriptionStatus: null });
    }

    const subscription = await queryOne(
      `SELECT bs.status, bs.next_billing_at, bs.trial_end_at, bs.plan_id,
              bp.name as plan_name, bp.price_cents
       FROM billing_subscriptions bs
       JOIN billing_plans bp ON bp.id = bs.plan_id
       WHERE bs.workspace_id = ?
       ORDER BY bs.created_at DESC LIMIT 1`,
      [workspace.id]
    );

    if (!subscription) {
      return res.json({ blocked: false, showPayNow: false, daysUntilBilling: null, nextBillingDate: null, subscriptionStatus: null });
    }

    const now = new Date();
    const status = subscription.status;

    if (status === "TRIAL") {
      const trialEnd = subscription.trial_end_at ? new Date(subscription.trial_end_at) : null;
      const expired = trialEnd && trialEnd < now;
      return res.json({ blocked: !!expired, showPayNow: false, daysUntilBilling: null, nextBillingDate: null, subscriptionStatus: "TRIAL" });
    }

    if (status === "CANCELLED") {
      return res.json({ blocked: false, showPayNow: false, daysUntilBilling: null, nextBillingDate: null, subscriptionStatus: "CANCELLED" });
    }

    const nextBilling = subscription.next_billing_at ? new Date(subscription.next_billing_at) : null;
    let daysUntilBilling: number | null = null;
    let blocked = false;
    let showPayNow = false;

    if (nextBilling) {
      const msUntil = nextBilling.getTime() - now.getTime();
      daysUntilBilling = Math.ceil(msUntil / (1000 * 60 * 60 * 24));

      if (daysUntilBilling <= 5) showPayNow = true;

      if (daysUntilBilling < -3) blocked = true;
    }

    if (status === "PAST_DUE") {
      const pendingInvoice = await queryOne(
        `SELECT created_at FROM billing_invoices
         WHERE workspace_id = ? AND status = 'PENDING'
         ORDER BY created_at DESC LIMIT 1`,
        [workspace.id]
      );
      if (pendingInvoice) {
        const daysOverdue = Math.floor((now.getTime() - new Date(pendingInvoice.created_at).getTime()) / (1000 * 60 * 60 * 24));
        if (daysOverdue >= 3) blocked = true;
      } else {
        blocked = true;
      }
      showPayNow = true;
    }

    res.json({
      blocked,
      showPayNow,
      daysUntilBilling,
      nextBillingDate: nextBilling ? nextBilling.toISOString() : null,
      subscriptionStatus: status,
      planName: subscription.plan_name,
      amountCents: subscription.price_cents,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

billingRouter.post("/checkout-session", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const {
      planCode,
      recipientName,
      email,
      contactNumber,
      mobileNumber,
      collectionDay: clientCollectionDay,
      startDate: clientStartDate,
      shippingAddress1,
      shippingAddress2,
      shippingAddress3,
    } = req.body;

    if (!planCode || !['starter', 'pro', 'premium'].includes(planCode)) {
      return res.status(400).json({ error: "Invalid plan code" });
    }

    if (!process.env.ADUMO_CUID || !process.env.ADUMO_AUID || !process.env.ADUMO_JWT_SECRET) {
      return res.status(500).json({ error: "Payment gateway not configured" });
    }

    const plan = await queryOne("SELECT * FROM billing_plans WHERE code = ?", [planCode]);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    const workspaceId = await ensureDefaultWorkspace(userId);

    const existingSub = await queryOne(
      "SELECT id, status FROM billing_subscriptions WHERE workspace_id = ? AND status IN ('TRIAL','ACTIVE')",
      [workspaceId]
    );
    if (existingSub && existingSub.status === "ACTIVE") {
      return res.status(400).json({ error: "You already have an active subscription" });
    }

    const refSuffix = randomUUID().replace(/-/g, "").slice(0, 8);
    const merchantRef = `SUB_${refSuffix}`;
    const amount = (plan.price_cents / 100).toFixed(2);
    const puid = randomUUID();

    await execute(
      "INSERT INTO billing_invoices (workspace_id, plan_id, amount_cents, currency, status, merchant_ref) VALUES (?, ?, ?, ?, 'PENDING', ?)",
      [workspaceId, plan.id, plan.price_cents, plan.currency, merchantRef]
    );

    const token = generateSubscriptionToken(merchantRef, amount);

    const chosenCollectionDay = Math.max(1, Math.min(28, parseInt(clientCollectionDay) || 1));

    const startDateObj = clientStartDate ? new Date(clientStartDate) : (() => {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      d.setDate(chosenCollectionDay);
      return d;
    })();
    const startDateStr = startDateObj.toISOString().split("T")[0];

    const endDateObj = new Date(startDateObj);
    endDateObj.setFullYear(endDateObj.getFullYear() + 2);
    const endDateStr = endDateObj.toISOString().split("T")[0];

    const userRecord = await queryOne("SELECT full_name, email FROM users WHERE id = ?", [userId]);

    const fields: Record<string, string> = {
      puid,
      MerchantID: process.env.ADUMO_CUID!,
      ApplicationID: process.env.ADUMO_AUID!,
      MerchantReference: merchantRef,
      Amount: amount,
      Token: token,
      txtCurrencyCode: plan.currency || "ZAR",
      RedirectSuccessfulURL: `${APP_URL}/api/billing/return-redirect?status=success&merchantRef=${merchantRef}`,
      RedirectFailedURL: `${APP_URL}/api/billing/return-redirect?status=failed&merchantRef=${merchantRef}`,
      Variable1: "Subscription",
      Variable2: merchantRef,
      Qty1: "1",
      ItemRef1: plan.code,
      ItemDescr1: `${plan.name} Plan Subscription`,
      ItemAmount1: amount,
      ShippingCost: "0.00",
      Discount: "0.00",
      Recipient: recipientName || userRecord?.full_name || "Customer",
      ShippingAddress1: shippingAddress1 || "",
      ShippingAddress2: shippingAddress2 || "",
      ShippingAddress3: shippingAddress3 || "",
      frequency: "MONTHLY",
      collectionDay: String(chosenCollectionDay),
      accountNumber: `ACC_${Date.now()}`,
      startDate: startDateStr,
      endDate: endDateStr,
      collectionValue: amount,
      contactNumber: contactNumber || "",
      mobileNumber: mobileNumber || contactNumber || "",
      emailAddress: email || userRecord?.email || "",
      shouldSendSms: "false",
      shouldSendEmail: "true",
    };

    console.log("[Billing] Checkout session created:", JSON.stringify({
      MerchantReference: fields.MerchantReference,
      Amount: fields.Amount,
      ApplicationID: fields.ApplicationID,
      frequency: fields.frequency,
      collectionDay: fields.collectionDay,
      startDate: fields.startDate,
      endDate: fields.endDate,
      Recipient: fields.Recipient,
      emailAddress: fields.emailAddress,
    }));

    res.json({ formAction: ADUMO_URL, fields });
  } catch (err: any) {
    console.error("[Billing] Checkout session error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

billingRouter.post("/manual-payment", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { planCode, recipientName, email, contactNumber } = req.body;

    if (!planCode || !["starter", "pro", "premium"].includes(planCode)) {
      return res.status(400).json({ error: "Invalid plan code" });
    }
    if (!process.env.ADUMO_CUID || !process.env.ADUMO_AUID || !process.env.ADUMO_JWT_SECRET) {
      return res.status(500).json({ error: "Payment gateway not configured" });
    }

    const plan = await queryOne("SELECT * FROM billing_plans WHERE code = ?", [planCode]);
    if (!plan) return res.status(404).json({ error: "Plan not found" });

    const workspaceId = await ensureDefaultWorkspace(userId);
    const refSuffix = randomUUID().replace(/-/g, "").slice(0, 8);
    const merchantRef = `PAY_${refSuffix}`;
    const amount = (plan.price_cents / 100).toFixed(2);
    const puid = randomUUID();

    await execute(
      "INSERT INTO billing_invoices (workspace_id, plan_id, amount_cents, currency, status, merchant_ref) VALUES (?, ?, ?, ?, 'PENDING', ?)",
      [workspaceId, plan.id, plan.price_cents, plan.currency, merchantRef]
    );

    const token = generateSubscriptionToken(merchantRef, amount);
    const userRecord = await queryOne("SELECT full_name, email FROM users WHERE id = ?", [userId]);

    const fields: Record<string, string> = {
      puid,
      MerchantID: process.env.ADUMO_CUID!,
      ApplicationID: process.env.ADUMO_AUID!,
      MerchantReference: merchantRef,
      Amount: amount,
      Token: token,
      txtCurrencyCode: plan.currency || "ZAR",
      RedirectSuccessfulURL: `${APP_URL}/api/billing/return-redirect?status=success&merchantRef=${merchantRef}`,
      RedirectFailedURL: `${APP_URL}/api/billing/return-redirect?status=failed&merchantRef=${merchantRef}`,
      Variable1: "ManualPayment",
      Variable2: merchantRef,
      Qty1: "1",
      ItemRef1: plan.code,
      ItemDescr1: `${plan.name} – Monthly Subscription`,
      ItemAmount1: amount,
      ShippingCost: "0.00",
      Discount: "0.00",
      Recipient: recipientName || userRecord?.full_name || "Customer",
      contactNumber: contactNumber || "",
      emailAddress: email || userRecord?.email || "",
      shouldSendSms: "false",
      shouldSendEmail: "true",
    };

    console.log("[Billing] Manual payment session created:", { MerchantReference: merchantRef, Amount: amount });
    res.json({ formAction: ADUMO_URL, fields });
  } catch (err: any) {
    console.error("[Billing] Manual payment error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

async function handleReturnRedirect(req: any, res: any) {
  try {
    const q = { ...req.body, ...req.query };
    const status = (q.status || q._STATUS || "") as string;
    const merchantRef = (q.merchantRef || q._MERCHANTREFERENCE || q.MerchantReference || "") as string;
    const adumoResult = (q._RESULT || "") as string;
    const responseToken = (q._RESPONSE_TOKEN || "") as string;
    const adumoSubId = (q.subscriptionId || q._SUBSCRIPTIONID || "") as string;

    console.log(`[Billing] Return redirect: status=${status}, merchantRef=${merchantRef}, _RESULT=${adumoResult}, subscriptionId=${adumoSubId}`);

    if (!merchantRef) {
      console.warn("[Billing] Return redirect without merchantRef");
      return res.redirect("/dashboard/billing?payment=error");
    }

    const invoice = await queryOne("SELECT * FROM billing_invoices WHERE merchant_ref = ? AND status = 'PENDING'", [merchantRef]);

    if (!invoice) {
      console.warn(`[Billing] No pending invoice found for merchantRef=${merchantRef}`);
      return res.redirect("/dashboard/billing?payment=error");
    }

    const isStatusSuccess = status === "success" || adumoResult === "0";

    if (!isStatusSuccess) {
      const errorMsg = (req.query._ERROR_MESSAGE as string) || "Payment declined";
      await execute("UPDATE billing_invoices SET status = 'FAILED', failure_reason = ? WHERE id = ?", [errorMsg, invoice.id]);
      console.log(`[Billing] Payment failed for merchantRef=${merchantRef}: ${errorMsg}`);
      return res.redirect("/dashboard/billing?payment=failed");
    }

    let decoded: any = null;
    if (responseToken) {
      try {
        decoded = verifyResponseToken(responseToken);
        if (decoded.mref && decoded.mref !== merchantRef) {
          console.error(`[Billing] Token mref mismatch: expected ${merchantRef}, got ${decoded.mref}`);
          await execute("UPDATE billing_invoices SET status = 'FAILED', failure_reason = 'Token verification failed: mref mismatch' WHERE id = ?", [invoice.id]);
          return res.redirect("/dashboard/billing?payment=error");
        }
        const expectedAmount = (invoice.amount_cents / 100).toFixed(2);
        if (decoded.amount && decoded.amount !== expectedAmount) {
          console.error(`[Billing] Token amount mismatch: expected ${expectedAmount}, got ${decoded.amount}`);
          await execute("UPDATE billing_invoices SET status = 'FAILED', failure_reason = 'Token verification failed: amount mismatch' WHERE id = ?", [invoice.id]);
          return res.redirect("/dashboard/billing?payment=error");
        }
        console.log(`[Billing] Response token verified successfully for merchantRef=${merchantRef}`);
      } catch (e: any) {
        console.error(`[Billing] Response token verification failed for merchantRef=${merchantRef}:`, e.message);
        await execute("UPDATE billing_invoices SET status = 'FAILED', failure_reason = ? WHERE id = ?", [`Token verification failed: ${e.message}`, invoice.id]);
        return res.redirect("/dashboard/billing?payment=error");
      }
    } else {
      console.warn(`[Billing] No response token received for merchantRef=${merchantRef}`);
      if (process.env.ADUMO_ENV === "production") {
        await execute("UPDATE billing_invoices SET status = 'FAILED', failure_reason = 'No response token received' WHERE id = ?", [invoice.id]);
        return res.redirect("/dashboard/billing?payment=error");
      }
    }

    await execute("UPDATE billing_invoices SET status = 'PAID', paid_at = NOW() WHERE id = ?", [invoice.id]);

    const plan = invoice.plan_id
      ? await queryOne("SELECT * FROM billing_plans WHERE id = ?", [invoice.plan_id])
      : await queryOne("SELECT * FROM billing_plans WHERE price_cents = ?", [invoice.amount_cents]);

    if (plan) {
      const existingSub = await queryOne(
        "SELECT id FROM billing_subscriptions WHERE workspace_id = ? AND status IN ('TRIAL','ACTIVE','PAST_DUE')",
        [invoice.workspace_id]
      );

      const isManualPayment = merchantRef.startsWith("PAY_");
      const nextBillingAt = isManualPayment
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ")
        : null;

      let subscriptionId;
      if (existingSub) {
        if (isManualPayment) {
          await execute(
            "UPDATE billing_subscriptions SET status = 'ACTIVE', plan_id = ?, next_billing_at = ?, updated_at = NOW() WHERE id = ?",
            [plan.id, nextBillingAt, existingSub.id]
          );
        } else {
          await execute(
            "UPDATE billing_subscriptions SET status = 'ACTIVE', plan_id = ?, adumo_subscription_id = COALESCE(?, adumo_subscription_id), updated_at = NOW() WHERE id = ?",
            [plan.id, adumoSubId || null, existingSub.id]
          );
        }
        subscriptionId = existingSub.id;
      } else {
        if (isManualPayment) {
          const subResult = await execute(
            "INSERT INTO billing_subscriptions (workspace_id, plan_id, status, next_billing_at) VALUES (?, ?, 'ACTIVE', ?)",
            [invoice.workspace_id, plan.id, nextBillingAt]
          );
          subscriptionId = subResult.insertId;
        } else {
          const subResult = await execute(
            "INSERT INTO billing_subscriptions (workspace_id, plan_id, status, adumo_subscription_id) VALUES (?, ?, 'ACTIVE', ?)",
            [invoice.workspace_id, plan.id, adumoSubId || null]
          );
          subscriptionId = subResult.insertId;
        }
      }

      await execute("UPDATE billing_invoices SET subscription_id = ? WHERE id = ?", [subscriptionId, invoice.id]);

      if (decoded) {
        try {
          const maskedCard = decoded.maskedCardNumber || decoded.masked_card || null;
          const last4 = maskedCard ? maskedCard.slice(-4) : null;
          const brand = decoded.cardBrand || decoded.card_brand || null;

          const existingPm = await queryOne("SELECT id FROM billing_payment_methods WHERE workspace_id = ?", [invoice.workspace_id]);
          if (existingPm) {
            await execute(
              "UPDATE billing_payment_methods SET provider = 'ADUMO', last4 = COALESCE(?, last4), brand = COALESCE(?, brand), status = 'ON_FILE', updated_at = NOW() WHERE id = ?",
              [last4, brand, existingPm.id]
            );
          } else {
            await execute(
              "INSERT INTO billing_payment_methods (workspace_id, provider, last4, brand, status) VALUES (?, 'ADUMO', ?, ?, 'ON_FILE')",
              [invoice.workspace_id, last4, brand]
            );
          }
        } catch (e: any) {
          console.warn("[Billing] Could not extract card details from response token:", e.message);
        }
      }

      console.log(`[Billing] Subscription created via redirect for workspace ${invoice.workspace_id}`);
    }

    return res.redirect("/dashboard/billing?payment=success");
  } catch (err: any) {
    console.error("[Billing] Return redirect error:", err.message, err.stack);
    return res.redirect("/dashboard/billing?payment=error");
  }
}

billingRouter.get("/return-redirect", handleReturnRedirect);
billingRouter.post("/return-redirect", handleReturnRedirect);

billingRouter.post("/change-plan", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { newPlanCode, recipientName, email, contactNumber, mobileNumber, collectionDay: clientCollectionDay, startDate: clientStartDate, shippingAddress1, shippingAddress2, shippingAddress3 } = req.body;

    if (!newPlanCode || !['starter', 'pro', 'premium'].includes(newPlanCode)) {
      return res.status(400).json({ error: "Invalid plan code" });
    }

    if (!process.env.ADUMO_CUID || !process.env.ADUMO_AUID || !process.env.ADUMO_JWT_SECRET) {
      return res.status(500).json({ error: "Payment gateway not configured" });
    }

    const newPlan = await queryOne("SELECT * FROM billing_plans WHERE code = ?", [newPlanCode]);
    if (!newPlan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    const workspaceId = await ensureDefaultWorkspace(userId);

    const existingSub = await queryOne(
      `SELECT bs.id, bs.plan_id, bp.code as plan_code FROM billing_subscriptions bs
       JOIN billing_plans bp ON bp.id = bs.plan_id
       WHERE bs.workspace_id = ? AND bs.status IN ('TRIAL','ACTIVE')`,
      [workspaceId]
    );

    if (!existingSub) {
      return res.status(400).json({ error: "No active subscription found. Please subscribe first." });
    }

    if (existingSub.plan_code === newPlanCode) {
      return res.status(400).json({ error: `You are already on the ${newPlan.name} plan.` });
    }

    const refSuffix = randomUUID().replace(/-/g, "").slice(0, 8);
    const merchantRef = `UPG_${refSuffix}`;
    const amount = (newPlan.price_cents / 100).toFixed(2);
    const puid = randomUUID();

    await execute(
      "INSERT INTO billing_invoices (workspace_id, plan_id, amount_cents, currency, status, merchant_ref) VALUES (?, ?, ?, ?, 'PENDING', ?)",
      [workspaceId, newPlan.id, newPlan.price_cents, newPlan.currency, merchantRef]
    );

    const token = generateSubscriptionToken(merchantRef, amount);

    const chosenCollectionDay = Math.max(1, Math.min(28, parseInt(clientCollectionDay) || 1));

    const startDateObj = clientStartDate ? new Date(clientStartDate) : (() => {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      d.setDate(chosenCollectionDay);
      return d;
    })();
    const startDateStr = startDateObj.toISOString().split("T")[0];

    const endDateObj = new Date(startDateObj);
    endDateObj.setFullYear(endDateObj.getFullYear() + 2);
    const endDateStr = endDateObj.toISOString().split("T")[0];

    const userRecord = await queryOne("SELECT full_name, email FROM users WHERE id = ?", [userId]);

    const fields: Record<string, string> = {
      puid,
      MerchantID: process.env.ADUMO_CUID!,
      ApplicationID: process.env.ADUMO_AUID!,
      MerchantReference: merchantRef,
      Amount: amount,
      Token: token,
      txtCurrencyCode: newPlan.currency || "ZAR",
      RedirectSuccessfulURL: `${APP_URL}/api/billing/return-redirect?status=success&merchantRef=${merchantRef}`,
      RedirectFailedURL: `${APP_URL}/api/billing/return-redirect?status=failed&merchantRef=${merchantRef}`,
      Variable1: "PlanChange",
      Variable2: merchantRef,
      Qty1: "1",
      ItemRef1: newPlan.code,
      ItemDescr1: `${newPlan.name} Plan Subscription (Upgrade)`,
      ItemAmount1: amount,
      ShippingCost: "0.00",
      Discount: "0.00",
      Recipient: recipientName || userRecord?.full_name || "Customer",
      ShippingAddress1: shippingAddress1 || "",
      ShippingAddress2: shippingAddress2 || "",
      ShippingAddress3: shippingAddress3 || "",
      frequency: "MONTHLY",
      collectionDay: String(chosenCollectionDay),
      accountNumber: `ACC_${Date.now()}`,
      startDate: startDateStr,
      endDate: endDateStr,
      collectionValue: amount,
      contactNumber: contactNumber || "",
      mobileNumber: mobileNumber || contactNumber || "",
      emailAddress: email || userRecord?.email || "",
      shouldSendSms: "false",
      shouldSendEmail: "true",
    };

    console.log("[Billing] Plan change session created:", JSON.stringify({
      MerchantReference: fields.MerchantReference,
      Amount: fields.Amount,
      oldPlan: existingSub.plan_code,
      newPlan: newPlanCode,
    }));

    res.json({ formAction: ADUMO_URL, fields });
  } catch (err: any) {
    console.error("[Billing] Plan change error:", err.message);
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

billingRouter.get("/feature-gate", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const workspace = await queryOne(
      "SELECT w.id FROM workspaces w JOIN workspace_members wm ON wm.workspace_id = w.id WHERE wm.user_id = ? LIMIT 1",
      [userId]
    );
    if (!workspace) {
      return res.json({ active: false, status: null });
    }

    const subscription = await queryOne(
      "SELECT status, trial_end_at FROM billing_subscriptions WHERE workspace_id = ? AND status IN ('TRIAL','ACTIVE') ORDER BY created_at DESC LIMIT 1",
      [workspace.id]
    );

    if (!subscription) {
      return res.json({ active: false, status: null });
    }

    const active = subscription.status === 'ACTIVE' || (subscription.status === 'TRIAL' && new Date(subscription.trial_end_at) > new Date());
    res.json({ active, status: subscription.status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
