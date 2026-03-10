import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, Mail, Phone, MessageSquare, Car, Clock,
  CheckCircle, XCircle, Filter, Search, Loader2,
  Trash2, ChevronDown, BarChart2
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

export default function LeadsPage() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats>({ total: 0, new: 0, contacted: 0, converted: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  useEffect(() => {
    fetchLeads();
  }, []);

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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Leads
        </h2>
        <p className="text-muted-foreground mt-1">Manage enquiries from your website visitors.</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: stats.total, icon: Users, color: "text-primary" },
          { label: "New", value: stats.new, icon: Clock, color: "text-blue-500" },
          { label: "Contacted", value: stats.contacted, icon: MessageSquare, color: "text-amber-500" },
          { label: "Converted", value: stats.converted, icon: CheckCircle, color: "text-green-500" },
        ].map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-4 shadow-card"
          >
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <span className="text-sm text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No leads yet</p>
          <p className="text-sm mt-1">Leads will appear here when visitors submit enquiries on your website.</p>
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
  );
}
