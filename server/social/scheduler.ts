import { sqlite } from "../db";
import { publishPostNow } from "./posts";

const MAX_RETRIES = 3;

export function startScheduler() {
  setInterval(() => {
    try {
      const now = new Date().toISOString();
      const duePosts = sqlite.prepare(`
        SELECT id, workspace_id, created_by_user_id, retry_count
        FROM social_posts
        WHERE status = 'SCHEDULED' AND scheduled_at <= ?
        LIMIT 10
      `).all(now) as any[];

      for (const post of duePosts) {
        try {
          sqlite.prepare("UPDATE social_posts SET status = 'PUBLISHING', updated_at = ? WHERE id = ? AND status = 'SCHEDULED'").run(now, post.id);

          const updated = sqlite.prepare("SELECT status FROM social_posts WHERE id = ?").get(post.id) as any;
          if (updated?.status !== "PUBLISHING") continue;

          publishPostNow(post.id, post.workspace_id, post.created_by_user_id);

          const result = sqlite.prepare("SELECT status FROM social_posts WHERE id = ?").get(post.id) as any;
          if (result?.status === "FAILED" && post.retry_count < MAX_RETRIES) {
            sqlite.prepare("UPDATE social_posts SET status = 'SCHEDULED', retry_count = retry_count + 1, updated_at = ? WHERE id = ?").run(now, post.id);
          }
        } catch (err) {
          sqlite.prepare("UPDATE social_posts SET status = 'FAILED', updated_at = ? WHERE id = ?").run(now, post.id);
        }
      }
    } catch (err) {
      console.error("Scheduler error:", err);
    }
  }, 60_000);

  console.log("Social media scheduler started (runs every 60s)");
}
