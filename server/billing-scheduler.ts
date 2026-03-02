import { queryAll, execute } from "./db";

async function processTrialReminders() {
  try {
    const reminders = await queryAll(
      `SELECT bs.id, bs.workspace_id, bs.trial_end_at, bp.name as plan_name
       FROM billing_subscriptions bs
       JOIN billing_plans bp ON bp.id = bs.plan_id
       WHERE bs.status = 'TRIAL'
         AND bs.trial_end_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 3 DAY)
         AND bs.trial_end_at > NOW()`
    );

    for (const sub of reminders) {
      console.log(`[Billing] Trial ending reminder for workspace ${sub.workspace_id} - plan: ${sub.plan_name}, ends: ${sub.trial_end_at}`);
    }
  } catch (err) {
    console.error("[Billing] Error processing trial reminders:", err);
  }
}

async function processExpiredTrials() {
  try {
    const expired = await queryAll(
      `SELECT bs.id, bs.workspace_id, bs.plan_id, bp.price_cents, bp.name as plan_name
       FROM billing_subscriptions bs
       JOIN billing_plans bp ON bp.id = bs.plan_id
       WHERE bs.status = 'TRIAL'
         AND bs.trial_end_at <= NOW()`
    );

    for (const sub of expired) {
      try {
        await execute(
          `UPDATE billing_subscriptions SET status = 'ACTIVE', next_billing_at = DATE_ADD(NOW(), INTERVAL 1 MONTH), updated_at = NOW() WHERE id = ?`,
          [sub.id]
        );

        const merchantRef = `MSK-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        await execute(
          `INSERT INTO billing_invoices (workspace_id, subscription_id, amount_cents, currency, status, merchant_ref)
           VALUES (?, ?, ?, 'ZAR', 'PENDING', ?)`,
          [sub.workspace_id, sub.id, sub.price_cents, merchantRef]
        );

        console.log(`[Billing] Trial ended for workspace ${sub.workspace_id} — transitioned to ACTIVE, invoice created`);
      } catch (err) {
        console.error(`[Billing] Error processing expired trial for workspace ${sub.workspace_id}:`, err);
      }
    }
  } catch (err) {
    console.error("[Billing] Error processing expired trials:", err);
  }
}

async function processMonthlyRenewals() {
  try {
    const due = await queryAll(
      `SELECT bs.id, bs.workspace_id, bs.plan_id, bp.price_cents, bp.name as plan_name
       FROM billing_subscriptions bs
       JOIN billing_plans bp ON bp.id = bs.plan_id
       WHERE bs.status = 'ACTIVE'
         AND bs.next_billing_at <= NOW()`
    );

    for (const sub of due) {
      try {
        const merchantRef = `MSK-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

        await execute(
          `INSERT INTO billing_invoices (workspace_id, subscription_id, amount_cents, currency, status, merchant_ref)
           VALUES (?, ?, ?, 'ZAR', 'PENDING', ?)`,
          [sub.workspace_id, sub.id, sub.price_cents, merchantRef]
        );

        await execute(
          `UPDATE billing_subscriptions SET next_billing_at = DATE_ADD(NOW(), INTERVAL 1 MONTH), updated_at = NOW() WHERE id = ?`,
          [sub.id]
        );

        console.log(`[Billing] Monthly renewal invoice created for workspace ${sub.workspace_id}`);
      } catch (err) {
        console.error(`[Billing] Error processing renewal for workspace ${sub.workspace_id}:`, err);
      }
    }
  } catch (err) {
    console.error("[Billing] Error processing monthly renewals:", err);
  }
}

export function startBillingScheduler() {
  setInterval(async () => {
    try {
      await processTrialReminders();
      await processExpiredTrials();
      await processMonthlyRenewals();
    } catch (err) {
      console.error("[Billing] Scheduler tick error:", err);
    }
  }, 3600000);

  console.log("[Billing] Billing scheduler started (runs every hour)");
}
