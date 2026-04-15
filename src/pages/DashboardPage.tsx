import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Routes, Route, Navigate } from "react-router-dom";
import {
  LayoutDashboard, Globe, Smartphone, Megaphone, Receipt,
  Settings, ChevronLeft, ChevronRight, ChevronDown, Search, LogOut,
  Shield, Wallet, ClipboardCheck, CreditCard, FileText, Lock,
  BookOpen, HandCoins, BarChart2, Building2, Send, Car, Users, UserCheck, ArrowLeftRight, Banknote, Landmark, CalendarDays, Award
} from "lucide-react";
import { Input } from "@/components/ui/input";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useAuth } from "@/contexts/AuthContext";
import WebsiteBuilder from "./WebsiteBuilder";
import FinancePage from "./FinancePage";
import InvoicesPage from "./InvoicesPage";
import GrantReadinessPage from "./GrantReadinessPage";
import SocialHub from "./social/SocialHub";
import SettingsPage from "./SettingsPage";
import DashboardOverview from "./DashboardOverview";
import BillingPage from "./BillingPage";
import TendersPage from "./TendersPage";
import BusinessPlanPage from "./BusinessPlanPage";
import FundingProposalPage from "./FundingProposalPage";
import FinancialStatementsPage from "./FinancialStatementsPage";
import CompanyVerifyPage from "./CompanyVerifyPage";
import FundingApplicationPage from "./FundingApplicationPage";
import VehicleManagementPage from "./VehicleManagementPage";
import LeadsPage from "./LeadsPage";
import PayrollPage from "./PayrollPage";
import LeavePage from "./LeavePage";
import ResellerDashboard from "./ResellerDashboard";
import ClientsPage from "./ClientsPage";
import CampaignsPage from "./CampaignsPage";
import TrialBanner from "@/components/TrialBanner";
import ComplianceDocsGate from "@/components/ComplianceDocsGate";
import AIChatBot from "@/components/AIChatBot";

type NavChild = {
  icon: React.ElementType;
  label: string;
  path: string;
  comingSoon?: boolean;
};

type NavGroup = {
  icon: React.ElementType;
  label: string;
  groupId: string;
  children: NavChild[];
};

type NavSingle = {
  icon: React.ElementType;
  label: string;
  path: string;
  comingSoon?: boolean;
};

type NavItem = NavSingle | NavGroup;

const isGroup = (item: NavItem): item is NavGroup => "groupId" in item;


const baseNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
  { icon: Globe, label: "Website Builder", path: "/dashboard/website" },
  { icon: Smartphone, label: "Social Media", path: "/dashboard/social" },
  {
    icon: Wallet,
    label: "Transactions",
    groupId: "finance",
    children: [
      { icon: Wallet, label: "Income/Expenses", path: "/dashboard/finance" },
      { icon: Receipt, label: "Quotes/Invoices", path: "/dashboard/invoices" },
      { icon: BarChart2, label: "Annual Statements", path: "/dashboard/annual-statements" },
      { icon: Landmark, label: "Management Accounts", path: "/dashboard/management-accounts", comingSoon: true },
    ],
  },
  {
    icon: HandCoins,
    label: "Business Toolkit",
    groupId: "funding",
    children: [
      { icon: BookOpen, label: "Business Plan", path: "/dashboard/business-plan" },
      { icon: HandCoins, label: "Funding Proposal", path: "/dashboard/funding-proposal" },
      { icon: ClipboardCheck, label: "Funding Scoring", path: "/dashboard/funding" },
      { icon: Building2, label: "Verify Company", path: "/dashboard/company-verify" },
      { icon: Send, label: "Funding Applications", path: "/dashboard/funding-applications" },
    ],
  },
  {
    icon: Banknote,
    label: "HR & Payroll",
    groupId: "hr",
    children: [
      { icon: Banknote, label: "Payroll", path: "/dashboard/payroll" },
      { icon: CalendarDays, label: "Leave & HR", path: "/dashboard/leave" },
    ],
  },
  { icon: UserCheck, label: "Clients", path: "/dashboard/clients" },
  { icon: Megaphone, label: "Campaigns", path: "/dashboard/campaigns" },
  { icon: FileText, label: "Tenders", path: "/dashboard/tenders", comingSoon: true },
  { icon: Award, label: "Partner Program", path: "/dashboard/reseller" },
  { icon: CreditCard, label: "Billing", path: "/dashboard/billing" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [hasShowroomSite, setHasShowroomSite] = useState(false);
  const [hasBrokerageSite, setHasBrokerageSite] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState<boolean | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isImpersonating, originalAdminName, stopImpersonating } = useAuth();

  // Resellers have their own portal — redirect them
  useEffect(() => {
    if (user?.is_reseller && user?.business_status === "reseller" && user?.role !== "admin") {
      navigate("/partner", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role === "admin") { setSubscriptionActive(true); return; }
    fetch("/api/billing/status", { credentials: "include" })
      .then(r => r.json())
      .then(d => setSubscriptionActive(!!d.active))
      .catch(() => setSubscriptionActive(false));
  }, [user, location.search]);

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

  const navItems: NavItem[] = [
    ...baseNavItems.slice(0, 5),
    ...(hasShowroomSite ? [{ icon: Car, label: "Vehicles", path: "/dashboard/vehicles" } as NavSingle] : []),
    ...(hasBrokerageSite ? [{ icon: Users, label: "Leads", path: "/dashboard/leads" } as NavSingle] : []),
    ...baseNavItems.slice(5),
  ];

  const allPaths: { label: string; path: string }[] = navItems.flatMap(item =>
    isGroup(item) ? item.children.map(c => ({ label: c.label, path: c.path })) : [{ label: item.label, path: item.path }]
  );

  const getPageTitle = () => {
    if (location.pathname.startsWith("/dashboard/social")) return "Social Media Hub";
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
              return (
                <div key={item.groupId}>
                  <button
                    onClick={() => sidebarWide && toggleGroup(item.groupId)}
                    className={`group relative w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {sidebarWide && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
                      </>
                    )}
                    {!sidebarWide && (
                      <span className="pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        {item.label}
                      </span>
                    )}
                  </button>
                  {open && (
                    <div className="mt-0.5 ml-3 pl-3 border-l border-sidebar-border space-y-0.5">
                      {item.children.map(child => {
                        const childActive = location.pathname.startsWith(child.path);
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
            <Route path="funding" element={<GrantReadinessPage />} />
            <Route path="social/*" element={<SocialHub />} />
            <Route path="tenders" element={<TendersPage />} />
            <Route path="business-plan" element={<BusinessPlanPage />} />
            <Route path="funding-proposal" element={<FundingProposalPage />} />
            <Route path="annual-statements" element={<FinancialStatementsPage />} />
            <Route path="company-verify" element={<CompanyVerifyPage />} />
            <Route path="funding-applications" element={<FundingApplicationPage />} />
            <Route path="vehicles" element={<VehicleManagementPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="payroll" element={<PayrollPage />} />
            <Route path="leave" element={<LeavePage />} />
            <Route path="reseller" element={<ResellerDashboard />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="campaigns" element={<CampaignsPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<DashboardOverview />} />
          </Routes>
          <ComplianceDocsGate />

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
