import { useState, useEffect, useRef } from "react";
import {
  Users, Plus, Pencil, Trash2, ChevronRight, Search, Download,
  Printer, Calculator, CheckCircle, X, Briefcase, Banknote,
  AlertCircle, ArrowLeft, Building2, ChevronsUpDown, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

const R = (cents: number) =>
  `R ${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const ALLOWANCE_PRESETS = ["Travel Allowance","Housing Allowance","Overtime","13th Cheque","Performance Bonus","Other Allowance"];
const DEDUCTION_PRESETS = ["Pension Fund","Medical Aid","Loan Repayment","Garnishee","Other Deduction"];

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  id_number?: string;
  tax_number?: string;
  position?: string;
  department?: string;
  start_date?: string;
  employment_type: string;
  basic_salary: number;
  age: number;
  uif_exempt: boolean;
  phone?: string;
  email?: string;
  address?: string;
  bank_name?: string;
  account_type?: string;
  account_number?: string;
  branch_code?: string;
  status: string;
}

interface LineItem { label: string; amount_cents: number; }

interface PayrollRun {
  id: string;
  employee_id: string;
  employee_name: string;
  position?: string;
  id_number?: string;
  tax_number?: string;
  department?: string;
  bank_name?: string;
  account_type?: string;
  account_number?: string;
  branch_code?: string;
  employee_address?: string;
  pay_period: string;
  pay_date: string;
  basic_salary_cents: number;
  allowances: LineItem[];
  deductions: LineItem[];
  paye_cents: number;
  uif_employee_cents: number;
  uif_employer_cents: number;
  gross_pay_cents: number;
  net_pay_cents: number;
  notes?: string;
}

const emptyEmployee = {
  first_name: "", last_name: "", id_number: "", tax_number: "", position: "", department: "",
  start_date: "", employment_type: "full_time", basic_salary: "", age: "30", uif_exempt: false,
  phone: "", email: "", address: "", bank_name: "", account_type: "cheque", account_number: "", branch_code: "", status: "active"
};

type Tab = "employees" | "run" | "history";

export default function PayrollPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("employees");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [search, setSearch] = useState("");
  const [histSearch, setHistSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyEmployee);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const [runEmployeeId, setRunEmployeeId] = useState("");
  const [runPeriodMonth, setRunPeriodMonth] = useState(String(new Date().getMonth()));
  const [runPeriodYear, setRunPeriodYear] = useState(String(new Date().getFullYear()));
  const [runPayDate, setRunPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [runAllowances, setRunAllowances] = useState<LineItem[]>([]);
  const [runDeductions, setRunDeductions] = useState<LineItem[]>([]);
  const [runNotes, setRunNotes] = useState("");
  const [calc, setCalc] = useState<any>(null);
  const [runSaving, setRunSaving] = useState(false);
  const [printSlip, setPrintSlip] = useState<PayrollRun | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadEmployees();
    loadRuns();
    fetch("/api/profile", { credentials: "include" })
      .then(r => r.json()).then(d => setProfile({ ...d.user, ...d.profile })).catch(() => {});
  }, []);

  useEffect(() => {
    if (!runEmployeeId) { setCalc(null); return; }
    recalculate();
  }, [runEmployeeId, runAllowances, runDeductions]);

  const loadEmployees = () => {
    fetch("/api/payroll/employees", { credentials: "include" })
      .then(r => r.json()).then(setEmployees).catch(() => {});
  };

  const loadRuns = () => {
    fetch("/api/payroll/runs", { credentials: "include" })
      .then(r => r.json()).then(setRuns).catch(() => {});
  };

  const recalculate = async () => {
    if (!runEmployeeId) return;
    const res = await fetch("/api/payroll/calculate", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employee_id: runEmployeeId, allowances: runAllowances, deductions: runDeductions }),
    });
    if (res.ok) setCalc(await res.json());
  };

  const openAdd = () => {
    setEditingId(null); setForm(emptyEmployee); setDialogOpen(true);
  };

  const openEdit = (e: Employee) => {
    setEditingId(e.id);
    setForm({
      first_name: e.first_name, last_name: e.last_name, id_number: e.id_number || "",
      tax_number: e.tax_number || "", position: e.position || "", department: e.department || "",
      start_date: e.start_date ? e.start_date.split("T")[0] : "",
      employment_type: e.employment_type, basic_salary: String(Math.round(e.basic_salary / 100)),
      age: String(e.age), uif_exempt: e.uif_exempt, phone: e.phone || "", email: e.email || "",
      address: e.address || "", bank_name: e.bank_name || "", account_type: e.account_type || "cheque",
      account_number: e.account_number || "", branch_code: e.branch_code || "", status: e.status,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.first_name || !form.last_name || !form.basic_salary) {
      toast({ title: "Required fields missing", variant: "destructive" }); return;
    }
    setSaving(true);
    const body = { ...form, basic_salary: Math.round(parseFloat(form.basic_salary) * 100), age: Number(form.age) };
    const url = editingId ? `/api/payroll/employees/${editingId}` : "/api/payroll/employees";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, { method, credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    if (res.ok) { toast({ title: editingId ? "Employee updated" : "Employee added" }); setDialogOpen(false); loadEmployees(); }
    else { const d = await res.json(); toast({ title: d.error || "Failed to save", variant: "destructive" }); }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/payroll/employees/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) { toast({ title: "Employee deleted" }); loadEmployees(); loadRuns(); }
    setDeleteConfirm(null);
  };

  const addLine = (type: "allowance" | "deduction", label: string) => {
    const item: LineItem = { label, amount_cents: 0 };
    if (type === "allowance") setRunAllowances(prev => [...prev, item]);
    else setRunDeductions(prev => [...prev, item]);
  };

  const updateLine = (type: "allowance" | "deduction", idx: number, field: "label" | "amount_cents", val: string) => {
    const updater = (prev: LineItem[]) => prev.map((l, i) => i !== idx ? l : { ...l, [field]: field === "amount_cents" ? Math.round(parseFloat(val || "0") * 100) : val });
    if (type === "allowance") setRunAllowances(updater);
    else setRunDeductions(updater);
  };

  const removeLine = (type: "allowance" | "deduction", idx: number) => {
    if (type === "allowance") setRunAllowances(prev => prev.filter((_, i) => i !== idx));
    else setRunDeductions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleRunPayroll = async () => {
    if (!runEmployeeId || !runPeriodMonth || !runPeriodYear || !runPayDate) {
      toast({ title: "Please fill in all required fields", variant: "destructive" }); return;
    }
    setRunSaving(true);
    const pay_period = `${runPeriodYear}-${String(Number(runPeriodMonth) + 1).padStart(2, "0")}`;
    const res = await fetch("/api/payroll/runs", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employee_id: runEmployeeId, pay_period, pay_date: runPayDate, allowances: runAllowances, deductions: runDeductions, notes: runNotes }),
    });
    setRunSaving(false);
    if (res.ok) {
      const data = await res.json();
      toast({ title: "Payslip created" });
      loadRuns();
      setTab("history");
      const fullRun = await fetch(`/api/payroll/runs/${data.id}`, { credentials: "include" }).then(r => r.json());
      setPrintSlip(fullRun);
      setRunAllowances([]); setRunDeductions([]); setRunNotes(""); setCalc(null);
    } else { const d = await res.json(); toast({ title: d.error || "Failed to run payroll", variant: "destructive" }); }
  };

  const handleDeleteRun = async (id: string) => {
    const res = await fetch(`/api/payroll/runs/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) { toast({ title: "Payslip deleted" }); loadRuns(); }
  };

  const openPrintSlip = async (id: string) => {
    const res = await fetch(`/api/payroll/runs/${id}`, { credentials: "include" });
    if (res.ok) setPrintSlip(await res.json());
  };

  const printPayslip = () => {
    if (!printSlip) return;
    const biz = profile?.business_name || profile?.trading_name || profile?.full_name || "Your Business";
    const address = profile?.physical_address || "";
    const logo = profile?.logo_url || "";
    const allTotal = printSlip.allowances.reduce((s: number, a: any) => s + a.amount_cents, 0);
    const dedTotal = printSlip.deductions.reduce((s: number, d: any) => s + d.amount_cents, 0);
    const totalDeductions = printSlip.paye_cents + printSlip.uif_employee_cents + dedTotal;
    const fmt = (cents: number) => `R ${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const periodLabel = (p: string) => { const [y, m] = p.split("-"); return `${MONTHS[parseInt(m) - 1]} ${y}`; };
    const payDate = new Date(printSlip.pay_date).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });

    const allowanceRows = printSlip.allowances.map((a: any) =>
      `<tr><td>${a.label}</td><td style="text-align:right">${fmt(a.amount_cents)}</td></tr>`).join("");
    const deductionRows = printSlip.deductions.map((d: any) =>
      `<tr><td>${d.label}</td><td style="text-align:right">${fmt(d.amount_cents)}</td></tr>`).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Payslip – ${printSlip.employee_name}</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; height: 100%; background: #fff; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #1e293b; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  .page { width: 100%; min-height: 100vh; display: flex; flex-direction: column; }
  /* ── Header ── */
  .header { background: #0f172a; color: #fff; padding: 36px 56px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
  .header-left { display: flex; align-items: center; gap: 18px; }
  .logo { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; }
  .logo-placeholder { width: 60px; height: 60px; border-radius: 8px; background: #f59e0b; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: bold; color: #fff; }
  .biz-name { font-size: 24px; font-weight: bold; letter-spacing: -0.3px; }
  .biz-addr { color: #94a3b8; font-size: 13px; margin-top: 4px; }
  .slip-label { color: #94a3b8; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; }
  .slip-period { color: #f59e0b; font-size: 22px; font-weight: bold; margin-top: 4px; }
  .slip-date { color: #94a3b8; font-size: 13px; margin-top: 3px; }
  /* ── Body ── */
  .body { flex: 1; display: flex; flex-direction: column; justify-content: space-between; padding: 48px 56px; }
  .content { display: flex; flex-direction: column; gap: 36px; }
  /* ── Info grid ── */
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; overflow: hidden; }
  .info-col { padding: 22px 28px; }
  .info-col:first-child { border-right: 1px solid #e2e8f0; }
  .info-label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 10px; }
  .info-name { font-size: 18px; font-weight: bold; color: #0f172a; }
  .info-sub { color: #475569; margin-top: 4px; font-size: 14px; }
  .info-detail { color: #64748b; font-size: 13px; margin-top: 3px; }
  /* ── Section ── */
  .section-title { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  td { padding: 11px 6px; border-bottom: 1px solid #e2e8f0; color: #334155; }
  td:last-child { text-align: right; font-weight: 500; color: #0f172a; }
  tfoot td { padding: 12px 8px; font-weight: 700; font-size: 14px; border-bottom: none; }
  .gross-row td { background: #f0fdf4; color: #15803d !important; }
  .ded-row td { background: #fef2f2; color: #dc2626 !important; }
  /* ── Net bar ── */
  .net-bar { background: #0f172a; color: #fff; border-radius: 12px; padding: 28px 40px; display: flex; justify-content: space-between; align-items: center; }
  .net-label { color: #94a3b8; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
  .net-amount { color: #f59e0b; font-size: 36px; font-weight: bold; letter-spacing: -1px; }
  .net-right { text-align: right; color: #94a3b8; font-size: 13px; line-height: 2; }
  /* ── Notes ── */
  .notes { background: #fefce8; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 20px; font-size: 13px; color: #92400e; }
  /* ── Signatures ── */
  .sigs { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
  .sig-line { border-top: 1px solid #94a3b8; padding-top: 8px; margin-top: 48px; color: #94a3b8; font-size: 13px; }
  /* ── Footer ── */
  .footer-text { text-align: center; font-size: 11px; color: #cbd5e1; padding-top: 16px; border-top: 1px solid #f1f5f9; }
</style></head><body>
<div class="page">
  <div class="header">
    <div class="header-left">
      ${logo ? `<img class="logo" src="${logo}" alt="Logo" />` : `<div class="logo-placeholder">${biz[0]}</div>`}
      <div>
        <div class="biz-name">${biz}</div>
        ${address ? `<div class="biz-addr">${address}</div>` : ""}
      </div>
    </div>
    <div style="text-align:right">
      <div class="slip-label">PAYSLIP</div>
      <div class="slip-period">${periodLabel(printSlip.pay_period)}</div>
      <div class="slip-date">Pay date: ${payDate}</div>
    </div>
  </div>

  <div class="body">
    <div class="content">
      <div class="info-grid">
        <div class="info-col">
          <div class="info-label">Employee Details</div>
          <div class="info-name">${printSlip.employee_name}</div>
          ${printSlip.position ? `<div class="info-sub">${printSlip.position}</div>` : ""}
          ${printSlip.department ? `<div class="info-detail">${printSlip.department}</div>` : ""}
          ${printSlip.id_number ? `<div class="info-detail">ID: ${printSlip.id_number}</div>` : ""}
          ${printSlip.tax_number ? `<div class="info-detail">Tax Ref: ${printSlip.tax_number}</div>` : ""}
        </div>
        <div class="info-col">
          <div class="info-label">Banking Details</div>
          ${printSlip.bank_name ? `
            <div class="info-name" style="font-size:16px">${printSlip.bank_name}</div>
            ${printSlip.account_type ? `<div class="info-sub" style="text-transform:capitalize">${printSlip.account_type}</div>` : ""}
            ${printSlip.account_number ? `<div class="info-detail">Account: ${printSlip.account_number}</div>` : ""}
            ${printSlip.branch_code ? `<div class="info-detail">Branch code: ${printSlip.branch_code}</div>` : ""}
          ` : `<div class="info-detail" style="font-style:italic">Not provided</div>`}
        </div>
      </div>

      <div>
        <div class="section-title">Earnings</div>
        <table>
          <tbody>
            <tr><td>Basic Salary</td><td style="text-align:right">${fmt(printSlip.basic_salary_cents)}</td></tr>
            ${allowanceRows}
          </tbody>
          <tfoot><tr class="gross-row"><td style="padding-left:8px">Gross Pay</td><td style="text-align:right;padding-right:8px">${fmt(printSlip.gross_pay_cents)}</td></tr></tfoot>
        </table>
      </div>

      <div>
        <div class="section-title">Deductions</div>
        <table>
          <tbody>
            <tr><td>PAYE (Income Tax)</td><td style="text-align:right">${fmt(printSlip.paye_cents)}</td></tr>
            <tr><td>UIF (Employee 1%)</td><td style="text-align:right">${fmt(printSlip.uif_employee_cents)}</td></tr>
            ${deductionRows}
          </tbody>
          <tfoot><tr class="ded-row"><td style="padding-left:8px">Total Deductions</td><td style="text-align:right;padding-right:8px">${fmt(totalDeductions)}</td></tr></tfoot>
        </table>
      </div>

      <div class="net-bar">
        <div>
          <div class="net-label">Net Pay</div>
          <div class="net-amount">${fmt(printSlip.net_pay_cents)}</div>
        </div>
        <div class="net-right">
          <div>Employer UIF: ${fmt(printSlip.uif_employer_cents)}</div>
          <div>Total Cost to Company: ${fmt(printSlip.gross_pay_cents + printSlip.uif_employer_cents)}</div>
        </div>
      </div>

      ${printSlip.notes ? `<div class="notes"><strong>Notes:</strong> ${printSlip.notes}</div>` : ""}
    </div>

    <div>
      <div class="sigs">
        <div><div class="sig-line">Employee Signature</div></div>
        <div><div class="sig-line">Authorised by</div></div>
      </div>
      <div class="footer-text" style="margin-top:24px">This is a computer-generated payslip. PAYE calculated per SARS 2025/2026 tax tables.</div>
    </div>
  </div>
</div>
<script>window.onload = function() { window.print(); };<\/script>
</body></html>`;

    const win = window.open("", "_blank");
    if (!win) { toast({ title: "Popup blocked", description: "Please allow popups for this site and try again.", variant: "destructive" }); return; }
    win.document.write(html);
    win.document.close();
  };

  const filteredEmployees = employees.filter(e =>
    `${e.first_name} ${e.last_name} ${e.position || ""} ${e.department || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRuns = runs.filter(r =>
    `${r.employee_name} ${r.pay_period}`.toLowerCase().includes(histSearch.toLowerCase())
  );

  const activeCount = employees.filter(e => e.status === "active").length;
  const totalMonthlyPayroll = employees.filter(e => e.status === "active").reduce((s, e) => s + e.basic_salary, 0);

  const selectedEmployee = employees.find(e => e.id === runEmployeeId);

  const periodLabel = (p: string) => {
    const [y, m] = p.split("-");
    return `${MONTHS[parseInt(m) - 1]} ${y}`;
  };

  const years = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - 1 + i));

  if (printSlip) {
    const biz = profile?.business_name || profile?.trading_name || profile?.full_name || "Your Business";
    const address = profile?.physical_address || "";
    const logo = profile?.logo_url;
    const dedTotal = printSlip.deductions.reduce((s: number, d: any) => s + d.amount_cents, 0);
    const totalDeductions = printSlip.paye_cents + printSlip.uif_employee_cents + dedTotal;

    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Toolbar */}
        <div className="flex gap-3 px-8 py-4 bg-white border-b shrink-0">
          <Button variant="outline" onClick={() => setPrintSlip(null)}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
          <Button onClick={printPayslip}><Printer className="h-4 w-4 mr-2" />Print Payslip</Button>
        </div>

        {/* Payslip card — full width, fills remaining height */}
        <div className="flex-1 bg-white flex flex-col">
          {/* Dark header */}
          <div className="bg-slate-900 text-white px-14 py-8 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-5">
              {logo
                ? <img src={logo} alt="Logo" className="h-14 w-14 rounded-lg object-cover" />
                : <div className="h-14 w-14 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-2xl">{biz[0]}</div>}
              <div>
                <h1 className="text-2xl font-bold">{biz}</h1>
                {address && <p className="text-slate-400 text-sm mt-1">{address}</p>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-widest">Payslip</p>
              <p className="text-amber-400 font-semibold text-xl mt-1">{periodLabel(printSlip.pay_period)}</p>
              <p className="text-slate-400 text-sm mt-1">Pay date: {new Date(printSlip.pay_date).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
          </div>

          {/* Content — grows to fill page, spreads sections top-to-bottom */}
          <div className="flex-1 flex flex-col justify-between px-14 py-10">
            <div className="space-y-8">
              {/* Employee / Banking */}
              <div className="grid grid-cols-2 border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                <div className="p-6 border-r border-gray-200">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-3">Employee Details</p>
                  <p className="font-bold text-xl text-gray-900">{printSlip.employee_name}</p>
                  {printSlip.position && <p className="text-gray-600 mt-1">{printSlip.position}</p>}
                  {printSlip.department && <p className="text-gray-500 text-sm mt-0.5">{printSlip.department}</p>}
                  {printSlip.id_number && <p className="text-gray-500 text-sm mt-0.5">ID: {printSlip.id_number}</p>}
                  {printSlip.tax_number && <p className="text-gray-500 text-sm mt-0.5">Tax Ref: {printSlip.tax_number}</p>}
                </div>
                <div className="p-6">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-3">Banking Details</p>
                  {printSlip.bank_name ? (<>
                    <p className="font-bold text-lg text-gray-900">{printSlip.bank_name}</p>
                    {printSlip.account_type && <p className="text-gray-600 capitalize mt-1">{printSlip.account_type}</p>}
                    {printSlip.account_number && <p className="text-gray-500 text-sm mt-0.5">Account: {printSlip.account_number}</p>}
                    {printSlip.branch_code && <p className="text-gray-500 text-sm mt-0.5">Branch code: {printSlip.branch_code}</p>}
                  </>) : <p className="text-gray-400 text-sm italic">Not provided</p>}
                </div>
              </div>

              {/* Earnings */}
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-3">Earnings</p>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-200"><td className="py-3 text-gray-700">Basic Salary</td><td className="text-right py-3 font-semibold text-gray-900">{R(printSlip.basic_salary_cents)}</td></tr>
                    {printSlip.allowances.map((a: any, i: number) => (
                      <tr key={i} className="border-b border-gray-200"><td className="py-3 text-gray-600">{a.label}</td><td className="text-right py-3 text-gray-800">{R(a.amount_cents)}</td></tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-green-50"><td className="py-3 pl-2 font-bold text-green-800">Gross Pay</td><td className="text-right py-3 pr-2 font-bold text-green-700">{R(printSlip.gross_pay_cents)}</td></tr>
                  </tfoot>
                </table>
              </div>

              {/* Deductions */}
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-3">Deductions</p>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-200"><td className="py-3 text-gray-700">PAYE (Income Tax)</td><td className="text-right py-3 font-semibold text-gray-900">{R(printSlip.paye_cents)}</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-3 text-gray-700">UIF (Employee 1%)</td><td className="text-right py-3 text-gray-800">{R(printSlip.uif_employee_cents)}</td></tr>
                    {printSlip.deductions.map((d: any, i: number) => (
                      <tr key={i} className="border-b border-gray-200"><td className="py-3 text-gray-600">{d.label}</td><td className="text-right py-3 text-gray-800">{R(d.amount_cents)}</td></tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-red-50"><td className="py-3 pl-2 font-bold text-red-800">Total Deductions</td><td className="text-right py-3 pr-2 font-bold text-red-600">{R(totalDeductions)}</td></tr>
                  </tfoot>
                </table>
              </div>

              {/* Net pay bar */}
              <div className="bg-slate-900 text-white rounded-xl px-10 py-7 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Net Pay</p>
                  <p className="text-4xl font-bold text-amber-400">{R(printSlip.net_pay_cents)}</p>
                </div>
                <div className="text-right text-slate-400 text-sm leading-7">
                  <p>Employer UIF: {R(printSlip.uif_employer_cents)}</p>
                  <p className="text-xs">Total Cost to Company: {R(printSlip.gross_pay_cents + printSlip.uif_employer_cents)}</p>
                </div>
              </div>

              {printSlip.notes && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  <strong>Notes:</strong> {printSlip.notes}
                </div>
              )}
            </div>

            {/* Signatures + footer pinned to bottom */}
            <div className="mt-10">
              <div className="grid grid-cols-2 gap-16 text-sm text-gray-400">
                <div><div className="border-t border-gray-300 pt-2 mt-12">Employee Signature</div></div>
                <div><div className="border-t border-gray-300 pt-2 mt-12">Authorised by</div></div>
              </div>
              <p className="text-center text-xs text-gray-300 mt-6 border-t pt-4">This is a computer-generated payslip. PAYE calculated per SARS 2025/2026 tax tables.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading">Payroll</h2>
          <p className="text-muted-foreground text-sm">Manage employees, calculate PAYE & UIF, and generate payslips.</p>
        </div>
        <div className="flex gap-3">
          {tab === "employees" && (
            <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Employee</Button>
          )}
          {tab === "run" && (
            <Button onClick={handleRunPayroll} disabled={!calc || runSaving}>
              {runSaving ? "Processing..." : <><CheckCircle className="h-4 w-4 mr-2" />Generate Payslip</>}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10"><Users className="h-5 w-5 text-blue-600" /></div>
          <p className="text-2xl font-bold mt-2">{activeCount}</p>
          <p className="text-xs text-muted-foreground">Active Employees</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10"><Banknote className="h-5 w-5 text-green-600" /></div>
          <p className="text-2xl font-bold mt-2">{R(totalMonthlyPayroll)}</p>
          <p className="text-xs text-muted-foreground">Total Basic Payroll / Month</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10"><Briefcase className="h-5 w-5 text-amber-600" /></div>
          <p className="text-2xl font-bold mt-2">{runs.length}</p>
          <p className="text-xs text-muted-foreground">Payslips Generated</p>
        </div>
      </div>

      <div className="flex gap-1 border-b">
        {([["employees","Employees"],["run","Run Payroll"],["history","History"]] as [Tab,string][]).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "employees" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search employees..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-semibold">Employee</th>
                  <th className="text-left p-4 font-semibold">Position</th>
                  <th className="text-left p-4 font-semibold">Basic Salary</th>
                  <th className="text-left p-4 font-semibold">Employment</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-right p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 && (
                  <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No employees yet</p>
                    <p className="text-xs mt-1">Add your first employee to get started.</p>
                  </td></tr>
                )}
                {filteredEmployees.map(emp => (
                  <tr key={emp.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium">{emp.first_name} {emp.last_name}</div>
                      {emp.email && <div className="text-xs text-muted-foreground">{emp.email}</div>}
                    </td>
                    <td className="p-4">
                      <div>{emp.position || <span className="text-muted-foreground italic">—</span>}</div>
                      {emp.department && <div className="text-xs text-muted-foreground">{emp.department}</div>}
                    </td>
                    <td className="p-4 font-medium">{R(emp.basic_salary)}/mo</td>
                    <td className="p-4">
                      <span className="text-xs bg-muted px-2 py-1 rounded capitalize">{emp.employment_type.replace("_", " ")}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${emp.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${emp.status === "active" ? "bg-emerald-500" : "bg-gray-400"}`} />
                        {emp.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Run payroll" onClick={() => { setRunEmployeeId(emp.id); setTab("run"); }}>
                          <Calculator className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(emp)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteConfirm(emp.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "run" && (
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3 space-y-5">
            <div className="rounded-xl border bg-card p-5 space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Payroll Details</h3>
              <div>
                <label className="text-sm font-medium block mb-1.5">Employee *</label>
                <select value={runEmployeeId} onChange={e => setRunEmployeeId(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">Select an employee...</option>
                  {employees.filter(e => e.status === "active").map(e => (
                    <option key={e.id} value={e.id}>{e.first_name} {e.last_name}{e.position ? ` — ${e.position}` : ""}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Month *</label>
                  <select value={runPeriodMonth} onChange={e => setRunPeriodMonth(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    {MONTHS.map((m, i) => <option key={i} value={String(i)}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Year *</label>
                  <select value={runPeriodYear} onChange={e => setRunPeriodYear(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Pay Date *</label>
                  <Input type="date" value={runPayDate} onChange={e => setRunPayDate(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Allowances</h3>
                <div className="flex gap-2 flex-wrap justify-end">
                  {ALLOWANCE_PRESETS.map(p => (
                    <button key={p} onClick={() => addLine("allowance", p)}
                      className="text-xs px-2 py-1 rounded border border-dashed border-green-300 text-green-700 hover:bg-green-50">+ {p}</button>
                  ))}
                </div>
              </div>
              {runAllowances.length === 0 && <p className="text-xs text-muted-foreground italic">No allowances added</p>}
              {runAllowances.map((a, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input value={a.label} onChange={e => updateLine("allowance", i, "label", e.target.value)} placeholder="Label" className="flex-1 h-8 text-sm" />
                  <Input type="number" value={a.amount_cents / 100} onChange={e => updateLine("allowance", i, "amount_cents", e.target.value)}
                    placeholder="Amount (R)" className="w-32 h-8 text-sm" />
                  <button onClick={() => removeLine("allowance", i)} className="text-red-400 hover:text-red-600"><X className="h-4 w-4" /></button>
                </div>
              ))}
            </div>

            <div className="rounded-xl border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Additional Deductions</h3>
                <div className="flex gap-2 flex-wrap justify-end">
                  {DEDUCTION_PRESETS.map(p => (
                    <button key={p} onClick={() => addLine("deduction", p)}
                      className="text-xs px-2 py-1 rounded border border-dashed border-red-300 text-red-700 hover:bg-red-50">+ {p}</button>
                  ))}
                </div>
              </div>
              {runDeductions.length === 0 && <p className="text-xs text-muted-foreground italic">No additional deductions</p>}
              {runDeductions.map((d, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input value={d.label} onChange={e => updateLine("deduction", i, "label", e.target.value)} placeholder="Label" className="flex-1 h-8 text-sm" />
                  <Input type="number" value={d.amount_cents / 100} onChange={e => updateLine("deduction", i, "amount_cents", e.target.value)}
                    placeholder="Amount (R)" className="w-32 h-8 text-sm" />
                  <button onClick={() => removeLine("deduction", i)} className="text-red-400 hover:text-red-600"><X className="h-4 w-4" /></button>
                </div>
              ))}
            </div>

            <div className="rounded-xl border bg-card p-5">
              <label className="text-sm font-medium block mb-1.5">Notes (optional)</label>
              <textarea value={runNotes} onChange={e => setRunNotes(e.target.value)} rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" placeholder="Any notes for this payslip..." />
            </div>
          </div>

          <div className="col-span-2 space-y-4">
            <div className="rounded-xl border bg-card p-5 sticky top-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Calculator className="h-4 w-4" />Calculation Preview</h3>
              {!runEmployeeId ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Calculator className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  Select an employee to see the calculation
                </div>
              ) : !calc ? (
                <div className="text-center py-8 text-muted-foreground text-sm">Calculating...</div>
              ) : (
                <div className="space-y-3 text-sm">
                  {selectedEmployee && (
                    <div className="p-3 rounded-lg bg-muted/50 text-xs space-y-1">
                      <p className="font-semibold">{selectedEmployee.first_name} {selectedEmployee.last_name}</p>
                      <p className="text-muted-foreground">Age: {selectedEmployee.age} • {selectedEmployee.uif_exempt ? "UIF Exempt" : "UIF Applicable"}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="flex justify-between text-muted-foreground"><span>Basic Salary</span><span>{R(calc.basic_salary_cents)}</span></div>
                    {runAllowances.filter(a => a.amount_cents > 0).map((a, i) => (
                      <div key={i} className="flex justify-between text-green-600 text-xs"><span>{a.label}</span><span>+{R(a.amount_cents)}</span></div>
                    ))}
                    <div className="flex justify-between font-semibold border-t pt-2"><span>Gross Pay</span><span>{R(calc.gross_pay_cents)}</span></div>
                  </div>
                  <div className="border-t pt-3 space-y-1">
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Deductions</p>
                    <div className="flex justify-between text-red-600"><span>PAYE (Income Tax)</span><span>-{R(calc.paye_cents)}</span></div>
                    <div className="flex justify-between text-orange-600"><span>UIF Employee (1%)</span><span>-{R(calc.uif_employee_cents)}</span></div>
                    {runDeductions.filter(d => d.amount_cents > 0).map((d, i) => (
                      <div key={i} className="flex justify-between text-red-600 text-xs"><span>{d.label}</span><span>-{R(d.amount_cents)}</span></div>
                    ))}
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Net Pay</span><span className="text-green-600">{R(calc.net_pay_cents)}</span>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs space-y-1 text-blue-700">
                    <p className="font-semibold flex items-center gap-1"><Info className="h-3 w-3" />Employer Costs</p>
                    <div className="flex justify-between"><span>UIF Employer (1%)</span><span>{R(calc.uif_employer_cents)}</span></div>
                    <div className="flex justify-between font-semibold border-t border-blue-200 pt-1">
                      <span>Total Cost to Company</span><span>{R(calc.gross_pay_cents + calc.uif_employer_cents)}</span>
                    </div>
                  </div>
                  {calc.paye_cents === 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 p-2 rounded">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      Below PAYE threshold — no tax withheld
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-4">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or period..." className="pl-9" value={histSearch} onChange={e => setHistSearch(e.target.value)} />
          </div>
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-semibold">Employee</th>
                  <th className="text-left p-4 font-semibold">Period</th>
                  <th className="text-left p-4 font-semibold">Gross Pay</th>
                  <th className="text-left p-4 font-semibold">PAYE</th>
                  <th className="text-left p-4 font-semibold">UIF</th>
                  <th className="text-left p-4 font-semibold">Net Pay</th>
                  <th className="text-right p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRuns.length === 0 && (
                  <tr><td colSpan={7} className="p-12 text-center text-muted-foreground">
                    <Printer className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No payslips yet</p>
                    <p className="text-xs mt-1">Run payroll to generate payslips.</p>
                  </td></tr>
                )}
                {filteredRuns.map(run => (
                  <tr key={run.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium">{run.employee_name}</div>
                      {run.position && <div className="text-xs text-muted-foreground">{run.position}</div>}
                    </td>
                    <td className="p-4 font-medium">{periodLabel(run.pay_period)}</td>
                    <td className="p-4">{R(run.gross_pay_cents)}</td>
                    <td className="p-4 text-red-600">{R(run.paye_cents)}</td>
                    <td className="p-4 text-orange-600">{R(run.uif_employee_cents)}</td>
                    <td className="p-4 font-bold text-green-600">{R(run.net_pay_cents)}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="View & Print" onClick={() => openPrintSlip(run.id)}>
                          <Printer className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Delete" onClick={() => handleDeleteRun(run.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Employee" : "Add Employee"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Personal Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium block mb-1">First Name *</label><Input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} /></div>
                <div><label className="text-sm font-medium block mb-1">Last Name *</label><Input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} /></div>
                <div><label className="text-sm font-medium block mb-1">SA ID Number</label><Input value={form.id_number} onChange={e => setForm({...form, id_number: e.target.value})} placeholder="13-digit SA ID" /></div>
                <div><label className="text-sm font-medium block mb-1">SARS Tax Number</label><Input value={form.tax_number} onChange={e => setForm({...form, tax_number: e.target.value})} /></div>
                <div><label className="text-sm font-medium block mb-1">Age</label><Input type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})} /></div>
                <div><label className="text-sm font-medium block mb-1">Phone</label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                <div className="col-span-2"><label className="text-sm font-medium block mb-1">Email</label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                <div className="col-span-2"><label className="text-sm font-medium block mb-1">Address</label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Employment Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium block mb-1">Job Title / Position</label><Input value={form.position} onChange={e => setForm({...form, position: e.target.value})} /></div>
                <div><label className="text-sm font-medium block mb-1">Department</label><Input value={form.department} onChange={e => setForm({...form, department: e.target.value})} /></div>
                <div>
                  <label className="text-sm font-medium block mb-1">Employment Type</label>
                  <select value={form.employment_type} onChange={e => setForm({...form, employment_type: e.target.value})} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
                <div><label className="text-sm font-medium block mb-1">Start Date</label><Input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} /></div>
                <div>
                  <label className="text-sm font-medium block mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Salary & Tax</p>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium block mb-1">Basic Monthly Salary (R) *</label><Input type="number" value={form.basic_salary} onChange={e => setForm({...form, basic_salary: e.target.value})} placeholder="e.g. 20000" /></div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.uif_exempt} onChange={e => setForm({...form, uif_exempt: e.target.checked})} className="rounded" />
                    <span className="text-sm">UIF Exempt</span>
                  </label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Info className="h-3 w-3" />PAYE calculated automatically using SARS 2025/2026 tax tables. UIF capped at R177.12/month.</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Banking Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium block mb-1">Bank Name</label><Input value={form.bank_name} onChange={e => setForm({...form, bank_name: e.target.value})} placeholder="e.g. FNB, ABSA, Standard Bank" /></div>
                <div>
                  <label className="text-sm font-medium block mb-1">Account Type</label>
                  <select value={form.account_type} onChange={e => setForm({...form, account_type: e.target.value})} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="cheque">Cheque / Current</option>
                    <option value="savings">Savings</option>
                    <option value="transmission">Transmission</option>
                  </select>
                </div>
                <div><label className="text-sm font-medium block mb-1">Account Number</label><Input value={form.account_number} onChange={e => setForm({...form, account_number: e.target.value})} /></div>
                <div><label className="text-sm font-medium block mb-1">Branch Code</label><Input value={form.branch_code} onChange={e => setForm({...form, branch_code: e.target.value})} /></div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editingId ? "Save Changes" : "Add Employee"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Employee?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will permanently delete the employee and all their payslip records. This cannot be undone.</p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
