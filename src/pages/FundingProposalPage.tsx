import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { HandCoins, Plus, Trash2, ChevronLeft, ChevronRight, Sparkles, Loader2, Download, Edit, Eye, Building2 } from "lucide-react";

interface Company { id: string; company_name: string; registration_number: string; is_verified: number; }

interface FormData {
  companyId: string; businessName: string; ownerName: string; fundingAmount: string;
  purposeOfFunding: string; expectedImpact: string; businessStage: string;
  jobsToCreate: string; monthlyRevenue: string; monthlyExpenses: string;
  growthPlan: string; governmentProgram: string;
}

interface Proposal { id: string; title: string; status: string; created_at: string; updated_at: string; }
interface GeneratedContent {
  coverPage: string; executiveSummary: string; businessOverview: string;
  problemOpportunity: string; fundingRequest: string; useOfFunds: string;
  economicImpact: string; financialSummary: string; closingStatement: string;
}

const STEPS = ["Business & Owner", "Funding Details", "Financial Summary"];
const SECTIONS = [
  { key: "coverPage", label: "1. Cover Page" },
  { key: "executiveSummary", label: "2. Executive Summary" },
  { key: "businessOverview", label: "3. Business Overview" },
  { key: "problemOpportunity", label: "4. Problem & Opportunity" },
  { key: "fundingRequest", label: "5. Funding Request" },
  { key: "useOfFunds", label: "6. Use of Funds" },
  { key: "economicImpact", label: "7. Economic Impact" },
  { key: "financialSummary", label: "8. Financial Summary" },
  { key: "closingStatement", label: "9. Closing Statement" },
];

const BUSINESS_STAGES = ["Startup (0-2 years)", "Growth (2-5 years)", "Expansion (5+ years)"];
const GOV_PROGRAMS = ["SEFA", "IDC", "NEF", "SEDA", "NYDA", "DTI/dtic", "NSFAS", "Other"];

const empty: FormData = {
  companyId: "", businessName: "", ownerName: "", fundingAmount: "", purposeOfFunding: "",
  expectedImpact: "", businessStage: "", jobsToCreate: "", monthlyRevenue: "",
  monthlyExpenses: "", growthPlan: "", governmentProgram: "",
};

