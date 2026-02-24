import { useState } from "react";
import { Link, useLocation, useNavigate, Routes, Route } from "react-router-dom";
import {
  LayoutDashboard, Globe, Smartphone, Megaphone, Receipt, FileText, MessageSquare,
  Settings, ChevronLeft, ChevronRight, BarChart3, TrendingUp, Users, DollarSign,
  ArrowUpRight, Bell, Search, Calendar, AlertTriangle, CheckCircle2, LogOut, Shield, Wallet, ClipboardCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import WebsiteBuilder from "./WebsiteBuilder";
import FinancePage from "./FinancePage";
import InvoicesPage from "./InvoicesPage";
import GrantReadinessPage from "./GrantReadinessPage";
import SocialHub from "./social/SocialHub";
import ComplianceScoreCard from "@/components/ComplianceScoreCard";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
  { icon: Globe, label: "Website Builder", path: "/dashboard/website" },
  { icon: Wallet, label: "Finance", path: "/dashboard/finance" },
  { icon: Receipt, label: "Invoices", path: "/dashboard/invoices" },
  { icon: ClipboardCheck, label: "Funding Readiness", path: "/dashboard/funding" },
  { icon: Smartphone, label: "Social Media", path: "/dashboard/social" },
  { icon: Megaphone, label: "Campaigns", path: "/dashboard/campaigns" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

const kpis = [
  { icon: TrendingUp, label: "Revenue (MTD)", value: "R47,250", change: "+12.3%", positive: true },
  { icon: Users, label: "New Customers", value: "34", change: "+8", positive: true },
  { icon: Globe, label: "Website Visits", value: "1,247", change: "+23%", positive: true },
  { icon: DollarSign, label: "Outstanding Invoices", value: "R8,400", change: "3 pending", positive: false },
];

const recentActivity = [
  { type: "payment", text: "Payment received from Naledi Trading", amount: "R3,200", time: "2h ago", icon: CheckCircle2, color: "text-primary" },
  { type: "alert", text: "VAT201 return due in 5 days", amount: "", time: "Today", icon: AlertTriangle, color: "text-sa-gold" },
  { type: "social", text: "Instagram post reached 450 people", amount: "", time: "4h ago", icon: Smartphone, color: "text-accent" },
  { type: "invoice", text: "Invoice #INV-2024-047 sent", amount: "R5,200", time: "Yesterday", icon: Receipt, color: "text-muted-foreground" },
  { type: "campaign", text: "Google Ads campaign performing well", amount: "R12 CPA", time: "Yesterday", icon: Megaphone, color: "text-sa-red" },
];

const upcomingTasks = [
  { task: "Submit VAT201 Return", due: "25 Mar 2026", priority: "high" },
  { task: "Review social media analytics", due: "28 Mar 2026", priority: "medium" },
  { task: "Follow up on Invoice #045", due: "30 Mar 2026", priority: "low" },
  { task: "Update product catalog", due: "01 Apr 2026", priority: "medium" },
];

function DashboardOverview() {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(" ")[0] || "there";

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl gradient-hero p-6 text-primary-foreground"
      >
        <h2 className="text-2xl font-bold font-heading">Welcome, {firstName}!</h2>
        <p className="text-primary-foreground/80 mt-1">
          {user?.business_name ? `${user.business_name} is performing well.` : "Your business is performing well this month."} Here&apos;s your overview.
        </p>
        <div className="flex gap-3 mt-4">
          <Button variant="gold" size="sm">View Compliance Status</Button>
          <Button variant="ghost" size="sm" className="text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground/10">
            Generate Report
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl border border-border bg-card p-5 shadow-card"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <kpi.icon className="h-5 w-5 text-primary" />
              </div>
              <span className={`text-xs font-semibold flex items-center gap-1 ${kpi.positive ? "text-primary" : "text-sa-gold"}`}>
                {kpi.change} {kpi.positive && <ArrowUpRight className="h-3 w-3" />}
              </span>
            </div>
            <p className="text-2xl font-bold font-heading text-foreground mt-3">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-card">
          <h3 className="text-lg font-bold font-heading text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5">
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{item.text}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
                {item.amount && (
                  <span className="text-sm font-semibold text-foreground">{item.amount}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h3 className="text-lg font-bold font-heading text-foreground mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Upcoming
          </h3>
          <div className="space-y-3">
            {upcomingTasks.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                  item.priority === "high" ? "bg-sa-red" : item.priority === "medium" ? "bg-sa-gold" : "bg-primary"
                }`} />
                <div>
                  <p className="text-sm font-medium text-foreground">{item.task}</p>
                  <p className="text-xs text-muted-foreground">{item.due}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Score + Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ComplianceScoreCard />

        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h3 className="text-lg font-bold font-heading text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Globe, label: "Update Website", color: "gradient-hero", path: "/dashboard/website" },
              { icon: Receipt, label: "Create Invoice", color: "gradient-gold", path: "/dashboard/invoices" },
              { icon: Wallet, label: "Log Finance", color: "gradient-warm", path: "/dashboard/finance" },
              { icon: ClipboardCheck, label: "Funding Check", color: "gradient-hero", path: "/dashboard/funding" },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.path}
                className={`flex flex-col items-center gap-2 rounded-xl ${action.color} p-4 text-primary-foreground hover:opacity-90 transition-opacity`}
              >
                <action.icon className="h-6 w-6" />
                <span className="text-xs font-semibold">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
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

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-hero">
                <span className="text-sm font-bold text-primary-foreground font-heading">M</span>
              </div>
              <span className="text-lg font-bold font-heading text-sidebar-foreground">Masakhe</span>
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
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold font-heading text-foreground">{getPageTitle()}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-9 w-64" />
            </div>
            <button className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-sa-red text-[10px] font-bold text-primary-foreground">3</span>
            </button>
            <div className="h-8 w-8 rounded-full gradient-hero flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">{initials}</span>
            </div>
          </div>
        </header>

        <Routes>
          <Route index element={<DashboardOverview />} />
          <Route path="website" element={<WebsiteBuilder />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="funding" element={<GrantReadinessPage />} />
          <Route path="social/*" element={<SocialHub />} />
          <Route path="*" element={<DashboardOverview />} />
        </Routes>
      </main>
    </div>
  );
}
