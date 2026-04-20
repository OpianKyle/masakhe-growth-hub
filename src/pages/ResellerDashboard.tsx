import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Users, TrendingUp, DollarSign, Copy, Send, Star, Trophy,
  Crown, ChevronRight, Check, AlertCircle, Loader2, Mail,
  BarChart2, Shield, RefreshCw, Award
} from "lucide-react";

const RANKS = [
  { key: "starter",       label: "Starter",       code: "S1",  recruits: 0,   mrrK: 0,    rankBonus: 0,     color: "#6b7280", perks: ["Referral dashboard access","20% direct commissions","Marketing materials"] },
  { key: "builder",       label: "Builder",       code: "B2",  recruits: 3,   mrrK: 1797, rankBonus: 500,   color: "#3b82f6", perks: ["All Starter perks","Level 2 commissions (10%)","R500 rank bonus","Priority support"] },
  { key: "leader",        label: "Leader",        code: "L3",  recruits: 10,  mrrK: 5990, rankBonus: 1500,  color: "#8b5cf6", perks: ["Level 3 commissions (5%)","R1,500 rank bonus","Training access","Co-op marketing fund"] },
  { key: "manager",       label: "Manager",       code: "M4",  recruits: 25,  mrrK: 10000,rankBonus: 5000,  color: "#ec4899", perks: ["Level 4 commissions (3%)","R5,000 rank bonus","Dedicated account manager","Monthly strategy call"] },
  { key: "director",      label: "Director",      code: "D5",  recruits: 50,  mrrK: 25000,rankBonus: 15000, color: "#f59e0b", perks: ["Level 5 commissions (3%)","R15,000 rank bonus","Custom sub-brand kit","Revenue share pool"] },
  { key: "executive",     label: "Executive",     code: "E6",  recruits: 100, mrrK: 50000,rankBonus: 30000, color: "#10b981", perks: ["Max binary bonus cap lifted","R30,000 rank bonus","Equity consideration","Elite events access"] },
  { key: "diamond_elite", label: "Diamond Elite", code: "DE7", recruits: 250, mrrK: 100000,rankBonus: 50000,color: "#f59e0b", perks: ["R50,000 rank bonus","Board advisory seat","Profit sharing","Lifetime Partner status"], peak: true },
];

const COMMISSION_LEVELS = [
  { level: "Direct (Level 1)", desc: "Your personally referred clients", rate: "20%", type: "Recurring",     example: "R179.80/client on Plus plan" },
  { level: "Level 2",          desc: "Clients referred by your direct recruits", rate: "10%", type: "Recurring", example: "R89.90/client" },
  { level: "Level 3",          desc: "Third-level downline",           rate: "5%",  type: "Recurring",     example: "R44.95/client" },
  { level: "Level 4 & 5",      desc: "Levels 4 and 5 of your network", rate: "3%",  type: "Recurring",     example: "R26.97/client" },
  { level: "Binary Bonus",     desc: "10% of weaker leg monthly volume",rate: "10%", type: "Monthly Bonus", example: "Up to R5,000/month" },
  { level: "Rank Advancement",  desc: "Bonus paid on each new rank achieved", rate: "Once-off", type: "Cash Bonus", example: "R500 – R50,000" },
];

