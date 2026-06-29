import { useState, useEffect } from "react";
import {
  Building2, TicketCheck, Plus, Send, Clock, CheckCircle2, AlertCircle,
  RefreshCw, MapPin, Phone, Mail, MessageSquare, Users, Shield,
  ChevronRight, Star, Lightbulb, CircleDot, XCircle, CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

const STATUS_STYLES: Record<string, { badge: string; dot: string; label: string }> = {
  open:        { badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",     dot: "bg-red-500",     label: "Open"        },
  in_progress: { badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", dot: "bg-amber-500", label: "In Progress" },
  resolved:    { badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", dot: "bg-green-500", label: "Resolved"    },
  closed:      { badge: "bg-muted text-muted-foreground",                                    dot: "bg-slate-400",   label: "Closed"      },
};

const COMMON_TOPICS = [
  "Business licence assistance",
  "CIPC registration help",
  "Grant or funding information",
  "Tax compliance support",
  "Trading permit query",
  "Health & safety inspection",
];

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
      <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-2xl border border-border bg-card p-6 animate-pulse">
            <div className="h-5 bg-muted rounded w-1/3 mb-3" />
            <div className="h-20 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!munInfo?.linked) {
    return (
      <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-10 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="font-bold text-foreground text-lg mb-2">Not linked to a municipality</h2>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            Your account is not currently linked to a municipality programme. If you received a registration link from your local municipality, please use that link to register.
          </p>
        </div>
        <div className="relative rounded-2xl overflow-hidden h-64 xl:h-auto">
          <img
            src="https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=800&q=80"
            alt="South African local government"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5">
            <p className="text-white font-bold text-lg">Connect with your local municipality</p>
            <p className="text-white/80 text-xs mt-1">Get support, access resources, and grow your business</p>
          </div>
        </div>
      </div>
    );
  }

  const openCount     = tickets.filter(t => t.status === "open").length;
  const progressCount = tickets.filter(t => t.status === "in_progress").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved").length;

  return (
    <div className="p-5 lg:p-6 space-y-6">

      {/* ── Hero banner ── */}
      <div className="relative rounded-2xl overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1400&q=80"
          alt="Municipality"
          className="w-full h-48 object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-700/90 via-blue-700/80 to-indigo-700/70" />
        <div className="absolute inset-0 flex items-center px-6 lg:px-8">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0 border border-white/30">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-cyan-200 text-xs font-semibold uppercase tracking-widest mb-0.5">Municipality Support Portal</p>
              <h1 className="text-2xl font-extrabold text-white truncate">{munInfo.municipality_name}</h1>
              <p className="text-cyan-100 text-sm flex items-center gap-1.5 mt-0.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {munInfo.province}{munInfo.district ? ` · ${munInfo.district}` : ""}
              </p>
            </div>
            <Badge className="ml-auto shrink-0 bg-white/20 text-white border-0 text-xs">
              {munInfo.status === "active" ? "Active" : "Pending"}
            </Badge>
          </div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── LEFT + CENTRE (2 cols on xl) — tickets ── */}
        <div className="xl:col-span-2 space-y-5">

          {/* Ticket stats */}
          {tickets.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Open",        count: openCount,     icon: CircleDot,  color: "from-red-500 to-rose-600"       },
                { label: "In Progress", count: progressCount, icon: Clock,      color: "from-amber-500 to-orange-500"   },
                { label: "Resolved",    count: resolvedCount, icon: CheckCheck, color: "from-emerald-500 to-teal-600"   },
              ].map(s => (
                <div key={s.label} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shrink-0`}>
                    <s.icon className="h-4.5 w-4.5 text-white h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-foreground leading-tight">{s.count}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Ticket panel */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h3 className="font-bold text-foreground">Support Tickets</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Log an issue or request with your municipality</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={fetchTickets} className="gap-1.5 rounded-xl">
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" className="gap-1.5 rounded-xl" onClick={() => setShowForm(v => !v)}>
                  <Plus className="h-4 w-4" /> New Ticket
                </Button>
              </div>
            </div>

            {/* New ticket form */}
            {showForm && (
              <div className="px-5 py-5 border-b border-border bg-muted/30 space-y-4">
                <h4 className="text-sm font-bold text-foreground">Submit a new support ticket</h4>

                {/* Quick topic chips */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Common topics — click to use:</p>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_TOPICS.map(t => (
                      <button key={t} onClick={() => setSubject(t)}
                        className="text-xs bg-muted hover:bg-primary/10 hover:text-primary border border-border rounded-full px-3 py-1 transition-colors">
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Subject *</label>
                  <Input
                    placeholder="e.g. Business licence assistance needed"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="text-sm rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Message *</label>
                  <Textarea
                    placeholder="Describe your issue or request in detail — include any reference numbers, dates, or prior communications…"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="text-sm min-h-[110px] resize-none rounded-xl"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="gap-2 rounded-xl" onClick={submitTicket} disabled={submitting}>
                    <Send className="h-3.5 w-3.5" />
                    {submitting ? "Submitting…" : "Submit Ticket"}
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-xl" onClick={() => { setShowForm(false); setSubject(""); setMessage(""); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Ticket list */}
            <div className="divide-y divide-border">
              {tickets.length === 0 ? (
                <div className="px-5 py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <TicketCheck className="h-8 w-8 text-white" />
                  </div>
                  <p className="font-bold text-foreground text-lg mb-1">No tickets yet</p>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Click <strong>New Ticket</strong> to log an issue or request with your municipality.
                  </p>
                  <Button className="mt-4 gap-2 rounded-xl" size="sm" onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4" /> Create First Ticket
                  </Button>
                </div>
              ) : (
                tickets.map(t => {
                  const st = STATUS_STYLES[t.status] || STATUS_STYLES.closed;
                  return (
                    <div key={t.id} className="px-5 py-4 hover:bg-muted/20 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${st.dot}`} />
                          <p className="font-semibold text-foreground text-sm truncate">{t.subject}</p>
                        </div>
                        <Badge className={`${st.badge} border-0 text-xs shrink-0`}>{st.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-2 ml-4">{t.message}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground ml-4">
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
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT column — info panel ── */}
        <div className="space-y-5">

          {/* Municipality contact card */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm leading-tight">{munInfo.municipality_name}</p>
                  <p className="text-cyan-100 text-xs mt-0.5">Your municipality contact</p>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {munInfo.contact_person && (
                <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Users className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Contact Person</p>
                    <p className="text-sm font-semibold text-foreground truncate">{munInfo.contact_person}</p>
                  </div>
                </div>
              )}
              {munInfo.contact_email && (
                <a href={`mailto:${munInfo.contact_email}`} className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3 hover:bg-muted/60 transition-colors group">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                    <Mail className="h-3.5 w-3.5 text-cyan-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Email</p>
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-cyan-600 transition-colors">{munInfo.contact_email}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                </a>
              )}
              {munInfo.contact_phone && (
                <a href={`tel:${munInfo.contact_phone}`} className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3 hover:bg-muted/60 transition-colors group">
                  <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                    <Phone className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Phone</p>
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-green-600 transition-colors">{munInfo.contact_phone}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                </a>
              )}
              {!munInfo.contact_email && !munInfo.contact_phone && (
                <p className="text-xs text-muted-foreground text-center py-2">Contact details not yet provided by this municipality.</p>
              )}
            </div>
          </div>

          {/* What happens next */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" /> What happens next?
            </p>
            <div className="space-y-3">
              {[
                { step: "1", title: "Ticket received",     desc: "Your municipality is notified of your request.",      icon: Send,          color: "from-cyan-500 to-blue-600"   },
                { step: "2", title: "Under review",        desc: "They review your request and may reach out.",         icon: Clock,         color: "from-amber-500 to-orange-500"},
                { step: "3", title: "Resolution",          desc: "The ticket is updated when action is taken.",         icon: CheckCircle2,  color: "from-emerald-500 to-teal-600"},
              ].map(s => (
                <div key={s.step} className="flex gap-3 items-start">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center shrink-0`}>
                    <s.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="pt-0.5">
                    <p className="text-sm font-semibold text-foreground">{s.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800/40 rounded-2xl p-5">
            <p className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" /> Tips for faster resolution
            </p>
            <ul className="space-y-2">
              {[
                "Include your business name and registration number",
                "Attach or mention any reference numbers",
                "Be specific about the date and nature of the issue",
                "Check if the municipality has already responded via email",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                  <Star className="h-3 w-3 mt-0.5 shrink-0" /> {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* WhatsApp direct */}
          {munInfo.contact_phone && (
            <a
              href={`https://wa.me/${munInfo.contact_phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl px-5 py-4 transition-colors group"
            >
              <MessageSquare className="h-5 w-5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-sm">Chat on WhatsApp</p>
                <p className="text-green-200 text-xs mt-0.5">Direct message to municipality</p>
              </div>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
