import { useState, useEffect, useRef } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Download, Upload,
  ScanLine, Loader2, CheckCircle2, X, Wallet, Pencil, Check
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

  const handleExport = async (format: "csv" | "xlsx" | "pdf") => {
    try {
      const endpoint = format === "csv" ? "/api/finance/export"
        : format === "xlsx" ? "/api/finance/export/xlsx"
        : "/api/finance/export/pdf";
      const res = await fetch(endpoint, { credentials: "include" });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `statement-${new Date().toISOString().split("T")[0]}.${format}`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading">Income/Expenses</h2>
          <p className="text-muted-foreground">Track your income and expenses</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")}>CSV (.csv)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("xlsx")}>Excel Statement (.xlsx)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>PDF Statement (.pdf)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" /> Import
          </Button>
          <Button
            variant="outline"
            onClick={() => receiptInputRef.current?.click()}
            disabled={scanning}
            className="border-primary/40 text-primary hover:bg-primary/5"
          >
            {scanning ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scanning...</> : <><ScanLine className="h-4 w-4 mr-2" /> Scan Receipt</>}
          </Button>
          <Button onClick={() => { setFormType(tab === "expenses" ? "EXPENSE" : "INCOME"); setScannedBanner(false); setShowForm(true); }} className="gradient-hero text-white">
            <Plus className="h-4 w-4 mr-2" /> Add Entry
          </Button>
        </div>
      </div>
      <input type="file" accept=".csv,.xlsx,.xls" ref={fileInputRef} onChange={handleImport} className="hidden" />
      <input type="file" accept="image/*" capture="environment" ref={receiptInputRef} onChange={handleScanReceipt} className="hidden" />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Opening Balance */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
              <Wallet className="h-4 w-4 text-blue-600" />
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

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground">Income ({month})</p>
          </div>
          <p className="text-lg font-bold text-green-600">{fmtR(totalIncome)}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-xs text-muted-foreground">Expenses ({month})</p>
          </div>
          <p className="text-lg font-bold text-red-600">{fmtR(totalExpense)}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
              <DollarSign className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-xs text-muted-foreground">Closing Balance</p>
          </div>
          <p className={`text-lg font-bold ${closingBalance >= 0 ? "text-purple-600" : "text-red-600"}`}>
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
  );
}