export default function FundingProposalPage() {
  const [view, setView] = useState<"list" | "form" | "document">("list");
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(empty);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [loadingDoc, setLoadingDoc] = useState(false);

  const loadProposals = useCallback(() => {
    fetch("/api/documents/funding-proposals", { credentials: "include" })
      .then(r => r.json()).then(d => setProposals(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => {
    loadProposals();
    fetch("/api/documents/companies", { credentials: "include" })
      .then(r => r.json()).then(d => setCompanies(Array.isArray(d) ? d : [])).catch(() => {});
  }, [loadProposals]);

  const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }));

  const onCompanySelect = (id: string) => {
    set("companyId", id);
    const c = companies.find(co => co.id === id);
    if (c) set("businessName", c.company_name);
  };

  const startNew = async () => {
    const res = await fetch("/api/documents/funding-proposals", {
      method: "POST", headers: { "Content-Type": "application/json" },
      credentials: "include", body: JSON.stringify({ title: "New Funding Proposal", formData: empty }),
    });
    const d = await res.json();
    if (res.ok) { setCurrentId(d.id); setForm(empty); setStep(0); setGenerated(null); setView("form"); }
    else toast.error(d.error);
  };

  const openExisting = async (id: string) => {
    setLoadingDoc(true);
    const res = await fetch(`/api/documents/funding-proposals/${id}`, { credentials: "include" });
    const d = await res.json();
    setLoadingDoc(false);
    if (res.ok) {
      setCurrentId(id); setForm(d.form_data || empty); setGenerated(d.generated_content || null);
      setStep(0); setView(d.status === "generated" ? "document" : "form");
    } else toast.error("Failed to load");
  };

  const saveProgress = useCallback(async (fd: FormData) => {
    if (!currentId) return;
    setSaving(true);
    await fetch(`/api/documents/funding-proposals/${currentId}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title: `${fd.businessName || "Funding Proposal"} - ${fd.governmentProgram || "Proposal"}`, formData: fd }),
    });
    setSaving(false);
  }, [currentId]);

  const goNext = async () => { await saveProgress(form); if (step < STEPS.length - 1) setStep(s => s + 1); };

  const generate = async () => {
    await saveProgress(form);
    setGenerating(true);
    try {
      const res = await fetch(`/api/documents/funding-proposals/${currentId}/generate`, { method: "POST", credentials: "include" });
      const d = await res.json();
      if (res.ok) { setGenerated(d.content); setView("document"); loadProposals(); toast.success("Funding proposal generated!"); }
      else toast.error(d.error || "Generation failed");
    } catch { toast.error("Network error"); }
    setGenerating(false);
  };

  const deleteProposal = async (id: string) => {
    if (!confirm("Delete this funding proposal?")) return;
    await fetch(`/api/documents/funding-proposals/${id}`, { method: "DELETE", credentials: "include" });
    loadProposals(); toast.success("Deleted");
  };

  const formatR = (v: string) => v ? `R${Number(v).toLocaleString("en-ZA")}` : "R0";

  const printPDF = () => {
    const win = window.open("", "_blank");
    if (!win || !generated) return;
    win.document.write(`<!DOCTYPE html><html><head><title>${form.businessName || "Funding Proposal"}</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: Georgia, serif; font-size: 12pt; color: #1a1a1a; line-height: 1.7; padding: 60px; max-width: 800px; margin: 0 auto; }
      h1 { font-size: 26pt; color: #14684b; margin-bottom: 8px; }
      h2 { font-size: 15pt; color: #14684b; margin-top: 36px; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #14684b; }
      .cover { text-align: center; padding: 80px 0; border-bottom: 3px solid #14684b; margin-bottom: 48px; }
      .cover .amount { font-size: 24pt; color: #e8b931; font-weight: bold; margin: 16px 0; }
      .cover p { color: #555; font-size: 13pt; margin: 6px 0; }
      p { margin-bottom: 12px; text-align: justify; }
      .section { margin-bottom: 32px; page-break-inside: avoid; }
      @media print { body { padding: 40px; } }
    </style></head><body>
    <div class="cover">
      <h1>${form.businessName || "Funding Proposal"}</h1>
      <div class="amount">${formatR(form.fundingAmount)}</div>
      <p><strong>Owner:</strong> ${form.ownerName || ""}</p>
      <p><strong>Programme:</strong> ${form.governmentProgram || ""}</p>
      <p><strong>Stage:</strong> ${form.businessStage || ""}</p>
      <p style="margin-top:24px;color:#888;">${new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}</p>
    </div>
    ${SECTIONS.map(s => `<div class="section"><h2>${s.label}</h2>${((generated as any)[s.key] || "").split("\n").map((p: string) => p.trim() ? `<p>${p}</p>` : "").join("")}</div>`).join("")}
    </body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  if (view === "list") return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading">Funding Proposal Builder</h2>
          <p className="text-muted-foreground text-sm mt-1">Generate professional funding proposals for SEFA, IDC, NEF and other programmes</p>
        </div>
        <Button onClick={startNew} className="gradient-hero text-white gap-2">
          <Plus className="h-4 w-4" /> New Proposal
        </Button>
      </div>

      {proposals.length === 0 ? (
        <Card className="p-12 text-center">
          <HandCoins className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="font-semibold text-lg mb-2">No funding proposals yet</p>
          <p className="text-muted-foreground text-sm mb-6">Create a compelling AI-written funding proposal for your SMME</p>
          <Button onClick={startNew} className="gradient-hero text-white gap-2"><Plus className="h-4 w-4" /> Create Proposal</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {proposals.map(p => (
            <Card key={p.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{p.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-xs rounded-full px-2 py-0.5 ${p.status === "generated" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {p.status === "generated" ? "Generated" : "Draft"}
                  </span>
                  <span className="text-xs text-muted-foreground">{new Date(p.updated_at).toLocaleDateString("en-ZA")}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openExisting(p.id)} disabled={loadingDoc} className="gap-1.5">
                  {p.status === "generated" ? <Eye className="h-3.5 w-3.5" /> : <Edit className="h-3.5 w-3.5" />}
                  {p.status === "generated" ? "View" : "Edit"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteProposal(p.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  if (view === "document" && generated) return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setView("list")} className="gap-1.5">
          <ChevronLeft className="h-4 w-4" /> Back to proposals
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setView("form")} className="gap-1.5">
            <Edit className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button onClick={printPDF} className="gradient-hero text-white gap-2">
            <Download className="h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      <Card className="p-8">
        <div className="text-center pb-8 mb-8 border-b-2 border-primary/20">
          <h1 className="text-3xl font-bold font-heading text-primary">{form.businessName || "Funding Proposal"}</h1>
          <p className="text-2xl font-bold text-amber-600 mt-3">{formatR(form.fundingAmount)}</p>
          {form.ownerName && <p className="text-muted-foreground mt-2">{form.ownerName}</p>}
          <div className="flex items-center justify-center gap-4 mt-3 text-sm text-muted-foreground">
            {form.governmentProgram && <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">{form.governmentProgram}</span>}
            {form.businessStage && <span>{form.businessStage}</span>}
          </div>
          <p className="text-xs text-muted-foreground mt-3">{new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <div className="space-y-8">
          {SECTIONS.map(s => (
            <div key={s.key} className="space-y-3">
              <h2 className="text-lg font-bold font-heading text-primary border-b border-primary/20 pb-2">{s.label}</h2>
              <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {(generated as any)[s.key] || ""}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setView("list")} className="gap-1.5">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <div>
          <h2 className="text-xl font-bold font-heading">Funding Proposal Builder</h2>
          <p className="text-xs text-muted-foreground">Step {step + 1} of {STEPS.length}</p>
        </div>
        {saving && <span className="ml-auto text-xs text-muted-foreground">Saving...</span>}
      </div>

      <div className="flex gap-1.5">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1">
            <div className={`h-1.5 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
            <p className={`text-[10px] mt-1 text-center ${i === step ? "text-primary font-semibold" : "text-muted-foreground"}`}>{s}</p>
          </div>
        ))}
      </div>

      <Card className="p-6 space-y-5">
        {step === 0 && <>
          <h3 className="font-semibold text-base">Business & Owner Information</h3>
          <div className="space-y-4">
            {companies.length > 0 && (
              <div>
                <Label>Link Company Profile (optional)</Label>
                <select value={form.companyId} onChange={e => onCompanySelect(e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">— Enter details manually —</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.company_name}{c.is_verified ? " ✓" : ""}</option>)}
                </select>
                {form.companyId && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><Building2 className="h-3 w-3" /> Business name pre-filled from your company profile</p>}
              </div>
            )}
            <div><Label>Business Name *</Label><Input value={form.businessName} onChange={e => set("businessName", e.target.value)} placeholder="My Business (Pty) Ltd" className="mt-1" /></div>
            <div><Label>Owner / Director Name</Label><Input value={form.ownerName} onChange={e => set("ownerName", e.target.value)} placeholder="Full name" className="mt-1" /></div>
            <div>
              <Label>Business Stage</Label>
              <select value={form.businessStage} onChange={e => set("businessStage", e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Select stage...</option>
                {BUSINESS_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <Label>Government Programme Applying For</Label>
              <select value={form.governmentProgram} onChange={e => set("governmentProgram", e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Select programme...</option>
                {GOV_PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </>}

        {step === 1 && <>
          <h3 className="font-semibold text-base">Funding Details & Impact</h3>
          <div className="space-y-4">
            <div><Label>Funding Amount Requested (R) *</Label><Input type="number" value={form.fundingAmount} onChange={e => set("fundingAmount", e.target.value)} placeholder="e.g. 500000" className="mt-1" /></div>
            <div><Label>Purpose of Funding *</Label><textarea value={form.purposeOfFunding} onChange={e => set("purposeOfFunding", e.target.value)} placeholder="What will the funds be used for specifically?" className="mt-1 w-full rounded-lg border bg-background p-3 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><Label>Expected Impact</Label><textarea value={form.expectedImpact} onChange={e => set("expectedImpact", e.target.value)} placeholder="What outcomes will this funding enable?" className="mt-1 w-full rounded-lg border bg-background p-3 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><Label>Jobs to be Created</Label><Input type="number" value={form.jobsToCreate} onChange={e => set("jobsToCreate", e.target.value)} placeholder="e.g. 5" className="mt-1" /></div>
            <div><Label>Growth Plan</Label><textarea value={form.growthPlan} onChange={e => set("growthPlan", e.target.value)} placeholder="How will this funding help you grow?" className="mt-1 w-full rounded-lg border bg-background p-3 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          </div>
        </>}

        {step === 2 && <>
          <h3 className="font-semibold text-base">Financial Summary</h3>
          <div className="space-y-4">
            <div><Label>Monthly Revenue (R)</Label><Input type="number" value={form.monthlyRevenue} onChange={e => set("monthlyRevenue", e.target.value)} placeholder="e.g. 85000" className="mt-1" /></div>
            <div><Label>Monthly Expenses (R)</Label><Input type="number" value={form.monthlyExpenses} onChange={e => set("monthlyExpenses", e.target.value)} placeholder="e.g. 60000" className="mt-1" /></div>
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
              <p className="text-sm font-medium text-primary flex items-center gap-2"><Sparkles className="h-4 w-4" /> Ready to generate</p>
              <p className="text-xs text-muted-foreground mt-1">Your proposal will be professionally written for the selected government programme. Takes 20–30 seconds.</p>
            </div>
          </div>
        </>}
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => step > 0 ? setStep(s => s - 1) : setView("list")} disabled={generating} className="gap-1.5">
          <ChevronLeft className="h-4 w-4" /> {step > 0 ? "Previous" : "Cancel"}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={goNext} className="gradient-hero text-white gap-1.5">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={generate} disabled={generating || !form.businessName.trim() || !form.fundingAmount.trim()} className="gradient-hero text-white gap-2">
            {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Proposal</>}
          </Button>
        )}
      </div>
    </div>
  );
}
