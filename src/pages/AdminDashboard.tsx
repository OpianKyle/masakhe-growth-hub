import { useState, useEffect } from "react";
import { Link, useLocation, Routes, Route } from "react-router-dom";
import {
  LayoutDashboard, Users, Globe, Settings, ChevronLeft, ChevronRight, Bell, Search,
  TrendingUp, Building2, ExternalLink, Trash2, Shield, ShieldCheck, Eye, Receipt, FileText, BarChart3
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
          <Route path="*" element={<AdminOverview />} />
        </Routes>
      </main>
    </div>
  );
}
