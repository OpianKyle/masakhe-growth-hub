import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Search, MapPin, Calendar, DollarSign, Briefcase, Clock, ChevronRight,
  ArrowLeft, Send, CheckCircle2, Filter, FileText, Plus, Edit, Trash2, Eye,
  Star, XCircle
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
  created_by: string;
  created_by_name: string;
  application_count: number;
  has_applied?: boolean;
  is_owner?: boolean;
  created_at: string;
}

interface TenderForm {
  title: string;
  description: string;
  category: string;
  budget_min: string;
  budget_max: string;
  location: string;
  deadline: string;
  requirements: string;
  status: string;
}

const CATEGORIES = [
  "Construction", "IT & Technology", "Consulting", "Catering & Events",
  "Transport & Logistics", "Cleaning & Maintenance", "Marketing & Media",
  "Agriculture", "Manufacturing", "Education & Training", "Health & Wellness", "Other"
];

const emptyForm: TenderForm = { title: "", description: "", category: "", budget_min: "", budget_max: "", location: "", deadline: "", requirements: "", status: "OPEN" };

function formatCurrency(cents: number) {
  return `R ${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

function isExpired(deadline: string) {
  return new Date(deadline) < new Date();
}

type View = "browse" | "my-applications" | "my-tenders" | "detail" | "create-edit" | "view-apps";

export default function TendersPage() {
  const { user } = useAuth();
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
  const [myTenders, setMyTenders] = useState<any[]>([]);
  const [view, setView] = useState<View>("browse");
  const [form, setForm] = useState<TenderForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [tenderApps, setTenderApps] = useState<any[]>([]);
  const [tenderAppsLoading, setTenderAppsLoading] = useState(false);
  const [viewAppsTender, setViewAppsTender] = useState<any>(null);

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

  const fetchMyTenders = async () => {
    try {
      const res = await fetch("/api/tenders/user/my-tenders", { credentials: "include" });
      const data = await res.json();
      setMyTenders(data.tenders || []);
    } catch {
      toast.error("Failed to load your tenders");
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
      setView("detail");
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

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setView("create-edit");
  };

  const openEditForm = (tender: any) => {
    setEditingId(tender.id);
    setForm({
      title: tender.title || "",
      description: tender.description || "",
      category: tender.category || "",
      budget_min: tender.budget_min ? String(tender.budget_min / 100) : "",
      budget_max: tender.budget_max ? String(tender.budget_max / 100) : "",
      location: tender.location || "",
      deadline: tender.deadline ? tender.deadline.split("T")[0] : "",
      requirements: tender.requirements || "",
      status: tender.status || "OPEN",
    });
    setView("create-edit");
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        budget_min: form.budget_min ? Math.round(parseFloat(form.budget_min) * 100) : null,
        budget_max: form.budget_max ? Math.round(parseFloat(form.budget_max) * 100) : null,
      };
      const url = editingId ? `/api/tenders/user/${editingId}` : "/api/tenders/user/create";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(editingId ? "Tender updated" : "Tender created");
      setView("my-tenders");
      fetchMyTenders();
      fetchTenders();
    } catch (err: any) {
      toast.error(err.message || "Failed to save tender");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTender = async (id: number) => {
    if (!confirm("Delete this tender and all its applications?")) return;
    try {
      const res = await fetch(`/api/tenders/user/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      toast.success("Tender deleted");
      fetchMyTenders();
      fetchTenders();
    } catch {
      toast.error("Failed to delete tender");
    }
  };

  const openViewApps = async (tender: any) => {
    setViewAppsTender(tender);
    setTenderAppsLoading(true);
    setView("view-apps");
    try {
      const res = await fetch(`/api/tenders/user/${tender.id}/applications`, { credentials: "include" });
      const data = await res.json();
      setTenderApps(data.applications || []);
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setTenderAppsLoading(false);
    }
  };

  const updateAppStatus = async (appId: number, status: string) => {
    try {
      const res = await fetch(`/api/tenders/user/applications/${appId}/status`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setTenderApps(tenderApps.map(a => a.id === appId ? { ...a, status } : a));
      toast.success(`Application ${status.toLowerCase()}`);
    } catch {
      toast.error("Failed to update status");
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

  const goBack = () => {
    setView("browse");
    setSelectedTender(null);
  };

  if (view === "view-apps") {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <button onClick={() => { setView("my-tenders"); fetchMyTenders(); }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to My Tenders
        </button>
        <h2 className="text-2xl font-bold font-heading mb-1">Applications for: {viewAppsTender?.title}</h2>
        <p className="text-sm text-muted-foreground mb-6">{tenderApps.length} application{tenderApps.length !== 1 ? "s" : ""}</p>

        {tenderAppsLoading ? <p className="text-muted-foreground">Loading...</p> : tenderApps.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No applications received yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tenderApps.map((app) => (
              <div key={app.id} className="border rounded-xl p-5 bg-card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{app.full_name}</h4>
                    <p className="text-sm text-muted-foreground">{app.email}</p>
                    {app.business_name && <p className="text-sm text-muted-foreground">{app.business_name}{app.industry_sector ? ` \u2022 ${app.industry_sector}` : ""}</p>}
                    {app.phone && <p className="text-sm text-muted-foreground">{app.phone}</p>}
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(app.status)}`}>{app.status}</span>
                </div>
                {app.proposed_amount && <p className="text-sm mb-2"><strong>Proposed:</strong> {formatCurrency(app.proposed_amount)}</p>}
                {app.cover_letter && (
                  <div className="bg-muted/50 rounded-lg p-3 mb-3">
                    <p className="text-sm whitespace-pre-wrap">{app.cover_letter}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => updateAppStatus(app.id, "SHORTLISTED")} disabled={app.status === "SHORTLISTED"}>
                    <Star className="h-3.5 w-3.5 mr-1" /> Shortlist
                  </Button>
                  <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => updateAppStatus(app.id, "ACCEPTED")} disabled={app.status === "ACCEPTED"}>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Accept
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => updateAppStatus(app.id, "REJECTED")} disabled={app.status === "REJECTED"}>
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Applied {formatDate(app.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === "create-edit") {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <button onClick={() => setView("my-tenders")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to My Tenders
        </button>
        <h2 className="text-2xl font-bold font-heading mb-6">{editingId ? "Edit Tender" : "Create New Tender"}</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Title *</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Office Building Renovation" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Description</label>
            <textarea className="w-full min-h-[120px] rounded-lg border border-input bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the project scope and objectives..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Min Budget (ZAR)</label>
              <Input type="number" value={form.budget_min} onChange={(e) => setForm({ ...form, budget_min: e.target.value })} placeholder="e.g. 50000" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Max Budget (ZAR)</label>
              <Input type="number" value={form.budget_max} onChange={(e) => setForm({ ...form, budget_max: e.target.value })} placeholder="e.g. 150000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Location</label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Johannesburg, Gauteng" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Deadline</label>
              <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Requirements</label>
            <textarea className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} placeholder="List qualifications, certifications, or experience needed..." />
          </div>
          {editingId && (
            <div>
              <label className="text-sm font-medium block mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
                <option value="AWARDED">Awarded</option>
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Tender" : "Create Tender"}
            </Button>
            <Button variant="outline" onClick={() => setView("my-tenders")}>Cancel</Button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "my-tenders") {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <button onClick={goBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Tenders
        </button>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-heading">My Tenders</h2>
          <Button onClick={openCreateForm}>
            <Plus className="h-4 w-4 mr-2" /> New Tender
          </Button>
        </div>
        {myTenders.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">You haven't created any tenders yet</p>
            <p className="text-sm mt-1">Post a tender to find businesses for your projects.</p>
            <Button className="mt-4" onClick={openCreateForm}><Plus className="h-4 w-4 mr-2" /> Create Tender</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {myTenders.map((tender) => (
              <div key={tender.id} className="border rounded-xl p-5 bg-card">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{tender.title}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tender.status === "OPEN" ? "bg-emerald-100 text-emerald-700" : tender.status === "CLOSED" ? "bg-gray-100 text-gray-600" : "bg-amber-100 text-amber-700"}`}>
                        {tender.status}
                      </span>
                    </div>
                    {tender.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{tender.description}</p>}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      {tender.category && <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{tender.category}</span>}
                      {tender.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{tender.location}</span>}
                      {tender.deadline && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(tender.deadline)}</span>}
                      {(tender.budget_min || tender.budget_max) && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5" />
                          {tender.budget_min && tender.budget_max
                            ? `${formatCurrency(tender.budget_min)} - ${formatCurrency(tender.budget_max)}`
                            : tender.budget_max ? `Up to ${formatCurrency(tender.budget_max)}` : `From ${formatCurrency(tender.budget_min)}`
                          }
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                  <Button size="sm" variant="outline" onClick={() => openViewApps(tender)}>
                    <Eye className="h-3.5 w-3.5 mr-1" /> {tender.application_count} Application{tender.application_count !== 1 ? "s" : ""}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openEditForm(tender)}>
                    <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDeleteTender(tender.id)}>
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === "my-applications") {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <button onClick={goBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
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

  if (view === "detail" && selectedTender) {
    const isOwner = selectedTender.is_owner;
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <button onClick={goBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Tenders
        </button>

        <div className="border rounded-xl p-6 bg-card mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold font-heading">{selectedTender.title}</h2>
              <div className="flex items-center gap-2 mt-2">
                {selectedTender.category && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">{selectedTender.category}</span>
                )}
                {isOwner && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">Your Tender</span>
                )}
              </div>
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

        {isOwner ? (
          <div className="border rounded-xl p-6 bg-blue-50 dark:bg-blue-950/20">
            <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">This is your tender. You can manage it from My Tenders.</p>
            <Button variant="outline" size="sm" onClick={() => { setView("my-tenders"); fetchMyTenders(); }}>
              <Briefcase className="h-4 w-4 mr-2" /> Go to My Tenders
            </Button>
          </div>
        ) : selectedTender.has_applied ? (
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
                <label className="text-sm font-medium block mb-1.5">Proposed Amount (ZAR) <span className="text-muted-foreground font-normal">\u2014 optional</span></label>
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
    <div className="min-h-full bg-white dark:bg-gray-950">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #dbeafe 0%, #d1fae5 35%, #dcfce7 70%, #e0f2fe 100%)" }}>
        <div className="pointer-events-none select-none absolute inset-0">
          <motion.div initial={{ opacity: 0, rotate: -5, y: 20 }} animate={{ opacity: 0.88, rotate: -3, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="absolute -left-4 top-4 w-40 rounded-2xl bg-white/85 backdrop-blur shadow-2xl border-2 border-white p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center"><Briefcase className="h-3.5 w-3.5 text-blue-600"/></div>
              <div className="space-y-1"><div className="h-2 w-14 rounded-full bg-gray-200"/><div className="h-1.5 w-8 rounded-full bg-gray-100"/></div>
            </div>
            <div className="space-y-1.5">
              {["bg-blue-100","bg-emerald-100","bg-sky-100"].map((c,i) => <div key={i} className={`h-5 w-full rounded-lg ${c}`}/>)}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, rotate: 5, y: 20 }} animate={{ opacity: 0.85, rotate: 3, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute -right-3 top-5 w-36 rounded-2xl bg-white/85 backdrop-blur shadow-2xl border-2 border-white p-3">
            <div className="h-2 w-14 rounded-full bg-blue-200 mb-2"/>
            <div className="grid grid-cols-2 gap-1.5">
              {["bg-blue-100","bg-emerald-100","bg-teal-100","bg-sky-100"].map((c,i) => <div key={i} className={`h-8 rounded-lg ${c}`}/>)}
            </div>
          </motion.div>
        </div>
        <div className="relative z-10 py-12 px-6 text-center max-w-2xl mx-auto">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2" style={{ color: "#1e3a8a" }}>
            Business Tenders
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-blue-800/70 mb-6 text-sm">
            Browse government and private tender opportunities or post your own tenders
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-3 flex-wrap">
            <Button onClick={() => setView("browse")} className="bg-blue-700 hover:bg-blue-800 text-white shadow-md gap-2 rounded-xl">
              <Search className="h-4 w-4" /> Browse Tenders
            </Button>
            <Button onClick={() => { setView("my-tenders"); fetchMyTenders(); }}
              variant="outline" className="bg-white/80 border-white shadow-sm gap-2 text-blue-900 hover:bg-white rounded-xl">
              <Plus className="h-4 w-4" /> My Tenders
            </Button>
          </motion.div>
        </div>
      </div>

      {/* ── Quick action bar ─────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white dark:bg-gray-950 px-4 py-2">
        <div className="max-w-6xl mx-auto flex items-center gap-0.5 overflow-x-auto scrollbar-none">
          {[
            { label: "Browse",        icon: Search,   action: () => setView("browse"),                                    grad: "from-blue-500 to-indigo-500" },
            { label: "My Tenders",    icon: Briefcase,action: () => { setView("my-tenders"); fetchMyTenders(); },          grad: "from-emerald-500 to-teal-500" },
            { label: "Applications",  icon: FileText, action: () => { setView("my-applications"); fetchMyApplications(); },grad: "from-violet-500 to-purple-500" },
          ].map((a, i) => (
            <motion.button key={a.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={a.action}
              className="flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group min-w-[80px] shrink-0">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${a.grad} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                <a.icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-[11px] font-medium text-gray-600 whitespace-nowrap">{a.label}</span>
            </motion.button>
          ))}
          <div className="mx-2 h-10 w-px bg-gray-200 shrink-0" />
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            onClick={() => setView("post")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all shrink-0">
            <Plus className="h-4 w-4" /> Post Tender
          </motion.button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">

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
          <p className="text-sm mt-1">Check back soon or create your own tender.</p>
          <Button className="mt-4" onClick={() => { setView("my-tenders"); fetchMyTenders(); }}>
            <Plus className="h-4 w-4 mr-2" /> Create a Tender
          </Button>
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
                    {tender.created_by === user?.id && (
                      <span className="hidden sm:inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 shrink-0">Yours</span>
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
    </div>
  );
}
