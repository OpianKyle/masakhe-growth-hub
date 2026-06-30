import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp, TrendingDown, DollarSign, Receipt, Globe, Smartphone,
  ArrowUpRight, ArrowDownRight, Wallet, CheckCircle2,
  AlertCircle, FileText, BarChart3, BookOpen, HandCoins,
  Send, Handshake, Phone, Loader2, Star,
  Users, Package, Banknote, CalendarDays, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";
import { Mail, X } from "lucide-react";

interface OverviewData {
  kpis: {
    revenueThisMonth: number;
    expenseThisMonth: number;
    netThisMonth: number;
    revenueChange: number;
    expenseChange: number;
    totalInvoices: number;
    totalInvoiceValue: number;
    pendingInvoiceCount: number;
    websiteCount: number;
    websitePublished: boolean;
    ledgerCount: number;
    socialPosts: number;
    socialConnected: number;
  };
  revenueChart: { month: string; income: number; expense: number }[];
  expensesByCategory: { name: string; value: number }[];
  incomeByCategory: { name: string; value: number }[];
  socialPostsByDay: { day: string; count: number }[];
  recentActivity: { type: string; text: string; amount: string; time: string; category: string }[];
}

const COLORS = ["#14684b", "#e8b931", "#2563eb", "#dc2626", "#8b5cf6", "#f59e0b", "#10b981", "#6366f1"];

