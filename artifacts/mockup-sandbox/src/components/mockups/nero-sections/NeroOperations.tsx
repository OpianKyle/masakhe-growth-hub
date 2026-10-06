import { useState } from "react";
import { AlertTriangle, Boxes, ClipboardCheck, Package, Plus, ScanLine, TrendingUp } from "lucide-react";
import "./_group.css";

export function NeroOperations() {
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState("Products");
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="relative overflow-hidden bg-[#0f172a] px-6 py-8 text-white md:px-10">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.25),_transparent_70%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> Operations <span className="text-slate-500">/</span> Inventory
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Inventory &amp; Stock</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-300">Track stock levels, scan products and reconcile counts in one workspace.</p>
          </div>
          <button onClick={() => setNotice("New product form opened")} className="flex w-fit items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500">
            <Plus className="h-4 w-4" /> Add product
          </button>
        </div>
      </header>

      <nav aria-label="Inventory actions" className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-6 py-3 md:px-10">
          <button onClick={() => setNotice("Barcode scanner opened")} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"><ScanLine className="h-4 w-4 text-blue-600" /> Scan barcode</button>
          <button onClick={() => setNotice("Stock take started")} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"><ClipboardCheck className="h-4 w-4 text-blue-600" /> Start stock take</button>
          <button onClick={() => setNotice("Low stock report opened")} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"><AlertTriangle className="h-4 w-4 text-blue-600" /> Low stock</button>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl space-y-5 px-6 py-6 md:px-10">
        <div className="grid gap-4 sm:grid-cols-4">
          {[["Products", "48", Boxes], ["Total units", "1,260", Package], ["Low stock", "5", AlertTriangle], ["Stock value", "R32,450", TrendingUp]].map(([label, value, Icon]) => (
            <article key={String(label)} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Icon className="h-4 w-4" /></div>
              <p className="mt-3 text-xl font-bold text-slate-900">{String(value)}</p><p className="mt-0.5 text-xs uppercase tracking-wide text-slate-500">{String(label)}</p>
            </article>
          ))}
        </div>
        <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex gap-1 border-b border-slate-200 px-4 pt-3">
            {["Products", "Stock take", "History", "Low stock"].map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`border-b-2 px-3 py-2 text-sm font-medium transition ${activeTab === tab ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{tab}</button>)}
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div><h2 className="font-semibold text-slate-900">{activeTab}</h2><p className="mt-1 text-xs text-slate-500">Inventory records and stock status</p></div>
            <button onClick={() => setNotice("Product form opened")} className="flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"><Plus className="h-4 w-4" /> Add product</button>
          </div>
          <div className="divide-y divide-slate-100">
            {[["Maize meal 5kg", "SKU-1048", "124", "In stock"], ["Cooking oil 2L", "SKU-2091", "8", "Low stock"], ["Rice 10kg", "SKU-3052", "0", "Out of stock"]].map(([name, sku, count, status]) => (
              <div key={sku} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-4">
                <div><p className="text-sm font-medium text-slate-800">{name}</p><p className="mt-1 text-xs text-slate-500">{sku}</p></div>
                <span className="text-sm font-semibold text-slate-700">{count} units</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status === "In stock" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{status}</span>
              </div>
            ))}
          </div>
        </article>
        {notice && <p className="text-sm text-slate-500" role="status">{notice}</p>}
        <p className="sr-only">Current panel: {activeTab}</p>
      </section>
    </main>
  );
}
