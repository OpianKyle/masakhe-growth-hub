import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone, Plus, Users, Mail, TrendingUp, Send, Eye, MoreHorizontal,
  Trash2, Edit3, X, ChevronRight, Upload, Download, Search, RefreshCw,
  Clock, CheckCircle, AlertCircle, FileText, Loader2, ArrowLeft, TestTube
} from "lucide-react";

// ── Types ───────────────────────────────────────────────────────────────────

interface Campaign {
  id: string;
  name: string;
  subject: string;
  from_name?: string;
  from_email?: string;
  reply_to?: string;
  body_html?: string;
  template_key?: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "paused";
  audience: "all" | "tagged" | "broker_clients" | "all_with_clients";
  audience_tag?: string;
  scheduled_at?: string;
  sent_at?: string;
  total_recipients: number;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  created_at: string;
}

interface Contact {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  phone?: string;
  tags?: string;
  status: "subscribed" | "unsubscribed";
  created_at: string;
}

interface Stats {
  totalCampaigns: number;
  totalContacts: number;
  totalSent: number;
  openRate: number;
}

// ── Email templates ─────────────────────────────────────────────────────────

const EMAIL_TEMPLATES: Record<string, { label: string; description: string; html: string }> = {
  blank: {
    label: "Blank",
    description: "Start from scratch with an empty editor",
    html: "<p>Dear {{first_name}},</p>\n\n<p>Write your message here...</p>\n\n<p>Kind regards,<br>The Team</p>",
  },
  newsletter: {
    label: "Newsletter",
    description: "Monthly update with sections for news and highlights",
    html: `<h2 style="color:#1a56db;margin-bottom:8px;">📰 Monthly Newsletter</h2>
<p style="color:#666;margin-top:0;">Hi {{first_name}}, here's what's been happening this month.</p>

<hr style="border:none;border-top:1px solid #e8e8ec;margin:20px 0;">

<h3 style="color:#1a1a2e;">🔥 Top Story</h3>
<p>Share your biggest news item here. Keep it punchy and relevant to your audience.</p>

<h3 style="color:#1a1a2e;">📌 Updates & Highlights</h3>
<ul style="padding-left:20px;line-height:1.8;">
  <li>Update one — describe a key development</li>
  <li>Update two — share an achievement or milestone</li>
  <li>Update three — upcoming event or announcement</li>
</ul>

<hr style="border:none;border-top:1px solid #e8e8ec;margin:20px 0;">

<table cellspacing="0" cellpadding="0" style="margin:24px 0;">
  <tr>
    <td style="background:#1a56db;border-radius:8px;">
      <a href="#" style="display:inline-block;padding:12px 28px;color:#fff;text-decoration:none;font-weight:600;font-size:14px;">Read More →</a>
    </td>
  </tr>
</table>

<p style="color:#666;font-size:13px;">As always, feel free to reply to this email with any questions or feedback. We love hearing from you! 😊</p>`,
  },
  promotion: {
    label: "Promotion / Offer",
    description: "Drive sales with a compelling discount or offer",
    html: `<div style="text-align:center;background:linear-gradient(135deg,#1a56db,#1239a5);padding:32px 24px;border-radius:8px;margin-bottom:24px;">
  <p style="color:rgba(255,255,255,0.8);margin:0 0 8px;font-size:14px;letter-spacing:2px;text-transform:uppercase;">LIMITED TIME OFFER</p>
  <h1 style="color:#fff;margin:0;font-size:36px;font-weight:800;">30% OFF</h1>
  <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:16px;">This week only — expires midnight Friday</p>
</div>

<p>Hi {{first_name}},</p>

<p>We're offering our most loyal clients an <strong>exclusive 30% discount</strong> on all our services this week. This is our way of saying thank you for your continued support. 🙏</p>

<h3 style="color:#1a1a2e;">What's included:</h3>
<ul style="padding-left:20px;line-height:1.8;">
  <li>✅ Service / Product One</li>
  <li>✅ Service / Product Two</li>
  <li>✅ Service / Product Three</li>
</ul>

<p style="color:#e53e3e;font-weight:600;">⏰ Offer ends midnight this Friday. Don't miss out!</p>

<table cellspacing="0" cellpadding="0" style="margin:24px 0;">
  <tr>
    <td style="background:#1a56db;border-radius:8px;">
      <a href="#" style="display:inline-block;padding:14px 32px;color:#fff;text-decoration:none;font-weight:700;font-size:15px;">Claim My Discount →</a>
    </td>
  </tr>
</table>

<p style="color:#666;font-size:13px;">Use code <strong>LOYAL30</strong> at checkout or simply reply to this email to take advantage.</p>`,
  },
  announcement: {
    label: "Announcement",
    description: "Announce a new product, service, or important update",
    html: `<h2 style="color:#1a56db;">🚀 Exciting News from Our Team!</h2>

<p>Hi {{first_name}},</p>

<p>We have some <strong>exciting news</strong> to share with you today — and you're among the first to hear it!</p>

<div style="background:#f0f4ff;border-left:4px solid #1a56db;padding:16px 20px;border-radius:0 8px 8px 0;margin:20px 0;">
  <h3 style="margin:0 0 8px;color:#1a1a2e;">Introducing [Your New Product/Service]</h3>
  <p style="margin:0;color:#4a4a5a;">Describe your announcement here. What is it? Why does it matter to your clients? What problem does it solve?</p>
</div>

<h3 style="color:#1a1a2e;">Key Benefits:</h3>
<ul style="padding-left:20px;line-height:1.8;">
  <li><strong>Benefit One</strong> — explain how this helps your client</li>
  <li><strong>Benefit Two</strong> — highlight the value it delivers</li>
  <li><strong>Benefit Three</strong> — make it relevant and specific</li>
</ul>

<p>We're incredibly proud of what we've built and can't wait to share it with you.</p>

<table cellspacing="0" cellpadding="0" style="margin:24px 0;">
  <tr>
    <td style="background:#1a56db;border-radius:8px;">
      <a href="#" style="display:inline-block;padding:12px 28px;color:#fff;text-decoration:none;font-weight:600;font-size:14px;">Find Out More →</a>
    </td>
  </tr>
</table>`,
  },
  followup: {
    label: "Follow-Up",
    description: "Re-engage clients or follow up after a meeting/consultation",
    html: `<p>Hi {{first_name}},</p>

<p>I hope this message finds you well! I'm reaching out to follow up and check whether you had a chance to consider the information we discussed recently.</p>

<p>As a reminder, here's a quick summary of what we covered:</p>

<ul style="padding-left:20px;line-height:1.8;">
  <li>📋 Point One — key takeaway from your last interaction</li>
  <li>💡 Point Two — the solution or recommendation you offered</li>
  <li>📞 Point Three — next steps or action items discussed</li>
</ul>

<p>I'd love to help you move forward and answer any questions you might have. My calendar is open — simply reply to this email or book a slot at the link below.</p>

<table cellspacing="0" cellpadding="0" style="margin:24px 0;">
  <tr>
    <td style="background:#1a56db;border-radius:8px;">
      <a href="#" style="display:inline-block;padding:12px 28px;color:#fff;text-decoration:none;font-weight:600;font-size:14px;">Book a Call →</a>
    </td>
  </tr>
</table>

<p>Looking forward to hearing from you!</p>

<p>Kind regards,<br><strong>[Your Name]</strong></p>`,
  },
  event: {
    label: "Event Invite",
    description: "Invite your clients to a webinar, workshop, or event",
    html: `<div style="text-align:center;margin-bottom:24px;">
  <span style="font-size:48px;">📅</span>
  <h2 style="color:#1a56db;margin:8px 0 4px;">You're Invited!</h2>
  <p style="color:#666;margin:0;">Join us for an exclusive event</p>
</div>

<p>Hi {{first_name}},</p>

<p>We'd like to personally invite you to <strong>[Event Name]</strong> — an exclusive session designed specifically for clients like you.</p>

<div style="background:#f0f4ff;border-radius:8px;padding:20px;margin:20px 0;">
  <table width="100%" cellspacing="0" cellpadding="0">
    <tr><td style="padding:6px 0;"><strong style="color:#1a56db;">📅 Date:</strong> <span style="color:#4a4a5a;">[Day, Date Month Year]</span></td></tr>
    <tr><td style="padding:6px 0;"><strong style="color:#1a56db;">⏰ Time:</strong> <span style="color:#4a4a5a;">[Start Time] – [End Time]</span></td></tr>
    <tr><td style="padding:6px 0;"><strong style="color:#1a56db;">📍 Venue:</strong> <span style="color:#4a4a5a;">[Location / Online via Zoom]</span></td></tr>
    <tr><td style="padding:6px 0;"><strong style="color:#1a56db;">💰 Cost:</strong> <span style="color:#4a4a5a;">FREE — limited seats available</span></td></tr>
  </table>
</div>

<h3 style="color:#1a1a2e;">What you'll learn:</h3>
<ul style="padding-left:20px;line-height:1.8;">
  <li>✅ Key insight or skill you'll gain</li>
  <li>✅ Practical takeaway attendees can use immediately</li>
  <li>✅ Networking opportunity with [industry/peers]</li>
</ul>

<table cellspacing="0" cellpadding="0" style="margin:24px auto;display:table;">
  <tr>
    <td style="background:#1a56db;border-radius:8px;">
      <a href="#" style="display:inline-block;padding:14px 32px;color:#fff;text-decoration:none;font-weight:700;font-size:15px;">Reserve My Seat →</a>
    </td>
  </tr>
</table>

<p style="color:#e53e3e;font-weight:600;text-align:center;">⚠️ Seats are limited — register before [deadline]!</p>`,
  },
};

// ── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  draft:     { label: "Draft",     color: "bg-gray-100 text-gray-600 border-gray-200",     icon: FileText },
  scheduled: { label: "Scheduled", color: "bg-blue-100 text-blue-700 border-blue-200",     icon: Clock },
  sending:   { label: "Sending",   color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Loader2 },
  sent:      { label: "Sent",      color: "bg-green-100 text-green-700 border-green-200",  icon: CheckCircle },
  paused:    { label: "Paused",    color: "bg-red-100 text-red-700 border-red-200",         icon: AlertCircle },
};

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

function openRate(c: Campaign) {
  if (!c.sent_count) return 0;
  return Math.round((c.opened_count / c.sent_count) * 100);
}

// ── Main component ───────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const [tab, setTab] = useState<"campaigns" | "contacts">("campaigns");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<Stats>({ totalCampaigns: 0, totalContacts: 0, totalSent: 0, openRate: 0 });
  const [audienceCounts, setAudienceCounts] = useState({ subscribed: 0, brokerClients: 0 });
  const [loading, setLoading] = useState(true);
  const [contactSearch, setContactSearch] = useState("");
  const [campaignSearch, setCampaignSearch] = useState("");

  const [detailCampaign, setDetailCampaign] = useState<Campaign | null>(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [showTestModal, setShowTestModal] = useState<Campaign | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Data loading ──────────────────────────────────────────────────────────

  async function loadAll() {
    setLoading(true);
    try {
      const [cRes, ctRes, sRes, acRes] = await Promise.all([
        fetch("/api/campaigns/", { credentials: "include" }),
        fetch("/api/campaigns/contacts/list", { credentials: "include" }),
        fetch("/api/campaigns/stats", { credentials: "include" }),
        fetch("/api/campaigns/audience/counts", { credentials: "include" }),
      ]);
      if (cRes.ok) setCampaigns(await cRes.json());
      if (ctRes.ok) setContacts(await ctRes.json());
      if (sRes.ok) setStats(await sRes.json());
      if (acRes.ok) setAudienceCounts(await acRes.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  // ── Campaign actions ──────────────────────────────────────────────────────

  async function sendCampaign(id: string) {
    setSending(id);
    try {
      const res = await fetch(`/api/campaigns/${id}/send`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Campaign sent to ${data.sent} recipient${data.sent !== 1 ? "s" : ""}`);
      await loadAll();
      if (detailCampaign?.id === id) setDetailCampaign(null);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSending(null);
    }
  }

  async function deleteCampaign(id: string) {
    if (!confirm("Delete this campaign? This cannot be undone.")) return;
    const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) { toast.success("Campaign deleted"); loadAll(); if (detailCampaign?.id === id) setDetailCampaign(null); }
    else toast.error("Failed to delete");
  }

  async function sendTest() {
    if (!showTestModal || !testEmail) return;
    const res = await fetch(`/api/campaigns/${showTestModal.id}/test`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail }),
    });
    const data = await res.json();
    if (res.ok) { toast.success(`Test email sent to ${testEmail}`); setShowTestModal(null); setTestEmail(""); }
    else toast.error(data.error);
  }

  // ── Contact actions ───────────────────────────────────────────────────────

  async function deleteContact(id: string) {
    if (!confirm("Remove this contact?")) return;
    const res = await fetch(`/api/campaigns/contacts/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) { toast.success("Contact removed"); loadAll(); }
    else toast.error("Failed to remove contact");
  }

  function handleImportCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) { toast.error("CSV must have a header row and at least one contact"); return; }
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/\s+/g, "_"));
      const contacts = lines.slice(1).map(line => {
        const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
        const obj: any = {};
        headers.forEach((h, i) => { obj[h] = vals[i] || ""; });
        return { email: obj.email, first_name: obj.first_name || obj.firstname || obj.name, last_name: obj.last_name || obj.lastname, company: obj.company, phone: obj.phone, tags: obj.tags };
      });
      const res = await fetch("/api/campaigns/contacts/import", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts }),
      });
      const data = await res.json();
      if (res.ok) { toast.success(`Imported ${data.imported} contact${data.imported !== 1 ? "s" : ""} (${data.skipped} skipped)`); loadAll(); }
      else toast.error(data.error);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function downloadTemplate() {
    const csv = "email,first_name,last_name,company,phone,tags\njohn@example.com,John,Doe,Acme Ltd,0821234567,clients\njane@example.com,Jane,Smith,XYZ Corp,,vip";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "contacts-template.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  // ── Filtered lists ────────────────────────────────────────────────────────

  const filteredCampaigns = campaigns.filter(c =>
    !campaignSearch || c.name.toLowerCase().includes(campaignSearch.toLowerCase()) || c.subject.toLowerCase().includes(campaignSearch.toLowerCase())
  );

  const filteredContacts = contacts.filter(c =>
    !contactSearch || c.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(contactSearch.toLowerCase()) ||
    (c.company || "").toLowerCase().includes(contactSearch.toLowerCase())
  );

  // ── Render: detail view ───────────────────────────────────────────────────

  if (detailCampaign) {
    const sc = STATUS_CONFIG[detailCampaign.status] || STATUS_CONFIG.draft;
    const Icon = sc.icon;
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <button onClick={() => setDetailCampaign(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Campaigns
        </button>

        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{detailCampaign.name}</h1>
            <p className="text-muted-foreground mt-1">{detailCampaign.subject}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge className={`${sc.color} border gap-1 text-xs font-medium px-2 py-1`}>
              <Icon className="h-3 w-3" />{sc.label}
            </Badge>
            <Button size="sm" variant="outline" onClick={() => { setEditCampaign(detailCampaign); setShowCampaignModal(true); }}>
              <Edit3 className="h-3.5 w-3.5 mr-1" />Edit
            </Button>
            {detailCampaign.status !== "sent" && detailCampaign.status !== "sending" && (
              <>
                <Button size="sm" variant="outline" onClick={() => setShowTestModal(detailCampaign)}>
                  <TestTube className="h-3.5 w-3.5 mr-1" />Test
                </Button>
                <Button size="sm" onClick={() => sendCampaign(detailCampaign.id)} disabled={sending === detailCampaign.id}>
                  {sending === detailCampaign.id ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1" />}
                  Send Now
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Recipients", value: detailCampaign.total_recipients, icon: Users, color: "text-blue-600" },
            { label: "Sent", value: detailCampaign.sent_count, icon: Send, color: "text-green-600" },
            { label: "Opened", value: detailCampaign.opened_count, icon: Eye, color: "text-purple-600" },
            { label: "Open Rate", value: `${openRate(detailCampaign)}%`, icon: TrendingUp, color: "text-orange-600" },
          ].map(s => (
            <Card key={s.label} className="p-4">
              <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="p-4 space-y-2 text-sm">
            <p className="font-medium text-foreground mb-3">Campaign Details</p>
            <div className="flex justify-between"><span className="text-muted-foreground">From</span><span>{detailCampaign.from_name || "—"} &lt;{detailCampaign.from_email || "—"}&gt;</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Audience</span><span>
              {detailCampaign.audience === "all" && "All subscribed contacts"}
              {detailCampaign.audience === "broker_clients" && "My Clients (dashboard)"}
              {detailCampaign.audience === "all_with_clients" && "Contacts + Clients (combined)"}
              {detailCampaign.audience === "tagged" && `Tagged: ${detailCampaign.audience_tag || "—"}`}
            </span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Template</span><span className="capitalize">{detailCampaign.template_key || "blank"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{formatDate(detailCampaign.created_at)}</span></div>
            {detailCampaign.sent_at && <div className="flex justify-between"><span className="text-muted-foreground">Sent</span><span>{formatDate(detailCampaign.sent_at)}</span></div>}
          </Card>

          <Card className="p-4">
            <p className="font-medium text-foreground mb-3 text-sm">Email Preview</p>
            <div
              className="bg-gray-50 rounded p-3 text-xs max-h-48 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: detailCampaign.body_html || "<em>No content</em>" }}
            />
          </Card>
        </div>
      </div>
    );
  }

  // ── Render: main ──────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" />
            Email Campaigns
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Create, manage, and send email campaigns directly to your clients</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadAll}><RefreshCw className="h-3.5 w-3.5 mr-1" />Refresh</Button>
          {tab === "campaigns" ? (
            <Button size="sm" onClick={() => { setEditCampaign(null); setShowCampaignModal(true); }}>
              <Plus className="h-4 w-4 mr-1" />New Campaign
            </Button>
          ) : (
            <Button size="sm" onClick={() => { setEditContact(null); setShowContactModal(true); }}>
              <Plus className="h-4 w-4 mr-1" />Add Contact
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Campaigns", value: stats.totalCampaigns, icon: Megaphone, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Subscribers", value: stats.totalContacts, icon: Users, color: "text-green-600", bg: "bg-green-50" },
          { label: "Emails Sent", value: stats.totalSent.toLocaleString(), icon: Send, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Avg Open Rate", value: `${stats.openRate}%`, icon: Eye, color: "text-orange-600", bg: "bg-orange-50" },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className={`${s.bg} w-9 h-9 rounded-lg flex items-center justify-center mb-3`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit mb-6">
        {(["campaigns", "contacts"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${tab === t ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t === "campaigns" ? `Campaigns (${campaigns.length})` : `Contacts (${contacts.filter(c => c.status === "subscribed").length})`}
          </button>
        ))}
      </div>

      {/* Campaigns Tab */}
      {tab === "campaigns" && (
        <div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search campaigns..." className="pl-9" value={campaignSearch} onChange={e => setCampaignSearch(e.target.value)} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No campaigns yet</p>
              <p className="text-sm mt-1">Create your first email campaign to start engaging your clients</p>
              <Button className="mt-4" onClick={() => { setEditCampaign(null); setShowCampaignModal(true); }}>
                <Plus className="h-4 w-4 mr-1" />Create Campaign
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCampaigns.map(c => {
                const sc = STATUS_CONFIG[c.status] || STATUS_CONFIG.draft;
                const Icon = sc.icon;
                return (
                  <motion.div key={c.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setDetailCampaign(c)}>
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-foreground truncate">{c.name}</p>
                            <Badge className={`${sc.color} border gap-1 text-xs font-medium px-2 py-0.5 shrink-0`}>
                              <Icon className="h-3 w-3" />{sc.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5 truncate">{c.subject}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Created {formatDate(c.created_at)}
                            {c.sent_at && ` · Sent ${formatDate(c.sent_at)}`}
                            {c.from_name && ` · From ${c.from_name}`}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 shrink-0 text-center">
                          <div>
                            <p className="text-lg font-bold text-foreground">{c.total_recipients}</p>
                            <p className="text-xs text-muted-foreground">Recipients</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-foreground">{c.sent_count}</p>
                            <p className="text-xs text-muted-foreground">Sent</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-foreground">{openRate(c)}%</p>
                            <p className="text-xs text-muted-foreground">Opened</p>
                          </div>

                          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                            <Button size="icon" variant="ghost" className="h-7 w-7" title="Edit Campaign" onClick={() => { setEditCampaign(c); setShowCampaignModal(true); }}>
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                            {c.status !== "sent" && c.status !== "sending" && (
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50" title="Send Now" onClick={() => sendCampaign(c.id)} disabled={sending === c.id}>
                                {sending === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                              </Button>
                            )}
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50" title="Delete" onClick={() => deleteCampaign(c.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Contacts Tab */}
      {tab === "contacts" && (
        <div>
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search contacts..." className="pl-9" value={contactSearch} onChange={e => setContactSearch(e.target.value)} />
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}><Download className="h-3.5 w-3.5 mr-1" />CSV Template</Button>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-3.5 w-3.5 mr-1" />Import CSV
            </Button>
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No contacts yet</p>
              <p className="text-sm mt-1">Add contacts manually or import from a CSV file</p>
              <div className="flex gap-2 justify-center mt-4">
                <Button onClick={() => { setEditContact(null); setShowContactModal(true); }}><Plus className="h-4 w-4 mr-1" />Add Contact</Button>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4 mr-1" />Import CSV</Button>
              </div>
            </div>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Company</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Tags</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((c, i) => (
                      <tr key={c.id} className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                        <td className="px-4 py-3 font-medium">{c.email}</td>
                        <td className="px-4 py-3 text-muted-foreground">{[c.first_name, c.last_name].filter(Boolean).join(" ") || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.company || "—"}</td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {c.tags ? (
                            <div className="flex gap-1 flex-wrap">
                              {c.tags.split(",").map(t => (
                                <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">{t.trim()}</span>
                              ))}
                            </div>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={c.status === "subscribed" ? "bg-green-100 text-green-700 border-green-200 border text-xs" : "bg-gray-100 text-gray-600 border-gray-200 border text-xs"}>
                            {c.status === "subscribed" ? "Subscribed" : "Unsubscribed"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex gap-1 justify-end">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditContact(c); setShowContactModal(true); }}>
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={() => deleteContact(c.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Campaign Modal */}
      <AnimatePresence>
        {showCampaignModal && (
          <CampaignModal
            campaign={editCampaign}
            contacts={contacts}
            audienceCounts={audienceCounts}
            onClose={() => { setShowCampaignModal(false); setEditCampaign(null); }}
            onSaved={() => { setShowCampaignModal(false); setEditCampaign(null); loadAll(); }}
          />
        )}
      </AnimatePresence>

      {/* Contact Modal */}
      <AnimatePresence>
        {showContactModal && (
          <ContactModal
            contact={editContact}
            onClose={() => { setShowContactModal(false); setEditContact(null); }}
            onSaved={() => { setShowContactModal(false); setEditContact(null); loadAll(); }}
          />
        )}
      </AnimatePresence>

      {/* Test Email Modal */}
      <AnimatePresence>
        {showTestModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowTestModal(null); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background rounded-xl shadow-2xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-4">Send Test Email</h3>
              <p className="text-sm text-muted-foreground mb-4">Send a test of "<strong>{showTestModal.name}</strong>" to your email to preview how it looks.</p>
              <Label className="text-sm">Test Email Address</Label>
              <Input className="mt-1.5 mb-4" type="email" placeholder="you@example.com" value={testEmail} onChange={e => setTestEmail(e.target.value)} />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setShowTestModal(null); setTestEmail(""); }}>Cancel</Button>
                <Button onClick={sendTest} disabled={!testEmail}><Send className="h-3.5 w-3.5 mr-1" />Send Test</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Campaign Create/Edit Modal ───────────────────────────────────────────────

function CampaignModal({ campaign, contacts, audienceCounts, onClose, onSaved }: {
  campaign: Campaign | null;
  contacts: Contact[];
  audienceCounts: { subscribed: number; brokerClients: number };
  onClose: () => void;
  onSaved: () => void;
}) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: campaign?.name || "",
    subject: campaign?.subject || "",
    from_name: campaign?.from_name || "",
    from_email: campaign?.from_email || "",
    reply_to: campaign?.reply_to || "",
    template_key: campaign?.template_key || "blank",
    body_html: campaign?.body_html || EMAIL_TEMPLATES.blank.html,
    audience: campaign?.audience || "all",
    audience_tag: campaign?.audience_tag || "",
  });

  const STEPS = ["Details", "Template", "Content", "Audience"];

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  function applyTemplate(key: string) {
    set("template_key", key);
    if (!campaign?.body_html || form.body_html === EMAIL_TEMPLATES[form.template_key]?.html) {
      set("body_html", EMAIL_TEMPLATES[key]?.html || "");
    }
  }

  const allTags = [...new Set(contacts.flatMap(c => (c.tags || "").split(",").map(t => t.trim())).filter(Boolean))];

  async function save(status?: string) {
    if (!form.name || !form.subject) { toast.error("Name and subject are required"); return; }
    setSaving(true);
    try {
      const method = campaign ? "PUT" : "POST";
      const url = campaign ? `/api/campaigns/${campaign.id}` : "/api/campaigns/";
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(campaign ? "Campaign updated" : "Campaign created");
      onSaved();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  const canNext = step === 0 ? (form.name && form.subject) : true;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-background rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div>
            <h2 className="text-lg font-semibold">{campaign ? "Edit Campaign" : "New Campaign"}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>

        {/* Step indicator */}
        <div className="flex px-6 py-3 gap-2 border-b shrink-0">
          {STEPS.map((s, i) => (
            <button key={s} onClick={() => i < step || canNext ? setStep(i) : undefined}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all ${step === i ? "bg-primary text-primary-foreground" : i < step ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
              {i < step ? <CheckCircle className="h-3 w-3" /> : <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[10px]">{i + 1}</span>}
              {s}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 0: Details */}
          {step === 0 && (
            <div className="space-y-4 max-w-lg">
              <div>
                <Label>Campaign Name <span className="text-red-500">*</span></Label>
                <Input className="mt-1.5" placeholder="e.g. March Newsletter" value={form.name} onChange={e => set("name", e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">Internal name — not shown to recipients</p>
              </div>
              <div>
                <Label>Email Subject Line <span className="text-red-500">*</span></Label>
                <Input className="mt-1.5" placeholder="e.g. 🚀 Exciting news from our team!" value={form.subject} onChange={e => set("subject", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>From Name</Label>
                  <Input className="mt-1.5" placeholder="Your Business Name" value={form.from_name} onChange={e => set("from_name", e.target.value)} />
                </div>
                <div>
                  <Label>From Email</Label>
                  <Input className="mt-1.5" type="email" placeholder="you@yourdomain.co.za" value={form.from_email} onChange={e => set("from_email", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Reply-To Email <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input className="mt-1.5" type="email" placeholder="replies@yourdomain.co.za" value={form.reply_to} onChange={e => set("reply_to", e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 1: Template */}
          {step === 1 && (
            <div>
              <p className="text-sm text-muted-foreground mb-4">Choose a starting template. You can customise the content in the next step.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(EMAIL_TEMPLATES).map(([key, tmpl]) => (
                  <button key={key} onClick={() => applyTemplate(key)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${form.template_key === key ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${form.template_key === key ? "bg-primary" : "bg-muted"}`}>
                      <Mail className={`h-4 w-4 ${form.template_key === key ? "text-primary-foreground" : "text-muted-foreground"}`} />
                    </div>
                    <p className="font-medium text-sm">{tmpl.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{tmpl.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Content */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Email Body (HTML)</p>
                <span className="text-xs text-muted-foreground">Use {"{{first_name}}"} to personalise</span>
              </div>
              <Textarea
                className="font-mono text-xs min-h-64 resize-y"
                value={form.body_html}
                onChange={e => set("body_html", e.target.value)}
                placeholder="Write your email HTML here..."
              />
              <div className="border rounded-xl p-4 bg-gray-50">
                <p className="text-xs font-medium text-muted-foreground mb-2">Preview</p>
                <div
                  className="bg-white rounded-lg p-4 text-sm max-h-64 overflow-y-auto shadow-inner"
                  dangerouslySetInnerHTML={{ __html: form.body_html.replace(/\{\{first_name\}\}/g, "John").replace(/\{\{name\}\}/g, "John") }}
                />
              </div>
            </div>
          )}

          {/* Step 3: Audience */}
          {step === 3 && (
            <div className="max-w-lg space-y-4">
              <div>
                <Label>Recipient Audience</Label>
                <Select value={form.audience} onValueChange={v => set("audience", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      Campaign Contacts — subscribed ({audienceCounts.subscribed})
                    </SelectItem>
                    <SelectItem value="broker_clients">
                      My Clients — from the Clients dashboard ({audienceCounts.brokerClients} with email)
                    </SelectItem>
                    <SelectItem value="all_with_clients">
                      Everyone — Campaign Contacts + Clients ({audienceCounts.subscribed + audienceCounts.brokerClients} combined, deduped)
                    </SelectItem>
                    <SelectItem value="tagged">Campaign Contacts — specific tag only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.audience === "tagged" && (
                <div>
                  <Label>Tag</Label>
                  {allTags.length > 0 ? (
                    <Select value={form.audience_tag} onValueChange={v => set("audience_tag", v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select a tag..." /></SelectTrigger>
                      <SelectContent>
                        {allTags.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input className="mt-1.5" placeholder="Type tag name..." value={form.audience_tag} onChange={e => set("audience_tag", e.target.value)} />
                  )}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-medium mb-1">Ready to send</p>
                <p className="text-xs">
                  This campaign will be sent to <strong>
                    {form.audience === "all" && `${audienceCounts.subscribed} subscribed contacts`}
                    {form.audience === "broker_clients" && `${audienceCounts.brokerClients} clients from your Clients dashboard`}
                    {form.audience === "all_with_clients" && `~${audienceCounts.subscribed + audienceCounts.brokerClients} recipients (deduplicated by email)`}
                    {form.audience === "tagged" && (form.audience_tag ? `contacts tagged "${form.audience_tag}"` : "contacts with the selected tag")}
                  </strong>. Save as draft first and send when ready.
                </p>
              </div>

              {form.audience === "broker_clients" && audienceCounts.brokerClients === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                  No clients with email addresses found. Add client emails in the <strong>Clients</strong> section of your dashboard first.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/30 shrink-0">
          <Button variant="ghost" onClick={step === 0 ? onClose : () => setStep(s => s - 1)}>
            {step === 0 ? "Cancel" : "← Back"}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => save()} disabled={saving}>
              {saving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : null}
              Save Draft
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canNext}>
                Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            ) : (
              <Button onClick={() => save()} disabled={saving} className="bg-green-600 hover:bg-green-700">
                {saving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5 mr-1" />}
                {campaign ? "Update Campaign" : "Create Campaign"}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Contact Modal ────────────────────────────────────────────────────────────

function ContactModal({ contact, onClose, onSaved }: {
  contact: Contact | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    email: contact?.email || "",
    first_name: contact?.first_name || "",
    last_name: contact?.last_name || "",
    company: contact?.company || "",
    phone: contact?.phone || "",
    tags: contact?.tags || "",
    status: contact?.status || "subscribed",
  });

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function save() {
    if (!form.email) { toast.error("Email is required"); return; }
    setSaving(true);
    try {
      const method = contact ? "PUT" : "POST";
      const url = contact ? `/api/campaigns/contacts/${contact.id}` : "/api/campaigns/contacts/add";
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(contact ? "Contact updated" : "Contact added");
      onSaved();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-background rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{contact ? "Edit Contact" : "Add Contact"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <Label>Email Address <span className="text-red-500">*</span></Label>
            <Input className="mt-1.5" type="email" placeholder="client@example.co.za" value={form.email} onChange={e => set("email", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>First Name</Label>
              <Input className="mt-1.5" placeholder="John" value={form.first_name} onChange={e => set("first_name", e.target.value)} />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input className="mt-1.5" placeholder="Smith" value={form.last_name} onChange={e => set("last_name", e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Company</Label>
            <Input className="mt-1.5" placeholder="Acme (Pty) Ltd" value={form.company} onChange={e => set("company", e.target.value)} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input className="mt-1.5" placeholder="0821234567" value={form.phone} onChange={e => set("phone", e.target.value)} />
          </div>
          <div>
            <Label>Tags <span className="text-muted-foreground text-xs">(comma-separated)</span></Label>
            <Input className="mt-1.5" placeholder="clients, vip, newsletter" value={form.tags} onChange={e => set("tags", e.target.value)} />
          </div>
          {contact && (
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => set("status", v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="subscribed">Subscribed</SelectItem>
                  <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <div className="flex gap-2 justify-end px-6 py-4 border-t bg-muted/30">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : null}
            {contact ? "Update" : "Add Contact"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
