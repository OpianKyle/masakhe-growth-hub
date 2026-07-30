import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  LayoutDashboard, Users, ShieldCheck, LogOut, ChevronRight,
  CheckCircle2, XCircle, Clock, Search, RefreshCw, Loader2,
  Building2, Phone, Mail, Globe, Eye, EyeOff, ArrowLeft,
  BadgeCheck, AlertCircle, UserX, User, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const NEXO_BLUE = "#2563eb";
const NEXO_DARK = "#0f172a";

type PartnerStatus = "pending" | "active" | "suspended";

interface Partner {
  id: string;
  user_id: string;
  partner_name: string;
  partner_code: string;
  region: string | null;
  branch: string | null;
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: PartnerStatus;
  total_clients: number;
  client_count: number;
  notes: string | null;
  created_at: string;
  approved_at: string | null;
  full_name: string;
  email: string;
}

interface Client {
  id: string;
  client_user_id: string;
  business_name: string | null;
  sector: string | null;
  status: string;
  registered_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  profile_business_name: string | null;
  industry_sector: string | null;
}

function StatusBadge({ status }: { status: PartnerStatus }) {
  const map = {
    pending:   { label: "Pending",   bg: "bg-yellow-100",  text: "text-yellow-800",  icon: Clock },
    active:    { label: "Active",    bg: "bg-green-100",   text: "text-green-800",   icon: CheckCircle2 },
    suspended: { label: "Suspended", bg: "bg-red-100",     text: "text-red-800",     icon: XCircle },
  };
  const { label, bg, text, icon: Icon } = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${bg} ${text}`}>
      <Icon className="h-3 w-3" />{label}
    </span>
  );
}

function ClientDrawer({ partner, onClose }: { partner: Partner; onClose: () => void }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/nexo/admin/${partner.id}/clients`, { credentials: "include" })
      .then(r => r.json()).then(d => setClients(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [partner.id]);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-bold text-gray-900">{partner.partner_name}</h2>
            <p className="text-xs text-gray-500">{partner.partner_code} — {clients.length} clients</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
          ) : clients.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No clients yet</p>
            </div>
          ) : clients.map(c => (
            <div key={c.id} className="rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm text-white"
                  style={{ background: `linear-gradient(135deg, ${NEXO_BLUE}, #1d4ed8)` }}>
                  {c.full_name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{c.full_name}</p>
                  <p className="text-xs text-gray-500 truncate">{c.email}</p>
                  {(c.business_name || c.profile_business_name) && (
                    <p className="text-xs text-blue-600 mt-0.5 flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {c.business_name || c.profile_business_name}
                    </p>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {c.status}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2 ml-13 text-xs text-gray-400">
                {c.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>}
                {c.industry_sector && <span>{c.industry_sector}</span>}
                <span>Joined {new Date(c.registered_at).toLocaleDateString("en-ZA")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function NexoAdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | PartnerStatus>("all");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  useEffect(() => { fetchPartners(); }, []);

  async function fetchPartners() {
    setLoading(true);
    try {
      const res = await fetch("/api/nexo/admin/list", { credentials: "include" });
      if (res.status === 401) { navigate("/nexo"); return; }
      if (res.status === 403) { toast.error("Admin access required"); navigate("/nexo"); return; }
      const data = await res.json();
      setPartners(Array.isArray(data) ? data : []);
    } catch { toast.error("Could not load partners"); }
    setLoading(false);
  }

  async function updateStatus(id: string, status: PartnerStatus) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/nexo/admin/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) { const d = await res.json(); toast.error(d.error); return; }
      toast.success(`Partner ${status}`);
      setPartners(ps => ps.map(p => p.id === id ? { ...p, status } : p));
    } catch { toast.error("Request failed"); }
    setUpdating(null);
  }

  const counts = { all: partners.length, pending: 0, active: 0, suspended: 0 };
  partners.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });

  const filtered = partners.filter(p => {
    if (activeTab !== "all" && p.status !== activeTab) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return p.partner_name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) ||
           p.partner_code.toLowerCase().includes(q) || (p.region || "").toLowerCase().includes(q);
  });

  const TABS = [
    { key: "all",       label: "All",       count: counts.all },
    { key: "pending",   label: "Pending",   count: counts.pending },
    { key: "active",    label: "Active",    count: counts.active },
    { key: "suspended", label: "Suspended", count: counts.suspended },
  ] as const;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc" }}>

      {/* Top nav */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="font-black text-2xl tracking-tight" style={{ color: NEXO_DARK }}>nexo</div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: NEXO_BLUE }}>
            Admin Panel
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:block">{user?.full_name}</span>
          <Button variant="outline" size="sm" className="gap-2" onClick={async () => { await logout(); navigate("/nexo"); }}>
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Partners",    value: counts.all,       color: NEXO_BLUE,  icon: Users },
            { label: "Active Partners",   value: counts.active,    color: "#16a34a",  icon: CheckCircle2 },
            { label: "Pending Approval",  value: counts.pending,   color: "#d97706",  icon: Clock },
            { label: "Suspended",         value: counts.suspended, color: "#dc2626",  icon: XCircle },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${color}18` }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Header + search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Nexo Partners</h1>
            <p className="text-sm text-gray-500">Approve, suspend, or view clients for each partner</p>
          </div>
          <div className="sm:ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input className="pl-9 h-9 w-56" placeholder="Search partners…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={fetchPartners} disabled={loading}>
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-4 w-fit">
          {TABS.map(({ key, label, count }) => (
            <button key={key} onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === key ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}>
              {label}
              {count > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold leading-none ${
                  activeTab === key ? "text-white" : "bg-gray-200 text-gray-600"
                }`} style={activeTab === key ? { backgroundColor: NEXO_BLUE } : {}}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Partner cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 text-center py-16">
            <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-500">No partners found</p>
            <p className="text-sm text-gray-400 mt-1">
              {search ? "Try a different search term" : "No partners in this category yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(partner => (
              <div key={partner.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 transition-all">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg text-white"
                    style={{ background: `linear-gradient(135deg, ${NEXO_BLUE}, #1d4ed8)` }}>
                    {partner.partner_name?.charAt(0)?.toUpperCase() || "N"}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-gray-900">{partner.partner_name}</h3>
                      <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-mono">
                        {partner.partner_code}
                      </code>
                      <StatusBadge status={partner.status} />
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{partner.email}</span>
                      {partner.contact_phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{partner.contact_phone}</span>}
                      {partner.region && <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" />{partner.region}</span>}
                      {partner.branch && <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" />{partner.branch}</span>}
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>Registered by <strong className="text-gray-600">{partner.full_name}</strong></span>
                      <span>•</span>
                      <span>{partner.client_count} client{partner.client_count !== 1 ? "s" : ""}</span>
                      <span>•</span>
                      <span>Joined {new Date(partner.created_at).toLocaleDateString("en-ZA")}</span>
                      {partner.approved_at && (
                        <><span>•</span><span>Approved {new Date(partner.approved_at).toLocaleDateString("en-ZA")}</span></>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs"
                      onClick={() => setSelectedPartner(partner)}>
                      <Eye className="h-3.5 w-3.5" /> Clients
                    </Button>

                    {partner.status === "pending" && (
                      <Button size="sm" className="gap-1.5 text-xs text-white"
                        style={{ backgroundColor: "#16a34a", border: "none" }}
                        disabled={updating === partner.id}
                        onClick={() => updateStatus(partner.id, "active")}>
                        {updating === partner.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        Approve
                      </Button>
                    )}

                    {partner.status === "active" && (
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs text-red-600 border-red-200 hover:bg-red-50"
                        disabled={updating === partner.id}
                        onClick={() => updateStatus(partner.id, "suspended")}>
                        {updating === partner.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserX className="h-3.5 w-3.5" />}
                        Suspend
                      </Button>
                    )}

                    {partner.status === "suspended" && (
                      <Button size="sm" className="gap-1.5 text-xs text-white"
                        style={{ backgroundColor: NEXO_BLUE, border: "none" }}
                        disabled={updating === partner.id}
                        onClick={() => updateStatus(partner.id, "active")}>
                        {updating === partner.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BadgeCheck className="h-3.5 w-3.5" />}
                        Reactivate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPartner && (
        <ClientDrawer partner={selectedPartner} onClose={() => setSelectedPartner(null)} />
      )}
    </div>
  );
}
