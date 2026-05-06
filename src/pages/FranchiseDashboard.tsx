import { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  LayoutDashboard, Users, ChevronRight, ChevronLeft, Loader2,
  Building2, CreditCard, LogOut, Eye, Crown, TrendingUp,
  Search, RefreshCw, CheckCircle2, Clock, XCircle, Banknote,
  Link2, Copy, Check,
} from "lucide-react";

const PLAN_COLORS: Record<string, string> = {
  starter: "bg-green-100 text-green-800",
  pro:     "bg-blue-100 text-blue-800",
  premium: "bg-indigo-100 text-indigo-800",
};
const PLAN_NAMES: Record<string, string> = {
  starter: "Enterprize",
  pro:     "Enterprize Plus",
  premium: "Enterprize Premium",
};
const SUB_STATUS: Record<string, { label: string; icon: any; color: string }> = {
  ACTIVE: { label: "Active",  icon: CheckCircle2, color: "text-green-600" },
  TRIAL:  { label: "Trial",   icon: Clock,        color: "text-amber-600" },
  PAST_DUE: { label: "Past Due", icon: XCircle,   color: "text-red-600" },
};

// ─── Overview ─────────────────────────────────────────────────────────────────
function FranchiseOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/franchise/me", { credentials: "include" })
      .then(r => r.json())
      .then(setData)
      .catch(() => toast.error("Failed to load franchise data"))
      .finally(() => setLoading(false));
  }, []);

  const signupLink = data?.franchise?.code
    ? `${window.location.origin}/register?franchise=${encodeURIComponent(data.franchise.code)}`
    : null;

  const copyLink = () => {
    if (!signupLink) return;
    navigator.clipboard.writeText(signupLink).then(() => {
      setCopied(true);
      toast.success("Signup link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  const f = data?.franchise;
  const s = data?.stats;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading">{f?.name ?? "My Franchise"}</h2>
        <p className="text-muted-foreground text-sm">Franchise code: <span className="font-mono font-semibold">{f?.code}</span></p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Clients",       value: s?.total_clients  ?? 0, icon: Users,       color: "bg-blue-500/10 text-blue-600" },
          { label: "Active Subscriptions",value: s?.active_subs    ?? 0, icon: CheckCircle2,color: "bg-green-500/10 text-green-600" },
          { label: "Enterprize Plus",      value: s?.pro_count      ?? 0, icon: TrendingUp,  color: "bg-indigo-500/10 text-indigo-600" },
          { label: "Enterprize Premium",   value: s?.premium_count  ?? 0, icon: Crown,       color: "bg-amber-500/10 text-amber-600" },
        ].map(card => (
          <div key={card.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.color}`}>
              <card.icon className="h-4 w-4" />
            </div>
            <p className="text-3xl font-bold mt-2">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {signupLink && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
              <Link2 className="h-4 w-4 text-indigo-600" />
            </div>
            <h3 className="font-semibold">Business Signup Link</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Share this link with businesses to let them sign up directly under your franchise. Their accounts will be automatically linked to you.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg border bg-muted/40 px-3 py-2.5 font-mono text-xs text-muted-foreground truncate select-all">
              {signupLink}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyLink}
              className="shrink-0 gap-1.5"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="font-semibold mb-1">Getting Started</h3>
        <p className="text-sm text-muted-foreground">
          Share your signup link above so businesses can register directly under your franchise.
          Go to <strong>Clients</strong> to view and manage your registered businesses,
          assign subscription plans, and log into any client account to assist them.
        </p>
      </div>
    </div>
  );
}

// ─── Clients ──────────────────────────────────────────────────────────────────
function FranchiseClients() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [grantingId, setGrantingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    fetch("/api/franchise/clients", { credentials: "include" })
      .then(r => r.json())
      .then(d => setClients(Array.isArray(d) ? d : []))
      .catch(() => toast.error("Failed to load clients"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const grantSubscription = async (clientId: string, plan: string, name: string) => {
    if (!confirm(`Assign ${PLAN_NAMES[plan]} to ${name}?`)) return;
    setGrantingId(clientId);
    try {
      const res = await fetch(`/api/franchise/clients/${clientId}/subscription`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error || "Failed"); return; }
      toast.success(`${PLAN_NAMES[plan]} assigned to ${name}`);
      load();
    } finally {
      setGrantingId(null);
    }
  };

  const impersonate = async (clientId: string, name: string) => {
    if (!confirm(`Log in as ${name}? Click "Return to Franchise" to switch back.`)) return;
    const res = await fetch(`/api/franchise/clients/${clientId}/impersonate`, {
      method: "POST",
      credentials: "include",
    });
    const d = await res.json();
    if (res.ok) {
      toast.success(`Now logged in as ${name}`);
      navigate("/dashboard");
      window.location.reload();
    } else {
      toast.error(d.error || "Failed to impersonate");
    }
  };

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return !q || c.full_name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.business_name?.toLowerCase().includes(q);
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> My Clients
          </h2>
          <p className="text-sm text-muted-foreground">{clients.length} registered businesses under your franchise</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email or business…"
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          {search ? "No clients match your search." : "No clients in your franchise yet. Contact your super admin to add clients."}
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  {["Business", "Contact", "Plan", "Status", "Linked", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(c => {
                  const statusCfg = SUB_STATUS[c.sub_status] || null;
                  const isGranting = grantingId === c.id;
                  return (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{c.business_name || c.full_name}</div>
                        <div className="text-xs text-muted-foreground">{c.full_name}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                      <td className="px-4 py-3">
                        {c.plan_code ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${PLAN_COLORS[c.plan_code] || "bg-gray-100 text-gray-700"}`}>
                            {PLAN_NAMES[c.plan_code] || c.plan_name}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {statusCfg ? (
                          <span className={`flex items-center gap-1 text-xs font-medium ${statusCfg.color}`}>
                            <statusCfg.icon className="h-3.5 w-3.5" />
                            {statusCfg.label}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">No plan</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(c.linked_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          <Button
                            variant="outline" size="sm"
                            className="h-7 px-2 text-[10px] gap-1 border-green-300 text-green-700 hover:bg-green-50"
                            disabled={isGranting}
                            onClick={() => grantSubscription(c.id, "starter", c.full_name)}
                          >
                            <CreditCard className="h-3 w-3" /> Enterprize
                          </Button>
                          <Button
                            variant="outline" size="sm"
                            className="h-7 px-2 text-[10px] gap-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                            disabled={isGranting}
                            onClick={() => grantSubscription(c.id, "pro", c.full_name)}
                          >
                            <Banknote className="h-3 w-3" /> Enterprize Plus
                          </Button>
                          <Button
                            variant="outline" size="sm"
                            className="h-7 px-2 text-[10px] gap-1 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                            disabled={isGranting}
                            onClick={() => grantSubscription(c.id, "premium", c.full_name)}
                          >
                            <Crown className="h-3 w-3" /> Premium
                          </Button>
                          <Button
                            variant="outline" size="sm"
                            className="h-7 px-2 text-[10px] gap-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                            onClick={() => impersonate(c.id, c.full_name)}
                          >
                            <Eye className="h-3 w-3" /> View
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
      )}
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────
const navItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/franchise" },
  { icon: Users,           label: "Clients",  path: "/franchise/clients" },
];

export default function FranchiseDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout, isImpersonating, originalAdminName, stopImpersonating } = useAuth();

  const pageTitle = navItems.find(i => location.pathname === i.path)?.label ?? "Franchise";

  return (
    <div className="flex h-screen bg-background">
      {isImpersonating && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-amber-500 px-4 py-2 text-sm font-medium text-black">
          <span>Viewing as client — return when done</span>
          <Button size="sm" variant="outline" className="h-7 border-black/30 text-black hover:bg-amber-600" onClick={stopImpersonating}>
            Return to Franchise
          </Button>
        </div>
      )}

      <aside className={`flex flex-col border-r border-sidebar-border bg-slate-900 transition-all duration-300 ${collapsed ? "w-16" : "w-60"} ${isImpersonating ? "mt-10" : ""}`}>
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500">
                <span className="text-sm font-bold text-white font-heading">F</span>
              </div>
              <div>
                <span className="text-base font-bold font-heading text-white">Masakhe</span>
                <span className="ml-1 text-xs text-indigo-300 font-semibold">FRANCHISE</span>
              </div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="text-white/60 hover:text-white">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active ? "bg-indigo-500/20 text-indigo-300 font-semibold" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="px-2 pb-4 space-y-1">
          {!collapsed && (
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>

        <div className="flex h-1">
          <div className="flex-1 bg-indigo-500" />
          <div className="flex-1 bg-indigo-600" />
          <div className="flex-1 bg-indigo-700" />
          <div className="flex-1 bg-indigo-800" />
        </div>
      </aside>

      <main className={`flex-1 overflow-auto ${isImpersonating ? "mt-10" : ""}`}>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-md px-6">
          <h1 className="text-xl font-bold font-heading">{pageTitle}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.full_name}</span>
            <Badge variant="outline" className="text-indigo-700 border-indigo-300">Franchise Owner</Badge>
          </div>
        </header>

        <Routes>
          <Route index element={<FranchiseOverview />} />
          <Route path="clients" element={<FranchiseClients />} />
          <Route path="*" element={<FranchiseOverview />} />
        </Routes>
      </main>
    </div>
  );
}
