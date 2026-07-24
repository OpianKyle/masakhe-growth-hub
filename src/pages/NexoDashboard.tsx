import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  LayoutDashboard, Users, Link2, User, LogOut, Menu, X,
  Copy, CheckCheck, MessageSquare, ArrowRight, Loader2, Eye,
  Crown, TrendingUp, CheckCircle2, ChevronRight, Share2,
  Search, RefreshCw, BadgeCheck, Building2, BarChart2,
  CreditCard, Plus, Megaphone, Edit3, Trash2, Send, Clock,
  Zap, Tag, Upload, ImageIcon, Globe, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NEXO_BLUE  = "#2563eb";
const NEXO_DARK  = "#0f172a";
const NEXO_SLATE = "#1e293b";

const NAV_ITEMS = [
  { tab: "overview",    label: "Overview",   icon: LayoutDashboard },
  { tab: "clients",     label: "Clients",    icon: Users           },
  { tab: "promotions",  label: "Promotions", icon: Megaphone       },
  { tab: "link",        label: "Reg. Link",  icon: Link2           },
  { tab: "profile",     label: "Profile",    icon: User            },
];

const PLAN_NAMES: Record<string, string> = {
  starter: "Nexo Starter",
  pro:     "Nexo Pro",
  premium: "Nexo Premium",
};

function InitialAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name ? name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) : "?";
  const sz = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-14 h-14 text-lg" : "w-10 h-10 text-sm";
  return (
    <div className={`${sz} rounded-xl flex items-center justify-center shrink-0 font-bold shadow-sm text-white`}
      style={{ background: `linear-gradient(135deg, ${NEXO_BLUE}, #1d4ed8)` }}>
      {initials}
    </div>
  );
}

