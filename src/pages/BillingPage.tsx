import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Globe, Smartphone, Wallet, Users, Check, Crown, Loader2,
  CalendarDays, ArrowRight, CheckCircle2, Gift, Zap, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const MODULES = [
  {
    code: "web_builder",
    name: "Web Builder",
    price: 29900,
    maxUsers: 2,
    bg: "from-sky-50 to-emerald-50 dark:from-sky-950/30 dark:to-emerald-950/30",
    border: "border-sky-200 dark:border-sky-800",
    ring: "ring-sky-400",
    icon: Globe,
    iconBg: "bg-gradient-to-br from-sky-500 to-emerald-500",
    features: ["Professional website builder", "44+ templates", "AI content generation"],
  },
  {
    code: "social_biz",
    name: "Social Media & Biz Connect",
    price: 50000,
    maxUsers: 3,
    bg: "from-violet-50 to-fuchsia-50 dark:from-violet-950/30 dark:to-fuchsia-950/30",
    border: "border-violet-200 dark:border-violet-800",
    ring: "ring-violet-400",
    icon: Smartphone,
    iconBg: "bg-gradient-to-br from-violet-500 to-fuchsia-500",
    features: ["Social media scheduler", "AI post generation", "Biz Connect network"],
  },
  {
    code: "transactions_ops",
    name: "Transactions & Operations",
    price: 50000,
    maxUsers: 5,
    bg: "from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    ring: "ring-emerald-400",
    icon: Wallet,
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500",
    features: ["Invoicing & expenses", "Client management", "Campaigns & automations"],
  },
  {
    code: "people_hr",
    name: "People & HR",
    price: 50000,
    maxUsers: 10,
    bg: "from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30",
    border: "border-amber-200 dark:border-amber-800",
    ring: "ring-amber-400",
    icon: Users,
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
    features: ["Payroll management", "Leave & HR tools", "Up to 10 users"],
  },
];
const BUNDLE_PRICE = 149900;
const ALL_CODES = MODULES.map((m) => m.code);

