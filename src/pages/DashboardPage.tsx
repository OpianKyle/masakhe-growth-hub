import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Routes, Route, Navigate } from "react-router-dom";
import {
  LayoutDashboard, Globe, Smartphone, Megaphone, Receipt,
  Settings, ChevronLeft, ChevronRight, ChevronDown, Search, LogOut,
  Shield, Wallet, FileText, Lock,
  BookOpen, HandCoins, Building2, Send, Car, Users, UserCheck, ArrowLeftRight, Banknote, CalendarDays, Award, Linkedin, MessageCircle, Sparkles, Package, Briefcase
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
import OnboardingTour from "@/components/OnboardingTour";

type NavChild = {
  icon: React.ElementType;
  label: string;
  path: string;
  comingSoon?: boolean;
  perm?: string;
  ownerOnly?: boolean;
};

type NavGroup = {
  icon: React.ElementType;
  label: string;
  groupId: string;
  children: NavChild[];
  perms?: string[];
  ownerOnly?: boolean;
};

type NavSingle = {
  icon: React.ElementType;
  label: string;
  path: string;
  comingSoon?: boolean;
  perm?: string;
  ownerOnly?: boolean;
  openNewTab?: boolean;
};

type NavItem = NavSingle | NavGroup;

const isGroup = (item: NavItem): item is NavGroup => "groupId" in item;

const baseNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard", perm: "overview" },
  { icon: Globe, label: "Website Builder", path: "/website-builder", perm: "website", openNewTab: true },
  { icon: Smartphone, label: "Social Media", path: "/social-hub", perm: "social", openNewTab: true },
  { icon: Linkedin, label: "Biz Connect", path: "/dashboard/biz-connect", perm: "biz_connect" },
  {
    icon: Wallet,
    label: "Transactions",
    groupId: "finance",
    perms: ["finance", "invoices"],
    children: [
      { icon: Wallet, label: "Income/Expenses", path: "/dashboard/finance", perm: "finance" },
      { icon: Receipt, label: "Quotes/Invoices", path: "/dashboard/invoices", perm: "invoices" },
    ],
  },
  {
    icon: Briefcase,
    label: "Operations",
    groupId: "operations",
    perms: ["clients", "inventory", "campaigns", "automations"],
    children: [
      { icon: UserCheck, label: "Clients", path: "/dashboard/clients", perm: "clients" },
      { icon: Package, label: "Inventory", path: "/dashboard/inventory", perm: "inventory" },
      { icon: Megaphone, label: "Campaigns", path: "/dashboard/campaigns", perm: "campaigns" },
      { icon: Sparkles, label: "Automations", path: "/dashboard/automations", perm: "automations" },
    ],
  },
  {
    icon: Banknote,
    label: "Human Capital",
    groupId: "hr",
    perms: ["payroll", "leave"],
    children: [
      { icon: Users, label: "Employees", path: "/dashboard/employees", perm: "payroll" },
      { icon: Banknote, label: "Payroll", path: "/dashboard/payroll", perm: "payroll" },
      { icon: CalendarDays, label: "Leave Processing", path: "/dashboard/leave", perm: "leave" },
      { icon: CalendarDays, label: "Staff Roster", path: "/dashboard/roster", perm: "payroll" },
    ],
  },
  // { icon: Award, label: "Partner Program", path: "/dashboard/reseller", ownerOnly: true },
];

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [hasShowroomSite, setHasShowroomSite] = useState(false);
  const [hasBrokerageSite, setHasBrokerageSite] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isImpersonating, originalAdminName, stopImpersonating } = useAuth();

  useEffect(() => {
    if (user?.is_reseller && user?.role !== "admin") {
      navigate("/partner", { replace: true });
    }
  }, [user, navigate]);

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

  const isMtnClient = !!user?.is_mtn_client;
  const isNexoClient = !!user?.is_nexo_client;

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

  const mtnSidebarStyle = isMtnClient ? { backgroundColor: "#1a1a1a", borderColor: "#2a2a2a" } : {};
  const nexoSidebarStyle = isNexoClient ? { backgroundColor: "#0f172a", borderColor: "#1e293b" } : {};
  const brandedSidebarStyle = isMtnClient ? mtnSidebarStyle : isNexoClient ? nexoSidebarStyle : {};
  const activeNavCls = isMtnClient
    ? "bg-yellow-500/20 text-yellow-400 font-semibold"
    : isNexoClient
    ? "bg-blue-500/20 text-blue-400 font-semibold"
    : "bg-sidebar-accent text-sidebar-accent-foreground font-semibold";
  const inactiveNavCls = isMtnClient
    ? "text-gray-400 hover:bg-yellow-500/10 hover:text-yellow-300"
    : isNexoClient
    ? "text-gray-400 hover:bg-blue-500/10 hover:text-blue-300"
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
          ${isMtnClient ? "border-[#2a2a2a]" : isNexoClient ? "border-[#1e293b]" : "border-sidebar-border bg-sidebar"}
          ${sidebarWide ? "w-64" : "w-16"}
          ${mobileMenuOpen ? "flex" : "hidden md:flex"}
        `}
        style={brandedSidebarStyle}
      >
        <div
          className={`flex h-16 shrink-0 items-center justify-between px-4 border-b ${isMtnClient ? "border-[#2a2a2a]" : isNexoClient ? "border-[#1e293b]" : "border-sidebar-border"}`}
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
              ) : isNexoClient ? (
                <>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-black text-white leading-none select-none"
                    style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", fontSize: 18, letterSpacing: "-0.03em" }}>
                    nx
                  </div>
                  <span className="text-lg font-bold font-heading truncate" style={{ color: "#93c5fd" }}>
                    {user?.business_name || "Nexo Business"}
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
              {!isMtnClient && !isNexoClient && (
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
              ) : isNexoClient ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg font-black text-white leading-none select-none"
                  style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", fontSize: 18, letterSpacing: "-0.03em" }}>
                  nx
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
              return (
                <div key={item.groupId}>
                  <button
                    onClick={() => {
                      if (!sidebarWide) return;
                      toggleGroup(item.groupId);
                    }}
                    className={`group relative w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      active ? activeNavCls : inactiveNavCls
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
          let roleLabel = isMtnClient ? "MTN Client" : isNexoClient ? "Nexo Client" : "Business Owner";
          let roleColor = isMtnClient
            ? "border-yellow-500/30"
            : isNexoClient
            ? "border-blue-500/30"
            : "bg-emerald-500/15 text-emerald-300 border-emerald-500/25";
          const roleLabelStyle = isMtnClient
            ? { backgroundColor: "#FFCC0020", color: "#FFCC00" }
            : isNexoClient
            ? { backgroundColor: "#2563eb20", color: "#93c5fd" }
            : {};
          if (!isMtnClient && !isNexoClient) {
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
              className={`shrink-0 mx-2 mb-2 rounded-lg border px-3 py-2.5 ${(isMtnClient || isNexoClient) ? "" : "border-sidebar-border bg-sidebar-accent/30"}`}
              style={isMtnClient ? { backgroundColor: "#252525", borderColor: "#2a2a2a" } : isNexoClient ? { backgroundColor: "#1e293b", borderColor: "#334155" } : undefined}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${(isMtnClient || isNexoClient) ? "" : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"}`}
                  style={isMtnClient ? { backgroundColor: "#FFCC00", color: "#000" } : isNexoClient ? { background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff" } : undefined}
                >
                  {initials2 || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`truncate text-sm font-medium ${(isMtnClient || isNexoClient) ? "" : "text-sidebar-foreground"}`} style={isMtnClient ? { color: "#e5e5e5" } : isNexoClient ? { color: "#e2e8f0" } : undefined}>
                    {user.full_name || user.email}
                  </div>
                  <div className={`truncate text-[11px] ${(isMtnClient || isNexoClient) ? "" : "text-sidebar-foreground/55"}`} style={isMtnClient ? { color: "#888" } : isNexoClient ? { color: "#64748b" } : undefined}>
                    {user.email}
                  </div>
                </div>
              </div>
              <div
                className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${roleColor}`}
                style={roleLabelStyle}
              >
                {(isMtnClient || isNexoClient) && <Building2 className="h-3 w-3" />}
                {!isMtnClient && !isNexoClient && isAdmin && <Shield className="h-3 w-3" />}
                {!isMtnClient && !isNexoClient && isTeam && <Users className="h-3 w-3" />}
                {!isMtnClient && !isNexoClient && isPartner && <Award className="h-3 w-3" />}
                {!isMtnClient && !isNexoClient && !isAdmin && !isTeam && !isPartner && <Building2 className="h-3 w-3" />}
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
        ) : isNexoClient ? (
          <div className="flex h-1 shrink-0">
            <div className="flex-1" style={{ backgroundColor: "#2563eb" }} />
            <div className="flex-1" style={{ backgroundColor: "#1d4ed8" }} />
            <div className="flex-1" style={{ backgroundColor: "#1e40af" }} />
            <div className="flex-1" style={{ backgroundColor: "#1e3a8a" }} />
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
          className={`sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b backdrop-blur-md px-4 md:px-6 ${isMtnClient ? "" : isNexoClient ? "" : "border-emerald-100 bg-white/95"}`}
          style={isMtnClient ? { backgroundColor: "#141414", borderColor: "#2a2a2a" } : isNexoClient ? { backgroundColor: "#0f172a", borderColor: "#1e293b" } : undefined}
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
              className={`text-xl font-bold font-heading truncate ${isMtnClient ? "" : isNexoClient ? "" : "text-emerald-900"}`}
              style={isMtnClient ? { color: "#FFCC00" } : isNexoClient ? { color: "#93c5fd" } : undefined}
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
              className={`shrink-0 p-1.5 rounded-lg transition-colors ${(isMtnClient || isNexoClient) ? "text-gray-300 hover:bg-white/10" : "text-emerald-700 hover:bg-emerald-50"}`}
            >
              <BookOpen className="h-5 w-5" />
            </Link>
            {!user?.teamMember && (
              <Link
                to="/dashboard/team"
                title="User Accounts"
                className={`shrink-0 p-1.5 rounded-lg transition-colors ${(isMtnClient || isNexoClient) ? "text-gray-300 hover:bg-white/10" : "text-emerald-700 hover:bg-emerald-50"}`}
              >
                <Users className="h-5 w-5" />
              </Link>
            )}
            <Link to="/dashboard/settings" className="shrink-0">
              {user?.logo_url ? (
                <img src={user.logo_url} alt="Logo" className="h-9 w-9 rounded-full object-contain" />
              ) : isMtnClient ? (
                <div className="h-9 w-9 rounded-full flex items-center justify-center font-black text-xs" style={{ backgroundColor: "#FFCC00", color: "#1a1a1a" }}>
                  {initials}
                </div>
              ) : isNexoClient ? (
                <div className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm text-white" style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}>
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
        <div className="flex-1 overflow-auto min-h-0 relative mobile-hscroll">
          <Routes>
            <Route index element={<DashboardOverview />} />
            <Route path="website/*" element={<WebsiteHub />} />
            <Route path="social/*" element={<SocialHub />} />
            <Route path="biz-connect/*" element={<BizConnectHub />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="campaigns" element={<CampaignsPage />} />
            <Route path="automations" element={<AutomationsPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="payroll" element={<PayrollPage />} />
            <Route path="leave" element={<LeavePage />} />
            <Route path="roster" element={<StaffRosterPage />} />
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
            <Route path="billing" element={<Navigate to="/dashboard" replace />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<DashboardOverview />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
