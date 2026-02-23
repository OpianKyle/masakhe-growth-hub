import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Plus, Trash2, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight
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

export default function FinancePage() {
  const [tab, setTab] = useState<"income" | "expenses" | "summary">("income");
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [summary, setSummary] = useState<MonthlySummary[]>([]);
  const [month, setMonth] = useState(currentMonth());
  const [showForm, setShowForm] = useState(false);

  const [formType, setFormType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);

  const loadEntries = async () => {
    const res = await fetch(`/api/finance/entries?month=${month}`, { credentials: "include" });
    if (res.ok) setEntries(await res.json());
  };

  const loadSummary = async () => {
    const res = await fetch(`/api/finance/summary`, { credentials: "include" });
    if (res.ok) setSummary(await res.json());
  };

  useEffect(() => { loadEntries(); }, [month]);
  useEffect(() => { loadSummary(); }, []);

  const handleAdd = async () => {
    const amountCents = Math.round(parseFloat(formAmount) * 100);
    if (!formAmount || isNaN(amountCents) || amountCents <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!formCategory) { toast.error("Select a category"); return; }

    const res = await fetch("/api/finance/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        type: formType,
        amountCents,
        category: formCategory,
        description: formDesc || undefined,
        occurredAt: formDate,
      }),
    });

    if (res.ok) {
      toast.success("Entry added");
      setFormAmount(""); setFormCategory(""); setFormDesc("");
      setShowForm(false);
      loadEntries();
      loadSummary();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to add entry");
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/finance/entries/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) { toast.success("Deleted"); loadEntries(); loadSummary(); }
  };

  const filtered = entries.filter((e) =>
    tab === "income" ? e.type === "INCOME" : tab === "expenses" ? e.type === "EXPENSE" : true
  );

  const totalIncome = entries.filter((e) => e.type === "INCOME").reduce((s, e) => s + e.amount_cents, 0);
  const totalExpense = entries.filter((e) => e.type === "EXPENSE").reduce((s, e) => s + e.amount_cents, 0);
  const net = totalIncome - totalExpense;

  const chartData = summary.map((s) => ({
    month: s.month,
    Income: s.income / 100,
    Expenses: s.expense / 100,
  }));

  const categories = tab === "expenses" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading">Finance</h2>
          <p className="text-muted-foreground">Track your income and expenses</p>
        </div>
        <Button onClick={() => { setFormType(tab === "expenses" ? "EXPENSE" : "INCOME"); setShowForm(true); }} className="gradient-hero text-white">
          <Plus className="h-4 w-4 mr-2" /> Add Entry
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Income ({month})</p>
              <p className="text-xl font-bold text-green-600">R{(totalIncome / 100).toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Expenses ({month})</p>
              <p className="text-xl font-bold text-red-600">R{(totalExpense / 100).toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Net ({month})</p>
              <p className={`text-xl font-bold ${net >= 0 ? "text-green-600" : "text-red-600"}`}>
                R{(net / 100).toFixed(2)}
              </p>
            </div>
          </div>
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
      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <Card className="p-5 border-primary/20">
            <h3 className="font-bold mb-4">New {formType === "INCOME" ? "Income" : "Expense"} Entry</h3>
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
                <Input type="number" step="0.01" min="0" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} className="mt-1 h-9" placeholder="0.00" />
              </div>
              <div>
                <Label className="text-xs">Category</Label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">Select...</option>
                  {(formType === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs">Date</Label>
                <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="mt-1 h-9" />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="mt-1 h-9" placeholder="Optional" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAdd} className="gradient-hero text-white">Save Entry</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Summary Chart */}
      {tab === "summary" && (
        <Card className="p-5">
          <h3 className="font-bold mb-4">Monthly Income vs Expenses</h3>
          {chartData.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No data yet. Start logging income and expenses.</p>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `R${v}`} />
                <Tooltip formatter={(v: number) => `R${v.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="Income" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      )}

      {/* Entries Table */}
      {tab !== "summary" && (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-semibold">Date</th>
                <th className="text-left p-3 font-semibold">Category</th>
                <th className="text-left p-3 font-semibold">Description</th>
                <th className="text-right p-3 font-semibold">Amount</th>
                <th className="text-right p-3 font-semibold w-16"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-muted-foreground">{new Date(entry.occurred_at).toLocaleDateString("en-ZA")}</td>
                  <td className="p-3">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{entry.category}</span>
                  </td>
                  <td className="p-3 text-muted-foreground">{entry.description || "—"}</td>
                  <td className={`p-3 text-right font-bold ${entry.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>
                    {entry.type === "INCOME" ? "+" : "−"}R{(entry.amount_cents / 100).toFixed(2)}
                  </td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(entry.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No entries for this period.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
