import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  LayoutDashboard, Users, Link2, User, LogOut, Menu, X,
  Copy, CheckCheck, MessageSquare, Mail, ExternalLink, Share2,
  Search, RefreshCw, CheckCircle2, Clock, TrendingUp, Crown,
  ArrowRight, Loader2, Eye, Zap, Star, Shield, CreditCard,
  Banknote, BarChart2, Unlink, ChevronRight, Sparkles,
  Building2, Phone, Save, BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const MTN_YELLOW = "#FFCC00";
const MTN_DARK   = "#1a1a1a";

const NAV_ITEMS = [
  { tab: "overview",  label: "Overview",    icon: LayoutDashboard },
  { tab: "clients",   label: "Clients",     icon: Users           },
  { tab: "link",      label: "Reg. Link",   icon: Link2           },
  { tab: "profile",   label: "Profile",     icon: User            },
];

const PLAN_NAMES: Record<string, string> = {
  starter: "Enterprize",
  pro:     "Enterprize Plus",
  premium: "Enterprize Premium",
};

function InitialAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name ? name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) : "?";
  const sz = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-14 h-14 text-lg" : "w-10 h-10 text-sm";
  return (
    <div
      className={`${sz} rounded-xl flex items-center justify-center shrink-0 font-bold text-sm shadow-sm`}
      style={{ backgroundColor: MTN_YELLOW, color: MTN_DARK }}
    >
      {initials}
    </div>
  );
}

