import { queryAll, execute } from "../db";
import { publishPostNow } from "./posts";

const MAX_RETRIES = 3;

export function startScheduler() {
  setInterval(async () => {
    try {
      const now = new Date().toISOString();
      const duePosts = await queryAll(
        `SELECT id, workspace_id, created_by_user_id, retry_count
         FROM social_posts
         WHERE status = 'SCHEDULED' AND scheduled_at <= ?
         LIMIT 10`,
        [now]
      );

      for (const post of duePosts as any[]) {
        try {
          const result = await execute(
            "UPDATE social_posts SET status = 'PUBLISHING', updated_at = ? WHERE id = ? AND status = 'SCHEDULED'",
            [now, post.id]
          );
          if (result.affectedRows === 0) continue;

          await publishPostNow(post.id, post.workspace_id, post.created_by_user_id);

          const updated = await import("../db").then(db => db.queryOne("SELECT status FROM social_posts WHERE id = ?", [post.id]));
          if (updated?.status === "FAILED" && post.retry_count < MAX_RETRIES) {
            await execute(
              "UPDATE social_posts SET status = 'SCHEDULED', retry_count = retry_count + 1, updated_at = ? WHERE id = ?",
              [now, post.id]
            );
          }
        } catch (err) {
          await execute("UPDATE social_posts SET status = 'FAILED', updated_at = ? WHERE id = ?", [now, post.id]);
        }
      }
    } catch (err) {
      console.error("Scheduler error:", err);
    }
  }, 60_000);

  console.log("Social media scheduler started (runs every 60s)");
}
