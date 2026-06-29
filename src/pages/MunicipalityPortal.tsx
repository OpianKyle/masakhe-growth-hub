import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Building2, Users, TicketCheck, BarChart2, LogOut, Menu, X,
  MapPin, CheckCircle2, Clock, AlertCircle, Loader2, RefreshCw,
  Search, Shield, Link2, Copy, ExternalLink, TrendingUp, Mail, Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const NAV_ITEMS = [
  { tab: "overview", label: "Overview",    icon: BarChart2   },
  { tab: "link",     label: "Reg. Link",   icon: Link2       },
  { tab: "smmEs",    label: "SMMEs",       icon: Users       },
  { tab: "tickets",  label: "Support",     icon: TicketCheck },
  { tab: "profile",  label: "Profile",     icon: Building2   },
];

const SA_PROVINCES = [
  "Eastern Cape","Free State","Gauteng","KwaZulu-Natal",
  "Limpopo","Mpumalanga","Northern Cape","North West","Western Cape",
];

const TICKET_COLORS: Record<string, string> = {
  open:        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  resolved:    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  closed:      "bg-muted text-muted-foreground",
};

export default function MunicipalityPortal() {
  const { logout: authLogout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mun, setMun] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [smmEs, setSmmEs] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [smmeSearch, setSmmeSearch] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<any>({});
  const [linkCopied, setLinkCopied] = useState(false);

  const regLink = mun ? `${window.location.origin}/register?municipality=${mun.municipality_code}` : "";

  useEffect(() => { fetchMun(); }, []);

  async function fetchMun() {
    setLoading(true);
    try {
      const res = await fetch("/api/municipality/me", { credentials: "include" });
      if (res.status === 404) { navigate("/municipality/register"); return; }
      if (res.ok) {
        const data = await res.json();
        setMun(data);
        setProfileForm({
          municipality_name: data.municipality_name,
          province: data.province || "",
          district: data.district || "",
          contact_person: data.contact_person || "",
          contact_email: data.contact_email || "",
          contact_phone: data.contact_phone || "",
          notes: data.notes || "",
        });
      }
    } catch {}
    setLoading(false);
  }

  async function fetchSmmEs() {
    const res = await fetch("/api/municipality/me/smmEs", { credentials: "include" });
    if (res.ok) setSmmEs(await res.json());
  }

  async function fetchTickets() {
    const res = await fetch("/api/municipality/me/tickets", { credentials: "include" });
    if (res.ok) setTickets(await res.json());
  }

  useEffect(() => {
    if (activeTab === "smmEs") fetchSmmEs();
    if (activeTab === "tickets") fetchTickets();
  }, [activeTab]);

  async function updateTicketStatus(id: string, status: string) {
    const res = await fetch(`/api/municipality/me/tickets/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      credentials: "include", body: JSON.stringify({ status }),
    });
    if (res.ok) { toast.success("Ticket updated"); fetchTickets(); }
    else toast.error("Failed to update ticket");
  }

  async function saveProfile() {
    setSavingProfile(true);
    const res = await fetch("/api/municipality/me", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      credentials: "include", body: JSON.stringify(profileForm),
    });
    if (res.ok) { toast.success("Profile saved"); fetchMun(); }
    else toast.error("Failed to save");
    setSavingProfile(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(regLink).then(() => {
      setLinkCopied(true);
      toast.success("Registration link copied!");
      setTimeout(() => setLinkCopied(false), 2500);
    });
  }

  const filteredSmmEs = smmEs.filter(s => {
    if (!smmeSearch) return true;
    const q = smmeSearch.toLowerCase();
    return `${s.full_name} ${s.business_name || ""} ${s.profile_business_name || ""} ${s.email}`.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const isPending = mun?.status === "pending";

  /* ── Sidebar ── */
  const SidebarContent = () => (
    <aside className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <img src="/masakhe-logo.png" alt="Masakhe" className="h-9 w-9 object-contain shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-sidebar-foreground truncate leading-tight">
            {mun?.municipality_name || "Municipality"}
          </p>
          <p className="text-xs text-sidebar-foreground/50 truncate">{mun?.province || "Portal"}</p>
        </div>
        <button className="lg:hidden text-sidebar-foreground/50 hover:text-sidebar-foreground" onClick={() => setSidebarOpen(false)}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ tab, label, icon: Icon }) => (
          <button key={tab} onClick={() => { setActiveTab(tab); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            }`}>
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
            {tab === "tickets" && (mun?.open_tickets ?? 0) > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                {mun.open_tickets}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-2">
        <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
          isPending ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-green-500/10 text-green-700 dark:text-green-400"
        }`}>
          {isPending ? <Clock className="h-3.5 w-3.5 shrink-0" /> : <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
          {isPending ? "Awaiting approval" : "Active"}
        </div>
        <button onClick={async () => { await authLogout(); navigate("/login"); }}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors">
          <LogOut className="h-4 w-4 shrink-0" /> Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 shrink-0 flex-col">
        <SidebarContent />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"><SidebarContent /></div>
        </>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-card sticky top-0 z-10 shrink-0">
          <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold text-foreground flex-1 truncate">
            {NAV_ITEMS.find(n => n.tab === activeTab)?.label}
          </h1>
          <span className="hidden sm:inline text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
            {mun?.municipality_code}
          </span>
          {isPending
            ? <Badge className="bg-amber-100 text-amber-700 border-0">Pending</Badge>
            : <Badge className="bg-green-100 text-green-700 border-0">Active</Badge>
          }
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <div>
              {/* Hero gradient banner */}
              <div className="relative overflow-hidden px-6 py-8" style={{ background: "linear-gradient(135deg, #0e7490 0%, #1d4ed8 60%, #4f46e5 100%)" }}>
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                <div className="relative z-10">
                  {isPending && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-500/20 border border-amber-400/30 px-4 py-2.5 text-amber-200 text-sm">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      Awaiting Masakhe admin approval — some features are limited until activated.
                    </div>
                  )}
                  <p className="text-cyan-200 text-xs font-semibold uppercase tracking-widest mb-1">Municipality Dashboard</p>
                  <h2 className="text-2xl font-bold text-white mb-1">{mun?.municipality_name}</h2>
                  <p className="text-cyan-100 text-sm flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {mun?.province}{mun?.district ? ` · ${mun.district}` : ""}
                  </p>
                </div>
              </div>

              <div className="p-5 lg:p-6 space-y-6">
                {/* KPI cards */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                  {[
                    { icon: Users,      gradient: "from-cyan-500 to-blue-600",    label: "Registered SMMEs",  value: mun?.smme_count ?? 0,                                sub: "In your municipality"    },
                    { icon: TicketCheck,gradient: "from-rose-500 to-pink-600",    label: "Open Tickets",      value: mun?.open_tickets ?? 0,                              sub: "Awaiting your response"  },
                    { icon: MapPin,     gradient: "from-violet-500 to-purple-600",label: "Province",          value: mun?.province || "—",                                sub: mun?.district || "No district set" },
                    { icon: Shield,     gradient: isPending ? "from-amber-500 to-orange-500" : "from-emerald-500 to-teal-600",
                                        label: "Status",            value: isPending ? "Pending" : "Active",            sub: isPending ? "Under review" : "Full access"      },
                  ].map((c, i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-5 flex items-start gap-3.5">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${c.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
                        <c.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground truncate">{c.label}</p>
                        <p className="text-xl font-bold text-foreground leading-tight mt-0.5 truncate">{c.value}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{c.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Details + Registration link */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Municipality details */}
                  <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="font-semibold text-foreground mb-4 text-sm flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" /> Municipality Details
                    </h3>
                    <dl className="space-y-0 divide-y divide-border text-sm">
                      {[
                        { label: "Name",    value: mun?.municipality_name },
                        { label: "Province",value: mun?.province || "—"   },
                        { label: "District",value: mun?.district  || "—"  },
                        { label: "Contact", value: mun?.contact_person || "—" },
                      ].map(r => (
                        <div key={r.label} className="flex justify-between gap-4 py-2.5">
                          <dt className="text-muted-foreground shrink-0">{r.label}</dt>
                          <dd className="font-medium text-foreground text-right truncate">{r.value}</dd>
                        </div>
                      ))}
                      <div className="flex justify-between gap-4 py-2.5">
                        <dt className="text-muted-foreground shrink-0">Code</dt>
                        <dd className="font-mono text-xs bg-muted px-2 py-1 rounded font-semibold">{mun?.municipality_code}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Quick registration link */}
                  <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="font-semibold text-foreground mb-1 text-sm flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-muted-foreground" /> Registration Link
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Share with local businesses — they'll be auto-linked to your municipality when they register.
                    </p>
                    <div className="bg-muted rounded-lg px-3 py-2.5 text-xs font-mono text-muted-foreground truncate border border-border mb-3">
                      {regLink}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="gap-1.5 flex-1" onClick={copyLink}>
                        {linkCopied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {linkCopied ? "Copied!" : "Copy Link"}
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setActiveTab("link")}>
                        <ExternalLink className="h-3.5 w-3.5" /> More
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Quick actions row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "View SMMEs",       icon: Users,       tab: "smmEs",    gradient: "from-cyan-500 to-blue-500"    },
                    { label: "Open Tickets",      icon: TicketCheck, tab: "tickets",  gradient: "from-rose-500 to-pink-500"    },
                    { label: "Manage Profile",    icon: Building2,   tab: "profile",  gradient: "from-violet-500 to-purple-500"},
                  ].map(a => (
                    <button key={a.tab} onClick={() => setActiveTab(a.tab)}
                      className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 hover:border-primary/40 hover:bg-muted/50 transition-all text-left group">
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${a.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
                        <a.icon className="h-4.5 w-4.5 text-white h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── REGISTRATION LINK ── */}
          {activeTab === "link" && (
            <div className="p-5 lg:p-6 max-w-2xl space-y-5">
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20">
                  <h3 className="font-semibold text-foreground">Your Municipality Registration Link</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Anyone who registers via this link is automatically linked to <strong>{mun?.municipality_name}</strong>.
                  </p>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Registration URL</label>
                    <div className="bg-muted border border-border rounded-lg px-4 py-3 font-mono text-sm text-foreground break-all mb-3">{regLink}</div>
                    <div className="flex gap-2">
                      <Button className="gap-2" onClick={copyLink}>
                        {linkCopied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {linkCopied ? "Copied!" : "Copy Link"}
                      </Button>
                      <Button variant="outline" className="gap-2" onClick={() => window.open(regLink, "_blank")}>
                        <ExternalLink className="h-4 w-4" /> Preview
                      </Button>
                    </div>
                  </div>
                  <hr className="border-border" />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">How it works</h4>
                    <ol className="space-y-3">
                      {[
                        "Share the link via WhatsApp, email, or social media",
                        "The SMME clicks the link and registers their business",
                        "They're automatically added to your municipality dashboard",
                        "Monitor their activity and respond to support requests",
                      ].map((s, i) => (
                        <li key={i} className="flex gap-3 items-start">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">{i + 1}</div>
                          <p className="text-sm text-muted-foreground leading-relaxed pt-1">{s}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <hr className="border-border" />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Or share your code manually</h4>
                    <div className="flex items-center gap-3 bg-muted rounded-lg px-4 py-3">
                      <span className="text-xs text-muted-foreground">Municipality Code</span>
                      <span className="font-mono font-bold text-foreground text-lg tracking-wider">{mun?.municipality_code}</span>
                      <Button size="sm" variant="ghost" className="ml-auto gap-1.5 h-7 text-xs"
                        onClick={() => { navigator.clipboard.writeText(mun?.municipality_code); toast.success("Code copied!"); }}>
                        <Copy className="h-3 w-3" /> Copy
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SMMEs ── */}
          {activeTab === "smmEs" && (
            <div className="p-5 lg:p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search SMMEs…" className="pl-9" value={smmeSearch} onChange={e => setSmmeSearch(e.target.value)} />
                </div>
                <Button variant="outline" size="sm" onClick={fetchSmmEs}><RefreshCw className="h-4 w-4" /></Button>
              </div>

              {filteredSmmEs.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <p className="font-semibold text-foreground mb-2">No SMMEs registered yet</p>
                  <p className="text-sm text-muted-foreground mb-4">Share your registration link to get started.</p>
                  <Button size="sm" className="gap-2" onClick={() => setActiveTab("link")}>
                    <Link2 className="h-4 w-4" /> View Registration Link
                  </Button>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-muted/40 border-b border-border flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{filteredSmmEs.length} Business{filteredSmmEs.length !== 1 ? "es" : ""}</p>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="border-b border-border">
                      <tr>
                        {["Business","Owner","Sector","Registered","Status"].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredSmmEs.map(s => (
                        <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">{s.profile_business_name || s.business_name || "—"}</td>
                          <td className="px-4 py-3">
                            <div className="text-foreground">{s.full_name}</div>
                            <div className="text-xs text-muted-foreground">{s.email}</div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{s.business_type || s.sector || "—"}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{s.registered_at ? new Date(s.registered_at).toLocaleDateString("en-ZA") : "—"}</td>
                          <td className="px-4 py-3">
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">{s.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── TICKETS ── */}
          {activeTab === "tickets" && (
            <div className="p-5 lg:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Support Tickets</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""} from your SMMEs</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchTickets} className="gap-1.5"><RefreshCw className="h-4 w-4" /></Button>
              </div>

              {tickets.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <TicketCheck className="h-7 w-7 text-white" />
                  </div>
                  <p className="font-semibold text-foreground mb-1">No support tickets</p>
                  <p className="text-sm text-muted-foreground">Tickets from your registered SMMEs will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map(t => (
                    <div key={t.id} className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="font-semibold text-foreground">{t.subject}</p>
                          {t.full_name && <p className="text-xs text-muted-foreground mt-0.5">{t.full_name} · {t.email}</p>}
                        </div>
                        <Badge className={`${TICKET_COLORS[t.status] || ""} border-0 shrink-0`}>{t.status.replace("_", " ")}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{t.message}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs text-muted-foreground mr-auto">{new Date(t.created_at).toLocaleDateString("en-ZA")}</p>
                        {t.status === "open" && (
                          <Button size="sm" variant="outline" onClick={() => updateTicketStatus(t.id, "in_progress")}>Mark In Progress</Button>
                        )}
                        {(t.status === "open" || t.status === "in_progress") && (
                          <Button size="sm" className="bg-green-700 hover:bg-green-800 text-white" onClick={() => updateTicketStatus(t.id, "resolved")}>Mark Resolved</Button>
                        )}
                        {t.status === "resolved" && (
                          <Button size="sm" variant="outline" onClick={() => updateTicketStatus(t.id, "closed")}>Close</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE ── */}
          {activeTab === "profile" && (
            <div className="p-5 lg:p-6 max-w-xl space-y-5">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-4 text-sm">Municipality Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Municipality Name</label>
                    <Input value={profileForm.municipality_name || ""} onChange={e => setProfileForm((p: any) => ({ ...p, municipality_name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Province</label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      value={profileForm.province || ""} onChange={e => setProfileForm((p: any) => ({ ...p, province: e.target.value }))}>
                      <option value="">Select province</option>
                      {SA_PROVINCES.map(pr => <option key={pr}>{pr}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">District / Region</label>
                    <Input value={profileForm.district || ""} onChange={e => setProfileForm((p: any) => ({ ...p, district: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-4 text-sm">Contact Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Contact Person</label>
                    <Input value={profileForm.contact_person || ""} onChange={e => setProfileForm((p: any) => ({ ...p, contact_person: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Contact Email</label>
                    <Input type="email" value={profileForm.contact_email || ""} onChange={e => setProfileForm((p: any) => ({ ...p, contact_email: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Contact Phone</label>
                    <Input value={profileForm.contact_phone || ""} onChange={e => setProfileForm((p: any) => ({ ...p, contact_phone: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Notes</label>
                    <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none min-h-[80px] focus:outline-none focus:ring-2 focus:ring-ring"
                      value={profileForm.notes || ""} onChange={e => setProfileForm((p: any) => ({ ...p, notes: e.target.value }))} />
                  </div>
                </div>
              </div>

              <Button className="w-full gap-2" onClick={saveProfile} disabled={savingProfile}>
                {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save Changes
              </Button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
