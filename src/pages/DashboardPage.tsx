import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate, Routes, Route, Navigate } from "react-router-dom";
import {
  LayoutDashboard, Globe, Smartphone, Megaphone, Receipt,
  Settings, ChevronLeft, ChevronRight, ChevronDown, Search, LogOut,
  Shield, Wallet, ClipboardCheck, CreditCard, FileText, Lock,
  BookOpen, HandCoins, Building2, Send, Car, Users, UserCheck, ArrowLeftRight, Banknote, CalendarDays, Award, Linkedin, MessageCircle, Crown, Sparkles, Package, Briefcase
} from "lucide-react";
import { Input } from "@/components/ui/input";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useAuth } from "@/contexts/AuthContext";
import WebsiteBuilder from "./WebsiteBuilder";
import FinancePage from "./FinancePage";
import InvoicesPage from "./InvoicesPage";
import GrantReadinessPage from "./GrantReadinessPage";
import SocialHub from "./social/SocialHub";
import BizConnectHub from "./bizconnect/BizConnectHub";
import SettingsPage from "./SettingsPage";
import DashboardOverview from "./DashboardOverview";
import BillingPage from "./BillingPage";
import TendersPage from "./TendersPage";
import BusinessPlanPage from "./BusinessPlanPage";
import FundingProposalPage from "./FundingProposalPage";
import CompanyVerifyPage from "./CompanyVerifyPage";
import FundingApplicationPage from "./FundingApplicationPage";
import VehicleManagementPage from "./VehicleManagementPage";
import LeadsPage from "./LeadsPage";
import InventoryPage from "./InventoryPage";
import PayrollPage from "./PayrollPage";
import LeavePage from "./LeavePage";
import ResellerDashboard from "./ResellerDashboard";
import ClientsPage from "./ClientsPage";
import CampaignsPage from "./CampaignsPage";
import AutomationsPage from "./AutomationsPage";
import WhatsAppSupportPage from "./WhatsAppSupportPage";
import TeamMembersPage from "./TeamMembersPage";
import TrialBanner from "@/components/TrialBanner";
import AIChatBot from "@/components/AIChatBot";

type PlanCode = "starter" | "pro" | "premium";
const PLAN_TIER: Record<PlanCode, number> = { starter: 1, pro: 2, premium: 3 };
const PLAN_NAME: Record<PlanCode, string> = {
  starter: "Enterprize",
  pro: "Enterprize Plus",
  premium: "Enterprize Premium",
};

type NavChild = {
  icon: React.ElementType;
  label: string;
  path: string;
  comingSoon?: boolean;
  requiresPlan?: PlanCode;
  perm?: string;
  ownerOnly?: boolean;
};

type NavGroup = {
  icon: React.ElementType;
  label: string;
  groupId: string;
  children: NavChild[];
  requiresPlan?: PlanCode;
  perms?: string[];
  ownerOnly?: boolean;
};

type NavSingle = {
  icon: React.ElementType;
  label: string;
  path: string;
  comingSoon?: boolean;
  requiresPlan?: PlanCode;
  perm?: string;
  ownerOnly?: boolean;
};

type NavItem = NavSingle | NavGroup;

const isGroup = (item: NavItem): item is NavGroup => "groupId" in item;


const baseNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard", perm: "overview" },
  { icon: Globe, label: "Website Builder", path: "/dashboard/website", perm: "website" },
  { icon: Smartphone, label: "Social Media", path: "/dashboard/social", requiresPlan: "pro" as PlanCode, perm: "social" },
  { icon: Linkedin, label: "Biz Connect", path: "/dashboard/biz-connect", requiresPlan: "pro" as PlanCode, perm: "biz_connect" },
  {
    icon: Wallet,
    label: "Transactions",
    groupId: "finance",
    requiresPlan: "pro",
    perms: ["finance", "invoices"],
    children: [
      { icon: Wallet, label: "Income/Expenses", path: "/dashboard/finance", requiresPlan: "pro", perm: "finance" },
      { icon: Receipt, label: "Quotes/Invoices", path: "/dashboard/invoices", requiresPlan: "pro", perm: "invoices" },
    ],
  },
  {
    icon: Briefcase,
    label: "Operations",
    groupId: "operations",
    requiresPlan: "premium",
    perms: ["clients", "inventory", "campaigns", "automations"],
    children: [
      { icon: UserCheck, label: "Clients", path: "/dashboard/clients", requiresPlan: "premium", perm: "clients" },
      { icon: Package, label: "Inventory", path: "/dashboard/inventory", requiresPlan: "premium", perm: "inventory" },
      { icon: Megaphone, label: "Campaigns", path: "/dashboard/campaigns", requiresPlan: "premium", perm: "campaigns" },
      { icon: Sparkles, label: "Automations", path: "/dashboard/automations", requiresPlan: "premium", perm: "automations" },
    ],
  },
  {
    icon: Banknote,
    label: "People & HR",
    groupId: "hr",
    requiresPlan: "premium",
    perms: ["payroll", "leave"],
    children: [
      { icon: Banknote, label: "Payroll", path: "/dashboard/payroll", requiresPlan: "premium", perm: "payroll" },
      { icon: CalendarDays, label: "Leave & HR", path: "/dashboard/leave", requiresPlan: "premium", perm: "leave" },
    ],
  },
  { icon: MessageCircle, label: "WhatsApp Support", path: "/dashboard/whatsapp-support", perm: "support" },
  { icon: Users, label: "User Accounts", path: "/dashboard/team", ownerOnly: true },
  { icon: Award, label: "Partner Program", path: "/dashboard/reseller", ownerOnly: true },
  { icon: CreditCard, label: "Billing", path: "/dashboard/billing", ownerOnly: true },
  { icon: Settings, label: "Settings", path: "/dashboard/settings", ownerOnly: true },
];

