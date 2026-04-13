import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { FileText, Plus, Trash2, ChevronLeft, ChevronRight, Sparkles, Loader2, Download, Edit, Eye, Building2 } from "lucide-react";

interface Company { id: string; company_name: string; registration_number: string; is_verified: number; }

interface FormData {
  companyId: string; businessName: string; registrationNumber: string; industry: string; founderName: string;
  businessDescription: string; problemSolved: string; targetMarket: string; competitors: string;
  productsDescription: string; pricingModel: string; revenueModel: string;
  teamMembers: string; location: string; operationalStructure: string;
  marketingStrategy: string; customerChannels: string;
  startupCosts: string; projectionYear1: string; projectionYear2: string; projectionYear3: string;
}

interface Plan { id: string; title: string; status: string; created_at: string; updated_at: string; }
interface GeneratedContent {
  executiveSummary: string; companyOverview: string; marketAnalysis: string;
  productsServices: string; operationsPlan: string; marketingStrategy: string;
  financialPlan: string; fundingRequirements: string;
}

const STEPS = ["Business Overview", "Market Analysis", "Products & Services", "Operations", "Marketing", "Financials"];
const SECTIONS = [
  { key: "executiveSummary", label: "1. Executive Summary" },
  { key: "companyOverview", label: "2. Company Overview" },
  { key: "marketAnalysis", label: "3. Market Analysis" },
  { key: "productsServices", label: "4. Products & Services" },
  { key: "operationsPlan", label: "5. Operations Plan" },
  { key: "marketingStrategy", label: "6. Marketing Strategy" },
  { key: "financialPlan", label: "7. Financial Plan" },
  { key: "fundingRequirements", label: "8. Funding Requirements" },
];

const empty: FormData = {
  companyId: "", businessName: "", registrationNumber: "", industry: "", founderName: "",
  businessDescription: "", problemSolved: "", targetMarket: "", competitors: "",
  productsDescription: "", pricingModel: "", revenueModel: "",
  teamMembers: "", location: "", operationalStructure: "",
  marketingStrategy: "", customerChannels: "",
  startupCosts: "", projectionYear1: "", projectionYear2: "", projectionYear3: "",
};

const INDUSTRIES = ["Technology", "Retail", "Agriculture", "Manufacturing", "Construction", "Professional Services", "Healthcare", "Education", "Food & Beverage", "Transport & Logistics", "Tourism & Hospitality", "Finance & Insurance", "Media & Creative", "Other"];

function flattenSection(val: any): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val.map(flattenSection).join("\n\n");
  if (typeof val === "object") return Object.values(val).map(flattenSection).join("\n\n");
  return String(val);
}

