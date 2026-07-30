import { queryAll, queryOne, execute } from "./db";
import { sendTrialExpiredEmail } from "./email";

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

async function sendTrialExpiryReminders() {
  try {
    // Find expired trials where the reminder email hasn't been sent yet
    const expired = await queryAll(
      `SELECT bs.id, bs.workspace_id, bs.trial_end_at,
              u.email, u.full_name
       FROM billing_subscriptions bs
       JOIN workspaces w ON w.id = bs.workspace_id
       JOIN users u ON u.id = w.owner_id
       WHERE bs.status = 'TRIAL'
         AND bs.trial_end_at <= NOW()
         AND bs.trial_expiry_email_sent_at IS NULL
         AND u.email IS NOT NULL`
    );

    for (const row of expired) {
      try {
        await sendTrialExpiredEmail(
          row.email,
          row.full_name || "there",
          new Date(row.trial_end_at)
        );
        await execute(
          `UPDATE billing_subscriptions SET trial_expiry_email_sent_at = NOW(), updated_at = NOW() WHERE id = ?`,
          [row.id]
        );
        console.log(`[Billing] Trial expiry email sent to ${row.email} (workspace ${row.workspace_id})`);
      } catch (err) {
        console.error(`[Billing] Failed trial expiry email for workspace ${row.workspace_id}:`, err);
      }
    }
  } catch (err) {
    console.error("[Billing] Error sending trial expiry reminders:", err);
  }
}

export function startBillingScheduler() {
  setInterval(async () => {
    try {
      await processMonthlyRenewals();
      await sendTrialExpiryReminders();
    } catch (err) {
      console.error("[Billing] Scheduler tick error:", err);
    }
  }, 3600000);

  // Also run once shortly after startup so recently-expired trials aren't missed
  setTimeout(async () => {
    try {
      await sendTrialExpiryReminders();
    } catch (err) {
      console.error("[Billing] Startup trial expiry check error:", err);
    }
  }, 30000);

  console.log("[Billing] Billing scheduler started (runs every hour)");
}
