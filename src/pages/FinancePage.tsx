import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Download, Upload,
  ScanLine, Loader2, CheckCircle2, X, Wallet, Pencil, Check, FileSpreadsheet, FileText, Table2
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

interface LedgerEntry {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount_cents: number;
  category: string;
  description: string | null;
  occurred_at: string;
  created_at: string;
}

interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
  net: number;
}

const INCOME_CATEGORIES = ["Sales", "Services", "Interest", "Grants", "Other Income"];
const EXPENSE_CATEGORIES = ["Rent", "Utilities", "Transport", "Stock", "Salaries", "Marketing", "Equipment", "Other Expense"];

const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const fmtR = (cents: number) => `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (dateStr: string) => {
  const d = new Date(dateStr + (dateStr.length === 10 ? "T00:00:00" : ""));
  return d.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
};

export default function FinancePage() {
  const [tab, setTab] = useState<"income" | "expenses" | "summary">("income");
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [allEntries, setAllEntries] = useState<LedgerEntry[]>([]);
  const [summary, setSummary] = useState<MonthlySummary[]>([]);
  const [month, setMonth] = useState(currentMonth());
  const [showForm, setShowForm] = useState(false);
  const [openingBalance, setOpeningBalance] = useState(0); // cents
  const [editingBalance, setEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  const [formType, setFormType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);

  const [scanning, setScanning] = useState(false);
  const [scannedBanner, setScannedBanner] = useState(false);

  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportMonth, setExportMonth] = useState(currentMonth());
  const [exportAllMonths, setExportAllMonths] = useState(false);

  const loadEntries = async () => {
    const res = await fetch(`/api/finance/entries?month=${month}`, { credentials: "include" });
    if (res.ok) setEntries(await res.json());
  };

  const loadAllEntries = async () => {
    const res = await fetch(`/api/finance/entries`, { credentials: "include" });
    if (res.ok) setAllEntries(await res.json());
  };

  const loadSummary = async () => {
    const res = await fetch(`/api/finance/summary`, { credentials: "include" });
    if (res.ok) setSummary(await res.json());
  };

  const loadBalance = async () => {
    const res = await fetch(`/api/finance/balance`, { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      setOpeningBalance(data.opening_balance_cents ?? 0);
    }
  };

  useEffect(() => { loadEntries(); }, [month]);
  useEffect(() => { loadSummary(); loadBalance(); loadAllEntries(); }, []);

  // Compute running balance for entries sorted ascending
  const entriesWithBalance = (() => {
    let running = openingBalance;
    return allEntries.map((e) => {
      running = e.type === "INCOME" ? running + e.amount_cents : running - e.amount_cents;
      return { ...e, runningBalance: running };
    });
  })();

  // For the current month view, get running balance up to start of month
  const balanceBeforeMonth = (() => {
    let running = openingBalance;
    for (const e of allEntries) {
      const entryMonth = e.occurred_at.slice(0, 7);
      if (entryMonth < month) {
        running = e.type === "INCOME" ? running + e.amount_cents : running - e.amount_cents;
      }
    }
    return running;
  })();

  const monthEntriesWithBalance = (() => {
    let running = balanceBeforeMonth;
    return entries.map((e) => {
      running = e.type === "INCOME" ? running + e.amount_cents : running - e.amount_cents;
      return { ...e, runningBalance: running };
    });
  })();

  const handleSaveBalance = async () => {
    const val = parseFloat(balanceInput);
    if (isNaN(val)) { toast.error("Enter a valid amount"); return; }
    const cents = Math.round(val * 100);
    const res = await fetch("/api/finance/balance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ opening_balance_cents: cents }),
    });
    if (res.ok) {
      setOpeningBalance(cents);
      setEditingBalance(false);
      toast.success("Opening balance updated");
      loadAllEntries();
    } else {
      toast.error("Failed to update balance");
    }
  };

  const handleAdd = async () => {
    const amountCents = Math.round(parseFloat(formAmount) * 100);
    if (!formAmount || isNaN(amountCents) || amountCents <= 0) { toast.error("Enter a valid amount"); return; }
    if (!formCategory) { toast.error("Select a category"); return; }

    const res = await fetch("/api/finance/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ type: formType, amountCents, category: formCategory, description: formDesc || undefined, occurredAt: formDate }),
    });

    if (res.ok) {
      toast.success("Entry added");
      setFormAmount(""); setFormCategory(""); setFormDesc("");
      setScannedBanner(false); setShowForm(false);
      loadEntries(); loadSummary(); loadAllEntries();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to add entry");
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/finance/entries/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) { toast.success("Deleted"); loadEntries(); loadSummary(); loadAllEntries(); }
  };

  const handleTemplateDownload = async (format: "csv" | "xlsx") => {
    try {
      const endpoint = format === "csv" ? "/api/finance/export/template-csv" : "/api/finance/export/template-xlsx";
      const res = await fetch(endpoint, { credentials: "include" });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `finance-import-template.${format}`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      setExportDialogOpen(false);
    } catch {
      toast.error("Failed to download template");
    }
  };

  const handleExport = async (format: "csv" | "xlsx" | "pdf" | "plain-csv" | "plain-xlsx") => {
    try {
      const monthParam = exportAllMonths ? "" : exportMonth;
      const qs = monthParam ? `?month=${monthParam}` : "";
      const endpoint =
        format === "csv" ? `/api/finance/export${qs}`
        : format === "xlsx" ? `/api/finance/export/xlsx${qs}`
        : format === "pdf" ? `/api/finance/export/pdf${qs}`
        : format === "plain-csv" ? `/api/finance/export/plain-csv${qs}`
        : `/api/finance/export/plain-xlsx${qs}`;

      const res = await fetch(endpoint, { credentials: "include" });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext = format === "plain-csv" ? "csv" : format === "plain-xlsx" ? "xlsx" : format;
      const periodLabel = exportAllMonths ? "all" : monthParam;
      a.download = `finance-${periodLabel}-${new Date().toISOString().split("T")[0]}.${ext}`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      setExportDialogOpen(false);
    } catch {
      toast.error("Failed to export");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/finance/import", { method: "POST", credentials: "include", body: formData });
      if (!res.ok) throw new Error("Import failed");
      const data = await res.json();
      let msg = `Imported ${data.imported} entries`;
      if (data.openingBalanceImported) msg += " + opening balance set";
      toast.success(msg);
      loadEntries(); loadSummary(); loadBalance(); loadAllEntries();
    } catch {
      toast.error("Failed to import file");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (receiptInputRef.current) receiptInputRef.current.value = "";
    setScanning(true); setShowForm(true); setFormType("EXPENSE"); setScannedBanner(false);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/finance/scan-receipt", { method: "POST", credentials: "include", body: formData });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || "Could not read receipt"); return; }
      const { data } = json;
      if (data.amount) setFormAmount(String(data.amount));
      if (data.date) setFormDate(data.date);
      if (data.description) setFormDesc(data.description);
      if (data.category && EXPENSE_CATEGORIES.includes(data.category)) setFormCategory(data.category);
      if (data.type === "INCOME") setFormType("INCOME");
      setScannedBanner(true);
      toast.success("Receipt scanned — please review and confirm the details");
    } catch {
      toast.error("Failed to scan receipt");
    } finally {
      setScanning(false);
    }
  };

  const filtered = entries.filter((e) =>
    tab === "income" ? e.type === "INCOME" : tab === "expenses" ? e.type === "EXPENSE" : true
  );
  const filteredWithBalance = monthEntriesWithBalance.filter((e) =>
    tab === "income" ? e.type === "INCOME" : tab === "expenses" ? e.type === "EXPENSE" : true
  );

  const totalIncome = entries.filter((e) => e.type === "INCOME").reduce((s, e) => s + e.amount_cents, 0);
  const totalExpense = entries.filter((e) => e.type === "EXPENSE").reduce((s, e) => s + e.amount_cents, 0);
  const net = totalIncome - totalExpense;

  const closingBalance = monthEntriesWithBalance.length > 0
    ? monthEntriesWithBalance[monthEntriesWithBalance.length - 1].runningBalance
    : balanceBeforeMonth;

  const chartData = summary.map((s) => ({
    month: s.month,
    Income: s.income / 100,
    Expenses: s.expense / 100,
  }));

  const categories = tab === "expenses" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  // Summary tab: all entries for the selected month combined
  const summaryMonthEntries = monthEntriesWithBalance;

  return (
    <div className="min-h-full bg-white dark:bg-gray-950">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 30%, #cffafe 70%, #e0f2fe 100%)" }}>
        <div className="pointer-events-none select-none absolute inset-0">
          <motion.div initial={{ opacity: 0, rotate: -5, y: 20 }} animate={{ opacity: 0.88, rotate: -3, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="absolute -left-4 top-4 w-40 rounded-2xl bg-white/80 backdrop-blur shadow-2xl border-2 border-white p-3">
            <div className="h-2 w-14 rounded-full bg-emerald-200 mb-2" />
            <div className="flex items-end gap-1 h-10">
              {[40,70,50,90,60,80,55].map((h, i) => <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: i % 2 === 0 ? "#10b981" : "#14b8a6", opacity: 0.7 }} />)}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, rotate: 5, y: 20 }} animate={{ opacity: 0.85, rotate: 3, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute -right-3 top-6 w-40 rounded-2xl bg-white/80 backdrop-blur shadow-2xl border-2 border-white p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center"><TrendingUp className="h-3.5 w-3.5 text-emerald-600" /></div>
              <div className="h-2 w-16 rounded-full bg-gray-200" />
            </div>
            <div className="h-4 w-20 rounded-lg bg-emerald-100 mb-1.5" />
            <div className="h-3 w-14 rounded-lg bg-teal-50" />
          </motion.div>
          <motion.div initial={{ opacity: 0, rotate: 2, y: 30 }} animate={{ opacity: 0.72, rotate: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute right-28 -bottom-2 w-32 rounded-2xl bg-white/70 backdrop-blur shadow-lg border-2 border-white p-3">
            <div className="h-1.5 w-12 rounded-full bg-gray-200 mb-2" />
            <div className="space-y-1.5">
              {[["w-full","bg-emerald-200"],["w-4/5","bg-teal-200"],["w-3/5","bg-cyan-200"]].map(([w,c],i) => (
                <div key={i} className={`h-2 ${w} rounded-full ${c}`} />
              ))}
            </div>
          </motion.div>
        </div>
        <div className="relative z-10 py-12 px-6 text-center max-w-2xl mx-auto">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2" style={{ color: "#064e3b" }}>
            Income & Expenses
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-emerald-800/70 mb-6 text-sm">
            Track your cash flow, scan receipts and manage your financial health
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-3 flex-wrap">
            <Button onClick={() => { setFormType("INCOME"); setScannedBanner(false); setShowForm(true); }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-md gap-2 rounded-xl">
              <Plus className="h-4 w-4" /> Add Income
            </Button>
            <Button onClick={() => { setFormType("EXPENSE"); setScannedBanner(false); setShowForm(true); }}
              variant="outline" className="bg-white/80 border-white shadow-sm gap-2 text-emerald-900 hover:bg-white rounded-xl">
              <Plus className="h-4 w-4" /> Add Expense
            </Button>
          </motion.div>
        </div>
      </div>

      {/* ── Quick action bar ─────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white dark:bg-gray-950 px-4 py-2">
        <div className="max-w-5xl mx-auto flex items-center gap-0.5 overflow-x-auto scrollbar-none">
          {[
            { label: "Import CSV",    icon: Upload,   action: () => fileInputRef.current?.click(),                                              grad: "from-sky-500 to-blue-500" },
            { label: "Export",        icon: Download, action: () => { setExportMonth(month); setExportAllMonths(false); setExportDialogOpen(true); }, grad: "from-violet-500 to-purple-500" },
            { label: "Scan Receipt",  icon: ScanLine, action: () => receiptInputRef.current?.click(),                                           grad: "from-amber-500 to-orange-500" },
          ].map((a, i) => (
            <motion.button key={a.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={a.action}
              className="flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group min-w-[72px] shrink-0">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${a.grad} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                <a.icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">{a.label}</span>
            </motion.button>
          ))}
          <div className="mx-2 h-10 w-px bg-gray-200 dark:bg-gray-700 shrink-0" />
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            onClick={() => { setFormType(tab === "expenses" ? "EXPENSE" : "INCOME"); setScannedBanner(false); setShowForm(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all shrink-0">
            <Plus className="h-4 w-4" /> Add Entry
          </motion.button>
        </div>
      </div>
      <input type="file" accept=".csv,.xlsx,.xls" ref={fileInputRef} onChange={handleImport} className="hidden" />
      <input type="file" accept="image/*" capture="environment" ref={receiptInputRef} onChange={handleScanReceipt} className="hidden" />

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Download className="h-4 w-4" /> Export Finance Data</DialogTitle>
          </DialogHeader>

          {/* Period selector */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Period</Label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={exportAllMonths}
                  onChange={(e) => setExportAllMonths(e.target.checked)}
                  className="rounded"
                />
                All months
              </label>
              {!exportAllMonths && (
                <Input
                  type="month"
                  value={exportMonth}
                  onChange={(e) => setExportMonth(e.target.value)}
                  className="h-8 w-40 text-sm"
                />
              )}
            </div>
          </div>

          <Separator />

          {/* Blank template */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Blank Import Template</p>
            <p className="text-xs text-muted-foreground">
              Empty file with the correct columns and instructions. Fill it in with your own data, then import it back using the <strong>Import</strong> button.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button variant="outline" className="justify-start gap-2 border-amber-300 text-amber-700 hover:bg-amber-50" onClick={() => handleTemplateDownload("csv")}>
                <Table2 className="h-4 w-4" />
                <span className="text-sm">Template CSV</span>
              </Button>
              <Button variant="outline" className="justify-start gap-2 border-amber-300 text-amber-700 hover:bg-amber-50" onClick={() => handleTemplateDownload("xlsx")}>
                <FileSpreadsheet className="h-4 w-4" />
                <span className="text-sm">Template Excel</span>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Plain / reimportable formats */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Export Your Data — Reimportable</p>
            <p className="text-xs text-muted-foreground">Your existing entries in a simple format that can be imported back into Masakhe.</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button variant="outline" className="justify-start gap-2" onClick={() => handleExport("plain-csv")}>
                <Table2 className="h-4 w-4 text-green-600" />
                <span className="text-sm">Plain CSV</span>
              </Button>
              <Button variant="outline" className="justify-start gap-2" onClick={() => handleExport("plain-xlsx")}>
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                <span className="text-sm">Plain Excel</span>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Bank statement formats */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bank Statement Format</p>
            <p className="text-xs text-muted-foreground">Formatted with opening/closing balances, Payments and Deposits columns.</p>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Button variant="outline" className="justify-start gap-2" onClick={() => handleExport("csv")}>
                <Table2 className="h-4 w-4 text-blue-600" />
                <span className="text-sm">CSV</span>
              </Button>
              <Button variant="outline" className="justify-start gap-2" onClick={() => handleExport("xlsx")}>
                <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Excel</span>
              </Button>
              <Button variant="outline" className="justify-start gap-2" onClick={() => handleExport("pdf")}>
                <FileText className="h-4 w-4 text-red-600" />
                <span className="text-sm">PDF</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Opening Balance */}
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <p className="text-xs text-muted-foreground">Opening Balance</p>
            <button
              onClick={() => { setBalanceInput((openingBalance / 100).toFixed(2)); setEditingBalance(true); }}
              className="ml-auto text-muted-foreground hover:text-foreground"
            >
              <Pencil className="h-3 w-3" />
            </button>
          </div>
          {editingBalance ? (
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-muted-foreground">R</span>
              <Input
                autoFocus
                type="number"
                step="0.01"
                value={balanceInput}
                onChange={(e) => setBalanceInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveBalance(); if (e.key === "Escape") setEditingBalance(false); }}
                className="h-7 text-sm px-2 w-28"
              />
              <button onClick={handleSaveBalance} className="text-green-600 hover:text-green-700">
                <Check className="h-4 w-4" />
              </button>
              <button onClick={() => setEditingBalance(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <p className={`text-lg font-bold ${openingBalance >= 0 ? "text-blue-600" : "text-red-600"}`}>
              {fmtR(openingBalance)}
            </p>
          )}
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <p className="text-xs text-muted-foreground">Income ({month})</p>
          </div>
          <p className="text-lg font-bold text-emerald-600">{fmtR(totalIncome)}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-rose-500">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 shadow-sm">
              <TrendingDown className="h-4 w-4 text-white" />
            </div>
            <p className="text-xs text-muted-foreground">Expenses ({month})</p>
          </div>
          <p className="text-lg font-bold text-rose-600">{fmtR(totalExpense)}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-violet-500">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <p className="text-xs text-muted-foreground">Closing Balance</p>
          </div>
          <p className={`text-lg font-bold ${closingBalance >= 0 ? "text-violet-600" : "text-rose-600"}`}>
            {fmtR(closingBalance)}
          </p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b">
        {(["income", "expenses", "summary"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "summary" ? "Monthly Summary" : t}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 pb-1">
          <Label className="text-xs text-muted-foreground">Month:</Label>
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="h-8 w-40 text-sm" />
        </div>
      </div>

      {/* Add Entry Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div key="entry-form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card className="p-5 border-primary/20 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">New {formType === "INCOME" ? "Income" : "Expense"} Entry</h3>
                  {scannedBanner && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      <CheckCircle2 className="h-3 w-3" /> Receipt scanned — review details
                    </span>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setShowForm(false); setScannedBanner(false); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {scanning && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20 mb-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Reading your receipt…</p>
                    <p className="text-xs text-muted-foreground">AI is extracting the amount, date, and vendor details</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <Label className="text-xs">Type</Label>
                  <select
                    value={formType}
                    onChange={(e) => { setFormType(e.target.value as any); setFormCategory(""); }}
                    className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Amount (R)</Label>
                  <Input
                    type="number" step="0.01" min="0" value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className={`mt-1 h-9 ${scannedBanner && formAmount ? "border-green-400 bg-green-50/30" : ""}`}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label className="text-xs">Category</Label>
                  <select
                    value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                    className={`mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm ${scannedBanner && formCategory ? "border-green-400" : ""}`}
                  >
                    <option value="">Select...</option>
                    {(formType === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Date</Label>
                  <Input
                    type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)}
                    className={`mt-1 h-9 ${scannedBanner && formDate ? "border-green-400 bg-green-50/30" : ""}`}
                  />
                </div>
                <div>
                  <Label className="text-xs">Description</Label>
                  <Input
                    value={formDesc} onChange={(e) => setFormDesc(e.target.value)}
                    className={`mt-1 h-9 ${scannedBanner && formDesc ? "border-green-400 bg-green-50/30" : ""}`}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleAdd} className="gradient-hero text-white" disabled={scanning}>Save Entry</Button>
                <Button variant="ghost" onClick={() => { setShowForm(false); setScannedBanner(false); }}>Cancel</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Monthly Summary Tab */}
      {tab === "summary" && (
        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="font-bold mb-4">Monthly Income vs Expenses</h3>
            {chartData.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No data yet. Start logging income and expenses.</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `R${v.toLocaleString()}`} />
                  <Tooltip formatter={(v: number) => `R${v.toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="Income" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expenses" fill="#dc2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Combined income/expense table for the selected month */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
              <h3 className="font-semibold text-sm">Transactions — {month}</h3>
              <div className="flex gap-4 text-xs">
                <span className="text-green-600 font-medium">Income: {fmtR(totalIncome)}</span>
                <span className="text-red-600 font-medium">Expenses: {fmtR(totalExpense)}</span>
                <span className={`font-bold ${net >= 0 ? "text-green-700" : "text-red-600"}`}>Net: {net >= 0 ? "+" : ""}{fmtR(net)}</span>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left p-3 font-semibold text-xs">Date</th>
                  <th className="text-left p-3 font-semibold text-xs">Description</th>
                  <th className="text-left p-3 font-semibold text-xs hidden md:table-cell">Category</th>
                  <th className="text-right p-3 font-semibold text-xs">Payments</th>
                  <th className="text-right p-3 font-semibold text-xs">Deposits</th>
                  <th className="text-right p-3 font-semibold text-xs">Balance</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {/* Opening balance row */}
                <tr className="border-b bg-blue-50/40">
                  <td className="p-3 text-xs text-muted-foreground">—</td>
                  <td className="p-3 text-xs font-semibold text-blue-700">Opening Balance</td>
                  <td className="p-3 hidden md:table-cell"></td>
                  <td className="p-3 text-right"></td>
                  <td className="p-3 text-right"></td>
                  <td className="p-3 text-right text-xs font-bold text-blue-700">{fmtR(balanceBeforeMonth)}</td>
                  <td></td>
                </tr>
                {summaryMonthEntries.map((entry) => (
                  <tr key={entry.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{fmtDate(entry.occurred_at)}</td>
                    <td className="p-3 text-xs">{entry.description || entry.category}</td>
                    <td className="p-3 hidden md:table-cell">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{entry.category}</span>
                    </td>
                    <td className="p-3 text-right text-xs font-semibold text-red-600">
                      {entry.type === "EXPENSE" ? fmtR(entry.amount_cents) : ""}
                    </td>
                    <td className="p-3 text-right text-xs font-semibold text-green-600">
                      {entry.type === "INCOME" ? fmtR(entry.amount_cents) : ""}
                    </td>
                    <td className={`p-3 text-right text-xs font-bold ${entry.runningBalance >= 0 ? "text-foreground" : "text-red-600"}`}>
                      {fmtR(entry.runningBalance)}
                    </td>
                    <td className="p-3">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleDelete(entry.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {summaryMonthEntries.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground text-sm">No transactions for {month}.</td></tr>
                )}
                {/* Closing balance row */}
                {summaryMonthEntries.length > 0 && (
                  <tr className="bg-muted/40 border-t-2">
                    <td className="p-3"></td>
                    <td className="p-3 text-xs font-bold text-foreground">Closing Balance</td>
                    <td className="hidden md:table-cell"></td>
                    <td className="p-3 text-right text-xs font-semibold text-red-600">{fmtR(totalExpense)}</td>
                    <td className="p-3 text-right text-xs font-semibold text-green-600">{fmtR(totalIncome)}</td>
                    <td className={`p-3 text-right text-xs font-bold ${closingBalance >= 0 ? "text-foreground" : "text-red-600"}`}>
                      {fmtR(closingBalance)}
                    </td>
                    <td></td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Income / Expenses Table — bank statement format */}
      {tab !== "summary" && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
            <h3 className="font-semibold text-sm capitalize">{tab} — {month}</h3>
            <div className="flex gap-4 text-xs">
              {tab === "income" ? (
                <span className="text-green-600 font-medium">Total Deposits: {fmtR(totalIncome)}</span>
              ) : (
                <span className="text-red-600 font-medium">Total Payments: {fmtR(totalExpense)}</span>
              )}
              <span className={`font-bold ${closingBalance >= 0 ? "text-foreground" : "text-red-600"}`}>
                Closing Balance: {fmtR(closingBalance)}
              </span>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left p-3 font-semibold text-xs">Date</th>
                <th className="text-left p-3 font-semibold text-xs">Description</th>
                <th className="text-left p-3 font-semibold text-xs hidden md:table-cell">Category</th>
                <th className="text-right p-3 font-semibold text-xs">Payments</th>
                <th className="text-right p-3 font-semibold text-xs">Deposits</th>
                <th className="text-right p-3 font-semibold text-xs">Balance</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {/* Opening balance row */}
              <tr className="border-b bg-blue-50/40">
                <td className="p-3 text-xs text-muted-foreground">—</td>
                <td className="p-3 text-xs font-semibold text-blue-700">Opening Balance</td>
                <td className="p-3 hidden md:table-cell"></td>
                <td className="p-3 text-right"></td>
                <td className="p-3 text-right"></td>
                <td className="p-3 text-right text-xs font-bold text-blue-700">{fmtR(balanceBeforeMonth)}</td>
                <td></td>
              </tr>

              {filteredWithBalance.map((entry) => (
                <tr key={entry.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{fmtDate(entry.occurred_at)}</td>
                  <td className="p-3 text-xs">{entry.description || entry.category}</td>
                  <td className="p-3 hidden md:table-cell">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{entry.category}</span>
                  </td>
                  <td className="p-3 text-right text-xs font-semibold text-red-600">
                    {entry.type === "EXPENSE" ? fmtR(entry.amount_cents) : ""}
                  </td>
                  <td className="p-3 text-right text-xs font-semibold text-green-600">
                    {entry.type === "INCOME" ? fmtR(entry.amount_cents) : ""}
                  </td>
                  <td className={`p-3 text-right text-xs font-bold ${entry.runningBalance >= 0 ? "text-foreground" : "text-red-600"}`}>
                    {fmtR(entry.runningBalance)}
                  </td>
                  <td className="p-3">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(entry.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}

              {filteredWithBalance.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No entries for this period.</td></tr>
              )}

              {/* Closing balance row */}
              {filteredWithBalance.length > 0 && (
                <tr className="bg-muted/40 border-t-2">
                  <td className="p-3"></td>
                  <td className="p-3 text-xs font-bold">Closing Balance</td>
                  <td className="hidden md:table-cell"></td>
                  <td className="p-3 text-right text-xs font-semibold text-red-600">
                    {tab === "expenses" ? fmtR(totalExpense) : ""}
                  </td>
                  <td className="p-3 text-right text-xs font-semibold text-green-600">
                    {tab === "income" ? fmtR(totalIncome) : ""}
                  </td>
                  <td className={`p-3 text-right text-xs font-bold ${closingBalance >= 0 ? "text-foreground" : "text-red-600"}`}>
                    {fmtR(closingBalance)}
                  </td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}
      </div>
    </div>
  );
}
