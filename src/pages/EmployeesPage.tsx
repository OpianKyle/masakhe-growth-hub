import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, Plus, Pencil, Trash2, Search, Banknote, Briefcase,
  Phone, Mail, MapPin, CheckCircle, X, Building2, IdCard,
  CalendarDays, UserCheck, UserX, ChevronsUpDown, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

const R = (cents: number) =>
  `R ${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  id_number?: string;
  tax_number?: string;
  position?: string;
  department?: string;
  start_date?: string;
  employment_type: string;
  basic_salary: number;
  age: number;
  uif_exempt: boolean;
  phone?: string;
  email?: string;
  address?: string;
  bank_name?: string;
  account_type?: string;
  account_number?: string;
  branch_code?: string;
  status: string;
}

const emptyEmployee = {
  first_name: "", last_name: "", id_number: "", tax_number: "", position: "", department: "",
  start_date: "", employment_type: "full_time", basic_salary: "", age: "30", uif_exempt: false,
  phone: "", email: "", address: "", bank_name: "", account_type: "cheque",
  account_number: "", branch_code: "", status: "active",
};

const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
];

const BANK_NAMES = [
  "ABSA", "Capitec", "FNB", "Nedbank", "Standard Bank",
  "African Bank", "Bidvest Bank", "Discovery Bank", "Investec", "TymeBank", "Other",
];

const ACCOUNT_TYPES = ["cheque", "savings", "transmission", "credit"];

type FormSection = "personal" | "employment" | "banking";

export default function EmployeesPage() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyEmployee);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formSection, setFormSection] = useState<FormSection>("personal");

  useEffect(() => { loadEmployees(); }, []);

  const loadEmployees = () => {
    fetch("/api/payroll/employees", { credentials: "include" })
      .then(r => r.json()).then(setEmployees).catch(() => {});
  };

  const openAdd = () => {
    setEditingId(null); setForm(emptyEmployee); setFormSection("personal"); setDialogOpen(true);
  };

  const openEdit = (e: Employee) => {
    setEditingId(e.id);
    setForm({
      first_name: e.first_name, last_name: e.last_name, id_number: e.id_number || "",
      tax_number: e.tax_number || "", position: e.position || "", department: e.department || "",
      start_date: e.start_date ? e.start_date.split("T")[0] : "",
      employment_type: e.employment_type,
      basic_salary: String(Math.round(e.basic_salary / 100)),
      age: String(e.age), uif_exempt: e.uif_exempt,
      phone: e.phone || "", email: e.email || "", address: e.address || "",
      bank_name: e.bank_name || "", account_type: e.account_type || "cheque",
      account_number: e.account_number || "", branch_code: e.branch_code || "", status: e.status,
    });
    setFormSection("personal");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.first_name || !form.last_name || !form.basic_salary) {
      toast({ title: "Required fields missing", description: "First name, last name and basic salary are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const body = { ...form, basic_salary: Math.round(parseFloat(form.basic_salary) * 100), age: Number(form.age) };
    const url = editingId ? `/api/payroll/employees/${editingId}` : "/api/payroll/employees";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, { method, credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    if (res.ok) {
      toast({ title: editingId ? "Employee updated" : "Employee added", description: `${form.first_name} ${form.last_name} has been ${editingId ? "updated" : "added"} successfully.` });
      setDialogOpen(false);
      loadEmployees();
    } else {
      const d = await res.json();
      toast({ title: d.error || "Failed to save", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/payroll/employees/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) { toast({ title: "Employee removed" }); loadEmployees(); }
    setDeleteConfirm(null);
  };

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const filtered = employees.filter(e => {
    const matchSearch = `${e.first_name} ${e.last_name} ${e.position || ""} ${e.department || ""} ${e.email || ""}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeCount = employees.filter(e => e.status === "active").length;
  const totalPayroll = employees.filter(e => e.status === "active").reduce((s, e) => s + e.basic_salary, 0);
  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))].length;

  const formSections: { id: FormSection; label: string; icon: any }[] = [
    { id: "personal", label: "Personal Info", icon: IdCard },
    { id: "employment", label: "Employment", icon: Briefcase },
    { id: "banking", label: "Banking", icon: Banknote },
  ];

  return (
    <div className="min-h-full bg-white dark:bg-gray-950">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 20%, #dbeafe 70%, #e0e7ff 100%)" }}>
        <div className="pointer-events-none select-none absolute inset-0">
          <motion.div initial={{ opacity: 0, rotate: -5, y: 20 }} animate={{ opacity: 0.88, rotate: -3, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="absolute -left-4 top-5 w-40 rounded-2xl bg-white/85 backdrop-blur shadow-2xl border-2 border-white p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center"><Users className="h-3.5 w-3.5 text-amber-600" /></div>
              <div className="space-y-1"><div className="h-2 w-12 rounded-full bg-gray-200" /><div className="h-1.5 w-8 rounded-full bg-gray-100" /></div>
            </div>
            {["bg-amber-50", "bg-blue-50", "bg-amber-50"].map((c, i) => (
              <div key={i} className={`h-6 w-full rounded-lg ${c} mb-1.5 flex items-center px-2 gap-1.5`}>
                <div className="h-3 w-3 rounded-full bg-amber-200" /><div className="h-1.5 flex-1 rounded-full bg-gray-200" />
              </div>
            ))}
          </motion.div>
          <motion.div initial={{ opacity: 0, rotate: 5, y: 20 }} animate={{ opacity: 0.85, rotate: 3, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute -right-3 top-4 w-36 rounded-2xl bg-white/85 backdrop-blur shadow-2xl border-2 border-white p-3">
            <div className="h-2 w-14 rounded-full bg-amber-200 mb-2" />
            <div className="space-y-2">
              {[UserCheck, Briefcase, Banknote].map((Icon, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center"><Icon className="h-2.5 w-2.5 text-amber-600" /></div>
                  <div className="h-1.5 flex-1 rounded-full bg-gray-100" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        <div className="relative z-10 py-12 px-6 text-center max-w-2xl mx-auto">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2" style={{ color: "#78350f" }}>
            Employees
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-amber-800/70 mb-6 text-sm">
            Central employee records — all staff added here flow into Payroll and Leave & HR automatically.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-3">
            <Button onClick={openAdd} className="bg-amber-700 hover:bg-amber-800 text-white shadow-md gap-2 rounded-xl">
              <Plus className="h-4 w-4" /> Add Employee
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-sm">
              <Users className="h-5 w-5 text-white" />
            </div>
            <p className="text-2xl font-bold mt-2">{activeCount}</p>
            <p className="text-xs text-muted-foreground">Active Employees</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
              <Banknote className="h-5 w-5 text-white" />
            </div>
            <p className="text-2xl font-bold mt-2">{R(totalPayroll)}</p>
            <p className="text-xs text-muted-foreground">Total Basic Payroll / Month</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <p className="text-2xl font-bold mt-2">{departments}</p>
            <p className="text-xs text-muted-foreground">Departments</p>
          </div>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/20 px-4 py-3 text-sm text-blue-800 dark:text-blue-300">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-blue-500" />
          <p>Employees added here are automatically available in <strong>Payroll</strong> (to run payslips) and <strong>Leave & HR</strong> (to manage leave requests and balances).</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search employees…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1 border rounded-lg p-1 bg-muted/30">
            {(["all", "active", "inactive"] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${statusFilter === s ? "bg-white dark:bg-gray-800 shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {s}
              </button>
            ))}
          </div>
          <Button onClick={openAdd} size="sm" className="gap-1.5 ml-auto">
            <Plus className="h-4 w-4" /> Add Employee
          </Button>
        </div>

        {/* Employee cards */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border bg-card p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30 mx-auto mb-4">
              <Users className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="font-semibold text-lg mb-1">
              {employees.length === 0 ? "No employees yet" : "No results found"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {employees.length === 0
                ? "Add your first employee to get started. They'll automatically appear in Payroll and Leave & HR."
                : "Try adjusting your search or filters."}
            </p>
            {employees.length === 0 && (
              <Button onClick={openAdd} className="gap-2">
                <Plus className="h-4 w-4" /> Add First Employee
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-semibold">Employee</th>
                    <th className="text-left p-4 font-semibold hidden sm:table-cell">Role / Department</th>
                    <th className="text-left p-4 font-semibold">Basic Salary</th>
                    <th className="text-left p-4 font-semibold hidden md:table-cell">Type</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-right p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(emp => (
                    <>
                      <tr key={emp.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {emp.first_name[0]}{emp.last_name[0]}
                            </div>
                            <div>
                              <div className="font-medium">{emp.first_name} {emp.last_name}</div>
                              {emp.email && <div className="text-xs text-muted-foreground">{emp.email}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <div className="font-medium">{emp.position || <span className="text-muted-foreground italic">—</span>}</div>
                          {emp.department && <div className="text-xs text-muted-foreground">{emp.department}</div>}
                        </td>
                        <td className="p-4 font-semibold">{R(emp.basic_salary)}<span className="text-xs font-normal text-muted-foreground">/mo</span></td>
                        <td className="p-4 hidden md:table-cell">
                          <span className="text-xs bg-muted px-2 py-1 rounded capitalize">{emp.employment_type.replace("_", " ")}</span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${emp.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${emp.status === "active" ? "bg-emerald-500" : "bg-gray-400"}`} />
                            {emp.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="View details"
                              onClick={() => setExpandedId(expandedId === emp.id ? null : emp.id)}>
                              <ChevronsUpDown className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(emp)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteConfirm(emp.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {expandedId === emp.id && (
                        <tr key={`${emp.id}-expanded`} className="bg-muted/20 border-b">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              {emp.phone && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Phone className="h-3.5 w-3.5" />
                                  <span>{emp.phone}</span>
                                </div>
                              )}
                              {emp.email && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Mail className="h-3.5 w-3.5" />
                                  <span>{emp.email}</span>
                                </div>
                              )}
                              {emp.address && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <MapPin className="h-3.5 w-3.5" />
                                  <span>{emp.address}</span>
                                </div>
                              )}
                              {emp.start_date && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <CalendarDays className="h-3.5 w-3.5" />
                                  <span>Started {new Date(emp.start_date).toLocaleDateString("en-ZA")}</span>
                                </div>
                              )}
                              {emp.id_number && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <IdCard className="h-3.5 w-3.5" />
                                  <span>ID: {emp.id_number}</span>
                                </div>
                              )}
                              {emp.bank_name && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Banknote className="h-3.5 w-3.5" />
                                  <span>{emp.bank_name} · {emp.account_number}</span>
                                </div>
                              )}
                              {emp.tax_number && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Info className="h-3.5 w-3.5" />
                                  <span>Tax ref: {emp.tax_number}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Users className="h-3.5 w-3.5" />
                                <span>UIF: {emp.uif_exempt ? "Exempt" : `Applicable · Age ${emp.age}`}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Add/Edit dialog ─────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Employee" : "Add New Employee"}</DialogTitle>
          </DialogHeader>

          {/* Section tabs */}
          <div className="flex gap-1 border-b -mx-6 px-6 mb-4">
            {formSections.map(s => (
              <button key={s.id} onClick={() => setFormSection(s.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${formSection === s.id ? "border-amber-500 text-amber-700" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                <s.icon className="h-3.5 w-3.5" />
                {s.label}
              </button>
            ))}
          </div>

          {/* Personal Info */}
          {formSection === "personal" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">First Name *</label>
                  <Input placeholder="Jane" value={form.first_name} onChange={e => set("first_name", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Last Name *</label>
                  <Input placeholder="Smith" value={form.last_name} onChange={e => set("last_name", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">ID Number</label>
                  <Input placeholder="8001015009087" value={form.id_number} onChange={e => set("id_number", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Age</label>
                  <Input type="number" min="16" max="90" value={form.age} onChange={e => set("age", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="jane@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Phone</label>
                  <Input type="tel" placeholder="+27 71 234 5678" value={form.phone} onChange={e => set("phone", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Address</label>
                <Input placeholder="123 Main St, Johannesburg" value={form.address} onChange={e => set("address", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Status</label>
                <select value={form.status} onChange={e => set("status", e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}

          {/* Employment Info */}
          {formSection === "employment" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Position / Job Title</label>
                  <Input placeholder="Accountant" value={form.position} onChange={e => set("position", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Department</label>
                  <Input placeholder="Finance" value={form.department} onChange={e => set("department", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Employment Type</label>
                  <select value={form.employment_type} onChange={e => set("employment_type", e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    {EMPLOYMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input type="date" value={form.start_date} onChange={e => set("start_date", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Basic Salary (ZAR) *</label>
                  <Input type="number" min="0" step="100" placeholder="15000" value={form.basic_salary} onChange={e => set("basic_salary", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Tax Reference Number</label>
                  <Input placeholder="1234567890" value={form.tax_number} onChange={e => set("tax_number", e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                <input type="checkbox" id="uif_exempt" checked={form.uif_exempt}
                  onChange={e => set("uif_exempt", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 accent-amber-600" />
                <label htmlFor="uif_exempt" className="text-sm cursor-pointer">
                  <span className="font-medium">UIF Exempt</span>
                  <span className="text-muted-foreground ml-1.5">(e.g. non-SA citizen working on contract)</span>
                </label>
              </div>
            </div>
          )}

          {/* Banking Info */}
          {formSection === "banking" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Banking details are used for payslip generation. This information is stored securely.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Bank Name</label>
                  <select value={form.bank_name} onChange={e => set("bank_name", e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">Select bank…</option>
                    {BANK_NAMES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Account Type</label>
                  <select value={form.account_type} onChange={e => set("account_type", e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    {ACCOUNT_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Account Number</label>
                  <Input placeholder="1234567890" value={form.account_number} onChange={e => set("account_number", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Branch Code</label>
                  <Input placeholder="250655" value={form.branch_code} onChange={e => set("branch_code", e.target.value)} />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
            <div className="flex gap-2">
              {formSection !== "personal" && (
                <Button variant="outline" onClick={() => setFormSection(formSection === "banking" ? "employment" : "personal")}>← Back</Button>
              )}
              {formSection !== "banking" ? (
                <Button onClick={() => setFormSection(formSection === "personal" ? "employment" : "banking")} className="bg-amber-600 hover:bg-amber-700 text-white">
                  Next →
                </Button>
              ) : (
                <Button onClick={handleSave} disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
                  {saving ? <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />Saving…</> : <><CheckCircle className="h-4 w-4" />{editingId ? "Save Changes" : "Add Employee"}</>}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm ──────────────────────────────────── */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Employee</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove this employee? Their payslip history will be preserved, but they will no longer appear in active payroll or leave management.
          </p>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              <Trash2 className="h-4 w-4 mr-2" /> Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
