import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Building2, Users, TicketCheck, BarChart2, LogOut, Menu, X,
  MapPin, CheckCircle2, Clock, AlertCircle,
  Loader2, RefreshCw, Search, Shield, Link2, Copy, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const NAV_ITEMS = [
  { tab: "overview", label: "Overview",  icon: BarChart2  },
  { tab: "link",     label: "Reg. Link", icon: Link2      },
  { tab: "smmEs",   label: "SMMEs",     icon: Users      },
  { tab: "tickets",  label: "Support",   icon: TicketCheck },
  { tab: "profile",  label: "Profile",   icon: Building2  },
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

  const regLink = mun
    ? `${window.location.origin}/register?municipality=${mun.municipality_code}`
    : "";

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
  const currentNavLabel = NAV_ITEMS.find(n => n.tab === activeTab)?.label ?? "";

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
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

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ tab, label, icon: Icon }) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            }`}
          >
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

      {/* Status badge + sign out */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
          isPending ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-green-500/10 text-green-700 dark:text-green-400"
        }`}>
          {isPending ? <Clock className="h-3.5 w-3.5 shrink-0" /> : <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
          {isPending ? "Awaiting approval" : "Active"}
        </div>
        <button
          onClick={async () => { await authLogout(); navigate("/login"); }}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" /> Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 shrink-0 flex-col">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
            <Sidebar />
          </div>
        </>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-card sticky top-0 z-10 shrink-0">
          <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold text-foreground flex-1 truncate">{currentNavLabel}</h1>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
              {mun?.municipality_code}
            </span>
            {isPending ? (
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">Pending</Badge>
            ) : (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">Active</Badge>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-6">

          {/* Pending notice */}
          {isPending && (
            <div className="mb-5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-200">Awaiting Approval</p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
                  Your municipality registration is under review. You'll gain full access once approved by the Masakhe admin team.
                </p>
              </div>
            </div>
          )}

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  { icon: Users,     label: "Registered SMMEs",   value: mun?.smme_count ?? 0,                        sub: "In your municipality",    accent: "text-primary" },
                  { icon: TicketCheck,label:"Open Tickets",        value: mun?.open_tickets ?? 0,                      sub: "Awaiting response",       accent: "text-amber-600" },
                  { icon: MapPin,    label: "Province",            value: mun?.province || "—",                        sub: mun?.district || "",       accent: "text-blue-600" },
                  { icon: Shield,    label: "Status",              value: isPending ? "Pending" : "Active",            sub: isPending ? "Under review" : "Full access", accent: isPending ? "text-amber-600" : "text-green-600" },
                ].map((s, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-5 flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <s.icon className={`h-5 w-5 ${s.accent}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">{s.label}</p>
                      <p className="text-xl font-bold text-foreground leading-tight mt-0.5">{s.value}</p>
                      {s.sub && <p className="text-xs text-muted-foreground mt-0.5 truncate">{s.sub}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Details + Quick link */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" /> Municipality Details
                  </h3>
                  <dl className="space-y-3 text-sm">
                    {[
                      { label: "Name",     value: mun?.municipality_name },
                      { label: "Province", value: mun?.province || "—"  },
                      { label: "District", value: mun?.district  || "—" },
                      { label: "Contact",  value: mun?.contact_person || "—" },
                    ].map(r => (
                      <div key={r.label} className="flex justify-between gap-4 py-1.5 border-b border-border last:border-0">
                        <dt className="text-muted-foreground shrink-0">{r.label}</dt>
                        <dd className="font-medium text-foreground text-right truncate">{r.value}</dd>
                      </div>
                    ))}
                    <div className="flex justify-between gap-4 py-1.5">
                      <dt className="text-muted-foreground shrink-0">Code</dt>
                      <dd className="font-mono text-xs bg-muted px-2 py-1 rounded font-semibold">{mun?.municipality_code}</dd>
                    </div>
                  </dl>
                </div>

                {/* Registration link quick-access */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2 text-sm">
                    <Link2 className="h-4 w-4 text-muted-foreground" /> Registration Link
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Share this link with local businesses. When they click it, they'll be automatically linked to your municipality when they register.
                  </p>
                  <div className="flex gap-2 mb-3">
                    <div className="flex-1 min-w-0 bg-muted rounded-lg px-3 py-2.5 text-xs font-mono text-muted-foreground truncate border border-border">
                      {regLink}
                    </div>
                    <Button size="sm" variant="outline" onClick={copyLink} className="shrink-0 gap-1.5">
                      {linkCopied ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                      {linkCopied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <Button
                    size="sm" variant="ghost"
                    className="text-xs text-muted-foreground gap-1.5 px-0 hover:bg-transparent hover:text-foreground"
                    onClick={() => setActiveTab("link")}
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> View full link options →
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── REGISTRATION LINK ── */}
          {activeTab === "link" && (
            <div className="max-w-2xl space-y-5">
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border bg-muted/30">
                  <h3 className="font-semibold text-foreground">Your Municipality Registration Link</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Send this link to businesses in your area. Anyone who registers via this link will automatically be linked to <strong>{mun?.municipality_name}</strong>.
                  </p>
                </div>

                <div className="p-5 space-y-4">
                  {/* Link display */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Registration URL</label>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-muted border border-border rounded-lg px-4 py-3 font-mono text-sm text-foreground break-all">
                        {regLink}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
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

                  {/* How it works */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">How it works</h4>
                    <ol className="space-y-3">
                      {[
                        { icon: Link2,       text: "Share your registration link via WhatsApp, email, or social media" },
                        { icon: Users,       text: "The SMME clicks the link and registers their business on Masakhe" },
                        { icon: CheckCircle2,text: "They're automatically added to your municipality dashboard" },
                        { icon: BarChart2,   text: "Monitor their activity, support requests, and business growth" },
                      ].map((step, i) => (
                        <li key={i} className="flex gap-3 items-start">
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                            {i + 1}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed pt-1">{step.text}</p>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <hr className="border-border" />

                  {/* Municipality code fallback */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">Alternatively — share your code</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      SMMEs can also manually enter your municipality code at <strong>/register</strong> during sign-up.
                    </p>
                    <div className="flex items-center gap-3 bg-muted rounded-lg px-4 py-3">
                      <span className="text-xs text-muted-foreground">Municipality Code</span>
                      <span className="font-mono font-bold text-foreground text-lg tracking-wider">{mun?.municipality_code}</span>
                      <Button
                        size="sm" variant="ghost" className="ml-auto gap-1.5 h-7 text-xs"
                        onClick={() => {
                          navigator.clipboard.writeText(mun?.municipality_code);
                          toast.success("Code copied!");
                        }}
                      >
                        <Copy className="h-3 w-3" /> Copy code
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SMMEs ── */}
          {activeTab === "smmEs" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search SMMEs…" className="pl-9" value={smmeSearch} onChange={e => setSmmeSearch(e.target.value)} />
                </div>
                <Button variant="outline" size="sm" onClick={fetchSmmEs} className="gap-1.5">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {filteredSmmEs.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-12 text-center">
                  <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-semibold text-foreground mb-2">No SMMEs registered yet</p>
                  <p className="text-sm text-muted-foreground mb-4">Share your registration link to get started.</p>
                  <Button size="sm" className="gap-2" onClick={() => setActiveTab("link")}>
                    <Link2 className="h-4 w-4" /> View Registration Link
                  </Button>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border">
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
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {s.registered_at ? new Date(s.registered_at).toLocaleDateString("en-ZA") : "—"}
                          </td>
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

          {/* ── SUPPORT TICKETS ── */}
          {activeTab === "tickets" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""} total</p>
                <Button variant="outline" size="sm" onClick={fetchTickets} className="gap-1.5">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {tickets.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-12 text-center">
                  <TicketCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-semibold text-foreground mb-1">No support tickets</p>
                  <p className="text-sm text-muted-foreground">Tickets submitted by SMMEs in your municipality will appear here.</p>
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
                        <Badge className={`${TICKET_COLORS[t.status] || ""} border-0 shrink-0`}>
                          {t.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{t.message}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs text-muted-foreground mr-auto">
                          {new Date(t.created_at).toLocaleDateString("en-ZA")}
                        </p>
                        {t.status === "open" && (
                          <Button size="sm" variant="outline" onClick={() => updateTicketStatus(t.id, "in_progress")}>
                            Mark In Progress
                          </Button>
                        )}
                        {(t.status === "open" || t.status === "in_progress") && (
                          <Button size="sm" className="bg-green-700 hover:bg-green-800 text-white" onClick={() => updateTicketStatus(t.id, "resolved")}>
                            Mark Resolved
                          </Button>
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
            <div className="max-w-xl space-y-5">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-4 text-sm">Municipality Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Municipality Name</label>
                    <Input value={profileForm.municipality_name || ""} onChange={e => setProfileForm((p: any) => ({ ...p, municipality_name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Province</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
                    <textarea
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none min-h-[80px] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
