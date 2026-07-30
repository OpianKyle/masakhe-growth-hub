import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, UserPlus, Crown, Trash2, Mail, Loader2, AlertCircle, Lock, Sparkles,
  Send, Check, ShieldAlert, ChevronDown, ChevronUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type Role = "owner" | "admin" | "editor" | "viewer";

interface Member {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: Role;
  created_at: string;
  permissions: string[];
  invite_pending: boolean;
}

interface PermDef { key: string; label: string; group: string; }

const PERMISSION_GROUPS: { name: string; perms: PermDef[] }[] = [
  {
    name: "Dashboard",
    perms: [
      { key: "overview", label: "Overview", group: "Dashboard" },
    ],
  },
  {
    name: "Online presence",
    perms: [
      { key: "website",    label: "Website Builder", group: "Online presence" },
      { key: "social",     label: "Social Media",    group: "Online presence" },
      { key: "biz_connect",label: "Biz Connect",     group: "Online presence" },
      { key: "support",    label: "WhatsApp Support",group: "Online presence" },
    ],
  },
  {
    name: "Finance & sales",
    perms: [
      { key: "finance",             label: "Income & Expenses",   group: "Finance & sales" },
      { key: "invoices",            label: "Quotes & Invoices",   group: "Finance & sales" },
      { key: "clients",             label: "Clients",             group: "Finance & sales" },
      { key: "campaigns",           label: "Campaigns",           group: "Finance & sales" },
    ],
  },
  {
    name: "HR & people",
    perms: [
      { key: "payroll", label: "Payroll",   group: "HR & people" },
      { key: "leave",   label: "Leave & HR", group: "HR & people" },
    ],
  },
];

const ALL_PERM_KEYS = PERMISSION_GROUPS.flatMap(g => g.perms.map(p => p.key));
const DEFAULT_PERMS = ["overview"];

function getMaxSeats(plan: string | null): number {
  if (plan === "all_modules") return 99;
  if (plan === "premium") return 4;
  if (plan === "pro") return 2;
  if (plan === "starter") return 1;
  return 0;
}

function getPlanLabel(plan: string | null): string {
  if (plan === "all_modules") return "Admin (All Modules)";
  if (plan === "premium") return "Enterprize Premium";
  if (plan === "pro") return "Enterprize Plus";
  if (plan === "starter") return "Enterprize";
  return "your current plan";
}

