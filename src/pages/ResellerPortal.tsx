import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ResellerDashboard from "./ResellerDashboard";
import PartnerPackage from "./PartnerPackage";
import {
  Award, LogOut, ChevronLeft, Menu, X,
  BarChart2, Users, DollarSign, Crown, Trophy, CreditCard, CheckCircle, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const NAV_ITEMS = [
  { tab: "overview",    label: "Overview",      icon: BarChart2 },
  { tab: "clients",     label: "My Clients",    icon: Users },
  { tab: "commissions", label: "Commissions",   icon: DollarSign },
  { tab: "tiers",       label: "Ranks & Tiers", icon: Crown },
  { tab: "leaderboard", label: "Leaderboard",   icon: Trophy },
  { tab: "billing",     label: "Billing",       icon: CreditCard },
];

const PACKAGE_LABELS: Record<string, { label: string; color: string; price: string }> = {
  affiliate: { label: "Affiliate",       color: "text-gray-400",  price: "Free" },
  reseller:  { label: "Reseller",        color: "text-green-400", price: "R999 once-off" },
  master:    { label: "Master Reseller", color: "text-yellow-400",price: "R4,999 once-off" },
};

export default function ResellerPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [packageTier, setPackageTier] = useState<string | null | undefined>(undefined);

  // Fetch package status on mount
  useEffect(() => {
    fetch("/api/reseller/billing/status", { credentials: "include" })
      .then(r => r.json())
      .then(d => setPackageTier(d.package_tier ?? null))
      .catch(() => setPackageTier(null));
  }, []);

  // Handle Adumo return redirect params
  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      toast.success("Payment successful! Your partner package is now active.");
      // Re-fetch package status
      fetch("/api/reseller/billing/status", { credentials: "include" })
        .then(r => r.json())
        .then(d => setPackageTier(d.package_tier ?? null));
      setSearchParams({}, { replace: true });
    } else if (payment === "failed") {
      toast.error("Payment was not completed. Please try again.");
      setSearchParams({}, { replace: true });
    } else if (payment === "error") {
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
            <PartnerPackage onActivated={() => {
              fetch("/api/reseller/billing/status", { credentials: "include" })
                .then(r => r.json())
                .then(d => setPackageTier(d.package_tier ?? "affiliate"));
            }} />
          ) : activeTab === "billing" ? (
            // Billing tab — show current package info
            <BillingView packageTier={packageTier} />
          ) : (
            // All other tabs — reseller dashboard
            <ResellerDashboard activeTab={activeTab} onTabChange={setActiveTab} />
          )}
        </div>
      </div>
    </div>
  );
}

function BillingView({ packageTier }: { packageTier: string }) {
  const pkg = PACKAGE_LABELS[packageTier];
  const isAffiliate = packageTier === "affiliate";
  const isMaster = packageTier === "master";

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Billing & Package</h1>
      <p className="text-white/50 text-sm mb-8">Your current partner package and payment history.</p>

      {/* Current package card */}
      <div className="rounded-2xl bg-[#111827] border border-white/10 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Active Package</p>
            <p className={`text-xl font-bold ${pkg?.color || "text-white"}`}>{pkg?.label || packageTier}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-400" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/30 text-sm">Setup fee:</span>
          <span className="text-white text-sm font-semibold">{pkg?.price || "—"}</span>
        </div>
        {isAffiliate && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-white/50 text-sm">
              Upgrade to <span className="text-green-400 font-semibold">Reseller (R999)</span> or <span className="text-yellow-400 font-semibold">Master Reseller (R4,999)</span> to unlock white-label branding, deeper commission levels, and dedicated support.
            </p>
          </div>
        )}
        {isMaster && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-white/50 text-sm">You are on the highest package tier. All features are unlocked.</p>
          </div>
        )}
      </div>

      {/* Features summary */}
      <div className="rounded-2xl bg-[#111827] border border-white/10 p-6">
        <p className="text-white/40 text-xs uppercase tracking-widest mb-4">What's Included</p>
        <ul className="space-y-2.5">
          {packageTier === "affiliate" && [
            "Unique referral link",
            "20% direct commissions",
            "Basic marketing materials",
            "Partner dashboard access",
          ].map(f => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-white/70">
              <CheckCircle className="h-4 w-4 text-green-400 shrink-0" /> {f}
            </li>
          ))}
          {packageTier === "reseller" && [
            "Everything in Affiliate",
            "White-label branding kit",
            "Custom sub-domain",
            "Level 2-3 commissions",
            "Dedicated support line",
            "Client management portal",
          ].map(f => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-white/70">
              <CheckCircle className="h-4 w-4 text-green-400 shrink-0" /> {f}
            </li>
          ))}
          {packageTier === "master" && [
            "Everything in Reseller",
            "Recruit & manage resellers",
            "All 5 commission levels",
            "Binary bonus unlocked",
            "Revenue share pool",
            "Co-branded marketing fund",
          ].map(f => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-white/70">
              <CheckCircle className="h-4 w-4 text-green-400 shrink-0" /> {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
