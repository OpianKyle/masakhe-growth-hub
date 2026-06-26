import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Building2, Users, TicketCheck, BarChart2, LogOut, Menu, X,
  MapPin, Phone, Mail, CheckCircle2, Clock, AlertCircle, ChevronDown,
  Loader2, RefreshCw, Eye, Search, FileText, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const NAV_ITEMS = [
  { tab: "overview",  label: "Overview",    icon: BarChart2 },
  { tab: "smmEs",     label: "SMMEs",       icon: Users },
  { tab: "tickets",   label: "Support",     icon: TicketCheck },
  { tab: "profile",   label: "Profile",     icon: Building2 },
];

const TICKET_STATUS_COLORS: Record<string, string> = {
  open:        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  resolved:    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  closed:      "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

function StatCard({ icon: Icon, label, value, sub, color = "text-green-700" }: any) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-green-50 dark:bg-green-900/20`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
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
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<any>({});

  const SA_PROVINCES = [
    "Eastern Cape","Free State","Gauteng","KwaZulu-Natal",
    "Limpopo","Mpumalanga","Northern Cape","North West","Western Cape",
  ];

  useEffect(() => {
    fetchMun();
  }, []);

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
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    if (res.ok) { toast.success("Ticket updated"); fetchTickets(); }
    else toast.error("Failed to update ticket");
  }

  async function saveProfile() {
    setSavingProfile(true);
    const res = await fetch("/api/municipality/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(profileForm),
    });
    if (res.ok) { toast.success("Profile saved"); fetchMun(); }
    else toast.error("Failed to save");
    setSavingProfile(false);
  }

  const filteredSmmEs = smmEs.filter(s => {
    if (!smmeSearch) return true;
    const q = smmeSearch.toLowerCase();
    return `${s.full_name} ${s.business_name || ""} ${s.profile_business_name || ""} ${s.email}`.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-green-700" />
      </div>
    );
  }

  const isPending = mun?.status === "pending";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:flex`}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-green-700 flex items-center justify-center flex-shrink-0">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{mun?.municipality_name || "Municipality"}</p>
            <p className="text-xs text-muted-foreground">{mun?.province || "Portal"}</p>
          </div>
          <button className="lg:hidden ml-auto" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ tab, label, icon: Icon }) => (
            <button key={tab} onClick={() => { setActiveTab(tab); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab ? "bg-green-700 text-white" : "text-foreground hover:bg-muted"
              }`}>
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
              {tab === "tickets" && mun?.open_tickets > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{mun.open_tickets}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <button onClick={async () => { await authLogout(); navigate("/login"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <header className="flex items-center gap-3 px-5 py-4 border-b border-border bg-card sticky top-0 z-10">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-muted-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground flex-1">
            {NAV_ITEMS.find(n => n.tab === activeTab)?.label}
          </h1>
          <div className="flex items-center gap-2">
            <Badge className={isPending ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}>
              {isPending ? "Pending Approval" : "Active"}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">{mun?.municipality_code}</span>
          </div>
        </header>

        <main className="flex-1 p-5">

          {/* ── PENDING NOTICE ── */}
          {isPending && (
            <div className="mb-5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-200">Awaiting Approval</p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">Your municipality registration is under review. You'll gain full access once approved by the Masakhe admin team.</p>
              </div>
            </div>
          )}

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Registered SMMEs" value={mun?.smme_count ?? 0} sub="In your municipality" />
                <StatCard icon={TicketCheck} label="Open Support Tickets" value={mun?.open_tickets ?? 0} sub="Awaiting response" color="text-amber-600" />
                <StatCard icon={MapPin} label="Province" value={mun?.province || "—"} sub={mun?.district || ""} />
                <StatCard icon={Shield} label="Status" value={mun?.status === "active" ? "Active" : "Pending"} sub={mun?.status === "active" ? "Full access" : "Awaiting approval"} color={mun?.status === "active" ? "text-green-700" : "text-amber-600"} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-green-700" /> Municipality Details
                  </h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Name</dt>
                      <dd className="font-medium text-foreground">{mun?.municipality_name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Code</dt>
                      <dd className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{mun?.municipality_code}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Province</dt>
                      <dd className="font-medium text-foreground">{mun?.province || "—"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">District</dt>
                      <dd className="font-medium text-foreground">{mun?.district || "—"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Contact</dt>
                      <dd className="font-medium text-foreground">{mun?.contact_person || "—"}</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-700" /> How It Works
                  </h3>
                  <ol className="space-y-3 text-sm text-muted-foreground">
                    {[
                      "Share your municipality code with local SMMEs",
                      "SMMEs register on Masakhe and enter your code",
                      "They appear in your SMME dashboard",
                      "Monitor their activity and respond to support tickets",
                    ].map((item, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-green-700 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Your municipality code</p>
                    <p className="font-mono font-bold text-green-700 text-lg">{mun?.municipality_code}</p>
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
                  <Input placeholder="Search SMMEs..." className="pl-9" value={smmeSearch} onChange={e => setSmmeSearch(e.target.value)} />
                </div>
                <Button variant="outline" size="sm" onClick={fetchSmmEs}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {filteredSmmEs.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-12 text-center">
                  <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-semibold text-foreground mb-1">No SMMEs registered yet</p>
                  <p className="text-sm text-muted-foreground">Share your code <span className="font-mono font-bold text-green-700">{mun?.municipality_code}</span> with local businesses to get started.</p>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Business</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Owner</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sector</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Registered</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
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
                          <td className="px-4 py-3 text-muted-foreground">{s.registered_at ? new Date(s.registered_at).toLocaleDateString("en-ZA") : "—"}</td>
                          <td className="px-4 py-3">
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              {s.status}
                            </Badge>
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
                <Button variant="outline" size="sm" onClick={fetchTickets}><RefreshCw className="h-4 w-4" /></Button>
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
                          {t.full_name && <p className="text-xs text-muted-foreground">{t.full_name} · {t.email}</p>}
                        </div>
                        <Badge className={TICKET_STATUS_COLORS[t.status] || ""}>
                          {t.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{t.message}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs text-muted-foreground mr-auto">{new Date(t.created_at).toLocaleDateString("en-ZA")}</p>
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
                          <Button size="sm" variant="outline" onClick={() => updateTicketStatus(t.id, "closed")}>
                            Close
                          </Button>
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
                <h3 className="font-semibold text-foreground mb-4">Municipality Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Municipality Name</label>
                    <Input value={profileForm.municipality_name || ""} onChange={e => setProfileForm((p: any) => ({ ...p, municipality_name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Province</label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={profileForm.province || ""} onChange={e => setProfileForm((p: any) => ({ ...p, province: e.target.value }))}>
                      <option value="">Select province</option>
                      {SA_PROVINCES.map(pr => <option key={pr}>{pr}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">District / Region</label>
                    <Input value={profileForm.district || ""} onChange={e => setProfileForm((p: any) => ({ ...p, district: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-4">Contact Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Contact Person</label>
                    <Input value={profileForm.contact_person || ""} onChange={e => setProfileForm((p: any) => ({ ...p, contact_person: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Contact Email</label>
                    <Input type="email" value={profileForm.contact_email || ""} onChange={e => setProfileForm((p: any) => ({ ...p, contact_email: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Contact Phone</label>
                    <Input value={profileForm.contact_phone || ""} onChange={e => setProfileForm((p: any) => ({ ...p, contact_phone: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
                    <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none min-h-[80px]"
                      value={profileForm.notes || ""} onChange={e => setProfileForm((p: any) => ({ ...p, notes: e.target.value }))} />
                  </div>
                </div>
              </div>

              <Button className="bg-green-700 hover:bg-green-800 text-white w-full" onClick={saveProfile} disabled={savingProfile}>
                {savingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
