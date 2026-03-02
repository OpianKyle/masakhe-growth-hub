import { Router } from "express";
import { pool, queryAll, execute } from "./db";

export const notificationsRouter = Router();

function requireAuth(req: any, res: any, next: Function) {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  next();
}

notificationsRouter.get("/", requireAuth, async (req, res) => {
  try {
    const notifications = await queryAll(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
      [req.session.userId]
    );
    const [countRows]: any = await pool.execute(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0",
      [req.session.userId]
    );
    res.json({ notifications, unread_count: countRows[0]?.count || 0 });
  } catch (err: any) {
    console.error("Fetch notifications error:", err);
    res.status(500).json({ error: "Failed to load notifications" });
  }
});

notificationsRouter.put("/read/:id", requireAuth, async (req, res) => {
  try {
    await execute(
      "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
      [req.params.id, req.session.userId]
    );
    res.json({ ok: true });
  } catch (err: any) {
    console.error("Mark read error:", err);
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

notificationsRouter.put("/read-all", requireAuth, async (req, res) => {
  try {
    await execute(
      "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0",
      [req.session.userId]
    );
    res.json({ ok: true });
  } catch (err: any) {
    console.error("Mark all read error:", err);
    res.status(500).json({ error: "Failed to mark all as read" });
  }
});

export async function createNotification(userId: string, type: string, title: string, message: string, link?: string) {
  try {
    await execute(
      "INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)",
      [userId, type, title, message, link || null]
    );
  } catch (err) {
    console.error("Create notification error:", err);
  }
}
