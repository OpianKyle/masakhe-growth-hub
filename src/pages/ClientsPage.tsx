import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Plus, Download, Upload, Loader2, Trash2, ChevronDown,
  ChevronUp, Mail, Phone, Briefcase, Shield, FileText, X, Eye, Edit2,
  CheckCircle, AlertCircle, User, Building2, CreditCard, Home, FolderOpen,
  MoreVertical, Save, UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Client {
  id: string;
  full_name: string;
  id_number?: string;
  date_of_birth?: string;
  gender?: string;
  marital_status?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  physical_address?: string;
  postal_address?: string;
  employment_status?: string;
  employer_name?: string;
  occupation?: string;
  monthly_income_cents?: number;
  dependants?: number;
  risk_profile?: string;
  credit_score?: number;
  policy_number?: string;
  property_interest?: string;
  status: string;
  notes?: string;
  business_name?: string;
  business_registration?: string;
  vat_number?: string;
  business_type?: string;
  business_website?: string;
  business_email?: string;
  business_phone?: string;
  business_whatsapp?: string;
  business_address?: string;
  client_type?: string;
  created_at: string;
  source?: "platform" | "crm";
}

interface ClientDoc {
  id: string;
  document_name: string;
  document_type: string;
  file_size: number;
  mime_type?: string;
  created_at: string;
}

const EMPTY_CLIENT: Omit<Client, "id" | "created_at"> = {
  full_name: "", id_number: "", date_of_birth: "", gender: "", marital_status: "",
  email: "", phone: "", whatsapp: "", physical_address: "", postal_address: "",
  employment_status: "", employer_name: "", occupation: "",
  monthly_income_cents: 0, dependants: 0, risk_profile: "medium",
  credit_score: undefined, policy_number: "", property_interest: "", status: "prospect", notes: "",
  client_type: "business",
  business_name: "", business_registration: "", vat_number: "", business_type: "",
  business_website: "", business_email: "", business_phone: "", business_whatsapp: "", business_address: "",
};

const DOC_TYPES = [
  { value: "id", label: "ID / Passport" },
  { value: "proof_of_income", label: "Proof of Income" },
  { value: "bank_statement", label: "Bank Statement" },
  { value: "payslip", label: "Payslip" },
  { value: "proof_of_address", label: "Proof of Address" },
  { value: "contract", label: "Contract / Policy" },
  { value: "tax_certificate", label: "Tax Certificate" },
  { value: "other", label: "Other" },
];

const DOC_TYPE_COLORS: Record<string, string> = {
  id: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  proof_of_income: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  bank_statement: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  payslip: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  proof_of_address: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  contract: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  tax_certificate: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  other: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const DOC_TYPE_ICON_BG: Record<string, string> = {
  id: "bg-violet-100 dark:bg-violet-900/30",
  proof_of_income: "bg-green-100 dark:bg-green-900/30",
  bank_statement: "bg-blue-100 dark:bg-blue-900/30",
  payslip: "bg-teal-100 dark:bg-teal-900/30",
  proof_of_address: "bg-amber-100 dark:bg-amber-900/30",
  contract: "bg-indigo-100 dark:bg-indigo-900/30",
  tax_certificate: "bg-orange-100 dark:bg-orange-900/30",
  other: "bg-gray-100 dark:bg-gray-800",
};

const DOC_TYPE_ICON_COLOR: Record<string, string> = {
  id: "text-violet-600 dark:text-violet-400",
  proof_of_income: "text-green-600 dark:text-green-400",
  bank_statement: "text-blue-600 dark:text-blue-400",
  payslip: "text-teal-600 dark:text-teal-400",
  proof_of_address: "text-amber-600 dark:text-amber-400",
  contract: "text-indigo-600 dark:text-indigo-400",
  tax_certificate: "text-orange-600 dark:text-orange-400",
  other: "text-gray-500 dark:text-gray-400",
};

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.replace(/^"|"$/g, "").trim());
  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; }
      else if (ch === "," && !inQ) { values.push(cur); cur = ""; }
      else { cur += ch; }
    }
    values.push(cur);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (values[i] || "").trim(); });
    return row;
  });
}

