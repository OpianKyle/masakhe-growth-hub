import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, UserPlus, Crown, Shield, PenSquare, Eye, Trash2, Mail,
  Loader2, AlertCircle, Lock, Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
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
}

const ROLE_META: Record<Role, { label: string; desc: string; icon: typeof Crown; color: string }> = {
  owner:  { label: "Owner",  desc: "Full access, billing and team management.", icon: Crown,     color: "text-amber-600 bg-amber-100" },
  admin:  { label: "Admin",  desc: "Manage all modules and invite team members.", icon: Shield,    color: "text-blue-700 bg-blue-100" },
  editor: { label: "Editor", desc: "Create and edit content, but cannot manage team.", icon: PenSquare, color: "text-emerald-700 bg-emerald-100" },
  viewer: { label: "Viewer", desc: "Read-only access to dashboards and reports.", icon: Eye,       color: "text-slate-700 bg-slate-100" },
};

const ASSIGNABLE_ROLES: Role[] = ["admin", "editor", "viewer"];
const MAX_SEATS = 4;

export default function TeamMembersPage() {
  const { user } = useAuth();
  const [planCode, setPlanCode] = useState<string | null>(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("editor");
  const [inviting, setInviting] = useState(false);

  const myRole: Role | undefined = members.find((m) => m.user_id === user?.id)?.role;
  const canManage = myRole === "owner" || myRole === "admin";
  const seatsUsed = members.length;
  const seatsRemaining = Math.max(0, MAX_SEATS - seatsUsed);
  const isPremium = planCode === "premium";

  useEffect(() => {
    fetch("/api/billing/status", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setPlanCode(d?.plan || null))
      .catch(() => setPlanCode(null))
      .finally(() => setPlanLoading(false));
  }, []);

  useEffect(() => {
    if (!isPremium) return;
    fetch("/api/social/workspaces/mine", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setWorkspaceId(d.defaultId || null))
      .catch(() => setWorkspaceId(null));
  }, [isPremium]);

  const loadMembers = () => {
    if (!workspaceId) return;
    setLoading(true);
    fetch(`/api/social/workspaces/${workspaceId}/members`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setMembers(Array.isArray(d) ? d : []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  };

  useEffect(loadMembers, [workspaceId]);

  const handleInvite = async () => {
    if (!workspaceId) return;
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address.");
      return;
    }
    if (seatsRemaining <= 0) {
      toast.error(`Your plan supports up to ${MAX_SEATS} users.`);
      return;
    }
    setInviting(true);
    try {
      const res = await fetch(`/api/social/workspaces/${workspaceId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: inviteEmail.trim().toLowerCase(), role: inviteRole }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add member");
      toast.success("Team member added.");
      setInviteOpen(false);
      setInviteEmail("");
      setInviteRole("editor");
      loadMembers();
    } catch (err: any) {
      toast.error(err.message || "Failed to add member.");
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (member: Member, newRole: Role) => {
    if (!workspaceId || newRole === "owner" || member.role === "owner") return;
    try {
      const res = await fetch(`/api/social/workspaces/${workspaceId}/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update role");
      toast.success("Role updated.");
      loadMembers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update role.");
    }
  };

  const handleRemove = async (member: Member) => {
    if (!workspaceId || member.role === "owner") return;
    if (!confirm(`Remove ${member.full_name || member.email} from the team?`)) return;
    try {
      const res = await fetch(`/api/social/workspaces/${workspaceId}/members/${member.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to remove member");
      toast.success("Member removed.");
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

  if (!isPremium) {
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
            Team Members is an Enterprize Premium feature
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            Upgrade to <span className="font-semibold text-foreground">Enterprize Premium</span> to invite up to 4 users
            with permission-based access (Admin, Editor, Viewer).
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Link to="/dashboard/billing">
              <Button className="gradient-gold text-sa-black font-semibold">
                <Sparkles className="h-4 w-4 mr-2" />
                Upgrade to Premium
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
            Team Members
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Invite up to {MAX_SEATS} users to your workspace and control what they can access.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Seats used</div>
            <div className="text-lg font-bold font-heading text-foreground">
              {seatsUsed} / {MAX_SEATS}
            </div>
          </div>
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button disabled={!canManage || seatsRemaining <= 0}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a Team Member</DialogTitle>
                <DialogDescription>
                  The user must already have a Masakhe account. Enter the email address they signed up with.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Email address</label>
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@yourbusiness.co.za"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Role</label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as Role)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ASSIGNABLE_ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {ROLE_META[r].label} — {ROLE_META[r].desc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteOpen(false)} disabled={inviting}>
                  Cancel
                </Button>
                <Button onClick={handleInvite} disabled={inviting}>
                  {inviting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Adding…</> : <><UserPlus className="h-4 w-4 mr-2" />Add Member</>}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {seatsRemaining === 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 flex items-start gap-2 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          You've reached the {MAX_SEATS}-user limit on Enterprize Premium. Remove a member to free up a seat.
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
          <div className="p-8 text-center text-sm text-muted-foreground">
            No members yet.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {members.map((m) => {
              const meta = ROLE_META[m.role];
              const isMe = m.user_id === user?.id;
              return (
                <li key={m.id} className="flex flex-col md:flex-row md:items-center gap-3 p-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm ${meta.color}`}>
                      {(m.full_name || m.email)[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground truncate">
                          {m.full_name || m.email}
                        </span>
                        {isMe && (
                          <span className="text-[10px] font-bold uppercase tracking-wide rounded-full bg-primary/10 text-primary px-2 py-0.5">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3" /> {m.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:gap-3">
                    {m.role === "owner" || !canManage ? (
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.color}`}>
                        <meta.icon className="h-3 w-3" />
                        {meta.label}
                      </span>
                    ) : (
                      <Select
                        value={m.role}
                        onValueChange={(v) => handleRoleChange(m, v as Role)}
                      >
                        <SelectTrigger className="w-[140px] h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ASSIGNABLE_ROLES.map((r) => (
                            <SelectItem key={r} value={r}>
                              {ROLE_META[r].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {canManage && m.role !== "owner" && !isMe && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemove(m)}
                        className="text-muted-foreground hover:text-destructive h-9 w-9"
                        title="Remove member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
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
        <h2 className="text-lg font-bold font-heading text-foreground mb-3">Permission roles</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {(Object.keys(ROLE_META) as Role[]).map((r) => {
            const meta = ROLE_META[r];
            return (
              <div key={r} className="rounded-lg border border-border p-3 flex items-start gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
                  <meta.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">{meta.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{meta.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
