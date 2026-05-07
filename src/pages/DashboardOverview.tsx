import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp, TrendingDown, DollarSign, Receipt, Globe, Smartphone,
  ArrowUpRight, ArrowDownRight, Wallet, CheckCircle2,
  AlertCircle, FileText, BarChart3, BookOpen, HandCoins,
  Send, Handshake, Phone, Loader2, Star
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

  useEffect(() => {
    fetch("/api/dashboard/overview", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
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

  const k = data?.kpis;
  const hasFinanceData = (k?.ledgerCount || 0) > 0;
  const hasInvoices = (k?.totalInvoices || 0) > 0;
  const hasSocial = (k?.socialPosts || 0) > 0;

  const kpiCards = [
    {
      icon: TrendingUp,
      label: "Revenue (MTD)",
      value: formatRand(k?.revenueThisMonth || 0),
      change: `${(k?.revenueChange || 0) >= 0 ? "+" : ""}${k?.revenueChange || 0}%`,
      positive: (k?.revenueChange || 0) >= 0,
      link: "/dashboard/finance",
    },
    {
      icon: Wallet,
      label: "Expenses (MTD)",
      value: formatRand(k?.expenseThisMonth || 0),
      change: `${(k?.expenseChange || 0) >= 0 ? "+" : ""}${k?.expenseChange || 0}%`,
      positive: (k?.expenseChange || 0) <= 0,
      link: "/dashboard/finance",
    },
    {
      icon: Receipt,
      label: "Invoices",
      value: String(k?.totalInvoices || 0),
      change: `R${((k?.totalInvoiceValue || 0)).toLocaleString("en-ZA")} total`,
      positive: true,
      link: "/dashboard/invoices",
    },
    {
      icon: Smartphone,
      label: "Social Posts",
      value: String(k?.socialPosts || 0),
      change: `${k?.socialConnected || 0} accounts`,
      positive: (k?.socialConnected || 0) > 0,
      link: "/dashboard/social",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl gradient-hero p-6 text-primary-foreground">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold font-heading">Welcome, {firstName}!</h2>
            <p className="text-primary-foreground/80 mt-1">
              {user?.business_name
                ? hasFinanceData
                  ? `${user.business_name} — Net this month: ${formatRand(k?.netThisMonth || 0)}`
                  : `${user.business_name} — Start logging finances to see insights.`
                : "Set up your business profile to get started."}
            </p>
          </div>
          {user?.logo_url && (
            <img src={user.logo_url} alt="Logo" className="h-12 w-12 rounded-lg object-cover border-2 border-white/20" />
          )}
        </div>
        <div className="flex gap-3 mt-4">
          <Link to="/dashboard/settings">
            <Button variant="ghost" size="sm" className="text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground/10">
              Edit Profile
            </Button>
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Link to={kpi.link} className="block rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <kpi.icon className="h-5 w-5 text-primary" />
                </div>
                <span className={`text-xs font-semibold flex items-center gap-1 ${kpi.positive ? "text-primary" : "text-sa-red"}`}>
                  {kpi.change}
                  {kpi.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                </span>
              </div>
              <p className="text-2xl font-bold font-heading text-foreground mt-3">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Franchise Application Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600">
            <Handshake className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold font-heading text-indigo-900">Become a Masakhe Franchise Partner</h3>
            <p className="text-sm text-indigo-700 mt-1">
              Grow your own portfolio of businesses using the Masakhe platform. Franchise partners get a dedicated portal to manage, support and subscribe clients — and earn recurring revenue.
            </p>
            <div className="flex flex-wrap gap-4 mt-3">
              {["Earn recurring revenue", "Manage client subscriptions", "Dedicated franchise portal"].map(b => (
                <span key={b} className="flex items-center gap-1.5 text-xs font-medium text-indigo-800">
                  <Star className="h-3.5 w-3.5 text-indigo-500" /> {b}
                </span>
              ))}
            </div>
          </div>
          <Button
            onClick={() => { setApplyOpen(true); setApplyDone(false); setApplyPhone(""); setApplyMessage(""); }}
            className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            <Send className="h-4 w-4" /> Apply Now
          </Button>
        </div>
      </motion.div>

      {hasFinanceData && data?.revenueChart && data.revenueChart.length > 0 ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h3 className="text-lg font-bold font-heading text-foreground mb-1 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Revenue vs Expenses
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Monthly income and expenses from your ledger</p>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `R${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number, name: string) => [`R${value.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`, name === "income" ? "Income" : "Expenses"]}
                  labelFormatter={(label) => formatMonth(label)}
                />
                <Legend formatter={(value) => value === "income" ? "Income" : "Expenses"} />
                <Area type="monotone" dataKey="income" stroke="#14684b" strokeWidth={2} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="expense" stroke="#dc2626" strokeWidth={2} fill="url(#expenseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <DollarSign className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-bold font-heading text-foreground mb-1">No Financial Data Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Start logging income and expenses to see revenue charts here.</p>
          <Link to="/dashboard/finance">
            <Button size="sm">Log Your First Entry</Button>
          </Link>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {data?.expensesByCategory && data.expensesByCategory.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h3 className="text-lg font-bold font-heading text-foreground mb-4">Expenses by Category</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.expensesByCategory}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.expensesByCategory.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `R${value.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`} />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {data?.incomeByCategory && data.incomeByCategory.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h3 className="text-lg font-bold font-heading text-foreground mb-4">Income by Category</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.incomeByCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tickFormatter={(v) => `R${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => `R${value.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`} />
                  <Bar dataKey="value" fill="#14684b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>

      {hasSocial && data?.socialPostsByDay && data.socialPostsByDay.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h3 className="text-lg font-bold font-heading text-foreground mb-1 flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Social Media Activity
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Published posts per day (last 14 days)</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.socialPostsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Posts" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-card">
          <h3 className="text-lg font-bold font-heading text-foreground mb-4">Recent Activity</h3>
          {data?.recentActivity && data.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {data.recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {item.type === "payment" ? <CheckCircle2 className="h-5 w-5 text-primary" /> :
                     item.type === "expense" ? <TrendingDown className="h-5 w-5 text-sa-red" /> :
                     item.type === "invoice" ? <FileText className="h-5 w-5 text-sa-gold" /> :
                     <AlertCircle className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{item.text}</p>
                    <p className="text-xs text-muted-foreground">{new Date(item.time).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <span className={`text-sm font-semibold ${item.type === "expense" ? "text-sa-red" : "text-foreground"}`}>
                    {item.amount}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No recent activity. Start using Finance and Invoices to see data here.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h3 className="text-lg font-bold font-heading text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Globe, label: "Website", color: "gradient-hero", path: "/dashboard/website" },
                { icon: Receipt, label: "Invoice", color: "gradient-gold", path: "/dashboard/invoices" },
                { icon: Wallet, label: "Finance", color: "gradient-warm", path: "/dashboard/finance" },
                { icon: BookOpen, label: "Biz Plan", color: "gradient-warm", path: "/dashboard/business-plan" },
                { icon: HandCoins, label: "Proposal", color: "gradient-gold", path: "/dashboard/funding-proposal" },
              ].map((action) => (
                <Link key={action.label} to={action.path}
                  className={`flex flex-col items-center gap-2 rounded-xl ${action.color} p-3 text-primary-foreground hover:opacity-90 transition-opacity`}>
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs font-semibold">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h3 className="text-sm font-bold font-heading text-foreground mb-3">Business Status</h3>
            <div className="space-y-2.5">
              <StatusRow label="Website" ok={k?.websitePublished} detail={k?.websitePublished ? "Published" : "Not published"} />
              <StatusRow label="Financial Records" ok={(k?.ledgerCount || 0) >= 10} detail={`${k?.ledgerCount || 0} entries`} />
              <StatusRow label="Invoices" ok={(k?.totalInvoices || 0) >= 1} detail={`${k?.totalInvoices || 0} created`} />
              <StatusRow label="Social Media" ok={(k?.socialConnected || 0) >= 1} detail={`${k?.socialConnected || 0} accounts`} />
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