export default function TeamMembersPage() {
  const { user } = useAuth();
  const [planCode, setPlanCode] = useState<string | null>(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [invitePerms, setInvitePerms] = useState<string[]>(DEFAULT_PERMS);
  const [inviting, setInviting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPerms, setEditingPerms] = useState<string[]>([]);
  const [editingName, setEditingName] = useState("");
  const [editingEmail, setEditingEmail] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const isAdmin = user?.role === "admin";
  const MAX_SEATS = getMaxSeats(planCode);
  const seatsUsed = members.filter(m => m.role !== "owner").length;
  const seatsRemaining = Math.max(0, MAX_SEATS - seatsUsed);
  const isPremium = planCode === "premium" || planCode === "all_modules";
  const hasTeamAccess = isAdmin || !!(planCode === "starter" || planCode === "pro" || planCode === "premium" || planCode === "all_modules");

  useEffect(() => {
    fetch("/api/billing/status", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setPlanCode(d?.plan || null))
      .catch(() => setPlanCode(null))
      .finally(() => setPlanLoading(false));
  }, []);

  useEffect(() => {
    if (!hasTeamAccess) return;
    fetch("/api/social/workspaces/mine", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setWorkspaceId(d.defaultId || null))
      .catch(() => setWorkspaceId(null));
  }, [hasTeamAccess]);

  const loadMembers = () => {
    if (!workspaceId) { setLoading(false); return; }
    setLoading(true);
    fetch(`/api/social/workspaces/${workspaceId}/members`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setMembers(Array.isArray(d) ? d : []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  };

  useEffect(loadMembers, [workspaceId]);

  const togglePerm = (perms: string[], setPerms: (p: string[]) => void, key: string) => {
    if (perms.includes(key)) setPerms(perms.filter(p => p !== key));
    else setPerms([...perms, key]);
  };

  const setPermsAll = (setPerms: (p: string[]) => void, all: boolean) => {
    setPerms(all ? [...ALL_PERM_KEYS] : [...DEFAULT_PERMS]);
  };

  const handleInvite = async () => {
    if (!workspaceId) return;
    if (!inviteName.trim()) { toast.error("Please enter the team member's name."); return; }
    if (!inviteEmail.trim()) { toast.error("Please enter an email address."); return; }
    if (seatsRemaining <= 0) { toast.error(`Your plan supports up to ${MAX_SEATS} team members.`); return; }
    setInviting(true);
    try {
      const res = await fetch(`/api/social/workspaces/${workspaceId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: inviteEmail.trim().toLowerCase(),
          full_name: inviteName.trim(),
          permissions: invitePerms,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add member");
      toast.success("Invite sent. They'll receive an email to set their password.");
      setInviteOpen(false);
      setInviteEmail("");
      setInviteName("");
      setInvitePerms(DEFAULT_PERMS);
      loadMembers();
    } catch (err: any) {
      toast.error(err.message || "Failed to add member.");
    } finally {
      setInviting(false);
    }
  };

  const handleResend = async (member: Member) => {
    if (!workspaceId) return;
    try {
      const res = await fetch(`/api/social/workspaces/${workspaceId}/members/${member.id}/resend-invite`, {
        method: "POST",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to resend invite");
      toast.success(`Invite resent to ${member.email}.`);
      loadMembers();
    } catch (err: any) {
      toast.error(err.message || "Failed to resend invite.");
    }
  };

  const startEdit = (m: Member) => {
    setEditingId(m.id);
    setEditingPerms(m.permissions || []);
    setEditingName(m.full_name || "");
    setEditingEmail(m.email || "");
  };

  const saveEdit = async (member: Member) => {
    if (!workspaceId) return;
    if (!editingName.trim()) { toast.error("Name is required"); return; }
    if (!editingEmail.trim()) { toast.error("Email is required"); return; }
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/social/workspaces/${workspaceId}/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          permissions: editingPerms,
          full_name: editingName.trim(),
          email: editingEmail.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update member");
      toast.success("Member updated.");
      setEditingId(null);
      loadMembers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update member.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleRemove = async (member: Member) => {
    if (!workspaceId || member.role === "owner") return;
    if (!confirm(`Remove ${member.full_name || member.email} from the team? Their account will also be deleted.`)) return;
    try {
      const res = await fetch(`/api/social/workspaces/${workspaceId}/members/${member.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to remove member");
      toast.success("Team member removed.");
      loadMembers();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove member.");
    }
  };

  if (planLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasTeamAccess) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-gradient-to-br from-amber-500/10 via-card to-card p-8 shadow-card text-center space-y-4"
        >
          <div className="mx-auto h-16 w-16 rounded-2xl bg-amber-500/15 flex items-center justify-center">
            <Lock className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
            User Accounts requires an active subscription
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            Subscribe to any Masakhe plan to start adding user accounts.
            <br />
            <span className="font-semibold text-foreground">Enterprize</span> — 2 users (incl. owner) &nbsp;·&nbsp;
            <span className="font-semibold text-foreground">Enterprize Plus</span> — 3 users (incl. owner) &nbsp;·&nbsp;
            <span className="font-semibold text-foreground">Enterprize Premium</span> — 5 users (incl. owner)
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Link to="/dashboard/billing">
              <Button className="gradient-gold text-sa-black font-semibold">
                <Sparkles className="h-4 w-4 mr-2" />
                View Plans
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline">Compare Plans</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const renderPermPicker = (perms: string[], setPerms: (p: string[]) => void) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Tick the dashboard sections this user can access. Billing, Settings and User Accounts stay owner-only.
        </p>
        <div className="flex gap-1">
          <Button type="button" size="sm" variant="ghost" className="text-xs h-7" onClick={() => setPermsAll(setPerms, true)}>Select all</Button>
          <Button type="button" size="sm" variant="ghost" className="text-xs h-7" onClick={() => setPermsAll(setPerms, false)}>Reset</Button>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {PERMISSION_GROUPS.map(group => (
          <div key={group.name} className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">{group.name}</div>
            <div className="space-y-1.5">
              {group.perms.map(p => {
                const checked = perms.includes(p.key);
                return (
                  <label key={p.key} className={`flex items-center gap-2 text-sm cursor-pointer rounded px-1.5 py-1 hover:bg-background ${checked ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePerm(perms, setPerms, p.key)}
                      className="h-4 w-4 rounded border-border accent-primary"
                    />
                    <span className="flex-1">{p.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            User Accounts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Add up to {MAX_SEATS} additional user account{MAX_SEATS !== 1 ? "s" : ""} on your {getPlanLabel(planCode)} plan and choose exactly which sections they can access.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">User accounts</div>
            <div className="text-lg font-bold font-heading text-foreground">{seatsUsed} / {MAX_SEATS}</div>
          </div>
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button disabled={seatsRemaining <= 0}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add a User Account</DialogTitle>
                <DialogDescription>
                  We'll create their account and email them a link to set their own password. They'll only see the dashboard sections you tick below.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Full name</label>
                    <Input
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      placeholder="Thandi Nkosi"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Email address</label>
                    <Input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="thandi@yourbusiness.co.za"
                    />
                  </div>
                </div>
                {renderPermPicker(invitePerms, setInvitePerms)}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteOpen(false)} disabled={inviting}>
                  Cancel
                </Button>
                <Button onClick={handleInvite} disabled={inviting}>
                  {inviting
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending invite…</>
                    : <><Send className="h-4 w-4 mr-2" />Send invite</>}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {seatsRemaining === 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 flex items-start gap-2 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          You've reached the {MAX_SEATS}-user-account limit on {getPlanLabel(planCode)}. Remove a user to free up a slot.
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl border border-border bg-card shadow-card overflow-hidden"
      >
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="text-sm font-bold font-heading text-foreground">Workspace members</h2>
        </div>
        {loading ? (
          <div className="p-8 flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No members yet.</div>
        ) : (
          <ul className="divide-y divide-border">
            {members.map((m) => {
              const isOwner = m.role === "owner";
              const isMe = m.user_id === user?.id;
              const isEditing = editingId === m.id;
              return (
                <li key={m.id} className="p-4 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm ${isOwner ? "text-amber-700 bg-amber-100" : "text-emerald-700 bg-emerald-100"}`}>
                        {(m.full_name || m.email)[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground truncate">
                            {m.full_name || m.email}
                          </span>
                          {isMe && (
                            <span className="text-[10px] font-bold uppercase tracking-wide rounded-full bg-primary/10 text-primary px-2 py-0.5">You</span>
                          )}
                          {isOwner && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide rounded-full bg-amber-500/15 text-amber-700 px-2 py-0.5">
                              <Crown className="h-3 w-3" /> Owner
                            </span>
                          )}
                          {!isOwner && m.invite_pending && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide rounded-full bg-amber-500/15 text-amber-700 px-2 py-0.5">
                              <ShieldAlert className="h-3 w-3" /> Invite pending
                            </span>
                          )}
                          {!isOwner && !m.invite_pending && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide rounded-full bg-emerald-500/15 text-emerald-700 px-2 py-0.5">
                              <Check className="h-3 w-3" /> Active
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" /> {m.email}
                        </div>
                      </div>
                    </div>

                    {!isOwner && (
                      <div className="flex items-center gap-2">
                        {m.invite_pending && (
                          <Button size="sm" variant="outline" onClick={() => handleResend(m)}>
                            <Send className="h-3.5 w-3.5 mr-1.5" /> Resend invite
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => isEditing ? setEditingId(null) : startEdit(m)}>
                          {isEditing ? <><ChevronUp className="h-3.5 w-3.5 mr-1.5" />Hide</> : <><ChevronDown className="h-3.5 w-3.5 mr-1.5" />Permissions</>}
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleRemove(m)} className="text-muted-foreground hover:text-destructive h-9 w-9" title="Remove member">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {!isOwner && !isEditing && m.permissions && m.permissions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-13 md:pl-13">
                      {m.permissions.map(pk => {
                        const def = PERMISSION_GROUPS.flatMap(g => g.perms).find(p => p.key === pk);
                        if (!def) return null;
                        return (
                          <span key={pk} className="text-[10px] font-medium rounded-full bg-muted text-foreground px-2 py-0.5">
                            {def.label}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {!isOwner && isEditing && (
                    <div className="rounded-lg border border-border bg-background p-4 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                          <Input
                            value={editingName}
                            onChange={e => setEditingName(e.target.value)}
                            placeholder="Full name"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">Email Address</label>
                          <Input
                            value={editingEmail}
                            onChange={e => setEditingEmail(e.target.value)}
                            placeholder="Email address"
                            type="email"
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Permissions</p>
                        {renderPermPicker(editingPerms, setEditingPerms)}
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <Button variant="outline" size="sm" onClick={() => setEditingId(null)} disabled={savingEdit}>Cancel</Button>
                        <Button size="sm" onClick={() => saveEdit(m)} disabled={savingEdit}>
                          {savingEdit ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : <><Check className="h-4 w-4 mr-2" />Save changes</>}
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border bg-card p-6 shadow-card"
      >
        <h2 className="text-base font-bold font-heading text-foreground mb-2">How it works</h2>
        <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
          <li>You create the account; they receive an email invite to set their own password (link expires in 7 days).</li>
          <li>Team members log in with their own email and password — they only see the sections you tick for them.</li>
          <li>Billing, Settings and Team Members are always owner-only and never visible to team members.</li>
          <li>You can update permissions at any time. Removing a member also deletes their account.</li>
        </ul>
      </motion.div>
    </div>
  );
}
