import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ResellerDashboard from "./ResellerDashboard";
import {
  Award, LogOut, ChevronLeft, Menu, X, Settings, User,
  BarChart2, Users, DollarSign, Crown, Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const NAV_ITEMS = [
  { tab: "overview",    label: "Overview",      icon: BarChart2 },
  { tab: "clients",     label: "My Clients",    icon: Users },
  { tab: "commissions", label: "Commissions",   icon: DollarSign },
  { tab: "tiers",       label: "Ranks & Tiers", icon: Crown },
  { tab: "leaderboard", label: "Leaderboard",   icon: Trophy },
];

export default function ResellerPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

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
      </div>

      {/* Nav */}
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

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
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
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-600">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/masakhe-logo.png" alt="" className="h-6 w-6" />
            <span className="font-bold text-sm text-slate-900">Partner Portal</span>
          </div>
          <div className="w-8" />
        </div>

        {/* Dashboard content */}
        <div className="flex-1 overflow-y-auto">
          <ResellerDashboard activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>
    </div>
  );
}
