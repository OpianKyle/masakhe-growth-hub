import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Plus, Download, Upload, Loader2, Trash2, ChevronDown,
  ChevronUp, Mail, Phone, Briefcase, Shield, FileText, X, Eye, Edit2,
  CheckCircle, AlertCircle, User, Building2, CreditCard, Home, FolderOpen,
  MoreVertical, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

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
  created_at: string;
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
  const [clients, setClients] = useState<Client[]>([]);
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
  const [activeTab, setActiveTab] = useState<"details" | "documents">("details");
  const importRef = useRef<HTMLInputElement>(null);
  const docUploadRef = useRef<HTMLInputElement>(null);

  const fetchClients = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/clients", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/clients/stats", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([clientsData, statsData]) => {
        setClients(Array.isArray(clientsData) ? clientsData : []);
        setStats(statsData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchClients(); }, []);

  const fetchDocs = (clientId: string) => {
    setLoadingDocs(true);
    fetch(`/api/clients/${clientId}/documents`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setDocs(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoadingDocs(false));
  };

  const openClient = (client: Client) => {
    setSelectedClient(client);
    setActiveTab("details");
    fetchDocs(client.id);
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
      toast({ title: "Full name is required", variant: "destructive" });
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

  const filtered = clients.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return `${c.full_name} ${c.email || ""} ${c.phone || ""} ${c.id_number || ""}`.toLowerCase().includes(q);
  });

  const Field = ({ label, value }: { label: string; value?: string | number | null }) =>
    value ? (
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    ) : null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            Clients
          </h2>
          <p className="text-muted-foreground mt-1">Manage your brokerage client portfolio and documents.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
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
        {[
          { label: "Total Clients", value: stats.total, icon: Users, color: "text-primary" },
          { label: "Active", value: stats.active, icon: CheckCircle, color: "text-green-500" },
          { label: "Prospects", value: stats.prospects, icon: AlertCircle, color: "text-blue-500" },
          { label: "Inactive", value: stats.inactive, icon: X, color: "text-muted-foreground" },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <span className="text-sm text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search clients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="prospect">Prospect</option>
          <option value="inactive">Inactive</option>
        </select>
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
                  className={`rounded-xl border bg-card shadow-card p-4 cursor-pointer transition-colors hover:border-primary/50 ${selectedClient?.id === client.id ? "border-primary bg-primary/5" : "border-border"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{client.full_name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[client.status] || statusColors.prospect}`}>
                          {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                        </span>
                        {client.risk_profile && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${riskColors[client.risk_profile] || ""}`}>
                            {client.risk_profile.charAt(0).toUpperCase() + client.risk_profile.slice(1)} Risk
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                        {client.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{client.email}</span>}
                        {client.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{client.phone}</span>}
                        {client.monthly_income_cents ? <span>{fmtMoney(client.monthly_income_cents)}/mo</span> : null}
                      </div>
                      {client.occupation && <p className="text-xs text-muted-foreground mt-0.5">{client.occupation}{client.employer_name ? ` @ ${client.employer_name}` : ""}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEdit(client); }}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(client); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
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
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
              <div>
                <h3 className="font-bold text-lg text-foreground">{selectedClient.full_name}</h3>
                <p className="text-sm text-muted-foreground">{selectedClient.policy_number ? `Policy: ${selectedClient.policy_number}` : "No policy number"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(selectedClient)}>
                  <Edit2 className="h-3.5 w-3.5 mr-1" />Edit
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setSelectedClient(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              {(["details", "documents"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-sm font-medium transition-colors ${activeTab === tab ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  {tab === "details" ? "Client Details" : `Documents`}
                </button>
              ))}
            </div>

            <div className="p-5 overflow-y-auto max-h-[600px]">
              {activeTab === "details" && (
                <div className="space-y-6">
                  {/* Personal */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <User className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-sm text-foreground uppercase tracking-wide">Personal Information</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      <Field label="Full Name" value={selectedClient.full_name} />
                      <Field label="ID / Passport Number" value={selectedClient.id_number} />
                      <Field label="Date of Birth" value={selectedClient.date_of_birth} />
                      <Field label="Gender" value={selectedClient.gender} />
                      <Field label="Marital Status" value={selectedClient.marital_status} />
                      <Field label="Dependants" value={selectedClient.dependants} />
                    </div>
                  </section>

                  {/* Contact */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Phone className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-sm text-foreground uppercase tracking-wide">Contact Details</h4>
                    </div>
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

                  {/* Employment & Finance */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-sm text-foreground uppercase tracking-wide">Employment & Finances</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      <Field label="Employment Status" value={selectedClient.employment_status} />
                      <Field label="Employer" value={selectedClient.employer_name} />
                      <Field label="Occupation" value={selectedClient.occupation} />
                      <Field label="Monthly Income" value={selectedClient.monthly_income_cents ? fmtMoney(selectedClient.monthly_income_cents) : undefined} />
                    </div>
                  </section>

                  {/* Brokerage */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-sm text-foreground uppercase tracking-wide">Brokerage Profile</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      <Field label="Risk Profile" value={selectedClient.risk_profile ? selectedClient.risk_profile.charAt(0).toUpperCase() + selectedClient.risk_profile.slice(1) : undefined} />
                      <Field label="Credit Score" value={selectedClient.credit_score} />
                      <Field label="Policy Number" value={selectedClient.policy_number} />
                      <Field label="Status" value={selectedClient.status.charAt(0).toUpperCase() + selectedClient.status.slice(1)} />
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

                  <p className="text-xs text-muted-foreground">Added {fmtDate(selectedClient.created_at)}</p>
                </div>
              )}

              {activeTab === "documents" && (
                <div className="space-y-5">
                  {/* Upload */}
                  <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 space-y-3">
                    <p className="text-sm font-medium text-foreground">Upload Document</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        placeholder="Document name (optional)"
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                        className="flex-1"
                      />
                      <select value={docType} onChange={(e) => setDocType(e.target.value)}
                        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                        {DOC_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <input ref={docUploadRef} type="file" className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx,.csv"
                      onChange={handleDocUpload} />
                    <Button variant="outline" size="sm" onClick={() => docUploadRef.current?.click()} disabled={uploadingDoc}>
                      {uploadingDoc ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                      Choose & Upload File
                    </Button>
                    <p className="text-xs text-muted-foreground">Accepted: PDF, Word, Excel, Images (max 20MB)</p>
                  </div>

                  {/* Doc list */}
                  {loadingDocs ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : docs.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <FolderOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No documents uploaded yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {docs.map((doc) => (
                        <div key={doc.id} className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                          <FileText className="h-8 w-8 text-primary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{doc.document_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {DOC_TYPES.find(t => t.value === doc.document_type)?.label || doc.document_type} • {fmtBytes(doc.file_size)} • {fmtDate(doc.created_at)}
                            </p>
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
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="text-lg font-bold text-foreground">{editingClient ? "Edit Client" : "Add New Client"}</h3>
                <Button variant="ghost" size="icon" onClick={closeForm}><X className="h-4 w-4" /></Button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
                {/* Personal */}
                <section>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />Personal Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs text-muted-foreground mb-1 block">Full Name *</label>
                      <Input value={formData.full_name || ""} onChange={(e) => setFormData((p: any) => ({ ...p, full_name: e.target.value }))} placeholder="Full legal name" />
                    </div>
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
                  </div>
                </section>

                {/* Contact */}
                <section>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Phone className="h-4 w-4" />Contact Details
                  </h4>
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

                {/* Employment & Finance */}
                <section>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />Employment & Finances
                  </h4>
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

                {/* Brokerage */}
                <section>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />Brokerage Profile
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Risk Profile</label>
                      <select value={formData.risk_profile || "medium"} onChange={(e) => setFormData((p: any) => ({ ...p, risk_profile: e.target.value }))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Credit Score</label>
                      <Input type="number" min="0" max="999" value={formData.credit_score || ""} onChange={(e) => setFormData((p: any) => ({ ...p, credit_score: e.target.value }))} placeholder="300–850" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Policy / Reference Number</label>
                      <Input value={formData.policy_number || ""} onChange={(e) => setFormData((p: any) => ({ ...p, policy_number: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                      <select value={formData.status || "prospect"} onChange={(e) => setFormData((p: any) => ({ ...p, status: e.target.value }))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="prospect">Prospect</option><option value="active">Active</option><option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs text-muted-foreground mb-1 block">Property / Product Interest</label>
                      <Input value={formData.property_interest || ""} onChange={(e) => setFormData((p: any) => ({ ...p, property_interest: e.target.value }))}
                        placeholder="e.g. Home loan, Life cover, Short-term insurance" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
                      <textarea value={formData.notes || ""} onChange={(e) => setFormData((p: any) => ({ ...p, notes: e.target.value }))}
                        rows={3} placeholder="Additional notes..."
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
                    </div>
                  </div>
                </section>
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
