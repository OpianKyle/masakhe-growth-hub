import { useState, useEffect } from "react";
import { Link, useLocation, Routes, Route } from "react-router-dom";
import {
  LayoutDashboard, Users, Globe, Settings, ChevronLeft, ChevronRight, Bell, Search,
  TrendingUp, Building2, ExternalLink, Trash2, Shield, ShieldCheck, Eye, Receipt, FileText, BarChart3,
  Plus, Edit, X, MapPin, Calendar, DollarSign, Briefcase, ArrowLeft, CheckCircle2, Clock, XCircle, Star
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Stats {
  totalUsers: number;
  totalWebsites: number;
  publishedWebsites: number;
  totalProfiles: number;
  recentUsers: number;
  totalInvoices: number;
  totalLedgerEntries: number;
  revenueByMonth: Array<{ month: string; income: number; expense: number }>;
}

interface Client {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  business_name?: string;
  trading_name?: string;
  business_status?: string;
  business_type?: string;
  industry_sector?: string;
  phone?: string;
  physical_address?: string;
  website_count: number;
}

const adminNavItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/admin" },
  { icon: Users, label: "Clients", path: "/admin/clients" },
  { icon: FileText, label: "Tenders", path: "/admin/tenders" },
  { icon: Globe, label: "Websites", path: "/admin/websites" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats", { credentials: "include" })
      .then((r) => r.json())
      .then(setStats)
      .catch(() => toast.error("Failed to load stats"));
  }, []);

  if (!stats) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;

  const cards = [
    { label: "Total Clients", value: stats.totalUsers, icon: Users, color: "bg-blue-500/10 text-blue-600" },
    { label: "New This Week", value: stats.recentUsers, icon: TrendingUp, color: "bg-green-500/10 text-green-600" },
    { label: "Total Websites", value: stats.totalWebsites, icon: Globe, color: "bg-purple-500/10 text-purple-600" },
    { label: "Published Sites", value: stats.publishedWebsites, icon: ExternalLink, color: "bg-orange-500/10 text-orange-600" },
    { label: "Invoices Created", value: stats.totalInvoices, icon: Receipt, color: "bg-teal-500/10 text-teal-600" },
    { label: "Ledger Entries", value: stats.totalLedgerEntries, icon: FileText, color: "bg-indigo-500/10 text-indigo-600" },
  ];

  const chartData = (stats.revenueByMonth || []).map((r) => ({
    month: r.month,
    Income: r.income / 100,
    Expenses: r.expense / 100,
  }));

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold font-heading">Admin Overview</h2>
        <p className="text-muted-foreground">Platform statistics and management.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold mt-3">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-bold font-heading mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Platform Revenue Overview (Aggregated, Anonymised)
        </h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `R${v}`} />
              <Tooltip formatter={(v: number) => `R${v.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="Income" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
            <BarChart3 className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">No revenue data yet</p>
            <p className="text-xs mt-1">Revenue will appear here once clients start logging income and expenses.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const loadClients = () => {
    fetch("/api/admin/clients", { credentials: "include" })
      .then((r) => r.json())
      .then(setClients)
      .catch(() => toast.error("Failed to load clients"));
  };

  useEffect(() => { loadClients(); }, []);

  const toggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const res = await fetch(`/api/admin/clients/${id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      toast.success(`Role updated to ${newRole}`);
      loadClients();
    }
  };

  const deleteClient = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/clients/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      toast.success("Client deleted");
      loadClients();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to delete");
    }
  };

  const filtered = clients.filter((c) =>
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.business_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading">Clients</h2>
          <p className="text-muted-foreground">{clients.length} registered businesses</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search clients..." className="pl-9 w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-4 font-semibold">Client</th>
              <th className="text-left p-4 font-semibold">Business</th>
              <th className="text-left p-4 font-semibold">Industry</th>
              <th className="text-left p-4 font-semibold">Sites</th>
              <th className="text-left p-4 font-semibold">Role</th>
              <th className="text-left p-4 font-semibold">Joined</th>
              <th className="text-right p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((client) => (
              <tr key={client.id} className="border-b hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <div className="font-medium">{client.full_name}</div>
                  <div className="text-xs text-muted-foreground">{client.email}</div>
                </td>
                <td className="p-4">{client.business_name || <span className="text-muted-foreground italic">Not set</span>}</td>
                <td className="p-4">
                  {client.industry_sector ? (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{client.industry_sector}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="p-4">
                  <span className="rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-bold">{client.website_count}</span>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${client.role === "admin" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
                    {client.role === "admin" ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                    {client.role}
                  </span>
                </td>
                <td className="p-4 text-muted-foreground text-xs">{new Date(client.created_at).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Toggle role" onClick={() => toggleRole(client.id, client.role)}>
                      <Shield className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" title="Delete" onClick={() => deleteClient(client.id, client.full_name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">No clients found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const CATEGORIES = [
  "Construction", "IT & Technology", "Consulting", "Catering & Events",
  "Transport & Logistics", "Cleaning & Maintenance", "Marketing & Media",
  "Agriculture", "Manufacturing", "Education & Training", "Health & Wellness", "Other"
];

function formatCurrency(cents: number) {
  return `R ${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

interface TenderForm {
  title: string;
  description: string;
  category: string;
  budget_min: string;
  budget_max: string;
  location: string;
  deadline: string;
  requirements: string;
  status: string;
}

const emptyForm: TenderForm = { title: "", description: "", category: "", budget_min: "", budget_max: "", location: "", deadline: "", requirements: "", status: "OPEN" };

function AdminTenders() {
  const [tenders, setTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<TenderForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [viewApps, setViewApps] = useState<number | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);

  const fetchTenders = async () => {
    try {
      const res = await fetch("/api/tenders/admin/all", { credentials: "include" });
      const data = await res.json();
      setTenders(data.tenders || []);
    } catch { toast.error("Failed to load tenders"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTenders(); }, []);

  const fetchApplications = async (tenderId: number) => {
    setAppsLoading(true);
    setViewApps(tenderId);
    try {
      const res = await fetch(`/api/tenders/admin/${tenderId}/applications`, { credentials: "include" });
      const data = await res.json();
      setApplications(data.applications || []);
    } catch { toast.error("Failed to load applications"); }
    finally { setAppsLoading(false); }
  };

  const updateAppStatus = async (appId: number, status: string) => {
    try {
      const res = await fetch(`/api/tenders/admin/applications/${appId}/status`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setApplications(applications.map(a => a.id === appId ? { ...a, status } : a));
      toast.success(`Application ${status.toLowerCase()}`);
    } catch { toast.error("Failed to update status"); }
  };

  const openEdit = (tender: any) => {
    setEditing(tender.id);
    setForm({
      title: tender.title || "",
      description: tender.description || "",
      category: tender.category || "",
      budget_min: tender.budget_min ? String(tender.budget_min / 100) : "",
      budget_max: tender.budget_max ? String(tender.budget_max / 100) : "",
      location: tender.location || "",
      deadline: tender.deadline ? tender.deadline.split("T")[0] : "",
      requirements: tender.requirements || "",
      status: tender.status || "OPEN",
    });
    setShowForm(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        budget_min: form.budget_min ? Math.round(parseFloat(form.budget_min) * 100) : null,
        budget_max: form.budget_max ? Math.round(parseFloat(form.budget_max) * 100) : null,
      };
      const url = editing ? `/api/tenders/admin/${editing}` : "/api/tenders/admin";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success(editing ? "Tender updated" : "Tender created");
      setShowForm(false);
      fetchTenders();
    } catch { toast.error("Failed to save tender"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this tender and all its applications?")) return;
    try {
      const res = await fetch(`/api/tenders/admin/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      toast.success("Tender deleted");
      fetchTenders();
    } catch { toast.error("Failed to delete tender"); }
  };

  const appStatusColor = (s: string) => {
    switch (s) {
      case "PENDING": return "bg-yellow-100 text-yellow-700";
      case "SHORTLISTED": return "bg-blue-100 text-blue-700";
      case "ACCEPTED": return "bg-green-100 text-green-700";
      case "REJECTED": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (viewApps !== null) {
    const tender = tenders.find(t => t.id === viewApps);
    return (
      <div className="p-6">
        <button onClick={() => setViewApps(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Tenders
        </button>
        <h3 className="text-xl font-bold font-heading mb-1">Applications for: {tender?.title}</h3>
        <p className="text-sm text-muted-foreground mb-6">{applications.length} application{applications.length !== 1 ? "s" : ""}</p>

        {appsLoading ? <p className="text-muted-foreground">Loading...</p> : applications.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No applications received yet.</p>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="border rounded-xl p-5 bg-card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{app.full_name}</h4>
                    <p className="text-sm text-muted-foreground">{app.email}</p>
                    {app.business_name && <p className="text-sm text-muted-foreground">{app.business_name} {app.industry_sector ? `• ${app.industry_sector}` : ""}</p>}
                    {app.phone && <p className="text-sm text-muted-foreground">{app.phone}</p>}
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${appStatusColor(app.status)}`}>{app.status}</span>
                </div>
                {app.proposed_amount && <p className="text-sm mb-2"><strong>Proposed:</strong> {formatCurrency(app.proposed_amount)}</p>}
                {app.cover_letter && (
                  <div className="bg-muted/50 rounded-lg p-3 mb-3">
                    <p className="text-sm whitespace-pre-wrap">{app.cover_letter}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => updateAppStatus(app.id, "SHORTLISTED")} disabled={app.status === "SHORTLISTED"}>
                    <Star className="h-3.5 w-3.5 mr-1" /> Shortlist
                  </Button>
                  <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => updateAppStatus(app.id, "ACCEPTED")} disabled={app.status === "ACCEPTED"}>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Accept
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => updateAppStatus(app.id, "REJECTED")} disabled={app.status === "REJECTED"}>
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Applied {formatDate(app.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <button onClick={() => setShowForm(false)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Tenders
        </button>
        <h3 className="text-xl font-bold font-heading mb-6">{editing ? "Edit Tender" : "Create New Tender"}</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Title *</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Office Building Renovation" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Description</label>
            <textarea className="w-full min-h-[120px] rounded-lg border border-input bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the project scope and objectives..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Min Budget (ZAR)</label>
              <Input type="number" value={form.budget_min} onChange={(e) => setForm({ ...form, budget_min: e.target.value })} placeholder="e.g. 50000" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Max Budget (ZAR)</label>
              <Input type="number" value={form.budget_max} onChange={(e) => setForm({ ...form, budget_max: e.target.value })} placeholder="e.g. 150000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Location</label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Johannesburg, Gauteng" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Deadline</label>
              <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Requirements</label>
            <textarea className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} placeholder="List qualifications, certifications, or experience needed..." />
          </div>
          {editing && (
            <div>
              <label className="text-sm font-medium block mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
                <option value="AWARDED">Awarded</option>
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editing ? "Update Tender" : "Create Tender"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold font-heading">Manage Tenders</h3>
          <p className="text-sm text-muted-foreground mt-1">Create and manage business tenders for platform users</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" /> New Tender
        </Button>
      </div>

      {loading ? <p className="text-muted-foreground">Loading...</p> : tenders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No tenders yet</p>
          <p className="text-sm mt-1">Create your first tender to get started.</p>
          <Button className="mt-4" onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Create Tender</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {tenders.map((tender) => (
            <div key={tender.id} className="border rounded-xl p-5 bg-card">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-lg">{tender.title}</h4>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tender.status === "OPEN" ? "bg-emerald-100 text-emerald-700" : tender.status === "CLOSED" ? "bg-gray-100 text-gray-600" : "bg-amber-100 text-amber-700"}`}>
                      {tender.status}
                    </span>
                  </div>
                  {tender.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{tender.description}</p>}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    {tender.category && <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{tender.category}</span>}
                    {tender.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{tender.location}</span>}
                    {tender.deadline && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(tender.deadline)}</span>}
                    {(tender.budget_min || tender.budget_max) && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        {tender.budget_min && tender.budget_max
                          ? `${formatCurrency(tender.budget_min)} - ${formatCurrency(tender.budget_max)}`
                          : tender.budget_max ? `Up to ${formatCurrency(tender.budget_max)}` : `From ${formatCurrency(tender.budget_min)}`
                        }
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                <Button size="sm" variant="outline" onClick={() => fetchApplications(tender.id)}>
                  <Eye className="h-3.5 w-3.5 mr-1" /> {tender.application_count} Application{tender.application_count !== 1 ? "s" : ""}
                </Button>
                <Button size="sm" variant="outline" onClick={() => openEdit(tender)}>
                  <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDelete(tender.id)}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const getPageTitle = () => {
    const item = adminNavItems.find((item) => item.path === location.pathname);
    return item ? item.label : "Admin";
  };

  return (
    <div className="flex h-screen bg-background">
      <aside className={`flex flex-col border-r border-sidebar-border bg-slate-950 transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
          {!collapsed && (
            <Link to="/admin" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
                <span className="text-sm font-bold text-white font-heading">M</span>
              </div>
              <div>
                <span className="text-lg font-bold font-heading text-white">Masakhe</span>
                <span className="ml-1 text-xs text-amber-400 font-semibold">ADMIN</span>
              </div>
            </Link>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="text-white/60 hover:text-white">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {adminNavItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${active ? "bg-amber-500/20 text-amber-400 font-semibold" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="px-2 pb-4 space-y-2">
          {!collapsed && (
            <Link to="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white">
              <Building2 className="h-5 w-5" />
              <span>User Dashboard</span>
            </Link>
          )}
        </div>

        <div className="flex h-1">
          <div className="flex-1 bg-amber-500" />
          <div className="flex-1 bg-amber-600" />
          <div className="flex-1 bg-amber-700" />
          <div className="flex-1 bg-amber-800" />
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-md px-6">
          <h1 className="text-xl font-bold font-heading">{getPageTitle()}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.full_name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>Sign Out</Button>
          </div>
        </header>

        <Routes>
          <Route index element={<AdminOverview />} />
          <Route path="clients" element={<ClientList />} />
          <Route path="tenders" element={<AdminTenders />} />
          <Route path="*" element={<AdminOverview />} />
        </Routes>
      </main>
    </div>
  );
}
