import { useState, useEffect } from "react";
import { Link, useLocation, Routes, Route, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Globe, Settings, ChevronLeft, ChevronRight, Bell, Search,
  TrendingUp, Building2, ExternalLink, Trash2, Shield, ShieldCheck, Eye, Receipt, FileText, BarChart3,
  Plus, Edit, X, MapPin, Calendar, DollarSign, Briefcase, ArrowLeft, CheckCircle2, Clock, XCircle, Star, LogIn,
  CreditCard, BadgeCheck, BanknoteIcon, Mail, Loader2, Award, ChevronDown, ChevronUp, UserCheck, UserX, Ban,
  Crown, Handshake, History, StickyNote, Tag as TagIcon, ArrowUpDown, TrendingDown, Wallet, Activity, Filter,
  Store, RefreshCw, UserPlus, Link2, Unlink
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Stats {
  totalUsers: number;
  totalWebsites: number;
  publishedWebsites: number;
  totalProfiles: number;
  recentUsers: number;
  totalInvoices: number;
  totalLedgerEntries: number;
  revenueByMonth: Array<{ month: string; income: number; expense: number }>;
}

interface Client {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  business_name?: string;
  trading_name?: string;
  business_status?: string;
  business_type?: string;
  industry_sector?: string;
  phone?: string;
  physical_address?: string;
  website_count: number;
  subscription_status?: string | null;
  trial_end_at?: string | null;
  plan_code?: string | null;
  plan_name?: string | null;
  plan_price_cents?: number | null;
  subscription_exempt?: number | boolean;
  admin_notes?: string | null;
  admin_tags?: string[] | null;
}

interface FinancialStats {
  mrrCents: number;
  arrCents: number;
  arpuCents: number;
  activeSubs: number;
  activeTrials: number;
  expiredTrials: number;
  pastDue: number;
  cancelled30Days: number;
  churnPct: number;
  conversionPct: number;
  totalTrialsEver: number;
  convertedToActive: number;
  paidThisMonthCents: number;
  paidThisMonthCount: number;
  pendingInvoices: { count: number; totalCents: number };
  failedInvoices: { count: number; totalCents: number };
  revenueByMonth: Array<{ month: string; totalCents: number }>;
  planDistribution: Array<{ code: string; name: string; count: number }>;
}

interface AuditEntry {
  id: number;
  admin_id: string;
  admin_name: string | null;
  admin_email: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  target_label: string | null;
  details: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
}

const adminNavItems = [
  { icon: LayoutDashboard, label: "Overview",   path: "/admin" },
  { icon: Users,           label: "Clients",    path: "/admin/clients" },
  { icon: Handshake,       label: "Partners",   path: "/admin/partners" },
  { icon: Store,           label: "Franchises", path: "/admin/franchises" },
  { icon: FileText,        label: "Tenders",    path: "/admin/tenders" },
  { icon: Globe,           label: "Websites",   path: "/admin/websites" },
  { icon: History,         label: "Audit Log",  path: "/admin/audit" },
  { icon: Settings,        label: "Settings",   path: "/admin/settings" },
];

const TAG_PALETTE: Record<string, string> = {
  vip: "bg-purple-100 text-purple-800 border-purple-200",
  "at-risk": "bg-red-100 text-red-800 border-red-200",
  "high-value": "bg-amber-100 text-amber-800 border-amber-200",
  "needs-onboarding": "bg-blue-100 text-blue-800 border-blue-200",
  prospect: "bg-cyan-100 text-cyan-800 border-cyan-200",
  followup: "bg-indigo-100 text-indigo-800 border-indigo-200",
  partner: "bg-emerald-100 text-emerald-800 border-emerald-200",
  enterprise: "bg-slate-200 text-slate-800 border-slate-300",
};
function tagClass(t: string) {
  return TAG_PALETTE[t.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200";
}
function fmtRand(cents: number) {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
function fmtRandPrecise(cents: number) {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [fin, setFin] = useState<FinancialStats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats", { credentials: "include" })
      .then((r) => r.json())
      .then(setStats)
      .catch(() => toast.error("Failed to load stats"));
    fetch("/api/admin/financial-stats", { credentials: "include" })
      .then((r) => r.json())
      .then(setFin)
      .catch(() => toast.error("Failed to load financial stats"));
  }, []);

  if (!stats) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;

  const cards = [
    { label: "Total Clients", value: stats.totalUsers, icon: Users, color: "bg-blue-500/10 text-blue-600" },
    { label: "New This Week", value: stats.recentUsers, icon: TrendingUp, color: "bg-green-500/10 text-green-600" },
    { label: "Total Websites", value: stats.totalWebsites, icon: Globe, color: "bg-purple-500/10 text-purple-600" },
    { label: "Published Sites", value: stats.publishedWebsites, icon: ExternalLink, color: "bg-orange-500/10 text-orange-600" },
    { label: "Invoices Created", value: stats.totalInvoices, icon: Receipt, color: "bg-teal-500/10 text-teal-600" },
    { label: "Ledger Entries", value: stats.totalLedgerEntries, icon: FileText, color: "bg-indigo-500/10 text-indigo-600" },
  ];

  const chartData = (stats.revenueByMonth || []).map((r) => ({
    month: r.month,
    Income: r.income / 100,
    Expenses: r.expense / 100,
  }));

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold font-heading">Admin Overview</h2>
        <p className="text-muted-foreground">Platform statistics and management.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold mt-3">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recurring revenue snapshot */}
      <div>
        <h3 className="text-lg font-bold font-heading mb-3 flex items-center gap-2">
          <Wallet className="h-5 w-5 text-emerald-600" />
          Recurring Revenue
        </h3>
        {!fin ? (
          <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Calculating MRR…
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold uppercase tracking-wide">
                <Wallet className="h-4 w-4" /> MRR
              </div>
              <p className="text-3xl font-bold mt-2 text-emerald-900">{fmtRand(fin.mrrCents)}</p>
              <p className="text-xs text-emerald-700/70 mt-1">{fin.activeSubs} active subs</p>
            </div>
            <div className="rounded-xl border bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold uppercase tracking-wide">
                <TrendingUp className="h-4 w-4" /> ARR
              </div>
              <p className="text-3xl font-bold mt-2 text-blue-900">{fmtRand(fin.arrCents)}</p>
              <p className="text-xs text-blue-700/70 mt-1">Annualised run-rate</p>
            </div>
            <div className="rounded-xl border bg-gradient-to-br from-purple-50 to-purple-100/50 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-purple-700 text-xs font-semibold uppercase tracking-wide">
                <DollarSign className="h-4 w-4" /> ARPU
              </div>
              <p className="text-3xl font-bold mt-2 text-purple-900">{fmtRand(fin.arpuCents)}</p>
              <p className="text-xs text-purple-700/70 mt-1">Avg revenue per user</p>
            </div>
            <div className="rounded-xl border bg-gradient-to-br from-amber-50 to-amber-100/50 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-amber-700 text-xs font-semibold uppercase tracking-wide">
                <Receipt className="h-4 w-4" /> Paid This Month
              </div>
              <p className="text-3xl font-bold mt-2 text-amber-900">{fmtRand(fin.paidThisMonthCents)}</p>
              <p className="text-xs text-amber-700/70 mt-1">{fin.paidThisMonthCount} invoices</p>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                <Clock className="h-4 w-4" /> Active Trials
              </div>
              <p className="text-2xl font-bold mt-2">{fin.activeTrials}</p>
              <p className="text-xs text-muted-foreground mt-1">{fin.expiredTrials} expired</p>
            </div>
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                <CheckCircle2 className="h-4 w-4" /> Trial → Paid
              </div>
              <p className="text-2xl font-bold mt-2">{fin.conversionPct}%</p>
              <p className="text-xs text-muted-foreground mt-1">{fin.convertedToActive} of {fin.totalTrialsEver} converted</p>
            </div>
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                <TrendingDown className="h-4 w-4" /> 30-day Churn
              </div>
              <p className={`text-2xl font-bold mt-2 ${fin.churnPct > 5 ? "text-red-600" : ""}`}>{fin.churnPct}%</p>
              <p className="text-xs text-muted-foreground mt-1">{fin.cancelled30Days} cancelled</p>
            </div>
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                <XCircle className="h-4 w-4" /> Past Due / Failed
              </div>
              <p className={`text-2xl font-bold mt-2 ${(fin.pastDue + fin.failedInvoices.count) > 0 ? "text-red-600" : ""}`}>
                {fin.pastDue + fin.failedInvoices.count}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {fmtRand(fin.failedInvoices.totalCents)} failed · {fmtRand(fin.pendingInvoices.totalCents)} pending
              </p>
            </div>
          </div>
        )}

        {fin && fin.revenueByMonth.length > 0 && (
          <div className="mt-4 rounded-xl border bg-card p-6 shadow-sm">
            <h4 className="text-sm font-bold font-heading mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-600" />
              Subscription revenue (last 6 months)
            </h4>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={fin.revenueByMonth.map(r => ({ month: r.month, Revenue: r.totalCents / 100 }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `R${v}`} />
                <Tooltip formatter={(v: number) => `R${v.toFixed(2)}`} />
                <Bar dataKey="Revenue" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {fin && fin.planDistribution.length > 0 && (
          <div className="mt-4 rounded-xl border bg-card p-6 shadow-sm">
            <h4 className="text-sm font-bold font-heading mb-3 flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-500" />
              Plan distribution
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {fin.planDistribution.map(p => (
                <div key={p.code} className="rounded-lg border p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{p.code}</p>
                    <p className="font-semibold">{p.name}</p>
                  </div>
                  <span className="text-2xl font-bold text-primary">{p.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-bold font-heading mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Platform Revenue Overview (Aggregated, Anonymised)
        </h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
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
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
            <BarChart3 className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">No revenue data yet</p>
            <p className="text-xs mt-1">Revenue will appear here once clients start logging income and expenses.</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface InvoiceTarget {
  id: string;
  name: string;
  email: string;
  planName: string | null;
  priceCents: number | null;
}

interface InvoiceItem {
  name: string;
  qty: number;
  unitPrice: number;
}

const INV_TEMPLATES = [
  { id: 1, name: "Classic", badgeBg: "bg-emerald-700", preview: (<svg viewBox="0 0 64 40" className="w-full h-full" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="40" fill="#fff"/><rect width="5" height="40" fill="#156C41"/><rect x="8" y="4" width="30" height="4" rx="1" fill="#156C41" opacity="0.9"/><rect x="8" y="10" width="20" height="2" rx="0.5" fill="#aaa"/><rect x="8" y="13" width="15" height="2" rx="0.5" fill="#aaa"/><rect x="8" y="18" width="54" height="1" fill="#156C41"/><rect x="8" y="22" width="54" height="5" rx="0.5" fill="#156C41"/><rect x="8" y="29" width="36" height="2" rx="0.5" fill="#e5e5e5"/><rect x="8" y="33" width="36" height="2" rx="0.5" fill="#e5e5e5"/><rect x="46" y="29" width="16" height="8" rx="1" fill="#156C41"/></svg>) },
  { id: 2, name: "Modern", badgeBg: "bg-blue-900", preview: (<svg viewBox="0 0 64 40" className="w-full h-full" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="40" fill="#fff"/><rect x="4" y="4" width="32" height="4" rx="1" fill="#173872" opacity="0.85"/><rect x="4" y="10" width="22" height="2" rx="0.5" fill="#aaa"/><rect x="4" y="13" width="16" height="2" rx="0.5" fill="#aaa"/><rect x="40" y="3" width="20" height="16" rx="1" fill="#173872"/><rect x="43" y="6" width="14" height="3" rx="0.5" fill="#fff" opacity="0.9"/><rect x="43" y="11" width="10" height="2" rx="0.5" fill="#fff" opacity="0.6"/><rect x="43" y="14" width="12" height="2" rx="0.5" fill="#fff" opacity="0.5"/><rect x="4" y="21" width="60" height="1.5" fill="#173872"/><rect x="4" y="25" width="24" height="8" rx="1" fill="#eef0f7"/><rect x="31" y="25" width="33" height="2" rx="0.5" fill="#e5e5e5"/><rect x="31" y="29" width="33" height="2" rx="0.5" fill="#e5e5e5"/><rect x="31" y="33" width="33" height="2" rx="0.5" fill="#e5e5e5"/></svg>) },
  { id: 3, name: "Bold", badgeBg: "bg-neutral-800", preview: (<svg viewBox="0 0 64 40" className="w-full h-full" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="40" fill="#fff"/><rect width="64" height="16" fill="#1e1e1e"/><rect y="16" width="64" height="3" fill="#D96508"/><rect x="4" y="4" width="22" height="4" rx="1" fill="#fff" opacity="0.9"/><rect x="4" y="9" width="14" height="2" rx="0.5" fill="#888"/><rect x="4" y="22" width="56" height="5" rx="0.5" fill="#1e1e1e"/><rect x="4" y="29" width="40" height="2" rx="0.5" fill="#e5e5e5"/><rect x="4" y="33" width="40" height="2" rx="0.5" fill="#e5e5e5"/><rect x="46" y="28" width="14" height="9" rx="1" fill="#D96508"/></svg>) },
  { id: 4, name: "Corporate", badgeBg: "bg-blue-600", preview: (<svg viewBox="0 0 64 40" className="w-full h-full" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="40" fill="#fff"/><rect width="64" height="14" fill="#1E59B8"/><rect x="4" y="3" width="24" height="4" rx="1" fill="#fff" opacity="0.9"/><rect x="4" y="9" width="16" height="2" rx="0.5" fill="#8baee0"/><rect x="4" y="17" width="27" height="11" rx="1" fill="#EBF1FB"/><rect x="4" y="17" width="27" height="3" fill="#1E59B8"/><rect x="6" y="22" width="18" height="2" rx="0.5" fill="#999"/><rect x="34" y="17" width="26" height="11" rx="1" fill="#EBF1FB"/><rect x="34" y="17" width="26" height="3" fill="#1E59B8"/><rect x="36" y="22" width="18" height="2" rx="0.5" fill="#999"/><rect x="4" y="31" width="56" height="4" rx="0.5" fill="#1E59B8"/></svg>) },
  { id: 5, name: "Elegant", badgeBg: "bg-red-800", preview: (<svg viewBox="0 0 64 40" className="w-full h-full" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="40" fill="#fff"/><rect width="64" height="3" fill="#841212"/><rect x="10" y="7" width="44" height="4" rx="1" fill="#841212" opacity="0.85"/><rect x="18" y="12" width="28" height="1" fill="#841212"/><rect x="16" y="17" width="32" height="3" rx="0.5" fill="#841212" opacity="0.7"/><rect x="4" y="22" width="20" height="2" rx="0.5" fill="#ddd"/><rect x="4" y="26" width="56" height="0.7" fill="#841212"/><rect x="4" y="28" width="40" height="2" rx="0.5" fill="#f5e8e8"/><rect x="4" y="32" width="40" height="2" rx="0.5" fill="#eee"/><rect x="46" y="28" width="14" height="8" rx="1" fill="none" stroke="#841212" strokeWidth="0.8"/></svg>) },
  { id: 6, name: "Vibrant", badgeBg: "bg-purple-700", preview: (<svg viewBox="0 0 64 40" className="w-full h-full" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="40" fill="#fff"/><rect width="64" height="18" fill="#6B21B0"/><rect x="24" y="0" width="40" height="18" fill="#7c2fc0"/><rect x="3" y="18" width="4" height="22" fill="#6B21B0"/><rect x="9" y="4" width="24" height="4" rx="1" fill="#fff" opacity="0.9"/><rect x="9" y="10" width="16" height="2" rx="0.5" fill="#c084fc"/><rect x="9" y="21" width="52" height="5" rx="0.5" fill="#6B21B0"/><rect x="9" y="29" width="36" height="2" rx="0.5" fill="#ead5ff"/><rect x="9" y="33" width="36" height="2" rx="0.5" fill="#ead5ff"/><rect x="47" y="29" width="14" height="8" rx="1" fill="#6B21B0"/></svg>) },
];

function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "trial" | "active" | "free" | "none" | "past-due">("all");
  const [planFilter, setPlanFilter] = useState<"all" | "starter" | "pro" | "premium">("all");
  const [tagFilter, setTagFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "business">("newest");

  // Notes & tags modal state
  const [notesTarget, setNotesTarget] = useState<Client | null>(null);
  const [draftNotes, setDraftNotes] = useState("");
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const navigate = useNavigate();

  const [invoiceTarget, setInvoiceTarget] = useState<InvoiceTarget | null>(null);
  const [invTemplate, setInvTemplate] = useState(1);
  const [invCustomerName, setInvCustomerName] = useState("");
  const [invCustomerEmail, setInvCustomerEmail] = useState("");
  const [invCustomerPhone, setInvCustomerPhone] = useState("");
  const [invCustomerAddress, setInvCustomerAddress] = useState("");
  const [invReference, setInvReference] = useState("");
  const [invPaymentTerms, setInvPaymentTerms] = useState("Due within 7 days");
  const [invNotes, setInvNotes] = useState("");
  const [invItems, setInvItems] = useState<InvoiceItem[]>([{ name: "", qty: 1, unitPrice: 0 }]);
  const [invVatEnabled, setInvVatEnabled] = useState(true);
  const [invSending, setInvSending] = useState(false);

  const loadClients = () => {
    fetch("/api/admin/clients", { credentials: "include" })
      .then((r) => r.json())
      .then(setClients)
      .catch(() => toast.error("Failed to load clients"));
  };

  useEffect(() => { loadClients(); }, []);

  const impersonateUser = async (id: string, name: string) => {
    if (!confirm(`Log in as ${name}? You'll be able to view and act as this user. Click "Return to Admin" to switch back.`)) return;
    const res = await fetch(`/api/admin/impersonate/${id}`, {
      method: "POST",
      credentials: "include",
    });
    if (res.ok) {
      toast.success(`Now logged in as ${name}`);
      navigate("/dashboard");
      window.location.reload();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to impersonate user");
    }
  };

  const toggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const res = await fetch(`/api/admin/clients/${id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      toast.success(`Role updated to ${newRole}`);
      loadClients();
    }
  };

  const grantTrial = async (id: string, name: string) => {
    if (!confirm(`Grant ${name} a 7-day Premium trial?`)) return;
    const res = await fetch(`/api/admin/clients/${id}/trial`, {
      method: "POST",
      credentials: "include",
    });
    if (res.ok) {
      toast.success(`7-day Premium trial granted to ${name}`);
      loadClients();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to grant trial");
    }
  };

  const grantSubscription = async (id: string, plan: "starter" | "pro" | "premium", name: string) => {
    const res = await fetch(`/api/admin/clients/${id}/subscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ plan }),
    });
    if (res.ok) {
      toast.success(`${plan.charAt(0).toUpperCase() + plan.slice(1)} subscription granted to ${name}`);
      loadClients();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to grant subscription");
    }
  };

  const toggleExempt = async (id: string, name: string, currentlyExempt: boolean) => {
    const action = currentlyExempt ? "remove the free-access exemption for" : "make free (no subscription needed) for";
    if (!confirm(`${currentlyExempt ? "Remove free access" : "Grant free access"} — ${action} ${name}?`)) return;
    const res = await fetch(`/api/admin/clients/${id}/exempt`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ exempt: !currentlyExempt }),
    });
    if (res.ok) {
      toast.success(currentlyExempt ? `${name} now requires a subscription` : `${name} now has free access`);
      loadClients();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to update exemption");
    }
  };

  const revokeSubscription = async (id: string, name: string) => {
    if (!confirm(`Revoke active subscription for ${name}?`)) return;
    const res = await fetch(`/api/admin/clients/${id}/subscription`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      toast.success(`Subscription revoked for ${name}`);
      loadClients();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to revoke subscription");
    }
  };

  const deleteClient = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/clients/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      toast.success("Client deleted");
      loadClients();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to delete");
    }
  };

  const openInvoiceModal = (client: Client) => {
    setInvoiceTarget({ id: client.id, name: client.full_name, email: client.email, planName: client.plan_name || null, priceCents: null });
    setInvTemplate(1);
    setInvCustomerName(client.full_name);
    setInvCustomerEmail(client.email);
    setInvCustomerPhone("");
    setInvCustomerAddress("");
    setInvReference("");
    setInvPaymentTerms("Due within 7 days");
    setInvNotes("");
    setInvItems([{
      name: client.plan_name ? `${client.plan_name} Subscription` : "",
      qty: 1,
      unitPrice: client.plan_price_cents ? client.plan_price_cents / 100 : 0,
    }]);
    setInvVatEnabled(true);
  };

  const updateInvItem = (i: number, field: keyof InvoiceItem, value: string | number) => {
    setInvItems(prev => prev.map((it, idx) => idx === i ? { ...it, [field]: value } : it));
  };

  const handleAdminCreateInvoice = async (sendEmail: boolean) => {
    if (!invoiceTarget) return;
    if (!invCustomerName.trim()) { toast.error("Customer name is required"); return; }
    if (invItems.some(it => !it.name.trim() || it.unitPrice <= 0)) { toast.error("Fill in all line items with a name and price"); return; }
    const subtotal = invItems.reduce((s, it) => s + it.qty * it.unitPrice, 0);
    const vatAmount = invVatEnabled ? subtotal * 0.15 : 0;
    const total = subtotal + vatAmount;
    setInvSending(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type: "invoice",
          template: invTemplate,
          customerName: invCustomerName,
          customerEmail: invCustomerEmail || null,
          customerPhone: invCustomerPhone || null,
          customerAddress: invCustomerAddress || null,
          reference: invReference || null,
          paymentTerms: invPaymentTerms || null,
          notes: invNotes || null,
          items: invItems,
          vatEnabled: invVatEnabled,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to create invoice"); return; }
      if (sendEmail && invCustomerEmail) {
        const emailRes = await fetch(`/api/invoices/${data.id}/email`, { method: "POST", credentials: "include" });
        const emailData = await emailRes.json();
        if (emailRes.ok) {
          toast.success(`Invoice ${data.invoice_number} created and emailed to ${invCustomerEmail}`);
        } else {
          toast.success(`Invoice ${data.invoice_number} created`);
          toast.error(emailData.error || "Email failed — check your SMTP settings");
        }
      } else {
        toast.success(`Invoice ${data.invoice_number} created`);
      }
      setInvoiceTarget(null);
    } catch {
      toast.error("Network error creating invoice");
    } finally {
      setInvSending(false);
    }
  };

  const openNotesModal = (client: Client) => {
    setNotesTarget(client);
    setDraftNotes(client.admin_notes || "");
    setDraftTags(Array.isArray(client.admin_tags) ? client.admin_tags : []);
    setTagInput("");
  };

  const addTagFromInput = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (draftTags.length >= 12) { toast.error("Up to 12 tags per client"); return; }
    if (draftTags.map(x => x.toLowerCase()).includes(t.toLowerCase())) { setTagInput(""); return; }
    setDraftTags([...draftTags, t]);
    setTagInput("");
  };
  const removeDraftTag = (t: string) => setDraftTags(draftTags.filter(x => x !== t));

  const saveNotesAndTags = async () => {
    if (!notesTarget) return;
    setSavingNotes(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch(`/api/admin/clients/${notesTarget.id}/notes`, {
          method: "PATCH", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: draftNotes }),
        }),
        fetch(`/api/admin/clients/${notesTarget.id}/tags`, {
          method: "PATCH", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tags: draftTags }),
        }),
      ]);
      if (!r1.ok || !r2.ok) { toast.error("Failed to save"); return; }
      toast.success("Notes & tags saved");
      setNotesTarget(null);
      loadClients();
    } finally {
      setSavingNotes(false);
    }
  };

  // Aggregate tags across all clients for the tag filter bar
  const allTags = Array.from(new Set(clients.flatMap(c => Array.isArray(c.admin_tags) ? c.admin_tags : []))).sort();

  const matchesStatus = (c: Client) => {
    const trialActive = c.subscription_status === "TRIAL" &&
      (!c.trial_end_at || new Date(c.trial_end_at).getTime() > Date.now());
    if (statusFilter === "trial") return trialActive;
    if (statusFilter === "active") return c.subscription_status === "ACTIVE";
    if (statusFilter === "free") return !!c.subscription_exempt;
    if (statusFilter === "none") return c.role !== "admin" && !c.subscription_exempt && !trialActive && c.subscription_status !== "ACTIVE";
    if (statusFilter === "past-due") return c.subscription_status === "PAST_DUE";
    return true;
  };

  const filtered = clients
    .filter(c => matchesStatus(c))
    .filter(c => planFilter === "all" || c.plan_code === planFilter)
    .filter(c => !tagFilter || (Array.isArray(c.admin_tags) && c.admin_tags.includes(tagFilter)))
    .filter(c => {
      const q = searchTerm.toLowerCase();
      if (!q) return true;
      return c.full_name.toLowerCase().includes(q)
        || c.email.toLowerCase().includes(q)
        || (c.business_name || "").toLowerCase().includes(q)
        || (c.industry_sector || "").toLowerCase().includes(q)
        || (Array.isArray(c.admin_tags) && c.admin_tags.some(t => t.toLowerCase().includes(q)))
        || (c.admin_notes || "").toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === "name") return a.full_name.localeCompare(b.full_name);
      return (a.business_name || "").localeCompare(b.business_name || "");
    });

  const exportCsv = () => {
    const header = ["Name", "Email", "Business", "Industry", "Plan", "Status", "Tags", "Joined"];
    const rows = filtered.map(c => [
      c.full_name, c.email, c.business_name || "", c.industry_sector || "",
      c.plan_name || "", c.subscription_status || (c.subscription_exempt ? "FREE_ACCESS" : "NONE"),
      (c.admin_tags || []).join(" | "),
      new Date(c.created_at).toLocaleDateString("en-ZA"),
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clients-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold font-heading">Clients</h2>
          <p className="text-muted-foreground">{clients.length} registered · showing {filtered.length}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1">
            <FileText className="h-4 w-4" /> Export CSV
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search name, email, business, tag, note…" className="pl-9 w-72" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Status
          </span>
          {([
            { v: "all", label: "All" },
            { v: "active", label: "Active" },
            { v: "trial", label: "Trial" },
            { v: "past-due", label: "Past Due" },
            { v: "free", label: "Free Access" },
            { v: "none", label: "No Subscription" },
          ] as const).map(opt => (
            <button
              key={opt.v}
              onClick={() => setStatusFilter(opt.v)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                statusFilter === opt.v
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted border-input"
              }`}
            >{opt.label}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Plan</span>
          {([
            { v: "all", label: "All plans" },
            { v: "starter", label: "Enterprize" },
            { v: "pro", label: "Enterprize Plus" },
            { v: "premium", label: "Enterprize Premium" },
          ] as const).map(opt => (
            <button
              key={opt.v}
              onClick={() => setPlanFilter(opt.v)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                planFilter === opt.v
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-background hover:bg-muted border-input"
              }`}
            >{opt.label}</button>
          ))}
          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowUpDown className="h-3.5 w-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-background border rounded-md px-2 py-1 text-xs"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name">Name A→Z</option>
              <option value="business">Business A→Z</option>
            </select>
          </span>
        </div>
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <TagIcon className="h-3.5 w-3.5" /> Tag
            </span>
            <button
              onClick={() => setTagFilter("")}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                !tagFilter ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted border-input"
              }`}
            >Any</button>
            {allTags.map(t => (
              <button
                key={t}
                onClick={() => setTagFilter(t === tagFilter ? "" : t)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  tagFilter === t ? "ring-2 ring-primary " : ""
                } ${tagClass(t)}`}
              >{t}</button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-4 font-semibold">Client</th>
              <th className="text-left p-4 font-semibold">Business</th>
              <th className="text-left p-4 font-semibold">Industry</th>
              <th className="text-left p-4 font-semibold">Tags</th>
              <th className="text-left p-4 font-semibold">Sites</th>
              <th className="text-left p-4 font-semibold">Role</th>
              <th className="text-left p-4 font-semibold">Subscription</th>
              <th className="text-left p-4 font-semibold">Joined</th>
              <th className="text-right p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((client) => (
              <tr key={client.id} className="border-b hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <div className="font-medium">{client.full_name}</div>
                  <div className="text-xs text-muted-foreground">{client.email}</div>
                </td>
                <td className="p-4">{client.business_name || <span className="text-muted-foreground italic">Not set</span>}</td>
                <td className="p-4">
                  {client.industry_sector ? (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{client.industry_sector}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="p-4 max-w-[180px]">
                  <div className="flex flex-wrap gap-1">
                    {(client.admin_tags || []).slice(0, 4).map((t) => (
                      <span key={t} className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${tagClass(t)}`}>{t}</span>
                    ))}
                    {(client.admin_tags || []).length > 4 && (
                      <span className="text-[10px] text-muted-foreground">+{(client.admin_tags || []).length - 4}</span>
                    )}
                    {(!client.admin_tags || client.admin_tags.length === 0) && client.admin_notes && (
                      <span className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                        <StickyNote className="h-3 w-3" /> Has notes
                      </span>
                    )}
                    {(!client.admin_tags || client.admin_tags.length === 0) && !client.admin_notes && (
                      <span className="text-[10px] text-muted-foreground">-</span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className="rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-bold">{client.website_count}</span>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${client.role === "admin" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
                    {client.role === "admin" ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                    {client.role}
                  </span>
                </td>
                <td className="p-4">
                  {client.role === "admin" ? (
                    <span className="text-xs text-muted-foreground italic">Admin</span>
                  ) : client.subscription_exempt ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-purple-100 text-purple-800">
                        <Star className="h-3 w-3" />
                        Free Access
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px] text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => toggleExempt(client.id, client.full_name, true)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : client.subscription_status === "TRIAL" ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-800">
                        <Clock className="h-3 w-3" />
                        Trial · {client.trial_end_at ? Math.max(0, Math.ceil((new Date(client.trial_end_at).getTime() - Date.now()) / 86400000)) : "?"} days left
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px] text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => revokeSubscription(client.id, client.full_name)}
                      >
                        Revoke
                      </Button>
                    </div>
                  ) : client.subscription_status === "ACTIVE" ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-green-100 text-green-800">
                        <BadgeCheck className="h-3 w-3" />
                        {client.plan_name || client.plan_code || "Active"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px] text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => revokeSubscription(client.id, client.full_name)}
                      >
                        Revoke
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-[10px] gap-1 border-amber-300 text-amber-700 hover:bg-amber-50"
                        onClick={() => grantTrial(client.id, client.full_name)}
                      >
                        <Clock className="h-3 w-3" /> 7-day Trial
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-[10px] gap-1 border-green-300 text-green-700 hover:bg-green-50"
                        onClick={() => grantSubscription(client.id, "starter", client.full_name)}
                      >
                        <CreditCard className="h-3 w-3" /> Enterprize
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-[10px] gap-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                        onClick={() => grantSubscription(client.id, "pro", client.full_name)}
                      >
                        <BanknoteIcon className="h-3 w-3" /> Enterprize Plus
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-[10px] gap-1 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                        onClick={() => grantSubscription(client.id, "premium", client.full_name)}
                      >
                        <Crown className="h-3 w-3" /> Enterprize Premium
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-[10px] gap-1 border-purple-300 text-purple-700 hover:bg-purple-50"
                        onClick={() => toggleExempt(client.id, client.full_name, false)}
                        title="Grant free access — no subscription required"
                      >
                        <Star className="h-3 w-3" /> Free Access
                      </Button>
                    </div>
                  )}
                </td>
                <td className="p-4 text-muted-foreground text-xs">{new Date(client.created_at).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50" title="Notes & tags" onClick={() => openNotesModal(client)}>
                      <StickyNote className="h-4 w-4" />
                    </Button>
                    {client.role !== "admin" && (
                      <>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50" title="Login as user" onClick={() => impersonateUser(client.id, client.full_name)}>
                          <LogIn className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" title="Create invoice" onClick={() => openInvoiceModal(client)}>
                          <Receipt className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Toggle role" onClick={() => toggleRole(client.id, client.role)}>
                      <Shield className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" title="Delete" onClick={() => deleteClient(client.id, client.full_name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-muted-foreground">No clients found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!invoiceTarget} onOpenChange={(open) => { if (!open) setInvoiceTarget(null); }}>
        <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-emerald-600" />
              Create Invoice for {invoiceTarget?.name}
            </DialogTitle>
            <DialogDescription>
              Build a professional invoice and optionally email the PDF directly to {invoiceTarget?.email}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Template picker */}
            <div>
              <Label className="text-xs mb-2 block">Template</Label>
              <div className="flex gap-3 flex-wrap">
                {INV_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setInvTemplate(tpl.id)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${invTemplate === tpl.id ? "border-primary shadow-md scale-105" : "border-transparent hover:border-muted-foreground/30"}`}
                  >
                    <div className="w-16 h-10 rounded overflow-hidden border border-gray-100 shadow-sm">{tpl.preview}</div>
                    <span className="text-xs font-medium">{tpl.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Customer fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Customer Name *</Label>
                <Input value={invCustomerName} onChange={(e) => setInvCustomerName(e.target.value)} className="mt-1" placeholder="Company or person name" />
              </div>
              <div>
                <Label className="text-xs">Customer Email</Label>
                <Input value={invCustomerEmail} onChange={(e) => setInvCustomerEmail(e.target.value)} className="mt-1" placeholder="email@example.com" />
              </div>
              <div>
                <Label className="text-xs">Customer Phone</Label>
                <Input value={invCustomerPhone} onChange={(e) => setInvCustomerPhone(e.target.value)} className="mt-1" placeholder="Optional" />
              </div>
              <div>
                <Label className="text-xs">Customer Address</Label>
                <Input value={invCustomerAddress} onChange={(e) => setInvCustomerAddress(e.target.value)} className="mt-1" placeholder="Optional" />
              </div>
              <div>
                <Label className="text-xs">Reference / PO Number</Label>
                <Input value={invReference} onChange={(e) => setInvReference(e.target.value)} className="mt-1" placeholder="e.g. PO-2024-001" />
              </div>
              <div>
                <Label className="text-xs">Payment Terms</Label>
                <Input value={invPaymentTerms} onChange={(e) => setInvPaymentTerms(e.target.value)} className="mt-1" placeholder="e.g. Due within 7 days" />
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground px-1">
                <div className="col-span-5">Item</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Unit Price (R)</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-1" />
              </div>
              {invItems.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <Input value={item.name} onChange={(e) => updateInvItem(i, "name", e.target.value)} className="h-9 text-sm" placeholder="Item description" />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" min="1" value={item.qty} onChange={(e) => updateInvItem(i, "qty", parseInt(e.target.value) || 1)} className="h-9 text-sm" />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" step="0.01" min="0" value={item.unitPrice || ""} onChange={(e) => updateInvItem(i, "unitPrice", parseFloat(e.target.value) || 0)} className="h-9 text-sm" placeholder="0.00" />
                  </div>
                  <div className="col-span-2 text-right font-semibold text-sm">R{(item.qty * item.unitPrice).toFixed(2)}</div>
                  <div className="col-span-1 text-right">
                    {invItems.length > 1 && (
                      <Button variant="ghost" size="icon" type="button" className="h-7 w-7 text-red-500" onClick={() => setInvItems(prev => prev.filter((_, idx) => idx !== i))}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" type="button" onClick={() => setInvItems(prev => [...prev, { name: "", qty: 1, unitPrice: 0 }])}>
                <Plus className="h-3 w-3 mr-1" /> Add Item
              </Button>
            </div>

            {/* Notes */}
            <div>
              <Label className="text-xs">Notes / Additional Information</Label>
              <Textarea value={invNotes} onChange={(e) => setInvNotes(e.target.value)} rows={2} className="mt-1 text-sm" placeholder="e.g. payment instructions, thank-you message..." />
            </div>

            {/* VAT + totals */}
            <div className="border-t pt-4 flex flex-col items-end gap-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer mb-2 self-start">
                <input type="checkbox" checked={invVatEnabled} onChange={(e) => setInvVatEnabled(e.target.checked)} className="rounded" />
                <span>Include VAT (15%)</span>
              </label>
              {(() => {
                const sub = invItems.reduce((s, it) => s + it.qty * it.unitPrice, 0);
                const vat = invVatEnabled ? sub * 0.15 : 0;
                return (
                  <div className="w-full max-w-xs space-y-1 text-sm">
                    <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>R{sub.toFixed(2)}</span></div>
                    {invVatEnabled && <div className="flex justify-between text-muted-foreground"><span>VAT (15%)</span><span>R{vat.toFixed(2)}</span></div>}
                    <div className="flex justify-between font-bold text-base border-t pt-1"><span>{invVatEnabled ? "Total (incl. VAT)" : "Total"}</span><span className="text-primary">R{(sub + vat).toFixed(2)}</span></div>
                  </div>
                );
              })()}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
            <Button variant="outline" onClick={() => setInvoiceTarget(null)} disabled={invSending}>Cancel</Button>
            <Button variant="outline" onClick={() => handleAdminCreateInvoice(false)} disabled={invSending}>
              {invSending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Receipt className="h-4 w-4 mr-2" />}
              Save Invoice
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleAdminCreateInvoice(true)} disabled={invSending || !invCustomerEmail}>
              {invSending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
              Save & Email PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes & Tags modal */}
      <Dialog open={!!notesTarget} onOpenChange={(open) => { if (!open) setNotesTarget(null); }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-amber-600" />
              Notes & Tags — {notesTarget?.full_name}
            </DialogTitle>
            <DialogDescription>
              Internal admin annotations. Visible only to admins; never shown to the client.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div>
              <Label className="text-xs">Tags <span className="text-muted-foreground">(up to 12)</span></Label>
              <div className="mt-2 flex items-center gap-2 flex-wrap min-h-[40px] p-2 rounded-md border bg-background">
                {draftTags.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">No tags yet</span>
                )}
                {draftTags.map(t => (
                  <span key={t} className={`px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 ${tagClass(t)}`}>
                    {t}
                    <button onClick={() => removeDraftTag(t)} className="hover:bg-black/10 rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTagFromInput(); } }}
                  placeholder="Add a tag (e.g. vip, at-risk, high-value)…"
                  className="text-sm"
                />
                <Button type="button" onClick={addTagFromInput} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {["vip", "at-risk", "high-value", "needs-onboarding", "prospect", "followup", "partner", "enterprise"]
                  .filter(s => !draftTags.includes(s))
                  .map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => { if (draftTags.length < 12) setDraftTags([...draftTags, s]); }}
                      className={`px-2 py-0.5 rounded-full text-[10px] border opacity-60 hover:opacity-100 transition-opacity ${tagClass(s)}`}
                    >+ {s}</button>
                  ))
                }
              </div>
            </div>

            <div>
              <Label className="text-xs">Notes</Label>
              <Textarea
                value={draftNotes}
                onChange={(e) => setDraftNotes(e.target.value)}
                placeholder="Anything the team should know about this client — context, history, follow-ups, escalations…"
                rows={8}
                className="mt-2 text-sm"
              />
              <p className="text-[10px] text-muted-foreground mt-1">{draftNotes.length} characters</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesTarget(null)}>Cancel</Button>
            <Button onClick={saveNotesAndTags} disabled={savingNotes} className="bg-amber-600 hover:bg-amber-700 text-white">
              {savingNotes ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ──────────────────────── Audit Log page ────────────────────────
const AUDIT_ACTION_LABELS: Record<string, string> = {
  "subscription.trial_granted": "Trial granted",
  "subscription.granted": "Subscription granted",
  "subscription.revoked": "Subscription revoked",
  "client.role_changed": "Role changed",
  "client.free_access_granted": "Free access granted",
  "client.free_access_removed": "Free access removed",
  "client.impersonated": "Impersonated user",
  "client.deleted": "Client deleted",
  "client.invoice_created": "Invoice created",
  "client.notes.updated": "Notes updated",
  "client.tags.updated": "Tags updated",
};

const AUDIT_ACTION_COLOR: Record<string, string> = {
  "subscription.trial_granted": "bg-amber-100 text-amber-800",
  "subscription.granted": "bg-green-100 text-green-800",
  "subscription.revoked": "bg-red-100 text-red-800",
  "client.role_changed": "bg-purple-100 text-purple-800",
  "client.free_access_granted": "bg-purple-100 text-purple-800",
  "client.free_access_removed": "bg-gray-100 text-gray-800",
  "client.impersonated": "bg-blue-100 text-blue-800",
  "client.deleted": "bg-red-100 text-red-800",
  "client.invoice_created": "bg-emerald-100 text-emerald-800",
  "client.notes.updated": "bg-amber-50 text-amber-700",
  "client.tags.updated": "bg-indigo-50 text-indigo-700",
};

function formatAuditDetails(e: AuditEntry): string {
  if (!e.details) return "";
  const d = e.details;
  if (e.action === "subscription.granted") return `Plan: ${d.plan}`;
  if (e.action === "subscription.trial_granted") return `Trial ends: ${d.trialEndsAt || ""}`;
  if (e.action === "client.role_changed") return `${d.from || "?"} → ${d.to || "?"}`;
  if (e.action === "client.invoice_created") return `${d.invoiceNumber || ""} · R${((d.amountCents || 0) / 100).toFixed(2)}${d.emailSent ? " · emailed" : ""}`;
  if (e.action === "client.tags.updated") return Array.isArray(d.tags) ? d.tags.join(", ") : "";
  if (e.action === "client.notes.updated") return `${d.length || 0} chars`;
  if (e.action === "client.deleted") return d.email || "";
  return Object.entries(d).map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`).join(" · ");
}

function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [actions, setActions] = useState<Array<{ action: string; count: number }>>([]);
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    params.set("offset", String(offset));
    if (search) params.set("q", search);
    if (actionFilter) params.set("action", actionFilter);
    fetch(`/api/admin/audit-log?${params.toString()}`, { credentials: "include" })
      .then(r => r.json())
      .then((d) => {
        setEntries(d.entries || []);
        setTotal(d.total || 0);
      })
      .catch(() => toast.error("Failed to load audit log"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch("/api/admin/audit-log/actions", { credentials: "include" })
      .then(r => r.json()).then(setActions).catch(() => {});
  }, []);

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [offset, actionFilter]);

  const onSearch = (e: React.FormEvent) => { e.preventDefault(); setOffset(0); load(); };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Audit Log
          </h2>
          <p className="text-muted-foreground">{total.toLocaleString()} admin actions recorded</p>
        </div>
        <form onSubmit={onSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search admin, target, action…"
              className="pl-9 w-72"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" variant="outline" size="sm">Search</Button>
        </form>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Action
          </span>
          <button
            onClick={() => { setActionFilter(""); setOffset(0); }}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              !actionFilter ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted border-input"
            }`}
          >All ({actions.reduce((s, a) => s + a.count, 0)})</button>
          {actions.map(a => (
            <button
              key={a.action}
              onClick={() => { setActionFilter(a.action); setOffset(0); }}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                actionFilter === a.action ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted border-input"
              }`}
            >{AUDIT_ACTION_LABELS[a.action] || a.action} ({a.count})</button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-4 font-semibold">When</th>
              <th className="text-left p-4 font-semibold">Admin</th>
              <th className="text-left p-4 font-semibold">Action</th>
              <th className="text-left p-4 font-semibold">Target</th>
              <th className="text-left p-4 font-semibold">Details</th>
              <th className="text-left p-4 font-semibold">IP</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin inline mr-2" /> Loading…
              </td></tr>
            )}
            {!loading && entries.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No audit entries match your filters.
              </td></tr>
            )}
            {!loading && entries.map(e => (
              <tr key={e.id} className="border-b hover:bg-muted/30">
                <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(e.created_at).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}
                </td>
                <td className="p-4">
                  <div className="font-medium text-sm">{e.admin_name || "—"}</div>
                  <div className="text-[10px] text-muted-foreground">{e.admin_email}</div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${AUDIT_ACTION_COLOR[e.action] || "bg-gray-100 text-gray-800"}`}>
                    {AUDIT_ACTION_LABELS[e.action] || e.action}
                  </span>
                </td>
                <td className="p-4">
                  <div className="text-sm">{e.target_label || <span className="text-muted-foreground">—</span>}</div>
                  {e.target_id && <div className="text-[10px] text-muted-foreground font-mono">{e.target_id.slice(0, 8)}…</div>}
                </td>
                <td className="p-4 text-xs text-muted-foreground max-w-md truncate" title={formatAuditDetails(e)}>
                  {formatAuditDetails(e)}
                </td>
                <td className="p-4 text-[10px] font-mono text-muted-foreground">{e.ip_address || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Showing {entries.length === 0 ? 0 : offset + 1}–{offset + entries.length} of {total.toLocaleString()}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}>
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <span className="text-xs text-muted-foreground">Page {currentPage} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={offset + limit >= total} onClick={() => setOffset(offset + limit)}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

const CATEGORIES = [
  "Construction", "IT & Technology", "Consulting", "Catering & Events",
  "Transport & Logistics", "Cleaning & Maintenance", "Marketing & Media",
  "Agriculture", "Manufacturing", "Education & Training", "Health & Wellness", "Other"
];

function formatCurrency(cents: number) {
  return `R ${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

interface TenderForm {
  title: string;
  description: string;
  category: string;
  budget_min: string;
  budget_max: string;
  location: string;
  deadline: string;
  requirements: string;
  status: string;
}

const emptyForm: TenderForm = { title: "", description: "", category: "", budget_min: "", budget_max: "", location: "", deadline: "", requirements: "", status: "OPEN" };

function AdminTenders() {
  const [tenders, setTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<TenderForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [viewApps, setViewApps] = useState<number | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);

  const fetchTenders = async () => {
    try {
      const res = await fetch("/api/tenders/admin/all", { credentials: "include" });
      const data = await res.json();
      setTenders(data.tenders || []);
    } catch { toast.error("Failed to load tenders"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTenders(); }, []);

  const fetchApplications = async (tenderId: number) => {
    setAppsLoading(true);
    setViewApps(tenderId);
    try {
      const res = await fetch(`/api/tenders/admin/${tenderId}/applications`, { credentials: "include" });
      const data = await res.json();
      setApplications(data.applications || []);
    } catch { toast.error("Failed to load applications"); }
    finally { setAppsLoading(false); }
  };

  const updateAppStatus = async (appId: number, status: string) => {
    try {
      const res = await fetch(`/api/tenders/admin/applications/${appId}/status`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setApplications(applications.map(a => a.id === appId ? { ...a, status } : a));
      toast.success(`Application ${status.toLowerCase()}`);
    } catch { toast.error("Failed to update status"); }
  };

  const openEdit = (tender: any) => {
    setEditing(tender.id);
    setForm({
      title: tender.title || "",
      description: tender.description || "",
      category: tender.category || "",
      budget_min: tender.budget_min ? String(tender.budget_min / 100) : "",
      budget_max: tender.budget_max ? String(tender.budget_max / 100) : "",
      location: tender.location || "",
      deadline: tender.deadline ? tender.deadline.split("T")[0] : "",
      requirements: tender.requirements || "",
      status: tender.status || "OPEN",
    });
    setShowForm(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        budget_min: form.budget_min ? Math.round(parseFloat(form.budget_min) * 100) : null,
        budget_max: form.budget_max ? Math.round(parseFloat(form.budget_max) * 100) : null,
      };
      const url = editing ? `/api/tenders/admin/${editing}` : "/api/tenders/admin";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success(editing ? "Tender updated" : "Tender created");
      setShowForm(false);
      fetchTenders();
    } catch { toast.error("Failed to save tender"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this tender and all its applications?")) return;
    try {
      const res = await fetch(`/api/tenders/admin/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      toast.success("Tender deleted");
      fetchTenders();
    } catch { toast.error("Failed to delete tender"); }
  };

  const appStatusColor = (s: string) => {
    switch (s) {
      case "PENDING": return "bg-yellow-100 text-yellow-700";
      case "SHORTLISTED": return "bg-blue-100 text-blue-700";
      case "ACCEPTED": return "bg-green-100 text-green-700";
      case "REJECTED": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (viewApps !== null) {
    const tender = tenders.find(t => t.id === viewApps);
    return (
      <div className="p-6">
        <button onClick={() => setViewApps(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Tenders
        </button>
        <h3 className="text-xl font-bold font-heading mb-1">Applications for: {tender?.title}</h3>
        <p className="text-sm text-muted-foreground mb-6">{applications.length} application{applications.length !== 1 ? "s" : ""}</p>

        {appsLoading ? <p className="text-muted-foreground">Loading...</p> : applications.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No applications received yet.</p>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="border rounded-xl p-5 bg-card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{app.full_name}</h4>
                    <p className="text-sm text-muted-foreground">{app.email}</p>
                    {app.business_name && <p className="text-sm text-muted-foreground">{app.business_name} {app.industry_sector ? `• ${app.industry_sector}` : ""}</p>}
                    {app.phone && <p className="text-sm text-muted-foreground">{app.phone}</p>}
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${appStatusColor(app.status)}`}>{app.status}</span>
                </div>
                {app.proposed_amount && <p className="text-sm mb-2"><strong>Proposed:</strong> {formatCurrency(app.proposed_amount)}</p>}
                {app.cover_letter && (
                  <div className="bg-muted/50 rounded-lg p-3 mb-3">
                    <p className="text-sm whitespace-pre-wrap">{app.cover_letter}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => updateAppStatus(app.id, "SHORTLISTED")} disabled={app.status === "SHORTLISTED"}>
                    <Star className="h-3.5 w-3.5 mr-1" /> Shortlist
                  </Button>
                  <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => updateAppStatus(app.id, "ACCEPTED")} disabled={app.status === "ACCEPTED"}>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Accept
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => updateAppStatus(app.id, "REJECTED")} disabled={app.status === "REJECTED"}>
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Applied {formatDate(app.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <button onClick={() => setShowForm(false)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Tenders
        </button>
        <h3 className="text-xl font-bold font-heading mb-6">{editing ? "Edit Tender" : "Create New Tender"}</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Title *</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Office Building Renovation" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Description</label>
            <textarea className="w-full min-h-[120px] rounded-lg border border-input bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the project scope and objectives..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Min Budget (ZAR)</label>
              <Input type="number" value={form.budget_min} onChange={(e) => setForm({ ...form, budget_min: e.target.value })} placeholder="e.g. 50000" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Max Budget (ZAR)</label>
              <Input type="number" value={form.budget_max} onChange={(e) => setForm({ ...form, budget_max: e.target.value })} placeholder="e.g. 150000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Location</label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Johannesburg, Gauteng" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Deadline</label>
              <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Requirements</label>
            <textarea className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} placeholder="List qualifications, certifications, or experience needed..." />
          </div>
          {editing && (
            <div>
              <label className="text-sm font-medium block mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
                <option value="AWARDED">Awarded</option>
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editing ? "Update Tender" : "Create Tender"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold font-heading">Manage Tenders</h3>
          <p className="text-sm text-muted-foreground mt-1">Create and manage business tenders for platform users</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" /> New Tender
        </Button>
      </div>

      {loading ? <p className="text-muted-foreground">Loading...</p> : tenders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No tenders yet</p>
          <p className="text-sm mt-1">Create your first tender to get started.</p>
          <Button className="mt-4" onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Create Tender</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {tenders.map((tender) => (
            <div key={tender.id} className="border rounded-xl p-5 bg-card">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-lg">{tender.title}</h4>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tender.status === "OPEN" ? "bg-emerald-100 text-emerald-700" : tender.status === "CLOSED" ? "bg-gray-100 text-gray-600" : "bg-amber-100 text-amber-700"}`}>
                      {tender.status}
                    </span>
                  </div>
                  {tender.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{tender.description}</p>}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    {tender.category && <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{tender.category}</span>}
                    {tender.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{tender.location}</span>}
                    {tender.deadline && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(tender.deadline)}</span>}
                    {(tender.budget_min || tender.budget_max) && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        {tender.budget_min && tender.budget_max
                          ? `${formatCurrency(tender.budget_min)} - ${formatCurrency(tender.budget_max)}`
                          : tender.budget_max ? `Up to ${formatCurrency(tender.budget_max)}` : `From ${formatCurrency(tender.budget_min)}`
                        }
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                <Button size="sm" variant="outline" onClick={() => fetchApplications(tender.id)}>
                  <Eye className="h-3.5 w-3.5 mr-1" /> {tender.application_count} Application{tender.application_count !== 1 ? "s" : ""}
                </Button>
                <Button size="sm" variant="outline" onClick={() => openEdit(tender)}>
                  <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDelete(tender.id)}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WebsiteList() {
  const [sites, setSites] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/websites", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => { setSites(data); setLoading(false); })
      .catch(() => { toast.error("Failed to load websites"); setLoading(false); });
  }, []);

  const filtered = sites.filter((s) =>
    (s.slug || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.business_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const siteUrl = (slug: string) => `${window.location.origin}/site/${slug}`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading">Websites</h2>
          <p className="text-muted-foreground">{sites.length} site{sites.length !== 1 ? "s" : ""} across all businesses</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search sites..." className="pl-9 w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-4 font-semibold">Business</th>
              <th className="text-left p-4 font-semibold">Owner</th>
              <th className="text-left p-4 font-semibold">Status</th>
              <th className="text-left p-4 font-semibold">Website URL</th>
              <th className="text-left p-4 font-semibold">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
            )}
            {!loading && filtered.map((site) => (
              <tr key={site.id} className="border-b hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <div className="font-medium">{site.business_name || site.trading_name || <span className="italic text-muted-foreground">Unnamed</span>}</div>
                  <div className="text-xs text-muted-foreground font-mono">slug: {site.slug}</div>
                </td>
                <td className="p-4">
                  <div>{site.full_name}</div>
                  <div className="text-xs text-muted-foreground">{site.email}</div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                    site.status === "published"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${site.status === "published" ? "bg-emerald-500" : "bg-gray-400"}`} />
                    {site.status === "published" ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="p-4">
                  {site.status === "published" ? (
                    <a
                      href={siteUrl(site.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-primary hover:underline font-mono text-xs"
                    >
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      {siteUrl(site.slug)}
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-xs italic">Not published</span>
                  )}
                </td>
                <td className="p-4 text-muted-foreground text-xs">
                  {new Date(site.updated_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No websites found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Partner / Reseller Admin Panel ───────────────────────────────────────────

interface ResellerAdmin {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  reseller_code: string;
  status: "pending" | "active" | "suspended";
  rank_key: string;
  package_tier: string | null;
  package_paid_at: string | null;
  total_clients: number;
  total_earnings: number;
  created_at: string;
  approved_at: string | null;
}

interface PartnerStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  pkg_affiliate: number;
  pkg_reseller: number;
  pkg_master: number;
  pkg_none: number;
  commissions_total_cents: number;
  commissions_paid_cents: number;
  commissions_pending_cents: number;
  package_revenue_cents: number;
}

const RANK_LABELS: Record<string, string> = {
  starter: "Starter", builder: "Builder", leader: "Leader",
  manager: "Manager", director: "Director", executive: "Executive", diamond_elite: "Diamond Elite",
};

const PKG_LABELS: Record<string, { label: string; color: string }> = {
  affiliate: { label: "Affiliate",       color: "text-gray-500 bg-gray-100" },
  reseller:  { label: "Reseller",        color: "text-green-700 bg-green-100" },
  master:    { label: "Master Reseller", color: "text-yellow-700 bg-yellow-100" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active:    { label: "Active",    color: "text-green-700 bg-green-100" },
  pending:   { label: "Pending",   color: "text-yellow-700 bg-yellow-100" },
  suspended: { label: "Suspended", color: "text-red-700 bg-red-100" },
};

function fmt(cents: number) {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function AdminPartners() {
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [resellers, setResellers] = useState<ResellerAdmin[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandData, setExpandData] = useState<Record<string, { clients: any[]; commissions: any[] }>>({});
  const [loadingExpand, setLoadingExpand] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadAll = () => {
    fetch("/api/reseller/admin/stats", { credentials: "include" })
      .then(r => r.json()).then(setStats).catch(() => {});
    fetch("/api/reseller/admin/all", { credentials: "include" })
      .then(r => r.json()).then(d => setResellers(d.resellers || [])).catch(() => {});
  };

  useEffect(() => { loadAll(); }, []);

  async function toggleExpand(r: ResellerAdmin) {
    if (expandedId === r.id) { setExpandedId(null); return; }
    setExpandedId(r.id);
    if (expandData[r.id]) return;
    setLoadingExpand(r.id);
    const [cRes, comRes] = await Promise.all([
      fetch(`/api/reseller/admin/${r.id}/clients`, { credentials: "include" }).then(x => x.json()),
      fetch(`/api/reseller/admin/${r.id}/commissions`, { credentials: "include" }).then(x => x.json()),
    ]);
    setExpandData(prev => ({ ...prev, [r.id]: { clients: cRes.clients || [], commissions: comRes.commissions || [] } }));
    setLoadingExpand(null);
  }

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    await fetch(`/api/reseller/admin/${id}/status`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadAll();
    setUpdatingId(null);
    toast.success(`Partner ${status}`);
  }

  async function markCommissionPaid(commId: string, resellerId: string) {
    await fetch(`/api/reseller/admin/commission/${commId}/pay`, { method: "PATCH", credentials: "include" });
    const comRes = await fetch(`/api/reseller/admin/${resellerId}/commissions`, { credentials: "include" }).then(x => x.json());
    setExpandData(prev => ({ ...prev, [resellerId]: { ...prev[resellerId], commissions: comRes.commissions || [] } }));
    loadAll();
    toast.success("Commission marked as paid");
  }

  const filtered = resellers.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.full_name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.reseller_code.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading">Partner Programme</h2>
        <p className="text-muted-foreground text-sm">Track and manage all reseller partners.</p>
      </div>

      {/* Stat cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Partners",      value: stats.total,               icon: Handshake,   color: "bg-blue-500/10 text-blue-600" },
            { label: "Active",              value: stats.active,              icon: UserCheck,   color: "bg-green-500/10 text-green-600" },
            { label: "Pending Approval",    value: stats.pending,             icon: Clock,       color: "bg-yellow-500/10 text-yellow-600" },
            { label: "Package Revenue",     value: fmt(stats.package_revenue_cents), icon: CreditCard, color: "bg-purple-500/10 text-purple-600", isText: true },
            { label: "Commissions Pending", value: fmt(stats.commissions_pending_cents), icon: DollarSign, color: "bg-orange-500/10 text-orange-600", isText: true },
            { label: "Commissions Paid",    value: fmt(stats.commissions_paid_cents),   icon: BadgeCheck, color: "bg-teal-500/10 text-teal-600",  isText: true },
            { label: "Affiliates",          value: stats.pkg_affiliate,       icon: Award,       color: "bg-gray-500/10 text-gray-600" },
            { label: "No Package Yet",      value: stats.pkg_none,            icon: Ban,         color: "bg-red-500/10 text-red-600" },
          ].map(card => (
            <div key={card.label} className="rounded-xl border bg-card p-4 shadow-sm">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold mt-2">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or code…"
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                {["Partner", "Code", "Package", "Status", "Rank", "Clients", "Earnings", "Joined", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="p-10 text-center text-muted-foreground">No partners found.</td></tr>
              )}
              {filtered.map(r => {
                const pkg = r.package_tier ? PKG_LABELS[r.package_tier] : null;
                const statusCfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
                const isExpanded = expandedId === r.id;
                const expData = expandData[r.id];
                return (
                  <>
                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground leading-none">{r.full_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{r.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{r.reseller_code}</code>
                      </td>
                      <td className="px-4 py-3">
                        {pkg ? (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pkg.color}`}>{pkg.label}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">None</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusCfg.color}`}>{statusCfg.label}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{RANK_LABELS[r.rank_key] || r.rank_key}</td>
                      <td className="px-4 py-3 text-center font-semibold">{r.total_clients}</td>
                      <td className="px-4 py-3 font-semibold">{fmt(r.total_earnings || 0)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString("en-ZA")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {r.status !== "active" && (
                            <Button size="sm" variant="outline" className="h-7 text-xs text-green-700 border-green-200 hover:bg-green-50"
                              disabled={updatingId === r.id}
                              onClick={() => updateStatus(r.id, "active")}>
                              Activate
                            </Button>
                          )}
                          {r.status !== "suspended" && (
                            <Button size="sm" variant="outline" className="h-7 text-xs text-red-700 border-red-200 hover:bg-red-50"
                              disabled={updatingId === r.id}
                              onClick={() => updateStatus(r.id, "suspended")}>
                              Suspend
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-7 text-xs"
                            onClick={() => toggleExpand(r)}>
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded row */}
                    {isExpanded && (
                      <tr key={`${r.id}-expand`}>
                        <td colSpan={9} className="px-4 pb-4 bg-muted/20">
                          {loadingExpand === r.id ? (
                            <div className="py-4 text-center text-muted-foreground text-sm">Loading…</div>
                          ) : expData ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-3">
                              {/* Clients */}
                              <div className="rounded-lg border bg-card p-4">
                                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                                  <Users className="h-4 w-4 text-primary" /> Clients ({expData.clients.length})
                                </p>
                                {expData.clients.length === 0 ? (
                                  <p className="text-xs text-muted-foreground">No clients yet.</p>
                                ) : (
                                  <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {expData.clients.map((c: any) => (
                                      <div key={c.id} className="flex items-center justify-between text-xs">
                                        <div>
                                          <p className="font-medium">{c.full_name}</p>
                                          <p className="text-muted-foreground">{c.email}</p>
                                        </div>
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                          c.sub_status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                                        }`}>{c.sub_status || "No Sub"}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Commissions */}
                              <div className="rounded-lg border bg-card p-4">
                                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-primary" /> Commissions
                                </p>
                                {expData.commissions.length === 0 ? (
                                  <p className="text-xs text-muted-foreground">No commissions yet.</p>
                                ) : (
                                  <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {expData.commissions.map((c: any) => (
                                      <div key={c.id} className="flex items-center justify-between text-xs">
                                        <div>
                                          <p className="font-medium">{fmt(c.amount_cents)}</p>
                                          <p className="text-muted-foreground truncate max-w-[200px]">{c.description}</p>
                                        </div>
                                        {c.status === "pending" ? (
                                          <Button size="sm" variant="outline" className="h-6 text-[10px] text-green-700 border-green-200"
                                            onClick={() => markCommissionPaid(c.id, r.id)}>
                                            Mark Paid
                                          </Button>
                                        ) : (
                                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-700">Paid</span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── Admin Franchises ────────────────────────────────
function AdminFranchises() {
  const [franchises, setFranchises] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedFranchise, setSelectedFranchise] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingClients, setLoadingClients] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [creating, setCreating] = useState(false);
  const [addingClient, setAddingClient] = useState(false);
  const [search, setSearch] = useState("");

  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newOwnerId, setNewOwnerId] = useState("");
  const [newClientId, setNewClientId] = useState("");

  // Invite flow state
  const [showInvite, setShowInvite] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFranchiseName, setInviteFranchiseName] = useState("");
  const [inviteFranchiseCode, setInviteFranchiseCode] = useState("");

  const loadFranchises = () => {
    setLoading(true);
    fetch("/api/admin/franchises", { credentials: "include" })
      .then(r => r.json())
      .then(d => setFranchises(Array.isArray(d) ? d : []))
      .catch(() => toast.error("Failed to load franchises"))
      .finally(() => setLoading(false));
  };

  const loadAllUsers = () => {
    fetch("/api/admin/clients", { credentials: "include" })
      .then(r => r.json())
      .then(d => setAllUsers(Array.isArray(d) ? d : []))
      .catch(() => {});
  };

  useEffect(() => { loadFranchises(); loadAllUsers(); }, []);

  const selectFranchise = (f: any) => {
    setSelectedFranchise(f);
    setLoadingClients(true);
    fetch(`/api/admin/franchises/${f.id}/clients`, { credentials: "include" })
      .then(r => r.json())
      .then(d => setClients(Array.isArray(d) ? d : []))
      .catch(() => toast.error("Failed to load clients"))
      .finally(() => setLoadingClients(false));
  };

  const inviteFranchise = async () => {
    if (!inviteName || !inviteEmail || !inviteFranchiseName || !inviteFranchiseCode) {
      toast.error("All fields are required"); return;
    }
    setInviting(true);
    const res = await fetch("/api/admin/franchises/invite", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: inviteName,
        email: inviteEmail,
        franchise_name: inviteFranchiseName,
        franchise_code: inviteFranchiseCode,
      }),
    });
    const d = await res.json();
    setInviting(false);
    if (!res.ok) { toast.error(d.error || "Failed to send invite"); return; }
    toast.success(`Invite sent to ${inviteEmail}! They'll receive an email to set their password.`);
    setShowInvite(false);
    setInviteName(""); setInviteEmail(""); setInviteFranchiseName(""); setInviteFranchiseCode("");
    loadFranchises();
  };

  const createFranchise = async () => {
    if (!newName || !newCode || !newOwnerId) { toast.error("All fields are required"); return; }
    setCreating(true);
    const res = await fetch("/api/admin/franchises", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, code: newCode, owner_user_id: newOwnerId }),
    });
    const d = await res.json();
    setCreating(false);
    if (!res.ok) { toast.error(d.error || "Failed"); return; }
    toast.success("Franchise created");
    setShowCreate(false); setNewName(""); setNewCode(""); setNewOwnerId("");
    loadFranchises();
  };

  const addClient = async () => {
    if (!newClientId || !selectedFranchise) return;
    setAddingClient(true);
    const res = await fetch(`/api/admin/franchises/${selectedFranchise.id}/clients`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_user_id: newClientId }),
    });
    const d = await res.json();
    setAddingClient(false);
    if (!res.ok) { toast.error(d.error || "Failed"); return; }
    toast.success("Client linked to franchise");
    setShowAddClient(false); setNewClientId("");
    selectFranchise(selectedFranchise);
  };

  const unlinkClient = async (clientId: string, name: string) => {
    if (!selectedFranchise) return;
    if (!confirm(`Unlink ${name} from this franchise?`)) return;
    await fetch(`/api/admin/franchises/${selectedFranchise.id}/clients/${clientId}`, {
      method: "DELETE", credentials: "include",
    });
    toast.success("Client unlinked");
    selectFranchise(selectedFranchise);
  };

  const toggleStatus = async (f: any) => {
    const next = f.status === "active" ? "suspended" : "active";
    if (!confirm(`${next === "suspended" ? "Suspend" : "Reactivate"} franchise "${f.name}"?`)) return;
    const res = await fetch(`/api/admin/franchises/${f.id}/status`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) { toast.success(`Franchise ${next}`); loadFranchises(); if (selectedFranchise?.id === f.id) setSelectedFranchise({ ...selectedFranchise, status: next }); }
    else toast.error("Failed to update status");
  };

  const deleteFranchise = async (f: any) => {
    if (!confirm(`Delete franchise "${f.name}"? The owner will be demoted to a regular user.`)) return;
    await fetch(`/api/admin/franchises/${f.id}`, { method: "DELETE", credentials: "include" });
    toast.success("Franchise deleted");
    if (selectedFranchise?.id === f.id) setSelectedFranchise(null);
    loadFranchises();
  };

  const filtered = franchises.filter(f => {
    const q = search.toLowerCase();
    return !q || f.name.toLowerCase().includes(q) || f.code.toLowerCase().includes(q) || f.owner_name?.toLowerCase().includes(q);
  });

  const unlinkedUsers = allUsers.filter(u =>
    u.role !== "admin" && u.role !== "franchise" &&
    !clients.some(c => c.id === u.id)
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" /> Franchises
          </h2>
          <p className="text-sm text-muted-foreground">{franchises.length} franchise{franchises.length !== 1 ? "s" : ""} registered</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadFranchises}><RefreshCw className="h-4 w-4 mr-1" />Refresh</Button>
          <Button size="sm" variant="outline" onClick={() => setShowCreate(true)} className="border-indigo-300 text-indigo-700 hover:bg-indigo-50">
            <Plus className="h-4 w-4 mr-1" /> Existing User
          </Button>
          <Button size="sm" onClick={() => setShowInvite(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Mail className="h-4 w-4 mr-1" /> Invite Franchise
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Franchise list */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, code, owner…"
              className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No franchises yet. Create the first one.</div>
          ) : filtered.map(f => (
            <div
              key={f.id}
              onClick={() => selectFranchise(f)}
              className={`rounded-xl border p-4 cursor-pointer transition-colors ${selectedFranchise?.id === f.id ? "border-indigo-400 bg-indigo-50/60" : "bg-card hover:bg-muted/40"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{f.name}</span>
                    <span className="font-mono text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">{f.code}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${f.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {f.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.owner_name} · {f.owner_email}</p>
                  <p className="text-xs text-muted-foreground">{f.client_count} client{f.client_count !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => toggleStatus(f)}>
                    {f.status === "active" ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600 hover:text-red-700" onClick={() => deleteFranchise(f)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Client panel */}
        <div className="rounded-xl border bg-card shadow-sm">
          {!selectedFranchise ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-2">
              <Store className="h-10 w-10 opacity-30" />
              <p className="text-sm">Select a franchise to manage its clients</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{selectedFranchise.name} — Clients</h3>
                  <p className="text-xs text-muted-foreground">{clients.length} linked clients</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setShowAddClient(true)}>
                  <UserPlus className="h-4 w-4 mr-1" /> Add Client
                </Button>
              </div>

              {loadingClients ? (
                <div className="flex items-center justify-center h-32"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : clients.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No clients linked yet.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {clients.map(c => (
                    <div key={c.id} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 bg-background">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{c.business_name || c.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                        {c.plan_code && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">{c.plan_name || c.plan_code}</span>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-red-500 hover:text-red-700 shrink-0" onClick={() => unlinkClient(c.id, c.full_name)}>
                        <Unlink className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create franchise dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Franchise</DialogTitle>
            <DialogDescription>Promote a user to franchise owner and assign them a franchise code.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Franchise Name</Label>
              <Input className="mt-1" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Gauteng North Franchise" />
            </div>
            <div>
              <Label className="text-xs">Franchise Code <span className="text-muted-foreground">(unique, short identifier)</span></Label>
              <Input className="mt-1 font-mono uppercase" value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase())} placeholder="e.g. GPN01" maxLength={12} />
            </div>
            <div>
              <Label className="text-xs">Owner (select from existing users)</Label>
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none"
                value={newOwnerId}
                onChange={e => setNewOwnerId(e.target.value)}
              >
                <option value="">— select owner —</option>
                {allUsers.filter(u => u.role === "user").map(u => (
                  <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={createFranchise} disabled={creating} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Store className="h-4 w-4 mr-2" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite franchise dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-indigo-600" /> Invite Franchise Owner
            </DialogTitle>
            <DialogDescription>
              Enter the franchise details and owner's info. We'll create their account and email them a link to set their password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs font-medium">Owner Full Name</Label>
                <Input className="mt-1" value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="e.g. Sipho Dlamini" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs font-medium">Owner Email Address</Label>
                <Input className="mt-1" type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="e.g. sipho@example.co.za" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs font-medium">Franchise Name</Label>
                <Input className="mt-1" value={inviteFranchiseName} onChange={e => setInviteFranchiseName(e.target.value)} placeholder="e.g. Gauteng North Franchise" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs font-medium">Franchise Code <span className="text-muted-foreground font-normal">(unique short ID)</span></Label>
                <Input
                  className="mt-1 font-mono uppercase"
                  value={inviteFranchiseCode}
                  onChange={e => setInviteFranchiseCode(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                  placeholder="e.g. GPN01"
                  maxLength={12}
                />
              </div>
            </div>
            <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3 text-xs text-indigo-700 leading-relaxed">
              An account will be created for this person with franchise-level access. They'll receive an email with a link to set their password — valid for 7 days.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button onClick={inviteFranchise} disabled={inviting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {inviting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add client dialog */}
      <Dialog open={showAddClient} onOpenChange={setShowAddClient}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Client to {selectedFranchise?.name}</DialogTitle>
            <DialogDescription>Link an existing user account to this franchise.</DialogDescription>
          </DialogHeader>
          <div>
            <Label className="text-xs">Select Client</Label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none"
              value={newClientId}
              onChange={e => setNewClientId(e.target.value)}
            >
              <option value="">— select client —</option>
              {unlinkedUsers.map(u => (
                <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
              ))}
            </select>
            {unlinkedUsers.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">All eligible users are already linked to this franchise.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddClient(false)}>Cancel</Button>
            <Button onClick={addClient} disabled={addingClient || !newClientId} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {addingClient ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Link2 className="h-4 w-4 mr-2" />}
              Link Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const getPageTitle = () => {
    const item = adminNavItems.find((item) => location.pathname.startsWith(item.path) && (item.path !== "/admin" || location.pathname === "/admin"));
    return item ? item.label : "Admin";
  };

  return (
    <div className="flex h-screen bg-background">
      <aside className={`flex flex-col border-r border-sidebar-border bg-slate-950 transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
          {!collapsed && (
            <Link to="/admin" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
                <span className="text-sm font-bold text-white font-heading">M</span>
              </div>
              <div>
                <span className="text-lg font-bold font-heading text-white">Masakhe</span>
                <span className="ml-1 text-xs text-amber-400 font-semibold">ADMIN</span>
              </div>
            </Link>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="text-white/60 hover:text-white">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {adminNavItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${active ? "bg-amber-500/20 text-amber-400 font-semibold" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="px-2 pb-4 space-y-2">
          {!collapsed && (
            <Link to="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white">
              <Building2 className="h-5 w-5" />
              <span>User Dashboard</span>
            </Link>
          )}
        </div>

        <div className="flex h-1">
          <div className="flex-1 bg-amber-500" />
          <div className="flex-1 bg-amber-600" />
          <div className="flex-1 bg-amber-700" />
          <div className="flex-1 bg-amber-800" />
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-md px-6">
          <h1 className="text-xl font-bold font-heading">{getPageTitle()}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.full_name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>Sign Out</Button>
          </div>
        </header>

        <Routes>
          <Route index element={<AdminOverview />} />
          <Route path="clients" element={<ClientList />} />
          <Route path="partners" element={<AdminPartners />} />
          <Route path="franchises" element={<AdminFranchises />} />
          <Route path="tenders" element={<AdminTenders />} />
          <Route path="websites" element={<WebsiteList />} />
          <Route path="audit" element={<AuditLog />} />
          <Route path="*" element={<AdminOverview />} />
        </Routes>
      </main>
    </div>
  );
}
