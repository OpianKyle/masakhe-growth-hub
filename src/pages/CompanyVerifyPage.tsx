import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Building2, Plus, Trash2, ChevronLeft, Edit, ShieldCheck,
  BadgeCheck, Calendar, User, MapPin, Briefcase, Clock,
  CheckCircle2, XCircle, AlertTriangle, Info
} from "lucide-react";

interface VerificationDetails {
  verified: boolean; registrationNumber: string; checks: string[]; issues: string[];
  summary: string; verifiedAt: string; disclaimer: string;
}

interface Company {
  id: string; company_name: string; registration_number: string; company_type: string;
  registration_date: string; status: string; directors: string; address: string;
  financial_year_end: string; is_verified: number; verification_details: string | null;
  created_at: string; updated_at: string;
}

const empty = {
  companyName: "", registrationNumber: "", companyType: "", registrationDate: "",
  status: "Active", directors: "", address: "", financialYearEnd: "",
};

const COMPANY_TYPES = ["Private Company (Pty) Ltd", "Close Corporation (CC)", "Non-Profit Company (NPC)", "Sole Proprietor", "Partnership", "Trust", "Public Company (Ltd)", "Other"];
const STATUSES = ["Active", "In Liquidation", "Deregistered", "Under Investigation"];

export default function CompanyVerifyPage() {
  const [view, setView] = useState<"list" | "form" | "detail">("list");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [detailCompany, setDetailCompany] = useState<Company | null>(null);
  const [editMode, setEditMode] = useState(false);

  const load = useCallback(() => {
    fetch("/api/documents/companies", { credentials: "include" })
      .then(r => r.json()).then(d => setCompanies(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k: keyof typeof empty, v: string) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.companyName.trim()) return toast.error("Company name is required");
    setSaving(true);
    try {
      const url = currentId ? `/api/documents/companies/${currentId}` : "/api/documents/companies";
      const method = currentId ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({
          companyName: form.companyName, registrationNumber: form.registrationNumber,
          companyType: form.companyType, registrationDate: form.registrationDate,
          status: form.status, directors: form.directors, address: form.address, financialYearEnd: form.financialYearEnd,
        }),
      });
      const d = await res.json();
      if (res.ok) {
        if (!currentId) setCurrentId(d.id);
        toast.success("Company saved");
        load();
        if (currentId) {
          const updated = await fetch(`/api/documents/companies/${currentId}`, { credentials: "include" });
          const co = await updated.json();
          setDetailCompany(co);
          setEditMode(false);
          setView("detail");
        } else {
          const created = await fetch(`/api/documents/companies/${d.id}`, { credentials: "include" });
          const co = await created.json();
          setCurrentId(d.id);
          setDetailCompany(co);
          setView("detail");
        }
      } else toast.error(d.error);
    } catch { toast.error("Network error"); }
    setSaving(false);
  };

  const verify = async (id: string) => {
    setVerifying(true);
    try {
      const res = await fetch(`/api/documents/companies/${id}/verify`, { method: "POST", credentials: "include" });
      const d = await res.json();
      if (res.ok) {
        if (d.verified) {
          toast.success("Verification passed — company details are consistent.");
        } else {
          toast.error("Verification found issues — review the details below.");
        }
        load();
        const updated = await fetch(`/api/documents/companies/${id}`, { credentials: "include" });
        const co = await updated.json();
        setDetailCompany(co);
      } else {
        toast.error(d.error);
      }
    } catch {
      toast.error("Verification failed — please try again.");
    }
    setVerifying(false);
  };

  const openEdit = (c: Company) => {
    setCurrentId(c.id);
    setForm({
      companyName: c.company_name, registrationNumber: c.registration_number || "",
      companyType: c.company_type || "", registrationDate: c.registration_date || "",
      status: c.status || "Active", directors: c.directors || "",
      address: c.address || "", financialYearEnd: c.financial_year_end || "",
    });
    setDetailCompany(c);
    setEditMode(true);
    setView("form");
  };

  const openDetail = async (id: string) => {
    const res = await fetch(`/api/documents/companies/${id}`, { credentials: "include" });
    const c = await res.json();
    setDetailCompany(c); setCurrentId(id); setEditMode(false); setView("detail");
  };

  const del = async (id: string) => {
    if (!confirm("Delete this company profile?")) return;
    await fetch(`/api/documents/companies/${id}`, { method: "DELETE", credentials: "include" });
    load(); toast.success("Deleted");
    if (currentId === id) setView("list");
  };

  const startNew = () => { setCurrentId(null); setForm(empty); setEditMode(false); setView("form"); };

  if (view === "list") return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading">Company Verification</h2>
          <p className="text-muted-foreground text-sm mt-1">Register and verify your business profiles for use across all documents</p>
        </div>
        <Button onClick={startNew} className="gradient-hero text-white gap-2"><Plus className="h-4 w-4" /> Add Company</Button>
      </div>

      {companies.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="font-semibold text-lg mb-2">No companies registered</p>
          <p className="text-muted-foreground text-sm mb-6">Add your company profile to use across Business Plans, Funding Proposals, and Applications</p>
          <Button onClick={startNew} className="gradient-hero text-white gap-2"><Plus className="h-4 w-4" /> Add Company</Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {companies.map(c => (
            <Card key={c.id} className="p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer" onClick={() => openDetail(c.id)}>
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${c.is_verified ? "bg-green-100" : "bg-muted"}`}>
                  {c.is_verified ? <BadgeCheck className="h-6 w-6 text-green-600" /> : <Building2 className="h-6 w-6 text-muted-foreground" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{c.company_name}</p>
                    {c.is_verified ? (
                      <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-medium">
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </span>
                    ) : c.verification_details ? (
                      <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 rounded-full px-2 py-0.5 font-medium">
                        <XCircle className="h-3 w-3" /> Verification Failed
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                    {c.registration_number && <span>Reg: {c.registration_number}</span>}
                    {c.company_type && <span>• {c.company_type}</span>}
                    <span className={`rounded-full px-1.5 py-0.5 ${c.status === "Active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{c.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                <Button variant="outline" size="sm" onClick={() => openEdit(c)} className="gap-1.5"><Edit className="h-3.5 w-3.5" /> Edit</Button>
                <Button variant="ghost" size="sm" onClick={() => del(c.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  if (view === "detail" && detailCompany) return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setView("list")} className="gap-1.5"><ChevronLeft className="h-4 w-4" /> Back</Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => openEdit(detailCompany)} className="gap-1.5"><Edit className="h-3.5 w-3.5" /> Edit</Button>
          {!detailCompany.is_verified && (
            <Button onClick={() => verify(detailCompany.id)} disabled={verifying} className="gradient-hero text-white gap-2">
              {verifying ? "Verifying..." : <><ShieldCheck className="h-4 w-4" /> {detailCompany.verification_details ? "Re-verify Company" : "Verify Company"}</>}
            </Button>
          )}
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-heading">{detailCompany.company_name}</h2>
            {detailCompany.is_verified ? (
              <div className="flex items-center gap-2 mt-2">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <span className="text-green-700 font-semibold text-sm">Verification Passed</span>
              </div>
            ) : detailCompany.verification_details ? (
              <div className="flex items-center gap-2 mt-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-600 font-semibold text-sm">Verification Failed</span>
              </div>
            ) : (
              <p className="text-amber-600 text-sm mt-1 flex items-center gap-1">
                <BadgeCheck className="h-4 w-4" /> Not yet verified — click "Verify Company" to run a check
              </p>
            )}
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${detailCompany.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {detailCompany.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {[
            { icon: Briefcase, label: "Registration Number", value: detailCompany.registration_number },
            { icon: Building2, label: "Company Type", value: detailCompany.company_type },
            { icon: Calendar, label: "Registration Date", value: detailCompany.registration_date },
            { icon: Clock, label: "Financial Year End", value: detailCompany.financial_year_end },
          ].filter(i => i.value).map(item => (
            <div key={item.label} className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium mt-0.5">{item.value}</p>
              </div>
            </div>
          ))}
          {detailCompany.directors && (
            <div className="col-span-2 flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Directors</p>
                <p className="text-sm font-medium mt-0.5 whitespace-pre-line">{detailCompany.directors}</p>
              </div>
            </div>
          )}
          {detailCompany.address && (
            <div className="col-span-2 flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Registered Address</p>
                <p className="text-sm font-medium mt-0.5 whitespace-pre-line">{detailCompany.address}</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {(() => {
        if (!detailCompany.verification_details) return null;
        let vd: VerificationDetails | null = null;
        try { vd = JSON.parse(detailCompany.verification_details); } catch { return null; }
        if (!vd) return null;
        return (
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              {vd.verified
                ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                : <XCircle className="h-5 w-5 text-red-500" />}
              <h3 className="font-semibold text-base">Verification Report</h3>
              <span className="text-xs text-muted-foreground ml-auto">
                {new Date(vd.verifiedAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{vd.summary}</p>

            {vd.checks.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Checks Passed</p>
                <ul className="space-y-1">
                  {vd.checks.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-green-800">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {vd.issues.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">Issues Found</p>
                <ul className="space-y-1">
                  {vd.issues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-800">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 p-3 text-xs text-blue-700">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{vd.disclaimer}</span>
            </div>
          </Card>
        );
      })()}
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setView(detailCompany ? "detail" : "list")} className="gap-1.5">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <h2 className="text-xl font-bold font-heading">{editMode ? "Edit Company" : "Add Company Profile"}</h2>
      </div>

      <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-sm">
        <p className="font-medium text-primary flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> CIPC Company Registration</p>
        <p className="text-muted-foreground mt-1">Enter your company's CIPC registration details. After saving, click "Verify Company" to run a format and consistency check against your details.</p>
      </div>

      <Card className="p-6 space-y-5">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Company Name *</Label>
              <Input value={form.companyName} onChange={e => set("companyName", e.target.value)} placeholder="My Business (Pty) Ltd" className="mt-1" />
            </div>
            <div>
              <Label>CIPC Registration Number</Label>
              <Input value={form.registrationNumber} onChange={e => set("registrationNumber", e.target.value)} placeholder="2024/123456/07" className="mt-1" />
            </div>
            <div>
              <Label>Company Type</Label>
              <select value={form.companyType} onChange={e => set("companyType", e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Select type...</option>
                {COMPANY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <Label>Registration Date</Label>
              <Input type="date" value={form.registrationDate} onChange={e => set("registrationDate", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Company Status</Label>
              <select value={form.status} onChange={e => set("status", e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <Label>Financial Year End</Label>
              <Input value={form.financialYearEnd} onChange={e => set("financialYearEnd", e.target.value)} placeholder="e.g. 28 February" className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label>Directors / Members</Label>
              <textarea value={form.directors} onChange={e => set("directors", e.target.value)} placeholder="List all directors and their ID numbers..." className="mt-1 w-full rounded-lg border bg-background p-3 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="col-span-2">
              <Label>Registered Address</Label>
              <textarea value={form.address} onChange={e => set("address", e.target.value)} placeholder="Physical registered address..." className="mt-1 w-full rounded-lg border bg-background p-3 text-sm min-h-[70px] resize-y focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => setView(detailCompany ? "detail" : "list")}>Cancel</Button>
        <Button onClick={save} disabled={saving} className="gradient-hero text-white min-w-[120px]">
          {saving ? "Saving..." : editMode ? "Save Changes" : "Save Company"}
        </Button>
      </div>
    </div>
  );
}
