import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Calendar, CheckCircle2, XCircle, Clock, Plus, Trash2,
  Users, CalendarDays, AlertCircle, ChevronDown, Pencil
} from "lucide-react";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  department: string;
}

interface LeaveRequest {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  position: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string | null;
  status: "pending" | "approved" | "rejected";
  review_note: string | null;
  created_at: string;
}

interface LeaveBalance {
  type: string;
  total: number;
  used: number;
  pending: number;
  remaining: number;
}

interface EmployeeBalance {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  department: string;
  leaveBalances: LeaveBalance[];
}

const LEAVE_TYPES = ["Annual", "Sick", "Family Responsibility", "Unpaid"];

const LEAVE_COLORS: Record<string, string> = {
  Annual: "bg-blue-100 text-blue-700",
  Sick: "bg-orange-100 text-orange-700",
  "Family Responsibility": "bg-purple-100 text-purple-700",
  Unpaid: "bg-gray-100 text-gray-700",
};

const STATUS_CONFIG = {
  pending: { label: "Pending", icon: Clock, class: "bg-yellow-100 text-yellow-700" },
  approved: { label: "Approved", icon: CheckCircle2, class: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", icon: XCircle, class: "bg-red-100 text-red-700" },
};

function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.class}`}>
      <Icon className="h-3 w-3" /> {cfg.label}
    </span>
  );
}

function BalanceBar({ used, pending, total }: { used: number; pending: number; total: number }) {
  const usedPct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const pendingPct = total > 0 ? Math.min((pending / total) * 100, 100 - usedPct) : 0;
  return (
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden flex">
      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${usedPct}%` }} />
      <div className="h-full bg-primary/30 rounded-full transition-all" style={{ width: `${pendingPct}%` }} />
    </div>
  );
}

