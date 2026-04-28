import { Router } from "express";
import { queryOne, queryAll, execute } from "./db";
import { requireAuth, getDataOwnerId } from "./auth";
import { randomUUID } from "crypto";

export const leaveRouter = Router();
leaveRouter.use(requireAuth);

export async function runLeaveMigrations() {
  await execute(`
    CREATE TABLE IF NOT EXISTS leave_requests (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      employee_id VARCHAR(36) NOT NULL,
      leave_type VARCHAR(50) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      days DECIMAL(4,1) NOT NULL,
      reason TEXT,
      status ENUM('pending','approved','rejected') DEFAULT 'pending',
      review_note TEXT,
      reviewed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_leave_user (user_id),
      INDEX idx_leave_employee (employee_id)
    )
  `, []).catch(() => {});

  await execute(`
    CREATE TABLE IF NOT EXISTS leave_balances (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      employee_id VARCHAR(36) NOT NULL,
      leave_type VARCHAR(50) NOT NULL,
      total_days DECIMAL(5,1) NOT NULL DEFAULT 15,
      year INT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_balance (employee_id, leave_type, year)
    )
  `, []).catch(() => {});
}

function workingDays(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  let count = 0;
  const cur = new Date(s);
  while (cur <= e) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

const DEFAULT_BALANCES: Record<string, number> = {
  Annual: 15,
  Sick: 30,
  "Family Responsibility": 3,
  Unpaid: 999,
};

async function ensureBalances(userId: string, employeeId: string, year: number) {
  for (const [type, days] of Object.entries(DEFAULT_BALANCES)) {
    if (type === "Unpaid") continue;
    const existing = await queryOne(
      "SELECT id FROM leave_balances WHERE employee_id = ? AND leave_type = ? AND year = ?",
      [employeeId, type, year]
    );
    if (!existing) {
      await execute(
        "INSERT INTO leave_balances (id, user_id, employee_id, leave_type, total_days, year) VALUES (?, ?, ?, ?, ?, ?)",
        [randomUUID(), userId, employeeId, type, days, year]
      ).catch(() => {});
    }
  }
}

leaveRouter.get("/employees", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const employees = await queryAll(
      "SELECT id, first_name, last_name, position, department, status FROM employees WHERE user_id = ? AND status = 'active' ORDER BY first_name",
      [userId]
    );
    res.json(employees);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

leaveRouter.get("/requests", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const { employeeId, status, year } = req.query as any;

    let query = `
      SELECT lr.*, e.first_name, e.last_name, e.position, e.department
      FROM leave_requests lr
      JOIN employees e ON e.id = lr.employee_id
      WHERE lr.user_id = ?
    `;
    const params: any[] = [userId];

    if (employeeId) { query += " AND lr.employee_id = ?"; params.push(employeeId); }
    if (status) { query += " AND lr.status = ?"; params.push(status); }
    if (year) { query += " AND YEAR(lr.start_date) = ?"; params.push(parseInt(year)); }

    query += " ORDER BY lr.created_at DESC";

    const rows = await queryAll(query, params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

leaveRouter.post("/requests", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const { employeeId, leaveType, startDate, endDate, reason } = req.body;

    if (!employeeId || !leaveType || !startDate || !endDate) {
      return res.status(400).json({ error: "employeeId, leaveType, startDate, and endDate are required" });
    }

    const emp = await queryOne("SELECT id FROM employees WHERE id = ? AND user_id = ?", [employeeId, userId]);
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ error: "Start date must be before end date" });
    }

    const days = workingDays(startDate, endDate);
    if (days === 0) return res.status(400).json({ error: "No working days in selected range" });

    const year = new Date(startDate).getFullYear();
    await ensureBalances(userId, employeeId, year);

    if (leaveType !== "Unpaid") {
      const balance = await queryOne(
        "SELECT total_days FROM leave_balances WHERE employee_id = ? AND leave_type = ? AND year = ?",
        [employeeId, leaveType, year]
      );
      const usedRow = await queryOne(
        `SELECT COALESCE(SUM(days), 0) as used FROM leave_requests
         WHERE employee_id = ? AND leave_type = ? AND status = 'approved' AND YEAR(start_date) = ?`,
        [employeeId, leaveType, year]
      );
      const totalDays = balance?.total_days || DEFAULT_BALANCES[leaveType] || 0;
      const usedDays = parseFloat(usedRow?.used || "0");
      const remaining = totalDays - usedDays;

      if (days > remaining) {
        return res.status(400).json({
          error: `Insufficient leave balance. Requesting ${days} day(s) but only ${remaining.toFixed(1)} day(s) remaining for ${leaveType} leave.`,
        });
      }
    }

    const id = randomUUID();
    await execute(
      `INSERT INTO leave_requests (id, user_id, employee_id, leave_type, start_date, end_date, days, reason, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [id, userId, employeeId, leaveType, startDate, endDate, days, reason || null]
    );

    res.json({ ok: true, id, days });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

leaveRouter.put("/requests/:id/status", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const { status, reviewNote } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "status must be approved or rejected" });
    }

    const req_ = await queryOne(
      "SELECT id FROM leave_requests WHERE id = ? AND user_id = ?",
      [req.params.id, userId]
    );
    if (!req_) return res.status(404).json({ error: "Request not found" });

    await execute(
      "UPDATE leave_requests SET status = ?, review_note = ?, reviewed_at = NOW() WHERE id = ?",
      [status, reviewNote || null, req.params.id]
    );

    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

leaveRouter.delete("/requests/:id", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    await execute("DELETE FROM leave_requests WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

leaveRouter.get("/balances", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const year = parseInt((req.query.year as string) || String(new Date().getFullYear()));
    const employeeId = req.query.employeeId as string | undefined;

    let empQuery = "SELECT id, first_name, last_name, position, department FROM employees WHERE user_id = ? AND status = 'active'";
    const empParams: any[] = [userId];
    if (employeeId) { empQuery += " AND id = ?"; empParams.push(employeeId); }
    empQuery += " ORDER BY first_name";

    const employees = await queryAll(empQuery, empParams);

    const result = await Promise.all(employees.map(async (emp: any) => {
      await ensureBalances(userId, emp.id, year);

      const balances = await queryAll(
        "SELECT leave_type, total_days FROM leave_balances WHERE employee_id = ? AND year = ?",
        [emp.id, year]
      );

      const used = await queryAll(
        `SELECT leave_type, COALESCE(SUM(days), 0) as used_days
         FROM leave_requests
         WHERE employee_id = ? AND status = 'approved' AND YEAR(start_date) = ?
         GROUP BY leave_type`,
        [emp.id, year]
      );

      const pending = await queryAll(
        `SELECT leave_type, COALESCE(SUM(days), 0) as pending_days
         FROM leave_requests
         WHERE employee_id = ? AND status = 'pending' AND YEAR(start_date) = ?
         GROUP BY leave_type`,
        [emp.id, year]
      );

      const usedMap: Record<string, number> = {};
      used.forEach((u: any) => { usedMap[u.leave_type] = parseFloat(u.used_days); });

      const pendingMap: Record<string, number> = {};
      pending.forEach((p: any) => { pendingMap[p.leave_type] = parseFloat(p.pending_days); });

      const leaveTypes = ["Annual", "Sick", "Family Responsibility"];
      const leaveBalances = leaveTypes.map((type) => {
        const bal = balances.find((b: any) => b.leave_type === type);
        const total = bal ? parseFloat(bal.total_days) : DEFAULT_BALANCES[type] || 0;
        const usedDays = usedMap[type] || 0;
        const pendingDays = pendingMap[type] || 0;
        return { type, total, used: usedDays, pending: pendingDays, remaining: total - usedDays };
      });

      return { ...emp, leaveBalances };
    }));

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

leaveRouter.put("/balances/:employeeId", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const { leaveType, totalDays, year } = req.body;
    const { employeeId } = req.params;

    if (!leaveType || totalDays == null || !year) {
      return res.status(400).json({ error: "leaveType, totalDays, and year are required" });
    }

    const emp = await queryOne("SELECT id FROM employees WHERE id = ? AND user_id = ?", [employeeId, userId]);
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    await execute(
      `INSERT INTO leave_balances (id, user_id, employee_id, leave_type, total_days, year)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE total_days = ?`,
      [randomUUID(), userId, employeeId, leaveType, totalDays, year, totalDays]
    );

    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
