import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Sparkles, Receipt, FileSearch, AlertTriangle, ShieldAlert,
  Mail, Send, UserMinus, Cake, PartyPopper, RefreshCw, Plus,
  Trash2, Save, Loader2, ChevronDown, ChevronRight, Activity, X, Palette,
} from "lucide-react";
import { TEMPLATES, InvoicePreview } from "@/components/InvoiceTemplates";
import { hasSavedTemplateConfig, getSavedTemplateName, loadTemplateConfig } from "@/components/InvoiceTemplateDesigner";

type Settings = {
  thank_you_enabled: number; thank_you_subject: string; thank_you_body: string;
  late_fee_enabled: number; late_fee_percent: number; late_fee_after_days: number;
  stop_credit_enabled: number; stop_credit_threshold_cents: number;
  quote_expiry_days: number; quote_followup_enabled: number;
  quote_followup_after_days: number; quote_max_followups: number;
  quote_followup_subject: string; quote_followup_body: string;
  lead_autoreply_enabled: number; lead_autoreply_subject: string; lead_autoreply_body: string;
  drip_enabled: number; drip_emails_json: string;
  inactive_nudge_enabled: number; inactive_nudge_after_days: number;
  inactive_nudge_subject: string; inactive_nudge_body: string;
  birthday_msg_enabled: number; birthday_msg_subject: string; birthday_msg_body: string;
  anniversary_msg_enabled: number; anniversary_msg_subject: string; anniversary_msg_body: string;
};

type DripEmail = { delay_days: number; subject: string; body: string };

type ClientOption = {
  id: string;
  full_name: string;
  business_name?: string;
  email?: string;
  business_email?: string;
  phone?: string;
  business_phone?: string;
  physical_address?: string;
  business_address?: string;
};

type Recurring = {
  id: string;
  name: string;
  customer_name: string;
  customer_email: string | null;
  customer_address: string | null;
  customer_phone: string | null;
  reference: string | null;
  payment_terms: string | null;
  notes: string | null;
  items_json: string;
  vat_enabled: number;
  vat_cents: number;
  total_cents: number;
  template: number;
  frequency: string;
  custom_days: number | null;
  start_date: string;
  end_date: string | null;
  next_run_at: string;
  last_run_at: string | null;
  invoices_generated: number;
  active: number;
  auto_send: number;
  created_at: string;
};

type LogEntry = {
  id: string;
  type: string;
  target_id: string | null;
  recipient: string | null;
  message: string | null;
  status: string;
  created_at: string;
};

type Item = { name: string; qty: number; unitPrice: number };

const TYPE_LABELS: Record<string, string> = {
  recurring_invoice: "Recurring invoice",
  quote_followup: "Quote follow-up",
  quote_expiry: "Quote expiry notice",
  late_fee: "Late fee added",
  thank_you: "Thank-you receipt",
  stop_credit: "Stop-credit alert",
  lead_autoreply: "Lead auto-reply",
  lead_drip: "Lead drip email",
  inactive_nudge: "Inactive client nudge",
  birthday: "Birthday message",
  anniversary: "Anniversary message",
};