export default function NexoDashboard() {
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
      if (res.status === 401) { navigate("/nexo"); return; }
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setFetchError(d.error || "Could not load your Nexo portal data.");
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
    ? `${window.location.origin}/nexo/register?franchise=${encodeURIComponent(franchise.code)}`
    : null;

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: NEXO_DARK }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse shadow-lg overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${NEXO_BLUE}, #1d4ed8)` }}>
        <img src="/nexo-logo.png" alt="Nexo" className="h-10 object-contain" style={{ filter: "brightness(0) invert(1)" }} />
      </div>
      <p className="text-white/50 text-sm">Loading Nexo Business Portal…</p>
    </div>
  );

  if (fetchError) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8" style={{ backgroundColor: NEXO_DARK }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${NEXO_BLUE}, #1d4ed8)` }}>
        <img src="/nexo-logo.png" alt="Nexo" className="h-10 object-contain" style={{ filter: "brightness(0) invert(1)" }} />
      </div>
      <div className="text-center max-w-sm">
        <p className="text-lg font-bold text-white mb-2">Portal Not Ready</p>
        <p className="text-sm text-white/50 mb-1">{fetchError}</p>
      </div>
      <div className="flex gap-3">
        <button onClick={fetchMe} className="px-5 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ backgroundColor: NEXO_BLUE }}>Retry</button>
        <button onClick={() => { authLogout(); navigate("/nexo"); }}
          className="px-5 py-2 rounded-lg text-sm font-semibold border border-white/20 text-white/70 hover:bg-white/10">
          Sign Out
        </button>
      </div>
    </div>
  );

  const SidebarContent = () => (
    <aside className="flex flex-col h-full border-r border-white/[0.06]" style={{ backgroundColor: NEXO_DARK }}>
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${NEXO_BLUE}, #1d4ed8)` }}>
          <img src="/nexo-logo.png" alt="Nexo" className="h-6 w-6 object-contain" style={{ filter: "brightness(0) invert(1)" }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white truncate leading-tight">{franchise?.name || "Nexo Business"}</p>
          <p className="text-[11px] text-white/40 truncate">Business Portal</p>
        </div>
        <button className="lg:hidden text-white/40 hover:text-white/70" onClick={() => setSidebarOpen(false)}>
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ tab, label, icon: Icon }) => {
          const isActive = activeTab === tab;
          return (
            <button key={tab} onClick={() => { setActiveTab(tab); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "text-white"
                  : "text-white/60 hover:bg-white/[0.06] hover:text-white/90"
              }`}
              style={isActive ? { backgroundColor: `${NEXO_BLUE}33` } : {}}>
              <Icon className="h-4 w-4 shrink-0" style={isActive ? { color: NEXO_BLUE } : {}} />
              <span style={isActive ? { color: "#93c5fd" } : {}}>{label}</span>
              {tab === "clients" && (stats?.total_clients ?? 0) > 0 && (
                <span className={`ml-auto text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none ${
                  isActive ? "text-blue-300" : "bg-white/10 text-white/50"
                }`}
                  style={isActive ? { backgroundColor: `${NEXO_BLUE}40` } : {}}>
                  {stats.total_clients}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/[0.06] space-y-1.5">
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium"
          style={{ backgroundColor: `${NEXO_BLUE}20`, color: "#93c5fd" }}>
          <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
          Nexo Partner — Active
        </div>
        <button onClick={async () => { await authLogout(); navigate("/nexo"); }}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-all">
          <LogOut className="h-4 w-4 shrink-0" /> Sign Out
        </button>
      </div>

      {/* Decorative bottom bar */}
      <div className="flex h-1">
        <div className="flex-1" style={{ background: NEXO_BLUE }} />
        <div className="flex-1" style={{ background: "#1d4ed8" }} />
        <div className="flex-1" style={{ background: "#1e40af" }} />
        <div className="flex-1" style={{ background: "#1e3a8a" }} />
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
          <Badge className="border-0" style={{ backgroundColor: `${NEXO_BLUE}20`, color: NEXO_BLUE }}>Active</Badge>
        </header>

        <main className="flex-1 overflow-y-auto">
          {activeTab === "overview"   && <OverviewTab franchise={franchise} stats={stats} signupLink={signupLink} setActiveTab={setActiveTab} />}
          {activeTab === "clients"    && <ClientsTab clients={clients} loading={clientsLoading} onRefresh={fetchClients} navigate={navigate} />}
          {activeTab === "promotions" && <PromotionsTab promotions={promotions} loading={promotionsLoading} onRefresh={fetchPromotions} franchise={franchise} />}
          {activeTab === "link"       && <LinkTab franchise={franchise} signupLink={signupLink} />}
          {activeTab === "profile"    && <ProfileTab franchise={franchise} stats={stats} />}
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
      <div className="relative overflow-hidden px-6 py-10" style={{ backgroundColor: NEXO_DARK }}>
        <div className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, ${NEXO_BLUE} 1.5px, transparent 1.5px), radial-gradient(circle at 80% 20%, ${NEXO_BLUE} 1.5px, transparent 1.5px)`,
            backgroundSize: "50px 50px",
          }}
        />
        <div className="absolute right-6 top-6 opacity-[0.06]">
          <img src="/nexo-logo.png" alt="" className="w-36 h-auto object-contain" style={{ filter: "brightness(0) invert(1)" }} />
        </div>
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#93c5fd" }}>Nexo Business Portal — Dashboard</p>
          <h2 className="text-3xl font-extrabold text-white mb-1.5">{franchise?.name || "Nexo Business"}</h2>
          <p className="text-sm text-white/50">
            Partner Code: <span className="font-mono font-bold" style={{ color: "#93c5fd" }}>{franchise?.code || "—"}</span>
          </p>
        </div>
      </div>

      <div className="p-5 lg:p-6 space-y-6">
        {/* KPI cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 -mt-8 relative z-10">
          {[
            { icon: Users,        label: "Total Clients",       value: stats?.total_clients ?? 0, sub: "Registered businesses", tab: "clients", iconBg: "bg-blue-500/10",   iconColor: "text-blue-500"    },
            { icon: CheckCircle2, label: "Active Subscriptions",value: stats?.active_subs ?? 0,   sub: "Paying clients",        tab: "clients", iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
            { icon: TrendingUp,   label: "Nexo Pro",            value: stats?.pro_count ?? 0,     sub: "Pro tier clients",      tab: "clients", iconBg: "bg-violet-500/10",  iconColor: "text-violet-500"  },
            { icon: Crown,        label: "Nexo Premium",        value: stats?.premium_count ?? 0, sub: "Top tier clients",      tab: "clients", iconBg: "bg-amber-500/10",   iconColor: "text-amber-500"   },
          ].map((c) => (
            <div key={c.label} onClick={() => setActiveTab(c.tab)}
              className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-start gap-3.5 cursor-pointer hover:shadow-md transition-all group"
              style={{ ["--hover-border" as string]: `${NEXO_BLUE}40` }}>
              <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0`}>
                <c.icon className={`h-5 w-5 ${c.iconColor}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className="text-2xl font-extrabold text-foreground leading-tight mt-0.5">{c.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-1 transition-colors group-hover:text-blue-500" />
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Share Registration Link", desc: "Invite clients to join Nexo",    icon: Share2, tab: "link",    iconBg: "bg-blue-500/10",   iconColor: "text-blue-500"   },
              { label: "Manage Clients",           desc: "View and assist your clients",  icon: Users,  tab: "clients", iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500"},
              { label: "View Profile",             desc: "Nexo partner details & code",   icon: User,   tab: "profile", iconBg: "bg-violet-500/10",  iconColor: "text-violet-500" },
            ].map(a => (
              <button key={a.tab} onClick={() => setActiveTab(a.tab)}
                className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all text-left group">
                <div className={`w-11 h-11 rounded-xl ${a.iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                  <a.icon className={`h-5 w-5 ${a.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{a.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-blue-500 ml-auto shrink-0 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>

        {/* Registration link */}
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
                <Button className="gap-2 text-sm font-semibold text-white" style={{ backgroundColor: NEXO_BLUE, border: "none" }} onClick={copyLink}>
                  {linkCopied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {linkCopied ? "Copied!" : "Copy Link"}
                </Button>
                <Button variant="outline" className="gap-2 text-sm"
                  onClick={() => { const msg = encodeURIComponent(`Register your business on Masakhe — the Nexo Business Platform!\n\n${signupLink}`); window.open(`https://wa.me/?text=${msg}`, "_blank"); }}>
                  <MessageSquare className="h-4 w-4 text-green-600" /> WhatsApp
                </Button>
              </div>
            </div>

            <div className="rounded-xl p-5 flex items-center justify-between border"
              style={{ background: `linear-gradient(135deg, ${NEXO_BLUE}15 0%, ${NEXO_BLUE}06 100%)`, borderColor: `${NEXO_BLUE}30` }}>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Nexo Partner Code</p>
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
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

  const filtered = clients.filter((c: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${c.full_name} ${c.email} ${c.business_name || ""}`.toLowerCase().includes(q);
  });

  const impersonate = async (c: any) => {
    if (!confirm(`Log in as ${c.full_name}? You can return to the Nexo Portal afterwards.`)) return;
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
      <div className="relative overflow-hidden px-6 py-10" style={{ backgroundColor: NEXO_DARK }}>
        <div className="absolute right-0 top-0 opacity-[0.05]"><Users className="h-48 w-48 text-white" /></div>
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#93c5fd" }}>Client Management</p>
          <h2 className="text-2xl font-extrabold text-white mb-1">Nexo Business Clients</h2>
          <p className="text-sm text-white/50">{clients.length} client{clients.length !== 1 ? "s" : ""} registered under your Nexo partner account</p>
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
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm"
              style={{ backgroundColor: `${NEXO_BLUE}15` }}>
              <Users className="h-8 w-8" style={{ color: NEXO_BLUE }} />
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
                <div key={c.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <InitialAvatar name={c.full_name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground text-sm truncate">{c.full_name}</p>
                        {hasSub && (
                          <Badge className="text-[10px] border-0 px-1.5" style={{ backgroundColor: `${NEXO_BLUE}15`, color: NEXO_BLUE }}>
                            {subLabel || "Active"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{c.email}</p>
                      {(c.business_name || c.profile_business_name) && (
                        <p className="text-xs text-muted-foreground/70 truncate mt-0.5 flex items-center gap-1">
                          <Building2 className="h-3 w-3 shrink-0" />
                          {c.business_name || c.profile_business_name}
                        </p>
                      )}
                    </div>
                    <Button size="sm" variant="outline" className="rounded-xl gap-1.5 shrink-0"
                      onClick={() => impersonate(c)} disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
                      Log in as
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

/* ─── Promotions Tab ───────────────────────────────────────────────────────── */
const PROMO_TYPES = [
  { value: "general",    label: "General",    icon: Megaphone, bg: "bg-blue-500/10",   color: "text-blue-500"   },
  { value: "campaign",   label: "Campaign",   icon: Zap,       bg: "bg-violet-500/10", color: "text-violet-500" },
  { value: "offer",      label: "Offer",      icon: Tag,       bg: "bg-amber-500/10",  color: "text-amber-500"  },
];

const PROMO_STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  draft:     { label: "Draft",     cls: "bg-gray-500/10 text-gray-500 border-0" },
  active:    { label: "Active",    cls: "bg-emerald-500/10 text-emerald-600 border-0" },
  scheduled: { label: "Scheduled", cls: "bg-blue-500/10 text-blue-600 border-0" },
  ended:     { label: "Ended",     cls: "bg-red-500/10 text-red-500 border-0" },
};

function PromotionsTab({ promotions, loading, onRefresh, franchise }: any) {
  const [view, setView]             = useState<"list" | "form">("list");
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [search, setSearch]         = useState("");
  const [deleting, setDeleting]     = useState<string | null>(null);
  const [saving, setSaving]         = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPrompt, setAiPrompt]     = useState("");
  const [showAiInput, setShowAiInput] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const fileRef = { current: null as HTMLInputElement | null };

  const emptyForm = { title: "", description: "", promo_type: "general", image_url: "", cta_text: "", cta_url: "", status: "draft", target_audience: "all", scheduled_at: "" };
  const [form, setForm] = useState({ ...emptyForm });

  const filtered = promotions.filter((p: any) => !search || `${p.title} ${p.description || ""}`.toLowerCase().includes(search.toLowerCase()));

  function openCreate() { setEditingId(null); setForm({ ...emptyForm }); setView("form"); }
  function openEdit(p: any) {
    setEditingId(p.id);
    setForm({ title: p.title || "", description: p.description || "", promo_type: p.promo_type || "general", image_url: p.image_url || "", cta_text: p.cta_text || "", cta_url: p.cta_url || "", status: p.status || "draft", target_audience: p.target_audience || "all", scheduled_at: p.scheduled_at ? p.scheduled_at.slice(0, 16) : "" });
    setView("form");
  }

  async function handleSave() {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const url = editingId ? `/api/franchise/promotions/${editingId}` : "/api/franchise/promotions";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error || "Save failed"); return; }
      toast.success(editingId ? "Promotion updated!" : "Promotion published!");
      setView("list"); onRefresh();
    } catch { toast.error("Network error"); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this promotion?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/franchise/promotions/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) { toast.success("Deleted"); onRefresh(); }
      else { const d = await res.json(); toast.error(d.error || "Delete failed"); }
    } catch { toast.error("Network error"); }
    setDeleting(null);
  }

  async function handleAiGenerate() {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    try {
      const res = await fetch("/api/ai/image", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: aiPrompt, quality: "standard", size: "1024x1024" }) });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error || "Image generation failed"); return; }
      if (d.url) { setForm(f => ({ ...f, image_url: d.url })); toast.success("Image generated!"); setShowAiInput(false); setAiPrompt(""); }
    } catch { toast.error("Generation failed"); }
    setAiGenerating(false);
  }

  if (view === "form") return (
    <div>
      <div className="relative overflow-hidden px-6 py-10" style={{ backgroundColor: NEXO_DARK }}>
        <div className="relative z-10 flex items-center gap-3">
          <button onClick={() => setView("list")} className="text-white/50 hover:text-white transition-colors text-sm flex items-center gap-1.5">
            ← Back
          </button>
          <span className="text-white/20">/</span>
          <p className="text-sm font-semibold text-white">{editingId ? "Edit Promotion" : "New Promotion"}</p>
        </div>
      </div>

      <div className="p-5 lg:p-6 max-w-2xl space-y-5">
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Promotion Details</p>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Title *</Label>
            <Input className="mt-1.5 h-10" placeholder="e.g. March Business Boost" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description</Label>
            <Textarea className="mt-1.5 min-h-[80px] resize-none" placeholder="What is this promotion about?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Type</Label>
            <Select value={form.promo_type} onValueChange={v => setForm(f => ({ ...f, promo_type: v }))}>
              <SelectTrigger className="mt-1.5 h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROMO_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Image</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => { setShowAiInput(v => !v); }}>
              <Sparkles className="h-3.5 w-3.5" style={{ color: NEXO_BLUE }} /> Generate with AI
            </Button>
            <input ref={el => { fileRef.current = el; }} type="file" accept="image/*" className="hidden" onChange={async e => {
              const file = e.target.files?.[0]; if (!file) return;
              setImageUploading(true);
              const fd = new FormData(); fd.append("file", file);
              const res = await fetch("/api/upload", { method: "POST", credentials: "include", body: fd });
              const d = await res.json(); if (d.url) setForm(f => ({ ...f, image_url: d.url }));
              setImageUploading(false);
            }} />
            <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => fileRef.current?.click()} disabled={imageUploading}>
              <Upload className="h-3.5 w-3.5" /> {imageUploading ? "Uploading…" : "Upload Image"}
            </Button>
          </div>
          {showAiInput && (
            <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: `${NEXO_BLUE}30`, backgroundColor: `${NEXO_BLUE}08` }}>
              <Textarea className="min-h-[80px] resize-none text-sm" placeholder="Describe the image you want…" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} />
              <div className="flex gap-2">
                <Button onClick={handleAiGenerate} disabled={aiGenerating || !aiPrompt.trim()} className="flex-1 gap-2 h-9 text-sm font-semibold text-white" style={{ backgroundColor: NEXO_BLUE, border: "none" }}>
                  {aiGenerating ? <><Loader2 className="h-4 w-4 animate-spin" />Generating…</> : <><Sparkles className="h-4 w-4" />Generate</>}
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setShowAiInput(false); setAiPrompt(""); }} className="h-9 px-4">Cancel</Button>
              </div>
            </div>
          )}
          {form.image_url ? (
            <div className="relative rounded-xl overflow-hidden border border-border">
              <img src={form.image_url} alt="Preview" className="w-full max-h-52 object-contain" />
              <button onClick={() => setForm(f => ({ ...f, image_url: "" }))}
                className="absolute top-2 right-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-red-500/80 text-white shadow">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ) : !showAiInput ? (
            <button onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-border hover:border-blue-400/50 rounded-xl flex flex-col items-center gap-2 py-8 text-muted-foreground hover:text-blue-500 transition-all">
              <ImageIcon className="h-6 w-6" />
              <span className="text-xs font-medium">Click to upload image</span>
            </button>
          ) : null}
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
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
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving} className="flex-1 h-11 font-semibold gap-2 text-white" style={{ backgroundColor: NEXO_BLUE, border: "none" }}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {saving ? "Saving…" : editingId ? "Update Promotion" : "Publish Promotion"}
          </Button>
          <Button variant="outline" onClick={() => setView("list")} className="h-11 px-5">Cancel</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="relative overflow-hidden px-6 py-10" style={{ backgroundColor: NEXO_DARK }}>
        <div className="absolute right-6 top-6 opacity-[0.06]"><Megaphone className="h-36 w-36 text-white" /></div>
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#93c5fd" }}>Marketing</p>
          <h2 className="text-2xl font-extrabold text-white mb-1">Promotions & Campaigns</h2>
          <p className="text-sm text-white/50">Create branded campaigns and promotions for your Nexo clients.</p>
        </div>
      </div>

      <div className="p-5 lg:p-6 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 -mt-8 relative z-10">
          {[
            { label: "Total",     value: promotions.length,                                        icon: Megaphone, iconBg: "bg-blue-500/10",    iconColor: "text-blue-500"   },
            { label: "Active",    value: promotions.filter((p:any) => p.status === "active").length, icon: Zap,     iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500"},
            { label: "Draft",     value: promotions.filter((p:any) => p.status === "draft").length,  icon: Edit3,   iconBg: "bg-gray-500/10",    iconColor: "text-gray-500"   },
            { label: "Scheduled", value: promotions.filter((p:any) => p.status === "scheduled").length, icon: Clock, iconBg: "bg-violet-500/10", iconColor: "text-violet-500" },
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

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search promotions…" className="pl-9 rounded-xl" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={openCreate} className="gap-2 rounded-xl font-semibold text-white" style={{ backgroundColor: NEXO_BLUE, border: "none" }}>
            <Plus className="h-4 w-4" /> New Promotion
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-xl p-16 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm" style={{ backgroundColor: `${NEXO_BLUE}15` }}>
              <Megaphone className="h-8 w-8" style={{ color: NEXO_BLUE }} />
            </div>
            <p className="font-bold text-foreground text-lg mb-2">{search ? "No matches" : "No promotions yet"}</p>
            {!search && <Button onClick={openCreate} className="gap-2 font-semibold text-white mt-4" style={{ backgroundColor: NEXO_BLUE, border: "none" }}><Plus className="h-4 w-4" /> Create First Promotion</Button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((p: any) => {
              const typeConf = PROMO_TYPES.find(t => t.value === p.promo_type) || PROMO_TYPES[0];
              const statusConf = PROMO_STATUS_CONFIG[p.status] || PROMO_STATUS_CONFIG.draft;
              return (
                <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col">
                  <div className="relative flex items-center justify-center overflow-hidden" style={{ height: 140, backgroundColor: NEXO_SLATE }}>
                    {p.image_url ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" /> : <typeConf.icon className="h-10 w-10 text-white/20" />}
                    <div className="absolute top-2 right-2"><Badge className={`text-[10px] ${statusConf.cls}`}>{statusConf.label}</Badge></div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="font-bold text-foreground text-sm leading-snug mb-1 line-clamp-2">{p.title}</p>
                    {p.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{p.description}</p>}
                  </div>
                  <div className="px-4 pb-4 flex gap-2 border-t border-border pt-3">
                    <Button size="sm" variant="outline" className="flex-1 gap-1.5 h-8 rounded-lg text-xs" onClick={() => openEdit(p)}><Edit3 className="h-3 w-3" /> Edit</Button>
                    <Button size="sm" variant="outline" className="h-8 rounded-lg px-3 text-red-500 hover:border-red-300" onClick={() => handleDelete(p.id)} disabled={deleting === p.id}>
                      {deleting === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
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

/* ─── Link Tab ─────────────────────────────────────────────────────────────── */
function LinkTab({ franchise, signupLink }: any) {
  const [copied, setCopied] = useState(false);
  function copy() {
    if (!signupLink) return;
    navigator.clipboard.writeText(signupLink).then(() => { setCopied(true); toast.success("Link copied!"); setTimeout(() => setCopied(false), 2500); });
  }

  return (
    <div>
      <div className="relative overflow-hidden px-6 py-10" style={{ backgroundColor: NEXO_DARK }}>
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#93c5fd" }}>Registration</p>
          <h2 className="text-2xl font-extrabold text-white mb-1">Client Registration Link</h2>
          <p className="text-sm text-white/50">Share this link with businesses to onboard them to your Nexo portal.</p>
        </div>
      </div>

      <div className="p-5 lg:p-6 max-w-lg space-y-5">
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-4">
            <p className="text-xs font-mono text-muted-foreground break-all leading-relaxed">{signupLink || "No link available"}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button className="gap-2 font-semibold text-white" style={{ backgroundColor: NEXO_BLUE, border: "none" }} onClick={copy}>
              {copied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            <Button variant="outline" className="gap-2"
              onClick={() => { const msg = encodeURIComponent(`Register your business on Nexo — the Masakhe Business Platform!\n\n${signupLink}`); window.open(`https://wa.me/?text=${msg}`, "_blank"); }}>
              <MessageSquare className="h-4 w-4 text-green-600" /> WhatsApp
            </Button>
          </div>
        </div>

        <div className="rounded-xl p-5 border flex items-center justify-between"
          style={{ background: `linear-gradient(135deg, ${NEXO_BLUE}15 0%, ${NEXO_BLUE}05 100%)`, borderColor: `${NEXO_BLUE}25` }}>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Your Partner Code</p>
            <p className="text-4xl font-black font-mono text-foreground tracking-widest">{franchise?.code || "—"}</p>
            <p className="text-xs text-muted-foreground mt-2">Clients can enter this code manually during registration</p>
          </div>
          <Button variant="outline" size="lg" className="gap-2 shrink-0"
            onClick={() => { navigator.clipboard.writeText(franchise?.code || ""); toast.success("Code copied!"); }}>
            <Copy className="h-4 w-4" /> Copy
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Profile Tab ──────────────────────────────────────────────────────────── */
function ProfileTab({ franchise, stats }: any) {
  return (
    <div>
      <div className="relative overflow-hidden px-6 py-12" style={{ backgroundColor: NEXO_DARK }}>
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: `radial-gradient(circle, ${NEXO_BLUE} 1.5px, transparent 1.5px)`, backgroundSize: "45px 45px" }}
        />
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${NEXO_BLUE}, #1d4ed8)` }}>
            <img src="/nexo-logo.png" alt="Nexo" className="h-10 object-contain" style={{ filter: "brightness(0) invert(1)" }} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#93c5fd" }}>Nexo Partner Profile</p>
            <h2 className="text-3xl font-extrabold text-white">{franchise?.name || "Nexo Business"}</h2>
            <p className="text-sm mt-1 text-white/50">
              Partner Code: <span className="font-mono font-bold" style={{ color: "#93c5fd" }}>{franchise?.code}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 lg:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${NEXO_BLUE}15` }}>
                  <Building2 className="h-3.5 w-3.5" style={{ color: NEXO_BLUE }} />
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
                  { label: "Total Clients",        value: `${stats?.total_clients ?? 0} businesses`,   icon: Users,      color: "text-blue-500"    },
                  { label: "Active Subscriptions", value: `${stats?.active_subs ?? 0} paying clients`, icon: CreditCard, color: "text-emerald-500" },
                  { label: "Nexo Pro",             value: `${stats?.pro_count ?? 0} clients`,          icon: TrendingUp, color: "text-violet-500"  },
                  { label: "Nexo Premium",         value: `${stats?.premium_count ?? 0} clients`,      icon: Crown,      color: "text-amber-500"   },
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
            <div className="rounded-xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${NEXO_DARK}, ${NEXO_SLATE})`, padding: "2rem" }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${NEXO_BLUE}, #1d4ed8)` }}>
                  <img src="/nexo-logo.png" alt="Nexo" className="h-9 object-contain" style={{ filter: "brightness(0) invert(1)" }} />
                </div>
                <div>
                  <p className="font-extrabold text-xl text-white">Nexo Business Portal</p>
                  <p className="text-white/50 text-sm">Powered by Masakhe</p>
                </div>
              </div>
              <div className="space-y-2">
                {["Invoicing & Payroll", "Client Management", "Business Analytics", "Inventory Control", "POPIA Compliance"].map(f => (
                  <div key={f} className="flex items-center gap-2.5">
                    <Globe className="h-3.5 w-3.5 shrink-0" style={{ color: NEXO_BLUE }} />
                    <span className="text-sm text-white/70">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
