import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Package, Plus, Search, Edit, Trash2, Camera, X, ScanLine, Loader2, Barcode,
  AlertTriangle, TrendingDown, TrendingUp, BoxSelect, ClipboardCheck, History,
  CheckCircle2, XCircle, RotateCcw, Boxes, ArrowDown, ArrowUp, Settings2,
  StopCircle, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { BrowserMultiFormatReader } from "@zxing/browser";

interface Product {
  id: string;
  user_id: string;
  sku: string | null;
  barcode: string | null;
  name: string;
  description: string | null;
  category: string | null;
  unit: string | null;
  cost_cents: number;
  price_cents: number;
  quantity_on_hand: number;
  low_stock_threshold: number;
  image_url: string | null;
  archived: number;
  created_at: string;
  updated_at: string;
}

interface InventoryStats {
  totalProducts: number;
  totalUnits: number;
  stockValueCents: number;
  retailValueCents: number;
  lowStockCount: number;
  outOfStockCount: number;
  openStocktakes: number;
}

interface Movement {
  id: number;
  product_id: string;
  product_name: string;
  sku: string | null;
  barcode: string | null;
  movement_type: "IN" | "OUT" | "ADJUST" | "STOCKTAKE";
  qty_delta: number;
  qty_after: number;
  unit_cost_cents: number | null;
  note: string | null;
  reference: string | null;
  actor_name: string | null;
  created_at: string;
}

interface StocktakeSession {
  id: string;
  name: string;
  status: "OPEN" | "CLOSED" | "CANCELLED";
  notes: string | null;
  started_at: string;
  closed_at: string | null;
  products_counted: number;
  units_counted: number;
  net_variance: number;
}

interface StocktakeCount {
  id: number;
  session_id: string;
  product_id: string;
  product_name: string;
  sku: string | null;
  barcode: string | null;
  unit: string | null;
  cost_cents: number;
  price_cents: number;
  counted_qty: number;
  expected_qty: number;
  variance: number;
  last_scanned_at: string;
}

