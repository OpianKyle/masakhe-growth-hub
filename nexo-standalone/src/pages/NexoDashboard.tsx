import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  LayoutDashboard, Users, Link2, User, LogOut, Menu, X,
  Copy, CheckCheck, ArrowRight, Loader2, Eye, BadgeCheck,
  Building2, Megaphone, Edit3, Trash2, Send, Clock, Tag, Upload,
  ImageIcon, Globe, Plus, CalendarDays,
  Activity, CheckCircle2, Phone, TrendingUp, AlertCircle,
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
  { tab: "overview",   label: "Overview",   icon: LayoutDashboard },
  { tab: "clients",    label: "Clients",    icon: Users           },
  { tab: "promotions", label: "Promotions", icon: Megaphone       },
  { tab: "link",       label: "Reg. Link",  icon: Link2           },
  { tab: "profile",    label: "Profile",    icon: User            },
];

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

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ data, clients, onTabChange }: { data: any; clients: any[]; onTabChange: (t: string) => void }) {
  const franchise = data?.franchise;
  const stats = data?.stats;
  const totalClients = Number(stats?.total_clients || 0);
  const activeClients = Number(stats?.active_clients || 0);

  const statCards = [
    { label: "Total Clients", value: totalClients, icon: Users, color: NEXO_BLUE },
    { label: "Active",        value: activeClients, icon: Activity, color: "#16a34a" },
    { label: "Inactive",      value: totalClients - activeClients, icon: Clock, color: "#9ca3af" },
    { label: "Code",          value: franchise?.code || "—", icon: Tag, color: "#7c3aed" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Welcome back{franchise?.name ? `, ${franchise.name}` : ""}!</h2>
        <p className="text-sm text-gray-500 mt-1">Here's your Nexo partner overview.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent clients */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Recent Clients</h3>
          <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => onTabChange("clients")}>
            View all <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
        {clients.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No clients yet. Share your registration link!</p>
            <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={() => onTabChange("link")}>
              <Link2 className="h-3.5 w-3.5" /> Get Link
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {clients.slice(0, 5).map(c => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                <InitialAvatar name={c.full_name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{c.full_name}</p>
                  <p className="text-xs text-gray-400 truncate">{c.business_name || c.profile_business_name || c.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Clients Tab ──────────────────────────────────────────────────────────────
function ClientsTab({ clients, loading, onImpersonate }: { clients: any[]; loading: boolean; onImpersonate: (c: any) => void }) {
  const [search, setSearch] = useState("");
  const filtered = clients.filter(c =>
    !search || [c.full_name, c.email, c.business_name, c.profile_business_name].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Clients</h2>
          <p className="text-sm text-gray-500">{clients.length} registered</p>
        </div>
        <Input className="w-56 h-9" placeholder="Search clients…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 text-center py-14">
          <Users className="h-9 w-9 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-500">{search ? "No matches" : "No clients yet"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 hover:border-gray-200 transition-all">
              <InitialAvatar name={c.full_name} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 text-sm truncate">{c.full_name}</p>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${c.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{c.email}</p>
                {(c.business_name || c.profile_business_name) && (
                  <p className="text-xs text-blue-600 flex items-center gap-1 mt-0.5">
                    <Building2 className="h-3 w-3" />{c.business_name || c.profile_business_name}
                  </p>
                )}
              </div>
              <div className="text-xs text-gray-400 shrink-0 text-right hidden sm:block">
                {c.industry_sector && <p>{c.industry_sector}</p>}
                <p>{new Date(c.registered_at).toLocaleDateString("en-ZA")}</p>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={() => onImpersonate(c)}>
                <Eye className="h-3.5 w-3.5" /> View
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Promotions Tab ───────────────────────────────────────────────────────────
function PromotionsTab({ promotions, loading, onRefresh }: { promotions: any[]; loading: boolean; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const blank = { title: "", description: "", promo_type: "general", cta_text: "", cta_url: "", status: "draft", target_audience: "all", scheduled_at: "" };
  const [form, setForm] = useState<any>(blank);

  const set = (k: string) => (v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const setInput = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(k)(e.target.value);

  function openEdit(p: any) { setEditing(p); setForm({ ...blank, ...p }); setShowForm(true); }
  function openNew() { setEditing(null); setForm(blank); setShowForm(true); }
  function cancel() { setShowForm(false); setEditing(null); }

  async function save() {
    if (!form.title?.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const url = editing ? `/api/franchise/promotions/${editing.id}` : "/api/franchise/promotions";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); toast.error(d.error); return; }
      toast.success(editing ? "Promotion updated" : "Promotion created");
      cancel(); onRefresh();
    } finally { setSaving(false); }
  }

  async function remove(id: string) {
    setDeleting(id);
    const res = await fetch(`/api/franchise/promotions/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) { toast.success("Deleted"); onRefresh(); }
    else toast.error("Failed to delete");
    setDeleting(null);
  }

  const statusColor: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600", active: "bg-green-100 text-green-700",
    scheduled: "bg-blue-100 text-blue-700", ended: "bg-red-100 text-red-600",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Promotions</h2>
          <p className="text-sm text-gray-500">Create and manage client promotions</p>
        </div>
        <Button size="sm" className="gap-2 text-white" style={{ backgroundColor: NEXO_BLUE, border: "none" }} onClick={openNew}>
          <Plus className="h-4 w-4" /> New Promo
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-bold text-gray-900">{editing ? "Edit Promotion" : "New Promotion"}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Title *</Label>
              <Input className="mt-1" placeholder="e.g. Summer Special Offer" value={form.title} onChange={setInput("title")} />
            </div>
            <div className="col-span-2">
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Description</Label>
              <Textarea className="mt-1" rows={3} placeholder="Describe the promotion…" value={form.description || ""} onChange={setInput("description")} />
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Type</Label>
              <Select value={form.promo_type} onValueChange={set("promo_type")}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["general","phone_ad","social_post","campaign","offer"].map(v => (
                    <SelectItem key={v} value={v}>{v.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</Label>
              <Select value={form.status} onValueChange={set("status")}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["draft","active","scheduled","ended"].map(v => (
                    <SelectItem key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">CTA Text</Label>
              <Input className="mt-1" placeholder="e.g. Learn More" value={form.cta_text || ""} onChange={setInput("cta_text")} />
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">CTA URL</Label>
              <Input className="mt-1" type="url" placeholder="https://…" value={form.cta_url || ""} onChange={setInput("cta_url")} />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button size="sm" className="gap-2 text-white" style={{ backgroundColor: NEXO_BLUE, border: "none" }} onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              {saving ? "Saving…" : "Save Promotion"}
            </Button>
            <Button size="sm" variant="outline" onClick={cancel}>Cancel</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
      ) : promotions.length === 0 && !showForm ? (
        <div className="bg-white rounded-xl border border-gray-100 text-center py-14">
          <Megaphone className="h-9 w-9 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-500">No promotions yet</p>
          <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={openNew}><Plus className="h-3.5 w-3.5" /> Create one</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {promotions.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-4 hover:border-gray-200 transition-all">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${NEXO_BLUE}18` }}>
                <Megaphone className="h-5 w-5" style={{ color: NEXO_BLUE }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm text-gray-900">{p.title}</p>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusColor[p.status] || "bg-gray-100 text-gray-600"}`}>
                    {p.status}
                  </span>
                  <span className="text-[11px] text-gray-400 capitalize">{p.promo_type?.replace("_", " ")}</span>
                </div>
                {p.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>}
                {p.cta_text && (
                  <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                    <Globe className="h-3 w-3" /> {p.cta_text}
                    {p.cta_url && <a href={p.cta_url} target="_blank" rel="noreferrer" className="underline ml-1 truncate max-w-[200px]">{p.cta_url}</a>}
                  </p>
                )}
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Edit3 className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                  disabled={deleting === p.id} onClick={() => remove(p.id)}>
                  {deleting === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Link Tab ─────────────────────────────────────────────────────────────────
function LinkTab({ franchise }: { franchise: any }) {
  const [copied, setCopied] = useState(false);
  const code = franchise?.code || "";
  const link = `${window.location.origin}/nexo?tab=register&code=${code}`;

  function copy() {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Registration Link</h2>
        <p className="text-sm text-gray-500 mt-1">Share this link with businesses you want to onboard as Nexo clients.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <div>
          <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Your Partner Code</Label>
          <div className="mt-1 flex items-center gap-2">
            <code className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono font-bold text-gray-900">
              {code || "Loading…"}
            </code>
          </div>
        </div>

        <div>
          <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Shareable Registration Link</Label>
          <div className="mt-1 flex gap-2">
            <Input readOnly className="flex-1 text-xs font-mono bg-gray-50" value={link} />
            <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={copy}>
              {copied ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2">When a client registers with this link, they'll be automatically linked to your Nexo partner account.</p>
        </div>

        <div className="rounded-lg p-4" style={{ backgroundColor: `${NEXO_BLUE}0d`, border: `1px solid ${NEXO_BLUE}22` }}>
          <p className="text-xs font-semibold" style={{ color: NEXO_BLUE }}>How it works</p>
          <ol className="mt-2 space-y-1">
            {["Share the link with the business owner.", "They register and their account links to yours automatically.", "They appear in your Clients tab instantly."].map((s, i) => (
              <li key={i} className="text-xs text-gray-500 flex items-start gap-2">
                <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold text-white mt-0.5"
                  style={{ backgroundColor: NEXO_BLUE }}>{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab({ data, user }: { data: any; user: any }) {
  const franchise = data?.franchise;
  const stats = data?.stats;

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-xl font-bold text-gray-900">Partner Profile</h2>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-4">
          <InitialAvatar name={franchise?.name || user?.full_name || ""} size="lg" />
          <div>
            <p className="text-lg font-bold text-gray-900">{franchise?.name || "—"}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mt-1 inline-block font-mono">{franchise?.code}</code>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          {[
            { label: "Region",       value: franchise?.region || "—" },
            { label: "Status",       value: franchise?.status || "—" },
            { label: "Total Clients", value: stats?.total_clients || 0 },
            { label: "Active Clients", value: stats?.active_clients || 0 },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {franchise?.status === "pending" && (
          <div className="flex items-start gap-3 rounded-lg p-3 bg-yellow-50 border border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
            <p className="text-xs text-yellow-700 font-medium">Your partner account is pending admin approval. You can still use the portal but some features may be limited until approved.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function NexoDashboard() {
  const { user, logout: authLogout } = useAuth();
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
      if (!res.ok) { const d = await res.json().catch(() => ({})); setFetchError(d.error || "Could not load data."); setLoading(false); return; }
      setData(await res.json());
    } catch { setFetchError("Network error — please refresh."); }
    setLoading(false);
  }

  async function fetchClients() {
    setClientsLoading(true);
    const res = await fetch("/api/nexo/my/clients", { credentials: "include" });
    if (res.ok) setClients(await res.json());
    setClientsLoading(false);
  }

  async function fetchPromotions() {
    setPromotionsLoading(true);
    const res = await fetch("/api/franchise/promotions", { credentials: "include" });
    if (res.ok) setPromotions(await res.json());
    setPromotionsLoading(false);
  }

  async function handleImpersonate(client: any) {
    const res = await fetch(`/api/nexo/my/clients/${client.client_user_id}/impersonate`, {
      method: "POST", credentials: "include",
    });
    if (!res.ok) { toast.error("Could not view this client"); return; }
    toast.success(`Viewing as ${client.full_name}`);
    // In standalone, just show a toast — no main app to redirect to
  }

  const franchise = data?.franchise;
  const totalClients = Number(data?.stats?.total_clients || 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: NEXO_DARK }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/40 text-sm mt-3">Loading your portal…</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <p className="font-semibold text-gray-900">{fetchError}</p>
          <Button className="mt-4 gap-2" onClick={fetchMe}><ArrowRight className="h-4 w-4" /> Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#f8fafc" }}>

      {/* Sidebar backdrop (mobile) */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-60 flex flex-col transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{ backgroundColor: NEXO_DARK }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-white/[0.07] shrink-0">
          <div className="font-black tracking-tight text-2xl text-white leading-none">nexo</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate leading-tight">{franchise?.name || "Nexo Business"}</p>
            <p className="text-[11px] text-white/40">Business Portal</p>
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
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${isActive ? "text-white" : "text-white/60 hover:bg-white/[0.06] hover:text-white/90"}`}
                style={isActive ? { backgroundColor: `${NEXO_BLUE}33` } : {}}>
                <Icon className="h-4 w-4 shrink-0" style={isActive ? { color: "#93c5fd" } : {}} />
                <span style={isActive ? { color: "#93c5fd" } : {}}>{label}</span>
                {tab === "clients" && totalClients > 0 && (
                  <span className={`ml-auto text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none ${isActive ? "text-blue-300" : "bg-white/10 text-white/50"}`}
                    style={isActive ? { backgroundColor: `${NEXO_BLUE}40` } : {}}>
                    {totalClients}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/[0.06] space-y-1.5">
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium"
            style={{ backgroundColor: `${NEXO_BLUE}20`, color: "#93c5fd" }}>
            <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
            Nexo Partner — {franchise?.status === "active" ? "Active" : "Pending"}
          </div>
          <button onClick={async () => { await authLogout(); navigate("/nexo"); }}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-all">
            <LogOut className="h-4 w-4 shrink-0" /> Sign Out
          </button>
        </div>

        <div className="flex h-1">
          {[NEXO_BLUE, "#1d4ed8", "#1e40af", "#1e3a8a"].map((c, i) => (
            <div key={i} className="flex-1" style={{ background: c }} />
          ))}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 h-14 flex items-center gap-3 shrink-0">
          <button className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-900">{NAV_ITEMS.find(n => n.tab === activeTab)?.label}</p>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <InitialAvatar name={user.full_name} size="sm" />
                <span className="hidden sm:block">{user.full_name}</span>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {activeTab === "overview"   && <OverviewTab data={data} clients={clients} onTabChange={setActiveTab} />}
          {activeTab === "clients"    && <ClientsTab clients={clients} loading={clientsLoading} onImpersonate={handleImpersonate} />}
          {activeTab === "promotions" && <PromotionsTab promotions={promotions} loading={promotionsLoading} onRefresh={fetchPromotions} />}
          {activeTab === "link"       && <LinkTab franchise={franchise} />}
          {activeTab === "profile"    && <ProfileTab data={data} user={user} />}
        </main>
      </div>
    </div>
  );
}