export default function LeavePage() {
  const [tab, setTab] = useState<"overview" | "requests" | "new">("overview");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<EmployeeBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterEmployee, setFilterEmployee] = useState<string>("all");

  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ id: string; action: "approved" | "rejected" } | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [actioning, setActioning] = useState(false);

  const [showEditBalance, setShowEditBalance] = useState(false);
  const [editingBalance, setEditingBalance] = useState<{ employeeId: string; name: string; type: string; total: number } | null>(null);
  const [editDays, setEditDays] = useState("");

  const [form, setForm] = useState({
    employeeId: "",
    leaveType: "Annual",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [empRes, reqRes, balRes] = await Promise.all([
        fetch("/api/leave/employees", { credentials: "include" }),
        fetch(`/api/leave/requests?year=${year}`, { credentials: "include" }),
        fetch(`/api/leave/balances?year=${year}`, { credentials: "include" }),
      ]);
      if (empRes.ok) setEmployees(await empRes.json());
      if (reqRes.ok) setRequests(await reqRes.json());
      if (balRes.ok) setBalances(await balRes.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, [year]);

  const handleSubmit = async () => {
    if (!form.employeeId || !form.startDate || !form.endDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/leave/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          employeeId: form.employeeId,
          leaveType: form.leaveType,
          startDate: form.startDate,
          endDate: form.endDate,
          reason: form.reason || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || "Failed to submit request"); return; }
      toast.success(`Leave request submitted — ${json.days} working day(s)`);
      setForm({ employeeId: "", leaveType: "Annual", startDate: "", endDate: "", reason: "" });
      setTab("requests");
      loadAll();
    } finally {
      setSubmitting(false);
    }
  };

  const openAction = (id: string, action: "approved" | "rejected") => {
    setPendingAction({ id, action });
    setReviewNote("");
    setShowApproveDialog(true);
  };

  const handleAction = async () => {
    if (!pendingAction) return;
    setActioning(true);
    try {
      const res = await fetch(`/api/leave/requests/${pendingAction.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: pendingAction.action, reviewNote }),
      });
      if (res.ok) {
        toast.success(`Request ${pendingAction.action}`);
        setShowApproveDialog(false);
        loadAll();
      } else {
        const j = await res.json();
        toast.error(j.error || "Failed");
      }
    } finally {
      setActioning(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/leave/requests/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) { toast.success("Deleted"); loadAll(); }
  };

  const handleUpdateBalance = async () => {
    if (!editingBalance) return;
    const days = parseFloat(editDays);
    if (isNaN(days) || days < 0) { toast.error("Enter a valid number of days"); return; }
    const res = await fetch(`/api/leave/balances/${editingBalance.employeeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ leaveType: editingBalance.type, totalDays: days, year }),
    });
    if (res.ok) {
      toast.success("Balance updated");
      setShowEditBalance(false);
      loadAll();
    }
  };

  const filteredRequests = requests.filter(r => {
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (filterEmployee !== "all" && r.employee_id !== filterEmployee) return false;
    return true;
  });

  const pendingCount = requests.filter(r => r.status === "pending").length;

  return (
    <div className="min-h-full bg-white dark:bg-gray-950">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #ccfbf1 0%, #a7f3d0 30%, #cffafe 70%, #e0f2fe 100%)" }}>
        <div className="pointer-events-none select-none absolute inset-0">
          <motion.div initial={{ opacity: 0, rotate: -5, y: 20 }} animate={{ opacity: 0.88, rotate: -3, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="absolute -left-4 top-4 w-40 rounded-2xl bg-white/85 backdrop-blur shadow-2xl border-2 border-white p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-full bg-teal-100 flex items-center justify-center"><CalendarDays className="h-3.5 w-3.5 text-teal-600"/></div>
              <div className="space-y-1"><div className="h-2 w-14 rounded-full bg-gray-200"/><div className="h-1.5 w-8 rounded-full bg-gray-100"/></div>
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({length:21},(_,i) => <div key={i} className={`h-4 rounded-sm ${i%7===3?"bg-teal-200":i%7===4?"bg-teal-300":"bg-gray-100"}`}/>)}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, rotate: 5, y: 20 }} animate={{ opacity: 0.85, rotate: 3, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute -right-3 top-5 w-36 rounded-2xl bg-white/85 backdrop-blur shadow-2xl border-2 border-white p-3">
            <div className="h-2 w-14 rounded-full bg-teal-200 mb-2"/>
            {[["Annual Leave","bg-teal-100","w-4/5"],["Sick Leave","bg-sky-100","w-3/5"],["Family","bg-cyan-100","w-2/5"]].map(([l,c,w],i) => (
              <div key={i} className="mb-1.5"><div className="h-1.5 w-16 rounded-full bg-gray-100 mb-0.5"/><div className={`h-2 ${w} rounded-full ${c}`}/></div>
            ))}
          </motion.div>
        </div>
        <div className="relative z-10 py-12 px-6 text-center max-w-2xl mx-auto">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2" style={{ color: "#134e4a" }}>
            Leave & HR
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-teal-800/70 mb-6 text-sm">
            Manage employee leave requests, balances and HR records
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-3 flex-wrap">
            <Button onClick={() => setTab("new")} className="bg-teal-700 hover:bg-teal-800 text-white shadow-md gap-2 rounded-xl">
              <Plus className="h-4 w-4" /> New Request
            </Button>
            <div className="flex items-center gap-2 bg-white/80 border border-white rounded-xl px-3 py-2 shadow-sm">
              <Label className="text-xs text-teal-900 font-medium">Year:</Label>
              <select value={year} onChange={e => setYear(parseInt(e.target.value))}
                className="bg-transparent text-teal-900 text-sm border-0 focus:outline-none font-medium">
                {[year - 1, year, year + 1].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Quick action bar ─────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white dark:bg-gray-950 px-4 py-2">
        <div className="max-w-5xl mx-auto flex items-center gap-0.5 overflow-x-auto scrollbar-none">
          {(["overview","requests","new"] as const).map((t, i) => (
            <motion.button key={t} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => setTab(t)}
              className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl transition-colors group min-w-[72px] shrink-0 ${tab === t ? "bg-teal-50" : "hover:bg-gray-50"}`}>
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t==="overview"?"from-teal-500 to-cyan-500":t==="requests"?"from-sky-500 to-blue-500":"from-emerald-500 to-teal-500"} flex items-center justify-center shadow-sm ${tab===t?"scale-110":""} transition-transform`}>
                {t==="overview"?<CalendarDays className="h-4 w-4 text-white"/>:t==="requests"?<Users className="h-4 w-4 text-white"/>:<Plus className="h-4 w-4 text-white"/>}
              </div>
              <span className={`text-[11px] font-medium whitespace-nowrap ${tab===t?"text-teal-700":"text-gray-600"}`}>
                {t==="overview"?"Overview":t==="requests"?`Requests${requests.filter(r=>r.status==="pending").length>0?` (${requests.filter(r=>r.status==="pending").length})`:""}` :"New Request"}
              </span>
            </motion.button>
          ))}
          <div className="mx-2 h-10 w-px bg-gray-200 shrink-0" />
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            onClick={() => setTab("new")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all shrink-0">
            <Plus className="h-4 w-4" /> New Request
          </motion.button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
      <div className="flex items-center gap-2 border-b">
        {([
          { key: "overview", label: "Leave Overview" },
          { key: "requests", label: `Requests${pendingCount > 0 ? ` (${pendingCount} pending)` : ""}` },
          { key: "new", label: "New Request" },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <>
          {/* Overview */}
          {tab === "overview" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {balances.length === 0 ? (
                <Card className="p-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="font-medium">No active employees</p>
                  <p className="text-sm text-muted-foreground mt-1">Add employees in the Payroll section first.</p>
                </Card>
              ) : (
                balances.map(emp => (
                  <Card key={emp.id} className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{emp.first_name} {emp.last_name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{emp.position}{emp.department ? ` · ${emp.department}` : ""}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {emp.leaveBalances.map(bal => (
                        <div key={bal.type} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${LEAVE_COLORS[bal.type] || "bg-muted text-muted-foreground"}`}>
                              {bal.type}
                            </span>
                            <button
                              onClick={() => {
                                setEditingBalance({ employeeId: emp.id, name: `${emp.first_name} ${emp.last_name}`, type: bal.type, total: bal.total });
                                setEditDays(String(bal.total));
                                setShowEditBalance(true);
                              }}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              title="Edit allocation"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                          </div>
                          <BalanceBar used={bal.used} pending={bal.pending} total={bal.total} />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{bal.used}d used{bal.pending > 0 ? ` · ${bal.pending}d pending` : ""}</span>
                            <span className={`font-medium ${bal.remaining <= 0 ? "text-red-500" : "text-foreground"}`}>
                              {bal.remaining.toFixed(1)}d left
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))
              )}
            </motion.div>
          )}

          {/* Requests */}
          {tab === "requests" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="h-8 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={filterEmployee}
                  onChange={e => setFilterEmployee(e.target.value)}
                  className="h-8 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="all">All employees</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                  ))}
                </select>
                <span className="text-sm text-muted-foreground ml-auto">{filteredRequests.length} request{filteredRequests.length !== 1 ? "s" : ""}</span>
              </div>

              {filteredRequests.length === 0 ? (
                <Card className="p-12 text-center">
                  <CalendarDays className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="font-medium">No leave requests</p>
                  <p className="text-sm text-muted-foreground mt-1">Submit a new request using the "New Request" tab.</p>
                </Card>
              ) : (
                <Card className="overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 font-semibold">Employee</th>
                        <th className="text-left p-3 font-semibold">Leave Type</th>
                        <th className="text-left p-3 font-semibold">Dates</th>
                        <th className="text-center p-3 font-semibold">Days</th>
                        <th className="text-left p-3 font-semibold">Status</th>
                        <th className="text-left p-3 font-semibold">Reason</th>
                        <th className="p-3 w-28"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map(r => (
                        <tr key={r.id} className="border-b hover:bg-muted/20 transition-colors">
                          <td className="p-3">
                            <p className="font-medium">{r.first_name} {r.last_name}</p>
                            <p className="text-xs text-muted-foreground">{r.position}</p>
                          </td>
                          <td className="p-3">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${LEAVE_COLORS[r.leave_type] || "bg-muted"}`}>
                              {r.leave_type}
                            </span>
                          </td>
                          <td className="p-3 text-muted-foreground whitespace-nowrap">
                            {new Date(r.start_date).toLocaleDateString("en-ZA", { day: "2-digit", month: "short" })}
                            {r.start_date !== r.end_date && (
                              <> – {new Date(r.end_date).toLocaleDateString("en-ZA", { day: "2-digit", month: "short" })}</>
                            )}
                          </td>
                          <td className="p-3 text-center font-semibold">{r.days}</td>
                          <td className="p-3">
                            <StatusBadge status={r.status} />
                            {r.review_note && (
                              <p className="text-xs text-muted-foreground mt-1 max-w-[140px] truncate" title={r.review_note}>{r.review_note}</p>
                            )}
                          </td>
                          <td className="p-3 text-muted-foreground text-xs max-w-[120px] truncate">{r.reason || "—"}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-1 justify-end">
                              {r.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => openAction(r.id, "approved")}
                                  >
                                    <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-xs border-red-200 text-red-600 hover:bg-red-50"
                                    onClick={() => openAction(r.id, "rejected")}
                                  >
                                    <XCircle className="h-3 w-3 mr-1" /> Reject
                                  </Button>
                                </>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-red-500"
                                onClick={() => handleDelete(r.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )}
            </motion.div>
          )}

          {/* New Request */}
          {tab === "new" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 max-w-xl">
                <h3 className="font-bold mb-5 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" /> Submit Leave Request
                </h3>
                {employees.length === 0 ? (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">No active employees found. Please add employees in the Payroll section first.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs mb-1.5 block">Employee *</Label>
                      <select
                        value={form.employeeId}
                        onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
                        className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                      >
                        <option value="">Select employee…</option>
                        {employees.map(e => (
                          <option key={e.id} value={e.id}>{e.first_name} {e.last_name}{e.position ? ` — ${e.position}` : ""}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs mb-1.5 block">Leave Type *</Label>
                      <div className="flex gap-2 flex-wrap">
                        {LEAVE_TYPES.map(type => (
                          <button
                            key={type}
                            onClick={() => setForm(f => ({ ...f, leaveType: type }))}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                              form.leaveType === type
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background border-border hover:bg-muted"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs mb-1.5 block">Start Date *</Label>
                        <Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="h-9" />
                      </div>
                      <div>
                        <Label className="text-xs mb-1.5 block">End Date *</Label>
                        <Input type="date" value={form.endDate} min={form.startDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="h-9" />
                      </div>
                    </div>

                    {form.startDate && form.endDate && form.startDate <= form.endDate && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                        <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                        <span>
                          This spans <strong>
                            {(() => {
                              let count = 0;
                              const cur = new Date(form.startDate);
                              const end = new Date(form.endDate);
                              while (cur <= end) {
                                if (cur.getDay() !== 0 && cur.getDay() !== 6) count++;
                                cur.setDate(cur.getDate() + 1);
                              }
                              return count;
                            })()}
                          </strong> working day(s)
                          {form.leaveType !== "Unpaid" && form.employeeId && (() => {
                            const emp = balances.find(b => b.id === form.employeeId);
                            const bal = emp?.leaveBalances.find(b => b.type === form.leaveType);
                            if (bal) return ` · ${bal.remaining.toFixed(1)} day(s) remaining`;
                            return "";
                          })()}
                        </span>
                      </div>
                    )}

                    <div>
                      <Label className="text-xs mb-1.5 block">Reason (optional)</Label>
                      <Textarea
                        value={form.reason}
                        onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                        placeholder="Briefly describe the reason for leave…"
                        rows={3}
                        className="resize-none text-sm"
                      />
                    </div>

                    <Button onClick={handleSubmit} disabled={submitting} className="gradient-hero text-white w-full">
                      {submitting ? "Submitting…" : "Submit Leave Request"}
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </>
      )}

      {/* Approve / Reject Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {pendingAction?.action === "approved" ? "Approve Leave Request" : "Reject Leave Request"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-xs mb-1.5 block">Note (optional)</Label>
              <Textarea
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
                placeholder={pendingAction?.action === "approved" ? "e.g. Approved. Enjoy your leave!" : "e.g. Please reschedule due to project deadline."}
                rows={3}
                className="resize-none text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAction}
                disabled={actioning}
                className={`flex-1 ${pendingAction?.action === "approved" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}`}
              >
                {actioning ? "Saving…" : pendingAction?.action === "approved" ? "Confirm Approval" : "Confirm Rejection"}
              </Button>
              <Button variant="outline" onClick={() => setShowApproveDialog(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Balance Dialog */}
      <Dialog open={showEditBalance} onOpenChange={setShowEditBalance}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Leave Allocation</DialogTitle>
          </DialogHeader>
          {editingBalance && (
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Updating <strong>{editingBalance.type}</strong> leave for <strong>{editingBalance.name}</strong> ({year})
              </p>
              <div>
                <Label className="text-xs mb-1.5 block">Total Days Allocation</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={editDays}
                  onChange={e => setEditDays(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateBalance} className="flex-1 gradient-hero text-white">Save</Button>
                <Button variant="outline" onClick={() => setShowEditBalance(false)} className="flex-1">Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
