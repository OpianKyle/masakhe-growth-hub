import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Routes, Route, Navigate } from "react-router-dom";
import {
  LayoutDashboard, Globe, Smartphone, Megaphone, Receipt,
  Settings, ChevronLeft, ChevronRight, ChevronDown, Search, LogOut,
  Shield, Wallet, ClipboardCheck, CreditCard, FileText, Lock,
  BookOpen, HandCoins, Building2, Send, Car, Users, UserCheck, ArrowLeftRight, Banknote, CalendarDays, Award, Linkedin, MessageCircle, Crown, Sparkles
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
import PayrollPage from "./PayrollPage";
import LeavePage from "./LeavePage";
import ResellerDashboard from "./ResellerDashboard";
import ClientsPage from "./ClientsPage";
import CampaignsPage from "./CampaignsPage";
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
  { icon: Smartphone, label: "Social Media", path: "/dashboard/social", perm: "social" },
  { icon: Linkedin, label: "Biz Connect", path: "/dashboard/biz-connect", perm: "biz_connect" },
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
  { icon: UserCheck, label: "Clients", path: "/dashboard/clients", requiresPlan: "pro", perm: "clients" },
  { icon: Megaphone, label: "Campaigns", path: "/dashboard/campaigns", requiresPlan: "pro", perm: "campaigns" },
  {
    icon: Banknote,
    label: "HR & Payroll",
    groupId: "hr",
    requiresPlan: "premium",
    perms: ["payroll", "leave"],
    children: [
      { icon: Banknote, label: "Payroll", path: "/dashboard/payroll", requiresPlan: "premium", perm: "payroll" },
      { icon: CalendarDays, label: "Leave & HR", path: "/dashboard/leave", requiresPlan: "premium", perm: "leave" },
    ],
  },
  { icon: Users, label: "Team Members", path: "/dashboard/team", requiresPlan: "premium", ownerOnly: true },
  { icon: MessageCircle, label: "WhatsApp Support", path: "/dashboard/whatsapp-support", perm: "support" },
  { icon: Award, label: "Partner Program", path: "/dashboard/reseller", ownerOnly: true },
  { icon: CreditCard, label: "Billing", path: "/dashboard/billing", ownerOnly: true },
  { icon: Settings, label: "Settings", path: "/dashboard/settings", ownerOnly: true },
];

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [hasShowroomSite, setHasShowroomSite] = useState(false);
  const [hasBrokerageSite, setHasBrokerageSite] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState<boolean | null>(null);
  const [planCode, setPlanCode] = useState<PlanCode | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isImpersonating, originalAdminName, stopImpersonating } = useAuth();

  // Resellers have their own portal — redirect them
  useEffect(() => {
    if (user?.is_reseller && user?.role !== "admin") {
      navigate("/partner", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
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
  }, [user, location.pathname, location.search]);

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
        className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 md:relative md:z-auto
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
                      if (groupLocked) { navigate("/dashboard/billing"); return; }
                      toggleGroup(item.groupId);
                    }}
                    title={groupLocked ? `Requires ${groupReqName}` : undefined}
                    className={`group relative w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
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
                            <Link
                              key={child.path}
                              to="/dashboard/billing"
                              title={`Requires ${reqName}`}
                              className="group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/45 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground/70 transition-colors"
                            >
                              <child.icon className="h-4 w-4 shrink-0" />
                              <span className="flex-1 truncate">{child.label}</span>
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide rounded-full bg-amber-500/15 text-amber-600 px-1.5 py-0.5">
                                <Crown className="h-2.5 w-2.5" />
                                {child.requiresPlan === "premium" ? "Premium" : "Plus"}
                              </span>
                            </Link>
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
                  className="group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-not-allowed text-sidebar-foreground/35 select-none"
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
                <Link
                  key={item.path}
                  to="/dashboard/billing"
                  title={`Requires ${itemReqName}`}
                  className="group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/45 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground/70 transition-colors"
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {sidebarWide && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide rounded-full bg-amber-500/15 text-amber-600 px-1.5 py-0.5">
                        <Crown className="h-2.5 w-2.5" />
                        {item.requiresPlan === "premium" ? "Premium" : "Plus"}
                      </span>
                    </>
                  )}
                  {!sidebarWide && (
                    <span className="pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      {item.label} — Requires {itemReqName}
                    </span>
                  )}
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
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

        {/* Bottom actions */}
        <div className="shrink-0 px-2 pb-2 space-y-0.5">
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
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
          <button
            onClick={handleLogout}
            className="group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
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
            <Route path="finance" element={<FinancePage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="funding" element={<Navigate to="/dashboard" replace />} />
            <Route path="social/*" element={<SocialHub />} />
            <Route path="biz-connect/*" element={<BizConnectHub />} />
            <Route path="tenders" element={<TendersPage />} />
            <Route path="business-plan" element={<Navigate to="/dashboard" replace />} />
            <Route path="funding-proposal" element={<Navigate to="/dashboard" replace />} />
            <Route path="annual-statements" element={<Navigate to="/dashboard" replace />} />
            <Route path="company-verify" element={<Navigate to="/dashboard" replace />} />
            <Route path="funding-applications" element={<Navigate to="/dashboard" replace />} />
            <Route path="vehicles" element={<VehicleManagementPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="payroll" element={<PayrollPage />} />
            <Route path="leave" element={<LeavePage />} />
            <Route path="reseller" element={<ResellerDashboard />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="campaigns" element={<CampaignsPage />} />
            <Route path="whatsapp-support" element={<WhatsAppSupportPage />} />
            <Route path="team" element={<TeamMembersPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<DashboardOverview />} />
          </Routes>

          {subscriptionActive === false &&
            !location.pathname.startsWith("/dashboard/billing") &&
            !location.pathname.startsWith("/dashboard/settings") && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/95 backdrop-blur-sm">
              <div className="text-center space-y-5 p-8 max-w-md mx-auto">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-heading mb-2">Subscription Required</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You need an active Masakhe subscription to access this section.
                    Subscribe to unlock all features and start building your business.
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-left space-y-1.5">
                  {[
                    "Website Builder & Publishing",
                    "Financial Tracking & Invoicing",
                    "Social Media Hub",
                    "Payroll Management",
                    "Business Funding Toolkit",
                    "Leads & Clients CRM",
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate("/dashboard/billing")}
                  className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 font-semibold text-sm hover:bg-primary/90 transition-colors"
                >
                  View Plans & Subscribe
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <AIChatBot />
    </div>
  );
}
