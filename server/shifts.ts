import { Router } from "express";
import { requireAuth } from "./auth";
import { query, queryOne } from "./db";
import { v4 as uuidv4 } from "uuid";

export const shiftsRouter = Router();
shiftsRouter.use(requireAuth);

shiftsRouter.get("/", async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    const { weekStart } = req.query;
    if (!weekStart) return res.status(400).json({ error: "weekStart required" });
    const rows = await query(
      `SELECT s.*, e.first_name, e.last_name, e.position
       FROM shifts s
       JOIN employees e ON e.id = s.employee_id
       WHERE s.user_id = ? AND s.shift_date BETWEEN ? AND DATE_ADD(?, INTERVAL 6 DAY)
       ORDER BY s.shift_date, s.start_time`,
      [userId, weekStart, weekStart]
    );
    res.json(rows);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

shiftsRouter.post("/", async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    const { employee_id, shift_date, start_time, end_time, title, notes, color } = req.body;
    if (!employee_id || !shift_date || !start_time || !end_time)
      return res.status(400).json({ error: "Missing required fields" });
    const id = uuidv4();
    await query(
      `INSERT INTO shifts (id, user_id, employee_id, shift_date, start_time, end_time, title, notes, color)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, employee_id, shift_date, start_time, end_time, title || null, notes || null, color || "teal"]
    );
    const shift = await queryOne(
      `SELECT s.*, e.first_name, e.last_name FROM shifts s JOIN employees e ON e.id = s.employee_id WHERE s.id = ?`,
      [id]
    );
    res.json(shift);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

shiftsRouter.put("/:id", async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    const { id } = req.params;
    const { employee_id, shift_date, start_time, end_time, title, notes, color } = req.body;
    const existing = await queryOne(`SELECT id FROM shifts WHERE id = ? AND user_id = ?`, [id, userId]);
    if (!existing) return res.status(404).json({ error: "Not found" });
    await query(
      `UPDATE shifts SET employee_id=?, shift_date=?, start_time=?, end_time=?, title=?, notes=?, color=? WHERE id=?`,
      [employee_id, shift_date, start_time, end_time, title || null, notes || null, color || "teal", id]
    );
    const shift = await queryOne(
      `SELECT s.*, e.first_name, e.last_name FROM shifts s JOIN employees e ON e.id = s.employee_id WHERE s.id = ?`,
      [id]
    );
    res.json(shift);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

shiftsRouter.delete("/:id", async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    const { id } = req.params;
    await query(`DELETE FROM shifts WHERE id = ? AND user_id = ?`, [id, userId]);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
