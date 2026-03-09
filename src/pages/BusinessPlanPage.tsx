import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { FileText, Plus, Trash2, ChevronLeft, ChevronRight, Sparkles, Loader2, Download, Edit, Eye } from "lucide-react";

interface FormData {
  businessName: string; registrationNumber: string; industry: string; founderName: string;
  businessDescription: string; problemSolved: string; targetMarket: string;
  productsServices: string; revenueModel: string; competitors: string;
  marketingStrategy: string; operationsPlan: string; teamMembers: string;
  fundingRequired: string; projectionYear1: string; projectionYear2: string; projectionYear3: string;
}

interface Plan { id: string; title: string; status: string; created_at: string; updated_at: string; }
interface GeneratedContent {
  executiveSummary: string; companyOverview: string; marketAnalysis: string;
  productsServices: string; marketingStrategy: string; operationsPlan: string;
  financialPlan: string; fundingRequirements: string;
}

const STEPS = ["Business Info", "Market & Products", "Operations & Team", "Financials"];
const SECTIONS = [
  { key: "executiveSummary", label: "1. Executive Summary" },
  { key: "companyOverview", label: "2. Company Overview" },
  { key: "marketAnalysis", label: "3. Market Analysis" },
  { key: "productsServices", label: "4. Products & Services" },
  { key: "marketingStrategy", label: "5. Marketing Strategy" },
  { key: "operationsPlan", label: "6. Operations Plan" },
  { key: "financialPlan", label: "7. Financial Plan" },
  { key: "fundingRequirements", label: "8. Funding Requirements" },
];

const empty: FormData = {
  businessName: "", registrationNumber: "", industry: "", founderName: "",
  businessDescription: "", problemSolved: "", targetMarket: "", productsServices: "",
  revenueModel: "", competitors: "", marketingStrategy: "", operationsPlan: "",
  teamMembers: "", fundingRequired: "", projectionYear1: "", projectionYear2: "", projectionYear3: "",
};

