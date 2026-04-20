import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ResellerDashboard from "./ResellerDashboard";
import PartnerPackage from "./PartnerPackage";
import {
  Award, LogOut, Menu, X,
  BarChart2, Users, DollarSign, Crown, Trophy, CreditCard, CheckCircle, ArrowUpCircle, Loader2, Star,
  Globe, Lock, Clipboard, RefreshCw, Trash2, AlertCircle, CalendarClock, ShieldCheck, Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const NAV_ITEMS = [
  { tab: "overview",    label: "Overview",      icon: BarChart2 },
  { tab: "clients",     label: "My Clients",    icon: Users },
  { tab: "partners",    label: "My Partners",   icon: Star },
  { tab: "commissions", label: "Commissions",   icon: DollarSign },
  { tab: "tiers",       label: "Ranks & Tiers", icon: Crown },
  { tab: "leaderboard", label: "Leaderboard",   icon: Trophy },
  { tab: "domain",      label: "Custom Domain", icon: Globe },
  { tab: "billing",     label: "Billing",       icon: CreditCard },
];

const PACKAGE_LABELS: Record<string, { label: string; color: string; price: string }> = {
  affiliate: { label: "Affiliate",         color: "text-gray-400",  price: "Free" },
  reseller:  { label: "Reseller",          color: "text-green-400", price: "R1,999 setup + R599/mo" },
  master:    { label: "Premium Reseller",  color: "text-yellow-400",price: "R3,999 setup + R899/mo" },
};

export default function ResellerPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [packageTier, setPackageTier] = useState<string | null | undefined>(undefined);
  const [subStatus, setSubStatus] = useState<string | null>(null);
  const [subNextDate, setSubNextDate] = useState<string | null>(null);
  const [monthlyCents, setMonthlyCents] = useState<number>(0);

  function fetchBillingStatus() {
    fetch("/api/reseller/billing/status", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        setPackageTier(d.package_tier ?? null);
        setSubStatus(d.sub_status ?? null);
        setSubNextDate(d.sub_next_billing_date ?? null);
        setMonthlyCents(d.monthly_cents ?? 0);
      })
      .catch(() => setPackageTier(null));
  }

  // Fetch package status on mount
  useEffect(() => { fetchBillingStatus(); }, []);

  // Handle Adumo return redirect params
  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      toast.success("Payment successful! Your partner package is now active.");
      fetchBillingStatus();
      setSearchParams({}, { replace: true });
    } else if (payment === "sub_success") {
      toast.success("Monthly subscription set up successfully!");
      fetchBillingStatus();
      setSearchParams({}, { replace: true });
    } else if (payment === "failed" || payment === "sub_failed") {
      toast.error("Payment was not completed. Please try again.");
      setSearchParams({}, { replace: true });
    } else if (payment === "error" || payment === "sub_error") {
      toast.error("An error occurred during payment. Please contact support.");
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
    navigate("/login");
  };

  function initials(name: string) {
    return name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <Link to="/" className="flex items-center gap-3">
          <img src="/masakhe-logo.png" alt="Masakhe" className="h-8 w-8 object-contain" />
          <div>
            <p className="text-white font-bold text-base leading-none">Masakhe</p>
            <p className="text-green-400 text-[10px] font-semibold uppercase tracking-widest mt-0.5">Partner Portal</p>
          </div>
        </Link>
      </div>

      {/* User card */}
      <div className="mx-4 mt-4 rounded-xl bg-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-green-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
            {user ? initials(user.full_name) : "?"}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.full_name}</p>
            <p className="text-white/50 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        {packageTier && (
          <div className="mt-2 pt-2 border-t border-white/10">
            <p className={`text-[11px] font-semibold ${PACKAGE_LABELS[packageTier]?.color || "text-green-400"}`}>
              {PACKAGE_LABELS[packageTier]?.label || packageTier}
            </p>
          </div>
        )}
      </div>

      {/* Nav — only show when package is selected */}
      {packageTier && (
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button
              key={item.tab}
              onClick={() => { setActiveTab(item.tab); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.tab
                  ? "bg-green-600 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>
      )}

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
        <div className="pt-1 px-3">
          <p className="text-white/20 text-[10px]">© {new Date().getFullYear()} Masakhe. All rights reserved.</p>
        </div>
      </div>
    </div>
  );

  // Loading state while fetching package tier
  if (packageTier === undefined) {
    return (
      <div className="flex h-screen bg-[#0a1628] items-center justify-center">
        <div className="text-white/40 text-sm animate-pulse">Loading portal…</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-[#1a1a2e] h-full">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-[#1a1a2e] flex flex-col">
            <div className="flex items-center justify-between px-4 pt-4">
              <span className="text-white font-bold">Menu</span>
              <button onClick={() => setSidebarOpen(false)} className="text-white/60 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#1a1a2e] border-b border-white/10">
          <button onClick={() => setSidebarOpen(true)} className="text-white/60 hover:text-white">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/masakhe-logo.png" alt="" className="h-6 w-6" />
            <span className="font-bold text-sm text-white">Partner Portal</span>
          </div>
          <div className="w-8" />
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto bg-[#0a1628]">
          {!packageTier ? (
            // No package selected — show package selection screen
            <PartnerPackage onActivated={() => fetchBillingStatus()} />
          ) : activeTab === "billing" ? (
            <BillingView
              packageTier={packageTier}
              subStatus={subStatus}
              subNextDate={subNextDate}
              monthlyCents={monthlyCents}
              onUpgraded={(newTier) => { setPackageTier(newTier); fetchBillingStatus(); }}
              onSubscriptionSetup={() => fetchBillingStatus()}
            />
          ) : activeTab === "domain" ? (
            <DomainView packageTier={packageTier} onUpgrade={() => setActiveTab("billing")} />
          ) : (
            <ResellerDashboard activeTab={activeTab} onTabChange={setActiveTab} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Upgrade option definitions ───────────────────────────────────────────────
const UPGRADE_OPTIONS: Record<string, Array<{
  targetTier: string;
  label: string;
  payToday: string;
  description: string;
  features: string[];
  highlight: boolean;
}>> = {
  affiliate: [
    {
      targetTier: "reseller",
      label: "Reseller",
      payToday: "R1,999",
      description: "Your own domain set up for you. Sell under your brand with dedicated support.",
      features: ["Own domain done for you", "Commissions on 3 Tiers", "Dedicated WhatsApp line", "Business Portal", "Dedicated Support"],
      highlight: true,
    },
    {
      targetTier: "master",
      label: "Premium Reseller",
      payToday: "R3,999",
      description: "Custom website, account manager and full 5-tier commission network.",
      features: ["Everything in Reseller", "Custom website done for you", "Commissions on 5 Tiers", "Binary Bonuses Unlocked", "Quarterly Profit Share"],
      highlight: false,
    },
  ],
  reseller: [
    {
      targetTier: "master",
      label: "Premium Reseller",
      payToday: "R2,000",
      description: "Upgrade to Premium. You pay the difference — R3,999 minus your R1,999 setup.",
      features: ["Custom website done for you", "Commissions on 5 Tiers", "Dedicated Account Manager", "Binary Bonuses Unlocked", "Quarterly Profit Share", "Leads from Paid Campaign"],
      highlight: true,
    },
  ],
  master: [],
};

const CURRENT_FEATURES: Record<string, string[]> = {
  affiliate: ["Unique referral link", "20% direct commissions", "Basic marketing materials", "Partner dashboard access"],
  reseller:  ["Everything in Affiliate", "Own domain done for you", "Commissions paid on 3 Tiers", "Dedicated WhatsApp line", "Business Portal", "Access to Mktng Assets", "Dedicated Support"],
  master:    ["Everything in Reseller", "Custom website done for you", "Commissions paid on 5 Tiers", "Dedicated Account Manager", "Binary Bonuses Unlocked", "Quarterly Profit Share", "Branding Eligibility", "Leads from Paid Campaign"],
};

function BillingView({
  packageTier,
  subStatus,
  subNextDate,
  monthlyCents,
  onUpgraded,
  onSubscriptionSetup,
}: {
  packageTier: string;
  subStatus: string | null;
  subNextDate: string | null;
  monthlyCents: number;
  onUpgraded: (tier: string) => void;
  onSubscriptionSetup: () => void;
}) {
  const { user } = useAuth();
  const pkg = PACKAGE_LABELS[packageTier];
  const upgrades = UPGRADE_OPTIONS[packageTier] || [];
  const features = CURRENT_FEATURES[packageTier] || [];
  const formRef = useRef<HTMLFormElement>(null);
  const subFormRef = useRef<HTMLFormElement>(null);
  const [paymentData, setPaymentData] = useState<{ formAction: string; fields: Record<string, string> } | null>(null);
  const [subPaymentData, setSubPaymentData] = useState<{ formAction: string; fields: Record<string, string> } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    if (paymentData && formRef.current) formRef.current.submit();
  }, [paymentData]);

  useEffect(() => {
    if (subPaymentData && subFormRef.current) subFormRef.current.submit();
  }, [subPaymentData]);

  // Calculate days until subscription is due
  const daysUntilDue = subNextDate
    ? Math.ceil((new Date(subNextDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  async function handleUpgrade(targetTier: string) {
    if (loading) return;
    setLoading(targetTier);
    try {
      const res = await fetch("/api/reseller/billing/upgrade", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetTier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start upgrade");
      setPaymentData({ formAction: data.formAction, fields: data.fields });
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
      setLoading(null);
    }
  }

  async function handleSetupSubscription() {
    if (subLoading) return;
    setSubLoading(true);
    try {
      const res = await fetch("/api/reseller/subscription/checkout", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start subscription setup");
      setSubPaymentData({ formAction: data.formAction, fields: data.fields });
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
      setSubLoading(false);
    }
  }

  const showSubSection = packageTier !== "affiliate" && monthlyCents > 0;
  const monthlyDisplay = `R${(monthlyCents / 100).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}/mo`;

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
      {/* Hidden Adumo upgrade form */}
      {paymentData && (
        <form ref={formRef} action={paymentData.formAction} method="POST" className="hidden">
          {Object.entries(paymentData.fields).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
        </form>
      )}

      {/* Hidden Adumo subscription form */}
      {subPaymentData && (
        <form ref={subFormRef} action={subPaymentData.formAction} method="POST" className="hidden">
          {Object.entries(subPaymentData.fields).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
        </form>
      )}

      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Billing & Package</h1>
        <p className="text-white/50 text-sm">Your current partner package and subscription status.</p>
      </div>

      {/* Current package card */}
      <div className="rounded-2xl bg-[#111827] border border-white/10 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Active Package</p>
            <p className={`text-2xl font-bold ${pkg?.color || "text-white"}`}>{pkg?.label || packageTier}</p>
            <p className="text-white/40 text-sm mt-0.5">Once-off setup: {pkg?.price || "—"}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
            <CheckCircle className="h-6 w-6 text-green-400" />
          </div>
        </div>

        {features.length > 0 && (
          <div className="mt-5 pt-5 border-t border-white/10">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Included in your plan</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/65">
                  <CheckCircle className="h-3.5 w-3.5 text-green-400 shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {packageTier === "master" && (
          <div className="mt-5 pt-5 border-t border-white/10">
            <p className="text-white/50 text-sm flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400" /> You are on the highest package tier. All features are unlocked.
            </p>
          </div>
        )}
      </div>

      {/* Monthly subscription section */}
      {showSubSection && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock className="h-5 w-5 text-green-400" />
            <h2 className="text-lg font-bold text-white">Monthly Subscription</h2>
          </div>

          {subStatus === "active" ? (
            <div className="rounded-2xl bg-[#0f2a1a] border border-green-600/30 p-6 flex items-start gap-4">
              <div className="h-11 w-11 rounded-full bg-green-600/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-green-400 font-bold text-base">Subscription Active</p>
                <p className="text-white/50 text-sm mt-0.5">
                  Your monthly debit order of <span className="text-white font-semibold">{monthlyDisplay}</span> is active. Adumo will collect automatically each month.
                </p>
              </div>
            </div>
          ) : subStatus === "trial" && daysUntilDue !== null && daysUntilDue > 7 ? (
            <div className="rounded-2xl bg-[#111827] border border-white/10 p-6 flex items-start gap-4">
              <div className="h-11 w-11 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-base">
                  Free trial — {daysUntilDue} day{daysUntilDue !== 1 ? "s" : ""} remaining
                </p>
                <p className="text-white/50 text-sm mt-1 leading-relaxed">
                  Your first monthly payment of <span className="text-white font-semibold">{monthlyDisplay}</span> will be due on{" "}
                  <span className="text-white font-semibold">{new Date(subNextDate!).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}</span>.
                  Set up your debit order early so there's no interruption.
                </p>
                <Button
                  onClick={handleSetupSubscription}
                  disabled={subLoading}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white h-10 px-6"
                >
                  {subLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CalendarClock className="h-4 w-4 mr-2" />}
                  Set up monthly debit order
                </Button>
              </div>
            </div>
          ) : (subStatus === "trial" && daysUntilDue !== null && daysUntilDue <= 7) || subStatus === "overdue" ? (
            <div className="rounded-2xl bg-red-950/40 border border-red-500/40 p-6 flex items-start gap-4">
              <div className="h-11 w-11 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-red-400 font-bold text-base">
                  {subStatus === "overdue"
                    ? "Subscription overdue — action required"
                    : `Subscription due in ${daysUntilDue} day${daysUntilDue !== 1 ? "s" : ""}`}
                </p>
                <p className="text-white/50 text-sm mt-1 leading-relaxed">
                  {subStatus === "overdue"
                    ? `Your monthly subscription of `
                    : `Your monthly subscription of `}
                  <span className="text-white font-semibold">{monthlyDisplay}</span>{" "}
                  {subStatus === "overdue"
                    ? "is past due. Please set up your debit order to keep your partner access active."
                    : `is due on ${new Date(subNextDate!).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}. Set up your debit order now.`}
                </p>
                <Button
                  onClick={handleSetupSubscription}
                  disabled={subLoading}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white h-10 px-6"
                >
                  {subLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <AlertCircle className="h-4 w-4 mr-2" />}
                  {subStatus === "overdue" ? "Pay now — set up debit order" : "Set up monthly debit order"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#111827] border border-white/10 p-6 flex items-start gap-4">
              <div className="h-11 w-11 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                <CalendarClock className="h-5 w-5 text-white/40" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-base">Set up your monthly subscription</p>
                <p className="text-white/50 text-sm mt-1 leading-relaxed">
                  Monthly fee: <span className="text-white font-semibold">{monthlyDisplay}</span>.
                  Set up a debit order to keep your partner access active.
                </p>
                <Button
                  onClick={handleSetupSubscription}
                  disabled={subLoading}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white h-10 px-6"
                >
                  {subLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CalendarClock className="h-4 w-4 mr-2" />}
                  Set up monthly debit order
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upgrade options */}
      {upgrades.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpCircle className="h-5 w-5 text-green-400" />
            <h2 className="text-lg font-bold text-white">Upgrade Your Package</h2>
          </div>
          <p className="text-white/50 text-sm mb-5">
            Upgrade anytime — you only pay the difference from your current package.
          </p>

          <div className={`grid gap-5 ${upgrades.length === 1 ? "grid-cols-1 max-w-md" : "grid-cols-1 md:grid-cols-2"}`}>
            {upgrades.map(option => (
              <div
                key={option.targetTier}
                className={`relative rounded-2xl p-6 flex flex-col ${
                  option.highlight
                    ? "bg-[#0f2a1a] border-2 border-green-500"
                    : "bg-[#111827] border border-white/10"
                }`}
              >
                {option.highlight && (
                  <div className="absolute -top-3 left-5">
                    <span className="inline-flex items-center gap-1 bg-green-500 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                      <Star className="h-2.5 w-2.5 fill-white" /> Recommended
                    </span>
                  </div>
                )}

                <div className="mb-1">
                  <p className="text-white/50 text-xs uppercase tracking-widest">Upgrade to</p>
                  <p className="text-white text-xl font-bold">{option.label}</p>
                </div>

                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-3xl font-extrabold text-green-400">{option.payToday}</span>
                  <span className="text-white/40 text-sm">today</span>
                </div>

                <p className="text-white/50 text-sm mb-5 leading-relaxed">{option.description}</p>

                <ul className="space-y-2 mb-6 flex-1">
                  {option.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                      <CheckCircle className="h-4 w-4 text-green-400 shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleUpgrade(option.targetTier)}
                  disabled={loading !== null}
                  className={`w-full h-11 font-semibold ${
                    option.highlight
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  }`}
                >
                  {loading === option.targetTier ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    `Upgrade to ${option.label}`
                  )}
                </Button>
              </div>
            ))}
          </div>

          <p className="mt-5 text-white/25 text-xs">
            Payments are processed securely via Adumo Online. Once-off — no recurring charges.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Custom Domain View ────────────────────────────────────────────────────────
function DomainView({ packageTier, onUpgrade }: { packageTier: string; onUpgrade: () => void }) {
  const [domain, setDomain] = useState("");
  const [savedDomain, setSavedDomain] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const PLATFORM_DOMAIN = "masakheportal.co.za";
  const canUseDomain = packageTier === "reseller" || packageTier === "master";

  useEffect(() => {
    fetch("/api/reseller/me/domain", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        setSavedDomain(d.custom_domain ?? null);
        setDomain(d.custom_domain ?? "");
        setVerified(!!d.domain_verified);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  async function saveDomain() {
    if (!domain.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/reseller/me/domain", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSavedDomain(data.custom_domain);
      setDomain(data.custom_domain);
      setVerified(false);
      toast.success("Domain saved. Now add the CNAME record in your DNS provider.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function verifyDomain() {
    setVerifying(true);
    try {
      const res = await fetch("/api/reseller/me/domain/verify", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.verified) {
        setVerified(true);
        toast.success(data.message);
      } else {
        toast.info(data.message);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setVerifying(false);
    }
  }

  async function removeDomain() {
    setRemoving(true);
    try {
      const res = await fetch("/api/reseller/me/domain", { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSavedDomain(null);
      setDomain("");
      setVerified(false);
      toast.success("Custom domain removed.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setRemoving(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => toast.success("Copied!"));
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-green-400" />
      </div>
    );
  }

  // Locked for affiliate tier
  if (!canUseDomain) {
    return (
      <div className="max-w-xl mx-auto py-16 px-6 text-center space-y-6">
        <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto">
          <Lock className="h-7 w-7 text-white/30" />
        </div>
        <h2 className="text-xl font-bold text-white">Custom Domain — Reseller feature</h2>
        <p className="text-white/50 text-sm leading-relaxed">
          Connect your own domain (e.g. <span className="text-white/70 font-mono">portal.mybrand.co.za</span>) so your clients see your brand — not Masakhe's.
          This feature is included in the Reseller and Premium Reseller packages.
        </p>
        <div className="grid grid-cols-2 gap-3 text-left">
          {[
            { tier: "Reseller",          price: "R1,999", sub: "then R599/mo", features: ["Own domain done for you", "Custom branding", "3-Tier commissions"] },
            { tier: "Premium Reseller",  price: "R3,999", sub: "then R899/mo", features: ["Everything in Reseller", "Custom website", "5-Tier commissions"] },
          ].map(pkg => (
            <div key={pkg.tier} className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="text-white font-semibold text-sm">{pkg.tier}</p>
              <p className="text-green-400 font-bold text-lg">{pkg.price}</p>
              <p className="text-white/35 text-[10px]">{pkg.sub}</p>
              <ul className="mt-2 space-y-1">
                {pkg.features.map(f => (
                  <li key={f} className="flex items-center gap-1.5 text-xs text-white/50">
                    <CheckCircle className="h-3 w-3 text-green-500 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Button className="bg-green-600 hover:bg-green-700 text-white px-8 h-11" onClick={onUpgrade}>
          Upgrade to unlock Custom Domain <ArrowUpCircle className="h-4 w-4 ml-2" />
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-6 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Globe className="h-6 w-6 text-green-400" />
          <h2 className="text-xl font-bold text-white">Custom Domain</h2>
          {savedDomain && (
            <Badge className={`ml-1 text-xs ${verified ? "bg-green-600 text-white" : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"}`}>
              {verified ? "✓ Verified" : "Pending DNS"}
            </Badge>
          )}
        </div>
        <p className="text-white/50 text-sm">
          Point your own domain to the Masakhe portal so clients see your brand when they log in.
        </p>
      </div>

      {/* Domain input */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-4">
        <p className="text-sm font-semibold text-white/80">Your custom domain</p>
        <div className="flex gap-2">
          <Input
            value={domain}
            onChange={e => setDomain(e.target.value)}
            placeholder="portal.yourbrand.co.za"
            className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 font-mono text-sm flex-1"
            onKeyDown={e => e.key === "Enter" && saveDomain()}
          />
          <Button
            onClick={saveDomain}
            disabled={saving || !domain.trim() || domain.trim() === savedDomain}
            className="h-11 bg-green-600 hover:bg-green-700 text-white px-5 shrink-0"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </div>
        <p className="text-xs text-white/35">
          Enter the full subdomain or domain you want to use, e.g. <span className="font-mono text-white/50">portal.mybrand.co.za</span>
        </p>
      </div>

      {/* DNS setup instructions */}
      {savedDomain && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-4">
          <p className="text-sm font-semibold text-white/80 flex items-center gap-2">
            <span className={`inline-block h-2 w-2 rounded-full ${verified ? "bg-green-500" : "bg-yellow-400 animate-pulse"}`} />
            DNS Setup Instructions
          </p>

          {verified ? (
            <div className="flex items-center gap-3 rounded-xl bg-green-600/10 border border-green-600/20 p-4">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
              <div>
                <p className="text-green-400 font-semibold text-sm">Domain verified and active</p>
                <p className="text-white/50 text-xs mt-0.5">
                  <span className="font-mono text-white/70">{savedDomain}</span> is pointing to Masakhe correctly.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-xl bg-yellow-400/5 border border-yellow-400/20 p-4">
              <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-yellow-300/80 text-sm leading-relaxed">
                Add the CNAME record below in your domain registrar's DNS settings, then click Verify. DNS changes can take up to 48 hours to propagate.
              </p>
            </div>
          )}

          {/* CNAME table */}
          <div className="rounded-lg border border-white/10 overflow-hidden text-sm">
            <div className="grid grid-cols-3 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white/40 uppercase tracking-wider">
              <span>Type</span><span>Name / Host</span><span>Value / Target</span>
            </div>
            <div className="grid grid-cols-3 items-center px-4 py-3 gap-2">
              <span className="text-white/70 font-mono font-bold">CNAME</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-white/80 text-xs truncate">{savedDomain}</span>
                <button onClick={() => copyToClipboard(savedDomain)} className="text-white/30 hover:text-white/60 shrink-0">
                  <Clipboard className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-green-400 text-xs truncate">{PLATFORM_DOMAIN}</span>
                <button onClick={() => copyToClipboard(PLATFORM_DOMAIN)} className="text-white/30 hover:text-white/60 shrink-0">
                  <Clipboard className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-white/35 leading-relaxed">
            Popular DNS providers: <span className="text-white/50">Afrihost, Xneelo, Cloudflare, GoDaddy, Namecheap.</span> Look for "DNS Management" or "DNS Records" in your control panel.
          </p>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-1">
            {!verified && (
              <Button
                onClick={verifyDomain}
                disabled={verifying}
                className="h-10 bg-green-600/80 hover:bg-green-600 text-white text-sm"
              >
                {verifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                {verifying ? "Checking DNS…" : "Verify DNS"}
              </Button>
            )}
            <Button
              onClick={removeDomain}
              disabled={removing}
              variant="ghost"
              className="h-10 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm"
            >
              {removing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Remove domain
            </Button>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-3">
        <p className="text-sm font-semibold text-white/80">How it works</p>
        <ol className="space-y-2 text-sm text-white/50">
          {[
            "Enter the domain or subdomain you want to use (e.g. portal.mybrand.co.za).",
            `Log in to your domain registrar and add a CNAME record pointing to ${PLATFORM_DOMAIN}.`,
            "Click Verify DNS — once confirmed, your clients can access the platform via your domain.",
            "Your clients will see your branding when they visit your custom domain.",
          ].map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600/20 text-green-400 text-[10px] font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