const fmtR = (cents: number) =>
  `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type Tab = "products" | "stocktake" | "movements" | "lowstock";

export default function InventoryPage() {
  const [tab, setTab] = useState<Tab>("products");
  const [stats, setStats] = useState<InventoryStats | null>(null);

  const loadStats = useCallback(() => {
    fetch("/api/inventory/stats", { credentials: "include" })
      .then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  return (
    <div className="min-h-full bg-white dark:bg-gray-950">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 30%, #fef3c7 70%, #fef9c3 100%)" }}>
        <div className="pointer-events-none select-none absolute inset-0">
          <motion.div initial={{ opacity: 0, rotate: -5, y: 20 }} animate={{ opacity: 0.88, rotate: -3, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="absolute -left-4 top-4 w-40 rounded-2xl bg-white/85 backdrop-blur shadow-2xl border-2 border-white p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-full bg-orange-100 flex items-center justify-center"><Package className="h-3.5 w-3.5 text-orange-600"/></div>
              <div className="space-y-1"><div className="h-2 w-14 rounded-full bg-gray-200"/><div className="h-1.5 w-8 rounded-full bg-gray-100"/></div>
            </div>
            <div className="grid grid-cols-3 gap-1 mb-2">
              {["bg-orange-100","bg-amber-100","bg-yellow-100","bg-orange-50","bg-amber-50","bg-orange-100"].map((c,i) => (<div key={i} className={`h-6 rounded ${c}`}/>))}
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-100"><div className="h-1.5 w-2/3 rounded-full bg-orange-300"/></div>
          </motion.div>
          <motion.div initial={{ opacity: 0, rotate: 5, y: 20 }} animate={{ opacity: 0.85, rotate: 3, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute -right-3 top-5 w-36 rounded-2xl bg-white/85 backdrop-blur shadow-2xl border-2 border-white p-3">
            <div className="h-2 w-14 rounded-full bg-orange-200 mb-2"/>
            <div className="flex items-end gap-1 h-12">
              {[60,40,80,55,90,70,45].map((h,i) => <div key={i} className="flex-1 rounded-t-sm" style={{height:`${h}%`,background:"#f97316",opacity:0.6+(i%3)*0.1}}/>)}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, rotate: 2, y: 30 }} animate={{ opacity: 0.72, rotate: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.28 }}
            className="absolute right-32 -bottom-2 w-28 rounded-2xl bg-white/70 backdrop-blur shadow-lg border-2 border-white p-2.5">
            <div className="h-2 w-10 rounded-full bg-gray-200 mb-2"/>
            <div className="space-y-1.5">{["w-full","w-4/5","w-2/3"].map((w,i) => <div key={i} className={`h-2 ${w} rounded-full bg-orange-100`}/>)}</div>
          </motion.div>
        </div>
        <div className="relative z-10 py-12 px-6 text-center max-w-2xl mx-auto">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2" style={{ color: "#7c2d12" }}>
            Inventory & Stock
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-orange-800/70 mb-6 text-sm">
            {stats ? `${stats.totalProducts} products · ${stats.lowStockCount > 0 ? `${stats.lowStockCount} low stock · ` : ""}${stats.outOfStockCount > 0 ? `${stats.outOfStockCount} out of stock · ` : ""}Scan barcodes and run stock takes` : "Manage products, scan barcodes, and run stock takes"}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-3 flex-wrap">
            <Button onClick={() => setShowAddProduct(true)} className="bg-orange-600 hover:bg-orange-700 text-white shadow-md gap-2 rounded-xl">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </motion.div>
        </div>
      </div>

      {/* ── Quick action bar ─────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white dark:bg-gray-950 px-4 py-2">
        <div className="max-w-[1400px] mx-auto flex items-center gap-0.5 overflow-x-auto scrollbar-none">
          {[
            { label: "Scan Barcode", icon: ScanLine, action: () => setScanMode(scanMode === "barcode" ? null : "barcode"), grad: "from-amber-500 to-orange-500" },
            { label: "Stock Take",   icon: ClipboardCheck, action: () => setShowStockTake(true),                             grad: "from-teal-500 to-emerald-500" },
          ].map((a, i) => (
            <motion.button key={a.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={a.action}
              className="flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group min-w-[80px] shrink-0">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${a.grad} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                <a.icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-[11px] font-medium text-gray-600 whitespace-nowrap">{a.label}</span>
            </motion.button>
          ))}
          <div className="mx-2 h-10 w-px bg-gray-200 shrink-0" />
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            onClick={() => setShowAddProduct(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all shrink-0">
            <Plus className="h-4 w-4" /> Add Product
          </motion.button>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-[1400px] mx-auto">

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <StatCard icon={Boxes} label="Products" value={stats.totalProducts.toString()} iconBg="bg-gradient-to-br from-blue-500 to-indigo-600" />
          <StatCard icon={Package} label="Total units" value={stats.totalUnits.toLocaleString("en-ZA")} iconBg="bg-gradient-to-br from-cyan-500 to-sky-600" />
          <StatCard icon={TrendingDown} label="Low stock" value={stats.lowStockCount.toString()} iconBg={stats.lowStockCount > 0 ? "bg-gradient-to-br from-amber-500 to-orange-600" : "bg-muted"} />
          <StatCard icon={XCircle} label="Out of stock" value={stats.outOfStockCount.toString()} iconBg={stats.outOfStockCount > 0 ? "bg-gradient-to-br from-rose-500 to-red-600" : "bg-muted"} />
          <StatCard icon={TrendingUp} label="Stock value (cost)" value={fmtR(stats.stockValueCents)} iconBg="bg-gradient-to-br from-emerald-500 to-teal-600" />
          <StatCard icon={TrendingUp} label="Retail value" value={fmtR(stats.retailValueCents)} iconBg="bg-gradient-to-br from-violet-500 to-purple-600" />
        </div>
      )}

      <div className="border-b">
        <div className="flex gap-1 overflow-x-auto">
          <TabButton active={tab === "products"} onClick={() => setTab("products")} icon={Package} label="Products" />
          <TabButton active={tab === "stocktake"} onClick={() => setTab("stocktake")} icon={ClipboardCheck} label="Stock take" badge={stats?.openStocktakes ? String(stats.openStocktakes) : undefined} />
          <TabButton active={tab === "movements"} onClick={() => setTab("movements")} icon={History} label="History" />
          <TabButton active={tab === "lowstock"} onClick={() => setTab("lowstock")} icon={AlertTriangle} label="Low stock" badge={stats?.lowStockCount ? String(stats.lowStockCount) : undefined} badgeRed={!!stats?.lowStockCount} />
        </div>
      </div>

      {tab === "products" && <ProductsTab onChange={loadStats} />}
      {tab === "stocktake" && <StocktakeTab onChange={loadStats} />}
      {tab === "movements" && <MovementsTab />}
      {tab === "lowstock" && <LowStockTab onChange={loadStats} />}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, iconBg }: { icon: any; label: string; value: string; iconBg: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${iconBg} shadow-sm`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <p className="text-xl font-bold mt-2 truncate">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5 uppercase tracking-wide">{label}</p>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label, badge, badgeRed }: { active: boolean; onClick: () => void; icon: any; label: string; badge?: string; badgeRed?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
        active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
      {badge && (
        <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${badgeRed ? "bg-red-100 text-red-700" : "bg-primary/10 text-primary"}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Barcode Scanner (camera) — reusable component
// ─────────────────────────────────────────────────────────────
function CameraScanner({ onResult, onClose }: { onResult: (code: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);
  const lastScanRef = useRef<{ code: string; ts: number }>({ code: "", ts: 0 });

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        // List cameras
        try {
          const all = await navigator.mediaDevices.enumerateDevices();
          const cams = all.filter(d => d.kind === "videoinput");
          setDevices(cams);
          if (!deviceId && cams.length) {
            // Prefer rear camera if its label looks like one
            const rear = cams.find(c => /back|rear|environment/i.test(c.label));
            setDeviceId(rear?.deviceId || cams[cams.length - 1].deviceId);
          }
        } catch {
          // ignore — decodeFromVideoDevice will still try with default
        }

        if (!videoRef.current) return;
        const controls = await reader.decodeFromVideoDevice(
          deviceId,
          videoRef.current,
          (result, err) => {
            if (cancelled) return;
            if (result) {
              const text = result.getText();
              const now = Date.now();
              // Debounce duplicate reads of the same code within 1.5s
              if (text === lastScanRef.current.code && now - lastScanRef.current.ts < 1500) return;
              lastScanRef.current = { code: text, ts: now };
              onResult(text);
            }
          }
        );
        controlsRef.current = controls;
      } catch (e: any) {
        setError(e?.message || "Could not access the camera. Check browser permissions.");
      }
    }

    start();
    return () => {
      cancelled = true;
      try { controlsRef.current?.stop(); } catch { /* noop */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId]);

  return (
    <div className="rounded-xl border bg-black overflow-hidden relative">
      <div className="aspect-video relative">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
        {/* Scan overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-3/4 h-1/3 border-2 border-emerald-400 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] relative">
            <div className="absolute inset-x-4 top-1/2 h-0.5 bg-emerald-400 animate-pulse" />
          </div>
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          {devices.length > 1 && (
            <select
              value={deviceId || ""}
              onChange={(e) => setDeviceId(e.target.value)}
              className="text-xs bg-black/60 text-white border border-white/20 rounded px-2 py-1"
            >
              {devices.map(d => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Camera ${d.deviceId.slice(0, 6)}`}
                </option>
              ))}
            </select>
          )}
          <Button size="sm" variant="secondary" onClick={onClose} className="h-7 px-2">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="absolute bottom-2 left-2 right-2 text-center">
          <p className="text-white text-xs bg-black/50 inline-block px-3 py-1 rounded-full">
            <ScanLine className="h-3.5 w-3.5 inline mr-1" />
            Point the camera at a barcode
          </p>
        </div>
      </div>
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm border-t border-red-200">{error}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Products Tab
// ─────────────────────────────────────────────────────────────
function ProductsTab({ onChange }: { onChange: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<Array<{ category: string; count: number }>>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [moveTarget, setMoveTarget] = useState<Product | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    fetch(`/api/inventory/products?${params}`, { credentials: "include" })
      .then(r => r.json()).then(setProducts).catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, [search, category]);

  const loadCats = useCallback(() => {
    fetch("/api/inventory/categories", { credentials: "include" })
      .then(r => r.json()).then(setCategories).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadCats(); }, [loadCats]);

  const refresh = () => { load(); loadCats(); onChange(); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, SKU, barcode…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-background border rounded-md px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {categories.map(c => (
              <option key={c.category} value={c.category}>{c.category} ({c.count})</option>
            ))}
          </select>
        </div>
        <Button onClick={() => setCreating(true)} className="gap-1">
          <Plus className="h-4 w-4" /> Add product
        </Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-semibold">Product</th>
              <th className="text-left p-3 font-semibold hidden sm:table-cell">Category</th>
              <th className="text-left p-3 font-semibold hidden md:table-cell">Barcode / SKU</th>
              <th className="text-right p-3 font-semibold">On hand</th>
              <th className="text-right p-3 font-semibold hidden sm:table-cell">Cost</th>
              <th className="text-right p-3 font-semibold">Price</th>
              <th className="text-right p-3 font-semibold hidden sm:table-cell">Value</th>
              <th className="text-right p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin inline mr-2" /> Loading…
              </td></tr>
            )}
            {!loading && products.length === 0 && (
              <tr><td colSpan={8} className="p-12 text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No products yet</p>
                <p className="text-xs mt-1">Add your first product to start tracking stock.</p>
              </td></tr>
            )}
            {!loading && products.map(p => {
              const isLow = p.low_stock_threshold > 0 && p.quantity_on_hand <= p.low_stock_threshold && p.quantity_on_hand > 0;
              const isOut = p.quantity_on_hand <= 0;
              return (
                <tr key={p.id} className="border-b hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        <img src={p.image_url} alt="" className="h-10 w-10 rounded object-cover bg-muted" />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium truncate">{p.name}</div>
                        {p.description && <div className="text-xs text-muted-foreground truncate max-w-[260px]">{p.description}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 hidden sm:table-cell">
                    {p.category ? <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{p.category}</span> : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="p-3 text-xs hidden md:table-cell">
                    {p.barcode && <div className="font-mono flex items-center gap-1"><Barcode className="h-3 w-3" />{p.barcode}</div>}
                    {p.sku && <div className="text-muted-foreground">SKU: {p.sku}</div>}
                    {!p.barcode && !p.sku && <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="p-3 text-right font-semibold">
                    <span className={isOut ? "text-red-600" : isLow ? "text-amber-600" : ""}>
                      {p.quantity_on_hand} {p.unit && p.quantity_on_hand !== 1 ? `${p.unit}s` : p.unit}
                    </span>
                    {isOut && <div className="text-[10px] text-red-600 font-bold uppercase">Out</div>}
                    {!isOut && isLow && <div className="text-[10px] text-amber-600 font-bold uppercase">Low</div>}
                  </td>
                  <td className="p-3 text-right text-muted-foreground">{fmtR(p.cost_cents)}</td>
                  <td className="p-3 text-right">{fmtR(p.price_cents)}</td>
                  <td className="p-3 text-right font-medium">{fmtR(p.cost_cents * p.quantity_on_hand)}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" title="Stock in/out" onClick={() => setMoveTarget(p)}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => setEditing(p)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" title="Archive" onClick={async () => {
                        if (!confirm(`Archive "${p.name}"? You can restore from the archive later.`)) return;
                        const r = await fetch(`/api/inventory/products/${p.id}`, { method: "DELETE", credentials: "include" });
                        if (r.ok) { toast.success("Archived"); refresh(); } else toast.error("Failed");
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      {(creating || editing) && (
        <ProductModal
          product={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); refresh(); }}
        />
      )}
      {moveTarget && (
        <MovementModal
          product={moveTarget}
          onClose={() => setMoveTarget(null)}
          onSaved={() => { setMoveTarget(null); refresh(); }}
        />
      )}
    </div>
  );
}

// ─── Product create/edit modal ───
function ProductModal({ product, onClose, onSaved }: { product: Product | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: product?.name || "",
    sku: product?.sku || "",
    barcode: product?.barcode || "",
    category: product?.category || "",
    unit: product?.unit || "unit",
    description: product?.description || "",
    cost_cents: product ? (product.cost_cents / 100).toFixed(2) : "0.00",
    price_cents: product ? (product.price_cents / 100).toFixed(2) : "0.00",
    quantity_on_hand: product ? String(product.quantity_on_hand) : "0",
    low_stock_threshold: product ? String(product.low_stock_threshold) : "0",
  });
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const payload: any = {
        name: form.name.trim(),
        sku: form.sku.trim() || null,
        barcode: form.barcode.trim() || null,
        category: form.category.trim() || null,
        unit: form.unit.trim() || "unit",
        description: form.description.trim() || null,
        cost_cents: Math.round(parseFloat(form.cost_cents || "0") * 100),
        price_cents: Math.round(parseFloat(form.price_cents || "0") * 100),
        low_stock_threshold: parseInt(form.low_stock_threshold || "0", 10),
      };
      if (!product) payload.quantity_on_hand = parseInt(form.quantity_on_hand || "0", 10);
      const url = product ? `/api/inventory/products/${product.id}` : "/api/inventory/products";
      const method = product ? "PATCH" : "POST";
      const r = await fetch(url, {
        method, credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok) { toast.error(data.error || "Save failed"); return; }
      toast.success(product ? "Updated" : "Product added");
      onSaved();
    } finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            {product ? "Edit product" : "Add product"}
          </DialogTitle>
          <DialogDescription>
            {product ? "Update details. Stock changes go through the In/Out button." : "Add a new product to your inventory."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs">Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. 500ml Coca-Cola" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Barcode</Label>
              <div className="flex gap-2">
                <Input
                  value={form.barcode}
                  onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                  placeholder="Scan or type"
                  className="font-mono"
                />
                <Button type="button" variant="outline" onClick={() => setScanning(!scanning)} title="Scan with camera">
                  {scanning ? <X className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs">SKU</Label>
              <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="e.g. COKE-500" />
            </div>
          </div>

          {scanning && (
            <CameraScanner
              onResult={(code) => { setForm(f => ({ ...f, barcode: code })); setScanning(false); toast.success(`Captured ${code}`); }}
              onClose={() => setScanning(false)}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Category</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Beverages" />
            </div>
            <div>
              <Label className="text-xs">Unit</Label>
              <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="unit, bottle, kg…" />
            </div>
          </div>

          <div>
            <Label className="text-xs">Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Optional" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs">Cost (R)</Label>
              <Input type="number" step="0.01" min="0" value={form.cost_cents} onChange={(e) => setForm({ ...form, cost_cents: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Price (R)</Label>
              <Input type="number" step="0.01" min="0" value={form.price_cents} onChange={(e) => setForm({ ...form, price_cents: e.target.value })} />
            </div>
            {!product && (
              <div>
                <Label className="text-xs">Opening qty</Label>
                <Input type="number" min="0" value={form.quantity_on_hand} onChange={(e) => setForm({ ...form, quantity_on_hand: e.target.value })} />
              </div>
            )}
            <div>
              <Label className="text-xs">Low-stock at</Label>
              <Input type="number" min="0" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Movement modal (stock in/out/adjust) ───
function MovementModal({ product, onClose, onSaved }: { product: Product; onClose: () => void; onSaved: () => void }) {
  const [type, setType] = useState<"IN" | "OUT" | "ADJUST">("IN");
  const [qty, setQty] = useState("1");
  const [note, setNote] = useState("");
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const n = parseInt(qty, 10);
    if (!n || n < 0) { toast.error("Enter a valid quantity"); return; }
    setSaving(true);
    try {
      const r = await fetch(`/api/inventory/products/${product.id}/movements`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movement_type: type, qty: n, note: note || null, reference: reference || null }),
      });
      const data = await r.json();
      if (!r.ok) { toast.error(data.error || "Failed"); return; }
      toast.success(`Stock updated → ${data.quantity_on_hand} on hand`);
      onSaved();
    } finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUp className="h-5 w-5 text-emerald-600" /> Adjust stock — {product.name}
          </DialogTitle>
          <DialogDescription>
            Currently <strong>{product.quantity_on_hand}</strong> {product.unit} on hand.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setType("IN")}
              className={`p-3 rounded-lg border-2 text-sm font-medium flex flex-col items-center gap-1 ${type === "IN" ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-input hover:bg-muted"}`}
            ><ArrowUp className="h-4 w-4" /> Stock In</button>
            <button
              onClick={() => setType("OUT")}
              className={`p-3 rounded-lg border-2 text-sm font-medium flex flex-col items-center gap-1 ${type === "OUT" ? "border-red-600 bg-red-50 text-red-700" : "border-input hover:bg-muted"}`}
            ><ArrowDown className="h-4 w-4" /> Stock Out</button>
            <button
              onClick={() => setType("ADJUST")}
              className={`p-3 rounded-lg border-2 text-sm font-medium flex flex-col items-center gap-1 ${type === "ADJUST" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-input hover:bg-muted"}`}
            ><Settings2 className="h-4 w-4" /> Set Exact</button>
          </div>

          <div>
            <Label className="text-xs">
              {type === "ADJUST" ? "New on-hand quantity" : `Quantity to ${type === "IN" ? "add" : "remove"}`}
            </Label>
            <Input type="number" min="0" value={qty} onChange={(e) => setQty(e.target.value)} className="text-lg font-semibold" />
          </div>

          <div>
            <Label className="text-xs">Reference (optional)</Label>
            <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. PO-2026-001" />
          </div>

          <div>
            <Label className="text-xs">Note (optional)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Reason or context" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// Stock-take Tab
// ─────────────────────────────────────────────────────────────
function StocktakeTab({ onChange }: { onChange: () => void }) {
  const [sessions, setSessions] = useState<StocktakeSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/inventory/stocktakes", { credentials: "include" })
      .then(r => r.json()).then(setSessions)
      .catch(() => toast.error("Failed to load sessions"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const startSession = async () => {
    const r = await fetch("/api/inventory/stocktakes", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() || undefined }),
    });
    const data = await r.json();
    if (!r.ok) { toast.error(data.error || "Failed"); return; }
    setName("");
    setCreating(false);
    setActiveId(data.id);
    load();
    onChange();
  };

  if (activeId) {
    return <StocktakeRunner
      sessionId={activeId}
      onBack={() => { setActiveId(null); load(); onChange(); }}
    />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Run a stock take to count actual inventory and reconcile against expected quantities.
        </p>
        <Button onClick={() => setCreating(true)} className="gap-1">
          <Plus className="h-4 w-4" /> New stock take
        </Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[540px]">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-semibold">Session</th>
              <th className="text-left p-3 font-semibold hidden sm:table-cell">Started</th>
              <th className="text-left p-3 font-semibold">Status</th>
              <th className="text-right p-3 font-semibold hidden sm:table-cell">Products</th>
              <th className="text-right p-3 font-semibold hidden md:table-cell">Units counted</th>
              <th className="text-right p-3 font-semibold hidden md:table-cell">Net variance</th>
              <th className="text-right p-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline mr-2" />Loading…</td></tr>}
            {!loading && sessions.length === 0 && (
              <tr><td colSpan={7} className="p-12 text-center text-muted-foreground">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No stock takes yet</p>
                <p className="text-xs mt-1">Start your first stock take to count inventory.</p>
              </td></tr>
            )}
            {sessions.map(s => (
              <tr key={s.id} className="border-b hover:bg-muted/30 cursor-pointer" onClick={() => setActiveId(s.id)}>
                <td className="p-3 font-medium">{s.name}</td>
                <td className="p-3 text-xs text-muted-foreground">
                  {new Date(s.started_at).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}
                </td>
                <td className="p-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    s.status === "OPEN" ? "bg-amber-100 text-amber-800" :
                    s.status === "CLOSED" ? "bg-green-100 text-green-800" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {s.status === "OPEN" && <ScanLine className="h-3 w-3" />}
                    {s.status === "CLOSED" && <CheckCircle2 className="h-3 w-3" />}
                    {s.status}
                  </span>
                </td>
                <td className="p-3 text-right">{s.products_counted}</td>
                <td className="p-3 text-right">{Number(s.units_counted).toLocaleString("en-ZA")}</td>
                <td className={`p-3 text-right font-medium ${Number(s.net_variance) > 0 ? "text-emerald-600" : Number(s.net_variance) < 0 ? "text-red-600" : "text-muted-foreground"}`}>
                  {Number(s.net_variance) > 0 ? "+" : ""}{Number(s.net_variance).toLocaleString("en-ZA")}
                </td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setActiveId(s.id); }}>
                    Open
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <Dialog open={creating} onOpenChange={(o) => { if (!o) setCreating(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" /> New stock take
            </DialogTitle>
            <DialogDescription>
              Give this session a name (or leave blank to use today's date).
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label className="text-xs">Session name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Monthly count — April"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") startSession(); }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
            <Button onClick={startSession}><ScanLine className="h-4 w-4 mr-2" />Start scanning</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── The actual scanning runner ───
function StocktakeRunner({ sessionId, onBack }: { sessionId: string; onBack: () => void }) {
  const [session, setSession] = useState<StocktakeSession | null>(null);
  const [counts, setCounts] = useState<StocktakeCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [unknownBarcode, setUnknownBarcode] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<{ ok: () => void; bad: () => void } | null>(null);

  // Init beep helpers (Web Audio)
  useEffect(() => {
    const ctx = typeof window !== "undefined" && (window.AudioContext || (window as any).webkitAudioContext)
      ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;
    if (!ctx) return;
    const beep = (freq: number, dur: number) => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.connect(gain); gain.connect(ctx.destination);
        gain.gain.value = 0.05;
        osc.start();
        setTimeout(() => { osc.stop(); }, dur);
      } catch {}
    };
    audioRef.current = { ok: () => beep(880, 80), bad: () => beep(220, 200) };
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/inventory/stocktakes/${sessionId}`, { credentials: "include" })
      .then(r => r.json())
      .then((d) => { setSession(d.session); setCounts(d.counts || []); })
      .catch(() => toast.error("Failed to load session"))
      .finally(() => setLoading(false));
  }, [sessionId]);

  useEffect(() => { load(); }, [load]);

  // Auto-focus the manual input so USB barcode wedges work immediately
  useEffect(() => {
    if (!scanning && session?.status === "OPEN" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [scanning, session?.status, counts.length]);

  const submitScan = async (code: string, qty = 1) => {
    if (!code.trim()) return;
    setUnknownBarcode(null);
    try {
      const r = await fetch(`/api/inventory/stocktakes/${sessionId}/scan`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcode: code.trim(), qty }),
      });
      const data = await r.json();
      if (!r.ok) {
        if (r.status === 404) {
          setUnknownBarcode(code.trim());
          audioRef.current?.bad();
        } else {
          toast.error(data.error || "Scan failed");
        }
        return;
      }
      audioRef.current?.ok();
      toast.success(`${data.product.name} → ${data.counted_qty} counted`);
      load();
    } catch {
      toast.error("Scan failed");
    }
  };

  const onManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitScan(manualCode);
    setManualCode("");
  };

  const updateCount = async (productId: string, newQty: number) => {
    if (newQty < 0) return;
    const r = await fetch(`/api/inventory/stocktakes/${sessionId}/counts/${productId}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ counted_qty: newQty }),
    });
    if (r.ok) load(); else toast.error("Failed");
  };

  const removeCount = async (productId: string) => {
    if (!confirm("Remove this count from the session?")) return;
    const r = await fetch(`/api/inventory/stocktakes/${sessionId}/counts/${productId}`, {
      method: "DELETE", credentials: "include",
    });
    if (r.ok) load(); else toast.error("Failed");
  };

  const close = async () => {
    if (!confirm(`Close this stock take? Stock quantities will be updated to match the counted figures (${counts.length} products affected).`)) return;
    setClosing(true);
    try {
      const r = await fetch(`/api/inventory/stocktakes/${sessionId}/close`, {
        method: "POST", credentials: "include",
      });
      const data = await r.json();
      if (!r.ok) { toast.error(data.error || "Failed"); return; }
      toast.success(`Closed. ${data.appliedCount} products updated.`);
      onBack();
    } finally { setClosing(false); }
  };

  const cancel = async () => {
    if (!confirm("Cancel this stock take? All counts will be discarded and stock will not change.")) return;
    const r = await fetch(`/api/inventory/stocktakes/${sessionId}/cancel`, { method: "POST", credentials: "include" });
    if (r.ok) { toast.success("Cancelled"); onBack(); } else toast.error("Failed");
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline mr-2" />Loading…</div>;
  if (!session) return <div className="p-8 text-center text-muted-foreground">Session not found</div>;

  const totalVariance = counts.reduce((s, c) => s + c.variance, 0);
  const isOpen = session.status === "OPEN";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
            ← Back
          </Button>
          <div>
            <h2 className="text-lg font-bold">{session.name}</h2>
            <p className="text-xs text-muted-foreground">
              Started {new Date(session.started_at).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })} ·
              <span className={`ml-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                isOpen ? "bg-amber-100 text-amber-800" :
                session.status === "CLOSED" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
              }`}>{session.status}</span>
            </p>
          </div>
        </div>
        {isOpen && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={cancel} className="text-red-600">
              <StopCircle className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={close} disabled={closing || counts.length === 0} className="bg-green-600 hover:bg-green-700 text-white">
              {closing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
              Close & apply
            </Button>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Camera className="h-4 w-4" /> Scan barcodes
              </h3>
              <Button variant={scanning ? "destructive" : "outline"} size="sm" onClick={() => setScanning(!scanning)}>
                {scanning ? <><X className="h-4 w-4 mr-1" />Stop camera</> : <><Camera className="h-4 w-4 mr-1" />Start camera</>}
              </Button>
            </div>
            {scanning && (
              <CameraScanner
                onResult={(code) => submitScan(code)}
                onClose={() => setScanning(false)}
              />
            )}
            <form onSubmit={onManualSubmit} className="space-y-2">
              <Label className="text-xs">Type or scan with USB scanner</Label>
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Enter barcode and press Enter"
                  className="font-mono"
                />
                <Button type="submit"><ScanLine className="h-4 w-4 mr-1" />Add</Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Tip: keep this tab focused — USB barcode scanners type the code and press Enter, so they work automatically.
              </p>
            </form>
            {unknownBarcode && (
              <div className="rounded-md border-2 border-amber-300 bg-amber-50 p-3 text-sm">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-700 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-amber-900">
                      Unknown barcode <span className="font-mono">{unknownBarcode}</span>
                    </p>
                    <p className="text-xs text-amber-800 mt-1">
                      No product matches this code. Add it as a new product first, then scan it again.
                    </p>
                  </div>
                  <button onClick={() => setUnknownBarcode(null)} className="text-amber-700 hover:text-amber-900">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h3 className="font-semibold mb-3">Session totals</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Products counted</p>
                <p className="text-2xl font-bold">{counts.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Units counted</p>
                <p className="text-2xl font-bold">{counts.reduce((s, c) => s + c.counted_qty, 0).toLocaleString("en-ZA")}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground uppercase">Net variance</p>
                <p className={`text-2xl font-bold ${totalVariance > 0 ? "text-emerald-600" : totalVariance < 0 ? "text-red-600" : ""}`}>
                  {totalVariance > 0 ? "+" : ""}{totalVariance.toLocaleString("en-ZA")} units
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  This is how much the stock will change when you close the session.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="p-3 border-b bg-muted/30 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Counted items ({counts.length})
        </div>
        {counts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Barcode className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No items counted yet</p>
            <p className="text-xs mt-1">Scan a barcode or type one above to start counting.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="text-left p-3 font-semibold">Product</th>
                <th className="text-left p-3 font-semibold">Barcode</th>
                <th className="text-right p-3 font-semibold">Expected</th>
                <th className="text-right p-3 font-semibold">Counted</th>
                <th className="text-right p-3 font-semibold">Variance</th>
                {isOpen && <th className="text-right p-3 font-semibold"></th>}
              </tr>
            </thead>
            <tbody>
              {counts.map(c => (
                <tr key={c.id} className="border-b hover:bg-muted/30">
                  <td className="p-3">
                    <div className="font-medium">{c.product_name}</div>
                    {c.sku && <div className="text-[10px] text-muted-foreground">SKU: {c.sku}</div>}
                  </td>
                  <td className="p-3 font-mono text-xs text-muted-foreground">{c.barcode || "—"}</td>
                  <td className="p-3 text-right text-muted-foreground">{c.expected_qty}</td>
                  <td className="p-3 text-right">
                    {isOpen ? (
                      <Input
                        type="number"
                        min="0"
                        value={c.counted_qty}
                        onChange={(e) => updateCount(c.product_id, parseInt(e.target.value || "0", 10))}
                        className="h-8 w-20 text-right inline-block"
                      />
                    ) : (
                      <span className="font-semibold">{c.counted_qty}</span>
                    )}
                  </td>
                  <td className={`p-3 text-right font-bold ${c.variance > 0 ? "text-emerald-600" : c.variance < 0 ? "text-red-600" : "text-muted-foreground"}`}>
                    {c.variance > 0 ? "+" : ""}{c.variance}
                  </td>
                  {isOpen && (
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => removeCount(c.product_id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Movements (history) tab
// ─────────────────────────────────────────────────────────────
function MovementsTab() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterType) params.set("type", filterType);
    fetch(`/api/inventory/movements?${params}`, { credentials: "include" })
      .then(r => r.json()).then(setMovements)
      .catch(() => toast.error("Failed to load history"))
      .finally(() => setLoading(false));
  }, [filterType]);

  const TYPE_META: Record<string, { label: string; color: string; icon: any }> = {
    IN:        { label: "Stock in",  color: "bg-emerald-100 text-emerald-800", icon: ArrowUp },
    OUT:       { label: "Stock out", color: "bg-red-100 text-red-800",         icon: ArrowDown },
    ADJUST:    { label: "Adjusted",  color: "bg-blue-100 text-blue-800",       icon: Settings2 },
    STOCKTAKE: { label: "Stock take",color: "bg-purple-100 text-purple-800",   icon: ClipboardCheck },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-muted-foreground uppercase">Filter</span>
        {[
          { v: "", label: "All" },
          { v: "IN", label: "Stock in" },
          { v: "OUT", label: "Stock out" },
          { v: "ADJUST", label: "Adjustments" },
          { v: "STOCKTAKE", label: "Stock takes" },
        ].map(o => (
          <button
            key={o.v || "all"}
            onClick={() => setFilterType(o.v)}
            className={`px-3 py-1 rounded-full text-xs font-medium border ${filterType === o.v ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted border-input"}`}
          >{o.label}</button>
        ))}
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-semibold">When</th>
              <th className="text-left p-3 font-semibold">Product</th>
              <th className="text-left p-3 font-semibold">Type</th>
              <th className="text-right p-3 font-semibold">Change</th>
              <th className="text-right p-3 font-semibold">After</th>
              <th className="text-left p-3 font-semibold">Note</th>
              <th className="text-left p-3 font-semibold">By</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline mr-2" />Loading…</td></tr>}
            {!loading && movements.length === 0 && (
              <tr><td colSpan={7} className="p-12 text-center text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No movements yet</p>
              </td></tr>
            )}
            {movements.map(m => {
              const meta = TYPE_META[m.movement_type] || { label: m.movement_type, color: "bg-gray-100 text-gray-800", icon: BoxSelect };
              return (
                <tr key={m.id} className="border-b hover:bg-muted/30">
                  <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(m.created_at).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{m.product_name}</div>
                    {m.barcode && <div className="text-[10px] text-muted-foreground font-mono">{m.barcode}</div>}
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${meta.color}`}>
                      <meta.icon className="h-3 w-3" />
                      {meta.label}
                    </span>
                  </td>
                  <td className={`p-3 text-right font-bold ${m.qty_delta > 0 ? "text-emerald-600" : m.qty_delta < 0 ? "text-red-600" : ""}`}>
                    {m.qty_delta > 0 ? "+" : ""}{m.qty_delta}
                  </td>
                  <td className="p-3 text-right font-medium">{m.qty_after}</td>
                  <td className="p-3 text-xs text-muted-foreground max-w-[260px] truncate" title={[m.note, m.reference].filter(Boolean).join(" · ")}>
                    {[m.note, m.reference].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">{m.actor_name || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Low stock tab
// ─────────────────────────────────────────────────────────────
function LowStockTab({ onChange }: { onChange: () => void }) {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [moveTarget, setMoveTarget] = useState<Product | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/inventory/products?lowStock=true", { credentials: "include" })
      .then(r => r.json()).then(setItems)
      .catch(() => toast.error("Failed"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        Products at or below their low-stock threshold. Re-stock these soon.
      </p>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-semibold">Product</th>
              <th className="text-left p-3 font-semibold">Barcode</th>
              <th className="text-right p-3 font-semibold">On hand</th>
              <th className="text-right p-3 font-semibold">Threshold</th>
              <th className="text-right p-3 font-semibold">Suggested re-order</th>
              <th className="text-right p-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline mr-2" />Loading…</td></tr>}
            {!loading && items.length === 0 && (
              <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-500 opacity-50" />
                <p className="font-medium">All stock levels are healthy</p>
                <p className="text-xs mt-1">Set a low-stock threshold on a product to be alerted when it runs low.</p>
              </td></tr>
            )}
            {items.map(p => {
              const suggested = Math.max(0, p.low_stock_threshold * 2 - p.quantity_on_hand);
              return (
                <tr key={p.id} className="border-b hover:bg-muted/30">
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3 font-mono text-xs text-muted-foreground">{p.barcode || "—"}</td>
                  <td className="p-3 text-right font-bold text-amber-600">{p.quantity_on_hand}</td>
                  <td className="p-3 text-right text-muted-foreground">{p.low_stock_threshold}</td>
                  <td className="p-3 text-right text-emerald-700 font-medium">+{suggested}</td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => setMoveTarget(p)} className="gap-1">
                      <ArrowUp className="h-3.5 w-3.5" /> Stock in
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {moveTarget && (
        <MovementModal
          product={moveTarget}
          onClose={() => setMoveTarget(null)}
          onSaved={() => { setMoveTarget(null); load(); onChange(); }}
        />
      )}
    </div>
  );
}
