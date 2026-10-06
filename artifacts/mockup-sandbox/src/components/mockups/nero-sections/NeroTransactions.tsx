import { useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Download, Plus, ScanLine, Wallet } from "lucide-react";
import "./_group.css";

export function NeroTransactions() {
  const [notice, setNotice] = useState("");
  const actions = [
    { label: "Import CSV", icon: ArrowUpFromLine, onClick: () => setNotice("Choose a CSV or Excel file to import") },
    { label: "Export ledger", icon: ArrowDownToLine, onClick: () => setNotice("Export options opened") },
    { label: "Scan receipt", icon: ScanLine, onClick: () => setNotice("Receipt scanner opened") },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="relative overflow-hidden bg-[#0f172a] px-6 py-8 text-white md:px-10">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.25),_transparent_70%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> Transactions
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Income &amp; Expenses</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-300">Keep cash flow, receipts and monthly records together.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setNotice("Income entry form opened")} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500">
              <Plus className="h-4 w-4" /> Add income
            </button>
            <button onClick={() => setNotice("Expense entry form opened")} className="flex items-center gap-2 rounded-lg border border-slate-500/70 bg-slate-800/70 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700">
              <Plus className="h-4 w-4" /> Add expense
            </button>
          </div>
        </div>
      </header>

      <nav aria-label="Transaction actions" className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-6 py-3 md:px-10">
          {actions.map(({ label, icon: Icon, onClick }) => (
            <button key={label} onClick={onClick} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700">
              <Icon className="h-4 w-4 text-blue-600" /> {label}
            </button>
          ))}
          <span className="hidden h-7 w-px bg-slate-200 sm:block" />
          <button onClick={() => setNotice("Entry form opened")} className="ml-auto flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500">
            <Plus className="h-4 w-4" /> Add entry
          </button>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl space-y-5 px-6 py-6 md:px-10">
        <div className="grid gap-4 sm:grid-cols-3">
          {[["Income this month", "R18,450"], ["Expenses this month", "R9,280"], ["Net cash flow", "R9,170"]].map(([label, value], index) => (
            <article key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                {index === 0 ? <ArrowUpFromLine className="h-4 w-4" /> : index === 1 ? <ArrowDownToLine className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
            </article>
          ))}
        </div>
        <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div><h2 className="font-semibold text-slate-900">Recent transactions</h2><p className="mt-1 text-xs text-slate-500">A quick view of your latest cash movement</p></div>
            <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
              {["Income", "Expenses", "Summary"].map((tab, index) => <button key={tab} className={`rounded-md px-3 py-1.5 text-xs font-medium ${index === 0 ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}>{tab}</button>)}
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {[["Sales · Market stall", "Today, 09:42", "+ R2,450"], ["Stock purchase", "Yesterday, 15:10", "− R860"], ["Client payment", "5 Oct, 11:24", "+ R1,800"]].map(([description, date, amount]) => (
              <div key={description} className="flex items-center justify-between gap-3 px-5 py-4">
                <div><p className="text-sm font-medium text-slate-800">{description}</p><p className="mt-1 text-xs text-slate-500">{date}</p></div>
                <span className={`text-sm font-semibold ${amount.startsWith("+") ? "text-emerald-700" : "text-rose-600"}`}>{amount}</span>
              </div>
            ))}
          </div>
        </article>
        {notice && <p className="text-sm text-slate-500" role="status">{notice}</p>}
      </section>
    </main>
  );
}