function fmt(cents: number) {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

interface Props {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function ResellerDashboard({ activeTab, onTabChange }: Props = {}) {
  const [internalTab, setInternalTab] = useState<string>("overview");
  const tab = activeTab ?? internalTab;
  const setTab = (t: string) => { setInternalTab(t); onTabChange?.(t); };
  const [reseller, setReseller] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [joiningTier, setJoiningTier] = useState<string | null>(null);
  const [joinPayment, setJoinPayment] = useState<{ formAction: string; fields: Record<string, string> } | null>(null);
  const joinFormRef = useRef<HTMLFormElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => { loadMe(); }, []);
  useEffect(() => {
    if (!reseller) return;
    if (tab === "clients") loadClients();
    if (tab === "partners") loadPartners();
    if (tab === "commissions") loadCommissions();
    if (tab === "leaderboard") loadLeaderboard();
  }, [tab, reseller]);

  async function loadMe() {
    setLoading(true);
    try {
      const r = await fetch("/api/reseller/me", { credentials: "include" });
      const d = await r.json();
      setReseller(d.reseller);
    } finally {
      setLoading(false);
    }
  }

  async function apply() {
    setApplying(true);
    try {
      const r = await fetch("/api/reseller/apply", { method: "POST", credentials: "include" });
      const d = await r.json();
      if (r.ok) { toast.success(d.message); loadMe(); }
      else toast.error(d.error);
    } finally { setApplying(false); }
  }

  // Auto-submit Adumo join form when payment data is ready
  useEffect(() => {
    if (joinPayment && joinFormRef.current) joinFormRef.current.submit();
  }, [joinPayment]);

  // Handle Adumo return redirect params
  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      toast.success("Payment successful! Your partner package is now active.");
      loadMe();
      setSearchParams({}, { replace: true });
    } else if (payment === "failed") {
      toast.error("Payment was not completed. Please try again.");
      setSearchParams({}, { replace: true });
    } else if (payment === "error") {
      toast.error("An error occurred during payment. Please contact support.");
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  async function handleJoin(tier: string) {
    if (joiningTier) return;
    setJoiningTier(tier);
    try {
      const res = await fetch("/api/reseller/join", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join");
      if (data.ok && data.package_tier) {
        // Affiliate — free, activate immediately
        toast.success("Welcome to the Masakhe Partner Programme!");
        loadMe();
      } else if (data.formAction) {
        // Paid — redirect to Adumo
        setJoinPayment({ formAction: data.formAction, fields: data.fields });
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
      setJoiningTier(null);
    }
  }

  async function loadClients() {
    const r = await fetch("/api/reseller/me/clients", { credentials: "include" });
    const d = await r.json();
    setClients(d.clients || []);
  }

  async function loadPartners() {
    const r = await fetch("/api/reseller/me/partners", { credentials: "include" });
    const d = await r.json();
    setPartners(d.partners || []);
  }

  async function loadCommissions() {
    const r = await fetch("/api/reseller/me/commissions", { credentials: "include" });
    const d = await r.json();
    setCommissions(d.commissions || []);
  }

  async function loadLeaderboard() {
    const r = await fetch("/api/reseller/leaderboard", { credentials: "include" });
    const d = await r.json();
    setLeaderboard(d.leaderboard || []);
  }

  async function sendInvite() {
    if (!inviteEmail) return;
    setSendingInvite(true);
    try {
      const r = await fetch("/api/reseller/me/invite", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientEmail: inviteEmail, recipientName: inviteName }),
      });
      const d = await r.json();
      if (r.ok) { toast.success("Invite sent!"); setShowInvite(false); setInviteEmail(""); setInviteName(""); }
      else toast.error(d.error);
    } finally { setSendingInvite(false); }
  }

  const TABS = [
    { key: "overview",     label: "Overview",     icon: BarChart2 },
    { key: "clients",      label: "My Clients",   icon: Users },
    { key: "commissions",  label: "Commissions",  icon: DollarSign },
    { key: "tiers",        label: "Ranks & Tiers",icon: Crown },
    { key: "leaderboard",  label: "Leaderboard",  icon: Trophy },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // Not yet a reseller OR has no package selected
  if (!reseller || !reseller.package_tier) {
    const JOIN_PACKAGES = [
      {
        tier: "affiliate",
        label: "Affiliate",
        price: "Free",
        priceNote: "No upfront cost",
        priceCents: 0,
        recommended: false,
        description: "Start earning referral commissions immediately with zero investment.",
        features: ["Unique referral link", "20% direct commissions", "Basic marketing materials", "Partner dashboard access"],
        btnLabel: "Join Free",
      },
      {
        tier: "reseller",
        label: "Reseller",
        price: "R1,999",
        priceNote: "Once-off setup + R599/mo",
        priceCents: 199900,
        recommended: true,
        description: "Your own domain set up for you. Sell under your brand with dedicated support.",
        features: ["Everything in Affiliate", "Own domain done for you", "Commissions paid on 3 Tiers", "Dedicated WhatsApp line", "Business Connect", "Access to Mktng Assets", "Dedicated Support"],
        btnLabel: "Become a Reseller",
      },
      {
        tier: "master",
        label: "Premium Reseller",
        price: "R3,999",
        priceNote: "Once-off setup + R899/mo",
        priceCents: 399900,
        recommended: false,
        description: "Website builder, social media posts, and full 5-tier commission network with binary bonuses.",
        features: ["Everything in Reseller", "Website Builder", "Commissions paid on 5 Tiers", "Social Media posts", "Binary Bonuses Unlocked", "Quarterly Profit Share", "Branding Eligibility", "Leads Provided from Paid Campaign"],
        btnLabel: "Go Premium Reseller",
      },
    ];

    return (
      <div className="py-10 px-4">
        {/* Hidden Adumo form */}
        {joinPayment && (
          <form ref={joinFormRef} action={joinPayment.formAction} method="POST" className="hidden">
            {Object.entries(joinPayment.fields).map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={v} />
            ))}
          </form>
        )}

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Award className="h-7 w-7 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Join the Masakhe Partner Programme</h1>
          <p className="text-slate-500 text-sm mt-2 max-w-lg mx-auto leading-relaxed">
            Pick the package that matches your ambition. Earn commissions, build your network, and grow with Masakhe.
          </p>

          {/* Key stats */}
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto mt-6">
            {[
              { value: "20%", label: "Direct commission" },
              { value: "5 Levels", label: "Multi-level earnings" },
              { value: "R50,000", label: "Top rank bonus" },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-slate-200 bg-slate-50 py-3 px-2">
                <p className="text-lg font-bold text-green-700">{s.value}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Package cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {JOIN_PACKAGES.map(pkg => (
            <div
              key={pkg.tier}
              className={`relative rounded-2xl p-6 flex flex-col ${
                pkg.recommended
                  ? "border-2 border-green-600 bg-green-50 shadow-lg"
                  : "border border-slate-200 bg-white"
              }`}
            >
              {pkg.recommended && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 bg-green-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                    <Star className="h-3 w-3 fill-white" /> Recommended
                  </span>
                </div>
              )}

              <h2 className="text-slate-900 font-bold text-lg mb-0.5">{pkg.label}</h2>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className={`text-2xl font-extrabold ${pkg.priceCents === 0 ? "text-slate-400" : "text-green-700"}`}>
                  {pkg.price}
                </span>
                <span className="text-slate-400 text-xs">{pkg.priceNote}</span>
              </div>
              <p className="text-slate-500 text-sm mb-4 leading-relaxed">{pkg.description}</p>

              <ul className="space-y-2 mb-6 flex-1">
                {pkg.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleJoin(pkg.tier)}
                disabled={joiningTier !== null}
                className={`w-full h-10 font-semibold text-sm ${
                  pkg.recommended
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                }`}
              >
                {joiningTier === pkg.tier
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : pkg.btnLabel}
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-slate-400 text-xs mt-8">
          Once-off fees are processed securely via Adumo Online. No recurring partner charges.
        </p>
      </div>
    );
  }

  // Pending approval
  if (reseller.status === "pending") {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
          <AlertCircle className="h-7 w-7 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Application Under Review</h2>
        <p className="text-slate-500">Your reseller application is being reviewed. You'll be notified once approved.</p>
        <p className="text-xs text-slate-400">Your reseller code: <span className="font-mono font-bold">{reseller.reseller_code}</span></p>
      </div>
    );
  }

  const currentRank = RANKS.find(r => r.key === reseller.rank?.key) || RANKS[0];
  const nextRank = reseller.next_rank ? RANKS.find(r => r.key === reseller.next_rank.key) : null;
  const clientsToNext = nextRank ? Math.max(0, nextRank.recruits - reseller.total_clients) : 0;

  return (
    <div className="space-y-0">
      {/* Invite dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Referral Invite</DialogTitle>
            <DialogDescription>Send your referral link directly to someone's inbox.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Their Name (optional)</label>
              <Input value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="e.g. Thandi Mokoena" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Email Address *</label>
              <Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="thandi@business.co.za" type="email" />
            </div>
            <Button className="w-full bg-green-700 hover:bg-green-800" onClick={sendInvite} disabled={sendingInvite || !inviteEmail}>
              {sendingInvite ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Send Invite
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-1">Masakhe Partner Portal</p>
            <h1 className="text-2xl font-bold text-white">{reseller.display_name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-white/50">{reseller.reseller_code}</span>
              <span className="text-white/30">·</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: currentRank.color + "33", color: currentRank.color }}>
                <Star className="h-3 w-3" />{currentRank.code} {currentRank.label}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              onClick={() => { navigator.clipboard.writeText(reseller.referral_link); toast.success("Link copied!"); }}>
              <Copy className="h-3.5 w-3.5 mr-1.5" />Copy Referral Link
            </Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowInvite(true)}>
              <Send className="h-3.5 w-3.5 mr-1.5" />Invite
            </Button>
          </div>
        </div>

        {/* Referral links */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl">
          <div>
            <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-1">SMME Client Link</p>
            <div className="flex gap-1.5">
              <Input readOnly value={reseller.referral_link} className="bg-white/10 border-white/20 text-white text-xs h-8 placeholder:text-white/40" />
              <Button size="sm" variant="ghost" className="h-8 shrink-0 text-white hover:bg-white/10"
                onClick={() => { navigator.clipboard.writeText(reseller.referral_link); toast.success("Client link copied!"); }}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div>
            <p className="text-green-400/70 text-[10px] font-semibold uppercase tracking-widest mb-1 flex items-center gap-1">
              <Star className="h-2.5 w-2.5" /> Partner Invite Link
            </p>
            <div className="flex gap-1.5">
              <Input readOnly value={reseller.partner_referral_link || ""} className="bg-green-900/30 border-green-600/30 text-white text-xs h-8" />
              <Button size="sm" variant="ghost" className="h-8 shrink-0 text-green-400 hover:bg-green-900/30"
                onClick={() => { navigator.clipboard.writeText(reseller.partner_referral_link || ""); toast.success("Partner invite link copied!"); }}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs — hidden when controlled by parent (portal sidebar) */}
      {!onTabChange && (
        <div className="border-b bg-white sticky top-0 z-10">
          <div className="flex overflow-x-auto">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  tab === t.key ? "border-green-600 text-green-700" : "border-transparent text-slate-500 hover:text-slate-800"
                }`}>
                <t.icon className="h-3.5 w-3.5" />{t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-6">
        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Clients",   value: reseller.total_clients,                  icon: Users,       color: "text-blue-600",  bg: "bg-blue-50" },
                { label: "New This Month",  value: reseller.new_clients_this_month,          icon: TrendingUp,  color: "text-purple-600",bg: "bg-purple-50" },
                { label: "This Month",      value: fmt(reseller.earnings_this_month_cents),  icon: DollarSign,  color: "text-green-600", bg: "bg-green-50" },
                { label: "Total Earned",    value: fmt(reseller.total_earnings_cents),        icon: Award,       color: "text-amber-600", bg: "bg-amber-50" },
              ].map(s => (
                <div key={s.label} className="rounded-xl border bg-white p-4 flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{s.label}</p>
                    <p className="text-lg font-bold text-slate-900">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Rank progress */}
            <div className="rounded-xl border bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Current Rank</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold" style={{ color: currentRank.color }}>{currentRank.code}</span>
                    <span className="text-lg font-bold text-slate-900">{currentRank.label}</span>
                  </div>
                </div>
                {nextRank && (
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Next rank</p>
                    <p className="text-sm font-bold" style={{ color: nextRank.color }}>{nextRank.label}</p>
                    <p className="text-xs text-slate-400">{clientsToNext} more client{clientsToNext !== 1 ? "s" : ""} needed</p>
                  </div>
                )}
              </div>

              {/* Rank track */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {RANKS.map((r, i) => {
                  const isReached = RANKS.findIndex(rr => rr.key === currentRank.key) >= i;
                  return (
                    <React.Fragment key={r.key}>
                      <div className="flex flex-col items-center shrink-0">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                          isReached ? "border-current text-white" : "border-slate-200 text-slate-300 bg-slate-50"
                        }`} style={isReached ? { background: r.color, borderColor: r.color } : {}}>
                          {r.code.replace(/[^A-Z]/g, "")}
                        </div>
                        <p className="text-[9px] text-slate-400 mt-0.5 w-12 text-center leading-tight">{r.label}</p>
                      </div>
                      {i < RANKS.length - 1 && (
                        <div className={`h-0.5 flex-1 min-w-4 ${isReached && RANKS.findIndex(rr => rr.key === currentRank.key) > i ? "bg-green-500" : "bg-slate-200"}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                {currentRank.perks.map(p => (
                  <div key={p} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />{p}
                  </div>
                ))}
              </div>
            </div>

            {/* Commission structure */}
            <div className="rounded-xl border bg-white overflow-hidden">
              <div className="px-5 py-4 border-b">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-green-600" />Commission Structure
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Level</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Rate</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMMISSION_LEVELS.map((row, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{row.level}</p>
                          <p className="text-xs text-slate-400">{row.desc}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-lg font-bold text-green-700">{row.rate}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            row.type === "Recurring" ? "bg-blue-100 text-blue-700" :
                            row.type === "Monthly Bonus" ? "bg-purple-100 text-purple-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>{row.type}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 font-mono">{row.example}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── CLIENTS ── */}
        {tab === "clients" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">My Referred Clients ({clients.length})</h2>
              <Button size="sm" className="bg-green-700 hover:bg-green-800" onClick={() => setShowInvite(true)}>
                <Send className="h-3.5 w-3.5 mr-1.5" />Invite New Client
              </Button>
            </div>
            {clients.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No clients yet</p>
                <p className="text-sm mt-1">Share your referral link to get started</p>
                <Button className="mt-4 bg-green-700 hover:bg-green-800" onClick={() => setShowInvite(true)}>
                  <Send className="h-4 w-4 mr-2" />Send First Invite
                </Button>
              </div>
            ) : (
              <div className="rounded-xl border bg-white overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Plan</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map(c => (
                      <tr key={c.id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${c.is_partner ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                              {initials(c.business_name || c.full_name || "?")}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="font-medium text-slate-900">{c.business_name || c.full_name}</p>
                                {c.is_partner && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">
                                    <Star className="h-2.5 w-2.5 mr-0.5" />Partner
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {c.plan_name ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">{c.plan_name}</span>
                          ) : (
                            <span className="text-xs text-slate-400">No active plan</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            c.sub_status === "ACTIVE" ? "bg-green-100 text-green-700" :
                            c.sub_status === "TRIAL"  ? "bg-amber-100 text-amber-700" :
                            "bg-slate-100 text-slate-500"
                          }`}>{c.sub_status || "Unsubscribed"}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {new Date(c.registered_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── MY PARTNERS ── */}
        {tab === "partners" && (
          <div className="space-y-4">
            {/* Header + invite link */}
            <div className="rounded-xl bg-slate-800 border border-slate-700 p-5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="font-semibold text-white flex items-center gap-2">
                    <Star className="h-4 w-4 text-green-400" />
                    My Partner Recruits ({partners.length})
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Partners who registered using your partner invite link
                  </p>
                </div>
              </div>
              <div>
                <p className="text-green-400/70 text-[10px] font-semibold uppercase tracking-widest mb-1.5">
                  Partner Invite Link — share this to recruit new resellers
                </p>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={reseller?.partner_referral_link || ""}
                    className="bg-white/5 border-white/10 text-white text-xs h-9 font-mono"
                  />
                  <Button
                    size="sm"
                    className="h-9 bg-green-600 hover:bg-green-700 text-white shrink-0 gap-1.5"
                    onClick={() => {
                      navigator.clipboard.writeText(reseller?.partner_referral_link || "");
                      toast.success("Partner invite link copied!");
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy Link
                  </Button>
                </div>
              </div>
            </div>

            {partners.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Star className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No partner recruits yet</p>
                <p className="text-sm mt-1">Share your partner invite link to start building your network</p>
                <Button
                  className="mt-4 bg-green-700 hover:bg-green-800"
                  onClick={() => {
                    navigator.clipboard.writeText(reseller?.partner_referral_link || "");
                    toast.success("Partner invite link copied!");
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />Copy Partner Invite Link
                </Button>
              </div>
            ) : (
              <div className="rounded-xl border bg-white overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Partner</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Package</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Rank</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Their Clients</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.map(p => {
                      const tierColors: Record<string, string> = {
                        affiliate: "bg-slate-100 text-slate-600",
                        reseller:  "bg-green-100 text-green-700",
                        master:    "bg-yellow-100 text-yellow-700",
                      };
                      const tierLabel: Record<string, string> = {
                        affiliate: "Affiliate",
                        reseller:  "Reseller",
                        master:    "Premium",
                      };
                      return (
                        <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">
                                {initials(p.display_name || p.full_name || "?")}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">{p.display_name || p.full_name}</p>
                                <p className="text-xs text-slate-400">{p.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${tierColors[p.package_tier] || "bg-slate-100 text-slate-500"}`}>
                              {tierLabel[p.package_tier] || "Pending"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600 font-medium uppercase">
                            {p.rank_key || "starter"}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700 font-semibold">
                            {p.client_count}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              p.status === "active"    ? "bg-green-100 text-green-700" :
                              p.status === "pending"   ? "bg-amber-100 text-amber-700" :
                              p.status === "suspended" ? "bg-red-100 text-red-600" :
                              "bg-slate-100 text-slate-500"
                            }`}>{p.status}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">
                            {new Date(p.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── COMMISSIONS ── */}
        {tab === "commissions" && (
          <div className="space-y-4">
            <h2 className="font-semibold text-slate-900">Commission History</h2>
            {commissions.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No commissions yet</p>
                <p className="text-sm mt-1">Commissions are tracked once your clients subscribe</p>
              </div>
            ) : (
              <div className="rounded-xl border bg-white overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map(c => (
                      <tr key={c.id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{c.description}</p>
                          {c.client_name && <p className="text-xs text-slate-400">Client: {c.client_business || c.client_name}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                            {c.commission_type?.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-bold ${c.amount_cents > 0 ? "text-green-700" : "text-slate-400"}`}>
                            {fmt(c.amount_cents)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            c.status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                          }`}>{c.status}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {new Date(c.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TIERS ── */}
        {tab === "tiers" && (
          <div className="space-y-6">
            {/* Rank progress track */}
            <div className="flex items-center justify-between overflow-x-auto pb-4 gap-1">
              {RANKS.map((r, i) => {
                const reached = RANKS.findIndex(rr => rr.key === currentRank.key) >= i;
                return (
                  <React.Fragment key={r.key}>
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all shadow-sm`}
                        style={reached ? { background: r.color, borderColor: r.color, color: "#fff" } : { background: "#f1f5f9", borderColor: "#e2e8f0", color: "#94a3b8" }}>
                        {r.code}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 font-medium">{r.label}</p>
                    </div>
                    {i < RANKS.length - 1 && (
                      <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Rank cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {RANKS.map(r => {
                const isCurrent = r.key === currentRank.key;
                const reached = RANKS.findIndex(rr => rr.key === currentRank.key) >= RANKS.findIndex(rr => rr.key === r.key);
                return (
                  <div key={r.key} className={`rounded-xl border-2 p-5 relative transition-all ${
                    isCurrent ? "shadow-lg" : reached ? "opacity-70" : "opacity-50"
                  }`} style={{ borderColor: isCurrent ? r.color : "#e2e8f0" }}>
                    {r.peak && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-full">
                        PEAK RANK
                      </span>
                    )}
                    {isCurrent && (
                      <span className="absolute -top-3 right-4 bg-green-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full">
                        YOUR RANK
                      </span>
                    )}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: r.color }}>
                        {r.code}
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">{r.code}</p>
                        <p className="text-lg font-bold text-slate-900">{r.label}</p>
                      </div>
                    </div>

                    <div className="mb-4 p-3 rounded-lg bg-slate-50 border">
                      <p className="text-[9px] text-slate-400 uppercase font-semibold mb-2">Requirements</p>
                      <div className="flex gap-4">
                        <div>
                          <p className="text-xl font-bold" style={{ color: r.color }}>{r.recruits}</p>
                          <p className="text-[10px] text-slate-400">Recruits</p>
                        </div>
                        {r.mrrK > 0 && (
                          <div>
                            <p className="text-xl font-bold" style={{ color: r.color }}>R{r.mrrK.toLocaleString()}+</p>
                            <p className="text-[10px] text-slate-400">Network MRR</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-1.5 mb-4">
                      {r.perks.map(p => (
                        <li key={p} className="flex items-start gap-1.5 text-xs text-slate-600">
                          <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: r.color }} />{p}
                        </li>
                      ))}
                    </ul>

                    {r.rankBonus > 0 && (
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <span className="text-xs text-slate-400 font-semibold uppercase">Rank Bonus</span>
                        <span className="text-sm font-bold" style={{ color: r.color }}>
                          R{r.rankBonus.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── LEADERBOARD ── */}
        {tab === "leaderboard" && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Top Performers</p>
              <h2 className="text-2xl font-bold text-slate-900">This Month's <span className="text-green-600">Top Earners</span></h2>
              <p className="text-sm text-slate-400 mt-1">Real partners. Real earnings.</p>
            </div>

            {leaderboard.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Leaderboard is empty — be the first on it!</p>
              </div>
            ) : (
              <>
                {/* Top 3 podium */}
                {leaderboard.length >= 3 && (
                  <div className="flex items-end justify-center gap-4 pb-6">
                    {[1, 0, 2].map(idx => {
                      const p = leaderboard[idx];
                      if (!p) return null;
                      const rank = RANKS.find(r => r.key === p.rank_key) || RANKS[0];
                      const sizes = ["h-36 w-32", "h-44 w-36", "h-36 w-32"];
                      const heights = ["pt-4", "pt-0", "pt-4"];
                      return (
                        <div key={p.id} className={`${heights[idx]} flex flex-col items-center`}>
                          <div className="relative mb-2">
                            {p.logo_url ? (
                              <img src={p.logo_url} alt={p.display_name} className="h-14 w-14 rounded-full object-cover border-4 border-white shadow-lg" />
                            ) : (
                              <div className="h-14 w-14 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg border-4 border-white"
                                style={{ background: rank.color }}>
                                {initials(p.display_name)}
                              </div>
                            )}
                            {idx === 0 && (
                              <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-amber-400 flex items-center justify-center">
                                <Crown className="h-3.5 w-3.5 text-white" />
                              </div>
                            )}
                          </div>
                          <p className="text-sm font-bold text-slate-900 text-center leading-tight">{p.display_name.split(" ").slice(0, 2).join(" ")}</p>
                          <p className="text-xs text-slate-400">{typeof p.location === "string" ? p.location.split(",")[0] : "SA"}</p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold mt-1" style={{ background: rank.color + "22", color: rank.color }}>
                            {rank.label}
                          </span>
                          <p className="text-green-700 font-bold text-sm mt-1">{fmt(p.this_month_earnings)}</p>
                          <div className={`${sizes[idx]} rounded-t-xl mt-2`}
                            style={{ background: `linear-gradient(to top, ${rank.color}44, ${rank.color}22)`, border: `1px solid ${rank.color}44` }}>
                            <div className="flex items-center justify-center pt-3">
                              <span className="text-2xl font-black text-white/60">#{[2,1,3][idx]}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Full table */}
                <div className="rounded-xl border bg-white overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-10">#</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Partner</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tier</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Clients</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">This Month</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((p, i) => {
                        const rank = RANKS.find(r => r.key === p.rank_key) || RANKS[0];
                        return (
                          <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm font-bold text-slate-400">#{i + 1}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {p.logo_url ? (
                                  <img src={p.logo_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                                ) : (
                                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                    style={{ background: rank.color }}>
                                    {initials(p.display_name)}
                                  </div>
                                )}
                                <div>
                                  <p className="font-semibold text-slate-900">{p.display_name}</p>
                                  {p.location && <p className="text-xs text-slate-400">{typeof p.location === "string" ? p.location.split(",")[0] : ""}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: rank.color + "22", color: rank.color }}>
                                {rank.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-700">{p.total_clients}</td>
                            <td className="px-4 py-3 text-right font-bold text-green-700">{fmt(p.this_month_earnings)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
