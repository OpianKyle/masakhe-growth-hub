import { Router } from "express";
import { queryOne, queryAll, execute } from "./db";
import { requireAuth, getDataOwnerId } from "./auth";
import { randomUUID } from "crypto";

export const payrollRouter = Router();
payrollRouter.use(requireAuth);

function calcAnnualTax(annualRands: number): number {
  if (annualRands <= 237100) return annualRands * 0.18;
  if (annualRands <= 370500) return 42678 + (annualRands - 237100) * 0.26;
  if (annualRands <= 512800) return 77362 + (annualRands - 370500) * 0.31;
  if (annualRands <= 673000) return 121475 + (annualRands - 512800) * 0.36;
  if (annualRands <= 857900) return 179147 + (annualRands - 673000) * 0.39;
  if (annualRands <= 1817000) return 251258 + (annualRands - 857900) * 0.41;
  return 644489 + (annualRands - 1817000) * 0.45;
}

export function calculatePAYE(monthlyGrossCents: number, age: number): number {
  const annualRands = (monthlyGrossCents / 100) * 12;
  const primaryRebate = 17235;
  const secondaryRebate = age >= 65 ? 9444 : 0;
  const tertiaryRebate = age >= 75 ? 3145 : 0;
  const threshold = age >= 75 ? 165689 : age >= 65 ? 148217 : 95750;

  if (annualRands < threshold) return 0;

  const annualTax = Math.max(0, calcAnnualTax(annualRands) - primaryRebate - secondaryRebate - tertiaryRebate);
  return Math.round((annualTax / 12) * 100);
}

export function calculateUIF(monthlyGrossCents: number, uifExempt: boolean): { employee: number; employer: number } {
  if (uifExempt) return { employee: 0, employer: 0 };
  const capCents = 1771200;
  const capped = Math.min(monthlyGrossCents, capCents);
  const contribution = Math.round(capped * 0.01);
  return { employee: contribution, employer: contribution };
}

