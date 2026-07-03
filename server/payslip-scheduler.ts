import { queryAll, queryOne, execute } from "./db";
import { getTransporterForUser } from "./email-settings";
import { createPayrollRun, computeNextSendAt } from "./payroll";

function formatCents(cents: number): string {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function periodLabel(p: string): string {
  const [y, m] = p.split("-");
  return `${MONTHS[parseInt(m, 10) - 1] || m} ${y}`;
}

function payslipEmailHtml(opts: {
  businessName: string;
  employeeName: string;
  payPeriod: string;
  payDate: string;
  basicSalaryCents: number;
  allowances: { label: string; amount_cents: number }[];
  deductions: { label: string; amount_cents: number }[];
  payeCents: number;
  uifEmployeeCents: number;
  grossPayCents: number;
  netPayCents: number;
  fromEmail: string;
}): string {
  const {
    businessName, employeeName, payPeriod, payDate, basicSalaryCents,
    allowances, deductions, payeCents, uifEmployeeCents, grossPayCents, netPayCents, fromEmail,
  } = opts;

  const allowanceRows = allowances.map((a) =>
    `<tr><td style="padding:8px 0;color:#4a4a5a;font-size:14px;">${a.label}</td><td style="padding:8px 0;color:#1a1a2e;text-align:right;font-size:14px;">${formatCents(a.amount_cents)}</td></tr>`
  ).join("");
  const deductionRows = deductions.map((d) =>
    `<tr><td style="padding:8px 0;color:#4a4a5a;font-size:14px;">${d.label}</td><td style="padding:8px 0;color:#1a1a2e;text-align:right;font-size:14px;">${formatCents(d.amount_cents)}</td></tr>`
  ).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);max-width:600px;width:100%;">
  <tr><td style="background:#0f172a;padding:28px 40px;">
    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">${businessName}</h1>
    <p style="margin:6px 0 0;color:#f59e0b;font-size:14px;font-weight:600;">Payslip — ${periodLabel(payPeriod)}</p>
  </td></tr>
  <tr><td style="padding:32px 40px;">
    <p style="margin:0 0 16px;color:#4a4a5a;font-size:15px;">Hi <strong>${employeeName}</strong>,</p>
    <p style="margin:0 0 20px;color:#4a4a5a;font-size:14px;line-height:1.6;">Your payslip for <strong>${periodLabel(payPeriod)}</strong> (pay date ${payDate}) has been generated. A summary is below.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;padding:0 20px;margin:0 0 16px;">
      <tr><td colspan="2" style="padding-top:16px;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Earnings</td></tr>
      <tr><td style="padding:8px 0;color:#4a4a5a;font-size:14px;border-top:1px solid #e5e7eb;">Basic Salary</td><td style="padding:8px 0;color:#1a1a2e;text-align:right;font-size:14px;border-top:1px solid #e5e7eb;">${formatCents(basicSalaryCents)}</td></tr>
      ${allowanceRows}
      <tr><td style="padding:10px 0;color:#15803d;font-weight:700;font-size:14px;border-top:1px solid #e5e7eb;">Gross Pay</td><td style="padding:10px 0;color:#15803d;font-weight:700;text-align:right;font-size:14px;border-top:1px solid #e5e7eb;">${formatCents(grossPayCents)}</td></tr>
      <tr><td colspan="2" style="padding-top:16px;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Deductions</td></tr>
      <tr><td style="padding:8px 0;color:#4a4a5a;font-size:14px;border-top:1px solid #e5e7eb;">PAYE (Income Tax)</td><td style="padding:8px 0;color:#1a1a2e;text-align:right;font-size:14px;border-top:1px solid #e5e7eb;">${formatCents(payeCents)}</td></tr>
      <tr><td style="padding:8px 0;color:#4a4a5a;font-size:14px;">UIF (Employee 1%)</td><td style="padding:8px 0;color:#1a1a2e;text-align:right;font-size:14px;">${formatCents(uifEmployeeCents)}</td></tr>
      ${deductionRows}
      <tr><td colspan="2" style="padding-bottom:16px;"></td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:10px;margin:0 0 24px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 4px;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Net Pay</p>
        <p style="margin:0;color:#f59e0b;font-size:28px;font-weight:700;">${formatCents(netPayCents)}</p>
      </td></tr>
    </table>

    <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">This payslip was generated and sent automatically based on your employer's payroll schedule. For any queries, please contact ${fromEmail}.</p>
    <p style="margin:16px 0 0;color:#4a4a5a;font-size:14px;">Kind regards,<br><strong style="color:#1a1a2e;">${businessName}</strong></p>
  </td></tr>
  <tr><td style="background:#f8f8fa;padding:20px 40px;text-align:center;border-top:1px solid #e8e8ec;">
    <p style="margin:0;color:#9a9aaa;font-size:12px;">Powered by Masakhe · South African SMME Platform</p>
  </td></tr>
</table>
</td></tr></table></body></html>`;
}

async function runScheduleCheck() {
  try {
    const due = await queryAll(
      `SELECT ps.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.email as employee_email
       FROM payslip_schedules ps
       JOIN employees e ON e.id = ps.employee_id
       WHERE ps.active = 1 AND ps.next_send_at IS NOT NULL AND ps.next_send_at <= NOW()`,
      []
    );

    const now = new Date();

    for (const sched of due) {
      try {
        if (!sched.employee_email) {
          console.log(`[PayslipScheduler] Employee ${sched.employee_name} has no email on file, skipping send but advancing schedule`);
        }

        const payPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const payDateIso = now.toISOString().split("T")[0];

        let run = await queryOne(
          "SELECT * FROM payroll_runs WHERE employee_id = ? AND pay_period = ?",
          [sched.employee_id, payPeriod]
        );

        const allowances = typeof sched.allowances_json === "string" ? JSON.parse(sched.allowances_json) : sched.allowances_json;
        const deductions = typeof sched.deductions_json === "string" ? JSON.parse(sched.deductions_json) : sched.deductions_json;

        if (!run) {
          await createPayrollRun(sched.user_id, sched.employee_id, {
            pay_period: payPeriod,
            pay_date: payDateIso,
            allowances,
            deductions,
            notes: sched.notes || undefined,
          });
          run = await queryOne(
            "SELECT * FROM payroll_runs WHERE employee_id = ? AND pay_period = ?",
            [sched.employee_id, payPeriod]
          );
        }

        if (run && sched.employee_email) {
          const mailer = await getTransporterForUser(sched.user_id);
          if (mailer) {
            const runAllowances = typeof run.allowances_json === "string" ? JSON.parse(run.allowances_json) : run.allowances_json;
            const runDeductions = typeof run.deductions_json === "string" ? JSON.parse(run.deductions_json) : run.deductions_json;
            const payDateStr = new Date(run.pay_date).toLocaleDateString("en-ZA", { day: "2-digit", month: "long", year: "numeric" });

            const html = payslipEmailHtml({
              businessName: mailer.fromName,
              employeeName: sched.employee_name,
              payPeriod: run.pay_period,
              payDate: payDateStr,
              basicSalaryCents: run.basic_salary_cents,
              allowances: runAllowances,
              deductions: runDeductions,
              payeCents: run.paye_cents,
              uifEmployeeCents: run.uif_employee_cents,
              grossPayCents: run.gross_pay_cents,
              netPayCents: run.net_pay_cents,
              fromEmail: mailer.fromEmail,
            });

            await mailer.transporter.sendMail({
              from: `"${mailer.fromName}" <${mailer.fromEmail}>`,
              ...(mailer.replyTo ? { replyTo: mailer.replyTo } : {}),
              to: sched.employee_email,
              subject: `Payslip — ${periodLabel(run.pay_period)}`,
              html,
            });
            console.log(`[PayslipScheduler] Payslip emailed to ${sched.employee_email} for ${sched.employee_name} (${run.pay_period})`);
          } else {
            console.log(`[PayslipScheduler] No mailer configured for user ${sched.user_id}, skipping email for ${sched.employee_name}`);
          }
        }

        const nextSendAt = computeNextSendAt(sched.frequency, sched.day_of_week, sched.day_of_month, sched.send_time, now);
        await execute(
          `UPDATE payslip_schedules SET last_sent_at = NOW(), next_send_at = ? WHERE id = ?`,
          [nextSendAt, sched.id]
        );
      } catch (err: any) {
        console.error(`[PayslipScheduler] Error processing schedule for ${sched.employee_name}:`, err.message);
      }
    }
  } catch (err: any) {
    console.error("[PayslipScheduler] Error running schedule check:", err.message);
  }
}

export function startPayslipScheduler() {
  runScheduleCheck();
  setInterval(runScheduleCheck, 15 * 60 * 1000);
  console.log("[PayslipScheduler] Auto-send payslip scheduler started (runs every 15 min)");
}
