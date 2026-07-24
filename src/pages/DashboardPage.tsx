import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate, Routes, Route, Navigate } from "react-router-dom";
import {
  LayoutDashboard, Globe, Smartphone, Megaphone, Receipt,
  Settings, ChevronLeft, ChevronRight, ChevronDown, Search, LogOut,
  Shield, Wallet, CreditCard, FileText, Lock,
  BookOpen, HandCoins, Building2, Send, Car, Users, UserCheck, ArrowLeftRight, Banknote, CalendarDays, Award, Linkedin, MessageCircle, Crown, Sparkles, Package, Briefcase
} from "lucide-react";
import { Input } from "@/components/ui/input";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useAuth } from "@/contexts/AuthContext";
import WebsiteHub from "./WebsiteHub";
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
import EmployeesPage from "./EmployeesPage";
import ResellerDashboard from "./ResellerDashboard";
import ClientsPage from "./ClientsPage";
import CampaignsPage from "./CampaignsPage";
import AutomationsPage from "./AutomationsPage";
import WhatsAppSupportPage from "./WhatsAppSupportPage";
import MunicipalitySupportPage from "./MunicipalitySupportPage";
import StaffRosterPage from "./StaffRosterPage";
import TeamMembersPage from "./TeamMembersPage";
import HelpCentrePage from "./HelpCentrePage";
import TrialBanner from "@/components/TrialBanner";
import TrialExpiredModal from "@/components/TrialExpiredModal";
import OnboardingTour from "@/components/OnboardingTour";

type ModuleCode = "web_builder" | "social_biz" | "transactions_ops" | "people_hr";

const MODULE_NAME: Record<ModuleCode, string> = {
  web_builder:      "Web Builder",
  social_biz:       "Social Media & Biz Connect",
  transactions_ops: "Transactions & Operations",
  people_hr:        "Human Capital",
};

const MODULE_BADGE: Record<ModuleCode, string> = {
  web_builder:      "Web",
  social_biz:       "Social",
  transactions_ops: "Ops",
  people_hr:        "HR",
};

const MODULE_FEATURES: Record<ModuleCode, string[]> = {
  web_builder:      ["Professional website builder", "44+ industry templates", "AI content generation"],
  social_biz:       ["Social Media Hub & scheduler", "Facebook, Instagram, LinkedIn", "Biz Connect networking"],
  transactions_ops: ["Income & expense tracking", "Quotes & invoicing", "Client & inventory management", "Campaigns & automations"],
  people_hr:        ["Payroll management", "Leave & HR tools", "Employee records"],
};

const MODULE_PRICE: Record<ModuleCode, string> = {
  web_builder:      "R299/month",
  social_biz:       "R500/month",
  transactions_ops: "R500/month",
  people_hr:        "R500/month",
};

type NavChild = {
  icon: React.ElementType;
  label: string;
  path: string;
  comingSoon?: boolean;
  requiresModule?: ModuleCode;
  perm?: string;
  ownerOnly?: boolean;
};

type NavGroup = {
  icon: React.ElementType;
  label: string;
  groupId: string;
  children: NavChild[];
  requiresModule?: ModuleCode;
  perms?: string[];
  ownerOnly?: boolean;
};

type NavSingle = {
  icon: React.ElementType;
  label: string;
  path: string;
  comingSoon?: boolean;
  requiresModule?: ModuleCode;
  perm?: string;
  ownerOnly?: boolean;
  openNewTab?: boolean;
};

type NavItem = NavSingle | NavGroup;

const isGroup = (item: NavItem): item is NavGroup => "groupId" in item;

const baseNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard", perm: "overview" },
  { icon: Globe, label: "Website Builder", path: "/website-builder", requiresModule: "web_builder", perm: "website", openNewTab: true },
  { icon: Smartphone, label: "Social Media", path: "/social-hub", requiresModule: "social_biz", perm: "social", openNewTab: true },
  { icon: Linkedin, label: "Biz Connect", path: "/dashboard/biz-connect", requiresModule: "social_biz", perm: "biz_connect" },
  {
    icon: Wallet,
    label: "Transactions",
    groupId: "finance",
    requiresModule: "transactions_ops",
    perms: ["finance", "invoices"],
    children: [
      { icon: Wallet, label: "Income/Expenses", path: "/dashboard/finance", requiresModule: "transactions_ops", perm: "finance" },
      { icon: Receipt, label: "Quotes/Invoices", path: "/dashboard/invoices", requiresModule: "transactions_ops", perm: "invoices" },
    ],
  },
  {
    icon: Briefcase,
    label: "Operations",
    groupId: "operations",
    requiresModule: "transactions_ops",
    perms: ["clients", "inventory", "campaigns", "automations"],
    children: [
      { icon: UserCheck, label: "Clients", path: "/dashboard/clients", requiresModule: "transactions_ops", perm: "clients" },
      { icon: Package, label: "Inventory", path: "/dashboard/inventory", requiresModule: "transactions_ops", perm: "inventory" },
      { icon: Megaphone, label: "Campaigns", path: "/dashboard/campaigns", requiresModule: "transactions_ops", perm: "campaigns" },
      { icon: Sparkles, label: "Automations", path: "/dashboard/automations", requiresModule: "transactions_ops", perm: "automations" },
    ],
  },
  {
    icon: Banknote,
    label: "Human Capital",
    groupId: "hr",
    requiresModule: "people_hr",
    perms: ["payroll", "leave"],
    children: [
      { icon: Users, label: "Employees", path: "/dashboard/employees", requiresModule: "people_hr", perm: "payroll" },
      { icon: Banknote, label: "Payroll", path: "/dashboard/payroll", requiresModule: "people_hr", perm: "payroll" },
      { icon: CalendarDays, label: "Leave Processing", path: "/dashboard/leave", requiresModule: "people_hr", perm: "leave" },
      { icon: CalendarDays, label: "Staff Roster", path: "/dashboard/roster", requiresModule: "people_hr", perm: "payroll" },
    ],
  },
  { icon: Award, label: "Partner Program", path: "/dashboard/reseller", ownerOnly: true },
];