payrollRouter.get("/employees", async (req, res) => {
  try {
    const employees = await queryAll(
      "SELECT * FROM employees WHERE user_id = ? ORDER BY first_name ASC",
      [getDataOwnerId(req)]
    );
    res.json(employees.map((e: any) => ({ ...e, uif_exempt: !!e.uif_exempt })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

payrollRouter.get("/employees/:id", async (req, res) => {
  try {
    const emp = await queryOne(
      "SELECT * FROM employees WHERE id = ? AND user_id = ?",
      [req.params.id, getDataOwnerId(req)]
    );
    if (!emp) return res.status(404).json({ error: "Employee not found" });
    res.json({ ...emp, uif_exempt: !!emp.uif_exempt });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

payrollRouter.post("/employees", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const {
      first_name, last_name, id_number, tax_number, position, department,
      start_date, employment_type, basic_salary, age, uif_exempt,
      phone, email, address, bank_name, account_type, account_number, branch_code
    } = req.body;

    if (!first_name || !last_name || basic_salary === undefined) {
      return res.status(400).json({ error: "first_name, last_name and basic_salary are required" });
    }

    const id = randomUUID();
    await execute(
      `INSERT INTO employees (id, user_id, first_name, last_name, id_number, tax_number, position, department,
        start_date, employment_type, basic_salary, age, uif_exempt, phone, email, address,
        bank_name, account_type, account_number, branch_code, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'active')`,
      [id, userId, first_name, last_name, id_number || null, tax_number || null, position || null,
       department || null, start_date || null, employment_type || "full_time",
       Math.round(Number(basic_salary)), Number(age) || 30, uif_exempt ? 1 : 0,
       phone || null, email || null, address || null,
       bank_name || null, account_type || null, account_number || null, branch_code || null]
    );
    res.json({ ok: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

payrollRouter.put("/employees/:id", async (req, res) => {
  try {
    const existing = await queryOne("SELECT id FROM employees WHERE id = ? AND user_id = ?", [req.params.id, getDataOwnerId(req)]);
    if (!existing) return res.status(404).json({ error: "Employee not found" });

    const {
      first_name, last_name, id_number, tax_number, position, department,
      start_date, employment_type, basic_salary, age, uif_exempt,
      phone, email, address, bank_name, account_type, account_number, branch_code, status
    } = req.body;

    await execute(
      `UPDATE employees SET first_name=?, last_name=?, id_number=?, tax_number=?, position=?, department=?,
        start_date=?, employment_type=?, basic_salary=?, age=?, uif_exempt=?, phone=?, email=?, address=?,
        bank_name=?, account_type=?, account_number=?, branch_code=?, status=?, updated_at=NOW()
       WHERE id=?`,
      [first_name, last_name, id_number || null, tax_number || null, position || null, department || null,
       start_date || null, employment_type || "full_time", Math.round(Number(basic_salary)),
       Number(age) || 30, uif_exempt ? 1 : 0, phone || null, email || null, address || null,
       bank_name || null, account_type || null, account_number || null, branch_code || null,
       status || "active", req.params.id]
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

payrollRouter.delete("/employees/:id", async (req, res) => {
  try {
    const existing = await queryOne("SELECT id FROM employees WHERE id = ? AND user_id = ?", [req.params.id, getDataOwnerId(req)]);
    if (!existing) return res.status(404).json({ error: "Employee not found" });
    await execute("DELETE FROM payroll_runs WHERE employee_id = ?", [req.params.id]);
    await execute("DELETE FROM employees WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

payrollRouter.post("/calculate", async (req, res) => {
  try {
    const { employee_id, allowances = [], deductions = [] } = req.body;
    const emp = await queryOne("SELECT * FROM employees WHERE id = ? AND user_id = ?", [employee_id, getDataOwnerId(req)]);
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    const allowancesTotal = allowances.reduce((s: number, a: any) => s + (Number(a.amount_cents) || 0), 0);
    const deductionsTotal = deductions.reduce((s: number, d: any) => s + (Number(d.amount_cents) || 0), 0);
    const grossCents = emp.basic_salary + allowancesTotal;
    const payeCents = calculatePAYE(grossCents, emp.age || 30);
    const uif = calculateUIF(grossCents, !!emp.uif_exempt);
    const totalDeductionsCents = payeCents + uif.employee + deductionsTotal;
    const netCents = grossCents - totalDeductionsCents;

    res.json({
      basic_salary_cents: emp.basic_salary,
      allowances_total_cents: allowancesTotal,
      gross_pay_cents: grossCents,
      paye_cents: payeCents,
      uif_employee_cents: uif.employee,
      uif_employer_cents: uif.employer,
      other_deductions_cents: deductionsTotal,
      total_deductions_cents: totalDeductionsCents,
      net_pay_cents: netCents,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

payrollRouter.get("/runs", async (req, res) => {
  try {
    const { employeeId, period } = req.query;
    let sql = `SELECT pr.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.position
               FROM payroll_runs pr JOIN employees e ON e.id = pr.employee_id
               WHERE pr.user_id = ?`;
    const params: any[] = [getDataOwnerId(req)];
    if (employeeId) { sql += " AND pr.employee_id = ?"; params.push(employeeId); }
    if (period) { sql += " AND pr.pay_period = ?"; params.push(period); }
    sql += " ORDER BY pr.pay_period DESC, pr.created_at DESC";
    const runs = await queryAll(sql, params);
    res.json(runs.map((r: any) => ({
      ...r,
      allowances: typeof r.allowances_json === "string" ? JSON.parse(r.allowances_json) : r.allowances_json,
      deductions: typeof r.deductions_json === "string" ? JSON.parse(r.deductions_json) : r.deductions_json,
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

payrollRouter.get("/runs/:id", async (req, res) => {
  try {
    const run = await queryOne(
      `SELECT pr.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name,
              e.position, e.id_number, e.tax_number, e.department, e.bank_name,
              e.account_type, e.account_number, e.branch_code, e.address as employee_address
       FROM payroll_runs pr JOIN employees e ON e.id = pr.employee_id
       WHERE pr.id = ? AND pr.user_id = ?`,
      [req.params.id, getDataOwnerId(req)]
    );
    if (!run) return res.status(404).json({ error: "Payroll run not found" });
    res.json({
      ...run,
      allowances: typeof run.allowances_json === "string" ? JSON.parse(run.allowances_json) : run.allowances_json,
      deductions: typeof run.deductions_json === "string" ? JSON.parse(run.deductions_json) : run.deductions_json,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export async function createPayrollRun(
  userId: string,
  employeeId: string,
  opts: { pay_period: string; pay_date: string; allowances?: any[]; deductions?: any[]; notes?: string }
): Promise<string> {
  const { pay_period, pay_date, allowances = [], deductions = [], notes } = opts;
  const emp = await queryOne("SELECT * FROM employees WHERE id = ? AND user_id = ?", [employeeId, userId]);
  if (!emp) throw new Error("Employee not found");

  const allowancesTotal = allowances.reduce((s: number, a: any) => s + (Number(a.amount_cents) || 0), 0);
  const deductionsTotal = deductions.reduce((s: number, d: any) => s + (Number(d.amount_cents) || 0), 0);
  const grossCents = emp.basic_salary + allowancesTotal;
  const payeCents = calculatePAYE(grossCents, emp.age || 30);
  const uif = calculateUIF(grossCents, !!emp.uif_exempt);
  const netCents = grossCents - payeCents - uif.employee - deductionsTotal;

  const id = randomUUID();
  const totalCostCents = grossCents + uif.employer;
  const expenseId = randomUUID();
  const nowIso = new Date().toISOString();
  const employeeName = `${emp.first_name} ${emp.last_name}`.trim();

  await execute(
    `INSERT INTO payroll_runs (id, user_id, employee_id, pay_period, pay_date, basic_salary_cents,
      allowances_json, deductions_json, paye_cents, uif_employee_cents, uif_employer_cents,
      gross_pay_cents, net_pay_cents, notes, expense_entry_id)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, userId, employeeId, pay_period, pay_date, emp.basic_salary,
     JSON.stringify(allowances), JSON.stringify(deductions),
     payeCents, uif.employee, uif.employer, grossCents, netCents, notes || null, expenseId]
  );

  await execute(
    `INSERT INTO ledger_entries (id, user_id, type, amount_cents, category, description, occurred_at, created_at)
     VALUES (?,?,?,?,?,?,?,?)`,
    [expenseId, userId, "EXPENSE", totalCostCents, "Salaries",
     `Payroll — ${employeeName} (${pay_period})`, pay_date, nowIso]
  );

  return id;
}

payrollRouter.post("/runs", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const { employee_id, pay_period, pay_date, allowances = [], deductions = [], notes } = req.body;
    if (!employee_id || !pay_period || !pay_date) {
      return res.status(400).json({ error: "employee_id, pay_period and pay_date are required" });
    }

    const id = await createPayrollRun(userId, employee_id, { pay_period, pay_date, allowances, deductions, notes });
    res.json({ ok: true, id });
  } catch (err: any) {
    if (err.message === "Employee not found") return res.status(404).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

payrollRouter.delete("/runs/:id", async (req, res) => {
  try {
    const existing = await queryOne("SELECT id, expense_entry_id FROM payroll_runs WHERE id = ? AND user_id = ?", [req.params.id, getDataOwnerId(req)]);
    if (!existing) return res.status(404).json({ error: "Run not found" });
    if (existing.expense_entry_id) {
      await execute("DELETE FROM ledger_entries WHERE id = ?", [existing.expense_entry_id]);
    }
    await execute("DELETE FROM payroll_runs WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/* ── PAYE monthly summary (per employee, per month) ─────────────────────── */
payrollRouter.get("/paye-summary", async (req, res) => {
  try {
    const rows = await queryAll(
      `SELECT pr.employee_id, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.position,
              pr.pay_period, pr.paye_cents, pr.gross_pay_cents
       FROM payroll_runs pr JOIN employees e ON e.id = pr.employee_id
       WHERE pr.user_id = ?
       ORDER BY e.first_name ASC, pr.pay_period ASC`,
      [getDataOwnerId(req)]
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Payslip auto-send schedules ─────────────────────────────────────────── */
export function computeNextSendAt(
  frequency: "daily" | "weekly" | "monthly",
  dayOfWeek: number | null | undefined,
  dayOfMonth: number | null | undefined,
  sendTime: string,
  base: Date
): Date {
  const [hh, mm] = (sendTime || "08:00").split(":").map((n) => parseInt(n, 10) || 0);
  const next = new Date(base);
  next.setSeconds(0, 0);

  if (frequency === "daily") {
    next.setHours(hh, mm, 0, 0);
    if (next <= base) next.setDate(next.getDate() + 1);
  } else if (frequency === "weekly") {
    const targetDow = dayOfWeek ?? 1;
    next.setHours(hh, mm, 0, 0);
    let diff = (targetDow - next.getDay() + 7) % 7;
    if (diff === 0 && next <= base) diff = 7;
    next.setDate(next.getDate() + diff);
  } else {
    const targetDom = dayOfMonth ?? 1;
    next.setHours(hh, mm, 0, 0);
    next.setDate(1);
    const daysInMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    next.setDate(Math.min(targetDom, daysInMonth));
    if (next <= base) {
      next.setMonth(next.getMonth() + 1);
      next.setDate(1);
      const daysInNextMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
      next.setDate(Math.min(targetDom, daysInNextMonth));
    }
  }
  return next;
}

payrollRouter.get("/schedules", async (req, res) => {
  try {
    const rows = await queryAll(
      `SELECT ps.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.position, e.email as employee_email
       FROM payslip_schedules ps JOIN employees e ON e.id = ps.employee_id
       WHERE ps.user_id = ?
       ORDER BY e.first_name ASC`,
      [getDataOwnerId(req)]
    );
    res.json(rows.map((r: any) => ({
      ...r,
      active: !!r.active,
      allowances: typeof r.allowances_json === "string" ? JSON.parse(r.allowances_json) : r.allowances_json,
      deductions: typeof r.deductions_json === "string" ? JSON.parse(r.deductions_json) : r.deductions_json,
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

payrollRouter.post("/schedules", async (req, res) => {
  try {
    const userId = getDataOwnerId(req);
    const {
      employee_id, frequency = "monthly", day_of_week, day_of_month,
      send_time = "08:00", allowances = [], deductions = [], notes, active = true,
    } = req.body;

    if (!employee_id) return res.status(400).json({ error: "employee_id is required" });
    if (!["daily", "weekly", "monthly"].includes(frequency)) {
      return res.status(400).json({ error: "frequency must be daily, weekly or monthly" });
    }

    const emp = await queryOne("SELECT id FROM employees WHERE id = ? AND user_id = ?", [employee_id, userId]);
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    const dow = frequency === "weekly" ? (Number(day_of_week) || 0) : null;
    const dom = frequency === "monthly" ? (Number(day_of_month) || 1) : null;
    const nextSendAt = active ? computeNextSendAt(frequency, dow, dom, send_time, new Date()) : null;

    const existing = await queryOne("SELECT id FROM payslip_schedules WHERE employee_id = ? AND user_id = ?", [employee_id, userId]);

    if (existing) {
      await execute(
        `UPDATE payslip_schedules SET frequency=?, day_of_week=?, day_of_month=?, send_time=?,
          allowances_json=?, deductions_json=?, notes=?, active=?, next_send_at=?, updated_at=NOW()
         WHERE id=?`,
        [frequency, dow, dom, send_time, JSON.stringify(allowances), JSON.stringify(deductions),
         notes || null, active ? 1 : 0, nextSendAt, existing.id]
      );
      res.json({ ok: true, id: existing.id });
    } else {
      const id = randomUUID();
      await execute(
        `INSERT INTO payslip_schedules (id, user_id, employee_id, frequency, day_of_week, day_of_month,
          send_time, allowances_json, deductions_json, notes, active, next_send_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [id, userId, employee_id, frequency, dow, dom, send_time,
         JSON.stringify(allowances), JSON.stringify(deductions), notes || null, active ? 1 : 0, nextSendAt]
      );
      res.json({ ok: true, id });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

payrollRouter.delete("/schedules/:id", async (req, res) => {
  try {
    const existing = await queryOne("SELECT id FROM payslip_schedules WHERE id = ? AND user_id = ?", [req.params.id, getDataOwnerId(req)]);
    if (!existing) return res.status(404).json({ error: "Schedule not found" });
    await execute("DELETE FROM payslip_schedules WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
