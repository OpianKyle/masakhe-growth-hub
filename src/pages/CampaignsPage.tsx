import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import EmailVisualEditor from "@/components/EmailVisualEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone, Plus, Users, Mail, TrendingUp, Send, Eye, Trash2, Edit3, X,
  ChevronRight, Upload, Download, Search, RefreshCw, Clock, CheckCircle,
  AlertCircle, FileText, Loader2, ArrowLeft, TestTube, Sparkles, RotateCcw,
  Zap, Newspaper, Tag, Calendar, MessageSquare, ChevronDown, Monitor
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

// ── Templates ───────────────────────────────────────────────────────────────

const TEMPLATE_DEFS = {
  blank: {
    label: "Blank",
    description: "Start from scratch",
    icon: FileText,
    accent: "#6b7280",
    preview: `<div style="padding:12px;font-size:8px;color:#374151;line-height:1.5;">
      <div style="height:6px;background:#e5e7eb;border-radius:3px;margin-bottom:6px;width:60%"></div>
      <div style="height:4px;background:#f3f4f6;border-radius:2px;margin-bottom:4px;width:90%"></div>
      <div style="height:4px;background:#f3f4f6;border-radius:2px;margin-bottom:4px;width:80%"></div>
      <div style="height:4px;background:#f3f4f6;border-radius:2px;margin-bottom:4px;width:70%"></div>
    </div>`,
    html: "<p>Hi {{first_name}},</p>\n\n<p>Write your message here...</p>\n\n<p>Kind regards,<br>The Team</p>",
  },
  newsletter: {
    label: "Newsletter",
    description: "Monthly updates & news",
    icon: Newspaper,
    accent: "#1a56db",
    preview: `<div style="padding:0;font-size:8px;overflow:hidden;">
      <div style="background:#1a56db;padding:8px;text-align:center;color:#fff;font-weight:700;font-size:7px;">📰 NEWSLETTER</div>
      <div style="padding:8px;">
        <div style="height:5px;background:#1a56db;border-radius:2px;margin-bottom:4px;width:50%"></div>
        <div style="height:3px;background:#e5e7eb;border-radius:2px;margin-bottom:3px;"></div>
        <div style="height:3px;background:#e5e7eb;border-radius:2px;margin-bottom:3px;width:90%"></div>
        <div style="height:3px;background:#e5e7eb;border-radius:2px;margin-bottom:6px;width:80%"></div>
        <div style="background:#1a56db;border-radius:3px;padding:3px 6px;color:#fff;font-size:6px;display:inline-block;">Read More →</div>
      </div>
    </div>`,
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
<table cellspacing="0" cellpadding="0" style="margin:24px 0;"><tr><td style="background:#1a56db;border-radius:8px;"><a href="#" style="display:inline-block;padding:12px 28px;color:#fff;text-decoration:none;font-weight:600;font-size:14px;">Read More →</a></td></tr></table>
<p style="color:#666;font-size:13px;">As always, feel free to reply to this email with any questions or feedback. We love hearing from you! 😊</p>`,
  },
  promotion: {
    label: "Promotion",
    description: "Discounts & special offers",
    icon: Tag,
    accent: "#d97706",
    preview: `<div style="padding:0;font-size:8px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#1a56db,#1239a5);padding:10px;text-align:center;">
        <div style="color:rgba(255,255,255,0.7);font-size:5px;letter-spacing:1px;">LIMITED TIME</div>
        <div style="color:#fff;font-weight:900;font-size:14px;line-height:1;">30%</div>
        <div style="color:#fff;font-size:5px;">OFF</div>
      </div>
      <div style="padding:8px;">
        <div style="height:3px;background:#e5e7eb;border-radius:2px;margin-bottom:3px;"></div>
        <div style="height:3px;background:#e5e7eb;border-radius:2px;margin-bottom:6px;width:85%"></div>
        <div style="background:#1a56db;border-radius:3px;padding:3px 6px;color:#fff;font-size:6px;display:inline-block;">Claim Offer →</div>
      </div>
    </div>`,
    html: `<div style="text-align:center;background:linear-gradient(135deg,#1a56db,#1239a5);padding:32px 24px;border-radius:8px;margin-bottom:24px;">
  <p style="color:rgba(255,255,255,0.8);margin:0 0 8px;font-size:14px;letter-spacing:2px;text-transform:uppercase;">LIMITED TIME OFFER</p>
  <h1 style="color:#fff;margin:0;font-size:36px;font-weight:800;">30% OFF</h1>
  <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:16px;">This week only — expires midnight Friday</p>
</div>
<p>Hi {{first_name}},</p>
<p>We're offering our most loyal clients an <strong>exclusive 30% discount</strong> on all our services this week.</p>
<h3 style="color:#1a1a2e;">What's included:</h3>
<ul style="padding-left:20px;line-height:1.8;">
  <li>✅ Service / Product One</li>
  <li>✅ Service / Product Two</li>
  <li>✅ Service / Product Three</li>
</ul>
<p style="color:#e53e3e;font-weight:600;">⏰ Offer ends midnight this Friday. Don't miss out!</p>
<table cellspacing="0" cellpadding="0" style="margin:24px 0;"><tr><td style="background:#1a56db;border-radius:8px;"><a href="#" style="display:inline-block;padding:14px 32px;color:#fff;text-decoration:none;font-weight:700;font-size:15px;">Claim My Discount →</a></td></tr></table>`,
  },
  announcement: {
    label: "Announcement",
    description: "New products or updates",
    icon: Zap,
    accent: "#7c3aed",
    preview: `<div style="padding:8px;font-size:8px;overflow:hidden;">
      <div style="color:#1a56db;font-weight:700;font-size:9px;margin-bottom:4px;">🚀 Exciting News!</div>
      <div style="background:#f0f4ff;border-left:3px solid #1a56db;padding:5px 6px;border-radius:0 4px 4px 0;margin-bottom:5px;">
        <div style="height:3px;background:#c7d7ff;border-radius:2px;margin-bottom:2px;width:70%"></div>
        <div style="height:3px;background:#c7d7ff;border-radius:2px;width:90%"></div>
      </div>
      <div style="background:#1a56db;border-radius:3px;padding:3px 6px;color:#fff;font-size:6px;display:inline-block;">Find Out More →</div>
    </div>`,
    html: `<h2 style="color:#1a56db;">🚀 Exciting News from Our Team!</h2>
<p>Hi {{first_name}},</p>
<p>We have some <strong>exciting news</strong> to share with you today — and you're among the first to hear it!</p>
<div style="background:#f0f4ff;border-left:4px solid #1a56db;padding:16px 20px;border-radius:0 8px 8px 0;margin:20px 0;">
  <h3 style="margin:0 0 8px;color:#1a1a2e;">Introducing [Your New Product/Service]</h3>
  <p style="margin:0;color:#4a4a5a;">Describe your announcement here. What is it? Why does it matter to your clients?</p>
</div>
<h3 style="color:#1a1a2e;">Key Benefits:</h3>
<ul style="padding-left:20px;line-height:1.8;">
  <li><strong>Benefit One</strong> — explain how this helps your client</li>
  <li><strong>Benefit Two</strong> — highlight the value it delivers</li>
  <li><strong>Benefit Three</strong> — make it relevant and specific</li>
</ul>
<table cellspacing="0" cellpadding="0" style="margin:24px 0;"><tr><td style="background:#1a56db;border-radius:8px;"><a href="#" style="display:inline-block;padding:12px 28px;color:#fff;text-decoration:none;font-weight:600;font-size:14px;">Find Out More →</a></td></tr></table>`,
  },
  followup: {
    label: "Follow-Up",
    description: "Re-engage past clients",
    icon: MessageSquare,
    accent: "#16a34a",
    preview: `<div style="padding:8px;font-size:8px;overflow:hidden;">
      <div style="height:4px;background:#e5e7eb;border-radius:2px;margin-bottom:3px;width:60%"></div>
      <div style="height:3px;background:#f3f4f6;border-radius:2px;margin-bottom:3px;width:95%"></div>
      <div style="height:3px;background:#f3f4f6;border-radius:2px;margin-bottom:6px;width:80%"></div>
      <div style="display:flex;gap:3px;margin-bottom:6px;">
        <div style="height:3px;background:#d1fae5;border-radius:2px;flex:1"></div>
        <div style="height:3px;background:#d1fae5;border-radius:2px;flex:1"></div>
      </div>
      <div style="background:#16a34a;border-radius:3px;padding:3px 6px;color:#fff;font-size:6px;display:inline-block;">Book a Call →</div>
    </div>`,
    html: `<p>Hi {{first_name}},</p>
<p>I hope this message finds you well! I'm reaching out to follow up and check whether you had a chance to consider the information we discussed recently.</p>
<ul style="padding-left:20px;line-height:1.8;">
  <li>📋 Point One — key takeaway from your last interaction</li>
  <li>💡 Point Two — the solution or recommendation you offered</li>
  <li>📞 Point Three — next steps or action items discussed</li>
</ul>
<p>I'd love to help you move forward and answer any questions you might have.</p>
<table cellspacing="0" cellpadding="0" style="margin:24px 0;"><tr><td style="background:#16a34a;border-radius:8px;"><a href="#" style="display:inline-block;padding:12px 28px;color:#fff;text-decoration:none;font-weight:600;font-size:14px;">Book a Call →</a></td></tr></table>
<p>Looking forward to hearing from you!</p>`,
  },
  event: {
    label: "Event Invite",
    description: "Webinars & workshops",
    icon: Calendar,
    accent: "#0891b2",
    preview: `<div style="padding:8px;font-size:8px;overflow:hidden;text-align:center;">
      <div style="font-size:14px;margin-bottom:2px;">📅</div>
      <div style="color:#1a56db;font-weight:700;font-size:8px;margin-bottom:4px;">You're Invited!</div>
      <div style="background:#f0f4ff;border-radius:3px;padding:4px;margin-bottom:5px;text-align:left;">
        <div style="height:3px;background:#c7d7ff;border-radius:2px;margin-bottom:2px;width:80%"></div>
        <div style="height:3px;background:#c7d7ff;border-radius:2px;margin-bottom:2px;"></div>
        <div style="height:3px;background:#c7d7ff;border-radius:2px;width:60%"></div>
      </div>
      <div style="background:#1a56db;border-radius:3px;padding:3px 6px;color:#fff;font-size:6px;display:inline-block;">Reserve My Seat →</div>
    </div>`,
    html: `<div style="text-align:center;margin-bottom:24px;">
  <span style="font-size:48px;">📅</span>
  <h2 style="color:#1a56db;margin:8px 0 4px;">You're Invited!</h2>
  <p style="color:#666;margin:0;">Join us for an exclusive event</p>
</div>
<p>Hi {{first_name}},</p>
<p>We'd like to personally invite you to <strong>[Event Name]</strong> — an exclusive session designed specifically for clients like you.</p>
<div style="background:#f0f4ff;border-radius:8px;padding:20px;margin:20px 0;">
  <table width="100%" cellspacing="0" cellpadding="0">
    <tr><td style="padding:6px 0;"><strong style="color:#1a56db;">📅 Date:</strong> <span>[Day, Date Month Year]</span></td></tr>
    <tr><td style="padding:6px 0;"><strong style="color:#1a56db;">⏰ Time:</strong> <span>[Start Time] – [End Time]</span></td></tr>
    <tr><td style="padding:6px 0;"><strong style="color:#1a56db;">📍 Venue:</strong> <span>[Location / Online]</span></td></tr>
    <tr><td style="padding:6px 0;"><strong style="color:#1a56db;">💰 Cost:</strong> <span>FREE — limited seats</span></td></tr>
  </table>
</div>
<table cellspacing="0" cellpadding="0" style="margin:24px auto;display:table;"><tr><td style="background:#1a56db;border-radius:8px;"><a href="#" style="display:inline-block;padding:14px 32px;color:#fff;text-decoration:none;font-weight:700;font-size:15px;">Reserve My Seat →</a></td></tr></table>`,
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  draft:     { label: "Draft",     color: "bg-gray-100 text-gray-600 border-gray-200",       icon: FileText },
  scheduled: { label: "Scheduled", color: "bg-blue-100 text-blue-700 border-blue-200",       icon: Clock },
  sending:   { label: "Sending",   color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Loader2 },
  sent:      { label: "Sent",      color: "bg-green-100 text-green-700 border-green-200",    icon: CheckCircle },
  paused:    { label: "Paused",    color: "bg-red-100 text-red-700 border-red-200",           icon: AlertCircle },
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
  const [view, setView] = useState<"list" | "builder">("list");
  const [tab, setTab] = useState<"campaigns" | "contacts">("campaigns");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<Stats>({ totalCampaigns: 0, totalContacts: 0, totalSent: 0, openRate: 0 });
  const [audienceCounts, setAudienceCounts] = useState({ subscribed: 0, brokerClients: 0 });
  const [loading, setLoading] = useState(true);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [showTestModal, setShowTestModal] = useState<Campaign | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [campaignSearch, setCampaignSearch] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    } finally { setLoading(false); }
  }
  useEffect(() => { loadAll(); }, []);

  async function sendCampaign(id: string) {
    setSending(id);
    try {
      const res = await fetch(`/api/campaigns/${id}/send`, { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Campaign sent to ${data.sent} recipient${data.sent !== 1 ? "s" : ""}`);
      await loadAll();
    } catch (err: any) { toast.error(err.message); }
    finally { setSending(null); }
  }

  async function deleteCampaign(id: string) {
    if (!confirm("Delete this campaign? This cannot be undone.")) return;
    const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) { toast.success("Campaign deleted"); loadAll(); }
    else toast.error("Failed to delete");
  }

  async function sendTest() {
    if (!showTestModal || !testEmail) return;
    const res = await fetch(`/api/campaigns/${showTestModal.id}/test`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail }),
    });
    const data = await res.json();
    if (res.ok) { toast.success(`Test email sent to ${testEmail}`); setShowTestModal(null); setTestEmail(""); }
    else toast.error(data.error);
  }

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
      const cs = lines.slice(1).map(line => {
        const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
        const obj: any = {};
        headers.forEach((h, i) => { obj[h] = vals[i] || ""; });
        return { email: obj.email, first_name: obj.first_name || obj.firstname || obj.name, last_name: obj.last_name || obj.lastname, company: obj.company, phone: obj.phone, tags: obj.tags };
      });
      const res = await fetch("/api/campaigns/contacts/import", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: cs }),
      });
      const data = await res.json();
      if (res.ok) { toast.success(`Imported ${data.imported} contacts (${data.skipped} skipped)`); loadAll(); }
      else toast.error(data.error);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function downloadTemplate() {
    const csv = "email,first_name,last_name,company,phone,tags\njohn@example.com,John,Doe,Acme Ltd,0821234567,clients";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "contacts-template.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  function openBuilder(campaign: Campaign | null) {
    setEditingCampaign(campaign);
    setView("builder");
  }

  if (view === "builder") {
    return (
      <CampaignBuilder
        campaign={editingCampaign}
        contacts={contacts}
        audienceCounts={audienceCounts}
        onBack={() => { setView("list"); setEditingCampaign(null); loadAll(); }}
      />
    );
  }

  const filteredCampaigns = campaigns.filter(c =>
    !campaignSearch || c.name.toLowerCase().includes(campaignSearch.toLowerCase()) || c.subject.toLowerCase().includes(campaignSearch.toLowerCase())
  );
  const filteredContacts = contacts.filter(c =>
    !contactSearch || c.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(contactSearch.toLowerCase()) ||
    (c.company || "").toLowerCase().includes(contactSearch.toLowerCase())
  );

  return (
    <div className="min-h-full bg-white dark:bg-gray-950">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #ffe4e6 0%, #fce7f3 35%, #fdf2f8 70%, #fff1f2 100%)" }}>
        <div className="pointer-events-none select-none absolute inset-0">
          <motion.div initial={{ opacity: 0, rotate: -5, y: 20 }} animate={{ opacity: 0.88, rotate: -3, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="absolute -left-4 top-4 w-40 rounded-2xl bg-white/85 backdrop-blur shadow-2xl border-2 border-white p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-full bg-rose-100 flex items-center justify-center"><Megaphone className="h-3.5 w-3.5 text-rose-600"/></div>
              <div className="space-y-1"><div className="h-2 w-14 rounded-full bg-gray-200"/><div className="h-1.5 w-8 rounded-full bg-gray-100"/></div>
            </div>
            <div className="h-3 w-full rounded-full bg-rose-100 mb-1.5"/>
            <div className="h-3 w-4/5 rounded-full bg-pink-100 mb-1.5"/>
            <div className="h-5 w-full rounded-lg bg-rose-500/15 mt-2"/>
          </motion.div>
          <motion.div initial={{ opacity: 0, rotate: 5, y: 20 }} animate={{ opacity: 0.85, rotate: 3, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute -right-3 top-5 w-36 rounded-2xl bg-white/85 backdrop-blur shadow-2xl border-2 border-white p-3">
            <div className="h-2 w-14 rounded-full bg-rose-200 mb-2"/>
            <div className="grid grid-cols-2 gap-1.5">
              {["bg-rose-100","bg-pink-100","bg-orange-100","bg-fuchsia-100"].map((c,i) => (<div key={i} className={`h-8 rounded-lg ${c}`}/>))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, rotate: 2, y: 30 }} animate={{ opacity: 0.72, rotate: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.28 }}
            className="absolute right-32 -bottom-2 w-28 rounded-2xl bg-white/70 backdrop-blur shadow-lg border-2 border-white p-2.5">
            <div className="h-2 w-10 rounded-full bg-gray-200 mb-2"/><div className="h-4 w-full rounded-lg bg-rose-100"/>
          </motion.div>
        </div>
        <div className="relative z-10 py-12 px-6 text-center max-w-2xl mx-auto">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2" style={{ color: "#881337" }}>
            Email Campaigns
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-rose-800/70 mb-6 text-sm">
            Create and send targeted email campaigns to your clients and subscribers
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-3 flex-wrap">
            <Button onClick={() => openBuilder(null)} className="bg-rose-700 hover:bg-rose-800 text-white shadow-md gap-2 rounded-xl">
              <Plus className="h-4 w-4" /> New Campaign
            </Button>
            <Button onClick={() => { setEditContact(null); setShowContactModal(true); }}
              variant="outline" className="bg-white/80 border-white shadow-sm gap-2 text-rose-900 hover:bg-white rounded-xl">
              <Plus className="h-4 w-4" /> Add Contact
            </Button>
          </motion.div>
        </div>
      </div>

      {/* ── Quick action bar ─────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white dark:bg-gray-950 px-4 py-2">
        <div className="max-w-5xl mx-auto flex items-center gap-0.5 overflow-x-auto scrollbar-none">
          {[
            { label: "Campaigns", icon: Megaphone, tab: "campaigns" as const, grad: "from-rose-500 to-pink-500" },
            { label: "Contacts",  icon: Users,     tab: "contacts"  as const, grad: "from-violet-500 to-purple-500" },
          ].map((a, i) => (
            <motion.button key={a.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => setTab(a.tab)}
              className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl transition-colors group min-w-[72px] shrink-0 ${tab === a.tab ? "bg-rose-50" : "hover:bg-gray-50"}`}>
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${a.grad} flex items-center justify-center shadow-sm ${tab === a.tab ? "scale-110" : ""} transition-transform`}>
                <a.icon className="h-4 w-4 text-white" />
              </div>
              <span className={`text-[11px] font-medium whitespace-nowrap ${tab === a.tab ? "text-rose-700" : "text-gray-600"}`}>{a.label}</span>
            </motion.button>
          ))}
          <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            onClick={loadAll}
            className="flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group min-w-[72px] shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <RefreshCw className="h-4 w-4 text-white" />
            </div>
            <span className="text-[11px] font-medium text-gray-600 whitespace-nowrap">Refresh</span>
          </motion.button>
          <div className="mx-2 h-10 w-px bg-gray-200 shrink-0" />
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            onClick={() => openBuilder(null)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all shrink-0">
            <Plus className="h-4 w-4" /> New Campaign
          </motion.button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Campaigns", value: stats.totalCampaigns, icon: Megaphone, grad: "from-blue-500 to-indigo-600" },
          { label: "Subscribers", value: stats.totalContacts.toLocaleString(), icon: Users, grad: "from-emerald-500 to-teal-600" },
          { label: "Emails Sent", value: stats.totalSent.toLocaleString(), icon: Send, grad: "from-violet-500 to-purple-600" },
          { label: "Avg Open Rate", value: `${stats.openRate}%`, icon: TrendingUp, grad: "from-orange-500 to-amber-600" },
        ].map(s => (
          <Card key={s.label} className="p-4 hover:shadow-md transition-shadow">
            <div className={`bg-gradient-to-br ${s.grad} w-9 h-9 rounded-lg flex items-center justify-center mb-3 shadow-sm`}>
              <s.icon className="h-5 w-5 text-white" />
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit mb-6">
        {(["campaigns", "contacts"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${tab === t ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
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
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Megaphone className="h-8 w-8 text-primary" />
              </div>
              <p className="font-semibold text-foreground text-lg">No campaigns yet</p>
              <p className="text-sm mt-1 mb-6">Create your first campaign and start reaching your audience</p>
              <Button onClick={() => openBuilder(null)} className="gap-2">
                <Sparkles className="h-4 w-4" />Create Your First Campaign
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCampaigns.map(c => {
                const sc = STATUS_CONFIG[c.status] || STATUS_CONFIG.draft;
                const Icon = sc.icon;
                const rate = openRate(c);
                return (
                  <motion.div key={c.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="p-4 hover:shadow-md transition-all cursor-pointer group border-l-4 border-l-transparent hover:border-l-primary"
                      onClick={() => openBuilder(c)}>
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <p className="font-semibold truncate">{c.name}</p>
                            <Badge className={`${sc.color} border gap-1 text-xs font-medium px-2 py-0.5 shrink-0`}>
                              <Icon className={`h-3 w-3 ${c.status === "sending" ? "animate-spin" : ""}`} />{sc.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{c.subject}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(c.created_at)}{c.sent_at ? ` · Sent ${formatDate(c.sent_at)}` : ""}
                            {c.from_name ? ` · From ${c.from_name}` : ""}
                          </p>
                        </div>

                        {c.status === "sent" && (
                          <div className="flex items-center gap-6 shrink-0">
                            <div className="text-center">
                              <p className="text-lg font-bold">{c.total_recipients}</p>
                              <p className="text-xs text-muted-foreground">Recipients</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold">{c.sent_count}</p>
                              <p className="text-xs text-muted-foreground">Sent</p>
                            </div>
                            <div className="text-center min-w-[72px]">
                              <p className="text-lg font-bold">{rate}%</p>
                              <div className="w-full h-1.5 bg-muted rounded-full mt-1">
                                <div className="h-full bg-orange-400 rounded-full transition-all" style={{ width: `${Math.min(rate, 100)}%` }} />
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">Opened</p>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                          {c.status !== "sent" && c.status !== "sending" && (
                            <>
                              <Button size="icon" variant="ghost" className="h-8 w-8" title="Edit" onClick={() => openBuilder(c)}>
                                <Edit3 className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8" title="Send Test" onClick={() => setShowTestModal(c)}>
                                <TestTube className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-50" title="Send Now"
                                onClick={() => sendCampaign(c.id)} disabled={sending === c.id}>
                                {sending === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                              </Button>
                            </>
                          )}
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50" title="Delete" onClick={() => deleteCampaign(c.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
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
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}><Upload className="h-3.5 w-3.5 mr-1" />Import CSV</Button>
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
                      {["Email", "Name", "Company", "Tags", "Status", ""].map(h => (
                        <th key={h} className={`text-left px-4 py-3 font-medium text-muted-foreground ${h === "" ? "text-right" : ""} ${h === "Company" ? "hidden md:table-cell" : ""} ${h === "Tags" ? "hidden lg:table-cell" : ""}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((c, i) => (
                      <tr key={c.id} className={`border-b last:border-0 hover:bg-muted/30 ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                        <td className="px-4 py-3 font-medium">{c.email}</td>
                        <td className="px-4 py-3 text-muted-foreground">{[c.first_name, c.last_name].filter(Boolean).join(" ") || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.company || "—"}</td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {c.tags ? <div className="flex gap-1 flex-wrap">{c.tags.split(",").map(t => <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">{t.trim()}</span>)}</div> : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={c.status === "subscribed" ? "bg-green-100 text-green-700 border-green-200 border text-xs" : "bg-gray-100 text-gray-600 border-gray-200 border text-xs"}>
                            {c.status === "subscribed" ? "Subscribed" : "Unsubscribed"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex gap-1 justify-end">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditContact(c); setShowContactModal(true); }}><Edit3 className="h-3.5 w-3.5" /></Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={() => deleteContact(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
              <h3 className="text-lg font-semibold mb-1">Send Test Email</h3>
              <p className="text-sm text-muted-foreground mb-4">Preview "<strong>{showTestModal.name}</strong>" in your inbox before sending to everyone.</p>
              <Label className="text-sm">Your email address</Label>
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
    </div>
  );
}

// ── Campaign Builder (full-page) ─────────────────────────────────────────────

const BUILDER_STEPS = ["Details", "Design", "Content", "Audience"];

function CampaignBuilder({ campaign, contacts, audienceCounts, onBack }: {
  campaign: Campaign | null;
  contacts: Contact[];
  audienceCounts: { subscribed: number; brokerClients: number };
  onBack: () => void;
}) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(campaign?.id || null);
  const [sendMode, setSendMode] = useState<"now" | "schedule">("now");
  const [scheduledAt, setScheduledAt] = useState<string>(
    campaign?.scheduled_at ? new Date(campaign.scheduled_at).toISOString().slice(0, 16) : ""
  );
  const [showBuilderTest, setShowBuilderTest] = useState(false);
  const [builderTestEmail, setBuilderTestEmail] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [form, setForm] = useState({
    name: campaign?.name || "",
    subject: campaign?.subject || "",
    from_name: campaign?.from_name || "",
    from_email: campaign?.from_email || "",
    reply_to: campaign?.reply_to || "",
    template_key: campaign?.template_key || "blank",
    body_html: campaign?.body_html || TEMPLATE_DEFS.blank.html,
    audience: campaign?.audience || "all",
    audience_tag: campaign?.audience_tag || "",
  });

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  function applyTemplate(key: string) {
    set("template_key", key);
    const tpl = TEMPLATE_DEFS[key as keyof typeof TEMPLATE_DEFS];
    if (tpl) set("body_html", tpl.html);
  }

  const allTags = [...new Set(contacts.flatMap(c => (c.tags || "").split(",").map(t => t.trim())).filter(Boolean))];

  async function saveDraft(): Promise<string | null> {
    if (!form.name || !form.subject) { toast.error("Campaign name and subject are required"); return null; }
    setSaving(true);
    try {
      const method = savedId ? "PUT" : "POST";
      const url = savedId ? `/api/campaigns/${savedId}` : "/api/campaigns/";
      const res = await fetch(url, {
        method, credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSavedId(data.id);
      return data.id;
    } catch (err: any) {
      toast.error(err.message);
      return null;
    } finally { setSaving(false); }
  }

  async function save(andSend = false) {
    if (!form.name || !form.subject) { toast.error("Campaign name and subject are required"); return; }
    setSaving(true);
    try {
      const method = savedId ? "PUT" : "POST";
      const url = savedId ? `/api/campaigns/${savedId}` : "/api/campaigns/";
      const res = await fetch(url, {
        method, credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSavedId(data.id);
      toast.success(savedId ? "Campaign updated" : "Campaign saved as draft");
      if (andSend) {
        setSending(true);
        const sRes = await fetch(`/api/campaigns/${data.id}/send`, { method: "POST", credentials: "include" });
        const sData = await sRes.json();
        if (!sRes.ok) throw new Error(sData.error);
        toast.success(`Sent to ${sData.sent} recipient${sData.sent !== 1 ? "s" : ""}! 🎉`);
        setSending(false);
      }
      onBack();
    } catch (err: any) {
      toast.error(err.message);
    } finally { setSaving(false); setSending(false); }
  }

  async function scheduleIt() {
    if (!scheduledAt) { toast.error("Please select a date and time"); return; }
    if (new Date(scheduledAt) <= new Date()) { toast.error("Scheduled time must be in the future"); return; }
    setSaving(true);
    try {
      const id = await saveDraft();
      if (!id) return;
      const res = await fetch(`/api/campaigns/${id}/schedule`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduled_at: scheduledAt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Campaign scheduled for ${new Date(scheduledAt).toLocaleString("en-ZA")} 📅`);
      onBack();
    } catch (err: any) {
      toast.error(err.message);
    } finally { setSaving(false); }
  }

  async function saveAndOpenTest() {
    const id = await saveDraft();
    if (!id) return;
    toast.success("Draft saved");
    setShowBuilderTest(true);
  }

  async function sendBuilderTest() {
    if (!savedId || !builderTestEmail) return;
    setTestSending(true);
    try {
      const res = await fetch(`/api/campaigns/${savedId}/test`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: builderTestEmail }),
      });
      const data = await res.json();
      if (res.ok) { toast.success(`Test email sent to ${builderTestEmail}`); setShowBuilderTest(false); setBuilderTestEmail(""); }
      else toast.error(data.error);
    } catch { toast.error("Failed to send test email"); }
    finally { setTestSending(false); }
  }

  const recipientCount = form.audience === "all" ? audienceCounts.subscribed
    : form.audience === "broker_clients" ? audienceCounts.brokerClients
    : form.audience === "all_with_clients" ? audienceCounts.subscribed + audienceCounts.brokerClients
    : 0;

  const previewHtml = form.body_html
    .replace(/\{\{first_name\}\}/g, "John")
    .replace(/\{\{name\}\}/g, "John Doe");

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Builder Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />Campaigns
          </button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">{form.name || "New Campaign"}</span>
        </div>

        {/* Step pills */}
        <div className="hidden md:flex items-center gap-1">
          {BUILDER_STEPS.map((s, i) => (
            <button key={s} onClick={() => setStep(i)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all ${step === i ? "bg-primary text-primary-foreground" : i < step ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {i < step ? <CheckCircle className="h-3 w-3" /> : <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">{i + 1}</span>}
              {s}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={saveAndOpenTest} disabled={saving || !form.name || !form.subject} title="Save draft and send a test email to yourself">
            <TestTube className="h-3.5 w-3.5 mr-1" />Test Email
          </Button>
          <Button variant="outline" size="sm" onClick={() => save(false)} disabled={saving}>
            {saving && !sending ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : null}Save Draft
          </Button>
          {step === BUILDER_STEPS.length - 1 && (
            <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1.5" onClick={() => save(true)} disabled={saving || sending}>
              {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Send Campaign
            </Button>
          )}
        </div>
      </div>

      {/* Mobile step indicator */}
      <div className="md:hidden flex gap-1 px-4 py-2 border-b bg-muted/30 overflow-x-auto">
        {BUILDER_STEPS.map((s, i) => (
          <button key={s} onClick={() => setStep(i)}
            className={`shrink-0 text-xs font-medium px-3 py-1 rounded-full transition-all ${step === i ? "bg-primary text-primary-foreground" : i < step ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
            {i < step ? "✓ " : ""}{s}
          </button>
        ))}
      </div>

      {/* Builder Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Step content */}
        <div className="w-full lg:w-[420px] shrink-0 overflow-y-auto border-r bg-background">
          <div className="p-6">
            {/* Step 0: Details */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold mb-1">Campaign Details</h2>
                  <p className="text-sm text-muted-foreground">Set up the basics of your campaign.</p>
                </div>
                <div>
                  <Label>Campaign Name <span className="text-red-500">*</span></Label>
                  <Input className="mt-1.5" placeholder="e.g. June Newsletter" value={form.name} onChange={e => set("name", e.target.value)} />
                  <p className="text-xs text-muted-foreground mt-1">Internal name — not shown to recipients</p>
                </div>
                <div>
                  <Label>Email Subject Line <span className="text-red-500">*</span></Label>
                  <Input className="mt-1.5" placeholder="e.g. 🚀 Big news from our team!" value={form.subject} onChange={e => set("subject", e.target.value)} />
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-muted-foreground">Shown in your recipients' inbox</p>
                    <span className={`text-xs ${form.subject.length > 60 ? "text-orange-500" : "text-muted-foreground"}`}>{form.subject.length}/60</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>From Name</Label>
                    <Input className="mt-1.5" placeholder="Your Business" value={form.from_name} onChange={e => set("from_name", e.target.value)} />
                  </div>
                  <div>
                    <Label>From Email</Label>
                    <Input className="mt-1.5" type="email" placeholder="you@domain.co.za" value={form.from_email} onChange={e => set("from_email", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Reply-To <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input className="mt-1.5" type="email" placeholder="replies@domain.co.za" value={form.reply_to} onChange={e => set("reply_to", e.target.value)} />
                </div>
                <Button className="w-full" onClick={() => setStep(1)} disabled={!form.name || !form.subject}>
                  Continue: Choose Template <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}

            {/* Step 1: Design */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold mb-1">Choose a Template</h2>
                  <p className="text-sm text-muted-foreground">Pick a starting style. You'll customise the content next.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(TEMPLATE_DEFS).map(([key, tmpl]) => {
                    const Icon = tmpl.icon;
                    const isSelected = form.template_key === key;
                    return (
                      <button key={key} onClick={() => applyTemplate(key)}
                        className={`text-left rounded-xl border-2 overflow-hidden transition-all ${isSelected ? "border-primary shadow-md" : "border-border hover:border-primary/40 hover:shadow-sm"}`}>
                        <div className="h-24 bg-white border-b overflow-hidden"
                          dangerouslySetInnerHTML={{ __html: tmpl.preview }} />
                        <div className={`p-2.5 ${isSelected ? "bg-primary/5" : ""}`}>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Icon className="h-3.5 w-3.5" style={{ color: tmpl.accent }} />
                            <p className="font-semibold text-xs">{tmpl.label}</p>
                            {isSelected && <CheckCircle className="h-3 w-3 text-primary ml-auto" />}
                          </div>
                          <p className="text-[10px] text-muted-foreground">{tmpl.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(0)}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
                  <Button className="flex-1" onClick={() => setStep(2)}>Edit Content <ChevronRight className="h-4 w-4 ml-1" /></Button>
                </div>
              </div>
            )}

            {/* Step 2: Content */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold mb-1">Email Content</h2>
                    <p className="text-sm text-muted-foreground">Write or generate your email body.</p>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1.5 shrink-0 border-purple-200 text-purple-700 hover:bg-purple-50"
                    onClick={() => setShowAi(v => !v)}>
                    <Sparkles className="h-3.5 w-3.5" />
                    {showAi ? "Close AI" : "Write with AI"}
                  </Button>
                </div>

                <AnimatePresence>
                  {showAi && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <AiGeneratePanel
                        onApply={(subject, body) => {
                          if (subject) set("subject", subject);
                          set("body_html", body);
                          setShowAi(false);
                          toast.success("AI content applied! Feel free to edit it.");
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <EmailVisualEditor value={form.body_html} onChange={v => set("body_html", v)} />

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
                  <Button className="flex-1" onClick={() => setStep(3)}>Choose Audience <ChevronRight className="h-4 w-4 ml-1" /></Button>
                </div>
              </div>
            )}

            {/* Step 3: Audience */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold mb-1">Audience & Send</h2>
                  <p className="text-sm text-muted-foreground">Choose who receives this campaign.</p>
                </div>
                <div>
                  <Label>Send to</Label>
                  <Select value={form.audience} onValueChange={v => set("audience", v)}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Campaign Contacts — subscribed ({audienceCounts.subscribed})</SelectItem>
                      <SelectItem value="broker_clients">My Clients — from Clients dashboard ({audienceCounts.brokerClients} with email)</SelectItem>
                      <SelectItem value="all_with_clients">Everyone — Contacts + Clients ({audienceCounts.subscribed + audienceCounts.brokerClients} combined)</SelectItem>
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
                        <SelectContent>{allTags.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    ) : (
                      <Input className="mt-1.5" placeholder="Enter tag name..." value={form.audience_tag} onChange={e => set("audience_tag", e.target.value)} />
                    )}
                  </div>
                )}

                {/* Send summary card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 dark:from-blue-950/30 dark:to-indigo-950/30 dark:border-blue-800">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Send className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Ready to send</p>
                      <p className="text-sm text-muted-foreground">{recipientCount.toLocaleString()} recipient{recipientCount !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subject</span><span className="font-medium truncate max-w-48">{form.subject || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">From</span><span className="font-medium">{form.from_name || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Template</span><span className="font-medium capitalize">{form.template_key}</span></div>
                  </div>
                </div>

                {form.audience === "broker_clients" && audienceCounts.brokerClients === 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                    No clients with email addresses found. Add client emails in the <strong>Clients</strong> section first.
                  </div>
                )}

                {/* Send mode toggle */}
                <div>
                  <Label className="text-sm font-semibold">When to send</Label>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setSendMode("now")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${sendMode === "now" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
                    >
                      <Send className="h-4 w-4" />Send Now
                    </button>
                    <button
                      type="button"
                      onClick={() => setSendMode("schedule")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${sendMode === "schedule" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
                    >
                      <Clock className="h-4 w-4" />Schedule
                    </button>
                  </div>
                </div>

                {sendMode === "schedule" && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Schedule send date &amp; time</p>
                    </div>
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                      onChange={e => setScheduledAt(e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-blue-700 dark:text-blue-400">The campaign will be sent automatically at the selected time.</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
                  <Button variant="outline" className="flex-1" onClick={() => save(false)} disabled={saving}>
                    {saving && !sending ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : null}Save Draft
                  </Button>
                </div>

                {sendMode === "now" ? (
                  <Button className="w-full bg-green-600 hover:bg-green-700 h-11 text-base gap-2" onClick={() => save(true)} disabled={saving || sending || recipientCount === 0}>
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Send to {recipientCount.toLocaleString()} recipient{recipientCount !== 1 ? "s" : ""}
                  </Button>
                ) : (
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base gap-2" onClick={scheduleIt} disabled={saving || !scheduledAt || recipientCount === 0}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
                    Schedule Campaign
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Builder Test Email Modal */}
        <AnimatePresence>
          {showBuilderTest && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={e => { if (e.target === e.currentTarget) { setShowBuilderTest(false); setBuilderTestEmail(""); } }}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-background rounded-xl shadow-2xl w-full max-w-md p-6">
                <h3 className="text-lg font-semibold mb-1">Send Test Email</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Preview "<strong>{form.name || "this campaign"}</strong>" in your inbox.
                </p>
                <Label className="text-sm">Send test to</Label>
                <Input
                  className="mt-1.5 mb-4"
                  type="email"
                  placeholder="you@example.com"
                  value={builderTestEmail}
                  onChange={e => setBuilderTestEmail(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && builderTestEmail) sendBuilderTest(); }}
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => { setShowBuilderTest(false); setBuilderTestEmail(""); }}>Cancel</Button>
                  <Button onClick={sendBuilderTest} disabled={!builderTestEmail || testSending}>
                    {testSending ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1" />}
                    Send Test
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right: Live email preview */}
        <div className="hidden lg:flex flex-1 flex-col bg-slate-100 dark:bg-slate-900 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-white dark:bg-slate-800 shrink-0">
            <Monitor className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Email Preview</span>
            <span className="ml-auto text-xs text-muted-foreground">How it looks to recipients</span>
          </div>
          <div className="flex-1 overflow-auto p-6 flex justify-center">
            <div className="w-full max-w-xl">
              {/* Simulated email client bar */}
              <div className="bg-white rounded-t-xl border border-b-0 px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="flex-1 bg-slate-100 rounded-full h-5 ml-2" />
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <div><span className="font-medium">From:</span> {form.from_name || "Your Business"} &lt;{form.from_email || "hello@yourdomain.co.za"}&gt;</div>
                  <div><span className="font-medium">Subject:</span> {form.subject || "Your email subject line"}</div>
                </div>
              </div>
              {/* Email body */}
              <div className="bg-slate-200 border border-t-0 rounded-b-xl p-4">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div style={{ background: "linear-gradient(135deg,#1a56db 0%,#1239a5 100%)", padding: "20px 28px", textAlign: "center" }}>
                    <h1 style={{ margin: 0, color: "#fff", fontSize: "18px", fontWeight: 700 }}>{form.from_name || "Your Business"}</h1>
                  </div>
                  <div className="p-6 text-sm font-sans leading-relaxed"
                    style={{ fontFamily: "Arial, sans-serif" }}
                    dangerouslySetInnerHTML={{ __html: previewHtml || "<p style='color:#9ca3af;'>Your email content will appear here...</p>" }} />
                  <div style={{ background: "#f8f8fa", padding: "12px 28px", textAlign: "center", borderTop: "1px solid #e8e8ec" }}>
                    <p style={{ margin: 0, color: "#9a9aaa", fontSize: "10px" }}>
                      You received this because you subscribed to updates from {form.from_name || "us"}.<br />
                      © {new Date().getFullYear()} {form.from_name || "Masakhe Business Solutions"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── AI Generate Panel ────────────────────────────────────────────────────────

const CAMPAIGN_TYPES = [
  { value: "newsletter", label: "Newsletter", icon: "📰" },
  { value: "promotion", label: "Promotion / Offer", icon: "🏷️" },
  { value: "announcement", label: "Announcement", icon: "🚀" },
  { value: "follow-up", label: "Follow-Up", icon: "💬" },
  { value: "event invite", label: "Event Invite", icon: "📅" },
];

function AiGeneratePanel({ onApply }: { onApply: (subject: string, body: string) => void }) {
  const [campaignType, setCampaignType] = useState("newsletter");
  const [businessDesc, setBusinessDesc] = useState("");
  const [topic, setTopic] = useState("");
  const [cta, setCta] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ subject: string; body_html: string } | null>(null);

  async function generate() {
    if (!topic.trim()) { toast.error("Please describe what this campaign is about"); return; }
    setGenerating(true);
    setResult(null);
    try {
      const res = await fetch("/api/campaigns/ai-generate", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignType, businessDesc, topic, cta }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally { setGenerating(false); }
  }

  return (
    <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/20 dark:border-purple-800 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="font-semibold text-sm">Write with AI</p>
          <p className="text-xs text-muted-foreground">Describe your campaign — AI writes the copy</p>
        </div>
      </div>

      {/* Campaign type */}
      <div>
        <Label className="text-xs">Campaign type</Label>
        <div className="flex gap-1.5 flex-wrap mt-1.5">
          {CAMPAIGN_TYPES.map(t => (
            <button key={t.value} onClick={() => setCampaignType(t.value)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all font-medium ${campaignType === t.value ? "bg-purple-600 text-white border-purple-600" : "bg-white border-border hover:border-purple-300 text-foreground"}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs">What does your business do? <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Input className="mt-1 text-sm h-8 bg-white" placeholder="e.g. We sell handmade skincare products in Cape Town" value={businessDesc} onChange={e => setBusinessDesc(e.target.value)} />
      </div>

      <div>
        <Label className="text-xs">What is this campaign about? <span className="text-red-500">*</span></Label>
        <Textarea className="mt-1 text-sm min-h-16 bg-white resize-none" placeholder="e.g. We're launching a 20% discount on all products this weekend to celebrate our 2nd anniversary" value={topic} onChange={e => setTopic(e.target.value)} />
      </div>

      <div>
        <Label className="text-xs">Call to action <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Input className="mt-1 text-sm h-8 bg-white" placeholder="e.g. Shop Now, Book a Call, Learn More" value={cta} onChange={e => setCta(e.target.value)} />
      </div>

      {result && (
        <div className="rounded-lg border border-purple-200 bg-white p-3 space-y-2">
          <p className="text-xs font-semibold text-purple-700 flex items-center gap-1"><Sparkles className="h-3 w-3" />Generated Content</p>
          <div>
            <p className="text-xs text-muted-foreground">Subject line:</p>
            <p className="text-sm font-medium mt-0.5">{result.subject}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Email body preview:</p>
            <div className="text-xs bg-slate-50 rounded p-2 max-h-32 overflow-y-auto leading-relaxed"
              dangerouslySetInnerHTML={{ __html: result.body_html.replace(/\{\{first_name\}\}/g, "John") }} />
          </div>
          <div className="flex gap-2 pt-1">
            <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700 gap-1.5" onClick={() => onApply(result.subject, result.body_html)}>
              <CheckCircle className="h-3.5 w-3.5" />Use This Content
            </Button>
            <Button size="sm" variant="outline" className="gap-1" onClick={generate} disabled={generating}>
              <RotateCcw className="h-3.5 w-3.5" />Regenerate
            </Button>
          </div>
        </div>
      )}

      {!result && (
        <Button className="w-full gap-2 bg-purple-600 hover:bg-purple-700" onClick={generate} disabled={generating || !topic.trim()}>
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {generating ? "Generating your email..." : "Generate Email Content"}
        </Button>
      )}
    </div>
  );
}

// ── Contact Modal ────────────────────────────────────────────────────────────

function ContactModal({ contact, onClose, onSaved }: { contact: Contact | null; onClose: () => void; onSaved: () => void }) {
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
      const res = await fetch(url, { method, credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(contact ? "Contact updated" : "Contact added");
      onSaved();
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
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
          <div><Label>Email <span className="text-red-500">*</span></Label><Input className="mt-1.5" type="email" placeholder="client@example.co.za" value={form.email} onChange={e => set("email", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>First Name</Label><Input className="mt-1.5" placeholder="John" value={form.first_name} onChange={e => set("first_name", e.target.value)} /></div>
            <div><Label>Last Name</Label><Input className="mt-1.5" placeholder="Smith" value={form.last_name} onChange={e => set("last_name", e.target.value)} /></div>
          </div>
          <div><Label>Company</Label><Input className="mt-1.5" placeholder="Acme (Pty) Ltd" value={form.company} onChange={e => set("company", e.target.value)} /></div>
          <div><Label>Phone</Label><Input className="mt-1.5" placeholder="0821234567" value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
          <div><Label>Tags <span className="text-muted-foreground text-xs">(comma-separated)</span></Label><Input className="mt-1.5" placeholder="clients, vip, newsletter" value={form.tags} onChange={e => set("tags", e.target.value)} /></div>
          {contact && (
            <div><Label>Status</Label>
              <Select value={form.status} onValueChange={v => set("status", v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="subscribed">Subscribed</SelectItem><SelectItem value="unsubscribed">Unsubscribed</SelectItem></SelectContent>
              </Select>
            </div>
          )}
        </div>
        <div className="flex gap-2 justify-end px-6 py-4 border-t bg-muted/30">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : null}{contact ? "Update" : "Add Contact"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