function ModuleGate({ moduleCode, onUpgrade }: { moduleCode: ModuleCode; onUpgrade: () => void }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px] p-8">
      <div className="text-center space-y-6 max-w-md mx-auto">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
          <Crown className="h-8 w-8 text-amber-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-heading mb-2">Add {MODULE_NAME[moduleCode]}</h2>
          <p className="text-muted-foreground leading-relaxed text-sm">
            This feature is part of the <strong>{MODULE_NAME[moduleCode]}</strong> module ({MODULE_PRICE[moduleCode]}).
            Add it to your subscription to unlock all these tools.
          </p>
        </div>
        <div className="rounded-lg bg-muted/50 p-4 text-left space-y-2">
          {MODULE_FEATURES[moduleCode].map((f) => (
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
          Manage Modules
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
  const [activeModules, setActiveModules] = useState<string[]>([]);
  const [trialExpired, setTrialExpired] = useState(false);
  const [trialEndedAt, setTrialEndedAt] = useState<string | null>(null);
  const [upgradeModalModule, setUpgradeModalModule] = useState<ModuleCode | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isImpersonating, originalAdminName, stopImpersonating } = useAuth();

  useEffect(() => {
    if (user?.is_reseller && user?.role !== "admin") {
      navigate("/partner", { replace: true });
    }
  }, [user, navigate]);

  const refreshBillingStatus = useCallback(() => {
    if (user?.role === "admin") {
      setSubscriptionActive(true);
      setActiveModules(["web_builder", "social_biz", "transactions_ops", "people_hr"]);
      return;
    }
    if (user?.teamMember) {
      setSubscriptionActive(true);
    }
    fetch("/api/billing/status", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        setSubscriptionActive(!!d.active);
        setActiveModules(Array.isArray(d.modules) ? d.modules : []);
        const expired = !!d.trialExpired;
        setTrialExpired(expired);
        setTrialEndedAt(d.trialEndedAt || null);
        if (!d.active && !user?.teamMember && user?.role !== "admin") {
          const path = window.location.pathname;
          if (!path.endsWith("/billing") && !path.endsWith("/settings")) {
            navigate("/dashboard/billing", { replace: true });
          }
        }
      })
      .catch(() => { setSubscriptionActive(false); setActiveModules([]); });
  }, [user, navigate]);

  useEffect(() => {
    refreshBillingStatus();
  }, [refreshBillingStatus, location.pathname, location.search]);

  useEffect(() => {
    const handler = () => refreshBillingStatus();
    window.addEventListener("billing:updated", handler);
    return () => window.removeEventListener("billing:updated", handler);
  }, [refreshBillingStatus]);

  const hasModule = (m?: ModuleCode) => !m || activeModules.includes(m);

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

  const NEXO_HIDDEN_LABELS = ["Website Builder", "Social Media", "Biz Connect"];
  const navItems: NavItem[] = filterForTeamMember([
    ...baseNavItems.slice(0, 5),
    ...(hasShowroomSite ? [{ icon: Car, label: "Vehicles", path: "/dashboard/vehicles", perm: "website" } as NavSingle] : []),
    ...(hasBrokerageSite ? [{ icon: Users, label: "Leads", path: "/dashboard/leads", perm: "website" } as NavSingle] : []),
    ...baseNavItems.slice(5),
  ]).filter(item => !isNexoClient || !(!isGroup(item) && NEXO_HIDDEN_LABELS.includes((item as NavSingle).label)));

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
    navigate(isMtnClient ? "/mtn" : isNexoClient ? "/nexo" : "/");
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

  const isMtnClient = !!user?.is_mtn_client;
  const isNexoClient = !!user?.is_nexo_client;
  const mtnSidebarStyle = isMtnClient ? { backgroundColor: "#1a1a1a", borderColor: "#2a2a2a" } : {};
  const activeNavCls = isMtnClient
    ? "bg-yellow-500/20 text-yellow-400 font-semibold"
    : "bg-sidebar-accent text-sidebar-accent-foreground font-semibold";
  const inactiveNavCls = isMtnClient
    ? "text-gray-400 hover:bg-yellow-500/10 hover:text-yellow-300"
    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground";

  const showOnboarding = new URLSearchParams(location.search).get("onboarding") === "1";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {showOnboarding && <OnboardingTour />}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 bottom-0 z-40 flex-col border-r transition-all duration-300 md:relative md:z-auto
          ${isMtnClient ? "border-[#2a2a2a]" : "border-sidebar-border bg-sidebar"}
          ${sidebarWide ? "w-64" : "w-16"}
          ${mobileMenuOpen ? "flex" : "hidden md:flex"}
        `}
        style={mtnSidebarStyle}
      >
        <div
          className={`flex h-16 shrink-0 items-center justify-between px-4 border-b ${isMtnClient ? "border-[#2a2a2a]" : "border-sidebar-border"}`}
        >
          {sidebarWide && (
            <Link to="/dashboard" className="flex items-center gap-2 min-w-0">
              {isMtnClient ? (
                <>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "#FFCC00" }}>
                    <span className="text-xs font-black text-black">MTN</span>
                  </div>
                  <span className="text-lg font-bold font-heading truncate" style={{ color: "#FFCC00" }}>
                    {user?.business_name || "MTN Business"}
                  </span>
                </>
              ) : user?.logo_url ? (
                <img src={user.logo_url} alt="Logo" className="h-10 w-10 rounded-lg object-contain shrink-0" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-hero shrink-0">
                  <span className="text-base font-bold text-primary-foreground font-heading">
                    {user?.business_name?.[0] || "M"}
                  </span>
                </div>
              )}
              {!isMtnClient && (
                <span className="text-lg font-bold font-heading text-sidebar-foreground truncate">
                  {user?.business_name || "Masakhe"}
                </span>
              )}
            </Link>
          )}
          {!sidebarWide && (
            <Link to="/dashboard" className="mx-auto">
              {isMtnClient ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "#FFCC00" }}>
                  <span className="text-xs font-black text-black">MTN</span>
                </div>
              ) : user?.logo_url ? (
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

        <nav className="flex-1 overflow-y-auto py-4 space-y-0.5 px-2">
          {navItems.map((item) => {
            if (isGroup(item)) {
              const active = isGroupActive(item);
              const open = openGroups.has(item.groupId) && sidebarWide;
              const groupLocked = !hasModule(item.requiresModule);
              const groupModName = item.requiresModule ? MODULE_BADGE[item.requiresModule] : "";
              return (
                <div key={item.groupId}>
                  <button
                    onClick={() => {
                      if (!sidebarWide) return;
                      if (groupLocked) { setUpgradeModalModule(item.requiresModule!); return; }
                      toggleGroup(item.groupId);
                    }}
                    title={groupLocked ? `Add ${item.requiresModule ? MODULE_NAME[item.requiresModule] : "module"}` : undefined}
                    className={`group relative w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      groupLocked
                        ? "text-sidebar-foreground/45 hover:bg-sidebar-accent/30"
                        : active
                          ? activeNavCls
                          : inactiveNavCls
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {sidebarWide && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {groupLocked ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide rounded-full bg-amber-500/15 text-amber-600 px-1.5 py-0.5">
                            <Crown className="h-2.5 w-2.5" />
                            {groupModName}
                          </span>
                        ) : (
                          <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
                        )}
                      </>
                    )}
                    {!sidebarWide && (
                      <span className="pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        {item.label}{groupLocked && item.requiresModule ? ` — Add ${MODULE_NAME[item.requiresModule]}` : ""}
                      </span>
                    )}
                  </button>
                  {open && (
                    <div className="mt-0.5 ml-3 pl-3 border-l border-sidebar-border space-y-0.5">
                      {item.children.map(child => {
                        const childActive = location.pathname.startsWith(child.path);
                        const childLocked = !hasModule(child.requiresModule);
                        if (child.comingSoon) {
                          return (
                            <div
                              key={child.path}
                              className="group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm cursor-not-allowed text-sidebar-foreground/35 select-none"
                            >
                              <child.icon className="h-4 w-4 shrink-0" />
                              <span className="flex-1">{child.label}</span>
                              <Lock className="h-3 w-3 shrink-0 opacity-60" />
                            </div>
                          );
                        }
                        if (childLocked) {
                          return (
                            <button
                              key={child.path}
                              onClick={() => child.requiresModule && setUpgradeModalModule(child.requiresModule)}
                              className="group relative w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/45 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground/70 transition-colors"
                            >
                              <child.icon className="h-4 w-4 shrink-0" />
                              <span className="flex-1 text-left truncate">{child.label}</span>
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide rounded-full bg-amber-500/15 text-amber-600 px-1.5 py-0.5">
                                <Crown className="h-2.5 w-2.5" />
                                {child.requiresModule ? MODULE_BADGE[child.requiresModule] : ""}
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
                                ? activeNavCls
                                : inactiveNavCls
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
            const itemLocked = !hasModule((item as NavSingle).requiresModule);

            if (item.comingSoon) {
              return (
                <div
                  key={item.path}
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
                      {item.label} — Coming soon
                    </span>
                  )}
                </div>
              );
            }

            if (itemLocked) {
              const modCode = (item as NavSingle).requiresModule!;
              return (
                <button
                  key={item.path}
                  onClick={() => setUpgradeModalModule(modCode)}
                  className="group relative w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/45 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground/70 transition-colors"
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {sidebarWide && (
                    <>
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide rounded-full bg-amber-500/15 text-amber-600 px-1.5 py-0.5">
                        <Crown className="h-2.5 w-2.5" />
                        {MODULE_BADGE[modCode]}
                      </span>
                    </>
                  )}
                  {!sidebarWide && (
                    <span className="pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      {item.label} — Add {MODULE_NAME[modCode]}
                    </span>
                  )}
                </button>
              );
            }

            if ((item as any).openNewTab) {
              return (
                <a
                  key={item.path}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {sidebarWide && <span>{item.label}</span>}
                  {!sidebarWide && (
                    <span className="pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      {item.label}
                    </span>
                  )}
                </a>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active ? activeNavCls : inactiveNavCls
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

        {user && sidebarWide && (() => {
          const isAdmin = user.role === "admin";
          const isTeam = !!user.teamMember;
          const isPartner = !!user.is_reseller && !isAdmin;
          let roleLabel = isMtnClient ? "MTN Client" : "Business Owner";
          let roleColor = isMtnClient
            ? "border-yellow-500/30"
            : "bg-emerald-500/15 text-emerald-300 border-emerald-500/25";
          const roleLabelStyle = isMtnClient ? { backgroundColor: "#FFCC0020", color: "#FFCC00" } : {};
          if (!isMtnClient) {
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
          }
          const initials2 = (user.full_name || user.email || "?")
            .split(/\s+/)
            .map(s => s[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("")
            .toUpperCase();
          return (
            <div
              className={`shrink-0 mx-2 mb-2 rounded-lg border px-3 py-2.5 ${isMtnClient ? "" : "border-sidebar-border bg-sidebar-accent/30"}`}
              style={isMtnClient ? { backgroundColor: "#252525", borderColor: "#2a2a2a" } : undefined}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isMtnClient ? "" : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"}`}
                  style={isMtnClient ? { backgroundColor: "#FFCC00", color: "#000" } : undefined}
                >
                  {initials2 || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`truncate text-sm font-medium ${isMtnClient ? "" : "text-sidebar-foreground"}`} style={isMtnClient ? { color: "#e5e5e5" } : undefined}>
                    {user.full_name || user.email}
                  </div>
                  <div className={`truncate text-[11px] ${isMtnClient ? "" : "text-sidebar-foreground/55"}`} style={isMtnClient ? { color: "#888" } : undefined}>
                    {user.email}
                  </div>
                </div>
              </div>
              <div
                className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${roleColor}`}
                style={roleLabelStyle}
              >
                {isMtnClient && <Building2 className="h-3 w-3" />}
                {!isMtnClient && isAdmin && <Shield className="h-3 w-3" />}
                {!isMtnClient && isTeam && <Users className="h-3 w-3" />}
                {!isMtnClient && isPartner && <Award className="h-3 w-3" />}
                {!isMtnClient && !isAdmin && !isTeam && !isPartner && <Building2 className="h-3 w-3" />}
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

        {isMtnClient ? (
          <div className="flex h-1 shrink-0">
            <div className="flex-1" style={{ backgroundColor: "#FFCC00" }} />
            <div className="flex-1" style={{ backgroundColor: "#000000" }} />
            <div className="flex-1" style={{ backgroundColor: "#FFCC00" }} />
            <div className="flex-1" style={{ backgroundColor: "#000000" }} />
          </div>
        ) : (
          <div className="flex h-1 shrink-0">
            <div className="flex-1 bg-sa-green" />
            <div className="flex-1 bg-sa-gold" />
            <div className="flex-1 bg-sa-red" />
            <div className="flex-1 bg-sa-blue" />
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-hidden">
        <header
          className={`sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b backdrop-blur-md px-4 md:px-6 ${isMtnClient ? "" : "border-emerald-100 bg-white/95"}`}
          style={isMtnClient ? { backgroundColor: "#141414", borderColor: "#2a2a2a" } : undefined}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-foreground/70 hover:text-foreground"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1
              className={`text-xl font-bold font-heading truncate ${isMtnClient ? "" : "text-emerald-900"}`}
              style={isMtnClient ? { color: "#FFCC00" } : undefined}
            >
              {getPageTitle()}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-9 w-64" />
            </div>
            <NotificationDropdown />
            <Link
              to="/dashboard/help"
              title="Help Centre"
              className={`shrink-0 p-1.5 rounded-lg transition-colors ${isMtnClient ? "text-gray-300 hover:bg-white/10" : "text-emerald-700 hover:bg-emerald-50"}`}
            >
              <BookOpen className="h-5 w-5" />
            </Link>
            {!user?.teamMember && (
              <Link
                to="/dashboard/team"
                title="User Accounts"
                className={`shrink-0 p-1.5 rounded-lg transition-colors ${isMtnClient ? "text-gray-300 hover:bg-white/10" : "text-emerald-700 hover:bg-emerald-50"}`}
              >
                <Users className="h-5 w-5" />
              </Link>
            )}
            {!user?.teamMember && (
              <Link
                to="/dashboard/billing"
                title="Billing"
                className={`shrink-0 p-1.5 rounded-lg transition-colors ${isMtnClient ? "text-gray-300 hover:bg-white/10" : "text-emerald-700 hover:bg-emerald-50"}`}
              >
                <CreditCard className="h-5 w-5" />
              </Link>
            )}
            <Link to="/dashboard/settings" className="shrink-0">
              {user?.logo_url ? (
                <img src={user.logo_url} alt="Logo" className="h-9 w-9 rounded-full object-contain" />
              ) : isMtnClient ? (
                <div className="h-9 w-9 rounded-full flex items-center justify-center font-black text-xs" style={{ backgroundColor: "#FFCC00", color: "#1a1a1a" }}>
                  {initials}
                </div>
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
        <div className="flex-1 overflow-auto min-h-0 relative mobile-hscroll">
          <Routes>
            <Route index element={<DashboardOverview />} />
            <Route path="website/*" element={<WebsiteHub />} />
            <Route path="social/*" element={
              hasModule("social_biz") ? <SocialHub /> : <ModuleGate moduleCode="social_biz" onUpgrade={() => navigate("/dashboard/billing")} />
            } />
            <Route path="biz-connect/*" element={
              hasModule("social_biz") ? <BizConnectHub /> : <ModuleGate moduleCode="social_biz" onUpgrade={() => navigate("/dashboard/billing")} />
            } />
            <Route path="finance" element={
              hasModule("transactions_ops") ? <FinancePage /> : <ModuleGate moduleCode="transactions_ops" onUpgrade={() => navigate("/dashboard/billing")} />
            } />
            <Route path="invoices" element={
              hasModule("transactions_ops") ? <InvoicesPage /> : <ModuleGate moduleCode="transactions_ops" onUpgrade={() => navigate("/dashboard/billing")} />
            } />
            <Route path="clients" element={
              hasModule("transactions_ops") ? <ClientsPage /> : <ModuleGate moduleCode="transactions_ops" onUpgrade={() => navigate("/dashboard/billing")} />
            } />
            <Route path="inventory" element={
              hasModule("transactions_ops") ? <InventoryPage /> : <ModuleGate moduleCode="transactions_ops" onUpgrade={() => navigate("/dashboard/billing")} />
            } />
            <Route path="campaigns" element={
              hasModule("transactions_ops") ? <CampaignsPage /> : <ModuleGate moduleCode="transactions_ops" onUpgrade={() => navigate("/dashboard/billing")} />
            } />
            <Route path="automations" element={
              hasModule("transactions_ops") ? <AutomationsPage /> : <ModuleGate moduleCode="transactions_ops" onUpgrade={() => navigate("/dashboard/billing")} />
            } />
            <Route path="employees" element={
              hasModule("people_hr") ? <EmployeesPage /> : <ModuleGate moduleCode="people_hr" onUpgrade={() => navigate("/dashboard/billing")} />
            } />
            <Route path="payroll" element={
              hasModule("people_hr") ? <PayrollPage /> : <ModuleGate moduleCode="people_hr" onUpgrade={() => navigate("/dashboard/billing")} />
            } />
            <Route path="leave" element={
              hasModule("people_hr") ? <LeavePage /> : <ModuleGate moduleCode="people_hr" onUpgrade={() => navigate("/dashboard/billing")} />
            } />
            <Route path="roster" element={
              hasModule("people_hr") ? <StaffRosterPage /> : <ModuleGate moduleCode="people_hr" onUpgrade={() => navigate("/dashboard/billing")} />
            } />
            <Route path="team" element={<TeamMembersPage />} />
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
            <Route path="help" element={<HelpCentrePage />} />
            <Route path="municipality-support" element={<MunicipalitySupportPage />} />
            <Route path="whatsapp-support" element={<WhatsAppSupportPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<DashboardOverview />} />
          </Routes>
        </div>
      </main>
      <TrialExpiredModal
        open={trialExpired && user?.role !== "admin" && !user?.teamMember}
        trialEndedAt={trialEndedAt}
      />

      {upgradeModalModule && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setUpgradeModalModule(null)}
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
                Add {MODULE_NAME[upgradeModalModule]}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This feature is included in the <strong>{MODULE_NAME[upgradeModalModule]}</strong> module ({MODULE_PRICE[upgradeModalModule]}).
                Add it to your plan to access these tools.
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-left space-y-1.5">
              {MODULE_FEATURES[upgradeModalModule].map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setUpgradeModalModule(null)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={() => { setUpgradeModalModule(null); navigate("/dashboard/billing"); }}
                className="flex-1 rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Manage Modules
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
