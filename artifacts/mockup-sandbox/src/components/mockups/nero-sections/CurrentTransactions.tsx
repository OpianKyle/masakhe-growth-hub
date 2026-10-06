import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Plus, ScanLine, TrendingUp, Upload } from "lucide-react";
import "./_group.css";

export function CurrentTransactions() {
  const [notice, setNotice] = useState("");
  const actions = [
    { label: "Import CSV", icon: Upload, action: () => setNotice("Import file selected"), grad: "from-sky-500 to-blue-500" },
    { label: "Export", icon: Download, action: () => setNotice("Export options opened"), grad: "from-violet-500 to-purple-500" },
    { label: "Scan Receipt", icon: ScanLine, action: () => setNotice("Receipt scanner opened"), grad: "from-amber-500 to-orange-500" },
  ];

  return (
    <main className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white">
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 30%, #cffafe 70%, #e0f2fe 100%)" }}>
        <div className="pointer-events-none absolute inset-0 select-none">
          <motion.div initial={{ opacity: 0, rotate: -5, y: 20 }} animate={{ opacity: 0.88, rotate: -3, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="absolute -left-4 top-4 w-40 rounded-2xl border-2 border-white bg-white/80 p-3 shadow-2xl backdrop-blur">
            <div className="mb-2 h-2 w-14 rounded-full bg-emerald-200" />
            <div className="flex h-10 items-end gap-1">
              {[40, 70, 50, 90, 60, 80, 55].map((height, index) => <div key={index} className="flex-1 rounded-t-sm" style={{ height: `${height}%`, background: index % 2 === 0 ? "#10b981" : "#14b8a6", opacity: 0.7 }} />)}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, rotate: 5, y: 20 }} animate={{ opacity: 0.85, rotate: 3, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute -right-3 top-6 w-40 rounded-2xl border-2 border-white bg-white/80 p-3 shadow-2xl backdrop-blur">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100"><TrendingUp className="h-3.5 w-3.5 text-emerald-600" /></div>
              <div className="h-2 w-16 rounded-full bg-gray-200" />
            </div>
            <div className="mb-1.5 h-4 w-20 rounded-lg bg-emerald-100" />
            <div className="h-3 w-14 rounded-lg bg-teal-50" />
          </motion.div>
        </div>
        <div className="relative z-10 mx-auto max-w-2xl px-6 py-12 text-center">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="mb-2 text-3xl font-extrabold tracking-tight md:text-4xl" style={{ color: "#064e3b" }}>
            Income &amp; Expenses
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="mb-6 text-sm text-emerald-800/70">
            Track your cash flow, scan receipts and manage your financial health
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => setNotice("Income entry form opened")} className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 font-semibold text-white shadow-md hover:bg-emerald-800">
              <Plus className="h-4 w-4" /> Add Income
            </button>
            <button onClick={() => setNotice("Expense entry form opened")} className="flex items-center gap-2 rounded-xl border border-white bg-white/80 px-4 py-2.5 font-semibold text-emerald-900 shadow-sm hover:bg-white">
              <Plus className="h-4 w-4" /> Add Expense
            </button>
          </motion.div>
        </div>
      </div>

      <div className="border-b border-gray-100 bg-white px-4 py-2 dark:bg-gray-950">
        <div className="mx-auto flex max-w-5xl items-center gap-0.5 overflow-x-auto">
          {actions.map((action, index) => (
            <motion.button key={action.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
              onClick={action.action} className="group flex min-w-[72px] shrink-0 flex-col items-center gap-1.5 rounded-xl px-4 py-2.5 transition-colors hover:bg-gray-50">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${action.grad} shadow-sm transition-transform group-hover:scale-110`}>
                <action.icon className="h-4 w-4 text-white" />
              </div>
              <span className="whitespace-nowrap text-[11px] font-medium text-gray-600">{action.label}</span>
            </motion.button>
          ))}
          <div className="mx-2 h-10 w-px shrink-0 bg-gray-200" />
          <button onClick={() => setNotice("Entry form opened")} className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg">
            <Plus className="h-4 w-4" /> Add Entry
          </button>
        </div>
      </div>
      <section className="mx-auto max-w-5xl px-6 py-7">
        <div className="grid grid-cols-3 gap-4">
          {[["Income", "R18,450", "text-emerald-600"], ["Expenses", "R9,280", "text-rose-600"], ["Net cash flow", "R9,170", "text-blue-700"]].map(([label, value, color]) => (
            <div key={label} className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">{label}</p><p className={`mt-1 text-xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
        {notice && <p className="mt-4 text-sm text-gray-500" role="status">{notice}</p>}
      </section>
    </main>
  );
}
