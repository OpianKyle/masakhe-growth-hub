import { useState } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, Package, Plus, ScanLine, TrendingDown, TrendingUp } from "lucide-react";
import "./_group.css";

export function CurrentOperations() {
  const [notice, setNotice] = useState("");
  const actions = [
    { label: "Scan Barcode", icon: ScanLine, action: () => setNotice("Barcode scanner opened"), grad: "from-amber-500 to-orange-500" },
    { label: "Stock Take", icon: ClipboardCheck, action: () => setNotice("Stock take started"), grad: "from-teal-500 to-emerald-500" },
  ];

  return (
    <main className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white">
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 30%, #fef3c7 70%, #fef9c3 100%)" }}>
        <div className="pointer-events-none absolute inset-0 select-none">
          <motion.div initial={{ opacity: 0, rotate: -5, y: 20 }} animate={{ opacity: 0.88, rotate: -3, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="absolute -left-4 top-4 w-40 rounded-2xl border-2 border-white bg-white/85 p-3 shadow-2xl backdrop-blur">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100"><Package className="h-3.5 w-3.5 text-orange-600" /></div>
              <div className="space-y-1"><div className="h-2 w-14 rounded-full bg-gray-200" /><div className="h-1.5 w-8 rounded-full bg-gray-100" /></div>
            </div>
            <div className="mb-2 grid grid-cols-3 gap-1">
              {["bg-orange-100", "bg-amber-100", "bg-yellow-100", "bg-orange-50", "bg-amber-50", "bg-orange-100"].map((color, index) => <div key={index} className={`h-6 rounded ${color}`} />)}
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-100"><div className="h-1.5 w-2/3 rounded-full bg-orange-300" /></div>
          </motion.div>
          <motion.div initial={{ opacity: 0, rotate: 5, y: 20 }} animate={{ opacity: 0.85, rotate: 3, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute -right-3 top-5 w-36 rounded-2xl border-2 border-white bg-white/85 p-3 shadow-2xl backdrop-blur">
            <div className="mb-2 h-2 w-14 rounded-full bg-orange-200" />
            <div className="flex h-12 items-end gap-1">
              {[60, 40, 80, 55, 90, 70, 45].map((height, index) => <div key={index} className="flex-1 rounded-t-sm" style={{ height: `${height}%`, background: "#f97316", opacity: 0.6 + (index % 3) * 0.1 }} />)}
            </div>
          </motion.div>
        </div>
        <div className="relative z-10 mx-auto max-w-2xl px-6 py-12 text-center">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="mb-2 text-3xl font-extrabold tracking-tight md:text-4xl" style={{ color: "#7c2d12" }}>
            Inventory &amp; Stock
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-6 text-sm text-orange-800/70">
            Manage products, scan barcodes, and run stock takes
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex items-center justify-center gap-3">
            <button onClick={() => setNotice("New product form opened")} className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 font-semibold text-white shadow-md hover:bg-orange-700">
              <Plus className="h-4 w-4" /> Add Product
            </button>
          </motion.div>
        </div>
      </div>
      <div className="border-b border-gray-100 bg-white px-4 py-2">
        <div className="mx-auto flex max-w-[1400px] items-center gap-0.5 overflow-x-auto">
          {actions.map((action, index) => (
            <motion.button key={action.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
              onClick={action.action} className="group flex min-w-[80px] shrink-0 flex-col items-center gap-1.5 rounded-xl px-4 py-2.5 transition-colors hover:bg-gray-50">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${action.grad} shadow-sm transition-transform group-hover:scale-110`}>
                <action.icon className="h-4 w-4 text-white" />
              </div>
              <span className="whitespace-nowrap text-[11px] font-medium text-gray-600">{action.label}</span>
            </motion.button>
          ))}
          <div className="mx-2 h-10 w-px shrink-0 bg-gray-200" />
          <button onClick={() => setNotice("New product form opened")} className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg">
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </div>
      <section className="mx-auto grid max-w-[1400px] grid-cols-3 gap-4 px-6 py-7">
        {[["Products", "48", Package], ["Low stock", "5", TrendingDown], ["Stock value", "R32,450", TrendingUp]].map(([label, value, Icon]) => (
          <article key={String(label)} className="rounded-xl border bg-card p-4 shadow-sm">
            <Icon className="h-5 w-5 text-orange-600" /><p className="mt-3 text-xl font-bold">{String(value)}</p><p className="text-xs text-muted-foreground">{String(label)}</p>
          </article>
        ))}
        {notice && <p className="col-span-full text-sm text-gray-500" role="status">{notice}</p>}
      </section>
    </main>
  );
}
