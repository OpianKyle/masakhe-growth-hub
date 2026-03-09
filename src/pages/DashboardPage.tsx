import { useState } from "react";
import { Link, useLocation, useNavigate, Routes, Route } from "react-router-dom";
import {
  LayoutDashboard, Globe, Smartphone, Megaphone, Receipt,
  Settings, ChevronLeft, ChevronRight, Search, LogOut, Shield, Wallet, ClipboardCheck, CreditCard, FileText, Lock, BookOpen, HandCoins, BarChart2, Building2, Send
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
import TrialBanner from "@/components/TrialBanner";
import DashboardWalkthrough from "@/components/DashboardWalkthrough";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
  { icon: Globe, label: "Website Builder", path: "/dashboard/website" },
  { icon: Smartphone, label: "Social Media", path: "/dashboard/social" },
  { icon: Wallet, label: "Finance", path: "/dashboard/finance" },
  { icon: Receipt, label: "Invoices", path: "/dashboard/invoices" },
  { icon: BookOpen, label: "Business Plan", path: "/dashboard/business-plan" },
  { icon: HandCoins, label: "Funding Proposal", path: "/dashboard/funding-proposal" },
  { icon: ClipboardCheck, label: "Funding Readiness", path: "/dashboard/funding" },
  { icon: BarChart2, label: "Annual Statements", path: "/dashboard/annual-statements" },
  { icon: Building2, label: "Verify Company", path: "/dashboard/company-verify" },
  { icon: Send, label: "Funding Applications", path: "/dashboard/funding-applications" },
  { icon: CreditCard, label: "Billing", path: "/dashboard/billing" },
  { icon: FileText, label: "Tenders", path: "/dashboard/tenders", comingSoon: true },
  { icon: Megaphone, label: "Campaigns", path: "/dashboard/campaigns", comingSoon: true },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const getPageTitle = () => {
    if (location.pathname.startsWith("/dashboard/social")) return "Social Media Hub";
    const item = navItems.find(item => item.path === location.pathname);
    return item ? item.label : "Dashboard";
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const initials = user?.full_name?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "U";

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 md:relative md:z-auto ${
          mobileMenuOpen || collapsed ? "w-16" : "w-64"
        } ${
          mobileMenuOpen ? "md:flex" : "hidden md:flex"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          {!collapsed && (
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
          {collapsed && (
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
          <button onClick={() => setCollapsed(!collapsed)} className="text-sidebar-foreground/60 hover:text-sidebar-foreground">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => {
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
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      <Lock className="h-3.5 w-3.5 shrink-0 opacity-60" />
                    </>
                  )}
                  {!collapsed && (
                    <span className="pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      Coming soon to enterprises
                    </span>
                  )}
                  {collapsed && (
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
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {!collapsed && <DashboardWalkthrough />}

        <div className="px-2 pb-4 space-y-1">
          {user?.role === "admin" && (
            <Link to="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
              <Shield className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Admin Panel</span>}
            </Link>
          )}
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>

        {/* SA flag stripe at bottom */}
        <div className="flex h-1">
          <div className="flex-1 bg-sa-green" />
          <div className="flex-1 bg-sa-gold" />
          <div className="flex-1 bg-sa-red" />
          <div className="flex-1 bg-sa-blue" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-foreground/70 hover:text-foreground">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-xl font-bold font-heading text-foreground">{getPageTitle()}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-9 w-64" />
            </div>
            <NotificationDropdown />
            <Link to="/dashboard/settings" className="shrink-0">
              {user?.logo_url ? (
                <img src={user.logo_url} alt="Logo" className="h-10 w-10 rounded-full object-contain" />
              ) : (
                <div className="h-10 w-10 rounded-full gradient-hero flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">{initials}</span>
                </div>
              )}
            </Link>
          </div>
        </header>

        <TrialBanner />
        <div className="flex-1 overflow-auto">
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
            <Route path="billing" element={<BillingPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<DashboardOverview />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
