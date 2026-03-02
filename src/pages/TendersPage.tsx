import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Search, MapPin, Calendar, DollarSign, Briefcase, Clock, ChevronRight,
  ArrowLeft, Send, CheckCircle2, Filter, FileText
} from "lucide-react";

interface Tender {
  id: number;
  title: string;
  description: string;
  category: string;
  budget_min: number | null;
  budget_max: number | null;
  currency: string;
  location: string;
  deadline: string;
  requirements: string;
  status: string;
  created_by_name: string;
  application_count: number;
  has_applied?: boolean;
  created_at: string;
}

const CATEGORIES = [
  "Construction", "IT & Technology", "Consulting", "Catering & Events",
  "Transport & Logistics", "Cleaning & Maintenance", "Marketing & Media",
  "Agriculture", "Manufacturing", "Education & Training", "Health & Wellness", "Other"
];

function formatCurrency(cents: number) {
  return `R ${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

function isExpired(deadline: string) {
  return new Date(deadline) < new Date();
}

export default function TendersPage() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedAmount, setProposedAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [showApplications, setShowApplications] = useState(false);

  const fetchTenders = async () => {
    try {
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      if (search) params.set("search", search);
      const res = await fetch(`/api/tenders?${params}`, { credentials: "include" });
      const data = await res.json();
      setTenders(data.tenders || []);
    } catch {
      toast.error("Failed to load tenders");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const res = await fetch("/api/tenders/user/applications", { credentials: "include" });
      const data = await res.json();
      setMyApplications(data.applications || []);
    } catch {
      toast.error("Failed to load applications");
    }
  };

  useEffect(() => {
    fetchTenders();
  }, [category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTenders();
  };

  const openTender = async (tender: Tender) => {
    try {
      const res = await fetch(`/api/tenders/${tender.id}`, { credentials: "include" });
      const data = await res.json();
      setSelectedTender(data.tender);
      setApplying(false);
      setCoverLetter("");
      setProposedAmount("");
    } catch {
      toast.error("Failed to load tender details");
    }
  };

  const handleApply = async () => {
    if (!selectedTender) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tenders/${selectedTender.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          cover_letter: coverLetter,
          proposed_amount: proposedAmount ? Math.round(parseFloat(proposedAmount) * 100) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Application submitted successfully!");
      setSelectedTender({ ...selectedTender, has_applied: true });
      setApplying(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "PENDING": return "bg-yellow-100 text-yellow-700";
      case "SHORTLISTED": return "bg-blue-100 text-blue-700";
      case "ACCEPTED": return "bg-green-100 text-green-700";
      case "REJECTED": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (showApplications) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <button onClick={() => setShowApplications(false)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Tenders
        </button>
        <h2 className="text-2xl font-bold font-heading mb-6">My Applications</h2>
        {myApplications.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>You haven't applied to any tenders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myApplications.map((app) => (
              <div key={app.id} className="border rounded-xl p-5 bg-card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{app.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {app.category && <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{app.category}</span>}
                      {app.deadline && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(app.deadline)}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(app.status)}`}>{app.status}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${app.tender_status === "OPEN" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                      Tender {app.tender_status}
                    </span>
                  </div>
                </div>
                {app.proposed_amount && (
                  <p className="text-sm text-muted-foreground mt-2">Proposed: {formatCurrency(app.proposed_amount)}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">Applied {formatDate(app.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (selectedTender) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <button onClick={() => setSelectedTender(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Tenders
        </button>

        <div className="border rounded-xl p-6 bg-card mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold font-heading">{selectedTender.title}</h2>
              {selectedTender.category && (
                <span className="inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">{selectedTender.category}</span>
              )}
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${selectedTender.status === "OPEN" ? "bg-emerald-100 text-emerald-700" : selectedTender.status === "CLOSED" ? "bg-gray-100 text-gray-600" : "bg-amber-100 text-amber-700"}`}>
              {selectedTender.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {(selectedTender.budget_min || selectedTender.budget_max) && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" />Budget</p>
                <p className="font-semibold text-sm mt-1">
                  {selectedTender.budget_min && selectedTender.budget_max
                    ? `${formatCurrency(selectedTender.budget_min)} - ${formatCurrency(selectedTender.budget_max)}`
                    : selectedTender.budget_max ? `Up to ${formatCurrency(selectedTender.budget_max)}` : `From ${formatCurrency(selectedTender.budget_min!)}`
                  }
                </p>
              </div>
            )}
            {selectedTender.location && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />Location</p>
                <p className="font-semibold text-sm mt-1">{selectedTender.location}</p>
              </div>
            )}
            {selectedTender.deadline && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />Deadline</p>
                <p className={`font-semibold text-sm mt-1 ${isExpired(selectedTender.deadline) ? "text-destructive" : ""}`}>
                  {formatDate(selectedTender.deadline)}
                  {isExpired(selectedTender.deadline) && " (Expired)"}
                </p>
              </div>
            )}
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Briefcase className="h-3 w-3" />Applications</p>
              <p className="font-semibold text-sm mt-1">{selectedTender.application_count}</p>
            </div>
          </div>

          {selectedTender.description && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedTender.description}</p>
            </div>
          )}

          {selectedTender.requirements && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Requirements</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedTender.requirements}</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Posted by {selectedTender.created_by_name} on {formatDate(selectedTender.created_at)}
          </p>
        </div>

        {selectedTender.has_applied ? (
          <div className="border rounded-xl p-6 bg-emerald-50 dark:bg-emerald-950/20 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <p className="font-medium text-emerald-700 dark:text-emerald-400">You have already applied to this tender.</p>
          </div>
        ) : selectedTender.status !== "OPEN" ? (
          <div className="border rounded-xl p-6 bg-muted/50 text-center">
            <p className="text-muted-foreground">This tender is no longer accepting applications.</p>
          </div>
        ) : applying ? (
          <div className="border rounded-xl p-6 bg-card">
            <h3 className="text-lg font-semibold mb-4">Submit Application</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Proposed Amount (ZAR) <span className="text-muted-foreground font-normal">— optional</span></label>
                <Input
                  type="number"
                  placeholder="e.g. 50000"
                  value={proposedAmount}
                  onChange={(e) => setProposedAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Cover Letter / Motivation</label>
                <textarea
                  className="w-full min-h-[150px] rounded-lg border border-input bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Tell us why your business is the right fit for this tender. Include relevant experience, capacity, and any certifications."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleApply} disabled={submitting || !coverLetter.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? "Submitting..." : "Submit Application"}
                </Button>
                <Button variant="outline" onClick={() => setApplying(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        ) : (
          <Button size="lg" onClick={() => setApplying(true)} className="w-full">
            <Send className="h-4 w-4 mr-2" /> Apply for this Tender
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold font-heading">Business Tenders</h2>
          <p className="text-sm text-muted-foreground mt-1">Browse and apply for available business opportunities</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setShowApplications(true); fetchMyApplications(); }}>
          <FileText className="h-4 w-4 mr-2" /> My Applications
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tenders..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </form>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 rounded-md border border-input bg-background pl-9 pr-8 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading tenders...</div>
      ) : tenders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No tenders available</p>
          <p className="text-sm mt-1">Check back soon for new business opportunities.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tenders.map((tender) => (
            <div
              key={tender.id}
              onClick={() => openTender(tender)}
              className="border rounded-xl p-5 bg-card hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">{tender.title}</h3>
                    {tender.category && (
                      <span className="hidden sm:inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">{tender.category}</span>
                    )}
                  </div>
                  {tender.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{tender.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    {(tender.budget_min || tender.budget_max) && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        {tender.budget_min && tender.budget_max
                          ? `${formatCurrency(tender.budget_min)} - ${formatCurrency(tender.budget_max)}`
                          : tender.budget_max ? `Up to ${formatCurrency(tender.budget_max)}` : `From ${formatCurrency(tender.budget_min!)}`
                        }
                      </span>
                    )}
                    {tender.location && (
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{tender.location}</span>
                    )}
                    {tender.deadline && (
                      <span className={`flex items-center gap-1 ${isExpired(tender.deadline) ? "text-destructive" : ""}`}>
                        <Clock className="h-3.5 w-3.5" />
                        {isExpired(tender.deadline) ? "Expired" : `Closes ${formatDate(tender.deadline)}`}
                      </span>
                    )}
                    <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{tender.application_count} application{tender.application_count !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary shrink-0 ml-4 mt-1" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
