import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Building2, Users, TicketCheck, BarChart2, LogOut, Menu, X,
  MapPin, CheckCircle2, Clock, AlertCircle, Loader2, RefreshCw,
  Search, Shield, Link2, Copy, ExternalLink, TrendingUp, Mail,
  Phone, MessageSquare, Zap, Share2, QrCode, ArrowRight,
  ChevronRight, Globe, Star, Activity, Inbox, CheckCheck,
  XCircle, CircleDot, User, Briefcase, CalendarDays, Filter,
  Sparkles, PenLine, Save, Layers, Plus, Trash2, UserPlus, Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const NAV_ITEMS = [
  { tab: "overview",     label: "Overview",    icon: BarChart2   },
  { tab: "departments",  label: "Departments", icon: Layers      },
  { tab: "link",         label: "Reg. Link",   icon: Link2       },
  { tab: "smmEs",        label: "SMMEs",       icon: Users       },
  { tab: "tickets",      label: "Support",     icon: TicketCheck },
  { tab: "profile",      label: "Profile",     icon: Building2   },
];

const SA_PROVINCES = [
  "Eastern Cape","Free State","Gauteng","KwaZulu-Natal",
  "Limpopo","Mpumalanga","Northern Cape","North West","Western Cape",
];

const TICKET_STATUS: Record<string, { label: string; color: string; bg: string; icon: any; border: string }> = {
  open:        { label: "Open",        color: "text-red-600 dark:text-red-400",    bg: "bg-red-50 dark:bg-red-900/20",    icon: CircleDot,    border: "border-l-red-500"    },
  in_progress: { label: "In Progress", color: "text-amber-600 dark:text-amber-400",bg: "bg-amber-50 dark:bg-amber-900/20",icon: Clock,        border: "border-l-amber-500"  },
  resolved:    { label: "Resolved",    color: "text-emerald-600 dark:text-emerald-400",bg: "bg-emerald-50 dark:bg-emerald-900/20",icon: CheckCheck,  border: "border-l-emerald-500"},
  closed:      { label: "Closed",      color: "text-slate-500",                    bg: "bg-slate-100 dark:bg-slate-800/40",icon: XCircle,      border: "border-l-slate-400"  },
};

function InitialAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "?";
  const colours = [
    "from-cyan-500 to-blue-600", "from-violet-500 to-purple-600",
    "from-rose-500 to-pink-600", "from-amber-500 to-orange-500",
    "from-emerald-500 to-teal-600", "from-indigo-500 to-blue-700",
  ];
  const colour = colours[initials.charCodeAt(0) % colours.length];
  const sz = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-14 h-14 text-lg" : "w-10 h-10 text-sm";
  return (
    <div className={`${sz} rounded-xl bg-gradient-to-br ${colour} flex items-center justify-center shrink-0 font-bold text-white shadow-sm`}>
      {initials}
    </div>
  );
}

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
  const [ticketFilter, setTicketFilter] = useState("all");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<any>({});
  const [linkCopied, setLinkCopied] = useState(false);

  // Departments
  const [departments, setDepartments] = useState<any[]>([]);
  const [deptLoading, setDeptLoading] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  const [deptForm, setDeptForm] = useState({ name: "", description: "" });
  const [savingDept, setSavingDept] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState<string | null>(null); // dept id
  const [adminForm, setAdminForm] = useState({ email: "", full_name: "" });
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [copiedDeptCode, setCopiedDeptCode] = useState<string | null>(null);

  const regLink = mun ? `${window.location.origin}/register?municipality=${mun.municipality_code}` : "";

  useEffect(() => { fetchMun(); }, []);

  async function fetchMun() {
    setLoading(true);
    try {
      const res = await fetch("/api/municipality/me", { credentials: "include" });
      if (res.status === 404) { navigate("/municipality/register"); return; }
      // Unauthenticated users are redirected by MunicipalityRoute
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

  async function fetchDepartments() {
    setDeptLoading(true);
    try {
      const res = await fetch("/api/municipality/me/departments", { credentials: "include" });
      if (res.ok) setDepartments(await res.json());
    } finally {
      setDeptLoading(false);
    }
  }

  async function saveDept() {
    if (!deptForm.name.trim()) return toast.error("Department name is required");
    setSavingDept(true);
    try {
      const url = editingDept ? `/api/municipality/me/departments/${editingDept.id}` : "/api/municipality/me/departments";
      const method = editingDept ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify(deptForm),
      });
      if (res.ok) {
        toast.success(editingDept ? "Department updated" : "Department created");
        setShowDeptModal(false);
        setEditingDept(null);
        setDeptForm({ name: "", description: "" });
        fetchDepartments();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to save");
      }
    } finally {
      setSavingDept(false);
    }
  }

  async function deleteDept(id: string) {
    if (!confirm("Delete this department? This cannot be undone.")) return;
    const res = await fetch(`/api/municipality/me/departments/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) { toast.success("Department deleted"); fetchDepartments(); }
    else toast.error("Failed to delete");
  }

  async function appointAdmin() {
    if (!adminForm.email.trim() || !showAdminModal) return toast.error("Email is required");
    setSavingAdmin(true);
    try {
      const res = await fetch(`/api/municipality/me/departments/${showAdminModal}/admins`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify(adminForm),
      });
      if (res.ok) {
        toast.success("Admin appointed");
        setShowAdminModal(null);
        setAdminForm({ email: "", full_name: "" });
        fetchDepartments();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to appoint admin");
      }
    } finally {
      setSavingAdmin(false);
    }
  }

  async function removeAdmin(deptId: string, adminId: string) {
    if (!confirm("Remove this admin?")) return;
    const res = await fetch(`/api/municipality/me/departments/${deptId}/admins/${adminId}`, { method: "DELETE", credentials: "include" });
    if (res.ok) { toast.success("Admin removed"); fetchDepartments(); }
    else toast.error("Failed to remove admin");
  }

  function copyDeptLink(code: string) {
    const link = `${window.location.origin}/register?municipality=${code}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedDeptCode(code);
      toast.success("Signup link copied!");
      setTimeout(() => setCopiedDeptCode(null), 2500);
    });
  }

  useEffect(() => {
    if (activeTab === "smmEs") fetchSmmEs();
    if (activeTab === "tickets") fetchTickets();
    if (activeTab === "departments") fetchDepartments();
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
    if (res.ok) { toast.success("Profile saved successfully"); fetchMun(); }
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

  function shareWhatsApp() {
    const msg = encodeURIComponent(`Register your business on Masakhe — the platform for ${mun?.municipality_name} SMMEs!\n\n${regLink}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }

  function shareEmail() {
    const subject = encodeURIComponent(`Join Masakhe — ${mun?.municipality_name} SMME Platform`);
    const body = encodeURIComponent(`Hi,\n\nRegister your business on Masakhe, the official SMME business platform for ${mun?.municipality_name}.\n\nClick the link below to get started:\n${regLink}\n\nBest regards,\n${mun?.municipality_name}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }

  const filteredSmmEs = smmEs.filter(s => {
    if (!smmeSearch) return true;
    const q = smmeSearch.toLowerCase();
    return `${s.full_name} ${s.business_name || ""} ${s.profile_business_name || ""} ${s.email}`.toLowerCase().includes(q);
  });

  const filteredTickets = tickets.filter(t => ticketFilter === "all" || t.status === ticketFilter);
  const openCount = tickets.filter(t => t.status === "open").length;
  const inProgressCount = tickets.filter(t => t.status === "in_progress").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved").length;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center animate-pulse shadow-lg">
          <Building2 className="h-8 w-8 text-white" />
        </div>
        <p className="text-muted-foreground text-sm">Loading your municipality portal…</p>
      </div>
    );
  }

  const isPending = mun?.status === "pending";

  /* ── Sidebar ── */
  const SidebarContent = () => (
    <aside className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Brand */}
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
            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            }`}>
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
            {tab === "tickets" && openCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none animate-pulse">
                {openCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-2">
        <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
          isPending ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
        }`}>
          {isPending ? <Clock className="h-3.5 w-3.5 shrink-0" /> : <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
          {isPending ? "Awaiting approval" : "Active municipality"}
        </div>
        <button onClick={async () => { await authLogout(); navigate("/municipality/login"); }}
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
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"><SidebarContent /></div>
        </>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-card/80 backdrop-blur sticky top-0 z-10 shrink-0">
          <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold text-foreground flex-1 truncate">
            {NAV_ITEMS.find(n => n.tab === activeTab)?.label}
          </h1>
          <span className="hidden sm:inline text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
            {mun?.municipality_code}
          </span>
          <Badge className={`border-0 ${isPending ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"}`}>
            {isPending ? "Pending" : "Active"}
          </Badge>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">

          {/* ══════════════════════════════════════
              OVERVIEW
          ══════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div>
              {/* Hero */}
              <div className="relative overflow-hidden px-6 py-10" style={{ background: "linear-gradient(135deg, #0e7490 0%, #1d4ed8 60%, #4f46e5 100%)" }}>
                <div className="absolute inset-0 opacity-[0.07]" style={{
                  backgroundImage: "radial-gradient(circle at 20% 50%, white 1.5px, transparent 1.5px), radial-gradient(circle at 80% 20%, white 1.5px, transparent 1.5px), radial-gradient(circle at 60% 80%, white 1.5px, transparent 1.5px)",
                  backgroundSize: "50px 50px"
                }} />
                <div className="absolute right-6 top-6 opacity-10">
                  <Building2 className="h-32 w-32 text-white" />
                </div>
                <div className="relative z-10">
                  {isPending && (
                    <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-amber-500/20 border border-amber-400/30 px-4 py-3 text-amber-200 text-sm max-w-xl">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      Awaiting Masakhe admin approval — some features are limited until activated.
                    </div>
                  )}
                  <p className="text-cyan-200 text-xs font-semibold uppercase tracking-widest mb-2">Municipality Dashboard</p>
                  <h2 className="text-3xl font-extrabold text-white mb-1.5">{mun?.municipality_name}</h2>
                  <p className="text-cyan-100 text-sm flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {mun?.province}{mun?.district ? ` · ${mun.district}` : ""}
                  </p>
                </div>
              </div>

              <div className="p-5 lg:p-6 space-y-6">
                {/* KPI cards */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 -mt-8 relative z-10">
                  {[
                    { icon: Users,      gradient: "from-cyan-500 to-blue-600",     label: "Registered SMMEs",  value: mun?.smme_count ?? 0,          sub: "In your municipality",     tab: "smmEs"    },
                    { icon: TicketCheck,gradient: "from-rose-500 to-pink-600",     label: "Open Tickets",      value: mun?.open_tickets ?? 0,        sub: "Awaiting your response",   tab: "tickets"  },
                    { icon: TrendingUp, gradient: "from-violet-500 to-purple-600", label: "District",          value: mun?.district || "—",          sub: mun?.province || "Province" },
                    { icon: Shield,     gradient: isPending ? "from-amber-500 to-orange-500" : "from-emerald-500 to-teal-600",
                                        label: "Status",            value: isPending ? "Pending" : "Active", sub: isPending ? "Under review" : "Full access enabled" },
                  ].map((c, i) => (
                    <div key={i}
                      onClick={() => c.tab && setActiveTab(c.tab)}
                      className={`bg-card border border-border rounded-2xl p-5 shadow-sm flex items-start gap-3.5 ${c.tab ? "cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group" : ""}`}>
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
                        <c.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground">{c.label}</p>
                        <p className="text-2xl font-extrabold text-foreground leading-tight mt-0.5 truncate">{c.value}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>
                      </div>
                      {c.tab && <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary shrink-0 mt-1 transition-colors" />}
                    </div>
                  ))}
                </div>

                {/* Quick actions */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { label: "Share Registration Link", desc: "Invite local businesses", icon: Share2,    tab: "link",    gradient: "from-cyan-500 to-blue-500"     },
                      { label: "Manage Tickets",          desc: "Respond to SMME queries", icon: Inbox,     tab: "tickets", gradient: "from-rose-500 to-pink-500"     },
                      { label: "View All SMMEs",          desc: "Browse registered businesses", icon: Users, tab: "smmEs",  gradient: "from-violet-500 to-purple-500" },
                    ].map(a => (
                      <button key={a.tab} onClick={() => setActiveTab(a.tab)}
                        className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:border-primary/40 hover:shadow-md transition-all text-left group">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                          <a.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{a.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary ml-auto shrink-0 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contact & Code */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" /> Contact Details
                    </p>
                    <div className="space-y-3">
                      {[
                        { icon: User,  val: mun?.contact_person || "Not set",  label: "Contact Person" },
                        { icon: Mail,  val: mun?.contact_email  || "Not set",  label: "Email"          },
                        { icon: Phone, val: mun?.contact_phone  || "Not set",  label: "Phone"          },
                      ].map(row => (
                        <div key={row.label} className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <row.icon className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{row.label}</p>
                            <p className="text-sm font-medium text-foreground truncate">{row.val}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button size="sm" variant="outline" className="w-full mt-4 gap-2" onClick={() => setActiveTab("profile")}>
                      <PenLine className="h-3.5 w-3.5" /> Edit Profile
                    </Button>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-5 flex flex-col">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <QrCode className="h-3.5 w-3.5" /> Registration Link
                    </p>
                    <div className="flex-1 flex flex-col gap-4">
                      <div className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3">
                        <p className="text-xs font-mono text-muted-foreground break-all leading-relaxed">{regLink}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button className="gap-2" onClick={copyLink}>
                          {linkCopied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          {linkCopied ? "Copied!" : "Copy"}
                        </Button>
                        <Button variant="outline" className="gap-2" onClick={shareWhatsApp}>
                          <MessageSquare className="h-4 w-4 text-green-600" /> WhatsApp
                        </Button>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 px-4 py-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Municipality Code</p>
                          <p className="text-xl font-black font-mono text-foreground tracking-widest">{mun?.municipality_code}</p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(mun?.municipality_code); toast.success("Code copied!"); }}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
              REGISTRATION LINK
          ══════════════════════════════════════ */}
          {activeTab === "link" && (
            <div>
              {/* Hero */}
              <div className="relative overflow-hidden px-6 py-12" style={{ background: "linear-gradient(135deg, #0891b2 0%, #1d4ed8 60%, #4f46e5 100%)" }}>
                <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 25% 50%, white 1.5px, transparent 1.5px), radial-gradient(circle at 75% 25%, white 1.5px, transparent 1.5px)", backgroundSize: "40px 40px" }} />
                <div className="absolute right-0 bottom-0 opacity-[0.08]">
                  <img src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=600&q=60" alt="" className="h-48 object-cover rounded-tl-3xl" />
                </div>
                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-4">
                    <Globe className="h-3.5 w-3.5 text-cyan-300" />
                    <span className="text-xs font-semibold text-cyan-200 uppercase tracking-widest">Grow Your Network</span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-white mb-2">Registration Link</h2>
                  <p className="text-cyan-100 text-sm leading-relaxed">Share your unique link with local businesses — they'll be automatically linked to <strong className="text-white">{mun?.municipality_name}</strong> the moment they sign up on Masakhe.</p>
                </div>
              </div>

              <div className="p-5 lg:p-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                  {/* LEFT — link tools */}
                  <div className="space-y-5">

                    {/* Link card */}
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                      <div className="px-5 py-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border-b border-border">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <Link2 className="h-3.5 w-3.5" /> Your Unique Registration URL
                        </p>
                        <p className="font-mono text-sm text-foreground break-all leading-relaxed bg-white/50 dark:bg-black/20 rounded-lg px-3 py-2">{regLink}</p>
                      </div>
                      <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Button className="gap-2" onClick={copyLink}>
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

                    {/* Municipality code */}
                    <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-2xl p-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Municipality Code</p>
                        <p className="text-4xl font-black font-mono text-foreground tracking-widest">{mun?.municipality_code}</p>
                        <p className="text-xs text-muted-foreground mt-1.5">Businesses can enter this manually when registering</p>
                      </div>
                      <Button size="lg" variant="outline" className="gap-2 shrink-0"
                        onClick={() => { navigator.clipboard.writeText(mun?.municipality_code); toast.success("Code copied!"); }}>
                        <Copy className="h-4 w-4" /> Copy Code
                      </Button>
                    </div>

                    {/* Preview */}
                    <Button variant="outline" className="w-full gap-2 h-11" onClick={() => window.open(regLink, "_blank")}>
                      <ExternalLink className="h-4 w-4" /> Preview Registration Page
                    </Button>

                    {/* Sharing tips */}
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-5">
                      <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" /> Sharing Tips
                      </p>
                      <ul className="space-y-2">
                        {[
                          "Print the link on flyers and hand out at local markets",
                          "Post on your municipality's Facebook or WhatsApp community groups",
                          "Include in official letters and business licence renewals",
                          "Ask your Ward Councillors to share with constituents",
                        ].map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                            <Star className="h-3 w-3 mt-0.5 shrink-0" /> {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* RIGHT — how it works + impact */}
                  <div className="space-y-5">
                    {/* Image banner */}
                    <div className="relative rounded-2xl overflow-hidden h-48">
                      <img
                        src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80"
                        alt="Local business owners"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-white font-bold text-lg leading-tight">Support local businesses in {mun?.municipality_name || "your municipality"}</p>
                        <p className="text-white/80 text-xs mt-1">Every registered SMME gains access to free business tools</p>
                      </div>
                    </div>

                    {/* How it works */}
                    <div className="bg-card border border-border rounded-2xl p-5">
                      <p className="text-sm font-bold text-foreground mb-5 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-amber-500" /> How it works
                      </p>
                      <div className="space-y-4">
                        {[
                          { step: 1, title: "Share the link",    desc: "Send via WhatsApp, email, SMS, social media or print on flyers.",        color: "from-cyan-500 to-blue-600"     },
                          { step: 2, title: "Business registers", desc: "The SMME clicks and completes the free Masakhe registration.",           color: "from-violet-500 to-purple-600" },
                          { step: 3, title: "Auto-linked to you", desc: "They appear in your SMMEs tab — no manual approval needed.",             color: "from-emerald-500 to-teal-600"  },
                          { step: 4, title: "Monitor & support",  desc: "Track activity and respond to any support tickets they raise.",           color: "from-rose-500 to-pink-600"     },
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

                    {/* Impact stats */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "Free",    label: "For all SMMEs",       color: "from-emerald-500 to-teal-600" },
                        { value: "24/7",    label: "Platform access",      color: "from-cyan-500 to-blue-600"   },
                        { value: "1-click", label: "Auto-link on sign-up", color: "from-violet-500 to-purple-600"},
                      ].map(stat => (
                        <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 text-center">
                          <div className={`text-lg font-black bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>{stat.value}</div>
                          <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
              SMMES
          ══════════════════════════════════════ */}
          {activeTab === "smmEs" && (
            <div>
              {/* Hero */}
              <div className="relative overflow-hidden px-6 py-10" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)" }}>
                <div className="absolute right-0 top-0 opacity-10"><Users className="h-48 w-48 text-white" /></div>
                <div className="relative z-10">
                  <p className="text-violet-200 text-xs font-semibold uppercase tracking-widest mb-2">Your Network</p>
                  <h2 className="text-2xl font-extrabold text-white mb-1">Registered SMMEs</h2>
                  <p className="text-violet-100 text-sm">{smmEs.length} business{smmEs.length !== 1 ? "es" : ""} linked to {mun?.municipality_name}</p>
                </div>
              </div>

              <div className="p-5 lg:p-6 space-y-4">
                {/* Search + refresh */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by name, email or sector…" className="pl-9 rounded-xl" value={smmeSearch} onChange={e => setSmmeSearch(e.target.value)} />
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={fetchSmmEs}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                {filteredSmmEs.length === 0 ? (
                  <div className="bg-card border border-border rounded-2xl p-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-lg">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <p className="font-bold text-foreground text-lg mb-2">
                      {smmeSearch ? "No matches found" : "No SMMEs registered yet"}
                    </p>
                    <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
                      {smmeSearch ? "Try a different search term." : "Share your registration link and local businesses will appear here once they sign up."}
                    </p>
                    {!smmeSearch && (
                      <Button className="gap-2" onClick={() => setActiveTab("link")}>
                        <Share2 className="h-4 w-4" /> Share Registration Link
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredSmmEs.map(s => {
                      const bizName = s.profile_business_name || s.business_name || s.full_name;
                      const sector = s.business_type || s.sector || null;
                      const regDate = s.registered_at ? new Date(s.registered_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }) : null;
                      return (
                        <div key={s.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 hover:shadow-md hover:border-primary/30 transition-all group">
                          <div className="flex items-start gap-3">
                            <InitialAvatar name={bizName} size="md" />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{bizName}</p>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">{s.full_name}</p>
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 shrink-0 text-[10px]">
                              {s.status || "active"}
                            </Badge>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3 shrink-0" />
                              <span className="truncate">{s.email}</span>
                            </div>
                            {sector && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Briefcase className="h-3 w-3 shrink-0" />
                                <span className="truncate">{sector}</span>
                              </div>
                            )}
                            {regDate && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <CalendarDays className="h-3 w-3 shrink-0" />
                                <span>Registered {regDate}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
              TICKETS
          ══════════════════════════════════════ */}
          {activeTab === "tickets" && (
            <div>
              {/* Hero */}
              <div className="relative overflow-hidden px-6 py-10" style={{ background: "linear-gradient(135deg, #e11d48 0%, #be185d 60%, #9333ea 100%)" }}>
                <div className="absolute right-0 top-0 opacity-10"><Inbox className="h-48 w-48 text-white" /></div>
                <div className="relative z-10">
                  <p className="text-rose-200 text-xs font-semibold uppercase tracking-widest mb-2">SMME Requests</p>
                  <h2 className="text-2xl font-extrabold text-white mb-1">Support Tickets</h2>
                  <p className="text-rose-100 text-sm">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""} from your registered businesses</p>
                </div>
              </div>

              <div className="p-5 lg:p-6 space-y-5">
                {/* Stats row */}
                {tickets.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Open",        count: openCount,       color: "from-red-500 to-rose-600",         icon: CircleDot   },
                      { label: "In Progress", count: inProgressCount, color: "from-amber-500 to-orange-500",     icon: Clock       },
                      { label: "Resolved",    count: resolvedCount,   color: "from-emerald-500 to-teal-600",     icon: CheckCheck  },
                    ].map(s => (
                      <button key={s.label}
                        onClick={() => setTicketFilter(ticketFilter === s.label.toLowerCase().replace(" ", "_") ? "all" : s.label.toLowerCase().replace(" ", "_"))}
                        className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:shadow-md hover:border-primary/30 transition-all text-left">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shrink-0`}>
                          <s.icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xl font-extrabold text-foreground">{s.count}</p>
                          <p className="text-xs text-muted-foreground">{s.label}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Filter + Refresh */}
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5 flex-wrap flex-1">
                    {["all","open","in_progress","resolved","closed"].map(f => (
                      <button key={f}
                        onClick={() => setTicketFilter(f)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          ticketFilter === f ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}>
                        {f === "all" ? "All" : f === "in_progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl gap-2 shrink-0" onClick={fetchTickets}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                {filteredTickets.length === 0 ? (
                  <div className="bg-card border border-border rounded-2xl p-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mx-auto mb-5 shadow-lg">
                      <TicketCheck className="h-8 w-8 text-white" />
                    </div>
                    <p className="font-bold text-foreground text-lg mb-2">
                      {ticketFilter !== "all" ? `No ${ticketFilter.replace("_", " ")} tickets` : "All clear!"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {ticketFilter !== "all" ? "Try a different filter." : "No support tickets from your SMMEs yet."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTickets.map(t => {
                      const ts = TICKET_STATUS[t.status] || TICKET_STATUS.closed;
                      const TsIcon = ts.icon;
                      return (
                        <div key={t.id} className={`bg-card border border-border border-l-4 ${ts.border} rounded-2xl overflow-hidden hover:shadow-md transition-all`}>
                          <div className="p-5">
                            <div className="flex items-start gap-3 mb-3">
                              <div className={`w-8 h-8 rounded-xl ${ts.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                                <TsIcon className={`h-4 w-4 ${ts.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                  <p className="font-bold text-foreground">{t.subject}</p>
                                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${ts.bg} ${ts.color}`}>
                                    {ts.label}
                                  </span>
                                </div>
                                {t.full_name && (
                                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                    <User className="h-3 w-3" /> {t.full_name}
                                    {t.email && <span className="opacity-60">· {t.email}</span>}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="ml-11 bg-muted/50 rounded-xl px-4 py-3 mb-3">
                              <p className="text-sm text-muted-foreground leading-relaxed">{t.message}</p>
                            </div>
                            <div className="ml-11 flex items-center gap-2 flex-wrap">
                              <p className="text-xs text-muted-foreground mr-auto flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                {new Date(t.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                              {t.status === "open" && (
                                <Button size="sm" variant="outline" className="rounded-xl h-8 text-xs" onClick={() => updateTicketStatus(t.id, "in_progress")}>
                                  <Clock className="h-3 w-3 mr-1" /> In Progress
                                </Button>
                              )}
                              {(t.status === "open" || t.status === "in_progress") && (
                                <Button size="sm" className="rounded-xl h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => updateTicketStatus(t.id, "resolved")}>
                                  <CheckCheck className="h-3 w-3 mr-1" /> Resolve
                                </Button>
                              )}
                              {t.status === "resolved" && (
                                <Button size="sm" variant="outline" className="rounded-xl h-8 text-xs" onClick={() => updateTicketStatus(t.id, "closed")}>
                                  <XCircle className="h-3 w-3 mr-1" /> Close
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
              PROFILE
          ══════════════════════════════════════ */}
          {activeTab === "profile" && (
            <div>
              {/* Hero */}
              <div className="relative overflow-hidden px-6 py-12" style={{ background: "linear-gradient(135deg, #0f766e 0%, #0369a1 60%, #1d4ed8 100%)" }}>
                <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 30% 60%, white 1.5px, transparent 1.5px), radial-gradient(circle at 70% 30%, white 1.5px, transparent 1.5px)", backgroundSize: "45px 45px" }} />
                <div className="absolute right-0 top-0 bottom-0 w-64 opacity-20">
                  <img src="https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=400&q=60" alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-800 to-transparent" />
                </div>
                <div className="relative z-10 flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0 border border-white/30 shadow-lg">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-teal-200 text-xs font-semibold uppercase tracking-widest mb-1">Municipality Profile</p>
                    <h2 className="text-3xl font-extrabold text-white">{mun?.municipality_name}</h2>
                    <p className="text-teal-100 text-sm flex items-center gap-1.5 mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {mun?.province}{mun?.district ? ` · ${mun.district}` : ""}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 lg:p-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                  {/* LEFT — editable form */}
                  <div className="space-y-5">
                    {/* Municipality info */}
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                      <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                          <Building2 className="h-3.5 w-3.5 text-white" />
                        </div>
                        <p className="text-sm font-bold text-foreground">Municipality Information</p>
                      </div>
                      <div className="p-5 space-y-4">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Municipality Name</label>
                          <Input className="rounded-xl" value={profileForm.municipality_name || ""} onChange={e => setProfileForm((p: any) => ({ ...p, municipality_name: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Province</label>
                            <select className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                              value={profileForm.province || ""} onChange={e => setProfileForm((p: any) => ({ ...p, province: e.target.value }))}>
                              <option value="">Select province</option>
                              {SA_PROVINCES.map(pr => <option key={pr}>{pr}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">District / Region</label>
                            <Input className="rounded-xl" value={profileForm.district || ""} onChange={e => setProfileForm((p: any) => ({ ...p, district: e.target.value }))} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact details */}
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                      <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <Phone className="h-3.5 w-3.5 text-white" />
                        </div>
                        <p className="text-sm font-bold text-foreground">Contact Details</p>
                      </div>
                      <div className="p-5 space-y-4">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Contact Person</label>
                          <Input className="rounded-xl" placeholder="Full name" value={profileForm.contact_person || ""} onChange={e => setProfileForm((p: any) => ({ ...p, contact_person: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Email Address</label>
                          <Input className="rounded-xl" type="email" placeholder="office@municipality.gov.za" value={profileForm.contact_email || ""} onChange={e => setProfileForm((p: any) => ({ ...p, contact_email: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Phone Number</label>
                          <Input className="rounded-xl" placeholder="+27 xx xxx xxxx" value={profileForm.contact_phone || ""} onChange={e => setProfileForm((p: any) => ({ ...p, contact_phone: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Notes</label>
                          <textarea
                            className="flex w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm resize-none min-h-[90px] focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Any additional notes about this municipality…"
                            value={profileForm.notes || ""} onChange={e => setProfileForm((p: any) => ({ ...p, notes: e.target.value }))} />
                        </div>
                      </div>
                    </div>

                    <Button className="w-full gap-2 h-12 text-sm font-semibold rounded-xl" onClick={saveProfile} disabled={savingProfile}>
                      {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {savingProfile ? "Saving…" : "Save Changes"}
                    </Button>
                  </div>

                  {/* RIGHT — info panel */}
                  <div className="space-y-5">
                    {/* Municipality image */}
                    <div className="relative rounded-2xl overflow-hidden h-52">
                      <img
                        src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80"
                        alt="South African city"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-white font-bold text-lg">{mun?.municipality_name || "Your Municipality"}</p>
                        <p className="text-white/80 text-xs mt-0.5">{mun?.province || "South Africa"}{mun?.district ? ` · ${mun.district}` : ""}</p>
                      </div>
                    </div>

                    {/* Read-only code */}
                    <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-2xl p-5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Municipality Code</p>
                      <p className="text-4xl font-black font-mono text-foreground tracking-widest">{mun?.municipality_code}</p>
                      <p className="text-xs text-muted-foreground mt-1.5">This code is permanent and cannot be changed.</p>
                      <Button size="sm" variant="outline" className="mt-3 gap-2"
                        onClick={() => { navigator.clipboard.writeText(mun?.municipality_code); toast.success("Code copied!"); }}>
                        <Copy className="h-3.5 w-3.5" /> Copy Code
                      </Button>
                    </div>

                    {/* Programme summary */}
                    <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                      <p className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Shield className="h-4 w-4 text-teal-500" /> Programme Summary
                      </p>
                      {[
                        { label: "Status",         value: isPending ? "Pending approval" : "Active",                icon: isPending ? AlertCircle : CheckCircle2, color: isPending ? "text-amber-500" : "text-emerald-500" },
                        { label: "SMMEs Linked",   value: `${mun?.smme_count ?? 0} businesses`,                     icon: Users,         color: "text-blue-500"   },
                        { label: "Open Tickets",   value: `${mun?.open_tickets ?? 0} unresolved`,                   icon: TicketCheck,   color: "text-rose-500"   },
                        { label: "Municipality",   value: mun?.municipality_name || "—",                            icon: Building2,     color: "text-teal-500"   },
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

                    {/* What your profile unlocks */}
                    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 border border-teal-200 dark:border-teal-800/40 rounded-2xl p-5">
                      <p className="text-sm font-bold text-teal-800 dark:text-teal-300 mb-3">Why keep your profile updated?</p>
                      <ul className="space-y-2">
                        {[
                          "SMMEs see your contact details when they need help",
                          "Your municipality name appears on the public registration page",
                          "Masakhe admins verify your details for activation",
                          "Correct province links you to relevant SA compliance updates",
                        ].map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-teal-700 dark:text-teal-400 leading-relaxed">
                            <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
              DEPARTMENTS
          ══════════════════════════════════════ */}
          {activeTab === "departments" && (
            <div>
              {/* Hero */}
              <div className="relative overflow-hidden px-6 py-10" style={{ background: "linear-gradient(135deg, #0e7490 0%, #1d4ed8 60%, #4f46e5 100%)" }}>
                <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
                <div className="relative max-w-3xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-sm"><Layers className="h-5 w-5 text-white" /></div>
                    <span className="text-white/70 text-sm font-medium">Municipal Departments</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">Departments</h2>
                  <p className="text-white/70 text-sm">Create departments, appoint admins, and give each department its own SMME sign-up link.</p>
                </div>
              </div>

              <div className="p-6 space-y-6 max-w-4xl mx-auto">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{departments.length} department{departments.length !== 1 ? "s" : ""} created</p>
                  </div>
                  <Button onClick={() => { setEditingDept(null); setDeptForm({ name: "", description: "" }); setShowDeptModal(true); }} className="gap-2">
                    <Plus className="h-4 w-4" /> New Department
                  </Button>
                </div>

                {/* Department cards */}
                {deptLoading ? (
                  <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : departments.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
                    <Layers className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                    <p className="font-semibold text-foreground mb-1">No departments yet</p>
                    <p className="text-sm text-muted-foreground mb-4">Create your first department to assign admins and generate unique sign-up links.</p>
                    <Button onClick={() => { setEditingDept(null); setDeptForm({ name: "", description: "" }); setShowDeptModal(true); }} variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" /> Create Department
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {departments.map(dept => {
                      const deptLink = `${window.location.origin}/register?municipality=${dept.department_code}`;
                      return (
                        <div key={dept.id} className="border border-border rounded-2xl bg-card overflow-hidden">
                          {/* Card header */}
                          <div className="flex items-start gap-4 p-5 border-b border-border">
                            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 shrink-0">
                              <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-foreground">{dept.name}</h3>
                                <span className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">{dept.department_code}</span>
                                <span className="text-xs text-muted-foreground">{dept.smme_count} SMME{dept.smme_count !== 1 ? "s" : ""}</span>
                              </div>
                              {dept.description && <p className="text-sm text-muted-foreground mt-0.5">{dept.description}</p>}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button onClick={() => { setEditingDept(dept); setDeptForm({ name: dept.name, description: dept.description || "" }); setShowDeptModal(true); }}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button onClick={() => deleteDept(dept.id)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Sign-up link */}
                          <div className="px-5 py-3 bg-muted/30 border-b border-border">
                            <p className="text-xs font-medium text-muted-foreground mb-1.5">Sign-up link for this department</p>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-xs bg-background border border-border rounded-lg px-3 py-2 truncate text-foreground font-mono">{deptLink}</code>
                              <button onClick={() => copyDeptLink(dept.department_code)}
                                className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
                                {copiedDeptCode === dept.department_code ? <CheckCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                {copiedDeptCode === dept.department_code ? "Copied!" : "Copy"}
                              </button>
                            </div>
                          </div>

                          {/* Admins */}
                          <div className="p-5">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admins</p>
                              <button onClick={() => { setShowAdminModal(dept.id); setAdminForm({ email: "", full_name: "" }); }}
                                className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium">
                                <UserPlus className="h-3.5 w-3.5" /> Appoint Admin
                              </button>
                            </div>
                            {dept.admins?.length === 0 ? (
                              <p className="text-xs text-muted-foreground italic">No admins appointed yet.</p>
                            ) : (
                              <div className="space-y-2">
                                {dept.admins.map((admin: any) => (
                                  <div key={admin.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                                      <span className="text-xs font-bold text-white">{(admin.full_name || admin.email)[0].toUpperCase()}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      {admin.full_name && <p className="text-sm font-medium text-foreground leading-none mb-0.5">{admin.full_name}</p>}
                                      <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
                                    </div>
                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${admin.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                      {admin.status === 'active' ? 'Active' : 'Pending'}
                                    </span>
                                    <button onClick={() => removeAdmin(dept.id, admin.id)}
                                      className="p-1 rounded text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Create / Edit Department Modal */}
              {showDeptModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                  <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md">
                    <div className="flex items-center justify-between p-5 border-b border-border">
                      <h3 className="font-semibold text-foreground">{editingDept ? "Edit Department" : "New Department"}</h3>
                      <button onClick={() => setShowDeptModal(false)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
                    </div>
                    <div className="p-5 space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Department Name *</label>
                        <Input placeholder="e.g. Health, Education, Water & Sanitation" value={deptForm.name}
                          onChange={e => setDeptForm(f => ({ ...f, name: e.target.value }))} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Description (optional)</label>
                        <textarea rows={3} placeholder="Brief description of this department's focus area…"
                          value={deptForm.description} onChange={e => setDeptForm(f => ({ ...f, description: e.target.value }))}
                          className="w-full text-sm border border-input rounded-lg px-3 py-2 bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 px-5 pb-5">
                      <Button variant="outline" onClick={() => setShowDeptModal(false)}>Cancel</Button>
                      <Button onClick={saveDept} disabled={savingDept} className="gap-2">
                        {savingDept ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {editingDept ? "Save Changes" : "Create Department"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Appoint Admin Modal */}
              {showAdminModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                  <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md">
                    <div className="flex items-center justify-between p-5 border-b border-border">
                      <h3 className="font-semibold text-foreground">Appoint Department Admin</h3>
                      <button onClick={() => setShowAdminModal(null)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
                    </div>
                    <div className="p-5 space-y-4">
                      <p className="text-sm text-muted-foreground">Enter the details of the person you want to appoint as admin for this department.</p>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full Name (optional)</label>
                        <Input placeholder="e.g. Jane Dlamini" value={adminForm.full_name}
                          onChange={e => setAdminForm(f => ({ ...f, full_name: e.target.value }))} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email Address *</label>
                        <Input type="email" placeholder="admin@municipality.gov.za" value={adminForm.email}
                          onChange={e => setAdminForm(f => ({ ...f, email: e.target.value }))} />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 px-5 pb-5">
                      <Button variant="outline" onClick={() => setShowAdminModal(null)}>Cancel</Button>
                      <Button onClick={appointAdmin} disabled={savingAdmin} className="gap-2">
                        {savingAdmin ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                        Appoint Admin
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