function formatRand(v: number) {
  return `R${v.toLocaleString("en-ZA", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatMonth(m: string) {
  const parts = m.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[parseInt(parts[1]) - 1] || m;
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const firstName = user?.full_name?.split(" ")[0] || "there";
  const [verifyBannerDismissed, setVerifyBannerDismissed] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [verificationResent, setVerificationResent] = useState(false);

  const handleResendVerification = async () => {
    setResendingVerification(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setVerificationResent(true);
        toast.success("Verification email sent! Check your inbox.");
      } else {
        toast.error("Failed to send verification email. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setResendingVerification(false);
    }
  };

  const [applyOpen, setApplyOpen] = useState(false);
  const [applyPhone, setApplyPhone] = useState("");
  const [applyMessage, setApplyMessage] = useState("");
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applyDone, setApplyDone] = useState(false);

  const submitFranchiseApplication = async () => {
    setApplySubmitting(true);
    try {
      const res = await fetch("/api/franchise/apply", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: applyPhone, message: applyMessage }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error || "Failed to send application"); return; }
      setApplyDone(true);
      toast.success("Application submitted! The Masakhe team will contact you soon.");
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setApplySubmitting(false);
    }
  };

  const [activeModules, setActiveModules] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/overview", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/billing/status", { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d.modules)) setActiveModules(d.modules); })
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6 animate-pulse">
            <div className="h-6 bg-muted rounded w-1/3 mb-4" />
            <div className="h-32 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  const MODULE_OVERVIEW = [
    { code: "web_builder", label: "Web Builder", color: "from-sky-500 to-emerald-500", bg: "from-sky-50 to-emerald-50 dark:from-sky-950/30 dark:to-emerald-950/30", border: "border-sky-200 dark:border-sky-800" },
    { code: "social_biz", label: "Social & Biz", color: "from-violet-500 to-fuchsia-500", bg: "from-violet-50 to-fuchsia-50 dark:from-violet-950/30 dark:to-fuchsia-950/30", border: "border-violet-200 dark:border-violet-800" },
    { code: "transactions_ops", label: "Transactions", color: "from-emerald-500 to-teal-500", bg: "from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30", border: "border-emerald-200 dark:border-emerald-800" },
    { code: "people_hr", label: "Human Capital", color: "from-amber-500 to-orange-500", bg: "from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30", border: "border-amber-200 dark:border-amber-800" },
  ];

  const k = data?.kpis;
  const hasFinanceData = (k?.ledgerCount || 0) > 0;
  const hasInvoices = (k?.totalInvoices || 0) > 0;
  const hasSocial = (k?.socialPosts || 0) > 0;

  const kpiCards = [
    {
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-600",
      label: "Revenue (MTD)",
      value: formatRand(k?.revenueThisMonth || 0),
      change: `${(k?.revenueChange || 0) >= 0 ? "+" : ""}${k?.revenueChange || 0}%`,
      positive: (k?.revenueChange || 0) >= 0,
      link: "/dashboard/finance",
    },
    {
      icon: Wallet,
      gradient: "from-rose-500 to-pink-600",
      label: "Expenses (MTD)",
      value: formatRand(k?.expenseThisMonth || 0),
      change: `${(k?.expenseChange || 0) >= 0 ? "+" : ""}${k?.expenseChange || 0}%`,
      positive: (k?.expenseChange || 0) <= 0,
      link: "/dashboard/finance",
    },
    {
      icon: Receipt,
      gradient: "from-blue-500 to-indigo-600",
      label: "Invoices",
      value: String(k?.totalInvoices || 0),
      change: `R${((k?.totalInvoiceValue || 0)).toLocaleString("en-ZA")} total`,
      positive: true,
      link: "/dashboard/invoices",
    },
    {
      icon: Smartphone,
      gradient: "from-violet-500 to-purple-600",
      label: "Social Posts",
      value: String(k?.socialPosts || 0),
      change: `${k?.socialConnected || 0} accounts`,
      positive: (k?.socialConnected || 0) > 0,
      link: "/dashboard/social",
    },
  ];

  const QUICK_NAV = [
    { label: "Finance",   icon: TrendingUp,    path: "/dashboard/finance",    grad: "from-emerald-500 to-teal-500",   desc: "Track cash flow" },
    { label: "Invoices",  icon: Receipt,       path: "/dashboard/invoices",   grad: "from-blue-500 to-indigo-500",    desc: "Quotes & billing" },
    { label: "Clients",   icon: Users,         path: "/dashboard/clients",    grad: "from-violet-500 to-purple-500",  desc: "Manage clients" },
    { label: "Inventory", icon: Package,       path: "/dashboard/inventory",  grad: "from-orange-500 to-amber-500",   desc: "Stock control" },
    { label: "Payroll",   icon: Banknote,      path: "/dashboard/payroll",    grad: "from-sky-500 to-blue-500",       desc: "Salaries & PAYE" },
    { label: "Social",    icon: Smartphone,    path: "/dashboard/social",     grad: "from-pink-500 to-rose-500",      desc: "Posts & campaigns" },
    { label: "Leave",     icon: CalendarDays,  path: "/dashboard/leave",      grad: "from-teal-500 to-cyan-500",      desc: "HR & leave" },
    { label: "Website",   icon: Globe,         path: "/website-builder",      grad: "from-sky-500 to-emerald-500",    desc: "Build & publish" },
  ];

  return (
    <div className="min-h-full bg-white dark:bg-gray-950">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 25%, #bfdbfe 65%, #ddd6fe 100%)" }}>
        {/* Floating decorative mockups */}
        <div className="pointer-events-none select-none absolute inset-0">
          {/* Mini finance card — right */}
          <motion.div
            initial={{ opacity: 0, rotate: 6, y: 20 }}
            animate={{ opacity: 0.92, rotate: 4, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="absolute -right-2 top-5 w-44 rounded-2xl bg-white/85 backdrop-blur-sm shadow-2xl border-2 border-white p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
                <TrendingUp className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="space-y-1"><div className="h-2 w-16 rounded-full bg-gray-200" /><div className="h-1.5 w-10 rounded-full bg-gray-100" /></div>
            </div>
            <div className="h-6 w-20 rounded-lg bg-emerald-100 mb-2" />
            <div className="h-1.5 w-full rounded-full bg-gray-100"><div className="h-1.5 w-2/3 rounded-full bg-emerald-400" /></div>
          </motion.div>
          {/* Mini invoice card — left */}
          <motion.div
            initial={{ opacity: 0, rotate: -6, y: 20 }}
            animate={{ opacity: 0.85, rotate: -4, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="absolute -left-2 top-8 w-36 rounded-2xl bg-white/85 backdrop-blur-sm shadow-2xl border-2 border-white p-3"
          >
            <div className="h-2 w-20 rounded-full bg-blue-200 mb-1.5" />
            <div className="h-1.5 w-14 rounded-full bg-gray-100 mb-2.5" />
            <div className="space-y-1.5 mb-3">
              {[["w-12","w-8"],["w-10","w-8"],["w-14","w-6"]].map(([a,b],i) => (
                <div key={i} className="flex justify-between"><div className={`h-1.5 ${a} rounded-full bg-gray-100`} /><div className={`h-1.5 ${b} rounded-full bg-blue-100`} /></div>
              ))}
            </div>
            <div className="h-5 w-full rounded-lg bg-blue-500/20" />
          </motion.div>
          {/* Mini bar chart — bottom right */}
          <motion.div
            initial={{ opacity: 0, rotate: 3, y: 30 }}
            animate={{ opacity: 0.78, rotate: 2, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="absolute right-28 -bottom-1 w-32 rounded-2xl bg-white/75 backdrop-blur-sm shadow-xl border-2 border-white p-3"
          >
            <div className="h-1.5 w-14 rounded-full bg-gray-200 mb-2" />
            <div className="flex items-end gap-0.5 h-10">
              {[35,60,45,85,55,78,65].map((h,i) => (
                <div key={i} className="flex-1 rounded-t-sm" style={{height:`${h}%`,background:i%2===0?"#10b981":"#3b82f6",opacity:0.65}} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 py-12 px-6 text-center max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {user?.logo_url && <img src={user.logo_url} alt="Logo" className="h-16 w-16 rounded-2xl object-contain bg-white p-1 border-2 border-white shadow-lg mx-auto mb-3" />}
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2" style={{ color: "#064e3b" }}>
              Welcome back, {firstName}!
            </h1>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-emerald-800/70 mb-6 text-sm">
            {user?.business_name
              ? hasFinanceData
                ? `${user.business_name} · Net this month: ${formatRand(k?.netThisMonth || 0)}`
                : `${user.business_name} · Start logging finances to see insights`
              : "Set up your business profile to get started"}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/dashboard/finance">
              <Button className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-md gap-2 rounded-xl">
                <Plus className="h-4 w-4" /> Add Income
              </Button>
            </Link>
            <Link to="/dashboard/invoices">
              <Button variant="outline" className="bg-white/80 border-white shadow-sm gap-2 text-emerald-900 hover:bg-white rounded-xl">
                <Receipt className="h-4 w-4" /> New Invoice
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── Quick nav bar ─────────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white dark:bg-gray-950 px-4 py-2">
        <div className="max-w-5xl mx-auto flex items-center gap-0.5 overflow-x-auto scrollbar-none">
          {QUICK_NAV.map((a, i) => (
            <motion.div key={a.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link to={a.path}
                className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group min-w-[68px] shrink-0">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${a.grad} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                  <a.icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">{a.label}</span>
              </Link>
            </motion.div>
          ))}
          <div className="mx-2 h-10 w-px bg-gray-200 dark:bg-gray-700 shrink-0" />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
            <Link to="/dashboard/settings"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold shadow-md hover:shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all shrink-0 whitespace-nowrap">
              Edit Profile
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Email verification banner */}
        {user && !user.email_verified && !verifyBannerDismissed && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-start gap-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 flex-shrink-0 mt-0.5">
              <Mail className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-900">Please verify your email address</p>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                We sent a verification link to <strong>{user.email}</strong>. Click the link in that email to fully activate your account.
              </p>
              {!verificationResent ? (
                <button onClick={handleResendVerification} disabled={resendingVerification}
                  className="mt-2 text-xs text-amber-800 underline underline-offset-2 font-medium hover:text-amber-900 disabled:opacity-50">
                  {resendingVerification ? "Sending…" : "Didn't get it? Resend verification email"}
                </button>
              ) : (
                <p className="mt-2 text-xs text-green-700 font-medium">Verification email resent — check your inbox!</p>
              )}
            </div>
            <button onClick={() => setVerifyBannerDismissed(true)} className="text-amber-400 hover:text-amber-600 flex-shrink-0">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {/* Module status strip */}
        {activeModules.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MODULE_OVERVIEW.map((m) => {
              const active = activeModules.includes(m.code);
              return (
                <div key={m.code} className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 transition-all ${
                  active ? `${m.border} bg-gradient-to-br ${m.bg}` : "border-gray-100 bg-gray-50 opacity-50"
                }`}>
                  <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${active ? `bg-gradient-to-br ${m.color}` : "bg-gray-300"}`} />
                  <span className={`text-sm font-medium truncate ${active ? "text-gray-800" : "text-gray-400"}`}>{m.label}</span>
                  {active && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 ml-auto shrink-0" />}
                </div>
              );
            })}
          </motion.div>
        )}

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Link to={kpi.link} className="block bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 hover:border-gray-200 group">
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${kpi.gradient} shadow-sm`}>
                    <kpi.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className={`text-xs font-semibold flex items-center gap-1 ${kpi.positive ? "text-emerald-600" : "text-rose-500"}`}>
                    {kpi.change}
                    {kpi.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  </span>
                </div>
                <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{kpi.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{kpi.label}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Franchise Application Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-md">
              <Handshake className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-indigo-900">Become a Masakhe Franchise Partner</h3>
              <p className="text-sm text-indigo-700/80 mt-1">
                Grow your own portfolio of businesses using the Masakhe platform — earn recurring revenue with a dedicated portal.
              </p>
              <div className="flex flex-wrap gap-4 mt-3">
                {["Earn recurring revenue", "Manage client subscriptions", "Dedicated franchise portal"].map(b => (
                  <span key={b} className="flex items-center gap-1.5 text-xs font-medium text-indigo-800">
                    <Star className="h-3.5 w-3.5 text-indigo-500" /> {b}
                  </span>
                ))}
              </div>
            </div>
            <Button onClick={() => { setApplyOpen(true); setApplyDone(false); setApplyPhone(""); setApplyMessage(""); }}
              className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white gap-2 rounded-xl shadow-md">
              <Send className="h-4 w-4" /> Apply Now
            </Button>
          </div>
        </motion.div>

        {/* Revenue chart */}
        {hasFinanceData && data?.revenueChart && data.revenueChart.length > 0 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" /> Revenue vs Expenses
            </h3>
            <p className="text-xs text-gray-500 mb-4">Monthly income and expenses from your ledger</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueChart}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14684b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#14684b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `R${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number, name: string) => [`R${value.toLocaleString("en-ZA",{minimumFractionDigits:2})}`, name==="income"?"Income":"Expenses"]} labelFormatter={(label) => formatMonth(label)} />
                  <Legend formatter={(value) => value==="income"?"Income":"Expenses"} />
                  <Area type="monotone" dataKey="income" stroke="#14684b" strokeWidth={2} fill="url(#incomeGrad)" />
                  <Area type="monotone" dataKey="expense" stroke="#dc2626" strokeWidth={2} fill="url(#expenseGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white dark:bg-gray-900 border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center">
            <DollarSign className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-1">No Financial Data Yet</h3>
            <p className="text-sm text-gray-500 mb-4">Start logging income and expenses to see revenue charts here.</p>
            <Link to="/dashboard/finance"><Button size="sm" className="rounded-xl">Log Your First Entry</Button></Link>
          </motion.div>
        )}

        {/* Category breakdowns */}
        <div className="grid lg:grid-cols-2 gap-6">
          {data?.expensesByCategory && data.expensesByCategory.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Expenses by Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.expensesByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                      {data.expensesByCategory.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => `R${value.toLocaleString("en-ZA",{minimumFractionDigits:2})}`} />
                    <Legend layout="vertical" align="right" verticalAlign="middle" formatter={(value) => <span className="text-xs text-gray-700">{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
          {data?.incomeByCategory && data.incomeByCategory.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Income by Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.incomeByCategory} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tickFormatter={(v) => `R${v>=1000?`${(v/1000).toFixed(0)}k`:v}`} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value: number) => `R${value.toLocaleString("en-ZA",{minimumFractionDigits:2})}`} />
                    <Bar dataKey="value" fill="#14684b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </div>

        {/* Social posts chart */}
        {hasSocial && data?.socialPostsByDay && data.socialPostsByDay.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-violet-500" /> Social Media Activity
            </h3>
            <p className="text-xs text-gray-500 mb-4">Published posts per day (last 14 days)</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.socialPostsByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Posts" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Recent activity + side panels */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
            {data?.recentActivity && data.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {data.recentActivity.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 py-1">
                    <div className="mt-0.5">
                      {item.type === "payment" ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> :
                       item.type === "expense"  ? <TrendingDown className="h-5 w-5 text-rose-500" /> :
                       item.type === "invoice"  ? <FileText className="h-5 w-5 text-amber-500" /> :
                       <AlertCircle className="h-5 w-5 text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 dark:text-gray-200">{item.text}</p>
                      <p className="text-xs text-gray-400">{new Date(item.time).toLocaleDateString("en-ZA",{day:"numeric",month:"short",year:"numeric"})}</p>
                    </div>
                    <span className={`text-sm font-semibold ${item.type==="expense"?"text-rose-500":"text-gray-800 dark:text-gray-200"}`}>{item.amount}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <AlertCircle className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No recent activity yet.</p>
              </div>
            )}
          </div>

          <div className="space-y-5">
            {/* Quick actions */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { icon: Globe,      label: "Website",  grad: "from-sky-500 to-emerald-500",  path: "/website-builder" },
                  { icon: Receipt,    label: "Invoice",  grad: "from-blue-500 to-indigo-500",   path: "/dashboard/invoices" },
                  { icon: Wallet,     label: "Finance",  grad: "from-emerald-500 to-teal-500",  path: "/dashboard/finance" },
                  { icon: BookOpen,   label: "Biz Plan", grad: "from-amber-500 to-orange-500",  path: "/dashboard/business-plan" },
                  { icon: HandCoins,  label: "Proposal", grad: "from-violet-500 to-purple-500", path: "/dashboard/funding-proposal" },
                ].map((a) => (
                  <Link key={a.label} to={a.path}
                    className="flex flex-col items-center gap-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                    <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${a.grad} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                      <a.icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>
            {/* Business Status */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Business Status</h3>
              <div className="space-y-2.5">
                <StatusRow label="Website"           ok={k?.websitePublished}          detail={k?.websitePublished ? "Published" : "Not published"} />
                <StatusRow label="Financial Records" ok={(k?.ledgerCount||0) >= 10}    detail={`${k?.ledgerCount||0} entries`} />
                <StatusRow label="Invoices"          ok={(k?.totalInvoices||0) >= 1}   detail={`${k?.totalInvoices||0} created`} />
                <StatusRow label="Social Media"      ok={(k?.socialConnected||0) >= 1} detail={`${k?.socialConnected||0} accounts`} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Franchise Application Modal */}
      <Dialog open={applyOpen} onOpenChange={open => { if (!open) setApplyOpen(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Handshake className="h-5 w-5 text-indigo-600" /> Franchise Partner Application
            </DialogTitle>
            <DialogDescription>
              Fill in the details below and the Masakhe team will contact you to discuss the opportunity.
            </DialogDescription>
          </DialogHeader>

          {applyDone ? (
            <div className="py-8 text-center space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 mx-auto">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="font-bold text-lg">Application Sent!</h3>
              <p className="text-sm text-muted-foreground">
                Your application has been submitted to the Masakhe team at <strong>admin@masakhegroup.co.za</strong>.
                Someone will reach out to you within 1–2 business days.
              </p>
              <Button onClick={() => setApplyOpen(false)} className="mt-2">Close</Button>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-2">
                <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                  Your name, email and business name will be included automatically from your profile.
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="apply-phone" className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> Contact Phone Number
                  </Label>
                  <Input
                    id="apply-phone"
                    value={applyPhone}
                    onChange={e => setApplyPhone(e.target.value)}
                    placeholder="+27 72 000 0000"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="apply-message">Tell us about yourself <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Textarea
                    id="apply-message"
                    value={applyMessage}
                    onChange={e => setApplyMessage(e.target.value)}
                    placeholder="E.g. your experience, the region you'd like to cover, why you're interested…"
                    rows={4}
                    className="resize-none text-sm"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setApplyOpen(false)}>Cancel</Button>
                <Button
                  onClick={submitFranchiseApplication}
                  disabled={applySubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                  {applySubmitting
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                    : <><Send className="h-4 w-4" /> Submit Application</>}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusRow({ label, ok, detail }: { label: string; ok?: boolean; detail: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        {ok ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <AlertCircle className="h-4 w-4 text-muted-foreground" />}
        <span className="text-foreground">{label}</span>
      </div>
      <span className={`text-xs ${ok ? "text-primary font-medium" : "text-muted-foreground"}`}>{detail}</span>
    </div>
  );
}
