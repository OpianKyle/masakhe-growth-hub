import { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  LayoutDashboard, Users, ChevronRight, ChevronLeft, Loader2,
  Building2, CreditCard, LogOut, Eye, Crown, TrendingUp,
  Search, RefreshCw, CheckCircle2, Clock, XCircle, Banknote,
  Link2, Copy, Check, StickyNote, Star, BadgeCheck, Unlink,
  Tag as TagIcon, X, Filter, ArrowUpDown, UserPlus, LayoutGrid,
  Mail,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const PLAN_COLORS: Record<string, string> = {
  starter: "bg-green-100 text-green-800",
  pro: "bg-blue-100 text-blue-800",
  premium: "bg-indigo-100 text-indigo-800",
};
const PLAN_NAMES: Record<string, string> = {
  starter: "Enterprize",
  pro: "Enterprize Plus",
  premium: "Enterprize Premium",
};
const TAG_PALETTE: Record<string, string> = {
  vip: "bg-purple-100 text-purple-800 border-purple-200",
  "at-risk": "bg-red-100 text-red-800 border-red-200",
  "high-value": "bg-amber-100 text-amber-800 border-amber-200",
  "needs-onboarding": "bg-blue-100 text-blue-800 border-blue-200",
  prospect: "bg-cyan-100 text-cyan-800 border-cyan-200",
  followup: "bg-indigo-100 text-indigo-800 border-indigo-200",
  partner: "bg-emerald-100 text-emerald-800 border-emerald-200",
  enterprise: "bg-slate-200 text-slate-800 border-slate-300",
};
function tagClass(t: string) {
  return TAG_PALETTE[t.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200";
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function FranchiseOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/franchise/me", { credentials: "include" })
      .then(r => r.json())
      .then(setData)
      .catch(() => toast.error("Failed to load franchise data"))
      .finally(() => setLoading(false));
  }, []);

  const signupLink = data?.franchise?.code
    ? `${window.location.origin}/register?franchise=${encodeURIComponent(data.franchise.code)}`
    : null;

  const copyLink = () => {
    if (!signupLink) return;
    navigator.clipboard.writeText(signupLink).then(() => {
      setCopied(true);
      toast.success("Signup link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  const f = data?.franchise;
  const s = data?.stats;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading">{f?.name ?? "My Franchise"}</h2>
        <p className="text-muted-foreground text-sm">Franchise code: <span className="font-mono font-semibold">{f?.code}</span></p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Clients", value: s?.total_clients ?? 0, icon: Users, color: "bg-blue-500/10 text-blue-600" },
          { label: "Active Subscriptions", value: s?.active_subs ?? 0, icon: CheckCircle2, color: "bg-green-500/10 text-green-600" },
          { label: "Enterprize Plus", value: s?.pro_count ?? 0, icon: TrendingUp, color: "bg-indigo-500/10 text-indigo-600" },
          { label: "Enterprize Premium", value: s?.premium_count ?? 0, icon: Crown, color: "bg-amber-500/10 text-amber-600" },
        ].map(card => (
          <div key={card.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.color}`}>
              <card.icon className="h-4 w-4" />
            </div>
            <p className="text-3xl font-bold mt-2">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {signupLink && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
              <Link2 className="h-4 w-4 text-indigo-600" />
            </div>
            <h3 className="font-semibold">Business Signup Link</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Share this link with businesses to let them sign up directly under your franchise. Their accounts will be automatically linked to you.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg border bg-muted/40 px-3 py-2.5 font-mono text-xs text-muted-foreground truncate select-all">
              {signupLink}
            </div>
            <Button variant="outline" size="sm" onClick={copyLink} className="shrink-0 gap-1.5">
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="font-semibold mb-1">Getting Started</h3>
        <p className="text-sm text-muted-foreground">
          Share your signup link above so businesses can register directly under your franchise.
          Go to <strong>Clients</strong> to view and manage your registered businesses,
          assign subscription plans, and log into any client account to assist them.
        </p>
      </div>
    </div>
  );
}

// ─── Clients ──────────────────────────────────────────────────────────────────
function FranchiseClients() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notesTarget, setNotesTarget] = useState<any | null>(null);
  const [draftNotes, setDraftNotes] = useState("");
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviting, setInviting] = useState(false);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    fetch("/api/franchise/clients", { credentials: "include" })
      .then(r => r.json())
      .then(d => setClients(Array.isArray(d) ? d : []))
      .catch(() => toast.error("Failed to load clients"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const apiCall = async (clientId: string, method: string, path: string, body?: any) => {
    setActionLoadingId(clientId);
    try {
      const res = await fetch(`/api/franchise/clients/${clientId}${path}`, {
        method,
        credentials: "include",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error || "Action failed"); return false; }
      return true;
    } finally {
      setActionLoadingId(null);
    }
  };

  const grantTrial = async (c: any) => {
    if (!confirm(`Grant ${c.full_name} a 14-day Premium trial?`)) return;
    if (await apiCall(c.id, "POST", "/trial")) {
      toast.success(`14-day Premium trial granted to ${c.full_name}`);
      load();
    }
  };

  const grantSubscription = async (c: any, plan: string) => {
    if (!confirm(`Assign ${PLAN_NAMES[plan]} to ${c.full_name}?`)) return;
    if (await apiCall(c.id, "POST", "/subscription", { plan })) {
      toast.success(`${PLAN_NAMES[plan]} assigned to ${c.full_name}`);
      load();
    }
  };

  const revokeSubscription = async (c: any) => {
    if (!confirm(`Revoke active subscription for ${c.full_name}?`)) return;
    if (await apiCall(c.id, "DELETE", "/subscription")) {
      toast.success(`Subscription revoked for ${c.full_name}`);
      load();
    }
  };

  const toggleExempt = async (c: any) => {
    const exempt = !c.subscription_exempt;
    const msg = exempt ? `Grant free access to ${c.full_name}?` : `Remove free access from ${c.full_name}?`;
    if (!confirm(msg)) return;
    if (await apiCall(c.id, "PATCH", "/exempt", { exempt })) {
      toast.success(exempt ? `${c.full_name} now has free access` : `${c.full_name} now requires a subscription`);
      load();
    }
  };

  const impersonate = async (c: any) => {
    if (!confirm(`Log in as ${c.full_name}? Click "Return to Franchise" to switch back.`)) return;
    const ok = await apiCall(c.id, "POST", "/impersonate");
    if (ok) {
      toast.success(`Now logged in as ${c.full_name}`);
      navigate("/dashboard");
      window.location.reload();
    }
  };

  const unlinkClient = async (c: any) => {
    if (!confirm(`Remove ${c.full_name} from your franchise? Their account will remain active but unlinked.`)) return;
    if (await apiCall(c.id, "DELETE", "")) {
      toast.success(`${c.full_name} removed from franchise`);
      load();
    }
  };

  const openNotesModal = (c: any) => {
    setNotesTarget(c);
    setDraftNotes(c.admin_notes || "");
    setDraftTags(Array.isArray(c.admin_tags) ? c.admin_tags : []);
    setTagInput("");
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (draftTags.length >= 12) { toast.error("Up to 12 tags per client"); return; }
    if (draftTags.map((x: string) => x.toLowerCase()).includes(t.toLowerCase())) { setTagInput(""); return; }
    setDraftTags([...draftTags, t]);
    setTagInput("");
  };

  const saveNotesAndTags = async () => {
    if (!notesTarget) return;
    setSavingNotes(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch(`/api/franchise/clients/${notesTarget.id}/notes`, {
          method: "PATCH", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: draftNotes }),
        }),
        fetch(`/api/franchise/clients/${notesTarget.id}/tags`, {
          method: "PATCH", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tags: draftTags }),
        }),
      ]);
      if (!r1.ok || !r2.ok) { toast.error("Failed to save"); return; }
      toast.success("Notes & tags saved");
      setNotesTarget(null);
      load();
    } finally {
      setSavingNotes(false);
    }
  };

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) { toast.error("Email is required"); return; }
    setInviting(true);
    try {
      const res = await fetch("/api/franchise/clients/invite", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), fullName: inviteName.trim() }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error || "Failed to send invite"); return; }
      if (d.created) {
        toast.success(d.emailSent
          ? `Invite sent to ${inviteEmail}! They'll receive a link to set their password.`
          : `Account created for ${inviteEmail} and linked. (Email could not be sent — check SMTP config.)`
        );
      } else {
        toast.success(`${inviteEmail} already had an account and has been linked to your franchise.`);
      }
      setInviteOpen(false);
      setInviteEmail("");
      setInviteName("");
      load();
    } finally {
      setInviting(false);
    }
  };

  const allTags = Array.from(new Set(clients.flatMap(c => Array.isArray(c.admin_tags) ? c.admin_tags : []))).sort();

  const matchesStatus = (c: any) => {
    const trialActive = c.sub_status === "TRIAL" && (!c.trial_end_at || new Date(c.trial_end_at).getTime() > Date.now());
    if (statusFilter === "trial") return trialActive;
    if (statusFilter === "active") return c.sub_status === "ACTIVE";
    if (statusFilter === "free") return !!c.subscription_exempt;
    if (statusFilter === "none") return !c.subscription_exempt && !trialActive && c.sub_status !== "ACTIVE";
    return true;
  };

  const filtered = clients
    .filter(c => matchesStatus(c))
    .filter(c => planFilter === "all" || c.plan_code === planFilter)
    .filter(c => !tagFilter || (Array.isArray(c.admin_tags) && c.admin_tags.includes(tagFilter)))
    .filter(c => {
      const q = search.toLowerCase();
      if (!q) return true;
      return c.full_name?.toLowerCase().includes(q)
        || c.email?.toLowerCase().includes(q)
        || (c.business_name || "").toLowerCase().includes(q)
        || (Array.isArray(c.admin_tags) && c.admin_tags.some((t: string) => t.toLowerCase().includes(q)))
        || (c.admin_notes || "").toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.linked_at).getTime() - new Date(a.linked_at).getTime();
      if (sortBy === "oldest") return new Date(a.linked_at).getTime() - new Date(b.linked_at).getTime();
      if (sortBy === "name") return a.full_name.localeCompare(b.full_name);
      return (a.business_name || "").localeCompare(b.business_name || "");
    });

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> My Clients
          </h2>
          <p className="text-sm text-muted-foreground">{clients.length} registered · showing {filtered.length}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
          <Button size="sm" className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600"
            onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4" /> Invite Client
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Status
          </span>
          {(["all","active","trial","free","none"] as const).map(v => (
            <button key={v}
              onClick={() => setStatusFilter(v)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                statusFilter === v ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted border-input"
              }`}
            >{{ all:"All", active:"Active", trial:"Trial", free:"Free Access", none:"No Subscription" }[v]}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Plan</span>
          {([["all","All plans"],["starter","Enterprize"],["pro","Enterprize Plus"],["premium","Enterprize Premium"]] as const).map(([v, label]) => (
            <button key={v}
              onClick={() => setPlanFilter(v)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                planFilter === v ? "bg-emerald-600 text-white border-emerald-600" : "bg-background hover:bg-muted border-input"
              }`}
            >{label}</button>
          ))}
          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowUpDown className="h-3.5 w-3.5" />
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="bg-background border rounded-md px-2 py-1 text-xs">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name">Name A→Z</option>
              <option value="business">Business A→Z</option>
            </select>
          </span>
        </div>
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <TagIcon className="h-3.5 w-3.5" /> Tag
            </span>
            <button onClick={() => setTagFilter("")}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                !tagFilter ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted border-input"
              }`}>Any</button>
            {allTags.map((t: string) => (
              <button key={t} onClick={() => setTagFilter(t === tagFilter ? "" : t)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  tagFilter === t ? "ring-2 ring-primary " : ""} ${tagClass(t)}`}>{t}</button>
            ))}
          </div>
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, business, tag or note…" className="pl-9" />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          {search || statusFilter !== "all" || planFilter !== "all" || tagFilter
            ? "No clients match your filters."
            : "No clients in your franchise yet. Share your signup link to get started."}
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  {["Client", "Business", "Tags", "Subscription", "Linked", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(c => {
                  const isLoading = actionLoadingId === c.id;
                  const trialActive = c.sub_status === "TRIAL" && (!c.trial_end_at || new Date(c.trial_end_at).getTime() > Date.now());
                  const trialDaysLeft = c.trial_end_at
                    ? Math.max(0, Math.ceil((new Date(c.trial_end_at).getTime() - Date.now()) / 86400000))
                    : "?";

                  return (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      {/* Client */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{c.full_name}</div>
                        <div className="text-xs text-muted-foreground">{c.email}</div>
                        {c.admin_notes && (
                          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground italic">
                            <StickyNote className="h-3 w-3" /> Has notes
                          </div>
                        )}
                      </td>

                      {/* Business */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{c.business_name || c.full_name}</div>
                        {c.industry_sector && (
                          <span className="inline-block mt-0.5 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">{c.industry_sector}</span>
                        )}
                      </td>

                      {/* Tags */}
                      <td className="px-4 py-3 max-w-[160px]">
                        <div className="flex flex-wrap gap-1">
                          {(c.admin_tags || []).slice(0, 3).map((t: string) => (
                            <span key={t} className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${tagClass(t)}`}>{t}</span>
                          ))}
                          {(c.admin_tags || []).length > 3 && (
                            <span className="text-[10px] text-muted-foreground">+{c.admin_tags.length - 3}</span>
                          )}
                          {(!c.admin_tags || c.admin_tags.length === 0) && (
                            <span className="text-[10px] text-muted-foreground">—</span>
                          )}
                        </div>
                      </td>

                      {/* Subscription */}
                      <td className="px-4 py-3">
                        {c.subscription_exempt ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-purple-100 text-purple-800">
                              <Star className="h-3 w-3" /> Free Access
                            </span>
                            <button onClick={() => toggleExempt(c)}
                              className="text-[10px] text-red-500 hover:text-red-700">Remove</button>
                          </div>
                        ) : trialActive ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-800">
                              <Clock className="h-3 w-3" /> Trial · {trialDaysLeft}d left
                            </span>
                            <button onClick={() => revokeSubscription(c)}
                              className="text-[10px] text-red-500 hover:text-red-700">Revoke</button>
                          </div>
                        ) : c.sub_status === "ACTIVE" ? (
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${PLAN_COLORS[c.plan_code] || "bg-green-100 text-green-800"}`}>
                              <BadgeCheck className="h-3 w-3" /> {PLAN_NAMES[c.plan_code] || c.plan_name || "Active"}
                            </span>
                            <button onClick={() => revokeSubscription(c)}
                              className="text-[10px] text-red-500 hover:text-red-700">Revoke</button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-1">
                            <Button variant="outline" size="sm" disabled={isLoading}
                              className="h-6 px-2 text-[10px] gap-1 border-amber-300 text-amber-700 hover:bg-amber-50"
                              onClick={() => grantTrial(c)}>
                              <Clock className="h-3 w-3" /> Trial
                            </Button>
                            <Button variant="outline" size="sm" disabled={isLoading}
                              className="h-6 px-2 text-[10px] gap-1 border-green-300 text-green-700 hover:bg-green-50"
                              onClick={() => grantSubscription(c, "starter")}>
                              <CreditCard className="h-3 w-3" /> Enterprize
                            </Button>
                            <Button variant="outline" size="sm" disabled={isLoading}
                              className="h-6 px-2 text-[10px] gap-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                              onClick={() => grantSubscription(c, "pro")}>
                              <Banknote className="h-3 w-3" /> Plus
                            </Button>
                            <Button variant="outline" size="sm" disabled={isLoading}
                              className="h-6 px-2 text-[10px] gap-1 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                              onClick={() => grantSubscription(c, "premium")}>
                              <Crown className="h-3 w-3" /> Premium
                            </Button>
                          </div>
                        )}
                      </td>

                      {/* Linked */}
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(c.linked_at).toLocaleDateString("en-ZA")}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          <Button variant="outline" size="sm" disabled={isLoading}
                            className="h-7 px-2 text-[10px] gap-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                            onClick={() => impersonate(c)}>
                            <Eye className="h-3 w-3" /> View
                          </Button>
                          <Button variant="outline" size="sm" disabled={isLoading}
                            className="h-7 px-2 text-[10px] gap-1 border-purple-300 text-purple-700 hover:bg-purple-50"
                            onClick={() => toggleExempt(c)}>
                            <Star className="h-3 w-3" /> {c.subscription_exempt ? "Remove Free" : "Free Access"}
                          </Button>
                          <Button variant="outline" size="sm" disabled={isLoading}
                            className="h-7 px-2 text-[10px] gap-1 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                            onClick={() => openNotesModal(c)}>
                            <StickyNote className="h-3 w-3" /> Notes
                          </Button>
                          <Button variant="outline" size="sm" disabled={isLoading}
                            className="h-7 px-2 text-[10px] gap-1 border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => unlinkClient(c)}>
                            <Unlink className="h-3 w-3" /> Unlink
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Client Dialog */}
      <Dialog open={inviteOpen} onOpenChange={open => { if (!open) { setInviteOpen(false); setInviteEmail(""); setInviteName(""); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-indigo-600" /> Invite a Client
            </DialogTitle>
            <DialogDescription>
              Enter the client's email address. If they don't have a Masakhe account yet, we'll create one and send them a setup link. If they already have an account, they'll be linked directly.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={sendInvite} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">Email address <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="client@example.com"
                  className="pl-9"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invite-name">Full name <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                id="invite-name"
                placeholder="Jane Smith"
                value={inviteName}
                onChange={e => setInviteName(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">If left blank we'll use the email address as the display name.</p>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={inviting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {inviting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending…</> : <><Mail className="h-4 w-4 mr-2" /> Send Invite</>}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Notes & Tags Modal */}
      <Dialog open={!!notesTarget} onOpenChange={open => { if (!open) setNotesTarget(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Notes & Tags — {notesTarget?.full_name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Tags */}
            <div>
              <p className="text-sm font-medium mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
                {draftTags.map((t: string) => (
                  <span key={t}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${tagClass(t)}`}>
                    {t}
                    <button onClick={() => setDraftTags(draftTags.filter((x: string) => x !== t))}
                      className="hover:opacity-70"><X className="h-3 w-3" /></button>
                  </span>
                ))}
                {draftTags.length === 0 && <span className="text-xs text-muted-foreground">No tags yet</span>}
              </div>
              <div className="flex gap-2">
                <Input value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder="Type a tag and press Enter…" className="flex-1 h-8 text-sm" />
                <Button size="sm" variant="outline" onClick={addTag} className="h-8 px-3">Add</Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.keys(TAG_PALETTE).map(t => (
                  <button key={t}
                    onClick={() => { if (!draftTags.map((x: string) => x.toLowerCase()).includes(t)) setDraftTags([...draftTags, t]); }}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-opacity ${tagClass(t)} ${draftTags.includes(t) ? "opacity-40" : "hover:opacity-80"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <p className="text-sm font-medium mb-2">Private Notes</p>
              <Textarea value={draftNotes} onChange={e => setDraftNotes(e.target.value)}
                placeholder="Internal notes about this client…" rows={5} className="text-sm resize-none" />
              <p className="text-[11px] text-muted-foreground mt-1">These notes are only visible to you.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesTarget(null)}>Cancel</Button>
            <Button onClick={saveNotesAndTags} disabled={savingNotes}>
              {savingNotes ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────
const navItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/franchise" },
  { icon: Users, label: "Clients", path: "/franchise/clients" },
];

export default function FranchiseDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout, isImpersonating, stopImpersonating } = useAuth();

  const pageTitle = navItems.find(i => location.pathname === i.path)?.label ?? "Franchise";

  return (
    <div className="flex h-screen bg-background">
      {isImpersonating && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-amber-500 px-4 py-2 text-sm font-medium text-black">
          <span>Viewing as client — return when done</span>
          <Button size="sm" variant="outline" className="h-7 border-black/30 text-black hover:bg-amber-600" onClick={stopImpersonating}>
            Return to Franchise
          </Button>
        </div>
      )}

      <aside className={`flex flex-col border-r border-sidebar-border bg-slate-900 transition-all duration-300 ${collapsed ? "w-16" : "w-60"} ${isImpersonating ? "mt-10" : ""}`}>
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500">
                <span className="text-sm font-bold text-white font-heading">F</span>
              </div>
              <div>
                <span className="text-base font-bold font-heading text-white">Masakhe</span>
                <span className="ml-1 text-xs text-indigo-300 font-semibold">FRANCHISE</span>
              </div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="text-white/60 hover:text-white">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active ? "bg-indigo-500/20 text-indigo-300 font-semibold" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}>
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="px-2 pb-4 space-y-1">
          <Link to="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors">
            <LayoutGrid className="h-5 w-5 shrink-0" />
            {!collapsed && <span>My Business</span>}
          </Link>
          {!collapsed && (
            <button onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors">
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          )}
          {collapsed && (
            <button onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors">
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="flex h-1">
          <div className="flex-1 bg-indigo-500" />
          <div className="flex-1 bg-indigo-600" />
          <div className="flex-1 bg-indigo-700" />
          <div className="flex-1 bg-indigo-800" />
        </div>
      </aside>

      <main className={`flex-1 overflow-auto mobile-hscroll ${isImpersonating ? "mt-10" : ""}`}>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-md px-6">
          <h1 className="text-xl font-bold font-heading">{pageTitle}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.full_name}</span>
            <Badge variant="outline" className="text-indigo-700 border-indigo-300">Franchise Owner</Badge>
          </div>
        </header>

        <Routes>
          <Route index element={<FranchiseOverview />} />
          <Route path="clients" element={<FranchiseClients />} />
          <Route path="*" element={<FranchiseOverview />} />
        </Routes>
      </main>
    </div>
  );
}