export default function MTNDashboard() {
  const { logout: authLogout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);

  useEffect(() => { fetchMe(); }, []);
  useEffect(() => {
    if (activeTab === "clients") fetchClients();
  }, [activeTab]);

  async function fetchMe() {
    setLoading(true);
    try {
      const res = await fetch("/api/franchise/me", { credentials: "include" });
      if (!res.ok) { navigate("/mtn"); return; }
      setData(await res.json());
    } catch { navigate("/mtn"); }
    setLoading(false);
  }

  async function fetchClients() {
    setClientsLoading(true);
    try {
      const res = await fetch("/api/franchise/clients", { credentials: "include" });
      if (res.ok) setClients(await res.json());
    } catch {}
    setClientsLoading(false);
  }

  const franchise = data?.franchise;
  const stats = data?.stats;
  const signupLink = franchise?.code
    ? `${window.location.origin}/mtn/register?franchise=${encodeURIComponent(franchise.code)}`
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse shadow-lg"
          style={{ backgroundColor: MTN_YELLOW }}>
          <svg width="40" height="25" viewBox="0 0 90 56" fill="none">
            <ellipse cx="45" cy="28" rx="43" ry="26" stroke={MTN_DARK} strokeWidth="5" fill="none"/>
            <text x="45" y="36" textAnchor="middle" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="22" fill={MTN_DARK}>MTN</text>
          </svg>
        </div>
        <p className="text-muted-foreground text-sm">Loading MTN Business Portal…</p>
      </div>
    );
  }

  /* ── Sidebar ── */
  const SidebarContent = () => (
    <aside className="flex flex-col h-full border-r border-border" style={{ backgroundColor: MTN_DARK }}>
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
          style={{ backgroundColor: MTN_YELLOW }}>
          <svg width="28" height="17" viewBox="0 0 90 56" fill="none">
            <ellipse cx="45" cy="28" rx="43" ry="26" stroke={MTN_DARK} strokeWidth="6" fill="none"/>
            <text x="45" y="36" textAnchor="middle" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="22" fill={MTN_DARK}>MTN</text>
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold truncate leading-tight" style={{ color: MTN_YELLOW }}>
            {franchise?.name || "MTN Business"}
          </p>
          <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.45)" }}>Business Portal</p>
        </div>
        <button className="lg:hidden" style={{ color: "rgba(255,255,255,0.5)" }} onClick={() => setSidebarOpen(false)}>
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ tab, label, icon: Icon }) => {
          const isActive = activeTab === tab;
          return (
            <button key={tab} onClick={() => { setActiveTab(tab); setSidebarOpen(false); }}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
              style={{
                backgroundColor: isActive ? MTN_YELLOW : "transparent",
                color: isActive ? MTN_DARK : "rgba(255,255,255,0.65)",
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,204,0,0.12)"; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
              {tab === "clients" && (stats?.total_clients ?? 0) > 0 && (
                <span className="ml-auto text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none"
                  style={{ backgroundColor: isActive ? MTN_DARK : MTN_YELLOW, color: isActive ? MTN_YELLOW : MTN_DARK }}>
                  {stats.total_clients}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t space-y-2" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium"
          style={{ backgroundColor: "rgba(255,204,0,0.12)", color: MTN_YELLOW }}>
          <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
          MTN Partner — Active
        </div>
        <button onClick={async () => { await authLogout(); navigate("/mtn"); }}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
          style={{ color: "rgba(255,255,255,0.55)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "white"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.55)"; }}
        >
          <LogOut className="h-4 w-4 shrink-0" /> Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 shrink-0 flex-col"><SidebarContent /></div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"><SidebarContent /></div>
        </>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className="flex items-center gap-3 px-5 py-3.5 border-b bg-card/80 backdrop-blur sticky top-0 z-10 shrink-0">
          <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold text-foreground flex-1 truncate">
            {NAV_ITEMS.find(n => n.tab === activeTab)?.label}
          </h1>
          {franchise?.code && (
            <span className="hidden sm:inline text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
              {franchise.code}
            </span>
          )}
          <Badge className="border-0" style={{ backgroundColor: "#FFF9C4", color: "#7B6000" }}>Active</Badge>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">

          {/* ══ OVERVIEW ══ */}
          {activeTab === "overview" && (
            <OverviewTab
              franchise={franchise}
              stats={stats}
              signupLink={signupLink}
              setActiveTab={setActiveTab}
            />
          )}

          {/* ══ CLIENTS ══ */}
          {activeTab === "clients" && (
            <ClientsTab
              clients={clients}
              loading={clientsLoading}
              onRefresh={fetchClients}
              navigate={navigate}
            />
          )}

          {/* ══ REG. LINK ══ */}
          {activeTab === "link" && (
            <LinkTab franchise={franchise} signupLink={signupLink} />
          )}

          {/* ══ PROFILE ══ */}
          {activeTab === "profile" && (
            <ProfileTab franchise={franchise} stats={stats} />
          )}

        </main>
      </div>
    </div>
  );
}

/* ─── Overview Tab ─────────────────────────────────────────────────────────── */
function OverviewTab({ franchise, stats, signupLink, setActiveTab }: any) {
  const [linkCopied, setLinkCopied] = useState(false);

  function copyLink() {
    if (!signupLink) return;
    navigator.clipboard.writeText(signupLink).then(() => {
      setLinkCopied(true);
      toast.success("Registration link copied!");
      setTimeout(() => setLinkCopied(false), 2500);
    });
  }

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden px-6 py-10"
        style={{ background: `linear-gradient(135deg, ${MTN_DARK} 0%, #2d2d2d 60%, #1a1a2e 100%)` }}>
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, #FFCC00 1.5px, transparent 1.5px), radial-gradient(circle at 80% 20%, #FFCC00 1.5px, transparent 1.5px)",
          backgroundSize: "50px 50px"
        }} />
        <div className="absolute right-6 top-6 opacity-10">
          <svg width="140" height="88" viewBox="0 0 90 56" fill="none">
            <ellipse cx="45" cy="28" rx="43" ry="26" stroke={MTN_YELLOW} strokeWidth="4" fill="none"/>
            <text x="45" y="36" textAnchor="middle" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="22" fill={MTN_YELLOW}>MTN</text>
          </svg>
        </div>
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: MTN_YELLOW }}>
            MTN Business Portal — Dashboard
          </p>
          <h2 className="text-3xl font-extrabold text-white mb-1.5">{franchise?.name || "MTN Business"}</h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
            Partner Code: <span className="font-mono font-bold" style={{ color: MTN_YELLOW }}>{franchise?.code || "—"}</span>
          </p>
        </div>
      </div>

      <div className="p-5 lg:p-6 space-y-6">
        {/* KPI cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 -mt-8 relative z-10">
          {[
            { icon: Users,       label: "Total Clients",        value: stats?.total_clients ?? 0,  sub: "Registered businesses",  tab: "clients", gradient: "from-yellow-400 to-amber-500"  },
            { icon: CheckCircle2,label: "Active Subscriptions", value: stats?.active_subs ?? 0,    sub: "Paying clients",         tab: "clients", gradient: "from-emerald-500 to-teal-600"  },
            { icon: TrendingUp,  label: "Enterprize Plus",      value: stats?.pro_count ?? 0,      sub: "Pro tier clients",       tab: "clients", gradient: "from-blue-500 to-indigo-600"   },
            { icon: Crown,       label: "Enterprize Premium",   value: stats?.premium_count ?? 0,  sub: "Top tier clients",       tab: "clients", gradient: "from-violet-500 to-purple-600" },
          ].map((c) => (
            <div key={c.label}
              onClick={() => c.tab && setActiveTab(c.tab)}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-start gap-3.5 cursor-pointer hover:border-yellow-400/40 hover:shadow-md transition-all group">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
                <c.icon className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className="text-2xl font-extrabold text-foreground leading-tight mt-0.5">{c.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-yellow-500 shrink-0 mt-1 transition-colors" />
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Share Registration Link", desc: "Invite MTN businesses to join",  icon: Share2, tab: "link",    gradient: "from-yellow-400 to-amber-500"  },
              { label: "Manage Clients",           desc: "View, grant plans & impersonate", icon: Users,  tab: "clients", gradient: "from-blue-500 to-indigo-600"   },
              { label: "View Profile",             desc: "MTN partner details & code",    icon: User,   tab: "profile", gradient: "from-violet-500 to-purple-600" },
            ].map(a => (
              <button key={a.tab} onClick={() => setActiveTab(a.tab)}
                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:border-yellow-400/40 hover:shadow-md transition-all text-left group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                  <a.icon className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">{a.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-yellow-500 ml-auto shrink-0 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>

        {/* Registration link preview */}
        {signupLink && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <Link2 className="h-3.5 w-3.5" /> Client Registration Link
              </p>
              <div className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 mb-4">
                <p className="text-xs font-mono text-muted-foreground break-all leading-relaxed">{signupLink}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button className="gap-2 text-sm font-semibold" style={{ backgroundColor: MTN_YELLOW, color: MTN_DARK, border: "none" }} onClick={copyLink}>
                  {linkCopied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {linkCopied ? "Copied!" : "Copy Link"}
                </Button>
                <Button variant="outline" className="gap-2 text-sm"
                  onClick={() => {
                    const msg = encodeURIComponent(`Register your business on Masakhe — the MTN Business Platform!\n\n${signupLink}`);
                    window.open(`https://wa.me/?text=${msg}`, "_blank");
                  }}>
                  <MessageSquare className="h-4 w-4 text-green-600" /> WhatsApp
                </Button>
              </div>
            </div>

            <div className="rounded-2xl p-5 flex items-center justify-between"
              style={{ background: `linear-gradient(135deg, ${MTN_YELLOW}22 0%, ${MTN_YELLOW}08 100%)`, border: `1px solid ${MTN_YELLOW}40` }}>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">MTN Partner Code</p>
                <p className="text-4xl font-black font-mono text-foreground tracking-widest">{franchise?.code}</p>
                <p className="text-xs text-muted-foreground mt-1.5">Clients enter this manually when registering</p>
              </div>
              <Button size="lg" variant="outline" className="gap-2 shrink-0"
                onClick={() => { navigator.clipboard.writeText(franchise?.code); toast.success("Code copied!"); }}>
                <Copy className="h-4 w-4" /> Copy
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Clients Tab ──────────────────────────────────────────────────────────── */
function ClientsTab({ clients, loading, onRefresh, navigate }: any) {
  const [search, setSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const filtered = clients.filter((c: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${c.full_name} ${c.email} ${c.business_name || ""}`.toLowerCase().includes(q);
  });

  const apiCall = async (clientId: string, method: string, path: string, body?: any) => {
    setActionLoadingId(clientId);
    try {
      const res = await fetch(`/api/franchise/clients/${clientId}${path}`, {
        method,
        credentials: "include",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error || "Action failed"); return false; }
      return true;
    } finally {
      setActionLoadingId(null);
    }
  };

  const grantTrial = async (c: any) => {
    if (!confirm(`Grant ${c.full_name} a 7-day Premium trial?`)) return;
    if (await apiCall(c.id, "POST", "/trial")) { toast.success("7-day trial granted"); onRefresh(); }
  };

  const grantPlan = async (c: any, plan: string) => {
    if (!confirm(`Assign ${PLAN_NAMES[plan]} to ${c.full_name}?`)) return;
    if (await apiCall(c.id, "POST", "/subscription", { plan })) { toast.success(`${PLAN_NAMES[plan]} assigned`); onRefresh(); }
  };

  const revokeSubscription = async (c: any) => {
    if (!confirm(`Revoke active subscription for ${c.full_name}?`)) return;
    if (await apiCall(c.id, "DELETE", "/subscription")) { toast.success("Subscription revoked"); onRefresh(); }
  };

  const toggleExempt = async (c: any) => {
    const exempt = !c.subscription_exempt;
    if (!confirm(exempt ? `Grant free access to ${c.full_name}?` : `Remove free access from ${c.full_name}?`)) return;
    if (await apiCall(c.id, "PATCH", "/exempt", { exempt })) { toast.success(exempt ? "Free access granted" : "Free access removed"); onRefresh(); }
  };

  const impersonate = async (c: any) => {
    if (!confirm(`Log in as ${c.full_name}? You can return to the MTN Portal afterwards.`)) return;
    const ok = await apiCall(c.id, "POST", "/impersonate");
    if (ok) { toast.success(`Now logged in as ${c.full_name}`); navigate("/dashboard"); window.location.reload(); }
  };

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden px-6 py-10"
        style={{ background: `linear-gradient(135deg, ${MTN_DARK} 0%, #2d2d2d 100%)` }}>
        <div className="absolute right-0 top-0 opacity-10"><Users className="h-48 w-48 text-white" /></div>
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: MTN_YELLOW }}>Client Management</p>
          <h2 className="text-2xl font-extrabold text-white mb-1">MTN Business Clients</h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>{clients.length} client{clients.length !== 1 ? "s" : ""} registered under your MTN partner account</p>
        </div>
      </div>

      <div className="p-5 lg:p-6 space-y-4">
        {/* Search + refresh */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or email…" className="pl-9 rounded-xl" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-16 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg"
              style={{ backgroundColor: MTN_YELLOW }}>
              <Users className="h-8 w-8" style={{ color: MTN_DARK }} />
            </div>
            <p className="font-bold text-foreground text-lg mb-2">
              {search ? "No matches found" : "No clients yet"}
            </p>
            <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
              {search ? "Try a different search term." : "Share your registration link and businesses will appear here when they sign up."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c: any) => {
              const isLoading = actionLoadingId === c.id;
              const hasSub = c.subscription_status === "active" || c.subscription_exempt;
              const subLabel = c.subscription_exempt
                ? "Free Access"
                : c.current_plan
                  ? PLAN_NAMES[c.current_plan] || c.current_plan
                  : null;

              return (
                <div key={c.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-md hover:border-yellow-400/30 transition-all">
                  <div className="flex items-start gap-4">
                    <InitialAvatar name={c.full_name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <p className="font-semibold text-foreground">{c.full_name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{c.email}</p>
                          {c.business_name && (
                            <p className="text-xs text-muted-foreground">{c.business_name}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                          {hasSub ? (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-[10px]">
                              {subLabel || "Active"}
                            </Badge>
                          ) : (
                            <Badge className="bg-muted text-muted-foreground border-0 text-[10px]">No Plan</Badge>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs gap-1.5" onClick={() => impersonate(c)} disabled={isLoading}>
                          {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}
                          Log in as
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs gap-1.5" onClick={() => grantTrial(c)} disabled={isLoading}>
                          <Clock className="h-3 w-3" /> Trial
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs gap-1.5" onClick={() => grantPlan(c, "starter")} disabled={isLoading}>
                          <Banknote className="h-3 w-3" /> Enterprize
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs gap-1.5" onClick={() => grantPlan(c, "pro")} disabled={isLoading}>
                          <TrendingUp className="h-3 w-3" /> Plus
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs gap-1.5" onClick={() => grantPlan(c, "premium")} disabled={isLoading}>
                          <Crown className="h-3 w-3" /> Premium
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs gap-1.5" onClick={() => toggleExempt(c)} disabled={isLoading}>
                          <Shield className="h-3 w-3" /> {c.subscription_exempt ? "Remove Free" : "Free Access"}
                        </Button>
                        {hasSub && !c.subscription_exempt && (
                          <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs gap-1.5 text-red-600 border-red-200 hover:bg-red-50" onClick={() => revokeSubscription(c)} disabled={isLoading}>
                            <Unlink className="h-3 w-3" /> Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Link Tab ─────────────────────────────────────────────────────────────── */
function LinkTab({ franchise, signupLink }: any) {
  const [linkCopied, setLinkCopied] = useState(false);

  function copyLink() {
    if (!signupLink) return;
    navigator.clipboard.writeText(signupLink).then(() => {
      setLinkCopied(true);
      toast.success("Registration link copied!");
      setTimeout(() => setLinkCopied(false), 2500);
    });
  }

  function shareWhatsApp() {
    const msg = encodeURIComponent(`Register your business on Masakhe — the MTN Business Platform!\n\nSign up here: ${signupLink}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }

  function shareEmail() {
    const sub = encodeURIComponent("Join Masakhe — MTN Business Platform");
    const body = encodeURIComponent(`Hi,\n\nJoin the MTN Business Platform powered by Masakhe. Use the link below to register your business:\n\n${signupLink}\n\nOr enter partner code: ${franchise?.code}\n\nBest regards,\n${franchise?.name || "MTN Business"}`);
    window.open(`mailto:?subject=${sub}&body=${body}`);
  }

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden px-6 py-12"
        style={{ background: `linear-gradient(135deg, ${MTN_DARK} 0%, #2a2a2a 60%, #1a1a2e 100%)` }}>
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `radial-gradient(circle at 25% 50%, ${MTN_YELLOW} 1.5px, transparent 1.5px), radial-gradient(circle at 75% 25%, ${MTN_YELLOW} 1.5px, transparent 1.5px)`, backgroundSize: "40px 40px" }} />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 border rounded-full px-3 py-1 mb-4"
            style={{ backgroundColor: `${MTN_YELLOW}22`, borderColor: `${MTN_YELLOW}40` }}>
            <Link2 className="h-3.5 w-3.5" style={{ color: MTN_YELLOW }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: MTN_YELLOW }}>Grow Your Network</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-2">Registration Link</h2>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
            Share your unique link with businesses — they'll be automatically linked to <strong className="text-white">{franchise?.name || "your MTN account"}</strong> the moment they sign up.
          </p>
        </div>
      </div>

      <div className="p-5 lg:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* LEFT */}
          <div className="space-y-5">
            {/* Link card */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-border" style={{ background: `linear-gradient(to right, ${MTN_YELLOW}15, ${MTN_YELLOW}05)` }}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5" /> Your Unique Registration URL
                </p>
                <p className="font-mono text-sm text-foreground break-all leading-relaxed bg-white/50 dark:bg-black/20 rounded-lg px-3 py-2">
                  {signupLink || "Loading…"}
                </p>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button className="gap-2 font-semibold" style={{ backgroundColor: MTN_YELLOW, color: MTN_DARK, border: "none" }} onClick={copyLink}>
                  {linkCopied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {linkCopied ? "Copied!" : "Copy Link"}
                </Button>
                <Button variant="outline" className="gap-2" onClick={shareWhatsApp}>
                  <MessageSquare className="h-4 w-4 text-green-600" /> WhatsApp
                </Button>
                <Button variant="outline" className="gap-2" onClick={shareEmail}>
                  <Mail className="h-4 w-4 text-blue-600" /> Email
                </Button>
              </div>
            </div>

            {/* Partner code */}
            <div className="rounded-2xl p-5 flex items-center justify-between"
              style={{ background: `linear-gradient(to right, ${MTN_YELLOW}20, ${MTN_YELLOW}08)`, border: `1px solid ${MTN_YELLOW}40` }}>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">MTN Partner Code</p>
                <p className="text-4xl font-black font-mono text-foreground tracking-widest">{franchise?.code || "—"}</p>
                <p className="text-xs text-muted-foreground mt-1.5">Businesses can enter this manually when registering</p>
              </div>
              <Button size="lg" variant="outline" className="gap-2 shrink-0"
                onClick={() => { navigator.clipboard.writeText(franchise?.code); toast.success("Code copied!"); }}>
                <Copy className="h-4 w-4" /> Copy Code
              </Button>
            </div>

            <Button variant="outline" className="w-full gap-2 h-11" onClick={() => window.open(signupLink, "_blank")}>
              <ExternalLink className="h-4 w-4" /> Preview Registration Page
            </Button>

            {/* Tips */}
            <div className="rounded-2xl p-5" style={{ background: `${MTN_YELLOW}12`, border: `1px solid ${MTN_YELLOW}30` }}>
              <p className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "#7B6000" }}>
                <Sparkles className="h-4 w-4" /> Sharing Tips
              </p>
              <ul className="space-y-2">
                {[
                  "Share via MTN dealer WhatsApp groups and business networks",
                  "Post on your MTN business social media channels",
                  "Include in MTN partner newsletters and email campaigns",
                  "Display QR code with this link at MTN business events",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: "#7B6000" }}>
                    <Star className="h-3 w-3 mt-0.5 shrink-0" /> {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-5">
            <div className="relative rounded-2xl overflow-hidden h-52">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
                alt="MTN Business"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-bold text-lg leading-tight">Grow the MTN business community</p>
                <p className="text-white/80 text-xs mt-1">Every registered business gets access to powerful free tools</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-sm font-bold text-foreground mb-5 flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" /> How it works
              </p>
              <div className="space-y-4">
                {[
                  { step: 1, title: "Share the link",      desc: "Send via WhatsApp, email, or social media.", color: "from-yellow-400 to-amber-500" },
                  { step: 2, title: "Business registers",  desc: "The SMME completes the free Masakhe registration.", color: "from-blue-500 to-indigo-600" },
                  { step: 3, title: "Auto-linked to you",  desc: "They appear in your Clients tab immediately.", color: "from-emerald-500 to-teal-600" },
                  { step: 4, title: "Manage & support",    desc: "Grant plans, log in as them to assist, track activity.", color: "from-violet-500 to-purple-600" },
                ].map(s => (
                  <div key={s.step} className="flex gap-4 items-start">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-sm`}>{s.step}</div>
                    <div className="pt-0.5">
                      <p className="text-sm font-semibold text-foreground">{s.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "Free",    label: "For all businesses",  gradient: "from-emerald-500 to-teal-600" },
                { value: "24/7",    label: "Platform access",     gradient: "from-yellow-400 to-amber-500" },
                { value: "1-click", label: "Auto-link sign-up",   gradient: "from-violet-500 to-purple-600" },
              ].map(stat => (
                <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 text-center">
                  <div className={`text-lg font-black bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Profile Tab ──────────────────────────────────────────────────────────── */
function ProfileTab({ franchise, stats }: any) {
  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden px-6 py-12"
        style={{ background: `linear-gradient(135deg, ${MTN_DARK} 0%, #2d2d2d 60%, #1a1a2e 100%)` }}>
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `radial-gradient(circle at 30% 60%, ${MTN_YELLOW} 1.5px, transparent 1.5px)`, backgroundSize: "45px 45px" }} />
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border border-white/20 shadow-lg"
            style={{ backgroundColor: MTN_YELLOW }}>
            <svg width="44" height="28" viewBox="0 0 90 56" fill="none">
              <ellipse cx="45" cy="28" rx="43" ry="26" stroke={MTN_DARK} strokeWidth="5" fill="none"/>
              <text x="45" y="36" textAnchor="middle" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="22" fill={MTN_DARK}>MTN</text>
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: MTN_YELLOW }}>MTN Partner Profile</p>
            <h2 className="text-3xl font-extrabold text-white">{franchise?.name || "MTN Business"}</h2>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
              Partner Code: <span className="font-mono font-bold" style={{ color: MTN_YELLOW }}>{franchise?.code}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 lg:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Left — details */}
          <div className="space-y-5">
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: MTN_YELLOW }}>
                  <Building2 className="h-3.5 w-3.5" style={{ color: MTN_DARK }} />
                </div>
                <p className="text-sm font-bold text-foreground">Partner Information</p>
              </div>
              <div className="p-5 space-y-4">
                {[
                  { label: "Franchise Name", value: franchise?.name || "—" },
                  { label: "Partner Code",   value: franchise?.code || "—", mono: true },
                  { label: "Status",         value: franchise?.status === "active" ? "Active" : "Suspended" },
                ].map(row => (
                  <div key={row.label} className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{row.label}</p>
                      <p className={`text-sm font-semibold text-foreground mt-0.5 ${row.mono ? "font-mono tracking-widest" : ""}`}>{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <BarChart2 className="h-3.5 w-3.5 text-white" />
                </div>
                <p className="text-sm font-bold text-foreground">Partner Summary</p>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { label: "Total Clients",        value: `${stats?.total_clients ?? 0} businesses`,  icon: Users,        color: "text-blue-500"    },
                  { label: "Active Subscriptions", value: `${stats?.active_subs ?? 0} paying clients`, icon: CreditCard,   color: "text-emerald-500" },
                  { label: "Enterprize Plus",      value: `${stats?.pro_count ?? 0} clients`,          icon: TrendingUp,   color: "text-indigo-500"  },
                  { label: "Enterprize Premium",   value: `${stats?.premium_count ?? 0} clients`,      icon: Crown,        color: "text-violet-500"  },
                ].map(row => (
                  <div key={row.label} className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3">
                    <row.icon className={`h-4 w-4 shrink-0 ${row.color}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{row.label}</p>
                      <p className="text-sm font-semibold text-foreground">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — info panel */}
          <div className="space-y-5">
            <div className="relative rounded-2xl overflow-hidden h-52">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
                alt="MTN Business"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex items-end p-4">
                <div>
                  <p className="text-white font-bold text-lg">{franchise?.name || "MTN Business"}</p>
                  <p className="text-white/80 text-xs mt-0.5">MTN Partner Portal — Powered by Masakhe</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-5"
              style={{ background: `linear-gradient(to right, ${MTN_YELLOW}18, ${MTN_YELLOW}06)`, border: `1px solid ${MTN_YELLOW}35` }}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">MTN Partner Code</p>
              <p className="text-4xl font-black font-mono text-foreground tracking-widest">{franchise?.code || "—"}</p>
              <p className="text-xs text-muted-foreground mt-1.5">This code is permanent and cannot be changed.</p>
              <Button size="sm" variant="outline" className="mt-3 gap-2"
                onClick={() => { navigator.clipboard.writeText(franchise?.code); toast.success("Code copied!"); }}>
                <Copy className="h-3.5 w-3.5" /> Copy Code
              </Button>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <p className="text-sm font-bold text-foreground flex items-center gap-2">
                <Shield className="h-4 w-4 text-yellow-500" /> What you can do as MTN Super Admin
              </p>
              {[
                "View and manage all MTN-linked business clients",
                "Grant subscription plans to any client (Enterprize, Plus, Premium)",
                "Log in as any client to assist them directly",
                "Grant free access or trials to specific clients",
                "Share your registration link to grow your client base",
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                  <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-yellow-500" /> {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
