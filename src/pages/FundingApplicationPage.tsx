import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Send, Plus, Trash2, ChevronLeft, Sparkles, Loader2, Download, Edit, Eye, Building2 } from "lucide-react";

interface Application { id: string; program: string; company_name: string; status: string; created_at: string; updated_at: string; }
interface Company { id: string; company_name: string; is_verified: number; }
interface Plan { id: string; title: string; status: string; }
interface Statement { id: string; title: string; financial_year: number; }
interface Proposal { id: string; title: string; status: string; }

interface GeneratedContent {
  applicationTitle: string; coverLetter: string; applicantProfile: string; businessSummary: string;
  fundingRequest: string; projectDescription: string; financialOverview: string;
  jobCreationPlan: string; transformationImpact: string; declarationStatement: string;
}

const PROGRAMS = [
  { key: "SEFA", name: "SEFA", full: "Small Enterprise Finance Agency", color: "bg-green-50 border-green-200 text-green-800", description: "Loans and equity for SMMEs and co-operatives", range: "R10k – R15m" },
  { key: "NEF", name: "NEF", full: "National Empowerment Fund", color: "bg-blue-50 border-blue-200 text-blue-800", description: "Funding for black-owned businesses", range: "R250k – R75m" },
  { key: "NYDA", name: "NYDA", full: "National Youth Development Agency", color: "bg-purple-50 border-purple-200 text-purple-800", description: "Youth-owned businesses aged 14–35", range: "R1k – R100k" },
  { key: "IDC", name: "IDC", full: "Industrial Development Corporation", color: "bg-amber-50 border-amber-200 text-amber-800", description: "Industrial & manufacturing businesses", range: "R1m – R1bn+" },
];

const APP_SECTIONS = [
  { key: "applicationTitle", label: "Application Title" },
  { key: "coverLetter", label: "1. Cover Letter" },
  { key: "applicantProfile", label: "2. Applicant Profile" },
  { key: "businessSummary", label: "3. Business Summary" },
  { key: "fundingRequest", label: "4. Funding Request" },
  { key: "projectDescription", label: "5. Project Description" },
  { key: "financialOverview", label: "6. Financial Overview" },
  { key: "jobCreationPlan", label: "7. Job Creation Plan" },
  { key: "transformationImpact", label: "8. Transformation & Impact" },
  { key: "declarationStatement", label: "9. Declaration" },
];