export default function AutomationsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recurring, setRecurring] = useState<Recurring[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["overview"]));
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<Recurring | null>(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [s, r, l] = await Promise.all([
        fetch("/api/automations/settings", { credentials: "include" }).then((x) => x.json()),
        fetch("/api/automations/recurring", { credentials: "include" }).then((x) => x.json()),
        fetch("/api/automations/log?limit=30", { credentials: "include" }).then((x) => x.json()),
      ]);
      setSettings(s);
      setRecurring(Array.isArray(r) ? r : []);
      setLog(Array.isArray(l) ? l : []);
    } catch (e: any) {
      toast.error("Failed to load automations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const setField = <K extends keyof Settings>(k: K, v: Settings[K]) => {
    setSettings((s) => (s ? { ...s, [k]: v } : s));
  };

  async function saveSettings() {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/automations/settings", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Save failed");
      toast.success("Automation settings saved");
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecurring(id: string) {
    if (!confirm("Delete this recurring invoice template? This won't affect invoices already generated.")) return;
    const res = await fetch(`/api/automations/recurring/${id}`, {
      method: "DELETE", credentials: "include",
    });
    if (res.ok) {
      toast.success("Deleted");
      loadAll();
    } else {
      toast.error("Delete failed");
    }
  }

  async function toggleRecurringActive(r: Recurring) {
    const res = await fetch(`/api/automations/recurring/${r.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: r.active ? 0 : 1 }),
    });
    if (res.ok) loadAll();
  }

  if (loading || !settings) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const enabledCount = [
    settings.thank_you_enabled,
    settings.late_fee_enabled,
    settings.stop_credit_enabled,
    settings.quote_followup_enabled,
    settings.lead_autoreply_enabled,
    settings.drip_enabled,
    settings.inactive_nudge_enabled,
    settings.birthday_msg_enabled,
    settings.anniversary_msg_enabled,
  ].filter(Boolean).length;

  return (
    <div className="min-h-full bg-white dark:bg-gray-950">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #fef3c7 0%, #fed7aa 30%, #ffedd5 70%, #fef9c3 100%)" }}>
        <div className="pointer-events-none select-none absolute inset-0">
          <motion.div initial={{ opacity: 0, rotate: -5, y: 20 }} animate={{ opacity: 0.88, rotate: -3, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="absolute -left-4 top-4 w-40 rounded-2xl bg-white/85 backdrop-blur shadow-2xl border-2 border-white p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center"><Sparkles className="h-3.5 w-3.5 text-amber-600"/></div>
              <div className="space-y-1"><div className="h-2 w-14 rounded-full bg-gray-200"/><div className="h-1.5 w-8 rounded-full bg-gray-100"/></div>
            </div>
            <div className="space-y-1.5">
              {[["w-full","bg-amber-100"],["w-4/5","bg-orange-100"],["w-3/5","bg-amber-50"]].map(([w,c],i) => <div key={i} className={`h-3 ${w} rounded-lg ${c}`}/>)}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="h-3 w-3 rounded-full bg-emerald-300"/><div className="h-1.5 w-16 rounded-full bg-gray-100"/>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, rotate: 5, y: 20 }} animate={{ opacity: 0.85, rotate: 3, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute -right-3 top-5 w-36 rounded-2xl bg-white/85 backdrop-blur shadow-2xl border-2 border-white p-3">
            <div className="h-2 w-14 rounded-full bg-amber-200 mb-2"/>
            <div className="space-y-2">
              {[RefreshCw,Mail,Send].map((Icon,i) => (
                <div key={i} className="flex items-center gap-2"><div className="h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center"><Icon className="h-2.5 w-2.5 text-amber-600"/></div><div className="h-1.5 flex-1 rounded-full bg-gray-100"/></div>
              ))}
            </div>
          </motion.div>
        </div>
        <div className="relative z-10 py-12 px-6 text-center max-w-2xl mx-auto">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2" style={{ color: "#78350f" }}>
            Automations
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-amber-800/70 mb-6 text-sm">
            Set it once. Masakhe handles invoices, follow-ups, and customer love on autopilot
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Button onClick={saveSettings} disabled={saving}
              className="bg-amber-700 hover:bg-amber-800 text-white shadow-md gap-2 rounded-xl">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save All Settings
            </Button>
          </motion.div>
        </div>
      </div>

      {/* ── Quick action bar ─────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white dark:bg-gray-950 px-4 py-2">
        <div className="max-w-6xl mx-auto flex items-center gap-0.5 overflow-x-auto scrollbar-none">
          {[
            { label: "Money In",  icon: Receipt,      grad: "from-emerald-500 to-teal-500" },
            { label: "Money Out", icon: FileSearch,   grad: "from-rose-500 to-red-500" },
            { label: "Client Care",icon: Mail,        grad: "from-violet-500 to-purple-500" },
          ].map((a, i) => (
            <motion.div key={a.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors min-w-[80px] shrink-0">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${a.grad} flex items-center justify-center shadow-sm`}>
                <a.icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-[11px] font-medium text-gray-600 whitespace-nowrap">{a.label}</span>
            </motion.div>
          ))}
          <div className="mx-2 h-10 w-px bg-gray-200 shrink-0" />
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            onClick={saveSettings} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all shrink-0">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Settings
          </motion.button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Active automations" value={`${enabledCount} of 9`} icon={<Sparkles className="h-4 w-4" />} accent="amber" />
        <StatCard label="Recurring templates" value={String(recurring.length)} icon={<RefreshCw className="h-4 w-4" />} accent="emerald" />
        <StatCard label="Active recurrings" value={String(recurring.filter(r => r.active).length)} icon={<Activity className="h-4 w-4" />} accent="blue" />
        <StatCard label="Recent activity" value={String(log.length)} icon={<Mail className="h-4 w-4" />} accent="purple" />
      </div>

      {/* ── Money-In group ─────────────────────────────────────────────── */}
      <SectionGroup title="Money In" icon={<Receipt className="h-5 w-5" />} accent="emerald">
        <Section
          id="recurring"
          open={openSections.has("recurring")}
          onToggle={() => toggleSection("recurring")}
          icon={<RefreshCw className="h-5 w-5 text-emerald-600" />}
          title="Recurring invoices"
          subtitle="Auto-generate (and email) the same invoice on a schedule"
          enabled={recurring.some(r => r.active)}
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {recurring.length === 0
                  ? "No recurring invoices yet."
                  : `${recurring.length} template${recurring.length === 1 ? "" : "s"} (${recurring.filter(r => r.active).length} active)`}
              </p>
              <Button size="sm" onClick={() => { setEditingRecurring(null); setShowRecurringForm(true); }}>
                <Plus className="h-4 w-4 mr-1" /> New recurring
              </Button>
            </div>

            {recurring.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="text-left">
                      <th className="p-3">Name</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Frequency</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3">Next run</th>
                      <th className="p-3 text-right">Generated</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recurring.map((r) => (
                      <tr key={r.id} className="border-t">
                        <td className="p-3 font-medium">{r.name}</td>
                        <td className="p-3 text-muted-foreground">{r.customer_name}</td>
                        <td className="p-3 capitalize text-muted-foreground">
                          {r.frequency === "custom_days" ? `Every ${r.custom_days} days` : r.frequency}
                        </td>
                        <td className="p-3 text-right font-semibold">R{(r.total_cents / 100).toFixed(2)}</td>
                        <td className="p-3 text-muted-foreground">
                          {r.active ? new Date(r.next_run_at).toLocaleDateString("en-ZA") : <span className="text-amber-600">Paused</span>}
                        </td>
                        <td className="p-3 text-right text-muted-foreground">{r.invoices_generated}</td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleRecurringActive(r)}
                              className={r.active ? "" : "text-emerald-700"}
                            >
                              {r.active ? "Pause" : "Resume"}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => { setEditingRecurring(r); setShowRecurringForm(true); }}>
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => deleteRecurring(r.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Section>

        <Section
          id="thank_you"
          open={openSections.has("thank_you")}
          onToggle={() => toggleSection("thank_you")}
          icon={<Send className="h-5 w-5 text-emerald-600" />}
          title="Thank-you receipt"
          subtitle="Email customer when an invoice is marked paid"
          enabled={!!settings.thank_you_enabled}
        >
          <ToggleRow
            checked={!!settings.thank_you_enabled}
            onChange={(v) => setField("thank_you_enabled", v ? 1 : 0)}
            label="Send a thank-you receipt automatically when I mark an invoice paid"
          />
          <TemplateEditor
            subject={settings.thank_you_subject}
            body={settings.thank_you_body}
            onSubject={(v) => setField("thank_you_subject", v)}
            onBody={(v) => setField("thank_you_body", v)}
            tokens={["customer_name", "amount", "invoice_number", "business_name"]}
          />
        </Section>

        <Section
          id="quotes"
          open={openSections.has("quotes")}
          onToggle={() => toggleSection("quotes")}
          icon={<FileSearch className="h-5 w-5 text-emerald-600" />}
          title="Quote follow-ups & expiry"
          subtitle="Nudge prospects after a few days; notify when a quote expires"
          enabled={!!settings.quote_followup_enabled}
        >
          <ToggleRow
            checked={!!settings.quote_followup_enabled}
            onChange={(v) => setField("quote_followup_enabled", v ? 1 : 0)}
            label="Auto-send follow-up emails on unaccepted quotes"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <NumberField label="Quote validity (days)" value={settings.quote_expiry_days} onChange={(v) => setField("quote_expiry_days", v)} />
            <NumberField label="First follow-up after (days)" value={settings.quote_followup_after_days} onChange={(v) => setField("quote_followup_after_days", v)} />
            <NumberField label="Max follow-ups" value={settings.quote_max_followups} onChange={(v) => setField("quote_max_followups", v)} />
          </div>
          <TemplateEditor
            subject={settings.quote_followup_subject}
            body={settings.quote_followup_body}
            onSubject={(v) => setField("quote_followup_subject", v)}
            onBody={(v) => setField("quote_followup_body", v)}
            tokens={["customer_name", "amount", "invoice_number", "quote_date", "business_name"]}
          />
        </Section>

        <Section
          id="late_fee"
          open={openSections.has("late_fee")}
          onToggle={() => toggleSection("late_fee")}
          icon={<AlertTriangle className="h-5 w-5 text-emerald-600" />}
          title="Late-payment fees"
          subtitle="Auto-add a percentage fee to overdue invoices"
          enabled={!!settings.late_fee_enabled}
        >
          <ToggleRow
            checked={!!settings.late_fee_enabled}
            onChange={(v) => setField("late_fee_enabled", v ? 1 : 0)}
            label="Add a late-payment fee to overdue invoices"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Fee percentage (%)</Label>
              <Input
                type="number" min={0} max={100} step={0.5}
                value={settings.late_fee_percent}
                onChange={(e) => setField("late_fee_percent", Number(e.target.value))}
              />
            </div>
            <NumberField label="Apply after (days overdue)" value={settings.late_fee_after_days} onChange={(v) => setField("late_fee_after_days", v)} />
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            The fee is added to the invoice total once, and the customer receives a notice email.
          </p>
        </Section>

        <Section
          id="stop_credit"
          open={openSections.has("stop_credit")}
          onToggle={() => toggleSection("stop_credit")}
          icon={<ShieldAlert className="h-5 w-5 text-emerald-600" />}
          title="Stop-credit alert"
          subtitle="Get warned when a customer's outstanding balance gets too high"
          enabled={!!settings.stop_credit_enabled}
        >
          <ToggleRow
            checked={!!settings.stop_credit_enabled}
            onChange={(v) => setField("stop_credit_enabled", v ? 1 : 0)}
            label="Alert me when a customer's outstanding balance crosses my threshold"
          />
          <div>
            <Label className="text-xs">Threshold (Rands)</Label>
            <Input
              type="number" min={0}
              value={Math.round(settings.stop_credit_threshold_cents / 100)}
              onChange={(e) => setField("stop_credit_threshold_cents", Math.round(Number(e.target.value) * 100))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Currently: R{(settings.stop_credit_threshold_cents / 100).toLocaleString("en-ZA")}
            </p>
          </div>
        </Section>
      </SectionGroup>

      {/* ── CRM group ──────────────────────────────────────────────────── */}
      <SectionGroup title="Customer Relationships" icon={<Mail className="h-5 w-5" />} accent="blue">
        <Section
          id="autoreply"
          open={openSections.has("autoreply")}
          onToggle={() => toggleSection("autoreply")}
          icon={<Mail className="h-5 w-5 text-blue-600" />}
          title="Lead auto-reply"
          subtitle="Instant acknowledgement when someone fills your website contact form"
          enabled={!!settings.lead_autoreply_enabled}
        >
          <ToggleRow
            checked={!!settings.lead_autoreply_enabled}
            onChange={(v) => setField("lead_autoreply_enabled", v ? 1 : 0)}
            label="Send an automatic reply to new website leads"
          />
          <TemplateEditor
            subject={settings.lead_autoreply_subject}
            body={settings.lead_autoreply_body}
            onSubject={(v) => setField("lead_autoreply_subject", v)}
            onBody={(v) => setField("lead_autoreply_body", v)}
            tokens={["lead_name", "business_name"]}
          />
        </Section>

        <Section
          id="drip"
          open={openSections.has("drip")}
          onToggle={() => toggleSection("drip")}
          icon={<Send className="h-5 w-5 text-blue-600" />}
          title="Lead drip campaign"
          subtitle="Multi-step email sequence to warm up leads"
          enabled={!!settings.drip_enabled}
        >
          <ToggleRow
            checked={!!settings.drip_enabled}
            onChange={(v) => setField("drip_enabled", v ? 1 : 0)}
            label="Run drip emails on new leads (after the auto-reply)"
          />
          <DripEditor
            value={settings.drip_emails_json}
            onChange={(v) => setField("drip_emails_json", v)}
          />
        </Section>

        <Section
          id="inactive"
          open={openSections.has("inactive")}
          onToggle={() => toggleSection("inactive")}
          icon={<UserMinus className="h-5 w-5 text-blue-600" />}
          title="Inactive client nudge"
          subtitle="Gently re-engage clients who've gone quiet"
          enabled={!!settings.inactive_nudge_enabled}
        >
          <ToggleRow
            checked={!!settings.inactive_nudge_enabled}
            onChange={(v) => setField("inactive_nudge_enabled", v ? 1 : 0)}
            label="Email clients who haven't been contacted in a while"
          />
          <NumberField label="Send after (days of inactivity)" value={settings.inactive_nudge_after_days} onChange={(v) => setField("inactive_nudge_after_days", v)} />
          <TemplateEditor
            subject={settings.inactive_nudge_subject}
            body={settings.inactive_nudge_body}
            onSubject={(v) => setField("inactive_nudge_subject", v)}
            onBody={(v) => setField("inactive_nudge_body", v)}
            tokens={["customer_name", "business_name"]}
          />
        </Section>

        <Section
          id="birthday"
          open={openSections.has("birthday")}
          onToggle={() => toggleSection("birthday")}
          icon={<Cake className="h-5 w-5 text-blue-600" />}
          title="Birthday wishes"
          subtitle="Auto-send a birthday message on the day"
          enabled={!!settings.birthday_msg_enabled}
        >
          <ToggleRow
            checked={!!settings.birthday_msg_enabled}
            onChange={(v) => setField("birthday_msg_enabled", v ? 1 : 0)}
            label="Send happy-birthday emails to clients"
          />
          <p className="text-xs text-muted-foreground mb-3">
            Add a date of birth on each client (in your CRM) to enable.
          </p>
          <TemplateEditor
            subject={settings.birthday_msg_subject}
            body={settings.birthday_msg_body}
            onSubject={(v) => setField("birthday_msg_subject", v)}
            onBody={(v) => setField("birthday_msg_body", v)}
            tokens={["customer_name", "business_name"]}
          />
        </Section>

        <Section
          id="anniversary"
          open={openSections.has("anniversary")}
          onToggle={() => toggleSection("anniversary")}
          icon={<PartyPopper className="h-5 w-5 text-blue-600" />}
          title="Anniversary message"
          subtitle="Celebrate the day someone became a client (or company anniversary)"
          enabled={!!settings.anniversary_msg_enabled}
        >
          <ToggleRow
            checked={!!settings.anniversary_msg_enabled}
            onChange={(v) => setField("anniversary_msg_enabled", v ? 1 : 0)}
            label="Send anniversary emails on the day"
          />
          <TemplateEditor
            subject={settings.anniversary_msg_subject}
            body={settings.anniversary_msg_body}
            onSubject={(v) => setField("anniversary_msg_subject", v)}
            onBody={(v) => setField("anniversary_msg_body", v)}
            tokens={["customer_name", "business_name"]}
          />
        </Section>
      </SectionGroup>

      {/* Activity log */}
      <Card className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-amber-500" />
            Recent automation activity
          </h2>
          <Button variant="outline" size="sm" onClick={loadAll}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </div>
        {log.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No automation activity yet. Once your automations start firing, you'll see them here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="p-2">When</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Recipient</th>
                  <th className="p-2">Detail</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {log.map((l) => (
                  <tr key={l.id} className="border-t">
                    <td className="p-2 text-muted-foreground whitespace-nowrap">
                      {new Date(l.created_at).toLocaleString("en-ZA", {
                        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="p-2 font-medium">{TYPE_LABELS[l.type] || l.type}</td>
                    <td className="p-2 text-muted-foreground">{l.recipient || "—"}</td>
                    <td className="p-2 text-muted-foreground">{l.message || "—"}</td>
                    <td className="p-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${l.status === "sent" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showRecurringForm && (
        <RecurringForm
          existing={editingRecurring}
          onClose={() => { setShowRecurringForm(false); setEditingRecurring(null); }}
          onSaved={() => { setShowRecurringForm(false); setEditingRecurring(null); loadAll(); }}
        />
      )}
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent: "amber" | "emerald" | "blue" | "purple" }) {
  const grads = {
    amber: "from-amber-500 to-orange-600",
    emerald: "from-emerald-500 to-teal-600",
    blue: "from-blue-500 to-indigo-600",
    purple: "from-violet-500 to-purple-600",
  };
  return (
    <Card className="p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${grads[accent]} shadow-sm text-white`}>{icon}</div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground truncate">{label}</div>
        <div className="text-lg font-bold">{value}</div>
      </div>
    </Card>
  );
}

function SectionGroup({ title, icon, accent, children }: { title: string; icon: React.ReactNode; accent: "emerald" | "blue"; children: React.ReactNode }) {
  const accentColor = accent === "emerald" ? "text-emerald-700" : "text-blue-700";
  return (
    <div className="space-y-3">
      <h2 className={`text-lg font-semibold flex items-center gap-2 ${accentColor}`}>
        {icon} {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Section({
  id, open, onToggle, icon, title, subtitle, enabled, children,
}: {
  id: string; open: boolean; onToggle: () => void;
  icon: React.ReactNode; title: string; subtitle: string; enabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 text-left"
      >
        <div className="flex items-start gap-3 min-w-0">
          {icon}
          <div className="min-w-0">
            <div className="font-semibold flex items-center gap-2 flex-wrap">
              {title}
              {enabled && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium uppercase">
                  Active
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">{subtitle}</div>
          </div>
        </div>
        {open ? <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" /> : <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />}
      </button>
      {open && <div className="border-t p-4 md:p-6 space-y-4 bg-muted/10">{children}</div>}
    </Card>
  );
}

function ToggleRow({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white border rounded-lg mb-3">
      <Switch checked={checked} onCheckedChange={onChange} />
      <span className="text-sm">{label}</span>
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input type="number" min={0} value={value ?? 0} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function TemplateEditor({
  subject, body, onSubject, onBody, tokens,
}: {
  subject: string; body: string;
  onSubject: (v: string) => void; onBody: (v: string) => void;
  tokens: string[];
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Email subject</Label>
        <Input value={subject || ""} onChange={(e) => onSubject(e.target.value)} />
      </div>
      <div>
        <Label className="text-xs">Email body</Label>
        <Textarea
          rows={7}
          value={body || ""}
          onChange={(e) => onBody(e.target.value)}
          className="font-mono text-sm"
        />
      </div>
      <div className="text-xs text-muted-foreground">
        <span className="font-semibold">Tokens you can use:</span>{" "}
        {tokens.map((t) => (
          <code key={t} className="mx-1 px-1.5 py-0.5 bg-muted rounded">{`{{${t}}}`}</code>
        ))}
      </div>
    </div>
  );
}

function DripEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const drips: DripEmail[] = useMemo(() => {
    try {
      const parsed = JSON.parse(value || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }, [value]);

  function update(i: number, patch: Partial<DripEmail>) {
    const next = drips.map((d, idx) => idx === i ? { ...d, ...patch } : d);
    onChange(JSON.stringify(next));
  }
  function add() {
    onChange(JSON.stringify([...drips, { delay_days: 3, subject: "Following up", body: "Hi {{lead_name}},\n\n…\n\nKind regards,\n{{business_name}}" }]));
  }
  function remove(i: number) {
    onChange(JSON.stringify(drips.filter((_, idx) => idx !== i)));
  }

  return (
    <div className="space-y-3">
      {drips.length === 0 && (
        <p className="text-xs text-muted-foreground">No drip emails defined yet.</p>
      )}
      {drips.map((d, i) => (
        <div key={i} className="border rounded-lg p-3 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-sm">Drip #{i + 1}</div>
            <Button variant="ghost" size="sm" onClick={() => remove(i)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <Label className="text-xs">Send after (days)</Label>
              <Input type="number" min={0} value={d.delay_days} onChange={(e) => update(i, { delay_days: Number(e.target.value) })} />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Subject</Label>
              <Input value={d.subject} onChange={(e) => update(i, { subject: e.target.value })} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Body</Label>
            <Textarea rows={4} value={d.body} onChange={(e) => update(i, { body: e.target.value })} className="font-mono text-sm" />
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add}>
        <Plus className="h-4 w-4 mr-1" /> Add drip step
      </Button>
      <p className="text-xs text-muted-foreground">
        Tokens: <code className="px-1 bg-muted rounded">{`{{lead_name}}`}</code>{" "}
        <code className="px-1 bg-muted rounded">{`{{business_name}}`}</code>
      </p>
    </div>
  );
}

// ── Recurring invoice form modal ────────────────────────────────────────────
function RecurringForm({ existing, onClose, onSaved }: { existing: Recurring | null; onClose: () => void; onSaved: () => void }) {
  const initialItems = (() => {
    if (!existing) return [{ name: "", qty: 1, unitPrice: 0 }];
    try { return JSON.parse(existing.items_json) as Item[]; }
    catch { return [{ name: "", qty: 1, unitPrice: 0 }]; }
  })();

  const [name, setName] = useState(existing?.name || "");
  const [customerName, setCustomerName] = useState(existing?.customer_name || "");
  const [customerEmail, setCustomerEmail] = useState(existing?.customer_email || "");
  const [customerAddress, setCustomerAddress] = useState(existing?.customer_address || "");
  const [customerPhone, setCustomerPhone] = useState(existing?.customer_phone || "");
  const [reference, setReference] = useState(existing?.reference || "");
  const [paymentTerms, setPaymentTerms] = useState(existing?.payment_terms || "Due in 7 days");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [items, setItems] = useState<Item[]>(initialItems);
  const [vatEnabled, setVatEnabled] = useState(!!existing?.vat_enabled);
  const [frequency, setFrequency] = useState(existing?.frequency || "monthly");
  const [customDays, setCustomDays] = useState(existing?.custom_days || 30);
  const [startDate, setStartDate] = useState(existing?.start_date?.slice(0, 10) || new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(existing?.end_date?.slice(0, 10) || "");
  const [autoSend, setAutoSend] = useState(existing ? !!existing.auto_send : true);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(existing?.template || 1);
  const [customTemplateName, setCustomTemplateName] = useState<string>(() => getSavedTemplateName() || "Custom");
  const [hasCustomTemplate, setHasCustomTemplate] = useState<boolean>(() => hasSavedTemplateConfig());

  useEffect(() => {
    fetch("/api/clients/for-invoice", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setClients(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  function applyClient(id: string) {
    setSelectedClientId(id);
    const c = clients.find((cl) => cl.id === id);
    if (!c) return;
    setCustomerName(c.business_name || c.full_name);
    setCustomerEmail(c.business_email || c.email || "");
    setCustomerPhone(c.business_phone || c.phone || "");
    setCustomerAddress(c.business_address || c.physical_address || "");
  }

  const subtotal = items.reduce((s, it) => s + (it.qty || 1) * (it.unitPrice || 0), 0);
  const vatCents = vatEnabled ? Math.round(subtotal * 100 * 0.15) : 0;
  const totalCents = Math.round(subtotal * 100) + vatCents;

  function setItem(i: number, patch: Partial<Item>) {
    setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, ...patch } : it));
  }

  async function save() {
    if (!name.trim() || !customerName.trim()) {
      toast.error("Template name and customer name are required");
      return;
    }
    if (items.length === 0 || !items[0].name) {
      toast.error("Add at least one line item");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name,
        customer_name: customerName,
        customer_email: customerEmail || null,
        customer_address: customerAddress || null,
        customer_phone: customerPhone || null,
        reference: reference || null,
        payment_terms: paymentTerms || null,
        notes: notes || null,
        items,
        vat_enabled: vatEnabled,
        vat_cents: vatCents,
        total_cents: totalCents,
        template: selectedTemplate,
        template_config: selectedTemplate === 8 ? loadTemplateConfig() : null,
        frequency,
        custom_days: frequency === "custom_days" ? customDays : null,
        start_date: startDate,
        end_date: endDate || null,
        auto_send: autoSend,
      };

      const url = existing ? `/api/automations/recurring/${existing.id}` : "/api/automations/recurring";
      const method = existing ? "PUT" : "POST";
      const res = await fetch(url, {
        method, credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Save failed");
      }
      toast.success(existing ? "Recurring template updated" : "Recurring invoice created");
      onSaved();
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col md:flex-row">
        <div className="flex flex-col w-full md:w-[56%] overflow-hidden border-r">
          <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10 shrink-0">
            <h2 className="text-xl font-bold">{existing ? "Edit recurring invoice" : "New recurring invoice"}</h2>
            <Button variant="ghost" size="sm" onClick={onClose}><X className="h-5 w-5" /></Button>
          </div>
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div>
            <Label>Template name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Monthly retainer — Acme Pty Ltd" />
          </div>

          <div>
            <Label className="text-xs mb-2 block font-semibold">Choose Template</Label>
            <div className="flex gap-2 flex-wrap">
              {TEMPLATES.map((tpl) => {
                const isCustom = tpl.id === 8;
                const displayName = isCustom ? customTemplateName : tpl.name;
                const handleClick = () => {
                  if (isCustom && !hasCustomTemplate) {
                    toast.info("Design your custom template first from Invoices → Template Designer");
                    return;
                  }
                  setSelectedTemplate(tpl.id);
                };
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={handleClick}
                    title={isCustom && !hasCustomTemplate ? "Design your custom template first from Invoices → Template Designer" : displayName}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${
                      selectedTemplate === tpl.id ? "border-primary shadow-md scale-105" : "border-transparent hover:border-muted-foreground/30"
                    } ${isCustom && !hasCustomTemplate ? "opacity-60" : ""}`}
                  >
                    <div className="w-16 h-10 rounded overflow-hidden border border-gray-100 shadow-sm relative">
                      {tpl.preview}
                      {isCustom && !hasCustomTemplate && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                          <Palette className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium max-w-[80px] truncate">{displayName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {clients.length > 0 && (
            <div>
              <Label>Select client (optional)</Label>
              <select
                className="w-full border rounded-md h-10 px-3"
                value={selectedClientId}
                onChange={(e) => applyClient(e.target.value)}
              >
                <option value="">— Choose a client to auto-fill —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.business_name || c.full_name}
                    {c.business_name && c.business_name !== c.full_name ? ` (${c.full_name})` : ""}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">Or fill in the customer details manually below.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Customer name</Label>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
            <div>
              <Label>Customer email</Label>
              <Input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="Required for auto-send" />
            </div>
            <div className="md:col-span-2">
              <Label>Address</Label>
              <Input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            </div>
            <div>
              <Label>Reference (optional)</Label>
              <Input value={reference} onChange={(e) => setReference(e.target.value)} />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Line items</Label>
            <div className="space-y-2">
              {items.map((it, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-6">
                    <Input
                      placeholder="Item description"
                      value={it.name}
                      onChange={(e) => setItem(i, { name: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number" min={1}
                      value={it.qty}
                      onChange={(e) => setItem(i, { qty: Number(e.target.value) })}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number" min={0} step={0.01}
                      placeholder="Unit price"
                      value={it.unitPrice}
                      onChange={(e) => setItem(i, { unitPrice: Number(e.target.value) })}
                    />
                  </div>
                  <div className="col-span-1">
                    <Button variant="ghost" size="sm" onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setItems((p) => [...p, { name: "", qty: 1, unitPrice: 0 }])}>
              <Plus className="h-4 w-4 mr-1" /> Add line
            </Button>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Switch checked={vatEnabled} onCheckedChange={setVatEnabled} />
            <span className="text-sm">Add 15% VAT</span>
            <div className="ml-auto text-right text-sm">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="font-bold text-lg">R{(totalCents / 100).toFixed(2)}</div>
            </div>
          </div>

          <div>
            <Label>Payment terms</Label>
            <Input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} placeholder="e.g. Due in 7 days" />
          </div>

          <div>
            <Label>Notes (optional)</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="border-t pt-5">
            <h3 className="font-semibold mb-3">Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Frequency</Label>
                <select
                  className="w-full border rounded-md h-10 px-3"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                  <option value="custom_days">Every N days</option>
                </select>
              </div>
              {frequency === "custom_days" && (
                <div>
                  <Label>Every (days)</Label>
                  <Input type="number" min={1} value={customDays} onChange={(e) => setCustomDays(Number(e.target.value))} />
                </div>
              )}
              <div>
                <Label>Start date (first invoice)</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <Label>End date (optional)</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3 p-3 bg-muted/30 rounded-lg">
              <Switch checked={autoSend} onCheckedChange={setAutoSend} />
              <span className="text-sm">Email each generated invoice automatically (otherwise saved as draft)</span>
            </div>
          </div>
          </div>
          <div className="border-t p-4 flex justify-end gap-2 shrink-0 bg-white">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {existing ? "Update template" : "Create recurring"}
            </Button>
          </div>
        </div>

        {/* Live preview */}
        <div className="hidden md:flex flex-col w-[44%] bg-muted/20 overflow-y-auto p-6">
          <p className="text-xs text-muted-foreground mb-3 font-semibold">Preview updates live →</p>
          <div className="max-w-[420px] mx-auto w-full">
            <InvoicePreview
              docType="invoice"
              selectedTemplate={selectedTemplate}
              customerName={customerName}
              customerEmail={customerEmail}
              customerPhone={customerPhone}
              customerAddress={customerAddress}
              customerVat=""
              paymentTerms={paymentTerms}
              dueDate=""
              notes={notes}
              items={items}
              vatEnabled={vatEnabled}
              subtotal={subtotal}
              vatAmount={vatCents / 100}
              total={totalCents / 100}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