function UpgradeGate({ requiredPlan, planName, onUpgrade }: { requiredPlan: PlanCode; planName: string; onUpgrade: () => void }) {
  const features: Record<PlanCode, string[]> = {
    starter: ["Social Media Hub", "Biz Connect Network", "Website Builder"],
    pro: ["Invoicing & Quotes", "Income/Expense Tracking"],
    premium: ["Clients & Leads CRM", "Inventory Management", "Campaigns & Automations", "Payroll Management", "Leave & HR Tools", "Team Members (up to 10)"],
  };
  return (
    <div className="flex items-center justify-center h-full min-h-[400px] p-8">
      <div className="text-center space-y-6 max-w-md mx-auto">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
          <Crown className="h-8 w-8 text-amber-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-heading mb-2">Upgrade to {planName}</h2>
          <p className="text-muted-foreground leading-relaxed text-sm">
            This feature is included in the <strong>{planName}</strong> plan. Upgrade to unlock it and grow your business.
          </p>
        </div>
        <div className="rounded-lg bg-muted/50 p-4 text-left space-y-2">
          {(features[requiredPlan] || []).map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
              <span>{f}</span>
            </div>
          ))}
        </div>
        <button
          onClick={onUpgrade}
          className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-8 py-2.5 font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          <Crown className="h-4 w-4" />
          View Plans & Upgrade
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [hasShowroomSite, setHasShowroomSite] = useState(false);
  const [hasBrokerageSite, setHasBrokerageSite] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState<boolean | null>(null);
  const [planCode, setPlanCode] = useState<PlanCode | null>(null);
  const [upgradeModalPlan, setUpgradeModalPlan] = useState<PlanCode | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isImpersonating, originalAdminName, stopImpersonating } = useAuth();

  // Resellers have their own portal — redirect them
  useEffect(() => {
    if (user?.is_reseller && user?.role !== "admin") {
      navigate("/partner", { replace: true });
    }
  }, [user, navigate]);

  const refreshBillingStatus = useCallback(() => {
    if (user?.role === "admin") {
      setSubscriptionActive(true);
      setPlanCode("premium");
      return;
    }
    if (user?.teamMember) {
      // Owner's subscription gates this; team members shouldn't see the SMME billing wall.
      setSubscriptionActive(true);
    }
    fetch("/api/billing/status", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        setSubscriptionActive(!!d.active);
        const code = (d?.plan as PlanCode) || null;
        setPlanCode(code && PLAN_TIER[code] ? code : null);
      })
      .catch(() => { setSubscriptionActive(false); setPlanCode(null); });
  }, [user]);

  useEffect(() => {
    refreshBillingStatus();
  }, [refreshBillingStatus, location.pathname, location.search]);

  // Re-fetch billing/plan when another part of the app (e.g. BillingPage starting
  // a trial or completing a subscription) tells us things have changed, so the
  // sidebar lock badges update without a full page reload.
  useEffect(() => {
    const handler = () => refreshBillingStatus();
    window.addEventListener("billing:updated", handler);
    return () => window.removeEventListener("billing:updated", handler);
  }, [refreshBillingStatus]);

  const userTier = planCode ? PLAN_TIER[planCode] : 0;
  const meetsPlan = (req?: PlanCode) => !req || userTier >= PLAN_TIER[req];

  useEffect(() => {
    fetch("/api/websites/mine", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const sites = Array.isArray(data) ? data : [];
        setHasShowroomSite(sites.some((s: any) => s.content?.templateId === "showroom"));
        setHasBrokerageSite(sites.some((s: any) => s.content?.templateId === "brokerage"));
      })
      .catch(() => {});
  }, [location.pathname]);

  const teamMember = user?.teamMember || null;
  const teamPerms = teamMember?.permissions || [];
  const hasPerm = (p?: string) => !p || teamPerms.includes(p);

  const filterForTeamMember = (items: NavItem[]): NavItem[] => {
    if (!teamMember) return items;
    return items.flatMap((item): NavItem[] => {
      if (item.ownerOnly) return [];
      if (isGroup(item)) {
        const allowedChildren = item.children.filter(c => !c.ownerOnly && hasPerm(c.perm));
        if (allowedChildren.length === 0) return [];
        return [{ ...item, children: allowedChildren }];
      }
      if (!hasPerm(item.perm)) return [];
      return [item];
    });
  };

  const navItems: NavItem[] = filterForTeamMember([
    ...baseNavItems.slice(0, 5),
    ...(hasShowroomSite ? [{ icon: Car, label: "Vehicles", path: "/dashboard/vehicles", perm: "website" } as NavSingle] : []),
    ...(hasBrokerageSite ? [{ icon: Users, label: "Leads", path: "/dashboard/leads", perm: "website" } as NavSingle] : []),
    ...baseNavItems.slice(5),
  ]);

  const allPaths: { label: string; path: string }[] = navItems.flatMap(item =>
    isGroup(item) ? item.children.map(c => ({ label: c.label, path: c.path })) : [{ label: item.label, path: item.path }]
  );

  const getPageTitle = () => {
    if (location.pathname.startsWith("/dashboard/social")) return "Social Media Hub";
    if (location.pathname.startsWith("/dashboard/biz-connect")) return "Biz Connect";
    const match = allPaths.find(p =>
      p.path === "/dashboard" ? location.pathname === "/dashboard" : location.pathname.startsWith(p.path)
    );
    return match ? match.label : "Dashboard";
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const initials = user?.full_name?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "U";

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const isGroupActive = (group: NavGroup) =>
    group.children.some(c => location.pathname.startsWith(c.path));

  const sidebarWide = mobileMenuOpen || !collapsed;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-40 flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 md:relative md:z-auto
          ${sidebarWide ? "w-64" : "w-16"}
          ${mobileMenuOpen ? "flex" : "hidden md:flex"}
        `}
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-sidebar-border">
          {sidebarWide && (
            <Link to="/dashboard" className="flex items-center gap-2 min-w-0">
              {user?.logo_url ? (
                <img src={user.logo_url} alt="Logo" className="h-10 w-10 rounded-lg object-contain shrink-0" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-hero shrink-0">
                  <span className="text-base font-bold text-primary-foreground font-heading">
                    {user?.business_name?.[0] || "M"}
                  </span>
                </div>
              )}
              <span className="text-lg font-bold font-heading text-sidebar-foreground truncate">
                {user?.business_name || "Masakhe"}
              </span>
            </Link>
          )}
          {!sidebarWide && (
            <Link to="/dashboard" className="mx-auto">
              {user?.logo_url ? (
                <img src={user.logo_url} alt="Logo" className="h-10 w-10 rounded-lg object-contain" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-hero">
                  <span className="text-base font-bold text-primary-foreground font-heading">
                    {user?.business_name?.[0] || "M"}
                  </span>
                </div>
              )}
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:block text-sidebar-foreground/60 hover:text-sidebar-foreground shrink-0"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-0.5 px-2">
          {navItems.map((item) => {
            if (isGroup(item)) {
              const active = isGroupActive(item);
              const open = openGroups.has(item.groupId) && sidebarWide;
              const groupLocked = !meetsPlan(item.requiresPlan);
              const groupReqName = groupLocked && item.requiresPlan ? PLAN_NAME[item.requiresPlan] : "";
              return (
                <div key={item.groupId}>
                  <button
                    onClick={() => {
                      if (!sidebarWide) return;
                      if (groupLocked) { setUpgradeModalPlan(item.requiresPlan!); return; }
                      toggleGroup(item.groupId);
                    }}
                    title={groupLocked ? `Requires ${groupReqName}` : undefined}
                    className={`group relative w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      groupLocked
                        ? "text-sidebar-foreground/45 hover:bg-sidebar-accent/30"
                        : active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {sidebarWide && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {groupLocked ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide rounded-full bg-amber-500/15 text-amber-600 px-1.5 py-0.5">
                            <Crown className="h-2.5 w-2.5" />
                            {item.requiresPlan === "premium" ? "Premium" : "Plus"}
                          </span>
                        ) : (
                          <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
                        )}
                      </>
                    )}
                    {!sidebarWide && (
                      <span className="pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        {item.label}{groupLocked ? ` — Requires ${groupReqName}` : ""}
                      </span>
                    )}
                  </button>
                  {open && (
                    <div className="mt-0.5 ml-3 pl-3 border-l border-sidebar-border space-y-0.5">
                      {item.children.map(child => {
                        const childActive = location.pathname.startsWith(child.path);
                        const childLocked = !meetsPlan(child.requiresPlan);
                        if (child.comingSoon) {
                          return (
                            <div
                              key={child.path}
                              title="Coming soon to enterprises"
                              className="group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm cursor-not-allowed text-sidebar-foreground/35 select-none"
                            >
                              <child.icon className="h-4 w-4 shrink-0" />
                              <span className="flex-1">{child.label}</span>
                              <Lock className="h-3 w-3 shrink-0 opacity-60" />
                            </div>
                          );
                        }
                        if (childLocked) {
                          const reqName = PLAN_NAME[child.requiresPlan as PlanCode];
                          return (
                            <button
                              key={child.path}
                              onClick={() => setUpgradeModalPlan(child.requiresPlan as PlanCode)}
                              title={`Requires ${reqName}`}
                              className="group relative w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/45 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground/70 transition-colors"
                            >
                              <child.icon className="h-4 w-4 shrink-0" />
                              <span className="flex-1 text-left truncate">{child.label}</span>
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide rounded-full bg-amber-500/15 text-amber-600 px-1.5 py-0.5">
                                <Crown className="h-2.5 w-2.5" />
                                {child.requiresPlan === "premium" ? "Premium" : child.requiresPlan === "starter" ? "Upgrade" : "Plus"}
                              </span>
                            </button>
                          );
                        }
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                              childActive
                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                            }`}
                          >
                            <child.icon className="h-4 w-4 shrink-0" />
                            <span>{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const active = item.path === "/dashboard"
              ? location.pathname === "/dashboard"
              : location.pathname.startsWith(item.path);
            const itemLocked = !meetsPlan(item.requiresPlan);
            const itemReqName = itemLocked && item.requiresPlan ? PLAN_NAME[item.requiresPlan] : "";

            if (item.comingSoon) {
              return (
                <div
                  key={item.path}
                  title="Coming soon to enterprises"
                  className="group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm cursor-not-allowed text-sidebar-foreground/35 select-none"
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {sidebarWide && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      <Lock className="h-3.5 w-3.5 shrink-0 opacity-60" />
                    </>
                  )}
                  {!sidebarWide && (
                    <span className="pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      {item.label} — Coming soon to enterprises
                    </span>
                  )}
                </div>
              );
            }

            if (itemLocked) {
              return (
                <button
                  key={item.path}
                  onClick={() => setUpgradeModalPlan(item.requiresPlan as PlanCode)}
                  title={`Requires ${itemReqName}`}
                  className="group relative w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/45 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground/70 transition-colors"
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {sidebarWide && (
                    <>
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide rounded-full bg-amber-500/15 text-amber-600 px-1.5 py-0.5">
                        <Crown className="h-2.5 w-2.5" />
                        {item.requiresPlan === "premium" ? "Premium" : item.requiresPlan === "starter" ? "Upgrade" : "Plus"}
                      </span>
                    </>
                  )}
                  {!sidebarWide && (
                    <span className="pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      {item.label} — Requires {itemReqName}
                    </span>
                  )}
                </button>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {sidebarWide && <span>{item.label}</span>}
                {!sidebarWide && (
                  <span className="pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User identity card */}
        {user && sidebarWide && (() => {
          const isAdmin = user.role === "admin";
          const isTeam = !!user.teamMember;
          const isPartner = !!user.is_reseller && !isAdmin;
          let roleLabel = "Business Owner";
          let roleColor = "bg-emerald-500/15 text-emerald-300 border-emerald-500/25";
          if (isAdmin) {
            roleLabel = "Super Admin";
            roleColor = "bg-amber-500/15 text-amber-300 border-amber-500/30";
          } else if (isTeam) {
            roleLabel = "Team Member";
            roleColor = "bg-blue-500/15 text-blue-300 border-blue-500/30";
          } else if (isPartner) {
            roleLabel = "Partner";
            roleColor = "bg-purple-500/15 text-purple-300 border-purple-500/30";
          }
          const initials = (user.full_name || user.email || "?")
            .split(/\s+/)
            .map(s => s[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("")
            .toUpperCase();
          return (
            <div className="shrink-0 mx-2 mb-2 rounded-lg border border-sidebar-border bg-sidebar-accent/30 px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white">
                  {initials || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-sidebar-foreground">
                    {user.full_name || user.email}
                  </div>
                  <div className="truncate text-[11px] text-sidebar-foreground/55">
                    {user.email}
                  </div>
                </div>
              </div>
              <div className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${roleColor}`}>
                {isAdmin && <Shield className="h-3 w-3" />}
                {isTeam && <Users className="h-3 w-3" />}
                {isPartner && <Award className="h-3 w-3" />}
                {!isAdmin && !isTeam && !isPartner && <Building2 className="h-3 w-3" />}
                {roleLabel}
              </div>
              {isTeam && user.teamMember?.owner_business_name && (
                <div className="mt-1.5 truncate text-[10px] text-sidebar-foreground/45">
                  at {user.teamMember.owner_business_name}
                </div>
              )}
            </div>
          );
        })()}

        {/* Bottom actions */}
        <div className="shrink-0 px-2 pb-2 space-y-0.5">
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            >
              <Shield className="h-5 w-5 shrink-0" />
              {sidebarWide && <span>Admin Panel</span>}
              {!sidebarWide && (
                <span className="pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  Admin Panel
                </span>
              )}
            </Link>
          )}
          {user?.role === "franchise" && (
            <Link
              to="/franchise"
              className="group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            >
              <Building2 className="h-5 w-5 shrink-0" />
              {sidebarWide && <span>Franchise Portal</span>}
              {!sidebarWide && (
                <span className="pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  Franchise Portal
                </span>
              )}
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {sidebarWide && <span>Sign Out</span>}
            {!sidebarWide && (
              <span className="pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                Sign Out
              </span>
            )}
          </button>
        </div>

        {/* SA flag stripe */}
        <div className="flex h-1 shrink-0">
          <div className="flex-1 bg-sa-green" />
          <div className="flex-1 bg-sa-gold" />
          <div className="flex-1 bg-sa-red" />
          <div className="flex-1 bg-sa-blue" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-foreground/70 hover:text-foreground"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold font-heading text-foreground truncate">{getPageTitle()}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-9 w-64" />
            </div>
            <NotificationDropdown />
            <Link to="/dashboard/settings" className="shrink-0">
              {user?.logo_url ? (
                <img src={user.logo_url} alt="Logo" className="h-9 w-9 rounded-full object-contain" />
              ) : (
                <div className="h-9 w-9 rounded-full gradient-hero flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">{initials}</span>
                </div>
              )}
            </Link>
          </div>
        </header>

        {isImpersonating && (
          <div className="shrink-0 flex items-center justify-between gap-4 bg-amber-500 px-4 py-2.5 text-white text-sm font-medium">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 shrink-0" />
              <span>
                You are logged in as <strong>{user?.full_name}</strong> ({user?.email}).
                {originalAdminName && <> Session started by <strong>{originalAdminName}</strong>.</>}
              </span>
            </div>
            <button
              onClick={async () => {
                await stopImpersonating();
                window.location.href = "/admin/clients";
              }}
              className="shrink-0 flex items-center gap-1.5 rounded-lg bg-white/20 hover:bg-white/30 px-3 py-1.5 text-xs font-bold transition-colors"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Return to Admin Account
            </button>
          </div>
        )}
        <TrialBanner />
        <div className="flex-1 overflow-auto min-h-0 relative">
          <Routes>
            <Route index element={<DashboardOverview />} />
            <Route path="website" element={<WebsiteBuilder />} />
            <Route path="social/*" element={
              meetsPlan("starter") ? <SocialHub /> : <UpgradeGate requiredPlan="starter" planName={PLAN_NAME["starter"]} onUpgrade={() => navigate("/dashboard/billing")} />
            } />
            <Route path="biz-connect/*" element={
              meetsPlan("starter") ? <BizConnectHub /> : <UpgradeGate requiredPlan="starter" planName={PLAN_NAME["starter"]} onUpgrade={() => navigate("/dashboard/billing")} />
            } />
            <Route path="finance" element={
              meetsPlan("pro") ? <FinancePage /> : <UpgradeGate requiredPlan="pro" planName={PLAN_NAME["pro"]} onUpgrade={() => navigate("/dashboard/billing")} />
            } />
            <Route path="invoices" element={
              meetsPlan("pro") ? <InvoicesPage /> : <UpgradeGate requiredPlan="pro" planName={PLAN_NAME["pro"]} onUpgrade={() => navigate("/dashboard/billing")} />
            } />
            <Route path="clients" element={
              meetsPlan("pro") ? <ClientsPage /> : <UpgradeGate requiredPlan="pro" planName={PLAN_NAME["pro"]} onUpgrade={() => navigate("/dashboard/billing")} />
            } />
            <Route path="inventory" element={
              meetsPlan("pro") ? <InventoryPage /> : <UpgradeGate requiredPlan="pro" planName={PLAN_NAME["pro"]} onUpgrade={() => navigate("/dashboard/billing")} />
            } />
            <Route path="campaigns" element={
              meetsPlan("pro") ? <CampaignsPage /> : <UpgradeGate requiredPlan="pro" planName={PLAN_NAME["pro"]} onUpgrade={() => navigate("/dashboard/billing")} />
            } />
            <Route path="automations" element={
              meetsPlan("pro") ? <AutomationsPage /> : <UpgradeGate requiredPlan="pro" planName={PLAN_NAME["pro"]} onUpgrade={() => navigate("/dashboard/billing")} />
            } />
            <Route path="payroll" element={
              meetsPlan("premium") ? <PayrollPage /> : <UpgradeGate requiredPlan="premium" planName={PLAN_NAME["premium"]} onUpgrade={() => navigate("/dashboard/billing")} />
            } />
            <Route path="leave" element={
              meetsPlan("premium") ? <LeavePage /> : <UpgradeGate requiredPlan="premium" planName={PLAN_NAME["premium"]} onUpgrade={() => navigate("/dashboard/billing")} />
            } />
            <Route path="team" element={
              meetsPlan("premium") ? <TeamMembersPage /> : <UpgradeGate requiredPlan="premium" planName={PLAN_NAME["premium"]} onUpgrade={() => navigate("/dashboard/billing")} />
            } />
            <Route path="funding" element={<Navigate to="/dashboard" replace />} />
            <Route path="tenders" element={<TendersPage />} />
            <Route path="business-plan" element={<Navigate to="/dashboard" replace />} />
            <Route path="funding-proposal" element={<Navigate to="/dashboard" replace />} />
            <Route path="annual-statements" element={<Navigate to="/dashboard" replace />} />
            <Route path="company-verify" element={<Navigate to="/dashboard" replace />} />
            <Route path="funding-applications" element={<Navigate to="/dashboard" replace />} />
            <Route path="vehicles" element={<VehicleManagementPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="reseller" element={<ResellerDashboard />} />
            <Route path="whatsapp-support" element={<WhatsAppSupportPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<DashboardOverview />} />
          </Routes>
        </div>
      </main>
      <AIChatBot />

      {upgradeModalPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setUpgradeModalPlan(null)}
        >
          <div
            className="bg-background rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center space-y-5 border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Crown className="h-7 w-7 text-amber-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-heading mb-1.5">
                Upgrade to {PLAN_NAME[upgradeModalPlan]}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This feature is available on the <strong>{PLAN_NAME[upgradeModalPlan]}</strong> plan.
                Upgrade to unlock it and access all the tools your business needs to grow.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setUpgradeModalPlan(null)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={() => { setUpgradeModalPlan(null); navigate("/dashboard/billing"); }}
                className="flex-1 rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                View Plans
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
