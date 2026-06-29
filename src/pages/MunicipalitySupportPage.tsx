import { useState, useEffect } from "react";
import { Building2, TicketCheck, Plus, Send, Clock, CheckCircle2, AlertCircle, RefreshCw, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

const STATUS_STYLES: Record<string, string> = {
  open:        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  resolved:    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  closed:      "bg-muted text-muted-foreground",
};

export default function MunicipalitySupportPage() {
  const [munInfo, setMunInfo] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/municipality/my-info", { credentials: "include" }).then(r => r.json()),
      fetch("/api/municipality/my-tickets", { credentials: "include" }).then(r => r.json()),
    ]).then(([info, ticks]) => {
      setMunInfo(info);
      setTickets(Array.isArray(ticks) ? ticks : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function fetchTickets() {
    const r = await fetch("/api/municipality/my-tickets", { credentials: "include" });
    if (r.ok) setTickets(await r.json());
  }

  async function submitTicket() {
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in both subject and message.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/municipality/my-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subject: subject.trim(), message: message.trim() }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error || "Failed to submit ticket"); return; }
      toast.success("Ticket submitted! Your municipality will respond soon.");
      setSubject("");
      setMessage("");
      setShowForm(false);
      fetchTickets();
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="rounded-xl border border-border bg-card p-6 animate-pulse">
            <div className="h-5 bg-muted rounded w-1/3 mb-3" />
            <div className="h-16 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!munInfo?.linked) {
    return (
      <div className="p-6 max-w-lg">
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h2 className="font-semibold text-foreground mb-2">Not linked to a municipality</h2>
          <p className="text-sm text-muted-foreground">
            Your account is not currently linked to a municipality programme. If you received a registration link from your local municipality, please use that link to register.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 lg:p-6 space-y-6 max-w-3xl">

      {/* Municipality info banner */}
      <div className="rounded-xl overflow-hidden border border-cyan-200 dark:border-cyan-800">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-base leading-tight">{munInfo.municipality_name}</p>
              <p className="text-cyan-100 text-xs flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" />
                {munInfo.province}{munInfo.district ? ` · ${munInfo.district}` : ""}
              </p>
            </div>
            <Badge className="ml-auto bg-white/20 text-white border-0 text-xs">
              {munInfo.status === "active" ? "Active" : "Pending"}
            </Badge>
          </div>
        </div>
        <div className="bg-cyan-50 dark:bg-cyan-950/30 px-5 py-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
          {munInfo.contact_person && (
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> {munInfo.contact_person}
            </span>
          )}
          {munInfo.contact_email && (
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> {munInfo.contact_email}
            </span>
          )}
          {munInfo.contact_phone && (
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> {munInfo.contact_phone}
            </span>
          )}
        </div>
      </div>

      {/* Ticket submission */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-foreground">Support Tickets</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Log an issue or request with your municipality</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchTickets} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setShowForm(v => !v)}>
              <Plus className="h-4 w-4" /> New Ticket
            </Button>
          </div>
        </div>

        {/* New ticket form */}
        {showForm && (
          <div className="px-5 py-4 border-b border-border bg-muted/30 space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Submit a new ticket</h4>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Subject *</label>
              <Input
                placeholder="e.g. Business licence assistance needed"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Message *</label>
              <Textarea
                placeholder="Describe your issue or request in detail…"
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="text-sm min-h-[100px] resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="gap-2" onClick={submitTicket} disabled={submitting}>
                <Send className="h-3.5 w-3.5" />
                {submitting ? "Submitting…" : "Submit Ticket"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setShowForm(false); setSubject(""); setMessage(""); }}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Ticket list */}
        <div className="divide-y divide-border">
          {tickets.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <TicketCheck className="h-9 w-9 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium text-foreground mb-1">No tickets yet</p>
              <p className="text-sm text-muted-foreground">Click "New Ticket" to log an issue or request with your municipality.</p>
            </div>
          ) : (
            tickets.map(t => (
              <div key={t.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p className="font-medium text-foreground text-sm">{t.subject}</p>
                  <Badge className={`${STATUS_STYLES[t.status] || ""} border-0 text-xs shrink-0`}>
                    {t.status === "in_progress" ? "In Progress" : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">{t.message}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(t.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  {t.resolved_at && (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Resolved {new Date(t.resolved_at).toLocaleDateString("en-ZA")}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
