import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Users, Mail, Phone, MessageSquare, Car, Clock,
  CheckCircle, XCircle, Filter, Search, Loader2,
  Trash2, ChevronDown, BarChart2, Download, Upload, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface Lead {
  id: string;
  website_id: string;
  vehicle_id?: string;
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  source: string;
  status: string;
  notes?: string;
  created_at: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
}

interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  converted: number;
}

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

export default function LeadsPage() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats>({ total: 0, new: 0, contacted: 0, converted: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const fetchLeads = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/leads", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/leads/stats", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([leadsData, statsData]) => {
        setLeads(Array.isArray(leadsData) ? leadsData : []);
        setStats(statsData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeads(); }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/leads/export", { credentials: "include" });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Leads exported successfully" });
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

      const res = await fetch("/api/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      toast({ title: `Imported ${data.imported} leads${data.skipped ? ` (${data.skipped} skipped)` : ""}` });
      fetchLeads();
    } catch (err: any) {
      toast({ title: err.message || "Import failed", variant: "destructive" });
    } finally {
      setImporting(false);
      if (importRef.current) importRef.current.value = "";
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.ok) {
        setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
        setStats((prev) => {
          const oldLead = leads.find((l) => l.id === id);
          if (!oldLead) return prev;
          const updated = { ...prev };
          if (oldLead.status === "new") updated.new = Math.max(0, updated.new - 1);
          if (oldLead.status === "contacted") updated.contacted = Math.max(0, updated.contacted - 1);
          if (oldLead.status === "converted") updated.converted = Math.max(0, updated.converted - 1);
          if (status === "new") updated.new++;
          if (status === "contacted") updated.contacted++;
          if (status === "converted") updated.converted++;
          return updated;
        });
        toast({ title: "Lead updated" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to update lead.", variant: "destructive" });
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (data.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
        toast({ title: "Lead deleted" });
        fetchLeads();
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const filtered = leads.filter((l) => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return `${l.name} ${l.email || ""} ${l.phone || ""} ${l.message || ""}`.toLowerCase().includes(q);
  });

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    new: { label: "New", color: "bg-blue-500", icon: Clock },
    contacted: { label: "Contacted", color: "bg-amber-500", icon: MessageSquare },
    converted: { label: "Converted", color: "bg-green-500", icon: CheckCircle },
    qualified: { label: "Qualified", color: "bg-purple-500", icon: CheckCircle },
    closed: { label: "Closed", color: "bg-red-500", icon: XCircle },
  };

  return (
    <div className="min-h-full bg-white dark:bg-gray-950">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #cffafe 0%, #e0f2fe 30%, #ede9fe 70%, #f3e8ff 100%)" }}>
        <div className="pointer-events-none select-none absolute inset-0">
          <motion.div initial={{ opacity: 0, rotate: -5, y: 20 }} animate={{ opacity: 0.88, rotate: -3, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="absolute -left-4 top-4 w-40 rounded-2xl bg-white/85 backdrop-blur shadow-2xl border-2 border-white p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-full bg-cyan-100 flex items-center justify-center"><Users className="h-3.5 w-3.5 text-cyan-600"/></div>
              <div className="space-y-1"><div className="h-2 w-14 rounded-full bg-gray-200"/><div className="h-1.5 w-8 rounded-full bg-gray-100"/></div>
            </div>
            {["bg-cyan-100","bg-sky-100","bg-indigo-100"].map((c,i) => (
              <div key={i} className="flex items-center gap-2 mb-1.5"><div className={`h-5 w-5 rounded-full ${c}`}/><div className="h-1.5 flex-1 rounded-full bg-gray-100"/></div>
            ))}
          </motion.div>
          <motion.div initial={{ opacity: 0, rotate: 5, y: 20 }} animate={{ opacity: 0.85, rotate: 3, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute -right-3 top-5 w-36 rounded-2xl bg-white/85 backdrop-blur shadow-2xl border-2 border-white p-3">
            <div className="h-2 w-14 rounded-full bg-cyan-200 mb-2"/>
            <div className="grid grid-cols-2 gap-1.5">
              {["bg-cyan-100","bg-sky-100","bg-violet-100","bg-purple-100"].map((c,i) => <div key={i} className={`h-8 rounded-lg ${c}`}/>)}
            </div>
          </motion.div>
        </div>
        <div className="relative z-10 py-12 px-6 text-center max-w-2xl mx-auto">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2" style={{ color: "#164e63" }}>
            Leads
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-cyan-800/70 mb-6 text-sm">
            Manage enquiries from your website visitors and track leads through your pipeline
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-3 flex-wrap">
            <Button onClick={() => importRef.current?.click()} disabled={importing}
              variant="outline" className="bg-white/80 border-white shadow-sm gap-2 text-cyan-900 hover:bg-white rounded-xl">
              {importing ? <Loader2 className="h-4 w-4 animate-spin"/> : <Upload className="h-4 w-4"/>} Import CSV
            </Button>
            <Button onClick={handleExport} disabled={exporting}
              className="bg-cyan-700 hover:bg-cyan-800 text-white shadow-md gap-2 rounded-xl">
              {exporting ? <Loader2 className="h-4 w-4 animate-spin"/> : <Download className="h-4 w-4"/>} Export CSV
            </Button>
          </motion.div>
        </div>
      </div>

      {/* ── Quick action bar ─────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white dark:bg-gray-950 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-0.5 overflow-x-auto scrollbar-none">
          {[
            { label: "Import CSV", icon: Upload,   action: () => importRef.current?.click(), grad: "from-sky-500 to-blue-500" },
            { label: "Export CSV", icon: Download, action: handleExport,                     grad: "from-teal-500 to-emerald-500" },
          ].map((a, i) => (
            <motion.button key={a.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={a.action}
              className="flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group min-w-[72px] shrink-0">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${a.grad} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                <a.icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-[11px] font-medium text-gray-600 whitespace-nowrap">{a.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
      <input ref={importRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: stats.total, icon: Users, grad: "from-indigo-500 to-violet-600" },
          { label: "New", value: stats.new, icon: Clock, grad: "from-blue-500 to-indigo-600" },
          { label: "Contacted", value: stats.contacted, icon: MessageSquare, grad: "from-amber-500 to-orange-600" },
          { label: "Converted", value: stats.converted, icon: CheckCircle, grad: "from-emerald-500 to-teal-600" },
        ].map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-4 shadow-card hover:shadow-md transition-shadow"
          >
            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${s.grad} shadow-sm mb-2`}>
              <s.icon className="h-4 w-4 text-white" />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
          <option value="qualified">Qualified</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 border border-border">
        <strong>CSV Import format:</strong> Name, Email, Phone, Message, Source, Status, Notes
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No leads yet</p>
          <p className="text-sm mt-1">Leads will appear here when visitors submit enquiries on your website, or import a CSV file.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => {
            const sc = statusConfig[lead.status] || statusConfig.new;
            const expanded = expandedId === lead.id;
            return (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-card shadow-card overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(expanded ? null : lead.id)}
                  className="w-full px-4 py-3 flex items-center gap-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className={`h-2 w-2 rounded-full ${sc.color} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground truncate">{lead.name}</span>
                      <Badge variant="secondary" className="text-xs">{sc.label}</Badge>
                      {lead.vehicle_make && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Car className="h-3 w-3" />
                          {lead.vehicle_year} {lead.vehicle_make} {lead.vehicle_model}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      {lead.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{lead.email}</span>}
                      {lead.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{lead.phone}</span>}
                      <span>{formatDate(lead.created_at)}</span>
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>

                {expanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-border space-y-3">
                    {lead.message && (
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{lead.message}</p>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-muted-foreground mr-2">Update status:</span>
                      {(["new", "contacted", "qualified", "converted", "closed"] as const).map((s) => (
                        <Button
                          key={s}
                          variant={lead.status === s ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateStatus(lead.id, s)}
                          className="text-xs"
                        >
                          {statusConfig[s].label}
                        </Button>
                      ))}
                      <div className="flex-1" />
                      <Button variant="outline" size="sm" onClick={() => deleteLead(lead.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>Source: {lead.source}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
