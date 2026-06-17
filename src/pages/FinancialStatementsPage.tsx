import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { BarChart2, Plus, Trash2, ChevronLeft, Download, FileSpreadsheet, Eye, Edit } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from "recharts";

interface FormData {
  financialYear: string; totalRevenue: string; costOfSales: string;
  operatingExpenses: string; salaries: string; taxes: string;
  assets: string; liabilities: string; equity: string;
}

interface Computed {
  revenue: number; costOfSales: number; opEx: number; salaries: number; taxes: number;
  assets: number; liabilities: number; equity: number;
  grossProfit: number; ebitda: number; netProfit: number; totalExpenses: number; netEquity: number;
}

interface Statement { id: string; title: string; financial_year: number; created_at: string; updated_at: string; }

const empty: FormData = {
  financialYear: String(new Date().getFullYear()), totalRevenue: "", costOfSales: "",
  operatingExpenses: "", salaries: "", taxes: "", assets: "", liabilities: "", equity: "",
};

function formatR(v: number) {
  const abs = Math.abs(v);
  const formatted = `R${abs.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return v < 0 ? `(${formatted})` : formatted;
}

function StatRow({ label, value, bold, indent, highlight }: { label: string; value: number; bold?: boolean; indent?: boolean; highlight?: "green" | "red" | "neutral" }) {
  const color = highlight === "green" ? "text-green-700" : highlight === "red" ? "text-red-600" : "";
  return (
    <tr className={`border-b border-border/50 ${bold ? "font-semibold bg-muted/30" : ""}`}>
      <td className={`py-2 px-4 text-sm ${indent ? "pl-8" : ""} ${color}`}>{label}</td>
      <td className={`py-2 px-4 text-sm text-right tabular-nums ${color}`}>{formatR(value)}</td>
    </tr>
  );
}

export default function FinancialStatementsPage() {
  const [view, setView] = useState<"list" | "form" | "statement">("list");
  const [statements, setStatements] = useState<Statement[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(empty);
  const [computed, setComputed] = useState<Computed | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(false);

  const loadStatements = useCallback(() => {
    fetch("/api/documents/financial-statements", { credentials: "include" })
      .then(r => r.json()).then(d => setStatements(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => { loadStatements(); }, [loadStatements]);

  const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }));

  const liveComputed = (): Computed => {
    const revenue = Number(form.totalRevenue) || 0;
    const costOfSales = Number(form.costOfSales) || 0;
    const opEx = Number(form.operatingExpenses) || 0;
    const salaries = Number(form.salaries) || 0;
    const taxes = Number(form.taxes) || 0;
    const assets = Number(form.assets) || 0;
    const liabilities = Number(form.liabilities) || 0;
    const equity = Number(form.equity) || 0;
    const grossProfit = revenue - costOfSales;
    const ebitda = grossProfit - opEx - salaries;
    const netProfit = ebitda - taxes;
    const totalExpenses = costOfSales + opEx + salaries + taxes;
    const netEquity = assets - liabilities;
    return { revenue, costOfSales, opEx, salaries, taxes, assets, liabilities, equity, grossProfit, ebitda, netProfit, totalExpenses, netEquity };
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const url = currentId ? `/api/documents/financial-statements/${currentId}` : "/api/documents/financial-statements";
      const method = currentId ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ formData: form }),
      });
      const d = await res.json();
      if (res.ok) {
        if (!currentId) setCurrentId(d.id);
        setComputed(d.computed || liveComputed());
        setView("statement");
        loadStatements();
        toast.success("Financial statement saved!");
      } else toast.error(d.error || "Save failed");
    } catch { toast.error("Network error"); }
    setSaving(false);
  };

  const openExisting = async (id: string) => {
    setLoadingDoc(true);
    const res = await fetch(`/api/documents/financial-statements/${id}`, { credentials: "include" });
    const d = await res.json();
    setLoadingDoc(false);
    if (res.ok) {
      setCurrentId(id); setForm(d.form_data || empty); setComputed(d.computed);
      setView("statement");
    } else toast.error("Failed to load");
  };

  const deleteStatement = async (id: string) => {
    if (!confirm("Delete this statement?")) return;
    await fetch(`/api/documents/financial-statements/${id}`, { method: "DELETE", credentials: "include" });
    loadStatements(); toast.success("Deleted");
  };

  const c = computed || liveComputed();

  const chartData = computed ? [
    { name: "Revenue", value: c.revenue, fill: "#14684b" },
    { name: "Cost of Sales", value: c.costOfSales, fill: "#dc2626" },
    { name: "Gross Profit", value: c.grossProfit, fill: c.grossProfit >= 0 ? "#10b981" : "#ef4444" },
    { name: "Net Profit", value: c.netProfit, fill: c.netProfit >= 0 ? "#2563eb" : "#ef4444" },
  ] : [];

  const exportCSV = () => {
    if (!computed) return;
    const rows = [
      ["Annual Financial Statement", form.financialYear],
      [""],
      ["INCOME STATEMENT", ""],
      ["Total Revenue", c.revenue],
      ["Cost of Sales", c.costOfSales],
      ["Gross Profit", c.grossProfit],
      ["Operating Expenses", c.opEx],
      ["Salaries", c.salaries],
      ["EBITDA", c.ebitda],
      ["Taxes", c.taxes],
      ["Net Profit", c.netProfit],
      [""],
      ["BALANCE SHEET", ""],
      ["Total Assets", c.assets],
      ["Total Liabilities", c.liabilities],
      ["Net Equity", c.netEquity],
      ["Stated Equity", c.equity],
      [""],
      ["PROFIT & LOSS SUMMARY", ""],
      ["Total Revenue", c.revenue],
      ["Total Expenses", c.totalExpenses],
      ["Net Profit/Loss", c.netProfit],
      ["Profit Margin %", c.revenue > 0 ? ((c.netProfit / c.revenue) * 100).toFixed(1) + "%" : "N/A"],
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `financial-statement-${form.financialYear}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const printPDF = () => {
    if (!computed) return;
    const html = `<!DOCTYPE html><html><head><title>Financial Statement ${form.financialYear}</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: Arial, sans-serif; font-size: 11pt; color: #1a1a1a; padding: 50px; max-width: 800px; margin: 0 auto; }
      h1 { font-size: 22pt; color: #14684b; margin-bottom: 4px; }
      h2 { font-size: 13pt; color: #14684b; margin-top: 32px; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 2px solid #14684b; }
      .cover { margin-bottom: 36px; padding-bottom: 20px; border-bottom: 2px solid #14684b; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
      th { background: #14684b; color: white; padding: 8px 12px; text-align: left; font-size: 10pt; }
      td { padding: 6px 12px; font-size: 10pt; border-bottom: 1px solid #e5e7eb; }
      td:last-child { text-align: right; font-variant-numeric: tabular-nums; }
      .total td { font-weight: bold; background: #f0fdf4; }
      .negative { color: #dc2626; }
      @media print { body { padding: 30px; } }
    </style></head><body>
    <div class="cover">
      <h1>Annual Financial Statement</h1>
      <p style="color:#555;margin-top:6px;">Financial Year: <strong>${form.financialYear}</strong></p>
      <p style="color:#888;font-size:9pt;margin-top:4px;">Prepared: ${new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}</p>
    </div>
    <h2>Income Statement</h2>
    <table><tr><th>Description</th><th>Amount</th></tr>
    <tr><td>Total Revenue</td><td>${formatR(c.revenue)}</td></tr>
    <tr><td>Cost of Sales</td><td>(${formatR(c.costOfSales)})</td></tr>
    <tr class="total"><td>Gross Profit</td><td class="${c.grossProfit < 0 ? "negative" : ""}">${formatR(c.grossProfit)}</td></tr>
    <tr><td>Operating Expenses</td><td>(${formatR(c.opEx)})</td></tr>
    <tr><td>Salaries</td><td>(${formatR(c.salaries)})</td></tr>
    <tr class="total"><td>EBITDA</td><td class="${c.ebitda < 0 ? "negative" : ""}">${formatR(c.ebitda)}</td></tr>
    <tr><td>Taxes</td><td>(${formatR(c.taxes)})</td></tr>
    <tr class="total"><td>Net Profit / (Loss)</td><td class="${c.netProfit < 0 ? "negative" : ""}">${formatR(c.netProfit)}</td></tr>
    </table>
    <h2>Balance Sheet</h2>
    <table><tr><th>Description</th><th>Amount</th></tr>
    <tr><td>Total Assets</td><td>${formatR(c.assets)}</td></tr>
    <tr><td>Total Liabilities</td><td>(${formatR(c.liabilities)})</td></tr>
    <tr class="total"><td>Net Equity</td><td class="${c.netEquity < 0 ? "negative" : ""}">${formatR(c.netEquity)}</td></tr>
    <tr><td>Stated Equity / Capital</td><td>${formatR(c.equity)}</td></tr>
    </table>
    <h2>Profit & Loss Summary</h2>
    <table><tr><th>Description</th><th>Amount</th></tr>
    <tr><td>Total Revenue</td><td>${formatR(c.revenue)}</td></tr>
    <tr><td>Total Expenses</td><td>(${formatR(c.totalExpenses)})</td></tr>
    <tr class="total"><td>Net Profit / (Loss)</td><td class="${c.netProfit < 0 ? "negative" : ""}">${formatR(c.netProfit)}</td></tr>
    <tr><td>Profit Margin</td><td>${c.revenue > 0 ? ((c.netProfit / c.revenue) * 100).toFixed(1) + "%" : "N/A"}</td></tr>
    </table>
    <script>window.onload = function() { window.print(); }<\/script>
    </body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win2 = window.open(url, "_blank");
    if (!win2) { toast.error("Popup blocked — please allow popups for this site and try again."); URL.revokeObjectURL(url); return; }
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  if (view === "list") return (
    <div className="min-h-full bg-white dark:bg-gray-950">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 30%, #dbeafe 70%, #e0e7ff 100%)" }}>
        <div className="pointer-events-none select-none absolute inset-0">
          <motion.div initial={{ opacity: 0, rotate: -5, y: 20 }} animate={{ opacity: 0.88, rotate: -3, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="absolute -left-4 top-4 w-40 rounded-2xl bg-white/85 backdrop-blur shadow-2xl border-2 border-white p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center"><BarChart2 className="h-3.5 w-3.5 text-emerald-600"/></div>
              <div className="space-y-1"><div className="h-2 w-14 rounded-full bg-gray-200"/><div className="h-1.5 w-8 rounded-full bg-gray-100"/></div>
            </div>
            <div className="flex items-end gap-1 h-10">
              {[50,80,65,90,70,85,60].map((h,i) => <div key={i} className="flex-1 rounded-t-sm" style={{height:`${h}%`,background:i%2===0?"#10b981":"#3b82f6",opacity:0.65}}/>)}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, rotate: 5, y: 20 }} animate={{ opacity: 0.85, rotate: 3, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute -right-3 top-5 w-36 rounded-2xl bg-white/85 backdrop-blur shadow-2xl border-2 border-white p-3">
            <div className="h-2 w-14 rounded-full bg-blue-200 mb-2"/>
            <div className="space-y-1.5">
              {["w-full","w-4/5","w-3/5"].map((w,i) => <div key={i} className={`h-3 ${w} rounded-lg ${i===0?"bg-emerald-100":i===1?"bg-blue-100":"bg-indigo-100"}`}/>)}
            </div>
            <div className="h-5 w-full rounded-lg bg-emerald-100 mt-2"/>
          </motion.div>
        </div>
        <div className="relative z-10 py-12 px-6 text-center max-w-2xl mx-auto">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2" style={{ color: "#064e3b" }}>
            Financial Statements
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-emerald-800/70 mb-6 text-sm">
            Generate income statements, balance sheets, and P&amp;L summaries for your business
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Button onClick={() => { setCurrentId(null); setForm(empty); setComputed(null); setView("form"); }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-md gap-2 rounded-xl">
              <Plus className="h-4 w-4" /> New Statement
            </Button>
          </motion.div>
        </div>
      </div>

      {/* ── Quick action bar ─────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white dark:bg-gray-950 px-4 py-2">
        <div className="max-w-4xl mx-auto flex items-center gap-0.5 overflow-x-auto scrollbar-none">
          <motion.div className="flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors min-w-[80px] shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm">
              <BarChart2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-[11px] font-medium text-gray-600 whitespace-nowrap">Statements</span>
          </motion.div>
          <div className="mx-2 h-10 w-px bg-gray-200 shrink-0" />
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            onClick={() => { setCurrentId(null); setForm(empty); setComputed(null); setView("form"); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all shrink-0">
            <Plus className="h-4 w-4" /> New Statement
          </motion.button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">

      {statements.length === 0 ? (
        <Card className="p-12 text-center">
          <BarChart2 className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="font-semibold text-lg mb-2">No statements yet</p>
          <p className="text-muted-foreground text-sm mb-6">Create your first annual financial statement</p>
          <Button onClick={() => { setCurrentId(null); setForm(empty); setComputed(null); setView("form"); }} className="gradient-hero text-white gap-2"><Plus className="h-4 w-4" /> Create Statement</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {statements.map(s => (
            <Card key={s.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(s.updated_at).toLocaleDateString("en-ZA")}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openExisting(s.id)} disabled={loadingDoc} className="gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> View
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteStatement(s.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  );

  if (view === "statement" && computed) return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setView("list")} className="gap-1.5">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setView("form")} className="gap-1.5">
            <Edit className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5">
            <FileSpreadsheet className="h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button onClick={printPDF} className="gradient-hero text-white gap-2">
            <Download className="h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Revenue", value: c.revenue, color: "text-primary" },
          { label: "Net Profit", value: c.netProfit, color: c.netProfit >= 0 ? "text-green-700" : "text-red-600" },
          { label: "Net Equity", value: c.netEquity, color: c.netEquity >= 0 ? "text-blue-700" : "text-red-600" },
        ].map(kpi => (
          <Card key={kpi.label} className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{kpi.label}</p>
            <p className={`text-2xl font-bold font-heading mt-1 ${kpi.color}`}>{formatR(kpi.value)}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h3 className="font-semibold text-sm mb-4">Financial Overview — {form.financialYear}</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `R${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: any) => formatR(Number(v))} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <div className="px-4 py-3 bg-primary text-white font-semibold text-sm">Income Statement</div>
          <table className="w-full">
            <tbody>
              <StatRow label="Total Revenue" value={c.revenue} />
              <StatRow label="Cost of Sales" value={-c.costOfSales} indent />
              <StatRow label="Gross Profit" value={c.grossProfit} bold highlight={c.grossProfit >= 0 ? "green" : "red"} />
              <StatRow label="Operating Expenses" value={-c.opEx} indent />
              <StatRow label="Salaries" value={-c.salaries} indent />
              <StatRow label="EBITDA" value={c.ebitda} bold highlight={c.ebitda >= 0 ? "green" : "red"} />
              <StatRow label="Taxes" value={-c.taxes} indent />
              <StatRow label="Net Profit / (Loss)" value={c.netProfit} bold highlight={c.netProfit >= 0 ? "green" : "red"} />
            </tbody>
          </table>
        </Card>

        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="px-4 py-3 bg-primary text-white font-semibold text-sm">Balance Sheet</div>
            <table className="w-full">
              <tbody>
                <StatRow label="Total Assets" value={c.assets} />
                <StatRow label="Total Liabilities" value={-c.liabilities} indent />
                <StatRow label="Net Equity" value={c.netEquity} bold highlight={c.netEquity >= 0 ? "green" : "red"} />
                <StatRow label="Stated Equity" value={c.equity} indent />
              </tbody>
            </table>
          </Card>

          <Card className="overflow-hidden">
            <div className="px-4 py-3 bg-primary text-white font-semibold text-sm">Profit & Loss Summary</div>
            <table className="w-full">
              <tbody>
                <StatRow label="Total Revenue" value={c.revenue} />
                <StatRow label="Total Expenses" value={-c.totalExpenses} />
                <StatRow label="Net Profit / (Loss)" value={c.netProfit} bold highlight={c.netProfit >= 0 ? "green" : "red"} />
                <tr className="border-b border-border/50">
                  <td className="py-2 px-4 text-sm">Profit Margin</td>
                  <td className={`py-2 px-4 text-sm text-right font-semibold ${c.netProfit >= 0 ? "text-green-700" : "text-red-600"}`}>
                    {c.revenue > 0 ? `${((c.netProfit / c.revenue) * 100).toFixed(1)}%` : "N/A"}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setView("list")} className="gap-1.5">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <div>
          <h2 className="text-xl font-bold font-heading">Annual Financial Statement</h2>
          <p className="text-xs text-muted-foreground">Enter your financial data below</p>
        </div>
      </div>

      <Card className="p-6 space-y-5">
        <h3 className="font-semibold">Financial Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Financial Year *</Label>
            <Input type="number" value={form.financialYear} onChange={e => set("financialYear", e.target.value)} placeholder="2024" className="mt-1 max-w-[140px]" />
          </div>
          <div><Label>Total Revenue (R)</Label><Input type="number" value={form.totalRevenue} onChange={e => set("totalRevenue", e.target.value)} placeholder="0" className="mt-1" /></div>
          <div><Label>Cost of Sales (R)</Label><Input type="number" value={form.costOfSales} onChange={e => set("costOfSales", e.target.value)} placeholder="0" className="mt-1" /></div>
          <div><Label>Operating Expenses (R)</Label><Input type="number" value={form.operatingExpenses} onChange={e => set("operatingExpenses", e.target.value)} placeholder="0" className="mt-1" /></div>
          <div><Label>Salaries & Wages (R)</Label><Input type="number" value={form.salaries} onChange={e => set("salaries", e.target.value)} placeholder="0" className="mt-1" /></div>
          <div><Label>Taxes (R)</Label><Input type="number" value={form.taxes} onChange={e => set("taxes", e.target.value)} placeholder="0" className="mt-1" /></div>
        </div>

        <div className="border-t pt-5">
          <h4 className="font-medium text-sm mb-4">Balance Sheet</h4>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Total Assets (R)</Label><Input type="number" value={form.assets} onChange={e => set("assets", e.target.value)} placeholder="0" className="mt-1" /></div>
            <div><Label>Total Liabilities (R)</Label><Input type="number" value={form.liabilities} onChange={e => set("liabilities", e.target.value)} placeholder="0" className="mt-1" /></div>
            <div><Label>Equity / Capital (R)</Label><Input type="number" value={form.equity} onChange={e => set("equity", e.target.value)} placeholder="0" className="mt-1" /></div>
          </div>
        </div>

        {(form.totalRevenue || form.costOfSales) && (
          <div className="border-t pt-4">
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Live Preview</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Gross Profit", value: liveComputed().grossProfit },
                { label: "Net Profit", value: liveComputed().netProfit },
                { label: "Net Equity", value: liveComputed().netEquity },
              ].map(item => (
                <div key={item.label} className={`rounded-lg p-3 text-center ${item.value >= 0 ? "bg-green-50" : "bg-red-50"}`}>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className={`text-sm font-bold mt-0.5 ${item.value >= 0 ? "text-green-700" : "text-red-600"}`}>{formatR(item.value)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={saving || !form.financialYear} className="gradient-hero text-white gap-2 min-w-[160px]">
          {saving ? "Saving..." : "Generate Statements"}
        </Button>
      </div>
    </div>
  );
}