export default function BusinessPlanPage() {
  const [view, setView] = useState<"list" | "form" | "document">("list");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(empty);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [loadingDoc, setLoadingDoc] = useState(false);

  const loadPlans = useCallback(() => {
    fetch("/api/documents/business-plans", { credentials: "include" })
      .then(r => r.json()).then(d => setPlans(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => { loadPlans(); }, [loadPlans]);
  useEffect(() => {
    fetch("/api/documents/companies", { credentials: "include" })
      .then(r => r.json()).then(d => setCompanies(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }));

  const onCompanySelect = (id: string) => {
    set("companyId", id);
    const c = companies.find(co => co.id === id);
    if (c) {
      set("businessName", c.company_name);
      set("registrationNumber", c.registration_number || "");
    }
  };

  const startNew = async () => {
    const res = await fetch("/api/documents/business-plans", {
      method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
      body: JSON.stringify({ title: "New Business Plan", formData: empty }),
    });
    const d = await res.json();
    if (res.ok) { setCurrentId(d.id); setForm(empty); setStep(0); setGenerated(null); setView("form"); }
    else toast.error(d.error);
  };

  const openExisting = async (id: string) => {
    setLoadingDoc(true);
    const res = await fetch(`/api/documents/business-plans/${id}`, { credentials: "include" });
    const d = await res.json();
    setLoadingDoc(false);
    if (res.ok) {
      setCurrentId(id); setForm({ ...empty, ...(d.form_data || {}) }); setGenerated(d.generated_content || null);
      setStep(0); setView(d.status === "generated" ? "document" : "form");
    } else toast.error("Failed to load");
  };

  const saveProgress = useCallback(async (fd: FormData) => {
    if (!currentId) return;
    setSaving(true);
    await fetch(`/api/documents/business-plans/${currentId}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
      body: JSON.stringify({ title: fd.businessName || "Business Plan", formData: fd }),
    });
    setSaving(false);
  }, [currentId]);

  const goNext = async () => { await saveProgress(form); if (step < STEPS.length - 1) setStep(s => s + 1); };
  const goPrev = () => setStep(s => s - 1);

  const generate = async () => {
    await saveProgress(form);
    setGenerating(true);
    try {
      const res = await fetch(`/api/documents/business-plans/${currentId}/generate`, { method: "POST", credentials: "include" });
      const d = await res.json();
      if (res.ok) { setGenerated(d.content); setView("document"); loadPlans(); toast.success("Business plan generated!"); }
      else toast.error(d.error || "Generation failed");
    } catch { toast.error("Network error"); }
    setGenerating(false);
  };

  const deletePlan = async (id: string) => {
    if (!confirm("Delete this business plan?")) return;
    await fetch(`/api/documents/business-plans/${id}`, { method: "DELETE", credentials: "include" });
    loadPlans(); toast.success("Deleted");
  };

  const downloadPDF = () => {
    if (!currentId) return;
    const a = document.createElement("a");
    a.href = `/api/documents/business-plans/${currentId}/pdf`;
    a.download = "";
    a.click();
  };

  if (view === "list") return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading">Business Plan Builder</h2>
          <p className="text-muted-foreground text-sm mt-1">Create AI-powered business plans for your SMME</p>
        </div>
        <Button onClick={startNew} className="gradient-hero text-white gap-2"><Plus className="h-4 w-4" /> New Business Plan</Button>
      </div>
      {plans.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="font-semibold text-lg mb-2">No business plans yet</p>
          <p className="text-muted-foreground text-sm mb-6">Create your first AI-generated business plan in minutes</p>
          <Button onClick={startNew} className="gradient-hero text-white gap-2"><Plus className="h-4 w-4" /> Get Started</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {plans.map(p => (
            <Card key={p.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{p.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-xs rounded-full px-2 py-0.5 ${p.status === "generated" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{p.status === "generated" ? "Generated" : "Draft"}</span>
                  <span className="text-xs text-muted-foreground">{new Date(p.updated_at).toLocaleDateString("en-ZA")}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openExisting(p.id)} disabled={loadingDoc} className="gap-1.5">
                  {p.status === "generated" ? <Eye className="h-3.5 w-3.5" /> : <Edit className="h-3.5 w-3.5" />}
                  {p.status === "generated" ? "View" : "Edit"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deletePlan(p.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></Button>
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
        <Button variant="ghost" size="sm" onClick={() => setView("list")} className="gap-1.5"><ChevronLeft className="h-4 w-4" /> Back to plans</Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setStep(0); setView("form"); }} className="gap-1.5"><Edit className="h-3.5 w-3.5" /> Edit</Button>
          <Button onClick={downloadPDF} className="gradient-hero text-white gap-2"><Download className="h-4 w-4" /> Download PDF</Button>
        </div>
      </div>
      <Card className="p-8">
        <div className="text-center pb-8 mb-8 border-b-2 border-primary/20">
          <h1 className="text-3xl font-bold font-heading text-primary">{form.businessName || "Business Plan"}</h1>
          {form.founderName && <p className="text-muted-foreground mt-2">{form.founderName}</p>}
          {form.industry && <p className="text-sm text-muted-foreground">{form.industry}</p>}
          <p className="text-xs text-muted-foreground mt-3">{new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <div className="space-y-8">
          {SECTIONS.map(s => (
            <div key={s.key} className="space-y-3">
              <h2 className="text-lg font-bold font-heading text-primary border-b border-primary/20 pb-2">{s.label}</h2>
              <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{flattenSection((generated as any)[s.key])}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => view === "form" && step === 0 ? setView("list") : goPrev()} disabled={generating} className="gap-1.5">
          <ChevronLeft className="h-4 w-4" /> {step === 0 ? "Back" : "Previous"}
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-bold font-heading">Business Plan Builder</h2>
          <p className="text-xs text-muted-foreground">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
        </div>
        {saving && <span className="text-xs text-muted-foreground">Saving...</span>}
      </div>

      <div className="flex gap-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1">
            <div className={`h-1.5 rounded-full transition-colors ${i < step ? "bg-primary" : i === step ? "bg-primary" : "bg-muted"}`} />
            <p className={`text-[9px] mt-1 text-center truncate ${i === step ? "text-primary font-semibold" : "text-muted-foreground"}`}>{s}</p>
          </div>
        ))}
      </div>

      <Card className="p-6 space-y-4">
        {step === 0 && <>
          <h3 className="font-semibold">Business Overview</h3>
          {companies.length > 0 && (
            <div>
              <Label>Select Verified Company (optional)</Label>
              <select value={form.companyId} onChange={e => onCompanySelect(e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">— Enter details manually —</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.company_name}{c.is_verified ? " ✓" : ""}</option>)}
              </select>
              {form.companyId && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><Building2 className="h-3 w-3" /> Company details pre-filled from your profile</p>}
            </div>
          )}
          <div><Label>Business Name *</Label><Input value={form.businessName} onChange={e => set("businessName", e.target.value)} placeholder="My Business (Pty) Ltd" className="mt-1" /></div>
          <div><Label>Registration Number</Label><Input value={form.registrationNumber} onChange={e => set("registrationNumber", e.target.value)} placeholder="2024/123456/07" className="mt-1" /></div>
          <div>
            <Label>Industry</Label>
            <select value={form.industry} onChange={e => set("industry", e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Select industry...</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div><Label>Founder / Owner Name</Label><Input value={form.founderName} onChange={e => set("founderName", e.target.value)} placeholder="Full name" className="mt-1" /></div>
          <div><Label>Business Description *</Label><textarea value={form.businessDescription} onChange={e => set("businessDescription", e.target.value)} placeholder="Describe what your business does..." className="mt-1 w-full rounded-lg border bg-background p-3 text-sm min-h-[90px] resize-y focus:outline-none focus:ring-2 focus:ring-primary" /></div>
        </>}

        {step === 1 && <>
          <h3 className="font-semibold">Market Analysis</h3>
          <div><Label>Problem Being Solved *</Label><textarea value={form.problemSolved} onChange={e => set("problemSolved", e.target.value)} placeholder="What problem does your business address?" className="mt-1 w-full rounded-lg border bg-background p-3 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          <div><Label>Target Market</Label><textarea value={form.targetMarket} onChange={e => set("targetMarket", e.target.value)} placeholder="Who are your customers? Demographics, location..." className="mt-1 w-full rounded-lg border bg-background p-3 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          <div><Label>Key Competitors</Label><textarea value={form.competitors} onChange={e => set("competitors", e.target.value)} placeholder="Who are your main competitors and how do you differ?" className="mt-1 w-full rounded-lg border bg-background p-3 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-primary" /></div>
        </>}

        {step === 2 && <>
          <h3 className="font-semibold">Products & Services</h3>
          <div><Label>Products / Services Description *</Label><textarea value={form.productsDescription} onChange={e => set("productsDescription", e.target.value)} placeholder="Describe your main products or services in detail..." className="mt-1 w-full rounded-lg border bg-background p-3 text-sm min-h-[90px] resize-y focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          <div><Label>Pricing Model</Label><textarea value={form.pricingModel} onChange={e => set("pricingModel", e.target.value)} placeholder="How do you price your products/services?" className="mt-1 w-full rounded-lg border bg-background p-3 text-sm min-h-[70px] resize-y focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          <div><Label>Revenue Model</Label><textarea value={form.revenueModel} onChange={e => set("revenueModel", e.target.value)} placeholder="Subscriptions, one-time sales, commission..." className="mt-1 w-full rounded-lg border bg-background p-3 text-sm min-h-[70px] resize-y focus:outline-none focus:ring-2 focus:ring-primary" /></div>
        </>}

        {step === 3 && <>
          <h3 className="font-semibold">Operations</h3>
          <div><Label>Team Members</Label><textarea value={form.teamMembers} onChange={e => set("teamMembers", e.target.value)} placeholder="Key team members, roles, and relevant experience..." className="mt-1 w-full rounded-lg border bg-background p-3 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          <div><Label>Business Location</Label><Input value={form.location} onChange={e => set("location", e.target.value)} placeholder="City, Province" className="mt-1" /></div>
          <div><Label>Operational Structure</Label><textarea value={form.operationalStructure} onChange={e => set("operationalStructure", e.target.value)} placeholder="Day-to-day operations, suppliers, facilities, equipment..." className="mt-1 w-full rounded-lg border bg-background p-3 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-primary" /></div>
        </>}

        {step === 4 && <>
          <h3 className="font-semibold">Marketing Strategy</h3>
          <div><Label>Marketing Strategy</Label><textarea value={form.marketingStrategy} onChange={e => set("marketingStrategy", e.target.value)} placeholder="How will you attract and retain customers?" className="mt-1 w-full rounded-lg border bg-background p-3 text-sm min-h-[90px] resize-y focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          <div><Label>Customer Acquisition Channels</Label><textarea value={form.customerChannels} onChange={e => set("customerChannels", e.target.value)} placeholder="Social media, referrals, cold outreach, advertising..." className="mt-1 w-full rounded-lg border bg-background p-3 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-primary" /></div>
        </>}

        {step === 5 && <>
          <h3 className="font-semibold">Financial Projections</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Label>Startup / Capital Costs (R)</Label><Input type="number" value={form.startupCosts} onChange={e => set("startupCosts", e.target.value)} placeholder="e.g. 250000" className="mt-1" /></div>
            <div><Label>Year 1 Revenue Projection (R)</Label><Input type="number" value={form.projectionYear1} onChange={e => set("projectionYear1", e.target.value)} placeholder="e.g. 1200000" className="mt-1" /></div>
            <div><Label>Year 2 Revenue Projection (R)</Label><Input type="number" value={form.projectionYear2} onChange={e => set("projectionYear2", e.target.value)} placeholder="e.g. 2500000" className="mt-1" /></div>
            <div className="col-span-2"><Label>Year 3 Revenue Projection (R)</Label><Input type="number" value={form.projectionYear3} onChange={e => set("projectionYear3", e.target.value)} placeholder="e.g. 5000000" className="mt-1" /></div>
          </div>
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
            <p className="text-sm font-medium text-primary flex items-center gap-2"><Sparkles className="h-4 w-4" /> Ready to generate</p>
            <p className="text-xs text-muted-foreground mt-1">AI will create an 8-section professional business plan from your inputs. Takes 20–30 seconds.</p>
          </div>
        </>}
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => step === 0 ? setView("list") : goPrev()} disabled={generating} className="gap-1.5">
          <ChevronLeft className="h-4 w-4" /> {step === 0 ? "Cancel" : "Previous"}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={goNext} className="gradient-hero text-white gap-1.5">Next <ChevronRight className="h-4 w-4" /></Button>
        ) : (
          <Button onClick={generate} disabled={generating || !form.businessName.trim()} className="gradient-hero text-white gap-2">
            {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Business Plan</>}
          </Button>
        )}
      </div>
    </div>
  );
}
