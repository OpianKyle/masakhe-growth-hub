/**
 * Drip email campaign scheduler.
 * Runs every hour and sends the correct drip email to users who are due.
 * Campaign days: 1, 3, 7, 14, 30 (day 0 is sent immediately on signup).
 */
import { randomUUID } from "crypto";
import { queryAll, execute } from "./db";
import { sendDripEmail } from "./email";

const CAMPAIGN_DAYS = [1, 3, 7, 14, 30];

async function processDripEmails(): Promise<void> {
  try {
    for (const day of CAMPAIGN_DAYS) {
      const users = await queryAll(
        `SELECT u.id, u.email, u.full_name, u.created_at
         FROM users u
         WHERE u.role = 'user'
           AND u.created_at <= DATE_SUB(NOW(), INTERVAL ? DAY)
           AND u.id NOT IN (
             SELECT user_id FROM drip_email_log WHERE campaign_day = ?
           )
         LIMIT 50`,
        [day, day]
      );

      for (const user of users) {
        try {
          // Mark as processed BEFORE sending so a failed send is never retried
          await execute(
            "INSERT IGNORE INTO drip_email_log (id, user_id, campaign_day, sent_at) VALUES (?, ?, ?, NOW())",
            [randomUUID(), user.id, day]
          );
          await sendDripEmail(day, user.email, user.full_name);
          console.log(`[Drip] Day ${day} email sent to ${user.email}`);
        } catch (err: any) {
          console.error(`[Drip] Failed for ${user.email} day ${day}:`, err.message);
        }
      }
    }
  } catch (err: any) {
    console.error("[Drip] Scheduler error:", err.message);
  }
}

export function startDripScheduler(): void {
  console.log("[Drip] Drip email scheduler started (runs every hour)");
  processDripEmails().catch(() => {});
  setInterval(() => processDripEmails().catch(() => {}), 60 * 60 * 1000);
}
