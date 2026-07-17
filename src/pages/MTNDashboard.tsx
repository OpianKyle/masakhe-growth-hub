import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  LayoutDashboard, Users, Link2, User, LogOut, Menu, X,
  Copy, CheckCheck, MessageSquare, Mail, ExternalLink, Share2,
  Search, RefreshCw, CheckCircle2, TrendingUp, Crown,
  ArrowRight, Loader2, Eye, Zap, Star, Shield, CreditCard,
  BarChart2, ChevronRight, Sparkles, Megaphone, Plus, Trash2,
  Edit3, Upload, ImageIcon, Tag, Globe, Send, Clock,
  Building2, BadgeCheck, Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MTN_YELLOW = "#FFCC00";
const MTN_DARK   = "#1a1a1a";

const NAV_ITEMS = [
  { tab: "overview",   label: "Overview",    icon: LayoutDashboard },
  { tab: "clients",    label: "Clients",     icon: Users           },
  { tab: "promotions", label: "Promotions",  icon: Megaphone       },
  { tab: "link",       label: "Reg. Link",   icon: Link2           },
  { tab: "profile",    label: "Profile",     icon: User            },
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
    <div className={`${sz} rounded-xl flex items-center justify-center shrink-0 font-bold shadow-sm`}
      style={{ backgroundColor: MTN_YELLOW, color: MTN_DARK }}>
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
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [promotionsLoading, setPromotionsLoading] = useState(false);

  useEffect(() => { fetchMe(); }, []);
  useEffect(() => {
    if (activeTab === "clients") fetchClients();
    if (activeTab === "promotions") fetchPromotions();
  }, [activeTab]);

  async function fetchMe() {
    setLoading(true); setFetchError(null);
    try {
      const res = await fetch("/api/franchise/me", { credentials: "include" });
      if (res.status === 401) { navigate("/mtn"); return; }
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setFetchError(d.error || "Could not load your MTN portal data.");
        setLoading(false); return;
      }
      setData(await res.json());
    } catch { setFetchError("Network error — please refresh the page."); }
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

  async function fetchPromotions() {
    setPromotionsLoading(true);
    try {
      const res = await fetch("/api/franchise/promotions", { credentials: "include" });
      if (res.ok) setPromotions(await res.json());
    } catch {}
    setPromotionsLoading(false);
  }

  const franchise = data?.franchise;
  const stats     = data?.stats;
  const signupLink = franchise?.code
    ? `${window.location.origin}/mtn/register?franchise=${encodeURIComponent(franchise.code)}`
    : null;

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-950">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse shadow-lg"
        style={{ backgroundColor: MTN_YELLOW }}>
        <svg width="40" height="25" viewBox="0 0 90 56" fill="none">
          <ellipse cx="45" cy="28" rx="43" ry="26" stroke={MTN_DARK} strokeWidth="5" fill="none"/>
          <text x="45" y="36" textAnchor="middle" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="22" fill={MTN_DARK}>MTN</text>
        </svg>
      </div>
      <p className="text-white/50 text-sm">Loading MTN Business Portal…</p>
    </div>
  );

  if (fetchError) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 bg-slate-950">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
        style={{ backgroundColor: MTN_YELLOW }}>
        <svg width="40" height="25" viewBox="0 0 90 56" fill="none">
          <ellipse cx="45" cy="28" rx="43" ry="26" stroke={MTN_DARK} strokeWidth="5" fill="none"/>
          <text x="45" y="36" textAnchor="middle" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="22" fill={MTN_DARK}>MTN</text>
        </svg>
      </div>
      <div className="text-center max-w-sm">
        <p className="text-lg font-bold text-white mb-2">Portal Not Ready</p>
        <p className="text-sm text-white/50 mb-1">{fetchError}</p>
      </div>
      <div className="flex gap-3">
        <button onClick={fetchMe} className="px-5 py-2 rounded-lg text-sm font-semibold"
          style={{ backgroundColor: MTN_YELLOW, color: MTN_DARK }}>Retry</button>
        <button onClick={() => { authLogout(); navigate("/mtn"); }}
          className="px-5 py-2 rounded-lg text-sm font-semibold border border-white/20 text-white/70 hover:bg-white/10">
          Sign Out
        </button>
      </div>
    </div>
  );

  /* ── Sidebar — matches AdminDashboard: slate-950 bg, tinted yellow active nav ── */
  const SidebarContent = () => (
    <aside className="flex flex-col h-full bg-slate-950 border-r border-white/[0.06]">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
          style={{ backgroundColor: MTN_YELLOW }}>
          <svg width="26" height="16" viewBox="0 0 90 56" fill="none">
            <ellipse cx="45" cy="28" rx="43" ry="26" stroke={MTN_DARK} strokeWidth="7" fill="none"/>
            <text x="45" y="36" textAnchor="middle" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="22" fill={MTN_DARK}>MTN</text>
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white truncate leading-tight">{franchise?.name || "MTN Business"}</p>
          <p className="text-[11px] text-white/40 truncate">Business Portal</p>
        </div>
        <button className="lg:hidden text-white/40 hover:text-white/70" onClick={() => setSidebarOpen(false)}>
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav — tinted active state matching admin dashboard */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ tab, label, icon: Icon }) => {
          const isActive = activeTab === tab;
          return (
            <button key={tab} onClick={() => { setActiveTab(tab); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "text-white/60 hover:bg-white/[0.06] hover:text-white/90"
              }`}>
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
              {tab === "clients" && (stats?.total_clients ?? 0) > 0 && (
                <span className={`ml-auto text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none ${
                  isActive ? "bg-yellow-400/20 text-yellow-400" : "bg-white/10 text-white/50"
                }`}>
                  {stats.total_clients}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/[0.06] space-y-1.5">
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium bg-yellow-500/10 text-yellow-400">
          <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
          MTN Partner — Active
        </div>
        <button onClick={async () => { await authLogout(); navigate("/mtn"); }}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-all">
          <LogOut className="h-4 w-4 shrink-0" /> Sign Out
        </button>
      </div>

      {/* Decorative bottom bar — matches admin dashboard */}
      <div className="flex h-1">
        <div className="flex-1 bg-yellow-400" />
        <div className="flex-1 bg-yellow-500" />
        <div className="flex-1 bg-yellow-600" />
        <div className="flex-1 bg-yellow-700" />
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="hidden lg:flex lg:w-64 shrink-0 flex-col"><SidebarContent /></div>

      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"><SidebarContent /></div>
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header — matches admin: bg/80 + backdrop-blur */}
        <header className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
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
          <Badge className="border-0 bg-yellow-500/15 text-yellow-600 dark:text-yellow-400">Active</Badge>
        </header>

        <main className="flex-1 overflow-y-auto">
          {activeTab === "overview" && (
            <OverviewTab franchise={franchise} stats={stats} signupLink={signupLink} setActiveTab={setActiveTab} />
          )}
          {activeTab === "clients" && (
            <ClientsTab clients={clients} loading={clientsLoading} onRefresh={fetchClients} navigate={navigate} />
          )}
          {activeTab === "promotions" && (
            <PromotionsTab promotions={promotions} loading={promotionsLoading} onRefresh={fetchPromotions} franchise={franchise} />
          )}
          {activeTab === "link" && (
            <LinkTab franchise={franchise} signupLink={signupLink} />
          )}
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
      {/* Hero — slate-950 matching sidebar */}
      <div className="relative overflow-hidden px-6 py-10 bg-slate-950">
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, #FFCC00 1.5px, transparent 1.5px), radial-gradient(circle at 80% 20%, #FFCC00 1.5px, transparent 1.5px)",
          backgroundSize: "50px 50px",
        }} />
        <div className="absolute right-6 top-6 opacity-[0.07]">
          <svg width="140" height="88" viewBox="0 0 90 56" fill="none">
            <ellipse cx="45" cy="28" rx="43" ry="26" stroke={MTN_YELLOW} strokeWidth="4" fill="none"/>
            <text x="45" y="36" textAnchor="middle" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="22" fill={MTN_YELLOW}>MTN</text>
          </svg>
        </div>
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2 text-yellow-400">MTN Business Portal — Dashboard</p>
          <h2 className="text-3xl font-extrabold text-white mb-1.5">{franchise?.name || "MTN Business"}</h2>
          <p className="text-sm text-white/50">
            Partner Code: <span className="font-mono font-bold text-yellow-400">{franchise?.code || "—"}</span>
          </p>
        </div>
      </div>

      <div className="p-5 lg:p-6 space-y-6">
        {/* KPI cards — admin style: rounded-xl, border, tinted icon box */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 -mt-8 relative z-10">
          {[
            { icon: Users,        label: "Total Clients",        value: stats?.total_clients ?? 0, sub: "Registered businesses", tab: "clients", iconBg: "bg-yellow-500/10",   iconColor: "text-yellow-500"  },
            { icon: CheckCircle2, label: "Active Subscriptions", value: stats?.active_subs ?? 0,   sub: "Paying clients",        tab: "clients", iconBg: "bg-emerald-500/10",  iconColor: "text-emerald-500" },
            { icon: TrendingUp,   label: "Enterprize Plus",      value: stats?.pro_count ?? 0,     sub: "Pro tier clients",      tab: "clients", iconBg: "bg-blue-500/10",     iconColor: "text-blue-500"    },
            { icon: Crown,        label: "Enterprize Premium",   value: stats?.premium_count ?? 0, sub: "Top tier clients",      tab: "clients", iconBg: "bg-violet-500/10",   iconColor: "text-violet-500"  },
          ].map((c) => (
            <div key={c.label} onClick={() => setActiveTab(c.tab)}
              className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-start gap-3.5 cursor-pointer hover:border-yellow-400/40 hover:shadow-md transition-all group">
              <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0`}>
                <c.icon className={`h-5 w-5 ${c.iconColor}`} />
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
              { label: "Share Registration Link", desc: "Invite MTN businesses to join",  icon: Share2, tab: "link",    iconBg: "bg-yellow-500/10",  iconColor: "text-yellow-500"  },
              { label: "Manage Clients",           desc: "View and assist your clients",   icon: Users,  tab: "clients", iconBg: "bg-blue-500/10",    iconColor: "text-blue-500"    },
              { label: "View Profile",             desc: "MTN partner details & code",    icon: User,   tab: "profile", iconBg: "bg-violet-500/10",  iconColor: "text-violet-500"  },
            ].map(a => (
              <button key={a.tab} onClick={() => setActiveTab(a.tab)}
                className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-yellow-400/40 hover:shadow-md transition-all text-left group">
                <div className={`w-11 h-11 rounded-xl ${a.iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                  <a.icon className={`h-5 w-5 ${a.iconColor}`} />
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
            <div className="bg-card border border-border rounded-xl p-5">
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
                  onClick={() => { const msg = encodeURIComponent(`Register your business on Masakhe — the MTN Business Platform!\n\n${signupLink}`); window.open(`https://wa.me/?text=${msg}`, "_blank"); }}>
                  <MessageSquare className="h-4 w-4 text-green-600" /> WhatsApp
                </Button>
              </div>
            </div>

            <div className="rounded-xl p-5 flex items-center justify-between border"
              style={{ background: `linear-gradient(135deg, ${MTN_YELLOW}18 0%, ${MTN_YELLOW}06 100%)`, borderColor: `${MTN_YELLOW}35` }}>
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

/* ─── Clients Tab — "Log in as" only, no trial/plan buttons ────────────────── */
function ClientsTab({ clients, loading, onRefresh, navigate }: any) {
  const [search, setSearch] = useState("");
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

  const filtered = clients.filter((c: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${c.full_name} ${c.email} ${c.business_name || ""}`.toLowerCase().includes(q);
  });

  const impersonate = async (c: any) => {
    if (!confirm(`Log in as ${c.full_name}? You can return to the MTN Portal afterwards.`)) return;
    setImpersonatingId(c.id);
    try {
      const res = await fetch(`/api/franchise/clients/${c.id}/impersonate`, {
        method: "POST", credentials: "include",
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error || "Action failed"); return; }
      toast.success(`Now logged in as ${c.full_name}`);
      navigate("/dashboard");
      window.location.reload();
    } finally { setImpersonatingId(null); }
  };

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden px-6 py-10 bg-slate-950">
        <div className="absolute right-0 top-0 opacity-[0.06]"><Users className="h-48 w-48 text-white" /></div>
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2 text-yellow-400">Client Management</p>
          <h2 className="text-2xl font-extrabold text-white mb-1">MTN Business Clients</h2>
          <p className="text-sm text-white/50">{clients.length} client{clients.length !== 1 ? "s" : ""} registered under your MTN partner account</p>
        </div>
      </div>

      <div className="p-5 lg:p-6 space-y-4">
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
          <div className="bg-card border border-border rounded-xl p-16 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm bg-yellow-500/10">
              <Users className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="font-bold text-foreground text-lg mb-2">{search ? "No matches found" : "No clients yet"}</p>
            <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
              {search ? "Try a different search term." : "Share your registration link and businesses will appear here when they sign up."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c: any) => {
              const isLoading = impersonatingId === c.id;
              const hasSub = c.subscription_status === "active" || c.subscription_exempt;
              const subLabel = c.subscription_exempt
                ? "Free Access"
                : c.current_plan ? PLAN_NAMES[c.current_plan] || c.current_plan : null;

              return (
                <div key={c.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md hover:border-yellow-400/30 transition-all">
                  <div className="flex items-center gap-4">
                    <InitialAvatar name={c.full_name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <p className="font-semibold text-foreground">{c.full_name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{c.email}</p>
                          {c.business_name && <p className="text-xs text-muted-foreground">{c.business_name}</p>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {hasSub ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-[10px]">
                              {subLabel || "Active"}
                            </Badge>
                          ) : (
                            <Badge className="bg-muted text-muted-foreground border-0 text-[10px]">No Plan</Badge>
                          )}
                          <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs gap-1.5" onClick={() => impersonate(c)} disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}
                            Log in as
                          </Button>
                        </div>
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
    const body = encodeURIComponent(`Hi,\n\nJoin the MTN Business Platform powered by Masakhe:\n\n${signupLink}\n\nOr enter partner code: ${franchise?.code}\n\nBest regards,\n${franchise?.name || "MTN Business"}`);
    window.open(`mailto:?subject=${sub}&body=${body}`);
  }

  return (
    <div>
      <div className="relative overflow-hidden px-6 py-12 bg-slate-950">
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `radial-gradient(circle, ${MTN_YELLOW} 1.5px, transparent 1.5px)`, backgroundSize: "40px 40px" }} />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 border rounded-full px-3 py-1 mb-4 bg-yellow-500/10 border-yellow-500/20">
            <Link2 className="h-3.5 w-3.5 text-yellow-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-yellow-400">Grow Your Network</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-2">Registration Link</h2>
          <p className="text-sm leading-relaxed text-white/50">
            Share your unique link with businesses — they'll be automatically linked to <strong className="text-white">{franchise?.name || "your MTN account"}</strong> the moment they sign up.
          </p>
        </div>
      </div>

      <div className="p-5 lg:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-border bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5" /> Your Unique Registration URL
                </p>
                <p className="font-mono text-sm text-foreground break-all leading-relaxed bg-muted/50 rounded-lg px-3 py-2">
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

            <div className="rounded-xl p-5 flex items-center justify-between border"
              style={{ background: `linear-gradient(to right, ${MTN_YELLOW}18, ${MTN_YELLOW}06)`, borderColor: `${MTN_YELLOW}35` }}>
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

            <div className="rounded-xl p-5 bg-yellow-500/5 border border-yellow-500/15">
              <p className="text-sm font-bold mb-3 flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                <Sparkles className="h-4 w-4" /> Sharing Tips
              </p>
              <ul className="space-y-2">
                {[
                  "Share via MTN dealer WhatsApp groups and business networks",
                  "Post on your MTN business social media channels",
                  "Include in MTN partner newsletters and email campaigns",
                  "Display QR code with this link at MTN business events",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-yellow-700/80 dark:text-yellow-400/70">
                    <Star className="h-3 w-3 mt-0.5 shrink-0" /> {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-5">
            <div className="relative rounded-xl overflow-hidden h-52">
              <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80" alt="MTN Business" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-bold text-lg leading-tight">Grow the MTN business community</p>
                <p className="text-white/80 text-xs mt-1">Every registered business gets access to powerful free tools</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-sm font-bold text-foreground mb-5 flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" /> How it works
              </p>
              <div className="space-y-4">
                {[
                  { step: 1, title: "Share the link",     desc: "Send via WhatsApp, email, or social media.",            iconBg: "bg-yellow-500/10",  iconColor: "text-yellow-500"  },
                  { step: 2, title: "Business registers", desc: "The SMME completes the free Masakhe registration.",      iconBg: "bg-blue-500/10",    iconColor: "text-blue-500"    },
                  { step: 3, title: "Auto-linked to you", desc: "They appear in your Clients tab immediately.",           iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
                  { step: 4, title: "Manage & support",   desc: "Log in as them to assist, and track their activity.",   iconBg: "bg-violet-500/10",  iconColor: "text-violet-500"  },
                ].map(s => (
                  <div key={s.step} className="flex gap-4 items-start">
                    <div className={`w-9 h-9 rounded-xl ${s.iconBg} ${s.iconColor} flex items-center justify-center shrink-0 font-bold text-sm`}>{s.step}</div>
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
                { value: "Free",    label: "For all businesses", iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
                { value: "24/7",    label: "Platform access",    iconBg: "bg-yellow-500/10",  iconColor: "text-yellow-500"  },
                { value: "1-click", label: "Auto-link sign-up",  iconBg: "bg-violet-500/10",  iconColor: "text-violet-500"  },
              ].map(stat => (
                <div key={stat.label} className="bg-card border border-border rounded-xl p-4 text-center">
                  <div className={`text-lg font-black ${stat.iconColor}`}>{stat.value}</div>
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

/* ─── Promotions Tab ───────────────────────────────────────────────────────── */
const PROMO_TYPES = [
  { value: "phone_ad",    label: "Phone Ad",      icon: Smartphone,  color: "text-blue-500",    bg: "bg-blue-500/10"    },
  { value: "social_post", label: "Social Post",   icon: Share2,      color: "text-violet-500",  bg: "bg-violet-500/10"  },
  { value: "campaign",    label: "Campaign",      icon: Megaphone,   color: "text-yellow-500",  bg: "bg-yellow-500/10"  },
  { value: "offer",       label: "Special Offer", icon: Tag,         color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

const PROMO_STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  draft:     { label: "Draft",     cls: "bg-muted text-muted-foreground border-0" },
  active:    { label: "Active",    cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0" },
  scheduled: { label: "Scheduled", cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0" },
  ended:     { label: "Ended",     cls: "bg-muted text-muted-foreground border-0" },
};

const EMPTY_FORM = {
  title: "", description: "", promo_type: "campaign",
  image_url: "", cta_text: "", cta_url: "",
  status: "draft", target_audience: "all", scheduled_at: "",
};

function MtnAdPreview({ form, franchise }: { form: typeof EMPTY_FORM; franchise: any }) {
  const typeConf = PROMO_TYPES.find(t => t.value === form.promo_type) || PROMO_TYPES[2];
  return (
    <div className="rounded-2xl overflow-hidden border shadow-lg" style={{ background: MTN_DARK }}>
      {/* header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: MTN_YELLOW }}>
            <svg width="18" height="11" viewBox="0 0 90 56" fill="none">
              <ellipse cx="45" cy="28" rx="43" ry="26" stroke={MTN_DARK} strokeWidth="8" fill="none"/>
              <text x="45" y="36" textAnchor="middle" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="22" fill={MTN_DARK}>MTN</text>
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-bold text-white leading-none">{franchise?.name || "MTN Business"}</p>
            <p className="text-[9px] text-white/40 mt-0.5">Sponsored</p>
          </div>
        </div>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: MTN_YELLOW, color: MTN_DARK }}>
          {typeConf.label}
        </span>
      </div>

      {/* image area */}
      <div className="relative bg-black/40 flex items-center justify-center overflow-hidden" style={{ minHeight: 160 }}>
        {form.image_url ? (
          <img src={form.image_url} alt="Promo" className="w-full object-cover" style={{ maxHeight: 220 }} />
        ) : (
          <div className="flex flex-col items-center gap-2 py-12 text-white/20">
            <ImageIcon className="h-10 w-10" />
            <p className="text-xs">Upload an image to preview</p>
          </div>
        )}
        {/* MTN watermark */}
        <div className="absolute top-3 right-3 opacity-30">
          <svg width="36" height="22" viewBox="0 0 90 56" fill="none">
            <ellipse cx="45" cy="28" rx="43" ry="26" stroke={MTN_YELLOW} strokeWidth="5" fill="none"/>
            <text x="45" y="36" textAnchor="middle" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="22" fill={MTN_YELLOW}>MTN</text>
          </svg>
        </div>
      </div>

      {/* content */}
      <div className="px-4 py-3">
        <p className="text-sm font-bold text-white leading-snug">
          {form.title || <span className="text-white/30 font-normal italic">Promotion title</span>}
        </p>
        {form.description && (
          <p className="text-[11px] text-white/60 mt-1 leading-relaxed line-clamp-2">{form.description}</p>
        )}
      </div>

      {/* CTA */}
      <div className="px-4 pb-4">
        <div className="rounded-lg py-2.5 text-center text-sm font-bold" style={{ backgroundColor: MTN_YELLOW, color: MTN_DARK }}>
          {form.cta_text || "Learn More"}
        </div>
      </div>

      {/* footer */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <p className="text-[9px] text-white/30">MTN Business Portal · Powered by Masakhe</p>
        <div className="flex items-center gap-2">
          {[Share2, MessageSquare].map((Icon, i) => (
            <button key={i} className="text-white/30 hover:text-white/60"><Icon className="h-3.5 w-3.5" /></button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PromotionsTab({ promotions, loading, onRefresh, franchise }: any) {
  const [view, setView] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [search, setSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function openCreate() {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setView("form");
  }

  function openEdit(p: any) {
    setForm({
      title: p.title || "", description: p.description || "",
      promo_type: p.promo_type || "campaign", image_url: p.image_url || "",
      cta_text: p.cta_text || "", cta_url: p.cta_url || "",
      status: p.status || "draft", target_audience: p.target_audience || "all",
      scheduled_at: p.scheduled_at ? p.scheduled_at.slice(0, 16) : "",
    });
    setEditingId(p.id);
    setView("form");
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
      const d = await res.json();
      if (d.url) setForm(f => ({ ...f, image_url: d.url }));
      else toast.error("Image upload failed");
    } catch { toast.error("Upload error"); }
    setImageUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSave() {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const body = { ...form, scheduled_at: form.scheduled_at || null };
      const url = editingId ? `/api/franchise/promotions/${editingId}` : "/api/franchise/promotions";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error || "Save failed"); return; }
      toast.success(editingId ? "Promotion updated!" : "Promotion created!");
      await onRefresh();
      setView("list");
    } catch { toast.error("Something went wrong"); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this promotion? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/franchise/promotions/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) { toast.success("Promotion deleted"); await onRefresh(); }
      else toast.error("Delete failed");
    } catch { toast.error("Something went wrong"); }
    setDeleting(null);
  }

  const filtered = promotions.filter((p: any) =>
    !search || `${p.title} ${p.description || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Form view ── */
  if (view === "form") return (
    <div>
      <div className="relative overflow-hidden px-6 py-10 bg-slate-950">
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `radial-gradient(circle, ${MTN_YELLOW} 1.5px, transparent 1.5px)`, backgroundSize: "40px 40px" }} />
        <div className="relative z-10 flex items-center gap-4">
          <button onClick={() => setView("list")} className="text-white/50 hover:text-white transition-colors">
            <ArrowRight className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-yellow-400">
              {editingId ? "Edit Promotion" : "New Promotion"}
            </p>
            <h2 className="text-2xl font-extrabold text-white">{form.title || "Untitled Promotion"}</h2>
          </div>
        </div>
      </div>

      <div className="p-5 lg:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-5xl">

          {/* ── Left: Form fields ── */}
          <div className="space-y-5">
            {/* Type */}
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Promotion Type</p>
              <div className="grid grid-cols-2 gap-2">
                {PROMO_TYPES.map(t => (
                  <button key={t.value} onClick={() => setForm(f => ({ ...f, promo_type: t.value }))}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border text-left transition-all ${
                      form.promo_type === t.value
                        ? "border-yellow-400/60 bg-yellow-500/10"
                        : "border-border hover:border-yellow-400/30 hover:bg-muted/50"
                    }`}>
                    <div className={`w-8 h-8 rounded-lg ${t.bg} flex items-center justify-center shrink-0`}>
                      <t.icon className={`h-4 w-4 ${t.color}`} />
                    </div>
                    <span className={`text-sm font-semibold ${form.promo_type === t.value ? "text-yellow-600 dark:text-yellow-400" : "text-foreground"}`}>
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Content</p>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Title *</Label>
                <Input className="mt-1.5 h-10" placeholder="e.g. MTN Summer Phone Deal" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description</Label>
                <Textarea className="mt-1.5 min-h-[90px] resize-none" placeholder="Describe your promotion…"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              {/* Image upload */}
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {form.promo_type === "phone_ad" ? "Phone / Product Image" : "Promotion Image"}
                </Label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                {form.image_url ? (
                  <div className="mt-1.5 relative rounded-xl overflow-hidden border border-border bg-muted/30">
                    <img src={form.image_url} alt="Preview" className="w-full max-h-52 object-contain" />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button onClick={() => fileRef.current?.click()}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow"
                        style={{ backgroundColor: MTN_YELLOW, color: MTN_DARK }}>
                        Change
                      </button>
                      <button onClick={() => setForm(f => ({ ...f, image_url: "" }))}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-black/60 text-white shadow">
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current?.click()} disabled={imageUploading}
                    className="mt-1.5 w-full border-2 border-dashed border-border hover:border-yellow-400/50 rounded-xl flex flex-col items-center gap-2 py-8 text-muted-foreground hover:text-yellow-500 transition-all">
                    {imageUploading
                      ? <><Loader2 className="h-6 w-6 animate-spin" /><span className="text-xs">Uploading…</span></>
                      : <><Upload className="h-6 w-6" /><span className="text-xs font-medium">Click to upload image</span><span className="text-[10px]">PNG, JPG, WebP up to 10MB</span></>}
                  </button>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Call to Action</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Button Text</Label>
                  <Input className="mt-1.5 h-10" placeholder="Learn More" value={form.cta_text}
                    onChange={e => setForm(f => ({ ...f, cta_text: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Button URL</Label>
                  <Input className="mt-1.5 h-10" placeholder="https://..." value={form.cta_url}
                    onChange={e => setForm(f => ({ ...f, cta_url: e.target.value }))} />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Settings</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger className="mt-1.5 h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="ended">Ended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Audience</Label>
                  <Select value={form.target_audience} onValueChange={v => setForm(f => ({ ...f, target_audience: v }))}>
                    <SelectTrigger className="mt-1.5 h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Clients</SelectItem>
                      <SelectItem value="active">Active Subscribers</SelectItem>
                      <SelectItem value="trial">Trial Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {form.status === "scheduled" && (
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Schedule Date & Time</Label>
                  <Input type="datetime-local" className="mt-1.5 h-10" value={form.scheduled_at}
                    onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={saving} className="flex-1 h-11 font-semibold gap-2"
                style={{ backgroundColor: MTN_YELLOW, color: MTN_DARK, border: "none" }}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {saving ? "Saving…" : editingId ? "Update Promotion" : "Publish Promotion"}
              </Button>
              <Button variant="outline" onClick={() => setView("list")} className="h-11 px-5">Cancel</Button>
            </div>
          </div>

          {/* ── Right: Live MTN-branded preview ── */}
          <div className="space-y-4">
            <div className="sticky top-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Eye className="h-3.5 w-3.5" /> Live Preview
              </p>
              <MtnAdPreview form={form} franchise={franchise} />
              <p className="text-[10px] text-muted-foreground text-center mt-3">
                This is how your promotion will appear to MTN clients
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ── List view ── */
  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden px-6 py-10 bg-slate-950">
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `radial-gradient(circle, ${MTN_YELLOW} 1.5px, transparent 1.5px)`, backgroundSize: "40px 40px" }} />
        <div className="absolute right-6 top-6 opacity-[0.06]">
          <Megaphone className="h-36 w-36 text-white" />
        </div>
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2 text-yellow-400">Marketing</p>
          <h2 className="text-2xl font-extrabold text-white mb-1">Promotions & Campaigns</h2>
          <p className="text-sm text-white/50">Create phone ads, social posts, and branded campaigns for your MTN clients.</p>
        </div>
      </div>

      <div className="p-5 lg:p-6 space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 -mt-8 relative z-10">
          {[
            { label: "Total",     value: promotions.length,                                                      icon: Megaphone,   iconBg: "bg-yellow-500/10",  iconColor: "text-yellow-500"  },
            { label: "Active",    value: promotions.filter((p:any) => p.status === "active").length,             icon: Zap,         iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
            { label: "Draft",     value: promotions.filter((p:any) => p.status === "draft").length,              icon: Edit3,       iconBg: "bg-blue-500/10",    iconColor: "text-blue-500"    },
            { label: "Scheduled", value: promotions.filter((p:any) => p.status === "scheduled").length,          icon: Clock,       iconBg: "bg-violet-500/10",  iconColor: "text-violet-500"  },
          ].map(c => (
            <div key={c.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <div className={`w-9 h-9 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0`}>
                <c.icon className={`h-4 w-4 ${c.iconColor}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className="text-xl font-extrabold text-foreground leading-tight">{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search promotions…" className="pl-9 rounded-xl" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={openCreate} className="gap-2 rounded-xl font-semibold"
            style={{ backgroundColor: MTN_YELLOW, color: MTN_DARK, border: "none" }}>
            <Plus className="h-4 w-4" /> New Promotion
          </Button>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-xl p-16 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm bg-yellow-500/10">
              <Megaphone className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="font-bold text-foreground text-lg mb-2">{search ? "No matches" : "No promotions yet"}</p>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
              {search ? "Try a different search term." : "Create your first MTN-branded promotion, phone ad, or campaign to engage your client base."}
            </p>
            {!search && (
              <Button onClick={openCreate} className="gap-2 font-semibold"
                style={{ backgroundColor: MTN_YELLOW, color: MTN_DARK, border: "none" }}>
                <Plus className="h-4 w-4" /> Create First Promotion
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((p: any) => {
              const typeConf = PROMO_TYPES.find(t => t.value === p.promo_type) || PROMO_TYPES[2];
              const statusConf = PROMO_STATUS_CONFIG[p.status] || PROMO_STATUS_CONFIG.draft;
              const isDeleting = deleting === p.id;
              return (
                <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-yellow-400/30 transition-all group flex flex-col">
                  {/* Image or placeholder */}
                  <div className="relative bg-slate-950 flex items-center justify-center overflow-hidden" style={{ height: 160 }}>
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-white/20">
                        <typeConf.icon className="h-10 w-10" />
                        <p className="text-xs">No image</p>
                      </div>
                    )}
                    {/* MTN overlay branding on image */}
                    <div className="absolute top-2 left-2">
                      <div className="rounded-md px-2 py-0.5 text-[9px] font-black" style={{ backgroundColor: MTN_YELLOW, color: MTN_DARK }}>MTN</div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge className={`text-[10px] ${statusConf.cls}`}>{statusConf.label}</Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-6 h-6 rounded-md ${typeConf.bg} flex items-center justify-center shrink-0`}>
                        <typeConf.icon className={`h-3 w-3 ${typeConf.color}`} />
                      </div>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{typeConf.label}</span>
                    </div>
                    <p className="font-bold text-foreground text-sm leading-snug mb-1 line-clamp-2">{p.title}</p>
                    {p.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2">{p.description}</p>
                    )}
                    {p.target_audience && (
                      <div className="flex items-center gap-1 mt-auto pt-2">
                        <Users className="h-3 w-3 text-muted-foreground/60" />
                        <span className="text-[10px] text-muted-foreground capitalize">
                          {p.target_audience === "all" ? "All clients" : p.target_audience === "active" ? "Active subscribers" : "Trial users"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="px-4 pb-4 flex gap-2 border-t border-border pt-3">
                    <Button size="sm" variant="outline" className="flex-1 gap-1.5 h-8 rounded-lg text-xs" onClick={() => openEdit(p)}>
                      <Edit3 className="h-3 w-3" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 rounded-lg px-3 text-red-500 hover:text-red-600 hover:border-red-300"
                      onClick={() => handleDelete(p.id)} disabled={isDeleting}>
                      {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                    </Button>
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

/* ─── Profile Tab ──────────────────────────────────────────────────────────── */
function ProfileTab({ franchise, stats }: any) {
  return (
    <div>
      <div className="relative overflow-hidden px-6 py-12 bg-slate-950">
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `radial-gradient(circle, ${MTN_YELLOW} 1.5px, transparent 1.5px)`, backgroundSize: "45px 45px" }} />
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-lg"
            style={{ backgroundColor: MTN_YELLOW }}>
            <svg width="44" height="28" viewBox="0 0 90 56" fill="none">
              <ellipse cx="45" cy="28" rx="43" ry="26" stroke={MTN_DARK} strokeWidth="5" fill="none"/>
              <text x="45" y="36" textAnchor="middle" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="22" fill={MTN_DARK}>MTN</text>
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1 text-yellow-400">MTN Partner Profile</p>
            <h2 className="text-3xl font-extrabold text-white">{franchise?.name || "MTN Business"}</h2>
            <p className="text-sm mt-1 text-white/50">
              Partner Code: <span className="font-mono font-bold text-yellow-400">{franchise?.code}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 lg:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Building2 className="h-3.5 w-3.5 text-yellow-500" />
                </div>
                <p className="text-sm font-bold text-foreground">Partner Information</p>
              </div>
              <div className="p-5 space-y-3">
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

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <BarChart2 className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <p className="text-sm font-bold text-foreground">Partner Summary</p>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { label: "Total Clients",        value: `${stats?.total_clients ?? 0} businesses`,   icon: Users,        color: "text-yellow-500"  },
                  { label: "Active Subscriptions", value: `${stats?.active_subs ?? 0} paying clients`, icon: CreditCard,   color: "text-emerald-500" },
                  { label: "Enterprize Plus",      value: `${stats?.pro_count ?? 0} clients`,          icon: TrendingUp,   color: "text-blue-500"    },
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

          <div className="space-y-5">
            <div className="relative rounded-xl overflow-hidden h-52">
              <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80" alt="MTN Business" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex items-end p-4">
                <div>
                  <p className="text-white font-bold text-lg">{franchise?.name || "MTN Business"}</p>
                  <p className="text-white/80 text-xs mt-0.5">MTN Partner Portal — Powered by Masakhe</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl p-5 border"
              style={{ background: `linear-gradient(to right, ${MTN_YELLOW}15, ${MTN_YELLOW}05)`, borderColor: `${MTN_YELLOW}30` }}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">MTN Partner Code</p>
              <p className="text-4xl font-black font-mono text-foreground tracking-widest">{franchise?.code || "—"}</p>
              <p className="text-xs text-muted-foreground mt-1.5">This code is permanent and cannot be changed.</p>
              <Button size="sm" variant="outline" className="mt-3 gap-2"
                onClick={() => { navigator.clipboard.writeText(franchise?.code); toast.success("Code copied!"); }}>
                <Copy className="h-3.5 w-3.5" /> Copy Code
              </Button>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <p className="text-sm font-bold text-foreground flex items-center gap-2">
                <Shield className="h-4 w-4 text-yellow-500" /> What you can do as MTN Partner
              </p>
              {[
                "View and manage all MTN-linked business clients",
                "Log in as any client to assist them directly",
                "Share your registration link to grow your client base",
                "Monitor client subscription status at a glance",
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
