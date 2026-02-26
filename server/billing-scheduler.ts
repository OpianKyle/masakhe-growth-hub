import { pool, queryAll, queryOne, execute } from "./db";

const isMockMode = !process.env.ADUMO_CUID || !process.env.ADUMO_AUID;

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
      `SELECT bs.id, bs.workspace_id, bs.plan_id, bp.price_cents
       FROM billing_subscriptions bs
       JOIN billing_plans bp ON bp.id = bs.plan_id
       WHERE bs.status = 'TRIAL'
         AND bs.trial_end_at <= NOW()`
    );

    for (const sub of expired) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();

        const merchantRef = `MSK-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

        await conn.execute(
          `INSERT INTO billing_invoices (workspace_id, subscription_id, amount_cents, currency, status, merchant_ref)
           VALUES (?, ?, ?, 'ZAR', 'PENDING', ?)`,
          [sub.workspace_id, sub.id, sub.price_cents, merchantRef]
        );

        if (isMockMode) {
          await conn.execute(
            `UPDATE billing_invoices SET status = 'PAID', paid_at = NOW() WHERE merchant_ref = ?`,
            [merchantRef]
          );

          await conn.execute(
            `UPDATE billing_subscriptions SET status = 'ACTIVE', next_billing_at = DATE_ADD(NOW(), INTERVAL 1 MONTH), updated_at = NOW() WHERE id = ?`,
            [sub.id]
          );

          console.log(`[Billing] Mock: Expired trial auto-charged for workspace ${sub.workspace_id}`);
        } else {
          const paymentMethod = await queryOne(
            `SELECT * FROM billing_payment_methods WHERE workspace_id = ? AND status = 'ON_FILE' LIMIT 1`,
            [sub.workspace_id]
          );

          if (!paymentMethod) {
            await conn.execute(
              `UPDATE billing_subscriptions SET status = 'PAST_DUE', updated_at = NOW() WHERE id = ?`,
              [sub.id]
            );
            await conn.execute(
              `UPDATE billing_invoices SET status = 'FAILED', failure_reason = 'No payment method on file' WHERE merchant_ref = ?`,
              [merchantRef]
            );
            console.log(`[Billing] No payment method for workspace ${sub.workspace_id}, set PAST_DUE`);
          } else {
            await conn.execute(
              `UPDATE billing_subscriptions SET status = 'PAST_DUE', updated_at = NOW() WHERE id = ?`,
              [sub.id]
            );
            console.log(`[Billing] Real Adumo charge not implemented, set PAST_DUE for workspace ${sub.workspace_id}`);
          }
        }

        await conn.commit();
      } catch (err) {
        await conn.rollback();
        console.error(`[Billing] Error processing expired trial for workspace ${sub.workspace_id}:`, err);
      } finally {
        conn.release();
      }
    }
  } catch (err) {
    console.error("[Billing] Error processing expired trials:", err);
  }
}

async function processMonthlyRenewals() {
  try {
    const due = await queryAll(
      `SELECT bs.id, bs.workspace_id, bs.plan_id, bp.price_cents
       FROM billing_subscriptions bs
       JOIN billing_plans bp ON bp.id = bs.plan_id
       WHERE bs.status = 'ACTIVE'
         AND bs.next_billing_at <= NOW()`
    );

    for (const sub of due) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();

        const merchantRef = `MSK-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

        await conn.execute(
          `INSERT INTO billing_invoices (workspace_id, subscription_id, amount_cents, currency, status, merchant_ref)
           VALUES (?, ?, ?, 'ZAR', 'PENDING', ?)`,
          [sub.workspace_id, sub.id, sub.price_cents, merchantRef]
        );

        if (isMockMode) {
          await conn.execute(
            `UPDATE billing_invoices SET status = 'PAID', paid_at = NOW() WHERE merchant_ref = ?`,
            [merchantRef]
          );

          await conn.execute(
            `UPDATE billing_subscriptions SET next_billing_at = DATE_ADD(NOW(), INTERVAL 1 MONTH), updated_at = NOW() WHERE id = ?`,
            [sub.id]
          );

          console.log(`[Billing] Mock: Monthly renewal charged for workspace ${sub.workspace_id}`);
        } else {
          const paymentMethod = await queryOne(
            `SELECT * FROM billing_payment_methods WHERE workspace_id = ? AND status = 'ON_FILE' LIMIT 1`,
            [sub.workspace_id]
          );

          if (!paymentMethod) {
            await conn.execute(
              `UPDATE billing_subscriptions SET status = 'PAST_DUE', updated_at = NOW() WHERE id = ?`,
              [sub.id]
            );
            await conn.execute(
              `UPDATE billing_invoices SET status = 'FAILED', failure_reason = 'No payment method on file' WHERE merchant_ref = ?`,
              [merchantRef]
            );
            console.log(`[Billing] No payment method for renewal, workspace ${sub.workspace_id} set PAST_DUE`);
          } else {
            await conn.execute(
              `UPDATE billing_subscriptions SET status = 'PAST_DUE', updated_at = NOW() WHERE id = ?`,
              [sub.id]
            );
            console.log(`[Billing] Real Adumo charge not implemented for renewal, workspace ${sub.workspace_id} set PAST_DUE`);
          }
        }

        await conn.commit();
      } catch (err) {
        await conn.rollback();
        console.error(`[Billing] Error processing renewal for workspace ${sub.workspace_id}:`, err);
      } finally {
        conn.release();
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