export default function FundingApplicationPage() {
  const [view, setView] = useState<"list" | "form" | "document">("list");
  const [applications, setApplications] = useState<Application[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [statements, setStatements] = useState<Statement[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [generating, setGenerating] = useState(false);

  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedStatement, setSelectedStatement] = useState("");
  const [selectedProposal, setSelectedProposal] = useState("");
  const [notes, setNotes] = useState("");

  const loadApplications = useCallback(() => {
    fetch("/api/documents/funding-applications", { credentials: "include" })
      .then(r => r.json()).then(d => setApplications(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => {
    loadApplications();
    fetch("/api/documents/companies", { credentials: "include" }).then(r => r.json()).then(d => setCompanies(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/documents/business-plans", { credentials: "include" }).then(r => r.json()).then(d => setPlans(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/documents/financial-statements", { credentials: "include" }).then(r => r.json()).then(d => setStatements(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/documents/funding-proposals", { credentials: "include" }).then(r => r.json()).then(d => setProposals(Array.isArray(d) ? d : [])).catch(() => {});
  }, [loadApplications]);

  const startNew = () => {
    setCurrentId(null); setGenerated(null);
    setSelectedProgram(""); setSelectedCompany(""); setSelectedPlan(""); setSelectedStatement(""); setSelectedProposal(""); setNotes("");
    setView("form");
  };

  const openExisting = async (id: string) => {
    const res = await fetch(`/api/documents/funding-applications/${id}`, { credentials: "include" });
    const d = await res.json();
    if (res.ok) {
      setCurrentId(id);
      setSelectedProgram(d.program || "");
      setSelectedCompany(d.company_id || "");
      setSelectedPlan(d.business_plan_id || "");
      setSelectedStatement(d.financial_statement_id || "");
      setSelectedProposal(d.funding_proposal_id || "");
      setNotes(d.form_data?.notes || "");
      setGenerated(d.generated_content || null);
      setView(d.generated_content ? "document" : "form");
    } else toast.error("Failed to load");
  };

  const generate = async () => {
    if (!selectedProgram) return toast.error("Please select a funding programme");
    setGenerating(true);
    try {
      let appId = currentId;
      if (!appId) {
        const res = await fetch("/api/documents/funding-applications", {
          method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
          body: JSON.stringify({
            program: selectedProgram, companyId: selectedCompany || null,
            businessPlanId: selectedPlan || null, financialStatementId: selectedStatement || null,
            fundingProposalId: selectedProposal || null, formData: { notes },
          }),
        });
        const d = await res.json();
        if (!res.ok) { toast.error(d.error); setGenerating(false); return; }
        appId = d.id; setCurrentId(d.id);
      } else {
        await fetch(`/api/documents/funding-applications/${appId}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
          body: JSON.stringify({
            program: selectedProgram, companyId: selectedCompany || null,
            businessPlanId: selectedPlan || null, financialStatementId: selectedStatement || null,
            fundingProposalId: selectedProposal || null, formData: { notes },
          }),
        });
      }

      const genRes = await fetch(`/api/documents/funding-applications/${appId}/generate`, { method: "POST", credentials: "include" });
      const genD = await genRes.json();
      if (genRes.ok) { setGenerated(genD.content); setView("document"); loadApplications(); toast.success("Application generated!"); }
      else toast.error(genD.error || "Generation failed");
    } catch { toast.error("Network error"); }
    setGenerating(false);
  };

  const deleteApp = async (id: string) => {
    if (!confirm("Delete this application?")) return;
    await fetch(`/api/documents/funding-applications/${id}`, { method: "DELETE", credentials: "include" });
    loadApplications(); toast.success("Deleted");
  };

  const progInfo = PROGRAMS.find(p => p.key === selectedProgram);

  const printPDF = () => {
    if (!generated) return;
    const win = window.open("", "_blank");
    if (!win) return;
    const prog = PROGRAMS.find(p => p.key === selectedProgram);
    win.document.write(`<!DOCTYPE html><html><head><title>Funding Application — ${selectedProgram}</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: Arial, sans-serif; font-size: 11pt; color: #1a1a1a; padding: 50px; max-width: 800px; margin: 0 auto; }
      h1 { font-size: 22pt; color: #14684b; margin-bottom: 4px; }
      h2 { font-size: 13pt; color: #14684b; margin-top: 32px; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 2px solid #14684b; }
      .cover { margin-bottom: 36px; padding-bottom: 20px; border-bottom: 2px solid #14684b; }
      .badge { display: inline-block; background: #14684b; color: white; padding: 4px 12px; border-radius: 20px; font-size: 10pt; margin: 8px 0; }
      p { margin-bottom: 10px; text-align: justify; }
      @media print { body { padding: 30px; } }
    </style></head><body>
    <div class="cover">
      <div class="badge">${selectedProgram} Application</div>
      <h1>${generated.applicationTitle || "Funding Application"}</h1>
      <p style="color:#555;margin-top:6px;">${prog?.full || selectedProgram}</p>
      <p style="color:#888;font-size:9pt;margin-top:4px;">Submitted: ${new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}</p>
    </div>
    ${APP_SECTIONS.filter(s => s.key !== "applicationTitle").map(s => `<h2>${s.label}</h2>${((generated as any)[s.key] || "").split("\n").map((p: string) => p.trim() ? `<p>${p}</p>` : "").join("")}`).join("")}
    </body></html>`);
    win.document.close(); setTimeout(() => win.print(), 500);
  };

  if (view === "list") return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading">Funding Applications</h2>
          <p className="text-muted-foreground text-sm mt-1">Apply for SEFA, NEF, NYDA and IDC funding using your saved business data</p>
        </div>
        <Button onClick={startNew} className="gradient-hero text-white gap-2"><Plus className="h-4 w-4" /> New Application</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PROGRAMS.map(p => (
          <Card key={p.key} className={`p-4 border-2 ${p.color}`}>
            <p className="font-bold text-lg">{p.name}</p>
            <p className="text-xs mt-1">{p.description}</p>
            <p className="text-xs font-medium mt-2">{p.range}</p>
          </Card>
        ))}
      </div>

      {applications.length === 0 ? (
        <Card className="p-12 text-center">
          <Send className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="font-semibold text-lg mb-2">No applications yet</p>
          <p className="text-muted-foreground text-sm mb-6">Generate a formal funding application using your saved company and financial data</p>
          <Button onClick={startNew} className="gradient-hero text-white gap-2"><Plus className="h-4 w-4" /> Create Application</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {applications.map(a => {
            const prog = PROGRAMS.find(p => p.key === a.program);
            return (
              <Card key={a.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold rounded-full px-2.5 py-0.5 border ${prog?.color}`}>{a.program}</span>
                    {a.company_name && <span className="text-sm font-medium">{a.company_name}</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-xs rounded-full px-2 py-0.5 ${a.status === "submitted" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{a.status === "submitted" ? "Generated" : "Draft"}</span>
                    <span className="text-xs text-muted-foreground">{new Date(a.updated_at).toLocaleDateString("en-ZA")}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openExisting(a.id)} className="gap-1.5">
                    {a.status === "submitted" ? <Eye className="h-3.5 w-3.5" /> : <Edit className="h-3.5 w-3.5" />}
                    {a.status === "submitted" ? "View" : "Edit"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteApp(a.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  if (view === "document" && generated) return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setView("list")} className="gap-1.5"><ChevronLeft className="h-4 w-4" /> Back</Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setView("form")} className="gap-1.5"><Edit className="h-3.5 w-3.5" /> Edit</Button>
          <Button onClick={printPDF} className="gradient-hero text-white gap-2"><Download className="h-4 w-4" /> Download PDF</Button>
        </div>
      </div>

      <Card className="p-8">
        <div className="mb-8 pb-8 border-b-2 border-primary/20">
          <div className={`inline-block text-sm font-bold rounded-full px-3 py-1 border mb-3 ${PROGRAMS.find(p => p.key === selectedProgram)?.color}`}>{selectedProgram} Application</div>
          <h1 className="text-2xl font-bold font-heading text-primary">{generated.applicationTitle}</h1>
          <p className="text-muted-foreground text-sm mt-1">{PROGRAMS.find(p => p.key === selectedProgram)?.full}</p>
          <p className="text-xs text-muted-foreground mt-2">{new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <div className="space-y-8">
          {APP_SECTIONS.filter(s => s.key !== "applicationTitle").map(s => (
            <div key={s.key} className="space-y-3">
              <h2 className="text-lg font-bold font-heading text-primary border-b border-primary/20 pb-2">{s.label}</h2>
              <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{(generated as any)[s.key] || ""}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setView("list")} className="gap-1.5"><ChevronLeft className="h-4 w-4" /> Back</Button>
        <h2 className="text-xl font-bold font-heading">New Funding Application</h2>
      </div>

      <Card className="p-6 space-y-6">
        <div>
          <Label className="text-sm font-semibold">Select Funding Programme *</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {PROGRAMS.map(p => (
              <button key={p.key} onClick={() => setSelectedProgram(p.key)}
                className={`rounded-xl border-2 p-4 text-left transition-all ${selectedProgram === p.key ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                <p className="font-bold text-base">{p.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
                <p className="text-xs font-medium text-primary mt-1">{p.range}</p>
              </button>
            ))}
          </div>
          {progInfo && (
            <div className={`mt-3 rounded-lg p-3 border text-sm ${progInfo.color}`}>
              <strong>{progInfo.full}</strong> — {progInfo.description}. Funding range: {progInfo.range}
            </div>
          )}
        </div>

        <div>
          <Label>Link Company Profile (recommended)</Label>
          <select value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">— No company linked —</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.company_name}{c.is_verified ? " ✓ Verified" : ""}</option>)}
          </select>
          {companies.length === 0 && <p className="text-xs text-amber-600 mt-1">No companies found. <a href="/dashboard/company-verify" className="underline">Add a company profile</a> to strengthen your application.</p>}
        </div>

        <div>
          <Label>Link Business Plan (optional)</Label>
          <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">— No business plan linked —</option>
            {plans.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>

        <div>
          <Label>Link Financial Statements (optional)</Label>
          <select value={selectedStatement} onChange={e => setSelectedStatement(e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">— No statement linked —</option>
            {statements.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </div>

        <div>
          <Label>Link Funding Proposal (optional)</Label>
          <select value={selectedProposal} onChange={e => setSelectedProposal(e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">— No proposal linked —</option>
            {proposals.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>

        <div>
          <Label>Additional Notes</Label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any extra context for the application..." className="mt-1 w-full rounded-lg border bg-background p-3 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
          <p className="text-sm font-medium text-primary flex items-center gap-2"><Sparkles className="h-4 w-4" /> Auto-populate from your saved data</p>
          <p className="text-xs text-muted-foreground mt-1">The application will be automatically filled with data from your linked company profile, business plan, financial statements, and funding proposal. More linked data = stronger application.</p>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={generate} disabled={generating || !selectedProgram} className="gradient-hero text-white gap-2 min-w-[180px]">
          {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating Application...</> : <><Sparkles className="h-4 w-4" /> Generate Application</>}
        </Button>
      </div>
    </div>
  );
}