function fmt(cents: number) {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

type View = "modules" | "checkout" | "active";

export default function BillingPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [activeModules, setActiveModules] = useState<string[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [view, setView] = useState<View>("modules");
  const [trialLoading, setTrialLoading] = useState(false);
  const [trialEligible, setTrialEligible] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [adumoForm, setAdumoForm] = useState<{ action: string; fields: Record<string, string> } | null>(null);

  const [form, setForm] = useState({
    recipientName: user?.full_name || "",
    email: user?.email || "",
    contactNumber: "",
    collectionDay: "1",
    shippingAddress1: "",
    promoCode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const adumoRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "success") {
      toast({ title: "Payment successful!", description: "Your subscription is now active." });
      fetchBilling();
    } else if (status === "failed") {
      toast({ title: "Payment failed", description: "Please try again.", variant: "destructive" });
    }
  }, []);

  useEffect(() => { fetchBilling(); }, []);

  useEffect(() => {
    if (adumoForm && adumoRef.current) {
      adumoRef.current.submit();
    }
  }, [adumoForm]);

  async function fetchBilling() {
    try {
      const [subRes, statusRes] = await Promise.all([
        fetch("/api/billing/subscription", { credentials: "include" }),
        fetch("/api/billing/status", { credentials: "include" }),
      ]);
      const subData = await subRes.json();
      const statusData = await statusRes.json();

      if (subData.subscription) {
        setSubscription(subData.subscription);
        setInvoices(subData.invoices || []);
      }
      if (Array.isArray(statusData.modules)) {
        setActiveModules(statusData.modules);
      }

      const isActive = statusData.active && statusData.status === "ACTIVE";
      const onTrial = statusData.active && statusData.status === "TRIAL";
      const hadSub = !!subData.subscription;

      if (isActive) {
        setView("active");
      } else {
        setView("modules");
        setTrialEligible(!hadSub);
      }
    } catch {
      setView("modules");
    }
  }

  const isBundle = ALL_CODES.every((c) => selectedModules.includes(c));
  const totalCents = isBundle
    ? BUNDLE_PRICE
    : selectedModules.reduce((sum, code) => sum + (MODULES.find((m) => m.code === code)?.price ?? 0), 0);
  const savings = isBundle ? MODULES.reduce((s, m) => s + m.price, 0) - BUNDLE_PRICE : 0;
  const maxUsers = isBundle ? 10 : Math.max(0, ...selectedModules.map((c) => MODULES.find((m) => m.code === c)?.maxUsers ?? 0));

  function toggleModule(code: string) {
    setSelectedModules((prev) => prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]);
  }

  function selectBundle() {
    setSelectedModules([...ALL_CODES]);
  }

  async function handleStartTrial() {
    setTrialLoading(true);
    try {
      const res = await fetch("/api/billing/start-trial", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start trial");
      toast({ title: "7-day free trial started!", description: "You have full access to all modules." });
      window.dispatchEvent(new Event("billing:updated"));
      fetchBilling();
    } catch (err: any) {
      toast({ title: "Could not start trial", description: err.message, variant: "destructive" });
    } finally {
      setTrialLoading(false);
    }
  }

  function validateCheckout() {
    const e: Record<string, string> = {};
    if (!form.recipientName.trim()) e.recipientName = "Full name is required";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Valid email required";
    if (form.contactNumber.trim().length < 10) e.contactNumber = "Valid phone number required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleCheckoutSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedModules.length === 0) {
      toast({ title: "Select at least one module", variant: "destructive" });
      return;
    }
    if (!validateCheckout()) return;
    setCheckoutLoading(true);
    try {
      const planCode = isBundle ? "all_modules" : selectedModules.length === 1 ? selectedModules[0] : "all_modules";
      const res = await fetch("/api/billing/checkout-session", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode,
          modules: selectedModules,
          amountCents: totalCents,
          recipientName: form.recipientName,
          email: form.email,
          contactNumber: form.contactNumber,
          mobileNumber: form.contactNumber,
          collectionDay: form.collectionDay,
          shippingAddress1: form.shippingAddress1,
          promoCode: form.promoCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      setAdumoForm({ action: data.formAction, fields: data.fields });
    } catch (err: any) {
      toast({ title: "Checkout error", description: err.message, variant: "destructive" });
      setCheckoutLoading(false);
    }
  }

  const onTrial = subscription?.status === "TRIAL";
  const trialEnd = subscription?.trial_end_at ? new Date(subscription.trial_end_at) : null;
  const daysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / 86400000)) : 0;

  return (
    <div className="min-h-full bg-white dark:bg-gray-950">
      {/* Hidden Adumo form */}
      {adumoForm && (
        <form ref={adumoRef} action={adumoForm.action} method="POST" style={{ display: "none" }}>
          {Object.entries(adumoForm.fields).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
        </form>
      )}

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #e0f2fe 0%, #dbeafe 30%, #ede9fe 70%, #f0f9ff 100%)" }}>
        <div className="pointer-events-none select-none absolute inset-0">
          <motion.div initial={{ opacity: 0, rotate: -5, y: 20 }} animate={{ opacity: 0.88, rotate: -3, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="absolute -left-4 top-4 w-40 rounded-2xl bg-white/85 backdrop-blur shadow-2xl border-2 border-white p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center"><CreditCard className="h-3.5 w-3.5 text-blue-600"/></div>
              <div className="space-y-1"><div className="h-2 w-14 rounded-full bg-gray-200"/><div className="h-1.5 w-8 rounded-full bg-gray-100"/></div>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {["bg-blue-100","bg-indigo-100","bg-violet-100","bg-sky-100"].map((c,i) => <div key={i} className={`h-8 rounded-lg ${c}`}/>)}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, rotate: 5, y: 20 }} animate={{ opacity: 0.85, rotate: 3, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute -right-3 top-5 w-36 rounded-2xl bg-white/85 backdrop-blur shadow-2xl border-2 border-white p-3">
            <div className="h-2 w-14 rounded-full bg-indigo-200 mb-2"/>
            <div className="space-y-1.5">
              {["w-full","w-4/5","w-3/5"].map((w,i) => <div key={i} className={`h-3 ${w} rounded-lg bg-blue-100`}/>)}
            </div>
            <div className="h-5 w-full rounded-lg bg-violet-100 mt-2"/>
          </motion.div>
        </div>
        <div className="relative z-10 py-12 px-6 text-center max-w-2xl mx-auto">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2" style={{ color: "#1e3a8a" }}>
            Billing & Modules
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-blue-800/70 mb-6 text-sm">
            Choose the modules your business needs. Upgrade or change anytime.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-3">
            <Button onClick={() => setView("modules")}
              className="bg-blue-700 hover:bg-blue-800 text-white shadow-md gap-2 rounded-xl">
              <Zap className="h-4 w-4" /> View Plans
            </Button>
          </motion.div>
        </div>
      </div>

      {/* ── Quick action bar ─────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white dark:bg-gray-950 px-4 py-2">
        <div className="max-w-5xl mx-auto flex items-center gap-0.5 overflow-x-auto scrollbar-none">
          {[
            { label: "Overview",  icon: Globe,       action: () => setView("overview"),  grad: "from-blue-500 to-indigo-500" },
            { label: "Modules",   icon: Smartphone,  action: () => setView("modules"),   grad: "from-violet-500 to-purple-500" },
            { label: "Checkout",  icon: Wallet,      action: () => setView("checkout"),  grad: "from-emerald-500 to-teal-500" },
          ].map((a, i) => (
            <motion.button key={a.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={a.action}
              className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl transition-colors group min-w-[72px] shrink-0 ${view === a.label.toLowerCase() ? "bg-blue-50" : "hover:bg-gray-50"}`}>
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${a.grad} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                <a.icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-[11px] font-medium text-gray-600 whitespace-nowrap">{a.label}</span>
            </motion.button>
          ))}
          <div className="mx-2 h-10 w-px bg-gray-200 shrink-0" />
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            onClick={() => setView("modules")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all shrink-0">
            <Zap className="h-4 w-4" /> Upgrade
          </motion.button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-8">

      {/* Trial banner */}
      {onTrial && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 px-5 py-4"
        >
          <div className="flex items-center gap-3">
            <Gift className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <div className="font-semibold text-amber-900 dark:text-amber-200">Free trial active</div>
              <div className="text-sm text-amber-700 dark:text-amber-300">
                {daysLeft > 0
                  ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining — full access to all modules.`
                  : "Your trial expires today."}
              </div>
            </div>
          </div>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white shrink-0" onClick={() => setView("modules")}>
            Subscribe now
          </Button>
        </motion.div>
      )}

      {/* ── ACTIVE VIEW ─────────────────────────────────────────── */}
      {view === "active" && subscription?.status === "ACTIVE" && (
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-lg">Active Subscription</h2>
                <p className="text-sm text-muted-foreground">Your currently subscribed modules</p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                Active
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {MODULES.map((mod) => {
                const active = activeModules.includes(mod.code);
                return (
                  <div
                    key={mod.code}
                    className={`rounded-lg border p-3 text-center transition-all ${
                      active ? `${mod.border} bg-gradient-to-br ${mod.bg}` : "border-muted bg-muted/30 opacity-50"
                    }`}
                  >
                    <div className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${active ? mod.iconBg : "bg-muted"}`}>
                      <mod.icon className={`h-5 w-5 ${active ? "text-white" : "text-muted-foreground"}`} />
                    </div>
                    <div className="text-xs font-medium leading-tight">{mod.name}</div>
                    <div className={`mt-1 text-xs font-semibold ${active ? "text-emerald-600" : "text-muted-foreground"}`}>
                      {active ? "Active" : "Not included"}
                    </div>
                  </div>
                );
              })}
            </div>

            {subscription.next_billing_at && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                Next billing: {new Date(subscription.next_billing_at).toLocaleDateString("en-ZA")}
              </div>
            )}
          </div>

          <Button variant="outline" onClick={() => setView("modules")}>
            <Zap className="mr-2 h-4 w-4" />
            Manage modules
          </Button>

          {invoices.length > 0 && (
            <div className="rounded-xl border bg-card">
              <div className="border-b px-6 py-4">
                <h3 className="font-semibold">Payment History</h3>
              </div>
              <div className="divide-y">
                {invoices.slice(0, 10).map((inv: any) => (
                  <div key={inv.id} className="flex items-center justify-between px-6 py-3.5 text-sm">
                    <div>
                      <div className="font-medium">
                        {new Date(inv.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                      {inv.merchant_ref && <div className="text-xs text-muted-foreground">{inv.merchant_ref}</div>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{fmt(inv.amount_cents)}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        inv.status === "PAID" ? "bg-emerald-500/10 text-emerald-600" :
                        inv.status === "FAILED" ? "bg-red-500/10 text-red-600" :
                        "bg-amber-500/10 text-amber-600"
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODULE SELECTION VIEW ───────────────────────────────── */}
      {view === "modules" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {MODULES.map((mod) => {
              const selected = selectedModules.includes(mod.code);
              return (
                <motion.button
                  key={mod.code}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleModule(mod.code)}
                  className={`relative flex flex-col rounded-xl border-2 p-5 text-left transition-all ${
                    selected
                      ? `${mod.border} ring-2 ${mod.ring} bg-gradient-to-br ${mod.bg} shadow-md`
                      : "border-border bg-card hover:border-muted-foreground/30 hover:shadow-sm"
                  }`}
                >
                  {selected && (
                    <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                      <Check className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl ${mod.iconBg}`}>
                    <mod.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="font-semibold mb-1 pr-8 text-sm">{mod.name}</div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-2xl font-extrabold">{fmt(mod.price)}</span>
                    <span className="text-xs text-muted-foreground">/mo</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">Up to {mod.maxUsers} users</div>
                  <ul className="space-y-1.5">
                    {mod.features.map((f) => (
                      <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </motion.button>
              );
            })}
          </div>

          {/* Bundle option */}
          <motion.button
            whileTap={{ scale: 0.99 }}
            onClick={selectBundle}
            className={`w-full rounded-xl border-2 p-5 text-left transition-all ${
              isBundle
                ? "border-amber-500 ring-2 ring-amber-400 bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-xl"
                : "border-border bg-gradient-to-br from-gray-900 to-gray-800 text-white hover:border-amber-500/50"
            }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                {isBundle && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                )}
                <Crown className="h-6 w-6 text-amber-400" />
                <div>
                  <div className="font-bold text-lg">Complete Suite — All 4 modules</div>
                  <div className="text-sm text-gray-400">Up to 10 users · Save {fmt(MODULES.reduce((s, m) => s + m.price, 0) - BUNDLE_PRICE)}/month</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400 line-through">{fmt(MODULES.reduce((s, m) => s + m.price, 0))}/mo</div>
                <div className="text-2xl font-extrabold">{fmt(BUNDLE_PRICE)}<span className="text-sm font-normal text-gray-400">/mo</span></div>
              </div>
            </div>
          </motion.button>

          {/* Summary & CTA */}
          {selectedModules.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold">Your selection</div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold">{fmt(totalCents)}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                  {savings > 0 && <div className="text-xs text-emerald-600 font-semibold">Saving {fmt(savings)}/month!</div>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedModules.map((code) => {
                  const m = MODULES.find((x) => x.code === code)!;
                  return (
                    <span key={code} className={`inline-flex items-center gap-1.5 rounded-full border ${m.border} bg-gradient-to-br ${m.bg} px-3 py-1 text-xs font-semibold`}>
                      <m.icon className="h-3.5 w-3.5" />
                      {m.name}
                    </span>
                  );
                })}
              </div>
              <div className="text-xs text-muted-foreground mb-4">Up to {maxUsers} user accounts included</div>
              <div className="flex flex-col sm:flex-row gap-3">
                {trialEligible && (
                  <Button
                    onClick={handleStartTrial}
                    disabled={trialLoading}
                    variant="outline"
                    className="flex-1 border-emerald-400 text-emerald-700 hover:bg-emerald-50"
                  >
                    {trialLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Gift className="mr-2 h-4 w-4" />}
                    Start 7-day free trial
                  </Button>
                )}
                <Button
                  onClick={() => setView("checkout")}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90"
                >
                  Subscribe now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {selectedModules.length === 0 && trialEligible && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Select modules above, or start your 7-day free trial for full access.
              </p>
              <Button onClick={handleStartTrial} disabled={trialLoading} variant="outline" size="lg">
                {trialLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Gift className="mr-2 h-4 w-4" />}
                Start free 7-day trial (all modules)
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── CHECKOUT VIEW ───────────────────────────────────────── */}
      {view === "checkout" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setView("modules")}>← Back</Button>
            <div>
              <h2 className="font-bold text-lg">Subscription details</h2>
              <p className="text-sm text-muted-foreground">
                {selectedModules.length} module{selectedModules.length !== 1 ? "s" : ""} · <strong>{fmt(totalCents)}/month</strong>
                {savings > 0 && <span className="ml-2 text-emerald-600 text-xs font-semibold">Saving {fmt(savings)}/mo</span>}
              </p>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <form onSubmit={handleCheckoutSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label>Full name</Label>
                  <Input
                    value={form.recipientName}
                    onChange={(e) => setForm((f) => ({ ...f, recipientName: e.target.value }))}
                    placeholder="Your full name"
                  />
                  {errors.recipientName && <p className="text-xs text-red-500">{errors.recipientName}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Email address</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Contact number</Label>
                  <Input
                    value={form.contactNumber}
                    onChange={(e) => setForm((f) => ({ ...f, contactNumber: e.target.value }))}
                    placeholder="0XX XXX XXXX"
                  />
                  {errors.contactNumber && <p className="text-xs text-red-500">{errors.contactNumber}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Preferred collection day</Label>
                  <Select value={form.collectionDay} onValueChange={(v) => setForm((f) => ({ ...f, collectionDay: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 5, 10, 15, 20, 25, 28].map((d) => (
                        <SelectItem key={d} value={String(d)}>Day {d} of each month</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Address <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input
                    value={form.shippingAddress1}
                    onChange={(e) => setForm((f) => ({ ...f, shippingAddress1: e.target.value }))}
                    placeholder="Street address"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Promo code <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input
                    value={form.promoCode}
                    onChange={(e) => setForm((f) => ({ ...f, promoCode: e.target.value }))}
                    placeholder="Enter code"
                  />
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                <p>You will be redirected to our secure payment provider (Adumo Online) to complete your subscription setup. Your banking details are never stored on our servers.</p>
              </div>

              <Button
                type="submit"
                disabled={checkoutLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90"
                size="lg"
              >
                {checkoutLoading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing payment…</>
                  : <>Proceed to payment — {fmt(totalCents)}/month <ArrowRight className="ml-2 h-4 w-4" /></>
                }
              </Button>
            </form>
          </div>
        </motion.div>
      )}
      </div>
    </div>
  );
}
