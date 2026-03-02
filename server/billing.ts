import { Router } from "express";
import { queryOne, queryAll, execute } from "./db";
import { requireAuth } from "./auth";
import { randomUUID } from "crypto";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const billingRouter = Router();

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

    drawText("3. FREE TRIAL", { font: fontBold, size: headingSize });
    spacer(0.5);
    drawText("3.1 New subscribers receive a 14-day free trial starting from the date of registration.", { indent: 10 });
    spacer(0.5);
    drawText("3.2 No charges will be processed during the trial period.", { indent: 10 });
    spacer(0.5);
    drawText("3.3 After the trial period ends, your selected plan will be billed automatically unless you cancel before the trial expires.", { indent: 10 });
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
    drawText("6.1 All payments are processed securely through the Masakhe platform.", { indent: 10 });
    spacer(0.5);
    drawText("6.2 Masakhe does not store your banking or card details on its servers.", { indent: 10 });
    spacer(0.5);
    drawText("6.3 If a scheduled payment fails, Masakhe may reattempt collection. Repeated failures may result in service suspension after written notice.", { indent: 10 });
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
    const workspace = await queryOne(
      "SELECT w.id FROM workspaces w JOIN workspace_members wm ON wm.workspace_id = w.id WHERE wm.user_id = ? LIMIT 1",
      [userId]
    );
    if (!workspace) {
      return res.json({ subscription: null, plan: null, invoices: [] });
    }

    const subscription = await queryOne(
      `SELECT bs.*, bp.code as plan_code, bp.name as plan_name, bp.price_cents, bp.currency, bp.bill_interval
       FROM billing_subscriptions bs
       JOIN billing_plans bp ON bp.id = bs.plan_id
       WHERE bs.workspace_id = ? AND bs.status IN ('TRIAL','ACTIVE','PAST_DUE')
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

billingRouter.post("/subscribe", requireAuth, async (req, res) => {
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
      "SELECT id, status FROM billing_subscriptions WHERE workspace_id = ? AND status IN ('TRIAL','ACTIVE')",
      [workspaceId]
    );

    if (existingSub) {
      return res.status(400).json({ error: "You already have an active subscription" });
    }

    const subResult = await execute(
      "INSERT INTO billing_subscriptions (workspace_id, plan_id, status, trial_start_at, trial_end_at) VALUES (?, ?, 'TRIAL', NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY))",
      [workspaceId, plan.id]
    );

    const subscription = await queryOne("SELECT * FROM billing_subscriptions WHERE id = ?", [subResult.insertId]);

    console.log(`[Billing] Subscription created for workspace ${workspaceId}, plan: ${plan.name}, status: TRIAL`);

    res.json({ ok: true, subscription });
  } catch (err: any) {
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