const fmtMoney = (cents?: number) =>
  cents ? `R ${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` : "—";
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" });
const fmtBytes = (b: number) =>
  b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`;

const getInitials = (name: string) =>
  name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join("");

const avatarColors = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-indigo-600",
  "from-teal-500 to-cyan-600",
  "from-green-500 to-emerald-600",
  "from-amber-500 to-orange-600",
  "from-pink-500 to-rose-600",
];
const getAvatarColor = (name: string) => {
  const code = name ? name.charCodeAt(0) : 0;
  return avatarColors[code % avatarColors.length];
};

const riskColors: Record<string, string> = {
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};
const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  prospect: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export default function ClientsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [clients, setClients] = useState<Client[]>([]);
  const [platformUsers, setPlatformUsers] = useState<Client[]>([]);
  const [showPlatformUsers, setShowPlatformUsers] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, prospects: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<any>({ ...EMPTY_CLIENT });
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [docs, setDocs] = useState<ClientDoc[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docType, setDocType] = useState("other");
  const [docName, setDocName] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "documents" | "statements">("details");
  const [statements, setStatements] = useState<{ invoices: any[]; monthly: any[] }>({ invoices: [], monthly: [] });
  const [loadingStatements, setLoadingStatements] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const docUploadRef = useRef<HTMLInputElement>(null);

  const fetchClients = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/clients", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/clients/stats", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([clientsData, statsData]) => {
        setClients(Array.isArray(clientsData) ? clientsData.map((c: Client) => ({ ...c, source: "crm" as const })) : []);
        setStats(statsData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchPlatformUsers = () => {
    if (!isAdmin) return;
    fetch("/api/clients/platform-users", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPlatformUsers(data.map((u: any) => ({
            id: u.id,
            full_name: u.full_name,
            email: u.email,
            phone: u.phone,
            business_name: u.business_name || u.trading_name,
            business_type: u.business_type,
            business_email: u.business_email,
            business_phone: u.business_phone,
            business_address: u.business_address,
            status: "active",
            client_type: "business",
            created_at: u.created_at,
            source: "platform" as const,
          })));
        } else {
          console.error("[Platform Users] API error:", data?.error);
        }
      })
      .catch((err) => console.error("[Platform Users] Fetch error:", err));
  };

  useEffect(() => {
    fetchClients();
    fetchPlatformUsers();
  }, [isAdmin]);

  const fetchDocs = (clientId: string) => {
    setLoadingDocs(true);
    fetch(`/api/clients/${clientId}/documents`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setDocs(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoadingDocs(false));
  };

  const fetchStatements = (clientId: string) => {
    setLoadingStatements(true);
    fetch(`/api/clients/${clientId}/invoices`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setStatements(data && Array.isArray(data.invoices) ? data : { invoices: [], monthly: [] }))
      .catch(() => {})
      .finally(() => setLoadingStatements(false));
  };

  const openClient = (client: Client) => {
    setSelectedClient(client);
    setActiveTab("details");
    fetchDocs(client.id);
    fetchStatements(client.id);
  };

  const openAdd = () => {
    setEditingClient(null);
    setFormData({ ...EMPTY_CLIENT });
    setShowForm(true);
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      ...client,
      monthly_income_cents: client.monthly_income_cents
        ? (client.monthly_income_cents / 100).toFixed(2)
        : "",
    });
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingClient(null); };

  const handleSave = async () => {
    if (!formData.full_name?.trim()) {
      toast({ title: formData.client_type === "business" ? "Contact person name is required" : "Full name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = { ...formData, monthly_income: formData.monthly_income_cents || formData.monthly_income };
      const url = editingClient ? `/api/clients/${editingClient.id}` : "/api/clients";
      const method = editingClient ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      toast({ title: editingClient ? "Client updated" : "Client added" });
      closeForm();
      fetchClients();
      if (selectedClient && editingClient && selectedClient.id === editingClient.id) {
        const updated = await fetch(`/api/clients/${editingClient.id}`, { credentials: "include" }).then(r => r.json());
        setSelectedClient(updated);
      }
    } catch (err: any) {
      toast({ title: err.message || "Save failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (client: Client) => {
    if (!confirm(`Delete client "${client.full_name}"? This will also delete all their documents.`)) return;
    try {
      await fetch(`/api/clients/${client.id}`, { method: "DELETE", credentials: "include" });
      toast({ title: "Client deleted" });
      if (selectedClient?.id === client.id) setSelectedClient(null);
      fetchClients();
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/clients/export", { credentials: "include" });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clients-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Clients exported successfully" });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast({ title: "Please select a CSV file", variant: "destructive" });
      return;
    }
    setImporting(true);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length === 0) throw new Error("No valid rows found");
      const res = await fetch("/api/clients/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      toast({ title: `Imported ${data.imported} clients${data.skipped ? ` (${data.skipped} skipped)` : ""}` });
      fetchClients();
    } catch (err: any) {
      toast({ title: err.message || "Import failed", variant: "destructive" });
    } finally {
      setImporting(false);
      if (importRef.current) importRef.current.value = "";
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedClient) return;
    setUploadingDoc(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("document_type", docType);
      fd.append("document_name", docName || file.name);
      const res = await fetch(`/api/clients/${selectedClient.id}/documents`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      toast({ title: "Document uploaded" });
      setDocName("");
      fetchDocs(selectedClient.id);
    } catch (err: any) {
      toast({ title: err.message || "Upload failed", variant: "destructive" });
    } finally {
      setUploadingDoc(false);
      if (docUploadRef.current) docUploadRef.current.value = "";
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!selectedClient || !confirm("Delete this document?")) return;
    try {
      await fetch(`/api/clients/${selectedClient.id}/documents/${docId}`, {
        method: "DELETE",
        credentials: "include",
      });
      toast({ title: "Document deleted" });
      fetchDocs(selectedClient.id);
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const handleViewDoc = async (doc: ClientDoc) => {
    if (!selectedClient) return;
    try {
      const res = await fetch(`/api/clients/${selectedClient.id}/documents/${doc.id}`, { credentials: "include" });
      const data = await res.json();
      const a = document.createElement("a");
      a.href = data.file_data;
      a.download = doc.document_name;
      a.click();
    } catch {
      toast({ title: "Could not open document", variant: "destructive" });
    }
  };

  const allClients = [
    ...clients,
    ...(isAdmin && showPlatformUsers ? platformUsers : []),
  ];

  const filtered = allClients.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return `${c.full_name} ${c.email || ""} ${c.phone || ""} ${c.id_number || ""} ${c.business_name || ""}`.toLowerCase().includes(q);
  });

  const Field = ({ label, value }: { label: string; value?: string | number | null }) =>
    value ? (
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    ) : null;

  const SectionHeader = ({
    icon: Icon,
    label,
    iconBg,
  }: {
    icon: React.ElementType;
    label: string;
    iconBg: string;
  }) => (
    <div className="flex items-center gap-3 mb-4">
      <div className={`flex items-center justify-center w-7 h-7 rounded-lg ${iconBg}`}>
        <Icon className="h-3.5 w-3.5 text-white" />
      </div>
      <h4 className="font-semibold text-sm text-foreground uppercase tracking-wide">{label}</h4>
    </div>
  );

  const statCards = [
    {
      label: "CRM Clients",
      value: stats.total,
      icon: Users,
      iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
      cardAccent: "border-l-4 border-l-violet-500",
    },
    ...(isAdmin ? [{
      label: "Platform Users",
      value: platformUsers.length,
      icon: UserCheck,
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
      cardAccent: "border-l-4 border-l-emerald-500",
    }] : []),
    {
      label: "Active",
      value: stats.active,
      icon: CheckCircle,
      iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
      cardAccent: "border-l-4 border-l-green-500",
    },
    {
      label: "Prospects",
      value: stats.prospects,
      icon: AlertCircle,
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
      cardAccent: "border-l-4 border-l-blue-500",
    },
    ...(!isAdmin ? [{
      label: "Inactive",
      value: stats.inactive,
      icon: X,
      iconBg: "bg-gradient-to-br from-gray-400 to-gray-500",
      cardAccent: "border-l-4 border-l-gray-400",
    }] : []),
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        <div className="relative">
          <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            Clients
          </h2>
          <p className="text-muted-foreground mt-1">Manage your client portfolio and documents.</p>
        </div>
        <div className="relative flex items-center gap-2 flex-wrap">
          <input ref={importRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
          <Button variant="outline" size="sm" onClick={() => importRef.current?.click()} disabled={importing}>
            {importing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
            Import CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Download className="h-4 w-4 mr-1" />}
            Export CSV
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Add Client
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-xl border border-border bg-card shadow-card p-4 ${s.cardAccent}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${s.iconBg} shadow-sm`}>
                <s.icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-muted/40 rounded-xl p-3 border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search clients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-background" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm min-w-[140px]">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="prospect">Prospect</option>
          <option value="inactive">Inactive</option>
        </select>
        {isAdmin && (
          <button
            onClick={() => setShowPlatformUsers((v) => !v)}
            className={`flex items-center gap-2 h-10 px-4 rounded-md border text-sm font-medium transition-colors ${showPlatformUsers ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-400" : "bg-background border-input text-muted-foreground"}`}
          >
            <UserCheck className="h-4 w-4" />
            Platform Users
            <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${showPlatformUsers ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200" : "bg-muted text-muted-foreground"}`}>
              {platformUsers.length}
            </span>
          </button>
        )}
      </div>

      {/* Main content */}
      <div className={`flex gap-4 ${selectedClient ? "flex-col lg:flex-row" : ""}`}>
        {/* Client list */}
        <div className={selectedClient ? "lg:w-1/2 xl:w-2/5" : "w-full"}>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No clients yet</p>
              <p className="text-sm mt-1">Add clients manually or import a CSV file.</p>
              <Button className="mt-4" onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add First Client</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((client) => (
                <motion.div key={client.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  onClick={() => openClient(client)}
                  className={`rounded-xl border bg-card shadow-card p-4 cursor-pointer transition-all hover:border-primary/50 hover:shadow-md ${selectedClient?.id === client.id ? "border-primary bg-primary/5 shadow-md" : "border-border"}`}>
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(client.full_name)} flex items-center justify-center shadow-sm`}>
                      <span className="text-sm font-bold text-white">{getInitials(client.full_name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{client.full_name}</span>
                        {client.source === "platform" && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <UserCheck className="h-3 w-3" />Platform
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                        {client.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{client.email}</span>}
                        {client.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{client.phone}</span>}
                        {client.business_name && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{client.business_name}</span>}
                        {client.monthly_income_cents ? <span>{fmtMoney(client.monthly_income_cents)}/mo</span> : null}
                      </div>
                      {client.occupation && <p className="text-xs text-muted-foreground mt-0.5">{client.occupation}{client.employer_name ? ` @ ${client.employer_name}` : ""}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {client.source !== "platform" && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEdit(client); }}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(client); }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Client detail panel */}
        {selectedClient && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="lg:flex-1 rounded-xl border border-border bg-card shadow-card overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(selectedClient.full_name)} flex items-center justify-center shadow-sm`}>
                  <span className="text-sm font-bold text-white">{getInitials(selectedClient.full_name)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-foreground">{selectedClient.full_name}</h3>
                    {selectedClient.source === "platform" && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <UserCheck className="h-3 w-3" />Platform User
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedClient.source === "platform"
                      ? (selectedClient.business_name || selectedClient.email || "Registered user")
                      : (selectedClient.policy_number ? `Policy: ${selectedClient.policy_number}` : "No policy number")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedClient.source === "platform" ? (
                  <Button size="sm" variant="outline" onClick={() => {
                    const params = new URLSearchParams({
                      prefill_name: selectedClient.full_name,
                      prefill_email: selectedClient.email || "",
                      prefill_business: selectedClient.business_name || "",
                      platform_user_id: selectedClient.id,
                    });
                    window.location.href = `/dashboard/invoices?${params.toString()}`;
                  }}>
                    <FileText className="h-3.5 w-3.5 mr-1" />Create Invoice
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => openEdit(selectedClient)}>
                    <Edit2 className="h-3.5 w-3.5 mr-1" />Edit
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => setSelectedClient(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border bg-muted/20">
              {(["details", "documents", "statements"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-sm font-medium transition-colors ${activeTab === tab ? "border-b-2 border-primary text-primary bg-background" : "text-muted-foreground hover:text-foreground"}`}>
                  {tab === "details" ? "Client Details" : tab === "documents" ? "Documents" : "Statements"}
                </button>
              ))}
            </div>

            <div className="p-5 overflow-y-auto max-h-[600px]">
              {activeTab === "details" && (
                <div className="space-y-4">
                  {/* Personal */}
                  {(selectedClient.id_number || selectedClient.date_of_birth || selectedClient.gender || selectedClient.marital_status || selectedClient.dependants) && (
                  <section className="rounded-xl bg-violet-50/60 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/20 p-4">
                    <SectionHeader icon={User} label="Personal Information" iconBg="bg-gradient-to-br from-violet-500 to-purple-600" />
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      <Field label="Full Name" value={selectedClient.full_name} />
                      <Field label="ID / Passport Number" value={selectedClient.id_number} />
                      <Field label="Date of Birth" value={selectedClient.date_of_birth} />
                      <Field label="Gender" value={selectedClient.gender} />
                      <Field label="Marital Status" value={selectedClient.marital_status} />
                      <Field label="Dependants" value={selectedClient.dependants} />
                    </div>
                  </section>
                  )}

                  {/* Contact */}
                  {(selectedClient.email || selectedClient.phone || selectedClient.whatsapp || selectedClient.physical_address || selectedClient.postal_address) && (
                  <section className="rounded-xl bg-blue-50/60 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 p-4">
                    <SectionHeader icon={Phone} label="Contact Details" iconBg="bg-gradient-to-br from-blue-500 to-indigo-600" />
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      <Field label="Email" value={selectedClient.email} />
                      <Field label="Phone" value={selectedClient.phone} />
                      <Field label="WhatsApp" value={selectedClient.whatsapp} />
                    </div>
                    {selectedClient.physical_address && (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground">Physical Address</p>
                        <p className="text-sm font-medium text-foreground whitespace-pre-line">{selectedClient.physical_address}</p>
                      </div>
                    )}
                    {selectedClient.postal_address && (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground">Postal Address</p>
                        <p className="text-sm font-medium text-foreground whitespace-pre-line">{selectedClient.postal_address}</p>
                      </div>
                    )}
                  </section>
                  )}

                  {/* Employment & Finance */}
                  {(selectedClient.employment_status || selectedClient.employer_name || selectedClient.occupation || selectedClient.monthly_income_cents) && (
                  <section className="rounded-xl bg-teal-50/60 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/20 p-4">
                    <SectionHeader icon={Building2} label="Employment & Finances" iconBg="bg-gradient-to-br from-teal-500 to-cyan-600" />
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      <Field label="Employment Status" value={selectedClient.employment_status} />
                      <Field label="Employer" value={selectedClient.employer_name} />
                      <Field label="Occupation" value={selectedClient.occupation} />
                      <Field label="Monthly Income" value={selectedClient.monthly_income_cents ? fmtMoney(selectedClient.monthly_income_cents) : undefined} />
                    </div>
                  </section>
                  )}

                  {/* Client Profile */}
                  {(selectedClient.policy_number || selectedClient.property_interest || selectedClient.notes) && (
                  <section className="rounded-xl bg-amber-50/60 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 p-4">
                    <SectionHeader icon={Shield} label="Client Profile" iconBg="bg-gradient-to-br from-amber-500 to-orange-600" />
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      <Field label="Policy Number" value={selectedClient.policy_number} />
                    </div>
                    {selectedClient.property_interest && (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground">Property Interest</p>
                        <p className="text-sm font-medium text-foreground">{selectedClient.property_interest}</p>
                      </div>
                    )}
                    {selectedClient.notes && (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground">Notes</p>
                        <p className="text-sm text-foreground whitespace-pre-line">{selectedClient.notes}</p>
                      </div>
                    )}
                  </section>
                  )}

                  {/* Business Details */}
                  {(selectedClient.business_name || selectedClient.business_registration || selectedClient.vat_number || selectedClient.business_address) && (
                    <section className="rounded-xl bg-emerald-50/60 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 p-4">
                      <SectionHeader icon={Building2} label="Business Details" iconBg="bg-gradient-to-br from-emerald-500 to-teal-600" />
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        <Field label="Business / Trading Name" value={selectedClient.business_name} />
                        <Field label="Business Type" value={selectedClient.business_type} />
                        <Field label="CIPC Registration" value={selectedClient.business_registration} />
                        <Field label="VAT Number" value={selectedClient.vat_number} />
                        <Field label="Business Email" value={selectedClient.business_email} />
                        <Field label="Business Phone" value={selectedClient.business_phone} />
                        <Field label="Business WhatsApp" value={selectedClient.business_whatsapp} />
                        {selectedClient.business_website && (
                          <div className="col-span-2">
                            <p className="text-xs text-muted-foreground">Website</p>
                            <a href={selectedClient.business_website} target="_blank" rel="noopener noreferrer"
                              className="text-sm font-medium text-primary underline underline-offset-2 truncate block">
                              {selectedClient.business_website}
                            </a>
                          </div>
                        )}
                        {selectedClient.business_address && (
                          <div className="col-span-2">
                            <p className="text-xs text-muted-foreground">Business Address</p>
                            <p className="text-sm font-medium text-foreground whitespace-pre-line">{selectedClient.business_address}</p>
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  <p className="text-xs text-muted-foreground px-1">Added {fmtDate(selectedClient.created_at)}</p>
                </div>
              )}

              {activeTab === "documents" && (
                <div className="space-y-5">
                  {/* Upload */}
                  <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 dark:bg-primary/10 p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-sm">
                        <Upload className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">Upload Document</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        placeholder="Document name (optional)"
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                        className="flex-1 bg-background"
                      />
                      <select value={docType} onChange={(e) => setDocType(e.target.value)}
                        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                        {DOC_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-3">
                      <input ref={docUploadRef} type="file" className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx,.csv"
                        onChange={handleDocUpload} />
                      <Button variant="outline" size="sm" onClick={() => docUploadRef.current?.click()} disabled={uploadingDoc}>
                        {uploadingDoc ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                        Choose & Upload File
                      </Button>
                      <p className="text-xs text-muted-foreground">PDF, Word, Excel, Images (max 20MB)</p>
                    </div>
                  </div>

                  {/* Doc list */}
                  {loadingDocs ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : docs.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
                        <FolderOpen className="h-7 w-7 opacity-40" />
                      </div>
                      <p className="text-sm font-medium">No documents uploaded yet</p>
                      <p className="text-xs mt-1">Upload files using the form above.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {docs.map((doc) => (
                        <div key={doc.id} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 hover:border-primary/30 hover:bg-muted/30 transition-colors">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${DOC_TYPE_ICON_BG[doc.document_type] || DOC_TYPE_ICON_BG.other}`}>
                            <FileText className={`h-5 w-5 ${DOC_TYPE_ICON_COLOR[doc.document_type] || DOC_TYPE_ICON_COLOR.other}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{doc.document_name}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DOC_TYPE_COLORS[doc.document_type] || DOC_TYPE_COLORS.other}`}>
                                {DOC_TYPES.find(t => t.value === doc.document_type)?.label || doc.document_type}
                              </span>
                              <span className="text-xs text-muted-foreground">{fmtBytes(doc.file_size)}</span>
                              <span className="text-xs text-muted-foreground">{fmtDate(doc.created_at)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleViewDoc(doc)} title="Download">
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteDoc(doc.id)} title="Delete">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "statements" && (
                <div className="space-y-5">
                  {loadingStatements ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : statements.invoices.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
                        <FileText className="h-7 w-7 opacity-40" />
                      </div>
                      <p className="text-sm font-medium">No invoices found</p>
                      <p className="text-xs mt-1">Invoices sent to this client will appear here.</p>
                    </div>
                  ) : (
                    <>
                      {statements.monthly.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Monthly Summary</p>
                          <div className="space-y-2">
                            {statements.monthly.map((m: any, i: number) => (
                              <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                                <div>
                                  <p className="text-sm font-semibold text-foreground">{m.month}</p>
                                  <p className="text-xs text-muted-foreground">{m.count} {m.count === 1 ? "invoice" : "invoices"}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-foreground">R {(m.total_cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</p>
                                  {m.paid_cents > 0 && (
                                    <p className="text-xs text-green-600">R {(m.paid_cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })} paid</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Invoice History</p>
                        <div className="space-y-2">
                          {statements.invoices.map((inv: any) => (
                            <div key={inv.id} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 hover:border-primary/30 transition-colors">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-foreground">{inv.invoice_number}</p>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${inv.status === "paid" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : inv.status === "sent" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                                    {inv.status}
                                  </span>
                                  <span className="text-xs text-muted-foreground capitalize">{inv.type}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">{fmtDate(inv.created_at)}</p>
                              </div>
                              <p className="text-sm font-bold text-foreground shrink-0">R {(inv.total_cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl my-4">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-t-2xl">
                <h3 className="text-lg font-bold text-foreground">{editingClient ? "Edit Client" : "Add New Client"}</h3>
                <Button variant="ghost" size="icon" onClick={closeForm}><X className="h-4 w-4" /></Button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">

                {/* Personal */}
                <section className="rounded-xl bg-violet-50/60 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/20 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                      <User className="h-3.5 w-3.5 text-white" />
                    </div>
                    <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                      {formData.client_type === "business" ? "Contact Person" : "Personal Information"}
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs text-muted-foreground mb-1 block">
                        {formData.client_type === "business" ? "Contact Person Name *" : "Full Name *"}
                      </label>
                      <Input value={formData.full_name || ""} onChange={(e) => setFormData((p: any) => ({ ...p, full_name: e.target.value }))} placeholder={formData.client_type === "business" ? "Contact person at the business" : "Full legal name"} />
                    </div>
                    {formData.client_type !== "business" && (<>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">ID / Passport Number</label>
                      <Input value={formData.id_number || ""} onChange={(e) => setFormData((p: any) => ({ ...p, id_number: e.target.value }))} placeholder="RSA ID or Passport" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Date of Birth</label>
                      <Input type="date" value={formData.date_of_birth || ""} onChange={(e) => setFormData((p: any) => ({ ...p, date_of_birth: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Gender</label>
                      <select value={formData.gender || ""} onChange={(e) => setFormData((p: any) => ({ ...p, gender: e.target.value }))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="">Select</option>
                        <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Marital Status</label>
                      <select value={formData.marital_status || ""} onChange={(e) => setFormData((p: any) => ({ ...p, marital_status: e.target.value }))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="">Select</option>
                        <option>Single</option><option>Married (COP)</option><option>Married (ANC)</option>
                        <option>Divorced</option><option>Widowed</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Dependants</label>
                      <Input type="number" min="0" value={formData.dependants || 0} onChange={(e) => setFormData((p: any) => ({ ...p, dependants: parseInt(e.target.value) || 0 }))} />
                    </div>
                    </>)}
                  </div>
                </section>

                {/* Contact */}
                {formData.client_type !== "business" && (
                <section className="rounded-xl bg-blue-50/60 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                      <Phone className="h-3.5 w-3.5 text-white" />
                    </div>
                    <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">Contact Details</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                      <Input type="email" value={formData.email || ""} onChange={(e) => setFormData((p: any) => ({ ...p, email: e.target.value }))} placeholder="email@example.com" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
                      <Input value={formData.phone || ""} onChange={(e) => setFormData((p: any) => ({ ...p, phone: e.target.value }))} placeholder="+27 82 000 0000" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">WhatsApp</label>
                      <Input value={formData.whatsapp || ""} onChange={(e) => setFormData((p: any) => ({ ...p, whatsapp: e.target.value }))} placeholder="+27 82 000 0000" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs text-muted-foreground mb-1 block">Physical Address</label>
                      <textarea value={formData.physical_address || ""} onChange={(e) => setFormData((p: any) => ({ ...p, physical_address: e.target.value }))}
                        rows={2} placeholder="Street, Suburb, City, Code"
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none min-h-[60px]" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs text-muted-foreground mb-1 block">Postal Address (if different)</label>
                      <textarea value={formData.postal_address || ""} onChange={(e) => setFormData((p: any) => ({ ...p, postal_address: e.target.value }))}
                        rows={2} placeholder="P.O. Box or postal address"
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none min-h-[60px]" />
                    </div>
                  </div>
                </section>
                )}

                {formData.client_type !== "business" && (
                <section className="rounded-xl bg-teal-50/60 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/20 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600">
                      <Building2 className="h-3.5 w-3.5 text-white" />
                    </div>
                    <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">Employment & Finances</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Employment Status</label>
                      <select value={formData.employment_status || ""} onChange={(e) => setFormData((p: any) => ({ ...p, employment_status: e.target.value }))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="">Select</option>
                        <option>Employed (Permanent)</option><option>Employed (Contract)</option>
                        <option>Self-Employed</option><option>Unemployed</option><option>Retired</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Employer Name</label>
                      <Input value={formData.employer_name || ""} onChange={(e) => setFormData((p: any) => ({ ...p, employer_name: e.target.value }))} placeholder="Company or business" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Occupation / Job Title</label>
                      <Input value={formData.occupation || ""} onChange={(e) => setFormData((p: any) => ({ ...p, occupation: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Gross Monthly Income (R)</label>
                      <Input type="number" min="0" step="0.01" value={formData.monthly_income_cents || ""} onChange={(e) => setFormData((p: any) => ({ ...p, monthly_income_cents: e.target.value }))} placeholder="0.00" />
                    </div>
                  </div>
                </section>
                )}


                {/* Business Details */}
                {formData.client_type === "business" && (
                <section className="rounded-xl bg-emerald-50/60 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                      <Building2 className="h-3.5 w-3.5 text-white" />
                    </div>
                    <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">Business Details</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Business / Trading Name</label>
                      <Input value={formData.business_name || ""} onChange={(e) => setFormData((p: any) => ({ ...p, business_name: e.target.value }))} placeholder="e.g. Acme Pty Ltd" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Business Type</label>
                      <select value={formData.business_type || ""} onChange={(e) => setFormData((p: any) => ({ ...p, business_type: e.target.value }))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="">Select type</option>
                        <option>Sole Proprietor</option>
                        <option>Partnership</option>
                        <option>Close Corporation (CC)</option>
                        <option>Private Company (Pty Ltd)</option>
                        <option>Public Company (Ltd)</option>
                        <option>Non-Profit Organisation</option>
                        <option>Trust</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">CIPC Registration Number</label>
                      <Input value={formData.business_registration || ""} onChange={(e) => setFormData((p: any) => ({ ...p, business_registration: e.target.value }))} placeholder="e.g. 2023/123456/07" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">VAT Number</label>
                      <Input value={formData.vat_number || ""} onChange={(e) => setFormData((p: any) => ({ ...p, vat_number: e.target.value }))} placeholder="e.g. 4123456789" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Business Email</label>
                      <Input type="email" value={formData.business_email || ""} onChange={(e) => setFormData((p: any) => ({ ...p, business_email: e.target.value }))} placeholder="info@business.co.za" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Business Phone</label>
                      <Input value={formData.business_phone || ""} onChange={(e) => setFormData((p: any) => ({ ...p, business_phone: e.target.value }))} placeholder="+27 11 000 0000" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Business WhatsApp</label>
                      <Input value={formData.business_whatsapp || ""} onChange={(e) => setFormData((p: any) => ({ ...p, business_whatsapp: e.target.value }))} placeholder="+27 82 000 0000" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Website</label>
                      <Input value={formData.business_website || ""} onChange={(e) => setFormData((p: any) => ({ ...p, business_website: e.target.value }))} placeholder="https://www.business.co.za" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs text-muted-foreground mb-1 block">Business Address</label>
                      <textarea value={formData.business_address || ""} onChange={(e) => setFormData((p: any) => ({ ...p, business_address: e.target.value }))}
                        rows={2} placeholder="Street, Suburb, City, Code"
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none min-h-[60px]" />
                    </div>
                  </div>
                </section>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
                <Button variant="outline" onClick={closeForm}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  {editingClient ? "Save Changes" : "Add Client"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