export default function BusinessPlanPage() {
  const [view, setView] = useState<"list" | "form" | "document">("list");
  const [plans, setPlans] = useState<Plan[]>([]);
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

  const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }));

  const startNew = async () => {
    const res = await fetch("/api/documents/business-plans", {
      method: "POST", headers: { "Content-Type": "application/json" },
      credentials: "include", body: JSON.stringify({ title: "New Business Plan", formData: empty }),
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
      setCurrentId(id); setForm(d.form_data || empty); setGenerated(d.generated_content || null);
      setStep(0); setView(d.status === "generated" ? "document" : "form");
    } else toast.error("Failed to load");
  };

  const saveProgress = useCallback(async (fd: FormData) => {
    if (!currentId) return;
    setSaving(true);
    await fetch(`/api/documents/business-plans/${currentId}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title: fd.businessName || "Business Plan", formData: fd }),
    });
    setSaving(false);
  }, [currentId]);

  const goNext = async () => {
    await saveProgress(form);
    if (step < STEPS.length - 1) setStep(s => s + 1);
  };

  const generate = async () => {
    await saveProgress(form);
    setGenerating(true);
    try {
      const res = await fetch(`/api/documents/business-plans/${currentId}/generate`, {
        method: "POST", credentials: "include",
      });
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

  const printPDF = () => {
    const win = window.open("", "_blank");
    if (!win || !generated) return;
    const fd = form;
    win.document.write(`<!DOCTYPE html><html><head><title>${fd.businessName || "Business Plan"}</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: Georgia, serif; font-size: 12pt; color: #1a1a1a; line-height: 1.7; padding: 60px; max-width: 800px; margin: 0 auto; }
      h1 { font-size: 28pt; color: #14684b; margin-bottom: 8px; }
      h2 { font-size: 16pt; color: #14684b; margin-top: 36px; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #14684b; }
      .cover { text-align: center; padding: 80px 0; border-bottom: 3px solid #14684b; margin-bottom: 48px; }
      .cover p { color: #555; font-size: 13pt; margin: 6px 0; }
      p { margin-bottom: 12px; text-align: justify; }
      .section { margin-bottom: 32px; page-break-inside: avoid; }
      @media print { body { padding: 40px; } }
    </style></head><body>
    <div class="cover">
      <h1>${fd.businessName || "Business Plan"}</h1>
      <p><strong>Owner:</strong> ${fd.founderName || ""}</p>
      <p><strong>Industry:</strong> ${fd.industry || ""}</p>
      <p><strong>Reg No:</strong> ${fd.registrationNumber || ""}</p>
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
          <h2 className="text-2xl font-bold font-heading">Business Plan Builder</h2>
          <p className="text-muted-foreground text-sm mt-1">Create AI-powered business plans for your SMME</p>
        </div>
        <Button onClick={startNew} className="gradient-hero text-white gap-2">
          <Plus className="h-4 w-4" /> New Business Plan
        </Button>
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
                <Button variant="ghost" size="sm" onClick={() => deletePlan(p.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
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
          <ChevronLeft className="h-4 w-4" /> Back to plans
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setView("form")} className="gap-1.5">
            <Edit className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button onClick={printPDF} className="gradient-hero text-white gap-2">
            <Download className="h-4 w-4" /> Download PDF
          </Button>
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
          <h2 className="text-xl font-bold font-heading">Business Plan Builder</h2>
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
          <h3 className="font-semibold text-base">Business Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Label>Business Name *</Label><Input value={form.businessName} onChange={e => set("businessName", e.target.value)} placeholder="My Business (Pty) Ltd" className="mt-1" /></div>
            <div><Label>Registration Number</Label><Input value={form.registrationNumber} onChange={e => set("registrationNumber", e.target.value)} placeholder="2024/123456/07" className="mt-1" /></div>
            <div><Label>Industry</Label><Input value={form.industry} onChange={e => set("industry", e.target.value)} placeholder="e.g. Retail, Technology" className="mt-1" /></div>
            <div className="col-span-2"><Label>Founder / Owner Name</Label><Input value={form.founderName} onChange={e => set("founderName", e.target.value)} placeholder="Full name" className="mt-1" /></div>
            <div className="col-span-2"><Label>Business Description *</Label><textarea value={form.businessDescription} onChange={e => set("businessDescription", e.target.value)} placeholder="Describe what your business does..." className="mt-1 w-full rounded-lg border bg-background p-3 text-sm min-h-[90px] resize-y focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div className="col-span-2"><Label>Problem Your Business Solves</Label><textarea value={form.problemSolved} onChange={e => set("problemSolved", e.target.value)} placeholder="What problem does your business address?" className="mt-1 w-full rounded-lg border bg-background p-3 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          </div>
        </>}

        {step === 1 && <>
          <h3 className="font-semibold text-base">Market & Products</h3>
          <div className="space-y-4">
            <div><Label>Target Market</Label><textarea value={form.targetMarket} onChange={e => set("targetMarket", e.target.value)} placeholder="Who are your customers? Demographics, location, size..." className="mt-1 w-full rounded-lg border bg-background p-3 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><Label>Products / Services *</Label><textarea value={form.productsServices} onChange={e => set("productsServices", e.target.value)} placeholder="List your main products or services..." className="mt-1 w-full rounded-lg border bg-background p-3 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><Label>Revenue Model</Label><textarea value={form.revenueModel} onChange={e => set("revenueModel", e.target.value)} placeholder="How do you make money? Subscriptions, one-time sales, commission..." className="mt-1 w-full rounded-lg border bg-background p-3 text-sm min-h-[70px] resize-y focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><Label>Main Competitors</Label><textarea value={form.competitors} onChange={e => set("competitors", e.target.value)} placeholder="Who are your main competitors and how do you differ?" className="mt-1 w-full rounded-lg border bg-background p-3 text-sm min-h-[70px] resize-y focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          </div>
        </>}

        {step === 2 && <>
          <h3 className="font-semibold text-base">Operations & Team</h3>
          <div className="space-y-4">
            <div><Label>Marketing Strategy</Label><textarea value={form.marketingStrategy} onChange={e => set("marketingStrategy", e.target.value)} placeholder="How will you reach and retain customers?" className="mt-1 w-full rounded-lg border bg-background p-3 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><Label>Operations Plan</Label><textarea value={form.operationsPlan} onChange={e => set("operationsPlan", e.target.value)} placeholder="Day-to-day operations, location, suppliers, equipment..." className="mt-1 w-full rounded-lg border bg-background p-3 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><Label>Team Members</Label><textarea value={form.teamMembers} onChange={e => set("teamMembers", e.target.value)} placeholder="Key team members, roles, and relevant experience..." className="mt-1 w-full rounded-lg border bg-background p-3 text-sm min-h-[70px] resize-y focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          </div>
        </>}

        {step === 3 && <>
          <h3 className="font-semibold text-base">Financial Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Label>Funding Required (R)</Label><Input type="number" value={form.fundingRequired} onChange={e => set("fundingRequired", e.target.value)} placeholder="e.g. 500000" className="mt-1" /></div>
            <div><Label>Year 1 Revenue Projection (R)</Label><Input type="number" value={form.projectionYear1} onChange={e => set("projectionYear1", e.target.value)} placeholder="e.g. 1200000" className="mt-1" /></div>
            <div><Label>Year 2 Revenue Projection (R)</Label><Input type="number" value={form.projectionYear2} onChange={e => set("projectionYear2", e.target.value)} placeholder="e.g. 2500000" className="mt-1" /></div>
            <div className="col-span-2"><Label>Year 3 Revenue Projection (R)</Label><Input type="number" value={form.projectionYear3} onChange={e => set("projectionYear3", e.target.value)} placeholder="e.g. 5000000" className="mt-1" /></div>
          </div>
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
            <p className="text-sm font-medium text-primary flex items-center gap-2"><Sparkles className="h-4 w-4" /> Ready to generate</p>
            <p className="text-xs text-muted-foreground mt-1">Click "Generate Business Plan" to create a full AI-written document from your inputs. This takes about 20–30 seconds.</p>
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
          <Button onClick={generate} disabled={generating || !form.businessName.trim()} className="gradient-hero text-white gap-2">
            {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Business Plan</>}
          </Button>
        )}
      </div>
    </div>
  );
}
